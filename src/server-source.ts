/**
 * What a server is served from, read off the disk without a kernel (#3, #6).
 *
 * A kernel's tool list is decided when it starts, by what AgentTools resolves
 * `MCP_SERVER_NAME` to: a server of the user's own, then an installed paclet's
 * declaration, then a built-in — and AgentTools' own version shapes all three.
 * None of that is in a flavour, so after a paclet upgrade the capability cache
 * kept serving the old list under an unchanged key, and a broker kept handing
 * out warm kernels that had loaded the old definition: a client was offered the
 * old tools and refused the new ones before any request reached this server.
 *
 * So this reads what a kernel would resolve from, cheaply enough to do before
 * `initialize` is answered and on every broker request: a `readdir` and a
 * `stat` per installed paclet, and a paclet's `PacletInfo` read only when that
 * file is new. The digest changes whenever any of it does.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";
import { settingValue, type KernelFlavour } from "./flavour.js";
import { installationEnv } from "./inspect.js";

/** The two places paclets are installed, and the user's own servers live. */
export interface SourceDirs {
  userBase: string;
  base: string;
}

export interface ServerSource {
  /** Short, and stable while nothing below changes: what keys compare. */
  digest: string;
  /** What was found, one line each, for `doctor` to show beside the flavour. */
  found: string[];
}

/**
 * The directories a kernel will use, in the order its environment is built
 * (`KernelSession`): its own `WOLFRAM_USERBASE` / `WOLFRAM_BASE` — the session's
 * for a private kernel, the flavour's in a broker — over the reported facts,
 * over Wolfram's platform defaults.
 *
 * @param facts `installationEnv`'s answer, which is empty with inspection off
 * @param home the home directory the kernel will have, which a broker inherits
 */
export function sourceDirs(
  env: Record<string, string | undefined>,
  facts: Record<string, string>,
  home: string = os.homedir(),
): SourceDirs {
  // shortcut: macOS and Linux defaults only, as AGENTS.md scopes the server;
  // elsewhere nothing is found, which keys and shares as before this existed.
  const mac = process.platform === "darwin";
  return {
    userBase:
      settingValue(env["WOLFRAM_USERBASE"]) ??
      facts["WOLFRAM_USERBASE"] ??
      join(home, mac ? "Library/Wolfram" : ".Wolfram"),
    base:
      settingValue(env["WOLFRAM_BASE"]) ??
      facts["WOLFRAM_BASE"] ??
      (mac ? "/Library/Wolfram" : "/usr/share/Wolfram"),
  };
}

/**
 * Whether a `PacletInfo` mentions AgentTools, by file identity, so a file is
 * read once rather than on every broker request. A rewritten file has a new
 * ctime and is read again.
 */
const mentions = new Map<string, boolean>();

/**
 * Every installed paclet that may take part in what a server lists: any whose
 * `PacletInfo` mentions AgentTools. That is AgentTools itself, every paclet
 * declaring an AgentTools extension — so the one behind a qualified name — and
 * every paclet whose tools or prompts another server names by qualified name,
 * which are resolved as the list is built. The name is never parsed.
 *
 * Inode and ctime, not the version: #3's repro reinstalled with
 * `ForceVersionInstall -> True`, which can keep the version, and unpacking can
 * keep mtimes, but a reinstall writes a new file. Never a directory's own
 * times, which change as a kernel writes logs and compiled files under it.
 *
 * shortcut: the repositories only — not `Applications` directories, the
 * installation's own layout, a disabled paclet, or one edited in place — and so
 * those change nothing here; #4's development directories would join this.
 */
function paclets(base: string, label: string, into: string[], found: string[]): void {
  const repository = join(base, "Paclets", "Repository");
  let entries: string[];
  try {
    entries = readdirSync(repository).sort();
  } catch {
    return;
  }
  for (const entry of entries) {
    for (const name of ["PacletInfo.wl", "PacletInfo.m"]) {
      const file = join(repository, entry, name);
      let identity: string;
      try {
        const { ino, ctimeMs } = statSync(file);
        identity = `${file}\u0000${ino}\u0000${ctimeMs}`;
      } catch {
        continue;
      }
      let hit = mentions.get(identity);
      if (hit === undefined) {
        try {
          hit = readFileSync(file, "utf8").includes("AgentTools");
        } catch {
          hit = false;
        }
        mentions.set(identity, hit);
      }
      if (hit) {
        into.push(identity);
        found.push(`paclet  ${entry} (${label})`);
      }
      break;
    }
  }
}

/**
 * A server of the user's own, which the paclet looks for before anything else,
 * so it shadows a built-in or a paclet's server of the same name. Under the old
 * `MCPServer` root while the `AgentTools` one is absent: the paclet copies that
 * root across as it first resolves a name (`migrateRoot`), and serves what it
 * copied. Each entry is decoded rather than the name encoded, so `URLEncode`
 * never has to be matched exactly.
 */
function userServer(userBase: string, serverName: string, into: string[], found: string[]): void {
  const roots = join(userBase, "ApplicationData", "Wolfram");
  let servers = join(roots, "AgentTools", "Servers");
  try {
    statSync(join(roots, "AgentTools"));
  } catch {
    servers = join(roots, "MCPServer", "Servers");
  }
  let entries: string[] = [];
  try {
    entries = readdirSync(servers);
  } catch {
    // No servers of the user's own, which is the usual case.
  }
  for (const entry of entries) {
    let decoded = entry;
    try {
      decoded = decodeURIComponent(entry.replace(/\+/g, " "));
    } catch {
      // Not percent-encoding; compared as it is.
    }
    if (decoded !== serverName) continue;
    const file = join(servers, entry, "Metadata.wxf");
    try {
      const { ino, ctimeMs, size } = statSync(file);
      into.push(`${file}\u0000${ino}\u0000${ctimeMs}\u0000${size}`);
      found.push(`server  ${file}`);
      return;
    } catch {
      // A directory with no metadata is no server; the paclet looks past it.
    }
  }
  into.push("no user server");
}

/**
 * What a kernel started now for `serverName` would be served from.
 *
 * shortcut: a qualified name whose paclet is not installed is served from
 * remote declarations, which can change with nothing here changing, and a tool
 * may read a paclet with no AgentTools in its `PacletInfo`; neither is seen.
 */
export function serverSource(serverName: string, dirs: SourceDirs): ServerSource {
  const into: string[] = [];
  const found: string[] = [];
  paclets(dirs.userBase, "user base", into, found);
  paclets(dirs.base, "base", into, found);
  userServer(dirs.userBase, serverName, into, found);
  const digest = createHash("sha256").update(into.join("\n")).digest("hex").slice(0, 16);
  return { digest, found };
}

/**
 * The identity a broker keys a request's kernels on: the session's flavour, as
 * it declared it, and what a kernel started now would be served from. Kernels
 * started before an upgrade then match no request, whichever session asks.
 */
export function servingDigest(flavourDigest: string, source: ServerSource): string {
  return createHash("sha256")
    .update(`${flavourDigest}\u0000${source.digest}`)
    .digest("hex")
    .slice(0, 16);
}

/**
 * What a session's kernels would be served from, as its cache key reads it:
 * the session's own environment over the installation's reported facts, as a
 * private kernel's is built, and as a broker builds one from the flavour.
 */
export function sessionSource(
  serverName: string,
  flavour: KernelFlavour,
  bin: string,
  inspect: boolean,
): ServerSource {
  return serverSource(serverName, sourceDirs(flavour.env, installationEnv(bin, inspect)));
}
