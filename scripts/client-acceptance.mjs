#!/usr/bin/env node
/**
 * The plugin on exact Claude Code versions: the client floor (plugin plan §5 M1,
 * "Test plan for what M1 acceptance has left", part 1).
 *
 *   npm run release:artifacts
 *   npm run test:client -- login 2.1.224   once: sign in, interactively, in a terminal
 *   npm run test:client -- 2.1.224 2.1.200 headless scenarios on each version
 *
 * The floor is the oldest client the plugin promises to work on. Each version is
 * installed exactly, from npm, into its own prefix under the cache, and every
 * one of them runs with the same test config directory
 * (~/.config/wolfram-mcp-server/claude-test-config), so an old client never
 * reads or rewrites ~/.claude, and one sign-in serves them all. Signing in is
 * yours, by design: `login` opens the client in the terminal for /login
 * and nothing here ever handles a credential. A version that is not signed in
 * stops the run with the command to fix it.
 *
 * The plugin is loaded with --plugin-dir from the extracted release archive, so
 * a client too old for the marketplace commands can still be measured; the
 * archive install route itself is acceptance of its own, once a release exists.
 * Every session gets its own broker directory, caches and broker log, so this
 * repository's own running broker can never answer in the artifact's place.
 *
 * Costs model usage on the signed-in account, and a licence seat per kernel.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cache = join(process.env.XDG_CACHE_HOME || join(homedir(), ".cache"), "wolfram-mcp-server-test");
const config = join(homedir(), ".config", "wolfram-mcp-server", "claude-test-config");
const archive = (() => {
  const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
  return join(root, "release", `wolfram-plugin-${version}.zip`);
})();

let checks = 0;
let failures = 0;
function check(name, ok, detail = "") {
  checks += 1;
  if (!ok) failures += 1;
  process.stdout.write(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}\n`);
}
const short = (value, n = 160) => String(value ?? "").replace(/\s+/g, " ").slice(0, n);
function fail(message) {
  process.stderr.write(`client-acceptance: ${message}\n`);
  process.exit(2);
}

/** That exact client, installed once into its own prefix. */
function client(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) fail(`not a version: ${version}`);
  const prefix = join(cache, `claude-code-${version}`);
  const bin = join(prefix, "node_modules", ".bin", "claude");
  if (!existsSync(bin)) {
    process.stdout.write(`  installing Claude Code ${version}…\n`);
    mkdirSync(prefix, { recursive: true });
    const npm = spawnSync(
      "npm",
      ["install", "--prefix", prefix, "--no-audit", "--no-fund", `@anthropic-ai/claude-code@${version}`],
      { encoding: "utf8" },
    );
    if (npm.status !== 0) fail(`could not install ${version}: ${short(npm.stderr, 400)}`);
  }
  return bin;
}

/**
 * The environment a test client gets: this one, less anything that says it is
 * running inside another Claude Code session. Run from inside one — as an agent
 * does — clients from 2.1.45 to 2.1.74 refused to start at all ("cannot be
 * launched inside another Claude Code session"), and the session's own markers
 * could change how any version behaves, so a whole bisect measured the harness
 * rather than the plugin.
 */
const clientEnv = (extra = {}) => {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([name]) => !/^(CLAUDECODE|CLAUDE_CODE_|CLAUDE_PID$|CLAUDE_EFFORT$|CLAUDE_CONFIG_DIR$)/.test(name),
    ),
  );
  return { ...env, CLAUDE_CONFIG_DIR: config, ...extra };
};

// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
mkdirSync(config, { recursive: true, mode: 0o700 });

if (args[0] === "login") {
  const version = args[1] ?? "2.1.224";
  const bin = client(version);
  process.stdout.write(
    `\nOpening Claude Code ${version} with the test config directory.\n` +
      `Run /login, finish signing in in the browser, then /exit.\n\n`,
  );
  const run = spawnSync(bin, [], { stdio: "inherit", env: clientEnv(), cwd: tmpdir() });
  process.exit(run.status ?? 0);
}

if (args.length === 0) fail("name the versions to test, e.g. npm run test:client -- 2.1.224");
if (!existsSync(archive)) fail(`no ${archive}; run npm run release:artifacts first`);

// The release archive, extracted where no checkout can stand in for a file it lacks.
const work = mkdtempSync(join(tmpdir(), "wmcp-client-"));
const plugin = join(work, "wolfram");
mkdirSync(plugin);
if (spawnSync("unzip", ["-q", archive, "-d", plugin]).status !== 0) fail("could not extract the archive");
// An experiment, not a supported shape: WMCP_STRIP_USERCONFIG=1 removes the
// manifest's userConfig, which clients before 2.1.75 reject outright, to measure
// how far back everything else works.
if (process.env.WMCP_STRIP_USERCONFIG === "1") {
  const manifest = join(plugin, ".claude-plugin", "plugin.json");
  const parsed = JSON.parse(readFileSync(manifest, "utf8"));
  delete parsed.userConfig;
  writeFileSync(manifest, `${JSON.stringify(parsed, null, 2)}\n`);
  process.stdout.write("(experiment: userConfig removed from the manifest)\n");
}
writeFileSync(join(work, "probe.wl"), "f[x_] := x^2\nf[3]\n");

/**
 * One headless session. Its name carries the client version, so state never
 * passes from one version to the next in a run: a later client met the earlier
 * one's broker and cache, and skipped its own cold start. Returns the final
 * reply, the broker's log, and the client's own exit status. Each session has
 * a private broker directory and cache unless `share` names an earlier one's,
 * which is how a warm cache is tested.
 */
function session(bin, name, prompt, tools, share) {
  const state = share ?? join(work, `state-${name}`);
  mkdirSync(join(state, "run"), { recursive: true, mode: 0o700 });
  const env = clientEnv({
    XDG_RUNTIME_DIR: join(state, "run"),
    XDG_CACHE_HOME: join(state, "cache"),
    WOLFRAM_MCP_LOG: join(state, "broker.log"),
  });
  // --debug, so the client's own verdict on the plugin can be read: a client
  // that rejects the manifest says so only there, and the model then answers
  // with whatever tools it does have — the account's Wolfram connector among them.
  const run = spawnSync(
    bin,
    ["-p", "--debug", "--output-format", "json", "--plugin-dir", plugin, "--allowedTools", tools.join(",")],
    { input: prompt, encoding: "utf8", env, cwd: work, timeout: 600_000 },
  );
  const debugLog = join(config, "debug", "latest");
  const debug = existsSync(debugLog) ? readFileSync(debugLog, "utf8") : "";
  const loadError =
    debug
      .split("\n")
      .find((line) => /invalid manifest|Failed to load (session )?plugin|Plugin not available for MCP/i.test(line))
      ?.replace(/^\S+ \[\w+\] /, "") ?? null;
  let reply = "";
  try {
    reply = JSON.parse(run.stdout).result ?? "";
  } catch {
    reply = run.stdout || run.stderr;
  }
  const log = existsSync(join(state, "broker.log")) ? readFileSync(join(state, "broker.log"), "utf8") : "";
  return { status: run.status, reply, log, state, stderr: run.stderr ?? "", loadError, debug };
}

const MCP = "mcp__plugin_wolfram_WolframLanguage__";
for (const version of args) {
  process.stdout.write(`\nClaude Code ${version}\n`);
  const bin = client(version);
  // The plugin's own state from an earlier version, which a different client
  // may read differently; the sign-in beside it is kept.
  rmSync(join(config, "plugins"), { recursive: true, force: true });

  const signedIn = session(bin, `${version}-auth`, "Reply with exactly: ok", []);
  const out = /not logged in|please run \/login|invalid api key/i.test(`${signedIn.reply}${signedIn.stderr}`);
  check(
    "the test config directory is signed in",
    !out,
    out ? `run, in a terminal: npm run test:client -- login ${version}` : "",
  );
  if (out) continue;

  const cold = session(
    bin,
    `${version}-cold`,
    "Call the wolfram_status tool and quote its first line exactly. Then quote, exactly, any " +
      "SessionStart hook context you were given that begins with 'Wolfram plugin:', or say " +
      "'no hook context'.",
    [`${MCP}wolfram_status`],
  );
  check("the client accepts the plugin's manifest and loads it", !cold.loadError, short(cold.loadError, 240));
  check(
    "the plugin's MCP server answers: wolfram_status",
    /wolfram-mcp-server \d+\.\d+\.\d+/.test(cold.reply),
    short(cold.reply),
  );
  // The hook's own words, not the prompt's: asked to quote text "beginning with
  // 'Wolfram plugin:'", a session whose plugin never loaded echoed the phrase.
  check(
    "the SessionStart hook's text reaches the model",
    /Wolfram plugin: (kernel|no Wolfram installation)/.test(cold.reply),
    short(cold.reply.split("\n").find((line) => /hook/i.test(line))),
  );

  const warm = session(
    bin,
    `${version}-warm`,
    "Evaluate Expand[(x + 1)^5] with the WolframLanguageEvaluator tool and quote its output exactly. " +
      "Then read probe.wl, and use the LSP tool for hover on f at line 1, character 1, quoting its reply.",
    [`${MCP}WolframLanguageEvaluator`, "Read", "LSP"],
    cold.state,
  );
  check(
    "an evaluation answers through the plugin",
    /1 \+ 5[ *]x \+ 10[ *]x\^2 \+ 10[ *]x\^3 \+ 5[ *]x\^4 \+ x\^5/.test(warm.reply),
    short(warm.reply),
  );
  // Per session, because the broker outlives its last session by only 60 s: a
  // warm session that starts later meets no broker and rightly starts a kernel
  // of its own. What must hold is one kernel for the cold session's whole
  // sequence, and for the warm one none unless its broker had gone.
  const startsIn = (log) => (log.match(/starting kernel:/g) ?? []).length;
  const coldStarts = startsIn(cold.log);
  const warmStarts = startsIn(warm.log) - coldStarts;
  const brokerGone = /no proxies attached, shutting down/.test(warm.log.slice(cold.log.length)) ||
    /no proxies attached, shutting down/.test(cold.log);
  check(
    "the cold session starts one kernel, and the warm one none while its broker lives",
    coldStarts === 1 && (warmStarts === 0 || (warmStarts === 1 && brokerGone)),
    `cold ${coldStarts}, warm ${warmStarts}${brokerGone ? " (the broker had shut down between them)" : ""}`,
  );
  // On by default (D23), and loaded with nothing having set the option — which
  // is how --plugin-dir and Claude Desktop's synced uploads arrive. A server
  // entry naming ${user_config.lsp} failed to load exactly there: "No LSP
  // server available for file type: .wl".
  const lspError = warm.debug.split("\n").find((line) => /error\(s\) loading LSP servers from plugin: wolfram/.test(line));
  check(
    "the plugin's LSP server loads with no option stored, and answers a hover",
    !lspError && /f\\?\[x\\?_\\?\]|Function Definition|Usage/i.test(warm.reply),
    lspError ? short(lspError) : short(warm.reply.slice(warm.reply.search(/hover|LSP/i))),
  );

  const doctor = session(
    bin,
    `${version}-doctor`,
    "Run /wolfram:doctor and report its exit status as 'exit N' and the line that follows " +
      "'Starting the kernel'.",
    ["Skill", "Bash(WOLFRAM_MCP_DEFAULT_SERVER=WolframLanguage node *)"],
  );
  // doctor's own startup line, which only the plugin's command prints; a claimed
  // "exit 0" passed on a client that never loaded the plugin.
  check(
    "/wolfram:doctor runs and exits 0",
    /exit 0|exit status:? 0|exited 0/i.test(doctor.reply) && /serverName=WolframLanguage/.test(doctor.reply),
    short(doctor.reply),
  );
}

rmSync(work, { recursive: true, force: true });
process.stdout.write(
  failures === 0 ? `\n${checks} checks, all passed.\n` : `\n${failures} of ${checks} checks failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
