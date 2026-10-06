#!/usr/bin/env node
/**
 * Can release-please read the commit a pull request will squash into? Exits 1,
 * naming each line it cannot read.
 *
 *   PR_TITLE="fix: …" PR_BODY="…" PR_NUMBER=21 node scripts/squash-message.mjs
 *
 * A squash merge makes one commit: the title with " (#n)" as its subject, the
 * description as its body (the repository's default squash message is "Pull
 * request title and description"). release-please parses the whole of it with
 * @conventional-commits/parser, and a message the parser rejects is logged at
 * debug level and skipped — no bump, no changelog line, no pre-release, and
 * nothing fails. That is how #21's fix went missing from 0.1.2's release PR
 * (#24), with every check green: they read only the title.
 *
 * The parser reads each body line as a possible footer, `token: value` or
 * `token(scope): value`, and throws on a line that begins with a word whose
 * parenthesis holds another or does not close on that line —
 * `ensure(deadline.remaining())`. What puts such a word at a line's start is
 * usually not the author but GitHub, which rewraps the description to 72
 * columns when it builds the commit: #21's description, as written, parses.
 * So the message is checked both as written and as GitHub wraps it.
 *
 * It also fails a message release-please would read as more than one commit.
 * Before parsing, release-please splits the message at every paragraph that
 * begins like a Conventional Commit, so a paragraph of the description opening
 * "feat: …" becomes a commit of its own, with its own changelog line, and can
 * turn a patch into a minor. BEGIN_NESTED_COMMIT says that on purpose, and
 * passes.
 *
 * A BEGIN_COMMIT_OVERRIDE block in the description replaces the message
 * altogether, as release-please reads it, so only the block is checked.
 * release-please finds the markers by splitting the text, so a description
 * that merely names one, in prose or a code span, is read as using it.
 */
import parserPackage from "@conventional-commits/parser";
import { fileURLToPath } from "node:url";

const { parser } = parserPackage;

/**
 * The width GitHub wraps a description to in a squash commit. Measured, not
 * documented: when this was written, every squash commit on main was its
 * description wrapped greedily at this width, at single spaces, and at no
 * other width.
 */
export const WRAP = 72;

/**
 * The description as GitHub wraps it into the commit: a line within the width
 * is kept as it is, and a longer one is filled greedily, breaking at spaces, a
 * word longer than the width standing on a line of its own.
 */
export function wrap(text, width = WRAP) {
  return text
    .split("\n")
    .flatMap((line) => {
      if (line.length <= width) return [line];
      const lines = [];
      let current = "";
      for (const word of line.split(" ")) {
        if (current === "") current = word;
        else if (current.length + 1 + word.length <= width) current += ` ${word}`;
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
 * The messages release-please parses from one commit, as release-please
 * 17.11.2 builds them (src/commit.ts: preprocessCommitMessage, splitMessages).
 * `implicit` holds the commits it split out of paragraphs that begin like a
 * Conventional Commit, which nobody asked for, unlike a BEGIN_NESTED_COMMIT.
 */
export function releasePleaseReads(message, prBody) {
  const override = (prBody.split("BEGIN_COMMIT_OVERRIDE")[1] ?? "")
    .split("END_COMMIT_OVERRIDE")[0]
    ?.trim();
  const source = override || message;
  const parts = source.split("BEGIN_NESTED_COMMIT");
  let outer = parts.shift() ?? "";
  const nested = [];
  for (const part of parts) {
    const [inner = "", ...rest] = part.split("END_NESTED_COMMIT");
    nested.push(inner);
    outer += rest.join("END_NESTED_COMMIT");
  }
  const split = outer
    .split(
      /\r?\n\r?\n(?=(?:feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\(.*?\))?: )/,
    )
    .filter(Boolean);
  return {
    overridden: Boolean(override),
    messages: [...split, ...nested],
    implicit: split.slice(1),
  };
}

/**
 * Why release-please would not read the PR's squash commit as it was meant, or
 * nothing.
 * @param {{ title: string, number?: string | number, body?: string | null }} pr
 * @returns {string[]}
 */
export function unreadable({ title, number, body }) {
  // A description edited in the browser can come back with CRLF line ends.
  // The parser takes CR LF as one line end either way; it is made LF so that
  // a CR is not counted as a column by the wrap, which was measured only on
  // LF descriptions.
  const description = (body ?? "").replace(/\r\n/g, "\n");
  // As written first: a line the author wrote fails wherever GitHub wraps it,
  // so it is named as written, and the wrap's own failures wait until it is
  // mended rather than naming the one fault twice.
  const variants = [
    ["the squash commit", squashMessage(title, number, description)],
    [
      `the squash commit, as GitHub wraps the description to ${WRAP} columns,`,
      squashMessage(title, number, wrap(description)),
    ],
  ];
  for (const [where, message] of variants) {
    const { overridden, messages, implicit } = releasePleaseReads(message, description);
    // An override is the author's own list of commits, so its paragraphs are
    // meant, and it is read as written, the same under either variant.
    const what = overridden ? "the BEGIN_COMMIT_OVERRIDE block" : where;
    const problems = [
      ...(overridden ? [] : implicit).map(
        (paragraph) =>
          `${what} has a paragraph release-please reads as a commit of its own, with its own ` +
          `changelog line and bump: "${paragraph.split("\n")[0]}"`,
      ),
      ...messages.flatMap((text) => {
        const failure = parseFailure(text);
        return failure ? [`${what} ${failure}`] : [];
      }),
    ];
    if (problems.length > 0) return problems;
  }
  return [];
}

/** Where the parser rejects a message, naming the line, or null if it does not. */
function parseFailure(text) {
  try {
    parser(text);
    return null;
  } catch (err) {
    // The parser counts lines and columns in the trimmed message.
    const message = err instanceof Error ? err.message : String(err);
    const [, line = "?"] = /at (\d+):\d+/.exec(message) ?? [];
    const lineText = text.trim().split("\n")[Number(line) - 1] ?? "";
    return `cannot be parsed at line ${line}, "${lineText}": ${message}`;
  }
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
      "\nrelease-please skips a commit it cannot parse, and nothing fails: the fix ships in no " +
        "release. A line may not begin with a word whose parenthesis holds another, or does " +
        "not close on that line — `f(g())` — and GitHub rewraps the description, so reword the " +
        "sentence around that word. A paragraph beginning `type: ` or `type(scope): ` is read " +
        "as a commit of its own: reword its start, or mark it BEGIN_NESTED_COMMIT … " +
        "END_NESTED_COMMIT if it is meant. A BEGIN_COMMIT_OVERRIDE … END_COMMIT_OVERRIDE " +
        "block replaces the whole message. release-please finds these markers wherever they " +
        "appear, in prose and code spans too, so name them in a description only to use them.\n",
    );
    process.exit(1);
  }
  process.stdout.write("release-please can read the squash commit\n");
}
