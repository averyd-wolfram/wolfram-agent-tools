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
import type { KernelFlavour } from "./flavour.js";
import { KernelSession, type RunOptions } from "./kernel.js";
import { baseDirectoryEnv, type KernelFacts } from "./inspect.js";
import { errorText, type Logger } from "./log.js";

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
   * be read here rather than by going back through `run`.
   */
  onKernelReady?: ((client: Client, flavour: string) => void | Promise<void>) | undefined;
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
  resolve: (slot: Slot) => void;
}

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

export class KernelPool {
  readonly #options: KernelPoolOptions;
  readonly #slots: Slot[] = [];
  readonly #waiters: Waiter[] = [];
  #budget: number;
  #licence: LicenceInfo;
  #extraEnv: Record<string, string> | undefined;

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
    this.#drainWaiters();
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
      onReady: async (client: Client) => {
        await this.#options.onKernelReady?.(client, flavour.digest);
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
   * Free a seat by dropping an idle kernel of some other flavour.
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
  #swapOut(flavour: KernelFlavour): boolean {
    const victim =
      this.#slots.find(
        (s) => !s.busy && !s.session.abandoned && s.flavour.digest !== flavour.digest,
      ) ?? this.#slots.find((s) => !s.busy && s.flavour.digest !== flavour.digest);
    if (!victim) return false;
    this.#options.log(
      `budget reached and no kernel for environment ${flavour.digest}; retiring an idle ` +
        `kernel for ${victim.flavour.digest} to make room`,
    );
    this.#retire(victim, "a session with a different environment needed the seat");
    return true;
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
    const mine = (s: Slot) => s.flavour.digest === flavour.digest;
    return (
      this.#slots.find((s) => !s.busy && !s.session.abandoned && mine(s)) ??
      this.#slots.find((s) => !s.busy && mine(s))
    );
  }

  /**
   * Take an idle kernel of this flavour, grow one, make room for one, or wait.
   *
   * Five tiers, and the order is what keeps sharing wide while never serving a
   * session from a kernel that is not its own kind.
   */
  async #acquire(flavour: KernelFlavour): Promise<Slot> {
    const mine = (s: Slot) => s.flavour.digest === flavour.digest;

    const free = this.#slots.find((s) => !s.busy && !s.session.abandoned && mine(s));
    if (free) {
      free.busy = true;
      return free;
    }
    // A fresh kernel beats stopping one that may still be finishing something.
    if (this.#slots.length < this.#budget) return this.#grow(flavour);

    // Nothing of ours is free and the budget is spent, so a seat has to come
    // from somewhere. An idle kernel of another flavour is the cheapest loss.
    if (this.#swapOut(flavour)) return this.#grow(flavour);

    const spent = this.#idle(flavour);
    if (spent) {
      this.#options.log(
        `budget reached; reusing a kernel that holds an abandoned call, which ` +
          `stops it — no other kernel can serve this request`,
      );
      spent.busy = true;
      return spent;
    }

    this.#options.log(
      `all ${this.#slots.length} kernel(s) busy and budget reached; queueing ` +
        `(${this.#waiters.length + 1} waiting)`,
    );
    return new Promise<Slot>((resolve) => this.#waiters.push({ flavour, resolve }));
  }

  #release(slot: Slot): void {
    slot.busy = false;
    this.#drainWaiters();
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

  /**
   * Drop a kernel that could not answer for itself, or whose seat is needed.
   *
   * `#draining` guards the waiter drain because `#swapOut` retires from inside
   * `#drainWaiters`: without it the drain re-enters itself, and the head waiter
   * it is part-way through serving is handed a slot twice.
   */
  #retire(slot: Slot, reason: string): void {
    const at = this.#slots.indexOf(slot);
    if (at !== -1) this.#slots.splice(at, 1);
    this.#options.log(`retiring kernel after ${reason}; pool now ${this.#slots.length} kernel(s)`);
    void slot.session.stop().catch(() => {});
    if (!this.#draining) this.#drainWaiters();
  }

  #draining = false;

  #drainWaiters(): void {
    if (this.#draining) return;
    this.#draining = true;
    try {
      this.#drain();
    } finally {
      this.#draining = false;
    }
  }

  #drain(): void {
    // Strictly the head of the queue, so a stream of one flavour cannot starve a
    // session of another. The tiers below are #acquire's, applied to whatever the
    // head waiter needs — including the swap, which is why a waiter for a flavour
    // with no kernel at all still gets served rather than waiting forever.
    while (this.#waiters.length > 0) {
      const head = this.#waiters[0];
      if (!head) return;
      const { flavour } = head;
      const mine = (s: Slot) => s.flavour.digest === flavour.digest;

      const take = (slot: Slot): void => {
        this.#waiters.shift();
        slot.busy = true;
        head.resolve(slot);
      };

      const fresh = this.#slots.find((s) => !s.busy && !s.session.abandoned && mine(s));
      if (fresh) {
        take(fresh);
        continue;
      }
      if (this.#slots.length < this.#budget) {
        this.#waiters.shift();
        void this.#grow(flavour).then(head.resolve);
        continue;
      }
      if (this.#swapOut(flavour)) {
        this.#waiters.shift();
        void this.#grow(flavour).then(head.resolve);
        continue;
      }
      const spent = this.#idle(flavour);
      if (spent) {
        this.#options.log(
          `budget reached; a waiter is reusing a kernel that holds an abandoned ` +
            `call, which stops it`,
        );
        take(spent);
        continue;
      }
      return;
    }
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
    fn: (client: Client) => Promise<T>,
    options: RunOptions = {},
  ): Promise<T> {
    const slot = await this.#acquire(flavour);
    try {
      const result = await slot.session.run(fn, options);
      this.#release(slot);
      return result;
    } catch (err) {
      this.#quarantine(slot, errorText(err));
      throw err;
    }
  }

  async stop(): Promise<void> {
    await Promise.all(this.#slots.map((s) => s.session.stop().catch(() => {})));
    this.#slots.length = 0;
  }
}
