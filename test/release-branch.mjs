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
const plan = (overrides) =>
  advancePlan({ releases: published, branchVersion: "0.1.2", latestTag: "v0.1.2", tags: ["wolfram--v0.1.2"], ...overrides });
const show = (result) => JSON.stringify(result);

console.log("\nrelease-branch: where a release run moves it");
const first = plan({ branchVersion: undefined, latestTag: undefined, tags: [] });
check(
  "with no branch yet, it is made from the newest release, tagged, and that release marked Latest",
  first.newest === "v0.1.2" && first.version === "0.1.2" && first.move && first.tag === "wolfram--v0.1.2" && first.latest,
  show(first),
);
const steady = plan({});
check(
  "at the newest release, tagged and Latest, nothing moves",
  steady.newest === "v0.1.2" && !steady.move && !steady.tag && !steady.latest && !steady.ahead,
  show(steady),
);
const next = plan({ releases: [...published, rel("v0.1.3")] });
check(
  "a newer release moves it forward, tags it, and marks it Latest",
  next.newest === "v0.1.3" && next.move && next.tag === "wolfram--v0.1.3" && next.latest,
  show(next),
);
// A release finished late, published after a newer one, is not the newest:
// neither the branch nor Latest goes back to it. #43's out-of-order edges.
const late = plan({ releases: [...published, rel("v0.1.3")], branchVersion: "0.1.3", latestTag: "v0.1.1", tags: ["wolfram--v0.1.3"] });
check(
  "Latest that went to an older release comes back to the newest, and the branch stays",
  late.newest === "v0.1.3" && !late.move && late.latest && !late.tag,
  show(late),
);
const drafts = plan({ releases: [...published, rel("v0.1.3", true)] });
check(
  "a draft or a pre-release is not a release: neither moves it",
  drafts.newest === "v0.1.2" && !drafts.move && !drafts.latest,
  show(drafts),
);
// A run that moved the branch and then failed before tagging leaves the
// version untagged: the next run tags the branch where it is.
const untagged = plan({ tags: [] });
check(
  "a branch version left untagged is tagged where it is, without moving",
  !untagged.move && untagged.tag === "wolfram--v0.1.2",
  show(untagged),
);
check(
  "numerically: 0.10.0 follows 0.9.0",
  plan({ releases: [rel("v0.9.0"), rel("v0.10.0")], branchVersion: "0.9.0", tags: [] }).newest === "v0.10.0",
);
// The branch never goes back: if it carries a version no published release
// does — one deleted, or flagged pre-release by hand — it stays and says so,
// and Latest isn't moved to a release the branch doesn't carry.
const ahead = plan({ branchVersion: "0.1.3", latestTag: "v0.1.1", tags: ["wolfram--v0.1.3"] });
check(
  "a branch ahead of every published release stays where it is, says so, and leaves Latest",
  !ahead.move && !ahead.tag && !ahead.latest && /0\.1\.3/.test(ahead.ahead ?? ""),
  show(ahead),
);
// Not a version, a branch can't be ordered against a release: comparing one
// would read as "already current", and tag and mark Latest over a build the
// branch may not hold.
let garbled = "";
try {
  plan({ branchVersion: "0.1" });
} catch (err) {
  garbled = err.message;
}
check("a branch whose plugin.json carries no x.y.z version stops the plan", /0\.1/.test(garbled), garbled);
const none = plan({ releases: [rel("v0.1.0-pre.1", false, true)], branchVersion: undefined, latestTag: undefined, tags: [] });
check("with no release published, nothing happens", !none.newest && !none.move && !none.tag && !none.latest, show(none));
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
