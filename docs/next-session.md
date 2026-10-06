# Start here next session

This file is the entry point: where things stand and what to do next. Read `AGENTS.md` before
touching anything; the roadmap is `docs/plugin-plan.md`, and the design and what is settled are
in `docs/design.md`.

## Where things stand

- **M0 and M1 are built**, and M1's acceptance is nearly done (plan §5 M1).
- **`v0.1.2` is released** (2026-10-06), with the bundle, the plugin archive and
  `SHA256SUMS.txt`, verified after download. #42 made future 0.x releases normal releases;
  v0.1.0–v0.1.2 were unflagged by hand afterwards (2026-10-06) and v0.1.2 marked Latest, so
  `releases/latest/download/…` serves 0.1.2 — checked by downloading through it and verifying
  `SHA256SUMS.txt`.
- **A release finishes itself, and is a release** (#41, PR #42, merged 2026-10-06; its first
  run on `main` ran `pending`, which found nothing left, as expected). After release-please, failed or
  not, the `pending` job (`scripts/pending-release.mjs`) reads from GitHub what is left: every
  draft whose `v<x.y.z>` tag exists is built and published, oldest first, and every merged PR
  still `autorelease: pending` whose tag has a release is relabelled, in a job beside the build.
  A draft older than the newest release is left to a person. `workflow_dispatch` retries a
  failed run. And, as the maintainer decided on 2026-10-06 (D24 changed), a release is a normal
  GitHub release from 0.x on, published with `--latest`; only `-pre.N` builds are flagged. The
  action is `release-please-action@v5` (Node 24). #42's second review round showed the first
  round's answer — marking Latest in a later step — was itself the fault, and it was reverted;
  the third round's Latest-ordering edges were filed as #43 rather than chased (the maintainer's
  call, 2026-10-06).
- **#45 is merged** (2026-10-06): every action on Node 24, #44's tidy of the release scripts, and
  no npm cache restored into the job that publishes. Its own release run used the new actions in
  `pending` with no Node 20 warning.
- **The release pipeline was checked against the alternatives** (2026-10-06, recorded in D25):
  release-please is kept, since semantic-release puts 0.x out of scope and can't commit to a
  protected `main`, and changesets adds a hand-written file to every PR. Merging the release PR
  stays the one human step of a release. Four hardening items came out of it: #46 (pin actions
  to commits), #47 (build-provenance attestations), #48 (immutable releases, needs design) and
  #49 (ordinary CI on the release PR, unverified, needs design).
- **Dependabot is PR #50**: weekly npm and Actions updates, and security updates once the
  repository settings are on, titled so `commit-types` and release-please read them right
  (`fix(deps):` for a production dependency, which ships inside the bundle). It closes #29.
- **#7 and #43 are PR #51** (D34): a `release` branch carrying the newest release as the
  `wolfram-agent-tools` marketplace, which a project follows at `"ref": "release"` with
  `"autoUpdate": true` or pins at `"ref": "wolfram--v<version>"`. The release run's last job,
  `advance` (`scripts/release-branch.mjs`), is the one writer of the branch, its tags and GitHub's
  Latest; builds publish with Latest off.
- **What 0.1.2 holds:** #9 (a kernel's handshake bounded by the start timeout, not the MCP SDK's
  default), #5 (a server that will not start fails at once, with a short back-off — on the
  shared path only for requests after the first failure; a simultaneous burst is #19), #11 (a
  start deadline handed on from one read, so a spent one starts nothing), #26 (five advised
  production dependencies updated, `fast-uri` among them, the one the bundle inlines; PR #27),
  #15 (each time setting held to 24 days; PR #28), #10 (a start's budgets said truthfully, in
  sentences; PR #30) and #34 (a kernel tool call no longer cut at the MCP SDK's 60 s default; PR
  #37).
- **#21 is in #17 by its override.** release-please could not parse #21's squash commit, whose
  body was its PR description; the `BEGIN_COMMIT_OVERRIDE` block added to #21's description
  (2026-10-06, with the maintainer's approval) restored it on the next run, as confirmed after
  #27 merged.
- **Squash commits no longer carry the PR description**, since 2026-10-06
  (`squash_merge_commit_message: BLANK`), as D16 and `docs/releasing.md` always said: a squash
  commit is the title and the `Co-authored-by:` trailers GitHub still adds (seen on #27's). The
  setting had been title and description from the first merge, so every description was
  release-please input — how #21 was dropped (#24). #25 tried to check descriptions instead,
  imitating how GitHub builds the commit; two review rounds kept finding more of GitHub to
  imitate, and it was closed unmerged.
- **The backlog is GitHub issues** (`gh issue list`), labelled by type, `needs design` and area
  (*Working here* below). Other agents file there too, notably the downstream plugin's.
- **The release pipeline versions itself** from the commit types on `main`. `docs/releasing.md`
  has the whole of it; the short form is under *How releases work* below.
- **The direction is client-neutral agent tools with a package per client** (plan §5 MA,
  decisions D26–D32, evidence A.6). The design is decided; its experiments come next.

## What to do next, in order

1. **Land #50 and #51.** #50's reviews kept tuning the Dependabot config round after round;
   simplify toward Dependabot's standard setup rather than chase each round, then merge on a
   reviewed head (the maintainer's approach for #42). After #50 merges, turn on the two
   settings `docs/releasing.md` lists: `gh api -X PUT repos/<owner>/<repo>/vulnerability-alerts`
   and `gh api -X PUT repos/<owner>/<repo>/automated-security-fixes`.
2. **Prime and accept the release branch** after #51 merges. Its own release run's `advance` job
   should create `release` from v0.1.2 and tag `wolfram--v0.1.2` (check the run, then
   `git ls-remote origin release 'refs/tags/wolfram--*'`). Then, in a scratch project with a
   throwaway `CLAUDE_CONFIG_DIR`, commit the README's snippet, trust the folder, and check that
   `claude plugin list` shows `wolfram@wolfram-agent-tools` at project scope with no install
   step, and that `"ref": "wolfram--v0.1.2"` pins. Record it as a ledger row (plan §6). The
   update half of #7's acceptance, a later release arriving with no edit, waits for the next
   release. Offer the maintainer the rulesets `docs/releasing.md` recommends for `release` and
   `wolfram--v*`.
3. **Design the kernel-start cluster before code** (`needs design`, `area: startup` and
   `area: broker`): #22 (back off by what failed — a start refused for lack of time is not a
   broken installation), #20 (any failed start in the pool, and a private restart after idling),
   #19 (a burst for a server that will not start, at a shared broker), #16 (the session guessing
   how long a broker spends starting a kernel) and #12 (one timer for a start). #22 and #19
   record what #21 and #18 tried, why each attempt was reverted, and the constraints a design
   must keep. Write it up in `docs/plugin-plan.md` first — the one plan; the pool shapes every
   session's latency and licence use. A minimum start timeout (#15's other half) is part of it.
   #32 (two brokers left after a concurrent recovery, intermittently, on CI's Node 26) may be
   the same pool's race; re-run once if it fails a PR, and investigate if it recurs.
   #3 (warm kernels serve a paclet's old server after an upgrade) wants the same treatment, with
   #4 and #6 (`area: paclet`), and so does #31 (one tool whose `outputSchema` ajv cannot
   compile fails the whole `tools/list`). #29 (how to hear of the next advisory against what
   the bundle inlines) needs a design too; an audit gate tried in #27 was reverted. Smaller,
   from 0.1.2's reviews: #33 (timers fed by library-built options can still overflow; clamp at
   each timer), #35 (a numeric setting with a unit suffix is misread silently) and #38
   (durations read three ways across the private path, the broker client and
   `wolfram_status`). From #37's review: #39 (`prompts/get` and `resources/read` still cut at
   the SDK's 60 s default, and the busy kernel not reclaimed — a bug, wants a deadline for
   those ops) and #40 (tighten #37's long-call check).
4. **Restructure the agent instructions** (#36, `needs design`): a trimmed `AGENTS.md`, the
   handoff's durable rules moved out of it, and the project rules now in the maintainer's
   private Claude Code memory moved into the repository. Agree the design first.
5. **MA's experiments**, each a ledger row (plan §5 MA, *Order of work*): Codex installing a
   Claude Code marketplace entry and trusting our hook; Cursor importing an installed Claude Code
   plugin, and whether its `sessionStart` injects context; Copilot honouring `userConfig`; the
   Agent Plugins precedence in VS Code; Codex's filtered environment against our broker.
6. **The restructure** (MA). M1's `archive` install, update and bad-digest rows need only public
   releases (`v0.1.0` then `v0.1.1` is an update), as does a Claude run of the plugin installed
   from the archive.
7. **MD, downstream packages** (plan §5 MD, D33), after the restructure: another project's
   plugin built on the release bundle. Item 3's defect for today's users — a server not found
   held off by the long back-off — is fixed for 0.1.2 (#5), not yet released; its
   `test:custom` counterpart remains.
8. **The rest of M1**: the chat checklist and M1b's client version, `SessionStart` and file
   workflow (run by a maintainer); entitlement leases outliving clean kernel exits by about an hour
   (measured, cause not found, matters only to entitlement users); a resumed Claude Desktop
   session after a re-upload may lose the LSP (a new session works).
9. **M2's design checkpoint**, which starts with the stable-2.2.0 union experiment and needs
   AgentTools 2.2.7 disabled — agree it with the maintainers first.

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
  Conventional Commit title, and squash-merge it once `ci-ok`, `conventional-title` and
  `commit-types` pass — the title becomes the commit release-please reads. GitHub deletes a
  merged PR's branch; delete the local copy with `git branch -d`.
- **Review.** Run `/code-review high <pr> --comment` on each PR, and again on every new head
  before merging — except a push that only rewrites commit messages, whose tree the finished
  review already covered. Answer every finding with its fixing commit and the check that failed
  first, then resolve the thread (GraphQL `resolveReviewThread`). A finding the PR does not fix
  is answered with the issue that tracks it; file one if none does.
- **When reviews stop converging, split.** Each review round finds new edges, and a design
  added inside a fix — the pool's burst handling in #18, a refused start's back-off in #21 —
  can keep producing them for round after round. When the fix itself is settled and the rounds
  are about the new design, revert that design, record what was tried and found in an issue
  (#19, #22), and merge the fix. And ask whether the fault is code at all: #25's rounds were
  about imitating GitHub, and ended when the squash setting turned out to contradict D16.
- **Issues and labels.** Label every issue and PR as it is filed: a type where one fits (`bug`,
  `enhancement`, `documentation`, `refactor`, `ci`; release-please's PRs carry its own
  `autorelease:` labels), `needs design` when the approach must be agreed before code, and its
  areas (`area: startup` — deadlines, handshake, back-off;
  `area: broker` — the shared broker and its pool; `area: paclet` — paclet-declared servers and
  the capability cache; `area: distribution` — install, packaging, release). File issues in the
  existing ones' shape: what happens, repro, expected, suggested fix.
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
