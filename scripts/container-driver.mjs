#!/usr/bin/env node
/**
 * Runs inside a test container: drives the bundled server over stdio and
 * reports each step as one `WMCP-RESULT {json}` line on stdout, for
 * `scripts/container-acceptance.mjs` on the host to judge.
 *
 * Deliberately free of dependencies and of this repository's code — it is
 * mounted alone into a machine that has only the release bundle — and it
 * speaks raw newline-delimited JSON-RPC, so what is tested is the bundle and
 * nothing it could borrow from a checkout.
 *
 * The plan arrives as JSON in `WMCP_PLAN`:
 *   { server, env?, steps: [ { op, ... } ] }
 * with ops
 *   list                     initialize if needed, then tools/list
 *   call   { name, args }    tools/call
 *   cli    { args }          run the bundle as a command, e.g. ["doctor"]
 *   write  { path, text }    put a fixture file in place
 *   close                    end the server's stdin and wait for it to exit
 *   settle { ms }            wait for every Wolfram kernel to exit, up to ms
 *   log                      how many kernels the server and broker logged starting
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const plan = JSON.parse(process.env.WMCP_PLAN ?? "{}");
const report = (step, result) =>
  process.stdout.write(`WMCP-RESULT ${JSON.stringify({ op: step.op, label: step.label, ...result })}\n`);

// What a Linux desktop session has and a bare container lacks: without it the
// server declines to share kernels through root-owned /tmp, and a test of the
// shared path would quietly test the private one.
// `plan.xdg: false` leaves it unset, as a headless host or an ssh session
// does, to test the server's own fallback instead.
const runtime = `/tmp/wmcp-runtime-${process.getuid?.() ?? "user"}`;
if (plan.xdg !== false) mkdirSync(runtime, { recursive: true, mode: 0o700 });
const logFile = "/tmp/wmcp-broker.log";
const env = {
  ...process.env,
  ...(plan.xdg !== false ? { XDG_RUNTIME_DIR: runtime } : {}),
  WOLFRAM_MCP_LOG: logFile,
  ...plan.env,
};
delete env.WMCP_PLAN;

/** Kernel processes in this container, with their command lines. */
function kernels() {
  const found = [];
  for (const pid of readdirSync("/proc").filter((name) => /^\d+$/.test(name))) {
    try {
      const cmd = readFileSync(`/proc/${pid}/cmdline`, "utf8").replace(/\0/g, " ");
      // The kernel itself, not a node process that merely names it — the
      // broker carries the kernel's path in its own --kernel argument.
      const program = cmd.split(" ")[0] ?? "";
      if (/WolframKernel$|\/Executables\/wolfram$/.test(program)) found.push(`${pid} ${cmd.trim()}`);
    } catch {
      // gone between listing and reading
    }
  }
  return found;
}

let server = null;
let nextId = 1;
const waiting = new Map();
const stderr = [];

function start() {
  server = spawn(process.execPath, [plan.server], { env, stdio: ["pipe", "pipe", "pipe"] });
  let buffer = "";
  server.stdout.on("data", (chunk) => {
    buffer += chunk;
    let at;
    while ((at = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, at);
      buffer = buffer.slice(at + 1);
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        // stdout is the protocol: anything else is a defect worth seeing
        stderr.push(`NON-PROTOCOL STDOUT: ${line}`);
        continue;
      }
      waiting.get(message.id)?.(message);
      waiting.delete(message.id);
    }
  });
  server.stderr.on("data", (chunk) => stderr.push(String(chunk)));
}

function request(method, params) {
  const id = nextId++;
  return new Promise((resolve) => {
    waiting.set(id, resolve);
    server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
  });
}

async function ensureInitialized() {
  if (server) return;
  start();
  const init = await request("initialize", {
    protocolVersion: "2025-11-25",
    capabilities: {},
    clientInfo: { name: "container-driver", version: "1" },
  });
  server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);
  return init;
}

const text = (result) => (result?.content ?? []).map((part) => part.text ?? "").join("\n");

for (const step of plan.steps ?? []) {
  const startedAt = Date.now();
  const ms = () => Date.now() - startedAt;
  if (step.op === "list") {
    await ensureInitialized();
    const reply = await request("tools/list", {});
    report(step, {
      ms: ms(),
      error: reply.error?.message ?? null,
      tools: reply.result?.tools?.map((tool) => tool.name) ?? [],
    });
  } else if (step.op === "call") {
    await ensureInitialized();
    const reply = await request("tools/call", { name: step.name, arguments: step.args ?? {} });
    report(step, {
      ms: ms(),
      error: reply.error?.message ?? null,
      isError: reply.result?.isError === true,
      text: text(reply.result),
    });
  } else if (step.op === "cli") {
    const run = spawnSync(process.execPath, [plan.server, ...step.args], {
      env,
      encoding: "utf8",
      timeout: 300_000,
    });
    report(step, { ms: ms(), status: run.status, output: `${run.stdout}${run.stderr}` });
  } else if (step.op === "write") {
    writeFileSync(step.path, step.text);
    report(step, { ms: ms() });
  } else if (step.op === "close") {
    if (server) {
      const exited = new Promise((resolve) => server.once("exit", resolve));
      server.stdin.end();
      await exited;
      server = null;
    }
    report(step, { ms: ms(), stderr: stderr.join("") });
  } else if (step.op === "settle") {
    const by = Date.now() + (step.ms ?? 90_000);
    while (kernels().length > 0 && Date.now() < by) await new Promise((r) => setTimeout(r, 500));
    const left = kernels();
    report(step, { ms: ms(), kernels: left.length, left });
  } else if (step.op === "log") {
    const broker = existsSync(logFile) ? readFileSync(logFile, "utf8") : "";
    const all = `${stderr.join("")}\n${broker}`;
    report(step, {
      ms: ms(),
      starts: (all.match(/starting kernel:/g) ?? []).length,
      lines: broker.split("\n").filter((line) => /reported|pool budget|starting kernel/.test(line)),
    });
  }
}
server?.kill();
