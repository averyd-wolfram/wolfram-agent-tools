/**
 * The proxy side of the broker: a KernelBackend that forwards to a shared
 * broker instead of owning a kernel.
 *
 * Connecting is best-effort. If no broker is listening, one is spawned detached
 * and we retry; if that still fails, the caller falls back to a local kernel.
 * Sharing is an optimisation of a licence-limited resource, never a requirement
 * for the server to work.
 */
import { spawn } from "node:child_process";
import { closeSync, openSync } from "node:fs";
import { connect, type Socket } from "node:net";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import type {
  CallToolRequest,
  CallToolResult,
  GetPromptRequest,
  GetPromptResult,
  ListResourcesRequest,
  ListResourcesResult,
  ReadResourceRequest,
  ReadResourceResult,
  Progress,
  ServerCapabilities,
} from "@modelcontextprotocol/sdk/types.js";
import type {
  CallOptions,
  EvaluationOptions,
  KernelBackend,
  KernelReadyHandler,
  PromptPage,
  ToolPage,
} from "./backend.js";
import {
  encodeFrame,
  FrameReader,
  isEvent,
  type BrokerFrame,
  type BrokerOp,
  type BrokerResponse,
  socketFault,
} from "./broker-protocol.js";
import { deadlineDelay, DEFAULT_START_TIMEOUT_MS, timerDelay } from "./config.js";
import type { KernelFlavour } from "./flavour.js";
import { budgetText } from "./duration.js";
import { DEFAULT_DEADLINE_MS } from "./kernel.js";
import { bareMcpText, errorText, type Logger } from "./log.js";
import type { Deadline } from "./prepare.js";

/** How long to keep retrying a connection while a broker boots. */
const CONNECT_DEADLINE_MS = 5_000;
const CONNECT_RETRY_MS = 100;

/**
 * How long to wait for the broker to answer, beyond the caller's own ceiling.
 *
 * The broker applies `timeoutMs` to the kernel, so normally it answers first and
 * this never fires. It exists for the case the broker itself stops responding —
 * blocked on a licence probe, wedged behind a stuck kernel, SIGSTOPped — where
 * there is otherwise nothing on this side to enforce the timeout the server
 * advertises. Measured before this existed: a frozen broker hung a 2s call until
 * the client's own 20s ceiling, then threw a protocol error.
 */
const REQUEST_GRACE_MS = 2_000;

/**
 * Whether the broker answers each op from a kernel, which it may first have to
 * start. A record rather than a list, so a new op cannot be added without being
 * classified: one left off a list silently got the short ceiling.
 */
const FROM_KERNEL: Record<BrokerOp, boolean> = {
  capabilities: true,
  listTools: true,
  listPrompts: true,
  getPrompt: true,
  listResources: true,
  readResource: true,
  callTool: true,
  cancel: false,
  status: false,
  hello: false,
  ping: false,
  ready: false,
};

/**
 * How long to wait for the broker to answer `op`, given its own `timeoutMs`.
 *
 * An op with a timeout of its own is bounded by it plus the grace; `0` means no
 * ceiling, as on a private kernel. A kernel op with none — `listTools`,
 * `capabilities` and the rest — may first have to wait for the broker to start a
 * kernel, which is bounded by the start timeout, so its ceiling covers that
 * start as well as the op. It covered only the op, and fitted only while the
 * MCP SDK cut every handshake at 60s: once a handshake could run to the start
 * timeout, a cold start longer than a minute outlived the ceiling, and the
 * session gave up on a broker that was merely starting a kernel for it. An op
 * the broker answers from memory (`status`) starts nothing, and keeps the short
 * ceiling that notices a wedged broker quickly.
 */
export function brokerCeilingMs(
  op: BrokerOp,
  timeoutMs: number | undefined,
  startTimeoutMs: number,
): number {
  if (timeoutMs === 0) return 0;
  if (timeoutMs !== undefined) return timeoutMs + REQUEST_GRACE_MS;
  const start = FROM_KERNEL[op] ? startTimeoutMs : 0;
  // The broker's kernel session gives a kernel op with no timeout this same
  // deadline once a kernel is up, so one constant is both bounds.
  return start + DEFAULT_DEADLINE_MS + REQUEST_GRACE_MS;
}

/**
 * How long a broker gets to say it is running.
 *
 * The same grace any live broker gets beyond the work itself — and a ping has no
 * work, since it is answered from the event loop ahead of the pool and the
 * licence probe. A broker that is running at all answers in microseconds, so
 * only one that is not misses this, and the whole attach budget above still
 * holds.
 */
const PING_DEADLINE_MS = REQUEST_GRACE_MS;

/**
 * Rebuild the kernel's failure with its class intact.
 *
 * The proxy decides between an `isError` result and an MCP error response by
 * testing `err instanceof McpError`, and a socket carries strings. So a code the
 * broker recorded is turned back into an `McpError` here — otherwise the shared
 * path, which is the default, answered every "unknown tool" as a failed
 * evaluation and a model could not tell the two apart. The message keeps the
 * kernel's own words either way.
 */
function brokerError(response: BrokerResponse): Error {
  const message = response.error ?? "the Wolfram broker reported an error";
  if (response.code === undefined) return new Error(message);
  return new McpError(response.code, bareMcpText(response.code, message), response.data);
}

export interface BrokerClientOptions {
  address: string;
  /**
   * What this session needs its kernels started with. A broker whose own differs
   * cannot serve it, however healthy it is.
   */
  flavour: KernelFlavour;
  /** argv for spawning a broker, when none is listening. */
  spawnCommand: string;
  spawnArgs: string[];
  spawnEnv: NodeJS.ProcessEnv;
  log: Logger;
  /**
   * `WOLFRAM_MCP_START_TIMEOUT_SECONDS`: how long the broker may take to start a
   * kernel before answering an op that needs one (`brokerCeilingMs`). Optional,
   * since these options are public: a caller that builds them by hand gets the
   * setting's default rather than a ceiling of NaN, which Node runs as 1ms.
   */
  startTimeoutMs?: number;
}

function tryConnect(address: string): Promise<Socket | null> {
  return new Promise((resolve) => {
    const socket = connect(address);
    const fail = () => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(null);
    };
    socket.once("connect", () => {
      socket.removeAllListeners("error");
      resolve(socket);
    });
    socket.once("error", fail);
  });
}

/**
 * Not unref'd, deliberately.
 *
 * This delay is work being waited on, not a background timer. An unref'd timer
 * does not hold the event loop open, so in a process whose only other pending
 * work is this retry loop — `doctor`, rather than `serve` with its stdin — node
 * exits mid-wait and the await never settles.
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class BrokerBackend implements KernelBackend {
  readonly kind = "broker" as const;
  /**
   * The pid this process spawned as a broker, or null when it only attached.
   *
   * A pid rather than a "did we spawn one" flag, because spawning is not
   * winning: the child can find the address already bound by another session's
   * broker and stand down, and the retry loop in open() then attaches to the
   * winner. A flag set on the spawn path called the winner ours; the pid
   * comparison in spawnedHere() cannot. Not on the wire; a local fact about how
   * this connection came to be.
   */
  #spawnedPid: number | null = null;
  readonly #options: BrokerClientOptions;
  #socket: Socket;
  #nextId = 1;
  readonly #pending = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void }
  >();
  readonly #progress = new Map<number, (progress: Progress) => void>();
  /**
   * Outstanding pings, kept apart from #pending because their contracts differ:
   * #pending treats `ok: false` as a failure, and a ping treats it as an answer.
   */
  readonly #liveness = new Map<number, (alive: boolean) => void>();
  #onKernelReady: KernelReadyHandler | undefined;
  #closed = false;

  private constructor(options: BrokerClientOptions, socket: Socket) {
    this.#options = options;
    this.#socket = socket;
    this.#attach(socket);
  }

  /**
   * Is the broker answering on this socket the process this backend spawned?
   *
   * Only `doctor` asks, and only to keep one line honest: the pool settings —
   * idle, budget, reserve — belong to whichever session started the broker, so
   * a run that merely attached cannot report its own as though they were in
   * force. The caller supplies the pid the broker reports for itself, so the
   * answer is the two processes agreeing rather than a note taken at connect
   * time about which path the connection came off.
   */
  spawnedHere(brokerPid: number): boolean {
    return this.#spawnedPid !== null && this.#spawnedPid === brokerPid;
  }

  /**
   * Attach to a broker only if one is already listening — never start one — for
   * a caller that asks about sharing rather than shares: `wolfram_status`, which
   * must start nothing. Same safety check and same verified attach as `open`,
   * and the same logger, which is where a caller learns why the answer is null.
   */
  static async attachIfRunning(options: BrokerClientOptions): Promise<BrokerBackend | null> {
    const fault = socketFault(options.address);
    if (fault) {
      options.log(`not sharing kernels: ${fault}`);
      return null;
    }
    const existing = await tryConnect(options.address);
    return existing ? BrokerBackend.#verified(options, existing, null) : null;
  }

  /**
   * Connect to a broker, starting one if necessary.
   *
   * @returns a backend, or null when sharing could not be arranged.
   */
  static async open(options: BrokerClientOptions): Promise<BrokerBackend | null> {
    const { address, log } = options;

    // Before connecting, not only before binding. A socket in a directory
    // somebody else can write to may have been bound by them: the path is
    // derived from public facts, so it can be squatted, and the frames carry no
    // authentication that would notice. Declining costs a licence seat and is
    // the documented fallback; connecting costs whatever the code we hand our
    // evaluations to decides to do with them.
    const fault = socketFault(address);
    if (fault) {
      log(
        `not sharing kernels: ${fault}. Using a private kernel instead; ` +
          `sharing resumes when WOLFRAM_MCP_RUNTIME_DIR (or XDG_RUNTIME_DIR) names a directory only you can write to`,
      );
      return null;
    }

    const existing = await tryConnect(address);
    if (existing) return BrokerBackend.#verified(options, existing, null);

    log("no broker listening; starting one");
    let spawnFailed: string | null = null;
    // The broker owns every kernel and every licence seat, and is the only
    // component nobody can watch: detached with stdio "ignore", its pool budget,
    // its licence result and its startup failures all went to /dev/null. Two
    // separate investigations stalled on exactly that. WOLFRAM_MCP_LOG gives it
    // somewhere to write; without one the behaviour is unchanged.
    let spawnedPid: number | null = null;
    let logTarget: number | "ignore" = "ignore";
    const logPath = options.spawnEnv["WOLFRAM_MCP_LOG"] ?? process.env["WOLFRAM_MCP_LOG"];
    if (logPath) {
      try {
        logTarget = openSync(logPath, "a");
      } catch (err) {
        log(`cannot write broker logs to ${logPath}: ${errorText(err)}`);
      }
    }
    try {
      const child = spawn(options.spawnCommand, options.spawnArgs, {
        detached: true,
        stdio: ["ignore", logTarget, logTarget],
        env: options.spawnEnv,
        windowsHide: true,
      });
      // spawn() reports asynchronous failures — a vanished node binary after an
      // nvm switch, EAGAIN under fd pressure — by emitting 'error' on the next
      // tick. With no listener, EventEmitter rethrows and takes the whole MCP
      // server down: the opposite of "sharing is an optimisation, never a
      // dependency". The surrounding try/catch only sees synchronous errors.
      child.on("error", (err) => {
        // Reported on the next tick, so the retry loop below sees it on its
        // first pass. Waiting out the full deadline for a process that never
        // started is five seconds of nothing, on the path where the answer is
        // already known.
        spawnFailed = errorText(err);
        log(`the broker could not be started: ${spawnFailed}`);
      });
      child.unref();
      // Recorded now, compared later: whether this child is the broker that
      // answers is decided by the bind race, not by having spawned it.
      spawnedPid = child.pid ?? null;
    } catch (err) {
      log(`could not spawn a broker: ${errorText(err)}`);
      return null;
    } finally {
      // The child holds its own duplicate of the descriptor.
      if (typeof logTarget === "number") {
        try {
          closeSync(logTarget);
        } catch {
          /* nothing to close */
        }
      }
    }

    const deadline = Date.now() + CONNECT_DEADLINE_MS;
    while (Date.now() < deadline) {
      await delay(CONNECT_RETRY_MS);
      if (spawnFailed !== null) {
        log("the broker never started; using a private kernel instead");
        return null;
      }
      const socket = await tryConnect(address);
      if (socket) return BrokerBackend.#verified(options, socket, spawnedPid);
    }
    log("a broker did not come up in time; using a private kernel instead");
    return null;
  }

  /**
   * Build a backend on a connected socket, but only once the process behind it
   * has answered.
   *
   * Accepting a connection is the OS's work, not the broker's: a SIGSTOPped
   * process, or one blocked in a synchronous call, still has its listen backlog
   * answered for it. So a socket proves that a broker bound this path once, not
   * that one is running now — and "the socket accepted me" is exactly what
   * `attached to the broker` used to mean. A wedged broker was discovered only
   * by the first real call, which the caller paid for at the full timeout.
   */
  static async #verified(
    options: BrokerClientOptions,
    socket: Socket,
    spawnedPid: number | null,
  ): Promise<BrokerBackend | null> {
    const backend = new BrokerBackend(options, socket);
    backend.#spawnedPid = spawnedPid;
    if (await backend.#answers()) {
      const refused = await backend.#declare();
      if (refused === null) {
        options.log(
          `attached to the broker at ${options.address} for environment ` +
            `${options.flavour.digest}`,
        );
        return backend;
      }
      // Alive, but it will not take this session's environment — either it
      // predates the idea, or it rejected what we sent. Sharing anyway means its
      // kernels answering our calls under somebody else's settings: a private
      // kernel costs a seat, and that costs the caller a wrong answer they
      // cannot see.
      // The broker's own words, because "will not serve" covers two different
      // problems: one that predates the op answers `unknown broker op`, and one
      // that rejected what we sent says why. A user reading a single line needs
      // to be able to tell those apart.
      options.log(
        `the broker will not serve this session's kernel environment ` +
          `(${options.flavour.digest}): ${refused}; using a private kernel instead`,
      );
      await backend.stop();
      return null;
    }
    // No attempt to replace it: a wedged broker still holds the bound socket, so
    // a broker started here would find the address live and stand down, and this
    // would arrive at a private kernel anyway — one round trip later.
    options.log(
      `the broker at ${options.address} accepted a connection but did not answer; ` +
        "using a private kernel instead",
    );
    await backend.stop();
    return null;
  }

  /**
   * Ask the broker whether it is running, and take any answer as yes.
   *
   * The `ok` flag is ignored on purpose. A broker started before this op existed
   * answers `unknown broker op: ping`, and that refusal is still proof the
   * process is running and reading its socket, which is the entire question.
   * Reading it as a failure would send every session to a private kernel, and
   * cost the seat that buys, for as long as an older broker keeps serving — a
   * minute past the last detach at the very least, and in practice a whole
   * working session, since a broker serves the code it started with.
   */
  #answers(): Promise<boolean> {
    if (this.#closed || !this.#socket.writable) return Promise.resolve(false);
    const id = this.#nextId++;
    return new Promise<boolean>((resolve) => {
      // Not unref'd, for the reason `delay` is not: in `doctor` there is no
      // stdin holding the loop open, so an unref'd timer lets node exit
      // mid-probe and the await never settles.
      const timer = setTimeout(() => {
        this.#liveness.delete(id);
        resolve(false);
      }, PING_DEADLINE_MS);
      this.#liveness.set(id, (alive) => {
        clearTimeout(timer);
        resolve(alive);
      });
      this.#socket.write(encodeFrame({ id, op: "ping" }), (err) => {
        if (err) {
          this.#liveness.delete(id);
          clearTimeout(timer);
          resolve(false);
        }
      });
    });
  }

  /**
   * Tell the broker what this session's kernels must be started with.
   *
   * The values travel, not just their digest, because the broker is what starts
   * the kernel and its own environment belongs to whichever session spawned it.
   *
   * A broker that predates this refuses the op, and a refusal is not a failure
   * of the broker — it is the absence of the one thing needed to share safely,
   * so it is treated exactly like a rejection.
   */
  async #declare(): Promise<string | null> {
    const { flavour } = this.#options;
    try {
      const result = await this.#request<{ flavours?: boolean }>(
        "hello",
        { digest: flavour.digest, env: flavour.env, names: flavour.names },
        PING_DEADLINE_MS,
      );
      return result?.flavours === true ? null : "it did not accept the declaration";
    } catch (err) {
      return errorText(err);
    }
  }

  #attach(socket: Socket): void {
    socket.setEncoding("utf8");
    const reader = new FrameReader((raw) => this.#onFrame(raw as BrokerFrame));
    socket.on("data", (chunk: string) => reader.push(chunk));
    socket.on("close", () => this.#failAll(new Error("the Wolfram broker closed the connection")));
    socket.on("error", (err) => this.#failAll(err));
  }

  #onFrame(frame: BrokerFrame): void {
    if (isEvent(frame)) {
      if (frame.event === "shuttingDown") {
        // Sent by a broker on its way out. Acting on it means the next call
        // decides again rather than discovering the corpse by failing.
        this.#options.log("the broker is shutting down; will choose again");
        this.#closed = true;
        return;
      }
      if (frame.event === "progress") {
        this.#progress.get(frame.target)?.(frame.progress);
        return;
      }
      if (frame.event === "kernelReady") {
        // Answer from what the broker sent. Calling back through #request here
        // would re-enter the pool while the slot that raised the event is still
        // held, which grew the pool to the whole licence budget on one call.
        const { capabilities, tools, prompts } = frame;
        void this.#onKernelReady?.({
          capabilities: async () => capabilities,
          listTools: async (cursor) => (cursor ? this.listTools(cursor) : { tools }),
          listPrompts: async (cursor) =>
            cursor ? this.listPrompts(cursor) : { prompts: prompts ?? [] },
        });
      }
      return;
    }
    const response = frame;
    // Liveness first: any reply answers a ping, including a refusal, so it must
    // not reach #pending, which would read `ok: false` as a broken broker.
    const alive = this.#liveness.get(response.id);
    if (alive) {
      this.#liveness.delete(response.id);
      alive(true);
      return;
    }
    const waiter = this.#pending.get(response.id);
    if (!waiter) return;
    this.#pending.delete(response.id);
    if (response.ok) waiter.resolve(response.result);
    else waiter.reject(brokerError(response));
  }

  #failAll(err: Error): void {
    if (this.#closed) return;
    // Mark it closed: `usable()` is what tells DeferredBackend to decide again,
    // and without it every later call in the session failed identically.
    this.#closed = true;
    for (const [, waiter] of this.#pending) waiter.reject(err);
    this.#pending.clear();
    // A probe outstanding when the socket dies has its answer, and should not
    // sit out its deadline to hear it.
    for (const [, alive] of this.#liveness) alive(false);
    this.#liveness.clear();
  }

  /** False once the socket is gone or the broker stopped answering. */
  usable(): boolean {
    return !this.#closed && this.#socket.writable;
  }

  #request<T>(
    op: BrokerOp,
    params?: unknown,
    timeoutMs?: number,
    signal?: AbortSignal,
    onprogress?: (progress: Progress) => void,
  ): Promise<T> {
    if (this.#closed || !this.#socket.writable) {
      return Promise.reject(new Error("the Wolfram broker is not connected"));
    }
    const id = this.#nextId++;
    // Tested against undefined, not for truthiness. A ceiling of 0 means "no
    // ceiling" on a private kernel — `#awaitWithin` returns the work untouched
    // when `deadlineMs <= 0` — and a falsy test dropped it from the frame, so
    // the broker applied its own 300s default while `0 ?? DEFAULT` kept 0 here
    // and made the ceiling 2s. The same configuration therefore meant "wait as
    // long as it takes" privately and "give up after two seconds" when shared.
    //
    // Held as the broker's session will hold it, and so always a number. JSON
    // has no NaN: a NaN written into the frame arrived as null, which the broker
    // read as unset and replaced with its own default, five minutes for a call
    // where a private kernel waits the 24 days `deadlineDelay` holds it to.
    const sent = timeoutMs === undefined ? undefined : deadlineDelay(timeoutMs);
    const frame = {
      id,
      op,
      ...(params === undefined ? {} : { params }),
      ...(sent === undefined ? {} : { timeoutMs: sent }),
    };
    const ceiling = brokerCeilingMs(
      op,
      sent,
      this.#options.startTimeoutMs ?? DEFAULT_START_TIMEOUT_MS,
    );
    return new Promise<T>((resolve, reject) => {
      // No timer at all when there is no ceiling, so this waits exactly as long
      // as a private kernel would.
      const timer =
        ceiling === 0
          ? undefined
          : setTimeout(() => {
              this.#pending.delete(id);
              // A broker that has stopped answering is not coming back for this
              // session: give up on it so the next call can choose again.
              this.#closed = true;
              reject(
                new Error(`the Wolfram broker did not answer ${op} within ${budgetText(ceiling)}`),
              );
            }, timerDelay(ceiling));
      timer?.unref?.();
      const settle = {
        resolve: (v: unknown) => {
          clearTimeout(timer);
          this.#progress.delete(id);
          (resolve as (value: unknown) => void)(v);
        },
        reject: (e: Error) => {
          clearTimeout(timer);
          this.#progress.delete(id);
          reject(e);
        },
      };
      if (signal) {
        if (signal.aborted) {
          settle.reject(new Error("the call was cancelled before it was sent"));
          return;
        }
        signal.addEventListener(
          "abort",
          () => {
            // Tell the broker to stop, then stop waiting. The broker retires a
            // kernel that will not stop, so the next call gets a fresh one.
            if (this.#socket.writable) {
              this.#socket.write(encodeFrame({ id: this.#nextId++, op: "cancel", target: id }));
            }
            this.#pending.delete(id);
            settle.reject(new Error("the call was cancelled"));
          },
          { once: true },
        );
      }
      if (onprogress) this.#progress.set(id, onprogress);
      this.#pending.set(id, settle);
      this.#socket.write(encodeFrame(frame), (err) => {
        if (err) {
          this.#pending.delete(id);
          settle.reject(err);
        }
      });
    });
  }

  onKernelReady(handler: KernelReadyHandler): void {
    this.#onKernelReady = handler;
  }

  capabilities(): Promise<ServerCapabilities> {
    return this.#request<ServerCapabilities>("capabilities");
  }
  listTools(cursor?: string): Promise<ToolPage> {
    return this.#request<ToolPage>("listTools", cursor ? { cursor } : undefined);
  }
  listPrompts(cursor?: string): Promise<PromptPage> {
    return this.#request<PromptPage>("listPrompts", cursor ? { cursor } : undefined);
  }
  getPrompt(
    params: GetPromptRequest["params"],
    options?: EvaluationOptions,
  ): Promise<GetPromptResult> {
    return this.#request<GetPromptResult>("getPrompt", params, options?.timeoutMs, options?.signal);
  }
  listResources(params?: ListResourcesRequest["params"]): Promise<ListResourcesResult> {
    return this.#request<ListResourcesResult>("listResources", params);
  }
  readResource(
    params: ReadResourceRequest["params"],
    options?: EvaluationOptions,
  ): Promise<ReadResourceResult> {
    return this.#request<ReadResourceResult>(
      "readResource",
      params,
      options?.timeoutMs,
      options?.signal,
    );
  }
  callTool(params: CallToolRequest["params"], options: CallOptions): Promise<CallToolResult> {
    return this.#request<CallToolResult>(
      "callTool",
      params,
      options.timeoutMs,
      options.signal,
      options.onprogress,
    );
  }
  /**
   * Wait for the broker's own preparation — reading what its kernels need from
   * cache — within what the deadline has left. That work is the broker's,
   * shared with every session attached to it, so the deadline passing stops
   * only this session's wait; the broker finishes, and
   * serves whoever asks next.
   *
   * Deliberately not a pool request. This was `capabilities`, which queues for
   * a slot like any work, so a session arriving while every slot held a long
   * evaluation timed out here and was backed off for ten minutes from a
   * perfectly healthy broker. Waiting for a
   * slot is ordinary queueing, bounded by the call's own ceiling; a kernel the
   * broker starts for it is bounded by the broker's start timeout.
   */
  async awaitReady(deadline: Deadline): Promise<void> {
    const stage = "waiting for the shared broker to prepare";
    // Read once: a remainder of 0 would go out as a ceiling of 0, which means
    // none, and leave the request pending after the deadline had failed.
    const remainder = deadline.handOn(stage);
    // The request's own ceiling is the remainder plus the usual grace, so the
    // deadline is what fires — and a ceiling firing would also mark a broker
    // that is merely slow as dead.
    try {
      await deadline.within(stage, this.#request("ready", undefined, remainder));
    } catch (err) {
      // A broker older than the op: it is running and answering, and cannot
      // say more. Treated as ready, as the attach probe treats any reply.
      if (/unknown broker op/.test(errorText(err))) return;
      throw err;
    }
  }

  /**
   * Pool and licence state, for `doctor` and `wolfram_status`. The broker
   * answers from memory, so a caller that must not hang — the status tool is
   * what you ask when things are stuck — passes a ceiling of its own.
   */
  status(timeoutMs?: number): Promise<{
    kernels: number;
    busy: number;
    budget: number;
    licence: { maxProcesses: number | null; type: string | null } | null;
    connections: number;
    pid: number;
  }> {
    return this.#request("status", undefined, timeoutMs);
  }

  async stop(): Promise<void> {
    this.#closed = true;
    // Only this connection closes. The broker keeps its kernels for the other
    // proxies, and exits on its own once none are left.
    this.#socket.end();
    this.#socket.destroy();
  }
}
