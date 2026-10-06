#!/usr/bin/env node
/**
 * What a release run must finish, read from GitHub rather than from what
 * release-please's action reported.
 *
 *   node scripts/pending-release.mjs   finish=[…] relabel=[…] for $GITHUB_OUTPUT
 *
 * Merging the release PR makes release-please create the tag, then a draft
 * release, then relabel the PR from `autorelease: pending` to
 * `autorelease: tagged`; the build that attaches the assets and publishes the
 * draft runs after. For 0.1.2 the relabel failed: the action set no outputs,
 * so the build never ran, and nothing else could start it — a tag made with
 * GITHUB_TOKEN starts no workflow. And a PR left pending stops release-please
 * opening the next release PR, while its next run would try to create the
 * release again. So every release run asks what exists, whatever the action
 * did (release-please.yml):
 *
 * - `finish`: every draft whose `v<version>` tag exists and that has no
 *   published release beside it, for release-build.yml to publish. A draft
 *   without its tag is someone's notes for a version not yet released. The
 *   same rule rebuilds a release whose build failed, on the next run.
 * - `relabel`: every merged PR still labelled pending whose merge commit
 *   carries a tag that has a release, draft or published — the state in which
 *   release-please would have relabelled it. A tag with no release yet keeps
 *   its PR pending: release-please's next run makes the release only for a PR
 *   still labelled pending.
 *
 * Each is idempotent, so a run that fails partway is finished by the next.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const RELEASE_TAG = /^v(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z.-]+)?$/;

/**
 * @param {{
 *   releases: { tag: string, draft: boolean }[],
 *   tags: Map<string, string>,
 *   pulls: { number: number, sha: string }[],
 * }} input every release, drafts included; every tag and the commit it is on;
 *   every merged PR still labelled `autorelease: pending`, with its merge commit
 * @returns {{ finish: string[], relabel: number[] }}
 */
export function pendingRelease({ releases, tags, pulls }) {
  const released = new Set(releases.filter((release) => !release.draft).map((release) => release.tag));
  const finish = [
    ...new Set(
      releases
        .filter(({ tag, draft }) => draft && RELEASE_TAG.test(tag) && tags.has(tag) && !released.has(tag))
        .map((release) => release.tag),
    ),
  ].sort(byVersion);
  const withRelease = new Set(
    releases.filter(({ tag }) => RELEASE_TAG.test(tag) && tags.has(tag)).map(({ tag }) => tags.get(tag)),
  );
  const relabel = pulls.filter((pull) => withRelease.has(pull.sha)).map((pull) => pull.number);
  return { finish, relabel };
}

/** Oldest version first, numerically: v0.9.0 before v0.10.0. */
function byVersion(a, b) {
  const [x, y] = [a, b].map((tag) => (RELEASE_TAG.exec(tag) ?? []).slice(1, 4).map(Number));
  const i = x.findIndex((part, k) => part !== y[k]);
  return i < 0 ? a.localeCompare(b) : x[i] - y[i];
}

/**
 * Each tag's commit from `git ls-remote --tags`. An annotated tag is listed
 * twice, as the tag object and peeled (`^{}`) as the commit it points at, and
 * a merge commit is matched against the commit.
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const repo = process.env.GITHUB_REPOSITORY;
    if (!repo) throw new Error("GITHUB_REPOSITORY names no repository");
    const run = (command, args) => execFileSync(command, args, { encoding: "utf8" });
    // A draft is listed only to a token that can push, which the job has.
    const releases = run("gh", [
      "api",
      "--paginate",
      `repos/${repo}/releases?per_page=100`,
      "--jq",
      ".[] | {tag: .tag_name, draft: .draft}",
    ])
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    // From the remote: the job's checkout fetched no tags.
    const tags = tagCommits(run("git", ["ls-remote", "--tags", "origin"]));
    // The issues endpoint, not `gh pr list --label`, which goes through search:
    // its index lags, and would still show pending a PR release-please had
    // relabelled seconds before, in the very run that released it.
    const label = encodeURIComponent("autorelease: pending");
    const pulls = run("gh", [
      "api",
      "--paginate",
      `repos/${repo}/issues?state=closed&labels=${label}&per_page=100`,
      "--jq",
      ".[] | select(.pull_request.merged_at != null) | .number",
    ])
      .split("\n")
      .filter(Boolean)
      .map((number) => ({
        number: Number(number),
        sha: run("gh", ["api", `repos/${repo}/pulls/${number}`, "--jq", ".merge_commit_sha"]).trim(),
      }));
    const { finish, relabel } = pendingRelease({ releases, tags, pulls });
    const lines = `finish=${JSON.stringify(finish)}\nrelabel=${JSON.stringify(relabel)}\n`;
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, lines);
    process.stdout.write(lines);
  } catch (err) {
    process.stderr.write(`pending-release: ${err instanceof Error ? err.message : err}\n`);
    process.exit(1);
  }
}
