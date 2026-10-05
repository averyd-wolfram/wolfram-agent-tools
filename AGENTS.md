# AGENTS.md

This file provides guidance to coding agents, Claude Code (claude.ai/code) among them, when working with code in this repository.

## Overview

`wolfram-mcp-server` is a Node/TypeScript MCP server that fronts a locally installed Wolfram
kernel. A client talks to it over stdio; it finds a Wolfram installation, starts a kernel
running the `Wolfram/AgentTools` paclet's own MCP server, and proxies `tools/*`, `prompts/*`
and `resources/*` through to it. So it is an MCP server that is also an MCP client.

It exists because pointing a client straight at a kernel costs a licence seat for the whole
session and puts human-readable kernel output on the protocol channel. This server answers
`initialize` and `tools/list` from a disk cache, starts a kernel only on the first call that
needs one, shares kernels between sessions through a broker, and shuts them down when idle.

Two constraints shape most of the design: **a kernel costs a licence seat** (a typical licence
permits 2 or 4), and **a kernel is strictly serial and sends no progress notifications**, so a
busy kernel and a hung one are indistinguishable from outside.

Scope is **macOS and Linux**; Windows gaps are recorded in `docs/plan.md` §9 and should not
be treated as new findings. The package is **not published to npm**, so nothing in
the code, the docs, or an error message may tell a user to run `npx wolfram-mcp-server`.

## Development

```bash
npm install            # also builds dist/, via the prepare script
npm run build          # tsc, strict
npm test               # build, lint, format check, then the hermetic suite — no Wolfram needed
npm run lint           # eslint over src; rules tuned in eslint.config.mjs, reasons inline
npm run format         # prettier over src; npm run format:check is the non-writing gate
npm run lint:wl        # CodeInspector over the .wl/.wls/.wlt files, real kernel (opt-in)
npm run test:wl        # the AgentTools contract, against a real kernel (opt-in)
npm run test:custom    # a server the user built, end to end on a real kernel (opt-in)
npm run test:lsp       # the LSPServer contract behind the plugin, real kernel (opt-in)
npm run test:container # the release bundle on Linux, in Docker containers (opt-in)
npm run test:client    # the plugin on exact Claude Code versions; you sign in (opt-in)
npm run check:public   # the public-content check over every tracked file
npm run doctor         # build, then a full diagnostic against the real installation
npm run metrics        # derive the figures the docs used to assert; --json for the data
npm run bundle:js      # the single-file distributable: the whole CLI, dependencies inlined
npm run release:artifacts  # what a release hands out: bundle, plugin archive, SHA256SUMS
npm run clean          # remove dist/
npm run mcp            # what this repo's .mcp.json runs
node dist/index.js clear-cache
node dist/index.js broker --address <sock> --kernel <bin>   # a broker in the foreground
```

`dist/` is gitignored, so always `npm run build` before running anything out of it.

Iterate against the fake kernel rather than a real one, so you spend no licence seat:

```bash
WOLFRAM_MCP_KERNEL=$PWD/test/fake-kernel.mjs \
WOLFRAM_MCP_SHARE=0 WOLFRAM_MCP_INSPECT=0 WOLFRAM_MCP_CACHE=0 \
  node dist/index.js
```

`SHARE=0` keeps it in one process, `INSPECT=0` ignores what kernels report about the installation, `CACHE=0` stops a
stale disk cache from masking your change. To drive it end to end without an MCP client, embed
it over an in-memory transport — see the header of `src/lib.ts`. Reach for a real kernel only
for what the fake cannot answer: paclet behaviour, licence text, `$BaseDirectory`, or the
`.wlt`.

## Writing and Running Tests

`npm test` runs `test/smoke.mjs`, which drives the built server against `test/fake-kernel.mjs`
over a real stdio transport. It must stay hermetic: nothing new may reach `fromWolframScript` or
a real binary, and a full run must start no Wolfram kernel.

Two rules for adding checks:

- **A fix lands with a check that failed before it.** The suite was green while a single tool
  call drained the entire licence budget.
- **Never add a check that passes only because the fake kernel is instant.** If it would still
  pass with `FAKE_CALL_DELAY_MS` set, it is not testing what it appears to. The fake still
  reads its stdin while a call is outstanding, which a real kernel does not, though it answers
  no `ping` meanwhile — model a wedged kernel with `FAKE_CALL_DELAY_MS=-1`. Its header lists
  every knob.

There is no single-test filter; the suite is one linear script and later sections consume state
earlier ones leave behind (the kernel start-count marker, the warm cache). To isolate one
section, copy its block into a scratch file that imports `dist/lib.js`.

`test/agenttools-contract.wlt` is the other half. It pins what this package hardcodes about the
paclet — the kernel command line, the server names, the version floor, the synchronous dispatch
the timeout design rests on — so a paclet upgrade that breaks one fails a test rather than the
server. It needs a real kernel, so it is deliberately not part of `npm test`: run it with
`npm run test:wl`.

`scripts/custom-server.mjs` is the third, `npm run test:custom`. A custom MCP server is a file
the paclet writes, so only a real kernel can make one or serve it — and it is the case
`resolveServerName` passes unknown names through *for*, so nothing hermetic can cover it. It
builds its own throwaway server, serves it through this package, calls its tool and checks the
answer, then removes it: it neither depends on nor touches whatever the machine already has.
Without the pass-through it fails with `Unknown tool: PrimeFinder` against `Wolfram`'s three
built-ins, which is the bug it exists for.

## Code Architecture

### Project Structure

- `src/`: the server. Three layers (proxy → backend → kernel) plus a service, the broker
  - `index.ts`: CLI entry. Subcommands are *(none)* = serve, `doctor`, `broker`, `lsp`,
    `session-status` (the plugin's SessionStart hook, caches only), `clear-cache`, `--help`,
    `--version`. Owns signal handling, the crash handlers, and the
    `HELP` text
  - `lsp.ts`: the `lsp` subcommand — Wolfram's LSPServer on the kernel `locateKernel` found,
    or a no-capability stub under `WOLFRAM_MCP_LSP=0`, so one implementation serves the
    plugin launcher, the single-file bundle, and any editor invoking the CLI
  - `proxy.ts`: the MCP server itself — capabilities, request handlers, cache refresh, the
    `wolfram_status` tool that answers when no kernel can, and `evaluationCeilingMs`
  - `backend.ts`: the seam between the proxy and a kernel. `KernelBackend`, `LocalBackend`,
    `DeferredBackend`, `createBackend` (the broker-or-private policy) and `brokerLaunch`
  - `prepare.ts`: one `Deadline` over everything before a kernel's first request, naming the
    stage it ran out in, and the `Backoff` that keeps a failed preparation from being retried
    by every call — keyed on the binary's identity, reported by `wolfram_status`
  - `kernel.ts`: one kernel — spawn, handshake, serialized work, idle shutdown, `KERNEL_ARGS`
    (the AgentTools invocation), and the private `#fate`/`#reclaim` pair that decides what a
    failure means for the kernel
  - `transport.ts`: `FilteringStdioTransport` — splits kernel stdout into JSON-RPC frames and
    noise, keeps the last 15 noise lines for error messages, bounded kill escalation
  - `pool.ts`: several kernels behind a licence-derived budget, with FIFO waiters.
    `deriveBudget` is the seat arithmetic and is pure, so the 2- and 4-seat cases test on a
    machine with neither
  - `broker-server.ts`: the shared-kernel daemon. Owns a `KernelPool`, serves proxies over a
    socket, exits 60 s after the last one detaches
  - `broker-client.ts`: `BrokerBackend`, a `KernelBackend` that forwards over that socket and
    spawns a broker if none is listening
  - `broker-protocol.ts`: socket address derivation, newline-delimited JSON framing, and
    `BROKER_PROTOCOL` — bump it whenever a frame changes shape, since it is part of the socket
    path and is what keeps mismatched peers from meeting. Adding an *op* is not a change of
    shape and must not bump it: that strands running brokers on the old path, holding seats,
    while new sessions build a second pool against the same licence
  - `locate.ts`: installation discovery and version detection. Starts no kernel except in its
    last resort
  - `wolframscript.ts`: reads Wolfram's own `WolframScript.conf` for the kernel the user
    designated. No kernel, no seat
  - `inspect.ts`: facts only a running kernel knows — licence seats, the three base
    directories, the paclet version that loaded — which every MCP kernel reports as it starts
    (`KERNEL_ARGS`), cached. No kernel of its own
  - `cache.ts`: the capability/tool-list cache and the cache directory
  - `config.ts`: every knob, all environment-driven, plus `MCP_SERVERS`, the cold-start
    capability table — the paclet's *built-in* servers, never the whole name space
  - `flavour.ts`: which environment values decide whether two sessions may share a kernel.
    `FLAVOUR_VARS` is what the paclet reads, pinned by the `.wlt`; `applyFlavour` builds a
    kernel's environment *exactly*, stripping what the flavour leaves unset rather than
    inheriting it from the broker
  - `doctor.ts`: the diagnostic command. Exits 0 when a kernel answered, 1 otherwise.
    `CONFIG_VARS` is what it can report
  - `log.ts`: `createLogger` → stderr, the only output channel that is not the protocol
  - `lib.ts`: the public API surface, `"."` → `dist/lib.js`
  - `version.ts`: `PKG`, resolved correctly in every packaging mode
- `test/`: `smoke.mjs` (the suite), `fake-kernel.mjs` (a stand-in kernel),
  `public-content.mjs` (the public-content check's own tests), and `agenttools-contract.wlt`
  (what this package assumes about the paclet)
- `scripts/`: `mcp-server.mjs` is the launcher `.mcp.json` invokes via `npm run mcp`;
  `run-contract.wls` runs the `.wlt`; `custom-server.mjs` is `npm run test:custom`;
  `on-edit.mjs` is the PostToolUse hook behind every Write and Edit — prettier, eslint and
  the whole-project type check on src/ TypeScript, at the moment of the mistake;
  `session-check.mjs` is the SessionStart hook — silent on a healthy machine, and says which
  half of the enforcement is dark (no `npm install`, no `wolframscript`) when one is;
  `lint-wl.wls` is `npm run lint:wl`, CodeInspector over the tree's Wolfram Language;
  `container-acceptance.mjs` is `npm run test:container` — the release bundle in fresh Linux
  containers of Wolfram's Engine image, with exactly the Node floor: unactivated, no Wolfram,
  old Node, and, when `WOLFRAM_MCP_TEST_ENTITLEMENT` holds an on-demand licence entitlement,
  licensed; `container-driver.mjs` is what it runs inside each;
  `client-acceptance.mjs` is `npm run test:client` — the plugin from the release archive on exact
  Claude Code versions, each installed from npm into its own prefix and sharing one test config
  directory that you sign in interactively (`login <version>`);
  `lsp-server.mjs` is the plugin's LSP entry — the Node guard and the not-built instruction,
  then a hand-over to the CLI's `lsp` subcommand; `lsp-contract.mjs` is `npm run test:lsp`;
  `bundle-js.mjs` is `npm run bundle:js` — the single-file artifact, the whole CLI with its
  dependency tree inlined, which the suite builds fresh and drives as its own section;
  `release-artifacts.mjs` is `npm run release:artifacts` — the files a release hands out,
  built into `release/` from a working tree with no GitHub and no seat: the bundle, the
  `archive`-source plugin zip, and a `SHA256SUMS.txt` over both. Platform-independent, so one
  build serves every OS;
  `public-content.mjs` is the public-content check — absolute home paths, Wolfram hosts off its
  allow-list, credential-shaped strings — run over the tree by CI's `public-content` job and
  over what is staged by `.githooks/pre-commit`, which `install-hooks.mjs` enables from the
  prepare script; `test/public-content.mjs`, part of `npm test`, tests the check itself;
  `metrics.mjs` derives the figures the docs no longer assert;
  `release-version.mjs` names a release build from its ref and stamps the version into the tree;
  `ci-changes.mjs` decides whether a pull request needs CI's test and build jobs — not when
  it changed only markdown outside `plugin/`, `test/`, `src/`, `scripts/` and `examples/`
- `examples/`: `weather.wl`, a worked example against a public API — sessions here lint it
  live through the plugin's LSP, and `npm run test:lsp` fails if it stops being lint-clean
- `docs/`: developer documentation
  - `next-session.md`: the entry point — current state and what to pick up next
  - `design.md`: how it is put together, and the failure modes that shaped it
  - `environment.md`: every environment variable, the resolution order, the seat arithmetic
  - `plan.md`: remaining work in order, with each claim graded *reproduced*, *traced* or
    *repeated*
  - `plugin-plan.md`: the agent-tools roadmap — outcomes, decisions, milestones with their
    gates, design context, and evidence
  - `releasing.md`: the CI and release pipeline — what runs where, and how to exercise all of
    it locally before it ever reaches GitHub
- `plugin/`: the Claude Code plugin's source template — `.claude-plugin/plugin.json`,
  `README.md`, the `doctor`, `wolfram-setup` and `wolfram-language` skills, the SessionStart
  hook (`hooks/hooks.json`, running the bundle's `session-status`), and `NOTICE`, which
  attributes the setup skill's Wolfram Research origin (MIT). Its manifest names only paths inside the plugin root: the MCP server and
  Wolfram's LSPServer both run the single-file bundle that `npm run release:artifacts` adds
  when it assembles `release/plugin/`, which it then zips as the release archive. The template
  alone is never installed. The LSP kernel costs a licence seat from the first Wolfram
  Language file a session opens; it is on by default (D23), and the plugin's `lsp` option —
  which the SessionStart hook records for it, since only hooks are given options — or
  `WOLFRAM_MCP_LSP` turns it off
- `.claude-plugin/marketplace.json`: makes the repo its own marketplace, serving
  `release/plugin/` in place: `.claude/settings.json` enables `wolfram@wolfram` for sessions
  in this repo — what they run is what was last assembled, which is what ships — and disables
  `.mcp.json`'s copy of the same server, so the tools appear once
- `.mcp.json`: committed, so this repo runs its own working tree as an MCP server
- `.github/workflows/`: `ci.yml` runs `npm test` (hermetic, no seat) matrixed over the Node floor
  and newest — Node only, since the artifacts are platform-independent and the maintainer's own
  machine covers macOS — plus a single `build` job that assembles the release artifacts on every
  PR (CI is `pull_request`-triggered, so a branch is tested once it has a PR);
  `release-please.yml` runs on `main` and keeps a release PR whose version it computes from the commit types — `fix:` a
  patch, `feat:` a minor, `docs:` and the rest nothing — with `CHANGELOG.md`; `release-build.yml`,
  which `release-please.yml` calls in the same run, is the one job that builds and publishes:
  each update of that PR runs CI in full on its commit (it calls `ci.yml`) and publishes the
  pre-release `v<x.y.z>-pre.<n>`, and merging the PR makes a draft and tag that the build
  finishes as the release, a pre-release below 1.0.0 —
  `scripts/release-version.mjs` names the build and stamps its version into the checkout, and
  `pr-title.yml`'s `commit-types` job (`scripts/commit-types.mjs`) refuses a commit that changes what
  ships under a type that bumps nothing; `pr-title.yml` fails a PR whose title is not a Conventional Commit, because under
  squash-merge that title becomes the commit release-please reads, so a bad one silently skips a
  bump. `release-please-config.json` and `.release-please-manifest.json` drive the bump — the
  config's `extra-files` keep `plugin.json` in step with `package.json`.
  Nothing publishes to npm, and no personal token is used: release-please and the build run as
  jobs of one workflow run, because nothing `GITHUB_TOKEN` does starts another workflow, so the
  release PR gets no CI of its own and the build runs `ci.yml` on its commit and posts `ci-ok`
  there — that and the one-time repo settings (Actions may open PRs, squash-merge, branch
  protection) are in `docs/releasing.md`, which also says how to exercise them locally

Prose in `docs/` explains intent. It does not assert figures: `npm run metrics` derives them
and the suite prints how many checks it ran, so quote the command, never a number. Nothing
tests the prose itself — tests test functionality — so keeping a doc true is the job of
whoever changes what it describes.

### Kernel discovery

As `locateKernel` resolves it, first match winning. Steps 1–3 fail closed — naming an
installation that cannot be used stops discovery rather than substituting another:

1. `WOLFRAM_MCP_KERNEL`
2. `WOLFRAM_MCP_VERSION`, matched against every installation found
3. `WOLFRAM_INSTALLATION_DIRECTORY`, then `WOLFRAM_HOME`
4. `WOLFRAMSCRIPT_KERNELPATH`, then `WolframScript.conf` — a recorded preference, so it
   outranks "newest version on disk"
5. Platform scan, newest version wins
6. `wolfram` or `WolframKernel` on `PATH`, then the installation `doctor` recorded, if
   step 7 is what found it
7. `wolframscript -code '$InstallationDirectory'` — the only step that starts a kernel, so
   only `doctor` runs it. A session, the LSP and the library's `createWolframServer` stop at
   step 6; a kernel only `wolframscript` knows about is reached by running `doctor` once,
   which records it

The 14.3 floor applies in every auto-detection branch (3–7). An explicit `WOLFRAM_MCP_KERNEL`
path or `WOLFRAM_MCP_VERSION` pin is honoured as named — the fake kernel has no version, so the
smoke suite depends on this — and an older kernel named that way starts and then fails with
``Get::noopen: Cannot open Wolfram`AgentTools` ``.

### Where state lives

| What | Where |
|---|---|
| Capability and tool-list cache | `$XDG_CACHE_HOME` or `~/.cache` → `wolfram-mcp-server/capabilities/<digest>.json`, one per kernel×server name (`LOCALAPPDATA` on Windows) |
| Per-installation reported facts | same directory → `installations/<digest>.json` |
| Broker socket | `$WOLFRAM_MCP_RUNTIME_DIR`, else `$XDG_RUNTIME_DIR`, else `tmpdir()` if only you can write to it, else the cache directory's `run/` (`brokerDirectory`) → `wolfram-mcp-<uid>-<digest>.sock`, one per installation per user — the digest is protocol, package version, the running code's own digest (a bundle and a clone of one version are two programs), kernel binary, uid and, when set, `WOLFRAMINIT` (an entitlement's broker is its own), deliberately *not* the server name; Windows `\\.\pipe\wolfram-mcp-<digest>` |
| Kernel preference | Wolfram's own `WolframScript.conf`, read never written |

`clear-cache` removes both the `capabilities/` directory — including the single
`capabilities.json` that preceded it — and the reported facts, and says so; it is the
cold-machine reset. A live broker and the client's own tool-definition cache survive it.

### MCP documentation

Use the official specification when working on `proxy.ts` or `transport.ts`.

- [Overview](https://modelcontextprotocol.io/specification/2025-11-25/basic/index.md)
- [Lifecycle](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle.md)
- [Tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools.md)
- [List of all documentation pages](https://modelcontextprotocol.io/llms.txt)

## Key Development Patterns

### The four invariants

- **stdout is the protocol.** Anything on stdout that is not a JSON-RPC frame corrupts the
  session. There is no `console.log` in `src/` and there must not be — everything goes through
  `log.ts`, to stderr. `FilteringStdioTransport` exists because the kernel prints banners and
  messages to *its* stdout.
- **Nothing on the `initialize` path starts a kernel.** Capabilities come from the disk cache or
  from `MCP_SERVERS`; `tools/list` is served from cache when one is warm. Work added to
  `createWolframServer` must not block and must not spawn.
- **Sharing is an optimisation, never a dependency.** Every broker failure must fall back to a
  private kernel, with the reason logged.
- **Sharing may never change an answer.** A kernel reads its environment at startup, so two
  sessions share only where their *flavour* matches (`flavour.ts`); the broker starts a kernel
  per flavour and its pool retires an idle one of another flavour rather than exceed the seat
  budget. A session whose declaration a broker will not take gets a private kernel. Where the
  answer is unknown, do not share.

### Configuration

Every knob is an environment variable, so the command line stays argument-free. Adding one means
updating `CONFIG_VARS` in `doctor.ts` and the `HELP` text in `index.ts` — the suite's CLI
section fails otherwise, because those are what a stuck user sees — plus `docs/environment.md`.

`MCP_SERVER_NAME` and `MCP_TOOL_OPTIONS` are Wolfram's own variables, not ours. A server
name is **not** restricted to `MCP_SERVERS`: the paclet resolves a user's own server out of
`$UserBaseDirectory` before it looks at its built-ins, and a paclet-qualified
`Publisher/Server` after them. An unrecognised name is passed to the kernel unchanged and,
if it really does not resolve, diagnosed from the kernel's own message by `SERVER_NOT_FOUND`
in `kernel.ts` — never substituted, which is what silently served `Wolfram`'s tools to
anyone with a server of their own. `MCP_TOOL_OPTIONS`
in particular sets each tool's effective options, including `WolframLanguageEvaluator`'s
`TimeConstraint`, so that value is a user setting this server may neither assume nor override. It
reaches the kernel only because `kernel.ts` spreads `process.env`, and a check pins that.

### Errors

Errors carry the kernel's own words to the caller — do not paraphrase them. Keep the distinction
`proxy.ts` maintains between a protocol error and an `isError` result, and keep it identical on
the private and broker paths: an unknown tool is an MCP error on both, a failed evaluation is an
`isError` result on both.

### Style

- TypeScript `strict`, plus `noUncheckedIndexedAccess` and `verbatimModuleSyntax`.
- No `TODO`, no `FIXME`, no `@ts-ignore` anywhere in the tree.
- Comments explain **why**, and name the failure they prevent. Match that density; a terse patch
  reads as foreign here.
- Layout is tooled where the tools converge: prettier and eslint own `src/` TypeScript, applied
  by the on-edit hook and `npm test`. Wolfram Language keeps its hand formatting — CodeFormatter
  inserts a blank line into block comments on every pass (`docs/plan.md` §11), so only its
  *linting* is enforced, live through the plugin's LSP and headless through `npm run lint:wl`.
- Commit messages: imperative, lower case, a comma clause rather than a colon-list, and a body
  explaining the failure being fixed. Read `git log` before writing one.

## Special Considerations

**The call timeout is a deadline for the caller, not the kernel.** Because a kernel sends no
progress notifications, the ceiling answers the caller and leaves the kernel running; a late
reply is proof of life; the kernel is stopped only when someone else needs the seat or the caller
cancelled. `notifications/cancelled` cannot stop work already running. This is settled — the
reasoning, including why a per-tool timeout table was rejected, is in `evaluationCeilingMs` and
`KernelSession.#fate`.

**A running broker serves the code it started with.** It is spawned detached, its output
discarded unless `WOLFRAM_MCP_LOG` names a file, so a fix to `pool.ts`, `kernel.ts` or
`broker-server.ts` looks like it did nothing until the old broker goes. Check before killing,
and match narrowly — this repo's `.mcp.json` runs a live server for whoever is editing it, and
their broker appears as `scripts/mcp-server.mjs broker`, not `dist/index.js broker`:

```bash
pgrep -fl broker                       # look first
pkill -f "dist/index.js broker"        # yours only
```

**Four things persist between runs**, and a stale one makes a change appear to do nothing: the
capability cache, the per-installation facts file (until the binary changes), a live broker
(60 s past the last detach), and the client's own tool-definition cache (until a new
conversation).

**You may be editing the server that is providing your own Wolfram tools.** A session in this
repo runs the working tree through the plugin (`wolfram@wolfram`) and only through it —
`.claude/settings.json` retires `.mcp.json`'s copy of the same server so the tools appear
once. `.mcp.json` stays committed as the harness-agnostic entry: it is what an MCP client
without Claude Code's plugin system points at. Consider how a change affects the session you
are typing into — and note that it keeps running the code it loaded at startup, however many
times you rebuild.
