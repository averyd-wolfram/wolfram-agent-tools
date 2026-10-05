# Environment variables

Every knob is an environment variable, so the command stays argument-free and drops into
any MCP client config. Nothing here is required — the defaults are meant to be right.

Three values are treated identically to "not set": **absent**, **blank**, and an
**unsubstituted `${...}` template** (an MCP Bundle host passes the placeholder through
verbatim when an optional field is left blank).

`wolfram-mcp-server doctor` prints which of these are in effect, and what it concluded
from them.

## Choosing the server

| Variable | Default | Meaning |
|---|---|---|
| `MCP_SERVER_NAME` | `Wolfram` | Which Wolfram/AgentTools server to expose — built-in, your own, or a paclet's. |
| `WOLFRAM_MCP_SERVER_NAME` | — | Alias for the above, if you prefer everything prefixed. |
| `WOLFRAM_MCP_DEFAULT_SERVER` | — | The server to use when neither name above is set. A packager's default: the Claude Code plugin sets it to `WolframLanguage`, so an explicit `MCP_SERVER_NAME` you already have still wins. Blank or unsubstituted `${…}` values count as unset, for all three. |
| `WOLFRAM_MCP_KERNEL_ENV` | — | Extra variable names, comma-separated, that your own MCP server reads. See [Sharing and kernel flavours](#sharing-and-kernel-flavours). |

`MCP_SERVER_NAME` is **Wolfram's own variable**, not one this package invented:
`StartMCPServer[]` reads it directly, and it is what Wolfram's `InstallMCPServer` writes
into a client configuration. Any name `MCPServerObject` resolves is valid. The four
built-in servers are:

| Value | Tools |
|---|---|
| `Wolfram` | 3 — context search, code evaluation, Wolfram Alpha |
| `WolframLanguage` | 7 — adds notebooks, symbol definitions, code inspection, test reports |
| `WolframAlpha` | 2 — knowledge queries only |
| `WolframPacletDevelopment` | 13 — the full paclet-authoring set |

They are not the only valid values. `MCPServerObject` resolves a name from, in order:

1. **your own server** — `$UserBaseDirectory/ApplicationData/Wolfram/AgentTools/Servers/<name>/Metadata.wxf`,
   which is where a server you build from your own `LLMTool`s is stored. This is tried
   *before* the built-ins, so a server of your own may shadow one of them;
2. the four built-ins above;
3. **a paclet-qualified `Publisher/Server`**, declared by any paclet through an
   `AgentTools` extension — and resolved from the paclet repository even when that paclet
   is not installed locally.

A name outside the built-in four is therefore passed to the kernel unchanged. If it does
not resolve, the kernel says `No MCPServerObject found for name "…"` and this server fails
the call with those words in about a second, rather than waiting out
`WOLFRAM_MCP_START_TIMEOUT_SECONDS` — an unresolvable name does not stop a kernel, it just
leaves it running without a server.

Several names on one machine cost nothing extra: one broker per Wolfram installation serves
all of them, under a single kernel budget, and keeps each name's kernels separate because the
name is part of a session's flavour. Two *installations* are still two brokers and two
budgets — a broker runs the binary it was started with — so pinning different versions in
different projects is the one arrangement that can still exceed the reserve.

## Fixed limits

Not everything is a knob. These are the numbers the code holds on its own — no environment
variable moves them — and they are here because each one is visible from outside when it
fires, so "why did it do that?" has an answer that does not require reading the source.

The value column is the source expression verbatim; a check in the suite fails if the code
and this table stop agreeing.

| Constant | Value | Where | What it decides |
|---|---|---|---|
| `BROKER_PROTOCOL` | `5` | `broker-protocol.ts` | Part of the socket path, so proxies and brokers that cannot understand each other never meet. |
| `MAX_SOCKET_PATH` | `100` | `broker-protocol.ts` | Longest socket path used, inside macOS's 104-byte `sockaddr_un`, which truncates rather than refusing. |
| `MAX_UNTERMINATED_BYTES` | `4 * 1024 * 1024` | `transport.ts`, `broker-protocol.ts` | Output held from a kernel, or a frame from a socket peer, before it is dropped unread. Two separate boundaries, deliberately: one trusts a kernel, the other an unauthenticated socket. |
| `RECENT_LINE_LIMIT` | `15` | `transport.ts` | Lines of non-protocol kernel output kept, to quote back in an error. |
| `KILL_ESCALATION_MS` | `5_000` | `transport.ts` | Grace between `SIGTERM` and `SIGKILL` for a kernel that will not exit. |
| `REAP_TIMEOUT_MS` | `8_000` | `transport.ts` | Longest wait for a kernel to exit before giving up on it. |
| `CONNECT_DEADLINE_MS` | `5_000` | `broker-client.ts` | How long a session keeps trying to reach a broker it has just started before using a private kernel. |
| `CONNECT_RETRY_MS` | `100` | `broker-client.ts` | Gap between those attempts. |
| `REQUEST_GRACE_MS` | `2_000` | `broker-client.ts` | How long a broker may take *beyond* the call's own ceiling before this side stops waiting. |
| `PING_DEADLINE_MS` | `REQUEST_GRACE_MS` | `broker-client.ts` | How long a broker gets to say it is running, and to accept this session's kernel environment. |
| `DEFAULT_OP_TIMEOUT_MS` | `60_000` | `broker-client.ts` | Ceiling for broker operations that carry no deadline of their own — `listTools`, `capabilities`, `getPrompt`. Nobody chose this number; it is the SDK's, and it is the one remaining wart in the timeout design. |
| `EMPTY_GRACE_MS` | `60_000` | `broker-server.ts` | How long a broker keeps running, and keeps its kernels, after its last session detaches. |
| `BIND_ATTEMPTS` | `4` | `broker-server.ts` | Attempts to claim the socket when several brokers start at once. |
| `HARD_KERNEL_CAP` | `8` | `pool.ts` | Kernels one broker will run, whatever the licence says. |
| `UNLIMITED_BUDGET` | `4` | `pool.ts` | Kernels used when the licence is genuinely unlimited — permission is not an instruction. |
| `MAX_PAGES` | `50` | `proxy.ts`, `broker-server.ts`, `inspect.ts` | Pages drained from an upstream list before giving up, so a kernel that always returns a cursor cannot loop forever holding a seat. |
| `CACHE_TTL_MS` | `7 * 24 * 60 * 60 * 1000` | `cache.ts` | How long a capability cache entry is used for an installation that never starts a kernel. |
| `CACHE_FORMAT` | `2` | `cache.ts`, `inspect.ts` | Bumped when what is stored changes shape, so an old file is ignored rather than misread. |
| `PREPARATION_BACKOFF_MS` | `10 * 60_000` | `prepare.ts` | How long a failed preparation is not retried. Calls meanwhile fail at once with the time left, and `wolfram_status` says why; a changed kernel binary ends it early. On the shared path only the broker's own preparation starts it: a shared kernel that fails to start is an ordinary call failure, retried by the next call (`docs/plugin-plan.md` D19). |
| `KERNEL_TIME_CONSTRAINT_S` | `60` | `proxy.ts` | The evaluator's own default `TimeConstraint`, which `MCP_TOOL_OPTIONS` may change — used to warn when this server's ceiling is set below it. |
| `TIME_CONSTRAINT_HEADROOM_MS` | `30_000` | `proxy.ts` | Added to a caller's requested `timeConstraint`, so this server answers after the kernel does and the caller gets the kernel's own words. |

### Sharing and kernel flavours

Kernels are shared between sessions, but only where sharing cannot change an answer. A
kernel reads its environment at startup — `MCP_TOOL_OPTIONS` sets each tool's effective
options, including the evaluator's `TimeConstraint` — so two sessions configured differently
must not be served by the same kernel.

The values that decide this are a session's **flavour**: every variable AgentTools itself
reads (`MCP_SERVER_NAME`, `MCP_TOOL_OPTIONS`, `MCP_APPS_ENABLED`,
`MCP_APPS_NOTEBOOK_METHOD`, `LLMKIT_ENABLED`, `WOLFRAM_CLOUDBASE`) plus the
`WOLFRAM_*BASE` trio and `WOLFRAMINIT`, the kernel's own startup options — which is how an
on-demand licence entitlement reaches it, so two entitlements never share a kernel or a
bill. A directory a session sets itself stays that session's: kernels report the
directories they start with, and only computed ones become the installation's. Same flavour, one kernel shared as widely as the licence allows;
different flavour, a kernel of its own in the same broker. Nothing else counts — three
projects in three directories with default settings have one flavour between them, and
override `MCP_TOOL_OPTIONS` in one of them and only that one stops sharing.

Flavours share one licence budget, so the seat count still bounds everything: a pool at its
limit retires an idle kernel of another flavour to make room rather than overrunning the
licence, and `WOLFRAM_MCP_RESERVE_SEATS` keeps applying across all of them. A session also
gets exactly what it asked for and nothing else — a variable another project declared is
removed from your kernel's environment unless you set it yourself.

A broker started before this existed cannot serve a declared environment, and says so; that
session uses a private kernel until the old broker exits.

A server you built yourself may read variables this package has never heard of. Name them in
`WOLFRAM_MCP_KERNEL_ENV`, comma-separated, and they join your flavour:

```json
"env": {
  "MCP_SERVER_NAME": "MyProject",
  "MY_PROJECT_MODE": "staging",
  "WOLFRAM_MCP_KERNEL_ENV": "MY_PROJECT_MODE"
}
```

Blank and unset are the same flavour, so `MCP_TOOL_OPTIONS=""` shares with a session that
omits it. `wolfram-mcp-server doctor` prints the flavour in effect.

## Choosing the installation

| Variable | Default | Meaning |
|---|---|---|
| `WOLFRAM_MCP_KERNEL` | auto-detect | Installation or kernel executable. An `.app` bundle, an `$InstallationDirectory`, or the binary itself all work. |
| `WOLFRAM_KERNEL_PATH` | — | Alias for the above. |
| `WOLFRAM_MCP_VERSION` | — | Pin to a version as a dotted prefix: `14.3` selects 14.3.0, `15` selects the newest 15.x. |
| `WOLFRAM_MCP_MIN_VERSION` | `14.3` | Ignore older installations when auto-detecting. |
| `WOLFRAM_MIN_VERSION` | — | Alias for the above. |

A `WOLFRAM_MCP_VERSION` pin **overrides** the minimum: asking for 14.2 explicitly gets
you 14.2, and the resulting ``Get::noopen: Cannot open Wolfram`AgentTools` `` names the
cause rather than silently substituting a different installation.

### Wolfram's own variables, which are also honoured

| Variable | Read for |
|---|---|
| `WOLFRAM_INSTALLATION_DIRECTORY` | An installation to use, ahead of any scan. |
| `WOLFRAM_HOME` | Same, checked after the above. |
| `WOLFRAMSCRIPT_KERNELPATH` | The kernel `wolframscript` is configured to use. |
| `WOLFRAMSCRIPT_CONFIGURATIONPATH` | Where to find `WolframScript.conf`, if not in the default place. |

### Resolution order

1. `WOLFRAM_MCP_KERNEL`
2. `WOLFRAM_MCP_VERSION`, matched against every installation found
3. `WOLFRAM_INSTALLATION_DIRECTORY`, then `WOLFRAM_HOME`
4. `WOLFRAMSCRIPT_KERNELPATH`, then `WolframScript.conf`
5. Platform scan, newest version wins
6. `wolfram` or `WolframKernel` on `PATH`, then the installation `doctor` recorded, if
   step 7 is what found it
7. `wolframscript -code '$InstallationDirectory'` — the only step that starts a kernel, so
   only `doctor` runs it. A session, the LSP and the library's `createWolframServer` stop at
   step 6; a kernel only `wolframscript` knows about is reached by running `doctor` once,
   which records it

Step 4 outranks the scan deliberately. It is a preference somebody recorded, whereas
"highest version number on disk" is a guess — and on a machine with an experimental build
installed alongside a stable one, the highest version is not the one you meant. Set
`WOLFRAM_MCP_KERNEL` or `WOLFRAM_MCP_VERSION` to override it.

Version detection never starts a kernel: macOS reads `CFBundleShortVersionString` from
each bundle's `Info.plist`, so a bundle called anything at all still reports its real
version; Windows finds installations in the registry and reads the version out of the
install path; Linux reads the version directory name — through symlinks, because the
`wolfram` a Linux install puts on `PATH` is one, and the version is in its target's path.
The `wolframscript` last resort is
the exception only in the sense that it already started a kernel to ask — the version
comes back in the same call.

`wolfram`, `WolframKernel` and `MathKernel` are the same binary — on macOS `wolfram` and
`MathKernel` are symlinks to `WolframKernel` — so any of them works. Whichever you name,
the canonical `wolfram` is reported, matching Wolfram's own generated configuration.

## Kernel lifetime

| Variable | Default | Meaning |
|---|---|---|
| `WOLFRAM_MCP_IDLE_MINUTES` | `10` | Shut a kernel down after this long without a call. `0` keeps it resident. |
| `WOLFRAM_MCP_START_TIMEOUT_SECONDS` | `120` | One deadline for everything before a kernel takes its first request: the kernel's handshake on a private kernel; attaching to the broker and waiting for the broker's own preparation when shared. The error names the stage it ran out in. A shared kernel's handshake happens when a slot is granted, which a session cannot tell from waiting for one, so the broker bounds each of its kernel starts by this same value instead. A cold broker can therefore take nearly two of these before a shared session sees an error (D19). |
| `WOLFRAM_MCP_CALL_TIMEOUT_SECONDS` | `300` | Answer the caller with an error after this long. The kernel is left running — see below. |
| `WOLFRAM_IDLE_MINUTES`, `WOLFRAM_START_TIMEOUT_SECONDS`, `WOLFRAM_CALL_TIMEOUT_SECONDS` | — | Aliases for the above. |

The 10-minute default is not arbitrary. With Poisson arrivals at rate λ and a kernel that
dies `T` after the last request, `P(cold start) = e^(−λT)` and `P(resident) = 1 − e^(−λT)`,
which sum to exactly 1 — so fixing your cold-start rate fixes residency, at any traffic
level. Ten minutes targets 5% cold starts at about 18 calls/hour.

The call timeout is a deadline for the **caller**, not the kernel. A kernel sends no
progress notifications, so a busy kernel and a hung one look identical from outside, and
killing at the deadline would destroy every long evaluation that was about to succeed.
When the deadline passes the caller is told there was no answer in time; the kernel keeps
working, a reply arriving late counts as proof of life, and the kernel is stopped only
when someone else needs its seat or the caller cancelled. A call whose arguments carry a
longer `timeConstraint` raises its own deadline to match, so a request for ten minutes is
not answered at five.

## Sharing kernels, and licence seats

A kernel costs a licence seat and most licences allow 2 or 4, so these matter more than
they look.

| Variable | Default | Meaning |
|---|---|---|
| `WOLFRAM_MCP_SHARE` | `1` | `0` to keep a private kernel instead of sharing one through a broker. |
| `WOLFRAM_MCP_RUNTIME_DIR` | see below | The directory for the broker's socket, created private if it does not exist. It must belong to you and be writable by no one else, or sessions decline to share and use private kernels. Unset: `XDG_RUNTIME_DIR`; else the system temporary directory if it passes that test (macOS's per-user one does); else `run/` under the cache directory, created private — which is what a headless Linux host or a container without `XDG_RUNTIME_DIR` gets. |
| `WOLFRAM_MCP_MAX_KERNELS` | from licence | Hard cap on pooled kernels. Overrides the arithmetic below, within the absolute cap of 8. |
| `WOLFRAM_MCP_RESERVE_SEATS` | `1` | Seats to leave free, so agents cannot lock you out of Mathematica. |
| `WOLFRAM_MCP_LICENSE_LIMIT` | as kernels report | What the licence permits: a positive integer, or `unlimited`. Setting it overrides what kernels report. |
| `WOLFRAM_MCP_INSPECT` | `1` | `0` to ignore what kernels report about the installation and stay at a single kernel. |

Budget arithmetic, when `WOLFRAM_MCP_MAX_KERNELS` is unset:

| `$MaxLicenseProcesses` | reserve | budget |
|---|---|---|
| 1 | 1 | 1 — **the reserve cannot be honoured**, see below |
| 2 | 1 | 1 |
| 4 | 1 | 3 |
| unlimited | 1 | 4 (a default, not a limit) — the reserve does not apply |
| could not be read | 1 | 1 |

The budget never falls below one kernel, because a budget of zero is a server that can
never answer. On a single-seat licence that means the pool takes the only seat and
`WOLFRAM_MCP_RESERVE_SEATS` does nothing; `doctor` says so rather than leaving you to work
it out from the arithmetic.

An unreadable limit stays conservative rather than assuming unlimited: growing the pool on
the machines we understand least is the wrong way round.

**A broker already running keeps the budget it started with**, so changing
`WOLFRAM_MCP_LICENSE_LIMIT` in a later session has no effect until that broker exits.

## Caching

| Variable | Default | Meaning |
|---|---|---|
| `WOLFRAM_MCP_CACHE` | `1` | `0` to always ask a kernel for the tool list instead of answering from disk. |
| `XDG_CACHE_HOME` | `~/.cache` | Where the caches live (macOS and Linux). |
| `LOCALAPPDATA` | `%LOCALAPPDATA%` | Same, on Windows. |
| `XDG_RUNTIME_DIR` | temp dir | Where the broker's socket lives (not used on Windows, which uses a named pipe). |
| `XDG_CONFIG_HOME` | `~/.config` | Searched for `WolframScript.conf`, after the platform's own location. |
| `APPDATA` | — | Searched for `WolframScript.conf` on Windows. |
| `ProgramFiles`, `ProgramFiles(x86)` | — | Scanned for installations on Windows. |

Two caches, both under the cache directory:

- `capabilities/<digest>.json` — the tool and prompt lists, so `tools/list` can be answered
  before any kernel starts. One file per key, digested from kernel path, kernel version,
  server name and package version; rewritten from the live kernel on every kernel start.
  A file per key because a single `capabilities.json` held one key at a time: two projects
  on different server names evicted each other, so every launch of either was cold — and a
  cold `tools/list` starts a kernel. `doctor` prints the file the current configuration
  reads.
- `installations/<digest>.json` — what the last kernel reported as it started: version, the
  three base directories, licence limit and type, the account, and the AgentTools version
  that loaded. Rewritten on every kernel start, so a paclet that updates itself shows; keyed
  on the binary's path, mtime and size, so an in-place upgrade invalidates it.

`wolfram-mcp-server clear-cache` removes both; deleting them by hand is just as safe.

## The Claude Code plugin

| Variable | Default | Meaning |
|---|---|---|
| `WOLFRAM_MCP_LSP` | on | `1`, `true`, `on` or `yes` runs the LSP kernel; `0`, `false`, `off` or `no` keeps it off. When set, it wins over the plugin option. |

The plugin's `lsp` option is read next, when `WOLFRAM_MCP_LSP` is unset, blank or an
unsubstituted `${…}`. Claude Code gives plugin options only to hooks, so the plugin's
SessionStart hook records it as `lsp-option` in the plugin's data directory
(`CLAUDE_PLUGIN_DATA`), where the LSP server reads it; unset, the default holds. The option
used to arrive as `${user_config.lsp}` in the LSP server's own entry, and a client with no
stored value for it — a plugin synced from an upload, as Claude Desktop does, or loaded with
`--plugin-dir` — then refused to load the LSP server at all. Clients before 2.1.75 give
neither process a data directory, so there only the variable switches it.

Anything else in either is off, with a stderr line saying so: guessing "on" from a typo would
spend the seat you may have been trying to keep. Off answers the handshake itself, with no
capabilities and no kernel.

The plugin's LSP server is a full WolframKernel running Wolfram's `LSPServer` paclet —
measured, it starts on the first Wolfram Language file the session touches, and then holds one
licence seat for the rest of the session. On a two-seat licence that seat plus an evaluation kernel is
the whole licence, which is exactly the lock-out `WOLFRAM_MCP_RESERVE_SEATS` exists to
prevent. It is on by default all the same (plugin plan D23): a session working on Wolfram
Language files wants it, and one that opens none spends nothing. Turning it off — the
plugin's `lsp` option, or `WOLFRAM_MCP_LSP=0` — keeps that seat. Off, the evaluation tools keep working
and code intelligence is absent. The launcher honours the same discovery
variables as the server — `WOLFRAM_MCP_KERNEL`, `WOLFRAM_MCP_VERSION` — so both halves of the
plugin always name the same installation.

## Logs

| Variable | Default | Meaning |
|---|---|---|
| `WOLFRAM_MCP_LOG` | unset | A file to append the shared broker's output to. |

The server itself logs to stderr, which its client captures — for Claude Desktop that is
`~/Library/Logs/Claude/mcp-server-*.log`, and for Claude Code
`~/.cache/claude-cli-nodejs/…`. Nothing in that path needs configuring.

The broker is different. It is started detached, so nothing owns its stderr and its output
is discarded: the pool budget it derived, the licence it found, why a kernel would not
start. `WOLFRAM_MCP_LOG` gives it somewhere to write, and is worth setting the moment
sharing behaves in a way you cannot explain.

## Passed *to* the kernel

These are set on the kernel process rather than read from yours, matching what Wolfram's
`InstallMCPServer` writes into a client configuration. **Anything already set in the
environment wins** — an explicit `WOLFRAM_USERBASE` is a deliberate choice, not something
to overwrite with a reported one.

| Variable | Source |
|---|---|
| `MCP_SERVER_NAME` | The resolved server name. `StartMCPServer[]` reads it itself. |
| `WOLFRAM_BASE` | `$BaseDirectory`, as an earlier kernel reported it. |
| `WOLFRAM_USERBASE` | `$UserBaseDirectory`, as an earlier kernel reported it. |
| `WOLFRAM_LOCALBASE` | Expanded `$LocalBase`, as an earlier kernel reported it. |
| `MCP_TOOL_OPTIONS` | **Yours, passed through untouched.** See below. |

The base directories matter because a client launches the server with a sparse
environment, and a kernel that computes the wrong user base cannot find the AgentTools
paclet — which presents as a start failure, not as a missing-file error.

### `MCP_TOOL_OPTIONS`

Not this server's variable, and the one place its behaviour depends on something it does
not control. AgentTools reads it at kernel startup, parses it as JSON, and it becomes
`$toolOptions` — what `toolOptionValue[tool, option]` returns. So this:

```json
{ "MCP_TOOL_OPTIONS": "{\"WolframLanguageEvaluator\":{\"TimeConstraint\":600}}" }
```

gives you a ten-minute evaluator, and the 60 s quoted everywhere as "the evaluator's time
constraint" is only its default.

This server therefore never asserts a per-tool time limit and never sends a
`timeConstraint` of its own: either would be overriding a setting that is yours. It only
raises its own *caller* deadline when a call asks for longer, so a request for ten minutes
is not answered at five. It reaches the kernel because the whole environment is passed
through; a check pins that, since nothing else would notice it being dropped.

### Everything else Wolfram's server reads

The kernel inherits this server's whole environment, so a variable Wolfram's own MCP
server reads can be set in the client's `env` block without this package knowing anything
about it. Beyond the two above, AgentTools 2.2.7 reads:

| Variable | Read for |
|---|---|
| `WOLFRAM_CLOUDBASE` | Read once at server start and written to `$CloudBase`, so cloud requests go to the cloud you name. MCP Apps assets are rewritten to match. |
| `LLMKIT_ENABLED` | Only a value that reads as false (`false`, `no`, `0`) disables LLMKit; the context tools then act as if there is no subscription, without emitting subscription warnings. `InstallMCPServer`'s `"EnableLLMKit" -> False` writes exactly this. |
| `MCP_APPS_ENABLED` | `false` (case-insensitive) turns off MCP Apps UI resources; anything else, or unset, leaves them on for clients that support them. |
| `MCP_APPS_NOTEBOOK_METHOD` | Experimental switch for how MCP Apps deliver notebooks; unset means the default. |

These are the paclet's variables, not this server's: the list is what 2.2.7 reads, and a
paclet upgrade can grow it without this document noticing. `doctor` reports any of them it
finds set.

## Worked examples

Not published to a registry, so every example names a clone — absolute path, because an
MCP client does not guarantee the working directory it launches a server from. Run
`npm install` in the clone once; that builds `dist/` via the `prepare` script.

The default. Auto-detect, share a kernel, keep a seat free:

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

A 2-seat licence, stated rather than reported, on a specific installation:

```json
{
  "mcpServers": {
    "WolframLanguage": {
      "command": "node",
      "args": ["/absolute/path/to/wolfram-agent-tools/dist/index.js"],
      "env": {
        "MCP_SERVER_NAME": "WolframLanguage",
        "WOLFRAM_MCP_VERSION": "15.0",
        "WOLFRAM_MCP_LICENSE_LIMIT": "2"
      }
    }
  }
}
```

One kernel to yourself, nothing shared, nothing cached — for debugging:

```json
{
  "mcpServers": {
    "wolfram": {
      "command": "node",
      "args": ["/absolute/path/to/wolfram-agent-tools/dist/index.js"],
      "env": {
        "WOLFRAM_MCP_SHARE": "0",
        "WOLFRAM_MCP_CACHE": "0",
        "WOLFRAM_MCP_INSPECT": "0",
        "WOLFRAM_MCP_IDLE_MINUTES": "0"
      }
    }
  }
}
```
