#!/usr/bin/env node
/**
 * Acceptance on a separate machine: the release bundle in Linux containers.
 *
 *   npm run release:artifacts && npm run test:container
 *
 * A container is a machine this checkout has never touched — no caches, no
 * broker, no activation, no Node unless one is put there — which is what
 * M1's acceptance means by "away from this checkout", and the Linux x86_64
 * the plugin claims to support (plugin plan D18, D21). Every scenario mounts
 * only the bundle, `container-driver.mjs` and exactly Node 22.13.0, the floor,
 * so every run also tests the floor.
 *
 * Unlicensed scenarios always run: Wolfram's Engine image is unactivated
 * until someone activates it, which is a scenario of its own, and a plain
 * Ubuntu image is a machine with no Wolfram at all. The licensed one runs
 * only when `WOLFRAM_MCP_TEST_ENTITLEMENT`, or the 0600 file
 * `~/.config/wolfram-mcp-server/test-entitlement`, holds an on-demand licence
 * entitlement ID (`CreateLicenseEntitlement`), Wolfram's documented route
 * for automated runs. Its kernels are charged to the entitlement owner's
 * Service Credits for as long as they run, which is why the scenario ends by
 * checking none is left. The ID reaches the container through a 0600 env
 * file that is deleted afterwards, never a command line or this output.
 *
 * Needs Docker (OrbStack works) and costs no seat on this machine.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bundle = join(root, "release", "wolfram-mcp-server.mjs");
const driver = join(root, "scripts", "container-driver.mjs");
const ENGINE = "wolframresearch/wolframengine:15.0.0";
const PLAIN = "ubuntu:24.04";
const OLD_NODE = "node:20-slim";
const NODE_VERSION = "v22.13.0";
// Claude Code inside the container, for the setup skill on a new installation:
// the client floor, so the floor is tested on Linux too.
const CLAUDE_VERSION = "2.1.224";

let checks = 0;
let failures = 0;
function check(name, ok, detail = "") {
  checks += 1;
  if (!ok) failures += 1;
  process.stdout.write(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}\n`);
}
const heading = (title) => process.stdout.write(`\n${title}\n`);
// `WMCP_ONLY=licensed` (or unactivated, plain, old-node) runs one scenario, to
// look into it without paying for the others.
const only = process.env.WMCP_ONLY?.trim();
const wanted = (name) => !only || only === name;
const short = (value, n = 140) => String(value ?? "").replace(/\s+/g, " ").slice(0, n);

function need(ok, message) {
  if (ok) return;
  process.stderr.write(`container-acceptance: ${message}\n`);
  process.exit(2);
}

need(
  spawnSync("docker", ["info"], { stdio: "ignore" }).status === 0,
  "Docker is not running (start OrbStack or Docker Desktop)",
);
need(existsSync(bundle), "no release bundle; run npm run release:artifacts first");

/** Exactly the Node floor, for linux-x64, fetched once and checked against nodejs.org's sums. */
function nodeFloor() {
  const cache = join(process.env.XDG_CACHE_HOME || join(homedir(), ".cache"), "wolfram-mcp-server-test");
  const name = `node-${NODE_VERSION}-linux-x64`;
  const dir = join(cache, name);
  if (existsSync(join(dir, "bin", "node"))) return dir;
  mkdirSync(cache, { recursive: true });
  const archive = join(cache, `${name}.tar.xz`);
  const base = `https://nodejs.org/dist/${NODE_VERSION}`;
  need(
    spawnSync("curl", ["-sSfL", "-o", archive, `${base}/${name}.tar.xz`]).status === 0,
    `could not download ${name}`,
  );
  const sums = spawnSync("curl", ["-sSfL", `${base}/SHASUMS256.txt`], { encoding: "utf8" }).stdout ?? "";
  const expected = sums.split("\n").find((line) => line.endsWith(`  ${name}.tar.xz`))?.split(" ")[0];
  const actual = createHash("sha256").update(readFileSync(archive)).digest("hex");
  need(expected === actual, `${name}.tar.xz does not match nodejs.org's SHASUMS256`);
  need(spawnSync("tar", ["-xJf", archive, "-C", cache]).status === 0, `could not unpack ${name}`);
  return dir;
}
const node = nodeFloor();

/**
 * Claude Code for Linux, installed once from inside the image — its npm package
 * carries per-platform binaries, so one installed on the host would not run.
 */
const claudeLinux = join(
  process.env.XDG_CACHE_HOME || join(homedir(), ".cache"),
  "wolfram-mcp-server-test",
  `claude-code-linux-${CLAUDE_VERSION}`,
);
function ensureClaudeLinux() {
  if (existsSync(join(claudeLinux, "node_modules", ".bin", "claude"))) return;
  mkdirSync(claudeLinux, { recursive: true });
  const run = spawnSync(
    "docker",
    [
      "run", "--rm", "--platform", "linux/amd64",
      "-v", `${node}:/opt/node:ro`, "-v", `${claudeLinux}:/opt/claude`,
      "--entrypoint", "/bin/sh", ENGINE, "-c",
      `PATH=/opt/node/bin:$PATH HOME=/tmp npm install -s --prefix /opt/claude --no-audit --no-fund @anthropic-ai/claude-code@${CLAUDE_VERSION}`,
    ],
    { encoding: "utf8" },
  );
  need(run.status === 0, `could not install Claude Code ${CLAUDE_VERSION} for Linux: ${short(run.stderr, 300)}`);
}

/**
 * Its config directory, on the host so a sign-in survives the container, and
 * never your own. Signing it in is yours, interactively:
 * `npm run test:container -- login` opens Claude Code in a container in this
 * terminal, for /login. Nothing here handles a credential.
 */
const claudeConfig = join(homedir(), ".config", "wolfram-mcp-server", "claude-test-config-linux");
const claudeMounts = () => [
  "-v", `${node}:/opt/node:ro`,
  "-v", `${claudeLinux}:/opt/claude:ro`,
  "-v", `${claudeConfig}:/home/wolframengine/.claude-test`,
  "-e", "CLAUDE_CONFIG_DIR=/home/wolframengine/.claude-test",
  "-e", "PATH=/opt/node/bin:/usr/local/bin:/usr/bin:/bin",
];
if (process.argv[2] === "login") {
  ensureClaudeLinux();
  mkdirSync(claudeConfig, { recursive: true, mode: 0o700 });
  process.stdout.write(
    `\nOpening Claude Code ${CLAUDE_VERSION} in a container, with its test config directory.\n` +
      "Run /login, finish signing in in the browser, then /exit.\n\n",
  );
  const run = spawnSync(
    "docker",
    ["run", "-it", "--rm", "--platform", "linux/amd64", ...claudeMounts(),
      "--entrypoint", "/opt/claude/node_modules/.bin/claude", ENGINE],
    { stdio: "inherit", env: { ...process.env, PATH: process.env.PATH } },
  );
  process.exit(run.status ?? 0);
}

/**
 * One fresh container running the driver over a plan; the driver's results,
 * in order. `node: "image"` uses the image's own Node instead of the floor.
 */
function inContainer(image, plan, { envFile, extra = [], node: which = "floor" } = {}) {
  const args = ["run", "--rm", "--platform", "linux/amd64", ...extra];
  args.push("-v", `${bundle}:/opt/wmcp/wolfram-mcp-server.mjs:ro`);
  args.push("-v", `${driver}:/opt/wmcp/driver.mjs:ro`);
  if (which === "floor") args.push("-v", `${node}:/opt/node:ro`);
  if (envFile) args.push("--env-file", envFile);
  args.push("-e", `WMCP_PLAN=${JSON.stringify({ server: "/opt/wmcp/wolfram-mcp-server.mjs", ...plan })}`);
  args.push("--entrypoint", which === "floor" ? "/opt/node/bin/node" : "node");
  args.push(image, "/opt/wmcp/driver.mjs");
  const run = spawnSync("docker", args, { encoding: "utf8", timeout: 900_000 });
  const results = (run.stdout ?? "")
    .split("\n")
    .filter((line) => line.startsWith("WMCP-RESULT "))
    .map((line) => JSON.parse(line.slice("WMCP-RESULT ".length)));
  if (results.length === 0) {
    process.stdout.write(`  (no results; docker exit ${run.status}) ${short(run.stderr, 400)}\n`);
  }
  return Object.fromEntries(results.map((result, i) => [result.label ?? `${result.op}${i}`, result]));
}

// ---------------------------------------------------------------------------
heading(`Unactivated Engine, no XDG_RUNTIME_DIR (${ENGINE}, Node ${NODE_VERSION})`);
if (wanted("unactivated")) {
  const r = inContainer(ENGINE, {
    // As a headless host or a container has it: no XDG_RUNTIME_DIR, and a /tmp
    // everyone can write to. Sharing used to switch itself off here.
    xdg: false,
    env: { WOLFRAM_MCP_DEFAULT_SERVER: "WolframLanguage" },
    steps: [
      { op: "list", label: "list" },
      { op: "call", label: "again", name: "WolframLanguageEvaluator", args: { code: "1+1" } },
      { op: "cli", label: "doctor", args: ["doctor"] },
      { op: "close", label: "close" },
      { op: "settle", label: "settle", ms: 10_000 },
    ],
  });
  check(
    "the first list fails within seconds, naming the kernel as not activated",
    r.list?.error && /not activated/.test(r.list.error) && r.list.ms < 30_000,
    `${r.list?.ms}ms: ${short(r.list?.error)}`,
  );
  // Shared (the default), so the next call retries rather than meeting the
  // back-off: a shared kernel that fails to start is an ordinary call failure,
  // the limitation accepted for M1 (plugin plan D19). It still has to
  // fail fast and say why.
  check(
    "the next call fails as fast, with the same reason (retried on the shared path, D19)",
    r.again?.isError && /not activated/.test(r.again.text) && r.again.ms < 10_000,
    `${r.again?.ms}ms: ${short(r.again?.text)}`,
  );
  check(
    "doctor, run as named, exits 1 and says the kernel is not activated",
    r.doctor?.status === 1 && /not activated/.test(r.doctor.output),
    `exit ${r.doctor?.status}`,
  );
  check("no kernel is left behind", r.settle?.kernels === 0, short(r.settle?.left?.join(" | ")));
  check("and stdout carried only the protocol", !/NON-PROTOCOL STDOUT/.test(r.close?.stderr ?? ""));
  check(
    "the session shared through the server's own private directory",
    /attached to the broker at \/home\/wolframengine\/\.cache\/wolfram-mcp-server\/run\//.test(r.close?.stderr ?? "") &&
      !/not sharing kernels/.test(r.close?.stderr ?? ""),
    short((r.close?.stderr ?? "").split("\n").filter((l) => /sharing|attached/.test(l)).join(" | ")),
  );
}

// ---------------------------------------------------------------------------
heading(`No Wolfram installed (${PLAIN}, Node ${NODE_VERSION})`);
if (wanted("plain")) {
  const r = inContainer(PLAIN, {
    env: { WOLFRAM_MCP_DEFAULT_SERVER: "WolframLanguage" },
    steps: [
      { op: "list", label: "list" },
      { op: "call", label: "status", name: "wolfram_status" },
      { op: "cli", label: "doctor", args: ["doctor"] },
      { op: "close", label: "close" },
    ],
  });
  check(
    "the tool list is wolfram_status alone",
    r.list?.tools?.join(",") === "wolfram_status",
    r.list?.tools?.join(", ") || short(r.list?.error),
  );
  check(
    "whose answer names this bundle's doctor by its path",
    r.status?.text?.includes('node "/opt/wmcp/wolfram-mcp-server.mjs" doctor'),
    short(r.status?.text?.split("\n").slice(-2).join(" ")),
  );
  check(
    "and that command runs, exiting 1, saying nothing is installed and with a Linux example",
    r.doctor?.status === 1 &&
      /No Wolfram installation was found/.test(r.doctor.output) &&
      !r.doctor.output.includes("/Applications"),
    short(r.doctor?.output?.split("\n").slice(-6).join(" ")),
  );
}

// ---------------------------------------------------------------------------
heading(`Node below the floor (${OLD_NODE})`);
if (wanted("old-node")) {
  const r = inContainer(
    OLD_NODE,
    { steps: [{ op: "cli", label: "serve", args: [] }, { op: "cli", label: "doctor", args: ["doctor"] }] },
    { node: "image" },
  );
  for (const label of ["serve", "doctor"]) {
    check(
      `${label === "serve" ? "the server" : "doctor"} says which Node it needs, and exits 1`,
      r[label]?.status === 1 && /needs Node 22\.13 or newer/.test(r[label].output),
      short(r[label]?.output),
    );
  }
}

// ---------------------------------------------------------------------------
// A licensed Engine, one of two ways.
//
// A saved activation: a `mathpass` made once by activating a container
// interactively (docs/releasing.md). It is node-locked to the container's
// machine ID, which the Engine derives from /etc/machine-id — so a fixed
// machine-id file, mounted read-only, gives every later container the identity
// the activation was issued for, at no cost per run. Without one, containers on
// a Docker host share the host VM's ID (measured under OrbStack), which holds
// only until that VM changes. The mathpass also names the hostname it was made
// under. All three are configurable, so an activation another project made for
// its own containers on this host can be reused:
//   WOLFRAM_MCP_TEST_LICENSING   directory holding mathpass
//                                (default ~/.config/wolfram-mcp-server/container-licensing)
//   WOLFRAM_MCP_TEST_MACHINE_ID  file for /etc/machine-id (default: machine-id beside mathpass)
//   WOLFRAM_MCP_TEST_HOSTNAME    the hostname it was activated under (default wmcp-test)
//
// An on-demand licence entitlement: the variable, or the 0600 file it can be
// kept in instead, so the ID need not sit in a shell's environment or history.
// Charged per kernel-hour, and usable on any host, CI included.
const licensing =
  process.env.WOLFRAM_MCP_TEST_LICENSING?.trim() ||
  join(homedir(), ".config", "wolfram-mcp-server", "container-licensing");
const machineId = process.env.WOLFRAM_MCP_TEST_MACHINE_ID?.trim() || join(licensing, "machine-id");
const activationHost = process.env.WOLFRAM_MCP_TEST_HOSTNAME?.trim() || "wmcp-test";
const entitlementFile = join(homedir(), ".config", "wolfram-mcp-server", "test-entitlement");
const entitlement =
  process.env.WOLFRAM_MCP_TEST_ENTITLEMENT?.trim() ||
  (existsSync(entitlementFile) ? readFileSync(entitlementFile, "utf8").trim() : "");
const savedActivation = existsSync(join(licensing, "mathpass"));
const forced = process.env.WMCP_LICENCE?.trim();
const licence =
  forced === "mathpass" || forced === "entitlement"
    ? forced
    : savedActivation
      ? "mathpass"
      : entitlement
        ? "entitlement"
        : null;
const scrub = (value) =>
  short(entitlement ? String(value ?? "").split(entitlement).join("<entitlement>") : value);

heading(`Licensed Engine, by ${licence ?? "no licence"} (${ENGINE}, Node ${NODE_VERSION})`);
if (!wanted("licensed")) {
  process.stdout.write("  skipped: WMCP_ONLY\n");
} else if (!licence || (licence === "mathpass" && !savedActivation) || (licence === "entitlement" && !entitlement)) {
  process.stdout.write(
    `  skipped: no ${licensing}/mathpass, and neither WOLFRAM_MCP_TEST_ENTITLEMENT nor ` +
      `${entitlementFile} holds an entitlement ID\n`,
  );
} else {
  const secrets = mkdtempSync(join(tmpdir(), "wmcp-lic-"));
  const options = {};
  if (licence === "mathpass") {
    // Read-only, so no run can change what the next one finds; the user's
    // Licensing directory is the first place the Engine looks.
    options.extra = [
      "--hostname",
      activationHost,
      "-v",
      `${licensing}:/home/wolframengine/.WolframEngine/Licensing:ro`,
      ...(existsSync(machineId) ? ["-v", `${machineId}:/etc/machine-id:ro`] : []),
    ];
  } else {
    // Wolfram's own CI form for a kernel started directly rather than through
    // wolframscript, which is how this server starts its kernels.
    options.envFile = join(secrets, "env");
    writeFileSync(options.envFile, `WOLFRAMINIT=-pwfile !cloudlm.wolfram.com -entitlement ${entitlement}\n`, {
      mode: 0o600,
    });
  }
  let r;
  try {
    r = inContainer(
      ENGINE,
      {
        env: { WOLFRAM_MCP_DEFAULT_SERVER: "WolframLanguage" },
        steps: [
          { op: "write", label: "fixture", path: "/tmp/lint.wl", text: "choose[a_] := If[a, 1, 1]\nWhich[a, 1, a, 2]\n" },
          { op: "list", label: "list" },
          { op: "log", label: "afterList" },
          {
            op: "call",
            label: "evaluate",
            name: "WolframLanguageEvaluator",
            args: { code: "2^100 + PrimePi[10^6]" },
          },
          // Counted now, while kernels run: otherwise "none left" could pass
          // only because the count never recognises a kernel at all.
          { op: "settle", label: "running", ms: 0 },
          { op: "call", label: "lint", name: "CodeInspector", args: { file: "/tmp/lint.wl" } },
          {
            op: "call",
            label: "write",
            name: "WriteNotebook",
            args: { file: "/tmp/round.nb", markdown: "# Round trip\n\n```wl\nIntegrate[x^2, x]\n```\n" },
          },
          { op: "call", label: "read", name: "ReadNotebook", args: { notebook: "/tmp/round.nb" } },
          { op: "cli", label: "doctor", args: ["doctor"] },
          { op: "close", label: "close" },
          // The broker outlives its last session by 60 s, then stops its kernels.
          { op: "settle", label: "settle", ms: 120_000 },
        ],
      },
      options,
    );
  } finally {
    rmSync(secrets, { recursive: true, force: true });
  }
  check(
    "a cold list starts exactly one kernel, which reports the installation",
    r.list?.tools?.includes("WolframLanguageEvaluator") && r.afterList?.starts === 1 &&
      r.afterList.lines.some((line) => /reported/.test(line)),
    `${r.afterList?.starts} start(s); ${scrub(r.afterList?.lines?.join(" | "))}`,
  );
  check(
    "evaluation computes a known result",
    r.evaluate?.text?.includes("1267650600228229401496703283874"),
    scrub(r.evaluate?.text ?? r.evaluate?.error),
  );
  check(
    "CodeInspector reports the fixture's known lints",
    /DuplicateClauses/.test(r.lint?.text ?? ""),
    scrub(r.lint?.text ?? r.lint?.error),
  );
  check(
    "a notebook written with WriteNotebook reads back",
    !r.write?.isError && /Round trip/.test(r.read?.text ?? "") && /Integrate/.test(r.read?.text ?? ""),
    scrub(r.read?.text ?? r.read?.error ?? r.write?.text),
  );
  check(
    "doctor exits 0",
    r.doctor?.status === 0,
    `exit ${r.doctor?.status}: ${scrub(r.doctor?.output?.split("\n").slice(-22).join(" | "))}`,
  );
  check(
    "and no kernel is left running after the broker goes",
    r.running?.kernels >= 1 && r.settle?.kernels === 0,
    `${r.running?.kernels} while running; ${r.settle?.kernels} after ${r.settle?.ms}ms`,
  );
  check("and stdout carried only the protocol", !/NON-PROTOCOL STDOUT/.test(r.close?.stderr ?? ""));
}

// ---------------------------------------------------------------------------
// The paclet a fresh installation ships with, kept: no network, so the paclet
// manager cannot update it. 15.0.0's layout carries AgentTools 2.1.17; with a
// network it replaced itself with 2.2.0 on the first start (plan §6 ledger).
// Needs the saved activation, since an entitlement is checked over the network.
heading(`Offline, with the paclet the Engine ships (${ENGINE}, no network)`);
if (!wanted("offline")) {
  process.stdout.write("  skipped: WMCP_ONLY\n");
} else if (!savedActivation) {
  process.stdout.write(`  skipped: needs a saved activation in ${licensing}\n`);
} else {
  const r = inContainer(
    ENGINE,
    {
      env: { WOLFRAM_MCP_DEFAULT_SERVER: "WolframLanguage" },
      steps: [
        { op: "list", label: "list" },
        { op: "log", label: "afterList" },
        { op: "call", label: "evaluate", name: "WolframLanguageEvaluator", args: { code: "Expand[(x + 1)^5]" } },
        { op: "call", label: "status", name: "wolfram_status" },
        { op: "close", label: "close" },
      ],
    },
    {
      extra: [
        "--network",
        "none",
        "--hostname",
        activationHost,
        "-v",
        `${licensing}:/home/wolframengine/.WolframEngine/Licensing:ro`,
        ...(existsSync(machineId) ? ["-v", `${machineId}:/etc/machine-id:ro`] : []),
      ],
    },
  );
  check(
    "the tools list and answer on the shipped paclet",
    r.list?.tools?.includes("WolframLanguageEvaluator") &&
      // Spacing or `*` between factors, depending on the paclet's output form.
      /1 \+ 5[ *]x \+ 10[ *]x\^2 \+ 10[ *]x\^3 \+ 5[ *]x\^4 \+ x\^5/.test(r.evaluate?.text ?? ""),
    short(r.evaluate?.text ?? r.evaluate?.error ?? r.list?.error),
  );
  check(
    "and the version reported is the one serving, 2.1.17",
    r.afterList?.lines?.some((line) => /AgentTools 2\.1\.17/.test(line)) &&
      /AgentTools\s+2\.1\.17/.test(r.status?.text ?? ""),
    short(r.afterList?.lines?.find((line) => /reported/.test(line))),
  );
}

// ---------------------------------------------------------------------------
// The setup skill on a newly activated installation (plugin plan §5 M1, the test
// plan's part 4), with Claude Code itself in the container. Before activation it
// must say so and give the step; after, with a saved activation standing in for
// the one the user has just made, it must end verified. Neither may add a second
// Wolfram server to any client file.
heading(`Setup skill, before and after activation (Claude Code ${CLAUDE_VERSION} on Linux)`);
if (!wanted("setup")) {
  process.stdout.write("  skipped: WMCP_ONLY\n");
} else if (!savedActivation) {
  process.stdout.write(`  skipped: needs a saved activation in ${licensing}\n`);
} else if (!existsSync(join(claudeConfig, ".credentials.json"))) {
  process.stdout.write("  skipped: not signed in; run, in a terminal: npm run test:container -- login\n");
} else {
  ensureClaudeLinux();
  const plugin = mkdtempSync(join(tmpdir(), "wmcp-plugin-"));
  const zip = join(root, "release", `wolfram-plugin-${JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version}.zip`);
  need(spawnSync("unzip", ["-q", zip, "-d", plugin]).status === 0, `could not extract ${zip}`);
  const tools = [
    "Skill",
    "Bash(WOLFRAM_MCP_DEFAULT_SERVER=WolframLanguage node *)",
    "Bash(node --version)",
    "Bash(wolframscript -configure)",
    "mcp__plugin_wolfram_WolframLanguage__wolfram_status",
    "mcp__plugin_wolfram_WolframLanguage__WolframLanguageEvaluator",
  ].join(",");
  const prompt =
    "/wolfram:wolfram-setup — walk through it for this machine and report each step's outcome. " +
    "Do not try to activate anything yourself: if activation is needed, say exactly what the user " +
    "must run. End by saying whether setup is complete.";
  // After the session: a second server anywhere a client keeps one?
  const audit =
    "echo WMCP-AUDIT; ls -A /tmp/work; node -e '" +
    'const f="/home/wolframengine/.claude-test/.claude.json";let d={};' +
    "try{d=JSON.parse(require(\"fs\").readFileSync(f,\"utf8\"))}catch{}" +
    'const s=JSON.stringify(d);console.log("wolfram mcpServers:",/mcpServers[^}]*olfram/i.test(s))' +
    "'";
  const phase = (licensed) => {
    const extra = licensed
      ? ["--hostname", activationHost, "-v", `${licensing}:/home/wolframengine/.WolframEngine/Licensing:ro`,
          ...(existsSync(machineId) ? ["-v", `${machineId}:/etc/machine-id:ro`] : [])]
      : [];
    const script =
      "mkdir -p -m 700 /tmp/run /tmp/work && cd /tmp/work && " +
      // The prompt on stdin: --allowedTools takes any number of values, and a
      // prompt after it was swallowed as one, leaving the client nothing to do.
      `printf '%s' "$WMCP_PROMPT" | XDG_RUNTIME_DIR=/tmp/run claude -p --output-format json ` +
      `--plugin-dir /opt/plugin --allowedTools '${tools}' > /tmp/out.json 2>/tmp/err.txt; ` +
      `echo WMCP-REPLY; cat /tmp/out.json; echo WMCP-ERR; tail -5 /tmp/err.txt; ${audit}`;
    const run = spawnSync(
      "docker",
      ["run", "--rm", "--platform", "linux/amd64", ...claudeMounts(), ...extra,
        "-e", "PATH=/opt/claude/node_modules/.bin:/opt/node/bin:/usr/local/bin:/usr/bin:/bin",
        "-e", `WMCP_PROMPT=${prompt}`,
        "-v", `${plugin}:/opt/plugin:ro`, "--entrypoint", "/bin/sh", ENGINE, "-c", script],
      { encoding: "utf8", timeout: 900_000 },
    );
    const out = run.stdout ?? "";
    let reply = "";
    try {
      reply = JSON.parse(out.split("WMCP-REPLY\n")[1]?.split("WMCP-ERR")[0] ?? "").result ?? "";
    } catch {
      // No reply: what the client said instead is the useful part.
      reply = short(out.split("WMCP-ERR")[1]?.split("WMCP-AUDIT")[0] ?? out, 300);
    }
    const audited = out.split("WMCP-AUDIT")[1] ?? "";
    return { reply, audited };
  };
  try {
    const before = phase(false);
    check(
      "before activation, it names the kernel as not activated and gives the step",
      /not activated|isn.t activated|activation/i.test(before.reply) && /wolframscript -activate/.test(before.reply),
      short(before.reply),
    );
    check(
      "and adds no Wolfram server to any client file",
      /wolfram mcpServers: false/.test(before.audited) && !/\.mcp\.json/.test(before.audited),
      short(before.audited),
    );
    const after = phase(true);
    check(
      "after activation, it ends verified",
      /1 \+ 5[ *]x/.test(after.reply) && /complete/i.test(after.reply) && !/not complete|incomplete/i.test(after.reply),
      short(after.reply),
    );
    check(
      "and still adds no Wolfram server anywhere",
      /wolfram mcpServers: false/.test(after.audited) && !/\.mcp\.json/.test(after.audited),
      short(after.audited),
    );
  } finally {
    rmSync(plugin, { recursive: true, force: true });
  }
}

process.stdout.write(
  failures === 0
    ? `\n${checks} checks, all passed.\n`
    : `\n${failures} of ${checks} checks failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
