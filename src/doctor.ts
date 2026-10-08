/**
 * `wolfram-mcp-server doctor` — explain what this machine looks like.
 *
 * A server that drives a separately installed, separately licensed binary has
 * many ways to fail before it can report anything over MCP, so the diagnosis
 * lives in a command that talks to a terminal instead.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { cacheKey, capabilityFile, readCache } from "./cache.js";
import { loadConfig, MCP_SERVERS } from "./config.js";
import { budgetText, elapsedText, idleText } from "./duration.js";
import { installationEnv, readFacts, recordFacts, type KernelFacts } from "./inspect.js";
import { KernelSession, listAllTools } from "./kernel.js";
import {
  compareVersions,
  exampleKernelPath,
  listKernels,
  locateKernel,
  writeDiscoveryHint,
} from "./locate.js";
import { errorText } from "./log.js";
import { PKG } from "./version.js";

// Defined by scripts/bundle-js.mjs, and only there: its presence is how the
// single-file artifact knows it is one. See version.ts.
declare const __WOLFRAM_MCP_PKG__: string | undefined;

/**
 * The doctor command the reader of a diagnostic can actually run, by how this
 * process was launched.
 *
 * Every message used to say "run `npm run doctor` in the clone", which is
 * right for a clone and nothing else: a plugin user has no clone and no npm
 * script, and the single file a release hands out has no package.json beside
 * it. So the choice is made here, where the command lives, and every message
 * that names it asks:
 *
 *  - `CLAUDE_PLUGIN_ROOT` set: a process Claude Code started for the plugin,
 *    whose user has the plugin's own command;
 *  - the single-file bundle: that file's `doctor` subcommand, by its path;
 *  - otherwise a clone, or a library inside one: its npm script.
 */
export function doctorCommand(
  env: NodeJS.ProcessEnv = process.env,
  entry: string | undefined = process.argv[1],
): string {
  if (env["CLAUDE_PLUGIN_ROOT"]?.trim()) return "/wolfram:doctor";
  if (typeof __WOLFRAM_MCP_PKG__ === "string") {
    return entry ? `node "${entry}" doctor` : "this file's doctor subcommand";
  }
  return `npm run doctor, in ${join(dirname(fileURLToPath(import.meta.url)), "..")}`;
}

/**
 * What a session should know about this machine before its first request,
 * for the plugin's SessionStart hook — from caches only.
 *
 * A hook's stdout enters the model's context, so this is short, and says
 * what kind of fact each line is: everything here was learned by an earlier
 * kernel and is reported as cached, with its age. Nothing here starts a
 * kernel, asks wolframscript or touches the network, and nothing here claims
 * free seats or which backend will answer — the hook runs before any of that
 * exists, and a stale guess about it is worse than none. `wolfram_status`
 * says the same and more at any point in the session, without the hook.
 */
export function sessionStatus(now: number = Date.now()): string {
  const config = loadConfig(() => {});
  const install = locateKernel({
    override: config.kernelPath,
    version: config.version,
    minVersion: config.minVersion,
    allowWolframScript: false,
  });
  if (!install) {
    return (
      `Wolfram plugin: no Wolfram installation was found without starting a kernel. ` +
      `The Wolfram tools answer only wolfram_status until one is; ${doctorCommand()} ` +
      `looks further and says what is missing.`
    );
  }
  const age = (at: number) => `${elapsedText(now - at)} ago`;
  const lines = [
    `Wolfram plugin: kernel ${install.version ?? "of unknown version"} at ${install.bin}, ` +
      `server ${config.serverName}.`,
  ];
  const facts = config.inspect ? readFacts(install.bin) : null;
  if (facts) {
    lines.push(
      `Cached from a kernel ${age(facts.probedAt)}, not checked this session: ` +
        `AgentTools ${facts.agentTools ?? "absent"}; ` +
        `${facts.wolframID ? `signed in as ${facts.wolframID}` : "not signed in"}; ` +
        `licence ${
          typeof facts.maxLicenseProcesses === "number"
            ? `${facts.maxLicenseProcesses} seat${facts.maxLicenseProcesses === 1 ? "" : "s"}`
            : facts.maxLicenseProcesses === "unlimited"
              ? "unlimited"
              : "seat count unknown"
        }.`,
    );
  } else {
    lines.push("No facts cached yet: they are read on the first kernel start.");
  }
  const cached = config.cacheEnabled
    ? readCache(cacheKey(install.bin, install.version, config.serverName, config.flavour.digest))
    : null;
  lines.push(
    cached
      ? `Tool list cached ${age(cached.cachedAt)}; no kernel starts until a tool is called.`
      : `No tool list cached: the first tool listing starts one kernel to learn it.`,
  );
  return lines.join("\n");
}

/**
 * Every variable this server reads, so `doctor` can answer "what is in effect?".
 *
 * It used to list eleven and omit ten, and the ten it omitted were the whole
 * sharing and licence section — precisely where someone who cannot start a
 * kernel is looking. A check in the suite now fails when this drifts from
 * `loadConfig`.
 */
const CONFIG_VARS = [
  // Discovery
  "WOLFRAM_MCP_KERNEL",
  "WOLFRAM_KERNEL_PATH",
  "WOLFRAM_MCP_VERSION",
  "WOLFRAM_MCP_MIN_VERSION",
  "WOLFRAM_MIN_VERSION",
  "WOLFRAM_INSTALLATION_DIRECTORY",
  "WOLFRAM_HOME",
  // Which server, and how long to wait
  "WOLFRAM_MCP_SERVER_NAME",
  "MCP_SERVER_NAME",
  "WOLFRAM_MCP_DEFAULT_SERVER",
  "WOLFRAM_MCP_IDLE_MINUTES",
  "WOLFRAM_IDLE_MINUTES",
  "WOLFRAM_MCP_START_TIMEOUT_SECONDS",
  "WOLFRAM_START_TIMEOUT_SECONDS",
  "WOLFRAM_MCP_CALL_TIMEOUT_SECONDS",
  "WOLFRAM_CALL_TIMEOUT_SECONDS",
  // Caching, sharing and the licence
  "WOLFRAM_MCP_CACHE",
  "WOLFRAM_MCP_SHARE",
  "WOLFRAM_MCP_RUNTIME_DIR",
  // The kernel's own startup options, where an entitlement arrives. Listed by
  // name only, like every variable here: its value holds the entitlement ID.
  "WOLFRAMINIT",
  "WOLFRAM_MCP_MAX_KERNELS",
  "WOLFRAM_MCP_RESERVE_SEATS",
  "WOLFRAM_MCP_LICENSE_LIMIT",
  "WOLFRAM_MCP_INSPECT",
  "WOLFRAM_MCP_KERNEL_ENV",
  "WOLFRAM_MCP_LOG",
  // Read by the lsp subcommand the Claude Code plugin runs, not by this
  // server. Reported because "code intelligence is off and nothing
  // says why" is otherwise untraceable to a variable someone set and forgot.
  "WOLFRAM_MCP_LSP",
  // Not read by this server at all: AgentTools reads it from the kernel's
  // environment and it decides each tool's effective options, including the
  // evaluator's TimeConstraint. Reported because a user debugging a timeout has
  // otherwise no way to see that it is in effect.
  "MCP_TOOL_OPTIONS",
  // Also not ours: AgentTools reads these from the kernel's environment, which
  // inherits this one. Reported because "the tools behave strangely" is
  // otherwise untraceable to a variable someone set and forgot.
  "WOLFRAM_CLOUDBASE",
  "LLMKIT_ENABLED",
  "MCP_APPS_ENABLED",
  "MCP_APPS_NOTEBOOK_METHOD",
];

/** @returns process exit code: 0 when a kernel answered, 1 otherwise. */
export async function runDoctor(): Promise<number> {
  const out = (line = "") => process.stdout.write(`${line}\n`);
  // Kernel chatter is interleaved into the report rather than sent to stderr.
  const log = (message: string) => out(`    ${message}`);
  const config = loadConfig((message) => out(`  ! ${message}`));

  out();
  out(`${PKG.name} ${PKG.version}`);
  out(`node ${process.version} on ${process.platform}/${process.arch}`);
  out();

  out("Configuration");
  out(
    `  serverName            ${config.serverName}   (valid: ${Object.keys(MCP_SERVERS).join(", ")})`,
  );
  out(`  minimum version    ${config.minVersion}`);
  out(`  idle shutdown      ${idleText(config.idleMs)}`);
  out(`  start timeout      ${budgetText(config.startTimeoutMs)}`);
  out(`  call timeout       ${budgetText(config.callTimeoutMs)}`);
  out(`  tools/list cache   ${config.cacheEnabled ? "enabled" : "disabled"}`);
  const set = CONFIG_VARS.filter((name) => process.env[name]);
  out(`  environment        ${set.length ? set.join(", ") : "(nothing set, using defaults)"}`);
  out();

  out("Installations found");
  const all = listKernels();
  if (all.length === 0) {
    out("  (none)");
  } else {
    for (const candidate of all) {
      const usable =
        candidate.version === null || compareVersions(candidate.version, config.minVersion) >= 0;
      out(`  ${usable ? " " : "-"} ${candidate.version ?? "unknown"}  ${candidate.bin}`);
    }
    out(`  ("-" marks installs below the ${config.minVersion} minimum)`);
  }
  out();

  const install = locateKernel({
    override: config.kernelPath,
    version: config.version,
    minVersion: config.minVersion,
    log: (message) => out(`  ! ${message}`),
  });

  out("Selected kernel");
  if (!install) {
    out("  none");
    out();
    // Nothing installed at all is a different problem from nothing new enough,
    // and leading with the version floor sent the first kind looking for an
    // upgrade to an installation they did not have.
    if (all.length === 0) {
      out("No Wolfram installation was found. The free Wolfram Engine is at");
      out("  https://www.wolfram.com/engine/");
      out(`It needs ${config.minVersion} or newer. If one is installed somewhere unusual, point`);
    } else {
      out(`Wolfram/AgentTools requires a kernel of at least ${config.minVersion}. To use one that`);
      out("is installed somewhere unusual, point");
    }
    out("WOLFRAM_MCP_KERNEL at the installation or kernel executable, e.g.");
    out(`  WOLFRAM_MCP_KERNEL=${exampleKernelPath()}`);
    out();
    return 1;
  }
  out(`  binary   ${install.bin}`);
  out(`  version  ${install.version ?? "unknown (not read without starting a kernel)"}`);
  out(`  via      ${install.source}`);
  // doctor is the only caller that may ask wolframscript, because it is the
  // only one a user ran on purpose. What that cost a kernel to learn is kept,
  // so a session — which never asks — finds this installation by reading it.
  if (install.startedKernel) {
    out(
      writeDiscoveryHint(install)
        ? "  recorded, so sessions find this kernel without asking wolframscript"
        : "  ! could not record it; sessions will not find this kernel on their own",
    );
  }
  out();

  out("Capability cache");
  // The key this configuration would read, not "the cache": there is a file per
  // kernel and server name, so naming a directory would not answer the question
  // a stuck user is asking.
  const key = cacheKey(
    install.bin,
    install.version ?? null,
    config.serverName,
    config.flavour.digest,
  );
  out(`  file     ${capabilityFile(key)}`);
  // Which sessions this one will share kernels with. A digest alone answers
  // "why did that other project not share?" only if you can see what went into
  // it, so the names that carried a value are listed beside it.
  const flavourVars = Object.keys(config.flavour.env);
  out(
    `  flavour  ${config.flavour.digest} (${
      flavourVars.length ? flavourVars.join(", ") : "defaults only"
    })`,
  );
  const cached = readCache(key);
  if (!cached) {
    out("  state    absent or expired");
  } else {
    out(`  state    ${cached.tools.length} tools, ${cached.prompts.length} prompts`);
    out(`  for      ${cached.serverName} @ ${cached.kernelPath}`);
    out(`  written  ${new Date(cached.cachedAt).toISOString()}`);
  }
  out();

  out("Kernel sharing");
  if (!config.share) {
    out("  disabled (WOLFRAM_MCP_SHARE=0); each session uses its own kernel");
  } else {
    const { brokerLaunch } = await import("./backend.js");
    const { BrokerBackend } = await import("./broker-client.js");
    // The same launch options the server uses, so this reports on the broker
    // the server would attach to rather than one of doctor's own making.
    // "!" is for what someone should act on. Attaching to a running broker, or
    // starting the first one, is the normal case and was marked like a fault
    // (found running it from Claude Desktop).
    const routine = /^(attached to the broker|no broker listening; starting one)/;
    const launch = brokerLaunch(config, install, (message) =>
      out(routine.test(message) ? `    ${message}` : `  ! ${message}`),
    );
    out(`  socket   ${launch.address}`);
    const broker = await BrokerBackend.open(launch);
    if (!broker) {
      out("  could not attach to a broker; sessions will use private kernels");
    } else {
      try {
        const status = await broker.status();
        const permitted =
          status.licence === null ? "not yet read" : String(status.licence.maxProcesses);
        out(`  broker   pid ${status.pid}, ${status.connections} session(s) attached`);
        out(`  kernels  ${status.kernels} running, ${status.busy} busy, budget ${status.budget}`);
        out(
          `  licence  $MaxLicenseProcesses = ${permitted}` +
            (status.licence?.type ? ` (${status.licence.type})` : ""),
        );
        // The one number in this block that does not come from the broker.
        // Printed like the others, it read as the running broker's reserve when
        // it is only this process's — and the pool settings belong to whichever
        // session started the broker (S4's remnant, plan.md §5.3). Same mistake
        // as the wolfram_status cache line: a local value dressed as a remote
        // fact. Say whose it is instead of quietly implying — and decide by the
        // broker's own pid, because a spawn that lost the bind race attaches to
        // another session's winner.
        out(
          broker.spawnedHere(status.pid)
            ? `  reserve  ${config.reserveSeats} seat(s) left free for interactive use` +
                ` (this run started the broker, so its settings are these)`
            : `  reserve  this run would use ${config.reserveSeats}; the running broker` +
                ` was started by another session and keeps its own`,
        );
      } catch (err) {
        out(`  broker did not answer: ${errorText(err)}`);
      } finally {
        await broker.stop();
      }
    }
  }
  out();

  out("Starting the kernel");
  // Facts only a running kernel knows, reported by the kernel this starts
  // rather than by a probe kernel of its own (plugin plan D20), so doctor too
  // costs one seat. The paclet version is the direct answer to "why does every
  // call time out"; the account is the one degraded state that looks
  // completely healthy.
  let reported: KernelFacts | null = null;
  const session = new KernelSession({
    bin: install.bin,
    serverName: config.serverName,
    idleMs: 0,
    startTimeoutMs: config.startTimeoutMs,
    clientInfo: { name: `${PKG.name}-doctor`, version: PKG.version },
    log,
    // The same environment the server would give a kernel. Without it `doctor`
    // can succeed where the server fails, or fail where it succeeds — which is
    // the one thing a diagnostic must never do.
    extraEnv: installationEnv(install.bin, config.inspect),
    // WOLFRAM_MCP_INSPECT=0 means the report is not used at all, here included,
    // or doctor would show facts the server it diagnoses ignores.
    onFacts: (facts, chosen) => {
      if (!config.inspect) return;
      reported = facts;
      recordFacts(install.bin, facts, chosen, log);
    },
  });

  let code: number;
  try {
    const startedAt = Date.now();
    const result = await session.run(async (client: Client, request) => {
      const caps = client.getServerCapabilities() ?? {};
      const tools = await listAllTools(client, request);
      return { caps, tools, info: client.getServerVersion() };
    });
    const elapsed = elapsedText(Date.now() - startedAt);
    out();
    out(`  ok, ${elapsed}`);
    out(`  upstream      ${result.info?.name ?? "?"} ${result.info?.version ?? ""}`.trimEnd());
    out(`  capabilities  ${Object.keys(result.caps).join(", ") || "(none)"}`);
    out(`  tools         ${result.tools.map((tool) => tool.name).join(", ") || "(none)"}`);
    out();
    code = 0;
  } catch (err) {
    out();
    out("  failed:");
    for (const line of errorText(err).split("\n")) out(`  ${line}`);
    out();
    code = 1;
  } finally {
    await session.stop();
  }

  out("Installation facts");
  // A kernel that died before reporting — unactivated, or refused a seat — says
  // nothing, so what an earlier one reported is the next best thing, marked.
  const cachedFacts = reported === null && config.inspect ? readFacts(install.bin) : null;
  const facts: KernelFacts | null = reported ?? cachedFacts;
  if (!facts) {
    out(
      config.inspect
        ? "  not reported: the kernel did not get far enough to say"
        : "  not used (WOLFRAM_MCP_INSPECT=0)",
    );
  } else {
    if (cachedFacts) out("  ! not reported by this kernel; cached from an earlier one");
    out(`  AgentTools       ${facts.agentTools ?? "absent — every tool call will fail"}`);
    out(
      `  Wolfram Account  ${
        facts.wolframID ?? "not signed in — cloud-backed tools will fail on their own"
      }`,
    );
    out(`  cloud connected  ${facts.cloudConnected ? "yes" : "no"}`);
    out(
      `  licence          ${facts.maxLicenseProcesses} seat(s)${
        facts.licenseType ? ` (${facts.licenseType})` : ""
      }`,
    );
  }
  out();
  return code;
}
