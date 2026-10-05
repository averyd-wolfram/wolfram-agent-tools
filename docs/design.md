# Design notes

Why this exists, how it is put together, and the failure modes that shaped it. The
[README](../README.md) covers how to *use* it; this file is for changing it.

## What it is

A Wolfram kernel already ships an MCP server. The `Wolfram/AgentTools` paclet turns a
kernel into one with a single expression, and Wolfram's own `InstallMCPServer` will
write that into a client's config for you:

```
wolfram -run 'PacletSymbol["Wolfram/AgentTools","Wolfram`AgentTools`StartMCPServer"][]' -noinit -noprompt
```

So the interesting question is not "how do I get Wolfram tools into an MCP client" —
that already works. It is **what you give up by pointing a client straight at a
kernel**, which is two things:

1. **Startup cost you pay whether or not you use it.** Clients launch every configured
   server at boot and enumerate tools immediately. A kernel takes 2 s to reach the MCP
   handshake on 15.1, and 11 s on 14.3, and costs a licence seat for as long as
   it lives.
2. **A protocol channel that shares a pipe with human-readable output.** Anything the
   kernel writes to stdout that is not JSON-RPC kills the session: license banners,
   stray `Print[]`, `Message[]` warnings during a paclet load, and — observed in
   practice — the kernel's own `Syntax::sntxf` echo of input it could not parse.

This package is therefore an MCP server that is also an MCP *client*. It sits between
the two and buys back both properties: it answers `initialize` and `tools/list` from
disk without touching Wolfram, starts a kernel only when a request genuinely needs one,
kills it again when idle, and filters the kernel's stdout so non-protocol lines go to
the log rather than the parser.

```
client ──stdio──> wolfram-mcp-server ──stdio(filtered)──> wolfram kernel
                  │
                  ├─ tools/list   → cache, no kernel          (~0 ms)
                  ├─ tools/call   → lazy start, serialized     (~2 s once)
                  ├─ kernel start → re-read tool list, notify on change
                  └─ idle N min   → kernel killed, restarts transparently
```

Measured: a client connects and enumerates tools in ~400 ms with no Wolfram process in
sight; the first actual tool call pays ~2 s.

Every timing in this file is a **single measurement on one machine**, taken when the
surrounding text was written, against Wolfram 15.0.0 and AgentTools 2.2.7. They are here to
show a shape — cold versus warm, one order of magnitude versus another — not as figures to
compare a later run against. Nothing derives or re-checks them, deliberately: `metrics.mjs`
covers the counts and refuses the latencies, and the benchmark that would replace them is
`plan.md` §6.4, deferred. Treat a number here as evidence of what happened once.

## Module map

`src/` is TypeScript, compiled to `dist/`; `npm run metrics` prints how large it is and
how that is distributed. Not published to npm — it runs from a clone.

| File | Responsibility |
|---|---|
| `index.ts` | CLI entry: `serve` (default), `doctor`, `broker`, `lsp`, `clear-cache`, `--help`, `--version` |
| `lsp.ts` | The `lsp` subcommand: Wolfram's LSPServer on the discovered kernel, or a no-capability stub |
| `proxy.ts` | The MCP server: request handlers, capability negotiation, cache policy |
| `backend.ts` | The seam between the proxy and a kernel, and the broker-or-private decision |
| `prepare.ts` | One deadline over a whole preparation, and the back-off after a failed one |
| `kernel.ts` | Kernel lifecycle: lazy start, bounded startup, idle timer, serialization |
| `transport.ts` | stdio client transport with stdout filtering and a spawn gate |
| `pool.ts` | Several kernels behind a licence-derived budget, with FIFO waiters |
| `broker-server.ts` | The shared-kernel daemon: owns the pool, exits once the last proxy leaves |
| `broker-client.ts` | A backend that forwards to that daemon, and starts one if none is listening |
| `broker-protocol.ts` | Socket address, newline-delimited framing, and the version that keeps mismatched peers apart |
| `locate.ts` | Cross-platform install discovery and version detection |
| `config.ts` | Environment parsing, server-name validation, per-server capability defaults |
| `flavour.ts` | Which environment values decide whether two sessions may share a kernel |
| `wolframscript.ts` | Wolfram's own recorded kernel preference, read from disk |
| `inspect.ts` | What a kernel reports about its installation, and the cache of it |
| `cache.ts` | The on-disk capability cache, keyed and atomically written |
| `doctor.ts` | The diagnostic report |
| `log.ts` | The stderr logger — the only output channel that is not the protocol |
| `lib.ts` | Public API for embedding |
| `version.ts` | `PKG`, resolved correctly in every packaging mode |

Four invariants worth preserving:

- **Nothing but JSON-RPC reaches stdout.** All logging goes through `log.ts` to stderr.
  `doctor` writes to stdout only because it is not speaking MCP.
- **A kernel evaluates one expression at a time.** `KernelSession.run` queues work.
  Anything that talks to the kernel goes through it, including the background refresh.
- **Capabilities are frozen at `initialize`**, which happens before we are allowed to
  start a kernel. Anything capability-shaped has to be answerable from disk or from a
  static table.
- **Sharing is an optimisation, never a dependency.** Every way the broker can fail ends
  in a private kernel, with the reason logged. A session must not need a second process to
  be answerable.

## The four mechanisms

**Lazy start with idle shutdown.** `KernelSession` owns at most one kernel. `ensure()`
collapses concurrent starts onto one promise; `run()` serializes work and resets the
idle timer. The default idle timeout of 10 minutes is not arbitrary — modelling arrivals
as Poisson with rate λ and a kernel that dies `T` after the last request gives
`P(resident) = 1 − e^(−λT)` and `P(cold start) = e^(−λT)`, which sum to exactly 1. The
tradeoff is scale-free: fixing your cold-start rate pins residency at one minus it, at
any traffic level. Ten minutes targets 5% cold starts at ~18 calls/hour.

**Filtering transport.** `FilteringStdioTransport` implements the SDK's `Transport`
interface but routes any stdout line that does not begin `{` or `[`, or that fails to
parse, into the log instead of the message stream. It also keeps a ring buffer of the
last 15 such lines, which is what makes startup failures diagnosable.

**Capability cache.** A latency cache, never a source of truth. Keyed on kernel path,
kernel version, server name, and this package's version; written atomically (temp file plus
rename) because several clients can run this server concurrently against one kernel.
Rewritten from the live kernel on *every* kernel start, and `tools/list_changed` is
emitted when the contents differ.

**Discovery.** See [environment.md](environment.md) for the full order. Two decisions
worth the words:

*Wolfram's own preference outranks the scan.* `wolframscript` records the kernel it uses
in `WOLFRAMSCRIPT_KERNELPATH`, either in the environment or in a plain-text
`WolframScript.conf`. Reading it costs nothing — no kernel, no seat — and it is a recorded
choice rather than a guess, so it beats "highest version number on disk". That matters
concretely: a machine with an experimental 15.1 build alongside a stable 15.0 has a
highest version that is not the designated one, and the scan alone would pick the
experiment.

*Bundle names mean nothing.* An installation can be called anything, so the macOS scan
tries Wolfram-named bundles first because that is sub-millisecond, then sweeps every
bundle (~30 ms for a hundred apps) if that finds nothing. Version always comes from
`CFBundleShortVersionString`, never from the folder name. A reachable *executable* kernel
binary is the real filter.

`wolfram`, `WolframKernel` and `MathKernel` are one binary — on macOS the first two are
symlinks to the third, identical digest, differing only in `$CommandLine[[1]]` — so any
of them works, and paths are normalised to the canonical `wolfram` so what we report
matches Wolfram's own generated configuration.

## Failure modes, and what they taught us

Each of these was found by running the thing, not by reading it. They are the reason the
code looks the way it does, and `test/smoke.mjs` has a section pinning each one.

**A failed spawn wedged the server permanently.** `close()` awaited an `exit` event,
which never fires for a process that never existed. Because the startup path called
`close()` *before* rethrowing, the error was swallowed, the in-flight start promise never
settled, and every subsequent `tools/call` hung forever — the server stayed alive
answering `initialize`, so it looked healthy. Trigger: pointing `WOLFRAM_MCP_KERNEL` at
`/Applications/Wolfram.app`, which is what a macOS file picker hands back, since the OS
presents a bundle as a single file.

*Fix:* `start()` now waits on Node's `spawn`/`error` pair — exactly one always fires —
so a bad path rejects immediately. `close()` is independently bounded. Bundles resolve
into the binary inside them, and non-executable files are rejected up front. Three
consecutive calls now fail in 6 ms, 3 ms, 1 ms rather than hanging.

**One transient `tools/list` failure disabled the server forever.** The refresh
initialized `tools = []`, caught the upstream error, and then persisted the empty array
and assigned it in memory. `[]` is truthy, so the cache was thereafter "valid" and served
zero tools — across restarts, until the TTL expired.

*Fix:* on failure, keep the last known-good list and write nothing. A cold failure returns
an error rather than an empty list, because an empty list is a lie the client caches.

**The cache never revalidated.** The refresh ran only when the tool cache was empty —
that is, only when there was nothing to refresh. A `Wolfram/AgentTools` upgrade that
changed the tool list would go unnoticed for the whole TTL.

*Fix:* the refresh moved into an `onReady` hook that runs on every kernel start, inside
the session so it stays serialized.

**The version floor was below what the paclet supports.** The default was 14.1. Measured:
14.1.0 and 14.2.1 both die with ``Get::noopen: Cannot open Wolfram`AgentTools` ``, and
14.3.0 works. The paclets declare `14.3+` (2.1.37) and `15.0+` (2.2.7).

*Fix:* the floor is 14.3. While fixing it, the `wolframscript` fallback turned out to
bypass the floor entirely, so it now asks for `$InstallationDirectory` and `$Version`
together and refuses anything too old.

**`wolframscript` was being returned as a kernel.** It is on `PATH` on nearly every
machine with any Wolfram product, so it silently masked the "no install found" diagnostic
path. But it is a script runner: it does not accept the `wolfram -run` convention, and it
never speaks MCP — it emits `Syntax::sntxf` and hangs to the start timeout.

*Fix:* used only as a locator, then discarded.

**Every startup failure blamed licensing.** The timeout message asserted an unactivated
Wolfram Engine waiting on stdin, regardless of cause — while the real reason
(``Cannot open Wolfram`AgentTools` ``, or `MCPServerNotFound` from a mistyped server name) had
just been captured on stdout and thrown away.

*Fix:* the transport's ring buffer is appended to startup errors. One change fixed the
diagnostics for the two failures above and for the paclet-download case.

The through-line: **every one of these presented as a hang or as silence.** None would
produce a stack trace or a bug report, which is why `doctor` exists and why the error
paths carry the kernel's own words.

## Verified upstream contract

Facts about `Wolfram/AgentTools` that the TypeScript hardcodes. `test/agenttools-contract.wlt`
asserts them against a live kernel, so a paclet upgrade that breaks one fails a test
instead of the server.

- `KERNEL_ARGS` is `$defaultCommandLineArguments`, verbatim.
- The server name travels as `MCP_SERVER_NAME` — Wolfram's own variable — because
  `StartMCPServer[]` reads it itself rather than taking an argument.
- An *unset* `MCP_SERVER_NAME` falls back to a default server. Any other string is passed
  to the kernel as given, because the name space is open: `MCPServerObject` tries the
  user's own `Servers/<name>/Metadata.wxf` under `$UserBaseDirectory` *first*, then the
  built-ins, then a paclet-qualified `Publisher/Server` that any paclet may declare — and
  will fetch that from the repository if it is not installed. So a name we do not
  recognise is ordinarily somebody's own server, and `resolveServerName` used to
  substitute the default for it, silently serving a different server's tools.
- A name that genuinely does not resolve fails as `MCPServerNotFound` and the kernel then
  runs on as a non-server, so nothing ends the wait but the start timeout. `kernel.ts`
  watches the kernel's output for that message and fails immediately instead, which is
  what makes passing the name through safe.
- All four built-in servers advertise `prompts`; none advertise `resources`. Tool counts:
  `Wolfram` 3, `WolframLanguage` 7, `WolframAlpha` 2, `WolframPacletDevelopment` 13.
- Sessions survive a kernel restart. The evaluator persists session state to disk and
  tells the model what was and was not restored, which is what makes idle shutdown safe.

## Sharing a licence-limited resource

A kernel costs a licence seat, and `$MaxLicenseProcesses` is commonly 2 or 4. That is the
binding constraint, not memory — a freshly started kernel is around 50 MB resident, and
the 410 GB virtual size that `ps` reports is address-space reservation, not usage. One
agent session plus an open Mathematica window fills a 2-seat licence, so a server taking
one kernel per session locks the user out of their own installation.

Sharing is bounded by more than the seat count, though. A kernel reads its environment
once, at startup — `MCP_TOOL_OPTIONS` decides each tool's effective options, including the
evaluator's `TimeConstraint` — so two sessions configured differently cannot be served by
one kernel. `flavour.ts` says which values decide that, and a broker starts a kernel per
flavour rather than lending out whichever it has: three projects on default settings share
one, and the one that overrides its tool options gets its own. The budget still counts
seats rather than kinds, so a pool at its limit retires an idle kernel of another flavour
to make room instead of overrunning the licence. Measured before this existed: two
sessions on one server name, one asking for a `TimeConstraint` of 600 and the other 10,
and the second one's calls ran with 600.

There is no upstream escape hatch. `MCPServerObject` validates a `"Transport"` of
`"StandardInputOutput" | "HTTP" | "ServerSentEvents"`, but every default server is
`"StandardInputOutput"` and `startMCPServer` unconditionally runs a stdin/stdout
`While[True, ...]` loop; HTTP exists only on the cloud path. So sharing has to happen on
our side.

**Shape.** The first server process that needs a kernel starts a detached broker; every
other process attaches over a Unix socket, or a named pipe on Windows.

```
client A ──stdio──> proxy A ──┐
client B ──stdio──> proxy B ──┼──socket──> broker ──> KernelPool (1..budget)
client C ──stdio──> proxy C ──┘
```

**The broker does not speak MCP.** The proxy is already the MCP server — it owns
capability negotiation, the disk cache and the client handshake — so the broker's surface
is a handful of operations (`listTools`, `callTool`, `status`, …) over newline-delimited
JSON. That avoids re-implementing JSON-RPC id remapping and session semantics inside it.

**Addressing.** The socket path is a digest of protocol version, package version, kernel
binary and uid — deliberately *not* the server name. It used to be, and every name then ran
its own broker deriving a full budget from one licence; the name lives in a session's
flavour now, so one broker serves them all. Protocol and package version are in there so a
proxy never talks to a broker it cannot understand; the kernel binary because a broker runs
the one it was started with; uid because a socket in a shared temp directory would otherwise
be reachable across accounts. The digest is short because a macOS `sockaddr_un` path is
capped at 104 bytes.

**Startup race.** Whoever binds the socket wins. A loser sees `EADDRINUSE`, tries to
connect, and stands down if something answers. A leftover socket from a killed broker is
indistinguishable from a live one by inspection, so the liveness check *is* a connection
attempt; only a socket that refuses connections is unlinked.

**Budget.** Only a kernel can read `$MaxLicenseProcesses`, so the pool starts at one and
asks the first kernel it starts, then caches the answer. `deriveBudget` is a pure
function so the 2- and 4-seat cases can be tested on a machine that has neither.

| licence | reserve | budget |
|---|---|---|
| 2 seats | 1 | 1 |
| 4 seats | 1 | 3 |
| unlimited | 1 | `UNLIMITED_BUDGET` (4) |
| unknown | 1 | unchanged |

`"unknown"` and `"unlimited"` are separate cases deliberately. An early version conflated
them, so a licence string it failed to parse read as unlimited and grew the pool to its
cap — worst behaviour on the machines we understand least. The fake kernel exposed it
immediately, because its canned reply does not parse.

**Sharing is never a dependency.** Any failure to reach or start a broker falls back to a
private kernel, with the reason logged. It is an optimisation of a scarce resource, not a
requirement for the server to work.

**What it does not fix.** A kernel is single-threaded, so requests beyond the budget
queue. With a 2-seat licence that means one kernel serving every session; agent calls are
usually well under a second, and `WOLFRAM_MCP_CALL_TIMEOUT_SECONDS` bounds the worst case.

**Two bugs this introduced, both caught by tests rather than review:**

- *Reentrancy deadlock.* Routing the post-start cache refresh through the backend meant
  it re-entered the very queue that was holding the kernel. The ready hook now receives
  `DirectOps` — unqueued access to the client already in hand — which is what the original
  `onReady(client)` signature had provided for free.
- *An `unref`'d timer that was load-bearing.* The broker connect-retry loop used an
  unref'd `setTimeout`, copied from the idle timers where unref is correct. In `serve`,
  stdin holds the event loop open and it worked; in `doctor` nothing else was pending, so
  node exited mid-wait and the await never settled. Retry delays are work being waited
  on, not background timers.

## What a kernel knows about its installation

Three things we need can only come from a running kernel: the licence seat limit is
encoded in the password token rather than stored in plain text (`mathpass` holds
activation keys, not limits), and `$BaseDirectory` / `$UserBaseDirectory` / `$LocalBase`
are computed. Starting a kernel spends a licence seat, the resource we are conserving.

These used to come from a separate probe: one throwaway kernel per installation, cached
until the binary changed. On a cold machine that made two kernels in a row, the probe and
then the one that served, on licences that permit two or four; and a paclet that updated
itself left the cached AgentTools version stale, because the binary had not changed
(plugin plan D20). So every MCP kernel now reports these itself. `KERNEL_ARGS` runs the
paclet's own `PacletSymbol` load, then `FACTS_EXPRESSION`, then the paclet's own start
expression, unchanged: the facts are one line of JSON between markers, which the
transport hands to the session as kernel output, and the session's owner records them on
every start. Written after the load, the AgentTools version is the one that serves, and
written before the server starts, the facts still arrive when the paclet then fails. A
kernel that dies before evaluating anything, unactivated or refused a seat, reports
nothing. Measured on 15.0.0, the expression adds about a second to a kernel's start.

With nothing cached, the pool starts at one kernel, the existing reading of an unknown
licence, and re-derives its budget when that kernel reports. `WOLFRAM_MCP_LICENSE_LIMIT`
states the limit and overrides the report; `WOLFRAM_MCP_INSPECT=0` ignores the reports
and stays at one kernel.

The base directories matter more than they look. Wolfram's own `InstallMCPServer` writes
`WOLFRAM_BASE`, `WOLFRAM_USERBASE` and `WOLFRAM_LOCALBASE` into the client config
explicitly, because a client launches the server with a sparse environment and a kernel
that computes the wrong user base cannot find the AgentTools paclet. We do the same for
every kernel after the first, with anything already in the environment winning — an
explicit `WOLFRAM_USERBASE` is a deliberate choice, not something to overwrite with a
reported one. The first kernel gets none, and loses nothing by it: it inherits the
environment the reported values would have been computed in, so it arrives at the same
directories itself.

## Settled, so it is not relitigated

Each of these was decided on evidence; reopening one needs new evidence, not a new opinion.

- Explicit configuration fails closed; the version pin outranks `WOLFRAM_HOME`.
- macOS and Linux, both verified on real machines. Windows stays parked in `plan.md` §9 —
  the named-pipe uid collision, and what stands in for a socket mode on a pipe — not
  forgotten.
- The seat reserve keeps its floor of one kernel, and says when it cannot be honoured.
- Not published to npm — re-verified, `npm view` returns 404 — so nothing may print an
  `npx wolfram-mcp-server` instruction. A smoke check used to assert one was present.
- A failure is not evidence that the kernel is broken, and the kernel cannot be asked, so
  decide from the shape of the failure instead. No probes. (*The call timeout*, below, is why.)
- **No hand-written figures in prose.** `npm run metrics` derives them and the suite prints
  its own size. The checks that once gated prose were removed on 2026-10-03 (plugin plan D15:
  tests test functionality); keeping a doc true is the job of whoever changes what it
  describes.
- **A socket that accepts is not a broker that runs.** Attach sends a `ping` and waits: a
  SIGSTOPped broker still accepts, because the listen backlog is the OS's. Measured before the
  fix — a session met a frozen broker, logged `attached to the broker`, and paid its whole
  10 s call ceiling (12.1 s) to be told `isError`; now it gives up after the 2 s probe and
  answers from a private kernel in 2.2 s. Two parts of that are load-bearing:
  - it is answered in the connection reader, **ahead of the `await preparing`** every other op
    waits on, because a cold broker spends up to two minutes resolving the licence and a probe
    queued behind that calls a healthy broker dead;
  - **`BROKER_PROTOCOL` was not bumped.** Adding an op is not a change of frame shape, and
    bumping strands every running broker on the old path holding its seats while new sessions
    build a second pool against the same licence. Any reply counts as proof of life, including
    the `unknown broker op` refusal an older broker gives, which is what makes that safe.
- **A server name we do not recognise is the user's, not a mistake.** `MCP_SERVERS` is the
  paclet's built-in set, not its vocabulary: `MCPServerObject` resolves a user's own server
  from `$UserBaseDirectory/ApplicationData/Wolfram/AgentTools/Servers/<name>/Metadata.wxf`
  *before* the built-ins, and a paclet-qualified `Publisher/Server` after them — fetching
  that from the repository if need be. `resolveServerName` used to substitute the default
  for every name outside the four, so somebody's own server silently became `Wolfram`'s
  three tools with one line on stderr. It passes the name through now. The old comment in
  `config.ts` claimed the table *was* the paclet's vocabulary, and the `.wlt` appeared to
  justify the whitelist while only ever testing a typo — a typo and a custom name are
  indistinguishable to that test.
- **An unresolvable name is diagnosed, not pre-empted.** Such a kernel does not fail: it
  prints `No MCPServerObject found for name "…"` and runs on as a non-server, so the only
  thing that ended the wait was the start timeout. Measured: 20141 ms against a 20 s
  timeout before, 198 ms after. `SERVER_NOT_FOUND` in `kernel.ts` watches for the paclet's
  own wording, which the `.wlt` pins.
- **The capability cache is one file per key**, `capabilities/<digest>.json`, keyed on kernel
  path, kernel version, server name and package version. A single `capabilities.json` held
  one key at a time, so two projects on different server names evicted each other and every
  launch of either was cold — which is a kernel start, and so a licence seat, at launch. This
  was the audit's finding S1 and had been open since it was written.
- **Sharing may never change an answer.** A kernel reads its environment at startup, so two
  sessions share a kernel only where their *flavour* matches — every variable the paclet
  reads (pinned by the `.wlt`) plus the `WOLFRAM_*BASE` trio, plus whatever a user names in
  `WOLFRAM_MCP_KERNEL_ENV` for a server of their own. The broker starts a kernel per flavour
  under one seat budget, retiring an idle kernel of another flavour rather than overrunning
  the licence; `kernelReady` is scoped so nobody caches another flavour's tool list; and a
  kernel's environment is built exactly, with every declared name stripped before the
  flavour's own values are applied, so nobody inherits a variable they did not ask for.
  Measured: two kernels served three projects, and one seat served two environments.
- **The audit's S-series is walked and recorded**, item by item, in `plan.md` §0. Eleven fixed
  and one partly (carried into the machine-wide bound). Two have no test and say so: S10's difference is memory retention, and S11's is a constant at
  runtime. The lesson is not about the audit, which was right — it is that a finding which
  never reaches the ordering stays open however good the document that holds it.
- **One broker per installation, not per server name.** The socket path keyed on the name, so
  every name ran its own broker with its own full budget against one licence — measured, two
  names gave `pool budget 3` twice on a 4-seat licence. The name is part of a flavour and the
  pool keys kernels by flavour, so one broker now serves them all on one budget. Two
  *installations* are still two brokers, on purpose: a broker runs the binary it was started
  with, and accepting one from a peer would let anything on the socket choose what it spawns.
- **A diagnostic reports the state at the call, not at construction.** `wolfram_status` read
  the capability cache once, in `createWolframServer`, and closed over it — so a session that
  started cold answered "not cached; the next list starts a kernel" for the rest of its life,
  including after its own first kernel start had warmed the cache a second later, which is
  exactly when the line gets read. It builds its answer from the live `toolCache` now.
  `describeMissingKernel` had always re-scanned per call for the same reason. `doctor`'s
  `reserve` line was the same mistake and has been fixed the same way.
- The docs are the maintainer's to tidy; prefer code and checks over prose.

---

## The call timeout

The first fix here was wrong, and measurement replaced it. **This is settled — do not reopen it
with a table.**

### The three measurements everything follows from

Against a real kernel and the installed paclet, not inferred:

1. **Dispatch is synchronous.** AgentTools' loop is `While[True, processRequest[]]` and
   `tools/call` calls `evaluateTool` inline (`Kernel/Server/Shared.wl`). Measured: a `ping` sent
   500 ms into a 20 s evaluation was not answered until 22.8 s.
2. **No progress, ever.** `grep -i progress` over the paclet's `Kernel` tree returns nothing.
   There is no liveness signal during a call, and `resetTimeoutOnProgress` never fires in
   production.
3. **The per-tool bound is a user setting.** `WolframLanguageEvaluator`'s 60 s is
   `toolOptionValue["WolframLanguageEvaluator", "TimeConstraint"]`, which reads
   **`MCP_TOOL_OPTIONS`** — a JSON environment variable the user puts in their client config
   (`parseToolOptions`, `Shared.wl`). It reaches the kernel only because `kernel.ts` spreads
   `process.env`; a check now pins that.

Together: **a busy kernel and a hung one are indistinguishable from outside**, and any number
this server holds about a tool is an assertion about someone else's configuration.

### Why the table idea is dead

Not merely because it would go stale. A table keyed on tool names would state a `TimeConstraint`
the user may have already changed in `MCP_TOOL_OPTIONS`, and it would say nothing at all about
the tools that actually run for a quarter of an hour: only 2 of 16 declare a constraint, and
`BuildPaclet`, `SubmitPaclet` and `CheckPaclet` are not among them. Passing `timeConstraint`
ourselves is worse still — it would silently override the user's own setting.

### What the ceiling does now

It is a deadline for the **caller**, not for the kernel.

| | |
|---|---|
| Ceiling passes | the caller is answered; the kernel is left running, request still outstanding |
| Its reply arrives later | proof of life. Value discarded, kernel returns to service, sessions intact |
| Someone else needs the seat | *then* it is stopped — `#reclaim`, on demand, so no timer guesses how long a legitimate evaluation may run |
| Caller cancelled | stop the kernel. `notifications/cancelled` cannot work: the serial loop will not read it until the work it would cancel has finished |
| Transport gone | retire |
| Anything else (unknown tool, bad argument, failed evaluation) | the kernel *answered*, so it is alive and idle. Keep it |

The pool encodes the preference: a kernel with nothing outstanding, then a fresh one, then — only
because the budget leaves nothing else — one holding an abandoned call. No seat can leak this
way: the broker exits 60 s after its last proxy detaches whatever its kernels are doing
(`pool.quiet` was never consulted and has been removed), and a private kernel dies with its process.

### What was removed, and why

An earlier commit in that work added a `ping` health probe on the theory that a failure leaves
the kernel's state unknown. Measurement 1 kills that theory: the probe cannot tell busy from
hung, so it killed legitimate long calls and their sessions. The probe is gone, along with its
contract test. The failure *shapes* are individually decidable without asking the kernel
anything, which is what `#fate` does. `tool-dispatch-is-synchronous` in the `.wlt` is what
guards the whole design — if dispatch ever becomes concurrent, all of this needs revisiting.

### Bugs fixed along the way

- A typo'd tool name killed the kernel and every evaluator session on it (measured: one
  `NoSuchTool` call took the kernel count 1 → 2; the identical run without it stayed at 1).
- A private kernel (`WOLFRAM_MCP_SHARE=0`) was never retired at all — the wedged-kernel fix
  lived in the pool, and the pool is the broker's.
- The broker erased the protocol-vs-`isError` distinction `proxy.ts` maintains, so the same
  call was an MCP error when private and an `isError` result when shared. `BROKER_PROTOCOL` is
  now 5 and the frame carries the code.
- A doubled `MCP error -32602: MCP error -32602:` prefix on every relayed protocol error.
- `--help` and the "no usable Wolfram" diagnostic told users to run an unpublished
  `npx wolfram-mcp-server` (registry: 404). A smoke check had been asserting one was present.

### Corrections to earlier claims in this repo

- "A cancelled call really does stop the kernel" — measured against the fake, which reads its
  stdin concurrently. A real kernel cannot receive the notification until the work is done.
  What stops a real kernel is stopping the process.
- "Being wrong about the timeout no longer destroys anything" — was written after the ping
  probe landed and is false: it held only for failures that return promptly.

### Still open, and small

Nothing about tools. The remaining wart is the SDK's unchosen 60 s default on every op that
carries no deadline of its own (`listTools`, `capabilities`, `getPrompt`, …). Those now flow
through the same abandonment machinery when they time out, so the damage is bounded, but the
number is still nobody's choice.

## Teardown reaps the kernel's descendants

`WriteNotebook` makes the kernel spawn a notebook front end (`MathematicaServer`), and
`transport.ts` once killed only the kernel's pid: on teardown that front end was orphaned to init,
where its SharedMemory MathLink busy-polled a dead peer at 100% CPU (caught once after about 50
minutes). The kernel is now spawned as a process-group leader (`detached`) and `close()` signals
the whole group, so its descendants die with it; a transport check proves a spawned child is
reaped. Verified against a live 15.0.0 kernel: the front end lands in the kernel's own process
group (it does not `setsid`), so no descendant sweep is needed. Every teardown path — idle
shutdown, reclaim, failure — funnels through `stop()` → `transport.close()`. The `WriteNotebook`
hang itself is paclet-side (`MathematicaServer`'s markdown-to-notebook conversion) and separate
from this leak.

## Vocabulary

The configuration uses the paclet's own words. What selects a tool set is a **server
name** — one of the names `MCPServerObject` resolves — carried in `MCP_SERVER_NAME`,
which is Wolfram's variable and the one `StartMCPServer[]` reads. An earlier revision
called this a "profile" in a `WOLFRAM_MCP_PROFILE` variable, which invented a second term
for a thing that already had one and made the generated Wolfram config and this one look
unrelated.

## Launching it

Two audiences, two commands, and the reason they differ.

**Outside the repo**, the bin is the interface: `wolfram-mcp-server` after installing the
packed tarball — and `npx -y wolfram-mcp-server` once the package is published. `package.json` declares
`bin: { "wolfram-mcp-server": "dist/index.js" }` and ships only `dist` and `README.md`.

**Inside the repo**, `.mcp.json` is committed and has to work for anyone who clones, which
rules out both of the obvious forms. Measured against Claude Code:

| form in `.mcp.json` | result |
|---|---|
| `node dist/index.js` | connects from the repo root, **fails from `src/`** |
| `node ${CLAUDE_PROJECT_DIR}/dist/index.js` | **fails** — not expanded in `.mcp.json` |
| `node_modules/.bin/wolfram-mcp-server` | **fails** — npm does not self-link a package's own bin |
| `npm exec -- wolfram-mcp-server` | works, but can reach for the registry |
| `npm run --silent mcp` | works from any subdirectory, local code only |

The root cause is that **an MCP client does not guarantee the working directory**. Claude
Code uses the directory `claude` was started in, so a relative path is a coin flip.
`CLAUDE_PROJECT_DIR` *is* present in the server's environment — the kernel can read it —
but `.mcp.json` does not expand it.

`npm run` is the one form that fixes cwd (npm guarantees the package root) while being
incapable of fetching anything. `--silent` matters because stdout is the protocol channel:
any npm chatter there corrupts the stream. `scripts/mcp-server.mjs` then resolves `dist/`
from `import.meta.url` rather than cwd, and reports a missing build as an instruction on
stderr instead of a stack trace.

Earlier revisions used `npm link` and documented it. That was wrong: it is a manual step a
cloner has no reason to know about, and it mutates global state.

## Deliberate omissions

- **No parallelism.** One kernel, one evaluation at a time. Pool `KernelSession`
  instances rather than removing the queue.
- **No `uncaughtException` handler.** An escaped rejection is logged, because the request
  that caused it was already answered. An uncaught exception is left to crash, so the
  client restarts a server whose state is no longer trustworthy.
- **Cold-start capabilities are a static table.** `MCP_SERVERS` in `config.ts` carries
  measured per-server capabilities for the first run, and the cache replaces them once a
  kernel has actually run.
- **The SDK is heavy for what we use.** `npm run metrics` sizes the production tree; most
  of it is express, hono, cors, jose and eventsource, serving HTTP/SSE transports and OAuth
  this server never touches. We already hand-roll the stdio transport, so dropping the
  dependency is feasible; it has not been worth it yet.

## Testing

`npm test` builds and runs the whole suite with no Wolfram installation required, and
reports how many checks it ran — the count is not written down anywhere, here included.
`test/fake-kernel.mjs` stands in for a kernel and can be told to emit banner noise, fail
`tools/list` once, go mute, or report a missing paclet. Sections marked *regression* pin
the failures above.

`test/agenttools-contract.wlt` is the other half and *does* need a kernel — run it with
`npm run test:wl`. A third, `npm run test:custom`, serves a server the user built — created and
removed by the script — through this package on a real kernel, since that is the one path no
fake kernel can stand in for.

One caveat worth knowing: on a machine with a real Wolfram install, a test that expects
discovery to fail can pass vacuously by falling through to that install. Two tests were
written wrong this way before being caught. Hermetic negative tests either trim `PATH` or
use a path nothing on the machine can satisfy.
