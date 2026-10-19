#!/usr/bin/env node
/**
 * What `npm run test:wl` and `npm run lint:wl` count as a pass
 * (scripts/run-wls.mjs), against a stand-in wolframscript first on PATH.
 *
 * #60's sandbox is the case it exists for: `wolframscript -code '1+1'` exited 0
 * and printed nothing there, so `wolframscript -file` on either script would
 * have passed with no kernel ever reading it (#107).
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const launcher = join(root, "scripts", "run-wls.mjs");

let failures = 0;
let checks = 0;
const check = (label, ok, detail = "") => {
  checks++;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
};

// Prints what it is told and exits as it is told, and records how it was run.
const bin = mkdtempSync(join(tmpdir(), "run-wls-"));
const argsLog = join(bin, "args");
writeFileSync(
  join(bin, "wolframscript"),
  `#!/bin/sh\nprintf '%s ' "$@" > "${argsLog}"\nprintf '%s' "$FAKE_WLS_OUT"\nexit "\${FAKE_WLS_STATUS:-0}"\n`,
  { mode: 0o755 },
);

/**
 * `npm run <name>`, or the launcher on a script path, with the stand-in saying
 * `out` and exiting `status`. Through npm, so what is checked is what the two
 * commands run, not only the launcher.
 */
const run = (target, out = "", status = 0, path = `${bin}:${process.env.PATH}`) => {
  rmSync(argsLog, { force: true });
  const [command, args] = target.endsWith(".wls")
    ? [process.execPath, [launcher, target]]
    : ["npm", ["run", "--silent", target]];
  const r = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, PATH: path, FAKE_WLS_OUT: out, FAKE_WLS_STATUS: String(status) },
  });
  const said = `${r.stdout}${r.stderr}`.trim().split("\n").filter(Boolean).pop() ?? "";
  return { status: r.status, stdout: r.stdout, said };
};

const contract = "test:wl";
const lint = "lint:wl";

console.log("\nrun-wls: what test:wl and lint:wl count as a pass");
const silent = run(contract);
check("test:wl fails when wolframscript exits 0 and prints nothing", silent.status === 1, `${silent.status}: ${silent.said}`);
check(
  "and says no kernel is known to have run it",
  /printed no "N passed, M failed" line, so no kernel is known to have run/.test(silent.said),
  silent.said,
);
const passed = run(contract, "Wolfram 15.0.0\nAgentTools 2.2.7\n12 passed, 0 failed\n");
check("test:wl passes when the contract ran and passed", passed.status === 0, `${passed.status}: ${passed.said}`);
check(
  "and runs wolframscript -file on the script, showing what it printed",
  readFileSync(argsLog, "utf8").trim() === "-file scripts/run-contract.wls" && passed.stdout.includes("12 passed, 0 failed"),
  readFileSync(argsLog, "utf8").trim(),
);
const empty = run(contract, "0 passed, 0 failed\n");
check("test:wl fails when the contract ran no tests", empty.status === 1, `${empty.status}: ${empty.said}`);
const failed = run(contract, "11 passed, 1 failed\n", 1);
check("test:wl fails with the contract's own status when a test failed", failed.status === 1, `${failed.status}`);
const crashed = run(contract, "", 3);
check("and with wolframscript's own status when it fails", crashed.status === 3, `${crashed.status}`);

const lintSilent = run(lint);
check("lint:wl fails when wolframscript exits 0 and prints nothing", lintSilent.status === 1, `${lintSilent.status}: ${lintSilent.said}`);
const linted = run(lint, "9 file(s) checked, 0 finding(s)\n");
check("lint:wl passes when files were checked and none had findings", linted.status === 0, `${linted.status}: ${linted.said}`);
const noFiles = run(lint, "0 file(s) checked, 0 finding(s)\n");
check("lint:wl fails when it found no files to check", noFiles.status === 1, `${noFiles.status}: ${noFiles.said}`);

// The launcher itself, since npm needs a PATH that finds node.
const missing = run("scripts/run-contract.wls", "", 0, join(bin, "nothing-here"));
check(
  "a machine without wolframscript fails, saying so",
  missing.status === 1 && /wolframscript is not on PATH/.test(missing.said),
  `${missing.status}: ${missing.said}`,
);
const unknown = run("scripts/other.wls", "1 passed, 0 failed\n");
check(
  "a script with no known summary line is refused, not run",
  unknown.status === 2 && !readFileSync(argsLog, { encoding: "utf8", flag: "a+" }),
  `${unknown.status}: ${unknown.said}`,
);

rmSync(bin, { recursive: true, force: true });
console.log(failures === 0 ? `\n${checks} checks, all passed.\n` : `\n${failures} of ${checks} checks failed.\n`);
process.exit(failures === 0 ? 0 : 1);
