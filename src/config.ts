/**
 * Environment-driven configuration.
 *
 * Every knob is an environment variable so the server can be dropped into any
 * MCP client config as a bare command with an `env` block and no arguments.
 */
import { kernelFlavour, type KernelFlavour } from "./flavour.js";
import type { Logger } from "./log.js";

/**
 * The built-in MCP servers Wolfram/AgentTools exposes, and the capabilities
 * each one offers.
 *
 * These are the names `MCPServerObject` resolves and that `StartMCPServer`
 * accepts, so the vocabulary here is the paclet's own: a *server name*, carried
 * in `MCP_SERVER_NAME`, not a "profile" of our invention.
 *
 * The flags record what each server was measured to offer against AgentTools
 * 2.2.7 — all four advertise prompts (at least `Search`), none advertise
 * resources — and are documentation, not a promise. They are deliberately *not*
 * what gets advertised at `initialize`: capabilities are fixed for the life of
 * a session, so declaring a capability the server cannot yet serve is a
 * protocol violation whichever way it is resolved. A cold first run therefore
 * offers tools only and picks prompts up from the cache once a kernel has
 * actually reported them.
 */
export const MCP_SERVERS = {
  Wolfram: { prompts: true, resources: false },
  WolframLanguage: { prompts: true, resources: false },
  WolframAlpha: { prompts: true, resources: false },
  WolframPacletDevelopment: { prompts: true, resources: false },
} as const satisfies Record<string, UpstreamCapabilities>;

export interface UpstreamCapabilities {
  prompts: boolean;
  resources: boolean;
}

export const DEFAULT_SERVER_NAME = "Wolfram";

/**
 * The lowest `WolframVersion` any Wolfram/AgentTools release declares: stable
 * 2.2.0 says "14.3+", while the experimental 2.2.7 says "15.0+". The paclet
 * manager picks a release to suit the kernel, so the newest release's
 * requirement is not the floor — the `.wlt`'s min-version-floor-is-not-too-low
 * reads the whole set for that reason. Older kernels load far enough to run,
 * then die with `Get::noopen: Cannot open Wolfram`AgentTools`` and hang until
 * the start timeout, so they are filtered out during discovery rather than
 * diagnosed later.
 */
export const DEFAULT_MIN_VERSION = "14.3";

export interface Config {
  /** Explicit kernel path, unresolved. `undefined` means auto-detect. */
  kernelPath: string | undefined;
  /**
   * Which built-in AgentTools server to expose, e.g. "WolframLanguage". Passed
   * to the kernel as `MCP_SERVER_NAME`, which `StartMCPServer[]` reads itself.
   */
  serverName: string;
  /** Pin auto-detection to this version, matched as a dotted prefix. */
  version: string | undefined;
  minVersion: string;
  idleMs: number;
  startTimeoutMs: number;
  callTimeoutMs: number;
  /** Serve tools/list from disk before the first kernel start. */
  cacheEnabled: boolean;
  /** Share kernels with other sessions through a broker. */
  share: boolean;
  /** Hard cap on pooled kernels. Unset means derive it from the licence. */
  maxKernels: number | undefined;
  /** Licence seats to leave free for interactive use. */
  reserveSeats: number;
  /**
   * What the licence permits, when you would rather say than have us look.
   * A number, or "unlimited". Unset means inspect the installation once and
   * cache the answer.
   */
  licenseLimit: number | "unlimited" | undefined;
  /** Use what kernels report about the installation: licence, directories. */
  inspect: boolean;
  /**
   * What decides whether this session's kernels are interchangeable with
   * another's. Read from the environment once, over the *resolved* server name,
   * so two sessions spelling `wolframalpha` differently still share.
   */
  flavour: KernelFlavour;
}

/**
 * Read the first environment variable that carries a real value.
 *
 * Treats three things as "unset": missing, blank, and an unsubstituted
 * `${...}` template. The last one matters because an MCP Bundle host that
 * leaves an optional `user_config` value blank can pass the placeholder
 * through verbatim, and a literal `${user_config.server_name}` reaching the
 * kernel as a serverName name costs a full start timeout to diagnose.
 */
function readEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const raw = process.env[name];
    if (raw === undefined) continue;
    const value = raw.trim();
    if (!value) continue;
    if (/^\$\{.*\}$/.test(value)) continue;
    return value;
  }
  return undefined;
}

function readNumber(fallback: number, ...names: string[]): number {
  const raw = readEnv(...names);
  if (raw === undefined) return fallback;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function readBoolean(fallback: boolean, ...names: string[]): boolean {
  const raw = readEnv(...names)?.toLowerCase();
  if (raw === undefined) return fallback;
  if (["0", "false", "no", "off"].includes(raw)) return false;
  if (["1", "true", "yes", "on"].includes(raw)) return true;
  return fallback;
}

/**
 * Map a requested serverName onto a built-in one where it names one, and
 * otherwise take it as given.
 *
 * `MCP_SERVERS` is the paclet's *built-in* set, not its vocabulary. A name may
 * also be a server the user built themselves — the paclet looks for
 * `$UserBaseDirectory/ApplicationData/Wolfram/AgentTools/Servers/<name>/Metadata.wxf`
 * *before* it looks at the built-ins, so a user server can even shadow one — or
 * a paclet-qualified `Publisher/Server`, which any paclet can declare through an
 * `AgentTools` extension and which the paclet will resolve from the repository
 * even when it is not installed yet.
 *
 * So substituting the default for every unrecognised name, which is what this
 * did, silently handed the caller a different server: someone's own server
 * became the three built-in `Wolfram` tools, with one line on stderr and no
 * error anywhere. That is the silent substitution `docs/plan.md` §7 decision 1
 * rules out for every other kind of explicit configuration.
 *
 * The original worry was real — a name the paclet cannot resolve does not fail,
 * it runs on as a non-server, and the only thing that ended the wait was the
 * start timeout. That is now diagnosed from the kernel's own message instead:
 * see `SERVER_NOT_FOUND` in `kernel.ts`.
 */
export function resolveServerName(requested: string | undefined, log: Logger): string {
  if (requested === undefined) return DEFAULT_SERVER_NAME;

  const names = Object.keys(MCP_SERVERS);
  const exact = names.find((name) => name === requested);
  if (exact) return exact;

  const insensitive = names.find((name) => name.toLowerCase() === requested.toLowerCase());
  if (insensitive) {
    log(`serverName "${requested}" matched "${insensitive}"`);
    return insensitive;
  }

  // Passed through, not substituted: this is where a user-defined or
  // paclet-qualified server arrives, and only the kernel can say whether it
  // resolves.
  log(
    `serverName "${requested}" is not built in (${names.join(", ")}); ` +
      `passing it to the kernel as given`,
  );
  return requested;
}

export function loadConfig(log: Logger): Config {
  // MCP_SERVER_NAME first: it is the paclet's own variable, and the name
  // Wolfram's generated client configuration uses. WOLFRAM_MCP_DEFAULT_SERVER
  // is a packager's default, below both explicit names: the plugin sets it, so
  // an MCP_SERVER_NAME a user's environment already carries still wins, where
  // the plugin setting MCP_SERVER_NAME itself would have overwritten it.
  const serverName = resolveServerName(
    readEnv("MCP_SERVER_NAME", "WOLFRAM_MCP_SERVER_NAME", "WOLFRAM_MCP_DEFAULT_SERVER"),
    log,
  );
  return {
    kernelPath: readEnv("WOLFRAM_MCP_KERNEL", "WOLFRAM_KERNEL_PATH"),
    serverName,
    version: readEnv("WOLFRAM_MCP_VERSION"),
    minVersion: readEnv("WOLFRAM_MCP_MIN_VERSION", "WOLFRAM_MIN_VERSION") ?? DEFAULT_MIN_VERSION,
    idleMs: readNumber(10, "WOLFRAM_MCP_IDLE_MINUTES", "WOLFRAM_IDLE_MINUTES") * 60_000,
    startTimeoutMs:
      readNumber(120, "WOLFRAM_MCP_START_TIMEOUT_SECONDS", "WOLFRAM_START_TIMEOUT_SECONDS") * 1000,
    callTimeoutMs:
      readNumber(300, "WOLFRAM_MCP_CALL_TIMEOUT_SECONDS", "WOLFRAM_CALL_TIMEOUT_SECONDS") * 1000,
    cacheEnabled: readBoolean(true, "WOLFRAM_MCP_CACHE"),
    share: readBoolean(true, "WOLFRAM_MCP_SHARE"),
    maxKernels: (() => {
      const raw = readEnv("WOLFRAM_MCP_MAX_KERNELS");
      if (raw === undefined) return undefined;
      const parsed = Number.parseInt(raw, 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    })(),
    reserveSeats: Math.max(0, Math.round(readNumber(1, "WOLFRAM_MCP_RESERVE_SEATS"))),
    licenseLimit: (() => {
      const raw = readEnv("WOLFRAM_MCP_LICENSE_LIMIT");
      if (raw === undefined) return undefined;
      if (/^(unlimited|infinity|inf)$/i.test(raw)) return "unlimited" as const;
      const parsed = Number.parseInt(raw, 10);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
      log(
        `ignoring WOLFRAM_MCP_LICENSE_LIMIT="${raw}": expected a positive integer or "unlimited"`,
      );
      return undefined;
    })(),
    inspect: readBoolean(true, "WOLFRAM_MCP_INSPECT"),
    // Over the resolved name, because that is the one a kernel is started with.
    flavour: kernelFlavour({ ...process.env, MCP_SERVER_NAME: serverName }),
  };
}

/** The capabilities to assume for a serverName before any kernel has been seen. */
/**
 * What a server is known to offer, for diagnostics and documentation.
 *
 * Not for advertising: see `MCP_SERVERS`.
 */
export function knownCapabilitiesFor(serverName: string): UpstreamCapabilities {
  return (
    MCP_SERVERS[serverName as keyof typeof MCP_SERVERS] ?? { prompts: false, resources: false }
  );
}
