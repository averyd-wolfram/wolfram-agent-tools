# wolfram-agent-tools

Tools that give coding agents a **locally installed Wolfram kernel**. At the centre is
`wolfram-mcp-server`, an MCP server through which any MCP client can use Wolfram Language
without a resident kernel and without hand-rolled config; around it are a Claude Code plugin
that adds Wolfram Language code intelligence and skills, and a single-file bundle of the
whole thing.

```json
{
  "mcpServers": {
    "wolfram": {
      "command": "node",
      "args": ["/absolute/path/to/wolfram-agent-tools/dist/index.js"]
    }
  }
}
```

That is the whole setup — `npm install` in the clone once (it builds `dist/`), point the
config at it, and the kernel is found automatically, not started until a tool is actually
called, and shut down again when idle.

> **Not published to npm yet.** When it is, an `npx wolfram-mcp-server` one-liner will
> replace the path above. Until then use [a tarball](#installing-it-elsewhere) to try it
> without keeping a clone, or [the repo's own config](#using-it-on-this-repo) to work on it.

## Requirements

A licensed Wolfram installation — Mathematica, Wolfram Desktop, or Wolfram Engine — of
**version 14.3 or newer**, which is what supplies the `Wolfram/AgentTools` paclet this
server drives. Older kernels load far enough to start and then fail with
``Get::noopen: Cannot open Wolfram`AgentTools` ``, so they are excluded during discovery
rather than diagnosed later.

Node 22.13 or newer.

## Check your machine

```bash
npm run doctor                # in the clone
wolfram-mcp-server doctor     # after a tarball install
```

Reports every installation it can see, which one it picked and why, the state of the
capability cache, and then actually starts a kernel and lists its tools. This is the
first thing to run when something is wrong.

```
Installations found
    15.1.0  /Users/you/Applications/Wolfram 15.1.0.app/Contents/MacOS/wolfram
    14.3.0  /Applications/Wolfram 14.3.0.app/Contents/MacOS/wolfram
  - 14.2.1  /Applications/Wolfram 14.2.1.app/Contents/MacOS/wolfram
  ("-" marks installs below the 14.3 minimum)
```

## Use as a Claude Code plugin

The plugin's source is the `plugin/` template: its manifest wires up both the MCP server and
code intelligence for Wolfram Language files (`.wl`, `.wls`, `.wlt`, `.m`) from Wolfram's own
[LSPServer](https://github.com/WolframResearch/LSPServer) paclet — diagnostics, hover
documentation, formatting, references — using the same kernel discovery as the server, so both
halves always name the same installation. `npm run release:artifacts` assembles it into
`release/plugin/`, adding the single-file bundle both halves run, and zips exactly that tree.
`plugin/README.md` is what a plugin user reads.

The plugin needs Node 22.13+ on `PATH` and a licensed Wolfram installation of 14.3 or newer,
on macOS or Linux — Windows is recorded in [`docs/plan.md`](docs/plan.md) §9, not yet
supported. The bundle says exactly what is missing when something is; a machine without
Node shows only your MCP client's own "executable not found", which is why it is named here.

```bash
git clone <this repo> && cd wolfram-agent-tools && npm install
npm run release:artifacts
claude --plugin-dir /path/to/wolfram-agent-tools/release/plugin
```

Inside this repo the plugin enables itself: `.claude/settings.json` registers the repo as a
plugin marketplace (`.claude-plugin/marketplace.json`) and enables `wolfram@wolfram`, which the
marketplace serves from `release/plugin/` in place — nothing is copied, nothing is installed
globally, and what a session here runs is what ships. Run `npm run release:artifacts` after a
change to see it in the next session; the session-start hook says when there is nothing
assembled to run. The same settings disable `.mcp.json`'s copy of the server for Claude
Code, so the tools appear once; `.mcp.json` stays committed as the entry any other MCP client
points at. To opt out of the plugin for yourself, set
`{ "enabledPlugins": { "wolfram@wolfram": false }, "disabledMcpjsonServers": [] }` in
`.claude/settings.local.json`, which restores the `.mcp.json` route.

**The LSP kernel costs a licence seat.** It starts on the first Wolfram Language file the
session touches — measured, not at plugin enable — and then holds a full WolframKernel for the
rest of the session, on top of whatever the evaluation tools use. It is **on by default**,
since a session working on Wolfram Language files wants it, and one that opens none spends
nothing; turn off the plugin's `lsp` option, or set `WOLFRAM_MCP_LSP=0`, to keep that seat.
Off, the launcher answers the LSP handshake itself, serving nothing and starting nothing. `npm run test:lsp` checks the LSP contract against your real kernel,
the way `npm run test:wl` checks AgentTools — including that the worked example,
[`examples/weather.wl`](examples/weather.wl), stays lint-clean.

## Use from a single file, in any MCP client

`npm run bundle:js` builds `bundle/wolfram-mcp-server.mjs`: the whole CLI — serve, `doctor`,
`broker`, `lsp` — with its dependency tree inlined. One file, no clone, no npm on the
consuming machine; the requirements are Node 22.13+ and a licensed Wolfram 14.3+, and the
suite drives the built artifact itself, not just its sources. Point any MCP client at it —
VS Code (`.vscode/mcp.json`) as one example:

```json
{ "servers": { "wolfram": {
    "type": "stdio", "command": "node",
    "args": ["/absolute/path/to/wolfram-mcp-server.mjs"] } } }
```

Cursor (`.cursor/mcp.json`), Claude Desktop's own config, and the rest take the same three
lines under their own key names, and `node wolfram-mcp-server.mjs lsp` is the same trick for
any editor's LSP client. Because the broker socket derives from the installation rather than
the client, sessions from *different* clients on one machine share one kernel — the licence
seat economy holds across VS Code and Claude Code at once, not just within either.

## Why a proxy rather than a launcher

The Wolfram MCP server is already a subprocess speaking newline-delimited JSON-RPC over
stdio:

```
wolfram -run 'PacletSymbol["Wolfram/AgentTools","Wolfram`AgentTools`StartMCPServer"][]' -noinit -noprompt
```

Pointing a client straight at that works, and `InstallMCPServer` will set it up for you.
What this buys over doing that, measured on one machine against AgentTools 2.2.7:

| | Straight at the kernel | Through this server |
|---|---|---|
| First ever run, to a tool list | 2028 ms, one seat held | 2044 ms — it also boots a kernel to learn the tools |
| **Every run after** | 2028 ms, one seat held | **1 ms, no kernel started, no seat** |
| Three client sessions | three kernels, three seats | one kernel |
| Ten minutes idle | seat held until the client exits | kernel shut down, seat returned |
| No usable Wolfram | the client shows a dead server | `initialize` in 145 ms, and a diagnostics tool listing every install it saw |
| Licence seats exhausted | a dead pipe, or a hang to the start timeout | an error in 215 ms carrying the kernel's own words and `code=70` |

The point is the seat, not the milliseconds. Clients launch every configured server at
startup and enumerate its tools immediately; most licences allow two or four concurrent
kernels, so a session that never evaluates anything should not cost one, and three
sessions should not cost three. Discovery is the other half: no absolute kernel path in
your client config, the `14.3` floor applied before a kernel is started rather than
diagnosed afterwards, and the `WOLFRAM_BASE` trio forwarded so a kernel launched from a
client's sparse environment can still find its paclet.

**When it does not help.** On a licence with seats to spare — `$MaxLicenseProcesses` of
`Infinity` — every row above except the last two stops mattering. If you run one client,
always use Wolfram in it, and have seats going free, pointing straight at the kernel is
simpler and worth preferring. This server also adds failure modes a direct connection
cannot have: a disk cache that can serve a stale tool list, a broker process, a socket,
and version skew between this package and the paclet.

One claim worth correcting, since the code carries a transport built partly on it: a
healthy kernel session emits **no** non-protocol output at all. Measured across
`initialize`, `tools/list` and a `tools/call`: zero lines. Banners, `Message[]` warnings
and `Get::noopen` show up when something is *wrong*, which is why the filtering transport
earns its place — not by rescuing a stream that would otherwise break, but by turning
that output into the error text you actually get.

So this is a real MCP server that acts as a *client* to the kernel. It answers
`initialize` and `tools/list` from a disk cache without touching Wolfram, starts the
kernel on the first request that genuinely needs one, and shuts it down again after an
idle period. A custom transport routes non-JSON stdout lines to the log instead of into
the parser.

```
client ──stdio──> wolfram-mcp-server ──stdio(filtered)──> wolfram kernel
                  │
                  ├─ tools/list   → cache, no kernel
                  ├─ tools/call   → lazy start, serialized, timed out
                  ├─ kernel start → re-read tool list, notify on change
                  └─ idle N min   → kernel killed, restarts transparently
```

## Configuration

Everything is an environment variable, so the command stays argument-free. The common
ones:

| Variable | Default | Meaning |
|---|---|---|
| `MCP_SERVER_NAME` | `Wolfram` | Which AgentTools server to expose. Built in: `Wolfram`, `WolframLanguage`, `WolframAlpha`, `WolframPacletDevelopment` — or name your own, or a paclet's `Publisher/Server`. |
| `WOLFRAM_MCP_KERNEL` | auto-detect | Installation or kernel executable. |
| `WOLFRAM_MCP_VERSION` | — | Pin to a version, as a dotted prefix: `14.3`, or `15` for the newest 15.x. |
| `WOLFRAM_MCP_IDLE_MINUTES` | `10` | Shut a kernel down after this long idle. `0` keeps it resident. |
| `WOLFRAM_MCP_SHARE` | `1` | `0` for a private kernel instead of a shared one. |
| `WOLFRAM_MCP_LICENSE_LIMIT` | inspect once | Licence seats, if you would rather say than have us look. |

**[`docs/environment.md`](docs/environment.md) documents all of them** — including the
Wolfram variables we honour (`WOLFRAM_INSTALLATION_DIRECTORY`, `WOLFRAMSCRIPT_KERNELPATH`,
the `WOLFRAM_*BASE` trio), the resolution order, the seat-budget arithmetic, and worked
configuration examples.

`MCP_SERVER_NAME` is Wolfram's own variable — `StartMCPServer[]` reads it directly and
`InstallMCPServer` writes it — so this server uses the same name for the same thing.
`wolfram-mcp-server doctor` prints what is in effect.

## Discovery

Resolution order, with the first match winning:

1. `WOLFRAM_MCP_KERNEL`
2. `WOLFRAM_MCP_VERSION`, matched against every installation found
3. `WOLFRAM_INSTALLATION_DIRECTORY`, then `WOLFRAM_HOME`
4. `WOLFRAMSCRIPT_KERNELPATH`, then Wolfram's `WolframScript.conf`
5. Platform scan, newest version wins
6. `wolfram` or `WolframKernel` on `PATH`, then the installation `doctor` recorded, if
   step 7 is what found it
7. `wolframscript -code '$InstallationDirectory'` — the only step that starts a kernel, so
   only `doctor` runs it. A session, the LSP and the library's `createWolframServer` stop at
   step 6; a kernel only `wolframscript` knows about is reached by running `doctor` once,
   which records it

Step 4 outranks the scan deliberately: it is a preference somebody recorded through
Wolfram's own tooling, whereas "highest version number on disk" is a guess. On a machine
with an experimental build installed next to a stable one, the highest version is not the
one you meant.

Version detection never starts a kernel. macOS reads `CFBundleShortVersionString` from
each bundle's `Info.plist`, so **a bundle called anything at all still reports its real
version**; Windows reads `HKLM\SOFTWARE\Wolfram Research\Installations` with a Program
Files scan as fallback; Linux walks `/usr/local/Wolfram` and `/opt/Wolfram`, and a kernel
reached through a symlink — which is what a Linux install puts on `PATH` — is resolved to
its target first, since the version lives in the installation's path, not the symlink's.
On macOS the
scan prefers bundles named Wolfram-something because that is fast, and sweeps every
bundle if that finds nothing — an experimental build need not be called "Wolfram" at all.

A reachable, *executable* kernel binary is the filter that separates real installations
from other Wolfram-branded apps. `wolfram`, `WolframKernel` and `MathKernel` are the same
binary — the first two are symlinks to the third on macOS — so any of them works, and the
canonical `wolfram` is what gets reported.

`wolframscript` is the last resort and is used **only as a locator**. It is on `PATH` on
nearly every machine with any Wolfram product, but it is a script runner, not a kernel: it
does not accept the `wolfram -run` convention and never speaks MCP. It is asked for
`$InstallationDirectory` and `$Version`, and then discarded.

## Sharing kernels between sessions

**A Wolfram kernel costs a licence seat, and most licences allow 2 or 4.** One agent
session plus an open Mathematica window can already fill a 2-seat licence, so a server
that takes a kernel per session will lock you out of your own installation.

So by default it does not. The first server process to need a kernel starts a small
**broker** in the background; every other process on the machine attaches to it over a
Unix socket (a named pipe on Windows) and they share its kernels.

Sharing never changes an answer, though. A kernel reads its environment when it starts —
`MCP_TOOL_OPTIONS` sets each tool's effective options, including the evaluator's
`TimeConstraint` — so sessions share a kernel only where those values match. Three projects
on default settings share one kernel; override the tool options in one of them and that one
gets a kernel of its own, inside the same licence budget. See
[Sharing and kernel flavours](docs/environment.md#sharing-and-kernel-flavours).

```
client A ──stdio──> server A ──┐
client B ──stdio──> server B ──┼──socket──> broker ──> kernel pool
client C ──stdio──> server C ──┘                       (1..budget)
```

Measured with four sessions against a real kernel and a 1-kernel budget: four separate
MCP server processes, four concurrent evaluations, **one kernel and one licence seat**,
all four answered in 2.9 s.

The pool grows only up to a budget derived from the licence. Reading
`$MaxLicenseProcesses` needs a kernel — the limit is encoded in the password token, not
stored in plain text anywhere on disk — so every kernel reports it as it starts, before its
server is up, and the answer is cached. With nothing cached the pool starts at one kernel,
and that kernel's report sets the budget: a cold start uses one kernel, not a separate
inspection kernel and then one to serve.

The same report supplies `$BaseDirectory`, `$UserBaseDirectory` and `$LocalBase`, which
are then passed to later kernels as `WOLFRAM_BASE` / `WOLFRAM_USERBASE` / `WOLFRAM_LOCALBASE` —
the same three variables Wolfram's own generated configuration sets, and for the same
reason: a client launches the server with a sparse environment, and a kernel that
computes the wrong user base cannot find the AgentTools paclet.

Set `WOLFRAM_MCP_LICENSE_LIMIT` to state the limit instead, or `WOLFRAM_MCP_INSPECT=0` to
ignore what kernels report and stay at one kernel.

| licence | reserve | budget |
|---|---|---|
| 2 seats | 1 | 1 kernel |
| 4 seats | 1 | 3 kernels |
| unlimited | 1 | 4 kernels (a default, not a limit) |
| unreadable | 1 | stays at 1 |

An unreadable limit deliberately stays conservative rather than assuming unlimited:
growing the pool on the machines we understand least is the wrong way round.

`WOLFRAM_MCP_RESERVE_SEATS` is what keeps a seat free for you. Set
`WOLFRAM_MCP_MAX_KERNELS` to override the arithmetic, or `WOLFRAM_MCP_SHARE=0` to opt out
of sharing entirely.

Things worth knowing:

- **A broker serves one Wolfram installation.** Every server name on that installation
  shares it, under one licence budget: the name is part of a session's kernel flavour, so
  each name still gets kernels of its own inside the shared pool. Two *installations* are
  two brokers — a broker runs the binary it was started with.
- **Sharing is never a dependency.** If a broker cannot be reached or started, the server
  falls back to its own kernel and says so.
- **Sessions do not leak into each other.** A `WolframLanguageEvaluator` call without a
  `session` argument gets a fresh, isolated session, so sharing a kernel does not share
  definitions.
- **The broker exits on its own** about a minute after the last session detaches.
- **The first session establishes the pool.** A broker already running keeps the budget
  it started with, so changing `WOLFRAM_MCP_LICENSE_LIMIT` in a later session has no
  effect until that broker exits.
- `wolfram-mcp-server doctor` reports the socket, the attached session count, the pool
  size and the licence budget. `wolfram-mcp-server broker` runs one in the foreground.

## Cache

`tools/list` before the first kernel start is answered from disk:

- macOS and Linux: `$XDG_CACHE_HOME/wolfram-mcp-server/capabilities/<digest>.json`, else
  `~/.cache/...`
- Windows: `%LOCALAPPDATA%\wolfram-mcp-server\capabilities\<digest>.json`

One file per key, digested from kernel path, kernel version, server name, and this
package's version — so a project using a different `MCP_SERVER_NAME` keeps its own entry
instead of evicting yours. `wolfram-mcp-server doctor` prints the one in effect. It is
rewritten from the live kernel on **every** kernel start, so a `Wolfram/AgentTools`
upgrade that changes the tool list is picked up the next time a kernel runs, and
`notifications/tools/list_changed` is emitted when it differs. Nothing here is a source
of truth; it is a latency cache. `wolfram-mcp-server clear-cache` forgets it.

## Programmatic use

```ts
import { createWolframServer, deferredBackend, loadConfig, createLogger } from "wolfram-mcp-server";

const log = createLogger("my-app");
const config = loadConfig(log);

const { server, install, stop } = createWolframServer(config, log, (kernel) =>
  deferredBackend(config, kernel, log),
);
await server.connect(myTransport);
```

The third argument says how the server gets a kernel. `deferredBackend` is exactly
what the CLI uses: a shared broker when one can be reached, a private kernel
otherwise, deferred so `initialize` and a cached `tools/list` cost no kernel work,
under one preparation deadline of `WOLFRAM_MCP_START_TIMEOUT_SECONDS`, and backing
off from a failed one. To take over the broker-or-private decision, build your own
from `DeferredBackend` and `createBackend` — and pass the factory's `deadline`
argument through to `createBackend`, or preparation runs on a deadline of its own.

`locateKernel`, `listKernels`, `resolveKernelBinary`, `KernelSession` and
`FilteringStdioTransport` are exported too, if you want the discovery or the filtering
stdio transport on their own.

## What this lets a model do

The tool at the centre of this server is `WolframLanguageEvaluator`, and it evaluates whatever
Wolfram Language it is handed. That code is written by a model from your prompt, and Wolfram
Language is general purpose: it can read and write files, start processes, and make network
requests. It runs as you, with your permissions, and nothing sandboxes it from the rest of
your machine. That is what makes the tool useful, and it is worth being deliberate about.

**The kernel inherits this server's environment**, which is the one your MCP client launched
it with. Anything in it — an API token, a credential a shell profile exports — can be read by
code the kernel runs. [`docs/environment.md`](docs/environment.md) lists what this server
reads itself; everything else is passed through untouched, because a server *you* built may
need it.

**The broker socket is a way in.** It lives in your per-user runtime directory, and anything
that can reach it can ask for an evaluation: its frames carry no authentication, so the boundary
is the operating system's. The socket is created mode 0600, so only you can connect to it, and
the directory holding it has to be yours and unwritable by anyone else — point `XDG_RUNTIME_DIR`
somewhere world-writable and sharing is declined rather than exposed, because a path anyone can
write to is a path anyone can bind first. [`SECURITY.md`](SECURITY.md) is the threat model,
including what is deliberately not defended.

If that is more than you want: run your client as a user with less access, keep secrets out of
the environment you launch it from, or point `MCP_SERVER_NAME` at a server of your own with a
narrower set of tools — see [Sharing and kernel flavours](docs/environment.md#sharing-and-kernel-flavours)
for how to build one.

## What a failure looks like

MCP gives a server two ways to fail, and they mean different things to a model: an **error
response**, which says the request itself was wrong, and a **result marked `isError`**, which
says the tool ran and did not work. Collapsing them leaves a model unable to tell "your
Wolfram code was wrong" from "that tool does not exist". This server draws the line in one
place and draws it the same way whether or not kernels are being shared.

**`tools/call`**

| What happened | What you get |
|---|---|
| Upstream rejected the request — `ParseError`, `InvalidRequest`, `MethodNotFound`, `InvalidParams` | an MCP **error response**, relayed with the kernel's message |
| The evaluation failed | `isError: true`, with the kernel's own words |
| The call outlived the ceiling | `isError: true`. The kernel is *not* stopped: it keeps working, and a late answer is proof of life |
| The kernel died mid-call, or the broker vanished | `isError: true` |
| You cancelled | `isError: true`, and the kernel is stopped — that is the one case that kills one |
| No Wolfram installation | `isError: true`, carrying a diagnosis. Re-checked every call, so installing Wolfram and asking again works |

`wolfram_status` is the exception: it is answered here, never forwarded, and never starts a
kernel. It is what to ask when kernels are the thing that is broken.

**`tools/list` and `prompts/list`**

| What happened | What you get |
|---|---|
| A cache entry is warm | the cached list, no kernel started |
| Cold, and the kernel answers | the live list, and the cache is rewritten |
| Cold, and the kernel fails | an MCP **error response** — there is nothing to serve, so this throws rather than pretending the list is empty |
| A background refresh fails | nothing: the cached list stands and the failure is logged |

Lists are always complete. No `nextCursor` is ever returned, because a cursor is one kernel's
paging state and a shared pool hands out whichever kernel is free.

**Capabilities** are fixed at `initialize`, before this server is allowed to start a kernel. A
first run against a cold cache therefore advertises tools only; once a kernel has reported
prompts, later sessions advertise them.

**Sharing failures are invisible.** A broker that cannot be reached, cannot be understood, or
was started for a different configuration ends in a private kernel and a line on stderr — never
in an error you have to handle.

## Known behaviour

**Sessions survive a kernel restart, mostly.** The Wolfram evaluator hands back a
`session` id and persists session state to disk, so idle shutdown does not lose your
definitions — AgentTools restores them and tells the model what was and was not
restored. Package loads and other non-session kernel state do not come back.

**One evaluation at a time.** A kernel is single-threaded, so concurrent `tools/call`
requests are queued rather than parallelized. If you want parallelism, pool several
`KernelSession` instances rather than removing the queue.

**Whether a tool change lands mid-session is up to the client.** This server sends
`notifications/tools/list_changed` when a kernel start changes the list. Interactive Claude
Code refetches on it, so the change lands in the current session; a client that ignores the
notification, or caches tool definitions per conversation, picks it up in the next one.

**Capabilities are frozen at `initialize`.** Prompts and resources have to be declared
before we are allowed to start a kernel, so they come from the cache when there is one
and from a measured per-server default when there is not.

**An unactivated Wolfram Engine cannot be activated here.** It prompts for credentials
on stdin, which is also the protocol channel. `WOLFRAM_MCP_START_TIMEOUT_SECONDS` bounds
the wait, and the last lines the kernel printed are included in the error. A preparation
that failed is not retried for ten minutes, so a client calling in a loop does not spend a
seat on every attempt; `wolfram_status` shows the wait, and replacing or repairing the
installation ends it at once.

**Paclet auto-download looks like a hang.** `PacletSymbol` fetches
`Wolfram/AgentTools` over the network if the selected kernel does not have it. Run
`PacletInstall["Wolfram/AgentTools"]` in that kernel once if start timeouts persist.

## Development

Everything a contributor needs arrives with the clone: `npm install` brings the build and the
TypeScript gate (prettier, eslint, `tsc` — run by `npm test` and, in Claude Code, by an
on-edit hook behind the workspace-trust prompt), and `.vscode/` recommends the matching editor
extensions. A Claude Code session in this repo tells you at startup if any of that is missing;
nothing else does, by design, so run `npm install` first.

```bash
npm install          # also builds, via the prepare script
npm test             # builds, then runs the suite against a fake kernel
npm run doctor
```

The test suite needs no Wolfram installation: `test/fake-kernel.mjs` stands in for a
kernel and can be told to emit banner noise, fail `tools/list` once, go mute, or report
a missing paclet. Sections marked *regression* pin failures that previously wedged or
silently disabled the server.

`test/agenttools-contract.wlt` is the other half, and does need a kernel. It asserts the
`Wolfram/AgentTools` facts this package hardcodes — the kernel command line, the server
names, the version floor — so a paclet upgrade that breaks one fails a test rather than
the server. Run it through the `TestReport` MCP tool, or:

```bash
wolframscript -code 'TestReport["test/agenttools-contract.wlt"]'
```

### Using it on this repo

`.mcp.json` is committed, so cloning the repo is the whole setup:

```bash
git clone <this repo> && cd wolfram-agent-tools
npm install     # also builds dist/, via the prepare script
claude          # approve the project server when prompted
```

It runs your working tree, on the `WolframLanguage` server. Project-scoped servers need
approval on first use; `claude mcp list` re-checks health. Delete `.mcp.json` if you
would rather not have it.

The command in it is `npm run --silent mcp`, which looks indirect but is the only form
that survives a clone. An absolute path cannot be committed, and **a relative path does
not work**: Claude Code launches MCP servers with the working directory that `claude`
was started in, which may be any subdirectory — `node dist/index.js` connects from the
repo root and fails from `src/`. `npm run` guarantees cwd is the package root, `--silent`
keeps npm off stdout (which is the protocol channel), and `scripts/mcp-server.mjs`
resolves `dist/` relative to itself and turns a missing build into an instruction rather
than a stack trace. `${CLAUDE_PROJECT_DIR}` is *not* an option — it is injected into the
server's environment but is not expanded inside `.mcp.json`.

### Installing it elsewhere

Once published, an `npx -y wolfram-mcp-server` config will be all anyone needs. Until
then, build a tarball and point at that — it works with no clone and no global install:

```bash
npm pack                       # -> wolfram-mcp-server-<version>.tgz
```

```json
{
  "mcpServers": {
    "wolfram": {
      "command": "npx",
      "args": ["-y", "/absolute/path/to/wolfram-mcp-server-<version>.tgz"]
    }
  }
}
```

Or install it once and use the bare command:

```bash
npm install -g ./wolfram-mcp-server-<version>.tgz
```

```json
{ "mcpServers": { "wolfram": { "command": "wolfram-mcp-server" } } }
```

How it is put together, and the failure modes that shaped it, are in
[`docs/design.md`](docs/design.md). Read it before changing anything.

## Licence

MIT.
