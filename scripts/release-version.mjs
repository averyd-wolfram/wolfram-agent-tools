#!/usr/bin/env node
/**
 * What a release build is called, and stamping it into the tree.
 *
 *   node scripts/release-version.mjs                 version=… tag=… prerelease=… for $GITHUB_OUTPUT
 *   node scripts/release-version.mjs --stamp 0.2.0-pre.3   write it into every file that carries one
 *
 * The release workflow builds two kinds of ref, and the same two will build it
 * after 1.0.0 (plugin plan D25):
 *
 * - release-please's release branch, `release-please--branches--<target>`: a
 *   pre-release, `v<x.y.z>-pre.<n>`, where x.y.z is the version release-please
 *   computed from the commits and wrote into that branch's package.json, and n
 *   is one past the highest `-pre.` tag that version already has. Nobody types
 *   the version: a `fix:` makes the next patch, a `feat:` the next minor. Every
 *   build is one someone can install, and a later one is a later version, so
 *   an installed plugin sees an update — Claude Code's update signal is the
 *   manifest's version string, and two builds that both said 0.2.0 would be one
 *   version to it. Once `v<x.y.z>` itself exists the branch builds nothing: a
 *   pre-release of a version already released ranks below it, and an installed
 *   plugin would still take the changed string as an update.
 * - a `v<version>` tag: that release, a normal GitHub release from 0.x on, and
 *   a pre-release only when its version has a `-` suffix, and marked Latest
 *   when published. A release run never finishes a draft older than the
 *   newest release (scripts/pending-release.mjs), so Latest is the newest.
 *
 * The version is stamped into the CI checkout only, never committed: the
 * branch says what is being prepared, and the build says which build it is.
 * Kept out of the workflow's YAML so the suite can check it without GitHub.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const CORE = /^\d+\.\d+\.\d+$/;

/** The branch release-please keeps its release pull request on. */
export const RELEASE_BRANCH = /^release-please--branches--.+/;

/**
 * @param {{ ref: string, refType: string, tags: string[], packageVersion: string }} input
 *   the ref being built (`GITHUB_REF_NAME`, `GITHUB_REF_TYPE`), every tag that
 *   exists, and the version in the built commit's package.json
 * @returns {{ version: string, tag: string, prerelease: boolean, create: boolean }}
 *   `create` is true when the build makes its own tag; a tag build releases
 *   the tag that started it
 */
export function releaseVersion({ ref, refType, tags, packageVersion }) {
  if (refType === "tag") {
    const version = ref.replace(/^v/, "");
    if (!ref.startsWith("v") || !SEMVER.test(version)) {
      throw new Error(`tag ${ref} is not v<semver>, so it names no release`);
    }
    return { version, tag: ref, prerelease: version.includes("-"), create: false };
  }
  if (!RELEASE_BRANCH.test(ref)) {
    throw new Error(`branch ${ref} is not release-please's release branch, so it names no release`);
  }
  const target = packageVersion;
  if (!CORE.test(target)) {
    throw new Error(`release-please's branch says ${target}, which is not x.y.z, so it names no release`);
  }
  if (tags.includes(`v${target}`)) {
    throw new Error(
      `v${target} is already released, so this build of it is not published; ` +
        "release-please's next release PR names the next version",
    );
  }
  const prefix = `v${target}-pre.`;
  const built = tags
    .filter((tag) => tag.startsWith(prefix))
    .map((tag) => Number(tag.slice(prefix.length)))
    .filter((n) => Number.isInteger(n) && n > 0);
  const n = Math.max(0, ...built) + 1;
  const version = `${target}-pre.${n}`;
  return { version, tag: `v${version}`, prerelease: true, create: true };
}

/**
 * The version a release tag names — `v0.2.0` → `0.2.0`, `v0.2.0-pre.1` →
 * `0.2.0-pre.1` — or undefined for any other tag. With `{ core: true }`, only
 * a plain `v<x.y.z>`, the only kind release-please makes.
 */
export function tagVersion(tag, { core = false } = {}) {
  const version = tag.startsWith("v") ? tag.slice(1) : "";
  return (core ? CORE : SEMVER).test(version) ? version : undefined;
}

/**
 * Semver precedence, for sort: negative when `a` ranks below `b`. Numerically,
 * so 0.10.0 follows 0.9.0 and pre.10 follows pre.9, and a release ranks above
 * its own pre-releases.
 */
export function compareVersions(a, b) {
  const parse = (version) => {
    const [core = "", ...suffix] = version.split("-");
    return { core: core.split(".").map(Number), pre: suffix.length ? suffix.join("-").split(".") : [] };
  };
  const [x, y] = [parse(a), parse(b)];
  const i = x.core.findIndex((part, k) => part !== y.core[k]);
  if (i >= 0) return x.core[i] - y.core[i];
  if (!x.pre.length || !y.pre.length) return y.pre.length - x.pre.length;
  for (let k = 0; k < Math.max(x.pre.length, y.pre.length); k++) {
    const [p, q] = [x.pre[k], y.pre[k]];
    if (p === q) continue;
    if (p === undefined) return -1;
    if (q === undefined) return 1;
    const [pn, qn] = [/^\d+$/.test(p), /^\d+$/.test(q)];
    if (pn && qn) return Number(p) - Number(q);
    if (pn !== qn) return pn ? -1 : 1;
    return p < q ? -1 : 1;
  }
  return 0;
}

/** `compareVersions` for release tags: `v0.9.0` before `v0.10.0`. */
export function compareTags(a, b) {
  return compareVersions(a.replace(/^v/, ""), b.replace(/^v/, ""));
}

/**
 * The newest release: the highest `v<x.y.z>` among the published releases
 * that are not pre-releases — what GitHub marks Latest. A tag alone, or a
 * draft, is not a release.
 *
 * @param {{ tag: string, draft: boolean, prerelease: boolean }[]} releases
 * @returns {string | undefined}
 */
export function latestRelease(releases) {
  return releases
    .filter(({ tag, draft, prerelease }) => !draft && !prerelease && tagVersion(tag, { core: true }))
    .map(({ tag }) => tag)
    .sort(compareTags)
    .at(-1);
}

/**
 * Each tag's commit from `git ls-remote --tags`. An annotated tag is listed
 * twice, as the tag object and peeled (`^{}`) as the commit it points at; the
 * commit is what a merge commit is matched against.
 */
export function tagCommits(lsRemote) {
  const commits = new Map();
  for (const line of lsRemote.split("\n")) {
    const [sha, ref] = line.split("\t");
    if (!sha || !ref?.startsWith("refs/tags/")) continue;
    const name = ref.slice("refs/tags/".length);
    if (name.endsWith("^{}")) commits.set(name.slice(0, -3), sha);
    else if (!commits.has(name)) commits.set(name, sha);
  }
  return commits;
}

/**
 * Every release of `repo`, drafts included — GitHub lists a draft only to a
 * token that can push. Through `gh`, so GH_TOKEN or a signed-in `gh` is needed.
 *
 * @returns {{ tag: string, draft: boolean, prerelease: boolean }[]}
 */
export function listReleases(repo) {
  return execFileSync(
    "gh",
    ["api", "--paginate", `repos/${repo}/releases?per_page=100`, "--jq", ".[] | {tag: .tag_name, draft, prerelease}"],
    { encoding: "utf8" },
  )
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

/**
 * Write `version` into every file that carries one: the package (and its
 * lockfile's copy, so `npm ci` and the lockfile never disagree), and every
 * `extra-files` entry release-please bumps — read from its config rather than
 * listed again, so a file added there for the release PR is stamped in every
 * pre-release too, and the two lists cannot drift. The bundle reads the
 * package's.
 */
export function stamp(version, root) {
  if (!SEMVER.test(version)) throw new Error(`not a version: ${version}`);
  const edit = (path, apply) => {
    const file = join(root, path);
    const json = JSON.parse(readFileSync(file, "utf8"));
    apply(json);
    writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  };
  edit("package.json", (json) => (json.version = version));
  edit("package-lock.json", (json) => {
    json.version = version;
    if (json.packages?.[""]) json.packages[""].version = version;
  });
  const config = JSON.parse(readFileSync(join(root, "release-please-config.json"), "utf8"));
  for (const extra of config.packages["."]["extra-files"] ?? []) {
    // The only shape this repository uses; any other is refused, never skipped,
    // so a pre-release cannot ship one file still carrying the old version.
    if (extra.type !== "json" || extra.jsonpath !== "$.version") {
      throw new Error(`cannot stamp ${JSON.stringify(extra)}: only json $.version entries are known`);
    }
    edit(extra.path, (json) => (json.version = version));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  try {
    if (process.argv[2] === "--stamp") {
      stamp(process.argv[3] ?? "", root);
    } else {
      // From the remote, not the checkout: a build that waited behind another
      // on the same branch must see the tag that one just made.
      const tags = [...tagCommits(execFileSync("git", ["ls-remote", "--tags", "origin"], { cwd: root, encoding: "utf8" })).keys()];
      // RELEASE_REF first: a called workflow is handed the ref to build, and
      // GitHub does not let a step overwrite its own GITHUB_* variables, which
      // keep naming the caller's branch.
      const result = releaseVersion({
        ref: process.env.RELEASE_REF || process.env.GITHUB_REF_NAME || "",
        refType: process.env.RELEASE_REF_TYPE || process.env.GITHUB_REF_TYPE || "",
        tags,
        packageVersion: JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version,
      });
      const lines = Object.entries(result).map(([key, value]) => `${key}=${value}\n`).join("");
      if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, lines);
      process.stdout.write(lines);
    }
  } catch (err) {
    process.stderr.write(`release-version: ${err instanceof Error ? err.message : err}\n`);
    process.exit(1);
  }
}
