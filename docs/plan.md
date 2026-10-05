# Plan

Where this repo goes next, ordered by what it buys. It began as the work list for a
pre-release audit taken 2026-08-21; the audit document itself has been removed — §0 below
records the outcome of every finding it raised — and the inline §-references and S-numbers
are its numbering.

**Status vocabulary.** *Reproduced* = a measurement in this repo's own harness, quoted with
the number. *Traced* = read in the code, not executed. *Repeated* = asserted by an earlier
document and not re-tested. Only reproduced findings get a severity claim.

---

> **Picking this up fresh?** Read `docs/next-session.md` first. It says where things stand; what is settled is in `docs/design.md` —
> including the timeout design and the measurements behind it — and points back here for
> everything else.

## 0. Where we are

The tree typechecks clean, the suite is green, and the architecture is right — nothing
below is a redesign.

**Landed since this plan was written:** all of Phase 0, most of Phase 1, and one item pulled
forward from Phase 2 because a Phase 0 check demanded it.

| Work | Evidence |
|---|---|
| Phase 0 — fake-kernel timing/empty/method-log modes, a responder guard, four regression checks, a hermetic suite, `npm run test:wl` | The four checks failed for their stated reasons before the fixes below, and a sampled process scan across a full run shows the suite starting no Wolfram kernel at all |
| §4.1 — `kernelReady` carries its payload instead of inviting three `pool.run` calls back in | `one tool call starts exactly one kernel — kernels started: 1`, against a 250 ms evaluation that previously produced 3 of 3 |
| §4.5 + S6 — `usable()` on the backend, `DeferredBackend` re-decides instead of latching a corpse, `shuttingDown` is acted on, a rejected factory is no longer cached | A `SIGKILL`ed broker's next call now succeeds on a replacement |
| Broker-path call timeout — a local deadline of `timeoutMs` plus a 2 s grace | A `SIGSTOP`ped broker now fails at 4003 ms against a 2 s timeout, where it used to hang to the client's 20 s ceiling and throw |
| §4.6 — an empty upstream list is never persisted | A session whose kernel reports zero tools no longer poisons the next one |
| §4.13 — `extraEnv` has one owner, `installationEnv`, which probes once and caches | Reproduced first: a private kernel and the licence-limit example from `docs/environment.md` both got `base=(unset)`. All three configurations now get the trio, and `doctor` uses the same environment the server would |
| `inspect.ts` has test coverage at all | The fake kernel now answers the installation probe, so `probeInstallation`, `parseFacts`, the facts cache and `baseDirectoryEnv` are exercised — including §4.2's unreadable-limit case at the parser rather than at `deriveBudget` |
| `BROKER_PROTOCOL` bumped to 2 | The `kernelReady` frame changed shape; old and new peers now use different sockets |
| S1 — a file per cache key, `capabilities/<digest>.json` | Reproduced first: with two server names alternating, *every* launch was cold and started a kernel. Control (one name, twice) started none, which is why the eviction hid |

**The audit's S-series is now walked, item by item.** Only S2 and S6 had ever been named in
this file; S1 was not, and stayed open for two months until it resurfaced in conversation.
The audit was right about all of it — the transfer into this ordering is what failed — so the
whole series is recorded here rather than left to another rediscovery.

| | State |
|---|---|
| S1 one global `capabilities.json` | **fixed** — a file per key, reproduced first |
| S2 licence probe before `listen()` | **fixed** in Phase 1 |
| S3 documented 2-arg `createWolframServer` | **fixed** — `lib.ts`'s header and `README.md` both show the 3-arg form |
| S4 `doctor` spawns a durable broker | **partly**: it can no longer decide what kernels *are*, since flavours are declared per connection, but the broker it leaves behind still holds the pool settings from doctor's own environment for 60 s. Carried into item 5 above |
| S5 `CONFIG_VARS` omits variables; `doctor`'s session lacks `extraEnv` | **fixed** — a smoke check now fails when either drifts |
| S6 `DeferredBackend` caches a rejected factory | **fixed** in Phase 1 |
| S7 paginated cursors have no kernel affinity | **fixed** — both backends drain inside the hold they already have and answer complete lists; no `nextCursor` leaves either. Reproduced first with a paging fake kernel: page 1 only, and a cursor handed to the client |
| S8 `timeoutMs ? … : …` makes `0` behave oppositely | **fixed**, and worse than recorded: `0` means "no ceiling" privately, and on the shared path `0 ?? DEFAULT` kept the zero and made the ceiling 2 s. Measured before the fix: `isError after 2211ms` on a call that needed 3 s |
| S9 the last unterminated line is lost | **fixed** — the buffer is flushed on child exit and on close, before the error that carries it is built. Reproduced with a kernel that writes its reason without a newline and exits |
| S10 `FrameReader` has no buffer cap | **fixed** — 4 MB, mirroring `transport.ts`. No test: the difference is memory retention, which a check cannot see without measuring the heap |
| S11 the socket digest omits `PKG.version` | **fixed** — and it now NUL-separates its inputs, because a server name may contain spaces and `("/Apps/K My", "Prime Finder")` hashed the same as `("/Apps/K", "My Prime Finder")`. No test for the version itself: it is a constant at runtime |
| S12 the suite leaks detached brokers | **fixed** — every broker section kills its own, scoped by runtime directory, and `reapAll` runs on an escaped rejection |

**Process hygiene, measured rather than assumed.** A `SIGKILL`ed broker orphans nothing: its
kernels lose their stdin pipe and exit within ~2 s, verified with a real Wolfram kernel and
checked by parentage so no unrelated kernel was touched. A replacement broker spawned by the
recovery path exits on its 60 s empty grace once the client detaches, taking its kernels with
it. Nothing was left behind in either case.

**Phase 1 is complete.** S2 (bind before probing), §4.14 (a failed kernel is retired rather
than pooled), §4.7 (identity-guarded unlink), §4.8 and §4.9 (`'error'` listeners on
`child.stdin` and the detached spawn) all landed, each with a check verified to fail without
its fix. §4.9's negative test is the clearest of them: without the listener the suite dies with
`uncaughtException: spawn … ENOENT`.

One thing deliberately left:

- **§4.8 has no test.** The listener is two lines and clearly right; triggering a real EPIPE
  means writing to a kernel's stdin across the instant it exits, which is a race no check
  should depend on. The suite proves the equivalent path for the spawn error instead.

**The multi-proxy race is now tested, and it found three real bugs.** Three sessions whose
shared broker is killed used to end with three brokers, each deriving a full pool budget from
the same licence — a ceiling of nine kernels against four seats. Fixing it turned up two
further defects that were invisible while the broker had nowhere to log:

- A stale unix socket surfaces as `EEXIST` or `EADDRINUSE` depending on timing, and only
  `EADDRINUSE` was handled, so a broker meeting a dead socket exited instead of clearing it.
- **`sockaddr_un.sun_path` is 104 bytes on macOS and the kernel truncates rather than
  refusing.** A socket path longer than that — measured at 112 under a deep
  `XDG_RUNTIME_DIR` — binds at a *shortened* path while every check looks at the full one. A
  killed broker's file then becomes invisible and unclearable, no later broker can ever bind,
  and sharing is dead until someone deletes a file they cannot see. `brokerAddress` now
  shortens the filename, and never moves the directory, since the directory is what keeps
  separate groups of sessions apart.

`WOLFRAM_MCP_LOG` exists now (Phase 4 item 1, pulled forward): two investigations stalled
outright on the broker being spawned `stdio: "ignore"`.

What re-testing the review changed:

| Finding | Review said | Reproduced as |
|---|---|---|
| §4.1 pool growth | needs several attached proxies | **one** proxy, **one** call → 3 of 3 kernels; trigger is a **200 ms** evaluation, not proxy count |
| §4.6 empty tool list | PLAUSIBLE | reproduced: `"tools": []` cached, then served as a cache *hit* while the kernel would serve 7 |
| §4.5 dead broker | CONFIRMED | confirmed verbatim; calls 2–5 all `broker is not connected`, no recovery |
| §4.15 install-dir override | CONFIRMED | confirmed, and **zero log lines** — a 14.2 kernel is selected against a `=15` pin, against a `=99` pin, and against the floor, silently |
| broker-path call timeout | (not covered) | reproduced: frozen broker hangs past a 2 s timeout to the client's 20 s ceiling, then throws `-32001` instead of returning `isError` |
| cancellation | (not covered) | reproduced: cancelled call still runs; the next call waits **9877 ms** instead of 5000; kernel never sees `notifications/cancelled` |
| `WOLFRAM_MCP_KERNEL` | (not covered) | reproduced: an unusable path logs one line, then **silently starts a real installation** instead |
| reserve seats | (not covered) | reproduced: licence 1 + reserve 1 → budget 1, reserve void (licence 2 is fine) |

Two findings remain **traced, not reproduced**, and should be tested before they are fixed:
§4.7 (socket unlink deletes a successor) and §4.13 (`extraEnv` never populated on two
documented configs — needs seeded facts for a fake binary, so `writeFacts` has to become
testable first).

---

## 1. Phase 0 — make the failures visible

**Do this first.** Every finding below is live in a tree whose suite is green. The suite is
not weak; it is blind in one specific way: the fake kernel answers instantly, and at least
three of these bugs cannot occur against an instant kernel. Fixes that land without a test
that failed first will regress, and we will not know.

1. **Port the harness modes into `test/fake-kernel.mjs`**: `FAKE_CALL_DELAY_MS` (including a
   negative value meaning "never answer"), an empty-`tools/list` mode, and an optional log of
   every method the kernel receives. All three were needed to reproduce the findings above.
2. **Add a responder guard.** `connect()` must be able to assert that the fake kernel is what
   answered — its results start with `evaluated`, a real kernel's with `Out[1]=`. A silent
   fallback to a real installation is how a broken measurement reads as a pass.
3. **Encode each reproduced finding as a check that fails today**: one call starts one kernel
   at a 200 ms evaluation; a `kill -9`'d broker recovers; a `SIGSTOP`ped broker's calls fail
   at the configured timeout; a cancelled call does not delay the next one; an empty upstream
   list is never cached.
4. **Make the suite hermetic** (§6.4). Nothing in `npm test` may reach `fromWolframScript`;
   the `minVersion: "9999"` check needs a scan it can miss without falling through to a real
   kernel and a real seat.
5. **Wire `test/agenttools-contract.wlt` into a script** — `npm run test:wl` — so the upstream
   contract is checked by something other than a human remembering.

Exit criterion: the new checks fail, for the stated reason, and nothing in the suite starts a
real kernel.

## 2. Phase 1 — the broker, correctness

The broker is the newest and largest subsystem and holds every verified severe finding.

1. **§4.1 — stop `kernelReady` re-entering the pool.** The broadcast is a "come and ask me"
   ping, and the asking goes back through `pool.run` while the originating slot is still busy.
   Fix the shape, not the symptom: **make the event carry its payload** — capabilities, tool
   list, prompt list, gathered from the kernel that just became ready, on its own slot. That
   removes the re-entrancy by construction and saves three round trips per kernel start. It
   also gives `BrokerBackend` and `LocalBackend` the same `DirectOps` contract, which is the
   invariant §6.5 says the type exists to enforce.
2. **§4.5 + S6 — survive a broker death.** Handle the `shuttingDown` event that
   `broker-server.ts:207` already sends and `broker-client.ts:137` ignores; on close, clear
   `DeferredBackend`'s latch so `broker ?? local()` is re-evaluated; stop caching a rejected
   factory forever. "Sharing is never a dependency" has to be true after `open()`, not just
   during it.
3. **Enforce the call timeout locally.** Done, both halves. `broker-client.#request` has its
   own deadline — `callTimeoutMs` plus a grace — so a wedged broker cannot outlive the timeout
   the server advertises; and a `ping` op is now sent at attach, because connecting to a
   listening socket does not mean the process behind it is running. The op is answered off the
   pool *and* ahead of the licence probe, and any reply counts — a broker too old to know the
   op refuses it, and the refusal is the proof of life.
4. **§5 S2 — `server.listen()` before the licence probe**, so a cold start cannot lose the
   5 s attach race and burn two seats.
5. **§4.14 — health-check kernels on release.** A timed-out kernel must not go back into the
   pool as healthy; a kernel that will not drain must be restarted, not reused.
6. **§4.7 — guard the socket unlink** with an inode/device check, and test it first.
7. **§4.8 / §4.9 — `'error'` listeners** on `child.stdin` and on the detached broker `spawn`.
   Both are reproduced process-death paths in the review and both are two lines.

## 2a. Phase 1b — say how to run it

Small, and every stuck user hits it. Decision 5 means the package is not installable by the
name its own error messages use.

1. **Stop recommending `npx wolfram-mcp-server doctor`** in `proxy.ts:91-92`, `index.ts:8,35`
   and `docs/environment.md:168,177`. Name something that works from a clone.
2. **Point at `doctor` from the failures that need it** — the start-timeout message, the
   `exited unexpectedly` message, and the `tools/call` wrapper. Today exactly one path
   mentions it, and it is the one path where the user is not stuck.
3. **Say where the logs go.** No path appears in `README.md`, `docs/` or any
   error message, and on the default sharing path the broker's half is discarded outright.

## 3. Phase 2 — protocol conformance

Written when there was no MCP notification plumbing at all — no `setNotificationHandler`, no
`progressToken`, no `AbortSignal`, no `logging` — and called the largest missing dimension for
that reason. All of it except item 6 has since landed, so re-read the code before treating any
of this as absent: `proxy.ts` forwards `progressToken`, `kernel.ts` handles both
`list_changed` notifications, and `AbortSignal` runs from the proxy through to the pool.

1. **Cancellation.** Done, and the shape it took is not the one written here: the
   `AbortSignal` is honoured and the slot freed, but `notifications/cancelled` is *not*
   forwarded, because a serial kernel cannot read it until the work it would cancel has
   finished. What stops a kernel is stopping the process. See `docs/design.md`, *The call timeout*.
2. **Progress.** Done. `proxy.ts` forwards `progressToken` and sets `resetTimeoutOnProgress`,
   and the broker relays progress over the socket. Note measurement 2 in
   `docs/design.md`, *The call timeout*: the paclet never sends progress, so this plumbing is correct and
   idle.
3. **Upstream change notifications.** Done — `kernel.ts` sets handlers for both
   `tools/list_changed` and `prompts/list_changed`.
4. **§4.6 — never cache an empty successful list.** Done.
5. **§4.11 — cold-cache prompt advertising** must not start a kernel at launch. Done.
6. **Write down the failure contract.** Done, in `README.md` — the file a client author
   reads — as "What a failure looks like": which upstream failures become an MCP error
   response and which become an `isError` result, what a cold versus warm list does, that a
   background refresh failure is swallowed, that lists never carry a cursor, and that sharing
   failures are invisible. A check pins the one part that is a set of values rather than
   prose: every code in `PROTOCOL_ERRORS` has to be named there, since a line drawn in two
   places is a line that drifts.

   With this, Phase 2 is complete. `tools/call` failures become `isError`; cold
   `tools/list` failures throw; warm refresh failures are swallowed. Each is defensible and
   none is stated. Clients cannot code against it.

## 4. Phase 3 — discovery and configuration

1. **Make configuration fail closed.** An unusable `WOLFRAM_MCP_KERNEL` must not fall through
   to a scan: someone who names a kernel has ruled out the others. Same question for
   `WOLFRAM_HOME`/`WOLFRAM_INSTALLATION_DIRECTORY`, which today defeat the version pin, the
   version floor, and the diagnostics in silence.
2. **§4.15 — settle the resolution order** and make the code, `locate.ts:6-7`, `README.md` and
   `docs/environment.md` agree. Apply the version floor in *both* override branches, and
   return a real `version` so the cache key is not constant across in-place upgrades.
3. **§4.10 — get the kernel boot off the startup path.** Drop the `wolframscript` timeout to
   ~10 s, cache the answer, and restore the `which wolfram` / `which WolframKernel` lookups
   dropped in the rewrite — a kernel on `PATH` with no `wolframscript` beside it is currently
   undiscoverable.
4. **§4.13 — give `extraEnv` one owner**, so whether a kernel can find its paclet does not
   depend on which of three unrelated flags is set.
5. **Make `doctor` tell the truth.** `CONFIG_VARS` covers 9 of the 19 variables `loadConfig`
   reads — it omits every one in the sharing/licence section, which is exactly where a stuck
   tester is looking. Add the AgentTools version it already caches, and `$WolframID` /
   `$CloudConnected` so scenario 3 ("not signed in") stops being undetectable. Per §7.4, say
   when the seat reserve is not honoured: on a single-seat licence `deriveBudget`'s floor keeps
   the budget at 1 and the pool takes the only seat, while `pool.ts:110-113` logs
   `reserving 1` as though it had applied. Both `doctor` and that log line should say so.
6. **`clear-cache` should clear the facts too**, or say plainly that it does not.

## 5. Phase 4 — operability and safety

1. **Give the broker somewhere to log.** *Partly done.* It was spawned `stdio: "ignore"`, so
   the component that owns every kernel and every licence seat was the only one that could not
   be observed. `WOLFRAM_MCP_LOG` now names a file and `broker-client.ts` hands the detached
   child that descriptor: the destination and the path both landed.

   **Timestamps: done.** They were the one part of item 1 that never landed, and nothing had
   recorded them as outstanding. `createLogger` takes a `timestamps` option and the broker asks
   for it; the proxy does not, because its stderr belongs to a client that stamps it on the way
   past. A check reads the broker's log file and fails unless every line carries an ISO stamp
   ahead of the prefix.
2. **Close the socket boundary.** *Done, except the parts that are parked or impossible.*

   **What it was.** Reproduced first, both halves. A socket's mode is whatever the umask leaves
   it: measured on a live broker under the default `umask 022`, `srwxr-xr-x` — world-connectable.
   What protected it on macOS was the directory, `tmpdir()` being a per-user `/var/folders/…/T`
   at `drwx------`, and nothing enforced that: `brokerAddress` took `XDG_RUNTIME_DIR` verbatim
   and validated only its length, so `XDG_RUNTIME_DIR=/tmp` put a world-connectable socket in a
   `drwxrwxrwt` directory, on which any local user could evaluate arbitrary Wolfram Language as
   its owner.

   **What landed.** The socket is created 0600 — through a `umask` around `bind`, not a `chmod`
   after it, because chmod has to name a file and an over-long address is truncated by bind, and
   because between bind and chmod the socket is connectable by anyone. `socketFault` refuses a
   directory that is not ours or is writable by others, on the proxy side before connecting *or*
   spawning and again in the broker before binding, and a refusal ends in a private kernel with
   the reason logged. `SECURITY.md` states the threat model, including what is deliberately not
   defended. The design note that argued filename uniqueness was the protection is gone; the uid
   is in the filename, which is exactly why it never was.

   **The peer-uid check cannot be written.** Node exposes no peer credentials on a unix socket —
   no `getpeereid`, no `SO_PEERCRED`, nothing on `net.Socket`. Creating the socket 0600 is the
   substitute and is stronger: the kernel refuses the connection instead of us inspecting one we
   already accepted.

   **Still open here:** the Windows uid-0 pipe collision (§4.4), parked with §9.

   **Found while doing it, and left alone deliberately.** The comment beside `brokerAddress`
   claimed an over-long address makes bind "fail with a real error at the real path rather than
   silently truncating". Measured, it does not: a 152-byte address bound successfully and created
   nothing at the path asked for. Sharing survives it anyway, because connect truncates to the
   same bytes and the two still meet — what breaks is every filesystem check that uses the
   untruncated name. Refusing on length was tried and reverted: it traded a working degraded case
   for no sharing at all. The comment now says what was measured, and the umask means the mode no
   longer depends on naming the file.

   **Recorded after review, changing nothing above.** Two residuals the check accepts are now in
   `SECURITY.md`'s "deliberately not protected" list rather than only implied here: the path
   above the directory (parent components, symlinks, the moment between check and use), and the
   truncation case, where the directory examined is not the directory the socket landed in. The
   refusal line also names the remedy — `XDG_RUNTIME_DIR` pointing at a private directory —
   because the common way to hit it is `TMPDIR` being unset over ssh, where `tmpdir()` falls
   back to `/tmp` and sharing goes quietly missing.
3. **Bound kernels machine-wide.** Done for the case that made it unbounded, and narrowed to
   one that is not. The socket path keyed on the server name, so every name — and a name may
   be the user's own, so the count was user-determined — ran its own broker deriving a full
   budget from the same licence. Reproduced: two names, two brokers, `pool budget 3` twice
   against a 4-seat licence. The name lives in a session's flavour now, and the pool already
   keys kernels by flavour, so one broker per installation serves every name under one budget.

   **What remains, deliberately.** A broker runs the binary it was started with, so two
   installations are still two brokers and two budgets. Taking a binary from a peer would let
   anything holding this socket choose which executable the broker spawns, which is a worse
   trade than the arithmetic it would fix. Closing it properly means keying pooled kernels by
   binary as well as flavour, with the binary resolved on the broker's side rather than the
   caller's — worth doing, not worth doing carelessly.

   S4's remnant belongs here too: `doctor` leaves a broker behind holding the pool settings
   from its own environment for a minute. Kernel-affecting values are the caller's now, so what
   is left is idle, budget and reserve — one owner for a shared resource is defensible, but it
   should be visible in `doctor`'s own output.

   *Done.* The sharing block printed the broker's own `status.budget`, then printed `reserve`
   from **`doctor`'s** `config.reserveSeats` — the single line in that block that did not describe
   the running broker, formatted exactly like the lines that did. Same class as the
   `wolfram_status` cache line frozen at construction: a local value dressed as a remote fact.
   `BrokerBackend` records the pid it spawned and `doctor` compares it with the pid the broker
   reports for itself, so which case a run is in is the two processes agreeing — a flag set on
   the spawn path called the winner ours when the spawned broker lost the bind race to another
   session's and the retry loop attached to the winner. Both wordings are checked, because the
   defect was never that one of them was wrong — it was that they were the same sentence. The
   raced case has its own check, arranged with a spawn that stands down while another session
   binds.
4. **Say that the kernel inherits the client's environment**, and that a model writes the code
   that runs in it. Done — `README.md`, "What this lets a model do". It says the evaluator runs
   arbitrary Wolfram Language as you with no sandbox, that the kernel inherits whatever the
   client was launched with, and that the broker socket is unauthenticated behind a per-user
   mode-700 directory, with what to do if that is more than you want.
5. **A shared broker serves the settings of whichever session started it.** *Reproduced, and
   settled — all three steps have landed.* `flavour.ts` now says which environment values
   decide what a kernel is, the capability cache is keyed by it, and a `hello` op lets a
   session refuse a broker whose kernels were started differently — it takes a private kernel
   instead, with the reason logged.

   The pool is keyed by flavour, so every flavour shares one budget: `hello` carries the
   caller's values, the broker starts a kernel with those, and a pool at its limit retires an
   idle kernel of another flavour rather than overrun the licence. `kernelReady` is scoped to
   connections of the matching flavour, so nobody caches another flavour's tool list. Measured:
   two kernels served three projects, and one seat served two environments by swapping.

   One thing the tests found that the design had not: a variable *one* session declares but
   another does not would still have reached the second session's kernel from the broker's own
   environment. The broker now strips the union of every name anybody declared, so nobody gets
   a value they did not ask for.

   The original finding, for the record: Two
   sessions with the same `MCP_SERVER_NAME` share a broker, and the socket digest is only
   protocol + kernel path + server name + uid — so everything else is captured from the first
   session and later ones are ignored in silence. Measured with the fake kernel: repo A set
   `MCP_TOOL_OPTIONS` `{"WolframLanguageEvaluator":{"TimeConstraint":600}}` and repo B set
   `10`; B's calls ran with 600.

   Two classes, and they want different answers. **Kernel-affecting** settings —
   `MCP_TOOL_OPTIONS`, which the paclet reads at kernel startup, and the `WOLFRAM_*BASE` trio
   — change what a call *does*, and `MCP_TOOL_OPTIONS` is a user setting this server may
   neither assume nor override, so sharing across two different values is wrong rather than
   merely surprising. Because the paclet reads it at startup, it cannot travel per request the
   way `callTimeoutMs` does; the choice is to key the socket on it, to pool kernels by it, or
   to decline to share and say so. **Pool-affecting** settings — idle, start timeout, max
   kernels, reserve seats, licence limit, inspect — are about the shared resource, so one
   owner is defensible; being unable to see which is not.

   Note what already works, and why it hid: `WOLFRAM_MCP_CALL_TIMEOUT_SECONDS` travels in the
   frame per request, so the caller's ceiling is honoured. And the check that pins
   `MCP_TOOL_OPTIONS` reaching a kernel sets `WOLFRAM_MCP_SHARE=0`, so it covers the private
   path only — the default path was never tested for this.

## 6. Phase 5 — defensible to hand out

1. **CI on macOS**, running `npm test` and, where a kernel exists, the `.wlt`.

   *Done, 2026-08-25.* `.github/workflows/ci.yml` runs `npm test` — hermetic, no seat — on Ubuntu,
   matrixed over the Node floor (`18.17.0` then; `22.13.0` since 2026-10-03, the ESLint toolchain's own floor) and newest and over Node *only*: the artifacts are
   platform-independent, so nothing is built per-OS, and the maintainer develops on macOS, so CI's
   job is the Linux the local run never sees. A single `build` job assembles the release artifacts
   on every push. The `.wlt` stays out: no hosted runner has a kernel, so it remains the opt-in
   `npm run test:wl`. `release-please.yml` and `docs/releasing.md` cover the release half:
   `release-build.yml` builds release pull requests and tags (plugin plan D24, D25), and
   `npm run release:artifacts` builds the same files locally.
2. **No Windows claim without a Windows test.** Nothing here declares Windows support, and any
   future claim is a decision to test on Windows rather than a formality (§9).
3. **Derive the numbers.** Done. `scripts/metrics.mjs` computes what the prose used to
   assert, and the docs name the command instead of carrying the number. The suite's "The
   docs match the code" section that once gated the prose was removed on 2026-10-03 (plugin
   plan D15): tests test functionality. Its two checks of what a user sees — `doctor` can
   report every variable `loadConfig` reads, `--help` names every `WOLFRAM_MCP_` variable —
   live in the CLI section now.
4. **A benchmark script** for the timings the docs assert as measured. **Deferred by
   decision** — not important enough yet to be worth the licence seats each run would spend,
   including a multi-session case that takes several at once. It is the one remaining item
   that cannot be exercised against the fake kernel.

   What it would buy, when it is worth building: the timing figures are the last hand-written
   numbers in the repo. `scripts/metrics.mjs` deliberately does not derive them, because a
   latency measured once and written down is exactly how the stale counts got there. Until
   then they are dated single measurements and `docs/design.md` says so where they appear.
5. **Packaging**: `repository`/`homepage`/`bugs` in `package.json` (without which every doc
   link in the published README 404s), git tags, `CONTRIBUTING.md`, and either publish to npm
   or stop printing `npx` instructions that cannot work.

   *Partly, 2026-08-25.* Git tags and versioning are release-please's now (§6.1): a merge of its
   release PR tags `vX.Y.Z` and rewrites `CHANGELOG.md`, with `plugin.json` kept in step by
   `extra-files`. The `npx` instructions are already gone — a
   smoke check forbids them. What still waits: `repository`/`homepage`/`bugs`, `CONTRIBUTING.md`,
   and the npm-publish decision itself, which stays "no" (the package is `private: true`).

   *`.claude/` in `.gitignore` was listed here and has been struck.* The split it asks for
   already exists and is the right way round: `settings.local.json` is ignored, and
   `.claude/settings.json` is tracked on purpose — it carries the `typescript-lsp` enablement,
   so ignoring the directory wholesale would take the shared editor configuration with it and
   silently turn code intelligence off for everyone who clones.

6. **Make the type check run without being remembered.** `tsc` is the only gate this repo has —
   there is no linter, which `CLAUDE.md` states — and nothing runs it when a file changes. A
   `PostToolUse` hook in `.claude/settings.json`, matching writes under `src/`, would put
   `npm run build` at the point the mistake is made rather than at the next `npm test`. That
   file is tracked, so it would apply to anyone who clones, the way the LSP enablement already
   does.

   Deliberately a hook rather than a watcher: the build is quick, and a watcher is one more
   process to leak next to the broker. Worth settling first is whether it runs `tsc` over the
   project — correct, and it re-reports errors in files the edit never touched — or `--noEmit`
   on the file alone, which is faster and blind to the callers a signature change just broke.
   The `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` combination this repo
   builds under is what makes the difference worth thinking about rather than guessing.

   *Done, 2026-08-24, as part of §11:* `scripts/on-edit.mjs` runs on every Write and Edit and
   checks the whole project, not the file — the slower, correct choice the paragraph above
   weighed — after prettier and eslint on the edited file.

---

## 7. Decisions taken

1. **Explicit configuration fails closed.** If someone names a kernel and it does not work,
   falling back to a different one is against what they asked for. `WOLFRAM_MCP_KERNEL` must
   stop continuing to the platform scan, and the same principle applies to
   `WOLFRAM_INSTALLATION_DIRECTORY`, `WOLFRAM_HOME` and `WOLFRAM_MCP_VERSION`: a named target
   that cannot be used is an error with a diagnosis, never a silent substitution.
2. **The version pin outranks the install-dir environment.** The code moves to match the order
   already documented in `locate.ts`, `README.md` and `docs/environment.md` — pin first — and
   the floor applies in every override branch.
3. **macOS and Linux.** Linux joined on 2026-08-24, verified on a real machine (§9). Windows
   stays out of scope: no `scanWin32` work, no named-pipe fix (§4.4), and nothing yet stands in
   for the socket's 0600 on a pipe. Parked in §9, not dropped.
4. **The seat reserve keeps its floor of 1, and says so.** On a single-seat licence the pool
   takes the only seat, because a budget of 0 is a server that can never answer. What is wrong
   today is the silence: the log prints `reserving 1` as though it had been applied. `doctor`
   and the pool log should state plainly that the reserve is not honoured there. Low priority
   — on an unlimited licence, which is what this machine reports, the arithmetic never runs.
5. **Not publishing to npm yet.** That makes a documentation bug urgent rather than cosmetic:
   `proxy.ts:91-92` tells every stuck user to run `npx wolfram-mcp-server doctor`, which cannot
   work for anyone. Fix the error messages, `--help` (`index.ts:8,35`) and
   `docs/environment.md:168,177` to carry the same caveat `README.md:20-22` already does, and
   to name an invocation that works from a clone.
6. **npm packaging waits.** The package is not published to npm, so §6.5 stays open on
   purpose: no `repository`/`homepage`/`bugs` in `package.json`. Versions are settled — they
   come from the commit types (plugin plan D25). This is a deferral, not an oversight — do not
   open it again without being asked, and do not let anything start depending on a published
   name in the meantime.

## 8. Implications for the agent instructions — absorbed

This section was written when the file an agent reads before touching anything was a
separate one. It was folded into `AGENTS.md`, and all four changes asked for here are in `AGENTS.md` now: the process invariant (a fix lands with a check that
failed before it), the timing invariant (never add a check that passes only because the fake
kernel is instant), a pointer here for ordering, and the status vocabulary — reproduced /
traced / repeated.

The figures it used to assert went with it, which was the fourth ask and the one that needed
code: nothing in the prose states a size or a check count any more. `npm run metrics` derives
them, the suite prints its own, and a check fails if either is written down again.

---

## 9. Windows and Linux

Formerly "Parked — not macOS". Linux is done — walked and verified on a stock box on
2026-08-24, the items below kept as the record of what that took; Windows stays parked at the
bottom. The socket bullet this section used to carry — no umask handling, no
directory check, "on Linux without `XDG_RUNTIME_DIR` it does not" — landed as §5.2 and covers
Linux: `socketFault` is exactly what refuses `/tmp`.

### Linux, in order

1. **Resolve symlinks before reading a version out of a path.** *Done.* `resolveKernelBinary`
   resolves the found binary through `realpathSync` before the canonical-name preference, so
   the sibling `wolfram` is looked for in the directory the kernel actually lives in; version,
   cache key and broker socket all key on the real path, and the checks pin the symlinked-PATH
   case end to end, plus "two names for one kernel are one identity". One consequence worth
   knowing: paths discovery reports are real spellings now, so on macOS they read
   `/private/var/…` where they used to read `/var/…`, and an in-place upgrade invalidates the
   capability cache once. The versionless *real* path stays refused as below the floor, as
   decided below.

   The original finding, for the record — traced, then reproduced hermetically: a Linux
   install puts `wolfram` on `PATH` as a symlink into the installation
   (`/usr/local/bin/wolfram → …/Wolfram/15.0/Executables/wolfram`), `resolveKernelBinary`
   never calls `realpath`, and `versionForBinary` then finds no version in the symlink's own
   path. `compareVersions` reads a null version as 0, below any floor, so every such kernel is
   skipped as "below the 14.3 minimum" — at step 3 (`WOLFRAM_INSTALLATION_DIRECTORY`, which
   fails closed, so discovery stops), step 4 (the conf preference, which falls through) and
   step 6 (`PATH`, which falls through to `wolframscript` starting a kernel). On a stock Linux
   box discovery then rests on the scan roots alone.

   Resolve in `resolveKernelBinary`, not just where the version is read: the binary path is
   the digest input for the capability cache and the broker socket, so two names for one
   kernel are otherwise two brokers and two licence budgets — §5.3's finding, manufactured out
   of one installation. An explicit `WOLFRAM_MCP_KERNEL` must still be honoured as the kernel
   it names after resolution (the fake kernel depends on this). A *real* path holding no
   version anywhere is a separate decision to make while in there: today it is refused as
   below the floor, which is the safe reading but a misleading message.

   Hermetic check first: a `PATH` entry symlinking to a copy of the fake kernel placed under a
   versioned directory, discovered only when the version comes from the symlink's target.

2. **Verify the scan roots against a real installation.** *Done, for the current installer's
   layout.* `npm run doctor` on a stock box found
   `/usr/local/Wolfram/Wolfram/14.3/Executables/wolfram` via the `/usr/local/Wolfram` root,
   read the licence and the paclet, and started the kernel. The other roots stay listed
   unverified — they cost a readdir.

3. **Run the suite and the contract on Linux.** *Mostly done; the one failure was a finding,
   reproduced and fixed.* `npm test` on a stock box failed every sharing section and nothing
   else — the suite's doing, not the product's: its runtime directories were bare mkdirs,
   which obey the machine's umask, and under the user-private-group default of 002 they come
   out group-writable, which `socketFault` rightly refuses. Reproduced on macOS with
   `umask 002 && npm test`, same failures; the suite's `privateDir` now makes every directory
   it hands over as `XDG_RUNTIME_DIR` explicitly 0700, except where a check is deliberately
   building an unsafe one. The refusal those failures surfaced was also misworded — a 775
   directory was blamed on "others", who cannot write to it — and now names the bit that is
   set, with the 770 case pinned by its own check.

   A second finding from the re-run, also the suite's fault: broker counts went through
   `execSync('pgrep -f "…" || true')`, and the `|| true` forces the `sh -c` wrapper to stay
   forked instead of exec'ing — a live process whose own command line contains the pattern.
   procps pgrep matches every cmdline but its own, so every count on Linux carried one
   phantom broker; the giveaway was determinism, "three sessions share one broker — 2"
   reading identically across runs while everything around it varied. BSD pgrep excludes the
   caller's ancestors by default, which is why no macOS run ever saw it, however hard the
   race was stressed. `ownBrokers` now calls pgrep through `spawnSync` with no shell, so the
   pattern never appears on any process's command line. The product converged to one broker
   the whole time.

   Verified on the box, all of it: the suite passes in full after the fixes above, and so
   does `npm run test:custom` against the real kernel; the contract passes against 14.3.0 and
   AgentTools 2.2.0; `doctor` exits 0; sharing comes up shared over ssh under systemd
   (`XDG_RUNTIME_DIR=/run/user/<uid>`); and the declined case declines —
   `env -u XDG_RUNTIME_DIR npm run doctor` was refused as "/tmp belongs to uid 0, not 1000"
   with the remedy line, the ownership check firing before the mode check got a look.
   Discovery through the `/usr/local/bin/wolfram` symlink resolves to the installation and
   derives the same socket digest as direct discovery: two names, one broker, measured.

4. **Retire the macOS-only scope statements once 1–3 hold on a real machine**, and not
   before. *Done, 2026-08-24:* CLAUDE.md's scope line, SECURITY.md's opening, directory
   section and remedy paragraph, `design.md`'s settled list, the settled decision above,
   and this section's own framing.

### Windows, parked

Real findings, still deliberately out of scope. Recorded so they are not rediscovered as new:

- §4.4 — the broker pipe is shared across user accounts: `process.getuid` is undefined on
  Windows, so the uid in the digest is the constant 0, and the pipe namespace is per-machine.
  A per-user name (username or SID) is necessary but not sufficient: a pipe's DACL is set by
  its creator and Node exposes no way to set one, so the equivalent of §5.2's 0600 needs its
  own investigation before sharing can be trusted there. `socketFault` returns null on win32
  for exactly this reason — nothing filesystem-shaped applies.
- `scanWin32` and the named-pipe framing are untested end to end.
- The plugin surface is POSIX-assuming beyond the server itself: `session-check.mjs` probes
  with `command -v`, the hook scripts assume a bourne shell behind Claude Code's hook runner,
  and none of the plugin path has ever run on Windows. Asked for explicitly (2026-08-25):
  when Windows work starts, it begins here and with the pipe items above.

## 10. The Claude Code plugin

Done, 2026-08-24. The repo doubles as a plugin:
`.claude-plugin/plugin.json` declares the MCP server (through the existing
`scripts/mcp-server.mjs`) and an LSP server for Wolfram Language files, both by
`${CLAUDE_PLUGIN_ROOT}` paths so a marketplace clone works unchanged. Decisions, and why:

- **One plugin, both protocols.** Splitting MCP and LSP into two plugins was considered for
  seat control and rejected for now: `WOLFRAM_MCP_LSP=0` gives the same choice without a
  second plugin root, and splitting later is cheap.
- **The LSP entry is a launcher, not a kernel path.** The kernel lives somewhere different on
  every machine — the problem `locateKernel` already solves — so the `lsp` subcommand reuses it.
  It resolves through the same `loadConfig` the MCP side does (`discoverLspKernel`), not a
  narrower hand-read of `process.env`: the `WOLFRAM_KERNEL_PATH` alias, the `WOLFRAM_MCP_MIN_VERSION`
  override and the `${...}`/blank filtering all match, so both halves of the plugin always name
  the same installation — pinned by a check that fails if the two diverge. *(Corrected 2026-08-25:
  the entry once read a narrower, unfiltered env, so a user who set only the alias, or a host that
  passed an unsubstituted `${...}`, could point the two halves at different kernels.)*
- **Declining the seat must not be a crash loop.** An LSP kernel is a full WolframKernel held
  for the rest of the session once started — measured, the client starts it lazily on the
  first Wolfram Language file touched, not at plugin enable. Under `WOLFRAM_MCP_LSP=0` the launcher
  answers the handshake itself with no capabilities: a clean exit instead would count as a
  crash, and the client's default `restartOnCrash` would relaunch it forever.
- **The flag set is LSPServer's own.** `-noinit -noprompt -nopaclet -nostartuppaclets
  -noicon`, from its troubleshooting guide, measured clean: every banner goes to stderr and
  stdout carries protocol frames alone, which Claude Code makes non-negotiable.

Checked from both ends: hermetically in the suite (the manifest's paths exist, the no-seat
stub answers the handshake over real stdio with clean stdout and the spec's exit contract,
failed discovery exits visibly for the /plugin Errors tab), and against a real kernel by
`npm run test:lsp` — handshake, capabilities, diagnostics on known lints, graceful shutdown.
Measured on 15.0: initialize answers in under three seconds; `startupTimeout` is set to a
minute for slower machines and first-time paclet loads.

**Before any GitHub or community-marketplace release**, in order: ~~bundle the server~~ —
*done, 2026-08-25*: `npm run bundle:js` builds `bundle/wolfram-mcp-server.mjs`, the whole CLI
with its dependency tree inlined and its identity injected at build time, and the suite
builds and drives the artifact itself every run, MCP and `lsp` both. The `lsp` subcommand
moved into the CLI for exactly this: a computed dynamic import cannot be bundled, and a
single file has no scripts directory beside it. What remains: a marketplace entry using the
`archive` source (a release zip of `plugin.json` plus the bundle, with its sha256), because
a git-source marketplace install is a clone into a cache directory the user must never be
told to `npm install` inside — it is wiped on update. Then re-point `plugin.json`'s `repository` at
the public home, and state the requirements (Node 22.13+, Wolfram 14.3+, macOS or Linux) in
the marketplace listing, because a machine with no Node at all never reaches our error
messages — the client's own "executable not found" is everything such a user sees. The Node
version *guard* covers the old-Node case with a real instruction: in both launchers for the
source clone, and — because the archive install runs the single file directly, bypassing the
launchers — baked into the bundle itself by an esbuild banner, so the one file a marketplace
hands out carries it too. *(The banner covers Node 14.8+; older cannot parse the bundle's
top-level await and fails earlier with a bare SyntaxError, but the floor is 22.13.)*

For sessions in this repo the plugin enables itself: `.claude-plugin/marketplace.json` makes
the repo its own marketplace and `.claude/settings.json` enables `wolfram@wolfram` — and
retires `.mcp.json`'s copy of the server for Claude Code, because two servers over one tree
show every tool twice; `.mcp.json` stays as the entry other MCP clients point at.
Measured, not assumed: a `directory`-source marketplace registers the repo's absolute path (a
relative `"."` resolves against the project root), and the plugin runs from the tree in place —
nothing lands in the plugin cache, so the working tree is what executes, the same freshness as
`--plugin-dir`. One trap found on the way: `claude plugin install` defaults to user scope and
writes the enablement into `~/.claude/settings.json`, which is exactly the global install this
setup avoids — the project settings alone are what should carry it.

Not done, deliberately: no *external* marketplace entry — `--plugin-dir` is the supported path
for other machines until the not-published question (§6.5's npm decision) is settled, since a
marketplace install from a remote source is a clone that still needs `npm install`, and both
launchers say so when `dist/` is missing.
`claude plugin validate` passed with one warning — `CLAUDE.md` at the plugin root is not
loaded as plugin context — which was the intended state: that file instructs whoever develops
this repo, not the plugin's consumers, and moving it into a skill would inject it into theirs.
It is `AGENTS.md` since 2026-10-03, and validation now passes without the warning.

## 11. Formatting and linting

Done for what converges, 2026-08-24; recorded here because half of
the original ask was measured impossible and should not be re-attempted without re-measuring.

**TypeScript: fully enforced.** prettier (printWidth 100) and eslint (typescript-eslint
recommendedTypeChecked; every rule turned off is turned off in `eslint.config.mjs` with its
reason inline) join `tsc` in `npm test`, and `scripts/on-edit.mjs` — a `PostToolUse` hook in
`.claude/settings.json` — applies all three to every agent edit under `src/`, whole-project
`tsc` included (§6.6's question, settled for correctness). The one-time reformat cost three
wrapped lines: the tree already wrote prettier's shape. VS Code gets the same tools via
`.vscode/settings.json` format-on-save and the recommended extensions.

**How a fresh machine learns all of this.** Everything a cloner needs arrives tracked —
hooks and plugin enablement in `.claude/settings.json` behind the workspace-trust prompt,
editor wiring in `.vscode/`, the toolchain via `npm install` — and the one silent failure mode
is closed by `scripts/session-check.mjs`: the on-edit hook deliberately no-ops on a machine
that never ran `npm install`, so the SessionStart hook says so, once, in the session's own
context, and stays quiet everywhere healthy. Plugin consumers outside this repo need none of
it; their two launchers already self-report the unbuilt-clone and no-kernel cases.

**Wolfram Language: linting enforced, formatting rejected.** CodeInspector runs live in every
session through the plugin's LSP, and `npm run lint:wl` is the same check headless (tag and
severity exclusions mirror the MCP tool's defaults, each with its reason in the script).
Formatting cannot be enforced: CodeFormatter has no fixed point on block comments — measured
repeatedly, it inserts a fresh blank line into a multi-line comment on *every* pass, so an
enforced canon grows files without bound and mangles their prose; normalising the churn away
was tried (trailing-whitespace strip, closing-paren collapse) and each fix surfaced the next
divergence. The `.wlt` was reformatted during the attempt and restored from git; the em-dashes
CodeInspector flagged stayed ASCII. Revisit only if a CodeFormatter release formats its own
output to itself twice running.

## 12. Split the test suite by functionality

**Future work, not scheduled, and not part of the plugin plan** (`docs/plugin-plan.md`).
Recorded 2026-10-03.

`test/smoke.mjs` is one linear script holding the whole hermetic suite. It is hard to read,
there is no way to run one area on its own, and later sections depend on state earlier ones
leave behind: the kernel start-count marker, the warm capability cache, a running broker.
`AGENTS.md` already tells contributors to copy a block into a scratch file to isolate it,
which is the symptom.

The aim is one file per area of functionality, each readable on its own and runnable on its
own. A plausible division, to be confirmed against the current headings when the work starts:

- protocol and proxy (`initialize`, lists, calls, errors, cancellation);
- kernel lifecycle (start, idle shutdown, timeouts, teardown and reaping);
- broker and sharing (flavours, pool budget, attach, fallback);
- discovery and configuration;
- caches and probed facts;
- the CLI and `doctor`;
- the LSP launcher;
- the single-file bundle.

What the split has to preserve or settle:

- **Each file sets up its own state.** No file may depend on another having run. That makes
  the cross-section dependencies the real work: shared fixtures (the fake kernel, temporary
  cache and runtime directories, socket paths) move into one helper module.
- **The hermetic rule holds per file:** no file starts a real kernel or reaches the network.
- **`npm test` still runs everything,** and CI's entry point does not change. Node's built-in
  `node:test` runner gives per-file and per-test selection without a new dependency, if it
  suits the suite's style.
- **No check is lost in the move.** The check count before and after is compared once, as
  part of the change, not as a standing rule.

Only behaviour is tested. The prose checks were removed in plugin M0 (D15), so there is no
docs section to carry over.
