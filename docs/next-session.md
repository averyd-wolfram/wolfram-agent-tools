# Start here next session

This file is the entry point: where things stand and what to do next. Read `AGENTS.md` before
touching anything; the roadmap is `docs/plugin-plan.md`, and the design and what is settled are
in `docs/design.md`.

## Where things stand

- **`v0.2.4` is Latest** (2026-11-19). `CHANGELOG.md` says what each release holds, and each
  release's milestone lists its issues and PRs. The history before that is in the closed
  issues, the PRs and `git log`; this file no longer retells it.
- **The release pipeline versions itself** from the commit types on `main`, publishes a
  pre-release on every update of the release PR, and moves the `release` branch and Latest
  once a release is out. `docs/releasing.md` has the whole of it; the short form is under *How
  releases work* below.
- **Releases from 0.2.0 on carry signed build provenance** (#47), when the run their merge
  started builds them, as 0.2.0's to 0.2.4's did. A pre-release, or a release finished by a
  later run, is published without one and says why in a `Not attested` notice.
- **What changed since 0.1.6**, in outline:
  - **Kernel starts** (0.1.7–0.1.10): a failed start backs off by what failed, in the pool as
    on the private path (#19, #20, #22); a request's ceiling counts from its arrival on both
    paths, and one its caller was answered for is never sent (#80); the lists read after a
    start get this server's deadline (#70).
  - **Relaying** (0.1.7, 0.1.11): a list with a malformed item or a non-object schema is relayed
    as the kernel sent it, for the client to judge (#69).
  - **Paclet upgrades** (0.1.12): a server is served and cached from what the installed
    paclets declare now, not from what a warm kernel loaded before the upgrade (#3, #6).
  - **`clear-cache --server <name>`** (0.2.0, #103), for downstream installers.
  - **CI** annotates each failing suite check (#88).
- **Dependabot** runs weekly and on advisories. `package.json` overrides `minimatch` to
  `^11.0.1` under eslint (GHSA-g3hv-75wg-m249); `.github/dependabot.yml` says when to drop it.
  #56 (TypeScript 7) stays open and `blocked` until typescript-eslint accepts it; its comments
  say what else it needs.
- **The backlog is GitHub issues** (`gh issue list`), labelled by type, `needs design` and area
  (*Working here* below). Other agents file there too, notably the downstream plugin's.
- **The direction is client-neutral agent tools with a package per client** (plan §5 MA,
  decisions D26–D32, evidence A.6). The design is decided; its experiments come next.

## What to do next, in order

1. **The open bugs that need design**, each agreed with the maintainer before code: #198
   (re-reading the lists after an answer from a kernel of another source can start a
   kernel), #187 (a pool swapping one kernel environment for another starts the replacement
   before the retired kernel exits), and #192 (the edges of #180's union of declared names).
2. **Measure a seat refusal, then fix #143** (`blocked` until then): a kernel start the
   licence refuses is backed off for ten minutes, as though the installation were broken.
   Record the licence manager's words and how the kernel exits, then classify it with a short
   back-off. It needs a limited licence: this machine's facts now say `unlimited` (re-read on
   2026-11-16), so it can't refuse a start. Find out too which count the facts read: on
   2026-11-10 they said 2 seats while five kernels ran, and the lease (item 3) will size
   itself from them. `npm run test:container` with a test entitlement
   (`WOLFRAM_MCP_TEST_ENTITLEMENT`, or the 0600 file `docs/releasing.md` names) is the
   route; none is set up here yet, and the maintainer creates one. Its licensed scenario
   starts one broker kernel and then `doctor`, so it never asks for a seat past the limit:
   extend it to hold every seat and start one more, recording the words and the exit.
3. **#59: the seat lease** (D35, decided 2026-11-17). Every kernel this package starts itself
   — a broker's, a private one, the LSP's — takes a seat from one lease per licence before it
   spawns, so once the lease has a size, the releases that take it never together start more
   kernels than it allows. Each release keeps its own broker. `docs/plugin-plan.md` §5 MD
   item 2 has the decision, what the lease can't count, and why one broker shared across
   releases was rejected; #59 has what is open for the implementation, each with its check.
   It follows item 2, whose measured refusal its checks compare against.
4. **Settings for the maintainer**, no PR needed:
   - **A `refs/tags/v*` ruleset** (#48): only `release` and `wolfram--v*` are protected
     (rulesets 24615785 and 24615786), so a published release's own tag can still be moved.
     Check first that nothing deletes pre-release tags.
   - **#82's first half:** require resolved conversations on `main`. It is off (checked
     2026-11-14); the review process already resolves every thread by hand.
5. **The design backlog**, each `needs design`; agree the approach before code.
   - **Broker:** #74 (sharing where the runtime directory is too deep for a socket path),
     #102 (resend a request a leaving broker never read), #129 (run the suite where sockets
     are refused).
   - **Startup:** #12 (one timer for a start), #60 (restricted Linux agent sandboxes), #104 (a
     writable user base), #140 (doctor and the Wolfram Account).
   - **Paclet:** #4 (a development paclet), #141 (MCP Apps), #86 (the contract on a schedule).
   - **CI and distribution:** #81 (fewer CI runs), #49 (ordinary CI on the release PR, which
     couples with #81), #48 (immutable releases), #83 (container scenarios in CI).
   - **Docs and agent setup:** #36 (restructure the agent instructions), #181 (what an
     unreviewed branch can make Codex and Claude Code run as a session starts).
   - **#40** (overlap the suite's long-call minute) is left for now, by the maintainer
     (2026-11-10).
6. **The one link of #7 left unobserved**: Claude Code saying `Plugin updated: wolfram` in an
   interactive session after it auto-updates. The update itself is seen: `v0.2.1` was
   published at 02:47 UTC on 2026-11-10, and `~/.claude/plugins/cache/wolfram-agent-tools/
   wolfram/0.2.1/` existed at 02:54, installed by no one. The maintainer runs the
   interactive check, since it needs a signed-in client; `docs/releasing.md` has the headless
   one.
7. **MA's experiments**, each a ledger row (plan §5 MA, *Order of work*): Codex installing a
   Claude Code marketplace entry and trusting our hook; Cursor importing an installed Claude
   Code plugin; Copilot honouring `userConfig`; the Agent Plugins precedence in VS Code;
   Codex's filtered environment against our broker, which #60 measured once.
8. **The rest of M1** (plan §5 M1): the chat checklist and M1b's client version,
   `SessionStart` and file workflow (run by a maintainer); entitlement leases outliving clean
   kernel exits by about an hour (measured, cause not found); a resumed Claude Desktop session
   after a re-upload may lose the LSP.
9. **M2's design checkpoint**, which starts with the stable-2.2.0 union experiment and needs
   AgentTools 2.2.7 disabled. Agree it with the maintainers first.

## How releases work

- **The version comes from commit types.** From 0.1.0 a `fix:` (or `perf:`, `refactor:`,
  `revert:`) makes 0.1.1, a `feat:` 0.2.0, a breaking change also the minor until 1.0.0;
  `docs:`, `test:`, `ci:` and `chore:` make no release. A commit or PR title that changes what
  ships — `src/`, `plugin/` and its skills, the licence, the build scripts, shipped package
  fields — under a type that bumps nothing fails `commit-types`. Type plugin and skill changes
  `fix:` or `feat:`.
- **One run per push to `main`.** release-please keeps one release PR with the computed version
  and `CHANGELOG.md`, and the same run tests that PR's commit and publishes it as
  `v<x.y.z>-pre.<n>`. Merging the release PR is the release: the same run attaches the assets
  to the draft, then publishes it. A docs-only merge builds nothing.
- **No personal token.** Nothing `GITHUB_TOKEN` does starts another workflow, so it is all one
  run; "Allow GitHub Actions to create and approve pull requests" must be on.
- **The PR description no longer reaches `main`.** A squash commit is the title, which
  `conventional-title` and `commit-types` check, plus the `Co-authored-by:` trailers GitHub adds,
  which release-please reads as footers that change nothing; the description is for reviewers.
  Keep it that way: release-please reads commit bodies by design — a footer-shaped line becomes
  a commit, `BREAKING-CHANGE:` makes one breaking, a body it cannot parse is skipped without
  failing anything (#24, #25). To correct a commit already on `main`, put a
  `BEGIN_COMMIT_OVERRIDE` block in its PR's description; the next run on `main` reads it.
- **Holding a release.** The release PR collects every bumping merge until it is merged, so a
  patch release can wait for a batch: give it a milestone holding its fix issues, their PRs and
  the release PR, and merge the release PR when the milestone's issues are closed and its
  changelog lists each of their fixes. A `feat:` merged meanwhile turns the held patch into the
  next minor.

## Working here

- **Branches and PRs.** `main` is protected: work on a branch, open a PR into `main` with a
  Conventional Commit title, and squash-merge it — the title becomes the commit release-please
  reads — once `ci-ok`, `conventional-title` and `commit-types` pass and Codex is clean on the
  PR's current head (below). That is standing permission from the maintainer (2026-11-06):
  merge then without asking, pinned to the reviewed head (the REST merge's `sha`), and carry
  on. Dependabot's PRs go the same way. The exception is release-please's release PR: it gets
  no Codex review, since it holds only the changelog and the version bumps, and it is merged
  only when the maintainer says, after reviewing it. That is D25's one human step of a
  release, and the review that goes with it. GitHub deletes a merged PR's
  branch; delete the local copy with `git branch -d`.
- **Review.** Run `codex review --base main` on the branch before pushing, and fix what it
  finds. Once the PR's checks pass, comment `@codex review`; for a change to the workflows or
  the release pipeline, add a focus, as in `@codex review for security regressions in the
  workflows`. Do both again on every new head. Codex either posts "Didn't find any major
  issues" naming the commit it reviewed, or inline findings marked P0 to P3; treat every
  badge as a finding. Answer each with its fixing commit and the check that failed first,
  then resolve the thread (GraphQL `resolveReviewThread`). A finding the PR does not fix is
  answered with the issue that tracks it; file one if none does. Read all of them: the
  comments API pages at 30, so list with `--paginate`. A P3 on #73 was on page 2, and was
  missed until the maintainer pointed to it.
- **Before a design is marked decided**, have the other provider review it: claudex-loop's
  plan review (`claudex-loop`, or its runner's `review` mode on a plan file) puts the plan to
  Codex from Claude Code, and to Claude from Codex, read-only with apps, plugins and every MCP
  server off (a Codex hook the user trusts still runs), and
  returns a verdict with evidenced findings; on D35 it found the blockers #176's red team
  ranked first (the trial is on #188). When the question is whether code does what a
  document says, `/spec-to-code-compliance:spec-compliance` checks each requirement it selects,
  up to the run's limit, in its own agent, and refutes a divergence before reporting it; read
  its `notChecked`, `checksFailed` and `unreadableDocuments` before taking a report with no
  divergences as covering the whole document; run against `AGENTS.md`, it found #179
  unprompted, and #180 and #182–#187. Both are pinned in `.claude/settings.json`; neither
  replaces the reviews above.
- **Milestones.** Each release has a milestone named for its version, holding every issue it
  fixes and every PR it merges, the release PR included. Read the open one before picking
  work, assign as you go, and close it once the release is published.
- **AgentTools is not ours to change** (the maintainer, 2026-11-07). Never propose, file or
  make a change to the paclet. Where a fault is the paclet's, record what it does here, in an
  issue or `docs/`, and fix only what this server controls.
- **Post every finding on a line of the diff**, the nearest related one if its file isn't in
  the diff, never as a conversation comment. One on #79 could not be resolved like a thread,
  went stale when the design changed, and was hidden as outdated.
- **When reviews stop converging, split.** Each review round finds new edges, and a design
  added inside a fix — the pool's burst handling in #18, a refused start's back-off in #21 —
  can keep producing them for round after round. When the fix itself is settled and the rounds
  are about the new design, revert that design, record what was tried and found in an issue
  (#19, #22), and merge the fix. And ask whether the fault is code at all: #25's rounds were
  about imitating GitHub, and ended when the squash setting turned out to contradict D16.
- **Issues and labels.** Label every issue and PR as it is filed: a type where one fits (`bug`,
  `enhancement`, `documentation`, `refactor`, `ci`; release-please's PRs carry its own
  `autorelease:` labels), `needs design` when the approach must be agreed before code, `blocked`
  when it waits on a change outside this repository (#56), and its areas (`area: startup` —
  deadlines, handshake, back-off;
  `area: broker` — the shared broker and its pool; `area: paclet` — paclet-declared servers and
  the capability cache; `area: distribution` — install, packaging, release). File issues in the
  existing ones' shape: what happens, repro, expected, suggested fix.
- **A workflow fix needs no suite check** (the maintainer, 2026-10-10, on #84). `npm test`
  exercises no workflow, and a one-off auditor run only restates the diff. Instead, run the
  risky part directly, as #89 ran its anonymous git reads with every credential source off,
  and say in the PR what would catch a regression (#85's auditor).
- **CI.** `ci.yml` runs on every PR; a PR that changed only prose outside the shipped trees
  skips the suite and build, but never `public-content`.
- **This repository is public.** Every pushed commit is published, branches included. The
  pre-commit hook (`npm install` enables it) runs `scripts/public-content.mjs` over what is
  staged; never bypass it with `--no-verify`. Never push with `--mirror` or `--all`: local refs
  and stashes must stay local.

## Before you run anything

- **This repo's own plugin is the assembled tree.** Its marketplace serves `release/plugin/`, so
  run `npm run release:artifacts` after a change and start a new session to run it.
- **A running session keeps the server it loaded,** however often you rebuild. Its broker shows
  as a `wolfram-mcp-server.mjs broker` or `scripts/mcp-server.mjs broker` process. Never kill
  brokers broadly (`AGENTS.md`).
- **The suite can outlast a foreground tool call.** Run `npm test` in the background and read
  its log, rather than racing it with a timeout.
- **Real-kernel suites cost licence seats.** `test:wl`, `test:custom` and `test:lsp` are opt-in.
  Point a run at another installation with `WOLFRAMSCRIPT_KERNELPATH`, which writes nothing.
- **Agree with the maintainers before changing the installed paclets.**
- **Creating an MCP server object in a kernel writes to `$UserBaseDirectory`.** Remove it by
  directory, as the `.wlt` does; `DeleteObject` also runs `UninstallMCPServer`, which can edit
  MCP client configuration files.
- **A test that touches Claude Code's state restores it afterwards** — a missing-Node run caches
  a failure in `~/.claude/mcp-needs-auth-cache.json`, and `plugin configure` writes
  `~/.claude/settings.json`.
- **Claude Desktop** installs the release zip through Add → Upload plugin, and a new session
  picks it up; check which copy a session loaded under `~/.claude/plugins/synced/`. Test plugin
  updates in a new session, not a resumed one.

## Test setup

Machine-specific values live in each developer's environment, never in the repository (D31).
The variables the opt-in suites read are in `docs/releasing.md`: `WOLFRAM_MCP_TEST_LICENSING`,
`WOLFRAM_MCP_TEST_MACHINE_ID` and `WOLFRAM_MCP_TEST_HOSTNAME` for a saved container activation,
`WOLFRAM_MCP_TEST_ENTITLEMENT` (or its 0600 file) for an on-demand licence entitlement, and the
sign-in commands for `test:container` and `test:client`.
