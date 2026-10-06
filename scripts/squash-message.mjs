#!/usr/bin/env node
/**
 * Does release-please read the commit a pull request will squash into as the
 * one commit its title says? Exits 1, naming what it reads instead.
 *
 *   PR_TITLE="fix: …" PR_BODY="…" PR_NUMBER=21 node scripts/squash-message.mjs
 *
 * A squash merge makes one commit: the title with " (#n)" as its subject, the
 * description as its body (the repository's default squash message is "Pull
 * request title and description"). release-please reads the whole of it, and
 * the description can change what it reads without failing anything (#24):
 *
 * - A message its parser rejects is logged at debug level and skipped — no
 *   bump, no changelog line, no pre-release. That is how #21's fix went
 *   missing from 0.1.2's release PR, with every check green, since they read
 *   only the title. The parser reads each body line as a possible footer, and
 *   throws on one that begins with a word whose parenthesis holds another or
 *   does not close on that line, `ensure(deadline.remaining())`.
 * - A paragraph that begins like a Conventional Commit, or a last line shaped
 *   like `feat: …`, is read as a commit of its own, with its own changelog line
 *   and bump.
 * - `BREAKING-CHANGE:` anywhere in the body, or `BREAKING CHANGE:` at a line's
 *   start, makes the commit breaking — a minor bump below 1.0.0.
 * - A BEGIN_COMMIT_OVERRIDE … END_COMMIT_OVERRIDE block replaces the message,
 *   and its markers are found by splitting the text, so a description that
 *   merely names one, in prose or a code span, is read as using it.
 *
 * Most of these turn on what begins a line, and GitHub rewraps the description
 * to 72 columns when it builds the commit: #21's description as written
 * parses. So the commit is read both as written and as GitHub wraps it, and by
 * release-please's own code, the version the release workflow's pinned action
 * bundles, rather than a copy of its rules: a copy missed two of the above.
 *
 * The check asks that release-please read exactly the commit it reads from the
 * title alone. An override is the author's own list, so only its parsing is
 * checked; several commits from one pull request belong there.
 */
import parserPackage from "@conventional-commits/parser";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const { parser } = parserPackage;
// release-please has no exports map; this is the module its release run calls
// on every commit it reads.
const { parseConventionalCommits } = createRequire(import.meta.url)(
  "release-please/build/src/commit.js",
);

/**
 * The width GitHub wraps a description to in a squash commit. Measured, not
 * documented: when this was written, every squash commit on main was its
 * description wrapped greedily at this width, at single spaces, and at no
 * other width.
 */
export const WRAP = 72;

/**
 * Columns, counted in characters, not UTF-16 units — an emoji is one. Measured
 * descriptions held only single-unit characters, so this, like the kept
 * indentation below, is the likelier reading rather than a measured one.
 */
const columns = (text) => [...text].length;

/**
 * The description as GitHub wraps it into the commit: a line within the width
 * is kept as it is, and a longer one is filled greedily, breaking at spaces, a
 * word longer than the width standing on a line of its own, and its
 * indentation kept on its first line.
 */
export function wrap(text, width = WRAP) {
  return text
    .split("\n")
    .flatMap((line) => {
      if (columns(line) <= width) return [line];
      const indent = /^[ \t]*/.exec(line)?.[0] ?? "";
      const lines = [];
      let current = indent;
      for (const word of line.slice(indent.length).split(" ")) {
        if (current === indent || current === "") current += word;
        else if (columns(current) + 1 + columns(word) <= width) current += ` ${word}`;
        else {
          lines.push(current);
          current = word;
        }
      }
      lines.push(current);
      return lines;
    })
    .join("\n");
}

/** The squash commit's message, from the title, the PR's number and a body. */
export function squashMessage(title, number, body) {
  const subject = number ? `${title} (#${number})` : title;
  return body.trim() ? `${subject}\n\n${body}` : subject;
}

/**
 * What release-please reads from a commit with this message, merged from a PR
 * with this description: its commits, and the parse errors it logged and
 * skipped.
 */
export function releasePleaseReads(message, prBody = "") {
  const errors = [];
  const logger = {
    debug: (line) => {
      const error = /^error message: (.*)$/s.exec(String(line));
      if (error?.[1]) errors.push(error[1]);
    },
    trace() {},
    info() {},
    warn() {},
    error() {},
  };
  const commits = parseConventionalCommits(
    [{ sha: "squash", message, files: [], pullRequest: { body: prBody } }],
    logger,
  );
  return { commits, errors };
}

/** The override release-please takes in the message's place, or "" for none. */
const overrideIn = (body) =>
  (body.split("BEGIN_COMMIT_OVERRIDE")[1] ?? "").split("END_COMMIT_OVERRIDE")[0]?.trim() ?? "";

/** A commit as the changelog shows it, `!` marking a breaking one. */
const shown = (commit) =>
  `${commit.type}${commit.scope ? `(${commit.scope})` : ""}${commit.breaking ? "!" : ""}: ` +
  commit.bareMessage;

/**
 * The lines of a message the parser rejects, each tried as a body line: what
 * makes one throw is all on that line, wherever release-please split it.
 */
function rejectedLines(text) {
  return text.split("\n").filter((line) => {
    try {
      parser(`chore: probe\n\n${line}`);
      return false;
    } catch {
      return true;
    }
  });
}

/**
 * Why release-please would not read the PR's squash commit as its title says,
 * or nothing.
 * @param {{ title: string, number?: string | number, body?: string | null }} pr
 * @returns {string[]}
 */
export function unreadable({ title, number, body }) {
  // A description edited in the browser can come back with CRLF line ends.
  // The parser takes CR LF as one line end either way; it is made LF so that
  // a CR is not counted as a column by the wrap, which was measured only on
  // LF descriptions.
  const description = (body ?? "").replace(/\r\n/g, "\n");
  const alone = releasePleaseReads(squashMessage(title, number, ""));
  const [expected] = alone.commits;
  if (!expected || alone.commits.length !== 1) {
    return [`release-please cannot read the title as one commit: ${alone.errors.join("; ")}`];
  }
  // As written first: a line the author wrote fails wherever GitHub wraps it,
  // so it is named as written, and the wrap's own faults wait until it is
  // mended rather than naming the one fault twice.
  const variants = [
    ["the squash commit", squashMessage(title, number, description)],
    [
      `the squash commit, as GitHub wraps the description to ${WRAP} columns,`,
      squashMessage(title, number, wrap(description)),
    ],
  ];
  const override = overrideIn(description);
  for (const [variant, message] of variants) {
    const where = override ? "the BEGIN_COMMIT_OVERRIDE block" : variant;
    const { commits, errors } = releasePleaseReads(message, description);
    const problems = [];
    if (errors.length > 0) {
      const lines = rejectedLines(override || message).map((line) => JSON.stringify(line));
      problems.push(
        `${where} cannot be parsed, and release-please skips it (${errors.join("; ")})` +
          (lines.length > 0 ? `, at ${lines.join(", ")}` : ""),
      );
    }
    if (!override) {
      const at = commits.findIndex((commit) => commit.message === expected.message);
      const own = commits[at];
      if (own && own.breaking !== expected.breaking) {
        const note = own.notes.find((each) => each.title === "BREAKING CHANGE")?.text ?? "";
        problems.push(
          `release-please reads ${where} as a breaking change, "${note}", where the title ` +
            "says none: below 1.0.0 it would bump the minor. Mark the title with ! if it is meant",
        );
      }
      for (const commit of commits.filter((_, i) => i !== at)) {
        problems.push(
          `release-please reads another commit, "${shown(commit)}", from ${where} with its ` +
            "own changelog line and bump",
        );
      }
      if (!own && errors.length === 0) {
        problems.push(`${where} does not hold the title's commit, as release-please reads it`);
      }
    }
    if (problems.length > 0) return problems;
  }
  return [];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const title = process.env.PR_TITLE;
  if (!title) {
    process.stderr.write(
      "squash-message: set PR_TITLE, and PR_BODY and PR_NUMBER where there are any\n",
    );
    process.exit(2);
  }
  const problems = unreadable({ title, number: process.env.PR_NUMBER, body: process.env.PR_BODY });
  for (const problem of problems) process.stdout.write(`${problem}\n`);
  if (problems.length > 0) {
    process.stdout.write(
      "\nNothing in release-please fails on these: the commit ships in a release that " +
        "misreads it, or in none. GitHub rewraps the description, so reword the sentence " +
        "around the word that lands at a line's start. A line may not begin with a word " +
        "whose parenthesis holds another or does not close on that line, `f(g())`, nor " +
        "read like `type: …` where a commit could start. Write a breaking change as `!` in " +
        "the title: `BREAKING-CHANGE:` anywhere in a description, code spans too, makes " +
        "one. A BEGIN_COMMIT_OVERRIDE … END_COMMIT_OVERRIDE block replaces the whole " +
        "message and may list several commits; release-please finds its markers wherever " +
        "they appear, code spans too, so name them in a description only to use them.\n",
    );
    process.exit(1);
  }
  process.stdout.write("release-please reads the squash commit as its title says\n");
}
