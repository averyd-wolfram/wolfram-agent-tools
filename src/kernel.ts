/**
 * Lifecycle manager for the Wolfram kernel behind the proxy.
 *
 *  - lazy start: no kernel until a request actually needs one
 *  - idle shutdown: killed again after a configurable quiet period
 *  - serialization: a kernel evaluates one expression at a time, so requests
 *    are queued rather than interleaved
 *  - bounded start: an unactivated Wolfram Engine waits for credentials on
 *    stdin, which is also the protocol channel, so startup is timed out
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  ErrorCode,
  McpError,
  PromptListChangedNotificationSchema,
  ToolListChangedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { FilteringStdioTransport } from "./transport.js";
import { applyFlavour, type KernelFlavour } from "./flavour.js";
import { FACTS_EXPRESSION, isFactsLine, parseFacts, type KernelFacts } from "./inspect.js";
import { budgetText, errorText, type Logger } from "./log.js";

/**
 * Wolfram/AgentTools' own `$defaultCommandLineArguments`, verbatim — pinned by
 * `kernel-args-match-src-kernel-ts` in the `.wlt`. `MCP_SERVER_NAME` in the
 * environment is what selects the serverName: `StartMCPServer[]` reads it
 * itself, so the serverName is never injected into this expression.
 */
export const PACLET_KERNEL_ARGS: readonly string[] = [
  "-run",
  'PacletSymbol["Wolfram/AgentTools","Wolfram`AgentTools`StartMCPServer"][]',
  "-noinit",
  "-noprompt",
];

/** The paclet's start expression, without the call: it loads AgentTools. */
const LOAD_AGENTTOOLS = 'PacletSymbol["Wolfram/AgentTools","Wolfram`AgentTools`StartMCPServer"]';

/**
 * What a kernel is actually started with: the paclet's command line, with the
 * installation's facts written first (plugin plan D20). The load comes before
 * the facts so their AgentTools version is the one about to serve — measured
 * on 15.0.0, the load is where the paclet manager replaced the bundled 2.1.17
 * with 2.2.0 — and the paclet's own expression then runs unchanged. Reporting
 * here is what lets a cold machine start one kernel rather than a probe and
 * then this one.
 */
export const KERNEL_ARGS: readonly string[] = [
  "-run",
  `${LOAD_AGENTTOOLS};${FACTS_EXPRESSION};${PACLET_KERNEL_ARGS[1]}`,
  ...PACLET_KERNEL_ARGS.slice(2),
];

/**
 * Raised when the caller's deadline passes with the request still outstanding.
 *
 * Distinct from every other failure because it is the only one that says nothing
 * about the kernel: see `KernelSession.#fate`.
 */
export class DeadlineExceeded extends Error {
  constructor(deadlineMs: number) {
    super(`no answer from the Wolfram kernel within ${budgetText(deadlineMs)}`);
    this.name = "DeadlineExceeded";
  }
}

/**
 * Raised when a start's handshake runs out of its own time, carrying that time.
 *
 * Typed so that a caller which set that time from a larger budget can report the
 * expiry as that budget's: `LocalBackend.prepare` hands the handshake what its
 * preparation deadline has left, but the two timers read different clocks, and
 * the handshake's could fire first by a millisecond, escaping as a bare error
 * that named neither the stage nor the setting to raise.
 */
export class HandshakeTimeout extends Error {
  readonly timeoutMs: number;
  constructor(timeoutMs: number) {
    super(
      `The Wolfram kernel did not complete MCP initialization within ` +
        `${budgetText(timeoutMs)}. Common causes: the ` +
        `Wolfram/AgentTools paclet is missing or is being downloaded, the ` +
        `selected kernel predates AgentTools support, or an unactivated ` +
        `Wolfram Engine is waiting for credentials on stdin, which cannot ` +
        `be answered here.`,
    );
    this.name = "HandshakeTimeout";
    this.timeoutMs = timeoutMs;
  }
}

/** The SDK's own timeout, for ops this server gives no deadline of its own. */
// Widened to number once: the SDK types McpError.code as a number while
// ErrorCode is the enum of its values, and comparing them raw is an unsafe mix.
const REQUEST_TIMEOUT: number = ErrorCode.RequestTimeout;
function isRequestTimeout(err: unknown): boolean {
  return err instanceof McpError && err.code === REQUEST_TIMEOUT;
}

/** How a single unit of work is to be run. */
export interface RunOptions {
  /**
   * How long the caller will wait. Not a timeout on the request: when it passes
   * the caller is answered and the request is left outstanding on purpose.
   */
  deadlineMs?: number | undefined;
  /** Fires when the caller cancels, which is the one case that kills a kernel. */
  signal?: AbortSignal | undefined;
}

/** A call nobody is waiting for any more, still outstanding on the kernel. */
interface AbandonedWork {
  settled: boolean;
  done?: Promise<void>;
}

/**
 * The kernel's own words for a `MCP_SERVER_NAME` it cannot serve.
 *
 * Whatever the cause — no server of that name, a paclet that is not installed,
 * has no AgentTools extension or lacks the server, a server file that will not
 * read — `MCPServerObject[name]` fails, `StartMCPServer` is then handed that
 * failure, matches no definition of its own, and says so as
 * `StartMCPServer::InvalidArguments`, quoting the cause. Measured on a 15.0
 * kernel with AgentTools 2.2.7: the cause, then that line, then the kernel's
 * REPL, which reads the client's JSON as Wolfram Language. So
 * `StartMCPServer::InvalidArguments` is the one signal that no server is
 * coming, whatever the cause; `MCPServerNotFound` is kept for a kernel that
 * printed only the cause. A list of the causes' own message names missed some
 * and named two the start path never raises (issue #5). Not any
 * `StartMCPServer::` message: a symbol of that name defined elsewhere makes the
 * kernel print `StartMCPServer::shdw` and then serve normally (issue #5).
 *
 * Watched for because such a kernel does not exit, so the only thing that ever
 * ended the wait was the start timeout, for an answer the kernel gave in its
 * first second. `resolveServerName` used to avoid the wait by refusing any name
 * it did not recognise, which silently substituted a different server for every
 * user-defined one. Pinned by `server-not-found-message-is-what-we-watch-for`
 * and `an-unresolvable-server-says-so-from-StartMCPServer` in the `.wlt`.
 */
const SERVER_NOT_FOUND =
  /StartMCPServer::InvalidArguments|MCPServerNotFound|No MCPServerObject found for name/;

/**
 * A start that ended because the kernel could not start its MCP server.
 *
 * Typed because it is not a failure of the installation: it is fixed by
 * creating the server or installing its paclet, neither of which changes the
 * kernel binary a preparation's back-off is keyed on, so it must start none.
 */
export class ServerNotResolved extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServerNotResolved";
  }
}

/** Whether `err`, or anything it was wrapped around, is a `ServerNotResolved`. */
export function isServerNotResolved(err: unknown): boolean {
  for (let e: unknown = err; e instanceof Error; e = e.cause) {
    if (e instanceof ServerNotResolved) return true;
  }
  return false;
}

/** How far past a start's own handshake timer the SDK's request timeout is set. */
const HANDSHAKE_SDK_GRACE_MS = 1_000;

export interface KernelSessionOptions {
  bin: string;
  serverName: string;
  idleMs: number;
  startTimeoutMs: number;
  clientInfo: { name: string; version: string };
  log: Logger;
  /**
   * Extra environment for the kernel. Used for WOLFRAM_BASE / WOLFRAM_USERBASE
   * / WOLFRAM_LOCALBASE, which Wolfram's own generated client configuration sets
   * explicitly: a client launches us with a sparse environment, and a kernel
   * that computes the wrong user base cannot find the AgentTools paclet.
   */
  extraEnv?: Record<string, string> | undefined;
  /**
   * What this kernel must be started with, when it is being started on behalf of
   * a session other than this process. Unset means this process's own
   * environment is already the right one, which is true of a private kernel.
   */
  flavour?: KernelFlavour | undefined;
  /**
   * Run once against every freshly started kernel, before it is handed to
   * callers. Used to re-read the upstream capability lists. Throwing here is
   * logged and ignored: a bookkeeping failure must not fail the tool call that
   * triggered the start.
   */
  onReady?: (client: Client) => Promise<void>;
  /**
   * What the kernel reported, once per start, before its server is up, and
   * which `SHAPING_VARS` its environment chose. Only a report that chose none
   * describes the installation; whoever owns the kernel decides what to keep,
   * and a pool also re-derives its budget from it.
   */
  onFacts?: (facts: KernelFacts, chosen: string[]) => void;
}

/**
 * The licence manager's words for a kernel with no activation — measured on
 * 15.0.0 started with a user base holding no `mathpass`. Such a kernel does not
 * wait for credentials: it prints this and exits 70, so the failure is fast,
 * but the words alone never said "not activated", and a user was left to guess
 * that the setup skill's activation step was the fix.
 */
const NOT_ACTIVATED = /No valid password found/;

/**
 * The variables that make a kernel's report its configuration's rather than its
 * installation's: the three directories, the cloud base, and `WOLFRAMINIT`,
 * which can carry a licence entitlement.
 *
 * A kernel reports what it was started with, and a session may set these
 * itself. Taken as the installation's own, one session's `WOLFRAM_USERBASE`
 * became every later kernel's in the pool, and its paclet version and account —
 * which come from that user base and cloud base — were cached for every
 * session's `wolfram_status`.
 */
export const SHAPING_VARS = [
  "WOLFRAM_BASE",
  "WOLFRAM_USERBASE",
  "WOLFRAM_LOCALBASE",
  "WOLFRAM_CLOUDBASE",
  "WOLFRAMINIT",
] as const;

/**
 * Which of `SHAPING_VARS` this kernel's environment chose. In a broker the
 * flavour says, since `applyFlavour` removes whatever it leaves unset; a private
 * kernel has this process's own environment.
 */
function chosenShaping(flavour: KernelFlavour | undefined): string[] {
  return SHAPING_VARS.filter((name) =>
    Boolean((flavour ? flavour.env[name] : process.env[name])?.trim()),
  );
}

/**
 * Attach recent kernel output to an error, so the cause is visible to the user.
 *
 * Always a plain `Error`: an `McpError` from the handshake must not reach the
 * proxy as one, where it would become a protocol error rather than a failed
 * call. The original rides along as `cause`, so a caller can still tell a
 * handshake timeout from any other failure.
 */
function withKernelOutput(err: unknown, output: string[]): Error {
  const message = errorText(err);
  // The facts line is this server's own bookkeeping, not something the kernel
  // said about the failure.
  const recent = output.filter((line) => !isFactsLine(line));
  if (recent.length === 0) return new Error(message, { cause: err });
  const tail = recent.map((line) => `  ${line}`).join("\n");
  // No doctor command here: on the shared path this runs in the broker, whose
  // launch context is not the caller's, so it could name the wrong one.
  const hint = recent.some((line) => NOT_ACTIVATED.test(line))
    ? "\n\nThis kernel is not activated. Activate it, by opening Wolfram once and " +
      "signing in or with `wolframscript -activate` in a terminal, then try again."
    : "";
  return new Error(`${message}\n\nLast output from the kernel:\n${tail}${hint}`, { cause: err });
}

export class KernelSession {
  readonly #options: KernelSessionOptions;
  #client: Client | null = null;
  #transport: FilteringStdioTransport | null = null;
  #starting: Promise<Client> | null = null;
  /**
   * A kernel mid-handshake, and how to end that handshake. `#transport` is set
   * only once the handshake succeeds, so `stop()` used to find nothing to close
   * while a kernel was starting — and the kernel kept its licence seat until
   * the handshake finished or timed out.
   */
  #handshaking: { transport: FilteringStdioTransport; abort: (error: Error) => void } | null = null;
  #queue: Promise<unknown> = Promise.resolve();
  /** Verdict in flight for the last failure, if any. */
  #deciding: Promise<boolean> | null = null;
  /** Work left running that nobody is waiting for. */
  #abandoned: AbandonedWork | null = null;
  #idleTimer: NodeJS.Timeout | null = null;

  constructor(options: KernelSessionOptions) {
    this.#options = options;
  }

  get running(): boolean {
    return this.#client !== null;
  }

  async #spawn(startTimeoutMs = this.#options.startTimeoutMs): Promise<Client> {
    const { bin, log, clientInfo, flavour } = this.#options;
    // What this kernel will actually be, which is the flavour's when there is
    // one: a broker's own option is only a default.
    const serverName = flavour?.env["MCP_SERVER_NAME"] ?? this.#options.serverName;

    // Abandon the handshake the moment the child dies, rather than waiting out
    // the start timeout for an error we already know about.
    let reportFatal!: (error: Error) => void;
    const fatal = new Promise<never>((_, reject) => {
      reportFatal = reject;
    });
    void fatal.catch(() => {});

    const transport = new FilteringStdioTransport({
      command: bin,
      args: [...KERNEL_ARGS],
      // Layered, and the order is load-bearing. The probe's values are the
      // floor; this process's environment beats them, because an explicit
      // WOLFRAM_USERBASE is a deliberate choice and not something to overwrite
      // with a probe result. The flavour then beats *that*, and removes the
      // names it leaves unset — because in a broker this process's environment
      // belongs to whichever session spawned it, and letting it show through is
      // how one project's MCP_TOOL_OPTIONS came to run another project's calls.
      env: {
        ...this.#options.extraEnv,
        ...(flavour ? applyFlavour(process.env, flavour) : process.env),
        // Only when the flavour has not already said. `MCP_SERVER_NAME` is part
        // of a flavour, and in a broker the flavour belongs to the calling
        // session — which is what lets one broker serve several server names
        // under one licence budget. This option is the private path's answer,
        // where there is nobody else to ask.
        ...(flavour?.env["MCP_SERVER_NAME"] ? {} : { MCP_SERVER_NAME: serverName }),
      },
      onOutput: (line) => {
        // Not logged raw: one long line of JSON, which the owner's record of
        // it summarises.
        if (isFactsLine(line)) {
          const facts = parseFacts(line);
          if (facts) this.#options.onFacts?.(facts, chosenShaping(flavour));
          else log("kernel reported facts that could not be read");
          return;
        }
        log(`kernel: ${line}`);
        // Ends the handshake on the same path a dead child does, rather than
        // waiting out a timeout for something already answered.
        if (SERVER_NOT_FOUND.test(line)) {
          reportFatal(
            new ServerNotResolved(
              `the Wolfram kernel could not start the MCP server MCP_SERVER_NAME="${serverName}": ` +
                line.trim(),
            ),
          );
        }
      },
      onFatal: (error) => reportFatal(error),
    });

    const client = new Client(clientInfo, { capabilities: {} });
    this.#handshaking = { transport, abort: (error) => reportFatal(error) };
    client.onerror = (err) => log(`upstream error: ${errorText(err)}`);
    client.onclose = () => {
      if (this.#client === client) {
        log("upstream closed");
        this.#client = null;
        this.#transport = null;
      }
    };

    log(`starting kernel: ${bin} (serverName=${serverName})`);
    const startedAt = Date.now();

    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new HandshakeTimeout(startTimeoutMs)), startTimeoutMs);
      timer.unref?.();
    });
    void timeout.catch(() => {});

    try {
      // connect() sends initialize as an ordinary request, which the SDK
      // otherwise bounds at its own 60s default: below the 120s default start
      // timeout, so a first start downloading the paclet for longer failed at a
      // minute with a bare "Request timed out", whatever the setting said. A
      // beat past our own timer, so that timer, which names the cause, fires.
      await Promise.race([
        client.connect(transport, { timeout: startTimeoutMs + HANDSHAKE_SDK_GRACE_MS }),
        fatal,
        timeout,
      ]);
    } catch (err) {
      await transport.close().catch(() => {});
      throw withKernelOutput(err, transport.recentOutput());
    } finally {
      clearTimeout(timer);
      this.#handshaking = null;
    }

    log(`kernel ready in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
    this.#client = client;
    this.#transport = transport;

    // The kernel's own MCP server declares tools.listChanged, so it will say
    // when its list changes — a paclet upgraded underneath a running session,
    // or a server that registers tools lazily. Nothing subscribed, so the only
    // thing that ever noticed was the next kernel start. Re-reading the lists is
    // exactly what onReady does, so it is reused rather than duplicated.
    const refresh = (why: string) => {
      if (!this.#options.onReady) return;
      log(`upstream says its ${why} changed; re-reading`);
      void this.#options.onReady(client).catch((err) => {
        log(`refresh after an upstream change failed, continuing: ${errorText(err)}`);
      });
    };
    client.setNotificationHandler(ToolListChangedNotificationSchema, () => refresh("tool list"));
    client.setNotificationHandler(PromptListChangedNotificationSchema, () =>
      refresh("prompt list"),
    );

    if (this.#options.onReady) {
      try {
        await this.#options.onReady(client);
      } catch (err) {
        log(`post-start refresh failed, continuing: ${errorText(err)}`);
      }
    }

    return client;
  }

  /**
   * Start the kernel if it is not already up, collapsing concurrent starts.
   *
   * `startTimeoutMs` bounds this start's handshake in place of the configured
   * one: a preparation passes what its deadline has left, so a slow inspection
   * before the handshake shortens the handshake rather than adding to it.
   */
  async ensure(startTimeoutMs?: number): Promise<Client> {
    if (this.#client) return this.#client;
    this.#starting ??= this.#spawn(startTimeoutMs).finally(() => {
      this.#starting = null;
    });
    return this.#starting;
  }

  /**
   * Run `fn` with the kernel guaranteed up, serialized against other work.
   *
   * `deadlineMs` is how long the *caller* will wait, and deliberately not a
   * timeout on the request: see `#fate`.
   */
  async run<T>(fn: (client: Client) => Promise<T>, options: RunOptions = {}): Promise<T> {
    const task = this.#queue.then(async () => {
      this.#clearIdle();
      // Someone needs the kernel now, so this is the moment abandoned work
      // stops being free to finish.
      await this.#reclaim();
      const client = await this.ensure();
      const work = fn(client);
      try {
        return await this.#awaitWithin(work, options.deadlineMs);
      } catch (err) {
        // Decided synchronously with the failure, so a caller that has just
        // learned of the rejection can already see the verdict: the pool reads
        // `usable()` in its own catch, which runs after this one.
        this.#deciding = this.#fate(work, err, options);
        throw err;
      } finally {
        this.#scheduleIdle();
      }
    });
    // Keep the chain alive even when a task rejects, and hold the next task
    // behind the verdict — but never behind the abandoned work itself, which is
    // what `#reclaim` at the top of the turn exists to cut short.
    this.#queue = task.then(
      () => undefined,
      () => this.#deciding ?? undefined,
    );
    return task;
  }

  /**
   * Wait for `work`, but not past the caller's deadline.
   *
   * The deadline is not passed to the SDK as a request timeout on purpose. The
   * SDK's timeout cancels the request and forgets it, so the kernel's eventual
   * reply is dropped as an unknown id — and that reply is the only evidence
   * this server can ever get that the kernel is alive. Keeping the request
   * outstanding is what makes `#fate` able to tell "still working" from "hung".
   */
  async #awaitWithin<T>(work: Promise<T>, deadlineMs: number | undefined): Promise<T> {
    if (deadlineMs === undefined || deadlineMs <= 0) return work;
    let timer: NodeJS.Timeout | undefined;
    const expiry = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new DeadlineExceeded(deadlineMs)), deadlineMs);
      timer.unref?.();
    });
    void expiry.catch(() => {});
    try {
      return await Promise.race([work, expiry]);
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * What a failure means for the kernel, and what to do about it.
   *
   * The old answer was a `ping` health check, on the theory that a failure
   * leaves the kernel's state unknown. Measured against a real kernel, that
   * theory does not hold: AgentTools' loop is `While[True, processRequest[]]`
   * with `tools/call` dispatching `evaluateTool` inline, so a ping sent 500ms
   * into a 20s evaluation was not answered until 22.8s. A busy kernel and a
   * hung one are equally deaf, and killing on a deaf probe destroyed the
   * legitimate long call along with every evaluator `session` on that kernel.
   *
   * But the failure *shapes* are individually decidable without asking anything:
   *
   *  - **The caller cancelled.** Stopping the kernel is the only thing that
   *    honours it. `notifications/cancelled` cannot: the serial loop will not
   *    read it until the evaluation it would cancel has already finished.
   *  - **The transport is gone.** Nothing to decide; it is already dead.
   *  - **We stopped waiting** (our deadline, or the SDK's own on an op that
   *    carries no deadline). The kernel may be working or hung, and there is no
   *    way to tell — so it is left alone, and the reply it may yet send is
   *    taken as proof of life. Nobody is waiting for that reply, so the value
   *    is discarded; only the fact of it matters.
   *  - **Anything else.** The kernel answered, which means it is alive and now
   *    idle: an unknown tool name, a malformed argument, a failed evaluation.
   *    Keep it. This is the case that used to cost a kernel and its sessions
   *    because a model guessed a tool name wrong.
   */
  async #fate<T>(work: Promise<T>, err: unknown, options: RunOptions): Promise<boolean> {
    const { log } = this.#options;
    try {
      if (options.signal?.aborted) {
        log("the caller cancelled; stopping the kernel, which is the only way to honour it");
        await this.stop().catch(() => {});
        return false;
      }
      if (!this.running) return false;
      if (err instanceof DeadlineExceeded || isRequestTimeout(err)) {
        this.#abandon(work, errorText(err));
        return true;
      }
      log(`the kernel answered (${errorText(err)}), so it is alive and idle; keeping it`);
      return true;
    } finally {
      this.#deciding = null;
    }
  }

  /**
   * Leave work running that nobody is waiting for.
   *
   * Kept rather than killed because the kernel is very likely still computing,
   * and the definitions, line numbers and history behind the evaluator's
   * `session` argument live in it. If the reply arrives the kernel is proven
   * alive and idle and carries on serving; if a later caller needs the kernel
   * first, `#reclaim` takes it back then — on demand, so no timer has to guess
   * how long a legitimate evaluation may run.
   *
   * The seat cannot be leaked this way: the broker exits 60s after its last
   * proxy detaches whatever its kernels are doing, and a private kernel dies
   * with the process it belongs to.
   */
  #abandon(work: Promise<unknown>, reason: string): void {
    const { log } = this.#options;
    const abandoned: AbandonedWork = { settled: false };
    this.#abandoned = abandoned;
    log(`stopped waiting for the kernel (${reason}); leaving it to finish, sessions intact`);
    abandoned.done = work.then(
      () => {
        abandoned.settled = true;
        if (this.#abandoned === abandoned)
          log("the abandoned call finished; the kernel is idle again");
      },
      (err: unknown) => {
        abandoned.settled = true;
        if (this.#abandoned === abandoned) {
          log(`the abandoned call ended in ${errorText(err)}; the kernel is idle again`);
        }
      },
    );
  }

  /** Take the kernel back from abandoned work, because something needs it now. */
  async #reclaim(): Promise<void> {
    const abandoned = this.#abandoned;
    if (!abandoned) return;
    this.#abandoned = null;
    if (abandoned.settled) return; // finished on its own; the kernel and its sessions are fine
    this.#options.log(
      "a new request needs the kernel and the abandoned call has not finished; stopping it",
    );
    await this.stop().catch(() => {});
  }

  /**
   * False once this kernel should not be handed out again.
   *
   * The pool calls this instead of retiring on sight. `true` means the kernel is
   * usable — including the abandoned case, where it is usable only after
   * `#reclaim`, which the next turn does for itself.
   */
  async usable(): Promise<boolean> {
    return (await this.#deciding) ?? this.running;
  }

  /** True while a call nobody is waiting for is still outstanding. */
  get abandoned(): boolean {
    return this.#abandoned !== null && !this.#abandoned.settled;
  }

  #clearIdle(): void {
    if (this.#idleTimer) {
      clearTimeout(this.#idleTimer);
      this.#idleTimer = null;
    }
  }

  #scheduleIdle(): void {
    this.#clearIdle();
    const { idleMs, log } = this.#options;
    if (idleMs <= 0) return;
    this.#idleTimer = setTimeout(() => {
      log(`idle for ${budgetText(idleMs)}, shutting the kernel down`);
      void this.stop();
    }, idleMs);
    this.#idleTimer.unref?.();
  }

  async stop(): Promise<void> {
    this.#clearIdle();
    // A start in progress ends now, through the same path a kernel that died
    // mid-handshake takes, and its process goes with the transport.
    const handshaking = this.#handshaking;
    this.#handshaking = null;
    if (handshaking) {
      handshaking.abort(new Error("the kernel was stopped during its handshake"));
      await handshaking.transport.close().catch(() => {});
    }
    const client = this.#client;
    const transport = this.#transport;
    this.#client = null;
    this.#transport = null;
    try {
      await client?.close();
    } catch {
      /* ignore */
    }
    try {
      await transport?.close();
    } catch {
      /* ignore */
    }
  }
}
