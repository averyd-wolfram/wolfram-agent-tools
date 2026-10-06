#!/usr/bin/env node
/**
 * What a release run finishes (scripts/pending-release.mjs), decided from what
 * exists on GitHub rather than from what release-please's action reported.
 *
 * 0.1.2 is the case it exists for: release-please made the tag and the draft,
 * then failed removing its own `autorelease: pending` label, so the action set
 * no outputs, the build that publishes the draft never ran, and the release PR
 * stayed pending — which stops release-please opening the next one.
 */
import { pendingRelease } from "../scripts/pending-release.mjs";
import { tagCommits } from "../scripts/release-version.mjs";

let failures = 0;
let checks = 0;
const check = (label, ok, detail = "") => {
  checks++;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
};

const merge = "4ceeb3ffaa84bc4450c3b9b61aa26e63259e1768";
const earlier = "7fd23b2f97f903ab84da23a54ebde9fa5f29db63";
const tags = new Map([
  ["v0.1.1", earlier],
  ["v0.1.2-pre.6", "0000000000000000000000000000000000000006"],
  ["v0.1.2", merge],
]);
const decide = (releases, pulls = [], known = tags) => {
  const { finish, relabel } = pendingRelease({ releases, tags: known, pulls });
  return `finish=${JSON.stringify(finish)} relabel=${JSON.stringify(relabel)}`;
};
const published = [
  { tag: "v0.1.1", draft: false },
  { tag: "v0.1.2-pre.6", draft: false },
];

console.log("\npending-release: what a release run finishes");
const stuck = decide([...published, { tag: "v0.1.2", draft: true }], [{ number: 17, sha: merge }]);
check(
  "a draft whose tag exists is built and published, and its pending PR labelled as released",
  stuck === 'finish=["v0.1.2"] relabel=[17]',
  stuck,
);
const done = decide([...published, { tag: "v0.1.2", draft: false }]);
check("a published release and a tagged PR leave nothing to do", done === "finish=[] relabel=[]", done);
const failedBuild = decide([...published, { tag: "v0.1.2", draft: true }]);
check(
  "a draft whose build failed is built again, though release-please labelled it",
  failedBuild === 'finish=["v0.1.2"] relabel=[]',
  failedBuild,
);
const notes = decide(
  [...published, { tag: "v0.2.0", draft: true }, { tag: "notes", draft: true }],
  [],
  new Map([...tags, ["notes", "c".repeat(40)]]),
);
check(
  "a draft whose tag does not exist, or names no version, is someone's notes and left alone",
  notes === "finish=[] relabel=[]",
  notes,
);
// release-please makes the tag before the release. If it stopped between the
// two, its next run must make the release, and it looks only at PRs still
// labelled pending: labelling this one would leave the version without one.
const tagOnly = decide(published, [{ number: 17, sha: merge }]);
check("a tag with no release yet keeps its PR pending, for release-please to retry", tagOnly === "finish=[] relabel=[]", tagOnly);
const byHand = decide([...published, { tag: "v0.1.2", draft: false }], [{ number: 17, sha: merge }]);
check(
  "a release published by hand releases its PR, and is not built again",
  byHand === "finish=[] relabel=[17]",
  byHand,
);
const untagged = decide([...published, { tag: "v0.1.2", draft: true }], [{ number: 18, sha: "f".repeat(40) }]);
check(
  "a pending PR is matched by the commit its release's tag is on, not by being pending",
  untagged === 'finish=["v0.1.2"] relabel=[]',
  untagged,
);
// A draft is published as Latest, so one older than a release already out
// would take Latest from it; and one whose build fails every time would be
// rebuilt by every run. Once a newer release is out, an older draft is a
// person's to finish or delete.
// Left silently, it would never reach the person: so the run names it.
const lateInput = {
  releases: [...published, { tag: "v0.1.2", draft: true }, { tag: "v0.1.3", draft: false }],
  tags: new Map([...tags, ["v0.1.3", "d".repeat(40)]]),
  pulls: [],
};
const late = pendingRelease(lateInput);
check(
  "a draft older than the newest release published is left to a person, and named",
  late.finish.length === 0 && JSON.stringify(late.left) === '[{"tag":"v0.1.2","newest":"v0.1.3"}]',
  JSON.stringify(late),
);
// release-please makes only v<x.y.z>. A pre-release is published as it is
// made, so a draft on a -pre tag is a person's, and building it would publish
// a pre-release of a version that may already be released.
const pre = decide([{ tag: "v0.1.2", draft: false }, { tag: "v0.1.2-pre.6", draft: true }]);
check("a draft on a suffixed tag is not release-please's, and is left alone", pre === "finish=[] relabel=[]", pre);
// GitHub publishing one of two drafts of a tag leaves the other; building it
// would be refused as already released on every later run.
const twice = decide([
  ...published,
  { tag: "v0.1.2", draft: false },
  { tag: "v0.1.2", draft: true },
]);
check("a second draft of a released tag is not built", twice === "finish=[] relabel=[]", twice);
const many = new Map([...tags, ["v0.9.0", "9".repeat(40)], ["v0.10.0", "a".repeat(40)]]);
const both = decide(
  [
    { tag: "v0.10.0", draft: true },
    { tag: "v0.9.0", draft: true },
    { tag: "v0.9.0", draft: true },
  ],
  [],
  many,
);
check(
  "several drafts are each built once, oldest version first",
  both === 'finish=["v0.9.0","v0.10.0"] relabel=[]',
  both,
);

console.log("\npending-release: reading the remote's tags");
const remote = [
  `${earlier}\trefs/tags/v0.1.1`,
  `${"b".repeat(40)}\trefs/tags/v0.1.2`,
  `${merge}\trefs/tags/v0.1.2^{}`,
  "",
].join("\n");
const read = tagCommits(remote);
check(
  "a lightweight tag names its commit, and an annotated one the commit it points at",
  read.get("v0.1.1") === earlier && read.get("v0.1.2") === merge && read.size === 2,
  JSON.stringify([...read]),
);

console.log(
  failures === 0
    ? `\n${checks} checks, all passed.\n`
    : `\n${failures} of ${checks} checks failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
