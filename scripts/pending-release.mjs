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
 * - `finish`: every draft whose `v<x.y.z>` tag exists and that has no
 *   published release beside it, for release-build.yml to publish. A draft
 *   without its tag is someone's notes for a version not yet released, and one
 *   on a suffixed tag is not release-please's: it makes only `v<x.y.z>`, and a
 *   pre-release is published as it is made. The same rule rebuilds a release
 *   whose build failed, on the next run.
 * - `relabel`: every merged PR still labelled pending whose merge commit
 *   carries such a tag with a release, draft or published — the state in which
 *   release-please would have relabelled it. A tag with no release yet keeps
 *   its PR pending: release-please's next run makes the release only for a PR
 *   still labelled pending.
 *
 * Each is idempotent, so a run that fails partway is finished by the next.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { compareVersions, listReleases, tagCommits, tagVersion } from "./release-version.mjs";

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
  const ours = releases.filter(({ tag }) => tagVersion(tag, { core: true }) && tags.has(tag));
  const published = new Set(ours.filter((release) => !release.draft).map((release) => release.tag));
  const finish = [...new Set(ours.filter((release) => release.draft && !published.has(release.tag)).map(({ tag }) => tag))]
    .sort((a, b) => compareVersions(a.slice(1), b.slice(1)));
  const released = new Set(ours.map(({ tag }) => tags.get(tag)));
  const relabel = pulls.filter((pull) => released.has(pull.sha)).map((pull) => pull.number);
  return { finish, relabel };
}

// The repository's own list of pull requests, filtered by label, rather than
// `gh pr list --label`, which goes through search, whose index lags: it could
// still show pending a PR release-please relabelled seconds before. One call
// returns each merge commit too.
const PENDING_PULLS = `query($owner: String!, $name: String!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequests(first: 100, after: $endCursor, states: MERGED, labels: ["autorelease: pending"]) {
      nodes { number mergeCommit { oid } }
      pageInfo { hasNextPage endCursor }
    }
  }
}`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const repo = process.env.GITHUB_REPOSITORY;
    if (!repo) throw new Error("GITHUB_REPOSITORY names no repository");
    const [owner, name] = repo.split("/");
    // From the remote: the job's checkout fetched no tags.
    const tags = tagCommits(execFileSync("git", ["ls-remote", "--tags", "origin"], { encoding: "utf8" }));
    const pulls = execFileSync(
      "gh",
      [
        "api",
        "graphql",
        "--paginate",
        "-f",
        `query=${PENDING_PULLS}`,
        "-f",
        `owner=${owner}`,
        "-f",
        `name=${name}`,
        "--jq",
        ".data.repository.pullRequests.nodes[] | {number, sha: .mergeCommit.oid}",
      ],
      { encoding: "utf8" },
    )
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    const { finish, relabel } = pendingRelease({ releases: listReleases(repo), tags, pulls });
    const lines = `finish=${JSON.stringify(finish)}\nrelabel=${JSON.stringify(relabel)}\n`;
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, lines);
    process.stdout.write(lines);
  } catch (err) {
    process.stderr.write(`pending-release: ${err instanceof Error ? err.message : err}\n`);
    process.exit(1);
  }
}
