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
- **Dependabot is on** (#50, merged 2026-10-06; closes #29): weekly npm and Actions updates,
  titled so `commit-types` and release-please read them right (`fix(deps):` for a production
  dependency, which ships inside the bundle), and Dependabot alerts and security updates turned
  on in the repository settings. Its first alert was real: the SDK's OAuth client advisory
  (GHSA-6qxp-vccf-f47h, high, 1.12–1.30), fixed by its PR #53 (SDK 1.31.0), merged. The bundle
  uses no OAuth, but the fix ships in 0.1.3.
- **Other projects can follow releases** (#51, merged 2026-10-06; closes #7 and #43; D34). The
  `release` branch carries the newest release as the `wolfram-agent-tools` marketplace: a
  project follows it at `"ref": "release"` with `"autoUpdate": true`, or pins
  `"ref": "wolfram--v<version>"`. The release run's last job, `advance`
  (`scripts/release-branch.mjs`), is the one writer of the branch, its tags and GitHub's Latest;
  builds publish with Latest off. Its first run made `release` from v0.1.2 and tagged
  `wolfram--v0.1.2`; both routes were accepted in a fresh config (ledger, 2026-10-06).
- **0.1.3 is released** (2026-10-06, #57), the first release through the whole new pipeline,
  with the `release` branch and `wolfram--v*` tag rulesets on (forward only, never moved or
  deleted; checked with a throwaway tag). `pending` finished the draft, the build published it
  with Latest off, and `advance` verified the zip, moved `release` to it, tagged
  `wolfram--v0.1.3` and made it Latest. `releases/latest/download/…` serves 0.1.3, verified. A
  project following `release` loaded 0.1.3 after one marketplace refresh, with no edit (ledger).
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
- **Node's typings are held to the Node floor, and Dependabot's dev updates are in** (2026-10-08).
  #61 (`51af643`, fixes #52) pinned `@types/node` to `~22.13.0`, had Dependabot ignore its
  minors and majors, and added a check that the installed typings are the floor's line;
  Dependabot's #55 (`@types/node` 26) was closed. #54 (`ad86ca2`: eslint 10.11, prettier 3.9.9,
  typescript-eslint 8.71, all dev-only) was rebased onto it so CI tested the pair, then merged.
  Both went through the merge process now under *Working here*: Codex's review, then the
  maintainer's approval. Neither changes what ships, so neither makes a release.
- **The backlog is GitHub issues** (`gh issue list`), labelled by type, `needs design` and area
  (*Working here* below). Other agents file there too, notably the downstream plugin's.
- **The release pipeline versions itself** from the commit types on `main`. `docs/releasing.md`
  has the whole of it; the short form is under *How releases work* below.
- **The direction is client-neutral agent tools with a package per client** (plan §5 MA,
  decisions D26–D32, evidence A.6). The design is decided; its experiments come next.

## What to do next, in order

1. **PR #63 (fixes #39) waits on the maintainer's approval** (2026-10-08).
   Every kernel request now carries this server's deadline. `KernelSession.run` hands the work
   it runs the SDK options from one helper (`requestOptions`, a timeout that cannot fire
   first) and gives every run a deadline: the call timeout for a tool call, a prompt and a
   resource read — the proxy passes it, and it crosses the socket as `timeoutMs` — and
   `DEFAULT_DEADLINE_MS`, the SDK's old minute, for the lists. An SDK timeout that still
   fires, from a library caller's own options, leaves the kernel presumed busy for the next
   request to reclaim. Prompts and resource reads are cancellable as tool calls are, since
   waiting the call ceiling a cancelled one would otherwise hold the kernel for five minutes.
   Three `/code-review high` rounds added: a request cancelled before it reaches the kernel
   is dropped (`RequestDropped`) without stopping or starting one, the pool makes no room for
   it, and the broker registers an evaluation for `cancel` as its frame is read. The third
   round and Codex both found nothing on `3b7a0cf`, with CI green there.
   - **The maintainer's call.** Prompts and resource reads take the call ceiling, not a
     minute of their own: the setting is documented as giving up on a single evaluation, and
     the paclet's prompts run its searches. The PR description puts it, and the round-two
     thread on `proxy.ts` says the alternative is a one-line change.
   - **Left.** This handoff, committed last, is a new head and gets its own review round and
     Codex's, as every push does; then the maintainer's approval and the squash-merge. Then
     comment on #40 that #63 did its first, second and fourth points, leaving the third
     (overlap the minute with an earlier section).
   - **From this work.** Filed #62: a kernel's own error on `prompts/get` or `resources/read`
     reaches the client with its prefix doubled, on the private path only. Noted on #16 that
     prompts and resource reads now share `callTool`'s broker ceiling, and on #33 that the
     proxy's two new ceilings are not held to `MAX_TIME_MS` for a library-built `Config`.
2. **The one link of #7 left unobserved**: Claude Code running the auto-update pass itself, in
   an interactive session up to ten minutes after the first message, and saying `Plugin updated:
   wolfram`. Check it at the next release, in a project following `release`; and try the route at
   the 2.1.75 client floor, unmeasured for it. `docs/releasing.md` has the headless check.
3. **Dependabot's one open PR, #56** (TypeScript 7), which waits: typescript-eslint 8.71.1
   accepts TypeScript `<6.1.0` (checked 2026-10-08). It will also need `"types": ["node"]` in
   `tsconfig.json`, since TypeScript 7 no longer includes `@types/*` by default; with it, 7.0.2
   compiles `src/` on either typings (measured, noted on #56). `tsconfig.json` ships, so that
   change is a `fix:`. The maintainer wants Dependabot's PRs assessed, not merged by default;
   one that merges cleanly but was tested on an older `main` gets `@dependabot rebase` first, so
   CI tests what will land. Also open: #58 (tag every version the branch skips, and check a
   tag's commit), and #46 to #49 (pin actions to commits, provenance, immutable releases, CI on
   the release PR). The rulesets for `release` and `wolfram--v*` are on (ids 24615785 and
   24615786).
4. **Design the kernel-start cluster before code** (`needs design`, `area: startup` and
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
   `wolfram_status`). From #37's review: #40 (tighten #37's long-call check), whose third
   point is all #63 leaves of it.
5. **Restructure the agent instructions** (#36, `needs design`): a trimmed `AGENTS.md`, the
   handoff's durable rules moved out of it, and the project rules now in the maintainer's
   private Claude Code memory moved into the repository. Agree the design first.
6. **MA's experiments**, each a ledger row (plan §5 MA, *Order of work*): Codex installing a
   Claude Code marketplace entry and trusting our hook; Cursor importing an installed Claude Code
   plugin, and whether its `sessionStart` injects context; Copilot honouring `userConfig`; the
   Agent Plugins precedence in VS Code; Codex's filtered environment against our broker.
   #60 (filed 2026-10-08, `needs design`) is the measured form of that last one: a Linux agent
   sandbox where AgentTools failed to make its log directory under the default
   `$UserBaseDirectory` (no errno was captured, so the cause is not established), and
   listening on a Unix socket was refused (`EPERM`), so the broker could not run and the suite
   aborted on an uncaught stub-broker error. Its work list — a supported
   userbase route, diagnostics that name the failing directory, a socket-free test partition —
   overlaps #4, #12 and #22.
7. **The restructure** (MA). M1's `archive` install, update and bad-digest rows need only public
   releases (`v0.1.0` then `v0.1.1` is an update), as does a Claude run of the plugin installed
   from the archive.
8. **MD, downstream packages** (plan §5 MD, D33), after the restructure: another project's
   plugin built on the release bundle. Item 4's defect for today's users — a server not found
   held off by the long back-off — is fixed in 0.1.2 (#5); its `test:custom` counterpart
   remains. #59 (filed 2026-10-08 from the downstream WolframVerifier, `needs design`) measured
   MD-2's split: two releases' bundles on one machine run two brokers, each sizing a pool from
   the whole licence, and with `autoUpdate` that happens after every release, both between the
   `wolfram` plugin and a downstream copy and across one plugin's update. It asks for MD-2's
   second candidate, a broker address keyed on `BROKER_PROTOCOL` rather than the version and
   the bundle's bytes, which needs its own argument that sharing never changes an answer.
9. **The rest of M1**: the chat checklist and M1b's client version, `SessionStart` and file
   workflow (run by a maintainer); entitlement leases outliving clean kernel exits by about an hour
   (measured, cause not found, matters only to entitlement users); a resumed Claude Desktop
   session after a re-upload may lose the LSP (a new session works).
10. **M2's design checkpoint**, which starts with the stable-2.2.0 union experiment and needs
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
  Conventional Commit title, and squash-merge it — the title becomes the commit release-please
  reads — once `ci-ok`, `conventional-title` and `commit-types` pass, Codex has reviewed it
  (below), and the maintainer has given final approval; a merge waits for that approval every
  time. GitHub deletes a merged PR's branch; delete the local copy with `git branch -d`.
- **Review.** Run `/code-review high <pr> --comment` on each PR, and again on every new head
  before merging — except a push that only rewrites commit messages, whose tree the finished
  review already covered. Answer every finding with its fixing commit and the check that failed
  first, then resolve the thread (GraphQL `resolveReviewThread`). A finding the PR does not fix
  is answered with the issue that tracks it; file one if none does. Once checks pass and the
  PR is otherwise ready, comment `@codex review` (a focus may follow, as in `@codex review for
  security regressions`); Codex posts only P0 and P1 findings, which are answered and resolved
  the same way. Then ask the maintainer to approve the merge.
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
