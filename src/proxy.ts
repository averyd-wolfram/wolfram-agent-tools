/**
 * The MCP server itself: a proxy that presents a local Wolfram kernel's own MCP
 * server to a client, without keeping a kernel resident.
 *
 * Many clients launch every configured server at startup and immediately
 * enumerate tools. A Wolfram kernel is around a gigabyte resident and takes
 * seconds to boot, so `initialize` and `tools/list` are answered from a disk
 * cache and the kernel is started on the first request that genuinely needs it.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  McpError,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type Prompt,
  type ServerCapabilities,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";

import { cacheKey, readCache, writeCache } from "./cache.js";
import { MAX_TIME_MS, type Config, type UpstreamCapabilities } from "./config.js";
import type { DirectOps, KernelBackend } from "./backend.js";
import type { BrokerBackend } from "./broker-client.js";
import { doctorCommand } from "./doctor.js";
import { budgetText, elapsedText, idleText, waitText } from "./duration.js";
import type { BackoffState } from "./prepare.js";
import { readFacts } from "./inspect.js";
import { drainPages } from "./kernel.js";
import { exampleKernelPath, listKernels, locateKernel, type KernelInstall } from "./locate.js";
import { bareMcpText, errorText, type Logger } from "./log.js";
import { PKG } from "./version.js";

/**
 * Upstream failures that are about the request rather than the evaluation.
 *
 * Everything else — an evaluation that failed, a timeout, a kernel that died
 * mid-call — is reported as an isError result carrying the kernel's own words,
 * because a model can act on that. A timeout is deliberately in the second
 * group: the spec would allow either, and the words are worth more.
 */
const PROTOCOL_ERRORS = new Set<number>([
  ErrorCode.ParseError,
  ErrorCode.InvalidRequest,
  ErrorCode.MethodNotFound,
  ErrorCode.InvalidParams,
]);

export interface WolframServer {
  server: Server;
  /** The kernel that will be used, or null when none was found. */
  install: KernelInstall | null;
  stop: () => Promise<void>;
}

/** Follow `nextCursor` so the cache holds a complete list, not just page one. */
function drainTools(ops: DirectOps): Promise<Tool[]> {
  return drainPages(async (cursor) => {
    const page = await ops.listTools(cursor);
    return { items: page.tools ?? [], nextCursor: page.nextCursor };
  });
}

function drainPrompts(ops: DirectOps): Promise<Prompt[]> {
  return drainPages(async (cursor) => {
    const page = await ops.listPrompts(cursor);
    return { items: page.prompts ?? [], nextCursor: page.nextCursor };
  });
}

/**
 * The evaluator's *default* time constraint, from AgentTools 2.2.7
 * (`Kernel/Tools/WolframLanguageEvaluator.wl`: `"TimeConstraint" -> 60`).
 *
 * A default, emphatically not a constant: the effective value is
 * `toolOptionValue["WolframLanguageEvaluator", "TimeConstraint"]`, which reads
 * `MCP_TOOL_OPTIONS` from the kernel's environment. A user who set it to 600 has
 * a 600 s evaluator and this number is then simply wrong. It is used for one
 * thing only — deciding whether to warn about an inverted layering at startup —
 * and nothing here may act on it as though it described the kernel.
 *
 * Not enforced here either. The kernel enforces it, and does so *gracefully*,
 * wrapping the evaluation and returning a result rather than hanging. The
 * ordering is what matters: when the kernel's own limit fires first the caller
 * gets "time constraint exceeded", which a model can act on, instead of this
 * server's vaguer "no answer within Ns".
 */
const KERNEL_TIME_CONSTRAINT_S = 60;

/**
 * That default as a person reads it, with the number a user would write: the
 * paclet's `TimeConstraint` is set in seconds, in `MCP_TOOL_OPTIONS`, so "1m"
 * alone sends someone writing an override off to convert.
 */
const EVALUATOR_DEFAULT_TEXT = `${budgetText(KERNEL_TIME_CONSTRAINT_S * 1000)} (TimeConstraint ${KERNEL_TIME_CONSTRAINT_S})`;

/** Headroom over a requested time constraint, for transport and framing. */
const TIME_CONSTRAINT_HEADROOM_MS = 30_000;

/**
 * How long to wait for one tool call before answering the caller.
 *
 * A deadline for the *caller*, not for the kernel: when it passes, the kernel is
 * left alone (see `KernelSession.#fate`). Raising it for an explicit
 * `timeConstraint` still matters, because a model that asked for ten minutes
 * would otherwise be told at five that there was no answer, while the kernel was
 * going to produce one.
 *
 * This is the only place tool arguments are read, and deliberately the only one.
 * A table of per-tool ceilings was considered and rejected: two of the sixteen
 * tools accept a constraint at all, the effective value of even those comes from
 * the user's `MCP_TOOL_OPTIONS`, and the tools most likely to run for a quarter
 * of an hour — a paclet build, a submission — declare nothing. Any table would
 * be this server asserting facts about someone else's configuration.
 *
 * The ceiling is held to `MAX_TIME_MS`, whether configured or requested: past
 * it the timer fires at once, and a model asking for "as long as it takes" was
 * told at once that there was no answer (#15). An infinite request is held
 * like any other too long. A configured 0, no ceiling, stays 0 when no
 * constraint is requested; a requested one sets the ceiling, as it always has.
 */
export function evaluationCeilingMs(configuredMs: number, args: unknown): number {
  const requested = Number((args as Record<string, unknown> | null)?.["timeConstraint"]);
  const ceiling =
    Number.isNaN(requested) || requested <= 0
      ? configuredMs
      : Math.max(configuredMs, requested * 1000 + TIME_CONSTRAINT_HEADROOM_MS);
  return Math.min(MAX_TIME_MS, ceiling);
}

/**
 * The same protocol failure, in the shape the SDK sends correctly.
 *
 * `McpError`'s constructor prefixes its own "MCP error <code>: ", and the SDK
 * puts `err.message` on the wire verbatim, where the receiving client wraps it
 * in a fresh `McpError`. So relaying the instance we were given doubles the
 * prefix, and a model reads "MCP error -32602: MCP error -32602: Unknown tool:
 * NoSuchTool". Throwing a plain error that carries `code` is what the SDK reads
 * structurally — `Number.isSafeInteger(error["code"])` — so the code, the data
 * and the kernel's own words all survive, and the prefix is added exactly once.
 */
function relayable(err: McpError): Error {
  const relayed = new Error(bareMcpText(err.code, err.message));
  return Object.assign(relayed, {
    code: err.code,
    ...(err.data === undefined ? {} : { data: err.data }),
  });
}

/**
 * A kernel's answer to a request with no `isError` form — a list, a prompt, a
 * resource — whose protocol error is relayed as `relayable` makes it. Only
 * `tools/call` relayed one, so every other request's arrived doubled, on both
 * paths (#62).
 */
async function relayed<T>(answer: Promise<T>): Promise<T> {
  try {
    return await answer;
  } catch (err) {
    throw err instanceof McpError ? relayable(err) : err;
  }
}

const STATUS_TOOL = {
  name: "wolfram_status",
  title: "Wolfram Status",
  description:
    "Report what this server can see: the selected kernel, the Wolfram/AgentTools " +
    "paclet, the Wolfram Account, the licence, and where its logs go. Starts no " +
    "kernel, so it answers even when kernels cannot start.",
  inputSchema: { type: "object" as const, properties: {} },
  annotations: { readOnlyHint: true },
};

/**
 * What the next `tools/list` will cost, in terms the reader can act on.
 *
 * `WOLFRAM_MCP_CACHE=0` is the case worth spelling out: nothing is written to
 * disk, but a kernel that has already started left its list in memory, so the
 * next list still starts nothing. Calling that "not cached; the next list
 * starts a kernel" sends a reader hunting for a cache write that was never
 * supposed to happen.
 */
function describeToolList(
  config: Config,
  cache: { tools: unknown[]; cachedAt: number } | null,
  age: string | null,
): string {
  if (!cache) return "not cached; the next list starts a kernel";
  if (!config.cacheEnabled) return `${cache.tools.length} tools, in memory (WOLFRAM_MCP_CACHE=0)`;
  return `${cache.tools.length} tools, cached ${age}`;
}

/**
 * What the broker this session shares through is doing, asked of it directly.
 *
 * `wolfram_status` printed only the setting, "sharing on", so whether two
 * sessions shared a kernel could be learned only from doctor. A session that
 * already chose its backend is described by that choice: its own broker
 * connection is asked, and a session that fell back to a private kernel says so
 * — it said "no broker running yet; the first tool call starts one" after that
 * call had started a private kernel.
 *
 * Before any choice it asks a broker that is already running, never starting
 * one, because this tool starts nothing — all within one ceiling, since this is
 * what you ask when things are stuck. An attach that finishes after the ceiling
 * is stopped: dropped instead, it stayed connected for the life of this
 * process, counted as a session by a broker that then never reached its idle
 * exit. The asking connection is itself counted as attached, so it is left out.
 */
async function describeSharing(
  config: Config,
  install: KernelInstall,
  backend: KernelBackend,
): Promise<string> {
  const inUse = backend.kind === "deferred" ? (backend.resolved ?? null) : backend;
  if (inUse?.kind === "local") {
    return "on — but this session runs a private kernel; the server log says why sharing was declined";
  }
  const ceilingMs = 1_000;
  const report = async (broker: BrokerBackend): Promise<string> => {
    try {
      const status = await broker.status(ceilingMs);
      const others = Math.max(0, status.connections - 1);
      return (
        `on — broker pid ${status.pid}, ${others} other session(s) attached, ` +
        `${status.kernels} kernel(s) running, ${status.busy} busy, budget ${status.budget}`
      );
    } catch (err) {
      return `on — the broker did not answer: ${errorText(err)}`;
    }
  };
  if (inUse?.kind === "broker") return report(inUse as BrokerBackend);

  const { brokerLaunch } = await import("./backend.js");
  const { BrokerBackend: Client } = await import("./broker-client.js");
  // The attach logs why it declined; that is the answer when it does.
  let declined: string | null = null;
  const attaching = Client.attachIfRunning(
    brokerLaunch(config, install, (message) => (declined = message)),
  ).catch(() => null);
  let timer: NodeJS.Timeout | undefined;
  const expired = Symbol("expired");
  const outcome = await Promise.race([
    attaching,
    new Promise<typeof expired>((resolve) => {
      timer = setTimeout(() => resolve(expired), ceilingMs);
      timer.unref?.();
    }),
  ]);
  clearTimeout(timer);
  if (outcome === expired) {
    void attaching.then((late) => late?.stop());
    return `on — a broker is listening but did not answer within ${budgetText(ceilingMs)}`;
  }
  if (!outcome) {
    return declined === null
      ? "on — no broker running yet; the first tool call starts one"
      : `on — ${String(declined)}`;
  }
  try {
    return await report(outcome);
  } finally {
    await outcome.stop();
  }
}

/**
 * Everything the server knows without starting anything.
 *
 * The reason this exists in *every* state, not only when no installation was
 * found: a machine whose kernels cannot start still has a warm cache, so
 * `tools/list` answers with the full list and the client looks healthy while
 * every call fails two minutes later. Until now there was no way to ask the
 * server what it thought was going on once an installation had been located.
 */
function describeStatus(
  config: Config,
  install: KernelInstall | null,
  cache: { tools: unknown[]; cachedAt: number } | null,
  backoff: BackoffState | null = null,
  sharing: string | null = null,
): string {
  if (!install) return describeMissingKernel(config);

  const facts = config.inspect ? readFacts(install.bin) : null;
  const age = cache ? `${elapsedText(Date.now() - cache.cachedAt)} ago` : null;
  const lines = [
    `${PKG.name} ${PKG.version}`,
    "",
    `kernel      ${install.bin}`,
    `            ${install.version ?? "version unknown"}, via ${install.source}`,
  ];

  // Each line says what kind of fact it is. These were learned by a kernel at
  // some point and cached; nothing here was asked of a kernel just now, and a
  // reader deciding whether to trust "signed in" needs to know how old it is.
  if (!config.inspect) {
    lines.push("facts       not used (WOLFRAM_MCP_INSPECT=0)");
  } else if (!facts) {
    lines.push("facts       unknown yet: every kernel reports them as it starts");
  } else {
    lines.push(
      `facts       cached from a kernel ${elapsedText(Date.now() - facts.probedAt)} ago, ` +
        `refreshed by every kernel start`,
      `AgentTools  ${facts.agentTools ?? "absent — every tool call will fail to load it"}`,
      `account     ${facts.wolframID ?? "not signed in — cloud-backed tools will fail on their own"}`,
      `licence     ${facts.maxLicenseProcesses} seat(s)${facts.licenseType ? ` (${facts.licenseType})` : ""}`,
    );
  }

  // First among the live facts: while it stands, every call fails at once,
  // and this is the line that says why and for how long.
  if (backoff) {
    lines.push(
      `preparing   the last attempt failed; retried in ${waitText(backoff.remainingMs)}` +
        // The same pointer the failed call gave: for a server that would not
        // start, the server, not the installation.
        (backoff.advice ? `; ${backoff.advice}` : `, or as soon as the installation changes`),
      `            ${backoff.reason}`,
    );
  }

  lines.push(
    `sharing     ${config.share ? (sharing ?? "on — kernels are shared with other sessions") : "off — this session has its own kernel"}`,
    `tool list   ${describeToolList(config, cache, age)}`,
    `logs        ${process.env["WOLFRAM_MCP_LOG"] ?? "stderr, captured by your MCP client"}`,
    `timeouts    start ${budgetText(config.startTimeoutMs)}, call ${budgetText(config.callTimeoutMs)}, ` +
      `idle ${idleText(config.idleMs)}`,
    `evaluation  the evaluator stops itself at ${EVALUATOR_DEFAULT_TEXT} unless ` +
      `MCP_TOOL_OPTIONS or a timeConstraint argument says otherwise`,
    `            past the call timeout this server stops waiting but leaves the kernel ` +
      `running, so a long call keeps its session`,
  );
  return lines.join("\n");
}

function describeMissingKernel(config: Config): string {
  const hint = exampleKernelPath();

  const unfiltered = listKernels();
  const seen = unfiltered.length
    ? unfiltered.map((k) => `${k.bin} (${k.version ?? "unknown"})`).join("\n  ")
    : "none";

  return [
    `No usable Wolfram installation was found.`,
    ``,
    `platform:         ${process.platform}`,
    `minimum version:  ${config.minVersion}`,
    `configured path:  ${config.kernelPath ?? "(unset, auto-detecting)"}`,
    ``,
    `Installs seen without the version filter:`,
    `  ${seen}`,
    ``,
    `Set WOLFRAM_MCP_KERNEL to the installation or kernel executable, for example:`,
    `  WOLFRAM_MCP_KERNEL=${hint}`,
    ``,
    `Wolfram/AgentTools requires kernel ${config.minVersion} or newer.`,
    // Never `npx wolfram-mcp-server doctor`: this package is not published.
    // doctor is also the one thing that asks wolframscript, which a session
    // never does — so an installation only it knows about is found there.
    `For a full report, and to find an installation only wolframscript knows`,
    `about, run ${doctorCommand()}.`,
  ].join("\n");
}

export function createWolframServer(
  config: Config,
  log: Logger,
  makeBackend: (install: KernelInstall) => KernelBackend,
): WolframServer {
  // Seat-free: this runs at construction, ahead of `initialize`, and step 7
  // starts a kernel to answer. A kernel only wolframscript knows about is
  // reached through the hint `doctor` records instead.
  const install = locateKernel({
    override: config.kernelPath,
    version: config.version,
    minVersion: config.minVersion,
    log,
    allowWolframScript: false,
  });

  const key = cacheKey(
    install?.bin ?? "",
    install?.version ?? null,
    config.serverName,
    config.flavour.digest,
  );
  // Keyed, so a neighbouring project on another server name has its own entry
  // and cannot evict this one. `readCache` re-checks the key it read, so there
  // is nothing left here to compare.
  const usableCache = install && config.cacheEnabled ? readCache(key) : null;

  // Capabilities are frozen at `initialize`, before we may start a kernel, so
  // prompts and resources come from the cache when we have one and from the
  // known shape of the serverName when we do not.
  // Only what a kernel has actually been seen to offer. Advertising prompts
  // from a static table meant a cold first run either answered prompts/list
  // with -32601 (no installation) or started a kernel to enumerate them
  // (installation present) — one a protocol violation, the other the end of
  // lazy start. Capabilities cannot change mid-session, so a cold run is
  // tools-only and the next session has the prompts.
  const upstream: UpstreamCapabilities = usableCache?.upstream ?? {
    prompts: false,
    resources: false,
  };

  // Only a server that found an installation registers prompt and resource
  // handlers, so only that server may advertise them. Advertising them from
  // the diagnostics-only branch made every client that enumerates prompts at
  // launch see -32601 Method not found on a machine with no Wolfram.
  const capabilities: ServerCapabilities = { tools: { listChanged: true } };
  if (install && upstream.prompts) capabilities.prompts = { listChanged: true };
  if (install && upstream.resources) capabilities.resources = {};

  const server = new Server({ name: PKG.name, version: PKG.version }, { capabilities });

  if (!install) {
    log("no usable Wolfram installation found; serving diagnostics only");

    server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [STATUS_TOOL] }));

    server.setRequestHandler(CallToolRequestSchema, async () => ({
      isError: true,
      // Re-scanned on every call, so installing Wolfram and asking again works.
      content: [{ type: "text", text: describeMissingKernel(config) }],
    }));

    return { server, install: null, stop: async () => {} };
  }

  log(`kernel: ${install.bin} (version=${install.version ?? "unknown"}, via ${install.source})`);
  if (config.callTimeoutMs < KERNEL_TIME_CONSTRAINT_S * 1000) {
    log(
      `call timeout is ${budgetText(config.callTimeoutMs)}, below the evaluator's default ` +
        `time constraint, ${EVALUATOR_DEFAULT_TEXT}: this server will stop waiting first, so ` +
        `a slow evaluation is reported here rather than ending in the kernel's own ` +
        `"time constraint exceeded", which says more. The kernel is left running either way. ` +
        `Prompts and resource reads wait this same ceiling`,
    );
  }
  log(
    `profile=${config.serverName} idle=${idleText(config.idleMs)} ` +
      `cache=${usableCache ? "hit" : "miss"}`,
  );

  const backend = makeBackend(install);

  // The one way a handler the kernel answers is registered, so each relays a
  // kernel's protocol error once. Wrapped one by one, a handler added later
  // could forget, and its errors would arrive doubled again (#62). `tools/call`
  // is the exception: it alone has an `isError` form, and decides for itself.
  const fromKernel: typeof server.setRequestHandler = (schema, handler) =>
    server.setRequestHandler(schema, (request, extra) =>
      relayed(Promise.resolve(handler(request, extra))),
    );

  let toolCache: Tool[] | null = usableCache?.tools ?? null;
  let promptCache: Prompt[] | null = usableCache?.prompts ?? null;
  // When the list above was last taken from a kernel: the cache file's own
  // timestamp while it comes from disk, then `reload`'s clock. `usableCache` is
  // read once, here, so reporting *that* as the current state made every cold
  // session answer "not cached" for the rest of its life — including after its
  // own first kernel start had warmed the cache a second later, which is
  // exactly when someone reads this line to find out whether it did.
  let toolCachedAt: number | null = usableCache?.cachedAt ?? null;

  /**
   * Re-read the upstream lists from a live kernel and persist them.
   *
   * Runs on every kernel start rather than only when the cache is empty:
   * nothing else here can notice that the Wolfram/AgentTools paclet was
   * upgraded under us, and the kernel is already connected so this costs one
   * round trip.
   */
  async function reload(ops: DirectOps): Promise<void> {
    const caps = await ops.capabilities();

    let tools: Tool[];
    try {
      tools = await drainTools(ops);
    } catch (err) {
      // Keep the last known-good list. Replacing it with an empty array here
      // would advertise a server with no tools, and would persist that.
      log(`upstream tools/list failed, keeping the cached list: ${errorText(err)}`);
      return;
    }

    // A successful-but-empty list is not a fact worth keeping. Advertising zero
    // tools means no tools/call can arrive, so nothing would ever start another
    // kernel to correct it — measured: an empty list was written to disk and
    // then served as a cache *hit* to a later session whose kernel had seven
    // tools. Keep the cache cold and ask again instead.
    if (tools.length === 0) {
      log("upstream reported no tools; not caching an empty list");
      return;
    }

    let prompts = promptCache ?? [];
    if (caps.prompts) {
      try {
        prompts = await drainPrompts(ops);
      } catch (err) {
        log(`upstream prompts/list failed, keeping the cached list: ${errorText(err)}`);
      }
    }

    const toolsChanged = JSON.stringify(tools) !== JSON.stringify(toolCache);
    // Prompts were compared against nothing and announced never, so a prompt
    // added by a paclet upgrade was swallowed — while the capability declared
    // listChanged, promising notifications that were never sent. A kernel
    // start and the kernel's own list_changed (kernel.ts subscribes) both
    // arrive here, so this comparison is the one place a change is announced.
    const promptsChanged = JSON.stringify(prompts) !== JSON.stringify(promptCache);
    toolCache = tools;
    promptCache = prompts;
    toolCachedAt = Date.now();

    if (config.cacheEnabled) {
      const observed: UpstreamCapabilities = {
        prompts: Boolean(caps.prompts),
        resources: Boolean(caps.resources),
      };
      writeCache({ ...key, upstream: observed, tools, prompts });
    }

    if (toolsChanged) {
      log(`upstream tool list changed (${tools.length} tools)`);
      // Whether this lands in the current session is the client's choice:
      // interactive Claude Code refetches on it, while a client that caches
      // tool definitions per conversation applies it in the next one.
      void server.sendToolListChanged().catch(() => {});
    }
    if (promptsChanged && capabilities.prompts) {
      log(`upstream prompt list changed (${prompts.length} prompts)`);
      void server.sendPromptListChanged().catch(() => {});
    }
  }

  backend.onKernelReady((ops) => reload(ops));

  fromKernel(ListToolsRequestSchema, async () => {
    // Deliberately no cursor handling, and none advertised: see `fullToolList`.
    // A cursor is upstream paging state belonging to one kernel, and the pool
    // hands out whichever kernel is free — so page 2 could be asked of a kernel
    // that never issued page 1.

    if (toolCache) {
      log(`tools/list served from cache (${toolCache.length} tools), kernel not started`);
      return { tools: [...toolCache, STATUS_TOOL] };
    }

    // Cold, so this starts a kernel. Starting one also refreshes the cache
    // through `onKernelReady`, but the list is asked for directly rather than
    // waited on, so the answer does not depend on winning that race — and a
    // direct call surfaces the genuine upstream error when the refresh failed.
    //
    // The result is not spread: no `nextCursor` goes out, because both backends
    // answer complete lists and there is nothing for a client to page through.
    // `STATUS_TOOL` is added here rather than stored, so that what the cache
    // holds is exactly what the kernel reported and a refresh compares like
    // with like.
    const live = await backend.listTools();
    return { tools: [...(live.tools ?? []), STATUS_TOOL] };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const { name, arguments: args } = request.params;
    if (name === STATUS_TOOL.name) {
      // Deliberately not forwarded, and deliberately not a kernel start: this is
      // what you ask when kernels are the thing that is broken.
      //
      // Assembled at call time, for the same reason `describeMissingKernel`
      // re-scans on every call: this tool exists to say what is true now, and a
      // kernel start since construction is the likeliest thing to have changed.
      const served =
        toolCache && toolCachedAt !== null ? { tools: toolCache, cachedAt: toolCachedAt } : null;
      return {
        content: [
          {
            type: "text",
            text: describeStatus(
              config,
              install,
              served,
              backend.backoff?.() ?? null,
              config.share && install ? await describeSharing(config, install, backend) : null,
            ),
          },
        ],
      };
    }
    try {
      // extra.signal fires when the client cancels. Passing it on is what turns
      // "the caller stopped waiting" into "the kernel stopped working".
      //
      // The progress token is the client's, so the kernel's progress has to be
      // relabelled with it on the way back. Without this a long evaluation
      // showed the caller nothing at all and then died at the call timeout,
      // however busy the kernel had been.
      const progressToken = request.params._meta?.progressToken;
      const timeoutMs = evaluationCeilingMs(config.callTimeoutMs, args);
      // Notifications are sent asynchronously, so they are ordered against each
      // other and against the result. A client drops progress for a request it
      // has already seen answered — the SDK deletes the progress handler when
      // the response lands — so letting the result overtake a notification
      // silently loses it.
      let relayed = Promise.resolve();
      const result = await backend.callTool(
        { name, arguments: args ?? {} },
        {
          timeoutMs,
          signal: extra.signal,
          ...(progressToken === undefined
            ? {}
            : {
                onprogress: (progress) => {
                  relayed = relayed
                    .then(() =>
                      extra.sendNotification({
                        method: "notifications/progress",
                        params: { ...progress, progressToken },
                      }),
                    )
                    .catch(() => {});
                },
              }),
        },
      );
      await relayed;
      return result;
    } catch (err) {
      // The spec draws a line here, and this used to erase it. A failure while
      // *running* a tool belongs in the result as isError, so the model can see
      // it and self-correct; a failure to *find* the tool, or an unsupported or
      // malformed request, is an MCP error response. Collapsing both into
      // isError left a model unable to tell "your Wolfram code was wrong" from
      // "that tool does not exist".
      if (err instanceof McpError && PROTOCOL_ERRORS.has(err.code)) {
        log(`tools/call ${name} rejected upstream: ${err.message}`);
        throw relayable(err);
      }
      log(`tools/call ${name} failed: ${errorText(err)}`);
      return {
        isError: true,
        content: [{ type: "text", text: `Wolfram kernel error: ${errorText(err)}` }],
      };
    }
  });

  if (capabilities.prompts) {
    fromKernel(ListPromptsRequestSchema, async () => {
      // No cursor handling, for the reason tools/list has none: the backends
      // drain inside one hold on a kernel and answer complete lists, so there is
      // no upstream paging state for anyone to page through.
      if (promptCache) return { prompts: promptCache };
      return backend.listPrompts();
    });
    // A prompt runs its own function in the kernel, so it waits as long as a
    // tool call would, and a cancel stops it as one does. Given no ceiling, it
    // was cut at the SDK's minute (#39).
    fromKernel(GetPromptRequestSchema, async (request, extra) =>
      backend.getPrompt(request.params, { timeoutMs: config.callTimeoutMs, signal: extra.signal }),
    );
  }

  if (capabilities.resources) {
    fromKernel(ListResourcesRequestSchema, async (request) =>
      backend.listResources(request.params),
    );
    fromKernel(ReadResourceRequestSchema, async (request, extra) =>
      backend.readResource(request.params, {
        timeoutMs: config.callTimeoutMs,
        signal: extra.signal,
      }),
    );
  }

  return {
    server,
    install,
    stop: () => backend.stop(),
  };
}
