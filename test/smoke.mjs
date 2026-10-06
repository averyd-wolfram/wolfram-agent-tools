#!/usr/bin/env node
/**
 * End-to-end and unit checks, run against the fake kernel. No Wolfram needed.
 *
 * Every section marked "regression" pins a bug that shipped in an early version
 * of this proxy; each one wedged or silently disabled the server in a way a user
 * could not diagnose.
 */
import { spawn, spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
// The derivation the docs now point at, imported rather than repeated so the
// suite and the script can never disagree about what src/ contains.

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const entry = join(root, "dist", "index.js");
const fakeKernel = join(here, "fake-kernel.mjs");

// Deliberately NOT realpath'd: on macOS tmpdir() sits behind /var -> /private/var,
// and the longer real spelling pushes this suite's socket paths past sun_path,
// where bind truncates. Discovery resolves symlinks, so checks comparing a path
// discovery returned wrap their expectation in realpathSync instead.
const home = mkdtempSync(join(tmpdir(), "wolfram-mcp-"));
process.env.XDG_CACHE_HOME = join(home, "cache");
process.env.LOCALAPPDATA = join(home, "cache");

const lib = await import(join(root, "dist", "lib.js"));

let failures = 0;
let checks = 0;
let sections = 0;

// The suite is the only thing that can count what it ran: four sections sit
// inside a `for (const sharing of [...])` loop and execute twice, so this file
// holds fewer call sites than the run holds checks. Printing the total is what
// retires `grep -c PASS`, which is how every check count the docs ever quoted
// was obtained — and how each of them went stale unnoticed.
const heading = (title) => {
  sections++;
  console.log(`\n${title}`);
};
const check = (label, ok, detail = "") => {
  checks++;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
};

// The cache key every default session here writes under: the fake kernel has no
// version, and connect() names WolframLanguage. There is a file per key now, so
// reading "the cache" means naming whose.
const suiteKey = lib.cacheKey(
  fakeKernel,
  null,
  "WolframLanguage",
  lib.kernelFlavour({ MCP_SERVER_NAME: "WolframLanguage" }).digest,
);

const marker = join(home, "starts.log");
const startCount = () =>
  existsSync(marker) ? readFileSync(marker, "utf8").trim().split("\n").filter(Boolean).length : 0;

// Every server process this suite starts, so none outlives it.
// StdioClientTransport does not kill its child when the parent exits, and a
// rejection anywhere between connect() and close() would strand a server —
// one such orphan was found still running, pegged at 100% CPU, hours later.
const live = new Set();

function reapAll() {
  for (const transport of live) {
    const { pid } = transport;
    try {
      void transport.close();
    } catch {
      /* best effort */
    }
    // close() is async and the process may be mid-exit, so do not rely on it.
    if (pid) {
      try {
        process.kill(pid, "SIGKILL");
      } catch {
        /* already gone */
      }
    }
  }
  live.clear();
}

process.on("exit", reapAll);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    reapAll();
    process.exit(130);
  });
}
for (const event of ["uncaughtException", "unhandledRejection"]) {
  process.on(event, (err) => {
    reapAll();
    console.error(`\n${event}:`, err);
    process.exit(1);
  });
}

async function connect(env = {}, serverEntry = entry) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverEntry],
    env: {
      PATH: process.env.PATH,
      HOME: home,
      USERPROFILE: home,
      XDG_CACHE_HOME: process.env.XDG_CACHE_HOME,
      LOCALAPPDATA: process.env.LOCALAPPDATA,
      WOLFRAM_MCP_KERNEL: fakeKernel,
      MCP_SERVER_NAME: "WolframLanguage",
      // These sections are about the local backend: one kernel per server
      // process, so kernel starts can be counted. The broker gets its own
      // section below.
      WOLFRAM_MCP_SHARE: "0",
      // The fake kernel cannot answer the installation probe, and probing it
      // would only slow the suite down.
      WOLFRAM_MCP_INSPECT: "0",
      FAKE_MARKER: marker,
      FAKE_STATE: join(home, "fake-state"),
      ...env,
    },
    stderr: "pipe",
  });
  const client = new Client({ name: "smoke", version: "1.0.0" }, { capabilities: {} });
  const stderr = [];
  live.add(transport);
  await client.connect(transport);
  transport.stderr?.on("data", (chunk) => stderr.push(String(chunk)));
  return { client, transport, stderr: () => stderr.join("") };
}

/**
 * Which kernel actually answered.
 *
 * WOLFRAM_MCP_KERNEL fails open: an unusable path logs one line and discovery
 * continues to the platform scan, so a fake kernel that has lost its +x bit
 * silently runs the check against a real installation and a real licence seat.
 * A measurement that cannot tell those apart is not a measurement.
 */
/**
 * The kernel's tools, without this server's own.
 *
 * wolfram_status is served in every state, kernel or no kernel, because a
 * machine whose kernels cannot start still answers tools/list from cache and
 * looks healthy. It is added at serve time and never cached, so checks about
 * what the *kernel* reported have to set it aside.
 */
const STATUS_TOOL = "wolfram_status";
const upstreamTools = (tools) => tools.filter((t) => t.name !== STATUS_TOOL);
const hasStatusTool = (tools) => tools.some((t) => t.name === STATUS_TOOL);

const answeredByFake = (result) => /^evaluated/.test(result?.content?.[0]?.text ?? "");

/**
 * Brokers belonging to *this* run only — never anyone else's.
 *
 * The trailing slash matters. This repo's own .mcp.json runs a live broker for
 * whoever is editing the repo, and a pattern loose enough to match it would kill
 * the editor's Wolfram server mid-session. Every address here is inside this
 * run's mkdtemp directory.
 */
const ownBrokers = (scope = home) => {
  // No shell. `execSync` wraps the command in `sh -c`, and the `|| true` forced
  // that shell to stay forked with the pattern on its own command line — which
  // Linux's pgrep then matched, one phantom broker per count, on every count.
  // macOS never showed it because BSD pgrep excludes the caller's ancestors by
  // default; procps pgrep excludes only itself.
  const found = spawnSync("pgrep", ["-f", `broker --address ${scope}/`], { encoding: "utf8" });
  return (found.stdout ?? "").trim().split("\n").filter(Boolean).map(Number);
};
const signalOwnBrokers = (signal, scope = home) => {
  const pids = ownBrokers(scope);
  for (const pid of pids) {
    try {
      process.kill(pid, signal);
    } catch {
      /* already gone */
    }
  }
  return pids.length;
};

// Every directory handed to a server as XDG_RUNTIME_DIR, unless a check is
// deliberately building an unsafe one. A bare mkdir obeys the machine's umask,
// and under the user-private-group default of 002 the directory comes out
// group-writable — which socketFault rightly refuses, so every sharing section
// failed on a stock Linux box. Reproduced on macOS with `umask 002 && npm test`.
const privateDir = (path) => {
  mkdirSync(path, { recursive: true });
  chmodSync(path, 0o700);
  return path;
};

const wipeCache = () => {
  rmSync(join(home, "cache"), { recursive: true, force: true });
  rmSync(join(home, "fake-state"), { force: true });
};

// ---------------------------------------------------------------------------
heading("Unit — kernel discovery");
{
  // doctor printed a macOS path as its example on every platform, found by
  // running the bundle in a Linux container with no Wolfram installed.
  check(
    "the example kernel path suits the platform it is shown on",
    lib.exampleKernelPath?.("darwin") === "/Applications/Wolfram.app" &&
      lib.exampleKernelPath?.("linux")?.startsWith("/usr/local/Wolfram/"),
    `${lib.exampleKernelPath?.("darwin")} / ${lib.exampleKernelPath?.("linux")}`,
  );
  check(
    "a .app bundle resolves to the kernel inside it",
    (() => {
      const app = join(home, "Fake.app");
      const bin = join(app, "Contents", "MacOS", "wolfram");
      mkdirSync(dirname(bin), { recursive: true });
      writeFileSync(bin, "#!/bin/sh\n", { mode: 0o755 });
      return lib.resolveKernelBinary(app) === realpathSync(bin);
    })(),
    "regression: spawning the bundle directory fails with EACCES",
  );

  check(
    "an installation directory resolves to the kernel inside it",
    (() => {
      const contents = join(home, "Fake2.app", "Contents");
      const bin = join(contents, "MacOS", "wolfram");
      mkdirSync(dirname(bin), { recursive: true });
      writeFileSync(bin, "#!/bin/sh\n", { mode: 0o755 });
      return lib.resolveKernelBinary(contents) === realpathSync(bin);
    })(),
    "$InstallationDirectory is what wolframscript reports",
  );

  check(
    "a non-executable file is rejected",
    (() => {
      const notExec = join(home, "notes.txt");
      writeFileSync(notExec, "hello", { mode: 0o644 });
      return lib.resolveKernelBinary(notExec) === null;
    })(),
  );

  check("a missing path is rejected", lib.resolveKernelBinary(join(home, "nope")) === null);

  // The wolframscript fallback, against a fake wolframscript.
  //
  // This used to call locateKernel({ minVersion: "9999" }) with the developer's
  // own environment, so on any machine that can actually run this server the
  // check reached the real `wolframscript -code`, started a real kernel and
  // spent a real licence seat — measured at 1.05s — inside a suite documented
  // as needing no Wolfram at all.
  //
  // Reaching that last-resort step deliberately takes some care: an unreachable
  // floor makes the platform scan miss, an isolated HOME keeps Wolfram's real
  // WolframScript.conf out of it, and a trimmed PATH leaves only the stub. The
  // stub then reports a version above the floor, which is the only way the
  // success path is reachable at all.
  {
    const stubDir = join(home, "stub-bin");
    const installDir = join(home, "stub-install");
    mkdirSync(join(installDir, "Executables"), { recursive: true });
    mkdirSync(stubDir, { recursive: true });

    const stub = (reportedDir) =>
      writeFileSync(
        join(stubDir, "wolframscript"),
        `#!/bin/sh\nprintf '${reportedDir}|10000.0.0 for Test'\n`,
        { mode: 0o755 },
      );

    const isolated = (fn) => {
      const saved = { ...process.env };
      // The stub first, then just enough for `which` itself to exist. The real
      // wolframscript lives in /usr/local/bin, which is deliberately not here.
      process.env.PATH = `${stubDir}:/usr/bin:/bin`;
      process.env.HOME = join(home, "stub-home");
      process.env.XDG_CONFIG_HOME = join(home, "stub-home", ".config");
      for (const key of [
        "WOLFRAMSCRIPT_KERNELPATH",
        "WOLFRAMSCRIPT_CONFIGURATIONPATH",
        "WOLFRAM_INSTALLATION_DIRECTORY",
        "WOLFRAM_HOME",
      ]) {
        delete process.env[key];
      }
      try {
        return fn();
      } finally {
        for (const key of Object.keys(process.env)) delete process.env[key];
        Object.assign(process.env, saved);
      }
    };

    // A wolframscript reporting a directory with no kernel in it must yield
    // nothing, and must never fall back to naming the script itself.
    stub(join(home, "stub-empty"));
    const nothing = isolated(() => lib.locateKernel({ minVersion: "9999" }));
    check(
      "a wolframscript with no kernel behind it yields nothing",
      nothing === null,
      nothing ? nothing.bin : "null",
    );

    // Reporting a real installation must yield the kernel inside it.
    const kernel = join(installDir, "Executables", "wolfram");
    writeFileSync(kernel, "#!/bin/sh\nexit 0\n", { mode: 0o755 });
    stub(installDir);
    const picked = isolated(() => lib.locateKernel({ minVersion: "9999" }));
    check(
      "wolframscript is never selected as a kernel",
      picked !== null && !/wolframscript/i.test(picked.bin),
      picked ? picked.bin : "null",
    );
    check(
      "the kernel behind it is what gets used",
      picked?.bin === realpathSync(kernel),
      `${picked?.bin} (source: ${picked?.source})`,
    );
  }

  check("version comparison is numeric", lib.compareVersions("14.10.0", "14.9.0") > 0);
  check("build suffixes compare correctly", lib.compareVersions("14.2.1.11454240", "15.0.0") < 0);
  check(
    "the AgentTools floor is the documented one",
    lib.DEFAULT_MIN_VERSION === "14.3",
    "regression: 14.1 and 14.2 cannot load Wolfram/AgentTools",
  );
}

// ---------------------------------------------------------------------------
heading("Unit — Wolfram's own configuration");
{
  const conf = join(home, "WolframScript.conf");
  writeFileSync(
    conf,
    [
      "//WOLFRAMSCRIPT_CLOUDBASE=",
      "WOLFRAMSCRIPT_AUTHENTICATIONPATH=/tmp/auth/",
      "WOLFRAMSCRIPT_KERNELPATH=/tmp/some/WolframKernel",
      "",
    ].join("\n"),
  );
  process.env.WOLFRAMSCRIPT_CONFIGURATIONPATH = conf;
  delete process.env.WOLFRAMSCRIPT_KERNELPATH;

  const found = lib.readConfiguration();
  check("the configuration file is located and parsed", found?.file === conf);
  check(
    "a // prefix means unset, as wolframscript writes it",
    found?.values.has("WOLFRAMSCRIPT_CLOUDBASE") === false,
  );
  check(
    "WOLFRAMSCRIPT_KERNELPATH is read from the file",
    lib.preferredKernel()?.path === "/tmp/some/WolframKernel",
  );

  process.env.WOLFRAMSCRIPT_KERNELPATH = "/tmp/other/wolfram";
  check(
    "the environment outranks the file, as wolframscript resolves it",
    lib.preferredKernel()?.path === "/tmp/other/wolfram",
  );
  delete process.env.WOLFRAMSCRIPT_KERNELPATH;
  delete process.env.WOLFRAMSCRIPT_CONFIGURATIONPATH;

  // wolfram / WolframKernel / MathKernel are one binary; report the canonical name.
  const dir = join(home, "Canon.app", "Contents", "MacOS");
  mkdirSync(dir, { recursive: true });
  for (const name of ["wolfram", "WolframKernel"]) {
    writeFileSync(join(dir, name), "#!/bin/sh\n", { mode: 0o755 });
  }
  check(
    "a WolframKernel path is reported as the canonical wolfram",
    lib.resolveKernelBinary(join(dir, "WolframKernel")) === realpathSync(join(dir, "wolfram")),
    "matches the path Wolfram's own generated config uses",
  );

  const lone = join(home, "Lone.app", "Contents", "MacOS");
  mkdirSync(lone, { recursive: true });
  writeFileSync(join(lone, "WolframKernel"), "#!/bin/sh\n", { mode: 0o755 });
  check(
    "but is kept as-is when no sibling wolfram exists",
    lib.resolveKernelBinary(join(lone, "WolframKernel")) === realpathSync(join(lone, "WolframKernel")),
  );
}

// ---------------------------------------------------------------------------
heading("Unit — server name handling");
{
  const noted = [];
  const log = (m) => noted.push(m);
  check("a valid server name passes through", lib.resolveServerName("WolframAlpha", log) === "WolframAlpha");
  check("case is normalised", lib.resolveServerName("wolframalpha", log) === "WolframAlpha");
  check(
    "a name outside the built-ins is passed through, not substituted",
    lib.resolveServerName("MyProject", log) === "MyProject",
    "regression: a user's own server silently became Wolfram's three tools",
  );
  check("the pass-through is reported", noted.some((m) => m.includes("MyProject")));
  check("an unset server name uses the default", lib.resolveServerName(undefined, log) === "Wolfram");

  process.env.MCP_SERVER_NAME = "${user_config.server_name}";
  check(
    "an unsubstituted template is treated as unset",
    lib.loadConfig(() => {}).serverName === "Wolfram",
    "as a host leaves `${user_config.*}` when a field is blank",
  );
  delete process.env.MCP_SERVER_NAME;

  // The plugin's default sits below every explicit name, so an MCP_SERVER_NAME
  // a user's environment already carries survives the plugin's own setting.
  const nameWith = (env) => {
    const names = ["MCP_SERVER_NAME", "WOLFRAM_MCP_SERVER_NAME", "WOLFRAM_MCP_DEFAULT_SERVER"];
    const saved = Object.fromEntries(names.map((n) => [n, process.env[n]]));
    for (const n of names) delete process.env[n];
    Object.assign(process.env, env);
    try {
      return lib.loadConfig(() => {}).serverName;
    } finally {
      for (const n of names) {
        if (saved[n] === undefined) delete process.env[n];
        else process.env[n] = saved[n];
      }
    }
  };
  const plugin = { WOLFRAM_MCP_DEFAULT_SERVER: "WolframLanguage" };
  check("a packager's default applies when nothing explicit is set", nameWith(plugin) === "WolframLanguage", nameWith(plugin));
  check(
    "an explicit MCP_SERVER_NAME beats it",
    nameWith({ ...plugin, MCP_SERVER_NAME: "WolframAlpha" }) === "WolframAlpha",
  );
  check(
    "and so does the explicit alias",
    nameWith({ ...plugin, WOLFRAM_MCP_SERVER_NAME: "MyProject" }) === "MyProject",
  );
  check(
    "a blank or unsubstituted explicit name falls through to the default, not to Wolfram",
    nameWith({ ...plugin, MCP_SERVER_NAME: " ", WOLFRAM_MCP_SERVER_NAME: "${user_config.x}" }) ===
      "WolframLanguage",
  );
  check("with nothing set at all, the engine default", nameWith({}) === "Wolfram");
}

// ---------------------------------------------------------------------------
heading("Unit — one broker per installation, not per server name");
{
  const addr = lib.brokerAddress;
  check(
    "two installations get their own brokers, since a broker runs one binary",
    addr("/Apps/One/wolfram") !== addr("/Apps/Two/wolfram"),
  );
  check(
    "and the same installation always lands on the same socket",
    addr("/Apps/One/wolfram") === addr("/Apps/One/wolfram"),
  );
  // The server name used to be part of this, which is what made two projects
  // naming different AgentTools servers run two brokers and derive two full
  // kernel budgets from one licence. It lives in the flavour now, so the pool
  // separates their kernels while the seat budget stays single.
  check(
    "a server name cannot be reached from here at all",
    lib.brokerAddress.length === 1,
    `brokerAddress takes ${lib.brokerAddress.length} argument(s)`,
  );
  // A pool learns its licence from its own kernels, and an entitlement brings
  // its own kernel limit, so two entitlements behind one broker throttled each
  // other or overran the smaller. Each value of
  // WOLFRAMINIT gets its own broker; sessions without one keep theirs.
  const withInit = (value) => {
    const saved = process.env.WOLFRAMINIT;
    if (value === undefined) delete process.env.WOLFRAMINIT;
    else process.env.WOLFRAMINIT = value;
    try {
      return addr("/Apps/One/wolfram");
    } finally {
      if (saved === undefined) delete process.env.WOLFRAMINIT;
      else process.env.WOLFRAMINIT = saved;
    }
  };
  check(
    "two licence entitlements get two brokers, and no entitlement keeps the usual one",
    withInit("-entitlement O-AAAA") !== withInit("-entitlement O-BBBB") &&
      withInit("-entitlement O-AAAA") !== withInit(undefined) &&
      withInit(undefined) === withInit("  "),
  );
}

// ---------------------------------------------------------------------------
heading("Unit — what makes two kernels interchangeable");
{
  const f = (env) => lib.kernelFlavour(env).digest;
  const base = { MCP_SERVER_NAME: "WolframLanguage" };

  check(
    "three projects with default settings share one flavour",
    f({ ...base, PWD: "/repo/one" }) === f({ ...base, PWD: "/repo/two" }) &&
      f({ ...base, PWD: "/repo/two" }) === f({ ...base, PWD: "/repo/three" }),
    "a working directory is not a reason to spend a licence seat",
  );
  // The kernel reads WOLFRAMINIT for its own command-line options, which is how
  // an on-demand licence entitlement reaches a kernel this server starts. Two
  // sessions on two entitlements shared one broker, and the second's kernels
  // ran on — and billed — the first's.
  check(
    "two licence entitlements are two flavours, and none is a third",
    f({ ...base, WOLFRAMINIT: "-pwfile !cloudlm.wolfram.com -entitlement O-AAAA" }) !==
      f({ ...base, WOLFRAMINIT: "-pwfile !cloudlm.wolfram.com -entitlement O-BBBB" }) &&
      f({ ...base, WOLFRAMINIT: "-pwfile !cloudlm.wolfram.com -entitlement O-AAAA" }) !== f(base) &&
      lib.kernelFlavour(base).names.includes("WOLFRAMINIT"),
  );
  check(
    "overriding the tool options in one of them does not",
    f({ ...base, MCP_TOOL_OPTIONS: '{"WolframLanguageEvaluator":{"TimeConstraint":10}}' }) !== f(base),
    "regression: measured, one project's 600 silently applied to another's 10",
  );
  check(
    "and two projects overriding it the same way share again",
    f({ ...base, MCP_TOOL_OPTIONS: "{}" }) === f({ ...base, MCP_TOOL_OPTIONS: "{}" }),
  );
  check(
    "blank is the same flavour as unset",
    f({ ...base, MCP_TOOL_OPTIONS: "   " }) === f(base),
    "the same kernel, spelled differently",
  );
  check(
    "an unsubstituted `${user_config.*}` placeholder is the same flavour as unset",
    f({ ...base, MCP_TOOL_OPTIONS: "${user_config.tool_options}" }) === f(base),
  );
  check(
    "a variable the user declares joins the flavour",
    f({ ...base, MY_MODE: "staging", WOLFRAM_MCP_KERNEL_ENV: "MY_MODE" }) !==
      f({ ...base, MY_MODE: "production", WOLFRAM_MCP_KERNEL_ENV: "MY_MODE" }),
    "a server the user wrote may read anything, so it can be told",
  );
  check(
    "a variable nobody declared does not",
    f({ ...base, MY_MODE: "staging" }) === f(base),
  );
  check(
    "every base directory counts, since it decides where paclets come from",
    f({ ...base, WOLFRAM_USERBASE: "/tmp/a" }) !== f({ ...base, WOLFRAM_USERBASE: "/tmp/b" }),
  );
  // Both calls read the same ambient environment, so the spelling is the only
  // difference between them.
  process.env.MCP_SERVER_NAME = "wolframlanguage";
  const lower = lib.loadConfig(() => {}).flavour.digest;
  process.env.MCP_SERVER_NAME = "WolframLanguage";
  const proper = lib.loadConfig(() => {}).flavour.digest;
  delete process.env.MCP_SERVER_NAME;
  check(
    "the resolved server name is what counts, not how it was spelled",
    lower === proper,
    "otherwise two spellings of one server would each hold a licence seat",
  );
}

// ---------------------------------------------------------------------------
heading("Unit — version pinning");
{
  const m = lib.versionMatches;
  check("a two-part pin matches a three-part version", m("14.3.0", "14.3") === true);
  check("a bare major matches any minor", m("15.1.0", "15") === true);
  check("an exact version matches itself", m("15.1.0", "15.1.0") === true);
  check("a different minor does not match", m("14.2.1", "14.3") === false);
  check(
    "14.30 is not matched by 14.3",
    m("14.30.0", "14.3") === false,
    "a string prefix test would get this wrong",
  );
  check("a longer pin than the version does not match", m("15", "15.1.0") === false);
  check("an unknown version never matches", m(null, "15") === false);
}

// ---------------------------------------------------------------------------
heading("Unit — licence seat budget");
{
  // The common licences are 2 and 4 seats. Neither can be reproduced on a
  // machine with an unlimited licence, so the arithmetic is tested directly.
  const d = (licence, reserve, explicit, current = 1) =>
    lib.deriveBudget(licence, reserve, explicit, current);
  const seats = (n) => ({ maxProcesses: n, type: "Test" });

  check("a 2-seat licence yields 1 kernel, keeping a seat free", d(seats(2), 1, undefined) === 1);
  check("a 4-seat licence yields 3", d(seats(4), 1, undefined) === 3);
  check("reserving 2 of 4 yields 2", d(seats(4), 2, undefined) === 2);
  check("a 1-seat licence still yields 1, never 0", d(seats(1), 1, undefined) === 1);
  check(
    "an unknown limit keeps the current budget",
    d({ maxProcesses: "unknown", type: null }, 1, undefined, 1) === 1,
    "regression: a value we failed to parse must not read as unlimited",
  );
  check(
    "unlimited is capped at a modest default, not the hard cap",
    d({ maxProcesses: "unlimited", type: null }, 1, undefined) === lib.UNLIMITED_BUDGET &&
      lib.UNLIMITED_BUDGET < lib.HARD_KERNEL_CAP,
    `${lib.UNLIMITED_BUDGET} of a possible ${lib.HARD_KERNEL_CAP}`,
  );
  check("an explicit override wins outright", d(seats(4), 1, 1) === 1);
  check("and is still clamped to the hard cap", d(seats(4), 1, 999) === lib.HARD_KERNEL_CAP);
}

// ---------------------------------------------------------------------------
heading("End to end — cold cache");
{
  wipeCache();
  const { client } = await connect();
  check("connected without starting a kernel", startCount() === 0, `starts=${startCount()}`);

  const { tools } = await client.listTools();
  check(
    "tools/list returns the upstream tool",
    upstreamTools(tools).length === 1 &&
      upstreamTools(tools)[0].name === "WolframLanguageEvaluator",
    tools.map((t) => t.name).join(", "),
  );
  check("with this server's own status tool alongside it", hasStatusTool(tools));
  check("exactly one kernel started", startCount() === 1, `starts=${startCount()}`);

  const result = await client.callTool({
    name: "WolframLanguageEvaluator",
    arguments: { code: "1+1" },
  });
  check("tools/call round-trips through the kernel", result.content?.[0]?.text?.includes('"code":"1+1"'));
  check("the server name reaches the kernel", result.content?.[0]?.text?.includes("server=WolframLanguage"));
  check("banner noise did not corrupt the session", !result.isError);
  check("still only one kernel", startCount() === 1, `starts=${startCount()}`);

  await client.close();
}

// ---------------------------------------------------------------------------
heading("Installation environment reaches the kernel");
{
  // Wolfram's own generated configuration sets WOLFRAM_BASE, WOLFRAM_USERBASE
  // and WOLFRAM_LOCALBASE explicitly, because a client launches the server with
  // a sparse environment and a kernel that computes the wrong user base cannot
  // find the AgentTools paclet.
  const { client } = await connect({ WOLFRAM_BASE: "/tmp/probe-base" });
  const result = await client.callTool({
    name: "WolframLanguageEvaluator",
    arguments: { code: "1+1" },
  });
  check(
    "WOLFRAM_BASE already in the environment is forwarded",
    result.content?.[0]?.text?.includes("base=/tmp/probe-base"),
  );
  await client.close();
}

// ---------------------------------------------------------------------------
// The check above only proves process.env passthrough, because it puts
// WOLFRAM_BASE in the server's own environment and switches the facts off. What
// matters in a real client is the other path: a kernel reports its
// installation as it starts, the facts are cached, and later kernels are
// handed the base directories. These used to come from a separate probe
// kernel, which on a cold machine made two kernels in a row on licences that
// permit two or four (plugin plan D20); now the serving kernel says them.
heading("A kernel reports its installation as it starts");
{
  // One kernel, started as the server starts one, kept only long enough to
  // hear what it said.
  const report = async (env = {}) => {
    const saved = {};
    for (const [name, value] of Object.entries(env)) {
      saved[name] = process.env[name];
      process.env[name] = value;
    }
    let facts = null;
    const session = new lib.KernelSession({
      bin: fakeKernel,
      serverName: "WolframLanguage",
      idleMs: 0,
      startTimeoutMs: 10_000,
      clientInfo: { name: "smoke", version: "1.0.0" },
      log: () => {},
      onFacts: (reported) => {
        facts = reported;
        lib.recordFacts(fakeKernel, reported, [], () => {});
      },
    });
    try {
      await session.run(async (client) => client.listTools());
    } finally {
      await session.stop();
      for (const [name, value] of Object.entries(saved)) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
    return facts;
  };

  wipeCache();
  const facts = await report();
  check("a kernel's facts arrive as it starts", facts?.version === "15.1.0", `version=${facts?.version}`);
  check("the licence seat count is a number", facts?.maxLicenseProcesses === 4, `${facts?.maxLicenseProcesses}`);
  check("the paclet version comes back", facts?.agentTools === "2.2.7", `${facts?.agentTools}`);
  // The state that looks healthy: server starts, doctor says ok, the evaluator
  // works, and anything cloud-backed fails on its own terms.
  check("an unsigned-in kernel is detected", facts?.wolframID === null, `${facts?.wolframID}`);
  const signedIn = await report({ FAKE_WOLFRAM_ID: "someone@example.com" });
  check(
    "and so is a signed-in one",
    signedIn?.wolframID === "someone@example.com" && signedIn?.cloudConnected === true,
    `${signedIn?.wolframID}`,
  );
  check(
    "the base directories become kernel environment",
    lib.baseDirectoryEnv(facts).WOLFRAM_BASE === "/fake/base",
    JSON.stringify(lib.baseDirectoryEnv(facts)),
  );

  // Keyed only on the binary, the facts used to outlive a paclet that updated
  // itself: measured, a 15.0.0 install showed the bundled 2.1.17 while 2.2.0
  // served, and would have until the binary changed.
  await report({ FAKE_AGENTTOOLS: "2.1.17" });
  const before = lib.readFacts(fakeKernel)?.agentTools;
  await report({ FAKE_AGENTTOOLS: "2.2.0" });
  const after = lib.readFacts(fakeKernel)?.agentTools;
  check(
    "and every start refreshes them, so a paclet update shows",
    before === "2.1.17" && after === "2.2.0",
    `${before} then ${after}`,
  );
  await report();

  // The probe cached "15..0" for every 15.0 installation — ToString[15.] is
  // "15." — and readFacts handed it on, because nothing but the binary's
  // identity was checked. Entries like that may still be on disk, so the repair
  // has to happen where they are read. The fake reports a fixed version, so
  // these entries are written by hand.
  const installations = join(home, "cache", "wolfram-mcp-server", "installations");
  const [entryName] = readdirSync(installations).filter((f) => f.endsWith(".json"));
  const entryFile = join(installations, entryName ?? "missing.json");
  const original = readFileSync(entryFile, "utf8");
  const withVersion = (version) =>
    writeFileSync(entryFile, JSON.stringify({ ...JSON.parse(original), version }));
  try {
    withVersion("15..0");
    const legacy = lib.readFacts(fakeKernel)?.version;
    check("a legacy 15..0 entry on disk reads as 15.0.0", legacy === "15.0.0", `version=${legacy}`);
    withVersion("fifteen");
    check(
      "and an entry whose version is not one reads as absent, not as a version",
      lib.readFacts(fakeKernel) === null,
    );
  } finally {
    writeFileSync(entryFile, original);
  }

  // Treating a value we failed to read as unlimited grew the pool to its cap on
  // exactly the machines we understand least. This is the parser, not
  // deriveBudget: asserting against the helper is what let the bug survive.
  const unreadable = await report({ FAKE_MAX_LICENSE: "$Failed" });
  check(
    "an unreadable $MaxLicenseProcesses reads as unknown",
    unreadable?.maxLicenseProcesses === "unknown",
    `${unreadable?.maxLicenseProcesses}`,
  );
  check(
    "and keeps the pool at one kernel",
    lib.deriveBudget({ maxProcesses: unreadable?.maxLicenseProcesses, type: null }, 1, undefined, 1) === 1,
  );
  await report();
}

// ---------------------------------------------------------------------------
// The other half of D20: with nothing cached, the pool starts at one kernel and
// takes its budget from what that kernel reports, rather than asking a probe
// kernel first.
heading("A cold pool takes its budget from its first kernel");
{
  wipeCache();
  const lines = [];
  const pool = new lib.KernelPool({
    bin: fakeKernel,
    serverName: "WolframLanguage",
    idleMs: 60_000,
    startTimeoutMs: 10_000,
    clientInfo: { name: "smoke", version: "1.0.0" },
    log: (line) => lines.push(line),
    reserveSeats: 1,
    licence: { maxProcesses: "unknown", type: null },
    learnFromKernels: true,
  });
  const flavour = lib.kernelFlavour({ MCP_SERVER_NAME: "WolframLanguage" });
  const coldBudget = pool.budget;
  await pool.run(flavour, async (client) => client.listTools());
  check(
    "it starts at one, and the four-seat report raises it to three",
    coldBudget === 1 && pool.budget === 3,
    `${coldBudget} then ${pool.budget}`,
  );
  await pool.stop();

  const configured = new lib.KernelPool({
    bin: fakeKernel,
    serverName: "WolframLanguage",
    idleMs: 60_000,
    startTimeoutMs: 10_000,
    clientInfo: { name: "smoke", version: "1.0.0" },
    log: () => {},
    reserveSeats: 1,
    licence: { maxProcesses: 2, type: null },
    learnFromKernels: true,
    licenceConfigured: true,
  });
  await configured.run(flavour, async (client) => client.listTools());
  check(
    "but a licence set by configuration stays as configured",
    configured.budget === 1,
    `budget=${configured.budget}`,
  );
  await configured.stop();
}

// ---------------------------------------------------------------------------
// A kernel reports the directories it was started with, and a session may set
// them itself. Taken as the installation's own, one session's WOLFRAM_USERBASE
// became every later kernel's, and was cached for good — and a user base is
// where paclets and the user's own MCP servers are found. Only computed
// directories are the installation's.
heading("A session's own directories stay that session's");
{
  wipeCache();
  const recorded = [];
  const pool = new lib.KernelPool({
    bin: fakeKernel,
    serverName: "WolframLanguage",
    idleMs: 60_000,
    startTimeoutMs: 10_000,
    clientInfo: { name: "smoke", version: "1.0.0" },
    log: () => {},
    reserveSeats: 0,
    licence: { maxProcesses: "unknown", type: null },
    learnFromKernels: true,
    onFacts: (facts, chosen) => {
      recorded.push(facts);
      lib.recordFacts(fakeKernel, facts, chosen, () => {});
    },
  });
  const custom = lib.kernelFlavour({ MCP_SERVER_NAME: "WolframLanguage", WOLFRAM_USERBASE: "/someone/else" });
  const plain = lib.kernelFlavour({ MCP_SERVER_NAME: "WolframLanguage" });
  const eval1 = (client) =>
    client.callTool({ name: "WolframLanguageEvaluator", arguments: { code: "1+1" } });
  await pool.run(custom, eval1);
  const later = await pool.run(plain, eval1);
  const laterSaid = later.content?.[0]?.text ?? "";
  check(
    "a kernel of another flavour is not handed that session's user base",
    !laterSaid.includes("userbase=/someone/else"),
    laterSaid.slice(0, 120),
  );
  check(
    "and it is not cached as the installation's",
    lib.readFacts(fakeKernel)?.userBase !== "/someone/else",
    `cached userBase=${lib.readFacts(fakeKernel)?.userBase}`,
  );
  // Nor is anything else such a kernel says: the paclet version and the
  // account come from its user base and cloud base too, and the cache is the
  // installation's, read by every session's wolfram_status.
  wipeCache();
  const savedAccount = process.env.FAKE_WOLFRAM_ID;
  process.env.FAKE_WOLFRAM_ID = "someone-elses@example.com";
  try {
    await pool.run(lib.kernelFlavour({ MCP_SERVER_NAME: "WolframLanguage", WOLFRAM_CLOUDBASE: "https://private.example" }), eval1);
  } finally {
    if (savedAccount === undefined) delete process.env.FAKE_WOLFRAM_ID;
    else process.env.FAKE_WOLFRAM_ID = savedAccount;
  }
  check(
    "a kernel with its own cloud base leaves no account or paclet version in the installation's cache",
    lib.readFacts(fakeKernel)?.wolframID !== "someone-elses@example.com",
    `cached account=${lib.readFacts(fakeKernel)?.wolframID ?? "none"}`,
  );
  await pool.stop();

  // A cloud base or a local base cannot change how many kernels the licence
  // allows: a licence is read from the installation, its base and its user
  // base. Learning only from kernels that chose nothing left a pool whose every
  // session set WOLFRAM_CLOUDBASE at one kernel for good.
  const cloudOnly = new lib.KernelPool({
    bin: fakeKernel,
    serverName: "WolframLanguage",
    idleMs: 60_000,
    startTimeoutMs: 10_000,
    clientInfo: { name: "smoke", version: "1.0.0" },
    log: () => {},
    reserveSeats: 0,
    licence: { maxProcesses: "unknown", type: null },
    learnFromKernels: true,
  });
  await cloudOnly.run(
    lib.kernelFlavour({ MCP_SERVER_NAME: "WolframLanguage", WOLFRAM_CLOUDBASE: "https://private.example", WOLFRAM_LOCALBASE: "/elsewhere" }),
    eval1,
  );
  check(
    "a pool whose kernels chose only a cloud or local base still learns its licence",
    cloudOnly.budget === 4,
    `budget=${cloudOnly.budget}`,
  );
  await cloudOnly.stop();
  const userOwn = new lib.KernelPool({
    bin: fakeKernel,
    serverName: "WolframLanguage",
    idleMs: 60_000,
    startTimeoutMs: 10_000,
    clientInfo: { name: "smoke", version: "1.0.0" },
    log: () => {},
    reserveSeats: 0,
    licence: { maxProcesses: "unknown", type: null },
    learnFromKernels: true,
  });
  await userOwn.run(custom, eval1);
  check(
    "but not from one with its own user base, which can hold a licence of its own",
    userOwn.budget === 1,
    `budget=${userOwn.budget}`,
  );
  await userOwn.stop();
}

// ---------------------------------------------------------------------------
// The broker's address and its kernels read WOLFRAMINIT with blank and an
// unsubstituted `${...}` as unset; its licence read any non-blank value as an
// entitlement, ignored the installation's cached licence, and started at one
// kernel — a broker serving the installation's licence that did not believe it.
heading("An unfilled WOLFRAMINIT is no entitlement to the broker either");
{
  wipeCache();
  lib.recordFacts(fakeKernel, {
    version: "15.1.0",
    systemID: "MacOSX-ARM64",
    base: "/fake/base",
    userBase: "/fake/base/userbase",
    localBase: "/fake/base/localbase",
    maxLicenseProcesses: 4,
    licenseType: "Professional",
    networkLicense: false,
    agentTools: "2.2.7",
    wolframID: null,
    cloudConnected: false,
  }, [], () => {});
  const saved = process.env.WOLFRAMINIT;
  process.env.WOLFRAMINIT = "${user_config.entitlement}";
  const address = join(privateDir(join(home, "run-unfilled-init")), "broker.sock");
  let broker = null;
  let client = null;
  try {
    broker = await lib.startBroker({
      address,
      bin: fakeKernel,
      serverName: "WolframLanguage",
      idleMs: 60_000,
      startTimeoutMs: 10_000,
      reserveSeats: 0,
      allowInspect: true,
      clientInfo: { name: "smoke", version: "1.0.0" },
      log: () => {},
    });
    client = await lib.BrokerBackend.attachIfRunning({
      address,
      flavour: lib.kernelFlavour({ MCP_SERVER_NAME: "WolframLanguage" }),
      spawnCommand: join(home, "definitely-not-a-binary"),
      spawnArgs: [],
      spawnEnv: {},
      log: () => {},
    });
    const status = client ? await client.status(5_000) : null;
    check(
      "it budgets from the installation's cached licence",
      status?.budget === 4,
      status ? `budget=${status.budget}` : "could not attach",
    );
  } finally {
    if (saved === undefined) delete process.env.WOLFRAMINIT;
    else process.env.WOLFRAMINIT = saved;
    await client?.stop();
    await broker?.stop?.();
  }
}

// ---------------------------------------------------------------------------
// A cold machine — no tool list, no facts — through a whole shared session: the
// broker starts, the session lists its tools, and one kernel does all of it.
// Before D20 this was two, the probe and then the pool's kernel.
heading("A cold start uses one kernel");
{
  wipeCache();
  const runtime = join(home, "cold-one");
  privateDir(runtime);
  const before = startCount();
  const s = await connect({ WOLFRAM_MCP_SHARE: "1", WOLFRAM_MCP_INSPECT: "1", XDG_RUNTIME_DIR: runtime });
  const { tools } = await s.client.listTools();
  const answer = await s.client.callTool({ name: "wolfram_status", arguments: {} });
  await s.client.close();
  const status = answer.content?.[0]?.text ?? "";
  check(
    "one kernel start, which also reported the installation",
    startCount() - before === 1 && upstreamTools(tools).length === 1 && /licence\s+4 seat/.test(status),
    `${startCount() - before} start(s); ${status.split("\n").find((l) => l.startsWith("licence")) ?? "no licence line"}`,
  );
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
heading("Regression — reported base directories reach every later kernel");
{
  // The first kernel on a machine inherits its environment and reports the
  // directories it computed from it; every kernel after it is handed them. So
  // each case warms the facts with one session, then asks a fresh kernel — a
  // new broker, or a new private kernel — which is the one that must get them.
  const askBase = async (label, env) => {
    wipeCache();
    const session = async (round) => {
      const runtime = join(home, `base-${label}-${round}`);
      privateDir(runtime);
      const s = await connect({
        // The facts are the point of this section, so they stay on.
        WOLFRAM_MCP_INSPECT: "1",
        XDG_RUNTIME_DIR: runtime,
        FAKE_BASE: "/fake/base",
        ...env,
      });
      const result = await s.client.callTool(
        { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
        undefined,
        { timeout: 30_000 },
      );
      await s.client.close();
      await new Promise((r) => setTimeout(r, 300));
      return result.content?.[0]?.text ?? "";
    };
    await session("warm");
    return session("ask");
  };

  const shared = await askBase("shared", { WOLFRAM_MCP_SHARE: "1" });
  check(
    "a shared kernel is told where the installation lives",
    shared.includes("base=/fake/base"),
    shared.slice(0, 70),
  );

  const private_ = await askBase("private", { WOLFRAM_MCP_SHARE: "0" });
  check(
    "so is a private kernel",
    private_.includes("base=/fake/base"),
    private_.slice(0, 70),
  );

  // The second worked example in docs/environment.md. Saying what the licence
  // permits must not silently switch off base-directory forwarding.
  const pinned = await askBase("pinned", { WOLFRAM_MCP_SHARE: "1", WOLFRAM_MCP_LICENSE_LIMIT: "4" });
  check(
    "and so is one whose licence limit was configured by hand",
    pinned.includes("base=/fake/base"),
    pinned.slice(0, 70),
  );
}

// ---------------------------------------------------------------------------
heading("End to end — warm cache");
{
  const before = startCount();
  const { client } = await connect();
  const { tools } = await client.listTools();
  check("tools/list served with no kernel", startCount() === before, `starts=${startCount()}`);
  check("the cached list is intact", upstreamTools(tools).length === 1);
  check("and the status tool is offered without a kernel", hasStatusTool(tools));

  await client.callTool({ name: "WolframLanguageEvaluator", arguments: { code: "2+2" } });
  check("the kernel starts on first call, not before", startCount() === before + 1);
  await client.close();
}

// ---------------------------------------------------------------------------
heading("End to end — idle shutdown");
{
  const { client, stderr } = await connect({ WOLFRAM_MCP_IDLE_MINUTES: "0.02" });
  await client.callTool({ name: "WolframLanguageEvaluator", arguments: { code: "3+3" } });
  await new Promise((r) => setTimeout(r, 2500));
  check("the kernel is shut down when idle", stderr().includes("shutting the kernel down"));

  const before = startCount();
  const again = await client.callTool({
    name: "WolframLanguageEvaluator",
    arguments: { code: "4+4" },
  });
  check("it restarts transparently on the next call", startCount() === before + 1);
  check("and the call succeeds", !again.isError);
  await client.close();
}

// ---------------------------------------------------------------------------
heading("Regression — a bad kernel path must not wedge the server");
{
  // A path that resolves to an executable file but cannot actually be spawned.
  // A bad interpreter line gives ENOEXEC, which is the same class of failure as
  // pointing at a .app bundle (EACCES) but cannot be satisfied by a real
  // install on this machine, so the check can never pass vacuously.
  const unspawnable = join(home, "broken-kernel");
  writeFileSync(unspawnable, "#!/nonexistent/interpreter\n", { mode: 0o755 });

  const { client, stderr } = await connect({
    WOLFRAM_MCP_KERNEL: unspawnable,
    WOLFRAM_MCP_START_TIMEOUT_SECONDS: "60",
  });

  const timings = [];
  let allErrored = true;
  for (let i = 0; i < 3; i++) {
    const startedAt = Date.now();
    const result = await client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
      undefined,
      { timeout: 15_000 },
    ).catch(() => null);
    timings.push(Date.now() - startedAt);
    if (!result?.isError) allErrored = false;
  }

  check(
    "every call returns an error rather than hanging",
    allErrored,
    `latencies: ${timings.map((t) => `${t}ms`).join(", ")}`,
  );
  check(
    "each failure is fast, not a start timeout",
    timings.every((t) => t < 10_000),
    "regression: close() awaited an exit event that never fires for a failed spawn",
  );
  check(
    "the reported reason names the spawn failure",
    stderr().includes("could not start"),
    "and not a start timeout blamed on licensing",
  );
  check(
    "the start timeout was never reached",
    !stderr().includes("did not complete MCP initialization"),
  );
  await client.close();
}

// ---------------------------------------------------------------------------
heading("Regression — a transient tools/list failure must not poison the cache");
{
  wipeCache();
  const first = await connect({ FAKE_MODE: "fail-list-once" });
  const cold = await first.client.listTools().then(
    (r) => ({ ok: true, tools: r.tools }),
    (err) => ({ ok: false, message: String(err) }),
  );
  check(
    "a cold list failure is reported as an error, not an empty list",
    cold.ok === false,
    "an empty list is a lie the client would cache",
  );
  await first.client.close();

  const second = await connect({ FAKE_MODE: "fail-list-once" });
  const recovered = await second.client.listTools();
  check(
    "the next session recovers the real list",
    upstreamTools(recovered.tools).length === 1 &&
      upstreamTools(recovered.tools)[0].name === "WolframLanguageEvaluator",
    "regression: the empty list was persisted and served forever",
  );
  await second.client.close();
}

// ---------------------------------------------------------------------------
heading("Regression — a stale cache must be corrected on kernel start");
{
  wipeCache();
  // Seed a cache that matches the key this server will compute, but describes a
  // tool the kernel does not have.
  lib.writeCache({
    // Spread rather than restated: this seed has to land on exactly the key the
    // server will compute, and it silently stopped doing so when the key gained
    // a field.
    ...suiteKey,
    upstream: { prompts: true, resources: false },
    tools: [
      {
        name: "GhostToolFromStaleCache",
        description: "does not exist upstream",
        inputSchema: { type: "object", properties: {} },
      },
    ],
    prompts: [],
  });

  const { client } = await connect();
  const stale = await client.listTools();
  check("the cached list is served before any kernel runs", stale.tools[0]?.name === "GhostToolFromStaleCache");

  // Calling it starts a kernel, which is what refreshes the cache. The call
  // itself now fails as an MCP error, because a tool the kernel does not have
  // is a request that could not be honoured rather than a tool that ran badly.
  let ghostError = null;
  try {
    await client.callTool({ name: "GhostToolFromStaleCache", arguments: {} });
  } catch (err) {
    ghostError = err;
  }
  check(
    "calling a tool the kernel does not have is an MCP error",
    String(ghostError?.code) === "-32602",
    `code=${ghostError?.code}`,
  );
  await new Promise((r) => setTimeout(r, 500));

  const onDisk = lib.readCache(suiteKey);
  check(
    "starting a kernel rewrites the cache from upstream",
    onDisk?.tools.length === 1 && onDisk.tools[0].name === "WolframLanguageEvaluator",
    "regression: refresh only ran when the cache was already empty",
  );
  check(
    "the ghost tool is gone",
    !onDisk?.tools.some((t) => t.name === "GhostToolFromStaleCache"),
  );
  await client.close();
}

// ---------------------------------------------------------------------------
heading("Regression — a startup failure must report what the kernel said");
{
  wipeCache();
  const { client } = await connect({
    FAKE_MODE: "no-agenttools",
    WOLFRAM_MCP_START_TIMEOUT_SECONDS: "3",
  });
  const result = await client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined,
    { timeout: 20_000 },
  );
  const text = result.content?.[0]?.text ?? "";
  check("the call fails cleanly", result.isError === true);
  check(
    "the kernel's own output is included",
    text.includes("Cannot open Wolfram`AgentTools`"),
    "regression: every failure blamed an unactivated Wolfram Engine",
  );
  check("the paclet is named as a likely cause", text.includes("AgentTools"));
  await client.close();
}

// ---------------------------------------------------------------------------
heading("A kernel that refuses to start reports why");
{
  // The shape of licence-seat exhaustion, which is the common case: a typical
  // licence allows 2 or 4 concurrent kernels, so an agent session plus a
  // Mathematica window can already fill it. The kernel complains and exits.
  wipeCache();
  const { client } = await connect({
    FAKE_MODE: "no-seats",
    WOLFRAM_MCP_START_TIMEOUT_SECONDS: "60",
  });
  const startedAt = Date.now();
  const result = await client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined,
    { timeout: 20_000 },
  );
  const elapsed = Date.now() - startedAt;
  const text = result.content?.[0]?.text ?? "";
  check("fails immediately, not at the start timeout", elapsed < 5_000, `${elapsed}ms`);
  check("reports the licence message verbatim", text.includes("maximum number of licensed"));
  check("and says the kernel exited", text.includes("exited unexpectedly"));
  await client.close();
}

// ---------------------------------------------------------------------------
// An unactivated kernel does not wait for credentials: measured on 15.0.0 with
// no mathpass in its user base, it prints one line and exits 70. The call
// carried those words, but nothing said they meant "not activated", or what
// fixes it, so the setup skill's activation step was never reached.
heading("An unactivated kernel is named as one");
{
  wipeCache();
  const { client } = await connect({ FAKE_MODE: "unactivated" });
  const result = await client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined,
    { timeout: 20_000 },
  );
  const text = result.content?.[0]?.text ?? "";
  check(
    "the call fails with the kernel's own words",
    result.isError === true && text.includes("No valid password found."),
    text.slice(0, 80),
  );
  check(
    "and says the kernel is not activated, and how to activate it",
    /not activated/.test(text) && text.includes("wolframscript -activate"),
    text.split("\n").slice(-2).join(" | ").slice(0, 120),
  );
  // The back-off then answers the next call, carrying that same reason. It
  // used to splice the reason into the middle of a sentence, so a reason that
  // ended in a sentence of its own read "try again.. For a full report", with
  // the pointer to doctor buried after the kernel's output.
  const again = await client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined,
    { timeout: 20_000 },
  );
  const backedOff = again.content?.[0]?.text ?? "";
  check(
    "and the next call's back-off names doctor before the reason, reading cleanly",
    /retried in/.test(backedOff) &&
      !/\.\./.test(backedOff) &&
      backedOff.indexOf("npm run doctor") < backedOff.indexOf("No valid password found."),
    backedOff.replace(/\s+/g, " ").slice(0, 160),
  );
  await client.close();
}

// ---------------------------------------------------------------------------
heading("Regression — tool-list changes are announced");
{
  wipeCache();
  const first = await connect();
  await first.client.listTools();
  await first.client.close();

  const { client, stderr } = await connect({ FAKE_MODE: "extra-tool" });
  await client.callTool({ name: "WolframLanguageEvaluator", arguments: { code: "1+1" } });
  await new Promise((r) => setTimeout(r, 400));
  check("a changed upstream list is logged", stderr().includes("upstream tool list changed"));
  const onDisk = lib.readCache(suiteKey);
  check("and persisted", onDisk?.tools.length === 2, `tools=${onDisk?.tools.length}`);
  await client.close();
}

// ---------------------------------------------------------------------------
heading("End to end — no kernel at all");
{
  wipeCache();
  const { client } = await connect({
    WOLFRAM_MCP_KERNEL: join(home, "definitely-absent"),
    WOLFRAM_MCP_MIN_VERSION: "9999",
    // A trimmed PATH keeps the wolframscript locator from finding a real
    // install on the developer's machine and making this check vacuous.
    PATH: "/usr/bin:/bin",
  });
  const { tools } = await client.listTools();
  check(
    "the server degrades to the status tool alone",
    tools.length === 1 && tools[0].name === STATUS_TOOL,
    `got: ${tools.map((t) => t.name).join(", ")}`,
  );
  const result = await client.callTool({ name: "wolfram_diagnostics", arguments: {} });
  check("the diagnostic explains itself", result.content?.[0]?.text?.includes("No usable Wolfram"));
  // The reader is someone whose server is failing. Sending them to an unpublished
  // npx package leaves them with nothing that resolves.
  check(
    "and points at something that can actually be run",
    !/npx/.test(result.content?.[0]?.text ?? "") &&
      /npm run doctor/.test(result.content?.[0]?.text ?? ""),
    (result.content?.[0]?.text ?? "").split("\n").filter((l) => /doctor/.test(l)).join(" ").slice(0, 70),
  );
  check("and names the version floor", result.content?.[0]?.text?.includes("9999"));
  await client.close();
}

// ---------------------------------------------------------------------------
heading("Sharing — several sessions, one kernel");
{
  // Kernels are licence-limited: a typical licence permits 2 or 4, so one
  // session per kernel locks the user out of their own Mathematica. Several
  // server processes must therefore cost one kernel, not one each.
  wipeCache();
  const runtime = join(home, "run-share");
  privateDir(runtime);
  const shared = {
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_IDLE_MINUTES: "5",
    // Say what the licence permits rather than probing a fake kernel for it.
    WOLFRAM_MCP_LICENSE_LIMIT: "2",
  };

  const a = await connect(shared);
  const b = await connect(shared);
  const c = await connect(shared);

  const call = (client, code) =>
    client.callTool({ name: "WolframLanguageEvaluator", arguments: { code } }, undefined,
      { timeout: 30_000 });

  const before = startCount();
  const results = await Promise.all([
    call(a.client, "1+1"),
    call(b.client, "2+2"),
    call(c.client, "3+3"),
  ]);
  const started = startCount() - before;

  check("all three sessions got an answer", results.every((r) => !r.isError));
  check(
    "three sessions started exactly one kernel",
    started === 1,
    `kernels started: ${started}`,
  );
  check(
    "the broker reports itself as the backend",
    a.stderr().includes("attached to the broker"),
  );

  // A fourth session arriving later must reuse the same kernel, not start one.
  const d = await connect(shared);
  await call(d.client, "4+4");
  check(
    "a later session reuses the running kernel",
    startCount() - before === 1,
    `kernels started: ${startCount() - before}`,
  );

  for (const s of [a, b, c, d]) await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
heading("Sharing — the pool grows only up to its budget");
{
  wipeCache();
  const runtime = join(home, "run-pool");
  privateDir(runtime);
  const shared = {
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_MAX_KERNELS: "2",
    WOLFRAM_MCP_IDLE_MINUTES: "5",
    WOLFRAM_MCP_LICENSE_LIMIT: "unlimited",
  };

  const sessions = [];
  for (let i = 0; i < 4; i++) sessions.push(await connect(shared));

  const before = startCount();
  const results = await Promise.all(
    sessions.map((s, i) =>
      s.client.callTool(
        { name: "WolframLanguageEvaluator", arguments: { code: `${i}+${i}` } },
        undefined,
        { timeout: 30_000 },
      ),
    ),
  );
  const started = startCount() - before;

  check("all four sessions got an answer", results.every((r) => !r.isError));
  check(
    "four sessions never exceed the 2-kernel budget",
    started <= 2,
    `kernels started: ${started}`,
  );
  check("and the excess queued rather than failing", results.length === 4);

  for (const s of sessions) await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
heading("Sharing — falls back rather than failing");
{
  wipeCache();
  const runtime = join(home, "run-nobroker");
  privateDir(runtime);
  // Point the broker spawn at a runtime dir it cannot use, so attaching fails.
  const { client, stderr } = await connect({
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: join(runtime, "does", "not", "exist"),
  });
  const result = await client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined,
    { timeout: 30_000 },
  );
  check("the call still succeeds on a private kernel", !result.isError);
  check(
    "and the fallback is explained",
    /private kernel|could not spawn|did not come up/.test(stderr()),
    "sharing is an optimisation, never a dependency",
  );
  await client.close();
}

// ---------------------------------------------------------------------------
// An unauthenticated local socket on which anyone may evaluate arbitrary Wolfram
// Language deserves a boundary, and it had none. Two halves, both missing: the
// socket was created with whatever the umask left it — measured srwxr-xr-x under
// the default 022, connectable by every user on the machine — and the directory
// holding it was never examined, though the path is derived from public facts
// and `brokerAddress` checked only its *length*.
heading("The broker's socket is private, and so is the directory holding it");
{
  wipeCache();
  const runtime = join(home, "run-boundary");
  privateDir(runtime);
  const s = await connect({ WOLFRAM_MCP_SHARE: "1", XDG_RUNTIME_DIR: runtime });
  await s.client.callTool({ name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined, { timeout: 30_000 });
  await new Promise((r) => setTimeout(r, 400));

  const socks = readdirSync(runtime).filter((f) => f.endsWith(".sock"));
  check("a private directory is shared in", socks.length === 1, socks.join(", ") || "no socket bound");
  const mode = socks[0] ? statSync(join(runtime, socks[0])).mode & 0o777 : -1;
  check(
    "and only the owner can connect to the socket",
    mode === 0o600,
    `mode ${mode === -1 ? "(no socket)" : mode.toString(8)} — the umask leaves 755 unless something narrows it`,
  );
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// 0600 stops another user connecting; it cannot stop one getting there first.
// Anyone who can write to the directory can bind this exact path before we do —
// the name is derived, not secret — and every proxy that connects then hands its
// evaluations to whatever answered. So the directory is the requirement, and an
// unusable one has to end in a private kernel, which is what the comment beside
// `brokerAddress` always claimed and only the length half implemented.
heading("A directory others can write to is refused, not shared in");
{
  wipeCache();
  const exposed = join(home, "run-exposed");
  mkdirSync(exposed, { recursive: true });
  chmodSync(exposed, 0o777);
  const s = await connect({ WOLFRAM_MCP_SHARE: "1", XDG_RUNTIME_DIR: exposed });
  const result = await s.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined, { timeout: 30_000 });

  check(
    "sharing is declined",
    /not sharing kernels/.test(s.stderr()),
    s.stderr().split("\n").filter((l) => /sharing/.test(l)).join(" | ").slice(0, 100),
  );
  check(
    "and the reason names the mode, so it can be fixed",
    /writable by group and others \(mode 777\)/.test(s.stderr()),
  );
  check(
    "and the remedy, so sharing can come back",
    /sharing resumes when WOLFRAM_MCP_RUNTIME_DIR \(or XDG_RUNTIME_DIR\) names a directory only you can write to/.test(s.stderr()),
    s.stderr().split("\n").filter((l) => /not sharing/.test(l)).join(" | ").slice(0, 120),
  );
  check("the call still succeeds, on a private kernel", !result.isError);
  check(
    "and nothing was bound in the exposed directory",
    readdirSync(exposed).filter((f) => f.endsWith(".sock")).length === 0,
    readdirSync(exposed).join(", "),
  );
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));

  // umask 002 — the user-private-group default on much of Linux — leaves a bare
  // mkdir group-writable, and that is the shape this refusal meets in practice.
  // The message must blame the group: a user staring at drwxrwxr-x was told
  // "writable by others", and others cannot write to it.
  const grouped = join(home, "run-grouped");
  mkdirSync(grouped, { recursive: true });
  chmodSync(grouped, 0o770);
  const g = await connect({ WOLFRAM_MCP_SHARE: "1", XDG_RUNTIME_DIR: grouped });
  const groupedResult = await g.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined, { timeout: 30_000 });
  check("a group-writable directory is refused too", /not sharing kernels/.test(g.stderr()));
  check(
    "and blamed on the group, not on others",
    /writable by its group \(mode 770\)/.test(g.stderr()),
    g.stderr().split("\n").filter((l) => /sharing/.test(l)).join(" | ").slice(0, 110),
  );
  check("the call still succeeds, on a private kernel", !groupedResult.isError);
  await g.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// With no XDG_RUNTIME_DIR — a headless Linux host, an ssh session, a container —
// the socket fell back to the system's /tmp, which everyone can write to, so
// the refusal above applied to every session there and each took a private
// kernel, and a seat. Found running the bundle in a Linux container. These
// sessions have no XDG_RUNTIME_DIR and /tmp as their temp directory, the same
// shape.
heading("Sharing has a private home without XDG_RUNTIME_DIR, or one you choose");
{
  const ownRun = join(process.env.XDG_CACHE_HOME ?? join(home, ".cache"), "wolfram-mcp-server", "run");
  const sockets = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".sock")) : []);
  const evaluate = (session) =>
    session.client.callTool({ name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
      undefined, { timeout: 30_000 });

  wipeCache();
  const s = await connect({ WOLFRAM_MCP_SHARE: "1" });
  await evaluate(s);
  await new Promise((r) => setTimeout(r, 400));
  const ownMode = existsSync(ownRun) ? statSync(ownRun).mode & 0o777 : -1;
  check(
    "with none set and /tmp open to all, the session still shares, from a private directory of its own",
    /attached to the broker/.test(s.stderr()) && sockets(ownRun).length === 1 && ownMode === 0o700,
    `${s.stderr().split("\n").filter((l) => /sharing|attached/.test(l)).join(" | ").slice(0, 90)}; ` +
      `${ownRun}: ${sockets(ownRun).join(",") || "no socket"}, mode ${ownMode.toString(8)}`,
  );
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
  signalOwnBrokers("SIGTERM", ownRun);

  // A directory the user chooses wins over every default, and is made private
  // if it does not exist yet.
  wipeCache();
  const chosen = join(home, "run-chosen", "nested");
  const other = privateDir(join(home, "run-not-chosen"));
  const c = await connect({ WOLFRAM_MCP_SHARE: "1", WOLFRAM_MCP_RUNTIME_DIR: chosen, XDG_RUNTIME_DIR: other });
  await evaluate(c);
  await new Promise((r) => setTimeout(r, 400));
  const chosenMode = existsSync(chosen) ? statSync(chosen).mode & 0o777 : -1;
  check(
    "WOLFRAM_MCP_RUNTIME_DIR names where the broker lives, created private, ahead of XDG_RUNTIME_DIR",
    sockets(chosen).length === 1 && chosenMode === 0o700 && sockets(other).length === 0,
    `chosen: ${sockets(chosen).join(",") || "none"} mode ${chosenMode.toString(8)}; other: ${sockets(other).join(",") || "none"}`,
  );
  await c.client.close();
  await new Promise((r) => setTimeout(r, 300));
  signalOwnBrokers("SIGTERM", chosen);

  // Chosen is not trusted: the same rule applies, and the refusal names it.
  wipeCache();
  const exposedChoice = join(home, "run-chosen-exposed");
  mkdirSync(exposedChoice, { recursive: true });
  chmodSync(exposedChoice, 0o777);
  const e = await connect({ WOLFRAM_MCP_SHARE: "1", WOLFRAM_MCP_RUNTIME_DIR: exposedChoice });
  const exposedResult = await evaluate(e);
  check(
    "and a chosen directory others can write to is refused, like any other",
    /not sharing kernels: .*run-chosen-exposed is writable by group and others/.test(e.stderr()) &&
      !exposedResult.isError && sockets(exposedChoice).length === 0,
    e.stderr().split("\n").filter((l) => /sharing/.test(l)).join(" | ").slice(0, 120),
  );
  await e.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// The broker is detached and its output goes to a file that outlives every
// session writing to it. Without a time on each line there is nothing in that
// file to place an event in, or to match it to the session that caused it —
// which is the half of plan.md §5.1 that never landed.
heading("Every line the broker writes says when it happened");
{
  wipeCache();
  const runtime = join(home, "run-stamped");
  privateDir(runtime);
  const logFile = join(home, "broker-stamped.log");
  const s = await connect({
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_LOG: logFile,
  });
  await s.client.callTool({ name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined, { timeout: 30_000 });
  await new Promise((r) => setTimeout(r, 500));

  const lines = existsSync(logFile)
    ? readFileSync(logFile, "utf8").split("\n").filter(Boolean)
    : [];
  check("the broker wrote to the file it was given", lines.length > 0, `${logFile}`);
  const stamped = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z \[wolfram-broker\] /;
  check(
    "and every line carries an ISO timestamp ahead of the prefix",
    lines.length > 0 && lines.every((line) => stamped.test(line)),
    (lines.find((line) => !stamped.test(line)) ?? lines[0] ?? "").slice(0, 72),
  );
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// Spawning a broker is not the same as it winning the bind. The child can find
// the address already taken by another session's broker and stand down, and the
// retry loop then attaches to the winner — whose pool settings belong to that
// other session. `doctor` must not describe the winner's settings as this run's,
// so "started here" has to be the broker's own pid agreeing with the pid that
// was spawned, not a flag set on whichever connection came back first.
heading("A spawn that lost the bind race is not mistaken for the winner");
{
  const runtime = join(home, "run-race");
  privateDir(runtime);
  const address = join(runtime, "raced.sock");
  const said = [];
  // The loser: spawns cleanly and exits at once, exactly like a broker that
  // found the address taken. open() records its pid all the same.
  const opening = lib.BrokerBackend.open({
    address,
    flavour: lib.kernelFlavour({ MCP_SERVER_NAME: "WolframLanguage" }),
    spawnCommand: process.execPath,
    spawnArgs: ["-e", ""],
    spawnEnv: { ...process.env },
    log: (m) => said.push(m),
  });
  // The winner: another session's broker, bound only after open() has looked,
  // found nothing, and committed to the spawn path — asserted below, so a
  // scheduling stall cannot quietly turn this into the plain attach case.
  await new Promise((r) => setTimeout(r, 250));
  const winner = spawn(process.execPath, [entry, "broker", "--address", address, "--kernel", fakeKernel], {
    env: {
      PATH: process.env.PATH,
      HOME: home,
      USERPROFILE: home,
      XDG_CACHE_HOME: process.env.XDG_CACHE_HOME,
      LOCALAPPDATA: process.env.LOCALAPPDATA,
      WOLFRAM_MCP_KERNEL: fakeKernel,
      MCP_SERVER_NAME: "WolframLanguage",
      WOLFRAM_MCP_INSPECT: "0",
      FAKE_MARKER: marker,
      FAKE_STATE: join(home, "fake-state"),
    },
    stdio: "ignore",
  });
  const backend = await opening;
  check(
    "the spawn path was taken first",
    said.some((l) => /no broker listening/.test(l)),
    said.join(" | ").slice(0, 100),
  );
  check("and the winner was attached to", backend !== null, said.join(" | ").slice(0, 100));
  if (backend) {
    const status = await backend.status();
    let claimed = true;
    try {
      claimed = backend.spawnedHere(status.pid);
    } catch {
      // The old shape: a boolean set at connect time, which is the bug — the
      // connection came off the spawn path, so it said "started here".
    }
    check(
      "a broker started by another session is not claimed as ours",
      claimed === false,
      `broker pid ${status.pid}`,
    );
    await backend.stop();
  }
  winner.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// The four checks below are the ones an instant kernel cannot express. Each was
// reproduced by measurement before it was written down; see docs/plan.md §0.
heading("Regression — one call starts one kernel, not a licence budget");
{
  wipeCache();
  const runtime = join(home, "run-onecall");
  privateDir(runtime);
  const s = await connect({
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    // Budget 3, so a cascade has somewhere to go.
    WOLFRAM_MCP_LICENSE_LIMIT: "4",
    WOLFRAM_MCP_RESERVE_SEATS: "1",
    WOLFRAM_MCP_IDLE_MINUTES: "5",
    // Long enough that the slot is still held when kernelReady lands. Measured:
    // 0ms grew the pool to 1, 200ms grew it to the whole budget.
    FAKE_CALL_DELAY_MS: "250",
  });
  const before = startCount();
  const result = await s.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined,
    { timeout: 30_000 },
  );
  check("the fake kernel is the one that answered", answeredByFake(result), "not a real install");
  await new Promise((r) => setTimeout(r, 2000));
  const started = startCount() - before;
  check("one tool call starts exactly one kernel", started === 1, `kernels started: ${started}`);
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
heading("Regression — an empty upstream list is never cached");
{
  wipeCache();
  {
    const s = await connect({ WOLFRAM_MCP_SHARE: "0", FAKE_EMPTY_TOOLS: "1" });
    const { tools } = await s.client.listTools();
    check("a kernel reporting no tools is served as-is", upstreamTools(tools).length === 0);
    await new Promise((r) => setTimeout(r, 600));
    await s.client.close();
    await new Promise((r) => setTimeout(r, 300));
  }
  // Same cache, but this kernel has tools. An empty list must never have been
  // persisted: with nothing advertised no tools/call can arrive, so nothing
  // would ever start a kernel to correct it for the whole 7-day TTL.
  {
    const s = await connect({ WOLFRAM_MCP_SHARE: "0" });
    const { tools } = await s.client.listTools();
    check("and does not poison the next session", upstreamTools(tools).length === 1,
      tools.map((t) => t.name).join(", "));
    await s.client.close();
    await new Promise((r) => setTimeout(r, 300));
  }
}

// ---------------------------------------------------------------------------
heading("Regression — a broker that dies does not brick the session");
{
  wipeCache();
  const runtime = join(home, "run-brokerdies");
  privateDir(runtime);
  const s = await connect({
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_LICENSE_LIMIT: "4",
    WOLFRAM_MCP_IDLE_MINUTES: "5",
  });
  const first = await s.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } }, undefined, { timeout: 30_000 });
  check("the first call works", !first.isError && answeredByFake(first));

  const killed = signalOwnBrokers("SIGKILL");
  check("a broker was running to kill", killed > 0, `killed ${killed}`);
  await new Promise((r) => setTimeout(r, 500));

  // Sharing is an optimisation, never a dependency: this must fall back to a
  // private kernel or attach to a replacement, not fail forever.
  const second = await s.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "2+2" } }, undefined, { timeout: 30_000 });
  check(
    "a later call recovers rather than failing forever",
    !second.isError,
    (second.content?.[0]?.text ?? "").slice(0, 60),
  );
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
heading("Regression — several sessions recovering at once produce one broker");
{
  wipeCache();
  const runtime = join(home, "run-race");
  privateDir(runtime);
  const shared = {
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_LICENSE_LIMIT: "4",
    WOLFRAM_MCP_RESERVE_SEATS: "1",
    WOLFRAM_MCP_IDLE_MINUTES: "5",
    // Slow enough that the recoveries genuinely overlap.
    FAKE_CALL_DELAY_MS: "250",
  };
  const sessions = [];
  for (let i = 0; i < 3; i++) sessions.push(await connect(shared));

  const evaluate = (s, n) =>
    s.client
      .callTool({ name: "WolframLanguageEvaluator", arguments: { code: `${n}+${n}` } },
        undefined, { timeout: 30_000 })
      .then((r) => !r.isError, () => false);

  await Promise.all(sessions.map((s, i) => evaluate(s, i)));
  // Scoped to this section: brokers from earlier sections are still inside
  // their 60s empty grace and have nothing to do with this race.
  check("three sessions share one broker", ownBrokers(runtime).length === 1, `${ownBrokers(runtime).length}`);

  signalOwnBrokers("SIGKILL", runtime);
  await new Promise((r) => setTimeout(r, 300));

  // All three discover the corpse together. Each spawns a broker, and each
  // broker finds the dead socket the killed one left behind: without an
  // identity check every one of them removed that file and bound its own, so
  // three brokers ran, each deriving a full pool budget from one licence.
  const recovered = await Promise.all(sessions.map((s, i) => evaluate(s, i + 10)));
  check("every session recovers", recovered.every(Boolean), `${recovered.filter(Boolean).length}/3`);
  await new Promise((r) => setTimeout(r, 2000));
  const brokers = ownBrokers(runtime).length;
  check("and exactly one broker is left holding the licence", brokers === 1, `brokers: ${brokers}`);

  for (const s of sessions) await s.client.close();
  await new Promise((r) => setTimeout(r, 400));
}

// ---------------------------------------------------------------------------
// Cancelling a call has to reach the kernel. Nothing in this server used to
// carry it: the SDK handed the handler an AbortSignal and it was discarded, so
// pressing Escape abandoned the request here while the evaluation ran on. The
// next call then queued behind work nobody was waiting for.
for (const sharing of ["0", "1"]) {
  heading(`Cancellation reaches the kernel — ${sharing === "1" ? "shared" : "private"}`);
  {
    wipeCache();
    const runtime = join(home, `run-cancel-${sharing}`);
    privateDir(runtime);
    const methods = join(home, `methods-${sharing}.log`);
    const s = await connect({
      WOLFRAM_MCP_SHARE: sharing,
      XDG_RUNTIME_DIR: runtime,
      WOLFRAM_MCP_LICENSE_LIMIT: "4",
      WOLFRAM_MCP_IDLE_MINUTES: "5",
      FAKE_CALL_DELAY_MS: "4000",
      FAKE_METHOD_LOG: methods,
    });

    const controller = new AbortController();
    const abandoned = s.client
      .callTool({ name: "WolframLanguageEvaluator", arguments: { code: "forever" } },
        undefined, { timeout: 30_000, signal: controller.signal })
      .then(() => "resolved", () => "rejected");
    // Abort only once the kernel actually has the call — its tools/call is in
    // the method log — so there is work in flight to cancel. A fixed sleep here
    // raced dispatch: on the shared path the extra broker hop pushes the
    // tools/call past it, the abort lands before the kernel holds the work, and
    // no notifications/cancelled is forwarded — so the check below went red for
    // the race, not for the forwarding it exists to test. Green on a warm dev
    // machine and red in a slower container is exactly how a flaky CI is born.
    const dispatchBy = Date.now() + 10_000;
    while (Date.now() < dispatchBy) {
      if (existsSync(methods) && readFileSync(methods, "utf8").includes("tools/call")) break;
      await new Promise((r) => setTimeout(r, 20));
    }
    controller.abort();
    check("the cancelled call stops waiting", (await abandoned) === "rejected");

    // A kernel still working on the abandoned evaluation makes this take about
    // twice as long as it should: measured at 9877ms for a 5000ms call.
    const startedAt = Date.now();
    const next = await s.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
      undefined, { timeout: 30_000 });
    const elapsed = Date.now() - startedAt;
    check("the next call is not queued behind it", !next.isError && elapsed < 7000,
      `settled after ${elapsed}ms for a 4000ms evaluation`);
    // Stopping the kernel is what honours a cancel; notifications/cancelled
    // cannot, since a real kernel will not read it until the evaluation is
    // over. This used to assert the fake had read that notification, which on
    // the broker path raced the kill — red on Node 26 in CI, green locally —
    // and tested the premise the timeout work retired. A second initialize is
    // the kernel that answered the next call, after the first was stopped.
    const log = existsSync(methods) ? readFileSync(methods, "utf8").trim().split("\n") : [];
    check(
      "and the kernel holding it was stopped, so a fresh one answered",
      log.filter((method) => method === "initialize").length === 2,
      log.join(", ") || "(no log)",
    );
    await s.client.close();
    await new Promise((r) => setTimeout(r, 300));
  }
}

// ---------------------------------------------------------------------------
// A long evaluation used to show the caller nothing and then die at the call
// timeout, however busy the kernel had been: the progress token was never
// forwarded, and upstream progress had nowhere to go.
for (const sharing of ["0", "1"]) {
  heading(`Progress reaches the caller — ${sharing === "1" ? "shared" : "private"}`);
  {
    wipeCache();
    const runtime = join(home, `run-progress-${sharing}`);
    privateDir(runtime);
    const s = await connect({
      WOLFRAM_MCP_SHARE: sharing,
      XDG_RUNTIME_DIR: runtime,
      WOLFRAM_MCP_LICENSE_LIMIT: "4",
      WOLFRAM_MCP_IDLE_MINUTES: "5",
    });
    const seen = [];
    const result = await s.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
      undefined,
      { timeout: 30_000, onprogress: (p) => seen.push(p) },
    );
    check("the call still succeeds", !result.isError);
    check("progress from the kernel arrives", seen.length === 2, `notifications: ${seen.length}`);
    check(
      "and carries what the kernel said",
      seen[0]?.message === "step 1" && seen[1]?.total === 2,
      JSON.stringify(seen),
    );
    await s.client.close();
    await new Promise((r) => setTimeout(r, 300));
  }
}

// ---------------------------------------------------------------------------
heading("Regression — an unspawnable broker must not crash the server");
{
  // spawn() reports a missing binary asynchronously, on the next tick. With no
  // 'error' listener that is an uncaught exception rather than a fallback, and
  // it would take this suite down with it: the uncaughtException handler above
  // reaps and exits non-zero, so reaching the assertion at all is the check.
  const backend = await lib.BrokerBackend.open({
    address: join(home, "no-such-directory", "broker.sock"),
    flavour: lib.kernelFlavour({ MCP_SERVER_NAME: "WolframLanguage" }),
    spawnCommand: join(home, "definitely-not-a-binary"),
    spawnArgs: [],
    spawnEnv: {},
    log: () => {},
  });
  check("an unspawnable broker gives up rather than throwing", backend === null);
}

// ---------------------------------------------------------------------------
heading("Unit — when a broker may serve this session");
{
  // Stub brokers, because a socket cannot tell these cases apart: all of them
  // accept the connection, and only what comes back separates them.
  const serve = async (name, onFrame) => {
    const address = join(home, `${name}.sock`);
    const server = createServer((socket) => {
      socket.setEncoding("utf8");
      socket.on("data", (chunk) => {
        for (const line of chunk.split("\n").filter(Boolean)) {
          const reply = onFrame(JSON.parse(line));
          if (reply) socket.write(`${JSON.stringify(reply)}\n`);
        }
      });
      socket.on("error", () => socket.destroy());
    });
    await new Promise((resolve) => server.listen(address, resolve));
    return { address, server };
  };
  const ours = lib.kernelFlavour({ MCP_SERVER_NAME: "WolframLanguage" });
  const noted = [];
  const attach = (address) =>
    lib.BrokerBackend.open({
      address,
      flavour: ours,
      // Never reached: the socket is already listening, so open() attaches
      // rather than spawning.
      spawnCommand: join(home, "definitely-not-a-binary"),
      spawnArgs: [],
      spawnEnv: {},
      log: (m) => noted.push(m),
    });

  // The broker every developer has running the moment this ships: it refuses
  // ops it has never heard of. The refusal still proves the process is alive —
  // BROKER_PROTOCOL was deliberately not bumped, so meeting one is expected
  // rather than an edge case — but a broker that cannot say what its kernels
  // were started with has not given the one fact needed to share safely.
  const old = await serve("broker-old", (frame) => ({
    id: frame.id,
    ok: false,
    error: `unknown broker op: ${frame.op}`,
  }));
  const toOld = await attach(old.address);
  check(
    "a broker that cannot say what its kernels are is not shared with",
    toOld === null,
    "it is alive; that is not the same as interchangeable",
  );
  check(
    "and the reason carries the broker's own words rather than calling it dead",
    noted.some((m) => /will not serve/.test(m) && /unknown broker op/.test(m)),
    noted.join(" | ").slice(0, 100),
  );
  await toOld?.stop();
  old.server.close();

  // Alive and answering, but it will not take this session's environment. A
  // broker that cannot start the right kind of kernel must not be handed work:
  // this is the measured case, where one project's MCP_TOOL_OPTIONS ran
  // another's calls.
  const answering = (accept) => (frame) =>
    frame.op === "ping"
      ? { id: frame.id, ok: true }
      : frame.op === "hello"
        ? accept
          ? { id: frame.id, ok: true, result: { flavours: true, flavour: frame.params?.digest } }
          : { id: frame.id, ok: false, error: "will not take that environment" }
        : { id: frame.id, ok: false, error: `unexpected op ${frame.op}` };

  const refuses = await serve("broker-refuses", answering(false));
  check(
    "a broker that will not take this session's environment is not shared with",
    (await attach(refuses.address)) === null,
  );
  check(
    "and the reason names the environment it would not take",
    noted.some((m) => /will not serve/.test(m) && m.includes(ours.digest)),
    noted.filter((m) => /will not serve/.test(m)).join(" ").slice(0, 90),
  );
  refuses.server.close();

  // What the declaration is for: the values travel, not just the digest, because
  // the broker is what starts the kernel.
  let declared = null;
  const accepts = await serve("broker-accepts", (frame) => {
    if (frame.op === "hello") declared = frame.params;
    return answering(true)(frame);
  });
  const toAccepts = await attach(accepts.address);
  check("a broker that takes it is shared with", toAccepts !== null);
  check(
    "and was told the values, not only the digest",
    declared?.digest === ours.digest &&
      declared?.env?.MCP_SERVER_NAME === "WolframLanguage" &&
      Array.isArray(declared?.names) &&
      declared.names.includes("MCP_TOOL_OPTIONS"),
    JSON.stringify(declared ?? {}).slice(0, 90),
  );
  await toAccepts?.stop();
  accepts.server.close();

  // Accepts, never answers: a SIGSTOPped or wedged broker, without needing to
  // stop a real process to make one.
  const startedAt = Date.now();
  const deaf = await serve("broker-deaf", () => null);
  const toDeaf = await attach(deaf.address);
  const waited = Date.now() - startedAt;
  check(
    "a broker that accepts and says nothing is not shared with",
    toDeaf === null && waited >= 1500 && waited < 6000,
    `gave up after ${waited}ms`,
  );
  deaf.server.close();
}

// ---------------------------------------------------------------------------
heading("Regression — a kernel that timed out is not handed to the next caller");
{
  wipeCache();
  const runtime = join(home, "run-wedged-kernel");
  privateDir(runtime);
  const s = await connect({
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_LICENSE_LIMIT: "4",
    WOLFRAM_MCP_CALL_TIMEOUT_SECONDS: "2",
    WOLFRAM_MCP_IDLE_MINUTES: "5",
    // Accepts the call and never answers: the kernel is busy, not dead — and,
    // like a real one, deaf to anything else it is sent meanwhile.
    FAKE_CALL_DELAY_MS: "-1",
  });

  const before = startCount();
  const first = await s.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "forever" } },
    undefined, { timeout: 20_000 });
  check("a call against a stuck kernel times out", first.isError === true);

  const startedAt = Date.now();
  const second = await s.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "again" } },
    undefined, { timeout: 20_000 });
  const elapsed = Date.now() - startedAt;
  const started = startCount() - before;

  // The stuck kernel is still grinding on the abandoned evaluation and is not
  // reading its stdin, so reusing it makes the next caller wait out work it
  // cannot see and then fail for the same reason.
  check(
    "the next call gets a fresh kernel, not the stuck one",
    started === 2,
    `kernels started: ${started}`,
  );
  check(
    "and is not queued behind the abandoned evaluation",
    second.isError === true && elapsed < 6000,
    `settled after ${elapsed}ms against a 2000ms timeout`,
  );
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// The spec draws a line the proxy is careful about: a failure while *running* a
// tool is an isError result the model can act on, a failure to *find* one is an
// MCP error response. It decides by testing `err instanceof McpError` — and a
// socket carries strings, so the broker erased the distinction on the path that
// is the default. Measured: -32602 from the kernel arrived at the client as an
// isError result when shared, and as an MCP error when private, from the same
// kernel and the same call.
heading("An unknown tool is an MCP error on both paths, not a failed evaluation");
{
  const seen = {};
  for (const sharing of ["0", "1"]) {
    wipeCache();
    const runtime = join(home, `run-errclass-${sharing}`);
    privateDir(runtime);
    const s = await connect({
      WOLFRAM_MCP_SHARE: sharing,
      XDG_RUNTIME_DIR: runtime,
      WOLFRAM_MCP_LICENSE_LIMIT: "4",
      WOLFRAM_MCP_IDLE_MINUTES: "5",
      // Never instant: this has to be the shape of a real call holding a kernel,
      // not a reply that happens to arrive before anything can go wrong.
      FAKE_CALL_DELAY_MS: "200",
    });
    try {
      const result = await s.client.callTool(
        { name: "NoSuchTool", arguments: {} }, undefined, { timeout: 20_000 });
      seen[sharing] = { kind: "isError", text: result.content?.[0]?.text ?? "" };
    } catch (err) {
      seen[sharing] = { kind: "mcp-error", code: err.code, text: err.message };
    }
    await s.client.close();
    await new Promise((r) => setTimeout(r, 300));
  }

  check("a private kernel reports it as an MCP error", seen["0"].kind === "mcp-error", seen["0"].kind);
  check("and so does a shared one", seen["1"].kind === "mcp-error", seen["1"].kind);
  check(
    "with the code the kernel gave, not InternalError",
    seen["0"].code === -32602 && seen["1"].code === -32602,
    `private=${seen["0"].code} shared=${seen["1"].code}`,
  );
  check(
    "carrying the kernel's own words",
    /Unknown tool: NoSuchTool/.test(seen["1"].text ?? ""),
    JSON.stringify(seen["1"].text ?? "").slice(0, 80),
  );
  // The SDK prefixes "MCP error <code>: " when it constructs the error and again
  // when it sends one it was given, so a relayed error used to arrive doubled.
  check(
    "and saying it once, not twice",
    !/MCP error -32602: MCP error/.test(seen["0"].text ?? "") &&
      !/MCP error -32602: MCP error/.test(seen["1"].text ?? ""),
    JSON.stringify(seen["0"].text ?? "").slice(0, 80),
  );
}

// ---------------------------------------------------------------------------
// The measurement that shaped this: AgentTools' loop is While[True,
// processRequest[]] with tools/call dispatching evaluateTool inline, so a ping
// sent 500ms into a 20s evaluation was not answered until 22.8s. A busy kernel
// and a hung one are equally deaf, which means no timeout and no probe can tell
// a legitimate long call from a wedged one — and killing on the guess destroys
// the call and every evaluator session on that kernel. So the ceiling now
// answers the caller and leaves the kernel alone; the reply it later sends is
// the proof of life, and nothing has to know how long a tool ought to take.
for (const sharing of ["1", "0"]) {
  heading(`A call outliving the ceiling keeps its kernel — ${sharing === "1" ? "shared" : "private"}`);
  {
    wipeCache();
    const runtime = join(home, `run-outlive-${sharing}`);
    privateDir(runtime);
    const methods = join(home, `methods-outlive-${sharing}.log`);
    rmSync(methods, { force: true });
    const s = await connect({
      WOLFRAM_MCP_SHARE: sharing,
      XDG_RUNTIME_DIR: runtime,
      WOLFRAM_MCP_LICENSE_LIMIT: "4",
      WOLFRAM_MCP_IDLE_MINUTES: "5",
      WOLFRAM_MCP_CALL_TIMEOUT_SECONDS: "1",
      // Four times the ceiling, and it does answer: a legitimate long call, not
      // a wedged kernel. This is the case a timeout cannot distinguish, so the
      // check is that the server stops trying to.
      FAKE_CALL_DELAY_MS: "4000",
      FAKE_DELAY_FIRST_ONLY: "1",
      FAKE_METHOD_LOG: methods,
    });

    const before = startCount();
    const started = Date.now();
    const abandoned = await s.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "slow" } },
      undefined, { timeout: 20_000 });
    const gaveUp = Date.now() - started;
    check(
      "the caller is answered at the ceiling, not left hanging",
      abandoned.isError === true && gaveUp < 2500,
      `${gaveUp}ms against a 1000ms ceiling`,
    );

    // Until the abandoned call has landed on its own. A fixed 4200ms sleep
    // here counted from the ceiling's answer, but the reply is due 4000ms
    // after dispatch, so a loaded machine ate the margin: the next call found
    // the work unfinished, reclaimed the kernel, and three checks went red one
    // run in three. Wait for the fake's reply, then — where the server says
    // so — for the server to have taken it in.
    const landedBy = Date.now() + 15_000;
    const replied = () =>
      existsSync(methods) && readFileSync(methods, "utf8").includes("(replied tools/call)");
    const settled = () => sharing === "1" || /abandoned call finished/.test(s.stderr());
    while (Date.now() < landedBy && !(replied() && settled())) {
      await new Promise((r) => setTimeout(r, 25));
    }
    // The broker says nothing to the proxy when the reply lands; give its
    // reader the turn it needs after the fake's write.
    if (sharing === "1") await new Promise((r) => setTimeout(r, 200));
    const after = await s.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "next" } },
      undefined, { timeout: 20_000 });
    const kernels = startCount() - before;
    check("the next call is served", answeredByFake(after));
    check(
      "by the same kernel, so its evaluator sessions survived the timeout",
      kernels === 1,
      `kernels started: ${kernels}`,
    );
    if (sharing === "0") {
      check(
        "and the abandoned call is recorded as having finished",
        /abandoned call finished/.test(s.stderr()),
        s.stderr().split("\n").filter((l) => /abandon/.test(l)).join(" | ").slice(0, 100),
      );
    }
    await s.client.close();
    await new Promise((r) => setTimeout(r, 300));
  }
}

// ---------------------------------------------------------------------------
// The flip side, and why no timer is needed to bound an abandoned call: a kernel
// is taken back exactly when something else needs it. A private session has one
// kernel, so the next call is that moment.
heading("An abandoned call is reclaimed the moment the seat is needed");
{
  wipeCache();
  const s = await connect({
    WOLFRAM_MCP_SHARE: "0",
    WOLFRAM_MCP_CALL_TIMEOUT_SECONDS: "1",
    WOLFRAM_MCP_IDLE_MINUTES: "5",
    // Never answers at all: the kernel really is gone, not merely slow.
    FAKE_CALL_DELAY_MS: "-1",
  });

  const before = startCount();
  const first = await s.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "forever" } },
    undefined, { timeout: 20_000 });
  check("the first call gives up at the ceiling", first.isError === true);
  check(
    "and the kernel is left alone rather than killed on a guess",
    startCount() - before === 1 && !/stopping it/.test(s.stderr()),
    `kernels=${startCount() - before}`,
  );

  const started = Date.now();
  const second = await s.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "again" } },
    undefined, { timeout: 20_000 });
  const elapsed = Date.now() - started;
  check(
    "the next call reclaims the seat instead of queueing behind work nobody wants",
    startCount() - before === 2 && elapsed < 4000,
    `kernels=${startCount() - before}, settled after ${elapsed}ms`,
  );
  check(
    "and says so, naming the reason",
    /abandoned call has not finished; stopping it/.test(s.stderr()),
    s.stderr().split("\n").filter((l) => /abandon/.test(l)).join(" | ").slice(0, 100),
  );
  check("the second call is answered, not left hanging", second.isError === true);
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// The other half of the wedged-kernel story, and the one that was wrong for
// longer. Retiring on sight meant *every* rejection killed the kernel, so a
// model guessing a tool name wrong destroyed the evaluator sessions of every
// other caller on that kernel — the definitions, line numbers and history behind
// the tool's `session` argument. Measured before the health probe existed: one
// NoSuchTool call took the kernel count from 1 to 2, where the identical run
// without it stayed at 1.
for (const sharing of ["1", "0"]) {
  heading(`A failed call must not destroy a healthy kernel — ${sharing === "1" ? "shared" : "private"}`);
  {
    wipeCache();
    const runtime = join(home, `run-healthy-${sharing}`);
    privateDir(runtime);
    const s = await connect({
      WOLFRAM_MCP_SHARE: sharing,
      XDG_RUNTIME_DIR: runtime,
      WOLFRAM_MCP_LICENSE_LIMIT: "4",
      WOLFRAM_MCP_IDLE_MINUTES: "5",
      // Not instant: against a kernel that answers in the same tick, a retired
      // slot and a reused one are indistinguishable by timing, and the pool only
      // shows its hand once a call actually holds a slot.
      FAKE_CALL_DELAY_MS: "200",
    });

    const before = startCount();
    const warm = await s.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
      undefined, { timeout: 20_000 });
    check(
      "a kernel is up and answering",
      answeredByFake(warm),
      answeredByFake(warm) ? "" : "answered by something other than the fake kernel",
    );

    // What a model does several times a session: guess a name the kernel does
    // not have. The kernel answers -32602 immediately and is entirely healthy.
    //
    // How that reaches the client differs by path, which is its own finding: the
    // private path throws an MCP error as the spec asks, while the broker
    // flattens the error to a string and the proxy can no longer tell it from a
    // failed evaluation. Recorded rather than asserted here — this section is
    // about the kernel surviving, and a check that demanded one shape would fail
    // for the wrong reason.
    let outcome;
    try {
      const typo = await s.client.callTool(
        { name: "NoSuchTool", arguments: {} }, undefined, { timeout: 20_000 });
      outcome = typo.isError === true ? "isError" : "succeeded";
    } catch {
      outcome = "mcp-error";
    }
    check("an unknown tool name does not succeed", outcome !== "succeeded", outcome);

    // Long enough for a health probe to finish, but well inside its 2s ceiling,
    // so a kernel that was going to be stopped has been stopped by now.
    await new Promise((r) => setTimeout(r, 600));
    const after = await s.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "2+2" } },
      undefined, { timeout: 20_000 });
    const started = startCount() - before;
    check("the next call still works", answeredByFake(after));
    check(
      "and it is the same kernel, so evaluator sessions survive",
      started === 1,
      `kernels started: ${started}`,
    );
    if (sharing === "0") {
      // Only the private path can be asserted from the proxy's own stderr: the
      // broker is spawned stdio:"ignore", so its pool logs nothing we can read.
      check(
        "the kernel is recorded as alive because it answered, not because it was probed",
        /so it is alive and idle; keeping it/.test(s.stderr()),
        s.stderr().split("\n").filter((l) => /alive and idle/.test(l)).join(" | ").slice(0, 90),
      );
    }
    await s.client.close();
    await new Promise((r) => setTimeout(r, 300));
  }
}

// ---------------------------------------------------------------------------
heading("wolfram_status says whether this session's kernels are shared");
{
  // It printed only the setting, "sharing on", so a Claude Desktop session could
  // not tell from it whether two sessions shared a kernel; doctor could, by
  // asking the broker. Asked of a running broker only — never starting one,
  // since status must start nothing.
  wipeCache();
  const runtime = privateDir(join(home, "run-status-sharing"));
  const s = await connect({ WOLFRAM_MCP_SHARE: "1", WOLFRAM_MCP_INSPECT: "1", XDG_RUNTIME_DIR: runtime });
  const statusText = async () =>
    ((await s.client.callTool({ name: "wolfram_status", arguments: {} })).content?.[0]?.text ?? "")
      .split("\n")
      .find((line) => line.startsWith("sharing")) ?? "";
  const before = await statusText();
  const brokersBefore = ownBrokers(runtime).length;
  await s.client.callTool({ name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined, { timeout: 30_000 });
  const after = await statusText();
  check(
    "before any call it says no broker runs, and starts none",
    /no broker running/.test(before) && brokersBefore === 0,
    `${before.trim()}; ${brokersBefore} broker(s)`,
  );
  check(
    "after a call it names the broker and what it runs",
    /broker pid \d+/.test(after) && /1 kernel\(s\) running/.test(after),
    after.trim(),
  );
  // Read while the broker runs: it removes its socket as it exits.
  const sock = readdirSync(runtime).find((f) => f.endsWith(".sock"));
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
  signalOwnBrokers("SIGTERM", runtime);

  // A broker that answers, but late. The status line raced the attach against
  // one second and dropped the loser without stopping it: the attach finished
  // anyway, its connection was never closed, and the broker counted a session
  // that was not there — so it never reached its idle exit while this proxy
  // lived. It also said "no broker running yet", which was false. The stub
  // sits at the real broker's path, the one the broker above just bound.
  for (let i = 0; i < 50 && ownBrokers(runtime).length > 0; i++) {
    await new Promise((r) => setTimeout(r, 100));
  }
  if (sock) rmSync(join(runtime, sock), { force: true });
  const open = new Set();
  const slow = createServer((socket) => {
    open.add(socket);
    socket.on("close", () => open.delete(socket));
    socket.on("error", () => socket.destroy());
    socket.setEncoding("utf8");
    socket.on("data", (chunk) => {
      for (const line of chunk.split("\n").filter(Boolean)) {
        const frame = JSON.parse(line);
        const reply =
          frame.op === "hello"
            ? { id: frame.id, ok: true, result: { flavours: true, flavour: frame.params?.digest } }
            : frame.op === "status"
              ? { id: frame.id, ok: true, result: { kernels: 0, busy: 0, budget: 1, licence: null, connections: 1, pid: 1 } }
              : { id: frame.id, ok: true };
        setTimeout(() => socket.writable && socket.write(`${JSON.stringify(reply)}\n`),
          frame.op === "ping" ? 1_500 : 0);
      }
    });
  });
  await new Promise((resolve) => slow.listen(join(runtime, sock ?? "missing.sock"), resolve));
  const late = await connect({ WOLFRAM_MCP_SHARE: "1", WOLFRAM_MCP_INSPECT: "1", XDG_RUNTIME_DIR: runtime });
  const lateLine =
    ((await late.client.callTool({ name: "wolfram_status", arguments: {} })).content?.[0]?.text ?? "")
      .split("\n")
      .find((line) => line.startsWith("sharing")) ?? "";
  await new Promise((r) => setTimeout(r, 2_500));
  check(
    "a broker too slow to answer is not reported as absent",
    !!sock && !/no broker running/.test(lateLine),
    sock ? lateLine.trim() : "the broker left no socket to stand in for",
  );
  check(
    "and the connection status opened to it is closed, not left attached",
    open.size === 0,
    `${open.size} connection(s) still open`,
  );
  await late.client.close();
  slow.close();

  // A session whose broker could not be used runs on a private kernel, and the
  // status line said "no broker running yet; the first tool call starts one" —
  // after that very call had started a private kernel instead.
  const exposedRun = join(home, "run-status-exposed");
  mkdirSync(exposedRun, { recursive: true });
  chmodSync(exposedRun, 0o777);
  const alone = await connect({ WOLFRAM_MCP_SHARE: "1", WOLFRAM_MCP_RUNTIME_DIR: exposedRun });
  await alone.client.callTool({ name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined, { timeout: 30_000 });
  const aloneLine =
    ((await alone.client.callTool({ name: "wolfram_status", arguments: {} })).content?.[0]?.text ?? "")
      .split("\n")
      .find((line) => line.startsWith("sharing")) ?? "";
  check(
    "a session that fell back to a private kernel says so",
    /private kernel/.test(aloneLine),
    aloneLine.trim(),
  );
  await alone.client.close();
}

// ---------------------------------------------------------------------------
heading("A cold broker serves its first session itself");
{
  // Cold, a broker once ran a licence probe kernel for up to two minutes while
  // the attaching proxy gave up after five seconds, so the first session of a
  // cold start fell back to a private kernel and spent a second seat. There is
  // no probe now (plugin plan D20); what still matters is the outcome.
  wipeCache();
  const runtime = join(home, "run-coldbroker");
  privateDir(runtime);
  const s = await connect({
    WOLFRAM_MCP_SHARE: "1",
    WOLFRAM_MCP_INSPECT: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_IDLE_MINUTES: "5",
  });
  const result = await s.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined,
    { timeout: 60_000 },
  );
  check("the call succeeds", !result.isError, (result.content?.[0]?.text ?? "").slice(0, 50));
  check(
    "and it went through the broker, not a private kernel",
    s.stderr().includes("attached to the broker") && !s.stderr().includes("did not come up in time"),
    s.stderr().includes("did not come up in time") ? "fell back to a private kernel" : "attached",
  );
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
heading("Regression — a wedged broker cannot outlive the call timeout");
{
  wipeCache();
  const runtime = join(home, "run-wedged");
  privateDir(runtime);
  const s = await connect({
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_LICENSE_LIMIT: "4",
    WOLFRAM_MCP_IDLE_MINUTES: "5",
    WOLFRAM_MCP_CALL_TIMEOUT_SECONDS: "2",
  });
  const warm = await s.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } }, undefined, { timeout: 30_000 });
  check("the broker answers before being frozen", !warm.isError && answeredByFake(warm));

  // SIGSTOP, not SIGKILL: the socket stays open and the process stops running,
  // which is what a broker blocked on a licence probe or a wedged kernel looks
  // like. The timeout the server advertises has to be enforced on this side.
  const frozen = signalOwnBrokers("SIGSTOP");
  check("a broker was running to freeze", frozen > 0, `froze ${frozen}`);

  const startedAt = Date.now();
  let settled;
  try {
    const r = await s.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "3+3" } }, undefined, { timeout: 15_000 });
    settled = r.isError ? "isError" : "ok";
  } catch {
    settled = "threw";
  }
  const elapsed = Date.now() - startedAt;
  check(
    "a call against a frozen broker fails near its own timeout",
    settled === "isError" && elapsed < 8000,
    `${settled} after ${elapsed}ms, timeout was 2000ms`,
  );
  signalOwnBrokers("SIGKILL");
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
heading("Regression — a frozen broker is not mistaken for a live one at attach");
{
  wipeCache();
  const runtime = join(home, "run-deaf-attach");
  privateDir(runtime);
  // A call ceiling far above the ping deadline, so the two outcomes are told
  // apart by the clock as well as by the result: attaching to a frozen broker
  // used to be discovered by the first call, which paid this in full.
  const shared = {
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_LICENSE_LIMIT: "4",
    WOLFRAM_MCP_IDLE_MINUTES: "5",
    WOLFRAM_MCP_CALL_TIMEOUT_SECONDS: "10",
  };

  const first = await connect(shared);
  const warm = await first.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } }, undefined, { timeout: 30_000 });
  check("a broker is serving before it is frozen", !warm.isError && answeredByFake(warm));

  // The OS completes a connection to a stopped process: its listen backlog is
  // the kernel's, not the broker's. So the socket still accepts, and accepting
  // was the whole of what "attached to the broker" ever proved.
  const frozen = signalOwnBrokers("SIGSTOP", runtime);
  check("a broker was running to freeze", frozen > 0, `froze ${frozen}`);

  const startedAt = Date.now();
  const second = await connect(shared);
  const call = await second.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "2+2" } }, undefined, { timeout: 30_000 });
  const elapsed = Date.now() - startedAt;
  const log = second.stderr();
  check(
    "a session that meets a frozen broker answers anyway, without paying the call ceiling",
    !call.isError && answeredByFake(call) && elapsed < 8000,
    `${call.isError ? "isError" : "ok"} after ${elapsed}ms, ceiling was 10000ms`,
  );
  check(
    "and says it fell back instead of claiming it attached",
    /accepted a connection but did not answer/.test(log) && !/attached to the broker/.test(log),
    log.split("\n").filter((l) => /broker/.test(l)).join(" | ").slice(0, 110),
  );

  signalOwnBrokers("SIGKILL", runtime);
  await first.client.close();
  await second.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
heading("Regression — a project on another server name must not cost this one its cache");
{
  wipeCache();
  const capabilities = join(home, "cache", "wolfram-mcp-server", "capabilities");
  const entryCount = () => {
    try {
      return readdirSync(capabilities).length;
    } catch {
      return 0;
    }
  };

  // Warm one name, then launch it again: no kernel, list from cache. This is the
  // control — it passed before the fix too, which is exactly why the eviction
  // below went unnoticed.
  const warm = await connect();
  await warm.client.listTools();
  // The entry is written by the refresh a kernel start triggers, not by the call.
  await new Promise((r) => setTimeout(r, 500));
  await warm.client.close();

  const beforeSame = startCount();
  const again = await connect();
  await again.client.listTools();
  check(
    "a second launch on the same name serves the cache",
    startCount() === beforeSame && again.stderr().includes("served from cache"),
    `kernels started: ${startCount() - beforeSame}`,
  );
  await again.client.close();

  // Now a second project, on a different name, in between. One file for the
  // machine meant this evicted the entry above and every later launch of either
  // name was cold — a kernel start, and so a licence seat, at every launch.
  const neighbour = await connect({ MCP_SERVER_NAME: "Wolfram" });
  await neighbour.client.listTools();
  await new Promise((r) => setTimeout(r, 500));
  await neighbour.client.close();

  const beforeAfterNeighbour = startCount();
  const third = await connect();
  await third.client.listTools();
  check(
    "and still serves it once a project on another name has run",
    startCount() === beforeAfterNeighbour && third.stderr().includes("served from cache"),
    `kernels started: ${startCount() - beforeAfterNeighbour}`,
  );
  await third.client.close();

  check(
    "each server name keeps its own entry on disk",
    entryCount() === 2,
    `${entryCount()} entr(y|ies) under capabilities/`,
  );
}

// ---------------------------------------------------------------------------
heading("Two projects, one broker, a kernel each — and never each other's");
{
  wipeCache();
  const runtime = join(home, "run-flavour");
  privateDir(runtime);
  const brokerLog = join(home, "flavour-broker.log");
  const shared = {
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_LICENSE_LIMIT: "4",
    WOLFRAM_MCP_IDLE_MINUTES: "5",
    WOLFRAM_MCP_LOG: brokerLog,
  };
  const slow = '{"WolframLanguageEvaluator":{"TimeConstraint":600}}';
  const fast = '{"WolframLanguageEvaluator":{"TimeConstraint":10}}';
  const call = (s) =>
    s.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } }, undefined, { timeout: 30_000 });

  // MCP_TOOL_OPTIONS is read by the paclet at kernel startup, so it cannot
  // travel with a call: two projects configured differently need two kernels.
  // Measured before any of this: the second project's calls ran with the first's
  // 600.
  const beforeA = startCount();
  const a = await connect({ ...shared, MCP_TOOL_OPTIONS: slow });
  const fromA = (await call(a))?.content?.[0]?.text ?? "";
  check("the first project gets its own tool options", fromA.includes('"TimeConstraint":600'), fromA.slice(0, 60));
  check("having shared the broker", a.stderr().includes("attached to the broker"));

  const beforeB = startCount();
  const b = await connect({ ...shared, MCP_TOOL_OPTIONS: fast });
  const fromB = (await call(b))?.content?.[0]?.text ?? "";
  check(
    "the second gets its own, not the first's",
    fromB.includes('"TimeConstraint":10') && !fromB.includes('"TimeConstraint":600'),
    fromB.slice(0, 60),
  );
  check(
    "and shares the same broker rather than falling back to a private kernel",
    b.stderr().includes("attached to the broker") && !/private kernel/.test(b.stderr()),
    b.stderr().split("\n").filter((l) => /broker|private/.test(l)).join(" | ").slice(0, 95),
  );
  check(
    "which cost one more kernel, because that is what differing settings cost",
    startCount() - beforeB === 1,
    `kernels started: ${startCount() - beforeB}`,
  );

  // The point of keying rather than refusing: a third project configured like
  // the first is served by the kernel that already exists.
  const beforeC = startCount();
  const c = await connect({ ...shared, MCP_TOOL_OPTIONS: slow });
  const fromC = (await call(c))?.content?.[0]?.text ?? "";
  check(
    "a third project matching the first reuses its kernel, starting none",
    startCount() - beforeC === 0 && fromC.includes('"TimeConstraint":600'),
    `kernels started: ${startCount() - beforeC}`,
  );
  check("and two kernels served three projects", startCount() - beforeA === 2, `total ${startCount() - beforeA}`);

  signalOwnBrokers("SIGKILL", runtime);
  await a.client.close();
  await b.client.close();
  await c.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
heading("One seat, two environments — the pool makes room instead of overrunning");
{
  wipeCache();
  const runtime = join(home, "run-swap");
  privateDir(runtime);
  const brokerLog = join(home, "swap-broker.log");
  // Licence 2 less a reserved seat: a budget of exactly one kernel. Two
  // environments cannot both have one, and the seat is what may not be
  // overrun — so something has to be retired to make room.
  const shared = {
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_LICENSE_LIMIT: "2",
    WOLFRAM_MCP_RESERVE_SEATS: "1",
    WOLFRAM_MCP_IDLE_MINUTES: "5",
    WOLFRAM_MCP_LOG: brokerLog,
  };
  const call = (s) =>
    s.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } }, undefined, { timeout: 30_000 });

  const a = await connect({ ...shared, MCP_TOOL_OPTIONS: '{"WolframLanguageEvaluator":{"TimeConstraint":600}}' });
  const b = await connect({ ...shared, MCP_TOOL_OPTIONS: '{"WolframLanguageEvaluator":{"TimeConstraint":10}}' });

  const first = (await call(a))?.content?.[0]?.text ?? "";
  const second = (await call(b))?.content?.[0]?.text ?? "";
  const third = (await call(a))?.content?.[0]?.text ?? "";
  check("the first environment is served correctly", first.includes('"TimeConstraint":600'), first.slice(0, 55));
  check(
    "the second takes the seat and is served correctly too",
    second.includes('"TimeConstraint":10') && !second.includes('"TimeConstraint":600'),
    second.slice(0, 55),
  );
  check(
    "and the first gets it back, still under its own settings",
    third.includes('"TimeConstraint":600') && !third.includes('"TimeConstraint":10'),
    third.slice(0, 55),
  );

  const brokerSaid = existsSync(brokerLog) ? readFileSync(brokerLog, "utf8") : "";
  check(
    "the broker says it retired a kernel to make room, rather than exceeding the budget",
    /retiring an idle kernel for .* to make room/.test(brokerSaid),
    brokerSaid.split("\n").filter((l) => /make room|pool grew/.test(l)).slice(-2).join(" | ").slice(0, 100),
  );
  check(
    "and never grew past the one seat it was allowed",
    !/pool grew to [2-9] kernel/.test(brokerSaid),
    (brokerSaid.match(/pool grew to \d+ kernel/g) ?? []).join(", ").slice(0, 70),
  );

  signalOwnBrokers("SIGKILL", runtime);
  await a.client.close();
  await b.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
heading("Regression — two server names share one broker, and one licence budget");
{
  wipeCache();
  const runtime = join(home, "run-two-names");
  privateDir(runtime);
  const brokerLog = join(home, "two-names.log");
  const shared = {
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_LICENSE_LIMIT: "4",
    WOLFRAM_MCP_IDLE_MINUTES: "5",
    WOLFRAM_MCP_LOG: brokerLog,
  };
  const call = (s) =>
    s.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } }, undefined, { timeout: 30_000 });

  // The socket used to key on the server name, so these two ran separate
  // brokers, and each derived a full kernel budget from the same licence: the
  // reserved seat reserved nothing. The name lives in the flavour now, so the
  // pool keeps their kernels apart while the budget stays single.
  const language = await connect({ ...shared, MCP_SERVER_NAME: "WolframLanguage" });
  const alpha = await connect({ ...shared, MCP_SERVER_NAME: "WolframAlpha" });

  const fromLanguage = (await call(language))?.content?.[0]?.text ?? "";
  const fromAlpha = (await call(alpha))?.content?.[0]?.text ?? "";
  check(
    "each session's kernel is started for its own server",
    /server=WolframLanguage\b/.test(fromLanguage) && /server=WolframAlpha\b/.test(fromAlpha),
    `${fromLanguage.slice(9, 45)} | ${fromAlpha.slice(9, 45)}`,
  );
  check(
    "and both attached rather than falling back",
    language.stderr().includes("attached to the broker") &&
      alpha.stderr().includes("attached to the broker"),
  );
  check(
    "to the same socket",
    ownBrokers(runtime).length === 1,
    `${ownBrokers(runtime).length} broker(s) running`,
  );

  // One budget, stated by the one broker that owns it.
  const said = existsSync(brokerLog) ? readFileSync(brokerLog, "utf8") : "";
  const budgets = [...said.matchAll(/pool budget (\d+) kernel/g)].map(([, n]) => n);
  check(
    "and one kernel budget covers both, rather than one each",
    budgets.length === 1,
    `budget lines: ${budgets.join(", ") || "none"}`,
  );

  signalOwnBrokers("SIGKILL", runtime);
  await language.client.close();
  await alpha.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
heading("A kernel is told its own environment, and nobody else's");
{
  wipeCache();
  const runtime = join(home, "run-scope");
  privateDir(runtime);
  const shared = {
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_LICENSE_LIMIT: "4",
    WOLFRAM_MCP_IDLE_MINUTES: "5",
  };

  // FAKE_MODE is not a variable this server knows, which is the point: declaring
  // it through WOLFRAM_MCP_KERNEL_ENV is how a user says their own server reads
  // it. It also changes the fake kernel's tool list, so the two flavours are
  // told apart by something observable rather than by a digest.
  const declaring = await connect({
    ...shared,
    WOLFRAM_MCP_KERNEL_ENV: "FAKE_MODE",
    FAKE_MODE: "extra-tool",
  });
  const withExtra = (await declaring.client.listTools()).tools.map((t) => t.name);

  // This session declares nothing and sets nothing, so it must not be handed
  // FAKE_MODE from the broker — whose environment is the session above's.
  const plain = await connect(shared);
  const withoutExtra = (await plain.client.listTools()).tools.map((t) => t.name);

  check(
    "the project that declared the variable gets a kernel that has it",
    withExtra.length > withoutExtra.length,
    `${withExtra.length} tools vs ${withoutExtra.length}`,
  );
  // Named exactly, not matched loosely: with a pattern for "Extra" this passed
  // while the leak was happening, because the tool FAKE_MODE adds is called
  // WolframAlpha.
  check(
    "and the project that did not is not given it by the broker",
    !withoutExtra.includes("WolframAlpha"),
    withoutExtra.join(", ").slice(0, 80),
  );

  signalOwnBrokers("SIGKILL", runtime);
  await declaring.client.close();
  await plain.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
heading("A server name we do not recognise belongs to the user, not to a typo");
{
  wipeCache();
  // The paclet looks in the user's own Servers directory *before* its built-ins,
  // and resolves `Publisher/Server` from any paclet declaring an AgentTools
  // extension. A name outside our table is therefore ordinary, and substituting
  // the default for it handed the caller a different server's tools in silence.
  const own = await connect({ MCP_SERVER_NAME: "MyProject" });
  const mine = await own.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } }, undefined, { timeout: 30_000 });
  const text = mine?.content?.[0]?.text ?? "";
  check(
    "a user-defined server name reaches the kernel unchanged",
    /server=MyProject/.test(text),
    text.slice(0, 70),
  );
  await own.client.close();

  // A name with spaces, because that is what people actually call a server they
  // built — "My Prime Finder" — and it passes through configuration, the broker
  // address digest and the kernel's own environment untouched.
  const spaced = await connect({ MCP_SERVER_NAME: "My Prime Finder" });
  const spacedText =
    (await spaced.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } }, undefined, { timeout: 30_000 }))
      ?.content?.[0]?.text ?? "";
  check(
    "a server name with spaces reaches the kernel intact",
    /server=My Prime Finder\b/.test(spacedText),
    spacedText.slice(0, 70),
  );
  await spaced.client.close();

  // And when a name really is wrong, the kernel says so in its first second. It
  // neither exits nor speaks MCP, so until that line was watched for, the only
  // thing that ended the wait was the start timeout — set high here on purpose,
  // so the clock tells the two apart.
  const startedAt = Date.now();
  const bad = await connect({
    MCP_SERVER_NAME: "Wolframm",
    FAKE_MODE: "no-such-server",
    WOLFRAM_MCP_START_TIMEOUT_SECONDS: "20",
  });
  const failed = await bad.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } }, undefined, { timeout: 30_000 });
  const elapsed = Date.now() - startedAt;
  const reason = failed?.content?.[0]?.text ?? "";
  check(
    "a name the paclet cannot resolve fails in seconds, not at the start timeout",
    failed.isError === true && elapsed < 8000,
    `${failed.isError ? "isError" : "ok"} after ${elapsed}ms, timeout was 20000ms`,
  );
  check(
    "and the failure repeats the kernel's own words, naming the name it was given",
    /No MCPServerObject found for name/.test(reason) && /Wolframm/.test(reason),
    reason.replace(/\s+/g, " ").slice(0, 95),
  );
  await bad.client.close();
}

// ---------------------------------------------------------------------------
heading("Findings the August audit recorded and nothing tracked");
{
  // S7 — a cursor is one kernel's paging state, and the pool hands out whichever
  // kernel is free, so page 2 could be asked of a kernel that never issued page
  // 1. Both backends drain inside the hold they already have and answer complete
  // lists; nothing outside them ever sees a cursor.
  wipeCache();
  const paged = await connect({ FAKE_MODE: "paged-tools" });
  const listed = await paged.client.listTools();
  check(
    "a paginated upstream list is answered whole",
    listed.tools.some((t) => t.name === "PagedTwo") &&
      listed.tools.some((t) => t.name === "PagedThree"),
    listed.tools.map((t) => t.name).join(", "),
  );
  check(
    "and no cursor is handed out, so no client can ask for page two",
    listed.nextCursor === undefined,
    `nextCursor=${String(listed.nextCursor)}`,
  );
  await paged.client.close();

  // S9 — the last thing a dying kernel says. It writes its reason with no
  // trailing newline and exits, which is what a licence refusal looks like, and
  // a line was only ever recorded when a newline arrived.
  wipeCache();
  const dying = await connect({ FAKE_MODE: "dying-word", WOLFRAM_MCP_START_TIMEOUT_SECONDS: "20" });
  const failed = await dying.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } }, undefined, { timeout: 30_000 });
  const said = failed?.content?.[0]?.text ?? "";
  check(
    "a kernel that dies mid-line still has its last words reported",
    /all 2 seats in use/.test(said),
    said.replace(/\s+/g, " ").slice(0, 95),
  );
  await dying.client.close();

  // S8 — a ceiling of 0 means "no ceiling" on a private kernel, because
  // #awaitWithin returns the work untouched when deadlineMs <= 0. A falsy test
  // dropped it from the broker frame while `0 ?? DEFAULT` kept it here, so the
  // same configuration meant "wait as long as it takes" privately and "give up
  // after two seconds" when shared. The delay is what makes this fail: with an
  // instant kernel both paths look identical.
  wipeCache();
  const runtime = join(home, "run-zero-timeout");
  privateDir(runtime);
  const unlimited = await connect({
    WOLFRAM_MCP_SHARE: "1",
    XDG_RUNTIME_DIR: runtime,
    WOLFRAM_MCP_LICENSE_LIMIT: "4",
    WOLFRAM_MCP_IDLE_MINUTES: "5",
    WOLFRAM_MCP_CALL_TIMEOUT_SECONDS: "0",
    FAKE_CALL_DELAY_MS: "3000",
  });
  const startedAt = Date.now();
  const slow = await unlimited.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } }, undefined, { timeout: 30_000 });
  const elapsed = Date.now() - startedAt;
  check(
    "a call ceiling of zero waits on the shared path, as it does on a private kernel",
    slow.isError !== true && answeredByFake(slow) && elapsed > 2500,
    `${slow.isError ? "isError" : "ok"} after ${elapsed}ms`,
  );
  signalOwnBrokers("SIGKILL", runtime);
  await unlimited.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// Documentation drift, as a check rather than a hope.
//
// Every figure and inventory in this repo's prose has been stale at least once,
// and the environment inventory was complete right up until a variable was
// added without it. Prose cannot be trusted to stay true; this can.
// The spec draws a line between a tool that failed and a request that was
// wrong, and it exists so a model can tell them apart:
//
//   "...should be reported as a tool result object, with isError set to true,
//    not as an MCP protocol-level error response. Otherwise, the LLM would not
//    be able to see that an error occurred and self-correct. However, any
//    errors in finding the tool ... should be reported as an MCP error
//    response."
heading("Conformance — an upstream tool-list change is noticed and passed on");
{
  wipeCache();
  const s = await connect({ WOLFRAM_MCP_SHARE: "0", FAKE_ANNOUNCE_TOOL: "1" });
  let announced = 0;
  s.client.setNotificationHandler(lib.ToolListChangedNotificationSchema, async () => {
    announced += 1;
  });

  const before = await s.client.listTools();
  check("the session starts with the original list", upstreamTools(before.tools).length === 1);

  // Starting a kernel makes the change visible: the kernel gains a tool and says
  // so. Nothing subscribed to that, so the only thing that ever noticed an
  // upstream change was the *next* kernel start.
  await s.client.callTool({ name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined, { timeout: 20_000 });
  await new Promise((r) => setTimeout(r, 900));

  const after = await s.client.listTools();
  check("the new tool is served without restarting anything",
    upstreamTools(after.tools).length === 2,
    after.tools.map((t) => t.name).join(", "));
  check("and the client was told the list changed", announced > 0, `notifications: ${announced}`);
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
heading("Conformance — nothing is advertised that cannot be served");
{
  wipeCache();
  // Cold: no kernel has ever reported prompts, so they are not offered. The
  // alternatives were advertising them and answering -32601, or starting a
  // kernel at launch purely to enumerate them.
  {
    const s = await connect({ WOLFRAM_MCP_SHARE: "0" });
    const caps = s.client.getServerCapabilities();
    check("a cold session offers tools only", caps?.prompts === undefined, JSON.stringify(caps));
    await s.client.callTool({ name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
      undefined, { timeout: 20_000 });
    await new Promise((r) => setTimeout(r, 700));
    await s.client.close();
    await new Promise((r) => setTimeout(r, 300));
  }
  // Warm: a kernel has reported prompts, so they may be advertised — and have
  // to actually work.
  {
    const s = await connect({ WOLFRAM_MCP_SHARE: "0" });
    const caps = s.client.getServerCapabilities();
    check("a warm session offers what the kernel reported", caps?.prompts !== undefined,
      JSON.stringify(caps));
    const { prompts } = await s.client.listPrompts();
    check("and prompts/list answers it", prompts.length === 1, `prompts: ${prompts.length}`);
    await s.client.close();
    await new Promise((r) => setTimeout(r, 300));
  }
}

// ---------------------------------------------------------------------------
// Naming an installation is a decision. Each of these used to fall through to
// whatever else was on the machine, so the kernel that ran was not the one that
// was asked for — silently, and in one case followed by a 120s hang.
heading("A kernel on PATH is discoverable on its own");
{
  // wolframscript is a separate application: present without a kernel, and
  // absent when a kernel is on PATH. The rewrite that added the wolframscript
  // locator dropped these lookups, which made a container holding only the
  // kernel undiscoverable. An unreachable floor makes the platform scan miss,
  // and the stub's path reports a version above it.
  const dir = join(home, "path-kernel-10000.0.0");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "wolfram"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });

  const saved = process.env.PATH;
  process.env.PATH = `${dir}:/usr/bin:/bin`;
  let found;
  try {
    found = lib.locateKernel({ minVersion: "9999", log: () => {} });
  } finally {
    process.env.PATH = saved;
  }
  check(
    "a kernel named wolfram on PATH is found",
    found?.bin === realpathSync(join(dir, "wolfram")),
    `${found?.bin ?? "null"} via ${found?.source ?? "-"}`,
  );
  check("and it is reported as coming from PATH", /PATH/.test(found?.source ?? ""), found?.source);

  // How a kernel actually reaches PATH on Linux: as a symlink into the
  // installation. The symlink's own path is versionless, and a versionless
  // kernel reads as version 0 — below any floor — so it was skipped as too old
  // by the very lookup that found it. The version lives in the target's path.
  const install = join(home, "linked-install-10000.0.0", "Executables");
  mkdirSync(install, { recursive: true });
  writeFileSync(join(install, "wolfram"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
  const binDir = join(home, "linked-bin");
  mkdirSync(binDir, { recursive: true });
  symlinkSync(join(install, "wolfram"), join(binDir, "wolfram"));

  process.env.PATH = `${binDir}:/usr/bin:/bin`;
  let linked;
  try {
    linked = lib.locateKernel({ minVersion: "9999", log: () => {} });
  } finally {
    process.env.PATH = saved;
  }
  check(
    "a symlinked kernel on PATH is the kernel it links to",
    linked?.bin === realpathSync(join(install, "wolfram")),
    linked?.bin ?? "null — skipped as versionless",
  );
  check(
    "and its version is read from the target's path",
    linked?.version === "10000.0.0",
    `version ${linked?.version ?? "null"}`,
  );
  // The path is also the identity: the capability cache and the broker socket
  // digest it, so two names for one kernel must resolve to one string or they
  // are two brokers running two licence budgets against one installation.
  check(
    "two names for one kernel are one identity",
    lib.resolveKernelBinary(join(binDir, "wolfram")) ===
      lib.resolveKernelBinary(join(install, "wolfram")),
    `${lib.resolveKernelBinary(join(binDir, "wolfram"))} vs ${lib.resolveKernelBinary(join(install, "wolfram"))}`,
  );
}

// ---------------------------------------------------------------------------
// Discovery's last step runs `wolframscript -code`, which starts a kernel — a
// licence seat, or a Wolfram Cloud round trip — and it ran inside server
// construction, ahead of `initialize`, on every machine where nothing else found
// a kernel. A session may not take it: `doctor` does, records what it found, and
// sessions read that record. The installation here is reachable only through a
// stub wolframscript that logs each invocation, and the floor is unreachable so
// no real installation on this machine can answer in its place.
heading("Discovery spends no seat; doctor is the only route to wolframscript");
{
  const install = join(home, "ws-only-10000.0.0");
  mkdirSync(join(install, "Executables"), { recursive: true });
  writeFileSync(
    join(install, "Executables", "wolfram"),
    `#!/bin/sh\nexec ${JSON.stringify(process.execPath)} ${JSON.stringify(fakeKernel)} "$@"\n`,
    { mode: 0o755 },
  );
  const stubDir = join(home, "ws-stub");
  mkdirSync(stubDir, { recursive: true });
  const asked = join(home, "wolframscript.log");
  writeFileSync(
    join(stubDir, "wolframscript"),
    `#!/bin/sh\necho "$*" >> ${JSON.stringify(asked)}\necho ${JSON.stringify(`${install}|10000.0.0 for a stub`)}\n`,
    { mode: 0o755 },
  );
  const invocations = () =>
    existsSync(asked) ? readFileSync(asked, "utf8").split("\n").filter(Boolean).length : 0;
  const env = {
    PATH: `${stubDir}:/usr/bin:/bin`,
    WOLFRAM_MCP_KERNEL: "",
    WOLFRAM_MCP_MIN_VERSION: "9999",
  };
  const toolNames = async (session) => (await session.client.listTools()).tools.map((t) => t.name);

  wipeCache();
  {
    const before = startCount();
    const s = await connect(env);
    const names = await toolNames(s);
    const status = await s.client.callTool({ name: "wolfram_status", arguments: {} });
    await s.client.close();
    check(
      "with no candidate, a session never asks wolframscript",
      invocations() === 0,
      `${invocations()} invocation(s)`,
    );
    check("and starts no kernel", startCount() === before, `${startCount() - before} started`);
    check("and lists wolfram_status alone", names.join(",") === "wolfram_status", names.join(", "));
    const answer = status.content?.[0]?.text ?? "";
    // A clone's diagnostics name its npm script and where to run it; the
    // script has to be one this package actually has.
    const clone = /run npm run doctor, in (.+)\./.exec(answer)?.[1];
    const scripts = clone
      ? JSON.parse(readFileSync(join(clone, "package.json"), "utf8")).scripts ?? {}
      : {};
    check(
      "whose answer names the clone's doctor, where it can be run",
      clone !== undefined && realpathSync(clone) === realpathSync(root) && "doctor" in scripts,
      clone ?? answer.split("\n").slice(-2).join(" "),
    );
  }

  // The plugin's SessionStart hook runs before anything else in a session, so
  // it gets the same rule as construction: caches only.
  {
    const before = startCount();
    const asked = invocations();
    const hook = spawnSync(process.execPath, [entry, "session-status"], {
      encoding: "utf8",
      env: { ...process.env, ...env, HOME: home, CLAUDE_PLUGIN_ROOT: root },
      timeout: 30_000,
    });
    check(
      "the session-start status starts no kernel and asks no wolframscript",
      hook.status === 0 && startCount() === before && invocations() === asked,
      `exit=${hook.status}; ${startCount() - before} started; ${invocations() - asked} asked`,
    );
    check(
      "and with no candidate, says so and names doctor",
      /no Wolfram installation was found/.test(hook.stdout) && hook.stdout.includes("/wolfram:doctor"),
      hook.stdout.trim().slice(0, 100),
    );
  }

  // The same session launched by Claude Code for the plugin, whose user has
  // the plugin's command and neither a clone nor npm.
  {
    const s = await connect({ ...env, CLAUDE_PLUGIN_ROOT: root });
    const status = await s.client.callTool({ name: "wolfram_status", arguments: {} });
    await s.client.close();
    const answer = status.content?.[0]?.text ?? "";
    check(
      "a plugin session names /wolfram:doctor instead",
      answer.includes("run /wolfram:doctor.") && !answer.includes("npm run"),
      answer.split("\n").slice(-2).join(" "),
    );
  }

  {
    const doctor = spawnSync(process.execPath, [entry, "doctor"], {
      encoding: "utf8",
      env: { ...process.env, ...env, HOME: home, WOLFRAM_MCP_SHARE: "0", WOLFRAM_MCP_INSPECT: "0" },
      timeout: 60_000,
    });
    check(
      "doctor asks wolframscript, once",
      invocations() === 1,
      `${invocations()} invocation(s); exit=${doctor.status}`,
    );
    check(
      "and records what it found for sessions to read",
      /recorded, so sessions find this kernel/.test(doctor.stdout),
      doctor.stdout.split("\n").find((l) => /recorded/.test(l))?.trim() ?? doctor.stdout.slice(0, 80),
    );
  }

  {
    const before = startCount();
    const s = await connect(env);
    const names = await toolNames(s);
    const afterList = startCount();
    const call = await s.client.callTool({
      name: "WolframLanguageEvaluator",
      arguments: { code: "1+1" },
    });
    await s.client.close();
    check(
      "a later session finds that installation without asking wolframscript",
      invocations() === 1 && names.includes("WolframLanguageEvaluator"),
      `${invocations()} invocation(s); ${names.join(", ")}`,
    );
    check(
      "on a cold cache, one kernel starts — to learn the tool list",
      afterList - before === 1,
      `${afterList - before} started by tools/list`,
    );
    check("and a listed tool answers", call.isError !== true, (call.content?.[0]?.text ?? "").slice(0, 60));
  }

  {
    const before = startCount();
    const s = await connect(env);
    const names = await toolNames(s);
    await s.client.callTool({ name: "wolfram_status", arguments: {} });
    const beforeCall = startCount();
    const call = await s.client.callTool({
      name: "WolframLanguageEvaluator",
      arguments: { code: "1+1" },
    });
    await s.client.close();
    check(
      "on a warm cache, nothing before the first tool call starts a kernel",
      beforeCall === before && names.includes("WolframLanguageEvaluator"),
      `${beforeCall - before} started`,
    );
    check("and that call starts one and answers", call.isError !== true && startCount() === before + 1);

    // Facts exist only once a kernel has reported them; the hook says which
    // of its lines are cached, and how old, rather than presenting a
    // month-old "signed in" as the present.
    lib.recordFacts(realpathSync(join(install, "Executables", "wolfram")), {
      version: "15.1.0",
      systemID: "MacOSX-ARM64",
      base: "/fake/base",
      userBase: "/fake/base/userbase",
      localBase: "/fake/base/localbase",
      maxLicenseProcesses: 4,
      licenseType: "Professional",
      networkLicense: false,
      agentTools: "2.2.7",
      wolframID: null,
      cloudConnected: false,
    }, [], () => {});
    const hook = spawnSync(process.execPath, [entry, "session-status"], {
      encoding: "utf8",
      // The session's own server name: the tool list is cached per name.
      env: {
        ...process.env,
        ...env,
        HOME: home,
        WOLFRAM_MCP_INSPECT: "1",
        MCP_SERVER_NAME: "WolframLanguage",
      },
      timeout: 30_000,
    });
    check(
      "the session-start status labels its facts as cached, with their age",
      /Cached from a kernel \d+ min ago, not checked this session/.test(hook.stdout) &&
        /Tool list cached/.test(hook.stdout) &&
        startCount() === before + 1,
      hook.stdout.trim().split("\n").slice(1).join(" | ").slice(0, 110),
    );
  }

  // A cache that cannot hold the list is cold every session, and must cost
  // exactly what a cold one does — one kernel, at tools/list — not one per
  // request that would have read it.
  for (const [label, extra] of [
    ["disabled", { WOLFRAM_MCP_CACHE: "0" }],
    ["unwritable", { XDG_CACHE_HOME: join(home, "readonly-cache") }],
  ]) {
    if (label === "unwritable") {
      mkdirSync(join(home, "readonly-cache"), { recursive: true });
      // The hint lives in the cache too, so this session finds the kernel by
      // naming it; what is under test is the tool list.
      chmodSync(join(home, "readonly-cache"), 0o500);
    }
    const counts = [];
    for (let session = 0; session < 2; session++) {
      const before = startCount();
      const s = await connect({ ...extra });
      await s.client.listTools();
      const afterList = startCount();
      await s.client.callTool({ name: "wolfram_status", arguments: {} });
      const call = await s.client.callTool({
        name: "WolframLanguageEvaluator",
        arguments: { code: "1+1" },
      });
      counts.push(`${afterList - before}/${startCount() - before}${answeredByFake(call) ? "" : "!"}`);
      await s.client.close();
    }
    check(
      `with the cache ${label}, every session starts one kernel, at tools/list`,
      counts.every((c) => c === "1/1"),
      `starts at list/total per session: ${counts.join(", ")}`,
    );
    if (label === "unwritable") chmodSync(join(home, "readonly-cache"), 0o700);
  }

  // A hint is a record of a binary, not a promise: an upgrade in place changes
  // the version it recorded, and the floor check rests on that version.
  {
    const kernelFile = join(install, "Executables", "wolfram");
    writeFileSync(kernelFile, `${readFileSync(kernelFile, "utf8")}# upgraded\n`);
    const s = await connect(env);
    const names = await toolNames(s);
    await s.client.close();
    check(
      "a hinted binary that changed is not used on the strength of the old record",
      names.join(",") === "wolfram_status" && invocations() === 1,
      `${names.join(", ")}; ${invocations()} invocation(s)`,
    );
  }
  wipeCache();
}

// ---------------------------------------------------------------------------
heading("Configuration that names a kernel fails closed");
{
  // Version is read from the path, so the directory name sets what these report.
  const stub = (version) => {
    const dir = join(home, `install-${version}`);
    mkdirSync(join(dir, "Executables"), { recursive: true });
    writeFileSync(join(dir, "Executables", "wolfram"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
    return dir;
  };
  const isolated = (env, fn) => {
    const saved = { ...process.env };
    for (const key of ["WOLFRAM_INSTALLATION_DIRECTORY", "WOLFRAM_HOME"]) delete process.env[key];
    Object.assign(process.env, env);
    try {
      return fn();
    } finally {
      for (const key of Object.keys(process.env)) delete process.env[key];
      Object.assign(process.env, saved);
    }
  };

  const unusable = join(home, "not-a-kernel");
  writeFileSync(unusable, "text", { mode: 0o644 });
  const bogus = isolated({}, () => lib.locateKernel({ override: unusable }));
  check(
    "an unusable WOLFRAM_MCP_KERNEL yields nothing, not a substitute",
    bogus === null,
    bogus ? `substituted ${bogus.bin}` : "null",
  );

  const tooOld = isolated({ WOLFRAM_HOME: stub("14.2.1") }, () =>
    lib.locateKernel({ log: () => {} }));
  check(
    "a WOLFRAM_HOME below the version floor is refused",
    tooOld === null,
    tooOld ? `selected ${tooOld.version}` : "null",
  );

  const good = isolated({ WOLFRAM_HOME: stub("15.1.0") }, () => lib.locateKernel({ log: () => {} }));
  check(
    "a WOLFRAM_HOME above it is used, with its version known",
    good?.version === "15.1.0",
    `${good?.bin} version=${good?.version}`,
  );

  // The version its cache key is built from: reporting null here made the key
  // constant, so an upgrade in place never invalidated the cached tool list.
  check("so the cache key can change when the install does", good?.version !== null);

  const pinned = isolated({ WOLFRAM_HOME: stub("15.1.0") }, () =>
    lib.locateKernel({ version: "99", log: () => {} }));
  check(
    "and a version pin outranks it, as all three documents say",
    pinned === null,
    pinned ? `ignored the pin and used ${pinned.bin}` : "null",
  );
}

// ---------------------------------------------------------------------------
// The state that matters most: a machine whose kernels cannot start still
// has a warm cache, so tools/list answers in full and the client looks healthy
// while every call fails two minutes later. Asking the server what it thinks is
// going on must not require a kernel.
// The evaluator enforces its own time constraint — 60s by default in AgentTools
// 2.2.7, though MCP_TOOL_OPTIONS can change it — and does it gracefully,
// returning a result. This server's deadline is the outer bound, and getting the
// ordering wrong costs the caller the kernel's own "time constraint exceeded",
// which says more than "no answer within Ns". The kernel survives either way;
// that is what the sections above are about.
heading("Timeouts layer the right way round");
{
  const configured = 300_000;
  check(
    "an ordinary call uses the configured ceiling",
    lib.evaluationCeilingMs(configured, { code: "1+1" }) === configured,
  );
  check(
    "a model asking for longer than the ceiling gets it",
    lib.evaluationCeilingMs(configured, { code: "long", timeConstraint: 600 }) === 630_000,
    `${lib.evaluationCeilingMs(configured, { timeConstraint: 600 })}`,
  );
  check(
    "asking for less does not shorten it",
    lib.evaluationCeilingMs(configured, { timeConstraint: 5 }) === configured,
  );
  check("nonsense is ignored", lib.evaluationCeilingMs(configured, { timeConstraint: "soon" }) === configured);
  check("as are missing arguments", lib.evaluationCeilingMs(configured, undefined) === configured);

  // And the inversion is announced rather than left to be discovered.
  const s = await connect({ WOLFRAM_MCP_SHARE: "0", WOLFRAM_MCP_CALL_TIMEOUT_SECONDS: "30" });
  await s.client.listTools();
  await new Promise((r) => setTimeout(r, 200));
  check(
    "a ceiling below the evaluator's own default is called out",
    /below the evaluator's default 60s time constraint/.test(s.stderr()),
    s.stderr().split("\n").filter((l) => /timeout/.test(l)).join(" | ").slice(0, 90),
  );
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// Everything before a kernel receives its first request — the broker's
// preparation, the handshake, and once an installation probe kernel — used to
// carry its own bound: the probe 120s, the handshake
// WOLFRAM_MCP_START_TIMEOUT_SECONDS, the broker the call ceiling. A first call
// could wait the sum, and the error named only the last step. One deadline
// covers it all now, and says where it ran out. The budget is 3s, and each slow
// stage is far past it. The probe is gone (plugin plan D20), so the handshake
// is the stage that runs long here.
heading("Preparation has one deadline, and names the stage it ran out in");
{
  const BUDGET = { WOLFRAM_MCP_START_TIMEOUT_SECONDS: "3", WOLFRAM_MCP_CALL_TIMEOUT_SECONDS: "30" };
  const firstCall = async (env) => {
    wipeCache();
    const s = await connect({ ...BUDGET, ...env });
    const started = Date.now();
    const result = await s.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
      undefined,
      { timeout: 60_000 },
    );
    return { s, result, elapsed: Date.now() - started, text: result.content?.[0]?.text ?? "" };
  };
  const stageCheck = async (label, env, stage) => {
    const { s, result, elapsed, text } = await firstCall(env);
    check(
      label,
      result.isError === true && text.includes(`time ran out while ${stage}`) && elapsed < 7_000,
      `${elapsed}ms: ${text.slice(0, 110)}`,
    );
    return s;
  };

  const slowHandshake = { FAKE_INIT_DELAY_MS: "20000" };

  const s = await stageCheck(
    "a slow handshake spends the deadline, and is named",
    slowHandshake,
    "starting the kernel",
  );

  // The back-off: a failed preparation is not retried by the very next call,
  // which would spend another seat and another whole deadline to fail the
  // same way.
  {
    const started = Date.now();
    const again = await s.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
      undefined,
      { timeout: 60_000 },
    );
    const elapsed = Date.now() - started;
    const text = again.content?.[0]?.text ?? "";
    check(
      "the next call fails at once, saying how long is left",
      again.isError === true && elapsed < 1_000 && /retried in \d+m \d\ds/.test(text),
      `${elapsed}ms: ${text.slice(0, 110)}`,
    );
    const status = await s.client.callTool({ name: "wolfram_status", arguments: {} });
    const said = status.content?.[0]?.text ?? "";
    check(
      "and wolfram_status reports the back-off and its cause",
      /preparing\s+the last attempt failed/.test(said) && said.includes("starting the kernel"),
      said.split("\n").filter((l) => /preparing|ran out/.test(l)).join(" | ").slice(0, 120),
    );
    await s.client.close();
  }

  // A kernel the broker starts for a call is started when a slot is granted,
  // which from here cannot be told from waiting for the slot — so it is the
  // broker's start timeout, the same setting, that bounds its handshake.
  {
    wipeCache();
    const runtime = privateDir(join(home, "run-deadline-broker-handshake"));
    const { s, result, elapsed, text } = await firstCall({
      ...slowHandshake,
      WOLFRAM_MCP_SHARE: "1",
      XDG_RUNTIME_DIR: runtime,
    });
    check(
      "a slow handshake in the broker is bounded by the start timeout there",
      result.isError === true && /did not complete MCP initialization within 3s/.test(text) && elapsed < 9_000,
      `${elapsed}ms: ${text.slice(0, 100)}`,
    );
    await s.client.close();
    signalOwnBrokers("SIGTERM", runtime);
  }

  // But not the wait for a slot. A session arriving while every slot holds
  // someone's long evaluation meets a ready broker: that wait is ordinary
  // queueing, under the call's own ceiling. Readiness used to be asked through
  // the pool, so this session timed out its preparation behind the busy slot
  // and was backed off for ten minutes from a healthy broker.
  {
    wipeCache();
    const runtime = privateDir(join(home, "run-deadline-busy"));
    const shared = {
      ...BUDGET,
      WOLFRAM_MCP_SHARE: "1",
      XDG_RUNTIME_DIR: runtime,
      WOLFRAM_MCP_MAX_KERNELS: "1",
      WOLFRAM_MCP_LICENSE_LIMIT: "unlimited",
      WOLFRAM_MCP_IDLE_MINUTES: "5",
      FAKE_CALL_DELAY_MS: "6000",
      FAKE_DELAY_FIRST_ONLY: "1",
    };
    const holder = await connect(shared);
    const holding = holder.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "long" } },
      undefined,
      { timeout: 60_000 },
    );
    // The slot is taken once the holder's evaluation is in flight.
    await new Promise((r) => setTimeout(r, 1_500));
    const late = await connect(shared);
    const started = Date.now();
    const result = await late.client.callTool(
      { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
      undefined,
      { timeout: 60_000 },
    );
    const waited = Date.now() - started;
    await holding;
    const status = await late.client.callTool({ name: "wolfram_status", arguments: {} });
    check(
      "a session that waits for a busy slot is served, not failed as unprepared",
      answeredByFake(result) && waited > 3_000,
      `${waited}ms against a 3s start deadline: ${(result.content?.[0]?.text ?? "").slice(0, 70)}`,
    );
    check(
      "and is not backed off",
      !/preparing\s+the last attempt/.test(status.content?.[0]?.text ?? ""),
    );
    await holder.client.close();
    await late.client.close();
    signalOwnBrokers("SIGTERM", runtime);
  }

  // A failure after dispatch is the kernel answering, not a preparation
  // failing: it must not lock the session out.
  {
    wipeCache();
    const t = await connect(BUDGET);
    const unknown = await t.client
      .callTool({ name: "NoSuchTool", arguments: {} })
      .then(() => "resolved", () => "rejected");
    const next = await t.client.callTool({
      name: "WolframLanguageEvaluator",
      arguments: { code: "1+1" },
    });
    const status = await t.client.callTool({ name: "wolfram_status", arguments: {} });
    await t.client.close();
    check(
      "a tool error after dispatch starts no back-off",
      unknown === "rejected" &&
        answeredByFake(next) &&
        !/preparing\s+the last attempt/.test(status.content?.[0]?.text ?? ""),
      `${unknown}; ${(next.content?.[0]?.text ?? "").slice(0, 50)}`,
    );
  }

  // The window and the identity, on a simulated clock: ten real minutes is not
  // a test.
  {
    let now = 1_000_000;
    const bin = join(home, "backoff-kernel");
    writeFileSync(bin, "one");
    let attempts = 0;
    let failing = true;
    const backend = {
      kind: "local",
      onKernelReady() {},
      async prepare() {
        if (failing) throw new Error("no licence seat was free");
      },
      async listTools() {
        return { tools: [] };
      },
      async stop() {},
    };
    const deferred = new lib.DeferredBackend(
      async () => {
        attempts++;
        return backend;
      },
      () => {},
      { startTimeoutMs: 1_000, bin, clock: () => now, backoffMs: 600_000 },
    );
    const outcome = () => deferred.listTools().then(() => "ok", (e) => String(e.message));
    await outcome();
    const during = await outcome();
    check(
      "during the window, no attempt is made",
      attempts === 1 && /retried in 10m 00s/.test(during),
      `${attempts} attempt(s): ${during.slice(0, 80)}`,
    );
    now += 600_001;
    failing = false;
    check("after the window, it is retried and succeeds", (await outcome()) === "ok" && attempts === 2);

    const fresh = new lib.DeferredBackend(
      async () => {
        attempts++;
        return backend;
      },
      () => {},
      { startTimeoutMs: 1_000, bin, clock: () => now, backoffMs: 600_000 },
    );
    failing = true;
    await fresh.listTools().catch(() => {});
    failing = false;
    writeFileSync(bin, "two, an upgrade");
    check(
      "a changed binary ends the back-off at once",
      (await fresh.listTools().then(() => "ok", (e) => e.message)) === "ok" && attempts === 4,
      `${attempts} attempts`,
    );

    // Stopped mid-handshake: the kernel being prepared is already running,
    // and nothing had been handed over yet for stop() to reach.
    let release;
    let stoppedBackend = false;
    const midway = {
      ...backend,
      prepare: () => new Promise((resolve) => (release = resolve)),
      // As a real backend does: stopping it ends its preparation.
      async stop() {
        stoppedBackend = true;
        release();
      },
    };
    const interrupted = new lib.DeferredBackend(async () => midway, () => {}, {
      startTimeoutMs: 1_000,
      bin,
      clock: () => now,
    });
    const pending = interrupted.listTools().then(() => "served", (e) => e.message);
    await new Promise((r) => setTimeout(r, 20));
    await interrupted.stop();
    const outcome2 = await pending;
    check(
      "stopping during preparation stops the backend being prepared",
      stoppedBackend && /stopped while a kernel was being prepared/.test(outcome2),
      `stopped=${stoppedBackend}; ${outcome2.slice(0, 70)}`,
    );
    check("and is not recorded as a failed preparation", interrupted.backoff() === null);
  }
}

// ---------------------------------------------------------------------------
// The start timeout is the only bound on a handshake. client.connect() sends
// initialize as an ordinary SDK request, and with no timeout of its own the SDK
// cut it off at 60s, half the 120s default: a first start that downloaded the
// paclet for longer failed at a minute with a bare "Request timed out", and
// raising WOLFRAM_MCP_START_TIMEOUT_SECONDS changed nothing. Read off the
// request itself, since a check that waited a minute would not be run.
heading("A handshake is bounded by the start timeout, not the SDK's default");
{
  const sent = [];
  const original = Client.prototype.request;
  Client.prototype.request = function (request, schema, options) {
    if (request.method === "initialize") sent.push(options?.timeout);
    return original.call(this, request, schema, options);
  };
  // The remainder a preparation hands ensure(), not the configured timeout,
  // is what bounds this start, so that is what the request must carry: a
  // second past it, exactly. Matched by value, since the wrapper sees every
  // client in this process.
  const session = new lib.KernelSession({
    bin: fakeKernel,
    serverName: "WolframLanguage",
    idleMs: 60_000,
    startTimeoutMs: 120_000,
    clientInfo: { name: "smoke", version: "0" },
    log: () => {},
  });
  try {
    await session.ensure(90_000);
  } finally {
    Client.prototype.request = original;
    await session.stop();
  }
  check(
    "initialize is sent with a timeout a beat past the start's own, so the handshake's own timer is what fires",
    sent.includes(91_000),
    `initialize timeout ${sent.map(String).join(", ") || "none sent"}`,
  );

  // And a session waiting on a broker gives it as long: an op with no deadline
  // of its own may first wait for the broker to start a kernel, bounded by the
  // start timeout. The ceiling covered only the op, and fitted only while the
  // SDK cut every handshake at 60s, so a cold start longer than a minute
  // outlived it and the session gave up on a broker that was only starting.
  const ceiling = lib.brokerCeilingMs;
  check(
    "a session waits for a broker's op long enough for the broker to start a kernel first",
    typeof ceiling === "function" &&
      ceiling(undefined, 120_000) > 120_000 + 60_000 &&
      ceiling(undefined, 600_000) > 600_000 + 60_000,
    typeof ceiling === "function" ? `${ceiling(undefined, 120_000)}ms on a 120s start timeout` : "not exported",
  );
  check(
    "while an op with a ceiling of its own keeps it, and 0 still means none",
    typeof ceiling === "function" && ceiling(300_000, 120_000) === 302_000 && ceiling(0, 120_000) === 0,
  );
}

// ---------------------------------------------------------------------------
// A stop has to reach a preparation wherever it is. Each stage used to be
// reachable only once it had produced something: a handshake's transport was
// recorded only after it succeeded, and the factory's probe and broker wait
// had no backend yet. So stop() returned while a kernel kept its licence seat.
// Driven in-process, through the library, so the stop lands mid-stage.
heading("Stopping reaches a preparation wherever it is");
{
  const withEnv = async (env, body) => {
    const saved = Object.fromEntries(Object.keys(env).map((k) => [k, process.env[k]]));
    Object.assign(process.env, env);
    try {
      return await body();
    } finally {
      for (const [k, v] of Object.entries(saved)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
    }
  };
  // The fake-kernel pids running a given way — the probe with -noinit first,
  // a served kernel with the AgentTools args. Compared as sets, never counts:
  // other sections' kernels start and stop across this one, so a count moved
  // for reasons that had nothing to do with the stop under test.
  const fakePids = (pattern) =>
    new Set(
      (spawnSync("pgrep", ["-f", `fake-kernel.mjs ${pattern}`], { encoding: "utf8" }).stdout ?? "")
        .split("\n")
        .filter(Boolean),
    );
  const appeared = (before, pattern) => [...fakePids(pattern)].filter((pid) => !before.has(pid));
  const alive = (pids) => pids.filter((pid) => fakePids("").has(pid));
  const settle = async (check, ms = 3_000) => {
    const by = Date.now() + ms;
    while (Date.now() < by && !check()) await new Promise((r) => setTimeout(r, 50));
    return check();
  };

  await withEnv({ FAKE_INIT_DELAY_MS: "30000" }, async () => {
    const before = fakePids("-run PacletSymbol");
    const session = new lib.KernelSession({
      bin: fakeKernel,
      serverName: "WolframLanguage",
      idleMs: 60_000,
      startTimeoutMs: 30_000,
      clientInfo: { name: "smoke", version: "0" },
      log: () => {},
    });
    const starting = session.ensure().then(() => "started", (e) => e.message);
    await settle(() => appeared(before, "-run PacletSymbol").length > 0);
    const starting2 = appeared(before, "-run PacletSymbol");
    const t0 = Date.now();
    await session.stop();
    const outcome = await starting;
    check(
      "a stop mid-handshake ends the start at once",
      /stopped during its handshake/.test(outcome) && Date.now() - t0 < 3_000,
      `${Date.now() - t0}ms: ${outcome.slice(0, 70)}`,
    );
    check(
      "and the kernel it was starting is gone",
      starting2.length === 1 && (await settle(() => alive(starting2).length === 0)),
      `started ${starting2.join(",") || "none"}; alive ${alive(starting2).join(",") || "none"}`,
    );
  });

  // The documented wiring carries the configured deadline: the README's old
  // recipe compiled, and ran preparation on a hard-coded 120s instead.
  await withEnv(
    {
      WOLFRAM_MCP_KERNEL: fakeKernel,
      WOLFRAM_MCP_SHARE: "0",
      WOLFRAM_MCP_INSPECT: "0",
      WOLFRAM_MCP_START_TIMEOUT_SECONDS: "2",
      FAKE_INIT_DELAY_MS: "30000",
    },
    async () => {
      wipeCache();
      const config = lib.loadConfig(() => {});
      const deferred = lib.deferredBackend?.(
        config,
        { bin: fakeKernel, version: null, source: "suite" },
        () => {},
      );
      if (!deferred) {
        check("the library's deferredBackend runs on the configured start timeout", false, "not exported");
        return;
      }
      const t0 = Date.now();
      const outcome = await deferred.listTools().then(() => "served", (e) => e.message);
      const took = Date.now() - t0;
      await deferred.stop();
      check(
        "the library's deferredBackend runs on the configured start timeout",
        /not ready within 2s/.test(outcome) && took < 6_000 && deferred.backoff() !== null,
        `${took}ms: ${outcome.slice(0, 70)}`,
      );

      // The handshake's timer is set to what the deadline has left, so its
      // expiry is the deadline's. But the two read different clocks: Node's
      // timers run on libuv's cached loop time, which lags Date.now(), so the
      // handshake could fire a millisecond before the deadline saw itself
      // expire, and the raw handshake error escaped without the stage or the
      // variable to raise. A deadline clock running at half speed makes that
      // skew certain rather than occasional.
      const start = Date.now();
      const slow = () => start + (Date.now() - start) / 2;
      const skewed = lib.deferredBackend(config, { bin: fakeKernel, version: null, source: "suite" }, () => {}, {
        clock: slow,
      });
      const skewedOutcome = await skewed.listTools().then(() => "served", (e) => e.message);
      await skewed.stop();
      check(
        "a handshake that times out on the deadline's remainder is reported as the deadline, whatever the clocks say",
        /not ready within 2s/.test(skewedOutcome) &&
          /did not complete MCP initialization/.test(skewedOutcome) &&
          skewed.backoff() !== null,
        skewedOutcome.slice(0, 90),
      );
    },
  );
}

// ---------------------------------------------------------------------------
heading("wolfram_status answers when kernels cannot");
{
  wipeCache();
  const runtime = join(home, "run-status");
  privateDir(runtime);
  const s = await connect({
    WOLFRAM_MCP_SHARE: "0",
    WOLFRAM_MCP_INSPECT: "1",
    XDG_RUNTIME_DIR: runtime,
    FAKE_BASE: "/fake/base",
  });
  // A kernel has to have run once for the probe to have anything to report.
  await s.client.callTool({ name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined, { timeout: 20_000 });
  await new Promise((r) => setTimeout(r, 500));

  const before = startCount();
  const status = await s.client.callTool({ name: "wolfram_status", arguments: {} },
    undefined, { timeout: 20_000 });
  const text = status.content?.[0]?.text ?? "";
  check("it answers without starting a kernel", startCount() === before, `starts=${startCount() - before}`);
  check("it names the kernel in use", text.includes("fake-kernel.mjs"), text.slice(0, 60));
  check("it reports the paclet version", text.includes("2.2.7"), "");
  check("it reports the account state", /not signed in/.test(text), "");
  check("it reports the licence", /licence/.test(text), "");
  check("and where the logs go", /logs/.test(text), "");
  // The line a reader consults to find out whether the next tools/list will
  // cost a kernel. The call above already warmed the cache, so "not cached"
  // here is the answer from before that happened, frozen for the life of the
  // process — which is what a cache read taken once, at construction, gives.
  const toolLine = text.split("\n").find((l) => l.startsWith("tool list")) ?? "";
  check(
    "and the tool list this session has already cached",
    /tool list\s+\d+ tools, cached/.test(toolLine),
    toolLine,
  );
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// WOLFRAM_MCP_CACHE=0 writes nothing to disk, yet a kernel that has started
// leaves its list in memory and the next tools/list still starts nothing. The
// status line has to separate the two: reporting the second as "not cached"
// sends whoever is debugging a slow start looking for a cache write that was
// never going to happen.
heading("wolfram_status separates a list held in memory from a cached one");
{
  wipeCache();
  const s = await connect({ WOLFRAM_MCP_CACHE: "0" });
  const ask = async () => {
    const r = await s.client.callTool({ name: STATUS_TOOL, arguments: {} },
      undefined, { timeout: 20_000 });
    const body = r.content?.[0]?.text ?? "";
    return body.split("\n").find((l) => l.startsWith("tool list")) ?? body.slice(0, 60);
  };

  const cold = await ask();
  check(
    "before any kernel, the next list is announced as costing one",
    /not cached; the next list starts a kernel/.test(cold),
    cold,
  );

  const before = startCount();
  await s.client.callTool({ name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined, { timeout: 20_000 });
  await new Promise((r) => setTimeout(r, 500));

  const warm = await ask();
  check(
    "after one, the list it holds is reported without claiming a disk cache",
    /\d+ tools, in memory \(WOLFRAM_MCP_CACHE=0\)/.test(warm),
    warm,
  );
  check(
    "and asking cost no kernel of its own",
    startCount() - before === 1,
    `starts=${startCount() - before}`,
  );
  check(
    "while the disk stayed empty, as CACHE=0 promises",
    !existsSync(join(home, "cache", "wolfram-mcp-server", "capabilities")),
  );
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// A user's tool configuration has to survive this proxy. AgentTools reads
// MCP_TOOL_OPTIONS at kernel startup and it is what sets each tool's effective
// TimeConstraint — so WolframLanguageEvaluator's 60s is a default a user may
// already have changed, not a constant this server may assume. It reaches the
// kernel only because kernel.ts spreads process.env into the child environment;
// nothing named it, so nothing would have noticed it being dropped.
heading("A user's MCP_TOOL_OPTIONS reaches the kernel");
{
  wipeCache();
  const options = '{"WolframLanguageEvaluator":{"TimeConstraint":600}}';
  const s = await connect({ WOLFRAM_MCP_SHARE: "0", MCP_TOOL_OPTIONS: options });
  const result = await s.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined, { timeout: 20_000 });
  const text = result.content?.[0]?.text ?? "";
  check(
    "the tool options the client set arrive intact",
    text.includes(`toolOptions=${options}`),
    text.slice(text.indexOf("toolOptions=")).slice(0, 70),
  );
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));
}

// ---------------------------------------------------------------------------
// The repo doubles as a Claude Code plugin: .claude-plugin/plugin.json wires
// the MCP server and Wolfram's LSPServer to launchers inside this tree via
// ${CLAUDE_PLUGIN_ROOT}. Those references are strings a rename silently
// orphans, so every path the manifest names is resolved against the tree here.
// The LSP launcher's no-seat mode is driven over real stdio: it must answer
// the handshake without a kernel, keep stdout to protocol frames alone — one
// stray line disconnects the server and counts as a crash — and honour the
// spec's shutdown/exit contract, because a clean exit outside it would be
// restarted in a loop.
heading("The plugin is assembled from its template, and the archive is that tree");
{
  // Assembled into scratch, never into release/: that is the tree a developer's
  // own session is running.
  const releaseOut = join(home, "release");
  const assembled = spawnSync(
    process.execPath,
    [join(root, "scripts", "release-artifacts.mjs"), "--out", releaseOut],
    { encoding: "utf8", timeout: 180_000 },
  );
  check(
    "the release assembles",
    assembled.status === 0,
    (assembled.stderr || "").trim().split("\n").pop()?.slice(0, 90) ?? "",
  );
  const tree = join(releaseOut, "plugin");
  const manifest = JSON.parse(readFileSync(join(tree, ".claude-plugin", "plugin.json"), "utf8"));
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  check("the manifest names the plugin", manifest.name === "wolfram", `name=${manifest.name}`);
  check(
    "and carries the package's own version, so one bump releases both",
    manifest.version === pkg.version,
    `plugin ${manifest.version}, package ${pkg.version}`,
  );
  const bundled = spawnSync(process.execPath, [join(tree, "wolfram-mcp-server.mjs"), "--version"], {
    encoding: "utf8",
  });
  check(
    "as does the bundle inside it",
    bundled.stdout.trim() === pkg.version,
    bundled.stdout.trim() || bundled.stderr.slice(0, 60),
  );
  // Inside the plugin root, every one: an archive install carries nothing
  // else, so a path reaching out of it works from a clone and nowhere else.
  const referenced = JSON.stringify(manifest).match(/\$\{CLAUDE_PLUGIN_ROOT\}[^"]*/g) ?? [];
  const outside = referenced.filter(
    (ref) => ref.includes("..") || !existsSync(ref.replace("${CLAUDE_PLUGIN_ROOT}", tree)),
  );
  check(
    "every path the manifest references is inside the assembled tree",
    referenced.length >= 2 && outside.length === 0,
    outside.join(", ") || `${referenced.length} referenced`,
  );
  const files = (dir, prefix = "") =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? files(join(dir, entry.name), `${prefix}${entry.name}/`)
        : [`${prefix}${entry.name}`],
    );
  const listed = spawnSync("unzip", ["-Z1", join(releaseOut, `wolfram-plugin-${pkg.version}.zip`)], {
    encoding: "utf8",
  });
  const inZip = listed.stdout.split("\n").filter((name) => name && !name.endsWith("/")).sort();
  const inTree = files(tree).sort();
  check(
    "the archive holds exactly the assembled tree",
    inZip.length > 0 && JSON.stringify(inZip) === JSON.stringify(inTree),
    `zip: ${inZip.join(", ")}`.slice(0, 110),
  );
  // The hook and the doctor skill as the plugin declares them, run the way
  // Claude Code runs them: shell commands, CLAUDE_PLUGIN_ROOT set to the
  // installed tree, and no MCP server's env — Claude Code gives that to the
  // MCP server alone. Each must arrive at the server the MCP entry defaults to,
  // or the hook reads another server's cache and doctor tests another server.
  const pluginDefault = manifest.mcpServers?.WolframLanguage?.env?.WOLFRAM_MCP_DEFAULT_SERVER;
  const { MCP_SERVER_NAME: _n, WOLFRAM_MCP_SERVER_NAME: _a, WOLFRAM_MCP_DEFAULT_SERVER: _d, ...bare } =
    process.env;
  const asPlugin = (command, extra = {}) =>
    spawnSync("/bin/sh", ["-c", command.replaceAll("${CLAUDE_PLUGIN_ROOT}", tree)], {
      encoding: "utf8",
      env: { ...bare, CLAUDE_PLUGIN_ROOT: tree, WOLFRAM_MCP_KERNEL: fakeKernel, HOME: home, ...extra },
      timeout: 60_000,
    });
  const hooks = JSON.parse(readFileSync(join(tree, "hooks", "hooks.json"), "utf8"));
  const ranHook = asPlugin(hooks.hooks?.SessionStart?.[0]?.hooks?.[0]?.command ?? "false");
  check(
    "the assembled plugin's session-start hook runs, on the plugin's server",
    ranHook.status === 0 &&
      /^Wolfram plugin: /.test(ranHook.stdout) &&
      ranHook.stdout.includes(`server ${pluginDefault}.`),
    `exit=${ranHook.status} ${(ranHook.stdout || ranHook.stderr).trim().split("\n")[0].slice(-60)}`,
  );
  const doctorSkill = readFileSync(join(tree, "skills", "doctor", "SKILL.md"), "utf8");
  const doctorCommandLine = /```bash\n(.+)\n```/.exec(doctorSkill)?.[1] ?? "false";
  const ranDoctor = asPlugin(doctorCommandLine, { WOLFRAM_MCP_SHARE: "0", WOLFRAM_MCP_INSPECT: "0" });
  const doctorServer = /serverName\s+(\S+)/.exec(ranDoctor.stdout)?.[1];
  check(
    "and so does the doctor skill's command",
    ranDoctor.status === 0 && doctorServer === pluginDefault,
    `exit=${ranDoctor.status} serverName=${doctorServer} (plugin default ${pluginDefault})`,
  );
  const lsp = manifest.lspServers?.wolfram;
  check(
    "the LSP entry claims the Wolfram Language extensions",
    [".wl", ".wls", ".wlt"].every((ext) => lsp?.extensionToLanguage?.[ext] === "wolfram"),
    JSON.stringify(lsp?.extensionToLanguage),
  );
  // A client with no stored value for an option — a plugin synced from an
  // upload, as Claude Desktop does, or loaded with --plugin-dir — refused to
  // load a server whose entry named ${user_config.lsp}: "No LSP server
  // available for file type: .wl". Options reach hooks, which pass them on.
  const servers = JSON.stringify({ lsp: manifest.lspServers, mcp: manifest.mcpServers });
  check(
    "no server entry depends on a plugin option having a stored value",
    !servers.includes("${user_config"),
    (servers.match(/\$\{user_config[^}]*\}/g) ?? []).join(", "),
  );

  // The repo is also its own marketplace, serving the assembled tree in place
  // — a directory-source marketplace installs nothing into the plugin cache, so
  // a session here runs what `npm run release:artifacts` last assembled, which
  // is what ships. Manifest, marketplace and settings each hold a name the
  // others reference; a rename that misses one does not error, it silently
  // stops resolving.
  const market = JSON.parse(readFileSync(join(root, ".claude-plugin", "marketplace.json"), "utf8"));
  const settings = JSON.parse(readFileSync(join(root, ".claude", "settings.json"), "utf8"));
  check(
    "the marketplace serves the assembled plugin, never the bare template",
    market.plugins?.[0]?.name === manifest.name && market.plugins?.[0]?.source === "./release/plugin",
    JSON.stringify(market.plugins?.[0] ?? null).slice(0, 100),
  );
  check(
    "and the project settings enable exactly that plugin",
    settings.enabledPlugins?.[`${manifest.name}@${market.name}`] === true &&
      settings.extraKnownMarketplaces?.[market.name]?.source?.path === ".",
    JSON.stringify(settings.extraKnownMarketplaces ?? null),
  );
  // One server, not two: the plugin and .mcp.json both launch this package,
  // and a session carrying both shows every tool twice. The settings retire the
  // .mcp.json copy for Claude Code; .mcp.json itself stays committed as the
  // entry a client without the plugin system points at.
  check(
    "and retire .mcp.json's copy, so the tools appear once",
    (settings.disabledMcpjsonServers ?? []).includes("WolframLanguage"),
    JSON.stringify(settings.disabledMcpjsonServers ?? null),
  );

  // Drive the launcher's no-seat mode over real stdio, framing and all.
  const frame = (msg) => {
    const body = JSON.stringify(msg);
    return `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;
  };
  const stub = spawn(process.execPath, [join(root, "scripts", "lsp-server.mjs")], {
    env: { ...process.env, WOLFRAM_MCP_LSP: "0" },
    stdio: ["pipe", "pipe", "pipe"],
  });
  const out = [];
  stub.stdout.on("data", (d) => out.push(d));
  const exited = new Promise((resolve) => stub.once("exit", resolve));
  stub.stdin.write(frame({ jsonrpc: "2.0", id: 1, method: "initialize", params: { capabilities: {} } }));
  stub.stdin.write(frame({ jsonrpc: "2.0", id: 2, method: "textDocument/hover", params: {} }));
  stub.stdin.write(frame({ jsonrpc: "2.0", id: 3, method: "shutdown", params: null }));
  stub.stdin.write(frame({ jsonrpc: "2.0", method: "exit", params: null }));
  const code = await Promise.race([exited, new Promise((r) => setTimeout(() => r("hung"), 5000))]);
  const stdout = Buffer.concat(out).toString();
  const bodies = [...stdout.matchAll(/\{[^\r\n]*\}/g)].map((m) => JSON.parse(m[0]));
  check("WOLFRAM_MCP_LSP=0 answers the handshake without a kernel",
    bodies.some((m) => m.id === 1 && m.result && Object.keys(m.result.capabilities ?? { x: 1 }).length === 0),
    stdout.slice(0, 80));
  check(
    "a request it does not serve is refused, not ignored",
    bodies.some((m) => m.id === 2 && m.error?.code === -32601),
  );
  check("and shutdown/exit ends it with the spec's exit code", code === 0, `exit=${code}`);
  check(
    "stdout held protocol frames alone",
    /^(Content-Length: \d+\r\n\r\n\{[^\r\n]*\})+$/.test(stdout),
    JSON.stringify(stdout.slice(0, 60)),
  );

  // On by default (plugin plan D23): someone using the plugin in Claude Code
  // wants its code intelligence too, and Claude Code starts an LSP server only
  // when a Wolfram Language file is opened. The plugin's `lsp` option turns it
  // off. It used to arrive as ${user_config.lsp} in the LSP server's own
  // environment, and a client with no stored value for the option — a plugin
  // synced from an upload, as Claude Desktop does, or loaded with --plugin-dir —
  // refused to load the LSP server at all ("No LSP server available for file
  // type: .wl"). Only hooks are given plugin options, so the SessionStart hook
  // records it in the plugin's data directory, where the LSP server reads it.
  const optionDir = join(home, "plugin-data");
  mkdirSync(optionDir, { recursive: true });
  const option = (value) => {
    if (value === undefined) rmSync(join(optionDir, "lsp-option"), { force: true });
    else writeFileSync(join(optionDir, "lsp-option"), value);
    return { CLAUDE_PLUGIN_DATA: optionDir };
  };
  const decide = (env) => lib.lspDecision(env).enabled;
  check("with nothing set, the LSP is on", decide({}) === true && decide(option(undefined)) === true);
  check("the plugin option turns it off", decide(option("false")) === false);
  check("and on", decide(option("true")) === true);
  check(
    "an inherited WOLFRAM_MCP_LSP=0 beats the option",
    decide({ WOLFRAM_MCP_LSP: "0", ...option("true") }) === false,
  );
  check(
    "and an inherited WOLFRAM_MCP_LSP=on beats an option set off",
    decide({ WOLFRAM_MCP_LSP: "on", ...option("false") }) === true,
  );
  check(
    "a blank or unsubstituted switch defers to the option",
    decide({ WOLFRAM_MCP_LSP: " ", ...option("false") }) === false &&
      decide({ WOLFRAM_MCP_LSP: "${user_config.lsp}", ...option("false") }) === false,
  );
  const typo = lib.lspDecision(option("ture"));
  check(
    "a value that is neither is off, and says so",
    typo.enabled === false && /neither on nor off/.test(typo.because),
    typo.because,
  );
  option(undefined);

  // The hook's half: it alone is given CLAUDE_PLUGIN_OPTION_LSP, and records it
  // for the LSP server, or removes what an earlier session recorded once the
  // option is cleared.
  {
    const hook = (extra) =>
      spawnSync(process.execPath, [entry, "session-status"], {
        encoding: "utf8",
        env: { ...process.env, HOME: home, CLAUDE_PLUGIN_DATA: optionDir, ...extra },
        timeout: 30_000,
      });
    hook({ CLAUDE_PLUGIN_OPTION_LSP: "false" });
    const recorded = existsSync(join(optionDir, "lsp-option"))
      ? readFileSync(join(optionDir, "lsp-option"), "utf8").trim()
      : "(none)";
    hook({ CLAUDE_PLUGIN_OPTION_LSP: undefined });
    const cleared = existsSync(join(optionDir, "lsp-option"));
    check(
      "the SessionStart hook records the option for the LSP server, and clears it when unset",
      recorded === "false" && !cleared,
      `recorded=${recorded}; after unset, file ${cleared ? "remains" : "gone"}`,
    );
  }
  {
    const { WOLFRAM_MCP_LSP: _a, ...clean } = process.env;
    const quiet = spawn(process.execPath, [join(root, "scripts", "lsp-server.mjs")], {
      env: { ...clean, WOLFRAM_MCP_LSP: "0" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    const said = [];
    quiet.stderr.on("data", (d) => said.push(d));
    const exited = new Promise((resolve) => quiet.once("exit", resolve));
    quiet.stdin.write(frame({ jsonrpc: "2.0", id: 1, method: "initialize", params: { capabilities: {} } }));
    quiet.stdin.write(frame({ jsonrpc: "2.0", id: 2, method: "shutdown", params: null }));
    quiet.stdin.write(frame({ jsonrpc: "2.0", method: "exit", params: null }));
    const code = await Promise.race([exited, new Promise((r) => setTimeout(() => r("hung"), 5000))]);
    check(
      "a launch with it off starts no kernel and serves the stub",
      code === 0 && /starting no kernel/.test(Buffer.concat(said).toString()),
      `exit=${code} ${Buffer.concat(said).toString().trim().slice(0, 80)}`,
    );
  }

  // Wolfram's LSPServer exits on a request it never advertised ("Internal
  // assert 4 failed … KERNEL IS EXITING HARD"), and Claude Code sends such
  // requests anyway: workspace/symbol and call hierarchy took the server down
  // in Claude Desktop, and every request after them with it. The launcher
  // answers those itself, as the protocol says to, and never forwards them.
  {
    const { WOLFRAM_MCP_LSP: _a, ...clean } = process.env;
    const live = spawn(process.execPath, [join(root, "scripts", "lsp-server.mjs")], {
      env: { ...clean, WOLFRAM_MCP_LSP: "1", WOLFRAM_MCP_KERNEL: fakeKernel, FAKE_ARGV_LOG: join(home, "lsp-argv.json") },
      stdio: ["pipe", "pipe", "pipe"],
    });
    const replies = new Map();
    let pending = Buffer.alloc(0);
    live.stdout.on("data", (chunk) => {
      pending = Buffer.concat([pending, chunk]);
      for (;;) {
        const end = pending.indexOf("\r\n\r\n");
        if (end === -1) return;
        const length = Number(/Content-Length: (\d+)/i.exec(pending.subarray(0, end).toString())?.[1]);
        if (pending.length < end + 4 + length) return;
        const msg = JSON.parse(pending.subarray(end + 4, end + 4 + length).toString());
        pending = pending.subarray(end + 4 + length);
        if (msg.id !== undefined) replies.set(msg.id, msg);
      }
    });
    const ask = async (id, method, params) => {
      live.stdin.write(frame({ jsonrpc: "2.0", id, method, params }));
      const by = Date.now() + 10_000;
      while (!replies.has(id) && live.exitCode === null && Date.now() < by) {
        await new Promise((r) => setTimeout(r, 25));
      }
      return replies.get(id);
    };
    const doc = { textDocument: { uri: "file:///tmp/probe.wl" }, position: { line: 0, character: 0 } };
    await ask(1, "initialize", { capabilities: {} });
    const symbols = await ask(2, "workspace/symbol", { query: "f" });
    const calls = await ask(3, "textDocument/prepareCallHierarchy", doc);
    const hover = await ask(4, "textDocument/hover", doc);
    check(
      "an unadvertised request is answered MethodNotFound, and the server stays up",
      symbols?.error?.code === -32601 && calls?.error?.code === -32601 && Boolean(hover?.result) && live.exitCode === null,
      `workspace/symbol ${JSON.stringify(symbols?.error ?? symbols?.result ?? "no reply")}; hover ${hover ? "answered" : "none"}; exit ${live.exitCode}`,
    );
    // Advertised as a provider, but not every request under it: LSPServer
    // serves semantic tokens in full and says `range: False`, `delta: False`.
    // Checked against the provider alone, both reached the kernel and ended it.
    const textDoc = { textDocument: doc.textDocument };
    const range = await ask(5, "textDocument/semanticTokens/range", {
      ...textDoc, range: { start: { line: 0, character: 0 }, end: { line: 1, character: 0 } },
    });
    const delta = await ask(6, "textDocument/semanticTokens/full/delta", { ...textDoc, previousResultId: "1" });
    const full = await ask(7, "textDocument/semanticTokens/full", textDoc);
    check(
      "a request the provider declines by sub-key is answered here, and the full one still served",
      range?.error?.code === -32601 && delta?.error?.code === -32601 && Array.isArray(full?.result?.data) && live.exitCode === null,
      `range ${JSON.stringify(range?.error ?? range?.result ?? "no reply")}; delta ${JSON.stringify(delta?.error ?? "no reply")}; full ${full ? "answered" : "none"}; exit ${live.exitCode}`,
    );
    // A frame split across writes, and two frames in one: the launcher reads
    // whole frames before deciding anything, however the bytes arrive.
    const split = frame({ jsonrpc: "2.0", id: 8, method: "textDocument/hover", params: doc });
    live.stdin.write(split.slice(0, 7));
    await new Promise((r) => setTimeout(r, 50));
    live.stdin.write(split.slice(7, 40));
    await new Promise((r) => setTimeout(r, 50));
    live.stdin.write(split.slice(40) + frame({ jsonrpc: "2.0", id: 9, method: "textDocument/hover", params: doc }));
    const pair = await ask(9, "textDocument/hover", doc);
    check(
      "frames split across writes, or sharing one, are each answered",
      Boolean(replies.get(8)?.result) && Boolean(pair?.result),
      `8 ${replies.has(8) ? "answered" : "none"}; 9 ${pair ? "answered" : "none"}`,
    );
    live.kill();

    // A kernel that replies and exits at once. With stdio piped through the
    // launcher, it exited on the kernel's 'exit' — before reading the rest of
    // the kernel's output, and before its own writes to the client drained —
    // so a reply the kernel had sent never arrived.
    const lastWords = spawn(process.execPath, [join(root, "scripts", "lsp-server.mjs")], {
      env: { ...clean, WOLFRAM_MCP_LSP: "1", WOLFRAM_MCP_KERNEL: fakeKernel, FAKE_LSP_LAST_WORDS: "1" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let received = 0;
    lastWords.stdout.on("data", (chunk) => (received += chunk.length));
    lastWords.stdin.write(frame({ jsonrpc: "2.0", id: 1, method: "initialize", params: { capabilities: {} } }));
    await new Promise((r) => setTimeout(r, 300));
    lastWords.stdin.write(frame({ jsonrpc: "2.0", id: 2, method: "textDocument/hover", params: doc }));
    const exited = await new Promise((resolve) => {
      lastWords.once("close", (code) => resolve(code));
      setTimeout(() => resolve("hung"), 15_000);
    });
    check(
      "a reply the kernel sent just before exiting still reaches the client",
      received > 4_000_000 && exited === 0,
      `${received} byte(s) received; exit ${exited}`,
    );

    // The flags are the ones Wolfram's own VS Code extension starts LSPServer
    // with. The launcher passed -nostartuppackets, which the kernel ignores
    // without a word, so startup paclets still loaded.
    const argv = existsSync(join(home, "lsp-argv.json"))
      ? JSON.parse(readFileSync(join(home, "lsp-argv.json"), "utf8"))
      : [];
    check(
      "the LSP kernel starts with -nostartuppaclets, spelled as the kernel knows it",
      argv.includes("-nostartuppaclets") && !argv.some((arg) => /^-nostartup(?!paclets$)/.test(arg)),
      argv.filter((arg) => arg.startsWith("-")).join(" "),
    );
  }

  // Discovery that fails must fail the server visibly — exit nonzero with the
  // reason on stderr — so it lands in the /plugin Errors tab, not in a hang.
  const lost = spawn(process.execPath, [join(root, "scripts", "lsp-server.mjs")], {
    env: { ...process.env, WOLFRAM_MCP_LSP: "1", WOLFRAM_MCP_KERNEL: join(home, "no-such-kernel") },
    stdio: ["pipe", "pipe", "pipe"],
  });
  const said = [];
  lost.stderr.on("data", (d) => said.push(d));
  const lostCode = await Promise.race([
    new Promise((resolve) => lost.once("exit", resolve)),
    new Promise((r) => setTimeout(() => r("hung"), 5000)),
  ]);
  check("a kernel that cannot be found exits the server, not hangs it", lostCode === 1, `exit=${lostCode}`);
  check(
    "and says so on stderr, where the /plugin Errors tab will show it",
    /no usable Wolfram installation/.test(Buffer.concat(said).toString()),
    Buffer.concat(said).toString().split("\n").slice(-2).join(" | ").slice(0, 90),
  );
}

// ---------------------------------------------------------------------------
// The plugin runs two servers off one discovery, and the guarantee is that they
// name the same installation. The lsp entry once read process.env directly, a
// narrower and unfiltered set than the MCP side's loadConfig, so a user who set
// only the WOLFRAM_KERNEL_PATH alias, or whose host passed an unsubstituted
// ${...}, got the two halves pointed at different kernels. discoverLspKernel now
// resolves through the same loadConfig; this pins that it agrees with it.
heading("The lsp entry discovers the kernel the MCP side would");
{
  const lsp = await import(join(root, "dist", "lsp.js"));
  const keys = [
    "WOLFRAM_MCP_KERNEL",
    "WOLFRAM_KERNEL_PATH",
    "WOLFRAM_MCP_VERSION",
    "WOLFRAM_MCP_MIN_VERSION",
  ];
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const setEnv = (env) => {
    for (const key of keys) {
      if (env[key] === undefined) delete process.env[key];
      else process.env[key] = env[key];
    }
  };
  try {
    // The alias loadConfig reads but the raw-env lsp did not: with only it set,
    // the LSP must still select that kernel, not fall through to auto-detect.
    setEnv({ WOLFRAM_KERNEL_PATH: fakeKernel });
    check(
      "the lsp entry honours the WOLFRAM_KERNEL_PATH alias the MCP side reads",
      lsp.discoverLspKernel(() => {})?.bin === fakeKernel,
      lsp.discoverLspKernel(() => {})?.bin ?? "(none)",
    );
    // An unsubstituted placeholder is not a path: loadConfig treats it as unset,
    // so discovery falls through to the alias rather than failing on a literal
    // ${...} and exiting into the client's restart loop.
    setEnv({ WOLFRAM_MCP_KERNEL: "${user_config.kernel}", WOLFRAM_KERNEL_PATH: fakeKernel });
    check(
      "and ignores an unsubstituted ${...} placeholder, as the MCP side does",
      lsp.discoverLspKernel(() => {})?.bin === fakeKernel,
      lsp.discoverLspKernel(() => {})?.bin ?? "(none)",
    );
  } finally {
    setEnv(saved);
  }
}

// ---------------------------------------------------------------------------
// A kernel spawns children of its own — the notebook front-end MathLink
// launches for WriteNotebook — and close() used to signal only the kernel pid,
// so that front-end was orphaned to init, where its SharedMemory link
// busy-polls a dead peer at 100% CPU forever (measured once at ~50 minutes on
// one core). The kernel is now a process-group leader and close() signals the
// group, so its descendants die with it. Driven at the transport with a
// stand-in that spawns a long-lived child, because the fake kernel has no
// front-end to leak.
heading("Killing a kernel reaps the children it spawned, not just the kernel");
{
  const { FilteringStdioTransport } = await import(join(root, "dist", "transport.js"));
  const pidFile = join(home, "grandchild.pid");
  rmSync(pidFile, { force: true });
  // A stand-in for the kernel: it spawns a child that would outlive it, records
  // the child's pid, then stays alive on stdin. The child is a plain spawn, so
  // it joins the stand-in's process group — reachable only by a group signal.
  const standIn =
    "const {spawn}=require('node:child_process');const fs=require('node:fs');" +
    "const c=spawn(process.execPath,['-e','setInterval(()=>{},1e9)'],{stdio:'ignore'});" +
    `fs.writeFileSync(${JSON.stringify(pidFile)},String(c.pid));process.stdin.resume();`;
  const transport = new FilteringStdioTransport({ command: process.execPath, args: ["-e", standIn] });
  const alive = (pid) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  };
  // writeFileSync truncates before it writes, so a read can land between the
  // two and see "". Number("") is 0, which passed Number.isInteger, and the
  // cleanup below then sent SIGKILL to pid 0 — this suite's own process group.
  // Only a complete positive integer is a pid; anything else is "not yet".
  const parsePid = (text) => (/^[1-9]\d*$/.test(text.trim()) ? Number(text.trim()) : undefined);
  check(
    "a torn or empty pid file is never read as a signal target",
    ["", " ", "0", "-1", "12a", "1.5"].every((torn) => parsePid(torn) === undefined) && parsePid("4321\n") === 4321,
  );
  await transport.start();
  let gpid;
  for (let i = 0; i < 200 && gpid === undefined; i++) {
    if (existsSync(pidFile)) gpid = parsePid(readFileSync(pidFile, "utf8"));
    if (gpid === undefined) await new Promise((r) => setTimeout(r, 10));
  }
  check("the stand-in kernel spawned a child", gpid !== undefined && alive(gpid), `pid=${gpid}`);
  try {
    await transport.close();
    let reaped = false;
    for (let i = 0; i < 200 && !reaped; i++) {
      if (!alive(gpid)) reaped = true;
      else await new Promise((r) => setTimeout(r, 10));
    }
    check(
      "and its child is reaped with it, not left orphaned to spin",
      reaped,
      reaped ? "" : `child ${gpid} survived close()`,
    );
  } finally {
    // Never leak the stand-in child, even if the reap above failed.
    if (gpid !== undefined) {
      try {
        process.kill(gpid, "SIGKILL");
      } catch {
        /* already gone */
      }
    }
  }
}

// A close() that lands between fork and Node's 'spawn' event returned early and
// dropped the handle, so the child ran on — a kernel holding its licence seat
// after its server had stopped it. start() is not awaited here on purpose: the
// child exists from the moment start() is called.
heading("Closing a transport before its spawn is confirmed still stops the child");
{
  const { FilteringStdioTransport } = await import(join(root, "dist", "transport.js"));
  const early = new FilteringStdioTransport({
    command: process.execPath,
    args: ["-e", "setInterval(() => {}, 1e9)"],
  });
  const starting = early.start().catch(() => {});
  const pid = early.pid;
  await early.close();
  await starting;
  const living = (p) => {
    try {
      process.kill(p, 0);
      return true;
    } catch {
      return false;
    }
  };
  let gone = false;
  for (let i = 0; i < 100 && !gone; i++) {
    if (pid === undefined || !living(pid)) gone = true;
    else await new Promise((r) => setTimeout(r, 20));
  }
  check("a child closed before its spawn event is stopped", pid !== undefined && gone, `pid=${pid}`);
  if (!gone && pid !== undefined) process.kill(pid, "SIGKILL");
}

// ---------------------------------------------------------------------------
// The single-file bundle is the distributed deliverable — a marketplace entry,
// a GitHub release, a VS Code config all point at it — so the artifact itself
// is what gets driven here, not the sources it was built from. Fresh-built
// every run: a stale artifact passing is worse than no check.
heading("The bundle is the deliverable, and the suite drives the bundle");
{
  wipeCache();
  const built = spawnSync(process.execPath, [join(root, "scripts", "bundle-js.mjs")], {
    encoding: "utf8",
  });
  check("the bundle builds", built.status === 0, (built.stderr || built.stdout).slice(0, 90).trim());
  const artifact = join(root, "bundle", "wolfram-mcp-server.mjs");

  // Two builds of one version are two programs. The socket was keyed on the
  // package version alone, so a broker started by this checkout's dist/ — the
  // repo's own .mcp.json server, of the same version — served the installed
  // release's sessions on the same machine with the working tree's code. Each
  // build's code is now part of the key.
  {
    const runtime = privateDir(join(home, "run-build-identity"));
    const socketOf = (program) =>
      /socket\s+(\S+)/.exec(
        spawnSync(process.execPath, [program, "doctor"], {
          encoding: "utf8",
          env: { ...process.env, HOME: home, WOLFRAM_MCP_KERNEL: fakeKernel, WOLFRAM_MCP_SHARE: "1",
            XDG_RUNTIME_DIR: runtime, MCP_SERVER_NAME: "WolframLanguage" },
          timeout: 60_000,
        }).stdout ?? "",
      )?.[1];
    const fromBundle = socketOf(artifact);
    const fromDist = socketOf(entry);
    check(
      "a bundle and a clone of the same version meet different brokers",
      Boolean(fromBundle) && Boolean(fromDist) && fromBundle !== fromDist,
      `bundle ${fromBundle?.split("/").pop()} | dist ${fromDist?.split("/").pop()}`,
    );
    signalOwnBrokers("SIGTERM", runtime);
  }

  // The identity is injected at build time; a download has no package.json.
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const version = spawnSync(process.execPath, [artifact, "--version"], { encoding: "utf8" });
  check(
    "and knows its version with no package.json beside it",
    version.stdout.trim() === pkg.version,
    version.stdout.trim() || version.stderr.slice(0, 60),
  );

  // The bundle is launched directly, so it bypasses the scripts/*.mjs launchers
  // that carry the Node-floor guard for the source clone — it has to carry its
  // own, or an old-Node user of the one file a release delivers gets a raw crash
  // instead of the instruction. The floor is engines' to state, and every entry
  // point has to refuse what sits just under it: Node 16 sat under every floor
  // this package ever had, so faking it passed a guard left at 18.17 after
  // engines moved to 22.13. process.versions.node is read-only by assignment
  // but redefinable, so a child fakes the version and then imports the entry.
  const floor = /(\d+)\.(\d+)\.\d+/.exec(pkg.engines.node);
  const belowFloor = `${floor[1]}.${Number(floor[2]) - 1}.0`;
  const underFloor = (file, argv, env = {}) =>
    spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `process.argv=${JSON.stringify([process.execPath, file, ...argv])};` +
          `Object.defineProperty(process.versions,'node',{value:'${belowFloor}',configurable:true});` +
          `await import(${JSON.stringify(pathToFileURL(file).href)});`,
      ],
      { encoding: "utf8", timeout: 15_000, input: "", env: { ...process.env, ...env } },
    );
  const instruction = new RegExp(`needs Node ${floor[1]}\\.${floor[2]} or newer`);
  // The bundle and the MCP launcher would otherwise answer --version and exit
  // 0; the LSP launcher would serve its no-seat stub. So a missing or stale
  // guard fails here rather than passing on a clean exit.
  for (const [label, file, argv, env] of [
    ["the bundle", artifact, ["--version"], {}],
    ["the MCP launcher", join(root, "scripts", "mcp-server.mjs"), ["--version"], {}],
    ["the LSP launcher", join(root, "scripts", "lsp-server.mjs"), [], { WOLFRAM_MCP_LSP: "0" }],
  ]) {
    const old = underFloor(file, argv, env);
    check(
      `${label} refuses Node ${belowFloor} with an instruction, not a crash`,
      old.status === 1 && instruction.test(old.stderr),
      `exit=${old.status} ${(old.stderr || "").slice(0, 80).trim()}`,
    );
  }

  // MCP over real stdio, served by the one file: the tool list from the
  // cold-start table, then an evaluation whose kernel is spawned by the
  // bundle's own code.
  const s = await connect({}, artifact);
  const { tools } = await s.client.listTools();
  check(
    "the bundled server lists the cold-start tools",
    upstreamTools(tools).some((t) => t.name === "WolframLanguageEvaluator") && hasStatusTool(tools),
    tools.map((t) => t.name).join(", ").slice(0, 80),
  );
  const answer = await s.client.callTool(
    { name: "WolframLanguageEvaluator", arguments: { code: "1+1" } },
    undefined,
    { timeout: 30_000 },
  );
  check("and evaluates through a kernel it spawned itself", answeredByFake(answer));
  await s.client.close();
  await new Promise((r) => setTimeout(r, 300));

  // A stuck user of the single file has no clone and no npm script, so its
  // diagnostics have to name the file's own doctor subcommand — and that
  // command has to run.
  {
    const lost = await connect({ WOLFRAM_MCP_KERNEL: join(home, "no-such-kernel") }, artifact);
    const said = await lost.client.callTool({ name: "wolfram_status", arguments: {} });
    await lost.client.close();
    const text = said.content?.[0]?.text ?? "";
    const named = /run (node "[^"]+" doctor)\./.exec(text)?.[1];
    check(
      "the bundle's diagnostics name its own doctor, by path",
      named === `node "${artifact}" doctor`,
      named ?? text.split("\n").slice(-2).join(" "),
    );
    const ran = spawnSync(process.execPath, [artifact, "doctor"], {
      encoding: "utf8",
      env: { ...process.env, WOLFRAM_MCP_KERNEL: join(home, "no-such-kernel") },
      timeout: 30_000,
    });
    check(
      "and that command runs, reporting rather than crashing",
      ran.status === 1 && ran.stdout.includes("Selected kernel"),
      `exit=${ran.status} ${(ran.stderr || "").trim().slice(0, 60)}`,
    );
  }

  // The lsp subcommand, no-seat mode, from the same file: the handshake must
  // answer with clean stdout and honour the spec's exit contract, because this
  // is the entry an archive-installed plugin's .lsp.json points at.
  const frame = (msg) => {
    const body = JSON.stringify(msg);
    return `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;
  };
  const stub = spawn(process.execPath, [artifact, "lsp"], {
    env: { ...process.env, WOLFRAM_MCP_LSP: "0" },
    stdio: ["pipe", "pipe", "pipe"],
  });
  const out = [];
  stub.stdout.on("data", (d) => out.push(d));
  const exited = new Promise((resolve) => stub.once("exit", resolve));
  stub.stdin.write(frame({ jsonrpc: "2.0", id: 1, method: "initialize", params: { capabilities: {} } }));
  stub.stdin.write(frame({ jsonrpc: "2.0", id: 2, method: "shutdown", params: null }));
  stub.stdin.write(frame({ jsonrpc: "2.0", method: "exit", params: null }));
  const code = await Promise.race([exited, new Promise((r) => setTimeout(() => r("hung"), 5000))]);
  const stdout = Buffer.concat(out).toString();
  check(
    "the bundled lsp subcommand answers the no-seat handshake",
    /"id":1.*"capabilities":\{\}/.test(stdout) && code === 0,
    `exit=${code} ${JSON.stringify(stdout.slice(0, 60))}`,
  );
}

// ---------------------------------------------------------------------------
// CI skips the test and build jobs for a change that is only prose. The rule
// errs towards running: what decides it is whether a test reads the file or a
// user is shipped it, and the plugin's skills are both — the doctor skill's
// command is run below exactly as written.
heading("CI runs the tests for anything but prose");
{
  const { needsTests } = await import(join(root, "scripts", "ci-changes.mjs"));
  const cases = [
    [["docs/plan.md"], false, "a docs-only change"],
    [["README.md", "AGENTS.md", "docs/next-session.md"], false, "several prose files"],
    [["plugin/skills/doctor/SKILL.md"], true, "a plugin skill, which is shipped and run"],
    [["plugin/README.md"], true, "the plugin's README, which is in the archive"],
    [["test/fixture.md"], true, "markdown a test may read"],
    [["docs/plan.md", "src/proxy.ts"], true, "prose with source"],
    [[".github/workflows/ci.yml"], true, "the workflow itself"],
    [["LICENSE"], true, "a file that is not markdown"],
    [[], true, "a diff that could not be computed"],
    [["plugin/skills/doctor/SKILL.md", "docs/doctor.md"], true, "a skill renamed out of plugin/"],
  ];
  const wrong = cases.filter(([paths, expected]) => needsTests(paths) !== expected);
  check(
    "prose alone skips the tests; skills, sources and anything unknown run them",
    wrong.length === 0,
    wrong.map(([, expected, label]) => `${label}: expected ${expected}`).join("; ") ||
      `${cases.length} cases`,
  );
  const asCi = (input) =>
    spawnSync(process.execPath, [join(root, "scripts", "ci-changes.mjs")], {
      input,
      encoding: "utf8",
    }).stdout.trim();
  check(
    "and the command answers from paths on stdin",
    asCi("docs/plan.md\nREADME.md\n") === "false" &&
      asCi("docs/plan.md\nplugin/skills/wolfram-setup/SKILL.md\n") === "true" &&
      asCi("") === "true",
    `${asCi("docs/plan.md\n")} / ${asCi("plugin/README.md\n")} / ${asCi("")}`,
  );

  // What CI runs, against a real repository: git's rename detection reports
  // only a rename's destination, so a skill moved out of plugin/ read as one
  // docs file and skipped the tests.
  const repo = join(home, "ci-changes-repo");
  mkdirSync(join(repo, "plugin", "skills", "doctor"), { recursive: true });
  const git = (...args) =>
    spawnSync("git", args, {
      cwd: repo,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "suite",
        GIT_AUTHOR_EMAIL: "suite@example.invalid",
        GIT_COMMITTER_NAME: "suite",
        GIT_COMMITTER_EMAIL: "suite@example.invalid",
      },
    });
  git("init", "-q");
  writeFileSync(join(repo, "plugin", "skills", "doctor", "SKILL.md"), "# doctor\n\nrun it\n");
  writeFileSync(join(repo, "README.md"), "# readme\n");
  git("add", "-A");
  git("commit", "-q", "-m", "base");
  mkdirSync(join(repo, "docs"), { recursive: true });
  git("mv", "plugin/skills/doctor/SKILL.md", "docs/doctor.md");
  git("commit", "-q", "-m", "move a skill out of the plugin");
  writeFileSync(join(repo, "README.md"), "# readme, reworded\n");
  git("commit", "-q", "-am", "prose only");
  const onRange = (range) =>
    spawnSync(process.execPath, [join(root, "scripts", "ci-changes.mjs"), range], {
      cwd: repo,
      encoding: "utf8",
    });
  const renamed = onRange("HEAD~2...HEAD~1").stdout.trim();
  const prose = onRange("HEAD~1...HEAD").stdout.trim();
  const unknown = onRange("no-such-ref...HEAD");
  check(
    "a skill renamed out of plugin/ runs the tests, where prose alone skips them",
    renamed === "true" && prose === "false",
    `rename=${renamed} prose=${prose}`,
  );
  check(
    "and a range git cannot read runs them, saying why",
    unknown.stdout.trim() === "true" && /could not list the changes/.test(unknown.stderr),
    unknown.stderr.trim().slice(0, 80),
  );
}

// ---------------------------------------------------------------------------
// A release is built from release-please's release branch, as a numbered
// pre-release of the version it computed, or from a v<version> tag. Claude Code
// updates an installed plugin when its manifest's version string changes, so
// two builds of one branch must never carry the same version, and nothing
// before 1.0.0 may be published as a supported release.
heading("Every release build is named, and the name is in every file");
{
  const { releaseVersion, stamp } = await import(join(root, "scripts", "release-version.mjs"));
  const tags = ["v0.2.0-pre.1", "v0.2.0-pre.3", "v0.3.0-pre.9", "v0.2.0-pre.x", "v0.1.0"];
  const rpBranch = "release-please--branches--main";
  const branch = releaseVersion({ ref: rpBranch, refType: "branch", tags, packageVersion: "0.2.0" });
  check(
    "release-please's branch builds the next pre-release of the version it computed, and tags it",
    branch.version === "0.2.0-pre.4" && branch.tag === "v0.2.0-pre.4" && branch.prerelease && branch.create,
    JSON.stringify(branch),
  );
  check(
    "and the first build of a version is pre.1",
    releaseVersion({ ref: rpBranch, refType: "branch", tags, packageVersion: "1.4.0" }).version === "1.4.0-pre.1",
  );
  const named = (ref, refType, packageVersion = "0.2.0") => {
    try {
      return releaseVersion({ ref, refType, tags, packageVersion });
    } catch (err) {
      return err.message;
    }
  };
  check(
    "a tag builds that release, a pre-release below 1.0.0 or with a suffix",
    named("v0.2.0", "tag").prerelease === true &&
      named("v1.0.0", "tag").prerelease === false &&
      named("v1.1.0-rc.1", "tag").prerelease === true &&
      named("v1.0.0", "tag").create === false,
  );
  check(
    "a release branch whose version is already released builds nothing",
    /already released/.test(named(rpBranch, "branch", "0.1.0")),
    String(named(rpBranch, "branch", "0.1.0")),
  );
  check(
    "and anything else names no release",
    [named("release/0.2.0", "branch"), named(rpBranch, "branch", "0.2.0-pre.1"), named("main", "branch"), named("0.2.0", "tag")]
      .every((result) => typeof result === "string" && /names no release/.test(result)),
  );

  const readJson = (dir, file) => JSON.parse(readFileSync(join(dir, file), "utf8"));
  const rpConfig = readJson(root, "release-please-config.json");

  // Until the first release, release-please finds no release matching the
  // manifest's 0.0.0 to bump from and proposes its initial-version, 1.0.0
  // unless configured. Unconfigured, it titled the first release PR "release
  // 1.0.0", bumping the tree past the whole 0.x series before anything was
  // released. release-please moves the manifest off 0.0.0 when it releases, so
  // 0.0.0 (or no entry) is the no-release state, and after it initial-version
  // is inert. A stamped tree carries a -pre suffix, so only x.y.z is compared.
  const manifest = join(root, ".release-please-manifest.json");
  const released = existsSync(manifest) ? readJson(root, ".release-please-manifest.json")["."] : undefined;
  const firstVersion = rpConfig.packages["."]["initial-version"] ?? "1.0.0";
  const treeVersion = readJson(root, "package.json").version.replace(/-.*$/, "");
  check(
    "before the first release, release-please proposes the version the tree carries",
    (released !== undefined && released !== "0.0.0") || firstVersion === treeVersion,
    `first release ${firstVersion}, tree ${treeVersion}`,
  );

  // Stamped into a copy, never this checkout. The files are the ones
  // release-please bumps, so a pre-release and a release carry the version in
  // the same places.
  const tree = join(home, "stamp-tree");
  const extras = rpConfig.packages["."]["extra-files"].map((extra) => extra.path);
  for (const file of ["package.json", "package-lock.json", "release-please-config.json", ...extras]) {
    mkdirSync(dirname(join(tree, file)), { recursive: true });
    writeFileSync(join(tree, file), readFileSync(join(root, file)));
  }
  stamp("0.2.0-pre.4", tree);
  const read = (file) => readJson(tree, file);
  const lock = read("package-lock.json");
  const unstamped = extras.filter((file) => read(file).version !== "0.2.0-pre.4");
  check(
    "a build's version is stamped into the package, its lockfile, and every file release-please bumps",
    read("package.json").version === "0.2.0-pre.4" &&
      lock.version === "0.2.0-pre.4" && lock.packages[""].version === "0.2.0-pre.4" &&
      extras.length >= 1 && unstamped.length === 0,
    unstamped.join(", ") || `${extras.length} extra file(s)`,
  );
}

// ---------------------------------------------------------------------------
// The version is decided by commit types: fix: bumps the patch, feat: the
// minor, and docs:, test: and the rest nothing. A commit typed docs: that
// edits a skill would ship in no release — the installed plugin changes and
// its version does not — so a type that bumps nothing may not touch what ships.
heading("A commit that changes what ships carries a type that bumps the version");
{
  const { mistyped, bumpingTypes, commitsIn } = await import(join(root, "scripts", "commit-types.mjs"));
  const bumping = bumpingTypes();
  check(
    "the types that bump are release-please's visible sections: fix, feat, revert, not docs",
    ["fix", "feat", "revert"].every((type) => bumping.includes(type)) && !bumping.includes("docs") && !bumping.includes("test"),
    bumping.join(", "),
  );
  const ok = (message, paths, ships = false) => mistyped([{ message, paths, ships }]).length === 0;
  check(
    "docs: on prose passes, and on a skill, the server or the licence fails",
    ok("docs: record a ledger row", ["docs/plugin-plan.md"]) &&
      !ok("docs: teach the setup skill activation", ["plugin/skills/wolfram-setup/SKILL.md"]) &&
      !ok("test: tweak", ["test/smoke.mjs", "src/proxy.ts"]) &&
      !ok("chore: reword", ["LICENSE"]) &&
      !ok("chore: raise the target", ["tsconfig.json"]),
  );
  check(
    "fix:, feat: and a breaking change may touch anything",
    ok("fix: guard the LSP", ["src/lsp.ts"]) &&
      ok("feat(plugin): add a skill", ["plugin/skills/new/SKILL.md"]) &&
      ok("chore!: drop Node 20", ["src/index.ts"]) &&
      ok("chore: drop Node 20\n\nBREAKING CHANGE: Node 22 is the floor", ["src/index.ts"]),
  );
  check(
    "git's own revert takes the reverted commit's type",
    ok('Revert "fix: guard the LSP"', ["src/lsp.ts"]) &&
      !ok('Revert "docs: edit a skill"', ["plugin/skills/x/SKILL.md"]),
  );
  check(
    "a package change that ships fails under chore:, one that does not passes",
    !ok("chore(deps): bump the SDK", ["package-lock.json"], true) &&
      ok("chore(deps): bump eslint", ["package.json", "package-lock.json"], false),
  );
  let asked = 0;
  mistyped([{ message: "fix: bump the SDK", paths: ["package.json"], ships: () => (asked++, true) }]);
  check("and whether it ships is asked only of a commit whose type would not bump", asked === 0);
  check(
    "release-please's own release commit, which writes the manifest's version, passes",
    ok("chore(main): release 0.2.0", ["plugin/.claude-plugin/plugin.json", "package.json"]),
  );
  check(
    "and a subject that is not a Conventional Commit fails",
    !ok("Update SKILL.md", ["plugin/skills/x/SKILL.md"]) && !ok("tidy up", ["docs/x.md"]),
  );

  // Read from git as CI reads it, in a repository of its own whose identity
  // and settings are pinned: a global signing key or hook must not decide it.
  const repo = join(home, "commit-types-repo");
  mkdirSync(repo, { recursive: true });
  const git = (...args) => {
    const run = spawnSync("git", ["-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", ...args], {
      cwd: repo,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "suite",
        GIT_AUTHOR_EMAIL: "suite@example.invalid",
        GIT_COMMITTER_NAME: "suite",
        GIT_COMMITTER_EMAIL: "suite@example.invalid",
      },
    });
    if (run.status !== 0) throw new Error(`git ${args.join(" ")}: ${run.stderr}`);
    return run.stdout.trim();
  };
  const commit = (message, file, content) => {
    mkdirSync(dirname(join(repo, file)), { recursive: true });
    writeFileSync(join(repo, file), content);
    git("add", "-A");
    git("commit", "-q", "-m", message);
  };
  git("init", "-q", "-b", "main");
  commit("chore: start", "README.md", "x\n");
  commit("docs: an old skill edit, already published", "plugin/a/SKILL.md", "a\n");
  git("tag", "v0.2.0-pre.1");
  const branchPoint = git("rev-parse", "HEAD");
  git("checkout", "-q", "-b", "feature");
  commit("docs: edit a skill", "plugin/b/SKILL.md", "b\n");
  commit("fix: the server", "src/x.ts", "x\n");
  // The base moves on after the branch point, as main does.
  git("checkout", "-q", "main");
  commit("docs: the base's own skill edit", "plugin/c/SKILL.md", "c\n");
  const base = git("rev-parse", "HEAD");
  const read = commitsIn(base, "feature", repo).map((c) => c.message);
  check(
    "only the commits the pull request adds are read, not the base's own since the branch point",
    read.length === 2 && read.includes("docs: edit a skill") && !read.includes("docs: the base's own skill edit"),
    JSON.stringify(read),
  );
  const fromStart = commitsIn(git("rev-list", "--max-parents=0", "HEAD"), "feature", repo).map((c) => c.message);
  check(
    "and a commit already inside a published build is not judged again",
    !fromStart.includes("docs: an old skill edit, already published") && fromStart.includes("docs: edit a skill"),
    JSON.stringify(fromStart),
  );
  check(
    "each commit carries the paths it touches",
    commitsIn(branchPoint, "feature", repo).some((c) => c.message === "docs: edit a skill" && c.paths.includes("plugin/b/SKILL.md")),
  );
  // The bundle inlines the production dependencies, so changing one ships;
  // a devDependency does not, and must not force a release.
  const pkg = (fields) => `${JSON.stringify({ description: "a server", ...fields })}\n`;
  const lock = (packages) => `${JSON.stringify({ packages })}\n`;
  git("checkout", "-q", "feature");
  commit("chore: add the package", "package.json", pkg({ dependencies: { sdk: "1.0.0" }, devDependencies: { eslint: "9.0.0" } }));
  commit("chore: add the lockfile", "package-lock.json", lock({ "": {}, "node_modules/sdk": { version: "1.0.0" } }));
  const beforeDeps = git("rev-parse", "HEAD");
  commit("chore(deps): bump eslint", "package.json", pkg({ dependencies: { sdk: "1.0.0" }, devDependencies: { eslint: "10.0.0" } }));
  commit("chore(deps): re-resolve a dev-optional package", "package-lock.json",
    lock({ "": {}, "node_modules/sdk": { version: "1.0.0" }, "node_modules/fsevents": { version: "2.3.3", devOptional: true } }));
  commit("chore(deps): bump the SDK", "package.json", pkg({ dependencies: { sdk: "1.1.0" }, devDependencies: { eslint: "10.0.0" } }));
  commit("chore: reword the description", "package.json", pkg({ description: "the server", dependencies: { sdk: "1.1.0" }, devDependencies: { eslint: "10.0.0" } }));
  const ships = Object.fromEntries(commitsIn(beforeDeps, "feature", repo).map((c) => [c.message, c.ships()]));
  check(
    "a production dependency or the description ships; a devDependency or a dev-optional package does not",
    ships["chore(deps): bump the SDK"] === true && ships["chore: reword the description"] === true &&
      ships["chore(deps): bump eslint"] === false && ships["chore(deps): re-resolve a dev-optional package"] === false,
    JSON.stringify(ships),
  );
}

// ---------------------------------------------------------------------------
// "Not published to npm" is a decision this repo states in prose and enforces
// nowhere, and it has already been contradicted once by a check asserting an
// npx invocation was present. `private` is the machine-readable form of it.
//
// Note what this does and does not establish. `npm publish --dry-run` on npm
// 10.9.8 does not test the flag at all — measured, a private and a non-private
// scratch package produced identical output — so the refusal cannot be observed
// here without really publishing. What is checked is that the field is set, so
// a later edit cannot quietly drop it.
heading("Packaging matches the not-published decision");
{
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  check("package.json is marked private", pkg.private === true, `private=${pkg.private}`);
}

// ---------------------------------------------------------------------------
heading("CLI");
{
  const { spawnSync } = await import("node:child_process");
  const run = (args) =>
    spawnSync(process.execPath, [entry, ...args], { encoding: "utf8", env: { ...process.env } });

  const help = run(["--help"]);
  check("--help exits 0", help.status === 0);
  // The LSP went on by default (plugin plan D23) and --help still called it off
  // by default, so a user reading it to keep the seat would not have switched it
  // off. Asked of lspDecision itself, so the text follows the behaviour.
  const lspHelp = help.stdout.slice(help.stdout.indexOf(" lsp "), help.stdout.indexOf("session-status"));
  const lspDefault = lib.lspDecision({}).enabled;
  check(
    "--help states the LSP's default as it actually is",
    lspHelp.includes(lspDefault ? "on by default" : "off by default") &&
      !lspHelp.includes(lspDefault ? "off by default" : "on by default"),
    lspHelp.replace(/\s+/g, " ").trim().slice(0, 90),
  );
  // This package is not published, so an `npx wolfram-mcp-server` line cannot
  // work for anyone — and --help used to print one as the configuration to
  // paste, with this check keeping it there. What it must name is a clone.
  check(
    "--help names no npx invocation",
    !help.stdout.includes("npx"),
    help.stdout.includes("npx") ? "npx is still offered" : "",
  );
  check(
    "--help gives a configuration that can actually run",
    help.stdout.includes("dist/index.js"),
    help.stdout.split("\n").filter((l) => /command|args/.test(l)).join(" | ").slice(0, 80),
  );

  // A table in config.ts, not a variable, and the reason this cannot simply
  // match every SHOUTING_NAME in sight.
  const NOT_A_VARIABLE = new Set(["MCP_SERVERS"]);
  const envNames = (text) => {
    const found = new Set();
    // Every family the code actually reads. It used to be WOLFRAM* plus two
    // names, which left the variables AgentTools itself reads — MCP_APPS_*,
    // LLMKIT_ENABLED — outside the check entirely, along with the platform
    // directories.
    for (const [, name] of text.matchAll(
      /\b(WOLFRAM[A-Z_]*|WOLFRAMSCRIPT_[A-Z_]+|MCP_[A-Z_]+|LLMKIT_[A-Z_]+|XDG_[A-Z_]+|LOCALAPPDATA|APPDATA|ProgramFiles)\b/g,
    )) {
      if (name.length > 8 && !NOT_A_VARIABLE.has(name)) found.add(name);
    }
    return found;
  };
  const sourceText = readdirSync(join(root, "src"))
    .filter((f) => f.endsWith(".ts"))
    .map((f) => readFileSync(join(root, "src", f), "utf8"))
    .join("\n");

  // `--help` is where somebody looks when a knob did not work, and nothing
  // checked it: WOLFRAM_MCP_LOG existed, was documented, and was absent from
  // help for as long as it had existed. Read off what --help actually prints,
  // and over all of src/ rather than config.ts: WOLFRAM_MCP_LOG is read in
  // broker-client.ts, and a version of this check that looked only at
  // config.ts passed while that variable was missing — the exact gap it was
  // written to catch. Only the canonical names; the aliases are a courtesy and
  // listing them all would bury the text.
  const canonical = [...envNames(sourceText)].filter((name) => name.startsWith("WOLFRAM_MCP_"));
  const unhelped = canonical.filter((name) => !help.stdout.includes(name)).sort();
  check(
    "--help names every WOLFRAM_MCP_ variable the code reads",
    canonical.length > 0 && unhelped.length === 0,
    unhelped.length ? `missing from --help: ${unhelped.join(", ")}` : `${canonical.length} checked`,
  );

  // doctor is the answer to "what is in effect?", so a variable it cannot show
  // is a variable a stuck user cannot see. doctor prints only the variables
  // that are set, so its output cannot answer this; the array it prints from
  // can. The array itself, not the whole file: a variable named only in a
  // comment is not one doctor can report.
  const varsBlock =
    /const CONFIG_VARS = \[([\s\S]*?)\]/.exec(readFileSync(join(root, "src", "doctor.ts"), "utf8"))?.[1] ?? "";
  const shown = envNames(varsBlock);
  const unreported = [...envNames(readFileSync(join(root, "src", "config.ts"), "utf8"))]
    .filter((name) => !shown.has(name))
    .sort();
  check(
    "doctor can report every variable loadConfig reads",
    shown.size > 0 && unreported.length === 0,
    unreported.length ? `not in CONFIG_VARS: ${unreported.join(", ")}` : "",
  );

  const version = run(["--version"]);
  check("--version prints the package version", version.stdout.trim() === lib.PKG.version);

  const bogus = run(["frobnicate"]);
  check("an unknown command exits non-zero", bogus.status === 2);

  // clear-cache used to remove the tool list and leave the reported facts — the
  // licence seat count, the base directories, the paclet version — in place.
  lib.recordFacts(fakeKernel, {
    version: "15.1.0",
    systemID: "MacOSX-ARM64",
    base: "/fake/base",
    userBase: "/fake/base/userbase",
    localBase: "/fake/base/localbase",
    maxLicenseProcesses: 4,
    licenseType: "Professional",
    networkLicense: false,
    agentTools: "2.2.7",
    wolframID: null,
    cloudConnected: false,
  }, [], () => {});
  check("facts are cached before clearing", lib.readFacts(fakeKernel) !== null);
  const cleared = run(["clear-cache"]);
  check("clear-cache exits 0", cleared.status === 0);
  check("and says it removed both", cleared.stdout.trim().split("\n").length === 2, cleared.stdout.trim());
  check("the probed facts are gone too", lib.readFacts(fakeKernel) === null);
  check("as is the tool list", lib.readCache(suiteKey) === null);
}

// ---------------------------------------------------------------------------
// README calls doctor the first thing to run, and the "no usable Wolfram"
// diagnostic sends every stuck user to it — and nothing had ever executed it.
// The eight mentions of it in this file before now either read its source text
// for CONFIG_VARS or asserted that the string "npm run doctor" appears in a
// message. It could have been crashing on every invocation.
//
// Last in the file on purpose: it starts a kernel, so any check counting kernel
// starts has to come first.
heading("doctor runs, and says what is wrong when something is");
{
  const { spawnSync } = await import("node:child_process");
  const doctor = (extra = {}, omit = []) => {
    const env = {
      PATH: process.env.PATH,
      HOME: home,
      USERPROFILE: home,
      XDG_CACHE_HOME: process.env.XDG_CACHE_HOME,
      LOCALAPPDATA: process.env.LOCALAPPDATA,
      WOLFRAM_MCP_KERNEL: fakeKernel,
      MCP_SERVER_NAME: "WolframLanguage",
      WOLFRAM_MCP_SHARE: "0",
      FAKE_MARKER: marker,
      ...extra,
    };
    for (const key of omit) delete env[key];
    return spawnSync(process.execPath, [entry, "doctor"], { encoding: "utf8", env });
  };

  wipeCache();
  const ok = doctor();
  const said = `${ok.stdout}${ok.stderr}`;
  check("doctor exits 0 when a kernel answers", ok.status === 0, `status=${ok.status}`);
  // Guard the instrumentation: an exit code of 0 from something that silently
  // did nothing would look the same.
  check("it names the kernel it selected", said.includes("fake-kernel.mjs"));
  check("reports the paclet version it probed", said.includes("2.2.7"));

  // WOLFRAM_MCP_INSPECT=0 means a kernel's report is not used; doctor printed it
  // anyway.
  wipeCache();
  const uninspected = doctor({ WOLFRAM_MCP_INSPECT: "0" });
  const uninspectedSaid = `${uninspected.stdout}${uninspected.stderr}`;
  check(
    "with WOLFRAM_MCP_INSPECT=0, doctor uses none of the kernel's report",
    /Installation facts\s+not used \(WOLFRAM_MCP_INSPECT=0\)/.test(uninspectedSaid) &&
      !/AgentTools\s+2\.2\.7/.test(uninspectedSaid),
    uninspectedSaid.split("\n").filter((l) => /AgentTools|not used|Installation facts/.test(l)).join(" | "),
  );
  // An entitlement reaches a kernel through WOLFRAMINIT, and a user diagnosing a
  // licence failure needs to know whether it was set at all — by name, since the
  // value holds the entitlement ID.
  const withInit = doctor({ WOLFRAMINIT: "-pwfile !cloudlm.wolfram.com -entitlement O-SECRET-ID" });
  const withInitSaid = `${withInit.stdout}${withInit.stderr}`;
  check(
    "doctor says WOLFRAMINIT is set, and never what it holds",
    /environment\s+.*WOLFRAMINIT/.test(withInitSaid) && !withInitSaid.includes("O-SECRET-ID"),
    withInitSaid.split("\n").find((l) => /environment/.test(l))?.trim(),
  );
  check("the licence it read", /4 seat\(s\)/.test(said), "");
  check(
    "and the tools the kernel really offered, not a cached list",
    said.includes("WolframLanguageEvaluator"),
  );

  // The state a stuck user is actually in. Every install on the machine is below
  // the floor, so the platform scan finds nothing usable.
  const none = doctor({ WOLFRAM_MCP_MIN_VERSION: "9999" }, ["WOLFRAM_MCP_KERNEL"]);
  const complaint = `${none.stdout}${none.stderr}`;
  check("doctor exits 1 when no kernel is usable", none.status === 1, `status=${none.status}`);
  check("and names the floor that excluded them", complaint.includes("9999"));

  // The variable AgentTools reads and this server does not: a user debugging a
  // timeout needs to see that their own tool options are in effect.
  const withOptions = doctor({ MCP_TOOL_OPTIONS: '{"WolframLanguageEvaluator":{"TimeConstraint":600}}' });
  check(
    "it reports the user's tool options as in effect",
    /MCP_TOOL_OPTIONS/.test(`${withOptions.stdout}${withOptions.stderr}`),
    `${withOptions.stdout}`.split("\n").filter((l) => /environment/.test(l)).join(" ").slice(0, 90),
  );

  // The pool settings belong to whichever session started the broker, so a run
  // that merely attached may not report its own reserve as though it were in
  // force — S4's remnant, plan.md §5.3, and the same mistake as the frozen
  // wolfram_status cache line. Both wordings are checked, because the bug is not
  // that one of them is wrong: it is that they used to be the same sentence.
  const shareRuntime = join(home, "rt-doc");
  privateDir(shareRuntime);
  wipeCache();
  const spawnedIt = doctor({ WOLFRAM_MCP_SHARE: "1", XDG_RUNTIME_DIR: shareRuntime });
  const spawnedSaid = `${spawnedIt.stdout}${spawnedIt.stderr}`;
  check(
    "doctor that started the broker says the reserve it reports is in force",
    /this run started the broker, so its settings are these/.test(spawnedSaid),
    spawnedSaid.split("\n").filter((l) => /reserve/.test(l)).join(" | ").slice(0, 100),
  );

  const attached = doctor({ WOLFRAM_MCP_SHARE: "1", XDG_RUNTIME_DIR: shareRuntime });
  const attachedSaid = `${attached.stdout}${attached.stderr}`;
  // Attaching to a running broker is the normal case; doctor marked it with
  // its warning "!". The marker is for
  // things to act on.
  check(
    "attaching to a running broker is reported plainly, not as a warning",
    /attached to the broker/.test(attachedSaid) && !/!\s*attached to the broker/.test(attachedSaid),
    attachedSaid.split("\n").find((l) => /attached to the broker/.test(l))?.trim().slice(0, 100),
  );
  check(
    "and one that attached says the running broker keeps its own",
    /the running broker[\s\S]{0,40}keeps its own/.test(attachedSaid),
    attachedSaid.split("\n").filter((l) => /reserve/.test(l)).join(" | ").slice(0, 100),
  );

  // A kernel that starts and then never speaks — the shape of a missing paclet.
  // The start timeout is cut to 3s so this costs three seconds, not two minutes.
  const stuck = doctor({ FAKE_MODE: "no-agenttools", WOLFRAM_MCP_START_TIMEOUT_SECONDS: "3" });
  const reason = `${stuck.stdout}${stuck.stderr}`;
  check(
    "doctor exits 1 when the kernel will not finish starting",
    stuck.status === 1,
    `status=${stuck.status}`,
  );
  check(
    "and repeats the kernel's own words rather than paraphrasing",
    /Cannot open Wolfram/.test(reason),
    reason.split("\n").filter((l) => /AgentTools|Cannot open/.test(l)).join(" | ").slice(0, 90),
  );

  // doctor is where every other message sends a user, so it has to say it too.
  const unactivated = doctor({ FAKE_MODE: "unactivated" });
  const unactivatedSaid = `${unactivated.stdout}${unactivated.stderr}`;
  check(
    "doctor names an unactivated kernel, with the kernel's words",
    unactivated.status === 1 &&
      unactivatedSaid.includes("No valid password found.") &&
      /not activated/.test(unactivatedSaid),
    unactivatedSaid.split("\n").filter((l) => /password|activat/.test(l)).join(" | ").slice(0, 120),
  );
}

rmSync(home, { recursive: true, force: true });
console.log(
  failures === 0
    ? `\n${checks} checks across ${sections} sections, all passed.\n`
    : `\n${failures} of ${checks} checks failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
