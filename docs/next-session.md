# Start here next session

This file is the entry point: where things stand and what to do next. Read `AGENTS.md` before
touching anything; the roadmap is `docs/plugin-plan.md`, and the design and what is settled are
in `docs/design.md`.

## Where things stand

- **M0 and M1 are built**, and M1's acceptance is nearly done (plan §5 M1).
- **The release pipeline versions itself** from the commit types on `main`. `docs/releasing.md`
  has the whole of it; the short form is under *How releases work* below.
- **The direction is client-neutral agent tools with a package per client** (plan §5 MA,
  decisions D26–D32, evidence A.6). The design is decided; its experiments come next.

## What to do next, in order

1. **The first release.** release-please proposes `0.1.0` from its configured
   `initial-version` (without it, its first run asked for `1.0.0`). Check that release PR #1
   was rewritten to `chore(main): release 0.1.0` — title, `package.json`, `plugin.json`,
   `CHANGELOG.md` — and close it if it was not. Check that no `v1.0.0-pre.*` release or tag
   exists: one would rank above every 0.x build for anyone who installed it, so delete it
   (`gh release delete <tag> --cleanup-tag`) before anything else is published. Then check the release PR,
   its pre-release `v0.1.0-pre.1`, and that merging it publishes `v0.1.0` with the bundle, the
   plugin archive and `SHA256SUMS.txt` attached (`docs/releasing.md`).
2. **The flaky start-timeout check.** "the library's deferredBackend runs on the configured
   start timeout" races two 2 s timers — the preparation deadline and the kernel's own handshake
   timeout — and accepts only the first's wording; seen once, passed on rerun. Reproduce it
   deterministically, test, then fix. It is a `fix:`, so it releases 0.1.1: the first automatic
   bump, worth watching end to end.
3. **MA's experiments**, each a ledger row (plan §5 MA, *Order of work*): Codex installing a
   Claude Code marketplace entry and trusting our hook; Cursor importing an installed Claude Code
   plugin, and whether its `sessionStart` injects context; Copilot honouring `userConfig`; the
   Agent Plugins precedence in VS Code; Codex's filtered environment against our broker.
4. **The restructure** (MA). M1's `archive` install, update and bad-digest rows need only public
   releases (`v0.1.0` then `v0.1.1` is an update), as does a Claude run of the plugin installed
   from the archive.
5. **MD, downstream packages** (plan §5 MD, D33), after the restructure: another project's
   plugin built on the release bundle. Its item 3 holds a defect for today's users too — a
   server not found starts the ten-minute back-off, which creating the server does not end.
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

## Working here

- **Branches and PRs.** `main` is protected: work on a branch, open a PR into `main` with a
  Conventional Commit title, and squash-merge it once `ci-ok`, `conventional-title` and
  `commit-types` pass — the title becomes the commit release-please reads. GitHub deletes a merged PR's
  branch; delete the local copy with `git branch -d`.
- **Review.** Run `/code-review high <pr> --comment` on each PR. Answer every finding with its
  fixing commit and the check that failed first, then resolve the thread (GraphQL
  `resolveReviewThread`).
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
