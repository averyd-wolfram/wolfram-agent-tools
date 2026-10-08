/**
 * The broker: one process, one kernel pool, many proxies.
 *
 * Started automatically and detached by whichever proxy finds no broker
 * listening. It owns the kernels so that N client sessions cost one licence
 * seat rather than N, and exits on its own once nobody is using it.
 *
 * Everything here is best-effort by design: a proxy that cannot reach a broker
 * falls back to its own kernel, so a broker failure degrades rather than breaks.
 */
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { McpError, type Prompt, type Tool } from "@modelcontextprotocol/sdk/types.js";
import { createServer, type Server, type Socket } from "node:net";
import { statSync, unlinkSync } from "node:fs";
import { connect } from "node:net";
import { KernelPool, type LicenceInfo } from "./pool.js";
import { installationEnv, readFacts, recordFacts } from "./inspect.js";
import {
  encodeFrame,
  FrameReader,
  type BrokerEvent,
  type BrokerOp,
  type BrokerRequest,
  type BrokerResponse,
  socketFault,
  SOCKET_MODE,
} from "./broker-protocol.js";
import { settingValue, type KernelFlavour } from "./flavour.js";
import { errorText, type Logger } from "./log.js";

/** How long to linger with no connections before exiting. */
const EMPTY_GRACE_MS = 60_000;

/** The ops a kernel evaluates, which a `cancel` frame may stop. */
const EVALUATIONS: ReadonlySet<BrokerOp> = new Set<BrokerOp>([
  "callTool",
  "getPrompt",
  "readResource",
]);
const MAX_PAGES = 50;

/** Follow `nextCursor` so a broadcast carries the whole list, not page one. */
async function drain<T>(
  page: (cursor?: string) => Promise<{ items: T[]; nextCursor?: string | undefined }>,
): Promise<T[]> {
  const all: T[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < MAX_PAGES; i++) {
    const result = await page(cursor);
    all.push(...result.items);
    cursor = result.nextCursor;
    if (!cursor) break;
  }
  return all;
}

export interface BrokerOptions {
  address: string;
  bin: string;
  serverName: string;
  idleMs: number;
  startTimeoutMs: number;
  maxKernels?: number | undefined;
  reserveSeats: number;
  /** Set to skip the one-off installation probe. */
  licenceOverride?: number | "unlimited" | undefined;
  /** false to never probe, staying at a single kernel. */
  allowInspect: boolean;
  clientInfo: { name: string; version: string };
  log: Logger;
}

/**
 * Every name any attached session has said it cares about.
 *
 * A flavour strips the names it knows before applying its own values, so a
 * variable it leaves unset cannot show through from the broker's environment.
 * But the names it knows are `FLAVOUR_VARS` plus what *that* session declared —
 * so if one session declares `MY_MODE` and another does not, the second one's
 * kernel would still inherit `MY_MODE` from the broker, whose environment
 * belongs to whichever session spawned it. Which is the very leak all of this
 * exists to close.
 *
 * So the broker remembers every name anybody declared and strips the union.
 * Nobody gets a value they did not ask for.
 */
const declaredNames = new Set<string>();

/**
 * Read a flavour a peer sent, or null if it did not send a usable one.
 *
 * Checked field by field rather than trusted: this arrives over a socket, it
 * decides what environment a kernel is started with, and a peer that sends
 * nonsense should be refused rather than served from a kernel built out of it.
 */
function readFlavour(params: unknown): KernelFlavour | null {
  if (typeof params !== "object" || params === null) return null;
  const { digest, env, names } = params as Record<string, unknown>;
  if (typeof digest !== "string" || !digest) return null;
  if (typeof env !== "object" || env === null) return null;
  if (!Array.isArray(names) || names.some((name) => typeof name !== "string")) return null;
  const values: Record<string, string> = {};
  for (const [name, value] of Object.entries(env as Record<string, unknown>)) {
    if (typeof value !== "string") return null;
    values[name] = value;
  }
  return { digest, env: values, names: names as string[] };
}

/** Is something actually listening on this path right now? */
async function socketIsLive(address: string): Promise<boolean> {
  if (process.platform === "win32") return false;
  return new Promise<boolean>((resolve) => {
    const probe = connect(address);
    const done = (result: boolean) => {
      probe.destroy();
      resolve(result);
    };
    probe.once("connect", () => done(true));
    probe.once("error", () => done(false));
    setTimeout(() => done(false), 1000).unref?.();
  });
}

/** dev:ino of a path, or null when it does not exist. */
function socketIdentity(address: string): string | null {
  try {
    const info = statSync(address);
    return `${info.dev}:${info.ino}`;
  } catch {
    return null;
  }
}

/**
 * Remove a dead socket file, and only the one that was judged dead.
 *
 * Deleting a path is not the same as deleting the socket you looked at. Three
 * proxies whose shared broker had just been killed each found the same dead
 * socket, each removed it, and each then bound its own — measured at three
 * brokers where there should be one, every one of them deriving a full pool
 * budget from the same licence.
 */
function removeStaleSocket(address: string, expected: string | null, log: Logger): void {
  if (process.platform === "win32") return; // named pipes clean themselves up
  if (expected === null) return; // nothing was there to begin with
  if (socketIdentity(address) !== expected) {
    log("the socket was replaced while it was being checked; leaving it alone");
    return;
  }
  try {
    unlinkSync(address);
    log("removed a stale socket");
  } catch {
    // Already gone, or not ours to remove.
  }
}

const BIND_ATTEMPTS = 4;
const jitter = () => new Promise<void>((r) => setTimeout(r, 40 + Math.random() * 120));

export interface RunningBroker {
  server: Server;
  stop(): Promise<void>;
}

/**
 * What the licence permits, as far as is known before any kernel runs.
 *
 * Configuration wins; otherwise what an earlier kernel reported. Failing both,
 * "unknown" keeps the pool at a single kernel — which is all a cold start needs,
 * since that kernel then reports the licence itself and the pool re-derives its
 * budget (plugin plan D20). Nothing here starts a kernel.
 */
function resolveLicence(options: BrokerOptions): LicenceInfo {
  if (options.licenceOverride !== undefined) {
    options.log(`licence limit from configuration: ${options.licenceOverride}`);
    return { maxProcesses: options.licenceOverride, type: null };
  }
  if (!options.allowInspect) {
    options.log("installation inspection disabled; keeping a single kernel");
    return { maxProcesses: "unknown", type: null };
  }
  // A broker for an entitlement licenses its kernels by that, not by the
  // installation's own activation, so the cached licence is not its licence:
  // it starts at one kernel and learns from its first.
  if (settingValue(process.env["WOLFRAMINIT"]) !== undefined)
    return { maxProcesses: "unknown", type: null };
  const facts = readFacts(options.bin);
  if (!facts) return { maxProcesses: "unknown", type: null };
  return { maxProcesses: facts.maxLicenseProcesses, type: facts.licenseType };
}

export async function startBroker(options: BrokerOptions): Promise<RunningBroker | null> {
  const { address, log } = options;
  /**
   * Attached proxies, and what each one declared its kernels must be started with.
   *
   * `null` until a session says: a connection that has not declared cannot be
   * served, because guessing means serving it from whatever kernel happens to
   * exist — which is exactly how one project's settings came to run another's
   * calls.
   */
  const connections = new Map<Socket, { flavour: KernelFlavour | null }>();
  let emptyTimer: NodeJS.Timeout | null = null;
  let stopping = false;
  /** dev:ino of the socket this broker actually bound, so it only removes its own. */
  let boundIdentity: string | null = null;

  /**
   * The pool, once we know what the licence permits.
   *
   * Started here but deliberately not awaited until a request needs it. It
   * used to run a licence probe kernel for up to two minutes, while the proxy
   * waiting to attach gave up after five seconds — so awaiting it before
   * `listen()` meant every cold start lost the race, fell back to a private
   * kernel, and burned a second seat while the probe kernel was still resident.
   * The probe is gone (plugin plan D20) and this reads only caches now, so it
   * is ready at once; it stays a promise because every op awaits it, and
   * anything slow added here must keep the same rule — never ahead of
   * `listen()`.
   */
  const preparing = (async () => {
    const licence = resolveLicence(options);
    // Not a by-product of resolveLicence: with WOLFRAM_MCP_LICENSE_LIMIT set
    // that returns early, and the pool's kernels then got nothing.
    const extraEnv = installationEnv(options.bin, options.allowInspect);
    return new KernelPool({
      bin: options.bin,
      serverName: options.serverName,
      idleMs: options.idleMs,
      startTimeoutMs: options.startTimeoutMs,
      clientInfo: options.clientInfo,
      log,
      maxKernels: options.maxKernels,
      reserveSeats: options.reserveSeats,
      licence,
      extraEnv,
      learnFromKernels: options.allowInspect,
      licenceConfigured: options.licenceOverride !== undefined,
      onFacts: (facts, chosen) => {
        if (options.allowInspect) recordFacts(options.bin, facts, chosen, log);
      },
      onKernelReady: (client, flavour) => announceKernel(client, flavour),
    });
  })();
  // Nothing may reject unhandled while nobody is awaiting it yet.
  preparing.catch(() => {});

  /**
   * Read the new kernel's lists and push them to every attached proxy.
   *
   * Runs inside the queue, holding the slot that just started, so it must use
   * this client directly and never `pool.run`.
   */
  async function announceKernel(client: Client, flavour: string): Promise<void> {
    // Only the sessions this kernel can serve. Telling the others would put one
    // flavour's tool list into another's cache entry, under a key that exists to
    // keep them apart.
    const audience = [...connections.values()].filter((s) => s.flavour?.digest === flavour);
    if (audience.length === 0) return; // nobody to tell; the cache will do
    try {
      const capabilities = client.getServerCapabilities() ?? {};
      const tools = await drain<Tool>(async (cursor) => {
        const page = await client.listTools(cursor ? { cursor } : undefined);
        return { items: page.tools ?? [], nextCursor: page.nextCursor };
      });
      const prompts = capabilities.prompts
        ? await drain<Prompt>(async (cursor) => {
            const page = await client.listPrompts(cursor ? { cursor } : undefined);
            return { items: page.prompts ?? [], nextCursor: page.nextCursor };
          })
        : null;
      broadcast({ event: "kernelReady", capabilities, tools, prompts }, flavour);
    } catch (err) {
      // A proxy that hears nothing keeps its cached list, which is the same
      // position it was in before the kernel started.
      log(`could not read the new kernel's lists: ${errorText(err)}`);
    }
  }

  /**
   * Tell the attached proxies, optionally only those of one flavour.
   *
   * Scoped, because `kernelReady` carries a tool list and a capability set read
   * from one kernel, and a session of another flavour would cache that as its
   * own — the capability cache is keyed by flavour precisely so those cannot be
   * confused, and an unscoped broadcast would put the wrong answer under the
   * right key.
   */
  function broadcast(event: BrokerEvent, flavour?: string): void {
    const frame = encodeFrame(event);
    for (const [socket, state] of connections) {
      if (flavour !== undefined && state.flavour?.digest !== flavour) continue;
      if (socket.writable) socket.write(frame);
    }
  }

  async function handle(
    request: BrokerRequest,
    state: { flavour: KernelFlavour | null },
    inFlight: Map<number, AbortController>,
    emit: (frame: BrokerEvent) => void,
  ): Promise<BrokerResponse> {
    const reply = (result: unknown): BrokerResponse => ({ id: request.id, ok: true, result });
    // Every op below needs a kernel, and a kernel needs to be the right kind.
    // A session that never said is refused rather than guessed at; the proxy
    // declares at attach, so reaching this means a peer that cannot be served.
    const declared = state.flavour;
    if (!declared) {
      return {
        id: request.id,
        ok: false,
        error: "this session has not declared the environment its kernels need",
      };
    }
    // Widened to every name anybody declared, so a kernel started for this
    // session cannot inherit another session's variable from this process. The
    // digest is untouched: it still identifies which kernels are this session's.
    const flavour: KernelFlavour = {
      ...declared,
      names: [...new Set([...declared.names, ...declaredNames])],
    };
    // An evaluation is registered as its frame is read, before anything here
    // awaits, so a `cancel` frame that follows it can reach it. Registered
    // after `await preparing`, a cancel read first — in the same chunk, or
    // while a cold broker was still resolving its licence — found nothing,
    // and the evaluation ran to its ceiling. A kernel that ignores the
    // cancellation still ends up stopped: the rejection retires it rather than
    // returning it to the pool.
    const cancel = EVALUATIONS.has(request.op) ? new AbortController() : null;
    if (cancel) inFlight.set(request.id, cancel);
    try {
      // The first request may arrive before the licence is known; it waits here
      // rather than the proxy waiting to attach.
      const pool = await preparing;
      switch (request.op) {
        case "capabilities":
          return reply(await pool.run(flavour, async (c) => c.getServerCapabilities() ?? {}));
        // Drained inside the one slot, and answered as a complete list. A cursor
        // is paging state belonging to one kernel, and the pool hands out
        // whichever is free — so relaying a cursor could ask page 2 of a kernel
        // that never issued page 1. Nothing outside this process ever sees one.
        case "listTools":
          return reply({
            tools: await pool.run(flavour, (c, options) =>
              drain(async (cursor) => {
                const page = await c.listTools(cursor ? { cursor } : undefined, options);
                return { items: page.tools ?? [], nextCursor: page.nextCursor };
              }),
            ),
          });
        case "listPrompts":
          return reply({
            prompts: await pool.run(flavour, (c, options) =>
              drain(async (cursor) => {
                const page = await c.listPrompts(cursor ? { cursor } : undefined, options);
                return { items: page.prompts ?? [], nextCursor: page.nextCursor };
              }),
            ),
          });
        // The session's own call ceiling, and its cancel, as for a tool call: a
        // prompt runs its function in the kernel. Without a ceiling, the kernel
        // session's default.
        case "getPrompt":
          return reply(
            await pool.run(flavour, (c, options) => c.getPrompt(request.params as never, options), {
              deadlineMs: request.timeoutMs,
              signal: cancel?.signal,
            }),
          );
        case "listResources":
          return reply(
            await pool.run(flavour, (c, options) =>
              c.listResources(request.params as never, options),
            ),
          );
        case "readResource":
          return reply(
            await pool.run(
              flavour,
              (c, options) => c.readResource(request.params as never, options),
              {
                deadlineMs: request.timeoutMs,
                signal: cancel?.signal,
              },
            ),
          );
        case "callTool":
          return reply(
            await pool.run(
              flavour,
              (c, options) =>
                c.callTool(request.params as never, undefined, {
                  // The session's: the signal below, and an SDK timeout that
                  // cannot fire first (#34).
                  ...options,
                  // Measured: AgentTools never sends progress, so this only
                  // ever fires for a kernel that is not the real one. Kept
                  // because it costs nothing and the paclet may gain it.
                  onprogress: (progress) =>
                    emit({ event: "progress", target: request.id, progress }),
                }),
              // The deadline belongs to the session, not to the SDK request:
              // see LocalBackend.callTool.
              { deadlineMs: request.timeoutMs ?? 300_000, signal: cancel?.signal },
            ),
          );
        case "status":
          return reply({
            kernels: pool.size,
            busy: pool.busy,
            budget: pool.budget,
            licence: pool.licence,
            connections: connections.size,
            pid: process.pid,
          });
        default:
          return { id: request.id, ok: false, error: `unknown broker op: ${String(request.op)}` };
      }
    } catch (err) {
      // Carry the JSON-RPC code when the kernel gave one, so the proxy can still
      // tell a tool that failed from a tool that does not exist. errorText alone
      // reads the same either way, and the proxy decides by class.
      return {
        id: request.id,
        ok: false,
        error: errorText(err),
        ...(err instanceof McpError
          ? { code: err.code, ...(err.data === undefined ? {} : { data: err.data }) }
          : {}),
      };
    } finally {
      if (cancel) inFlight.delete(request.id);
    }
  }

  const onConnection = (socket: Socket) => {
    connections.set(socket, { flavour: null });
    if (emptyTimer) {
      clearTimeout(emptyTimer);
      emptyTimer = null;
    }
    log(`proxy connected (${connections.size} now attached)`);

    socket.setEncoding("utf8");
    // Per connection: request ids are a proxy's own counter, so two proxies
    // routinely use the same number for different work.
    const inFlight = new Map<number, AbortController>();
    const state = connections.get(socket) ?? { flavour: null };
    const reader = new FrameReader((frame) => {
      const request = frame as BrokerRequest;
      if (typeof request?.id !== "number") return;
      if (request.op === "cancel") {
        // No reply: the original request answers with its own rejection.
        const target = typeof request.target === "number" ? request.target : null;
        if (target !== null) {
          inFlight.get(target)?.abort(new Error("cancelled by the caller"));
        }
        return;
      }
      if (request.op === "hello") {
        // Beside ping and for the same reason: registering a flavour needs no
        // kernel, so it must not wait on `preparing` — a cold broker would
        // otherwise make every attaching session sit out the licence probe.
        const declared = readFlavour(request.params);
        if (declared) {
          for (const name of declared.names) declaredNames.add(name);
          state.flavour = declared;
          log(`a proxy declared environment ${declared.digest}`);
        }
        if (socket.writable) {
          socket.write(
            encodeFrame(
              declared
                ? { id: request.id, ok: true, result: { flavours: true, flavour: declared.digest } }
                : {
                    id: request.id,
                    ok: false,
                    error:
                      "hello needs the environment this session's kernels must be started with",
                  },
            ),
          );
        }
        return;
      }
      if (request.op === "ready") {
        // Beside ping, outside handle(): handle() serves through the pool, and
        // a pool with every slot busy would make a ready broker look unready.
        preparing.then(
          () => {
            if (socket.writable) socket.write(encodeFrame({ id: request.id, ok: true }));
          },
          (err: unknown) => {
            if (socket.writable) {
              socket.write(encodeFrame({ id: request.id, ok: false, error: errorText(err) }));
            }
          },
        );
        return;
      }
      if (request.op === "ping") {
        // Answered here and not in handle(), which opens with `await preparing`.
        // A cold broker is still resolving the licence for up to two minutes,
        // and a ping queued behind that would report a perfectly healthy broker
        // as dead to every proxy attaching during a cold start — each of them
        // then spending a private seat, which is the cost listening before
        // probing was written to avoid. Reaching this line is the whole answer:
        // the process is running and reading its socket.
        if (socket.writable) socket.write(encodeFrame({ id: request.id, ok: true }));
        return;
      }
      const emit = (frame: BrokerEvent) => {
        if (socket.writable) socket.write(encodeFrame(frame));
      };
      void handle(request, state, inFlight, emit).then((response) => {
        if (socket.writable) socket.write(encodeFrame(response));
      });
    });
    socket.on("data", (chunk: string) => reader.push(chunk));
    socket.on("error", () => socket.destroy());
    socket.on("close", () => {
      // A proxy that vanished is not waiting for anything: stop its work.
      for (const controller of inFlight.values()) {
        controller.abort(new Error("the proxy disconnected"));
      }
      inFlight.clear();
      connections.delete(socket);
      log(`proxy disconnected (${connections.size} still attached)`);
      if (connections.size === 0) scheduleExit();
    });
  };

  function scheduleExit(): void {
    if (emptyTimer || stopping) return;
    emptyTimer = setTimeout(() => {
      if (connections.size > 0) return;
      log("no proxies attached, shutting down");
      void stop().then(() => process.exit(0));
    }, EMPTY_GRACE_MS);
    emptyTimer.unref?.();
  }

  async function stop(): Promise<void> {
    if (stopping) return;
    stopping = true;
    const pool = await preparing.catch(() => null);
    broadcast({ event: "shuttingDown" });
    for (const socket of connections.keys()) socket.destroy();
    // stop() only ever runs on a broker that won the socket, but the binding
    // happens after this is defined, so the compiler cannot see that.
    await new Promise<void>((resolve) => {
      if (server) server.close(() => resolve());
      else resolve();
    });
    await pool?.stop();
    if (process.platform !== "win32") {
      try {
        // libuv already unlinked the bound path during server.close(), so
        // anything here now belongs to a successor that bound during
        // pool.stop() — which can take seconds.
        const here = statSync(address);
        if (boundIdentity !== null && `${here.dev}:${here.ino}` !== boundIdentity) {
          log("a newer broker owns the socket; leaving it alone");
        } else {
          unlinkSync(address);
        }
      } catch {
        // Someone else already tidied it.
      }
    }
  }

  /**
   * Take the socket, or stand down.
   *
   * Explicitly ordered — ask whether anyone is listening, clear only a file we
   * have just seen to be dead, then bind a *fresh* handle — because the previous
   * shape reacted to libuv's error codes instead. A stale unix socket surfaces as
   * EADDRINUSE or EEXIST depending on timing, only one of those was handled, and
   * retrying on the same handle after a failed bind left three brokers all
   * reporting the address in use while nothing at all was listening. Losing the
   * race is normal and expected here: whoever loses attaches as a client.
   */
  async function claimSocket(): Promise<Server | null> {
    for (let attempt = 1; attempt <= BIND_ATTEMPTS; attempt++) {
      // Identify the file *before* asking whether it is alive, so the answer and
      // the file it describes cannot drift apart. Taking it afterwards means a
      // broker that bound while the probe was in flight looks exactly like the
      // dead socket the probe judged — and removing it under that mistake left
      // two brokers running, one of them on an unlinked inode.
      const judged = socketIdentity(address);
      if (await socketIsLive(address)) {
        log("another broker is already listening; standing down");
        return null;
      }
      removeStaleSocket(address, judged, log);

      const candidate = createServer(onConnection);
      // Create it 0600 rather than narrow it afterwards. A chmod has to name the
      // file, and an over-long address is truncated by bind, so the path we
      // would chmod is not always the path that exists — measured, a 152-byte
      // address bound successfully while the directory we asked for stayed
      // empty. A umask needs no path, and it also closes the window in which the
      // socket exists at the umask's default 755, connectable by anyone.
      const previousMask = process.umask(0o777 & ~SOCKET_MODE);
      const bound = await new Promise<boolean>((resolve) => {
        candidate.once("error", (err: NodeJS.ErrnoException) => {
          // Always say why. A bind that fails for a reason nobody logged is
          // what made this take three investigations to understand.
          log(`bind attempt ${attempt} failed: ${err.code ?? "?"} ${err.message}`);
          resolve(false);
        });
        candidate.listen(address, () => resolve(true));
      }).finally(() => {
        // Process-global, so it is held for exactly as long as the bind and put
        // back whichever way that went.
        process.umask(previousMask);
      });
      if (bound) return candidate;

      candidate.close();
      if (attempt < BIND_ATTEMPTS) await jitter();
    }
    log(`gave up trying to bind ${address} after ${BIND_ATTEMPTS} attempts`);
    return null;
  }

  // Checked here as well as in the proxy, because this command can be run by
  // hand and a broker that binds somewhere unsafe is unsafe however it started.
  const fault = socketFault(address);
  if (fault) {
    log(
      `refusing to listen: ${fault}. Sessions will use private kernels until ` +
        `WOLFRAM_MCP_RUNTIME_DIR (or XDG_RUNTIME_DIR) names a directory only you can write to`,
    );
    return null;
  }

  const server = await claimSocket();
  const listened = server !== null;

  if (!listened) return null;

  try {
    const bound = statSync(address);
    boundIdentity = `${bound.dev}:${bound.ino}`;
  } catch {
    boundIdentity = null; // win32 pipes, or a path we cannot stat
  }
  log(`broker listening on ${address} (pid ${process.pid})`);
  scheduleExit();

  process.on("SIGINT", () => void stop().then(() => process.exit(0)));
  process.on("SIGTERM", () => void stop().then(() => process.exit(0)));

  return { server, stop };
}
