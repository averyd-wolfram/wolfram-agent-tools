/**
 * Preparation: everything between a session's first real request and the first
 * request a kernel actually receives — attaching to a broker and waiting for it,
 * and the kernel's MCP handshake. (It also covered an installation probe kernel,
 * until kernels began reporting their installation themselves: plugin plan D20.)
 *
 * Each of those used to carry its own bound — the probe 120s, the handshake
 * `WOLFRAM_MCP_START_TIMEOUT_SECONDS`, the broker the call ceiling plus grace —
 * so the wait before a first call could run to several minutes, and the error
 * at the end named only the last step. One `Deadline` now covers all of it and
 * says which stage it ran out in.
 *
 * A preparation that failed is not retried on the next call. A kernel that
 * cannot start costs a licence seat and the whole deadline on every attempt, so
 * a client retrying in a loop spent both continuously. `Backoff` makes the next
 * calls fail at once, saying how long is left, until the window passes or the
 * installation itself changes.
 */
import { statSync } from "node:fs";
import { errorText } from "./log.js";

/** How long a failed preparation is not retried, unless the binary changes. */
export const PREPARATION_BACKOFF_MS = 10 * 60_000;

/**
 * How long a server name that did not resolve is not asked again.
 *
 * Not the full back-off: that is fixed by creating the server or installing its
 * paclet, which the back-off, keyed on the kernel binary, cannot see, so ten
 * minutes held the fix off (issue #5). Not none either: every ask starts a
 * kernel and spends a seat for the second it takes to fail, and a client asks
 * several things on connect and may retry in a loop. Long enough that a burst
 * shares one failure; short enough that whoever fixes it rarely waits.
 */
export const NOT_RESOLVED_BACKOFF_MS = 15_000;

/**
 * The least a kernel start is handed: below this, the handshake could only
 * time out, so no kernel is spawned and no seat spent on it. A real kernel
 * takes seconds to start; the fake one a fraction of this. `handOn` caps it
 * at half the start timeout itself, so a short one still gets an attempt.
 */
export const MIN_START_MS = 1_000;

/**
 * How long a preparation refused for lack of time is not retried: the next
 * call has a fresh deadline, so only long enough that a client retrying in a
 * loop does not spend every earlier stage again at once.
 */
export const TOO_LATE_BACKOFF_MS = 15_000;

/** What a refused start says about why, in place of the installation advice. */
export const TOO_LATE_ADVICE =
  "the stages before the start used most of WOLFRAM_MCP_START_TIMEOUT_SECONDS, and the next attempt has the whole of it again";

/** What ends that wait sooner, said by both paths, so they cannot drift apart. */
export const NOT_RESOLVED_ADVICE =
  "meanwhile, check the server MCP_SERVER_NAME names: create it, install the paclet " +
  "that provides it, or repair its definition";

/** A preparation that did not finish in time, naming the stage it was in. */
export class PreparationTimeout extends Error {
  readonly stage: string;
  /**
   * `cause` is the work's own failure when one landed as time ran out, kept so
   * a caller can still tell what it was: a server name that did not resolve
   * starts no back-off even when the deadline wrapped it.
   */
  constructor(stage: string, totalMs: number, detail?: string, cause?: unknown) {
    super(
      `a Wolfram kernel was not ready within ${Math.round(totalMs / 1000)}s ` +
        `(WOLFRAM_MCP_START_TIMEOUT_SECONDS): time ran out while ${stage}` +
        (detail ? `. ${detail}` : ""),
      cause === undefined ? undefined : { cause },
    );
    this.name = "PreparationTimeout";
    this.stage = stage;
  }
}

/**
 * A stage refused because too little of the deadline was left for it to begin.
 *
 * Still a timeout — the deadline did run out, in the stages before — but not
 * a failure of the kernel or the installation: nothing was tried, and the next
 * call has a fresh deadline. So it gets a short back-off, not the full one
 * with its pointer at the installation.
 */
export class TooLateToBegin extends PreparationTimeout {
  constructor(stage: string, totalMs: number, leftMs: number) {
    super(stage, totalMs, `${Math.floor(leftMs)}ms were left, too little for this to begin`);
    this.name = "TooLateToBegin";
  }
}

/** A preparation ended by `stop()`: not a failure, so it starts no back-off. */
export class PreparationStopped extends Error {
  constructor() {
    super("the Wolfram server was stopped while a kernel was being prepared");
    this.name = "PreparationStopped";
  }
}

/**
 * One elapsed budget, shared by every stage of a preparation — and the way to
 * end it early. `signal` fires when the server stops: every stage races it,
 * and work this process owns takes it too (the probe's execFile kills its
 * kernel on it), so a stop reaches a preparation that has not yet produced
 * anything else to stop.
 */
export class Deadline {
  readonly totalMs: number;
  readonly signal: AbortSignal;
  readonly #at: number;
  readonly #clock: () => number;

  constructor(
    totalMs: number,
    clock: () => number = Date.now,
    signal: AbortSignal = new AbortController().signal,
  ) {
    this.totalMs = totalMs;
    this.signal = signal;
    this.#clock = clock;
    this.#at = clock() + totalMs;
  }

  get stopped(): boolean {
    return this.signal.aborted;
  }

  remaining(): number {
    return Math.max(0, this.#at - this.#clock());
  }

  /**
   * `work`, unless the deadline passes first — then a `PreparationTimeout`
   * naming `stage`.
   *
   * The work is not stopped here, because what stopping means depends on who
   * owns it: a probe this process started is killed by its own timeout, a
   * kernel by its transport, while a broker's preparation belongs to every
   * session attached to it and is left to finish for them. `onLate` receives
   * whatever the work produces after the deadline, so an owner can release it.
   *
   * A failure that lands once the deadline has passed is reported as the
   * timeout too, carrying the work's own words: the handshake's own timer is
   * set to the remaining time, and whichever of the two fires first, the
   * caller should learn the stage. `graceMs` lets work that bounds itself fail
   * first, so its richer error — a kernel's last words — is the one wrapped.
   *
   * "Once the deadline has passed" is read off this deadline's clock, and the
   * work's timer runs on Node's loop clock, which lags it: the work can fail on
   * its own expiry with a millisecond still showing here. `ranOut` names that
   * failure — the work timing out on the remainder it was given — so it is
   * reported as the timeout whatever the two clocks say.
   */
  async within<T>(
    stage: string,
    work: Promise<T>,
    onLate?: (late: T) => void,
    graceMs = 0,
    ranOut?: (err: unknown) => boolean,
  ): Promise<T> {
    let expired = false;
    let timer: NodeJS.Timeout | undefined;
    let onAbort: (() => void) | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        expired = true;
        reject(new PreparationTimeout(stage, this.totalMs));
      }, this.remaining() + graceMs);
      timer.unref?.();
      // A stop counts as "after the deadline" for onLate: whatever the work
      // produces once nobody is waiting is the owner's to release.
      onAbort = () => {
        expired = true;
        reject(new PreparationStopped());
      };
      if (this.signal.aborted) onAbort();
      else this.signal.addEventListener("abort", onAbort, { once: true });
    });
    void work.then(
      (late) => {
        if (expired) onLate?.(late);
      },
      () => {},
    );
    try {
      return await Promise.race([work, timeout]);
    } catch (err) {
      if (this.signal.aborted) throw new PreparationStopped();
      if (err instanceof PreparationTimeout) throw err;
      if (this.remaining() > 0 && !ranOut?.(err)) throw err;
      throw new PreparationTimeout(stage, this.totalMs, errorText(err), err);
    } finally {
      clearTimeout(timer);
      if (onAbort) this.signal.removeEventListener("abort", onAbort);
    }
  }

  /**
   * What is left, for work that bounds itself to it, or the timeout for
   * `stage` if less than `minimumMs` is. One read of the clock, where a check
   * then `remaining()` was two: a deadline that ran out between them handed on
   * 0, which spawned a kernel with a 0ms handshake (a seat for a start that
   * could only fail) or sent the broker a ceiling of 0, which means none (#11).
   * `minimumMs` is what the work needs to have any chance — a kernel cannot
   * start in a few milliseconds either — capped at half the deadline, so a
   * short one still gets an attempt; and never less than something.
   */
  handOn(stage: string, minimumMs = 1): number {
    if (this.signal.aborted) throw new PreparationStopped();
    const left = this.remaining();
    const floor = Math.max(1, Math.min(minimumMs, this.totalMs / 2));
    // Said plainly: this stage did not begin, so "ran out while starting"
    // alone read as though it had been under way and failed. What earlier
    // stages started is theirs to say.
    if (left < floor) throw new TooLateToBegin(stage, this.totalMs, left);
    return left;
  }

  /**
   * Throws the timeout for `stage` if the deadline has already passed —
   * unchanged, for callers of the library.
   *
   * @deprecated Use `handOn`, which returns the remainder from the same read:
   * this followed by `remaining()` is two reads of the clock, and a deadline
   * that runs out between them hands on 0 (#11).
   */
  check(stage: string): void {
    if (this.signal.aborted) throw new PreparationStopped();
    if (this.remaining() <= 0) throw new PreparationTimeout(stage, this.totalMs);
  }
}

/** What makes two attempts attempts at the same installation. */
export interface CandidateIdentity {
  bin: string;
  mtimeMs: number;
  size: number;
}

export function candidateIdentity(bin: string): CandidateIdentity | null {
  try {
    const stat = statSync(bin);
    return { bin, mtimeMs: Math.round(stat.mtimeMs), size: stat.size };
  } catch {
    return null;
  }
}

function sameCandidate(a: CandidateIdentity | null, b: CandidateIdentity | null): boolean {
  return (
    a !== null && b !== null && a.bin === b.bin && a.mtimeMs === b.mtimeMs && a.size === b.size
  );
}

/** The state `wolfram_status` reports. */
export interface BackoffState {
  failedAt: number;
  until: number;
  remainingMs: number;
  reason: string;
  /** What ends it sooner, when that is not the installation changing. */
  advice?: string | undefined;
}

/** The last failed preparation, and whether it still stands. */
export class Backoff {
  readonly #windowMs: number;
  readonly #clock: () => number;
  #failure: {
    identity: CandidateIdentity | null;
    at: number;
    reason: string;
    windowMs: number;
    advice: string | undefined;
  } | null = null;

  constructor(windowMs = PREPARATION_BACKOFF_MS, clock: () => number = Date.now) {
    this.#windowMs = windowMs;
    this.#clock = clock;
  }

  /**
   * `windowMs`, when a failure warrants a shorter wait than the usual window,
   * and `advice` for what fixes it, when that is not the installation.
   */
  record(
    identity: CandidateIdentity | null,
    err: unknown,
    windowMs = this.#windowMs,
    advice?: string,
  ): void {
    this.#failure = {
      identity,
      at: this.#clock(),
      reason: errorText(err),
      windowMs: Math.min(windowMs, this.#windowMs),
      advice,
    };
  }

  clear(): void {
    this.#failure = null;
  }

  /**
   * The back-off in force for `identity`, or null when a preparation may run.
   * A changed binary ends it at once: an upgrade or a repair is exactly what
   * the user would do about the failure, and making them wait it out would
   * punish the fix.
   */
  current(identity: CandidateIdentity | null): BackoffState | null {
    const failure = this.#failure;
    if (!failure) return null;
    const until = failure.at + failure.windowMs;
    const now = this.#clock();
    if (now >= until || !sameCandidate(failure.identity, identity)) {
      this.#failure = null;
      return null;
    }
    return {
      failedAt: failure.at,
      until,
      remainingMs: until - now,
      reason: failure.reason,
      advice: failure.advice,
    };
  }
}

/** "4m 05s", for a wait a person reads. */
export function formatWait(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes > 0 ? `${minutes}m ${String(seconds).padStart(2, "0")}s` : `${seconds}s`;
}
