#!/usr/bin/env node
/**
 * The PostToolUse hook behind every Write and Edit in this repo: the strict
 * formatter and linter, applied at the moment the mistake is made rather than
 * at the next npm test.
 *
 * TypeScript under src/ gets prettier (written back), eslint, and the whole
 * project's tsc — the project, not the file, because a signature change breaks
 * callers the edited file never mentions (plan.md §6.6). Wolfram Language
 * files get CodeFormatter through wolframscript; their linting is already
 * live, pushed by the plugin's LSP into the session on every edit.
 *
 * Exit codes are the contract: 0 is clean or not-ours (a fresh clone without
 * node_modules, a machine without wolframscript — enforcement needs tools, and
 * a missing tool must not block every edit); 2 is a real finding, which Claude
 * Code feeds back to the agent as a blocking error so it gets fixed now.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
let file = "";
try {
  const input = JSON.parse(raw);
  file = input.tool_input?.file_path ?? "";
} catch {
  process.exit(0); // not a payload this hook understands, so not its business
}
if (!file) process.exit(0);
const path = resolve(file);

const fail = (message) => {
  process.stderr.write(`${message}\n`);
  process.exit(2);
};
const run = (command, args) =>
  spawnSync(command, args, { cwd: root, encoding: "utf8", timeout: 90_000 });

if (path.startsWith(join(root, "src") + "/") && path.endsWith(".ts")) {
  const bin = (name) => join(root, "node_modules", ".bin", name);
  if (!existsSync(bin("prettier"))) process.exit(0); // fresh clone; npm install brings the gate
  const formatted = run(bin("prettier"), ["--write", path]);
  if (formatted.status !== 0) fail(`prettier failed on ${file}:\n${formatted.stderr}`);
  const linted = run(bin("eslint"), [path]);
  if (linted.status !== 0) fail(`eslint findings in ${file}:\n${linted.stdout}${linted.stderr}`);
  const typed = run(bin("tsc"), ["-p", join(root, "tsconfig.json")]);
  if (typed.status !== 0) fail(`the type check fails after this edit:\n${typed.stdout}`);
}
// Wolfram Language files are deliberately not formatted here. CodeFormatter
// has no fixed point on block comments — measured, it inserts a fresh blank
// line into a multi-line comment on every pass, so an enforced format grows
// files without bound and mangles their prose. Their linting is already live:
// the plugin's LSP pushes CodeInspector findings into the session on every
// edit, and npm run lint:wl is the same check headless. plan.md §11 records
// the defect and the revisit condition.
process.exit(0);
