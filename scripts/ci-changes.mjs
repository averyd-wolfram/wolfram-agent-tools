#!/usr/bin/env node
/**
 * Does this change need the test and build jobs? Prints `true` or `false`.
 *
 *   node scripts/ci-changes.mjs BASE...HEAD   the pull request's own changes
 *   git diff --name-only ... | node scripts/ci-changes.mjs   paths on stdin
 *
 * A pull request that changed only prose spent several minutes of runners
 * proving nothing: since the prose checks were removed (plugin plan D15), no
 * test reads a markdown file outside the trees below. Inside them markdown is
 * code — the plugin's skills are shipped, and the suite runs the doctor skill's
 * command exactly as written and compares the archive with the assembled
 * tree — so a skill edit runs everything, as any source edit does.
 *
 * When in doubt, run: an empty list, a diff git could not compute, or any file
 * that is not markdown means true. CI treats anything but an explicit `false`
 * the same way, so a detector that fails cannot skip the tests.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Trees whose markdown is read by a test or shipped to a user. */
export const MARKDOWN_IS_CODE_UNDER = ["plugin/", "test/", "src/", "scripts/", "examples/"];

/** @param {string[]} paths repository-relative paths, as `git diff --name-only` prints them */
export function needsTests(paths) {
  const changed = paths.map((path) => path.trim()).filter(Boolean);
  if (changed.length === 0) return true;
  return changed.some(
    (path) =>
      !/\.md$/i.test(path) || MARKDOWN_IS_CODE_UNDER.some((tree) => path.startsWith(tree)),
  );
}

/**
 * Every path a range touches — both ends of a rename. Git's rename detection
 * reports only a rename's destination, so a skill moved from plugin/ to docs/
 * read as one docs file, and the change that dropped a shipped file skipped
 * the tests.
 */
export function changedPaths(range, cwd = process.cwd()) {
  return execFileSync("git", ["diff", "--name-only", "--no-renames", range], {
    cwd,
    encoding: "utf8",
  }).split("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const range = process.argv[2];
  let paths;
  try {
    paths = range ? changedPaths(range) : readFileSync(0, "utf8").split("\n");
  } catch (err) {
    process.stderr.write(`ci-changes: could not list the changes, so running everything: ${err}\n`);
    paths = [];
  }
  process.stdout.write(`${needsTests(paths)}\n`);
}
