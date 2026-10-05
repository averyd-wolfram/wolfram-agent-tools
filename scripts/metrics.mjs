#!/usr/bin/env node
/**
 * Derive the figures the documentation used to assert.
 *
 * Every stale number in this repo was a value someone wrote down instead of
 * computing: `docs/design.md` claimed 1,700 lines and 49 checks against a tree
 * that had 4,701 and 205, and the handoff's own line count went stale by eight
 * within two commits. So the prose no longer carries these numbers at all — it
 * names this script.
 *
 * `collect()` is pure filesystem and starts nothing, so it is cheap to import.
 * Anything that shells out lives in `deps()`, which only the command line calls.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

/** Lines as `wc -l` counts them — newlines, so a trailing one is not a line. */
const countLines = (text) => text.split("\n").length - (text.endsWith("\n") ? 1 : 0);

/**
 * Call sites of a helper, counted only where a string literal follows.
 *
 * The literal is what excludes the suite's own summary line, `check(s)
 * failed`, which a bare `check(` count reports as a check that does not exist.
 */
const callSites = (text, name) =>
  [...text.matchAll(new RegExp(String.raw`\b${name}\(\s*["'\`]`, "g"))].length;

export function collect() {
  const dir = join(root, "src");
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".ts"))
    .sort();
  const src = files.map((name) => ({
    name,
    lines: countLines(readFileSync(join(dir, name), "utf8")),
  }));

  const smoke = read("test", "smoke.mjs");

  return {
    src: {
      files: src,
      count: src.length,
      lines: src.reduce((total, file) => total + file.lines, 0),
    },
    smoke: {
      lines: countLines(smoke),
      // Call sites, not checks run: four sections sit inside a `for (const
      // sharing of [...])` loop and execute twice, so the number the suite
      // reaches is higher. The suite prints that one itself, at the end of a
      // run, because it is the only thing that can know it.
      checkSites: callSites(smoke, "check"),
      sectionSites: callSites(smoke, "heading"),
    },
    contract: {
      tests: [...read("test", "agenttools-contract.wlt").matchAll(/\bVerificationTest\[/g)].length,
    },
  };
}

/**
 * The production dependency tree. Needs npm, so it is not part of `collect()`.
 *
 * The size is an estimate against the tree as installed; only
 * `npm prune --omit=dev` makes it exact.
 */
export function deps() {
  const listed = execFileSync("npm", ["ls", "--omit=dev", "--all", "--parseable"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\n")
    .filter((line) => line.includes("node_modules"));

  // Top level only: `du` already counts a package's own nested node_modules,
  // so summing every listed path would count those twice.
  const top = listed.filter((path) => path.split("node_modules").length === 2);
  let kb = 0;
  for (const path of top) {
    kb += Number.parseInt(execFileSync("du", ["-sk", path], { encoding: "utf8" }), 10) || 0;
  }
  return { packages: listed.length, megabytes: Math.round(kb / 1024) };
}

if (resolve(process.argv[1] ?? "") === resolve(fileURLToPath(import.meta.url))) {
  const metrics = collect();
  // A missing or broken npm must not take the filesystem figures down with it.
  let dependencies = null;
  try {
    dependencies = deps();
  } catch (err) {
    dependencies = { error: err instanceof Error ? err.message : String(err) };
  }

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ ...metrics, deps: dependencies }, null, 2));
  } else {
    const { src, smoke, contract } = metrics;
    console.log(`src/                          ${src.count} files, ${src.lines} lines`);
    for (const file of src.files) {
      console.log(`  ${file.name.padEnd(26)}${String(file.lines).padStart(6)}`);
    }
    console.log(
      `\ntest/smoke.mjs                ${smoke.lines} lines, ` +
        `${smoke.checkSites} check call sites across ${smoke.sectionSites} sections`,
    );
    console.log("  the suite prints the checks it actually ran; looped sections make it higher");
    console.log(`test/agenttools-contract.wlt  ${contract.tests} VerificationTests`);
    console.log(
      dependencies.error
        ? `\nproduction dependencies       unavailable: ${dependencies.error}`
        : `\nproduction dependencies       ${dependencies.packages} packages, ~${dependencies.megabytes} MB`,
    );
  }
}
