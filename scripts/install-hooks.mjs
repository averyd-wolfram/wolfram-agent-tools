#!/usr/bin/env node
/**
 * Point this clone's git at .githooks/, so the public-content check runs
 * before every commit. Run by `npm install` (the prepare script).
 *
 * A commit to a public repository is published as soon as it is pushed, and
 * removing a line later leaves it in history — so the check that CI runs on a
 * pull request is too late on its own, and runs here at the moment of the
 * commit as well.
 *
 * Does nothing outside a git work tree (an installed tarball has none), and
 * leaves a hooks path the developer set themselves alone.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const git = (...args) =>
  execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: "pipe" }).trim();
const manual = "run `node scripts/public-content.mjs --staged` before committing.";

if (existsSync(join(root, ".git"))) {
  // The hook is a convenience and CI checks the tree anyway, so nothing here
  // may fail the install that runs it: a repository git refuses — dubious
  // ownership in a container, a broken gitdir, no git at all — gets a
  // warning, not a failed `npm ci`.
  try {
    let current = "";
    try {
      current = git("config", "--local", "core.hooksPath");
    } catch {
      // Unset, which git reports as a failure.
    }
    if (current === "") git("config", "--local", "core.hooksPath", ".githooks");
    else if (current !== ".githooks") {
      process.stderr.write(
        `install-hooks: core.hooksPath is ${current}, so .githooks/pre-commit will not run; ${manual}\n`,
      );
    }
  } catch (error) {
    const reason = String(error.stderr || error.message)
      .trim()
      .split("\n")[0];
    process.stderr.write(`install-hooks: could not enable .githooks (${reason}); ${manual}\n`);
  }
}
