#!/usr/bin/env node
/**
 * Does every commit's type agree with what it changes? Exits 1, naming each
 * commit that does not.
 *
 *   node scripts/commit-types.mjs BASE HEAD   the commits a pull request adds
 *   PR_TITLE="docs: …" node scripts/commit-types.mjs BASE HEAD   and its title
 *
 * The version is decided by the commits (plugin plan D25): the types in
 * release-please's visible changelog sections bump it — `fix:`, `perf:`,
 * `refactor:` and `revert:` the patch, `feat:` the minor, a breaking change the
 * minor until 1.0.0 — and `docs:`, `test:`, `ci:`, `chore:` and the rest
 * nothing. So a commit typed `docs:` that edits a skill ships in no release at
 * all: the plugin a user installs changed, and its version did not. A commit
 * that changes what ships must carry a type that bumps.
 *
 * Both the commits and the title are checked because both are read: a merge
 * keeps each commit, which release-please reads one by one, and a squash keeps
 * only the title. A commit already inside a published build — reachable from
 * any `v*` tag — is not checked: it has shipped, and history cannot be retyped,
 * so the check is about what ships next. Without that, the history before this
 * check existed would hold every later merge of it red.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { changedPaths } from "./ci-changes.mjs";

/**
 * What ships: the bundle is built from src/ through tsconfig.json by the build
 * scripts, and the plugin from plugin/ with LICENSE beside it. The package
 * itself is judged separately (`shipsPackage`): its production dependencies are
 * inlined into the bundle and its description is baked into it, but a
 * devDependency bump or a new npm script stays a `chore:`.
 */
export const SHIPPED = [
  "src/",
  "tsconfig.json",
  "plugin/",
  "LICENSE",
  "scripts/bundle-js.mjs",
  "scripts/release-artifacts.mjs",
];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * The types that bump a version, read from release-please's own config: it
 * makes a release only when a commit lands in a changelog section that is not
 * hidden, so those sections are exactly the types that bump, and a change to
 * the config changes this with it.
 */
export function bumpingTypes(dir = root) {
  const config = JSON.parse(readFileSync(join(dir, "release-please-config.json"), "utf8"));
  return config.packages["."]["changelog-sections"]
    .filter((section) => !section.hidden)
    .map((section) => section.type);
}

/**
 * The Conventional Commit type of a message, or null if it is not one. A
 * `BREAKING CHANGE:` footer is breaking whatever the type, as release-please
 * reads it, and git's own `Revert "…"` takes the type of what it reverts.
 */
export function commitType(message) {
  const [subject = "", ...body] = message.split("\n");
  const reverted = /^Revert "(.+)"$/.exec(subject);
  if (reverted?.[1]) return commitType([reverted[1], ...body].join("\n"));
  const match = /^([a-z]+)(\([^)]*\))?(!)?: /.exec(subject);
  if (!match) return null;
  const footer = body.some((line) => /^BREAKING[ -]CHANGE: /.test(line));
  return { type: match[1], breaking: match[3] === "!" || footer };
}

/**
 * @param {{ message: string, paths: string[], ships?: boolean | (() => boolean) }[]} commits
 *   `ships` says whether the commit changed the package in a way that ships —
 *   a function, so the git reads behind it run only for a commit whose type
 *   would not already bump
 * @returns {string[]} why each offending commit is wrong
 */
export function mistyped(commits, bumping = bumpingTypes()) {
  return commits.flatMap(({ message, paths, ships = false }) => {
    const subject = message.split("\n")[0] ?? "";
    const parsed = commitType(message);
    if (!parsed) return [`"${subject}" is not a Conventional Commit`];
    // release-please's own commit: it writes the version into the plugin
    // manifest, which is the bump, not a change that needs one.
    if (/^chore(\([^)]*\))?: release \d/.test(subject)) return [];
    if (parsed.breaking || bumping.includes(parsed.type)) return [];
    const shipped = paths.filter((path) =>
      SHIPPED.some((entry) => (entry.endsWith("/") ? path.startsWith(entry) : path === entry)),
    );
    if (typeof ships === "function" ? ships() : ships) shipped.push("package.json, as shipped");
    if (shipped.length === 0) return [];
    return [
      `"${subject}" changes what ships (${shipped.slice(0, 3).join(", ")}` +
        `${shipped.length > 3 ? ", …" : ""}) but ${parsed.type}: bumps no version; ` +
        `type it fix: or feat: (any of ${bumping.join(", ")} bumps)`,
    ];
  });
}

/** package.json fields that never reach the bundle: the version is the bump itself. */
const UNSHIPPED_FIELDS = new Set(["devDependencies", "scripts", "version"]);

/**
 * What of the package ships, as one comparable string: every package.json field
 * but the unshipped ones, and every lockfile entry a production install would
 * get — not `dev`, and not `devOptional`, an optional dependency of a dev one.
 */
function shippedPackage(packageJson, lockJson) {
  const fields = Object.entries(packageJson ?? {}).filter(([key]) => !UNSHIPPED_FIELDS.has(key));
  const pins = Object.entries(lockJson?.packages ?? {})
    .filter(([path, entry]) => path && !entry.dev && !entry.devOptional)
    .map(([path, entry]) => `${path} ${entry.version}`);
  return JSON.stringify([fields.sort(([a], [b]) => a.localeCompare(b)), pins.sort()]);
}

/** Did the package change in a way that ships, between two revisions? */
export function shipsPackage(from, to, cwd = process.cwd()) {
  const at = (rev, file) => {
    try {
      return JSON.parse(execFileSync("git", ["show", `${rev}:${file}`], { cwd, encoding: "utf8" }));
    } catch {
      return null; // absent at that end, as in a root commit
    }
  };
  return (
    shippedPackage(at(from, "package.json"), at(from, "package-lock.json")) !==
    shippedPackage(at(to, "package.json"), at(to, "package-lock.json"))
  );
}

/**
 * The commits a pull request adds — `BASE..HEAD`, not `BASE...HEAD`, which for
 * `git log` also lists the base's own commits since the branch point, so a PR
 * failed for a commit it did not contain — less any already inside a published
 * build, each with its message and the paths it touches.
 */
export function commitsIn(base, head, cwd = process.cwd()) {
  const log = execFileSync(
    "git",
    [
      "log",
      "--no-merges",
      "--no-renames",
      "--format=%x00%H%x01%B%x01",
      "--name-only",
      `${base}..${head}`,
      "--not",
      "--tags=v*",
    ],
    { cwd, encoding: "utf8" },
  );
  return log
    .split("\0")
    .filter(Boolean)
    .map((entry) => {
      const [sha = "", message = "", files = ""] = entry.split("\x01");
      const paths = files.split("\n").filter(Boolean);
      const touchesPackage = paths.includes("package.json") || paths.includes("package-lock.json");
      return {
        message: message.trim(),
        paths,
        ships: () => touchesPackage && shipsPackage(`${sha}^`, sha, cwd),
      };
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [base, head] = process.argv.slice(2);
  if (!base || !head) {
    process.stderr.write("commit-types: name the base and head, e.g. origin/main HEAD\n");
    process.exit(2);
  }
  const commits = commitsIn(base, head);
  const title = process.env.PR_TITLE;
  // The title stands for the whole change, as the squash commit it becomes,
  // so it answers for everything the PR changes from where it left its base —
  // paths and package alike, merges included.
  if (title) {
    const from = execFileSync("git", ["merge-base", base, head], { encoding: "utf8" }).trim();
    commits.push({
      message: title,
      paths: changedPaths(`${base}...${head}`).filter(Boolean),
      ships: () => shipsPackage(from, head),
    });
  }
  const problems = mistyped(commits);
  for (const problem of problems) process.stdout.write(`${problem}\n`);
  if (problems.length > 0) process.exit(1);
  process.stdout.write(`${commits.length} commit(s), every type agrees with what it changes\n`);
}
