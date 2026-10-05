/**
 * What a running kernel knows about its installation, cached to disk.
 *
 * Several things we need can only be answered by a running kernel: the licence
 * seat limit is encoded in the password token rather than stored in plain text,
 * and `$BaseDirectory` / `$UserBaseDirectory` / `$LocalBase` are computed. These
 * used to come from a one-off probe — a plain kernel started for the purpose —
 * so a cold machine started two kernels in a row, the probe and then the one
 * that served, on licences that permit two or four. And because the answer was
 * kept until the binary changed, a paclet that updated itself left the cached
 * AgentTools version stale (plugin plan D20).
 *
 * So every MCP kernel now reports these itself: `KERNEL_ARGS` in kernel.ts runs
 * `FACTS_EXPRESSION` after AgentTools loads and before the server starts, and
 * the session records the answer on every start. Written before the server
 * starts, it still arrives when the paclet then fails, which is when a
 * diagnosis is most useful; a kernel that dies earlier, unactivated or refused
 * a seat, reports nothing, as the probe did not either.
 */
import { createHash } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { cacheDir } from "./cache.js";
import type { Logger } from "./log.js";

const CACHE_FORMAT = 2;

/** Markers around the payload, so kernel banner noise can be discarded. */
const OPEN = "<<WMCPFACTS>>";
const CLOSE = "<<END>>";

/**
 * Written by every kernel before its server starts. One line of JSON between
 * markers, ended by a newline so the transport hands it over as a line of its
 * own, and so a licence banner or a stray message cannot corrupt it. Evaluated
 * after AgentTools has loaded, so `agentTools` is the version that will serve,
 * including one the paclet manager has just updated to.
 */
export const FACTS_EXPRESSION = `WriteString["stdout","${OPEN}",ExportString[<|
  "version"->TextString[$VersionNumber]<>"."<>ToString[$ReleaseNumber],
  "systemID"->$SystemID,
  "base"->$BaseDirectory,
  "userBase"->$UserBaseDirectory,
  "localBase"->ExpandFileName[LocalObject[$LocalBase]],
  "maxLicenseProcesses"->If[$MaxLicenseProcesses===Infinity,"unlimited",ToString[$MaxLicenseProcesses]],
  "licenseType"->$LicenseType,
  "networkLicense"->TrueQ[$NetworkLicense],
  "agentTools"->Replace[PacletObject["Wolfram/AgentTools"]["Version"],Except[_String]->None],
  "wolframID"->ToString[$WolframID],
  "cloudConnected"->TrueQ[$CloudConnected]
|>,"JSON","Compact"->True],"${CLOSE}\\n"]`;

export interface KernelFacts {
  /** Dotted version, e.g. "15.1.0". */
  version: string;
  systemID: string;
  /** $BaseDirectory, passed to kernels as WOLFRAM_BASE. */
  base: string;
  /** $UserBaseDirectory, passed as WOLFRAM_USERBASE. */
  userBase: string;
  /** Expanded $LocalBase, passed as WOLFRAM_LOCALBASE. */
  localBase: string;
  /**
   * Licence seats, `"unlimited"`, or `"unknown"` when the kernel did not give a
   * readable answer. Unknown is deliberately not folded into unlimited: the
   * pool would then grow to its cap on exactly the machines we understand
   * least. See `deriveBudget` in pool.ts.
   */
  maxLicenseProcesses: number | "unlimited" | "unknown";
  licenseType: string | null;
  networkLicense: boolean;
  /**
   * The Wolfram Account this kernel is signed in as, or null.
   *
   * Nothing detected this before, and it is the one degraded state that looks
   * healthy: the server starts, `doctor` says ok, `WolframLanguageEvaluator`
   * works, and anything cloud-backed fails with whatever the kernel says about
   * missing credentials — passed through as a successful tool call.
   */
  wolframID: string | null;
  /** Whether the kernel has a live cloud connection. */
  cloudConnected: boolean;
  /** Installed Wolfram/AgentTools version, or null when absent. */
  agentTools: string | null;
}

interface CachedFacts extends KernelFacts {
  format: number;
  /** Identity of the binary these facts describe. */
  binary: string;
  binaryMtimeMs: number;
  binarySize: number;
  probedAt: number;
}

function factsFile(bin: string): string {
  const digest = createHash("sha256").update(bin).digest("hex").slice(0, 16);
  return join(cacheDir(), "installations", `${digest}.json`);
}

function binaryIdentity(bin: string): { mtimeMs: number; size: number } | null {
  try {
    const stat = statSync(bin);
    return { mtimeMs: Math.round(stat.mtimeMs), size: stat.size };
  } catch {
    return null;
  }
}

/**
 * A probed version in dotted form, or null when it is not one.
 *
 * The probe used to build the version with ToString[$VersionNumber], which is
 * "15." on a .0 release, so every 15.0 installation cached "15..0" — and
 * readFacts accepted it, so fixing the probe alone left those entries in place
 * until the binary changed. The empty segment is the only damage that probe
 * could do, so it is repaired; anything else malformed is not a version we can
 * reason about, and the entry reads as absent.
 */
function normaliseVersion(version: unknown): string | null {
  if (typeof version !== "string") return null;
  const repaired = version.replace(/\.\./g, ".0.");
  return /^\d+(\.\d+)*$/.test(repaired) ? repaired : null;
}

/** Facts read back from the cache, with when a kernel reported them. */
export type CachedKernelFacts = KernelFacts & { probedAt: number };

/** Cached facts for this binary, or null when absent, stale or malformed. */
export function readFacts(bin: string): CachedKernelFacts | null {
  const identity = binaryIdentity(bin);
  if (!identity) return null;
  try {
    const entry = JSON.parse(readFileSync(factsFile(bin), "utf8")) as CachedFacts;
    if (entry.format !== CACHE_FORMAT) return null;
    if (entry.binary !== bin) return null;
    // An in-place upgrade keeps the path, so identity is what matters.
    if (entry.binaryMtimeMs !== identity.mtimeMs) return null;
    if (entry.binarySize !== identity.size) return null;
    const version = normaliseVersion(entry.version);
    if (version === null) return null;
    return { ...entry, version };
  } catch {
    return null;
  }
}

function writeFacts(bin: string, facts: KernelFacts): void {
  const identity = binaryIdentity(bin);
  if (!identity) return;
  const file = factsFile(bin);
  const temp = `${file}.${process.pid}.tmp`;
  try {
    mkdirSync(dirname(file), { recursive: true });
    const entry: CachedFacts = {
      ...facts,
      format: CACHE_FORMAT,
      binary: bin,
      binaryMtimeMs: identity.mtimeMs,
      binarySize: identity.size,
      probedAt: Date.now(),
    };
    writeFileSync(temp, `${JSON.stringify(entry, null, 2)}\n`);
    renameSync(temp, file);
  } catch {
    try {
      unlinkSync(temp);
    } catch {
      /* nothing to clean up */
    }
  }
}

/** Whether a line of kernel output carries the facts, before parsing it. */
export function isFactsLine(line: string): boolean {
  return line.includes(OPEN);
}

/** The facts in a line of kernel output, or null when it holds none readable. */
export function parseFacts(stdout: string): KernelFacts | null {
  const start = stdout.indexOf(OPEN);
  const end = stdout.indexOf(CLOSE, start + OPEN.length);
  if (start === -1 || end === -1) return null;
  try {
    const raw = JSON.parse(stdout.slice(start + OPEN.length, end)) as Record<string, unknown>;
    const limit = raw["maxLicenseProcesses"];
    const parsed = typeof limit === "string" ? Number.parseInt(limit, 10) : Number.NaN;
    const text = (value: unknown): string => (typeof value === "string" ? value : "");
    return {
      version: text(raw["version"]),
      systemID: text(raw["systemID"]),
      base: text(raw["base"]),
      userBase: text(raw["userBase"]),
      localBase: text(raw["localBase"]),
      maxLicenseProcesses:
        limit === "unlimited"
          ? "unlimited"
          : Number.isFinite(parsed) && parsed > 0
            ? parsed
            : "unknown",
      licenseType: typeof raw["licenseType"] === "string" ? raw["licenseType"] : null,
      networkLicense: raw["networkLicense"] === true,
      agentTools: typeof raw["agentTools"] === "string" ? raw["agentTools"] : null,
      // An unsigned-in kernel answers with the symbol None, which arrives here
      // as the string "None" rather than as an absent field.
      wolframID:
        typeof raw["wolframID"] === "string" &&
        raw["wolframID"] !== "" &&
        raw["wolframID"] !== "None"
          ? raw["wolframID"]
          : null,
      cloudConnected: raw["cloudConnected"] === true,
    };
  } catch {
    return null;
  }
}

/**
 * Keep what a kernel reported, and say so. Called on every kernel start, so the
 * cache follows the installation as it changes — a paclet update included —
 * rather than freezing at the first answer.
 *
 * Only a report from a kernel whose environment chose none of kernel.ts's
 * `SHAPING_VARS` describes the installation; any other is that configuration's
 * own, and the cache is keyed by the binary alone and read by every session.
 * One place for that rule, so the broker, a private kernel and doctor cannot
 * disagree about it.
 */
export function recordFacts(bin: string, facts: KernelFacts, chosen: string[], log: Logger): void {
  if (chosen.length > 0) {
    log(`reported facts for its own configuration (${chosen.join(", ")}); not the installation's`);
    return;
  }
  log(
    `reported ${facts.version}, licence ${facts.maxLicenseProcesses}` +
      `${facts.licenseType ? ` (${facts.licenseType})` : ""}` +
      `, AgentTools ${facts.agentTools ?? "absent"}` +
      `, account ${facts.wolframID ?? "not signed in"}`,
  );
  writeFacts(bin, facts);
}

/**
 * The installation environment a kernel needs, from what an earlier kernel
 * reported.
 *
 * The one owner of this decision, deliberately. It used to be assembled three
 * different ways — the CLI read the cache but never filled it, the broker filled
 * it only as a side effect of looking up the licence, and `doctor` did not set
 * it at all — so whether a kernel could find `Wolfram/AgentTools` depended on
 * which of three unrelated flags you had set.
 *
 * Empty before any kernel has reported, and that costs nothing: the first
 * kernel inherits the environment the facts would have been computed in, so it
 * arrives at the same directories itself. `allowInspect` off means the facts
 * are not used at all.
 */
export function installationEnv(bin: string, allowInspect: boolean): Record<string, string> {
  if (!allowInspect) return {};
  return baseDirectoryEnv(readFacts(bin));
}

/**
 * Forget every installation's reported facts.
 *
 * `clear-cache` used to remove the tool list and leave these behind, so
 * "forgetting the cache" left the licence seat count, the base directories and
 * the paclet version in place — the answers most worth re-reading after moving
 * or upgrading an installation.
 *
 * @returns the directory removed, for reporting.
 */
export function clearFacts(): string {
  const dir = join(cacheDir(), "installations");
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    // Never existed, or is not ours to remove.
  }
  return dir;
}

/** The three variables Wolfram's own generated config sets explicitly. */
export function baseDirectoryEnv(facts: KernelFacts | null): Record<string, string> {
  if (!facts) return {};
  const env: Record<string, string> = {};
  if (facts.base) env["WOLFRAM_BASE"] = facts.base;
  if (facts.userBase) env["WOLFRAM_USERBASE"] = facts.userBase;
  if (facts.localBase) env["WOLFRAM_LOCALBASE"] = facts.localBase;
  return env;
}
