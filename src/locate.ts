/**
 * Cross-platform discovery of a locally installed Wolfram kernel.
 *
 * Resolution order:
 *   1. explicit path (WOLFRAM_MCP_KERNEL)
 *   2. a pinned version (WOLFRAM_MCP_VERSION)
 *   3. WOLFRAM_INSTALLATION_DIRECTORY / WOLFRAM_HOME
 *   4. the kernel wolframscript prefers (WOLFRAMSCRIPT_KERNELPATH, or its
 *      configuration file) — a deliberate choice, so it beats the scan
 *   5. platform scan, newest version wins
 *   6. `wolfram` or `WolframKernel` on PATH
 *      then the discovery hint `doctor` left, if step 7 is what found the kernel
 *   7. ask `wolframscript` where it lives — the one step that starts a kernel,
 *      so a caller that must not spend a seat turns it off (`allowWolframScript`)
 *
 * Version detection never starts a kernel: macOS reads
 * CFBundleShortVersionString from Info.plist, Windows and Linux read the
 * version directory name.
 */
import {
  accessSync,
  constants,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import os from "node:os";
import type { Logger } from "./log.js";
import { DEFAULT_MIN_VERSION } from "./config.js";
import { preferredKernel } from "./wolframscript.js";
import { cacheDir } from "./cache.js";

export interface KernelInstall {
  /** Absolute path to the kernel executable. */
  bin: string;
  /** Dotted version string, or null when it could not be read without starting a kernel. */
  version: string | null;
  /** Where this candidate came from, for diagnostics. */
  source: string;
  /**
   * Set when finding it started a kernel — step 7, `wolframscript -code`.
   * `doctor` records such a find as a discovery hint, so later sessions reach
   * the same kernel without starting one.
   */
  startedKernel?: true;
}

/** Compare dotted version strings numerically: "14.2.1.11454240" vs "15.0.0". */
export function compareVersions(
  a: string | null | undefined,
  b: string | null | undefined,
): number {
  const left = String(a ?? "0").split(".");
  const right = String(b ?? "0").split(".");
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const delta =
      (Number.parseInt(left[i] ?? "", 10) || 0) - (Number.parseInt(right[i] ?? "", 10) || 0);
    if (delta !== 0) return delta;
  }
  return 0;
}

/**
 * Paths to try inside a directory that might be an install root.
 *
 * Covers a macOS `.app` bundle, a Wolfram Engine nested Player bundle, an
 * `$InstallationDirectory` (which on macOS is the `Contents` folder), and the
 * Windows and Linux layouts.
 */
const KERNEL_PROBES: readonly string[][] = [
  ["Contents", "MacOS", "wolfram"],
  ["Contents", "MacOS", "WolframKernel"],
  ["Contents", "Resources", "Wolfram Player.app", "Contents", "MacOS", "WolframKernel"],
  ["MacOS", "wolfram"],
  ["MacOS", "WolframKernel"],
  ["Executables", "wolfram"],
  ["Executables", "WolframKernel"],
  ["wolfram.exe"],
  ["WolframKernel.exe"],
  ["wolfram"],
  ["WolframKernel"],
];

/**
 * Prefer the canonical `wolfram` name when it is the same program.
 *
 * On macOS `wolfram`, `MathKernel` and `WolframKernel` are all symlinks to one
 * binary — only `$CommandLine[[1]]` differs — and the other platforms mirror the
 * layout. Wolfram's own generated configuration invokes `wolfram`, so
 * normalising to it means the path we report matches the path users see
 * elsewhere. Purely cosmetic; any of the names works.
 */
function canonicalKernelName(bin: string): string {
  const alias = /(^|[\\/])(WolframKernel|MathKernel)(\.exe)?$/.exec(bin);
  if (!alias) return bin;
  const preferred = bin.replace(
    /(WolframKernel|MathKernel)(\.exe)?$/,
    (_m, _n, exe: string | undefined) => `wolfram${exe ?? ""}`,
  );
  return isExecutableFile(preferred) ? preferred : bin;
}

/**
 * The file a kernel path really names.
 *
 * A Linux install reaches `PATH` as a symlink — `/usr/local/bin/wolfram` →
 * `…/Wolfram/15.0/Executables/wolfram` — and the symlink's own path holds the
 * one fact discovery can get nowhere else without starting a kernel: the
 * version. Unresolved it reads as no version, `compareVersions` treats that as
 * 0, and the kernel was skipped as below the 14.3 floor by the very lookup that
 * found it. Resolving also keys the capability cache and the broker socket on
 * the installation rather than on whichever name reached it, so two sessions
 * arriving by different names share one broker instead of running two licence
 * budgets against one install.
 */
function realKernelPath(bin: string): string {
  try {
    return realpathSync(bin);
  } catch {
    // Raced away between the executability check and here, or a permission
    // wall mid-path; hand back the name we had and let the spawn report it.
    return bin;
  }
}

function isExecutableFile(path: string): boolean {
  try {
    if (!statSync(path).isFile()) return false;
  } catch {
    return false;
  }
  // The execute bit is meaningless on Windows; extension is what matters there.
  if (process.platform === "win32") return true;
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Turn whatever the user pointed at into an actual kernel executable.
 *
 * A file picker on macOS hands back `/Applications/Wolfram.app`, because the
 * OS presents a bundle as a single file. Spawning that directory fails with
 * EACCES, so the bundle is walked here instead.
 *
 * @returns the kernel executable, or null if none is reachable from `path`.
 */
export function resolveKernelBinary(path: string): string | null {
  const target = path.trim();
  if (!target || !existsSync(target)) return null;

  let isDirectory: boolean;
  try {
    isDirectory = statSync(target).isDirectory();
  } catch {
    return null;
  }

  if (!isDirectory) {
    return isExecutableFile(target) ? canonicalKernelName(realKernelPath(target)) : null;
  }

  for (const probe of KERNEL_PROBES) {
    const candidate = join(target, ...probe);
    // Real path first, canonical name second: the sibling `wolfram` is looked
    // for in the directory the kernel actually lives in, not beside a symlink.
    if (isExecutableFile(candidate)) return canonicalKernelName(realKernelPath(candidate));
  }
  return null;
}

/** Read CFBundleShortVersionString from a macOS bundle without starting a kernel. */
function plistVersion(appPath: string): string | null {
  const plist = join(appPath, "Contents", "Info.plist");
  if (!existsSync(plist)) return null;
  try {
    let xml = readFileSync(plist, "utf8");
    if (!xml.trimStart().startsWith("<?xml")) {
      xml = execFileSync("plutil", ["-convert", "xml1", "-o", "-", plist], {
        encoding: "utf8",
        timeout: 5000,
      });
    }
    const match = xml.match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function versionFromString(text: string): string | null {
  return text.match(/(\d+(?:\.\d+)+)/)?.[1] ?? null;
}

function safeReaddir(dir: string): string[] {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

/**
 * @param namedOnly restrict to bundles whose name starts Wolfram/Mathematica
 */
function scanDarwinBundles(namedOnly: boolean): KernelInstall[] {
  const found: KernelInstall[] = [];
  for (const root of ["/Applications", join(os.homedir(), "Applications")]) {
    for (const entry of safeReaddir(root)) {
      if (!entry.endsWith(".app")) continue;
      if (namedOnly && !/^(Wolfram|Mathematica)/i.test(entry)) continue;
      const app = join(root, entry);
      // A reachable kernel binary is the real filter: it rejects
      // WolframScript.app and other Wolfram-branded apps that are not installs.
      const bin = resolveKernelBinary(app);
      if (!bin) continue;
      found.push({
        bin,
        // The bundle name is only a fallback. An experimental build can be
        // called anything, so the Info.plist version is what counts.
        version: plistVersion(app) ?? versionFromString(entry) ?? "0",
        source: app,
      });
    }
  }
  return found;
}

/**
 * macOS installations.
 *
 * Tries name-matching bundles first because that is the common case and costs
 * well under a millisecond, then falls back to probing every bundle (~30 ms on a
 * machine with a hundred apps). The wider sweep exists because a build need not
 * be called "Wolfram" anything — an experimental or renamed bundle would
 * otherwise be invisible.
 */
function scanDarwin(): KernelInstall[] {
  const named = scanDarwinBundles(true);
  return named.length > 0 ? named : scanDarwinBundles(false);
}

function scanWin32(): KernelInstall[] {
  const found: KernelInstall[] = [];
  try {
    const out = execFileSync(
      "reg",
      ["query", "HKLM\\SOFTWARE\\Wolfram Research\\Installations", "/s"],
      { encoding: "utf8", timeout: 8000, windowsHide: true },
    );
    for (const match of out.matchAll(/ExecutablePath\s+REG_SZ\s+(.+)/g)) {
      const raw = match[1]?.trim();
      if (!raw) continue;
      const bin = resolveKernelBinary(raw);
      if (bin) found.push({ bin, version: versionFromString(bin) ?? "0", source: "registry" });
    }
  } catch {
    // Registry unreadable; the filesystem scan below still applies.
  }

  const bases = [process.env["ProgramFiles"], process.env["ProgramFiles(x86)"]].filter(
    (base): base is string => Boolean(base),
  );
  for (const base of bases) {
    for (const product of ["Wolfram", "Mathematica", "Wolfram Desktop", "Wolfram Engine"]) {
      const dir = join(base, "Wolfram Research", product);
      for (const version of safeReaddir(dir)) {
        const bin = resolveKernelBinary(join(dir, version));
        if (bin) found.push({ bin, version: versionFromString(version) ?? version, source: dir });
      }
    }
  }
  return found;
}

function scanLinux(): KernelInstall[] {
  const found: KernelInstall[] = [];
  for (const root of ["/usr/local/Wolfram", "/opt/Wolfram", "/usr/local/Wolfram Research"]) {
    for (const product of ["Wolfram", "Mathematica", "WolframEngine", "Desktop"]) {
      const dir = join(root, product);
      for (const version of safeReaddir(dir)) {
        const bin = resolveKernelBinary(join(dir, version));
        if (bin) found.push({ bin, version: versionFromString(version) ?? version, source: dir });
      }
    }
  }
  return found;
}

function platformScan(): KernelInstall[] {
  switch (process.platform) {
    case "darwin":
      return scanDarwin();
    case "win32":
      return scanWin32();
    default:
      return scanLinux();
  }
}

/**
 * An installation named by Wolfram's own environment variables.
 *
 * Returns what was asked for and what it turned out to be, separately, so the
 * caller can refuse a version that is too old rather than discovering it at the
 * start timeout. The version matters for a second reason: it is part of the
 * capability cache key, and reporting `null` here made that key constant, so an
 * upgrade in place never invalidated the cached tool list.
 */
function fromInstallDirEnv(): { install: KernelInstall | null; asked: string } | null {
  for (const [name, dir] of [
    ["WOLFRAM_INSTALLATION_DIRECTORY", process.env["WOLFRAM_INSTALLATION_DIRECTORY"]],
    ["WOLFRAM_HOME", process.env["WOLFRAM_HOME"]],
  ] as const) {
    if (!dir) continue;
    const bin = resolveKernelBinary(dir);
    return {
      asked: `${name}=${dir}`,
      install: bin ? { bin, version: versionForBinary(bin), source: dir } : null,
    };
  }
  return null;
}

/**
 * A kernel on `PATH`, by the names Wolfram installs.
 *
 * The rewrite that introduced `fromWolframScript` dropped these two lookups,
 * and they are not the same thing: `wolframscript` is a separate application
 * that can be present without a kernel, and absent when a kernel is on `PATH`.
 * A Linux install placing `wolfram` on `PATH`, or a container with the kernel
 * and nothing else, became undiscoverable. This costs one `which` and starts
 * nothing.
 */
function fromPathLookup(minVersion: string, log: Logger): KernelInstall | null {
  const which = process.platform === "win32" ? "where" : "which";
  for (const name of ["wolfram", "WolframKernel"]) {
    let found: string | undefined;
    try {
      found = execFileSync(which, [name], { encoding: "utf8", timeout: 5000, windowsHide: true })
        .split(/\r?\n/)[0]
        ?.trim();
    } catch {
      continue; // not on PATH
    }
    if (!found) continue;
    const bin = resolveKernelBinary(found);
    if (!bin) continue;
    const version = versionForBinary(bin);
    if (compareVersions(version, minVersion) < 0) {
      log(
        `${name} on PATH is ${version ?? "an unknown version"}, ` +
          `below the ${minVersion} minimum required by Wolfram/AgentTools`,
      );
      continue;
    }
    log(`located kernel on PATH: ${bin} (${version ?? "unknown version"})`);
    return { bin, version, source: `PATH (${name})` };
  }
  return null;
}

/**
 * Ask `wolframscript` where its kernel lives.
 *
 * `wolframscript` is on PATH on nearly every machine with any Wolfram product,
 * but it is a script runner, not a kernel: it does not accept the
 * `wolfram -run <expr> -noinit -noprompt` convention and never speaks MCP.
 * Returning it as a kernel produces a start timeout with no usable diagnostic,
 * so it is used purely as a locator and then discarded.
 *
 * The version comes back in the same call, because this fallback must honour
 * the same floor as the platform scan: silently selecting a kernel too old for
 * Wolfram/AgentTools trades a clear "no install found" message for a hang.
 *
 * This shells out to a real kernel and is the slowest step, so it runs last.
 */
function fromWolframScript(minVersion: string, log: Logger): KernelInstall | null {
  const which = process.platform === "win32" ? "where" : "which";
  let script: string | undefined;
  try {
    script = execFileSync(which, ["wolframscript"], {
      encoding: "utf8",
      timeout: 5000,
      windowsHide: true,
    })
      .split(/\r?\n/)[0]
      ?.trim();
  } catch {
    return null;
  }
  if (!script || !existsSync(script)) return null;

  try {
    const out = execFileSync(
      script,
      ["-code", 'StringRiffle[{$InstallationDirectory, $Version}, "|"]'],
      // This is the one discovery step that starts a kernel, and it runs inside
      // `initialize` where a client is waiting. With no local kernel to use,
      // wolframscript falls back to the Wolfram Cloud, so the old 90s ceiling
      // was a network round trip that most clients would kill the server over
      // long before it returned.
      { encoding: "utf8", timeout: 10_000, windowsHide: true },
    ).trim();

    const [dir = "", versionText = ""] = out.split("|");
    const bin = resolveKernelBinary(dir);
    if (!bin) {
      log(`wolframscript reported "${dir}", which holds no kernel executable`);
      return null;
    }

    const version = versionFromString(versionText);
    if (compareVersions(version, minVersion) < 0) {
      log(
        `wolframscript points at ${version ?? "an unknown version"}, ` +
          `below the ${minVersion} minimum required by Wolfram/AgentTools`,
      );
      return null;
    }

    log(`located kernel via wolframscript: ${dir} (${version ?? "unknown version"})`);
    return { bin, version, source: `wolframscript (${script})`, startedKernel: true };
  } catch (err) {
    log(`wolframscript could not report its installation directory: ${String(err)}`);
  }
  return null;
}

export interface LocateOptions {
  /** Explicit path from configuration; may be a bundle or install directory. */
  override?: string | undefined;
  /**
   * Pin to a particular version, matched as a dotted prefix: "14.3" selects
   * 14.3.0, "15" selects the newest 15.x. Lets you name an installation without
   * knowing where it lives.
   */
  version?: string | undefined;
  minVersion?: string;
  log?: Logger;
  /**
   * Whether the last step, `wolframscript -code`, may run. It starts a kernel —
   * a licence seat, and with no local kernel a Wolfram Cloud round trip — so
   * anything on a session's startup path passes false, and only an explicit
   * user action (`doctor`) runs it. Defaults to true, so a caller that has not
   * chosen keeps the behaviour it had.
   */
  allowWolframScript?: boolean;
}

/**
 * Where `doctor` records an installation that only step 7 could find.
 *
 * In the facts cache, so `clear-cache` forgets it with everything else it
 * learned from a kernel. The binary's identity is kept with it: an in-place
 * upgrade changes the version the hint recorded, and a stale version would
 * skip the floor check that is the reason the version is recorded at all.
 */
function hintFile(): string {
  return join(cacheDir(), "installations", "discovery-hint.json");
}

interface DiscoveryHint {
  bin: string;
  version: string | null;
  mtimeMs: number;
  size: number;
}

function binaryIdentity(bin: string): { mtimeMs: number; size: number } | null {
  try {
    const stat = statSync(bin);
    return { mtimeMs: Math.round(stat.mtimeMs), size: stat.size };
  } catch {
    return null;
  }
}

/** Record `install` as the kernel step 7 found, for discovery that may not run it. */
export function writeDiscoveryHint(install: KernelInstall): boolean {
  const identity = binaryIdentity(install.bin);
  if (!identity) return false;
  const file = hintFile();
  const temp = `${file}.${process.pid}.tmp`;
  const hint: DiscoveryHint = { bin: install.bin, version: install.version, ...identity };
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(temp, `${JSON.stringify(hint, null, 2)}\n`);
    renameSync(temp, file);
    return true;
  } catch {
    return false;
  }
}

/** The hinted installation, if it is still the binary `doctor` saw and above the floor. */
function fromDiscoveryHint(minVersion: string, log: Logger): KernelInstall | null {
  let hint: Partial<DiscoveryHint>;
  try {
    hint = JSON.parse(readFileSync(hintFile(), "utf8")) as Partial<DiscoveryHint>;
  } catch {
    return null;
  }
  if (typeof hint.bin !== "string") return null;
  const identity = binaryIdentity(hint.bin);
  if (!identity || identity.mtimeMs !== hint.mtimeMs || identity.size !== hint.size) {
    log(`the installation doctor recorded has changed or gone (${hint.bin}); run doctor again`);
    return null;
  }
  const version = typeof hint.version === "string" ? hint.version : null;
  if (compareVersions(version, minVersion) < 0) {
    log(
      `the installation doctor recorded is ${version ?? "an unknown version"}, ` +
        `below the ${minVersion} minimum`,
    );
    return null;
  }
  log(`using the installation doctor recorded: ${hint.bin}`);
  return { bin: hint.bin, version, source: "discovery hint (recorded by doctor)" };
}

/**
 * Whether `version` is the same as, or a more specific form of, `wanted`.
 *
 * Compares component by component so "14.3" matches "14.3.0" but not "14.30",
 * which a string prefix test would get wrong.
 */
export function versionMatches(version: string | null, wanted: string): boolean {
  if (version === null) return false;
  const want = wanted.split(".").filter(Boolean);
  const have = version.split(".");
  if (want.length > have.length) return false;
  return want.every(
    (part, i) => (Number.parseInt(part, 10) || 0) === (Number.parseInt(have[i] ?? "", 10) || 0),
  );
}

/**
 * An installation path to show as `WOLFRAM_MCP_KERNEL`'s example, for the
 * platform the message is read on. doctor showed the macOS one everywhere,
 * so a Linux user with nothing installed was told to point at
 * `/Applications/Wolfram.app` (found running the bundle in a Linux container).
 */
export function exampleKernelPath(platform: NodeJS.Platform = process.platform): string {
  if (platform === "darwin") return "/Applications/Wolfram.app";
  if (platform === "win32")
    return "C:\\Program Files\\Wolfram Research\\Wolfram\\15.0\\wolfram.exe";
  return "/usr/local/Wolfram/Wolfram/15.0/Executables/wolfram";
}

/** All installs the platform scan can see, newest first, de-duplicated. */
export function listKernels(minVersion = "0"): KernelInstall[] {
  const seen = new Set<string>();
  return platformScan()
    .filter((candidate) => compareVersions(candidate.version, minVersion) >= 0)
    .filter((candidate) => {
      if (seen.has(candidate.bin)) return false;
      seen.add(candidate.bin);
      return true;
    })
    .sort((a, b) => compareVersions(b.version, a.version));
}

/**
 * Version for a binary we did not find by scanning.
 *
 * Reuses the scan when it knows the path, and otherwise walks up to the bundle
 * so a `.../Contents/MacOS/WolframKernel` path still yields a version without
 * starting a kernel.
 */
function versionForBinary(bin: string): string | null {
  const known = platformScan().find((c) => c.bin === bin);
  if (known?.version) return known.version;
  if (process.platform === "darwin") {
    const app = bin.replace(/\/Contents\/(MacOS|Resources)\/.*$/, "");
    if (app !== bin) return plistVersion(app);
  }
  return versionFromString(bin);
}

export function locateKernel({
  override,
  version,
  minVersion = DEFAULT_MIN_VERSION,
  log = () => {},
  allowWolframScript = true,
}: LocateOptions = {}): KernelInstall | null {
  // Naming something is a decision, not a hint. Every branch below that was
  // asked for a specific installation either supplies it or stops: falling
  // through to a scan would run a *different* kernel than the one requested,
  // which is worse than not running one — a version pinned to avoid a bad
  // release would be silently ignored, and a below-floor kernel named by
  // WOLFRAM_HOME used to be selected with no log line at all and then hang for
  // the full 120s start timeout.
  if (override) {
    const bin = resolveKernelBinary(override);
    if (!bin) {
      log(`configured kernel path is not a usable Wolfram executable: ${override}`);
      return null;
    }
    if (bin !== override) log(`resolved configured path ${override} to ${bin}`);
    return { bin, version: versionForBinary(bin), source: "configured" };
  }

  // A pinned version outranks the environment below it, matching what
  // locate.ts, README.md and docs/environment.md all describe.
  if (version) {
    const matched = listKernels("0").filter((c) => versionMatches(c.version, version));
    if (matched[0]) {
      log(`pinned to version ${version}: ${matched[0].bin}`);
      return matched[0];
    }
    const seen = listKernels("0")
      .map((c) => c.version ?? "unknown")
      .join(", ");
    log(
      `no installation matches WOLFRAM_MCP_VERSION=${version}. ` +
        `Versions found: ${seen || "none"}`,
    );
    return null;
  }

  const fromEnv = fromInstallDirEnv();
  if (fromEnv) {
    if (!fromEnv.install) {
      log(`${fromEnv.asked} holds no usable Wolfram executable`);
      return null;
    }
    // The floor applies here as everywhere else: an older kernel loads far
    // enough to start and then cannot open Wolfram`AgentTools`.
    if (compareVersions(fromEnv.install.version, minVersion) < 0) {
      log(
        `${fromEnv.asked} is ${fromEnv.install.version ?? "an unknown version"}, ` +
          `below the ${minVersion} minimum required by Wolfram/AgentTools`,
      );
      return null;
    }
    log(`using the installation named by ${fromEnv.asked}`);
    return fromEnv.install;
  }

  // What wolframscript is configured to use. This is a recorded preference
  // rather than a guess, so it outranks "newest version on disk" — a machine
  // with an experimental build alongside a stable one has a highest version
  // that is not the one the user designated.
  const preferred = preferredKernel();
  if (preferred) {
    const bin = resolveKernelBinary(preferred.path);
    if (bin) {
      const version = versionForBinary(bin);
      if (compareVersions(version, minVersion) >= 0) {
        log(`using the kernel wolframscript prefers, via ${preferred.source}`);
        return { bin, version, source: `wolframscript preference (${preferred.source})` };
      }
      log(
        `wolframscript prefers ${version ?? "an unknown version"} via ${preferred.source}, ` +
          `below the ${minVersion} minimum; continuing to scan`,
      );
    } else {
      log(`wolframscript prefers ${preferred.path}, which holds no kernel executable`);
    }
  }

  const scanned = listKernels(minVersion);
  if (scanned[0]) return scanned[0];

  const onPath = fromPathLookup(minVersion, log);
  if (onPath) return onPath;

  // Ahead of step 7 in either mode: a hint is a file read, and it is the answer
  // step 7 gave last time, so asking again would spend a seat to learn it twice.
  const hinted = fromDiscoveryHint(minVersion, log);
  if (hinted) return hinted;

  if (!allowWolframScript) return null;
  return fromWolframScript(minVersion, log);
}
