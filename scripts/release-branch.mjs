#!/usr/bin/env node
/**
 * The `release` branch, which another project follows to get the plugin, and
 * GitHub's Latest, which must agree with it (#7, #43).
 *
 *   node scripts/release-branch.mjs plan                     newest=… move=… tag=… latest=… for $GITHUB_OUTPUT
 *   node scripts/release-branch.mjs tree <zip> <dir> <version>   the branch's files, from a release's plugin archive
 *
 * A project adds this repository as a Claude Code marketplace at
 * `"ref": "release"` with `"autoUpdate": true`, and gets each release with no
 * edit of its own; or at `"ref": "wolfram--v<version>"`, pinned. Claude Code
 * fetches a plugin that only a project's settings enable only when its
 * marketplace entry is a relative path, so the branch holds the built plugin
 * itself, `plugin/` — exactly a release's `wolfram-plugin-<version>.zip` — and
 * a marketplace naming it `./plugin`. It updates a plugin when the version in
 * `plugin.json` changes, which release-please bumps every release.
 *
 * One job decides both, at the end of every release run (release-please.yml),
 * from what is published rather than from what that run built: the newest
 * release is the highest `v<x.y.z>` published and not a pre-release. The
 * branch moves forward to it — never back — from its downloaded and verified
 * archive (the publication order of plugin plan §5 M1), its version is tagged
 * `wolfram--v<version>`, Claude Code's own convention for a plugin's release
 * tags, which a version range in another plugin's dependency resolves
 * against, and it is marked Latest. Builds publish with Latest off. So a
 * release finished late, or built by hand, moves neither, and every run
 * repeats what one left undone. Release runs never overlap, so the job has no
 * race of its own.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compareVersions, latestRelease, listReleases, tagCommits, tagVersion } from "./release-version.mjs";

/** The repository a project adds as its marketplace. */
export const REPO = "averyd-wolfram/wolfram-agent-tools";
export const MARKETPLACE = "wolfram-agent-tools";
export const PLUGIN = "wolfram";
export const BRANCH = "release";

/** A version's tag on the branch: Claude Code's `<plugin>--v<version>`. */
export function versionTag(version) {
  return `${PLUGIN}--v${version}`;
}

/**
 * @param {{
 *   releases: { tag: string, draft: boolean, prerelease: boolean }[],
 *   branchVersion: string | undefined,
 *   latestTag: string | undefined,
 *   tags: Iterable<string>,
 * }} input every release; the version in the branch's `plugin.json`, if the
 *   branch exists; the release GitHub marks Latest, if any; every tag
 * @returns {{ newest?: string, version?: string, move: boolean, tag?: string, latest: boolean, ahead?: string }}
 *   `move`: commit the newest release's plugin to the branch; `tag`: the tag to
 *   put on the branch's new or current head; `latest`: mark `newest` Latest;
 *   `ahead`: why the branch stays put although it carries no published version
 */
export function advancePlan({ releases, branchVersion, latestTag, tags }) {
  const newest = latestRelease(releases);
  if (!newest) return { move: false, latest: false };
  const version = tagVersion(newest);
  const order = branchVersion === undefined ? 1 : compareVersions(version, branchVersion);
  const result = { newest, version, move: order > 0, latest: latestTag !== newest };
  // Latest stays put too: moving it would name a release the branch, which
  // is what projects run, doesn't carry.
  if (order < 0) {
    result.latest = false;
    result.ahead =
      `the ${BRANCH} branch carries ${branchVersion}, newer than any published release (${newest}): ` +
      "it never moves back, so it and Latest stay until a release passes it";
    return result;
  }
  const tag = versionTag(version);
  if (!new Set(tags).has(tag)) result.tag = tag;
  return result;
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Write the branch's files into `dir`, which must not exist yet: `plugin/`
 * unzipped from a release's archive, the marketplace naming it, and a README.
 * The archive must carry `version`, so a branch never says one release and
 * holds another.
 */
export function branchTree(zip, dir, version) {
  // unzip into a directory already there would merge the archive with
  // whatever was left in it.
  if (existsSync(dir)) throw new Error(`${dir} already exists; the branch's tree is built into a new one`);
  const plugin = join(dir, "plugin");
  mkdirSync(plugin, { recursive: true });
  execFileSync("unzip", ["-q", zip, "-d", plugin]);
  const manifest = JSON.parse(readFileSync(join(plugin, ".claude-plugin", "plugin.json"), "utf8"));
  if (manifest.version !== version) {
    throw new Error(`${zip} carries ${PLUGIN} ${manifest.version}, not the ${version} it is published as`);
  }
  const { owner } = JSON.parse(readFileSync(join(root, ".claude-plugin", "marketplace.json"), "utf8"));
  // No version in the entry: Claude Code reads plugin.json's first, and
  // `claude plugin validate` reports the two disagreeing.
  // The description twice: the client floor, 2.1.75, reads it from
  // `metadata` and warns of it missing there; later clients read the top level.
  const description = `The ${PLUGIN} plugin's latest release, from ${REPO}`;
  const marketplace = {
    name: MARKETPLACE,
    description,
    owner,
    metadata: { description },
    plugins: [{ name: PLUGIN, source: "./plugin", description: manifest.description }],
  };
  mkdirSync(join(dir, ".claude-plugin"));
  writeFileSync(join(dir, ".claude-plugin", "marketplace.json"), `${JSON.stringify(marketplace, null, 2)}\n`);
  writeFileSync(join(dir, "README.md"), readme(version));
}

function readme(version) {
  const settings = (ref, autoUpdate) =>
    JSON.stringify(
      {
        extraKnownMarketplaces: {
          [MARKETPLACE]: {
            source: { source: "github", repo: REPO, ref },
            ...(autoUpdate ? { autoUpdate: true } : {}),
          },
        },
        enabledPlugins: { [`${PLUGIN}@${MARKETPLACE}`]: true },
      },
      null,
      2,
    );
  return `# ${PLUGIN} ${version}, the latest release

This branch is written by the release workflow, never by hand. It holds the
\`${PLUGIN}\` Claude Code plugin from the newest release of
[wolfram-agent-tools](https://github.com/${REPO}) —
\`plugin/\` is exactly that release's \`${PLUGIN}-plugin-${version}.zip\` — as a
marketplace named \`${MARKETPLACE}\`. It moves only after a release's assets are
published and verified, and only forward.

To follow every release in a project, commit this to its \`.claude/settings.json\`:

\`\`\`json
${settings(BRANCH, true)}
\`\`\`

To stay on one version, use its tag as the \`ref\` instead, without \`autoUpdate\`:
\`"ref": "${versionTag(version)}"\`.
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const [, , command, ...args] = process.argv;
    if (command === "tree") {
      const [zip, dir, version] = args;
      if (!zip || !dir || !version) throw new Error("tree needs <zip> <dir> <version>");
      branchTree(zip, dir, version);
    } else if (command === "plan") {
      const repo = process.env.GITHUB_REPOSITORY;
      if (!repo) throw new Error("GITHUB_REPOSITORY names no repository");
      const run = (cmd, argv) => execFileSync(cmd, argv, { encoding: "utf8" });
      // The full ref: a bare `release` matches any branch ending in /release.
      const heads = run("git", ["ls-remote", "--heads", "origin", `refs/heads/${BRANCH}`]).trim();
      const branchVersion = heads
        ? JSON.parse(
            run("gh", ["api", "-H", "Accept: application/vnd.github.raw+json", `repos/${repo}/contents/plugin/.claude-plugin/plugin.json?ref=${BRANCH}`]),
          ).version
        : undefined;
      // Only "no Latest yet" is a 404 here; anything else must stop the run.
      let latestTag;
      try {
        latestTag = run("gh", ["api", `repos/${repo}/releases/latest`, "--jq", ".tag_name"]).trim() || undefined;
      } catch (err) {
        if (!/HTTP 404/.test(String(err.stderr ?? err.message))) throw err;
      }
      const tags = tagCommits(run("git", ["ls-remote", "--tags", "origin"])).keys();
      const result = advancePlan({ releases: listReleases(repo), branchVersion, latestTag, tags });
      const lines = ["newest", "version", "move", "tag", "latest"]
        .map((key) => `${key}=${result[key] ?? ""}\n`)
        .join("");
      if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, lines);
      process.stdout.write(lines);
      if (result.ahead) process.stdout.write(`::warning::${result.ahead}\n`);
    } else {
      throw new Error("usage: release-branch.mjs plan | tree <zip> <dir> <version>");
    }
  } catch (err) {
    process.stderr.write(`release-branch: ${err instanceof Error ? err.message : err}\n`);
    process.exit(1);
  }
}
