#!/usr/bin/env node
/**
 * Does any file carry something that must not be public? Exits 1 and names
 * each file, line and kind of finding; exits 0 silently otherwise.
 *
 *   node scripts/public-content.mjs            every tracked file, as on disk
 *   node scripts/public-content.mjs --staged   what the next commit would hold
 *
 * The repository is public, so a commit is published the moment it is pushed,
 * and a later commit that removes a line leaves it in history. Three kinds of
 * thing have slipped into trees like this one: a developer's absolute home
 * path, pasted from a terminal; a host of an organisation's internal network,
 * copied from a config; and a token. The first two are checked against an
 * allow-list, never a deny-list, so this file names only what may appear and
 * nothing it is guarding.
 *
 * Run by CI on every pull request and by the pre-commit hook in .githooks/,
 * which `npm install` enables (scripts/install-hooks.mjs).
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Wolfram hosts that are public, each documented for users. */
export const PUBLIC_WOLFRAM_HOSTS = new Set([
  "wolfram.com",
  "www.wolfram.com",
  "account.wolfram.com",
  "support.wolfram.com",
  // The paclet's hosted MCP service.
  "agenttools.wolfram.com",
  // The licensing host an on-demand entitlement names in WOLFRAMINIT.
  "cloudlm.wolfram.com",
]);

/**
 * The home-directory names a path may use: a documentation placeholder, and
 * the user Wolfram's Engine container image runs as. A name that is itself a
 * placeholder — `<user>`, `${user}`, `%USERNAME%`, `$USER` — names nobody, so
 * it passes too.
 */
export const PUBLIC_HOME_NAMES = new Set(["you", "wolframengine"]);
const PLACEHOLDER = /^[<{$%]/;

/**
 * Shapes no file here has any reason to contain. A prefix is anchored on
 * "no letter or digit before it" rather than \b, which treats `_` as part of
 * a word and so missed a token pasted straight after one.
 */
const CREDENTIAL_SHAPES = [
  ["a GitHub token", /(?<![A-Za-z0-9])(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})/],
  ["an npm token", /(?<![A-Za-z0-9])npm_[A-Za-z0-9]{36,}/],
  ["an Anthropic API key", /(?<![A-Za-z0-9])sk-ant-[A-Za-z0-9_-]{20,}/],
  ["an AWS access key", /(?<![A-Za-z0-9])(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ["a Slack token", /(?<![A-Za-z0-9])xox[abprs]-[A-Za-z0-9-]{10,}/],
  ["a private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  // The opt-in container suite runs on one (docs/releasing.md), so it is the
  // likeliest real value to be pasted into a doc or a test. Placeholders and
  // the suite's own fixtures — `<id>`, `O-AAAA`, `O-SECRET-ID` — carry no
  // digit, which every real one does.
  ["a licence entitlement", /-entitlement\s+O-(?=[A-Z0-9-]*\d)[A-Z0-9-]{12,}/],
];

// A host is the labels before wolfram.com; an address's local part is not
// part of it, which is what lets an author's address through.
const WOLFRAM_HOST = /(?<![A-Za-z0-9.-])((?:[A-Za-z0-9-]+\.)*wolfram\.com)\b/gi;
// A macOS, Linux or Windows home directory, and the name it is under.
const HOME_PATH = /(?:\/Users\/|\/home\/|[A-Za-z]:\\+Users\\+)([^/\\\s"'`)\]]+)/g;

/**
 * Every finding in one file's text.
 * @param {string} text
 * @returns {{ line: number, kind: string, match: string }[]}
 */
export function findings(text) {
  const found = [];
  text.split("\n").forEach((content, index) => {
    const line = index + 1;
    for (const [, host] of content.matchAll(WOLFRAM_HOST)) {
      if (!PUBLIC_WOLFRAM_HOSTS.has(host.toLowerCase())) {
        found.push({ line, kind: "a host not on the public list", match: host });
      }
    }
    for (const [match, name] of content.matchAll(HOME_PATH)) {
      if (!PUBLIC_HOME_NAMES.has(name) && !PLACEHOLDER.test(name)) {
        found.push({ line, kind: "an absolute home path", match });
      }
    }
    for (const [kind, shape] of CREDENTIAL_SHAPES) {
      const match = content.match(shape);
      if (match) found.push({ line, kind: `what looks like ${kind}`, match: match[0] });
    }
  });
  return found;
}

/** Binary files hold no text worth reading, and a NUL byte says which those are. */
function isText(buffer) {
  return !buffer.subarray(0, 8000).includes(0);
}

/**
 * A tracked file as it is on disk, or nothing for one deleted but not yet
 * staged as deleted, or a link to a directory: neither has text to publish,
 * and a crash on either would end the check before the files that do.
 */
function readOnDisk(path) {
  try {
    return readFileSync(path);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") return undefined;
    throw error;
  }
}

function git(args) {
  return execFileSync("git", args, { encoding: "buffer", maxBuffer: 1 << 28 });
}

/** @param {{ staged: boolean }} options */
export function check({ staged }) {
  const paths = staged
    ? git(["diff", "--cached", "--name-only", "-z", "--diff-filter=ACMR"])
    : git(["ls-files", "-z"]);
  const report = [];
  for (const path of paths.toString("utf8").split("\0").filter(Boolean)) {
    const content = staged ? git(["show", `:${path}`]) : readOnDisk(path);
    if (content === undefined || !isText(content)) continue;
    for (const finding of findings(content.toString("utf8"))) {
      report.push(`${path}:${finding.line}: ${finding.kind}: ${finding.match}`);
    }
  }
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = check({ staged: process.argv.includes("--staged") });
  if (report.length > 0) {
    process.stderr.write(
      `public-content: ${report.length} finding(s) in what would be public:\n` +
        report.map((entry) => `  ${entry}\n`).join("") +
        "Remove them, or, if one is genuinely public, add it to the allow-list in " +
        "scripts/public-content.mjs.\n",
    );
    process.exit(1);
  }
}
