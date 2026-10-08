# Wolfram plugin plan

**Status,** 2026-10-05: M0 and M1 are built (D1), and M1's acceptance is nearly complete
(§8). MA's design is decided (D26–D32) and its experiments come next. Everything after them
waits for its own approval.

**What this is.** The single plan document: outcomes, decisions, constraints, the design
context and mechanisms, milestones with their gates, support policy, open questions, and the
evidence behind every claim.

Grades follow `plan.md`: *reproduced* means run or probed, *traced* means read in source or
documentation, *repeated* means relayed. Everything else is a proposal.

---

## 1. Outcomes

**The product, eventually:**

> On a supported machine with the required runtime, installing the plugin exposes the
> appropriate Wolfram tools without hand-editing configuration. Setup guidance handles missing
> prerequisites. Each call follows an explicit local/hosted policy, says which backend
> answered, and respects a documented bound on plugin-managed kernel allocations.

That needs M1 through M4. It is not a first-release claim.

**The first release (M1):**

> On macOS or Linux with a supported Node and an activated Wolfram 14.3+ kernel carrying a
> supported AgentTools, installing the plugin in Claude Code exposes the `WolframLanguage`
> tools without hand-editing configuration, and they work. On a machine without those
> prerequisites, the plugin says which one is missing and how to get it. Once the capability
> cache is warm, starting a session starts no kernel and makes no network request. A session
> on a cold cache starts exactly one kernel, to learn the tool list (D17).

**M1's stated limitations**, documented where the plugin is installed:

- Local execution only. No hosted fallback.
- No allocation bound across MCP and LSP. The LSP is on by default (D23): from the first
  Wolfram Language file a session opens it takes a licence seat outside the MCP pool for the
  rest of the session, and the option that turns it off says so.
- The first session on a cold capability cache (first install, `clear-cache`, cache disabled
  or unwritable) starts one kernel at discovery, because the client's `tools/list` arrives at
  session start and the tool list comes from the kernel. With the cache disabled or
  unwritable, that happens every session. Prompts are absent from such a session; they appear
  on a new connection after a successful cache refresh, and not at all while the cache is
  disabled or unwritable (§4.1).
- On the shared path (the default), the preparation deadline and back-off cover the broker's
  own preparation, not the start of the session's shared kernel (D19). A cold broker can take
  nearly two start timeouts before the session sees an error, and a shared kernel that fails
  to start is retried by every later call, each attempt briefly taking a seat. A private
  kernel (`WOLFRAM_MCP_SHARE=0`) has the full deadline and back-off.
- Cowork and chat are not M1 support claims. M1b and the chat skills have their own
  acceptance.

**User journeys:**

| Journey | Success means | Milestone |
|---|---|---|
| Existing local Wolfram user, Claude Code | Install, diagnose, compute on the selected installation | M1 |
| New local user | Guided to install and activate an Engine, then a verified working call | M1 |
| Chat user | Skills that explain and use the separately connected Wolfram connector | M1 (skills only) |
| Cowork user | The packaged process starts in a desktop session and works | M1b |
| User with no kernel, hosted permitted | Hosted computation, explicitly enabled, with its limits visible | M4 |

---

## 2. Approvals

*The owner*, here and throughout, is the repository's maintainers — the contributors who
approve and merge — not one person.

Three separate approvals, so an implementer always knows which one they hold:

1. **Build**: the owner approves a milestone's scope. Recommended defaults in §3 may be used
   as written. Anything marked *design checkpoint* returns for review before runtime changes.
2. **Accept**: the milestone's acceptance scenarios pass, recorded in the evidence ledger
   (§6).
3. **Release**: the owner approves publishing an accepted milestone, under the support policy
   (§6) and decisions D2 and D9.

Accepting a review finding, or finishing a prototype, is none of these.

**Design checkpoints** (M2, M3, M4) have the same roles each time:
- **Author:** the implementer of that milestone. The deliverable is a short design document
  under `docs/`.
- **Reviewer:** an adversarial review, each finding recorded as incorporated, deferred with a
  gate, or rejected with a reason.
- **Approver:** the owner.

A checkpoint is accepted when its milestone's "checkpoint accepted when" observations hold and
the owner approves. Until then, that milestone's runtime changes are not built.

---

## 3. Decisions

Every row is a **proposal** until the owner confirms it. A confirmed row says so, with the
date. Confirmed so far: D1, D3 (its default replaced by D23), D6 and D12–D33. Confirmation
happens explicitly, or through a Build approval for a milestone, which confirms the defaults
that milestone uses unless the owner says otherwise.

| # | Decision | Recommended default | Needed before |
|---|---|---|---|
| D1 | Next implementation scope | **Confirmed by the owner, 2026-10-03.** M0, then M1 as specified in §5; later runtime features return through their design checkpoints | Any implementation |
| D2 | Name, publisher and support owner | Provisional identity for prototypes | Public release |
| D3 | LSP option | **Confirmed by the owner, 2026-10-03.** Default **off**. Mapping and precedence in §5 M1 | M1 launchers |
| D4 | Hosted use | **Opt-in**. Disabled means no hosted connection, refresh or call | M4 enablement |
| D5 | Signed-out `WolframAlpha` retry | **Deferred, disabled in base M4.** It would be a named exception to the no-replay rule (§5 M4) | Its own approval |
| D6 | Cold-session prompts | **Confirmed by the owner, 2026-10-03.** Document the limitation, worded as in §1 | M1 guidance |
| D7 | Expanded plugin view (`Wolfram` ∪ `WolframLanguage`) | After M2. **Required by M4** | M4 |
| D8 | Committed generated bundle | No: release-only artifacts | Revisit only with D9 |
| D9 | Claude directory listing | Undecided. Needs D2 and a reviewer environment (policy 3.D) | Directory submission |
| D10 | Upstream proposal to AgentTools | Undecided. Needs a named Wolfram-side owner. Candidates found in M1 acceptance, for LSPServer: answer MethodNotFound to a request it did not advertise rather than exit (the launcher answers for it now); and wait on stdin rather than polling it every 100 ms, which is most of every request's latency (ledger, LSP speed) | Upstream work |
| D11 | Windows | Excluded unless a portability and security workstream is accepted | Any Windows claim |
| D12 | M1 default interface | **Confirmed by the owner, 2026-10-03.** Named `WolframLanguage` | M1 config changes |
| D13 | Version authority | **Confirmed by the owner, 2026-10-03.** `package.json`; release-please synchronises the plugin manifest | M1 packaging |
| D14 | First distributed install | **Confirmed by the owner, 2026-10-03.** The release archive through an `archive`-source marketplace. **Extended 2026-10-06 (D34, #7):** another project installs from the `release` branch's marketplace instead, whose entry is a relative path. Claude Code fetches a plugin that only a project's settings enable *only* for such an entry, so an `archive` entry would make every collaborator run `claude plugin install` once. The archive stays the release asset the branch is made from, and an `archive` entry still installs a single version | M1 distribution acceptance |
| D15 | Docs linting | **Decided by the owner, 2026-10-03:** tests test functionality, so the prose checks go. The two that test what a user sees (`doctor` and `--help` cover every variable) stay as CLI checks (§5 M0) | M0 |
| D16 | Branches and merge target | **Confirmed by the owner, 2026-10-03.** Work happens on branches and is squash-merged into `main` through reviewed pull requests, the PR title becoming the Conventional Commit release-please reads (D25, D31) | M0 close |
| D17 | Cold tool list | **Confirmed by the owner, 2026-10-03: learn it from one kernel, as today**, and state the cost (§1). The alternative, a shipped seed tool list validated at first preparation, makes cold discovery kernel-free but needs a kernel-captured snapshot pinned per paclet version. It is a later enhancement, not M1 | M1 outcome |
| D18 | Environment coverage by release | **Decided by the owner, 2026-10-04.** M1 is accepted on macOS, the maintainer's platform. Every supported environment — Linux x86_64 included, likely through a Linux container — is tested before a 1.0.0 release, which is that release's gate (§6). Linux stays in the supported scope; it is not claimed by M1's acceptance | M1 acceptance; 1.0.0 |
| D19 | Shared-path preparation budget | **Decided by the owner, 2026-10-04:** a known limitation of shared mode in M1, stated where the plugin is installed (§5 M1). The fix, which bounds and backs off a session's first shared kernel start wherever it happens, is designed at M3's checkpoint, since it changes pool allocation | M1 acceptance; M3 checkpoint |
| D20 | Installation facts | **Decided by the owner, 2026-10-04:** no separate probe kernel. Each MCP kernel reports the facts itself, after AgentTools loads and before its server starts, so a cold start uses one kernel, never two in a row, and the facts refresh on every start (§5 M1, *Facts from the serving kernel*) | M1 acceptance |
| D21 | Licensed test machines | **Decided by the owner, 2026-10-04:** acceptance on a separate machine runs in containers of Wolfram's `wolframresearch/wolframengine` image (amd64, the supported Linux x86_64). Scenarios that need no licence run unlicensed — a fresh container is unactivated by default. Licensed ones use an on-demand licence entitlement, Wolfram's documented CI route, held outside the repository (`WOLFRAM_MCP_TEST_ENTITLEMENT` locally, a secret in CI) and charged per kernel-hour; node-locked activation is interactive and machine-bound, so not used | M1 acceptance; 1.0.0 |
| D22 | Client floor | **Decided by the owner, 2026-10-04:** keep the `lsp` option in `userConfig` and support Claude Code **2.1.75 or later**, the first client that accepts it — every older one rejects the manifest and loads nothing (ledger). Installing from the release archive needs 2.1.224 or later, so between the two the plugin is installed another way (a `directory` or git marketplace). CI validates the manifest at 2.1.75 as well as at the current client, so a key newer than the floor fails a pull request | M1 acceptance |
| D23 | LSP default | **Decided by the owner, 2026-10-04, replacing D3's default:** the LSP is **on** by default — someone using the plugin in Claude Code wants code intelligence too, and Claude Code starts the LSP server only when a Wolfram Language file is opened. Its cost, a seat per such session outside the MCP pool, is stated in the option and the README; the `lsp` option or `WOLFRAM_MCP_LSP=0` keeps it. The option reaches the LSP server through the SessionStart hook and the plugin's data directory, because a server entry naming `${user_config.lsp}` failed to load on a client with no stored value (Claude Desktop's synced uploads, `--plugin-dir`) | M1 acceptance |
| D24 | Release pipeline before 1.0.0 | **Decided by the owner, 2026-10-05:** test the full pipeline from the start rather than work around its absence. Releases are built the way they will be after 1.0.0 (`release-build.yml`). **Changed by the owner, 2026-10-06:** a release is a normal GitHub release from 0.x on, marked Latest when published; only the release PR's `v<x.y.z>-pre.<n>` builds are flagged Pre-release. Until then every release below 1.0.0 was a pre-release, which `releases/latest` skips, so no link could follow the newest release. How versions and builds are named is D25 | M1 distribution acceptance |
| D25 | Versions | **Decided by the owner, 2026-10-05:** the version is decided automatically from the commits. From `0.1.0`, a fix or minor change makes `0.1.1` and a feature `0.2.0`; a breaking change also bumps only the minor until 1.0.0; docs-only changes make no release; a change to what ships — a skill, the server, a production dependency — is a `fix:` or `feat:`, enforced by CI (`commit-types`) for every commit not already in a published build. release-please computes it on `main`, and its release PR's branch is the release branch: every update builds `v<x.y.z>-pre.<n>`, and merging it releases `v<x.y.z>`. No personal token (owner, 2026-10-05): release-please and the build are jobs of one workflow run, since nothing `GITHUB_TOKEN` does starts another workflow. **Checked 2026-10-06** against the maintainer's aim that people only push, review and merge, from the tools' own documentation: release-please is kept. semantic-release releases on every merge with no review step, puts 0.x semantics out of scope by its own FAQ, and can't commit a changelog to a protected `main` with `GITHUB_TOKEN`. changesets puts a hand-written version file in every PR. release-please has no supported way to merge its own PR, and doing it would need an App token. So merging the release PR stays the one human step of a release, and the review that goes with it | M1 distribution acceptance |
| D26 | Product shape | **Decided by the owner, 2026-10-05:** the product is a set of client-neutral agent tools — the MCP server, the LSP launcher, skills, the session-status hook, `doctor` — and each client gets a package built from them that carries only what that client supports, per a tested capability matrix (§5 MA). One repository, one version, one release that produces every client's package | MA |
| D27 | Name and repository | **Decided by the owner, 2026-10-05:** the project is `wolfram-agent-tools`, one public repository on GitHub, where pull requests, Actions and releases run. The npm package keeps the name `wolfram-mcp-server` and the Claude Code plugin the name `wolfram` | MA |
| D28 | Client tiers | **Decided by the owner, 2026-10-05, amending the proposal:** *native* clients are Claude Code (Claude Desktop's Code tab included, which installs the same archive), Codex, Cursor and VS Code/Copilot. Native means an acceptance run on that client, not a package of its own: a client gets a separate package only where an experiment shows a shared one does not serve it — Copilot reads `.claude-plugin`, expands `${CLAUDE_PLUGIN_ROOT}` and runs the LSP and hook, so it may take the Claude Code package unchanged, while Codex (no root expansion, a filtered environment) and Cursor (a JSON hook contract) will not. There is **no `.mcpb` package**: the Claude directory has no route for software that needs a separately installed, separately licensed product, and the generic package serves Claude Desktop chat. A *generic* package — MCP server, Agent Skills, `AGENTS.md`-style guidance, and an Agent Plugins 1.0 manifest — with a setup note per client covers the rest (Claude Desktop chat, Qwen Code, OpenClaw, Hermes, Pi, OpenCode, Kiro, Factory, Augment, Junie, Goose, Zed, Amp, Cline); a *dedicated* adapter later for Antigravity, which reads neither the Claude Code nor the Agent Plugins format. Surfaces that take only remote MCP (ChatGPT web, the Gemini app, Cursor and Copilot cloud agents) wait for M4 | MA |
| D29 | Manifest precedence | **Decided by the owner, 2026-10-05:** never ship an Agent Plugins root `plugin.json` beside `.claude-plugin/` in one package. VS Code and Copilot read the Agent Plugins manifest first and would then see only skills and MCP, losing the LSP and the hook. The Agent Plugins view is its own artifact | MA |
| D30 | Skills written once | **Decided by the owner, 2026-10-05, with a constraint:** skills are authored once, client-neutral, and rendered per client at build time: the client's name, how its `doctor` is invoked (`/wolfram:doctor`, `$doctor`, a plain request), and which tools it has. A skill states only what holds for the client it ships to. The sources are valid `SKILL.md` files that render to themselves for Claude Code, and only that fixed set of substitutions varies, so the Claude Code package is a copy and the restructure can keep it exactly as before. A rendered `wolfram-setup` keeps its Wolfram Research (MIT) attribution in every package | MA |
| D31 | Public-repository safeguards | **Decided by the owner, 2026-10-05, in outline:** `main` is protected — no direct pushes, no force-pushes or deletion, changes only by pull request with `ci-ok`, `conventional-title`, `commit-types` and a public-content check required; GitHub secret scanning and push protection on. The public-content check, run in CI and as a pre-commit hook, refuses absolute home paths, any `*.wolfram.com` host outside an allow-list of public ones, and credential-shaped strings — an allow-list, so the check never names what it forbids. Machine-specific test setup lives in each developer's environment, never in the repository | MA |
| D32 | Core stays client-neutral | **Decided by the owner, 2026-10-05:** the core reads no client's variables directly. A small launch-context layer maps each client's plugin root, data directory and options (`CLAUDE_PLUGIN_*`, `PLUGIN_ROOT`/`PLUGIN_DATA`, `CURSOR_PLUGIN_ROOT`, Cursor `variables`, Qwen `settings[]`) onto the server's own `WOLFRAM_MCP_*` settings, generalising what the SessionStart hook already does for Claude Code's `lsp` option. It maps only what reaches it: a variable a client strips is MA's core item 1, solved by not depending on it, not by this layer | MA |
| D33 | The bundle is a downstream interface | **Decided by the owner, 2026-10-05:** other projects may build their own plugins on the release's `wolfram-mcp-server.mjs`, serving their own AgentTools server, without a fork. The asset's name, the `SHA256SUMS.txt` format (`sha256sum -c`: `<hex>  <name>`, one line per asset) and the per-tag download path are a contract: a downstream package pins the bundle by version and checksum, as every package of ours carries one identical bundle (MA). What a downstream package may rely on — the environment contract, the status probe, the fixture for its own tests — is the work of §5 MD, and stays out of the contract until MD's checks pin it | MD |
| D34 | Following releases from another project | **Decided by the owner, 2026-10-06 (#7, #43):** a `release` branch carries the newest release as a Claude Code marketplace named `wolfram-agent-tools`: `plugin/`, exactly that release's verified `wolfram-plugin-<version>.zip`, and `.claude-plugin/marketplace.json` naming it `./plugin`. A project commits `extraKnownMarketplaces` at `"ref": "release"` with `"autoUpdate": true` and gets every release with no edit, or pins `"ref": "wolfram--v<version>"`, the branch commit tagged with Claude Code's own `<plugin>--v<version>` convention, which plugin dependency ranges also resolve against. The branch and GitHub's Latest have one writer: the release run's `advance` job (`scripts/release-branch.mjs`), which reads the newest published release after every build in the run and moves the branch forward to it, never back, tags it, and marks it Latest. Builds publish with Latest off, so a release finished late or built by hand moves neither until a release run does. Release runs never overlap, and each repeats whatever the last left undone. The design follows Claude Code's hosting documentation: auto-update is off for third-party marketplaces unless `autoUpdate` is set, and a plugin updates when its `plugin.json` version changes | M1 distribution acceptance |

---

## 4. Constraints and context

These are working constraints of the engine. Every milestone preserves them, and none is
reopened without new evidence:

- **One engine, independent of Claude packaging.** It keeps serving other MCP clients and
  library callers, and plugin policy never changes their selected server.
- **The engine's invariants:**
  - stdout is the protocol;
  - nothing on `initialize` starts a kernel or reaches the network (§5 M1 makes this hold for
    discovery too);
  - sharing is an optimisation, with private fallback;
  - sharing never changes an answer within the modelled startup configuration.
- **The timeout model stays as it is.** The call ceiling answers the caller and leaves the
  kernel running. There is no per-tool timeout table (`evaluationCeilingMs`).
- **Custom server names stay an open namespace.** Explicit configuration fails closed, and
  explicit kernel and version pins never fall back to another environment.
- **Out of scope:** tunnelling a remote harness to the user's machine; Windows (`plan.md` §9);
  cloud Claude Code sessions, unless an organisation provides the plugin.

### 4.1 Cold capabilities, precisely

Under the protocol revision we speak (2025-11-25), capabilities are fixed at `initialize`. A
session that starts with no cached capability set advertises tools only (`src/proxy.ts`), and
warming the cache during that session does not renegotiate. Prompts therefore appear only on
a **new connection after a successful cache refresh**. With `WOLFRAM_MCP_CACHE=0` or an
unwritable cache directory they never appear. Custom servers' resources follow the same rule.

### 4.2 What each Claude surface loads

One plugin folder installs everywhere, and each surface loads a subset (*traced*,
[platform support](https://claude.com/docs/plugins/platform-support), 2026-10-02). "Chat" is
claude.ai on the web, desktop and mobile; "Cowork" is Cowork tasks in the desktop app;
"Claude Code" includes the desktop app's Code tab.

| Component | Chat | Cowork | Claude Code |
|---|---|---|---|
| Skills | Loads | Loads | Loads |
| Commands | Loads as a skill | Loads | Loads |
| Agents | Ignored | Loads | Loads |
| Hooks | Ignored | Loads (`SessionStart` firing *unverified*, A.3) | Loads |
| Remote MCP (`http`/`sse`, fixed URL) | Listed on the Connectors tab, works once added | Loads, connect from the Connectors tab | Loads |
| Local MCP (a command the app starts) | Ignored | Loads when the session runs on your computer | Loads |
| MCP referencing `${user_config.*}` | Ignored if the URL has the reference | Ignored without a default; Cowork never prompts | Loads, prompts |
| LSP servers, output styles, themes, `settings` | Ignored | Ignored | Loads |
| Top-level `bin/` | Plugin can't be installed | Plugin can't be installed | Loads |

What follows:

- **Chat never reaches a local kernel.** Wolfram in chat is Wolfram's hosted connector, and
  the plugin contributes skills only.
- **Cowork runs our server, not the LSP.** The LSP is a Claude Code feature.
- **The intelligence lives inside the one server we declare.** Every declared MCP server
  starts, and a plugin cannot switch one of its own off (A.3).
- **Every `userConfig` option has a default**, and there is no `bin/` directory.
- **Scope by surface:** Claude Code gets everything. Cowork gets the MCP server, skills and
  command, with the hook unverified. Chat gets skills. Cloud Claude Code sessions get nothing
  unless an organisation provides the plugin, and their default network allowlist has no
  wolfram.com host anyway. A remote harness reaching the user's own kernel would need a
  public tunnel to code execution, and is ruled out.

### 4.3 How kernels are shared today, and the cost

*Traced*, `src/flavour.ts` and `src/pool.ts`.

**Flavours.** A session's *flavour* is the set of environment values the paclet reads at
startup:
- `MCP_SERVER_NAME` and `MCP_TOOL_OPTIONS`;
- `MCP_APPS_ENABLED`, `MCP_APPS_NOTEBOOK_METHOD` and `LLMKIT_ENABLED`;
- `WOLFRAM_CLOUDBASE` and the `WOLFRAM_*BASE` trio;
- anything the user names in `WOLFRAM_MCP_KERNEL_ENV`.

**Sharing.** Sessions of one flavour share kernels. A different flavour gets its own kernel,
inside the same broker and the same seat budget. When the budget is full, an idle kernel of
another flavour is retired; otherwise the session waits in line. So every distinct
configuration is its own kernel, and every kernel is a seat. The `.wlt` fails if a paclet
upgrade adds an environment read nobody has classified.

**The seat budget.** It is the licence maximum minus `WOLFRAM_MCP_RESERVE_SEATS` (default 1),
the seat kept "so agents cannot lock you out of Mathematica". The LSP kernel sits outside the
pool, so it spends exactly that seat. On a 2-seat licence, one LSP kernel plus one evaluation
kernel is the whole licence. Declining the LSP only when *it* is refused cannot help: both
can start successfully, and the human's later Mathematica launch is the one refused.
Nothing can predict a shortage either. The probe records `$MaxLicenseProcesses`, a maximum,
and seats held by Mathematica or other editors' LSP kernels are invisible to it.

**The cost views remove (M2).** The server name is part of the flavour, so a session on
`WolframLanguage` and one on `Wolfram` hold two seats, though their shared tools are the same
code (A.1).

### 4.4 What Wolfram already ships

| Piece | What it gives |
|---|---|
| `Wolfram/AgentTools` paclet | The MCP servers themselves (four built-ins), and `InstallMCPServer` / `DeployAgentTools` writing config for many clients (`$SupportedMCPClients`). The config it writes points `command` straight at the `wolfram` binary: one kernel and one seat per session, with kernel output on the protocol channel, which is what this engine replaces (A.1) |
| [`wolfram-setup` skill](https://github.com/WolframResearch/skills/tree/main/skills/wolfram-setup) | Walks an agent through getting, activating and verifying a Wolfram Engine, then wiring MCP. MIT, © Wolfram Research. Knows no version floor and nothing of `WolframScript.conf`; its Step 2A handles `wolframscript` off `PATH` but leaves activation to a later step |
| Hosted MCP service | `https://agenttools.wolfram.com/mcp`: streamable HTTP, no sign-in, in the apps' connector directories. It is the paclet's `Wolfram` server, stateless, "free for limited personal use" (A.2) |

**Which AgentTools users get:** the paclet server auto-installs stable **2.2.0**
(`14.3+`). 2.2.7 is GitHub's experimental release (`15.0+`), installed by hand on the
maintainer's machine; tool names are identical across 2.1.17, 2.2.0 and 2.2.7 (A.1).

### 4.5 Beyond Claude

Other harnesses (Codex, Cursor, VS Code, Zed and the rest) can get the same engine by other
routes, in order of leverage:

1. **Upstream (D10).** If `InstallMCPServer` could write `command: <this launcher>` for the
   clients it knows, every harness it supports gets seat sharing at once. Or the paclet takes
   the behaviour in, with this repo as the reference and its suite as the specification. The
   question for Wolfram is the runtime: the paclet's config needs only the `wolfram` binary,
   and ours needs a supported Node.
2. **Ride on the paclet:** an `install <client>` subcommand that calls `InstallMCPServer` and
   swaps in our `command`, pinned by a `.wlt` check.
3. **Hand-written adapters per harness**, only if neither of the above happens.

---

## 5. Milestones

```text
Owner decision on D1 and the defaults M0–M1 use
  → M0 safe baseline and current evidence
  → M1 verified local plugin (accepted through a local test marketplace)
       → M1b Cowork experiment, then a separate support decision
       → MA agent tools: experiments → restructure
            → native packages, then the generic package, client by client
            → MD downstream packages built on the bundle (item 2 inside M3's design)
       → M2 design checkpoint → stable view acceptance → D7 expanded plugin view
       → M3 design checkpoint → lifecycle and budget acceptance → LSP default decision
       → M4 design checkpoint + D7 + D4 → routing acceptance
P (SDK v2 evaluation) runs independently and gates nothing
M5 publishes only milestones accepted for the selected support scope
```

A design checkpoint is a named deliverable and a review boundary. It is not a demand to run
every later experiment now.

### M0: Safe baseline

Code changes are in scope. Changing the maintainer's paclet environment needs the owner's
go-ahead.

- **The torn pid-file read** (`test/smoke.mjs`). Accept only a complete positive integer pid;
  missing or invalid content must never become a signal target. Keep the child-reaping
  regression check.
- **Remove the prose checks** (D15). This is what unbreaks `npm test` after the
  `CLAUDE.md` → `AGENTS.md` rename. From "The docs match the code" in `test/smoke.mjs`:
  - **Remove** the checks that test prose: npm scripts named in the instructions file;
    variables documented in `environment.md`; fixed limits matching `environment.md`; the
    README's error-code list; `design.md`'s module map; hand-written figures; deleted-file
    references.
  - **Keep, moved into the CLI section,** the two that test behaviour a user sees: `doctor`
    can report every variable `loadConfig` reads, and `--help` names every `WOLFRAM_MCP_`
    variable.
  - **Update the guidance that describes those checks:** `AGENTS.md` (the docs paragraph and
    the "adding a knob" paragraph), `docs/plan.md` §6.3 and `docs/next-session.md`, and any
    doc that still names `CLAUDE.md` as the active file.
  - **Leave the suite's structure alone.** Splitting it by functionality is a separate,
    later task (`docs/plan.md` §12), not plugin work.
- **Fix the vacuous `.wlt` prompt test.** It reads `["Prompts"]`, which is not a property; the
  properties are `PromptNames` and `PromptData`. Its failing-first check is a server declaring
  no prompts.
- **Fix the probe cache's `"15..0"` version string,** including entries already on disk.
  - Correct the generator (`PROBE_EXPRESSION` in `inspect.ts`).
  - Fixing the generator alone leaves existing entries untouched: `readFacts` accepts a
    matching entry without validating the version, and `inspectInstallation` then skips the
    probe. So `readFacts` normalises a malformed version (`15..0` → `15.0`) or rejects the
    entry.
  - Rejection must not make construction or status re-probe in M1: a rejected entry means
    "facts unknown" until the next probe a tool call or `doctor` authorises.
  - Checks: a failing-first fixture with a matching legacy `15..0` entry, and an assertion on
    the actually generated version in the real-kernel suite. The fake kernel's hardcoded
    version can't exercise the generator.
- **Stale text:** correct the `list_changed` premise in `README.md` and the `proxy.ts` comment,
  and the `config.ts` comment on the paclet floor.
- **`FAKE_DEAF_PING`:** reconcile its references in the fake kernel, the suite's scenario
  environments and `AGENTS.md`. Retire it only where no meaningful wedged-kernel scenario
  depends on it; those scenarios stay.
- **Node floor: 22.13.0**, for both runtime and toolchain. ESLint 10.9.1 in the lockfile needs
  at least that on the 22 line. Update `engines`, both launcher guards, the bundle banner and
  target, the CI matrix, the `@types/node` range and the docs together.
- **Re-run the real-kernel suites against stable AgentTools 2.2.0:**
  `test:wl`, `test:custom`, `test:lsp`. Disable 2.2.7 (`PacletDisable`, reversible) or use a
  kernel that loads 2.2.0 explicitly, and record the resolved version.
- **Update the entry point** `docs/next-session.md`: the current plan, current scope, and the
  known baseline state.
- **Start the evidence ledger** (§6).

**Accepted when:**
- `npm test` passes;
- the real-kernel suites pass on stable 2.2.0, recorded in the ledger;
- every bug fix landed with a check that failed first.

### M1: Verified local plugin (Claude Code)

The current engine, packaged properly. No views and no routing.

**Seat-free discovery.** Today `createWolframServer` calls `locateKernel`,
whose last step runs `wolframscript -code`, which starts a kernel. M1 adds a discovery mode
limited to steps 1–6, filesystem and cache only.
- Construction, `initialize`, `wolfram_status` and the hook use that mode.
- **Step 7 runs only in `doctor`**, an explicit user action. When it finds an installation,
  `doctor` records that path as a *discovery hint* in the facts cache. Seat-free discovery
  reads the hint like any other filesystem source, so the next session finds the kernel
  without step 7. This is how a kernel reachable only through `wolframscript` becomes usable,
  with every step listed and explicit.
- **What a session lists**, so every path has a callable tool:
  - *Candidate found, warm cache:* the cached tools plus `wolfram_status`. No kernel starts
    until a tool is called.
  - *Candidate found, cold cache:* the client's `tools/list` starts one kernel to learn the
    list (D17), then caches it. This is the stated cold-session cost in §1, not a
    discovery-time leak.
  - *No candidate:* `wolfram_status` only, as today. Its answer names `/wolfram:doctor` as the
    next step, and `doctor` is the only route to step 7. No unlisted tool is ever the
    trigger.
  - *Custom server names* behave the same way, keyed on their own cache entry.
- Existing callers of `locateKernel` keep their behaviour unless deliberately moved. The
  library's `createWolframServer` defaults to the seat-free mode, which is a behaviour change
  for library callers on machines found only by step 7, and is documented as one.

**Server selection.** Precedence, first non-blank value wins; blank values and
unsubstituted `${…}` placeholders count as unset:
1. `MCP_SERVER_NAME`, the canonical explicit variable;
2. `WOLFRAM_MCP_SERVER_NAME`, the existing explicit alias;
3. `WOLFRAM_MCP_DEFAULT_SERVER`, the plugin's default. The manifest sets it to
   `WolframLanguage` (D12) and no longer sets `MCP_SERVER_NAME`;
4. the engine default, `Wolfram`.

So an inherited explicit choice always wins, library callers see no change, and the ordinary
plugin install serves every M1 workflow on the named path.

**LSP option (D3).** *Superseded in two places by D23: the default is now `true`, and the
option reaches the launcher through the SessionStart hook, which records it in the plugin's
data directory, not through `WOLFRAM_MCP_PLUGIN_LSP` — a server entry naming
`${user_config.lsp}` failed to load wherever no value was stored. The reading order below
still holds, with the recorded option in step 2 and "on" in step 3.* As first decided: a
`userConfig` boolean, `lsp`, default `false`, titled to state the licence-seat cost. The manifest passes it to the LSP launcher as
`WOLFRAM_MCP_PLUGIN_LSP=${user_config.lsp}`. The launcher then decides:
1. An inherited `WOLFRAM_MCP_LSP` wins, read as a boolean: `0`, `false`, `off` and `no`
   disable; `1`, `true`, `on` and `yes` enable.
2. Otherwise `WOLFRAM_MCP_PLUGIN_LSP`, under the same reading.
3. Otherwise off.
4. An unrecognised value is treated as off, with a stderr line saying so.

Off answers the handshake with no capabilities, as the `0` path does today. Hooks read the
option as `CLAUDE_PLUGIN_OPTION_LSP`, not through interpolation. The interpolation itself is
verified against the saved option in the client, not assumed.

**The artifact (D13, D14):**
- *Source template:* `plugin/`, holding `.claude-plugin/plugin.json`, the skills, the hook
  script and configuration, the doctor command, `README.md`, `LICENSE` and attribution.
  Launchers reference only paths inside the plugin root.
- *Assembled tree:* `npm run release:artifacts` copies the template to `release/plugin/` and
  adds the single-file bundle, then zips that tree. The archive is exactly the assembled tree.
  The script no longer generates a separate manifest.
- *Version:* `package.json` is the authority. release-please's `extra-files` keeps
  `plugin/.claude-plugin/plugin.json` in step. The bundle
  embeds the same version. Acceptance compares all of them.
- *Local development:* `--plugin-dir release/plugin`, or this repository's directory
  marketplace pointed at the assembled tree. The source template alone is never installed.
- *First distribution:* an `archive`-source marketplace entry with a versioned URL and its
  sha256. That needs Claude Code 2.1.224 or later, re-checked at release. Another project
  follows releases from the `release` branch instead (D34). Publication order:
  1. upload the archive and checksum from the release tag;
  2. download and verify the digest;
  3. update the marketplace: the release run's `advance` job moves the `release` branch to
     the verified archive's tree, tags it `wolfram--v<version>`, then marks the release Latest.

  If any step fails, the marketplace keeps pointing at the previous version, and the next
  release run repeats the step. Installation never depends on a directory listing.

**Diagnostics.** Messages name what the user can actually run, chosen by launch
context:
- **`CLAUDE_PLUGIN_ROOT` set** (a plugin process, as the manifest reference documents):
  `/wolfram:doctor`.
- **Running as the single-file bundle:** that file's own `doctor` subcommand, with its path.
- **Otherwise** (a clone, or a library caller): the clone's `npm run doctor`. This is the
  library default.

`version.ts` exports package metadata only and cannot make this choice, so the rule lives in
the diagnostic itself. Missing Node is explained where the host shows it, because a Node
launcher cannot run without Node: in the plugin README, the marketplace description and the
setup skill.

**Skills, by observable behaviour:**
- *Setup*, built from Wolfram's `wolfram-setup` (MIT, attributed). It adds the version floor,
  `WolframScript.conf` and activation guidance, and points to `/wolfram:doctor`. It
  **replaces** upstream's client-wiring stage, Step 4: no `InstallMCPServer`, and no
  hosted endpoint added to any client configuration. Either would wire a second server beside
  the plugin, bypassing its sharing, or go beyond M1's local scope. Instead it verifies the
  already-installed plugin, through `/wolfram:doctor` and one known plugin tool call.
- *Usage*: which tools are available, evaluator sessions, notebooks, `TestReport`.
- *In chat*, both skills describe the Wolfram connector and give no local commands: no
  doctor, no shell, no notebook paths. The same rule applies to the doctor command, which in
  chat loads as a skill and says it needs Claude Code or Cowork.

**Status.** The `SessionStart` hook prints cached machine facts, labelled as cached, using
seat-free discovery. It makes no claim about free seats or backends. `wolfram_status`
distinguishes observed, cached and unknown facts, and is complete without the hook.

**Budgets.**
- **One elapsed preparation deadline.** `WOLFRAM_MCP_START_TIMEOUT_SECONDS` (default 120)
  becomes a single deadline covering everything before dispatch. Today it bounds only the
  kernel handshake, while the inspection probe (`PROBE_TIMEOUT_MS`, a separate 120 s) and the
  broker's licence and environment preparation run outside it. The deadline starts when
  preparation starts and covers installation inspection, broker attach and preparation, the
  kernel handshake, and anything else before the first dispatch.
- **When the deadline passes:** the caller gets an `isError` naming the stage that ran out.
  Work owned by this session is stopped through the existing teardown. Work shared with
  another broker client, such as the broker's own licence preparation, is left to finish for
  them, and a late completion is cached as usual.
- **Back-off.** `DeferredBackend` owns it, keyed by candidate identity: binary path,
  modification time and size. A *preparation* failure, not a tool error, starts it. While it
  runs, further calls fail immediately, with the remaining wait in the message. It ends after
  10 minutes, or as soon as the binary's identity changes. `wolfram_status` reports it.
  Today's factory retries immediately after a failure; that changes.
- **On the shared path, as built (2026-10-04):** the deadline covers broker attach and the
  broker's own preparation, asked through a `ready` op that never enters the pool. Asking
  through a pool request made a session that waited for a busy slot fail its preparation and
  back off from a healthy broker. A shared kernel's handshake happens when a slot is granted,
  which the session cannot tell from slot contention, so the broker bounds each kernel start
  by the same `WOLFRAM_MCP_START_TIMEOUT_SECONDS`.
  **Accepted as an M1 limitation (D19, owner, 2026-10-04):** a cold broker can spend nearly
  the whole deadline preparing, then a fresh start timeout on the first handshake; and a
  failed shared handshake is an ordinary operation failure, so later calls start kernels again
  rather than meeting the back-off. Answering the handshake inside `ready` is not enough: a
  request that queued in a full pool of several flavours can still start a kernel later, when
  `#drain` → `#swapOut` → `#grow` replaces another flavour's released kernel, after `ready`
  has answered. The boundary is this session's first kernel start, whenever it happens, minus
  time spent queueing. The broker must also say where a failure came from — its own
  preparation (fall back to a private kernel) or a kernel of that flavour (a failed
  preparation, so back off) — either as a reply field, which needs a `BROKER_PROTOCOL` bump
  and a meaning for an absent field, or by closing its connections after its own preparation
  fails. The design belongs to M3's checkpoint.
- **After dispatch,** tool calls keep the existing evaluation ceiling unchanged.

**Facts from the serving kernel (D20, owner, 2026-10-04).** Found in acceptance: on a
machine with no cached facts, a cold start ran the one-off probe kernel and then the pool
kernel, two in a row, and the cached AgentTools version went stale when the paclet updated
itself, because facts were keyed only on the binary. The kernel command line now runs the
paclet's own `PacletSymbol` load, then writes the facts between markers, then the paclet's
own start expression, unchanged. The transport hands the marked line to the session, which
records it on every start. Until a kernel has reported, the pool's budget is 1 (the existing
reading of an unknown licence) and kernels start with the base directories they inherit,
which are what the probe would have reported from the same environment; once facts arrive,
the budget is re-derived and later kernels get the reported directories. No session, broker
or `doctor` path starts a probe kernel. Measured on 15.0.0 with only the bundled AgentTools
2.1.17 in reach: the load updated it to 2.2.0, the facts reported 2.2.0, and the server
answered `initialize`, all in one kernel.

**Validation.** `claude plugin validate` runs in its own CI job against the extracted
artifact, pinned to Claude Code 2.1.283 or later, the first version whose validator checks
both MCP entries (2.1.281) and LSP paths (2.1.283), per the manifest reference. The
validator's version is independent of the runtime client floor (§6) and neither raises nor
tests it. `npm test` stays hermetic and Node-only.

**Accepted when**, from the extracted archive away from this checkout, with no `dist/`,
source scripts or repository plugin present, on macOS (D18: Linux is tested before 1.0.0,
not in M1):

- **Discovery, the client's whole sequence.**
  - A stand-in `wolframscript` records every invocation, and the fake kernel counts starts.
  - The full sequence runs: construction, `initialize`, `notifications/initialized`,
    `tools/list`, `prompts/list` where advertised, `wolfram_status`, and the hook.
  - *No candidate:* no `wolframscript` invocation, no kernel start, no network activity. The
    list is `wolfram_status` alone, and its answer names `/wolfram:doctor`.
  - *Candidate with a warm cache:* zero kernel starts until a listed tool is called. That
    call then succeeds.
  - *Candidate with a cold, cleared, disabled or unwritable cache:* exactly one kernel start
    at `tools/list`, and none at the other steps. A listed tool then answers.
  - *Doctor's hint:* after `doctor` records an installation found only by step 7, a new
    session discovers it with no `wolframscript` invocation.
  - All of this is hermetic, against the fake kernel.
- **Budgets,** with deliberately delayed fakes on both the private and the broker
  path:
  - the total preparation deadline holds, with a slow handshake consuming it — on the broker
    path, a slow handshake meets the broker's own per-start bound instead (D19). The slow
    inspection this once listed went with the probe (D20): the broker's preparation now
    reads only caches;
  - a timeout names its stage;
  - a second call during back-off fails immediately;
  - a retry succeeds after the window (time is simulated) or after the binary changes;
  - `wolfram_status` reports the back-off;
  - a tool error after dispatch starts no back-off.
- **Selection:**
  - options absent, `false` and `true`;
  - an explicit canonical name and an explicit alias;
  - custom and mistyped names;
  - blank and unsubstituted values.

  Each resolves as specified. A fresh default install starts no LSP kernel.
- **Workflows:**
  - a tool call computes a known result;
  - `CodeInspector` reports a known lint in a fixture;
  - a notebook fixture written with `WriteNotebook` reads back with the expected content
    through `ReadNotebook`, finishes within the evaluation ceiling, and leaves no kernel or
    front-end process behind. `docs/design.md` records a paclet-side `WriteNotebook` hang;
    if a supported configuration cannot pass this, the notebook claim narrows and the failure
    is recorded.
- **Cold states:** cold default, warmed with a new connection, cleared cache, disabled cache.
  Prompts behave as §4.1 says.
- **Guidance:** missing Node (host-visible), missing kernel, unactivated kernel, and old
  paclet each produce the specified guidance.
  - Missing-kernel guidance names the right command for each launch context: plugin,
    standalone bundle outside the checkout, and clone. The named command or path actually
    runs.
  - The setup skill, run against an existing installation and against a newly activated one,
    ends with the plugin verified and no second MCP server configured in any client file.
- **Artifact:**
  - the components and versions in the archive match the template and `package.json`;
  - a version-only release candidate passes;
  - an installed version update works;
  - a bad archive digest is refused.

  These three run against real pre-releases from release-please's release branch (D24, D25),
  installed from their `archive` URL as a user would.
- **Chat:** the skills behave as specified with the connector connected, disconnected and
  absent, installed through the account route.
- **Floors** (§6): the extracted artifact runs on exactly Node 22.13.0. It is
  installed, and the M1 scenarios run, on exactly Claude Code 2.1.224. Both are recorded in
  the ledger, which moves those floors from target to tested. If 2.1.224 can't be
  exercised, the client floor stays a target and this gate stays open. The only other way to
  close it is an explicit owner decision to raise the supported floor to the version that
  *was* tested. A run on a newer client does not test 2.1.224.

**Test plan for what M1 acceptance has left** (2026-10-04). What "floor" means: the oldest
client the plugin promises to work on. 2.1.224 is not when plugins arrived — they are older —
but the documented minimum for an `archive`-source marketplace entry, the install route D14
chose. So the floor follows the install route: an older client may run the plugin perfectly
well when installed another way (a `directory` or git marketplace), and part 1 measures how
far back that holds, so the owner can decide whether to support it.

1. **Claude Code CLI floor — automated.**
   - *Isolation.* Each version is installed exactly from npm into its own prefix
     (`npm i --prefix <scratch>/cc-<v> @anthropic-ai/claude-code@<v>`), and runs with its own
     `CLAUDE_CONFIG_DIR`, so an old client never reads or rewrites `~/.claude`. It signs in
     with a long-lived token from `claude setup-token`, kept outside the repository.
   - *Install.* The extracted archive through a `directory` wrapper marketplace at project
     scope, as on 2.1.289; the `archive` source itself joins once a release exists.
   - *Scenarios,* headless (`-p`, stream-JSON and a debug log), each with its own broker
     directory and caches: the plugin, its skills, hook, MCP server and LSP server load; the
     hook's text reaches the model; the `lsp` option arrives as `false` and `true`; the cold
     cache starts one kernel and the warm one none before the first call, with prompts as
     §4.1 says; `wolfram_status`, an evaluation and `/wolfram:doctor` answer.
   - *Versions.* Exactly 2.1.224 first, which settles the stated floor. Then downward, halving
     the gap, to the oldest version that passes everything; whatever fails first there is
     recorded with the client's own words. The owner then decides the supported floor and,
     if it is below 2.1.224, the install route documented for it.
   - Kept as a script beside `test:container`, so a release can re-run it.
2. **Claude Desktop — manual.** Desktop installs a plugin by **Add →
   Upload plugin**, from the release zip itself: the plugin goes to the account's "My
   Uploads" marketplace and Desktop syncs it into each session (`~/.claude/plugins/synced/`,
   and a per-session copy under `Application Support/Claude/local-agent-mode-sessions/…/rpm/`).
   That is the install route a Desktop user takes, beside D14's `archive` marketplace entry,
   so it is the one tested here. A re-upload of the same version replaces the account's copy,
   but a session already running keeps the one it loaded. A resumed session after a
   re-upload is unreliable — after one it served the LSP, after the next only the MCP tools
   (ledger, 2026-10-04) — while a new session served the LSP; so test in a new session. In the Code tab, with its Claude Code version recorded: upload the zip;
   `/plugin` shows it enabled with no errors; `/mcp` lists the `WolframLanguage` tools; ask
   for `Expand[(x + 1)^5]`; run `/wolfram:doctor`; set the `lsp` option on and open a `.wl`
   file with a known lint; start a second session and confirm both share one kernel
   (`wolfram_status`). Record each outcome as a ledger row.
3. **Chat, through the account route — manual.** Upload the skills to claude.ai as an
   account skill, then in the states of the Wolfram connector the account allows — connected,
   disconnected, absent — ask for a computation, for setup help and for `/wolfram:doctor`. A
   connector the organisation's owner provides cannot be removed by a member, so "absent"
   may need an account without it; that connector is also not this plugin, and the automated
   tests already exclude it (they allow only the plugin's tools, and an evaluation counts only
   when the plugin's broker logged the kernel). Expected, from
   the skills' own text: no local commands, paths or slash commands are offered in chat;
   computation goes through the connector when it is connected; setup describes connecting
   it; doctor says it needs Claude Code or Cowork and stops.
4. **A newly activated installation — automated, in a container.** Claude Code on Linux in
   the Engine image, signed in with the same token, with the plugin installed:
   - *before activation:* `/wolfram:wolfram-setup` must name the kernel as not activated and
     give the activation step, and add no MCP server to any client file;
   - *after:* the same container restarted with a saved activation mounted, as though the
     user had just activated, must end with doctor answering, an evaluation verified, and
     still no second server.

   The manual part is only the activation itself, which the saved one stands in for; a
   fresh activation by someone new stays a one-off manual check.

**M1b, Cowork:** the same artifact in a Cowork session. It answers three open questions:
whether Cowork supplies Node, whether `SessionStart` fires, and which files the process sees.
Accepted when a computation works from a desktop-started process with no terminal
environment. Any file or notebook workflow claimed for Cowork performs a real filesystem
operation there, and status is useful without the hook. Supporting Cowork is then a separate
owner decision.

### MA: Agent tools across clients

**Why now.** Claude Code is one client of many, and the same tools — the MCP server, the LSP,
the skills, the session hook, `doctor` — are useful in most of them. The release pipeline already
builds two client packages from one tree (the plugin archive and the bare server), so this makes
that split explicit rather than inventing it. The research behind this section, all
from primary sources on 2026-10-05, is in A.6.

**What the research found.** MCP over stdio, Agent Skills (`SKILL.md`) and `AGENTS.md` are
nearly universal. Clients differ in four things, which are exactly what the Agent Plugins 1.0
standard leaves out: **the LSP, the session-start hook, user options and distribution**.

| | MCP stdio | LSP from a plugin | Skills | Session hook injects context | Options | Packages it reads | Install from an archive |
|---|---|---|---|---|---|---|---|
| Claude Code | yes | yes | yes | yes (plain stdout) | `userConfig` | Claude Code | yes (`archive` source) |
| Claude Desktop chat | via `.mcpb` | no | no | no | `.mcpb` `user_config` | `.mcpb` | yes |
| Codex CLI / desktop | yes, environment filtered | **no LSP at all** | yes (`.agents/skills`) | yes, after the user trusts the hook | **none** | Agent Plugins, `.codex-plugin`; Claude Code marketplace files | no (git, local, npm) |
| Cursor editor / CLI | yes | no (Open VSX extensions only) | yes | documented as JSON `additional_context`; reports say flaky | `variables` (admin-oriented) | Agent Plugins, `.cursor-plugin`; imports installed Claude Code plugins separately | no (git, local) |
| VS Code + Copilot | yes | extensions only | yes | yes | extension settings | Agent Plugins first, then Claude Code | no (git) |
| Copilot CLI | yes | **yes** (`lsp.json`, `fileExtensions`) | yes | yes | none documented | Agent Plugins first, then Claude Code | no (git, path) |
| Qwen Code | yes | yes (experimental) | yes | yes | `settings[]` | Claude Code (converted), Agent Plugins, Gemini | **yes** |
| OpenClaw | yes | yes | yes | via its own hooks; Claude hooks not run | `configSchema` | native, Claude Code, Codex, Cursor, Agent Plugins | yes (`.tgz`) |
| Hermes | yes, environment filtered | built in, custom servers | yes | not for `session:start` | own | Agent Plugins (listed), skills | no |
| Pi | yes (since 0.99.0), 60 s timeout | no | yes | via a TS extension | none | its own packages | no |
| Antigravity | yes (own config) | no | yes | **no session-start event** | undeclared | its own only | no |

**Package tiers (D28).**
- *Native:* Claude Code (today's plugin, which Claude Desktop's Code tab also installs), Codex,
  Cursor, VS Code and Copilot. Each gets its own acceptance on that client, and the manifest, hook
  contract and option mechanism it actually honours — a package of its own only where the shared
  one does not serve it.
- *No `.mcpb`:* Claude Desktop chat is a generic-package client, configured by its setup note.
- *Generic:* an Agent Plugins 1.0 directory (`plugin.json`, `skills/`, `mcp.json` with
  `${PLUGIN_ROOT}`), never combined with `.claude-plugin/` (D29), plus a one-page setup note per
  client giving its MCP config snippet, its skills path and the timeout it needs.
- *Dedicated, later:* Antigravity, a generated plugin directory in its own format, after an
  experiment on whether its sandbox reaches MCP servers.

**What the core must learn, whatever the client** (each a fix with its own failing check):
1. *A filtered environment.* Codex and Hermes pass the server only a short allow-list, so
   `XDG_RUNTIME_DIR`, `WOLFRAM_MCP_*`, `MCP_TOOL_OPTIONS` and the discovery variables vanish. A
   Codex session would then pick a different broker directory and flavour than a Claude Code
   session on the same machine — two pools against one licence. Packages declare what they need
   (Codex `env_vars`), and the broker directory must not depend on a variable a client may strip.
2. *Client tool timeouts.* Codex, Pi and OpenClaw give a tool call 60 s by default; the server
   must not promise a longer evaluation ceiling than the client will wait, and each package raises
   the client's timeout where it can.
3. *Hook contracts.* `session-status` prints plain text for Claude Code and Codex, JSON
   `additional_context` for Cursor, and nothing where no session-start event exists.
4. *Launch context and options* go through one layer (D32).
5. *The same server reached twice.* Cursor imports installed Claude Code plugins by default, and
   OpenClaw and Qwen read them too, so one machine may run our server from two clients. Both must
   share one broker, which holds when they run the same bundle bytes; packages built from one
   release must therefore carry an identical bundle.
6. *Shutdown.* Codex sends SIGTERM to the server's process group and SIGKILL after 2 s; Pi kills
   the group. The broker stays in its own group (it does today); a private kernel's cleanup fits
   in 2 s.
7. *Cursor's Linux sandbox remaps the UID to 0*, which would change the broker socket's name and
   the ownership check; prefer `CURSOR_ORIG_UID` when `CURSOR_SANDBOX` is set.
8. *MCP 2026-07-28* is stateless (`server/discover` replaces `initialize`); the cold-start design
   answers it from cache the same way. Its own item, after the restructure.

**Layout (D26).** One public repository:

```text
wolfram-agent-tools/
  src/                the core: server, broker, LSP launcher, discovery, doctor, session-status
  skills/             client-neutral skill sources, rendered per client (D30)
  clients/
    claude-code/      manifest, hooks, marketplace entry
    codex/  cursor/  vscode/      each client's manifest and hook wiring
    agent-plugins/    the generic Agent Plugins view
  clients.json        the capability matrix the build and the suite both read
  docs/               public: design, environment, releasing, decisions, per-client setup
```

`npm run release:artifacts` renders every client's package from `clients.json`, with one
identical bundle in each; the suite checks that every package carries exactly the tools its row
allows, and each client's own validator runs where one exists, as `claude plugin validate` does
now.

**Order of work.**
1. *Experiments* that would change MA, each a ledger row: Codex installing a Claude Code
   marketplace entry and our hook once trusted; Cursor's import of an installed Claude Code plugin,
   and whether its `sessionStart` injects context; Copilot honouring `userConfig`; the Agent
   Plugins precedence in VS Code; Codex's filtered environment against our broker.
2. *The restructure:* `plugin/` becomes `clients/claude-code/` and `skills/`, the launch-context
   layer lands, the Claude Code package behaves exactly as before, and every suite stays green.
3. *Clients, one at a time*, native first, each with acceptance on that client.

**Accepted when:** each native client installs its package from a release and passes the
scenarios that apply to it — the server answers, an evaluation computes, skills load, the hook
behaves as that client allows, `doctor` runs, and two clients on one machine share one broker; and
the generic package is installed and exercised on at least two clients that read it.

### MD: Downstream packages built on the bundle

**Why.** A plugin that serves its own AgentTools server — declared by a paclet's AgentTools
extension and selected as `Publisher/Server` — needs what this server already does: cold
capabilities, seat sharing, idle shutdown, a status that answers without a kernel. It should
ship our release bundle rather than fork it (D33). Nothing here changes discovery, the LSP or
the skills, and no client package is added; the downstream project owns its manifest and its
tests. MD starts after MA's restructure, and every item is a failing check first. Findings below
are *traced* in this tree on 2026-10-05 unless marked otherwise.

1. **The bundle as a contract (D33).** *Traced:* the release publishes `wolfram-mcp-server.mjs`
   (its name carries no version), `wolfram-plugin-<version>.zip` and `SHA256SUMS.txt`. The only
   build-specific content of the bundle is the version stamp, so a pre-release's bundle and its
   release's differ by it; nothing time- or commit-dependent is baked in. The zip is not
   reproducible (file times), which is why a published release is never rebuilt.
   *Work:* a check that the asset names and the sums format are what D33 states; a page, *Build
   a plugin for your own AgentTools server*, covering the environment contract of items 3 and 6,
   the status probe of item 7 and the fixture of item 8.
2. **Seats across brokers — the item where a downstream package can hurt this plugin's
   users.** *Traced:* the broker address digests the code identity (the bundle's own hash), so
   two bundles on one installation run two brokers. Each sizes its pool from the licence alone —
   `WOLFRAM_MCP_MAX_KERNELS`, else seats less `WOLFRAM_MCP_RESERVE_SEATS` — and nothing counts
   another broker's kernels, the LSP kernel, or a private kernel. The reserve does not help:
   on four seats, two brokers allow three kernels each. The licence itself cannot be overrun, so
   the starts past it fail as a kernel that exits (`Wolfram kernel error`) — or hang until the
   start timeout, which is §7's open question — and on the shared path a failed start sets no
   back-off, so each later call tries again. *Work:* decided in M3's design, where "concurrent
   package versions" and "an independent broker" are already listed; the candidates are a
   per-installation seat lease that every broker and the LSP take (a lock file in the broker
   directory), or sharing one broker between compatible bundles by keying on `BROKER_PROTOCOL`
   rather than the bundle's bytes. The second runs against *sharing may never change an answer*
   (`AGENTS.md`): a broker running other code may answer differently, so it needs its own
   argument, not just a key change.
3. **Paclet-qualified server names, end to end.** *Traced:* `resolveServerName` passes
   `Publisher/Server` through unchanged; `SERVER_NOT_FOUND` matches only `MCPServerNotFound` and
   `No MCPServerObject found for name`, so a paclet that is not installed is diagnosed only if
   the paclet's message contains one of those — and the paclet may instead try to fetch it, which
   only the start timeout bounds (*repeated*, `environment.md`). A not-found on the private path
   is a preparation failure and starts the ten-minute back-off, which ends early only when the
   installation's binary changes — installing a paclet, or creating a server of one's own, does
   not. That is a defect for today's users of their own server too, not only for downstream
   packages. *Work:* `test:custom`'s counterpart for a paclet-declared server (listed, called
   through the bundle); a fast, specific failure for a missing paclet carrying the kernel's own
   text; and a not-found that does not start the back-off. The missing-paclet message is
   reproduced on a real kernel first (§7). *Done* (#5, from a real 15.0 kernel's output for a
   paclet with no AgentTools extension): `StartMCPServer::InvalidArguments` — which a real
   kernel prints for every cause, after the cause itself — fails the start at once, pinned by the
   `.wlt` against a real kernel, and starts only a short back-off — on the shared path too,
   where the pool remembers it per kernel environment; a burst that reaches a shared broker
   before the first failure is recorded is #19. The `test:custom` counterpart
   remains.
4. **The capability cache and the declaring paclet's version.** *Traced:* the key is the kernel
   path and version, the server name, this package's version and the flavour; no paclet version
   is in it, AgentTools' included. The kernel's own `list_changed` is subscribed and relayed, so
   a running session corrects itself, but a session that starts from a stale cache serves the old
   schemas until a kernel runs. *Work:* key a paclet-declared server's entry on its paclet's
   version, read without a kernel — from the installed paclet's `PacletInfo` on disk — and fall
   back to today's key when that cannot be read.
5. **`structuredContent` and `outputSchema` intact.** *Done* (#31): this server passes tool
   definitions and results through without rebuilding them, on both paths and through the cache,
   and judges none of them — a kernel's client lists tools as a plain request, not as the SDK's
   `Client.listTools` does, whose compile of every `outputSchema` failed the whole list on one
   schema ajv refused, and whose cached validators made `Client.callTool` turn a result its
   schema refused into a protocol error. The client a session serves validates against the
   schemas relayed to it; measured, Claude Code 2.1.290 lists a server whose tool carries a
   schema ajv refuses. Checked through the private path, the broker, a warm cache and `doctor`,
   with the fake emitting both. A schema that is not `type: "object"` still fails the whole list,
   in the SDK's parse rather than ajv, and is non-conformant (#69). *Traced:* AgentTools 2.2.7
   emits neither — a tool's entry is built from five fixed keys (`createMCPToolData`,
   `Kernel/Server/Shared.wl`), and its results leave `structuredContent` out on purpose — so
   `test:custom` cannot pin this until a paclet lets a tool declare an output schema.
6. **A locked server name for packagers.** *Traced:* the server reads `MCP_SERVER_NAME` first,
   then `WOLFRAM_MCP_SERVER_NAME`, then `WOLFRAM_MCP_DEFAULT_SERVER`; the plugin sets only the
   last, so a user may override it. *Work:* document `MCP_SERVER_NAME` in a package's own
   environment as the choice for tools that must not change, and the default for tools that
   may; the conflict itself is resolved by the client's merge of plugin and user environments,
   so its check runs on a real client (`test:client`), not the hermetic suite.
7. **`wolfram_status` as a health probe.** *Traced:* always answered here, never forwarded,
   starting no kernel; free text, first line `<package> <version>`. It shows no installation,
   back-off, the licence count and busy against budget, but has no explicit *ready* or *seats
   exhausted*. *Work:* `structuredContent` with an `outputSchema` — an enumerated state (no
   installation, preparing, backing off, paclet or server missing, seats exhausted, ready) and
   the package version — with the prose unchanged beside it.
8. **The fake kernel as a fixture.** *Traced:* its tool list is fixed (knobs only add or empty
   it), and no artifact ships it. *Work:* a knob that reads a tool list from a file, and the
   fake published beside the bundle, with its header as the documentation.
9. **A caller's own ceiling.** *Traced:* nothing reads a per-request timeout or a `_meta` hint;
   the ceiling is `WOLFRAM_MCP_CALL_TIMEOUT_SECONDS`, raised (never lowered) by a call's own
   `timeConstraint`. The per-tool table rejected in `design.md` is a different thing — this
   server asserting numbers about tools — so a caller's hint is open. But a ceiling answers the
   caller and leaves the kernel running, and a kernel is serial: a short call that times out
   holds the kernel, and the calls behind it queue. *Work, lowest priority:* document that, and
   decide whether a caller's shorter ceiling is worth having given it.

**Accepted when** a downstream plugin, built from a release by checksum and serving a
paclet-declared server, passes items 3–8's checks against the bundle it pins, and M3's
allocator, or a documented bound, covers its broker.

### M2: Built-in views over one kernel

**Design checkpoint before any runtime edit.** A short design artifact that specifies:

- **Registry:**
  - the entries, and a stable reserved identifier for the plugin view, with its collision
    rule against a same-named custom server;
  - advertised capabilities and prompt aliases;
  - the policy for built-in resources, should any appear.
- **Resolution:**
  - effective base-directory precedence;
  - classification lifetime when a same-named custom server is created, edited or deleted
    while a union kernel is warm;
  - absent facts, disabled inspection, encoded and legacy names;
  - the named fallback.

  Cached classification never bypasses current override resolution.
- **Identity:** cache and execution identity inputs, offline staleness, and stated definition
  refresh limits.
- **Broker:**
  - the acknowledgement fields for the view op;
  - refused and unknown-op behaviour;
  - reconnect;
  - event projection before persistence, so no raw union tool or prompt enters a view's
    cache.
- **Caller context:** cwd and relative-file behaviour, declared environment dependencies,
  and evaluator sessions across borrowed kernels, idle restart, cancellation and reclaim. The
  design chooses this behaviour, rather than writing "documented behaviour" in a table.
- **Transcript:**
  - ownership, retention and cleanup;
  - permissions on existing directories and files;
  - separation between simultaneous kernels;
  - read-only state;
  - how a user removes logs safely.

**Checkpoint accepted when:**
- every contract above names a chosen behaviour, with nothing left as "to be decided" or
  "documented behaviour";
- the checkpoint document supplies a scenario, an oracle and an expected result for every
  chosen contract, extending the minimum acceptance list below. It includes explicit
  rows for:
  - caller context and evaluator-session lifetime across borrowing, idle restart,
    cancellation and reclaim;
  - offline definition identity;
  - the transcript: permissions on existing files, read-only state, and cleanup while
    kernels run concurrently.

  Private and broker equivalence alone is not an oracle, since both paths could share the
  same wrong behaviour;
- the stable-2.2.0 union experiment (§7) is recorded in the ledger, with every intended
  prompt called with its own arguments, so the design rests on stable evidence rather than
  the experimental 2.2.7;
- the review leaves no blocking finding open;
- the owner approves.

Roles as in §2.

**Build** (after the checkpoint). The mechanism, with its evidence in A.1:

- **Two launch modes.** *Named* is today's path, unchanged, and remains the fallback whenever
  the union shape is unsupported or unknown. *Union* starts one in-memory AgentTools server
  holding every built-in tool. A compatibility gate chooses between them, and a union
  construction failure before dispatch is kept distinct from a tool error after it.
- **Prompts under distinct names.** Inside one kernel, prompts are keyed by their exported
  name, and three built-in search prompts all export `Search`, so a plain merge serves a
  duplicate and loses two of them. The union carries each one's own data under its internal
  name (`WolframSearch`, `WolframAlphaSearch`, `WolframLanguageSearch`), and the proxy maps
  each built-in view's `Search` onto its own. The plugin view, being new, exposes the
  distinct names.
- **`Location` in state, not cache.** `"Location" -> None` validates but cannot start (the
  log path is built from it). A `File` location works, but must exist for the kernel's whole
  life, and the paclet appends every request and response to a `Log.wl` there. So it lives
  under `$XDG_STATE_HOME` (or `~/.local/state`) → `wolfram-mcp-server/servers/<digest>/`. It
  is created `0700` before every start and never touched by `clear-cache`, because the
  transcript is user code. The transcript policy comes from the checkpoint.
- **The name registry moves into the proxy,** because the kernel no longer resolves names. In
  order:
  1. A user's own server of that name wins, as in the paclet. The proxy checks for
     `Servers/<name>/Metadata.wxf` under the base directory the kernel will start with; when
     that is unknown, the name stays on the named path, and no probe is started to find out.
  2. A built-in name is a view.
  3. The reserved plugin-view identifier, arriving as `WOLFRAM_MCP_DEFAULT_SERVER`.
  4. Anything else passes through by name, and a mistyped name is still diagnosed from the
     kernel's own wording.
- **Projection and enforcement.** The proxy filters every list, event, call and get to the
  view. The broker enforces the view too, through a new, positively acknowledged op; it is not
  a frame-shape change, so `BROKER_PROTOCOL` is not bumped. This preserves the advertised
  interface; it is not a sandbox.
- **No tool depends on its server,** by construction (*traced*): tools resolve from one
  registry, no built-in server carries tool options, and nothing in the paclet's tools or
  prompts reads which server is running. Only `serverInfo.name` and the log path differ.
  The `.wlt` pins this.
- **Definition identity joins the flavour and the cache key.** Today a custom server's edited
  definition is invisible while a kernel of that name is warm (*traced*, not reproduced). It
  uses a metadata digest where a file exists, the resolved paclet version where known, and
  states its refresh limits.

**Accepted when:**
- the exact union works on stable 2.2.0, with each prompt called with its own arguments;
- two views share one kernel, each listing and invoking only its own interface;
- private and broker paths are equivalent;
- a raw broker call outside the view is refused;
- an old broker and a reconnect stay safe;
- a stale-cache override change resolves correctly;
- a delayed refresh does not acquire another kernel;
- named fallback works when the union shape is unsupported.

D7, the expanded plugin view, follows on top.

### M3: Seat allocation

**Design checkpoint before allocator implementation.** The design output specifies:

- **Scope:** which processes the allocator counts, and their states: reserved, starting,
  running and retiring. A slot is released only on confirmed process exit, not when it leaves
  the pool. Today's `#retire` removes the slot before `stop()` finishes, and that changes.
- **Saturation:** MCP and LSP are different protocols, and an LSP kernel is held for the
  session, not idle between calls. On a 2-seat licence with one reserved seat, the managed
  budget is one. If the LSP holds it, MCP must either wait (bounded), be refused clearly, or
  preempt. The design chooses a priority. The recommendation is that MCP calls preempt an
  enabled LSP's *start*, but never a running LSP, and are refused clearly when no seat can be
  had within the start budget.
- **Ownership:** owner attachment, cancellation and EOF, broker or launcher crash and
  restart. A lost lease is reconciled before any replacement starts.
- **A shared session's preparation (D19):** a session's first shared kernel start, whenever
  the pool makes it, counts against that session's preparation deadline, and its failure
  starts the back-off; time spent queueing does not count. The design says how the broker
  marks that start, and how a failure tells "broker unavailable" (fall back) from "kernel
  failed to start" (back off) across a protocol change. §5 M1, Budgets, has the findings.
- **Counted or named as exceptions:**
  - the broker's inspection probe at preparation;
  - `doctor`;
  - unknown licence limits and the existing floor;
  - overrides;
  - old brokers and concurrent package versions;
  - private fallback;
  - another installation's broker;
  - a downstream package's broker (§5 MD): its own bundle, so its own socket and its own
    budget against the same licence.

**The bound, qualified:** the participating allocator keeps its own allocations within the
budget. It cannot guarantee a free seat against unmanaged processes (Mathematica, other
editors' LSP kernels) or an independent broker.

**Checkpoint accepted when:**
- a state diagram covers reserved, starting, running and retiring, with every transition's
  trigger and its release condition (confirmed exit);
- the 2-seat starvation case is walked through under the chosen priority, step by step,
  with MCP-first and LSP-first orders;
- every process kind in the list above is marked counted or excluded, with a reason;
- crash and restart reconciliation is specified for both the broker and the launcher;
- the D19 preparation boundary is specified for every allocation path, `ready` and a
  queued request's later `#grow` included;
- a simulated-budget test plan covers the acceptance list below, and the constrained-licence
  measurement is planned separately;
- the owner approves, including the saturation priority, which is currently a
  recommendation.

Roles as in §2.

**Accepted when** managed processes stay within the budget through:
- delayed starts and delayed termination;
- MCP-first and LSP-first starts;
- multiple LSPs;
- pending cancellation;
- client or broker failure;
- fallback and override.

A simulated budget proves the arithmetic. The human's later Mathematica launch is recorded
separately, on a real constrained licence, with the fail-or-hang measurement for refused
seats. Then D3 may move the LSP to default-on, if the contract gives useful MCP and LSP
behaviour within the supported budget.

### M4: Hosted routing

**Why routing, and why one server.** The plugin declares one MCP server: ours. With a usable
local kernel it serves that kernel; with none, and hosted use enabled, it forwards to the
hosted service as an MCP client. Declaring the hosted URL as a second server instead would
show every evaluator twice whenever a kernel exists, and only Claude Code lets a user switch
one off (Appendix B). Because the plugin view contains the hosted service's three tools, the
move from hosted to local only adds tools, and interactive Claude Code picks the change up on
`list_changed`. The hosted evaluator is stateless and resource-limited, so routing is always
explicit and never switches away from a working local kernel.

**Prerequisites:** M2 and D7: the routed journey runs on the plugin view, so the
ordinary installed plugin is eligible. Also D4. Explicit
`WolframLanguage` and custom selections get a clear failure, never hosted substitution.

**Design checkpoint before routing code.** The design output specifies:

- **States and transitions, with the commitment point.** Discovery is filesystem and cache
  only. A candidate is not a backend until bounded preparation completes a handshake. A call
  is committed to one backend at dispatch, and nothing after dispatch is replayed anywhere.
  - Concurrent preparation is shared.
  - Each waiter gets a defined outcome on cancellation; one waiter never silently aborts
    another's preparation.
  - Failures back off (M1's budget).
- **The public tool contract.** Recommended: the plugin view advertises the local
  definitions; a call routes to the hosted service only for a tool whose hosted schema is
  compatible, checked against a validated snapshot before any argument is sent; an
  incompatible schema fails clearly. Hosted evaluator session identifiers never cross into
  local execution, and the transition is announced: definitions made on the hosted service do
  not exist locally.
- **Hosted cache identity:** endpoint, protocol revision, view, applicable authentication
  scope, snapshot identity and observation time. The last validated entry is kept when a
  refresh fails. Changed credentials or endpoint identity invalidate it.
- **Provenance and disclosure:**
  - Enabling hosted use states what leaves the machine.
  - `wolfram_status` shows the current backend before any call.
  - Each result carries its backend in readable text and in `_meta`, with structured output,
    protocol errors and `isError` preserved.
  - The router's hosted policy is distinct from cloud requests that local Wolfram tools make
    themselves, and the docs say so.
- **D5 stays disabled.** If it is ever approved, it is written as a named exception to the
  no-replay rule: only a classified refusal, using the measured failure contract including the
  UI and cloud-notebook options; both attempts counted and reported; proof of no evaluator
  replay and no remote attempt for any other failure.

**Checkpoint accepted when:**
- the state and transition table has a row for every acceptance scenario below, including
  what each concurrent waiter sees on cancellation;
- the tool contract is chosen, and a compatibility matrix is filled in for each tool in the
  plugin view against a recorded hosted snapshot (schemas, annotations, content types,
  session semantics, files, options, limits);
- the hosted cache identity fields and invalidation rules are fixed;
- the disclosure text for enabling hosted use is drafted;
- D4 is confirmed;
- the review leaves no blocking finding open;
- the owner approves.

Roles as in §2.

**Accepted when** these pass against a deliberately delayed fake backend:
- a no-kernel call through the installed plugin default;
- an unactivated candidate;
- a missing or old paclet;
- an invalid pin;
- an offline endpoint;
- a schema mismatch and a stale snapshot;
- a backend transition with session arguments;
- an explicit selection;
- a concurrent upgrade;
- cancellation during preparation and during execution;
- **hosted disabled,** with a cold and with a warm hosted snapshot;
- **hosted enabled with a healthy local backend:** every call stays local;
- **after dispatch:** a protocol error, an `isError` result, and a transport loss.

Connection, refresh and dispatch counters are recorded for every scenario. Each shows one
committed backend per call, zero forbidden hosted traffic, no second dispatch, and the
outcome of each concurrent waiter where there is more than one.

### P: SDK v2 evaluation

The baseline in the lockfile is the legacy `@modelcontextprotocol/sdk` **1.30.0**. Its latest
release is 1.32.0. The split v2 packages, `@modelcontextprotocol/server` and `client` 2.3.0,
implement 2026-07-28.

P is a bounded evaluation of v2 against the paclet, the hosted endpoint and target clients. It
covers discovery, change notifications, cache freshness, cancellation, and error and result
translation, and it produces a migrate or wait recommendation. It gates nothing. Any upgrade,
including a legacy 1.30 → 1.32 bump, is its own change with checks.

### M5: Distribution

Publishes milestones accepted for the selected support scope, from the reviewed release tag,
by the M1 publication order. Each route follows its own decision:
- the public marketplace entry (D2);
- a directory submission (D9: reviewer environment, plugin-folder README and licence, support
  and privacy information, holds accepted);
- the upstream proposal (D10).

M1's acceptance uses a private or local test marketplace, so M5 is not a prerequisite for it.

**The 1.0.0 gate (D18).** No release is numbered 1.0.0 until every environment §6 lists as
supported has a ledger row from the release candidate: each OS, Node at its floor and newest,
the client at its floor, and the kernel and AgentTools at theirs.

---

## 6. Support policy and evidence

**Intended support**, the policy, separate from what has been run:

A floor is **tested** only when a ledger row exercises it *at* the floor version. Until then
it is a **target**, with its source named. M1's acceptance includes running at each floor.

| | M1 support | Source | Status |
|---|---|---|---|
| OS | macOS, Linux x86_64 | Repository scope (`plan.md` §9) | macOS re-recorded in M1. Linux tested before the plugin work; re-recorded before 1.0.0 (D18) |
| Node | 22.13.0 or later, for runtime and toolchain | ESLint 10.9.1's engines field in the lockfile; Node's supported lines | Target. M1 runs the extracted artifact on exactly 22.13.0 |
| Client | Claude Code 2.1.75 or later (D22); 2.1.224 or later to install from the release archive | 2.1.75 is the first client that accepts the manifest's `userConfig`; 2.1.224 is the documented minimum for `archive` plugin sources | **Tested 2026-10-04:** the client scenarios pass on exactly 2.1.75 and 2.1.224 and fail on 2.1.74, which rejects the manifest (ledger). The `archive` route itself waits for a release |
| Kernel | Wolfram 14.3 or later, activated | The engine's discovery floor | 14.3.0 contract-tested on Linux with AgentTools 2.2.0 (`plan.md` §9). Tested in M0: all three real-kernel suites on exactly 14.3.0 with 2.2.0, on macOS (ledger) |
| AgentTools | Stable 2.2.0, as auto-installed | Paclet server, `PacletFindRemote` | Tested in M0: all three real-kernel suites on 15.0.0 with 2.2.0 resolved (ledger). 2.2.7 is experimental, evidence only |
| Install route | The release archive through an `archive`-source marketplace | D14 | Exercised in M1 |
| Surfaces | Claude Code. Cowork via M1b. Chat as skills only | D1 | Exercised in M1 and M1b |

**Evidence ledger:** one row per run, kept as a history, never edited into a policy. Its
columns:

- date
- build: the commit, or the artifact and its digest
- OS
- Node and client versions
- kernel and resolved AgentTools versions
- install route
- configuration (relevant variables and options)
- scenario
- result

Rows are appended to the table below. A row's raw output goes in the description of the pull
request that adds it.

| Date | Build | OS | Node, client | Kernel, AgentTools | Install route | Configuration | Scenario | Result |
|---|---|---|---|---|---|---|---|---|
| 2026-10-03 | source | macOS 15.7.7 arm64 | Node 22.23.2; no client | none (fake kernel) | source clone | defaults | `npm test`, hermetic | pass, all checks |
| 2026-10-03 | source | macOS 15.7.7 arm64 | Node 22.23.2; no client | 15.0.0; 2.2.0 resolved, 2.2.7 disabled for the run | source clone | defaults | `npm run test:wl` | pass, 19 of 19 |
| 2026-10-03 | source | macOS 15.7.7 arm64 | Node 22.23.2; SDK client in the script | 15.0.0; 2.2.0 resolved, 2.2.7 disabled for the run | source clone | `WOLFRAM_MCP_SHARE=0`, private cache | `npm run test:custom`, including the probe's generated version (`15.0.0`) | pass |
| 2026-10-03 | source | macOS 15.7.7 arm64 | Node 22.23.2; LSP client in the script | 15.0.0; LSPServer (AgentTools not involved) | source clone | defaults | `npm run test:lsp` | pass |
| 2026-10-03 | source | macOS 15.7.7 arm64 | Node 22.23.2; no client | 14.3.0; 2.2.0 resolved (2.2.7 needs 15.0+) | source clone | `WOLFRAMSCRIPT_KERNELPATH` = 14.3.0's `WolframKernel` | `npm run test:wl` | pass, 19 of 19 |
| 2026-10-03 | source | macOS 15.7.7 arm64 | Node 22.23.2; SDK client in the script | 14.3.0; 2.2.0 resolved | source clone | as above, plus `WOLFRAM_MCP_SHARE=0`, private cache | `npm run test:custom`, writer and server on the same kernel, probe version `14.3.0` | pass. Before a fix made the same day, the server ran on 15.0.0 regardless of the pin |
| 2026-10-03 | source | macOS 15.7.7 arm64 | Node 22.23.2; LSP client in the script | 14.3.0 (selected via `WOLFRAMSCRIPT_KERNELPATH`, logged); LSPServer | source clone | as above | `npm run test:lsp` | pass |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.289, headless (`-p`) | 15.0.0; AgentTools 2.2.7 installed | extracted archive, `directory` wrapper marketplace, project scope | none | archive contents against `release/plugin/`, the template and `package.json` | pass: template plus `LICENSE` and the bundle, identical manifest, the version in `package.json`, no `dist/` or source scripts |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.289, headless (`-p`) | 15.0.0; AgentTools 2.2.7 installed | extracted archive, `directory` wrapper marketplace, project scope | `lsp` option unset | what `${user_config.lsp}` becomes; `.wl` file opened | pass: arrives as `false`; no capabilities served, no kernel started |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.289, headless (`-p`) | 15.0.0; AgentTools 2.2.7 installed | extracted archive, `directory` wrapper marketplace, project scope | `lsp` = true (`plugin configure`) | the same | pass: arrives as `true`; LSPServer on 15.0.0, hover and an `UnusedVariable` diagnostic; kernel gone after the session |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.289, headless (`-p`) | 15.0.0; AgentTools 2.2.7 installed | extracted archive, `directory` wrapper marketplace, project scope | defaults | `session-status` hook output in context | pass: three status lines reach the model verbatim |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.289, headless (`-p`) | 15.0.0; AgentTools 2.2.7 installed | extracted archive, `directory` wrapper marketplace, project scope | isolated `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME`, `WOLFRAM_MCP_LOG`, both caches empty | cold default: `wolfram_status` | pass, with a finding: `hasPrompts:false`; two sequential kernel starts, the installation probe (7.2 s) then the pool kernel for the tool list (2.0 s). §1 says one; the probe runs once per binary, and again after `clear-cache` |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.289, headless (`-p`) | 15.0.0; AgentTools 2.2.7 installed | extracted archive, `directory` wrapper marketplace, project scope | isolated `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME`, `WOLFRAM_MCP_LOG`, warm, new connection | evaluation, `CodeInspector`, `WriteNotebook` → `ReadNotebook` | pass: `hasPrompts:true`; no kernel until the first tool call; `2^100 + PrimePi[10^6]` correct; notebook written in 4 s with Title and Input cells, read back; no Wolfram process left after the broker exited |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.289, headless (`-p`) | 15.0.0; AgentTools 2.2.7 installed | extracted archive, `directory` wrapper marketplace, project scope | isolated `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME`, `WOLFRAM_MCP_LOG`, warm | `/wolfram:doctor`; `CodeInspector` on a `DuplicateClauses` fixture | pass: exit 0, report complete; both lints reported. A `Scoping` lint is excluded by the tool's defaults, so it is not a fixture |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.289, headless (`-p`) | 15.0.0; AgentTools 2.2.7 installed | extracted archive, `directory` wrapper marketplace, project scope | isolated `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME`, `WOLFRAM_MCP_LOG`, after `clear-cache` | cleared cache: `wolfram_status` | pass: `hasPrompts:false`; probe then one pool kernel, as the cold default |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.289, headless (`-p`) | 15.0.0; AgentTools 2.2.7 installed | extracted archive, `directory` wrapper marketplace, project scope | isolated `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME`, `WOLFRAM_MCP_LOG`, `WOLFRAM_MCP_CACHE=0` | disabled cache: `wolfram_status` | pass: `hasPrompts:false`; one kernel, tool list in memory |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.289, headless | 15.0.0; AgentTools 2.2.7 installed (all filtered) | extracted archive, `directory` wrapper marketplace, project scope | isolated `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME`, `WOLFRAM_MCP_MIN_VERSION=9999` | missing kernel, plugin: hook, `wolfram_status`, the named command | pass: both name `/wolfram:doctor`; it runs, exit 1, with the reason |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; raw JSON-RPC driver | 15.0.0; AgentTools 2.2.7 installed (all filtered) | bundle copied outside the checkout | isolated `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME`, `WOLFRAM_MCP_MIN_VERSION=9999` | missing kernel, standalone bundle | pass: names `node "<bundle>" doctor`; it runs, exit 1 |
| 2026-10-04 | source | macOS 15.7.7 arm64 | Node 22.23.3; raw JSON-RPC driver | 15.0.0; AgentTools 2.2.7 installed (all filtered) | source clone | isolated `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME`, `WOLFRAM_MCP_MIN_VERSION=9999` | missing kernel, clone | pass: names `npm run doctor, in <repo>`; it runs, exit 1 |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; raw JSON-RPC driver | 15.0.0, no `mathpass` in its user base | bundle copied outside the checkout | isolated `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME`, `WOLFRAM_USERBASE` empty | unactivated kernel: a call, then `doctor` | fail, since fixed: the kernel exits 70 at once with `No valid password found.`, not waiting for credentials; nothing said "not activated" |
| 2026-10-04 | bundle, with the fix | macOS 15.7.7 arm64 | Node 22.23.3; raw JSON-RPC driver | as above | bundle copied outside the checkout | as above | the same, after the fix | pass: the call names the kernel as not activated and how to activate it, on the shared path |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node absent from `PATH`; Claude Code 2.1.289, headless | 15.0.0; AgentTools 2.2.7 installed | extracted archive, `directory` wrapper marketplace, project scope | isolated `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME` | missing Node, as the host shows it | fail, since fixed in the README and setup skill: server `failed`, hook exit 127, nothing in context; the client's log names an executable "stdio"; the failure is cached for 15 min in `~/.claude/mcp-needs-auth-cache.json` by server name, so a session after Node returns still skips the server |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; raw JSON-RPC driver | 15.0.0; only the bundled AgentTools 2.1.17 in reach | bundle copied outside the checkout | isolated `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME`, fresh `WOLFRAM_USERBASE` with activation | old paclet: the 15.0.0 layout's own AgentTools | pass, with a finding: the first start updated AgentTools to 2.2.0 itself (first `tools/list` 36.8 s), then evaluated; the facts keep the probe's 2.1.17 until the binary changes. An offline machine, which would serve 2.1.17, is untested |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; raw JSON-RPC driver | 14.2.1, below the floor | bundle copied outside the checkout | isolated `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME`, `WOLFRAM_MCP_KERNEL` pinned, start timeout 30 s | an unsupported kernel named explicitly (not an old paclet) | as designed: `Get::noopen` and the start-timeout message naming the cause; every call waits the full timeout on the shared path (D19) |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.289, headless | 15.0.0; AgentTools 2.2.7 | extracted archive, `directory` wrapper marketplace, project scope | isolated `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME`, `WOLFRAM_MCP_LOG`; both caches empty | cold default after D20, twice | pass: one kernel start, which reported the facts 2.8 s in and raised the pool budget from 1 to 4; ready in 2.9 s. The first of the two runs took 21.7 s to ready, right after the archive was rebuilt, and did not reproduce |
| 2026-10-04 | source | macOS 15.7.7 arm64 | Node 22.23.3; raw driver | 15.0.0; AgentTools 2.2.7 | source clone | real user base | kernel start time, paclet command line against D20's | about 1.1 s added: `initialize` at 1.8 to 2.0 s plain, 3.0 to 3.3 s with the facts |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; no client | 15.0.0; AgentTools 2.2.7 | extracted archive's bundle | empty cache | `doctor` after D20 | pass: exit 0, one kernel, facts printed from it |
| 2026-10-04 | source | macOS 15.7.7 arm64 | Node 22.23.3; no client | 15.0.0; 2.2.7 resolved | source clone | defaults | `npm run test:wl`, `npm run test:custom` | pass, 19 of 19; pass |
| 2026-10-04 | bundle | Ubuntu 24.04 amd64 container (`wolframresearch/wolframengine:15.0.0`), under Rosetta on macOS arm64 | Node 22.13.0 (floor); raw driver | Engine 15.0, unactivated | bundle mounted alone | own `XDG_RUNTIME_DIR` (sharing on) | unactivated kernel: list, call, `doctor` | pass: fails in 1.6 s naming the kernel as not activated; next call retried and fails as fast (D19); doctor exit 1 says so; no kernel left. First run found the back-off's "try again..", since fixed |
| 2026-10-04 | bundle | Ubuntu 24.04 amd64 container (`ubuntu:24.04`), under Rosetta on macOS arm64 | Node 22.13.0 (floor); raw driver | none | bundle mounted alone | own `XDG_RUNTIME_DIR` (sharing on) | no Wolfram installed: list, `wolfram_status`, `doctor` | pass: `wolfram_status` alone, names `node "<bundle>" doctor`, which exits 1. First run found doctor's macOS-only example path and floor-first wording, since fixed |
| 2026-10-04 | bundle | Ubuntu 24.04 amd64 container (`node:20-slim`, Node 20.20.2 in place of the floor), under Rosetta on macOS arm64 | Node 22.13.0 (floor); raw driver | none | bundle mounted alone | own `XDG_RUNTIME_DIR` (sharing on) | Node below the floor | pass: server and doctor say they need Node 22.13 or newer, exit 1 |
| 2026-10-04 | bundle | Ubuntu 24.04 amd64 container (`wolframresearch/wolframengine:15.0.0`), under Rosetta on macOS arm64 | Node 22.13.0 (floor); raw driver | Engine 15.0 | bundle mounted alone | own `XDG_RUNTIME_DIR` (sharing on) | sharing without `XDG_RUNTIME_DIR` | finding: the server declines to share through root-owned `/tmp` and every session takes a private kernel, so on a headless Linux host or container sharing is off unless `XDG_RUNTIME_DIR` is set. Owner decision pending |
| 2026-10-04 | bundle | Ubuntu 24.04 amd64 container (`wolframresearch/wolframengine:15.0.0`), under Rosetta on macOS arm64 | Node 22.13.0 (floor); raw driver | Engine 15.0; AgentTools 2.2.0 | bundle mounted alone | on-demand licence entitlement (2 kernels), own `XDG_RUNTIME_DIR` | licensed: cold list, evaluation, `CodeInspector`, notebook round trip, `doctor`, nothing left | pass: one kernel start, which reported a 2-seat licence; `2^100 + PrimePi[10^6]` correct; both lints; notebook read back; doctor exit 0; the running kernel gone 61 s after the last session |
| 2026-10-04 | bundle | Ubuntu 24.04 amd64 containers, under Rosetta on macOS arm64 | Node 22.13.0 (floor); raw driver | Engine 15.0; AgentTools 2.2.0 when licensed | bundle mounted alone | licensed by a saved node-locked activation (pinned `/etc/machine-id` and hostname, uid 999), 2 processes; unactivated scenario without `XDG_RUNTIME_DIR` | `npm run test:container`, every scenario | pass, 18 checks: unactivated (and shared through the cache's private `run/`), no Wolfram, Node 20, licensed workflows with one cold kernel and none left |
| 2026-10-04 | bundle | Ubuntu 24.04 amd64 container, `--network none`, under Rosetta on macOS arm64 | Node 22.13.0 (floor); raw driver | Engine 15.0; only the bundled AgentTools 2.1.17 in reach | bundle mounted alone | saved node-locked activation, no network | offline old paclet: list, evaluate, status | pass: serves on 2.1.17, `Expand[(x + 1)^5]` correct, and the kernel reports 2.1.17 as the version serving |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.289, headless | 15.0.0 selected of seven installed (15.1.0, 14.3.0 also usable); AgentTools 2.2.7 | extracted archive, `directory` wrapper marketplace, project scope | isolated `XDG_RUNTIME_DIR`, `WOLFRAM_MCP_LOG` | `/wolfram:wolfram-setup` against an existing installation | pass: every step reported, doctor ran, `Expand[(x + 1)^5]` verified, setup complete; it named the unused newer 15.1.0 and how to select it. No MCP server added to any client file: no `.mcp.json`, no Wolfram entry under any `mcpServers` in `~/.claude.json`; its only actions were doctor and one evaluation |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Node 22.23.3; **Claude Code 2.1.224**, exactly, from npm, headless | 15.0.0; AgentTools 2.2.7 | extracted archive by `--plugin-dir`; test config directory signed in by the owner | own broker directory, caches and log per session | `npm run test:client -- 2.1.224` | pass, 7 checks: signed in, `wolfram_status`, hook text in context, evaluation, one kernel across cold and warm sessions, no LSP kernel with the option unset, `/wolfram:doctor` exit 0. The client floor is tested |
| 2026-10-04 | — | macOS 15.7.7 arm64 | Claude Code 2.0.0 … 2.1.224, help output only | — | — | — | where plugin support begins, bisected on `--help` | `plugin` and `marketplace` commands first in 2.0.12 (absent in 2.0.11); `--plugin-dir` first in 2.0.25 (absent in 2.0.24) |
| 2026-10-04 | as above | macOS 15.7.7 arm64 | Claude Code 2.0.25, exactly | 15.0.0 | `--plugin-dir` | as above | `npm run test:client -- 2.0.25` | fail, before the harness fixes; superseded by the rows below |
| 2026-10-04 | source, harness fixed | macOS 15.7.7 arm64 | Claude Code 2.1.74, exactly | 15.0.0 | `--plugin-dir` | test clients stripped of the parent session's `CLAUDE*` variables | `npm run test:client -- 2.1.74` | **fail: the client rejects the manifest** — `Validation errors: Unrecognized key: "userConfig"` — and loads none of the plugin; the model answered with the account's own Wolfram connector. Earlier runs of 2.1.45–2.1.74 had refused to start inside the agent's session ("cannot be launched inside another Claude Code session"), a harness fault, now fixed |
| 2026-10-04 | source, harness fixed | macOS 15.7.7 arm64 | Claude Code 2.0.25 … 2.1.224, bisected | 15.0.0 | `--plugin-dir` | as above | the manifest as shipped | everything passes from **2.1.75**; every older client rejects `userConfig` |
| 2026-10-04 | source, harness fixed | macOS 15.7.7 arm64 | Claude Code 2.0.25 … 2.1.74, bisected | 15.0.0 | `--plugin-dir` | as above, `WMCP_STRIP_USERCONFIG=1` (the manifest without `userConfig`, an experiment) | how far back the rest works | everything passes from **2.0.77**; 2.0.57–2.0.76 serve the MCP tools, evaluate and share one kernel, but the SessionStart hook's text does not reach a headless session, and the harness's Bash allow-rule does not match there (doctor needed approval) |
| 2026-10-04 | source, with the per-session kernel check | macOS 15.7.7 arm64 | Claude Code **2.1.75** and **2.1.224**, exactly | 15.0.0; AgentTools 2.2.7 | `--plugin-dir` | as above | `npm run test:client -- 2.1.75 2.1.224`, the corrected harness | pass, 8 checks each: manifest accepted and loaded, `wolfram_status`, the hook's own text, evaluation, one kernel for the cold session and none for the warm, no LSP kernel unset, doctor's own startup line. `plugin validate` passes at 2.1.75 (exit 0) and fails at 2.1.74 (exit 1, `userConfig`) |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Claude Desktop, Cowork; versions not recorded | 15.0.0 | as installed by the owner | defaults | M1b, Cowork: a session using the plugin | owner-reported pass: Cowork started the plugin's MCP server and used its tools and skills. Not yet recorded: the client version, whether `SessionStart` fired, and a file workflow (M1b's other questions) |
| 2026-10-04 | plugin archive, synced upload ("My Uploads") | macOS 15.7.7 arm64 | Claude Desktop 2.19675.0 (2026-09-30) Code tab, Claude Code **2.1.286** (`claude-desktop`) | 15.0.0; AgentTools 2.2.7 | uploaded to the account, synced by Desktop | `lsp` option never set | owner-run: every plugin tool, skills, notebook round trip, LSP | MCP tools, skills and notebooks pass; **LSP fail**: "No LSP server available for file type: .wl". Reproduced on the command line with the same copy and client: `1 error(s) loading LSP servers from plugin: wolfram`, and the LSP server loads once its entry no longer names `${user_config.lsp}` |
| 2026-10-04 | from the D23 change | macOS 15.7.7 arm64 | Claude Code 2.1.75 and 2.1.286, exactly | 15.0.0 | `--plugin-dir`, no option stored | defaults | `npm run test:client -- 2.1.75 2.1.286` | pass, 8 checks each: the LSP server loads with no option stored and answers a hover, besides the MCP, hook, kernel and doctor checks |
| 2026-10-04 | from the D23 change | macOS 15.7.7 arm64 | Claude Code 2.1.289 | 15.0.0 | extracted archive, `directory` marketplace, project scope | `lsp` option set false (user settings restored after) | the option reaching the LSP server | pass: the SessionStart hook wrote `false` to the plugin's data directory; the LSP server logged "the plugin's lsp option=false: serving no capabilities, starting no kernel" |
| 2026-10-04 | plugin archive, re-uploaded | macOS 15.7.7 arm64 | Claude Desktop 2.19675.0 Code tab, Claude Code 2.1.286 | 15.0.0 | Desktop's Upload plugin, a new session | `lsp` option never set (on by default) | owner-run: every LSP operation on a package | pass for documentSymbol, hover (built-in and user function), goToDefinition, findReferences and diagnostics after edits; **fail**: `workspaceSymbol` and `prepareCallHierarchy` each crashed the server (exit 1, "connection got disposed"). Reproduced on the real paclet: LSPServer has no handler for a request it never advertised and exits on "Internal assert 4 failed … KERNEL IS EXITING HARD" |
| 2026-10-04 | bundle with the launcher guard | macOS 15.7.7 arm64 | Node 22.23.3; LSP driven directly, then `npm run test:lsp` | 15.0.0; LSPServer | the bundle's `lsp` subcommand | `WOLFRAM_MCP_LSP=1` | unadvertised requests | pass: `workspace/symbol` and `prepareCallHierarchy` answered -32601 by the launcher, a hover after them answered, clean exit; `test:lsp` 7 checks, the new one pinning it against the real paclet |
| 2026-10-04 | plugin archive, re-uploaded | macOS 15.7.7 arm64 | Claude Desktop 2.19675.0 Code tab, Claude Code 2.1.286 | 15.0.0; LSPServer | Desktop's Upload plugin | defaults (LSP on) | owner-run: the requests that crashed it | pass: `workspace/symbol`, `prepareCallHierarchy`, `implementation` and an unknown method answered -32601, a hover after them answered, clean exit. Afterwards the same session, resumed, had the MCP tools but "No LSP server available" — see the next row |
| 2026-10-04 | as above | macOS 15.7.7 arm64 | Claude Desktop 2.19675.0, Claude Code 2.1.286 | 15.0.0 | Desktop's Upload plugin, re-uploaded twice into one session | defaults | **open**: a resumed session after a re-upload | Transcript and Desktop log: after the first re-upload (old plugin removed 19:35, reconnected on resume 19:41) the LSP served at 19:42; after the second (removed 19:52:39, "Set plugin enabled=true … wolfram@local-desktop-app-uploads" 19:52:55, reconnected on resume 19:53:48) the MCP tools came back but the LSP did not, at 19:54. That marketplace's manifest lists no plugins and its data directory is empty. The same build loads its LSP in Claude Code 2.1.286 from the command line (`npm run test:client -- 2.1.286`, 8 checks). A new session then served the LSP (next row), so the failure belongs to resuming a session after a re-upload |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Claude Desktop 2.19675.0 Code tab, Claude Code 2.1.286, a new session | 15.0.0; LSPServer | Desktop's Upload plugin | defaults (LSP on) | owner-run LSP review on `.wl`, `.wlt`, `.m` files | pass: documentSymbol, hover on built-ins and user functions, goToDefinition, findReferences, diagnostics and their refresh after an edit; workspaceSymbol, goToImplementation and call hierarchy answered "not supported" with the server staying up. **Found**: the launcher passed `-nostartuppackets`, a misspelling the kernel ignores, where Wolfram's own extension passes `-nostartuppaclets` — fixed with checks in the suite and `test:lsp`. Upstream or client behaviour, recorded only: requests during startup are rejected by the client, not queued; LSPServer resolves nothing across files; hover on `VerificationTest` says "No function information." (LSPServer's `Hover.wl`) |
| 2026-10-04 | bundle; LSPServer started directly | macOS 15.7.7 arm64 | Node 22.23.3; a raw LSP driver | 15.0.0; LSPServer in the layout | — | as shipped, and with its idle poll rewritten | LSP speed | start-up 2.4–2.5 s to `initialize` (mostly the kernel), first diagnostics ~2.8 s; warm requests ~104 ms (`documentSymbol`, `definition`), ~115 ms (`hover`), ~145 ms (`completion`), first of each kind ~300 ms. Cause: LSPServer's stdio loop polls an empty queue with `Pause[0.1]` (`Kernel/StdIO.wl:306`). Rewriting only that call in `LSPServer`readEvalWriteLoop`'s definitions to `Pause[0.01]` measured ~12 ms, ~21 ms and ~13 ms, at ~1.5% of a core idle against ~0.5%. **Owner decided 2026-10-04: neither this nor answering `initialize` from cached capabilities for now**; the poll is an upstream proposal for LSPServer (D10) |
| 2026-10-04 | plugin archive | macOS 15.7.7 arm64 | Claude Desktop 2.19675.0 Code tab, Claude Code 2.1.286 | 15.0.0; AgentTools 2.2.7 | Desktop's Upload plugin | defaults | owner-run review of every MCP tool, the notebooks, the three skills and sharing | pass: all 8 tools and 3 skills work, and two sessions shared one kernel. **Found and fixed**, each with a check that failed first: the language skill did not say that session definitions live in ``Sessions`<id>` `` (`SymbolDefinition` needs the full name) or that CodeInspector's default hides Scoping issues; `wolfram_status` could not show sharing; doctor marked a normal broker attach "!"; a clone's broker served the installed release of the same version. Upstream or client, recorded only: `SymbolDefinition` has no `session` argument; CodeInspector's defaults, a false "unused parameter" in a file with a syntax error, and differing location formats; a time-limited evaluation returns `Failure[...]` in a successful result; ReadNotebook's markdown differs in form from what was written; Desktop rewrites skill descriptions in its per-session copy |
| 2026-10-04 | bundle and plugin archive | Ubuntu 24.04 amd64 containers, under Rosetta on macOS arm64 | Node 22.13.0 (floor); Claude Code **2.1.224** for Linux, signed in by the owner | Engine 15.0 | `--plugin-dir` in the container | unactivated, then the saved activation mounted | `/wolfram:wolfram-setup` on a newly activated installation | pass, 4 checks: before activation it names the kernel as not activated and gives `wolframscript -activate`; after, it ends verified; neither adds a Wolfram server to any client file |
| 2026-10-04 | as above | as above | Node 22.13.0 (floor) | Engine 15.0 | bundle mounted alone | saved node-locked activation | `npm run test:container`, every scenario | pass, 24 checks |
| 2026-10-06 | `release` branch at `63e4628`, made by `advance` from v0.1.2's verified `wolfram-plugin-0.1.2.zip` | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.290 | none started (the session ended at sign-in) | the `release` branch's marketplace, from a project's `.claude/settings.json` alone (D34) | fresh `CLAUDE_CONFIG_DIR`, not signed in; folder trusted through `hasTrustDialogAccepted`; `CLAUDE_CODE_SYNC_PLUGIN_INSTALL=1` | #7's first half: `"ref": "release"` with `autoUpdate`, then a pin at `"ref": "wolfram--v0.1.2"`, each in a new project, through `claude -p` with `stream-json` | pass: both registered `wolfram-agent-tools` (`@release`, `@wolfram--v0.1.2`) and loaded `wolfram@wolfram-agent-tools` 0.1.2 from the cache, with `plugin:wolfram:WolframLanguage` starting, and no install step. The update half, a later release arriving with no edit, waits for 0.1.3. The 2.1.75 floor is unmeasured for this route |
| 2026-10-06 | `release` branch at `c42d315`, moved by `advance` to v0.1.3 (`wolfram--v0.1.3`) under the branch and tag rulesets | macOS 15.7.7 arm64 | Node 22.23.3; Claude Code 2.1.290 | none started (the session ended at sign-in) | the project from the row above, following `"ref": "release"` with `autoUpdate`, untouched since | as above | #7's second half: after v0.1.3's release run, a headless session; then `claude plugin marketplace update wolfram-agent-tools`, the refresh the auto-update pass makes, and another | pass, with one link left: `known_marketplaces.json` recorded the project's `autoUpdate: true`; a headless session kept 0.1.2, since the auto-update pass runs only in interactive sessions; after the refresh, the next session loaded 0.1.3 with no edit or install, 0.1.2's copy kept beside it. Claude Code triggering that refresh itself, in an interactive session, is unobserved |

**Established so far,** with sources in Appendix A:
- the union starts and serves on 15.0.0 with 2.2.7 (*reproduced*, twice);
- distinctly named prompts resolve separately (*reproduced*);
- shared tool definitions are identical across built-in servers (*reproduced*);
- the Linux contract passed on 14.3.0 with 2.2.0 (`plan.md` §9).

---

## 7. Open questions

Each has a responsible role, an experiment and output, and the gate it affects. An
unanswered question about an optional feature does not block M1.

| Question | Role | Experiment and output | Gate |
|---|---|---|---|
| Does Cowork supply Node, fire `SessionStart`, see the expected files? | Maintainer | Install the artifact in Cowork; ledger rows | M1b |
| Does saved `userConfig` interpolate into the launcher's environment as specified? | Maintainer | Each option state in Claude Code; ledger rows | M1 |
| The union with every intended prompt on stable 2.2.0 | Maintainer | Real kernel, 2.2.7 disabled; ledger rows | M2 |
| Does a refused seat fail or hang? | Maintainer, with a constrained licence | Start one kernel past the limit; recorded output | M3 |
| What does a kernel say for a `Publisher/Server` whose paclet is not installed — an error, or a fetch? | Maintainer | Real kernel, the paclet absent, online and offline; recorded output | MD item 3 |
| Does AgentTools 2.2.7 emit `outputSchema` or `structuredContent`? | Maintainer | Real kernel, `tools/list` and a call; recorded output | MD item 5 |
| The signed-out `WolframAlpha` error, and whether it precedes side effects | Maintainer | Real kernel signed out, with the UI and notebook options | D5 |
| A seat-free activation check | Maintainer | `mathpass` against an activated and a deactivated Engine | M1 guidance quality (optional) |

---

## 8. Where the work stands

**Built** (Build approval given 2026-10-03, D1): M0 in full, then M1 as specified in §5. That
includes:
- seat-free discovery, with `doctor`'s discovery hint;
- the session tool-list rules;
- selection precedence and the LSP option;
- the single preparation deadline and back-off;
- the template and assembled tree;
- launch-context diagnostics;
- the skills (setup replacing upstream's client wiring), the hook and the doctor command;
- the validation job;
- M0's facts-cache repair.

**What closes it:** M0's and M1's acceptance, recorded in the ledger. What M1 has left: the
`archive` install, update and bad-digest rows against real releases; the chat checklist; M1b's
client version, `SessionStart` and file workflow. Two findings are open: a resumed Claude
Desktop session after a re-upload may lose the LSP (a new session serves it), and an on-demand
licence entitlement's lease has been measured outliving a clean kernel exit by about an hour,
cause not yet found. M1b may run alongside as an experiment.

**Next:** MA's experiments, then its restructure (§5 MA).

**What returns for design review:**
- any change to flavour, cache identity or broker binding (M2);
- any allocator change, or LSP default-on (M3);
- any hosted traffic (M4);
- D5;
- any SDK change beyond P's evaluation;
- any publication (M5).

Accepted review feedback and finished prototypes are not permission to publish.

---

## Appendix A. Evidence

### A.1 The paclet

- **Versions** (*reproduced* with `PacletFindRemote`, and on disk). The paclet
  server auto-installs **2.2.0, `WolframVersion 14.3+`**. 2.2.7 is the release tagged
  `experimental` on [AgentTools' GitHub releases](https://github.com/WolframResearch/AgentTools/releases),
  served by no paclet site, installed here by hand, declaring `15.0+`. `Wolfram.app` bundles
  2.1.17.
- **Tool names** (*traced*, `Kernel/DefaultServers.wl` in 2.1.17, 2.2.0 and 2.2.7, identical):
  `Wolfram` = `WolframContext`, `WolframLanguageEvaluator`, `WolframAlpha`;
  `WolframLanguage` = `WolframLanguageContext`, `WolframLanguageEvaluator`, `ReadNotebook`,
  `WriteNotebook`, `SymbolDefinition`, `CodeInspector`, `TestReport`. `WolframAlpha` and
  `WolframPacletDevelopment` complete the four built-ins.
  `WolframPacletDevelopment` adds six of its own to `WolframLanguage`'s seven:
  `CreateSymbolDoc`, `EditSymbolDoc`, `EditSymbolDocExamples`, `CheckPaclet`, `BuildPaclet`,
  `SubmitPaclet`.
- **Shared definitions** (*reproduced* 2026-10-02, and again independently, 2.2.7):
  each of the eight tool names present in more than one built-in server has an identical
  `MCPToolDefinition` in each.
- **Prompts** (*reproduced*): `Wolfram` → `WolframSearch`, `WolframAlpha` →
  `WolframAlphaSearch`, `WolframLanguage` and `WolframPacletDevelopment` →
  `WolframLanguageSearch` and `Notebook`. The three search prompts are all exported as
  `Search`. Merged in one object, `prompts/list` returns the duplicate and `prompts/get`
  reaches only the last (`makePromptLookup` keys on the exported name, `Server/Shared.wl`).
  The object reads prompts through the `PromptNames` and `PromptData` properties;
  `["Prompts"]` is not one.
- **Prompts under distinct names** (*reproduced* 2026-10-03, scratch kernel, 15.0.0, 2.2.7).
  `validateMCPPrompt` accepts an Association (`MCPServerObject.wl`), and
  `Wolfram`AgentTools`$DefaultMCPPrompts` is public. A union object whose `MCPPrompts` are
  `<|$DefaultMCPPrompts[k], "Name" -> k|>` for the three search prompts, plus `"Notebook"`,
  started; `prompts/list` answered `WolframSearch`, `WolframAlphaSearch`,
  `WolframLanguageSearch`, `Notebook`; `prompts/get` returned each search prompt's own
  content; the evaluator still answered; stdout carried frames only.
- **In-memory servers** (*traced*, `MCPServerObject.wl`; *reproduced* 2026-10-02 on 15.0.0
  with 2.2.7). `mcpServerExistsQ` treats `"Location" -> None` as "a purely in-memory server"
  and the object validates, but `StartMCPServer` fails on it: `mcpServerLogFile` joins
  `Location` with `Log.wl` (`Kernel/Files.wl:143`). With `Location -> File[<a directory we
  own>]` the server starts, answers `initialize` as `{"name":"WolframAll","version":"2.2.7"}`
  in about 1.8 s, lists all ten tools of `Wolfram` ∪ `WolframAlpha` ∪ `WolframLanguage`
  (the probe left out `WolframPacletDevelopment`'s own six), evaluates `Expand[(x+1)^3]`,
  runs `CodeInspector`, puts nothing but frames on stdout, and writes its `Log.wl` into that
  directory. Nothing is written to `$UserBaseDirectory`. An independent run reproduced the
  start (2.3 s, nine tools). With a `File` location, `mcpServerExistsQ` is
  `FileExistsQ`: deleting the directory turns the live object into
  `AgentTools::DeletedMCPServerObject` at its next property read (*reproduced*). `writeLog` appends every request and response with `PutAppend`, unconditionally
  (*traced*, `Server/Shared.wl`).
- **The config `InstallMCPServer` writes** points `command` at the `wolfram` binary with
  `-run …StartMCPServer[]`, args identical to our `KERNEL_ARGS`: one kernel, one seat, per
  session, kernel output on the protocol channel. `SupportedClients.wl` maps `ClaudeDesktop`
  → `Wolfram`, `ClaudeCode` → `WolframLanguage`.
- **`MCP_SERVER_NAME`** is read only by `StartMCPServer[]` and by the installer
  (`Server/Local.wl:16`, `MCPServerObject.wl:652`).

### A.2 The hosted service

*Reproduced* 2026-10-02, against the live endpoint, unless marked:

- It is the paclet's `Wolfram` server: `WolframContext`, `WolframLanguageEvaluator`,
  `WolframAlpha`. `initialize` answers `protocolVersion 2025-03-26`, `serverInfo.name
  "Wolfram"`; `server/discover` is "Unknown method"; `prompts/list` is empty; `GET /mcp` is
  405. A definition made in one call is gone in the next.
- *Traced*, Wolfram's page: "Free for limited personal use", "a free service provided for
  users who don't yet have their own Wolfram product installed". "Fixed resource limits"
  comes from the `wolfram-setup` skill; no Wolfram page publishes a number.

### A.3 The Claude platform

*Traced*, 2026-10-02, to [platform support](https://claude.com/docs/plugins/platform-support),
[components](https://code.claude.com/docs/en/plugins/components),
[mcp](https://code.claude.com/docs/en/mcp), [hooks](https://code.claude.com/docs/en/hooks),
[settings](https://code.claude.com/docs/en/settings-reference),
[cloud environments](https://code.claude.com/docs/en/cloud-environments) and the
[pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist):

- A plugin `settings.json` honours only `agent` and `subagentStatusLine`. A user can switch
  off one plugin server in Claude Code (`/mcp`, recorded as `plugin:<plugin>:<server>` under
  `disabledMcpServers`; or `deniedMcpServers` in settings); Cowork documents no equivalent.
  `disabledMcpjsonServers` governs `.mcp.json` approval only.
- Interactive Claude Code refetches tools on `list_changed`; `-p` mode and the Agent SDK
  refresh the list.
- `SessionStart` hooks and MCP servers both start in the background; what waits on the hook is
  Claude's first response. Plain stdout from a command hook enters the model's context.
  `mcp_tool` hooks are skipped at launch. Cowork is not among the hooks reference's surfaces,
  and issue reports (`anthropics/claude-code` #40495, open; #47993, its duplicate) say Cowork
  does not fire plugin `SessionStart` hooks (*repeated*).
- MCP and LSP servers get `${user_config.KEY}`, `CLAUDE_PLUGIN_ROOT` and `CLAUDE_PLUGIN_DATA`;
  hooks get `CLAUDE_PLUGIN_OPTION_<KEY>`. The data directory survives updates and is deleted
  on the last uninstall unless `--keep-data`.
- `npm install --ignore-scripts` runs for plugins copied into the cache (github, url,
  git-subdir, archive, npm) when a `package.json` sits beside a lockfile; not for
  `--plugin-dir` or an in-place directory marketplace.
- Chat and Cowork take marketplaces from GitHub, public GitLab/Bitbucket, or an uploaded zip;
  Claude Code takes any source. `archive` needs Claude Code 2.1.224+; organisation sync
  rejects it.
- Cloud sessions load plugins only from managed settings, and a single-repository session's
  `.mcp.json`. Trusted network access allows package registries, GitHub and cloud SDKs, no
  wolfram.com; claude.ai connector traffic is exempt. No plugin LSP starts.
- The directory takes a public GitHub repository; the plugin folder may be a subfolder. Holds
  for a reviewer: non-image files over 256 KiB, packed code, a lockfile beside `package.json`,
  `.mcpb`/`.dxt` servers, non-shell entries from a subfolder. Policy 3.D: D9.

### A.4 MCP 2026-07-28

*Traced*, [changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog):
removes `initialize`/`notifications/initialized` (version and capabilities travel in each
request's `_meta`), MCP `ping`, `logging/setLevel` and protocol-level sessions; makes
`server/discover` mandatory and usable as a backward-compatibility probe on stdio; requires
`ttlMs` and `cacheScope` on list results. This repo's SDK (`@modelcontextprotocol/sdk`
1.30.0) is at `2025-11-25`. The broker's liveness `ping` is its own socket op, and `kernel.ts`
retired its MCP `ping` check, so the removal reaches neither.

### A.5 This repository

- `locateKernel` runs once, in `createWolframServer`; a server that finds nothing is
  diagnostics-only for its life. Discovery's step 7 runs `wolframscript -code`, which starts a
  kernel, and `LocateOptions` has no switch to stop before it.
- The capability cache key is kernel binary, kernel version, server name and flavour.
- `proxy.ts` advertises `tools.listChanged` and sends it when a kernel start changes the list.
- `lsp.ts` spawns the kernel with `stdio: "inherit"`.
- The release zip is `.claude-plugin/plugin.json` plus the bundle.

---

### A.6 Agent clients, 2026-10-05

Four research passes from primary sources (official docs, the clients' own repositories, read at
their released tags where it mattered); the rows below are what MA rests on. Items marked *unconfirmed* are experiments in MA.

- **Codex** (CLI 0.160.0; docs now at learn.chatgpt.com): MCP stdio and HTTP in
  `~/.codex/config.toml`; no LSP anywhere; skills from `.agents/skills`; hooks with SessionStart
  injecting stdout, skipped until the user trusts the hook's hash; plugins read Agent Plugins,
  `.codex-plugin`, `.claude-plugin/plugin.json` and the Claude Code marketplace file; no archive
  source; a plugin's legacy `.mcp.json` does not expand `${CLAUDE_PLUGIN_ROOT}`; the server's
  environment is filtered to a short allow-list plus `env_vars`; default tool timeout 60 s; MCP
  prompts unsupported and `tools/list_changed` only logged (traced in source).
- **Cursor** (editor 2.5+ plugins; CLI `agent`): `.cursor-plugin/plugin.json` or Agent Plugins;
  git or local install only; no LSP component (Open VSX extensions, and Wolfram's own extension
  is not on Open VSX); `sessionStart` documented with JSON `additional_context`, reported flaky;
  third-party import of Claude Code plugins, hooks and skills on by default (off for Enterprise);
  Linux sandbox remaps the UID to 0; cloud agents run neither our kernel nor `sessionStart`.
- **VS Code and Copilot** (VS Code 1.140; Copilot CLI 1.0.91): read Agent Plugins first, then
  `.claude-plugin`; expand `${CLAUDE_PLUGIN_ROOT}`; Copilot CLI runs a plugin's LSP
  (`fileExtensions`) and injects SessionStart context; installs from git or a path.
- **Others:** Qwen Code converts Claude Code plugins, including LSP and hooks, and installs from
  an archive URL; OpenClaw reads Claude Code, Codex, Cursor and Agent Plugins bundles and runs
  their LSP but not Claude hooks; Hermes filters the server's environment and has no plugin MCP;
  Pi has had MCP since 0.99.0, with a 60 s default reset only by progress notifications, and needs `"exposure": "direct"` or the model reaches tools only through generated JavaScript; Antigravity reads only its own format and has
  no session-start event; Gemini CLI is enterprise-only since 2026-06-18; Roo Code shut down
  2026-05-15; Windsurf became Devin, which reads `.claude-plugin`.
- **Standards:** Agent Skills (agentskills.io, Anthropic-originated, unversioned, about 47
  clients); Agent Plugins 1.0.0 (2026-07-24; Amazon, Cursor, Microsoft, OpenAI, Vercel; skills and
  MCP only; directories, no archives or marketplace; Claude Code not listed); `AGENTS.md` (Agentic
  AI Foundation); MCP 2026-07-28 (stateless, `server/discover`); the MCP Registry (preview,
  accepts `.mcpb` from GitHub release assets).
- **Conflict to settle by experiment:** Cursor's plugin docs say plugins do not read
  `.claude-plugin`, while its third-party import loads installed Claude Code plugins separately.
- **A recommendation not taken:** one research pass suggested a single tree carrying both an Agent
  Plugins root `plugin.json` and `.claude-plugin/`. VS Code and Copilot read the Agent Plugins
  manifest first, so that tree would hide the LSP and the hook from them; D29 keeps the two apart.

## Appendix B. Considered and rejected

- **Declare both our server and the hosted URL.** Chat would get one-click connection, but
  Claude Code and Cowork load both, so with a kernel present the evaluator appears twice and
  the model has to pick. Only Claude Code lets a user switch one off, by hand.
- **A hook decides the backend, the server reads it.** Server start is not ordered after
  `SessionStart` (A.3), so it is a race by design.
- **Declare the hosted URL and never route.** Hosted tools always, local ones as well when a
  kernel exists: duplicates exactly when the user has the better option.
- **Choose the server name from `clientInfo` at `initialize`.** Capabilities go to
  `new Server(...)` before any request, and the prompts capability comes from a cache keyed by
  server name. Views (§5 M2) make the question unnecessary.
- **Pin `Wolfram` for the plugin.** Name-stable routing with no new mechanism, but Claude Code
  loses the coding tools. The plugin view (D7) gets the stability without the loss.
- **Swap `WolframLanguageContext` for `WolframContext` in a union of eight.** An earlier
  draft. Unnecessary once views make a nine-tool superset free.
- **An in-memory server with `"Location" -> None`.** Validates, cannot start (A.1).
- **`Location` in the cache directory.** `clear-cache` would delete it under a live kernel,
  and the transcript it holds is state, not cache (§5 M2).
- **One `Search` in the union, accepting that one view's prompt text changes.** Unnecessary:
  prompts can be renamed in the object (A.1).
- **Keeping prompts out of views** (a kernel per prompt family). That brings back a kernel per
  server, which is what views exist to remove.
- **Per-tool routing on the probed sign-in state.** The probe's `wolframID` is cached until the
  binary changes, so sign-ins after the first probe are invisible. D5 is the failure-driven replacement, and it is deferred.
- **Gating routing on the MCP 2026-07-28 upgrade.** Nothing routing talks to needs it. The
  split v2 SDK packages do implement it, so evaluating them is track P, which gates
  nothing.
- **Decline the LSP below a seat threshold.** The probe knows the licence maximum, not what is
  free (§4.3).
- **A `.mcpb` package for Claude Desktop chat** (D28). The Claude directory has no route for
  software that needs a separately installed, separately licensed product, and private
  distribution is not worth a package of its own: Desktop's Code tab installs the Claude Code
  archive, and chat takes the generic setup note.
- **A `.mcpb` inside the plugin for a Node runtime.** No page says Claude Code or Cowork
  supplies a runtime for one, and the directory holds `.mcpb` servers.
- **The repository root as the plugin folder.** Drags in the root `.mcp.json`, the lockfile
  and an unbuilt `dist/` (§5 M1, "The artifact").
- **Forward from a cloud session to the user's machine.** A public tunnel to code execution.
- **Declining the LSP only when its own start is refused,** as the seat protection. It cannot
  keep a seat free for a human who opens Mathematica later (§4.3). M3's allocator is the
  protection; the refusal measurement is recovery work.
- **Committing the generated bundle.** It is only worth its workflow cost if the directory
  becomes a goal (D8, D9).
