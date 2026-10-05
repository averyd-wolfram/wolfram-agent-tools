/**
 * The wire protocol between a proxy and the broker, and where its socket lives.
 *
 * This is deliberately not MCP. The proxy is already the MCP server — it owns
 * capability negotiation, the disk cache and the client handshake — so all it
 * needs from the broker is "run this operation against some kernel". Keeping the
 * broker's surface to a handful of operations avoids re-implementing JSON-RPC id
 * remapping and session semantics inside it.
 */
import type {
  Progress,
  Prompt,
  ServerCapabilities,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cacheDir } from "./cache.js";
import { settingValue } from "./flavour.js";
import { PKG } from "./version.js";

/**
 * Bumped whenever the frames below change shape. It is part of the socket path,
 * so a proxy never talks to a broker it cannot understand — mismatched versions
 * simply use different sockets.
 *
 * The package version joins it in `brokerAddress`, so a broker left running by an
 * older install cannot serve a newer proxy — the protocol number only moves when
 * a frame changes shape, and two releases can differ in behaviour without that.
 *
 * Adding an *op* is not a change of shape and deliberately does not bump this.
 * Bumping would strand every running broker on the old path, holding its seats
 * until its grace expires, while new sessions start a second pool against the
 * same licence — the multi-broker arithmetic this repo has already had to fix
 * once. An old broker that cannot answer a new op is the lesser problem, and
 * `ping` is built to read that refusal as the proof of life it is.
 */
export const BROKER_PROTOCOL = 5;

/**
 * Longest socket path we will use, leaving room inside the 104-byte
 * `sockaddr_un.sun_path` on macOS for the trailing NUL and a little slack.
 */
const MAX_SOCKET_PATH = 100;

export type BrokerOp =
  | "capabilities"
  | "listTools"
  | "listPrompts"
  | "getPrompt"
  | "listResources"
  | "readResource"
  | "callTool"
  | "cancel"
  | "status"
  /**
   * What environment were this broker's kernels started with?
   *
   * Answered with the flavour digest from `flavour.ts`, so a proxy can tell
   * whether this broker's kernels are interchangeable with what it needs before
   * it sends any work. A broker too old to know the op refuses it, and a refusal
   * means "cannot tell", which is a reason not to share.
   */
  | "hello"
  /**
   * Is the process behind the socket running?
   *
   * Answered from the event loop, before the pool and before the licence probe,
   * because the question is about the broker and not about its kernels: a
   * broker whose every kernel is mid-evaluation is healthy and answers at once.
   */
  | "ping"
  /**
   * Has the broker finished its own preparation — the licence probe and the
   * environment its kernels need?
   *
   * Answered once that is done and never through the pool, so it measures the
   * broker starting up and not slot contention: a broker whose every kernel is
   * busy with someone's long evaluation is ready, and a new session waiting
   * for a slot is ordinary queueing, not a failed preparation. A new op, not a
   * new frame shape, so `BROKER_PROTOCOL` is unchanged; a broker too old to
   * know it refuses it, which the client takes as ready.
   */
  | "ready";

export interface BrokerRequest {
  id: number;
  op: BrokerOp;
  params?: unknown;
  /** Per-call ceiling, for callTool. */
  timeoutMs?: number;
  /** For `cancel`: the id of the in-flight request to abandon. */
  target?: number;
}

export interface BrokerResponse {
  id: number;
  ok: boolean;
  result?: unknown;
  error?: string;
  /**
   * The JSON-RPC error code, when the failure was an `McpError` from the kernel.
   *
   * Without it the class of the failure does not survive the socket. `proxy.ts`
   * draws the line the spec draws — a failure while *running* a tool is an
   * `isError` result the model can act on, a failure to *find* the tool is an
   * MCP error response — and it decides by testing `err instanceof McpError`.
   * A string cannot be that, so on the shared path, which is the default, every
   * "unknown tool" came back as `isError` and a model could not tell "your
   * Wolfram code was wrong" from "that tool does not exist". Measured: -32602
   * from the kernel arrived at the client as an isError result.
   */
  code?: number;
}

/**
 * Unsolicited messages pushed to every connected proxy.
 *
 * `kernelReady` carries the new kernel's lists rather than inviting the proxy to
 * come and ask for them. Asking meant three `pool.run` calls arriving while the
 * slot that triggered the event was still held, so a single tool call grew the
 * pool to the entire licence budget — measured at 3 of 3 kernels for any
 * evaluation slower than about 200ms. Sending the answer removes the
 * re-entrancy by construction, and costs one gather instead of three round
 * trips per attached proxy.
 */
export type BrokerEvent =
  | {
      event: "kernelReady";
      capabilities: ServerCapabilities;
      tools: Tool[];
      /** Null when the kernel does not advertise prompts at all. */
      prompts: Prompt[] | null;
    }
  | {
      /** The kernel's progress on one in-flight call, relabelled by the proxy. */
      event: "progress";
      target: number;
      progress: Progress;
    }
  | { event: "shuttingDown" };

export type BrokerFrame = BrokerResponse | BrokerEvent;

export function isEvent(frame: BrokerFrame): frame is BrokerEvent {
  return typeof (frame as BrokerEvent).event === "string";
}

declare const __WOLFRAM_MCP_PKG__: string | undefined;

let buildIdentity: string | undefined;
/**
 * The running code's own identity: a digest of the single-file bundle, or of
 * the compiled modules beside this one in a clone's `dist/`.
 *
 * The socket was keyed on the package version alone, and two builds of one
 * version are two programs: a broker started by a checkout's `dist/` — the
 * repository's own `.mcp.json` server, of the same version — served the
 * installed release's sessions with the working tree's code. Proxy and broker
 * run the same code, so they still agree; a machine with one installed
 * release sees no difference. Read once per process.
 *
 * The cost is accepted, not overlooked: after a rebuild a session still running
 * the old code keeps its broker, and a new session starts a second one beside
 * it, so the two hold seats against one licence until the old sessions end and
 * that broker's idle exit follows. Sharing it instead would run one build's
 * code for the other's sessions, which is the failure this exists to prevent.
 */
function codeIdentity(): string {
  if (buildIdentity !== undefined) return buildIdentity;
  const hash = createHash("sha256");
  try {
    const here = fileURLToPath(import.meta.url);
    const files =
      typeof __WOLFRAM_MCP_PKG__ === "string"
        ? [here]
        : readdirSync(dirname(here))
            .filter((name) => name.endsWith(".js"))
            .sort()
            .map((name) => join(dirname(here), name));
    for (const file of files) hash.update(readFileSync(file));
  } catch {
    // Unreadable code is still one program; the version keeps the key apart.
  }
  buildIdentity = hash.digest("hex").slice(0, 16);
  return buildIdentity;
}

/**
 * `WOLFRAMINIT` as the flavour reads it — blank and an unsubstituted `${...}` are
 * unset — so the broker an entitlement session meets agrees with the flavour
 * its kernels are started with.
 */
function entitlementOptions(): string[] {
  const value = settingValue(process.env["WOLFRAMINIT"]);
  return value === undefined ? [] : [value];
}

/**
 * Where the broker for this installation listens.
 *
 * Deliberately *not* keyed on the server name any more. It used to be, so two
 * projects naming different AgentTools servers ran two brokers, and each derived
 * a full kernel budget from the same licence — the reserve reserved nothing.
 * Kernels are keyed by flavour inside the pool now, and `MCP_SERVER_NAME` is
 * part of a flavour, so one broker serves every server name on one budget.
 *
 * The kernel binary stays in the key: a broker runs the one it was started with,
 * and taking a path from a peer would let anything on this socket choose which
 * executable it spawns. Two installations therefore still mean two brokers and
 * two budgets against one licence — narrower than what this replaced, and
 * recorded in `docs/plan.md` §5.3 rather than closed.
 */
export function brokerAddress(kernelPath: string): string {
  const uid = typeof process.getuid === "function" ? process.getuid() : 0;
  const digest = createHash("sha256")
    // NUL-separated, because a kernel path may contain spaces and a separator
    // that can appear inside a value is not a separator. It mattered more when
    // the server name was part of this: ("/Apps/K My", "Prime Finder") and
    // ("/Apps/K", "My Prime Finder") digested identically under a space. The
    // name has since moved into the flavour, which is what lets one broker serve
    // several of them, so the risk is smaller — and the fix is still correct.
    .update(
      [
        String(BROKER_PROTOCOL),
        PKG.version,
        kernelPath,
        String(uid),
        codeIdentity(),
        // An entitlement's broker is its own, since a pool learns its licence
        // from its kernels and an entitlement brings its own kernel limit: two
        // behind one broker throttled each other or overran the smaller. Only
        // when set, so every other session keeps the socket it had.
        ...entitlementOptions(),
      ].join("\u0000"),
    )
    .digest("hex")
    .slice(0, 12);

  if (process.platform === "win32") {
    // Named pipes live in their own namespace; no filesystem, no length worry.
    return String.raw`\\.\pipe\wolfram-mcp-${digest}`;
  }

  // `sockaddr_un.sun_path` is 104 bytes on macOS, and the kernel *truncates*
  // rather than refusing: bind() then creates the socket at a shortened path
  // while every check here still looks at the full one. A killed broker's
  // leftover file therefore became invisible and unclearable, no later broker
  // could ever bind, and sharing was dead until someone deleted a file they
  // could not see. Measured: a 112-byte path under a deep XDG_RUNTIME_DIR.
  // Shorten the name, never move the directory. The directory is what keeps one
  // set of sessions from meeting another — an unusable XDG_RUNTIME_DIR is
  // supposed to end in a private kernel, not in a shared socket somewhere else
  // — so the only thing that gives here is the filename. The digest already
  // covers the uid, so the terse form is no less specific.
  const base = brokerDirectory();
  const descriptive = join(base, `wolfram-mcp-${uid}-${digest}.sock`);
  if (Buffer.byteLength(descriptive) <= MAX_SOCKET_PATH) return descriptive;
  // Still too long if the directory itself is enormous. This used to say bind
  // would then "fail with a real error at the real path rather than silently
  // truncating" — measured, it does not: a 152-byte address bound successfully
  // and created nothing at the path we asked for. Sharing survives it, because
  // connect truncates to the same bytes; what does not survive is anything that
  // touches the file by name, which is why the socket is created 0600 through a
  // umask rather than chmod'ed after the fact.
  return join(base, `wm-${digest}.sock`);
}

/** A directory this process makes for its own use: created private, or left as it is. */
function ensurePrivateDirectory(dir: string): void {
  try {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
  } catch {
    // Unusable; `socketFault` says how, and the session takes a private kernel.
  }
}

/**
 * Where the broker's socket lives, first match winning:
 *
 *  1. `WOLFRAM_MCP_RUNTIME_DIR` — a directory the user chose, for the hosts
 *     where no default fits; created private if it does not exist yet.
 *  2. `XDG_RUNTIME_DIR`, as a desktop session sets it. A value that turns out
 *     unsafe still ends in a private kernel, never in a socket somewhere else:
 *     whoever set it meant this directory.
 *  3. The system's temporary directory, when it passes the same test — macOS's
 *     per-user one does.
 *  4. `run/` under this package's cache directory, created private.
 *
 * The fourth is new. Without `XDG_RUNTIME_DIR` — a headless Linux host, an ssh
 * session, a container — the default was `/tmp`, which everyone can write to,
 * so `socketFault` refused it and every session there took a private kernel
 * and a seat (found running the bundle in a Linux container). The rule is
 * unchanged; there is now somewhere that meets it.
 *
 * Every session of one user and environment resolves the same directory, which
 * is what lets them meet.
 */
export function brokerDirectory(): string {
  const chosen = process.env["WOLFRAM_MCP_RUNTIME_DIR"]?.trim();
  if (chosen) {
    ensurePrivateDirectory(chosen);
    return chosen;
  }
  const runtime = process.env["XDG_RUNTIME_DIR"];
  if (runtime) return runtime;
  const temporary = tmpdir();
  if (directoryFault(temporary) === null) return temporary;
  const own = join(cacheDir(), "run");
  ensurePrivateDirectory(own);
  return own;
}

/**
 * Why this socket path cannot be used safely, or `null` if it can.
 *
 * Length is deliberately *not* one of the ways. An over-long address is
 * truncated by bind — but connect truncates it identically, so the two still
 * meet and sharing works; what breaks is only the filesystem checks that use the
 * untruncated path. Refusing on length would trade a working degraded case for
 * no sharing at all, which is the wrong direction for an optimisation.
 *
 * The socket's own mode stops other users *connecting* (it is created 0600), but
 * it cannot stop them getting there first. Anyone who can write to the directory
 * can bind this exact path before we do — the name is derived, not secret, and
 * the uid is in it — and every proxy that then connects hands its evaluations to
 * whatever answered. The sticky bit does not help: it prevents deleting someone
 * else's file, not creating one that does not exist yet.
 *
 * So the requirement is the directory, and only the directory: ours, and not
 * writable by anyone else. macOS's per-user `tmpdir()` (`/var/folders/…/T`, mode
 * 0700) passes; `XDG_RUNTIME_DIR=/tmp` does not, because `/private/tmp` is 1777.
 * `brokerAddress` validated only the *length* of that variable while the comment
 * beside it said an unusable one "is supposed to end in a private kernel, not in
 * a shared socket somewhere else" — this is the half that was missing.
 *
 * Group- and world-*readable* are fine. Reading a directory does not let anyone
 * connect to a 0600 socket, and rejecting it would refuse sharing on ordinary
 * machines for no gain.
 */
export function socketFault(address: string): string | null {
  // Named pipes are not in the filesystem, so none of this applies. The uid-0
  // collision that *is* Windows's version of this problem is parked: plan.md §9.
  if (process.platform === "win32") return null;
  return directoryFault(dirname(address));
}

/** Why a directory cannot safely hold a socket, or `null` if it can. See `socketFault`. */
function directoryFault(dir: string): string | null {
  if (process.platform === "win32") return null;
  let info;
  try {
    info = statSync(dir);
  } catch (err) {
    return `${dir} cannot be read (${(err as NodeJS.ErrnoException).code ?? "unknown error"})`;
  }
  if (!info.isDirectory()) return `${dir} is not a directory`;

  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  if (uid !== null && info.uid !== uid) {
    return `${dir} belongs to uid ${info.uid}, not ${uid}`;
  }
  if (info.mode & 0o022) {
    // Name the bit that is actually set. umask 002 — the user-private-group
    // default on much of Linux — leaves a bare mkdir at 775, and telling that
    // user "writable by others" blames a bit that is off: they check the wrong
    // thing and conclude the refusal is broken.
    const group = (info.mode & 0o020) !== 0;
    const others = (info.mode & 0o002) !== 0;
    const who = group && others ? "group and others" : group ? "its group" : "others";
    return `${dir} is writable by ${who} (mode ${(info.mode & 0o777).toString(8)})`;
  }
  return null;
}

/** The mode a socket is created with, so only its owner can connect to it. */
export const SOCKET_MODE = 0o600;

/** Split a stream into newline-delimited JSON frames. */
/**
 * Longest unterminated frame to hold before dropping it.
 *
 * `transport.ts` has capped kernel output at 4 MB since it was written; this
 * reader had no cap at all, so a peer that sends bytes and never a newline grew
 * it until the process died. The socket is local and unauthenticated, which is
 * exactly the reason not to trust it with unbounded memory.
 */
const MAX_UNTERMINATED_BYTES = 4 * 1024 * 1024;

export class FrameReader {
  #buffer = "";

  constructor(private readonly onFrame: (frame: unknown) => void) {}

  push(chunk: string): void {
    this.#buffer += chunk;
    if (this.#buffer.length > MAX_UNTERMINATED_BYTES) {
      // Dropped whole: a partial frame is not JSON, and keeping the tail would
      // only feed a corrupt line to the parser on the next newline.
      this.#buffer = "";
      return;
    }
    let index: number;
    while ((index = this.#buffer.indexOf("\n")) !== -1) {
      const line = this.#buffer.slice(0, index).trim();
      this.#buffer = this.#buffer.slice(index + 1);
      if (!line) continue;
      try {
        this.onFrame(JSON.parse(line));
      } catch {
        // A corrupt frame is not recoverable in-band; drop it and continue.
      }
    }
  }
}

export function encodeFrame(frame: unknown): string {
  return `${JSON.stringify(frame)}\n`;
}
