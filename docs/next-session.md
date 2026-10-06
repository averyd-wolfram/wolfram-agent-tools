# Start here next session

This file is the entry point: where things stand and what to do next. Read `AGENTS.md` before
touching anything; the roadmap is `docs/plugin-plan.md`, and the design and what is settled are
in `docs/design.md`.

## Where things stand

- **M0 and M1 are built**, and M1's acceptance is nearly done (plan §5 M1).
- **`v0.1.1` is released**, with the bundle, the plugin archive and `SHA256SUMS.txt`. Below
  1.0.0 every release is marked a GitHub pre-release, which `releases/latest` skips, so link a
  release by its tag (`releases/download/v0.1.1/...`), never by `latest`.
- **0.1.2 is being collected.** release-please's PR #17 holds the fixes merged since, and the
  `0.1.2` milestone shows the release: #9 (a kernel's handshake bounded by the start timeout,
  not the MCP SDK's 60 s), #5 (a server that will not start fails at once, with a 15 s back-off
  on both paths), #11 (a start deadline handed on from one read, so a spent one starts nothing).
  Still in it: #15 and #10.
- **The backlog is GitHub issues** (`gh issue list`), labelled by type, `needs design` and area
  (*Working here* below). Other agents file there too, notably the downstream plugin's.
- **The release pipeline versions itself** from the commit types on `main`. `docs/releasing.md`
  has the whole of it; the short form is under *How releases work* below.
- **The direction is client-neutral agent tools with a package per client** (plan §5 MA,
  decisions D26–D32, evidence A.6). The design is decided; its experiments come next.

## What to do next, in order

1. **Finish 0.1.2** (milestone `0.1.2`), each a `fix:` PR:
   - **#15**, clamp the time settings in `config.ts` — a maximum, since a start timeout above
     about 24.8 days overflows Node's timers and every start fails at once, and a minimum, since
     a start timeout of 0 still spawns kernels with no time on the paths that read the setting
     directly (the broker's pool, `doctor`, a private restart after idling). Probably the call
     timeout and idle minutes too.
   - **#10**, the start-timeout message: the "within 0s" detail, and a refused start reading
     "time ran out while starting the kernel. 0ms were left, too little for this to begin".

   Then merge #17: the same run tags and publishes `v0.1.2` with its assets. Download them and
   check `SHA256SUMS.txt` and the bundle's `--version`, as for 0.1.1.
2. **Design the kernel-start cluster before code** (`needs design`, `area: startup` and
   `area: broker`): #22 (back off by what failed — a start refused for lack of time is not a
   broken installation), #20 (any failed start in the pool, and a private restart after idling),
   #19 (a burst for a server that will not start, at a shared broker), #16 (the session guessing
   how long a broker spends starting a kernel) and #12 (one timer for a start). #22 and #19
   record what #21 and #18 tried, why each attempt was reverted, and the constraints a design
   must keep. Write it up in the plan first; the pool shapes every session's latency and licence
   use. #3 (warm kernels serve a paclet's old server after an upgrade) wants the same treatment,
   with #4 and #6 (`area: paclet`).
3. **MA's experiments**, each a ledger row (plan §5 MA, *Order of work*): Codex installing a
   Claude Code marketplace entry and trusting our hook; Cursor importing an installed Claude Code
   plugin, and whether its `sessionStart` injects context; Copilot honouring `userConfig`; the
   Agent Plugins precedence in VS Code; Codex's filtered environment against our broker.
4. **The restructure** (MA). M1's `archive` install, update and bad-digest rows need only public
   releases (`v0.1.0` then `v0.1.1` is an update), as does a Claude run of the plugin installed
   from the archive. #7 (installing at project scope from this repository) belongs here.
5. **MD, downstream packages** (plan §5 MD, D33), after the restructure: another project's
   plugin built on the release bundle. Item 3's defect for today's users — a server not found
   held off for ten minutes — is fixed in 0.1.2 (#5); its `test:custom` counterpart remains.
6. **The rest of M1**: the chat checklist and M1b's client version, `SessionStart` and file
   workflow (run by a maintainer); entitlement leases outliving clean kernel exits by about an hour
   (measured, cause not found, matters only to entitlement users); a resumed Claude Desktop
   session after a re-upload may lose the LSP (a new session works).
7. **M2's design checkpoint**, which starts with the stable-2.2.0 union experiment and needs
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
- **Holding a release.** The release PR collects every bumping merge until it is merged, so a
  patch release can wait for a batch: give it a milestone holding its fix issues, their PRs and
  the release PR, and merge the release PR when the milestone's issues are closed.

## Working here

- **Branches and PRs.** `main` is protected: work on a branch, open a PR into `main` with a
  Conventional Commit title, and squash-merge it once `ci-ok`, `conventional-title` and
  `commit-types` pass — the title becomes the commit release-please reads. GitHub deletes a merged PR's
  branch; delete the local copy with `git branch -d`.
- **Review.** Run `/code-review high <pr> --comment` on each PR, and again on every new head
  before merging — except a push that only rewrites commit messages, whose tree the finished
  review already covered. Answer every finding with its fixing commit and the check that failed
  first, then resolve the thread (GraphQL `resolveReviewThread`). A finding the PR does not fix
  is answered with the issue that tracks it; file one if none does.
- **When reviews stop converging, split.** Each review round finds new edges, and a design
  added inside a fix — the pool's burst handling in #18, a refused start's back-off in #21 —
  can keep producing them for round after round. When the fix itself is settled and the rounds
  are about the new design, revert that design, record what was tried and found in an issue
  (#19, #22), and merge the fix.
- **Issues and labels.** Label every issue and PR as it is filed: one type (`bug`,
  `enhancement`, `documentation`, `refactor`, `ci`), `needs design` when the approach must be
  agreed before code, and its areas (`area: startup` — deadlines, handshake, back-off;
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
- **The suite can outlast a ten-minute tool call.** Run `npm test` in the background and read
  its log, rather than racing it with a foreground timeout.
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
