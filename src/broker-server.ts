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
import { McpError, type Prompt } from "@modelcontextprotocol/sdk/types.js";
import { createServer, type Server, type Socket } from "node:net";
import { linkSync, rmSync, statSync, unlinkSync } from "node:fs";
import { connect } from "node:net";
import { dirname, join } from "node:path";
import { KernelPool, type LicenceInfo } from "./pool.js";
import { installationEnv, readFacts, recordFacts } from "./inspect.js";
import {
  encodeFrame,
  FrameReader,
  type BrokerEvent,
  type BrokerOp,
  type BrokerRequest,
  type BrokerResponse,
  MAX_SOCKET_PATH,
  socketFault,
  SOCKET_MODE,
} from "./broker-protocol.js";
import { settingValue, type KernelFlavour } from "./flavour.js";
import { drainPages, listAllTools } from "./kernel.js";
import { errorText, type Logger } from "./log.js";

/** How long to linger with no connections before exiting. */
const EMPTY_GRACE_MS = 60_000;

/**
 * How often a broker checks that its address still holds the socket it bound.
 *
 * Two brokers can both take the address (#32). Each judges the same dead
 * socket, and one removes it and takes the address; the other, descheduled
 * between checking the file's identity and unlinking it, then unlinks the
 * winner's fresh socket and takes the address itself. Nothing atomic removes a
 * path only if it is still the file judged dead. The winner went on serving the sessions attached to it, holding its
 * pool's seats, on a socket no new session could find. So a broker that finds
 * its address no longer holds its own socket leaves: whatever removed or
 * replaced it, a session can reach only the broker at the address.
 */
const ADDRESS_CHECK_MS = 500;

/** The ops a kernel evaluates, which a `cancel` frame may stop. */
const EVALUATIONS: ReadonlySet<BrokerOp> = new Set<BrokerOp>([
  "callTool",
  "getPrompt",
  "readResource",
]);

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
  /**
   * For the suite: called the moment a socket is bound, before its identity is
   * read, which is where another broker's removal of a stale socket can land
   * (#32). A check replaces the address here, as that broker would, to show
   * that whatever is put there meanwhile is never taken for this broker's own.
   */
  onBound?: ((path: string) => void) | undefined;
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

/**
 * Claims made by this process, for the name each binds under before linking
 * (`claimSocket`). The pid alone named the process, not the claim, and a library
 * caller can run two brokers in one process: claiming at once in one directory,
 * the second replaced the first's socket under the shared name between its
 * bind and its link, so the first linked the second's socket to its address.
 */
let claims = 0;
const jitter = () => new Promise<void>((r) => setTimeout(r, 40 + Math.random() * 120));

/** The address taken: the server, its socket's identity, and whether it is bound there itself. */
interface Claim {
  server: Server;
  identity: string | null;
  /** Bound at the address rather than linked to it, so closing unlinks the address. */
  atAddress: boolean;
}

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

/**
 * Serve kernels to proxies at `options.address`, or return null when another
 * broker already does, or the address cannot be used safely.
 *
 * A broker owns its process, so a library caller that starts one in its own
 * gives that process up to it: it exits once nobody has been attached for
 * `EMPTY_GRACE_MS`, and as soon as its address no longer holds its socket
 * (`ADDRESS_CHECK_MS`) and what its sessions asked is answered.
 */
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
  /** Requests being served, so a broker that is leaving lets them finish. */
  let outstanding = 0;
  /** Set once this broker has found another at its address, or none. */
  let retiring = false;
  let addressWatch: NodeJS.Timeout | null = null;
  /** dev:ino of the socket this broker actually bound, so it only removes its own. */
  let boundIdentity: string | null = null;
  /** See `Claim.atAddress`. */
  let boundAtAddress = false;

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
      // Whole lists, so a broadcast carries every page, not page one.
      const tools = await listAllTools(client);
      const prompts = capabilities.prompts
        ? await drainPages<Prompt>(async (cursor) => {
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
            tools: await pool.run(flavour, (c, options) => listAllTools(c, options)),
          });
        case "listPrompts":
          return reply({
            prompts: await pool.run(flavour, (c, options) =>
              drainPages(async (cursor) => {
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
      outstanding++;
      void handle(request, state, inFlight, emit)
        .then((response) => {
          if (socket.writable) socket.write(encodeFrame(response));
        })
        .finally(() => {
          outstanding--;
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
      if (connections.size > 0 || stopping) return;
      log("no proxies attached, shutting down");
      void stop().then(() => process.exit(0));
    }, EMPTY_GRACE_MS);
    emptyTimer.unref?.();
  }

  /**
   * Leave, once this broker is no longer the one at its address (see
   * `ADDRESS_CHECK_MS`). Its sessions are told now, so each chooses again on its
   * next request and finds the broker that is there; what they asked before
   * that is answered first, and then it stops.
   */
  function checkAddress(): void {
    if (stopping) return;
    if (!retiring) {
      const now = socketIdentity(address);
      if (now === boundIdentity) return;
      retiring = true;
      log(
        `${now === null ? "the socket at this address is gone" : "another broker owns this address now"}; ` +
          `telling ${connections.size} proxies to choose again, and leaving once their requests are answered`,
      );
      broadcast({ event: "shuttingDown" });
    }
    if (outstanding > 0) return;
    void stop().then(() => process.exit(0));
  }

  async function stop(): Promise<void> {
    if (stopping) return;
    stopping = true;
    if (addressWatch) clearInterval(addressWatch);
    // Held otherwise: a broker stopped by a library caller that carries on
    // still ended that caller's process when the timer fired, 60s later.
    if (emptyTimer) clearTimeout(emptyTimer);
    const pool = await preparing.catch(() => null);
    broadcast({ event: "shuttingDown" });
    for (const socket of connections.keys()) socket.destroy();
    // Give up the address while still listening, and only if it is still this
    // broker's: a broker probing it meanwhile finds it alive and stands down, so
    // nothing can replace it between the check and the unlink. Unlinked after
    // closing, it could have been a successor's by then — removed, and that
    // broker orphaned in turn. A linked socket's close unlinks only the staging
    // name, long gone.
    const ours = boundIdentity === null || socketIdentity(address) === boundIdentity;
    if (ours && boundIdentity !== null && !boundAtAddress) {
      try {
        unlinkSync(address);
      } catch {
        // Already gone.
      }
    }
    // A socket bound at the address itself is unlinked by its close, whatever
    // is at the address by then: so one that is no longer there is left open,
    // and goes with the process, which unlinks nothing.
    // stop() only ever runs on a broker that won the socket, but the binding
    // happens after this is defined, so the compiler cannot see that.
    await new Promise<void>((resolve) => {
      if (server && (ours || !boundAtAddress)) server.close(() => resolve());
      else resolve();
    });
    await pool?.stop();
  }

  /**
   * Listen on `path` with a fresh handle, or say why not.
   *
   * Fresh each time, because retrying on the same handle after a failed bind
   * left three brokers all reporting the address in use while nothing at all
   * was listening.
   */
  async function listenAt(path: string, attempt: number): Promise<Server | null> {
    const candidate = createServer(onConnection);
    // Create it 0600 rather than narrow it afterwards. A chmod has to name the
    // file, and an over-long address is truncated by bind, so the path we
    // would chmod is not always the path that exists — measured, a 152-byte
    // address bound successfully while the directory we asked for stayed
    // empty. A umask needs no path, and it also closes the window in which the
    // socket exists at the umask's default 755, connectable by anyone.
    //
    // Process-global, so it is held for exactly the bind, which listen() makes
    // before it returns: the socket's file exists, 0600, by then (measured on
    // macOS and Linux). Held until the bind's callback instead, two brokers
    // binding at once in one process put back each other's, and the second
    // restored the first's 0177 for good — every directory the process made
    // after that came out untraversable.
    const previousMask = process.umask(0o777 & ~SOCKET_MODE);
    try {
      candidate.listen(path);
    } finally {
      process.umask(previousMask);
    }
    const bound = await new Promise<boolean>((resolve) => {
      candidate.once("error", (err: NodeJS.ErrnoException) => {
        // Always say why. A bind that fails for a reason nobody logged is
        // what made this take three investigations to understand.
        log(`bind attempt ${attempt} failed: ${err.code ?? "?"} ${err.message}`);
        resolve(false);
      });
      candidate.once("listening", () => resolve(true));
    });
    if (bound) return candidate;
    candidate.close();
    return null;
  }

  /**
   * Take the address, or stand down.
   *
   * Explicitly ordered — ask whether anyone is listening, clear only a file we
   * have just seen to be dead, then take the address — because the previous
   * shape reacted to libuv's error codes instead. A stale unix socket surfaces as
   * EADDRINUSE or EEXIST depending on timing, only one of those was handled, and
   * three brokers ended up reporting the address in use while nothing at all
   * was listening. Losing the race is normal and expected here: whoever loses
   * attaches as a client.
   *
   * The socket is bound under a name only this process uses, beside the address,
   * and then linked to it, which fails if anything is there. Two things follow
   * (#32). The identity recorded is this socket's own, read where nothing else
   * can replace it: read at the address after binding there, it was whatever
   * another broker had put there meanwhile, so two brokers could each believe
   * one socket theirs and neither would notice it was not. And libuv unlinks a
   * server's own path when it closes, whatever is at that path by then: bound
   * at the address, a broker whose socket had been removed under it took the
   * live broker's socket with it on the way out. Its own path is now the
   * staging name, unlinked as soon as the link is made.
   */
  async function claimSocket(): Promise<Claim | null> {
    // A named pipe has no file to link, and nothing can replace one. An address
    // too long for a socket path is bound truncated, and connected to truncated
    // the same way, which is how sharing survives it (`brokerAddress`); but on
    // Linux the staging name beside it is truncated too, so there is no file by
    // its full name to link, and no broker would ever take the address.
    if (process.platform === "win32" || Buffer.byteLength(address) > MAX_SOCKET_PATH) {
      return claimDirect();
    }

    // Short, so it fits wherever the address does: sun_path is 104 bytes on
    // macOS. Any file of this name was left by a process that died with this
    // pid, since a live one is this process, and `claims` keeps its own apart.
    const staging = join(dirname(address), `.b${process.pid}-${claims++}`);
    rmSync(staging, { force: true });
    const server = await listenAt(staging, 1);
    if (!server) return null;
    options.onBound?.(staging);
    const identity = socketIdentity(staging);
    let unlinkable = false;
    try {
      for (let attempt = 1; attempt <= BIND_ATTEMPTS; attempt++) {
        // Identify the file *before* asking whether it is alive, so the answer
        // and the file it describes cannot drift apart. Taking it afterwards
        // means a broker that bound while the probe was in flight looks exactly
        // like the dead socket the probe judged — and removing it under that
        // mistake left two brokers running, one of them on an unlinked inode.
        const judged = socketIdentity(address);
        if (await socketIsLive(address)) {
          log("another broker is already listening; standing down");
          break;
        }
        removeStaleSocket(address, judged, log);
        try {
          linkSync(staging, address);
          return { server, identity, atAddress: false };
        } catch (err) {
          const code = (err as NodeJS.ErrnoException).code ?? "?";
          log(`link attempt ${attempt} failed: ${code} ${errorText(err)}`);
          // Anything but a file in the way is this filesystem refusing a hard
          // link to a socket, and binding at the address is what worked before.
          if (code !== "EEXIST") {
            unlinkable = true;
            break;
          }
        }
        if (attempt < BIND_ATTEMPTS) await jitter();
        else log(`gave up trying to take ${address} after ${BIND_ATTEMPTS} attempts`);
      }
    } finally {
      // Linked or not, the staging name has done its work.
      try {
        unlinkSync(staging);
      } catch {
        // Already gone.
      }
    }
    server.close();
    return unlinkable ? claimDirect() : null;
  }

  /**
   * Bind at the address itself, where nothing can be linked: a named pipe, an
   * address too long for a socket path, a filesystem without hard links. The
   * identity is read from the address after binding, which another broker may
   * have replaced by then, and for a truncated address there is none to read.
   * Closing such a server unlinks the address, whatever is there.
   */
  async function claimDirect(): Promise<Claim | null> {
    for (let attempt = 1; attempt <= BIND_ATTEMPTS; attempt++) {
      // As in claimSocket, and for the same reason.
      const judged = socketIdentity(address);
      if (await socketIsLive(address)) {
        log("another broker is already listening; standing down");
        return null;
      }
      removeStaleSocket(address, judged, log);
      const server = await listenAt(address, attempt);
      if (server) {
        options.onBound?.(address);
        return {
          server,
          identity: process.platform === "win32" ? null : socketIdentity(address),
          atAddress: true,
        };
      }
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

  const claimed = await claimSocket();
  if (!claimed) return null;
  const { server } = claimed;
  boundIdentity = claimed.identity;
  boundAtAddress = claimed.atAddress;
  log(`broker listening on ${address} (pid ${process.pid})`);
  scheduleExit();
  // Named pipes have no identity to compare, and nothing can replace one.
  if (boundIdentity !== null) {
    addressWatch = setInterval(checkAddress, ADDRESS_CHECK_MS);
    addressWatch.unref?.();
  }

  process.on("SIGINT", () => void stop().then(() => process.exit(0)));
  process.on("SIGTERM", () => void stop().then(() => process.exit(0)));

  return { server, stop };
}
