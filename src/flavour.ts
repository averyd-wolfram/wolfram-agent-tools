/**
 * What makes two kernels interchangeable.
 *
 * A kernel is not a blank slate: the paclet reads its environment at startup, so
 * two kernels started from different environments can answer the same call
 * differently. `MCP_TOOL_OPTIONS` is the clearest case — it sets each tool's
 * effective options, including `WolframLanguageEvaluator`'s `TimeConstraint` —
 * and it is a user setting this server may neither assume nor override.
 *
 * Sharing ignored all of that. Two sessions with the same `MCP_SERVER_NAME`
 * shared a broker, and the broker's kernels inherited whichever session happened
 * to spawn it. Measured: session A asked for a `TimeConstraint` of 600 and
 * session B for 10, and B's calls ran with 600.
 *
 * So a *flavour* is the set of values that decide what a kernel is. Kernels of
 * one flavour are interchangeable and shared as widely as possible; a session
 * whose flavour differs gets its own kernel rather than somebody else's. Where we
 * cannot tell, we do not share — a wasted seat is recoverable, a call that
 * silently ran under another project's settings is not.
 */
import { createHash } from "node:crypto";

/**
 * The variables that decide what a kernel is.
 *
 * Not a guess: every `MCP_*`, `LLMKIT_*` and `WOLFRAM_CLOUDBASE` name here is one
 * the paclet itself reads through `Environment[...]`, and
 * `agenttools-env-reads-are-known` in the `.wlt` fails if a paclet upgrade adds
 * another, so whether it belongs here is decided by a person rather than by
 * omission.
 *
 * The `WOLFRAM_*BASE` trio is ours: `installationEnv` derives it, an explicit
 * value in the session's environment overrides it, and it decides where the
 * kernel finds its paclets and the user's own configuration.
 *
 * `WOLFRAMINIT` is the kernel's own: it reads it for command-line options at
 * startup, which is how an on-demand licence entitlement reaches a kernel this
 * server starts. Two sessions on two entitlements shared one broker, and the
 * second's kernels ran on — and billed — the first's.
 *
 * Deliberately absent, though the paclet reads them: `SystemRoot` is a Windows
 * system path, identical for every session on a machine, and `GITHUB_SHA` and
 * `BUILD_VCS_NUMBER_...` are build provenance the paclet reports rather than acts
 * on. Keying on those would spend a licence seat to tell apart two kernels that
 * behave identically.
 */
export const FLAVOUR_VARS: readonly string[] = [
  "MCP_SERVER_NAME",
  "MCP_TOOL_OPTIONS",
  "MCP_APPS_ENABLED",
  "MCP_APPS_NOTEBOOK_METHOD",
  "LLMKIT_ENABLED",
  "WOLFRAM_CLOUDBASE",
  "WOLFRAM_BASE",
  "WOLFRAM_USERBASE",
  "WOLFRAM_LOCALBASE",
  "WOLFRAMINIT",
];

/**
 * Extra variables the user says matter, comma-separated.
 *
 * `FLAVOUR_VARS` covers what the paclet reads, which is everything a built-in
 * server can see. A server the user built themselves may read anything at all,
 * and this package cannot know what — so it can be told. Names given here join
 * the flavour, and two sessions that disagree about one of them stop sharing a
 * kernel.
 */
export const FLAVOUR_VARS_ENV = "WOLFRAM_MCP_KERNEL_ENV";

export interface KernelFlavour {
  /**
   * Every name considered, whether or not it carried a value.
   *
   * Needed to build a kernel's environment *exactly*: a broker's own environment
   * is whatever its spawning session had, so a variable this flavour leaves
   * unset has to be removed rather than inherited from there. Without that, a
   * session that sets nothing would still get the spawner's value.
   */
  names: readonly string[];
  /** The values themselves, to hand to a kernel started for this flavour. */
  env: Record<string, string>;
  /** A stable digest of those values, for comparing two flavours cheaply. */
  digest: string;
}

/**
 * An environment value as every reader here takes it: trimmed, with blank and
 * an unsubstituted `${...}` — what an MCP Bundle host passes through for an
 * option nobody filled in — meaning unset. One rule, because the broker's
 * address, the flavour its kernels start with and the licence it assumes
 * disagreed when each spelled its own: a literal `${user_config.entitlement}`
 * was no entitlement to the address and the kernel, and one to the licence.
 */
export function settingValue(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  return value && !/^\$\{.*\}$/.test(value) ? value : undefined;
}

/**
 * Read a flavour out of an environment.
 *
 * Blank and unsubstituted `${...}` values are treated as absent, exactly as
 * `readEnv` in `config.ts` treats them, so a session setting
 * `MCP_TOOL_OPTIONS=""` shares with one that leaves it unset. Those are the same
 * kernel; only the spelling differs.
 */
export function kernelFlavour(source: NodeJS.ProcessEnv = process.env): KernelFlavour {
  const declared = (source[FLAVOUR_VARS_ENV] ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  const names = [...new Set([...FLAVOUR_VARS, ...declared])].sort();

  const env: Record<string, string> = {};
  for (const name of names) {
    const value = settingValue(source[name]);
    if (value !== undefined) env[name] = value;
  }

  // Sorted for stability, and NUL-separated so no value can spell out a
  // different set of pairs than the one it belongs to.
  const digest = createHash("sha256")
    .update(
      Object.keys(env)
        .sort()
        .map((name) => `${name}=${env[name]}`)
        .join("\u0000"),
    )
    .digest("hex")
    .slice(0, 16);

  return { names, env, digest };
}

/**
 * The environment a kernel of this flavour must be started with.
 *
 * Every name the flavour considered is stripped from `base` before the flavour's
 * own values are applied, so the result is exactly what the flavour says and
 * nothing the broker happened to be started with. That asymmetry is the whole
 * point: a shared broker's environment belongs to whichever session spawned it,
 * and letting it show through is how one project's settings reached another's
 * calls.
 */
export function applyFlavour(base: NodeJS.ProcessEnv, flavour: KernelFlavour): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...base };
  for (const name of flavour.names) delete env[name];
  return { ...env, ...flavour.env };
}
