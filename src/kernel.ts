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
import type { RequestOptions } from "@modelcontextprotocol/sdk/shared/protocol.js";
import {
  ErrorCode,
  ListToolsResultSchema,
  McpError,
  PromptListChangedNotificationSchema,
  ToolListChangedNotificationSchema,
  type ListToolsRequest,
  type ListToolsResult,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { deadlineDelay, MAX_TIMER_MS, timerDelay } from "./config.js";
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

/**
 * The SDK request timeout for every kernel request: the longest delay a timer
 * can hold, so that it never fires before this server's own deadline, which is
 * held to `MAX_TIME_MS` (#15). That deadline is the session's, kept apart from
 * the request so a late reply still arrives (`#fate`). Left unset, the SDK
 * applied its own 60 s default instead, cutting every call longer than a minute
 * and dropping the kernel's answer (#34) — and, once only tool calls were given
 * this, every prompt longer than a minute (#39).
 */
const SDK_REQUEST_TIMEOUT_MS = MAX_TIMER_MS;

/**
 * How long a caller waits for a request that names no deadline of its own: the
 * lists, and whatever a library caller runs without saying. The minute the SDK
 * gave every request by default, kept, but owned here, where its passing leaves
 * the request outstanding for `#fate` to judge. The SDK's own minute forgot the
 * request instead, so the kernel went on working out of sight, and the next
 * request queued behind it (#39).
 */
export const DEFAULT_DEADLINE_MS = 60_000;

/**
 * The SDK options for a request to a kernel, and the only place they are built:
 * `run` hands them to the work it runs. Each request site built its own, so
 * only the two tool-call sites gave the timeout that cannot fire first, and
 * `prompts/get` and `resources/read` were still cut at the SDK's minute (#39).
 */
function requestOptions(signal: AbortSignal | undefined): RequestOptions {
  return { timeout: SDK_REQUEST_TIMEOUT_MS, ...(signal ? { signal } : {}) };
}

/**
 * The SDK's client, except that it lists tools without compiling their output
 * schemas. Every kernel's client is one, so no caller can reach the SDK's own
 * `listTools`, however it asks.
 *
 * That one compiles every tool's `outputSchema` with ajv, to validate later
 * `tools/call` results, and a schema ajv refuses throws out of the whole list.
 * So one tool took every tool of its server with it — on a cold list, in the
 * refresh that keeps the cache, at the broker and in `doctor` (#31); fast-uri
 * 3.1.8 made a malformed `$id` such a schema.
 *
 * This server relays results and judges none: the client it serves validates
 * each against the schema relayed to it. With nothing cached from a listing,
 * `callTool` no longer refuses a result its tool's schema would, nor a call to
 * a tool that requires task-based execution, which the kernel answers itself.
 * It did either only once this client had happened to list the tools.
 */
class RelayClient extends Client {
  override listTools(
    params?: ListToolsRequest["params"],
    options?: RequestOptions,
  ): Promise<ListToolsResult> {
    return this.request({ method: "tools/list", params }, ListToolsResultSchema, options);
  }
}

/**
 * Every page of something, gathered under whatever hold the caller already has.
 *
 * Bounded because a broken upstream that always returns a cursor would
 * otherwise loop forever holding a kernel.
 */
export async function drainPages<T>(
  page: (cursor?: string) => Promise<{ items: T[]; nextCursor?: string | undefined }>,
): Promise<T[]> {
  const all: T[] = [];
  let cursor: string | undefined;
  for (let guard = 0; guard < 50; guard++) {
    const result = await page(cursor);
    all.push(...result.items);
    cursor = result.nextCursor;
    if (!cursor) break;
  }
  return all;
}

/**
 * A kernel's whole tool list, under the hold the caller has. Every page, so
 * nothing reports page one as the list: `doctor` did, and showed a kernel that
 * pages fewer tools than it offered.
 */
export function listAllTools(client: Client, options?: RequestOptions): Promise<Tool[]> {
  return drainPages(async (cursor) => {
    const page = await client.listTools(cursor ? { cursor } : undefined, options);
    return { items: page.tools ?? [], nextCursor: page.nextCursor };
  });
}

/** The SDK's own timeout, which a request given `requestOptions` never meets. */
// Widened to number once: the SDK types McpError.code as a number while
// ErrorCode is the enum of its values, and comparing them raw is an unsafe mix.
const REQUEST_TIMEOUT: number = ErrorCode.RequestTimeout;
function isRequestTimeout(err: unknown): boolean {
  return err instanceof McpError && err.code === REQUEST_TIMEOUT;
}

/**
 * A request dropped before it reached the kernel, because its caller cancelled
 * while it waited: for its turn, for a kernel to be taken back, or for one to
 * start. Typed so that a pool can tell it from a failure the kernel had a part
 * in, and hand the kernel straight back rather than ask after its health.
 */
export class RequestDropped extends Error {
  constructor(reason: unknown) {
    super(`the request was cancelled before it reached the kernel (${errorText(reason)})`, {
      cause: reason,
    });
    this.name = "RequestDropped";
  }
}

/** How a single unit of work is to be run. */
export interface RunOptions {
  /**
   * How long the caller will wait. Not a timeout on the request: when it passes
   * the caller is answered and the request is left outstanding on purpose.
   * Unset is `DEFAULT_DEADLINE_MS`; `0` waits as long as the work takes.
   */
  deadlineMs?: number | undefined;
  /**
   * Fires when the caller cancels, which is the one case that kills a kernel —
   * once the kernel has the work, and not before.
   */
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

    const client = new RelayClient(clientInfo, { capabilities: {} });
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
      timer = setTimeout(
        () => reject(new HandshakeTimeout(startTimeoutMs)),
        timerDelay(startTimeoutMs),
      );
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
        client.connect(transport, { timeout: timerDelay(startTimeoutMs + HANDSHAKE_SDK_GRACE_MS) }),
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
   * timeout on the request: see `#fate`. `fn` is handed the options every
   * request it sends the kernel must carry, which keep the SDK from ending the
   * request before that deadline does.
   */
  async run<T>(
    fn: (client: Client, request: RequestOptions) => Promise<T>,
    options: RunOptions = {},
  ): Promise<T> {
    const task = this.#queue.then(async () => {
      // Cancelled while it waited its turn, so the kernel never had it: there
      // is nothing to stop, and no reason to start one. Sent on, the SDK
      // refused it unsent and `#fate`, seeing the cancel, stopped a kernel that
      // had never had the work — or one just started to receive it.
      if (options.signal?.aborted) throw new RequestDropped(options.signal.reason);
      this.#clearIdle();
      // Cancelled while abandoned work was taken back, or during the start:
      // the same, and the kernel, if there is one, idles out like any other.
      const dropIfCancelled = (): void => {
        if (!options.signal?.aborted) return;
        this.#scheduleIdle();
        throw new RequestDropped(options.signal.reason);
      };
      // Someone needs the kernel now, so this is the moment abandoned work
      // stops being free to finish.
      await this.#reclaim();
      dropIfCancelled();
      const client = await this.ensure();
      dropIfCancelled();
      const work = fn(client, requestOptions(options.signal));
      try {
        return await this.#awaitWithin(work, options.deadlineMs ?? DEFAULT_DEADLINE_MS);
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
      timer = setTimeout(() => reject(new DeadlineExceeded(deadlineMs)), deadlineDelay(deadlineMs));
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
   *  - **We stopped waiting.** The kernel may be working or hung, and there is
   *    no way to tell — so it is left alone, and the reply it may yet send is
   *    taken as proof of life. Nobody is waiting for that reply, so the value
   *    is discarded; only the fact of it matters.
   *  - **The SDK stopped waiting**, which `requestOptions` keeps from happening
   *    but a library caller's own options can still do. The SDK forgets the
   *    request, so no reply can prove anything: the kernel is presumed still
   *    at work, and the next request takes it back.
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
      if (err instanceof DeadlineExceeded) {
        this.#abandon(work, errorText(err));
        return true;
      }
      if (isRequestTimeout(err)) {
        // Not `work`: that is this rejection, so watching it marked the work
        // finished at once, and the kernel, perhaps still computing, was handed
        // the next request to queue behind what nobody could see (#39).
        this.#abandon(null, errorText(err));
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
   *
   * `null` is work whose reply will never be seen, because the SDK has already
   * given up on the request: it never settles, so the next request reclaims.
   */
  #abandon(work: Promise<unknown> | null, reason: string): void {
    const { log } = this.#options;
    const abandoned: AbandonedWork = { settled: false };
    this.#abandoned = abandoned;
    if (!work) {
      log(
        `the request to the kernel was given up on (${reason}), so its reply will not be ` +
          `seen; presuming the kernel still busy, for the next request to take back`,
      );
      return;
    }
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
    }, timerDelay(idleMs));
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
