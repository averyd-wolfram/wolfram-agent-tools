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
- **0.1.4 is released** (2026-10-08, #64, `32e326d`), the first batch held in a milestone
  (`0.1.4`, now closed). It holds #63 (fixes #39: every kernel request carries this server's
  deadline, prompts and resource reads take the call ceiling and can be cancelled, a request
  cancelled before it reaches the kernel stops none), #65 (fixes #62: a kernel's error on any
  request is relayed with its prefix once, with its `data`, on both paths; `BROKER_PROTOCOL` is
  6 for the new field), #66 (fixes #35: a numeric setting written with a unit is ignored, and
  logged, rather than misread) and #67 (fixes #33: a time is held at each timer it reaches, a
  caller's deadline to `MAX_TIME_MS` so it stays inside the SDK's request timeout, and the
  broker client sends the held value). `v0.1.4` is Latest; `release` moved to it, tagged
  `wolfram--v0.1.4`; the bundle and the plugin archive, fetched through
  `releases/latest/download/…`, match `SHA256SUMS.txt` and say 0.1.4. Each PR had two or three
  `/code-review high` rounds and Codex, with CI green; #66 and #67, merged after `main` had
  moved, also had the suite run on `main` combined with them first. Codex's findings were real
  each time: the protocol bump on #65, and on #67 the deadline's tie with the SDK and a NaN
  reaching the broker as `null`.
- **0.1.5 is two fixes in, one under review** (2026-10-08, milestone `0.1.5`).
  - **#68 is merged** (`136b59f`, fixes #31). A kernel's client is a `RelayClient` whose
    `listTools` is a plain request, so no `outputSchema` is compiled and the relay judges no
    result. `listAllTools` drains every page, so doctor now shows them all. Claude Code 2.1.290
    was measured listing a server whose tool carries a schema ajv refuses. AgentTools 2.2.7 can
    emit neither field, so `test:custom` cannot pin it.
  - **#71 is merged** (`3a6448f`, fixes #38). `src/duration.ts` says every duration:
    `budgetText` rounds down, `waitText` up, `elapsedText` down, and `idleText` covers the idle
    setting. Units fit the size, `400ms` to `24d`.
  - **#73 is under review** (fixes #32). The cause was reproduced by widening the stat-to-unlink
    gap: one broker unlinked a winner's fresh socket. A follow-on was measured too: libuv's
    close unlinked a successor's socket. Now a broker binds under a staging name,
    `.b<pid>-<8 random hex>`, never cleared first, then links it into
    place and watches its address. It binds at the address directly when it can't link, as for
    an over-long address on Linux. It also fixes the umask and the empty-grace timer for two
    brokers in one process. The suite now fails if anything ends it early. `onBound`, a broker
    option for the suite like `DeferredOptions.clock`, lets a check replace the address the
    moment a broker binds. It shows the broker never takes that socket for its own.
    A fourth `/code-review high` round (2026-10-08, on `3ccb28f`) found nine things. Four were
    #73's own and are fixed, each with a check that failed first:
    - The staging name is random, never cleared first. Two containers can run a broker as the
      same pid in a shared directory.
    - A server left open on the way out is unreferenced, so a library caller's process can exit.
    - `stop()` says again when it leaves the address alone.
    - The `onBound` check passes only when the other broker answered.

    `addressIsFree` is the claim's shared probe-and-clear step. Three over-long-address
    findings are `main`'s behaviour and went to #74: a graceful close leaves the truncated
    socket, the truncation can land outside the checked directory (security), and the
    100-byte fallback runs on macOS, which binds in full and there has #32's capture race.
    One became #75.
  - **Release PR #72** is in the milestone.
  - **Filed from the reviews:**
    - **#69** (`needs design`): a non-object schema still fails the whole list, in zod.
    - **#70** (`needs design`): the lists read after a kernel start keep the SDK's 60 s
      timeout.
    - **#74** (`needs design`), measured in #73's CI. On Node 26 (Linux), an over-long broker
      address gets `listen EINVAL`, so there is no broker, and each session waits 5 s before
      going private. Node 22 truncates the path and shares. `main` binds the same way. Its
      comment from #73's fourth round adds the graceful-close, security and macOS findings
      above.
    - **#75** (`bug`): a call in flight when its broker stops waits out its whole ceiling, and
      forever with none. The cause is `shuttingDown` setting `#closed`, after which `#failAll`
      skips the pending waiters. It is reproduced on `main`'s client through SIGTERM, and
      #73's retire path is a second way in. Codex found the same thing on #73 (P2), citing
      *Sharing is an optimisation, never a dependency*. The maintainer put it in 0.1.5, as a
      PR of its own (2026-10-08). The fix is small and needs no design.
- **The backlog is GitHub issues** (`gh issue list`), labelled by type, `needs design` and area
  (*Working here* below). Other agents file there too, notably the downstream plugin's.
- **The release pipeline versions itself** from the commit types on `main`. `docs/releasing.md`
  has the whole of it; the short form is under *How releases work* below.
- **The direction is client-neutral agent tools with a package per client** (plan §5 MA,
  decisions D26–D32, evidence A.6). The design is decided; its experiments come next.

## What to do next, in order

1. **Finish 0.1.5** (milestone `0.1.5`).
   - **#73**: its fourth review round is answered (above). Codex reviewed `864be5c` and found
     two things. A P2 is #75, and a P3 was this handoff still naming the old staging name,
     now fixed. Once CI and Codex pass on its head, ask the maintainer to approve the merge.
     If `main` moved meanwhile, run the suite on the combination first.
   - **#75** (milestone `0.1.5`): fix it in its own PR, with the suite section its issue
     describes, failing first.
   - **Release PR #72**: merge it once its changelog lists #68, #71, #73 and #75.
   - **Then verify the release as 0.1.4 was**: `v0.1.5` is Latest, `release` has moved and is
     tagged `wolfram--v0.1.5`, and the assets fetched through `releases/latest/download/…`
     match `SHA256SUMS.txt` and say 0.1.5.
   - **#40's third point** (overlap the long-call minute with an earlier section) didn't ride
     with any of the three. It goes with the next PR that touches the suite's timing; it changes
     nothing shipped.
2. **The one link of #7 left unobserved**: Claude Code running the auto-update pass itself, in
   an interactive session up to ten minutes after the first message, and saying `Plugin updated:
   wolfram`. 0.1.4 is that next release (2026-10-08): in a project following `release`, still on
   0.1.3, an interactive session should now update itself; the maintainer runs it, since it needs
   a signed-in client. Try the route at the 2.1.75 client floor too, unmeasured for it.
   `docs/releasing.md` has the headless check.
3. **Dependabot's one open PR, #56** (TypeScript 7), which waits: typescript-eslint 8.71.1
   accepts TypeScript `<6.1.0` (checked 2026-10-08), and #56's CI is red. It stays open as the
   reminder rather than closed with an ignore rule, which would hide TypeScript 7 until someone
   remembered to lift it; Dependabot updates it in place as 7.x moves. It carries the `blocked`
   label (new, "waiting on a change outside this repository"; 2026-10-08), and a comment saying
   what unblocks it and what it will need. The signal to revisit is Dependabot's own
   typescript-eslint PR: read its `typescript` peer range. #56
   will also need `"types": ["node"]` in `tsconfig.json`, since TypeScript 7 no longer includes
   `@types/*` by default; with it, 7.0.2
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
   #32 turned out to be the broker's bind, not the pool, and is fixed in #73 (item 1).
   #3 (warm kernels serve a paclet's old server after an upgrade) wants the same treatment, with
   #4 and #6 (`area: paclet`), and so does #69 (a tool whose schema isn't `type: "object"`
   fails the whole list in the SDK's parse: leave it out with a logged reason, or relay it).
   #70 (the lists read after a kernel start, `DirectOps` and `announceKernel`, keep the SDK's
   60 s timeout, which forgets the request) belongs with #12 and #16: a refresh isn't a caller,
   so who waits on it has to be decided first. #74 (Node 26 refuses an over-long socket path,
   so a deep runtime directory gets no broker) wants a choice between going private at once, a
   short path that resolves to the directory, and Linux's abstract namespace. Since #73's
   fourth round it also holds a security finding: a truncated socket can land in a
   world-writable ancestor of the checked directory, so it should come early in item 4. #29 (how to hear of the next advisory against what
   the bundle inlines) needs a design too; an audit gate tried in #27 was reverted. Smaller,
   from 0.1.2's reviews: #38 (durations read three ways) is fixed in #71, and #33 and #35
   shipped in 0.1.4. From #37's review: #40 (tighten #37's long-call check), whose third point is
   all #63 leaves of it.
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
  `autorelease:` labels), `needs design` when the approach must be agreed before code, `blocked`
  when it waits on a change outside this repository (#56), and its areas (`area: startup` —
  deadlines, handshake, back-off;
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
