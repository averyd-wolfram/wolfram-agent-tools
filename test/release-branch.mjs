#!/usr/bin/env node
/**
 * The release branch (scripts/release-branch.mjs): what a release run moves it
 * to, and what it holds.
 *
 * Another project follows releases by adding this repository as a Claude Code
 * marketplace at `"ref": "release"` with `autoUpdate` (#7). So the branch must
 * only ever move forward, to a release that is published and verified, carry
 * a marketplace Claude Code installs from by relative path, and agree with
 * GitHub's Latest; and each version it carries is tagged `wolfram--v<version>`,
 * the ref a project pins instead.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { advancePlan, branchTree, versionTag } from "../scripts/release-branch.mjs";

let failures = 0;
let checks = 0;
const check = (label, ok, detail = "") => {
  checks++;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
};

const rel = (tag, draft = false, prerelease = false) => ({ tag, draft, prerelease });
const published = [rel("v0.1.0"), rel("v0.1.1"), rel("v0.1.2"), rel("v0.1.3-pre.1", false, true)];
// The branch's commits, newest first, each with the version its plugin.json
// carries; and each tag's commit, as `git ls-remote --tags` gives them.
const carries = (version, commit = `c${version.replaceAll(".", "")}`) => ({ version, commit });
const tagged = (...commits) => commits.map(({ version, commit }) => [versionTag(version), commit]);
const branch = [carries("0.1.2")];
const plan = (overrides) =>
  advancePlan({ releases: published, history: branch, latestTag: "v0.1.2", tags: tagged(...branch), ...overrides });
const show = (result) => JSON.stringify(result);
const versions = (result) => (result.steps ?? []).map((step) => `${step.version}${step.tag ? "+tag" : ""}`).join(" ");

console.log("\nrelease-branch: where a release run moves it");
const first = plan({ history: [], latestTag: undefined, tags: [] });
check(
  "with no branch yet, it is made from the newest release, tagged, and that release marked Latest",
  first.newest === "v0.1.2" && versions(first) === "0.1.2+tag" && first.move && first.latest && !first.head,
  show(first),
);
const steady = plan({});
check(
  "at the newest release, tagged and Latest, nothing moves",
  steady.newest === "v0.1.2" && !steady.move && versions(steady) === "" && steady.backfill?.length === 0 &&
    !steady.latest && !steady.ahead && steady.warnings?.length === 0 && steady.head === "c012",
  show(steady),
);
const next = plan({ releases: [...published, rel("v0.1.3")] });
check(
  "a newer release moves it forward, tags it, and marks it Latest",
  next.newest === "v0.1.3" && next.move && versions(next) === "0.1.3+tag" && next.latest && next.head === "c012",
  show(next),
);
// Two releases out since the branch last moved — finished in one run, or a run
// that failed before the second came out — and only the newest was committed:
// the older one never had a branch commit, so no tag to pin it by (#58).
const skipped = plan({ releases: [...published, rel("v0.1.4"), rel("v0.1.3")] });
check(
  "each release since the branch's version is committed and tagged in turn, oldest first",
  skipped.newest === "v0.1.4" && versions(skipped) === "0.1.3+tag 0.1.4+tag" && skipped.move,
  show(skipped),
);
// A release finished late, published after a newer one, is not the newest:
// neither the branch nor Latest goes back to it. #43's out-of-order edges.
const late = plan({
  releases: [...published, rel("v0.1.3")],
  history: [carries("0.1.3"), ...branch],
  latestTag: "v0.1.1",
  tags: tagged(carries("0.1.3"), ...branch),
});
check(
  "Latest that went to an older release comes back to the newest, and the branch stays",
  late.newest === "v0.1.3" && !late.move && late.latest && late.backfill?.length === 0,
  show(late),
);
const drafts = plan({ releases: [...published, rel("v0.1.3", true)] });
check(
  "a draft or a pre-release is not a release: neither moves it",
  drafts.newest === "v0.1.2" && !drafts.move && !drafts.latest,
  show(drafts),
);
// A run that moved the branch and then failed before tagging leaves the
// version untagged: the next run tags the commit it read, not whatever the
// branch is by the time its step runs (#58).
const untagged = plan({ tags: [] });
check(
  "a branch version left untagged is tagged at the commit the plan read, without moving",
  !untagged.move && show(untagged.backfill) === show([{ tag: "wolfram--v0.1.2", commit: "c012" }]),
  show(untagged),
);
const three = [carries("0.1.4"), carries("0.1.3"), ...branch];
const midway = plan({
  releases: [...published, rel("v0.1.3"), rel("v0.1.4")],
  history: three,
  latestTag: "v0.1.4",
  tags: tagged(three[0], ...branch),
});
check(
  "and so is an older one, at its own commit",
  !midway.move && show(midway.backfill) === show([{ tag: "wolfram--v0.1.3", commit: "c013" }]),
  show(midway),
);
// The branch began at 0.1.2: what came before it was never on it, and stays
// untagged, unreported, rather than tagged at a commit that does not carry it.
// v0.1.0 and v0.1.1 are published and untagged here, as on GitHub.
check(
  "and a release from before the branch's first version is neither tagged nor reported",
  steady.backfill?.length === 0 && steady.warnings?.length === 0,
  show(steady),
);
// One finished late, published once the branch had passed it, can be given
// no commit, since the branch never moves back: said, not left silent.
const passed = plan({
  releases: [...published, rel("v0.1.3"), rel("v0.1.4")],
  history: [carries("0.1.4"), ...branch],
  latestTag: "v0.1.4",
  tags: tagged(carries("0.1.4"), ...branch),
});
check(
  "a release the branch passed without a commit is reported",
  !passed.move && passed.backfill?.length === 0 && passed.warnings?.some((w) => /v0\.1\.3/.test(w)),
  show(passed),
);
// A tag is checked, not trusted by name (#58).
const moved = plan({ tags: [["wolfram--v0.1.2", "c999"]] });
check(
  "a tag at another commit than the branch's for its version is reported, and left where it is",
  !moved.move && moved.backfill?.length === 0 &&
    moved.warnings?.some((w) => /wolfram--v0\.1\.2/.test(w) && /c999/.test(w) && /c012/.test(w)),
  show(moved),
);
const stray = plan({ tags: [...tagged(...branch), ["wolfram--v0.1.1", "c999"]] });
check(
  "so is a tag for a version the branch has never carried",
  stray.warnings?.some((w) => /wolfram--v0\.1\.1/.test(w) && /c999/.test(w)) && stray.warnings?.length === 1,
  show(stray),
);
const fresh = plan({ history: [], latestTag: undefined, tags: [["wolfram--v0.1.2", "c999"]] });
check(
  "and with no branch yet, one already there for the newest is reported once, as given",
  versions(fresh) === "0.1.2" && fresh.warnings?.length === 1 && /c999 already/.test(fresh.warnings[0]),
  show(fresh),
);
const early = plan({ releases: [...published, rel("v0.1.3")], tags: [...tagged(...branch), ["wolfram--v0.1.3", "c999"]] });
check(
  "and one already there for a version the branch is only now given is left, untouched, and reported",
  versions(early) === "0.1.3" && early.warnings?.length === 1 &&
    early.warnings.some((w) => /wolfram--v0\.1\.3/.test(w) && /c999/.test(w)),
  show(early),
);
check(
  "numerically: 0.10.0 follows 0.9.0",
  plan({ releases: [rel("v0.9.0"), rel("v0.10.0")], history: [carries("0.9.0")], tags: [] }).newest === "v0.10.0",
);
// The branch never goes back: if it carries a version no published release
// does — one deleted, or flagged pre-release by hand — it stays and says so,
// and Latest isn't moved to a release the branch doesn't carry.
const ahead = plan({ history: [carries("0.1.3"), ...branch], latestTag: "v0.1.1", tags: tagged(...branch) });
check(
  "a branch ahead of every published release stays where it is, says so, and leaves Latest",
  !ahead.move && ahead.backfill?.length === 0 && !ahead.latest && /0\.1\.3/.test(ahead.ahead ?? ""),
  show(ahead),
);
// Not a version, a branch can't be ordered against a release: comparing one
// would read as "already current", and tag and mark Latest over a build the
// branch may not hold.
let garbled = "";
try {
  plan({ history: [carries("0.1")] });
} catch (err) {
  garbled = err.message;
}
check("a branch whose plugin.json carries no x.y.z version stops the plan", /0\.1/.test(garbled), garbled);
const none = plan({ releases: [rel("v0.1.0-pre.1", false, true)], history: [], latestTag: undefined, tags: [] });
check(
  "with no release published, nothing happens",
  !none.newest && !none.move && versions(none) === "" && none.backfill?.length === 0 && !none.latest,
  show(none),
);
check("a version's tag follows Claude Code's <plugin>--v<version>", versionTag("1.2.3") === "wolfram--v1.2.3");

console.log("\nrelease-branch: what it holds");
const work = mkdtempSync(join(tmpdir(), "release-branch-"));
try {
  // A plugin tree zipped the way release-artifacts.mjs zips one: -X -r from
  // inside it.
  const plugin = join(work, "plugin");
  mkdirSync(join(plugin, ".claude-plugin"), { recursive: true });
  mkdirSync(join(plugin, "skills", "doctor"), { recursive: true });
  const manifest = { name: "wolfram", version: "9.8.7", description: "Wolfram Language for Claude Code" };
  writeFileSync(join(plugin, ".claude-plugin", "plugin.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(join(plugin, "skills", "doctor", "SKILL.md"), "---\nname: doctor\n---\n");
  writeFileSync(join(plugin, "wolfram-mcp-server.mjs"), "// bundle\n");
  const zip = join(work, "wolfram-plugin-9.8.7.zip");
  execFileSync("zip", ["-X", "-q", "-r", zip, "."], { cwd: plugin });

  const tree = join(work, "tree");
  branchTree(zip, tree, "9.8.7");
  const marketplace = JSON.parse(readFileSync(join(tree, ".claude-plugin", "marketplace.json"), "utf8"));
  const entry = marketplace.plugins?.[0];
  check(
    "the marketplace is wolfram-agent-tools, its one entry wolfram at ./plugin",
    marketplace.name === "wolfram-agent-tools" && marketplace.plugins.length === 1 &&
      entry.name === "wolfram" && entry.source === "./plugin" && typeof marketplace.owner?.name === "string",
    show(marketplace),
  );
  // Claude Code reads the version from plugin.json first; one in the entry too
  // is the mismatch `claude plugin validate` reports.
  check("the entry carries no version of its own", entry && !("version" in entry), show(entry));
  check(
    "plugin/ is exactly the archive's tree, bundle and skills included",
    readFileSync(join(tree, "plugin", ".claude-plugin", "plugin.json"), "utf8").includes('"9.8.7"') &&
      existsSync(join(tree, "plugin", "wolfram-mcp-server.mjs")) &&
      existsSync(join(tree, "plugin", "skills", "doctor", "SKILL.md")),
  );
  // Into a fresh directory only: unzip into one already there would merge
  // the archive with whatever was left in it.
  let stale = "";
  try {
    branchTree(zip, tree, "9.8.7");
  } catch (err) {
    stale = err.message;
  }
  check("a directory that already exists is refused, not merged into", /exists/.test(stale), stale);
  let refused = "";
  try {
    branchTree(zip, join(work, "other"), "9.8.8");
  } catch (err) {
    refused = err.message;
  }
  check("an archive whose plugin.json names another version is refused", /9\.8\.7/.test(refused) && /9\.8\.8/.test(refused), refused);
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log(
  failures === 0
    ? `\n${checks} checks, all passed.\n`
    : `\n${failures} of ${checks} checks failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
