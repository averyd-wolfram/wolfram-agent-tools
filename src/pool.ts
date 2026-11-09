/**
 * A budgeted pool of Wolfram kernels, owned by the broker.
 *
 * The budget exists because kernels are licence-limited, not because they are
 * expensive: a typical licence permits 2 or 4 concurrent kernels, so agent
 * sessions that each take one will lock the user out of their own Mathematica.
 * The pool therefore grows only up to a cap, and deliberately leaves a seat
 * free for interactive use.
 *
 * The cap cannot be known before a kernel runs — `$MaxLicenseProcesses` is a
 * kernel variable — so a pool with nothing cached starts at one, and every
 * kernel it starts reports the licence before its server is up (plugin plan
 * D20). There is no separate probe kernel to ask first: on a two-seat licence,
 * a probe and then the serving kernel was the cold start's whole budget.
 */
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { RequestOptions } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type { KernelFlavour } from "./flavour.js";
import {
  isServerNotResolved,
  KernelSession,
  RequestDropped,
  RequestExpired,
  ServerNotResolved,
  type RunOptions,
} from "./kernel.js";
import { deadlineDelay, timerDelay } from "./config.js";
import { baseDirectoryEnv, type KernelFacts } from "./inspect.js";
import { errorText, type Logger } from "./log.js";
import { elapsedText, waitText } from "./duration.js";
import {
  Backoff,
  candidateIdentity,
  PREPARATION_BACKOFF_MS,
  preparationBackoff,
  type CandidateIdentity,
} from "./prepare.js";

/**
 * The `SHAPING_VARS` a licence can depend on: `$BaseDirectory` and
 * `$UserBaseDirectory` each hold a `Licensing` directory a kernel reads.
 */
const LICENCE_SHAPING = new Set(["WOLFRAM_BASE", "WOLFRAM_USERBASE"]);

/** Never grow past this, whatever the licence says. */
export const HARD_KERNEL_CAP = 8;

/**
 * Budget to use when the licence is genuinely unlimited. Deliberately modest:
 * "unlimited" is permission, not an instruction, and each extra kernel is a
 * couple of seconds of startup plus memory.
 */
export const UNLIMITED_BUDGET = 4;

/**
 * How often a request held inside its flavour's window looks again: the window
 * can end before its time, when the kernel binary changes, and nothing else
 * would tell it. A look is a stat of the binary, so a second costs nothing.
 */
const HELD_RECHECK_MS = 1_000;

/**
 * What the licence permits.
 *
 * `"unknown"` and `"unlimited"` are kept distinct on purpose. Treating a value
 * we failed to read as unlimited would grow the pool to its cap on exactly the
 * machines we understand least, which is the opposite of what a licence-limited
 * resource wants.
 */
export interface LicenceInfo {
  maxProcesses: number | "unlimited" | "unknown";
  type: string | null;
}

export interface KernelPoolOptions {
  bin: string;
  serverName: string;
  idleMs: number;
  startTimeoutMs: number;
  clientInfo: { name: string; version: string };
  log: Logger;
  /** Extra kernel environment, e.g. the WOLFRAM_*BASE trio. */
  extraEnv?: Record<string, string> | undefined;
  /** Explicit cap. When unset, it is derived from the licence. */
  maxKernels?: number | undefined;
  /** Seats to leave free for interactive use. */
  reserveSeats: number;
  /**
   * What the licence permits, as far as is known at construction: cached from
   * an earlier kernel, configured, or unknown.
   */
  licence: LicenceInfo;
  /**
   * Whether the pool takes what its kernels report — a licence the caller did
   * not configure, and the base directories for the kernels after them. Off
   * under `WOLFRAM_MCP_INSPECT=0`.
   */
  learnFromKernels: boolean;
  /** The licence came from configuration, so a kernel's report must not replace it. */
  licenceConfigured?: boolean | undefined;
  /** Each kernel's report, for the caller to keep. */
  onFacts?: ((facts: KernelFacts, chosen: string[]) => void) | undefined;
  /**
   * Called once per freshly started kernel, with that kernel's client.
   *
   * The client is passed deliberately: this runs inside the queue, while the
   * slot is still held, so anything the caller needs from the new kernel has to
   * be read here rather than by going back through `run`. `source` is what
   * the kernel was started from, so its lists can be cached under that (#6).
   */
  onKernelReady?:
    | ((
        client: Client,
        flavour: string,
        late: AbortSignal | undefined,
        source: string | undefined,
      ) => void | Promise<void>)
    | undefined;
  /** For the suite, which cannot wait out a window of real time. */
  clock?: (() => number) | undefined;
}

interface Slot {
  session: KernelSession;
  busy: boolean;
  /**
   * What this kernel was started with. Only a session of the same flavour may be
   * served by it — a kernel reads its environment once, at startup, so two
   * flavours are two kernels however alike they look from here.
   */
  flavour: KernelFlavour;
}

interface Waiter {
  flavour: KernelFlavour;
  resolve: (slot: Slot | Promise<Slot>) => void;
  reject: (err: unknown) => void;
  /** When it came, so a held request and a queued one are served in order. */
  seq: number;
}

/** Which tier serves a request now: `#plan` decides, and `#act` carries it out. */
type Plan =
  | { tier: "take"; slot: Slot }
  | { tier: "refuse"; window: Window }
  | { tier: "grow" }
  | { tier: "swap"; victim: Slot }
  | { tier: "reuse"; slot: Slot }
  | { tier: "hold" }
  | { tier: "wait" };

/**
 * How many kernels the pool may run.
 *
 * @param licence what a live kernel reported
 * @param reserveSeats seats to leave free for interactive use
 * @param explicitMax an operator override, which wins outright
 * @param current the budget in force, kept when the licence is unreadable
 */
export function deriveBudget(
  licence: LicenceInfo,
  reserveSeats: number,
  explicitMax: number | undefined,
  current: number,
): number {
  if (explicitMax !== undefined) return clampBudget(explicitMax);
  // Unknown is not unlimited: growing the pool on the machines we understand
  // least is the opposite of what a licence-limited resource wants.
  if (licence.maxProcesses === "unknown") return current;
  if (licence.maxProcesses === "unlimited") return clampBudget(UNLIMITED_BUDGET);
  return clampBudget(licence.maxProcesses - reserveSeats);
}

function clampBudget(value: number): number {
  return Math.max(1, Math.min(Math.floor(value), HARD_KERNEL_CAP));
}

/** A flavour's refusal window, while it stands (`KernelPool.#window`). */
interface Window {
  ageMs: number;
  remainingMs: number;
  reason: string;
  /** What ends it sooner, when that is not the installation changing. */
  advice: string | undefined;
  /** Whether the start failed because the server name did not resolve. */
  unresolved: boolean;
}

export class KernelPool {
  readonly #options: KernelPoolOptions;
  readonly #slots: Slot[] = [];
  readonly #waiters: Waiter[] = [];
  #budget: number;
  #licence: LicenceInfo;
  #extraEnv: Record<string, string> | undefined;
  /**
   * Each flavour's last failed kernel start, backed off by what failed, as a
   * private session's preparation is (`preparationBackoff`). A session's
   * preparation only attaches to the broker, so a start failing in the pool
   * never reached a back-off: each request grew a kernel to fail, in parallel
   * for simultaneous ones, and at the budget the swap tier retired other
   * sessions' idle kernels to make room for a start that could not succeed
   * (#19). That was answered for a server name that did not resolve; any other
   * failed start — a kernel that died on launch, a handshake that timed out —
   * was still an ordinary call failure, retried by the next request (#20).
   * Keyed on the flavour, so sharing it changes no answer: a session of the
   * same flavour would get the same one from a kernel. A burst that arrives
   * before the first failure is recorded is not covered: #19.
   */
  readonly #failed = new Map<string, { backoff: Backoff; unresolved: boolean }>();
  /** Flavours whose kernel started since their last failed start (#19). */
  readonly #proven = new Set<string>();
  /** Requests held on their own flavour, apart from the FIFO queue (#19, #115). */
  readonly #held = new Map<string, Waiter[]>();
  /** Requests numbered as they come to wait, held or queued. */
  #arrivals = 0;
  /** A second look for a flavour's held requests when its window ends. */
  readonly #windowTimers = new Map<string, NodeJS.Timeout>();
  /** `#replaced`, for the rest of this turn of the event loop. */
  readonly #changed = new Map<Slot, boolean>();

  constructor(options: KernelPoolOptions) {
    this.#options = options;
    this.#licence = options.licence;
    this.#extraEnv = options.extraEnv;
    // The budget is known up front, because the licence was looked up once and
    // cached rather than being asked of a kernel on every start.
    this.#budget = deriveBudget(options.licence, options.reserveSeats, options.maxKernels, 1);
    options.log(
      `pool budget ${this.#budget} kernel(s) ` +
        `(licence ${options.licence.maxProcesses}, reserving ${options.reserveSeats})`,
    );
    // Saying "reserving 1" when the reserve was clamped away reads as though it
    // had been applied. The floor is deliberate — a budget of zero is a server
    // that can never answer — but it has to be stated.
    const seats = options.licence.maxProcesses;
    if (typeof seats === "number" && seats - options.reserveSeats < 1) {
      options.log(
        `the licence permits ${seats} kernel(s) and ${options.reserveSeats} were to be ` +
          `reserved, so the reserve cannot be honoured: this pool will use the seat`,
      );
    }
  }

  get budget(): number {
    return this.#budget;
  }
  get size(): number {
    return this.#slots.length;
  }
  /**
   * Slots with a kernel process: running, or busy, which a slot is while its
   * kernel starts. Not `size`: a slot whose kernel stopped for idleness stays
   * in the pool until it is used or retired, and reported as running it read,
   * beside a refusal window, as an idle kernel of the flavour that would not
   * serve (#119). Counting only `session.running` would say "0 running, 1
   * busy" of a kernel that is starting.
   */
  get running(): number {
    return this.#slots.filter((s) => s.busy || s.session.running).length;
  }
  get busy(): number {
    return this.#slots.filter((s) => s.busy).length;
  }
  get licence(): LicenceInfo {
    return this.#licence;
  }

  /**
   * Take what a kernel reported. The budget is re-derived from the licence
   * unless configuration fixed it, and a raise serves anyone queued at once —
   * the cold start ran at one kernel only because nothing was known yet. A
   * lowered budget stops nothing running; the pool just does not grow past it.
   * Later kernels get the reported directories; the first one inherited the
   * environment those were computed in, so it found the same ones itself.
   *
   * Directories only from a kernel whose environment chose nothing that shapes
   * it (`SHAPING_VARS`): they are then the installation's. Its licence counts
   * unless it chose a base or user base, the two places a licence can be read
   * from. `WOLFRAMINIT` is shared by every kernel in a broker — it is part of
   * the broker's address — and so is this pool's licence; a cloud or local
   * base changes the account and the data, never the seat count, and refusing
   * those left a pool whose every session set `WOLFRAM_CLOUDBASE` at one
   * kernel for good.
   */
  #learn(facts: KernelFacts, chosen: string[]): void {
    this.#options.onFacts?.(facts, chosen);
    if (!this.#options.learnFromKernels) return;
    if (chosen.length === 0) this.#extraEnv = { ...this.#extraEnv, ...baseDirectoryEnv(facts) };
    if (chosen.some((name) => LICENCE_SHAPING.has(name))) return;
    if (this.#options.licenceConfigured) return;
    this.#licence = { maxProcesses: facts.maxLicenseProcesses, type: facts.licenseType };
    const next = deriveBudget(
      this.#licence,
      this.#options.reserveSeats,
      this.#options.maxKernels,
      this.#budget,
    );
    if (next === this.#budget) return;
    this.#options.log(
      `pool budget ${this.#budget} → ${next} kernel(s), from the licence a kernel ` +
        `reported (${facts.maxLicenseProcesses}, reserving ${this.#options.reserveSeats})`,
    );
    this.#budget = next;
    this.#schedule();
  }

  async #grow(flavour: KernelFlavour): Promise<Slot> {
    const index = this.#slots.length + 1;
    const { log } = this.#options;
    const session = new KernelSession({
      bin: this.#options.bin,
      serverName: this.#options.serverName,
      idleMs: this.#options.idleMs,
      startTimeoutMs: this.#options.startTimeoutMs,
      clientInfo: this.#options.clientInfo,
      extraEnv: this.#extraEnv,
      flavour,
      log: (message) => log(`kernel ${index}: ${message}`),
      onFacts: (facts, chosen) => this.#learn(facts, chosen),
      sourceFromFacts: this.#options.learnFromKernels,
      // A start that fails after its caller's ceiling passed reaches no
      // caller, so it is recorded here, as the start fails: answered "expired"
      // instead, it left no window, and each later request started the kernel
      // that would not start (#80).
      onStartFailed: (err) => this.#recordFailedStart(flavour.digest, err),
      onReady: async (client: Client, late?: AbortSignal) => {
        // Proven: what its held requests were waiting to learn (#19).
        this.#proven.add(flavour.digest);
        this.#schedule();
        await this.#options.onKernelReady?.(client, flavour.digest, late, session.source);
      },
    });
    const slot: Slot = { session, busy: true, flavour };
    this.#slots.push(slot);
    log(
      `pool grew to ${this.#slots.length} kernel(s) for environment ${flavour.digest}, ` +
        `budget ${this.#budget}`,
    );
    return slot;
  }

  /**
   * The kernel to drop to free a seat: an idle one of some other flavour.
   *
   * The budget counts seats, not kinds, so a session whose flavour has no kernel
   * cannot simply grow one once the budget is spent — something has to go. An
   * idle kernel of another flavour is the cheapest thing to lose: no computation
   * is running on it, and the evaluator persists its sessions, so what is lost is
   * a warm start rather than work.
   *
   * Preferring this over reusing an *abandoned* kernel of our own flavour is
   * deliberate. An abandoned kernel is very likely still computing something
   * nobody is waiting for, and taking it stops that; a genuinely idle one is not
   * doing anything at all.
   */
  #victim(flavour: KernelFlavour): Slot | undefined {
    return (
      this.#slots.find((s) => !s.busy && !s.session.abandoned && !this.#mine(s, flavour)) ??
      this.#slots.find((s) => !s.busy && !this.#mine(s, flavour))
    );
  }

  /**
   * A slot that can take a request of this flavour now. While the flavour's
   * server would not start (`refusing`), only one whose kernel is running: the
   * window is about starts, and a slot whose kernel stopped for idleness starts
   * one when used. Checked before the idle kernel was looked for at all, the
   * window refused what a running kernel could answer, so one failed extra
   * start turned the whole flavour away (#101).
   */
  #servable(slot: Slot, flavour: KernelFlavour, refusing: boolean): boolean {
    return (
      !slot.busy &&
      !slot.session.abandoned &&
      this.#mine(slot, flavour) &&
      (!refusing || slot.session.running)
    );
  }

  /**
   * An idle kernel, preferring one with nothing outstanding.
   *
   * A kernel holding an abandoned call is idle only in the sense that nobody is
   * waiting for its answer: it is very likely still computing, and using it
   * means stopping it first. So it is the last choice, taken when the budget is
   * spent and the alternative is no kernel at all — which is what replaces a
   * timer guessing how long a legitimate evaluation may run. The question is
   * never "has this run too long" but "does anyone need the seat".
   */
  #idle(flavour: KernelFlavour): Slot | undefined {
    return (
      this.#slots.find((s) => this.#servable(s, flavour, false)) ??
      this.#slots.find((s) => !s.busy && this.#mine(s, flavour))
    );
  }

  /**
   * Whether a slot's kernel can serve this flavour: one of it whose running
   * kernel's source has not changed on disk since it started
   * (`KernelSession.sourceChanged`). One started before a paclet upgrade serves
   * the old definition, so it is treated as another flavour's: never handed
   * out, and retired as one is (#3).
   * Decided as a slot is chosen, so a request queued before an upgrade and
   * served after it gets a kernel started after it. A slot whose kernel stopped
   * for idleness reads the source again as it restarts, so it is still this
   * flavour's.
   */
  #mine(slot: Slot, flavour: KernelFlavour): boolean {
    return slot.flavour.digest === flavour.digest && !this.#replaced(slot);
  }

  /**
   * `KernelSession.sourceChanged`, read once per turn of the event loop and
   * slot, since one plan looks at every slot; a later turn reads the disk again.
   */
  #replaced(slot: Slot): boolean {
    let changed = this.#changed.get(slot);
    if (changed === undefined) {
      if (this.#changed.size === 0) setImmediate(() => this.#changed.clear());
      changed = slot.session.sourceChanged();
      this.#changed.set(slot, changed);
    }
    return changed;
  }

  /**
   * Take an idle kernel of this flavour, grow one, make room for one, or wait.
   *
   * Five tiers, and the order is what keeps sharing wide while never serving a
   * session from a kernel that is not its own kind. While the flavour's server
   * would not start, only the first applies, to running kernels only, and a
   * request it cannot serve is refused before any other (#101).
   *
   * The one place the tiers are written down: `#acquire` and the waiter drain
   * each wrote them out by hand, so a change to when a tier applies had to be
   * made twice, and #113's first head missed the same case in both (#114). It
   * decides and changes nothing; `#act` carries the decision out.
   */
  #plan(flavour: KernelFlavour): Plan {
    const window = this.#window(flavour.digest);
    const free = this.#slots.find((s) => this.#servable(s, flavour, window !== null));
    if (free) return { tier: "take", slot: free };
    // Inside the window nothing below may start a kernel, or retire another
    // session's to make room. A kernel of its own that is busy with a live call,
    // or starting, will be free soon, so the request waits for it, held on its
    // flavour, rather than being refused with advice to repair a server that
    // resolves (#115). Queued in the FIFO instead, as #113 tried, it held up
    // every other flavour's waiter behind it.
    if (window) return this.#ownBusy(flavour) ? { tier: "hold" } : { tier: "refuse", window };
    // A fresh kernel beats stopping one that may still be finishing something.
    if (this.#slots.length < this.#budget) return { tier: "grow" };
    // Nothing of ours is free and the budget is spent, so a seat has to come
    // from somewhere. An idle kernel of another flavour is the cheapest loss —
    // but not for a second start of a flavour whose first is still under way
    // and that has not yet shown it can start at all: a burst for a server that
    // will not start retired one session's kernel per request to fail (#19).
    // Held, it waits for that start, and proven or refused with it.
    const victim = this.#victim(flavour);
    if (victim) {
      if (!this.#isProven(flavour) && this.#starting(flavour)) return { tier: "hold" };
      return { tier: "swap", victim };
    }
    const spent = this.#idle(flavour);
    if (spent) return { tier: "reuse", slot: spent };
    return { tier: "wait" };
  }

  /**
   * A kernel of this flavour busy with a live call, or starting: either ends
   * in a release or a retirement, which wakes whoever is held for it. Never one
   * holding an abandoned call, whose settling wakes nobody: held behind one, a
   * request waited out its own ceiling (#115).
   */
  #ownBusy(flavour: KernelFlavour): boolean {
    return this.#slots.some((s) => s.busy && !s.session.abandoned && this.#mine(s, flavour));
  }

  /** A kernel of this flavour whose start is under way. */
  #starting(flavour: KernelFlavour): boolean {
    return this.#slots.some((s) => s.busy && !s.session.running && this.#mine(s, flavour));
  }

  /**
   * Whether this flavour has shown it can start: a kernel of it started since
   * its last failed start, or one is running — so one failed extra start, while
   * a kernel of it runs, does not make its next request wait (#19).
   */
  #isProven(flavour: KernelFlavour): boolean {
    return (
      this.#proven.has(flavour.digest) ||
      this.#slots.some((s) => s.session.running && s.flavour.digest === flavour.digest)
    );
  }

  /** Carry out any decision of `#plan`'s but waiting or holding, which are the caller's. */
  #act(
    plan: Exclude<Plan, { tier: "wait" } | { tier: "hold" }>,
    flavour: KernelFlavour,
  ): Slot | Promise<Slot> {
    switch (plan.tier) {
      case "take":
        plan.slot.busy = true;
        return plan.slot;
      case "refuse":
        throw this.#refusal(plan.window);
      case "grow":
        return this.#grow(flavour);
      case "swap": {
        this.#options.log(
          `budget reached and no kernel for environment ${flavour.digest}; retiring an idle ` +
            `kernel for ${plan.victim.flavour.digest} to make room`,
        );
        // Whoever waits is woken only once the replacement holds the seat.
        // Retiring wakes the queue and the requests held for the victim's
        // flavour, and one that found the seat free grew into it before this
        // could: three kernels on two seats.
        this.#retire(plan.victim, "a session with a different environment needed the seat", false);
        const replacement = this.#grow(flavour);
        this.#schedule();
        return replacement;
      }
      case "reuse":
        this.#options.log(
          `budget reached; reusing a kernel that holds an abandoned call, which ` +
            `stops it — no other kernel can serve this request`,
        );
        plan.slot.busy = true;
        return plan.slot;
    }
  }

  async #acquire(flavour: KernelFlavour, options: RunOptions): Promise<Slot> {
    const { signal, expiresAt } = options;
    const plan = this.#plan(flavour);
    if (plan.tier === "hold") {
      this.#options.log(`holding a request for environment ${flavour.digest} for its own kernel`);
    } else if (plan.tier === "wait") {
      this.#options.log(
        `all ${this.#slots.length} kernel(s) busy and budget reached; queueing ` +
          `(${this.#waiters.length + 1} waiting)`,
      );
    } else {
      return this.#act(plan, flavour);
    }
    let expiry: NodeJS.Timeout | undefined;
    const acquired = new Promise<Slot>((resolve, reject) => {
      const waiter: Waiter = { flavour, resolve, reject, seq: ++this.#arrivals };
      if (plan.tier === "hold") this.#hold(waiter);
      else this.#queue(waiter);
      // Cancelled, or past its ceiling, while it waits, it leaves, held or
      // queued: left in, it was served like any other, by a kernel grown or
      // another session's retired, and sent after its caller was answered.
      // Leaving frees no seat — a request waits only while none is free — so
      // nobody behind it is owed a look.
      const leave = (err: Error): void => {
        if (!this.#unqueue(waiter)) return; // already served; `session.run` drops it
        waiter.reject(err);
      };
      signal?.addEventListener("abort", () => leave(new RequestDropped(signal.reason)), {
        once: true,
      });
      if (expiresAt != null) {
        expiry = setTimeout(
          () => leave(new RequestExpired(options.deadlineMs ?? 0)),
          deadlineDelay(Math.max(0, expiresAt - Date.now())),
        );
        expiry.unref?.();
      }
    });
    const disarm = (): void => clearTimeout(expiry);
    acquired.then(disarm, disarm);
    return acquired;
  }

  /**
   * Hold a request on its own flavour, apart from the FIFO queue, so it blocks
   * no other flavour's waiter (#115). It is planned again when a kernel of its
   * flavour is released or retired, or proves it can start, and when the
   * flavour's window ends, which no release may bring: a timer gives it that
   * second look. The window also ends early when the kernel binary changes —
   * a repaired installation — which nothing announces, so inside a window the
   * timer looks every `HELD_RECHECK_MS` rather than only at its end: a request
   * held behind a long call otherwise waited out the old window, minutes
   * after newer requests were already starting kernels.
   */
  #hold(waiter: Waiter): void {
    const { digest } = waiter.flavour;
    const held = this.#held.get(digest) ?? [];
    held.push(waiter);
    this.#held.set(digest, held);
    this.#recheck(digest);
  }

  /**
   * The timed look for a flavour's held requests while its window stands, armed
   * again after each look for as long as any stay held inside it. Armed once
   * only, a request still held at the first look — a window with more than a
   * second left — was never looked at again, and stayed held past the window's
   * end, or a repaired binary, until something unrelated woke the pool.
   */
  #recheck(digest: string): void {
    if (this.#windowTimers.has(digest) || !this.#held.get(digest)?.length) return;
    const window = this.#window(digest);
    if (!window) return;
    const timer = setTimeout(
      () => {
        this.#windowTimers.delete(digest);
        this.#schedule(); // which arms the next look, if any stay held inside
      },
      timerDelay(Math.min(window.remainingMs + 1, HELD_RECHECK_MS)),
    );
    timer.unref?.();
    this.#windowTimers.set(digest, timer);
  }

  /**
   * Into the queue by when it came, not at its tail: a held request that comes
   * to need a seat — its window over, every kernel busy — was owed one before
   * whoever queued while it was held. Appended, it fell behind them, and one of
   * them could even retire the very kernel it had been waiting for (#147's
   * review). A new request is the latest, so this is its tail.
   */
  #queue(waiter: Waiter): void {
    const at = this.#waiters.findIndex((queued) => queued.seq > waiter.seq);
    if (at === -1) this.#waiters.push(waiter);
    else this.#waiters.splice(at, 0, waiter);
  }

  /** Take a waiter out of wherever it waits; false when it has been served. */
  #unqueue(waiter: Waiter): boolean {
    const at = this.#waiters.indexOf(waiter);
    if (at !== -1) {
      this.#waiters.splice(at, 1);
      return true;
    }
    const held = this.#held.get(waiter.flavour.digest);
    const there = held?.indexOf(waiter) ?? -1;
    if (held && there !== -1) {
      held.splice(there, 1);
      return true;
    }
    return false;
  }

  #release(slot: Slot): void {
    slot.busy = false;
    this.#schedule();
  }

  /**
   * Hold a kernel out of circulation until it has been vouched for.
   *
   * A bare `finally` used to hand it straight back as healthy, which is wrong
   * for the failure that matters most: a kernel that timed out is still working
   * on the abandoned evaluation and is not reading its stdin, so the next
   * borrower queued behind work it could not see and inherited the same
   * timeout. Measured before this existed: two requests, one wedged kernel,
   * both failing, and never a second kernel started. `notifications/cancelled`
   * cannot help — a kernel that is not reading stdin never receives it.
   *
   * Retiring on sight was the wrong correction, though: *any* rejection killed
   * the kernel, so a model guessing a tool name wrong — an `-32602` the kernel
   * answers instantly and is perfectly healthy after — destroyed every evaluator
   * `session` on it. Measured: one `NoSuchTool` call took the kernel count from
   * 1 to 2, where the same run without it stayed at 1.
   *
   * So the slot stays `busy` — nobody may take it — while the session asks the
   * kernel whether it is still there, and only a kernel that cannot answer is
   * retired. The rejection has already been handed to the caller by then; a
   * waiter meanwhile sees no free slot and grows a fresh kernel rather than
   * waiting out the probe, which is what keeps the wedged case fast.
   */
  #quarantine(slot: Slot, reason: string): void {
    void slot.session.usable().then(
      (usable: boolean) => {
        if (!usable) {
          this.#retire(slot, reason);
          return;
        }
        if (slot.session.abandoned) {
          // Returned to the pool, but as a last resort rather than a free
          // kernel: it is very likely still computing a call nobody is waiting
          // for, and taking it back kills both that work and the evaluator
          // sessions on it. `#idle` is what encodes the preference, and it reads
          // the session rather than a flag here, so a call that finishes on its
          // own silently promotes its kernel back to first choice.
          this.#options.log(
            `a call was abandoned on this kernel; it will be reused only if no ` +
              `other kernel can serve, rather than killing work that may finish`,
          );
        } else {
          this.#options.log(
            `the kernel answered for itself after ${reason}; returning it to the pool`,
          );
        }
        this.#release(slot);
      },
      // usable() does not reject, but a pool that leaks a permanently busy slot
      // on a broken promise is worse than one that retires a good kernel.
      () => this.#retire(slot, reason),
    );
  }

  /** Drop a kernel that could not answer for itself, or whose seat is needed. */
  #retire(slot: Slot, reason: string, reschedule = true): void {
    const at = this.#slots.indexOf(slot);
    if (at !== -1) this.#slots.splice(at, 1);
    this.#options.log(`retiring kernel after ${reason}; pool now ${this.#slots.length} kernel(s)`);
    void slot.session.stop().catch(() => {});
    if (reschedule) this.#schedule();
  }

  #scheduling = false;
  #rescheduled = false;

  /**
   * Serve every waiting request that can be served now, one at a time, oldest
   * first, queued or held, planning everything again after each. Called on
   * anything that frees capacity or changes a plan: a release, a retirement, a
   * raised budget, a start that succeeds, a window's end.
   *
   * One scheduler, because the pool had one per event — wake the held, drain
   * the queue — and each ordered whole groups: a flavour's held requests before
   * or after the queue. A release or a retirement handed a seat to a newer held
   * request over an older queued one, a raised budget gave the queue its seats
   * first, and where several seats came at once a flavour's held requests took
   * them all ahead of a queued request older than some of them (#147's review).
   * Re-entered from inside — a swap retires a kernel — it only notes that it
   * must look again.
   */
  #schedule(): void {
    if (this.#scheduling) {
      this.#rescheduled = true;
      return;
    }
    this.#scheduling = true;
    try {
      do {
        this.#rescheduled = false;
        while (this.#serveOldest());
      } while (this.#rescheduled);
    } finally {
      this.#scheduling = false;
    }
    // Whoever is still held gets its timed look, whenever a window has opened
    // since it was held: held behind an unproven flavour's starts, with no
    // window, a request had no timer, and when one start then failed it stayed
    // held past the window it opened (#147's review).
    for (const digest of this.#held.keys()) this.#recheck(digest);
  }

  /**
   * Serve the oldest waiting request that can be served now; false when none
   * can. The queue keeps its strict order — only its head is a candidate, so
   * a stream of one flavour cannot starve another — while held requests each
   * wait on their own flavour. Once the head must wait there is no seat, so
   * a younger request may still be refused or held, but takes nothing.
   */
  #serveOldest(): boolean {
    const head = this.#waiters[0];
    const held = [...this.#held.values()].flat();
    const candidates = (head ? [head, ...held] : held).sort((a, b) => a.seq - b.seq);
    let noSeat = false;
    for (const waiter of candidates) {
      const plan = this.#plan(waiter.flavour);
      const queued = waiter === head;
      if (plan.tier === "wait") {
        if (queued) {
          noSeat = true;
          continue;
        }
        // Held, it now needs a seat: into the queue, where it came.
        this.#unqueue(waiter);
        this.#queue(waiter);
        return true;
      }
      if (plan.tier === "hold") {
        if (!queued) continue;
        this.#unqueue(waiter);
        this.#hold(waiter);
        return true;
      }
      // Seats go in the queue's order: nothing younger than a head that must
      // wait takes one ahead of it. A refusal takes none.
      if (noSeat && plan.tier !== "refuse") continue;
      this.#unqueue(waiter);
      try {
        waiter.resolve(this.#act(plan, waiter.flavour));
      } catch (err) {
        waiter.reject(err);
      }
      return true;
    }
    return false;
  }

  /**
   * Run `fn` on a kernel of this flavour, holding it for the duration.
   *
   * The flavour is the caller's, never the pool's: the pool runs inside a broker
   * whose own environment is whichever session spawned it, and that is precisely
   * what must not decide anything.
   */
  async run<T>(
    flavour: KernelFlavour,
    fn: (client: Client, request: RequestOptions, source: string | undefined) => Promise<T>,
    options: RunOptions = {},
  ): Promise<T> {
    // Cancelled before it reached the pool, so no room is made for it: let in,
    // it could grow a kernel, or retire another session's idle one, for a
    // request `session.run` then dropped.
    if (options.signal?.aborted) throw new RequestDropped(options.signal.reason);
    // Past its ceiling already, the same: let in, it retired another session's
    // idle kernel to make room for a request that was then never sent.
    if (options.expiresAt != null && Date.now() >= options.expiresAt) {
      throw new RequestExpired(options.deadlineMs ?? 0);
    }
    const slot = await this.#acquire(flavour, options);
    try {
      const result = await slot.session.run(fn, options);
      this.#release(slot);
      return result;
    } catch (err) {
      // The kernel never had it, so there is nothing to vouch for: it goes
      // straight back. Quarantined, its log said the kernel had answered.
      if (err instanceof RequestDropped) {
        this.#release(slot);
        throw err;
      }
      // A start that failed is already recorded, by the session's `onStartFailed`.
      this.#quarantine(slot, errorText(err));
      throw err;
    }
  }

  #now(): number {
    return (this.#options.clock ?? Date.now)();
  }

  /** What makes two starts starts of the same installation: a changed binary ends a window. */
  #identity(): CandidateIdentity | null {
    return candidateIdentity(this.#options.bin);
  }

  #recordFailedStart(digest: string, err: unknown): void {
    // Pruned here, so a long-lived broker does not keep every flavour that ever
    // failed, kernel output and all.
    const identity = this.#identity();
    for (const [key, failed] of this.#failed) {
      if (!failed.backoff.current(identity)) this.#failed.delete(key);
    }
    const unresolved = isServerNotResolved(err);
    const { windowMs, advice } = preparationBackoff(
      unresolved ? { kind: "unresolved" } : { kind: "kernel" },
    );
    const backoff = new Backoff(PREPARATION_BACKOFF_MS, () => this.#now());
    backoff.record(identity, err, windowMs, advice);
    this.#failed.set(digest, { backoff, unresolved });
    this.#proven.delete(digest);
  }

  /**
   * A flavour's window, while it stands: how long it has run, how much longer
   * it runs, and the kernel's words. The one place that is worked out, so the
   * refusal and what `status` reports of it cannot disagree at the edge.
   */
  #window(digest: string): Window | null {
    const failed = this.#failed.get(digest);
    if (!failed) return null;
    const state = failed.backoff.current(this.#identity());
    if (!state) {
      this.#failed.delete(digest);
      return null;
    }
    return {
      ageMs: this.#now() - state.failedAt,
      remainingMs: state.remainingMs,
      reason: state.reason,
      advice: state.advice,
      unresolved: failed.unresolved,
    };
  }

  /**
   * Whether this pool is refusing to start a kernel for a flavour, how much
   * longer for, and why. For the broker's `status`: on the shared path the
   * window is the pool's, and `wolfram_status` could say nothing of why a
   * session's requests were turned away, where it reports a private session's
   * back-off (#101).
   */
  refusing(digest: string): { remainingMs: number; reason: string } | null {
    const window = this.#window(digest);
    return window && { remainingMs: window.remainingMs, reason: window.reason };
  }

  /**
   * The refusal for a request while its flavour's kernel recently would not
   * start. Built only where it is thrown: a request inside the window that a
   * running kernel serves needs no error. No doctor command for the
   * installation's failures: this runs in the broker, whose launch context is
   * not the caller's, so it could name the wrong one.
   */
  #refusal(window: Window): Error {
    const message =
      `a kernel for this server could not start ${elapsedText(window.ageMs)} ago, so ` +
      `none was started for this request; it is tried again in ` +
      `${waitText(window.remainingMs)}` +
      (window.advice ? `; ${window.advice}.` : `, or as soon as the installation changes.`) +
      `\n\nThe failure was: ${window.reason}`;
    return window.unresolved ? new ServerNotResolved(message) : new Error(message);
  }

  async stop(): Promise<void> {
    for (const timer of this.#windowTimers.values()) clearTimeout(timer);
    this.#windowTimers.clear();
    await Promise.all(this.#slots.map((s) => s.session.stop().catch(() => {})));
    this.#slots.length = 0;
  }
}
