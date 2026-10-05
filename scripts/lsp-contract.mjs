#!/usr/bin/env node
/**
 * What this package assumes about Wolfram's LSPServer, checked against a real
 * kernel — the LSP counterpart of test/agenttools-contract.wlt. Run with
 * `npm run test:lsp`; it starts one kernel through scripts/lsp-server.mjs and
 * so costs one licence seat for a few seconds.
 *
 * It drives the launcher itself, not a copy of the launcher's flags, so what
 * is tested is exactly what the plugin runs: discovery, the kernel flag set,
 * and the stdio passthrough. The assertions are the ones Claude Code's LSP
 * client makes non-negotiable: the handshake answers, diagnostics arrive, and
 * stdout carries protocol frames and nothing else — one stray line disconnects
 * the server and counts as a crash.
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
};

console.log("\nStarting LSPServer through the plugin's launcher");
const t0 = Date.now();
// Asked for explicitly: the LSP is on by default, but a user's WOLFRAM_MCP_LSP=0
// would answer the handshake with a stub that makes every check below vacuous
// or red.
const child = spawn(process.execPath, [join(root, "scripts", "lsp-server.mjs")], {
  stdio: ["pipe", "pipe", "pipe"],
  env: { ...process.env, WOLFRAM_MCP_LSP: "1" },
});
let stderrText = "";
child.stderr.on("data", (d) => {
  stderrText += String(d);
  process.stderr.write(`  | ${String(d).trimEnd().replace(/\n/g, "\n  | ")}\n`);
});

let buf = Buffer.alloc(0);
let noise = null;
const inbox = [];
child.stdout.on("data", (d) => {
  buf = Buffer.concat([buf, d]);
  for (;;) {
    const headerEnd = buf.indexOf("\r\n\r\n");
    if (headerEnd === -1) {
      // A complete line that is not a header is the noise that disconnects.
      const line = buf.indexOf("\n");
      if (line !== -1 && !buf.subarray(0, line).toString().startsWith("Content-")) {
        noise ??= buf.subarray(0, line).toString();
        buf = buf.subarray(line + 1);
        continue;
      }
      return;
    }
    const length = Number(/Content-Length: (\d+)/i.exec(buf.subarray(0, headerEnd).toString())?.[1]);
    if (buf.length < headerEnd + 4 + length) return;
    inbox.push(JSON.parse(buf.subarray(headerEnd + 4, headerEnd + 4 + length).toString()));
    buf = buf.subarray(headerEnd + 4 + length);
  }
});

const send = (msg) => {
  const body = JSON.stringify(msg);
  child.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
};
const waitFor = (test, label, ms = 90_000) =>
  new Promise((resolve, reject) => {
    const poll = setInterval(() => {
      const at = inbox.findIndex(test);
      if (at !== -1) { clearInterval(poll); clearTimeout(dead); resolve(inbox.splice(at, 1)[0]); }
    }, 25);
    const dead = setTimeout(() => { clearInterval(poll); reject(new Error(`timed out waiting for ${label}`)); }, ms);
  });

try {
  send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { processId: process.pid, rootUri: null, capabilities: {} } });
  const init = await waitFor((m) => m.id === 1, "the initialize response");
  const caps = init.result?.capabilities ?? {};
  check("the handshake is answered", init.result !== undefined, `${Date.now() - t0}ms`);
  check(
    "with the capabilities the plugin is installed for",
    ["hoverProvider", "documentFormattingProvider", "textDocumentSync"].every((c) => c in caps),
    Object.keys(caps).join(", ").slice(0, 90),
  );

  // LSPServer logs the command line it was started with. -nostartuppackets, a
  // misspelling the kernel ignores without a word, was there until a session
  // in Claude Desktop caught it; this is the kernel's own account.
  const commandLine = /\$CommandLine: \{([^}]*)\}/.exec(stderrText)?.[1] ?? "";
  check(
    "the kernel was started with -nostartuppaclets, as Wolfram's own extension starts it",
    /(^|, )-nostartuppaclets(,|$)/.test(commandLine) && !/-nostartuppackets/.test(commandLine),
    commandLine.slice(0, 120) || "no $CommandLine line seen",
  );

  send({ jsonrpc: "2.0", method: "initialized", params: {} });
  send({ jsonrpc: "2.0", method: "textDocument/didOpen", params: {
    textDocument: { uri: "file:///contract/probe.wl", languageId: "wolfram", version: 1,
      text: "f[x_] := Module[{unused}, If[x > 0, same, same]]\n" },
  } });
  const diag = await waitFor(
    (m) => m.method === "textDocument/publishDiagnostics" && /probe\.wl$/.test(m.params.uri),
    "diagnostics for the probe",
  );
  check(
    "opening a file with known lints draws diagnostics",
    diag.params.diagnostics.length >= 1,
    diag.params.diagnostics.map((d) => d.message.slice(0, 40)).join(" | ").slice(0, 90),
  );

  // The worked example ships with the repo and sessions here lint it live, so
  // a lint that creeps in reaches every reader before any human does. The
  // example is opened exactly as an editor would open it, and must be clean.
  const example = join(root, "examples", "weather.wl");
  send({ jsonrpc: "2.0", method: "textDocument/didOpen", params: {
    textDocument: { uri: "file:///contract/weather.wl", languageId: "wolfram", version: 1,
      text: readFileSync(example, "utf8") },
  } });
  const exampleDiag = await waitFor(
    (m) => m.method === "textDocument/publishDiagnostics" && /weather\.wl$/.test(m.params.uri),
    "diagnostics for the example",
  );
  check(
    "the shipped example is lint-clean",
    exampleDiag.params.diagnostics.length === 0,
    exampleDiag.params.diagnostics.map((d) => d.message.slice(0, 50)).join(" | ").slice(0, 90) || "clean",
  );

  // LSPServer exits on a request it never advertised ("Internal assert 4
  // failed … KERNEL IS EXITING HARD"); Claude Code sends workspace/symbol and
  // call hierarchy regardless, and in Claude Desktop that took the server down.
  // The launcher answers those itself. Pinned against the real paclet, so a
  // paclet that starts advertising one — or a launcher that stops guarding —
  // shows here.
  send({ jsonrpc: "2.0", id: 3, method: "workspace/symbol", params: { query: "f" } });
  const symbols = await waitFor((m) => m.id === 3, "the workspace/symbol reply", 15_000);
  send({ jsonrpc: "2.0", id: 4, method: "textDocument/hover", params: {
    textDocument: { uri: "file:///contract/probe.wl" }, position: { line: 0, character: 0 },
  } });
  const hover = await waitFor((m) => m.id === 4, "a hover after it", 30_000);
  check(
    "an unadvertised request is answered MethodNotFound, and the server keeps serving",
    !("workspaceSymbolProvider" in caps) && symbols.error?.code === -32601 && hover.result !== undefined,
    JSON.stringify(symbols.error ?? symbols.result).slice(0, 90),
  );

  // A provider can decline some of its requests by sub-key, and LSPServer's
  // semantic tokens do: full only, `range: False`, `delta: False`. Guarded at
  // the provider alone, the range request reached the kernel and ended it.
  // LSPServer advertises them only to a client that sends
  // `initializationOptions.semanticTokens` and declares the capability, which
  // this handshake — like the plugin's — does not; either way the range request
  // must be answered here and the server keep serving.
  const tokens = caps.semanticTokensProvider ?? null;
  send({ jsonrpc: "2.0", id: 5, method: "textDocument/semanticTokens/range", params: {
    textDocument: { uri: "file:///contract/probe.wl" },
    range: { start: { line: 0, character: 0 }, end: { line: 1, character: 0 } },
  } });
  const range = await waitFor((m) => m.id === 5, "the semanticTokens/range reply", 15_000);
  send({ jsonrpc: "2.0", id: 6, method: "textDocument/hover", params: {
    textDocument: { uri: "file:///contract/probe.wl" }, position: { line: 0, character: 0 },
  } });
  const after = await waitFor((m) => m.id === 6, "a hover after it", 30_000);
  check(
    "a semantic-token range request is answered MethodNotFound, and the server keeps serving",
    (tokens === null || !tokens.range) && range.error?.code === -32601 && after.result !== undefined,
    `provider ${JSON.stringify(tokens).slice(0, 60)}; range ${JSON.stringify(range.error ?? range.result).slice(0, 40)}`,
  );

  send({ jsonrpc: "2.0", id: 2, method: "shutdown", params: null });
  await waitFor((m) => m.id === 2, "the shutdown response", 15_000);
  send({ jsonrpc: "2.0", method: "exit", params: null });
  const code = await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    new Promise((r) => setTimeout(() => r("hung"), 15_000)),
  ]);
  check("shutdown then exit ends the kernel cleanly", code === 0, `exit=${code}`);
  check("stdout carried protocol frames and nothing else", noise === null, noise ?? "");
} catch (err) {
  check("the contract ran to completion", false, err.message);
} finally {
  child.kill("SIGKILL");
}

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
