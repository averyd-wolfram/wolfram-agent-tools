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
 * - a `v<version>` tag: that release. Below 1.0.0, or with a `-` suffix, it is
 *   marked a pre-release on GitHub: nothing before 1.0.0 is a supported release.
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
    return {
      version,
      tag: ref,
      prerelease: version.startsWith("0.") || version.includes("-"),
      create: false,
    };
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
      const tags = execFileSync("git", ["ls-remote", "--tags", "--refs", "origin"], {
        cwd: root,
        encoding: "utf8",
      })
        .split("\n")
        .map((line) => line.split("\trefs/tags/")[1])
        .filter(Boolean);
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
