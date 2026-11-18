/**
 * A stdio client transport that spawns a Wolfram kernel and filters its stdout.
 *
 * Why not the SDK's StdioClientTransport: a kernel emits non-protocol text on
 * stdout — license banners, stray `Print[]`, `Message[]` warnings during a
 * paclet load, and its own echo of malformed input as `Syntax::sntxf`. The
 * SDK's reader treats every line as JSON-RPC and the session dies. This
 * transport routes anything that is not a JSON object or array to the log.
 */
import { spawn, type ChildProcess } from "node:child_process";
import type {
  Transport,
  TransportSendOptions,
} from "@modelcontextprotocol/sdk/shared/transport.js";
import {
  ErrorCode,
  isJSONRPCErrorResponse,
  isJSONRPCResultResponse,
  type JSONRPCMessage,
} from "@modelcontextprotocol/sdk/types.js";
import { CappedLines } from "./lines.js";

/**
 * Longest stdout line read from a kernel, in characters: what an interactive
 * prompt that never ends its line can make this process hold. The broker's
 * socket carries more (`FRAME_CAP`), so a reply read here fits there once the
 * broker has written it again.
 */
export const KERNEL_LINE_CAP = 4 * 1024 * 1024;

/** How many recent non-protocol lines to keep for error messages. */
const RECENT_LINE_LIMIT = 15;

/** Grace period between SIGTERM and SIGKILL. */
const KILL_ESCALATION_MS = 5_000;

/** Hard ceiling on waiting for a killed kernel to be reaped. */
const REAP_TIMEOUT_MS = 8_000;

export interface FilteringStdioTransportOptions {
  command: string;
  args?: string[];
  env?: NodeJS.ProcessEnv;
  cwd?: string;
  /** Every non-protocol line the child produces, from either stream. */
  onOutput?: (line: string) => void;
  /**
   * Called at most once when the child dies without `close()` having been
   * asked for. Lets a caller abandon an in-flight handshake immediately instead
   * of waiting out a start timeout.
   */
  onFatal?: (error: Error) => void;
}

export class FilteringStdioTransport implements Transport {
  onmessage?: (message: JSONRPCMessage) => void;
  onerror?: (error: Error) => void;
  onclose?: () => void;

  readonly #options: FilteringStdioTransportOptions;
  #child: ChildProcess | null = null;
  /**
   * Settles once Node has said whether the spawn happened. A close() that
   * lands before then used to return at `!this.#spawned` and drop the handle,
   * so a kernel forked a moment earlier was never signalled and ran on with
   * its licence seat — reached by stopping a server the instant its kernel
   * appeared.
   */
  #spawnGate: Promise<void> | null = null;
  readonly #lines = new CappedLines(
    KERNEL_LINE_CAP,
    (line) => this.#emit(line),
    (length, ends, ended) => this.#dropped(length, ends, ended),
  );
  /**
   * Requests sent and not yet answered, by id: what a reply dropped for its
   * length may name, by the id it began or ended with (`replyId`).
   */
  readonly #unanswered = new Set<string | number>();
  #closing = false;
  #spawned = false;
  #fatalReported = false;
  #recent: string[] = [];

  constructor(options: FilteringStdioTransportOptions) {
    this.#options = options;
  }

  get pid(): number | undefined {
    return this.#child?.pid;
  }

  /** The last non-protocol lines the kernel produced, oldest first. */
  recentOutput(): string[] {
    return [...this.#recent];
  }

  async start(): Promise<void> {
    if (this.#child) throw new Error("FilteringStdioTransport is already started");

    // shell:false is load-bearing: the -run payload contains backticks and
    // quotes that a shell would command-substitute or mangle.
    const child = spawn(this.#options.command, this.#options.args ?? [], {
      stdio: ["pipe", "pipe", "pipe"],
      env: this.#options.env,
      cwd: this.#options.cwd,
      shell: false,
      windowsHide: true,
      // A new process group on POSIX — we keep the handle and never unref, so
      // the kernel's lifetime still tracks ours — so close() can signal the
      // whole group. The kernel spawns children of its own: the notebook
      // front-end MathLink launches for WriteNotebook. Killing only the kernel
      // pid orphaned that front-end to init, where its SharedMemory link
      // busy-polls a now-dead peer at 100% CPU forever. Windows has no
      // equivalent here and keeps the single-process kill.
      detached: process.platform !== "win32",
    });
    this.#child = child;

    // Node emits exactly one of 'spawn' or 'error' for a spawn attempt.
    // Waiting on that pair is what makes a bad kernel path fail immediately
    // rather than stalling the MCP handshake until the start timeout.
    this.#spawnGate = new Promise<void>((resolve, reject) => {
      const settle = (fn: () => void) => {
        child.removeListener("spawn", onSpawn);
        child.removeListener("error", onError);
        fn();
      };
      const onSpawn = () => settle(resolve);
      const onError = (err: Error) =>
        settle(() => {
          this.#child = null;
          reject(new Error(`could not start ${this.#options.command}: ${err.message}`));
        });
      child.once("spawn", onSpawn);
      child.once("error", onError);
    });
    await this.#spawnGate;

    this.#spawned = true;

    // Past the spawn gate, a later 'error' is a runtime fault on the pipes.
    child.on("error", (err) => this.#fail(err));

    child.on("exit", (code, signal) => {
      // Before the error is built, not after: a kernel that writes its reason
      // and dies without a newline — a licence refusal, an activation prompt —
      // has that line sitting in the buffer, and #fail is what carries the
      // recent output to the caller.
      this.#flush();
      if (!this.#closing) {
        this.#fail(
          new Error(`the Wolfram kernel exited unexpectedly (code=${code} signal=${signal})`),
        );
      }
      this.onclose?.();
    });

    // A kernel that dies mid-write breaks the pipe, and Node reports that as an
    // asynchronous 'error' on the stream rather than through the write callback.
    // Unhandled, it is an uncaught exception that takes the server with it — and
    // the `writable` check before a write cannot close the window, because the
    // pipe breaks after the write is issued. The failure still reaches the
    // caller: the child's 'exit' handler reports it with the kernel's own words.
    child.stdin?.on("error", (err) => this.#record(`stdin: ${err.message}`));

    child.stdout?.setEncoding("utf8");
    child.stdout?.on("data", (chunk: string) => this.#lines.push(chunk));

    child.stderr?.setEncoding("utf8");
    child.stderr?.on("data", (chunk: string) => {
      for (const line of chunk.split(/\r?\n/)) {
        const text = line.trim();
        if (text) this.#record(text);
      }
    });
  }

  async send(message: JSONRPCMessage, _options?: TransportSendOptions): Promise<void> {
    const stdin = this.#child?.stdin;
    if (!stdin?.writable) throw new Error("the Wolfram kernel is not running");
    if ("method" in message && "id" in message) this.#unanswered.add(message.id);
    await new Promise<void>((resolve, reject) => {
      stdin.write(`${JSON.stringify(message)}\n`, (err) => (err ? reject(err) : resolve()));
    });
  }

  /**
   * Shut the child down.
   *
   * Must never hang. A caller reaches here on the failure path, and blocking
   * forever would swallow the error that sent it here and wedge the session, so
   * both the exit wait and the kill escalation are bounded.
   */
  async close(): Promise<void> {
    this.#closing = true;
    const child = this.#child;
    this.#child = null;
    this.#flush();

    if (!child) return;
    if (!this.#spawned) {
      // Forked or failing, not yet known which: wait to find out, and if it
      // started, stop it like any other.
      const started = await (this.#spawnGate ?? Promise.reject(new Error("never spawned"))).then(
        () => true,
        () => false,
      );
      if (!started) return;
    }
    if (child.exitCode !== null || child.signalCode !== null) return;

    const exited = this.#waitForExit(child, REAP_TIMEOUT_MS);
    try {
      child.stdin?.end();
    } catch {
      /* already gone */
    }
    this.#signal(child, "SIGTERM");

    // A kernel unwinding a large session can take a moment; escalate if it does not.
    const escalation = setTimeout(() => this.#signal(child, "SIGKILL"), KILL_ESCALATION_MS);
    escalation.unref?.();

    try {
      await exited;
    } finally {
      clearTimeout(escalation);
    }
  }

  /**
   * Signal the child — and on POSIX its whole process group — so the kernel's
   * own descendants die with it. The kernel is spawned as a group leader
   * (`detached`), so `-pid` addresses the group; if the group is already gone,
   * or this is a platform without one, fall back to the plain per-process kill.
   */
  #signal(child: ChildProcess, sig: "SIGTERM" | "SIGKILL"): void {
    const pid = child.pid;
    if (pid !== undefined && process.platform !== "win32") {
      try {
        process.kill(-pid, sig);
        return;
      } catch {
        /* group already gone, or never a leader — fall through to the direct kill */
      }
    }
    try {
      child.kill(sig);
    } catch {
      /* already gone */
    }
  }

  #waitForExit(child: ChildProcess, timeoutMs: number): Promise<void> {
    return new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        child.removeListener("exit", finish);
        resolve();
      };
      const timer = setTimeout(finish, timeoutMs);
      timer.unref?.();
      child.once("exit", finish);
    });
  }

  #fail(error: Error): void {
    if (this.#fatalReported) return;
    this.#fatalReported = true;
    this.onerror?.(error);
    this.#options.onFatal?.(error);
  }

  #record(line: string): void {
    this.#recent.push(line);
    if (this.#recent.length > RECENT_LINE_LIMIT) this.#recent.shift();
    this.#options.onOutput?.(line);
  }

  /**
   * Record whatever is in the buffer without a newline after it, then clear it.
   *
   * A kernel that dies mid-line loses that line otherwise, and the lines that
   * matter most are exactly the ones a dying kernel writes: `close()` used to
   * blank the buffer, and `kernel.ts` then read `recentOutput()` — after the
   * close — for the words to put in the error. So a licence refusal or an
   * activation prompt that arrived without a trailing newline was reported as
   * nothing at all.
   */
  #flush(): void {
    const tail = this.#lines.take();
    if (tail.trim()) this.#emit(tail);
  }

  /**
   * A line over the cap, by its length alone. Where it was the reply to a
   * request outstanding, that request is answered with an error naming its
   * length: left unanswered, it waited out its ceiling, and with none waited for
   * ever, though the kernel had answered and was free (#200). An error from the
   * kernel's side of the protocol, so both paths report it alike and neither
   * takes the kernel for a hung one.
   */
  #dropped(length: number, ends: { head: string; tail: string }, ended: boolean): void {
    if (!ended) {
      this.#record(`dropping kernel output over the ${KERNEL_LINE_CAP} a line may run to`);
      return;
    }
    this.#record(
      `dropped a line of ${length} characters of kernel output, ` +
        `over the ${KERNEL_LINE_CAP} a line may run to`,
    );
    const id = replyId(ends);
    if (id === undefined || !this.#unanswered.has(id)) return;
    this.#unanswered.delete(id);
    this.#deliver({
      jsonrpc: "2.0",
      id,
      error: {
        code: ErrorCode.InternalError,
        message:
          `the kernel's reply was ${length} characters, longer than the ` +
          `${KERNEL_LINE_CAP} this server reads from a kernel, and was dropped`,
      },
    });
  }

  #emit(raw: string): void {
    const line = raw.replace(/\r$/, "").trim();
    if (!line) return;

    if (line[0] !== "{" && line[0] !== "[") {
      this.#record(line);
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      this.#record(line);
      return;
    }

    const messages = Array.isArray(parsed) ? parsed : [parsed];
    for (const message of messages) this.#deliver(message as JSONRPCMessage);
  }

  #deliver(message: JSONRPCMessage): void {
    // Anything at all a kernel printed as JSON reaches here, a bare number in an
    // array among it, and `in` throws on that.
    // Only what the SDK takes for a reply answers a request, by its own test: a
    // stray line holding the id, taken for one here, left the real reply,
    // dropped for its length, matching nothing. Tested only where the id is
    // one awaited, which nearly no notification's is.
    if (
      typeof message === "object" &&
      message !== null &&
      "id" in message &&
      message.id !== undefined &&
      this.#unanswered.has(message.id) &&
      (isJSONRPCResultResponse(message) || isJSONRPCErrorResponse(message))
    ) {
      this.#unanswered.delete(message.id);
    }
    try {
      this.onmessage?.(message);
    } catch (err) {
      this.onerror?.(err instanceof Error ? err : new Error(String(err)));
    }
  }
}

/**
 * The id a dropped line answered, read from how it began and how it ended, or
 * undefined where it was not a JSON-RPC reply. Its top-level members other than
 * `result` or `error`, an object either way, are `jsonrpc` and `id`, and come
 * before it or after it, in either order; AgentTools writes `<|"jsonrpc" -> "2.0", "id" -> id, "result" |
 * "error" -> ...|>`. A line that is not one is never taken for one: a
 * notification, a kernel's own request, or anything else it printed, which no
 * request awaits.
 */
export function replyId({
  head,
  tail,
}: {
  head: string;
  tail: string;
}): string | number | undefined {
  const value = String.raw`(?:-?\d+|"(?:[^"\\]|\\.)*")`;
  const member = String.raw`\s*"(?:jsonrpc|id)"\s*:\s*${value}\s*`;
  // Before: `{` members `,` then the result. After: the result, then `,` members `}` at the end.
  const before = new RegExp(
    String.raw`^\s*\{((?:${member},){0,2})\s*"(?:result|error)"\s*:\s*\{`,
  ).exec(head);
  // Ended as an object does, too: a line cut short, or one that only began as
  // a reply, is not taken for the one its request awaits.
  if (!before || !/\}\s*$/.test(tail)) return undefined;
  const after = new RegExp(String.raw`,((?:${member},?){1,2})\}\s*$`).exec(tail);
  const members = `${before[1] ?? ""},${after?.[1] ?? ""}`;
  if (!new RegExp(String.raw`"jsonrpc"\s*:\s*"2\.0"`).test(members)) return undefined;
  const found = new RegExp(String.raw`"id"\s*:\s*(${value})`).exec(members);
  if (!found?.[1]) return undefined;
  try {
    const id: unknown = JSON.parse(found[1]);
    return typeof id === "number" || typeof id === "string" ? id : undefined;
  } catch {
    return undefined;
  }
}
