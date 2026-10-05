#!/usr/bin/env node
/**
 * CLI entry point.
 *
 * With no arguments this speaks MCP over stdio, which is how an MCP client
 * launches it. See HELP below for the configuration to paste; it deliberately
 * names a path into a clone, because this package is not published.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { deferredBackend } from "./backend.js";
import { clearCache } from "./cache.js";
import { loadConfig } from "./config.js";
import { createLogger, errorText } from "./log.js";
import { createWolframServer } from "./proxy.js";
import { PKG } from "./version.js";

const HELP = `
${PKG.name} ${PKG.version}
${PKG.description ?? ""}

Usage
  wolfram-mcp-server              speak MCP over stdio (default)
  wolfram-mcp-server doctor       report what this machine looks like
  wolfram-mcp-server broker       run the shared kernel broker in the foreground
                                  (normally started automatically, detached)
  wolfram-mcp-server lsp          speak LSP over stdio: Wolfram's LSPServer on
                                  the discovered kernel, taking a licence seat;
                                  on by default, and WOLFRAM_MCP_LSP=0 answers
                                  the handshake with no capabilities instead,
                                  starting no kernel
  wolfram-mcp-server session-status
                                  what the caches say about this machine, for a
                                  session-start hook; starts no kernel
  wolfram-mcp-server clear-cache  forget the cached tool list and kernel facts
  wolfram-mcp-server --version
  wolfram-mcp-server --help

Client configuration
  Not published to a registry, so name the clone. Absolute path, because an MCP
  client does not guarantee the working directory it launches a server from:

  {
    "mcpServers": {
      "wolfram": {
        "command": "node",
        "args": ["/absolute/path/to/wolfram-agent-tools/dist/index.js"]
      }
    }
  }

  Run 'npm install' in the clone first — that builds dist/ via prepare.

Environment
  MCP_SERVER_NAME                    which AgentTools server to expose. Built in:
                                     Wolfram | WolframLanguage | WolframAlpha |
                                     WolframPacletDevelopment  (default: Wolfram)
                                     Or name your own server, or a paclet's
                                     Publisher/Server; the name is passed to the
                                     kernel as given.
                                     Alias: WOLFRAM_MCP_SERVER_NAME
  WOLFRAM_MCP_DEFAULT_SERVER         the server to use when neither name above is
                                     set; how a packager picks a default without
                                     overriding a user's explicit choice
  WOLFRAM_MCP_KERNEL                 installation or kernel executable to use
                                     (default: auto-detect the newest install)
                                     Alias: WOLFRAM_KERNEL_PATH
  WOLFRAM_MCP_VERSION                pin auto-detection to this version, as a
                                     dotted prefix: 14.3 selects 14.3.0,
                                     15 selects the newest 15.x
  WOLFRAM_MCP_MIN_VERSION            ignore older installs when auto-detecting
                                     (default: 14.3, the AgentTools minimum)
  WOLFRAM_MCP_IDLE_MINUTES           shut the kernel down after this long idle,
                                     0 to keep it resident  (default: 10)
  WOLFRAM_MCP_START_TIMEOUT_SECONDS  one deadline for everything before a kernel
                                     takes its first request: inspection, the
                                     broker's preparation, the handshake. A
                                     failed preparation is not retried for 10
                                     minutes, or until the binary changes
                                     (default: 120)
  WOLFRAM_MCP_CALL_TIMEOUT_SECONDS   give up on a single evaluation
                                     (default: 300)
  WOLFRAM_MCP_CACHE                  0 to always ask a kernel for the tool list
                                     (default: 1)
  WOLFRAM_MCP_SHARE                  0 to keep a private kernel instead of
                                     sharing one with other sessions
                                     (default: 1)
  WOLFRAM_MCP_RUNTIME_DIR            directory for the shared broker's socket; it
                                     must be yours and writable by no one else
                                     (default: XDG_RUNTIME_DIR, else a private
                                     directory under the cache)
  WOLFRAM_MCP_MAX_KERNELS            cap on pooled kernels. Default is derived
                                     from the licence: $MaxLicenseProcesses
                                     minus the reserve
  WOLFRAM_MCP_LICENSE_LIMIT          what the licence permits, if you would
                                     rather say than have us look: a positive
                                     integer, or "unlimited"
  WOLFRAM_MCP_INSPECT                0 to ignore what kernels report about the
                                     installation and stay at a single kernel
                                     (default: 1)
  WOLFRAM_MCP_RESERVE_SEATS          licence seats to leave free for interactive
                                     use, so agents cannot lock you out of
                                     Mathematica  (default: 1)
  WOLFRAM_MCP_LOG                    file for the broker to write its log to. It
                                     is started detached with its output
                                     discarded, so without this it is the one
                                     component nobody can watch
  WOLFRAM_MCP_LSP                    0 to keep the LSP kernel off, which takes a
                                     licence seat once a Wolfram Language file
                                     is open; 1 to run it, whatever the
                                     plugin's lsp option says (default: on)
  WOLFRAM_MCP_KERNEL_ENV             extra variable names, comma-separated, that
                                     your own MCP server reads. Sessions that
                                     disagree about one stop sharing a kernel;
                                     the variables AgentTools itself reads are
                                     already accounted for

Wolfram's own installation directories (WOLFRAM_BASE, WOLFRAM_USERBASE,
WOLFRAM_LOCALBASE) are honoured when set, and otherwise filled in from what
an earlier kernel reported, matching the configuration Wolfram's own
InstallMCPServer writes.

Requires a licensed Wolfram installation (Mathematica, Wolfram Desktop, or
Wolfram Engine) of at least version 14.3, which supplies the Wolfram/AgentTools
paclet this server drives. Not affiliated with Wolfram Research.
`.trimStart();

async function serve(): Promise<void> {
  const log = createLogger("wolfram-mcp");
  const config = loadConfig(log);
  const { server, stop } = createWolframServer(config, log, (install) =>
    deferredBackend(config, install, log),
  );

  let stopping = false;
  const shutdown = async (reason: string) => {
    if (stopping) return;
    stopping = true;
    log(`shutting down (${reason})`);
    await stop().catch(() => {});
    await server.close().catch(() => {});
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.stdin.on("close", () => void shutdown("stdin closed"));

  // stdout and stderr are the client's pipes. When the client goes away, a write
  // to either fails with EPIPE, which Node emits asynchronously on the stream;
  // with no 'error' listener that becomes an uncaught exception. Swallowing it
  // is safe, because there is no longer anywhere to report anything.
  process.stdout.on("error", () => {});
  process.stderr.on("error", () => {});

  // A rejection escaping the kernel plumbing must not take the server down: the
  // request that caused it has already been answered with an error.
  process.on("unhandledRejection", (err) => log(`unhandled rejection: ${errorText(err)}`));

  // An uncaught exception still ends the process, so the client can restart a
  // server whose state is no longer trustworthy. It must do so explicitly
  // rather than by letting Node's default handler run: that handler formats the
  // error and writes the report to stderr, and when stderr is the thing that
  // failed, the write raises again from inside the report. Node retries, and
  // the process livelocks at 100% CPU instead of dying. Logging here is
  // best-effort for the same reason; the exit is not.
  process.on("uncaughtException", (err) => {
    try {
      log(`fatal: ${errorText(err)}`);
    } catch {
      /* no channel left */
    }
    process.exit(1);
  });

  await server.connect(new StdioServerTransport());
  log("ready (kernel not yet started)");
}

/** @returns an exit code, or null to stay running and serve requests. */
async function main(argv: string[]): Promise<number | null> {
  const command = argv[0];

  switch (command) {
    case undefined:
      await serve();
      return null;

    case "doctor": {
      const { runDoctor } = await import("./doctor.js");
      return runDoctor();
    }

    case "session-status": {
      // The plugin's SessionStart hook. stdout here enters the model's
      // context — it is not the protocol channel, because no protocol runs.
      const { sessionStatus } = await import("./doctor.js");
      // The one plugin process given the plugin's options, so it passes the
      // lsp option on to the LSP server, which is not (see recordLspOption).
      const { recordLspOption } = await import("./lsp.js");
      recordLspOption();
      process.stdout.write(`${sessionStatus()}\n`);
      return 0;
    }

    case "lsp": {
      // The plugin's .lsp.json and any editor's LSP client land here; the
      // single-file bundle makes this the only LSP entry a download has.
      const { runLsp } = await import("./lsp.js");
      return runLsp();
    }

    case "broker": {
      // Normally spawned, detached, by the first proxy that finds no broker.
      // Runnable by hand for debugging, or to pre-warm a shared kernel.
      // Detached, and its output is a file that outlives the session that
      // spawned it, so every line needs to say when it happened.
      const log = createLogger("wolfram-broker", { timestamps: true });
      const config = loadConfig(log);
      const flag = (name: string) => {
        const at = argv.indexOf(name);
        return at === -1 ? undefined : argv[at + 1];
      };
      const { locateKernel } = await import("./locate.js");
      const kernel = flag("--kernel");
      const install = kernel
        ? { bin: kernel, version: null, source: "broker argument" }
        : locateKernel({
            override: config.kernelPath,
            version: config.version,
            minVersion: config.minVersion,
            log,
          });
      if (!install) {
        log("no usable Wolfram installation; nothing to broker");
        return 1;
      }
      const { brokerAddress: addressFor } = await import("./broker-protocol.js");
      const { startBroker } = await import("./broker-server.js");
      const running = await startBroker({
        address: flag("--address") ?? addressFor(install.bin),
        bin: install.bin,
        serverName: config.serverName,
        idleMs: config.idleMs,
        startTimeoutMs: config.startTimeoutMs,
        maxKernels: config.maxKernels,
        reserveSeats: config.reserveSeats,
        licenceOverride: config.licenseLimit,
        allowInspect: config.inspect,
        clientInfo: { name: `${PKG.name}-broker`, version: PKG.version },
        log,
      });
      // A null result means another broker won the race; that is a success.
      return running ? null : 0;
    }

    case "clear-cache": {
      const { clearFacts } = await import("./inspect.js");
      const capabilities = clearCache();
      const facts = clearFacts();
      process.stdout.write(`removed ${capabilities}\n`);
      process.stdout.write(`removed ${facts}\n`);
      return 0;
    }

    case "--help":
    case "-h":
    case "help":
      process.stdout.write(HELP);
      return 0;

    case "--version":
    case "-v":
      process.stdout.write(`${PKG.version}\n`);
      return 0;

    default:
      process.stderr.write(`unknown command: ${command}\n\n${HELP}`);
      return 2;
  }
}

const code = await main(process.argv.slice(2));
// `serve` returns null: it stays alive through its stdio transport. Everything
// else is a one-shot command and should exit.
if (code !== null) process.exit(code);
