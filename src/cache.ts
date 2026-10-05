/**
 * On-disk cache of the upstream capability lists.
 *
 * Its only job is to answer `initialize` and `tools/list` before a kernel has
 * been started, so a client that enumerates tools at launch does not pay a
 * kernel boot. Every entry is replaced from the live kernel the first time one
 * starts, so this is a latency cache, never a source of truth.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import os from "node:os";
import type { Prompt, Tool } from "@modelcontextprotocol/sdk/types.js";
import type { UpstreamCapabilities } from "./config.js";
import { PKG } from "./version.js";

const CACHE_FORMAT = 2;

/**
 * Entries older than this are ignored. The kernel refreshes the cache on every
 * start, so this only bounds how stale a never-used install can get.
 */
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface CacheEntry {
  format: number;
  kernelPath: string;
  kernelVersion: string | null;
  serverName: string;
  /** Invalidates the cache when this package changes what it stores. */
  serverVersion: string;
  /**
   * Digest of the environment the kernel that reported these lists was started
   * with. Two flavours are two kernels, so they are two entries — a shared entry
   * would describe whichever ran last.
   */
  flavour: string;
  upstream: UpstreamCapabilities;
  tools: Tool[];
  prompts: Prompt[];
  cachedAt: number;
}

export interface CacheKey {
  kernelPath: string;
  kernelVersion: string | null;
  serverName: string;
  serverVersion: string;
  flavour: string;
}

export function cacheDir(): string {
  if (process.platform === "win32") {
    const base = process.env["LOCALAPPDATA"] ?? join(os.homedir(), "AppData", "Local");
    return join(base, "wolfram-mcp-server");
  }
  const base = process.env["XDG_CACHE_HOME"] ?? join(os.homedir(), ".cache");
  return join(base, "wolfram-mcp-server");
}

/**
 * The key an entry is stored under, with the one field nobody should have to
 * remember filled in.
 *
 * One owner, because `doctor` reports the file the server would read and the two
 * must not drift — the same reason `brokerLaunch` is shared.
 */
export function cacheKey(
  kernelPath: string,
  kernelVersion: string | null,
  serverName: string,
  flavour: string,
): CacheKey {
  return { kernelPath, kernelVersion, serverName, serverVersion: PKG.version, flavour };
}

/** The directory holding one file per key. */
export function capabilityDir(): string {
  return join(cacheDir(), "capabilities");
}

/**
 * Where one key's entry lives.
 *
 * A file per key, not one file per machine. A single `capabilities.json` held
 * whichever key was written last and `cacheMatches` read every other key as a
 * miss, so two projects on different server names evicted each other on every
 * launch and neither was ever warm. Measured against the fake kernel: with one
 * name the second launch starts no kernel; with two names alternating, every
 * launch starts one. That is not merely latency — a cold `tools/list` starts a
 * kernel, so it was a licence seat spent at launch, every launch — and it also
 * meant neither project ever advertised `prompts`, because a cold session is
 * tools-only by design and capabilities are frozen at `initialize`.
 *
 * Digested the way `installations/<digest>.json` is, in the same directory, so
 * the two caches look alike on disk.
 */
export function capabilityFile(key: CacheKey): string {
  const digest = createHash("sha256")
    .update(
      [
        key.kernelPath,
        key.kernelVersion ?? "",
        key.serverName,
        key.serverVersion,
        key.flavour,
      ].join("\u0000"),
    )
    .digest("hex")
    .slice(0, 16);
  return join(capabilityDir(), `${digest}.json`);
}

export function readCache(key: CacheKey): CacheEntry | null {
  try {
    const entry = JSON.parse(readFileSync(capabilityFile(key), "utf8")) as CacheEntry;
    if (entry.format !== CACHE_FORMAT) return null;
    if (Date.now() - (entry.cachedAt ?? 0) > CACHE_TTL_MS) return null;
    if (!Array.isArray(entry.tools)) return null;
    // The digest is a shortened hash of the key and the file can be edited by
    // hand, so the key is compared rather than inferred from the path.
    if (!cacheMatches(entry, key)) return null;
    return entry;
  } catch {
    return null;
  }
}

/**
 * Write the cache atomically.
 *
 * Several clients can run this server concurrently against the same kernel, so
 * a torn write would poison every one of them. Writing to a sibling temp file
 * and renaming keeps readers seeing either the old entry or the new one.
 */
export function writeCache(entry: Omit<CacheEntry, "format" | "cachedAt">): void {
  const file = capabilityFile(entry);
  const temp = `${file}.${process.pid}.tmp`;
  try {
    mkdirSync(dirname(file), { recursive: true });
    const payload: CacheEntry = { ...entry, format: CACHE_FORMAT, cachedAt: Date.now() };
    writeFileSync(temp, `${JSON.stringify(payload, null, 2)}\n`);
    renameSync(temp, file);
  } catch {
    // A read-only or missing home directory just means we start cold each time.
    try {
      unlinkSync(temp);
    } catch {
      /* nothing to clean up */
    }
  }
}

/** @returns the directory it emptied, for `clear-cache` to report. */
export function clearCache(): string {
  const dir = capabilityDir();
  rmSync(dir, { recursive: true, force: true });
  // The layout before there was a file per key. Left behind it would never be
  // read again, but `clear-cache` is the cold-machine reset, so it goes too.
  try {
    unlinkSync(join(cacheDir(), "capabilities.json"));
  } catch {
    /* absent, which is the normal case */
  }
  return dir;
}

/**
 * Whether a cache entry describes the kernel and serverName we are about to use.
 *
 * The kernel path, kernel version, serverName and this package's version all
 * change what the upstream tool list looks like, so any of them differing makes
 * the entry unusable.
 */
export function cacheMatches(entry: CacheEntry | null, key: CacheKey): entry is CacheEntry {
  return (
    entry !== null &&
    entry.kernelPath === key.kernelPath &&
    entry.kernelVersion === key.kernelVersion &&
    entry.serverName === key.serverName &&
    entry.serverVersion === key.serverVersion &&
    entry.flavour === key.flavour
  );
}
