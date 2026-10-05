/**
 * The `lsp` subcommand: Wolfram's own LSPServer paclet, behind this package's
 * kernel discovery.
 *
 * Why a subcommand rather than naming the kernel in an editor's configuration:
 * the kernel lives somewhere different on every machine, which is the problem
 * `locateKernel` already solves for the MCP side — one discovery, honouring the
 * same discovery environment, serving both protocols. And why *here* rather
 * than only in the plugin's launcher script: the single-file bundle has no
 * scripts directory, so the LSP has to be reachable from the one artifact a
 * marketplace or a release download delivers.
 *
 * stdout is the LSP protocol channel. Nothing here may write to it: a single
 * stray line disconnects the server, and the client counts that as a crash.
 * Everything this module has to say goes to stderr. LSPServer itself keeps the
 * same discipline — measured: its banners and logs all arrive on stderr.
 *
 * An LSP kernel is a full WolframKernel, so it costs a licence seat from the
 * first Wolfram Language file the session touches, outside the MCP pool's
 * budget. It is on by default, and when switched off (`lspDecision`) this
 * process answers the LSP handshake itself, advertising no capabilities, and
 * starts nothing. A stub rather than an exit, because a clean exit here is a crash to
 * the client, and the default restartOnCrash would relaunch it in a loop.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadConfig } from "./config.js";
import { doctorCommand } from "./doctor.js";
import { locateKernel, type KernelInstall } from "./locate.js";
import type { Logger } from "./log.js";

/**
 * Which installation the LSP kernel runs, resolved through the same `loadConfig`
 * the MCP side uses — so the plugin's two halves always name the same kernel.
 *
 * Reading `process.env` directly here instead was subtly narrower than the MCP
 * path: it saw only `WOLFRAM_MCP_KERNEL`/`WOLFRAM_MCP_VERSION`, missing the
 * `WOLFRAM_KERNEL_PATH` alias and the `WOLFRAM_MCP_MIN_VERSION` override that
 * `loadConfig` reads, and it took an unsubstituted `${...}` placeholder as a
 * real path — which fails discovery, exits non-zero, and is relaunched by the
 * client's `restartOnCrash` — where `loadConfig` treats it as unset.
 */
export function discoverLspKernel(log: Logger): KernelInstall | null {
  const config = loadConfig(log);
  // Seat-free, as the MCP side is, so the two halves still name the same
  // kernel: one asking wolframscript and the other not could disagree on a
  // machine where only wolframscript knows the installation.
  return locateKernel({
    override: config.kernelPath,
    version: config.version,
    minVersion: config.minVersion,
    log,
    allowWolframScript: false,
  });
}

const ON = ["1", "true", "on", "yes"];
const OFF = ["0", "false", "off", "no"];

export interface LspDecision {
  enabled: boolean;
  /** Which setting decided, for the line the launcher writes to stderr. */
  because: string;
}

/** Where the SessionStart hook records the plugin's `lsp` option for the LSP server. */
export function lspOptionFile(env: NodeJS.ProcessEnv = process.env): string | null {
  const data = env["CLAUDE_PLUGIN_DATA"]?.trim();
  return data ? join(data, "lsp-option") : null;
}

/**
 * Pass the plugin's `lsp` option on to the LSP server, from the one process
 * that is given it.
 *
 * Claude Code exports plugin options only to hooks, as
 * `CLAUDE_PLUGIN_OPTION_<KEY>`. The LSP server used to take it as
 * `${user_config.lsp}` in its own entry instead, and a client with no stored
 * value for the option — a plugin synced from an upload, as Claude Desktop
 * does, or loaded with --plugin-dir — refused to load the LSP server at all
 * ("No LSP server available for file type: .wl"). So the SessionStart hook,
 * which runs before any file opens, records it in the plugin's data directory,
 * which both processes are given; and removes what an earlier session recorded
 * once the option is cleared, since unset means the default. Never fails the
 * hook: a missing or unwritable directory just leaves the default.
 */
export function recordLspOption(env: NodeJS.ProcessEnv = process.env): void {
  const file = lspOptionFile(env);
  if (!file) return;
  try {
    const value = env["CLAUDE_PLUGIN_OPTION_LSP"]?.trim();
    if (value) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, `${value}\n`);
    } else {
      rmSync(file, { force: true });
    }
  } catch {
    // Nowhere to record it; the LSP server takes the default.
  }
}

/**
 * Whether the LSP kernel runs, and which setting said so.
 *
 * On by default (plugin plan D23): someone using the plugin in Claude Code wants
 * its code intelligence too, and Claude Code starts an LSP server only when a
 * Wolfram Language file is opened, so a session that opens none spends nothing.
 * From that first file it holds a licence seat for the session, outside the MCP
 * pool's budget, which is what the off switches are for.
 *
 * `WOLFRAM_MCP_LSP` is the user's own switch and wins when it is set at all, so
 * an environment that already said no is never overridden by the plugin's
 * option. Then the option, as the SessionStart hook recorded it. A value that is
 * neither on nor off is off, and says so — guessing "on" from a typo would
 * spend the seat the user may have been trying to keep.
 */
export function lspDecision(env: NodeJS.ProcessEnv = process.env): LspDecision {
  const file = lspOptionFile(env);
  let option: string | undefined;
  try {
    option = file && existsSync(file) ? readFileSync(file, "utf8") : undefined;
  } catch {
    option = undefined;
  }
  const sources: [string, string | undefined][] = [
    ["WOLFRAM_MCP_LSP", env["WOLFRAM_MCP_LSP"]],
    ["the plugin's lsp option", option],
  ];
  for (const [name, setting] of sources) {
    const raw = setting?.trim();
    // Blank, or a `${...}` the host left unsubstituted, is not a setting.
    if (!raw || /^\$\{.*\}$/.test(raw)) continue;
    const value = raw.toLowerCase();
    if (ON.includes(value)) return { enabled: true, because: `${name}=${raw}` };
    if (OFF.includes(value)) return { enabled: false, because: `${name}=${raw}` };
    return {
      enabled: false,
      because: `${name}=${raw} is neither on nor off (${[...ON, ...OFF].join(", ")}); treating it as off`,
    };
  }
  return { enabled: true, because: "on by default; the plugin's lsp option turns it off" };
}

/**
 * An LSP frame's body, read out of a byte stream that may split or join frames.
 *
 * Chunks are held as a list and joined once a frame's length is known to be
 * there: every frame of a session now passes through this process, and joining
 * on every 64 KB chunk made a large didOpen quadratic in its size.
 */
function frameReader(onFrame: (frame: Buffer, body: string) => void): (chunk: Buffer) => void {
  let pending: Buffer[] = [];
  let size = 0;
  let wanted = 0; // bytes the frame at the front needs, once its header is read
  return (chunk) => {
    pending.push(chunk);
    size += chunk.length;
    if (size < wanted) return;
    let buf = pending.length === 1 ? chunk : Buffer.concat(pending, size);
    wanted = 0;
    for (;;) {
      const headerEnd = buf.indexOf("\r\n\r\n");
      if (headerEnd === -1) break;
      const length = Number(
        /Content-Length: (\d+)/i.exec(buf.subarray(0, headerEnd).toString())?.[1],
      );
      if (!Number.isFinite(length)) break;
      if (buf.length < headerEnd + 4 + length) {
        wanted = headerEnd + 4 + length;
        break;
      }
      const frame = buf.subarray(0, headerEnd + 4 + length);
      buf = buf.subarray(headerEnd + 4 + length);
      onFrame(frame, frame.subarray(headerEnd + 4).toString());
    }
    pending = buf.length > 0 ? [buf] : [];
    size = buf.length;
  };
}

/**
 * Each LSP request, and the path into the server's capabilities that says it is
 * served — deeper than the provider where serving it takes more. From the LSP
 * 3.17 specification's request list. To a client that opts in through
 * `initializationOptions.semanticTokens`, LSPServer advertises semantic tokens
 * as `{range: False, full: {delta: False}}` and handles only the full request,
 * so checking the provider alone would let the range and delta requests through
 * to a kernel that exits on them.
 */
const REQUEST_CAPABILITY: Record<string, readonly [string, ...string[]]> = {
  "textDocument/hover": ["hoverProvider"],
  "textDocument/completion": ["completionProvider"],
  "completionItem/resolve": ["completionProvider", "resolveProvider"],
  "textDocument/signatureHelp": ["signatureHelpProvider"],
  "textDocument/declaration": ["declarationProvider"],
  "textDocument/definition": ["definitionProvider"],
  "textDocument/typeDefinition": ["typeDefinitionProvider"],
  "textDocument/implementation": ["implementationProvider"],
  "textDocument/references": ["referencesProvider"],
  "textDocument/documentHighlight": ["documentHighlightProvider"],
  "textDocument/documentSymbol": ["documentSymbolProvider"],
  "textDocument/codeAction": ["codeActionProvider"],
  "codeAction/resolve": ["codeActionProvider", "resolveProvider"],
  "textDocument/codeLens": ["codeLensProvider"],
  "codeLens/resolve": ["codeLensProvider", "resolveProvider"],
  "textDocument/documentLink": ["documentLinkProvider"],
  "documentLink/resolve": ["documentLinkProvider", "resolveProvider"],
  "textDocument/documentColor": ["colorProvider"],
  "textDocument/colorPresentation": ["colorProvider"],
  "textDocument/formatting": ["documentFormattingProvider"],
  "textDocument/rangeFormatting": ["documentRangeFormattingProvider"],
  "textDocument/onTypeFormatting": ["documentOnTypeFormattingProvider"],
  "textDocument/rename": ["renameProvider"],
  "textDocument/prepareRename": ["renameProvider", "prepareProvider"],
  "textDocument/foldingRange": ["foldingRangeProvider"],
  "textDocument/selectionRange": ["selectionRangeProvider"],
  "textDocument/prepareCallHierarchy": ["callHierarchyProvider"],
  "callHierarchy/incomingCalls": ["callHierarchyProvider"],
  "callHierarchy/outgoingCalls": ["callHierarchyProvider"],
  "textDocument/prepareTypeHierarchy": ["typeHierarchyProvider"],
  "typeHierarchy/supertypes": ["typeHierarchyProvider"],
  "typeHierarchy/subtypes": ["typeHierarchyProvider"],
  "textDocument/semanticTokens/full": ["semanticTokensProvider"],
  "textDocument/semanticTokens/full/delta": ["semanticTokensProvider", "full", "delta"],
  "textDocument/semanticTokens/range": ["semanticTokensProvider", "range"],
  "textDocument/linkedEditingRange": ["linkedEditingRangeProvider"],
  "textDocument/moniker": ["monikerProvider"],
  "textDocument/inlayHint": ["inlayHintProvider"],
  "inlayHint/resolve": ["inlayHintProvider", "resolveProvider"],
  "textDocument/inlineValue": ["inlineValueProvider"],
  "textDocument/diagnostic": ["diagnosticProvider"],
  "workspace/diagnostic": ["diagnosticProvider", "workspaceDiagnostics"],
  "workspace/symbol": ["workspaceSymbolProvider"],
  "workspaceSymbol/resolve": ["workspaceSymbolProvider", "resolveProvider"],
  "workspace/executeCommand": ["executeCommandProvider"],
};

/**
 * Stand between the client and Wolfram's LSPServer, and answer what it cannot.
 *
 * LSPServer has no handler for a request it never advertised, and does not
 * answer MethodNotFound: measured on 15.0.0, `workspace/symbol` ends in
 * "Internal assert 4 failed … KERNEL IS EXITING HARD", taking every later
 * request with it. Claude Code sends such requests regardless of capabilities —
 * workspace symbols and call hierarchy took the server down in Claude Desktop.
 * So requests are checked against what the server's own `initialize` reply
 * advertised, and one it did not, or one the specification does not list, is
 * answered MethodNotFound here and never reaches the kernel. Everything else —
 * lifecycle, notifications, replies to the server's own requests — passes
 * through unchanged, a whole frame at a time, so a reply written here never
 * lands inside one of the kernel's.
 */
function guardUnadvertised(child: ChildProcess): void {
  let capabilities: Record<string, unknown> | null = null;
  let initializeId: number | string | undefined;
  const toClient = (frame: Buffer | string) => process.stdout.write(frame);
  const reply = (id: number | string, method: string) => {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `${method} is not supported by Wolfram's LSPServer` },
    });
    toClient(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
  };
  const served = (method: string): boolean => {
    if (method === "initialize" || method === "shutdown") return true;
    if (capabilities === null) return true; // nothing known yet; a client waits for initialize
    const needed = REQUEST_CAPABILITY[method];
    if (!needed) return false;
    // A step into `true` ends the walk unserved: `full: true` offers no delta.
    let at: unknown = capabilities;
    for (const key of needed) {
      if (typeof at !== "object" || at === null) return false;
      at = (at as Record<string, unknown>)[key];
    }
    return Boolean(at);
  };

  process.stdin.on(
    "data",
    frameReader((frame, body) => {
      let msg: { id?: number | string; method?: string } = {};
      try {
        msg = JSON.parse(body) as typeof msg;
      } catch {
        // not ours to judge; the kernel says what it makes of it
      }
      if (msg.method === "initialize") initializeId = msg.id;
      if (msg.id !== undefined && msg.method && !served(msg.method)) {
        reply(msg.id, msg.method);
        return;
      }
      child.stdin?.write(frame);
    }),
  );
  process.stdin.on("end", () => child.stdin?.end());
  child.stdout?.on(
    "data",
    frameReader((frame, body) => {
      if (capabilities === null && initializeId !== undefined) {
        try {
          const msg = JSON.parse(body) as {
            id?: number | string;
            result?: { capabilities?: Record<string, unknown> };
          };
          if (msg.id === initializeId) capabilities = msg.result?.capabilities ?? {};
        } catch {
          // passed on as it came
        }
      }
      toClient(frame);
    }),
  );
}

/** @returns an exit code, or null to keep running and serve the protocol. */
export function runLsp(): number | null {
  const log: Logger = (message) => {
    process.stderr.write(`[wolfram-lsp] ${message}\n`);
  };
  const decision = lspDecision();
  if (!decision.enabled) {
    serveNothing(decision.because);
    return null;
  }
  log(`code intelligence on (${decision.because}); this kernel takes a licence seat`);

  const install = discoverLspKernel(log);
  if (!install) {
    process.stderr.write(
      `[wolfram-lsp] no usable Wolfram installation was found; ` +
        `code intelligence is off. WOLFRAM_MCP_KERNEL names one explicitly, ` +
        `and ${doctorCommand()} says what is wrong\n`,
    );
    return 1;
  }
  process.stderr.write(
    `[wolfram-lsp] starting LSPServer on ${install.bin} (${install.version ?? "unknown version"})\n`,
  );

  // The flag set LSPServer's own troubleshooting guide names for clients, and
  // the one the handshake was measured clean under. -noinit and -nopaclet keep
  // a user's init.m and paclet updates from printing during startup; LSPServer
  // still loads, because it ships inside the layout. -nostartuppaclets is spelled
  // as Wolfram's own VS Code extension spells it: this said -nostartuppackets,
  // which the kernel ignores without a word, so startup paclets still loaded.
  const child = spawn(
    install.bin,
    [
      "-noinit",
      "-noprompt",
      "-nopaclet",
      "-nostartuppaclets",
      "-noicon",
      "-run",
      'Needs["LSPServer`"];LSPServer`StartServer[]',
    ],
    // Piped rather than inherited, so the guard below can answer what the
    // kernel cannot. stderr still goes straight to the client's log.
    { stdio: ["pipe", "pipe", "inherit"] },
  );
  guardUnadvertised(child);
  child.on("error", (err) => {
    process.stderr.write(`[wolfram-lsp] the kernel could not be started: ${err.message}\n`);
    process.exit(1);
  });
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => child.kill(signal));
  }
  // Gone is gone: a frame written in the moment between the kernel dying and
  // 'close' would otherwise raise EPIPE with nobody listening — an uncaught
  // exception in place of the exit below.
  child.stdin?.on("error", () => {});
  // 'close', not 'exit', and only once this process's own writes have drained.
  // Piped through here, the kernel's last replies may still be unread when it
  // exits, and a write to the client's pipe is asynchronous on macOS: exiting
  // on 'exit' cut a reply the kernel had already sent.
  child.on("close", (code, signal) => {
    process.stdout.write("", () => process.exit(signal ? 1 : (code ?? 0)));
  });
  return null;
}

/**
 * Answer the LSP handshake with no capabilities, and serve nothing.
 *
 * Just enough protocol to be a well-behaved server that does not exist:
 * initialize gets an empty capability set, shutdown and exit are honoured,
 * every other request is answered MethodNotFound, notifications are ignored.
 */
function serveNothing(because: string): void {
  process.stderr.write(`[wolfram-lsp] ${because}: serving no capabilities, starting no kernel\n`);
  let down = false;
  const send = (msg: unknown) => {
    const body = JSON.stringify(msg);
    process.stdout.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
  };
  process.stdin.on(
    "data",
    frameReader((_frame, body) => {
      let msg: { id?: number | string; method?: string };
      try {
        msg = JSON.parse(body) as { id?: number | string; method?: string };
      } catch {
        return; // a malformed frame is the client's bug, not worth dying for
      }
      if (msg.method === "initialize") {
        send({ jsonrpc: "2.0", id: msg.id, result: { capabilities: {} } });
      } else if (msg.method === "shutdown") {
        down = true;
        send({ jsonrpc: "2.0", id: msg.id, result: null });
      } else if (msg.method === "exit") {
        process.exit(down ? 0 : 1); // the LSP spec's exit code contract
      } else if (msg.id !== undefined) {
        send({
          jsonrpc: "2.0",
          id: msg.id,
          error: { code: -32601, message: `not serving: ${msg.method ?? "?"}` },
        });
      }
      // Notifications other than exit are ignored: there is nothing here.
    }),
  );
  process.stdin.on("end", () => process.exit(0));
}
