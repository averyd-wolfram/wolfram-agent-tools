#!/usr/bin/env node
/**
 * The `release` branch, which another project follows to get the plugin, and
 * GitHub's Latest, which must agree with it (#7, #43).
 *
 *   node scripts/release-branch.mjs plan                     newest=… head=… steps=… backfill=… latest=… for $GITHUB_OUTPUT
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
 * branch moves forward to it — never back — a commit for each release since
 * the version it carries, each from that release's downloaded and verified
 * archive (the publication order of plugin plan §5 M1). Each version is
 * tagged `wolfram--v<version>` at its own commit, Claude Code's own
 * convention for a plugin's release tags, which a version range in another
 * plugin's dependency resolves against, and the newest is marked Latest.
 * Builds publish with Latest off. So a
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
 *   history: { commit: string, version: string | undefined }[],
 *   latestTag: string | undefined,
 *   tags: Iterable<[string, string]>,
 * }} input every release; the branch's commits, newest first, each with the
 *   version its `plugin.json` carries (none when the branch does not exist
 *   yet); the release GitHub marks Latest, if any; every tag, with its commit
 * @returns {{
 *   newest?: string, version?: string, head?: string,
 *   steps: { version: string, tag?: string }[], move: boolean,
 *   backfill: { tag: string, commit: string }[],
 *   latest: boolean, ahead?: string, warnings: string[],
 * }}
 *   `head`: the branch's commit as read, which `steps` go on top of;
 *   `steps`: each version to commit to the branch in turn, oldest first, with
 *   the tag to put on its commit, none when one is already elsewhere;
 *   `backfill`: tags missing from commits already on the branch;
 *   `latest`: mark `newest` Latest; `ahead`: why the branch stays put although
 *   it carries no published version; `warnings`: tags not where the branch
 *   puts their versions
 */
export function advancePlan({ releases, history, latestTag, tags }) {
  const head = history[0];
  if (head && !(head.version !== undefined && tagVersion(`v${head.version}`, { core: true }))) {
    throw new Error(`the ${BRANCH} branch's plugin.json says ${head.version}, which is not x.y.z, so it can't be ordered`);
  }
  const result = { move: false, steps: [], backfill: [], latest: false, warnings: [] };
  if (head) result.head = head.commit;
  // Every version the branch has carried, at the newest commit carrying it,
  // and every published one: only a release is pinned by a tag, so a version
  // the branch carries that no release does is left untagged.
  const carried = new Map();
  for (const { commit, version } of history) {
    if (version !== undefined && !carried.has(version)) carried.set(version, commit);
  }
  const releaseVersions = new Set(
    releases
      .filter(({ draft, prerelease }) => !draft && !prerelease)
      .map(({ tag }) => tagVersion(tag, { core: true }))
      .filter((version) => version !== undefined),
  );
  // Checked, not trusted by name: a tag where the branch does not put its
  // version was pushed by hand, or by a step that tagged the branch as it
  // found it rather than the commit its plan read (#58). Never moved here:
  // the rulesets docs/releasing.md recommends forbid it, and a pin someone
  // already follows should not change under them.
  const tagAt = new Map(tags);
  for (const [version, commit] of carried) {
    const tag = versionTag(version);
    const at = tagAt.get(tag);
    if (at === undefined) {
      if (releaseVersions.has(version)) result.backfill.push({ tag, commit });
    } else if (at !== commit) {
      result.warnings.push(`${tag} is at ${at}, not at ${commit}, the ${BRANCH} commit that carries ${version}`);
    }
  }
  // Oldest first, as they are committed.
  result.backfill.reverse();

  const newest = latestRelease(releases);
  if (!newest) return result;
  const version = tagVersion(newest);
  Object.assign(result, { newest, version, latest: latestTag !== newest });
  const order = head ? compareVersions(version, head.version) : 1;
  // Latest stays put too: moving it would name a release the branch, which
  // is what projects run, doesn't carry.
  if (order < 0) {
    result.latest = false;
    result.ahead =
      `the ${BRANCH} branch carries ${head.version}, newer than any published release (${newest}): ` +
      "it never moves back, so it and Latest stay until a release passes it";
    return result;
  }
  // Every release newer than the branch, each a commit of its own, so none
  // the branch passes is left with no commit to pin (#58). A new branch starts
  // at the newest: the releases before the branch existed have no plugin
  // archive to build one from.
  const due = head
    ? [...releaseVersions].filter((v) => compareVersions(v, head.version) > 0).sort(compareVersions)
    : [version];
  for (const v of due) {
    const tag = versionTag(v);
    const at = tagAt.get(tag);
    if (at === undefined) {
      result.steps.push({ version: v, tag });
    } else {
      result.steps.push({ version: v });
      result.warnings.push(`${tag} is at ${at} already, though the ${BRANCH} branch has never carried ${v}: it is left there`);
    }
  }
  result.move = result.steps.length > 0;
  return result;
}

/**
 * The branch's commits, newest first, each with the version its `plugin.json`
 * carries; none when the branch does not exist. One fetch, so the head the
 * step builds on and tags, the version it is ordered by, and every commit a
 * tag is checked against are the same read. The plan once read the version
 * through the API and left the step to fetch the branch again and tag
 * whatever it found there (#58). The fetch leaves the commits in this
 * checkout, which the step, in the same job, builds on.
 *
 * @param {(cmd: string, argv: string[]) => string} run
 */
export function branchHistory(run) {
  // The full ref: a bare `release` matches any branch ending in /release.
  const heads = run("git", ["ls-remote", "--heads", "origin", `refs/heads/${BRANCH}`]).trim();
  if (!heads) return [];
  const remote = `refs/remotes/origin/${BRANCH}`;
  run("git", ["fetch", "-q", "--no-tags", "origin", `+refs/heads/${BRANCH}:${remote}`]);
  return run("git", ["rev-list", remote])
    .trim()
    .split("\n")
    .map((commit) => {
      let version;
      try {
        version = JSON.parse(run("git", ["show", `${commit}:plugin/.claude-plugin/plugin.json`])).version;
      } catch {
        // A commit with no readable plugin.json carries no version; at the
        // branch's head, advancePlan refuses it.
      }
      return { commit, version };
    });
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
      const history = branchHistory(run);
      // Only "no Latest yet" is a 404 here; anything else must stop the run.
      let latestTag;
      try {
        latestTag = run("gh", ["api", `repos/${repo}/releases/latest`, "--jq", ".tag_name"]).trim() || undefined;
      } catch (err) {
        if (!/HTTP 404/.test(String(err.stderr ?? err.message))) throw err;
      }
      const tags = tagCommits(run("git", ["ls-remote", "--tags", "origin"]));
      const result = advancePlan({ releases: listReleases(repo), history, latestTag, tags });
      // Space-separated words for the step's shell to loop over: a version
      // and the tag for its commit, or a commit and the tag it lacks. A step
      // whose tag is elsewhere already gets none, so `0.1.7=`.
      const outputs = {
        newest: result.newest ?? "",
        head: result.head ?? "",
        move: result.move,
        steps: result.steps.map(({ version, tag }) => `${version}=${tag ?? ""}`).join(" "),
        backfill: result.backfill.map(({ tag, commit }) => `${commit}=${tag}`).join(" "),
        latest: result.latest,
      };
      const lines = Object.entries(outputs)
        .map(([key, value]) => `${key}=${value}\n`)
        .join("");
      if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, lines);
      process.stdout.write(lines);
      for (const warning of [result.ahead, ...result.warnings]) {
        if (warning) process.stdout.write(`::warning::${warning}\n`);
      }
    } else {
      throw new Error("usage: release-branch.mjs plan | tree <zip> <dir> <version>");
    }
  } catch (err) {
    process.stderr.write(`release-branch: ${err instanceof Error ? err.message : err}\n`);
    process.exit(1);
  }
}
