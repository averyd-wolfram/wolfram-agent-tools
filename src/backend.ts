/**
 * The seam between the MCP server and whatever is actually running Wolfram.
 *
 * Two implementations:
 *   - LocalBackend  — this process owns a kernel (the original behaviour)
 *   - BrokerBackend — a shared broker owns a pool of kernels, and this process
 *                     is one of several talking to it over a socket
 *
 * Kernels are licence-limited: a typical licence permits 2 or 4 concurrent
 * kernels, so one agent session plus an open Mathematica window can already
 * exhaust it. That is the whole reason the broker exists.
 */
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type {
  CallToolRequest,
  CallToolResult,
  GetPromptRequest,
  GetPromptResult,
  ListPromptsResult,
  ListResourcesRequest,
  ListResourcesResult,
  ListToolsResult,
  ReadResourceRequest,
  ReadResourceResult,
  Progress,
  ServerCapabilities,
} from "@modelcontextprotocol/sdk/types.js";
import { BrokerBackend, type BrokerClientOptions } from "./broker-client.js";
import { brokerAddress } from "./broker-protocol.js";
import { DEFAULT_START_TIMEOUT_MS, type Config } from "./config.js";
import { doctorCommand } from "./doctor.js";
import { installationEnv, recordFacts, type KernelFacts } from "./inspect.js";
import {
  Backoff,
  candidateIdentity,
  Deadline,
  MIN_START_MS,
  NOT_RESOLVED_ADVICE,
  NOT_RESOLVED_BACKOFF_MS,
  PreparationStopped,
  PreparationTimeout,
  PREPARATION_BACKOFF_MS,
  type BackoffState,
  type CandidateIdentity,
} from "./prepare.js";
import {
  drainPages,
  HandshakeTimeout,
  isServerNotResolved,
  KernelSession,
  listAllTools,
} from "./kernel.js";
import { elapsedText, waitText } from "./duration.js";
import type { KernelInstall } from "./locate.js";
import { errorText, type Logger } from "./log.js";
import { PKG } from "./version.js";

export type ToolPage = ListToolsResult;
export type PromptPage = ListPromptsResult;

/**
 * Read-only upstream access for use *inside* a kernel-ready hook.
 *
 * The hook runs while the kernel is already held, so it must not go back
 * through the queue that is holding it — doing so deadlocks. These methods
 * bypass queueing; nothing else may use them.
 */
export interface DirectOps {
  capabilities(): Promise<ServerCapabilities>;
  listTools(cursor?: string): Promise<ToolPage>;
  listPrompts(cursor?: string): Promise<PromptPage>;
}

export type KernelReadyHandler = (ops: DirectOps) => void | Promise<void>;

/**
 * How a request the kernel evaluates is to be run: a tool call, a prompt or a
 * resource read, which are alike in every way this server can see.
 */
export interface EvaluationOptions {
  /**
   * The call ceiling, the same for a prompt and a resource read as for a tool
   * call: a prompt runs its own function in the kernel — the paclet's built-in
   * prompts run the same searches as its context tools — so it can take as
   * long. A deadline for the caller, not the kernel (`KernelSession.#fate`).
   */
  timeoutMs: number;
  /**
   * Aborts the request, and tells the kernel to stop if it can. A client
   * pressing Escape used to leave the kernel working: the request was abandoned
   * at the proxy while the evaluation ran on, so the next call queued behind
   * work nobody was waiting for — measured at 9877ms for a call that should
   * have taken 5000. A prompt ignored it until it waited as long as a call
   * (#39), and would then have held the kernel for the whole ceiling.
   */
  signal?: AbortSignal | undefined;
}

/** How a single tool call is to be run. */
export interface CallOptions extends EvaluationOptions {
  /**
   * Relays the kernel's progress to the caller. It does not extend the
   * deadline, which is the session's: progress once reset the SDK's own
   * timeout, which since #34 cannot fire first, so resetting it bounded nothing
   * (#40). Measured, AgentTools sends no progress at all.
   */
  onprogress?: ((progress: Progress) => void) | undefined;
}

export interface KernelBackend {
  readonly kind: "local" | "broker" | "deferred";
  /** Upstream capabilities, as reported by a live kernel. */
  capabilities(): Promise<ServerCapabilities>;
  listTools(cursor?: string): Promise<ToolPage>;
  listPrompts(cursor?: string): Promise<PromptPage>;
  /** Without `options`, the session's default minute (`DEFAULT_DEADLINE_MS`). */
  getPrompt(
    params: GetPromptRequest["params"],
    options?: EvaluationOptions,
  ): Promise<GetPromptResult>;
  listResources(params?: ListResourcesRequest["params"]): Promise<ListResourcesResult>;
  /** Without `options`, the session's default minute (`DEFAULT_DEADLINE_MS`). */
  readResource(
    params: ReadResourceRequest["params"],
    options?: EvaluationOptions,
  ): Promise<ReadResourceResult>;
  callTool(params: CallToolRequest["params"], options: CallOptions): Promise<CallToolResult>;
  /**
   * Registers a handler to run whenever a freshly started kernel becomes
   * available, so cached capability lists can be revalidated. Nothing else can
   * notice that the Wolfram/AgentTools paclet was upgraded underneath us.
   */
  onKernelReady(handler: KernelReadyHandler): void;
  /**
   * False once this backend can never serve again — a broker whose socket has
   * closed, or which stopped answering. `DeferredBackend` drops a backend that
   * says this and decides again, which is what makes "sharing is an
   * optimisation, never a dependency" true after `open()` and not just during
   * it. Backends that cannot fail this way may leave it undefined.
   */
  usable?(): boolean;
  /**
   * Bring this backend to the point where a request reaches a kernel, within
   * `deadline` — the last stage of a preparation `DeferredBackend` runs.
   * Backends that need no such step may leave it undefined.
   */
  prepare?(deadline: Deadline): Promise<void>;
  /** A failed preparation still being waited out, for `wolfram_status`. */
  backoff?(): BackoffState | null;
  /**
   * The backend a deferred one chose, once it has — for `wolfram_status`, which
   * must describe the kernel this session actually uses, not the setting.
   */
  readonly resolved?: KernelBackend | null;
  stop(): Promise<void>;
}

/** One kernel, owned by this process. */
export class LocalBackend implements KernelBackend {
  readonly kind = "local" as const;
  readonly #session: KernelSession;
  #onReady: KernelReadyHandler | undefined;

  constructor(options: {
    bin: string;
    serverName: string;
    idleMs: number;
    startTimeoutMs: number;
    clientInfo: { name: string; version: string };
    log: Logger;
    extraEnv?: Record<string, string> | undefined;
    onFacts?: ((facts: KernelFacts, chosen: string[]) => void) | undefined;
  }) {
    this.#session = new KernelSession({
      ...options,
      onReady: async (client: Client) => {
        // The raw client, deliberately: this runs inside the queue.
        await this.#onReady?.({
          capabilities: async () => client.getServerCapabilities() ?? {},
          listTools: (cursor) => client.listTools(cursor ? { cursor } : undefined),
          listPrompts: (cursor) => client.listPrompts(cursor ? { cursor } : undefined),
        });
      },
    });
  }

  onKernelReady(handler: KernelReadyHandler): void {
    this.#onReady = handler;
  }

  /**
   * Start the kernel within what the deadline has left. Its own handshake
   * timer gets that remainder, so on expiry it tears the kernel down through
   * the transport as any failed start does: this kernel is ours to stop.
   *
   * Must be the first call on this backend, as `DeferredBackend` guarantees:
   * it builds a fresh one per preparation and lets nothing reach it until this
   * returns. A start already under way would be joined, and it runs on the
   * configured timeout, so its expiry would be reported as the deadline's.
   */
  async prepare(deadline: Deadline): Promise<void> {
    // Read once, and not spent on a start too short to succeed.
    const remainder = deadline.handOn("starting the kernel", MIN_START_MS);
    // A beat of grace, so the handshake's own timer fires first: its error
    // carries the kernel's last output, which names the actual cause. That
    // timer is the deadline's remainder, so its expiry is the deadline's.
    await deadline.within(
      "starting the kernel",
      this.#session.ensure(remainder),
      undefined,
      1_000,
      (err) => err instanceof Error && err.cause instanceof HandshakeTimeout,
    );
  }

  async capabilities(): Promise<ServerCapabilities> {
    return this.#session.run(async (client: Client) => client.getServerCapabilities() ?? {});
  }

  /**
   * The whole list, drained inside one hold on the kernel.
   *
   * The cursor argument is kept for the interface's sake and deliberately
   * ignored: a cursor is paging state belonging to one kernel, and on the shared
   * path the pool hands out whichever kernel is free, so relaying one could ask
   * page 2 of a kernel that never issued page 1. Both backends therefore answer
   * complete lists and neither ever returns a `nextCursor`.
   */
  async listTools(): Promise<ToolPage> {
    return { tools: await this.#session.run((c, request) => listAllTools(c, request)) };
  }

  async listPrompts(): Promise<PromptPage> {
    const prompts = await this.#session.run((c, request) =>
      drainPages(async (cursor) => {
        const page = await c.listPrompts(cursor ? { cursor } : undefined, request);
        return { items: page.prompts ?? [], nextCursor: page.nextCursor };
      }),
    );
    return { prompts };
  }

  async getPrompt(
    params: GetPromptRequest["params"],
    options?: EvaluationOptions,
  ): Promise<GetPromptResult> {
    return this.#session.run((c, request) => c.getPrompt(params, request), {
      deadlineMs: options?.timeoutMs,
      signal: options?.signal,
    });
  }

  async listResources(params?: ListResourcesRequest["params"]): Promise<ListResourcesResult> {
    return this.#session.run((c, request) => c.listResources(params, request));
  }

  async readResource(
    params: ReadResourceRequest["params"],
    options?: EvaluationOptions,
  ): Promise<ReadResourceResult> {
    return this.#session.run((c, request) => c.readResource(params, request), {
      deadlineMs: options?.timeoutMs,
      signal: options?.signal,
    });
  }

  async callTool(params: CallToolRequest["params"], options: CallOptions): Promise<CallToolResult> {
    // `timeoutMs` goes to the session as a deadline, deliberately not to the SDK
    // as a request timeout: the SDK's timeout cancels the request and forgets
    // it, discarding the kernel's eventual reply, which is the only proof of
    // life this server can get from a kernel that answers nothing while it
    // computes. See KernelSession.#fate. The session's `request` carries the
    // signal, and an SDK timeout that cannot fire first (#34).
    return this.#session.run(
      (c, request) =>
        c.callTool(params, undefined, {
          ...request,
          ...(options.onprogress ? { onprogress: options.onprogress } : {}),
        }),
      { deadlineMs: options.timeoutMs, signal: options.signal },
    ) as Promise<CallToolResult>;
  }

  async stop(): Promise<void> {
    await this.#session.stop();
  }
}

/**
 * Defers choosing a backend until something actually needs a kernel.
 *
 * Deciding between a shared broker and a private kernel means connecting to a
 * socket, and possibly spawning a broker. Doing that at startup would undo the
 * whole point of this server, which is that `initialize` and `tools/list` cost
 * nothing. So the choice is made on first real use and then held.
 */
export interface DeferredOptions {
  /** The whole preparation's budget: `WOLFRAM_MCP_START_TIMEOUT_SECONDS`. */
  startTimeoutMs?: number;
  /** The kernel binary, whose identity keys the back-off. */
  bin?: string;
  /** For the suite, which cannot wait ten minutes for a window to pass. */
  clock?: () => number;
  backoffMs?: number;
}

export class DeferredBackend implements KernelBackend {
  readonly kind = "deferred" as const;
  readonly #factory: (deadline: Deadline) => Promise<KernelBackend>;
  readonly #log: Logger | undefined;
  readonly #startTimeoutMs: number;
  readonly #bin: string | undefined;
  readonly #clock: () => number;
  readonly #backoff: Backoff;
  #resolved: KernelBackend | null = null;
  #resolving: Promise<KernelBackend> | null = null;
  /**
   * The backend a preparation has made and not yet handed over. `stop()` has
   * to reach it: during a private handshake the kernel is already running and
   * `#resolved` is still null, so stopping only the resolved backend left that
   * kernel to finish starting and keep its seat after the server had stopped.
   */
  #preparing: KernelBackend | null = null;
  /** Ends the preparation in flight, from inside whichever stage it is in. */
  #abort: AbortController | null = null;
  #stopped = false;
  #onReady: KernelReadyHandler | undefined;

  constructor(
    factory: (deadline: Deadline) => Promise<KernelBackend>,
    log?: Logger,
    options: DeferredOptions = {},
  ) {
    this.#factory = factory;
    this.#log = log;
    this.#startTimeoutMs = options.startTimeoutMs ?? DEFAULT_START_TIMEOUT_MS;
    this.#bin = options.bin;
    this.#clock = options.clock ?? Date.now;
    this.#backoff = new Backoff(options.backoffMs ?? PREPARATION_BACKOFF_MS, this.#clock);
  }

  /** The backend actually in use, once one has been chosen. */
  get resolved(): KernelBackend | null {
    return this.#resolved;
  }

  #identity(): CandidateIdentity | null {
    return this.#bin === undefined ? null : candidateIdentity(this.#bin);
  }

  backoff(): BackoffState | null {
    return this.#backoff.current(this.#identity());
  }

  async #get(): Promise<KernelBackend> {
    // A backend that has died is worse than no backend: holding it made every
    // later call in the session fail identically, with no way back short of
    // restarting the MCP client.
    if (this.#resolved && this.#resolved.usable?.() === false) {
      this.#log?.("the chosen backend is gone; deciding again");
      const dead = this.#resolved;
      this.#resolved = null;
      void dead.stop().catch(() => {});
    }
    if (this.#resolved) return this.#resolved;
    if (this.#stopped) throw new PreparationStopped();
    // Before joining an attempt in flight, not after: a call arriving during
    // the back-off is answered at once rather than spending the seat and the
    // whole deadline to fail the same way.
    const waiting = this.backoff();
    if (waiting) {
      throw new Error(
        `the last attempt to prepare a Wolfram kernel failed ` +
          `${elapsedText(this.#clock() - waiting.failedAt)} ago, so this one was not made. ` +
          `It is retried in ${waitText(waiting.remainingMs)}` +
          (waiting.advice
            ? `; ${waiting.advice}.`
            : `, or as soon as the installation changes. For a full report, run ${doctorCommand()}.`) +
          // Last, and set apart: a reason can run to several lines of kernel
          // output and end in a sentence of its own, so spliced into this one
          // it read "try again.. For a full report", burying the pointer.
          `\n\nThe failure was: ${waiting.reason}`,
      );
    }
    this.#resolving ??= this.#prepare().then(
      (backend) => {
        this.#resolved = backend;
        this.#resolving = null;
        return backend;
      },
      (err: unknown) => {
        // Cleared so a later attempt may run — but not the very next call: the
        // failure is recorded first, and that call meets the back-off.
        this.#resolving = null;
        if (err instanceof PreparationStopped) throw err;
        // A server name that does not resolve is fixed by creating the server
        // or installing its paclet, which the back-off cannot see: the full
        // window held that fix off for ten minutes (issue #5). So it gets a
        // short one, which still spares a seat on every call meanwhile.
        const unresolved = isServerNotResolved(err);
        this.#backoff.record(
          this.#identity(),
          err,
          unresolved ? NOT_RESOLVED_BACKOFF_MS : undefined,
          // Not the installation: the doctor and an install change point
          // the user at the wrong thing.
          unresolved ? NOT_RESOLVED_ADVICE : undefined,
        );
        this.#log?.(
          `preparation failed; not retrying for ${waitText(this.#backoffWindow())}: ${errorText(err)}`,
        );
        throw err;
      },
    );
    return this.#resolving;
  }

  #backoffWindow(): number {
    return this.#backoff.current(this.#identity())?.remainingMs ?? 0;
  }

  /**
   * One preparation under one deadline: the factory (inspection, broker
   * attach), then the chosen backend's own `prepare` (the broker's
   * preparation, or the kernel handshake). The ready handler is attached
   * first, because a kernel started here refreshes the cache through it.
   */
  async #prepare(): Promise<KernelBackend> {
    this.#abort = new AbortController();
    const deadline = new Deadline(this.#startTimeoutMs, this.#clock, this.#abort.signal);
    const backend = await this.#factory(deadline);
    this.#preparing = backend;
    try {
      // Checked at both ends: stop() may land while the factory was still
      // inspecting, before there was a backend to reach.
      if (this.#stopped) throw new PreparationStopped();
      if (this.#onReady) backend.onKernelReady(this.#onReady);
      await backend.prepare?.(deadline);
      if (this.#stopped) throw new PreparationStopped();
    } catch (err) {
      await backend.stop().catch(() => {});
      throw err;
    } finally {
      this.#preparing = null;
    }
    return backend;
  }

  onKernelReady(handler: KernelReadyHandler): void {
    this.#onReady = handler;
    this.#resolved?.onKernelReady(handler);
  }

  async capabilities(): Promise<ServerCapabilities> {
    return (await this.#get()).capabilities();
  }
  async listTools(cursor?: string): Promise<ToolPage> {
    return (await this.#get()).listTools(cursor);
  }
  async listPrompts(cursor?: string): Promise<PromptPage> {
    return (await this.#get()).listPrompts(cursor);
  }
  async getPrompt(
    params: GetPromptRequest["params"],
    options?: EvaluationOptions,
  ): Promise<GetPromptResult> {
    return (await this.#get()).getPrompt(params, options);
  }
  async listResources(params?: ListResourcesRequest["params"]): Promise<ListResourcesResult> {
    return (await this.#get()).listResources(params);
  }
  async readResource(
    params: ReadResourceRequest["params"],
    options?: EvaluationOptions,
  ): Promise<ReadResourceResult> {
    return (await this.#get()).readResource(params, options);
  }
  async callTool(params: CallToolRequest["params"], options: CallOptions): Promise<CallToolResult> {
    return (await this.#get()).callTool(params, options);
  }
  async stop(): Promise<void> {
    this.#stopped = true;
    // The factory's stages — the broker attach and wait — race this
    // signal, so a stop reaches them before they have produced a backend.
    this.#abort?.abort();
    await Promise.all([this.#preparing?.stop(), this.#resolved?.stop()]);
    // Returns once the preparation has wound down, so a caller that awaits
    // stop() knows nothing it started is still holding a seat — but bounded,
    // because a backend that ignored its stop must not hang the shutdown of
    // the process it lives in.
    const resolving = this.#resolving;
    if (resolving) {
      let timer: NodeJS.Timeout | undefined;
      await Promise.race([
        resolving.catch(() => {}),
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, 5_000);
          timer.unref?.();
        }),
      ]);
      clearTimeout(timer);
    }
  }
}

/**
 * The CLI's backend, for anyone embedding the server: the broker-or-private
 * policy, deferred to the first real request, under one preparation deadline
 * of the configured length, with the back-off keyed on this installation.
 *
 * One function rather than a recipe, because a recipe goes wrong where it is
 * written down: `new DeferredBackend(() => createBackend(...))` is what
 * TypeScript accepts, and it runs preparation under a hard-coded 120s with no
 * binary to key the back-off on.
 */
export function deferredBackend(
  config: Config,
  install: KernelInstall,
  log: Logger,
  // The clock and back-off window, for a suite that must not hand-build the
  // wiring this function exists to own. The budget and binary always come from
  // the configuration and the installation.
  overrides: Pick<DeferredOptions, "clock" | "backoffMs"> = {},
): DeferredBackend {
  return new DeferredBackend((deadline) => createBackend(config, install, log, deadline), log, {
    ...overrides,
    startTimeoutMs: config.startTimeoutMs,
    bin: install.bin,
  });
}

/**
 * How to reach, or start, the broker for this kernel and server name.
 *
 * Shared so that `createBackend` and `doctor` cannot drift apart: they must
 * spawn the same broker, or `doctor` reports on one the server never uses.
 *
 * The broker inherits the knobs, but must never inherit `share` — it is the
 * thing being shared, and a broker that tried to attach to a broker would
 * recurse.
 */
export function brokerLaunch(
  config: Config,
  install: KernelInstall,
  log: Logger,
): BrokerClientOptions {
  const address = brokerAddress(install.bin);
  return {
    address,
    // Shared with doctor so the two cannot disagree about which broker, or which
    // kind of kernel, this configuration wants.
    flavour: config.flavour,
    spawnCommand: process.execPath,
    spawnArgs: [process.argv[1] ?? "", "broker", "--address", address, "--kernel", install.bin],
    spawnEnv: { ...process.env, WOLFRAM_MCP_SHARE: "0", MCP_SERVER_NAME: config.serverName },
    log,
    startTimeoutMs: config.startTimeoutMs,
  };
}

/**
 * Pick the backend for an installation: a shared broker when sharing is on and
 * one can be reached, a private kernel otherwise.
 *
 * Kernels are licence-limited — a typical licence permits 2 or 4 concurrent
 * kernels, so one session per kernel will lock the user out of their own
 * Mathematica. Falling back to a private kernel whenever the broker cannot be
 * reached keeps sharing an optimisation rather than a dependency.
 *
 * Wrap the result in a `DeferredBackend` to keep `initialize` and a cached
 * `tools/list` free of any kernel work.
 */
export async function createBackend(
  config: Config,
  install: KernelInstall,
  log: Logger,
  deadline: Deadline = new Deadline(config.startTimeoutMs),
): Promise<KernelBackend> {
  // WOLFRAM_BASE / WOLFRAM_USERBASE / WOLFRAM_LOCALBASE, mirroring what
  // Wolfram's own generated configuration sets, from what an earlier kernel
  // reported. Nothing is probed for them any more (plugin plan D20): a kernel
  // with none inherits the environment they would have been computed in, and
  // reports them for next time.
  //
  // Only computed for a kernel this process is about to own; a broker works
  // out its own.
  const local = async () => {
    const extraEnv = installationEnv(install.bin, config.inspect);
    return new LocalBackend({
      bin: install.bin,
      serverName: config.serverName,
      idleMs: config.idleMs,
      startTimeoutMs: config.startTimeoutMs,
      clientInfo: { name: PKG.name, version: PKG.version },
      log,
      extraEnv,
      onFacts: (facts, chosen) => {
        if (config.inspect) recordFacts(install.bin, facts, chosen, log);
      },
    });
  };

  if (!config.share) {
    log("kernel sharing disabled; using a private kernel");
    return local();
  }

  // Attaching may spawn a broker, which is shared and is left to run; a
  // connection that arrives after the deadline is ours, and is closed.
  const broker = await deadline.within(
    "attaching to the shared broker",
    BrokerBackend.open(brokerLaunch(config, install, log)),
    (late) => void late?.stop(),
  );
  if (!broker) return local();

  // The broker's own preparation is waited for here, inside the choice, and
  // not in a prepare() DeferredBackend calls after it: a broker that drops its
  // socket or refuses mid-wait is a broker failure, and sharing is never a
  // dependency — so it falls back to a private kernel under the same deadline.
  // From DeferredBackend it was recorded as a failed preparation, and the
  // session sat out a ten-minute back-off instead. A deadline that has run out
  // is still a failure: a private kernel started with no time left would only
  // spend a second seat to fail.
  try {
    await broker.awaitReady(deadline);
    return broker;
  } catch (err) {
    await broker.stop().catch(() => {});
    // A stopped server is not a broker failure: falling back would start the
    // very kernel the stop was meant to prevent.
    if (err instanceof PreparationTimeout || err instanceof PreparationStopped) throw err;
    log(`the broker failed while preparing (${errorText(err)}); using a private kernel`);
    return local();
  }
}
