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
  McpError,
  PaginatedResultSchema,
  PromptListChangedNotificationSchema,
  PromptSchema,
  ResourceSchema,
  ResultSchema,
  ToolListChangedNotificationSchema,
  ToolSchema,
  type CallToolRequest,
  type CallToolResult,
  type ListPromptsRequest,
  type ListPromptsResult,
  type ListResourcesRequest,
  type ListResourcesResult,
  type ListToolsRequest,
  type ListToolsResult,
  type Prompt,
  type Resource,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { deadlineDelay, MAX_TIMER_MS, timerDelay } from "./config.js";
import { FilteringStdioTransport } from "./transport.js";
import { applyFlavour, type KernelFlavour } from "./flavour.js";
import { FACTS_EXPRESSION, isFactsLine, parseFacts, type KernelFacts } from "./inspect.js";
import { budgetText, elapsedText } from "./duration.js";
import {
  readSource,
  serverSource,
  sourceChanged,
  sourceDirs,
  type SourceDirs,
  type SourceRead,
} from "./server-source.js";
import { errorText, type Logger } from "./log.js";

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
        `Wolfram/AgentTools paclet is missing or is being downloaded; ` +
        // #105: AgentTools answers initialize only once these are fetched, so a
        // fresh user base timed out with nothing to say why, or what to raise.
        `on a first start, AgentTools downloads the databases its context ` +
        `tools need into a user base that lacks them, which needs network ` +
        `access and can take longer than WOLFRAM_MCP_START_TIMEOUT_SECONDS ` +
        `allows; the selected kernel predates AgentTools support; or an ` +
        `unactivated Wolfram Engine is waiting for credentials on stdin, ` +
        `which cannot be answered here.`,
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
export function requestOptions(signal?: AbortSignal): RequestOptions {
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
 *
 * Nor does it hold the list to the SDK's `ListToolsResultSchema`, which
 * requires each tool's `inputSchema`, and any `outputSchema`, to be an
 * object: one tool that was not failed the whole parse, and every tool of the
 * server with it, by the same route (#69). Each tool is judged on its own
 * instead, by the SDK's `ToolSchema` and all of it but the `outputSchema`,
 * and one that fails is left out, saying why, while the rest are listed. The
 * `outputSchema` is relayed as the kernel sent it: measured, Claude Code
 * 2.1.302 lists a tool whose output schema is an array. Nothing else of a tool
 * was measured, and a client sends its `inputSchema` on to the Messages API,
 * which takes a malformed one for the whole request, so every model request
 * in that client's session could fail.
 *
 * Prompts and resources are judged the same way, each by the SDK's own
 * `PromptSchema` or `ResourceSchema`: held to its list schemas, one malformed
 * item failed the whole `prompts/list` or `resources/list` (#118). The refresh
 * after a kernel start then cached no prompts, and on the shared path the
 * broker's `kernelReady` failed whole, its tools with it. A user's own server,
 * reached by name, is what could send one; AgentTools 2.2.7 builds its prompts
 * from fixed keys.
 *
 * An item that passes is relayed as the kernel sent it, not as zod parsed it:
 * those schemas are plain objects, so a field the pinned SDK does not know, a
 * newer revision's or a server's own, was dropped on the way (#123). Measured,
 * Claude Code 2.1.319 lists a tool and a prompt carrying a field it does not
 * know. And a tool's result is relayed unparsed: the SDK's schema holds
 * `structuredContent` to an object, so a result whose tool declares an array
 * became a protocol error here, with the kernel's answer gone, where the
 * client is the one to judge it (#117).
 */
class RelayClient extends Client {
  readonly #log: (message: string) => void;

  constructor(
    info: ConstructorParameters<typeof Client>[0],
    options: ConstructorParameters<typeof Client>[1],
    log: (message: string) => void,
  ) {
    super(info, options);
    this.#log = log;
  }

  override async listTools(
    params?: ListToolsRequest["params"],
    options?: RequestOptions,
  ): Promise<ListToolsResult> {
    // Paginated, so the cursor is held to a string as every other list's is.
    const result = await this.request(
      { method: "tools/list", params },
      PaginatedResultSchema,
      options,
    );
    // All but the output schema, which is the client's to judge (#69).
    const tools = this.#judge<Tool>(result, "tool", ({ outputSchema: _, ...rest }) =>
      ToolSchema.safeParse(rest),
    );
    return { ...result, tools };
  }

  override async listPrompts(
    params?: ListPromptsRequest["params"],
    options?: RequestOptions,
  ): Promise<ListPromptsResult> {
    const result = await this.request(
      { method: "prompts/list", params },
      PaginatedResultSchema,
      options,
    );
    const prompts = this.#judge<Prompt>(result, "prompt", (prompt) =>
      PromptSchema.safeParse(prompt),
    );
    return { ...result, prompts };
  }

  override async listResources(
    params?: ListResourcesRequest["params"],
    options?: RequestOptions,
  ): Promise<ListResourcesResult> {
    const result = await this.request(
      { method: "resources/list", params },
      PaginatedResultSchema,
      options,
    );
    const resources = this.#judge<Resource>(result, "resource", (resource) =>
      ResourceSchema.safeParse(resource),
    );
    return { ...result, resources };
  }

  /**
   * A tool's result as the kernel sent it, for the client to judge (#117). The
   * SDK's `CallToolResultSchema` would refuse a `structuredContent` that is not
   * an object, and strip what it does not know from the rest. Nothing here
   * reads a result's shape, and the SDK checks it against a tool's output
   * schema only once it has cached one from `Client.listTools`, which this
   * client never calls.
   */
  override async callTool(
    params: CallToolRequest["params"],
    _resultSchema?: unknown,
    options?: RequestOptions,
  ): Promise<CallToolResult> {
    const result = await this.request({ method: "tools/call", params }, ResultSchema, options);
    return result as CallToolResult;
  }

  /**
   * Each item of one page of a kernel's list, on its own: one that `parse`
   * refuses is left out, saying which and why, and the rest are kept. The
   * list's key and method follow from what it lists, so they are not spelled
   * at each call, where a slip would log one list's name for another's.
   */
  #judge<T>(
    result: Record<string, unknown>,
    kind: "tool" | "prompt" | "resource",
    parse: (item: Record<string, unknown>) => Judged,
  ): T[] {
    const key = `${kind}s`;
    const method = `${key}/list`;
    const items = result[key];
    if (!Array.isArray(items)) {
      throw new McpError(
        ErrorCode.InternalError,
        `the kernel's ${method} result holds no list of ${key}: ${JSON.stringify(items)?.slice(0, 120)}`,
      );
    }
    const listed: unknown[] = items;
    const kept: T[] = [];
    listed.forEach((item, index) => {
      const fields =
        typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
      const parsed = parse(fields);
      if (parsed.success) {
        kept.push(fields as T);
        return;
      }
      // A resource always has its URI to be known by, when it has no name; an
      // empty name names nothing, and was logged as "left out ()".
      const named = [fields["name"], fields["uri"]].find(
        (v): v is string => typeof v === "string" && v !== "",
      );
      // Counted on its page, since that is all this call sees of the list.
      const which = named ?? `entry ${index + 1} of ${listed.length} on this page`;
      const issue = parsed.error.issues[0];
      const why = issue
        ? `${issue.path.join(".") || `the ${kind}`}: ${issue.message}`
        : `it is not a ${kind}`;
      this.#log(
        `a ${kind} the kernel listed is left out (${which}): ${why}; ` +
          `it was ${JSON.stringify(item)?.slice(0, 160)}`,
      );
    });
    return kept;
  }
}

/** What a per-item judgment answers: the part of zod's `safeParse` result read. */
type Judged =
  | { success: true }
  | {
      success: false;
      error: { issues: readonly { path: readonly PropertyKey[]; message: string }[] };
    };

/**
 * Every page of something, gathered under whatever hold the caller already has.
 *
 * Bounded because a broken upstream that always returns a cursor would
 * otherwise loop forever holding a kernel.
 */
export async function drainPages<T>(
  page: (cursor?: string) => Promise<{ items: T[]; nextCursor?: string | undefined }>,
  stop?: AbortSignal,
): Promise<T[]> {
  const all: T[] = [];
  let cursor: string | undefined;
  for (let guard = 0; guard < 50; guard++) {
    stopIfLate(stop);
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
export function listAllTools(
  client: Client,
  options?: RequestOptions,
  stop?: AbortSignal,
): Promise<Tool[]> {
  return drainPages(async (cursor) => {
    const page = await client.listTools(cursor ? { cursor } : undefined, options);
    return { items: page.tools ?? [], nextCursor: page.nextCursor };
  }, stop);
}

/**
 * Before a ready hook sends anything new: once the start has stopped waiting
 * for it (`KernelSessionOptions.onReady`'s `late`), nothing more is asked.
 */
export function stopIfLate(late: AbortSignal | undefined): void {
  if (late?.aborted) {
    throw new Error(
      "the post-start refresh outlived the start's wait for it, so nothing more is asked of the kernel",
    );
  }
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

/**
 * A request whose caller's ceiling passed before it was sent to a kernel. Its
 * caller is answered then, and the request is never started afterwards: a
 * request queued behind another, or waiting for a kernel to be prepared, used
 * to be sent whenever its turn came, after its caller had been told it failed,
 * so a model that retried it ran it twice (#80). A `RequestDropped`, so a pool
 * hands its slot straight back rather than vouching for a kernel that never
 * had it. The text names the caller's whole budget, and is the same on both
 * paths, so sharing does not change the answer.
 */
export class RequestExpired extends RequestDropped {
  constructor(budgetMs: number) {
    super("its ceiling passed first");
    this.message =
      `no answer from the Wolfram kernel within ${budgetText(budgetMs)}: ` +
      `the request had not been sent to a kernel by then, and it will not be`;
    this.name = "RequestExpired";
  }
}

/** How a single unit of work is to be run. */
export interface RunOptions {
  /**
   * How long the caller will wait. Not a timeout on the request: when it passes
   * the caller is answered and the request is left outstanding on purpose.
   * Unset is `DEFAULT_DEADLINE_MS`; `0` waits as long as the work takes. With
   * `expiresAt`, it is only the budget an error names.
   */
  deadlineMs?: number | undefined;
  /**
   * When the caller stops waiting, as a `Date.now()` time stamped where the
   * request arrived, or `null` to wait as long as the work takes. Time spent
   * queued, or waiting for a kernel, counts against it, and a request still
   * unsent when it passes is answered then and never started (`RequestExpired`).
   * Counted from when the work ran, a request queued behind an hour's call
   * waited the hour; on the shared path it failed at its ceiling instead, so
   * sharing changed the answer (#80). Unset, `deadlineMs` counts from the run.
   */
  expiresAt?: number | null | undefined;
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
   *
   * `late` aborts once the start stops waiting for it (`DEFAULT_DEADLINE_MS`):
   * from then on the hook sends nothing new. Its request in flight is left
   * outstanding, but a page or a prompt list asked after the start's caller has
   * the kernel landed among that caller's calls on a kernel that runs one at a
   * time, while the session and the pool held it free (#149's review).
   */
  onReady?: (client: Client, late?: AbortSignal) => Promise<void>;
  /**
   * Told of a kernel start that failed inside `run`, whatever its callers were
   * told. A caller whose ceiling passed during the start was answered that, and
   * never saw the start fail, so its owner could not record the failure: every
   * later call restarted a kernel that would not start (#80's review). Not
   * told of a start `stop()` cut short, which says nothing of the kernel.
   */
  onStartFailed?: ((err: unknown) => void) | undefined;
  /**
   * What the kernel reported, once per start, before its server is up, and
   * which `SHAPING_VARS` its environment chose. Only a report that chose none
   * describes the installation; whoever owns the kernel decides what to keep,
   * and a pool also re-derives its budget from it.
   */
  onFacts?: (facts: KernelFacts, chosen: string[]) => void;
  /**
   * Whether the directories a kernel reports decide where its `source` is read.
   * Off under `WOLFRAM_MCP_INSPECT=0`, as the facts are everywhere else: a
   * session then keys the cache on the directories it guesses, and a kernel
   * reading its reported ones wrote under another key, so nothing was ever
   * read back where they differ — a Wolfram Engine's user base is not the
   * desktop's. Default on.
   */
  sourceFromFacts?: boolean | undefined;
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
 * became every later kernel's in the pool, and its paclet version — which comes
 * from that user base — was cached for every session's `wolfram_status`.
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
/**
 * A kernel that did not start, as opposed to a call that failed on a running
 * one. Typed so a failed restart is told apart from a failed call where the
 * text alone cannot be: a private session's kernel restarting after an idle
 * shutdown starts outside any preparation, and its failure recorded no back-off,
 * so every later call restarted it to fail again (#20).
 */
export class KernelStartFailed extends Error {
  constructor(message: string, cause: unknown) {
    super(message, { cause });
    this.name = "KernelStartFailed";
  }
}

/**
 * A call that reached a session its owner had closed: it was never sent, and no
 * kernel was started for it. Calls queued behind a restart that failed found a
 * stopped session and started a kernel each, which nobody owned once the owner
 * had given the session up, and which kept its seat until it idled out.
 */
export class SessionClosed extends Error {
  constructor() {
    super("the kernel session was closed before this call could start a kernel");
    this.name = "SessionClosed";
  }
}

/** Whether `err`, or anything it was wrapped around, is a `KernelStartFailed`. */
/**
 * A start ended by `stop()`, not by the kernel. A pool frees the seat of a
 * request whose ceiling passed during its kernel's start, and may then retire
 * that kernel for another session; read as a failed start, that refused its
 * healthy flavour for ten minutes (#80's review).
 */
class StartStopped extends Error {}

function isStartStopped(err: unknown): boolean {
  for (let e: unknown = err; e instanceof Error; e = e.cause) {
    if (e instanceof StartStopped) return true;
  }
  return false;
}

export function isKernelStartFailed(err: unknown): boolean {
  for (let e: unknown = err; e instanceof Error; e = e.cause) {
    if (e instanceof KernelStartFailed) return true;
  }
  return false;
}

function withKernelOutput(err: unknown, output: string[]): KernelStartFailed {
  const message = errorText(err);
  // The facts line is this server's own bookkeeping, not something the kernel
  // said about the failure.
  const recent = output.filter((line) => !isFactsLine(line));
  if (recent.length === 0) return new KernelStartFailed(message, err);
  const tail = recent.map((line) => `  ${line}`).join("\n");
  // No doctor command here: on the shared path this runs in the broker, whose
  // launch context is not the caller's, so it could name the wrong one.
  const hint = recent.some((line) => NOT_ACTIVATED.test(line))
    ? "\n\nThis kernel is not activated. Activate it, by opening Wolfram once and " +
      "signing in or with `wolframscript -activate` in a terminal, then try again."
    : "";
  return new KernelStartFailed(`${message}\n\nLast output from the kernel:\n${tail}${hint}`, err);
}

export class KernelSession {
  readonly #options: KernelSessionOptions;
  #client: Client | null = null;
  #transport: FilteringStdioTransport | null = null;
  #starting: Promise<Client> | null = null;
  /** Set by `close()`: no kernel starts again, unlike after `stop()`. */
  #closed = false;
  /**
   * A kernel mid-handshake, and how to end that handshake. `#transport` is set
   * only once the handshake succeeds, so `stop()` used to find nothing to close
   * while a kernel was starting — and the kernel kept its licence seat until
   * the handshake finished or timed out.
   */
  #handshaking: { transport: FilteringStdioTransport; abort: (error: Error) => void } | null = null;
  #queue: Promise<unknown> = Promise.resolve();
  /** `source`: kept per start, since a restart after idling may load another. */
  #source: string | undefined;
  /** Where `source` was read, for `sourceChanged` to read again. */
  #sourceOf: { serverName: string; dirs: SourceDirs } | undefined;
  /** What the latest start, whether or not it succeeded, began from. */
  #attempt: SourceRead[] | undefined;
  /** Calls handed to `run`, numbered as they queue. */
  #queued = 0;
  /** Calls handed to `run` and not yet settled: what arms an idle shutdown. */
  #inRun = 0;
  /**
   * The last start that failed inside `run`, and the last call queued by then:
   * those calls share its failure rather than each starting a kernel to fail
   * again. A burst queued behind a restart that failed started one kernel per
   * call, back to back, before the owner could give the session up (#20).
   */
  #failedStart: { err: unknown; upTo: number } | null = null;
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

  /**
   * What the running kernel was started from (`serverSource`), read as it
   * started; undefined before the first. A list it produced belongs under this
   * in the capability cache, whatever the disk says by the time it is written.
   */
  get source(): string | undefined {
    return this.#source;
  }

  /**
   * Whether what the running kernel was started from has changed on disk since,
   * read again from the directories it was read from: a paclet upgraded under
   * it, or a start the change landed in. Like with like, so learning the
   * installation's real directories later, from the facts, does not make a
   * kernel that started before them look replaced.
   */
  /**
   * What the latest start, whether or not it succeeded, began from, and where:
   * read before it, and where the kernel then said its directories are.
   */
  get attempt(): readonly SourceRead[] {
    return this.#attempt ?? [];
  }

  /**
   * Whether what the latest start began from has changed on disk since, read
   * again where it was read: a pool lifts the refusal window a failed start
   * opened once it has, since the paclet that failed it may now be fixed.
   */
  attemptChanged(): boolean {
    return (this.#attempt ?? []).some(sourceChanged);
  }

  sourceChanged(): boolean {
    if (!this.#client || !this.#sourceOf) return false;
    if (this.#source === undefined) return true;
    return serverSource(this.#sourceOf.serverName, this.#sourceOf.dirs).digest !== this.#source;
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

    // Layered, and the order is load-bearing. The probe's values are the
    // floor; this process's environment beats them, because an explicit
    // WOLFRAM_USERBASE is a deliberate choice and not something to overwrite
    // with a probe result. The flavour then beats *that*, and removes the
    // names it leaves unset — because in a broker this process's environment
    // belongs to whichever session spawned it, and letting it show through is
    // how one project's MCP_TOOL_OPTIONS came to run another project's calls.
    const env: NodeJS.ProcessEnv = {
      ...this.#options.extraEnv,
      ...(flavour ? applyFlavour(process.env, flavour) : process.env),
      // Only when the flavour has not already said. `MCP_SERVER_NAME` is part
      // of a flavour, and in a broker the flavour belongs to the calling
      // session — which is what lets one broker serve several server names
      // under one licence budget. This option is the private path's answer,
      // where there is nobody else to ask.
      ...(flavour?.env["MCP_SERVER_NAME"] ? {} : { MCP_SERVER_NAME: serverName }),
    };
    // Read from the environment this kernel gets, the moment before it starts:
    // a read taken when its session began, or when a request arrived, cannot
    // describe a kernel started later (#3). Read again once it is up, below.
    const guessed = sourceDirs(env, this.#options.extraEnv ?? {});
    const before = serverSource(serverName, guessed).digest;
    this.#attempt = [{ serverName, dirs: guessed, digest: before }];
    // Where the kernel says its directories are, as it reports its facts.
    let reported: SourceDirs | undefined;

    const transport = new FilteringStdioTransport({
      command: bin,
      args: [...KERNEL_ARGS],
      env,
      onOutput: (line) => {
        // Not logged raw: one long line of JSON, which the owner's record of
        // it summarises.
        if (isFactsLine(line)) {
          const facts = parseFacts(line);
          if (facts) {
            if (this.#options.sourceFromFacts !== false && facts.userBase && facts.base) {
              reported = { userBase: facts.userBase, base: facts.base };
              // Read there too, now, so a later change there counts while
              // learning where they are does not (`attemptChanged`).
              if (reported.userBase !== guessed.userBase || reported.base !== guessed.base) {
                this.#attempt?.push(readSource(serverName, reported));
              }
            }
            this.#options.onFacts?.(facts, chosenShaping(flavour));
          } else log("kernel reported facts that could not be read");
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

    const client = new RelayClient(clientInfo, { capabilities: {} }, log);
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

    log(`kernel ready in ${elapsedText(Date.now() - startedAt)}`);
    this.#client = client;
    this.#transport = transport;
    // By now the paclet has resolved the server, so read again, where the
    // kernel says it reads: before any facts, the first kernel's directories
    // are Wolfram's defaults, guessed, and a Wolfram Engine's user base is not
    // the desktop's. Changed since the read before the spawn, the kernel may
    // have loaded either side of the change, so it has no source: its lists are
    // cached under neither, and a pool hands it to nobody else
    // (`sourceChanged`).
    // shortcut: when the kernel's directories were not the guessed ones there
    // is no earlier read to compare, so a change landing in that start, the
    // first on a machine with no facts yet, is not seen.
    const dirs =
      reported && (reported.userBase !== guessed.userBase || reported.base !== guessed.base)
        ? reported
        : undefined;
    const after = serverSource(serverName, dirs ?? guessed).digest;
    this.#source = dirs || after === before ? after : undefined;
    this.#sourceOf = { serverName, dirs: dirs ?? guessed };
    if (this.#source === undefined) {
      log("the installed paclets changed while this kernel started; what it serves is uncertain");
    }

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
      // Waited for as long as a request's own deadline, and never cut. Its
      // reads went through the SDK's own 60 s, which cancels a request and
      // forgets it, so the kernel went on working out of sight and the call
      // that started it queued behind that with nothing to say why (#70). Now
      // they carry `requestOptions` like every other request, and past the
      // deadline this stops waiting but leaves them outstanding: a late reply
      // still refreshes the lists.
      // Called inside an async function, so a hook that throws as it is called,
      // not only one that rejects, is logged and ignored as the option promises.
      const onReady = this.#options.onReady;
      const stopAsking = new AbortController();
      const refresh = (async () => onReady(client, stopAsking.signal))().catch((err: unknown) =>
        log(`post-start refresh failed, continuing: ${errorText(err)}`),
      );
      let timer: NodeJS.Timeout | undefined;
      const late = new Promise<"late">((resolve) => {
        timer = setTimeout(() => resolve("late"), timerDelay(DEFAULT_DEADLINE_MS));
        timer.unref?.();
      });
      const outcome = await Promise.race([refresh, late]);
      clearTimeout(timer);
      if (outcome === "late") {
        stopAsking.abort();
        log(
          `post-start refresh not answered within ${budgetText(DEFAULT_DEADLINE_MS)}; ` +
            `continuing, and taking its answer when it comes`,
        );
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
    if (this.#closed) throw new SessionClosed();
    if (this.#client) return this.#client;
    this.#starting ??= this.#spawn(startTimeoutMs).finally(() => {
      this.#starting = null;
    });
    const client = await this.#starting;
    // Started with no call waiting for it — a preparation whose caller's
    // ceiling passed meanwhile (#80) — it idles out like any other kernel.
    // A call arms that as it finishes; with none, the kernel held its licence
    // seat until something else used it, or the session ended.
    if (this.#inRun === 0) this.#scheduleIdle();
    return client;
  }

  /**
   * Run `fn` with the kernel guaranteed up, serialized against other work.
   *
   * `deadlineMs` is how long the *caller* will wait, and deliberately not a
   * timeout on the request: see `#fate`. `fn` is handed the options every
   * request it sends the kernel must carry, which keep the SDK from ending the
   * request before that deadline does — and the `source` of the kernel it
   * runs on, so whatever it answers can say what produced it (#3).
   */
  async run<T>(
    fn: (client: Client, request: RequestOptions, source: string | undefined) => Promise<T>,
    options: RunOptions = {},
  ): Promise<T> {
    const ticket = ++this.#queued;
    this.#inRun++;
    // The caller's ceiling, counted from where the request arrived (#80): a
    // request still unsent when it passes is answered then, by a timer of its
    // own rather than when its turn comes, and is inert from then on.
    const { expiresAt } = options;
    const budget =
      options.deadlineMs ?? (expiresAt != null ? Math.max(0, expiresAt - Date.now()) : 0);
    let expired: RequestExpired | null = null;
    const expire = (): RequestExpired => (expired ??= new RequestExpired(budget));
    // Read off the clock, not only the timer: a deadline already past, or one
    // that passed while a wait ended, has not yet had its timer run.
    const pastDeadline = (): boolean => expiresAt != null && Date.now() >= expiresAt;
    let sent = false;
    let expiryTimer: NodeJS.Timeout | undefined;
    let expiry: Promise<never> | null = null;
    if (expiresAt != null) {
      expiry = new Promise<never>((_, reject) => {
        expiryTimer = setTimeout(
          () => {
            if (sent) return; // the kernel has it: its deadline is `#awaitWithin`'s now
            reject(expire());
          },
          deadlineDelay(Math.max(0, expiresAt - Date.now())),
        );
        expiryTimer.unref?.();
      });
      void expiry.catch(() => {});
    }
    const task = this.#queue.then(async () => {
      // Answered at its ceiling while it waited: its turn starts nothing.
      if (expired || pastDeadline()) throw expire();
      // Queued behind a start that failed: that failure is this call's too. It
      // was never sent, so its caller may send it again, as a new call.
      const failed = this.#failedStart;
      if (failed && ticket <= failed.upTo) throw failed.err;
      // Cancelled while it waited its turn, so the kernel never had it: there
      // is nothing to stop, and no reason to start one. Sent on, the SDK
      // refused it unsent and `#fate`, seeing the cancel, stopped a kernel that
      // had never had the work — or one just started to receive it.
      if (options.signal?.aborted) throw new RequestDropped(options.signal.reason);
      this.#clearIdle();
      // Cancelled, or past its ceiling, while abandoned work was taken back or
      // during the start: the same, and the kernel, if there is one, idles out
      // like any other.
      const dropIfCancelled = (): void => {
        const gone =
          expired ??
          (pastDeadline() ? expire() : null) ??
          (options.signal?.aborted ? new RequestDropped(options.signal.reason) : null);
        if (!gone) return;
        this.#scheduleIdle();
        throw gone;
      };
      // Someone needs the kernel now, so this is the moment abandoned work
      // stops being free to finish.
      await this.#reclaim();
      dropIfCancelled();
      let client: Client;
      try {
        client = await this.ensure();
      } catch (err) {
        if (isKernelStartFailed(err)) {
          this.#failedStart = { err, upTo: this.#queued };
          if (!isStartStopped(err)) this.#options.onStartFailed?.(err);
        }
        throw err;
      }
      dropIfCancelled();
      sent = true;
      clearTimeout(expiryTimer);
      const work = fn(client, requestOptions(options.signal), this.#source);
      // What is left of one budget, not a fresh one: a request that waited
      // 900 ms of a 1 s ceiling has 100 ms more. The error names the whole.
      const waitMs =
        expiresAt === undefined
          ? (options.deadlineMs ?? DEFAULT_DEADLINE_MS)
          : expiresAt === null
            ? 0
            : Math.max(1, expiresAt - Date.now());
      const budgetMs = expiresAt == null ? waitMs : (options.deadlineMs ?? waitMs);
      try {
        return await this.#awaitWithin(work, waitMs, budgetMs);
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
    const settled = (): void => {
      this.#inRun--;
      clearTimeout(expiryTimer);
    };
    task.then(settled, settled);
    return expiry ? Promise.race([task, expiry]) : task;
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
  async #awaitWithin<T>(
    work: Promise<T>,
    deadlineMs: number | undefined,
    budgetMs = deadlineMs,
  ): Promise<T> {
    if (deadlineMs === undefined || deadlineMs <= 0) return work;
    let timer: NodeJS.Timeout | undefined;
    const expiry = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new DeadlineExceeded(budgetMs ?? deadlineMs)),
        deadlineDelay(deadlineMs),
      );
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

  /**
   * Stop for good: the owner has given this session up. `stop()` alone is what
   * an idle shutdown does, after which the next call starts a kernel again —
   * so a call still queued here when its owner stopped it started a kernel
   * nobody owned. Closed, such a call fails with `SessionClosed` instead.
   */
  async close(): Promise<void> {
    this.#closed = true;
    await this.stop();
  }

  async stop(): Promise<void> {
    this.#clearIdle();
    // A start in progress ends now, through the same path a kernel that died
    // mid-handshake takes, and its process goes with the transport.
    const handshaking = this.#handshaking;
    this.#handshaking = null;
    if (handshaking) {
      handshaking.abort(new StartStopped("the kernel was stopped during its handshake"));
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
