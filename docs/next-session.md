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
- **0.1.5 is released** (2026-10-08, #72, `0547361`; milestone `0.1.5` holds five fixes, all
  merged).
  - **Verified as 0.1.4 was:** `v0.1.5` is Latest, and `release` moved to it (`49f2e19`) and
    is tagged `wolfram--v0.1.5`. The bundle and the plugin archive, fetched through
    `releases/latest/download/…`, match `SHA256SUMS.txt` and say 0.1.5.
  - **How the batch went:** each fix had at least one `/code-review high` round and a clean
    Codex review on its final head before the maintainer approved it. Codex's findings were
    real twice: #75 on #73, and the stranded waiters on #79.
  - **#68 is merged** (`136b59f`, fixes #31). A kernel's client is a `RelayClient` whose
    `listTools` is a plain request, so no `outputSchema` is compiled and the relay judges no
    result. `listAllTools` drains every page, so doctor now shows them all. Claude Code 2.1.290
    was measured listing a server whose tool carries a schema ajv refuses. AgentTools 2.2.7 can
    emit neither field, so `test:custom` cannot pin it.
  - **#71 is merged** (`3a6448f`, fixes #38). `src/duration.ts` says every duration:
    `budgetText` rounds down, `waitText` up, `elapsedText` down, and `idleText` covers the idle
    setting. Units fit the size, `400ms` to `24d`.
  - **#73 is merged** (`5b8d60b`, fixes #32), after four `/code-review high` rounds and two
    Codex reviews, the last clean.
    - **How a broker claims its address:** it binds under a staging name,
      `.b<pid>-<8 random hex>`, never cleared first, links it into place, and watches the
      address. It binds at the address directly where it can't link, as for an over-long
      address.
    - **Handing over:** a broker that finds its address gone or replaced tells its sessions
      `shuttingDown`, answers what they had asked, and leaves.
    - **For the suite:** `onBound`, a broker option like `DeferredOptions.clock`, lets a check
      replace the address the moment a broker binds. The suite also fails if anything ends it
      early.
    - **Left to issues:** its over-long-address findings are `main`'s behaviour and went to
      #74. The in-flight-call hang Codex found is #75.
  - **#77 is merged** (`26a3251`, fixes #75), after one `/code-review high` round and a
    clean Codex review. A call in flight when its broker stops waited out its whole ceiling,
    and forever with none. `shuttingDown` set `#closed`, and `#failAll` skipped the waiters
    once it was set.
    - **The fix:** `#failAll` has no guard, so it fails the waiters whatever set `#closed`.
      Nothing can join a map once `#closed` is set, so running it twice is harmless. The
      client's `stop()` fails what is pending with a reason that is true.
    - **Two ways in, each a suite check that failed at 22.0 s first:** a broker stopped by
      SIGTERM mid-call, and a session that chooses again while its broker is retiring.
    - **#76** (`enhancement`): a call still on a retiring broker should be answered by it
      rather than failed. It is filed, not in this fix.
  - **#79 is merged** (`81c25e7`, fixes #78). The maintainer put it in 0.1.5
    (2026-10-08). One request running out marked the whole connection closed. The session's
    next request then chose again and closed it, and the broker aborted every other call
    the session had there.
    - **Reproduced:** a call that asked for 30 s, and would have been answered at 8 s, failed
      at 5 s because a default-ceiling call queued behind it ran out. The session then
      reattached to the same, healthy broker.
    - **The fix:** a request still fails at its ceiling. The session then pings the broker,
      and gives it up only if the ping goes unanswered. `DeferredBackend.#get` waits for that
      verdict (`KernelBackend.settled`), so no request goes blind to a frozen broker in the
      meantime. A timed-out request's progress handler is cleared.
    - **Codex on `4efa193` (P1), fixed:** a broker given up on was only marked closed, so
      calls already on it went on waiting their own ceilings, up to 24 days with a long one,
      and forever with none, unless a later request closed the connection. Now giving the
      broker up fails every call still on it, with the reason, and closes the socket.
      *Once a broker stops answering, every call still on it fails, not only the one that
      ran out* failed on `4efa193` first.
    - **Review split it (the maintainer's call, 2026-10-08).** The second head waited, while
      the broker answered, for a queued request to be answered as a private session's would
      be. Its review found that this let a request queued behind *another session's* call
      wait until that call ended, which could be hours. It was reverted to the fix above.
      The question went to #80 (`needs design`): the two paths answer a queued request
      differently, neither bounds its wait by its own ceiling, and a request that timed out
      still runs later on the broker.
    - **Checks:**
      - *A request that runs out on a busy broker costs the session no other call* failed
        on `main` first. It now also requires the request made after the timeout to be
        answered.
      - The frozen-broker section checks that a call made while the broker is being asked
        waits for the verdict and is answered elsewhere. On #79's first head, it waited out
        its own ceiling.
  - **Filed from the reviews:**
    - **#69** (`needs design`): a non-object schema still fails the whole list, in zod.
    - **#70** (`needs design`): the lists read after a kernel start keep the SDK's 60 s
      timeout.
    - **#74** (`needs design`), measured in #73's CI. On Node 26 (Linux), an over-long broker
      address gets `listen EINVAL`, so there is no broker, and each session waits 5 s before
      going private. Node 22 truncates the path and shares. `main` binds the same way. Its
      comment from #73's fourth round adds the graceful-close, security and macOS findings
      above.
    - **#75** (`bug`, milestone `0.1.5`): Codex found it on #73 (P2), citing *Sharing is an
      optimisation, never a dependency*. Fixed by #77 (above).
    - **#76** (`enhancement`, `area: broker`): a session that chooses again while its broker
      is leaving cancels the call still on it. A comment from #77's review widens it: a
      request the broker never read could be resent safely, if the broker acknowledged what it
      took.
    - **#78** (`bug`, `area: broker`, milestone `0.1.5`, from #77's review): one request's
      timeout cancelled every other call on a healthy broker. Fixed by #79 (above).
    - **#80** (`bug`, `needs design`, `area: broker`, from #79's review): how long a queued
      request may wait. The shared path fails it at its ceiling, and the broker still runs
      it afterwards. The private path waits however long the queue takes. A shared request
      can also queue behind another session's call. #79's second head tried to match the
      private path, and the issue records why that was reverted.
- **The release build holds its write token apart from the code it runs** (#89, `2f32180`,
  merged 2026-10-10, fixes #84). It is `ci:`, so it makes no release: its run on `main`
  passed `release-please`, `pending` and `advance`, and skipped both builds.
  - **The split:** `release-build.yml`'s `build` job holds no token that can write. It runs
    the release PR's title checks before `npm ci`, so no dependency has run when they do, then
    builds, validates and uploads the files as `publish-<tag>`. `publish` is a fresh job, the
    only one that can write, with no checkout and no repository code. It runs one action,
    `download-artifact`, pinned to `v8.0.2`'s commit in #46's format, then `gh` and an
    anonymous `git ls-remote`.
  - **Smaller changes:** `--stamp` takes the version through `env:`. The released-tag guard
    stops on a read that failed rather than taking it for "not released". A release-PR title
    check that fails now stops the pre-release; it used to publish it and withhold only the
    statuses.
  - **How it got there:** the first head only stopped persisting the token in the checkout.
    Codex's P1 on it was real: on one runner, `npm ci`'s install scripts or the `npx`
    validators could rewrite `scripts/commit-types.mjs`, which Publish ran with `GH_TOKEN`, or
    put a command on `$GITHUB_PATH`. The maintainer chose the split in the same PR. Codex's
    second P1 was the unpinned `download-artifact` beside the token. Its third review was
    clean, after five `/code-review high` rounds.
  - **Evidence:** run locally with every credential source off — the anonymous reads
    (`ls-remote` with and without a checkout, the fetch by SHA, `commit-types` with no
    `node_modules`) and the guard's three outcomes. No suite check, by the maintainer's call
    (*Working here*). Its pre-release path ran end to end for `v0.1.6-pre.1` (2026-10-17);
    the tag path runs when 0.1.6's release PR merges (item 1).
  - **Filed from its review:** #90 (`ci`, `bug`). It was measured on #97 and needs no change:
    *Re-run all jobs* replaces an artifact of the same name rather than failing.
- **The workflows audit themselves** (#91, `8000ea2`, merged 2026-10-17, fixes #85 and #46).
  It is `ci:`, so it made no release; its run on `main` passed.
  - **The `workflows` job:** `ci.yml` runs pinned actionlint 1.7.12 (the author's image, by
    digest) and zizmor 1.30.1 (its action pinned to a commit, the version set apart),
    including zizmor's online audits. It is never skipped, and `ci-ok` waits on it. In a
    release run, zizmor runs only where the tree has `.github/zizmor.yml`, so an older tag
    isn't held back by its unpinned actions.
  - **Pins:** every action is pinned to a commit, and Dependabot moves the SHA and its comment
    together. Two pins are moved by hand: the actionlint image (`docker://`, which Dependabot
    can't read) and zizmor's version.
  - **Accepted findings:** `.github/zizmor.yml` ignores `self-repository` in the two files whose
    `./` are reusable workflow calls. actionlint refuses GitHub's `$/` syntax
    (rhysd/actionlint#711).
  - **Settings, turned on after the merge at the maintainer's request (2026-10-17):** *require
    actions pinned to a full-length commit SHA*, and CodeQL's default setup for `actions` and
    `javascript-typescript`. CodeQL's first run passed under the pinning policy. Its 7 alerts
    are filed as #95 (#6 and #7, quadratic regexes) and #96 (#1 to #5, cache poisoning), both
    to fix (item 1).
- **The backlog was reviewed against `main`** (2026-10-17). None of the open issues is fixed
  outright. #16 is mostly superseded by #79, and #40 is three quarters done by #63. Item 9
  lists the relabels, retitles and splits the review proposed.
- **The backlog is GitHub issues** (`gh issue list`), labelled by type, `needs design` and area
  (*Working here* below). Other agents file there too, notably the downstream plugin's.
- **The release pipeline versions itself** from the commit types on `main`. `docs/releasing.md`
  has the whole of it; the short form is under *How releases work* below.
- **The direction is client-neutral agent tools with a package per client** (plan §5 MA,
  decisions D26–D32, evidence A.6). The design is decided; its experiments come next.

## What to do next, in order

1. **Finish 0.1.6** (milestone `0.1.6`). Merge, with the maintainer's approval, in this order:
   - **#99** (fixes #95): linear version and bundle parsing in `src/locate.ts`, and the two new
     repository settings in `docs/releasing.md`. Two review rounds and a clean Codex review on
     `5bc2cc8`. Round one tightened the bundle check, which now fails on a mutant that cuts at
     the last segment.
   - **#97** (fixes #96 and #87, closes #90 by measurement), which this handoff rides in:
     `cache-mode: none` on both release workflows, `.github/actionlint.yaml` ignoring the one
     message actionlint gives for the key, and Dependabot's action updates in one group.
     Measured on GitHub with two throwaway probes, both since removed:
     - a caller's `none` reaches a called workflow (its save was refused: "cache write denied:
       token has no writable scopes");
     - a called workflow may declare its own `cache-mode`;
     - `setup-node`'s npm cache under `none` is skipped at both ends, and the job passes;
     - *Re-run all jobs* replaces an artifact of the same name rather than failing, so #90
       needs no change.

     Clean in Codex's review of `572d86e`. Both PRs touch `docs/releasing.md` in different
     sections; after the first merges, test the second merged onto `main` before merging it.
   - **Then release PR #98** (`chore(main): release 0.1.6`). Its merge runs the one check of
     #89's split still unseen: the tag path, which uploads the assets to the draft and then
     publishes it. It is also the first release run under `cache-mode: none`: its CI's
     `setup-node` should log "Cache restore skipped". Then check:
     - `advance` moves `release` and Latest to `v0.1.6`, tagged `wolfram--v0.1.6`;
     - the assets, fetched through `releases/latest/download/…`, match `SHA256SUMS.txt`;
     - CodeQL's next scan of `main` closes alerts #1 to #7. If #1 to #5 stay open, dismiss
       them, with the setting as the reason.
   - **Done so far** (2026-10-17): #94 (dev tools) and #93 (SDK 1.32.1) are merged, #93 after
     `main` combined with it passed the suite locally. `v0.1.6-pre.1` was built by the release
     run for #93's merge: `build` uploaded `publish-v0.1.6-pre.1`, `publish` created the
     pre-release with all three assets (checksums verified, the bundle says `0.1.6-pre.1`), and
     `ci-ok`, `commit-types` and `conventional-title` landed on #98's commit.
   - **#56** (TypeScript 7) stays `blocked`: typescript-eslint 8.71.2, the newest, still
     accepts TypeScript `<6.1.0` (checked 2026-10-17). It stays open as the reminder, not
     closed with an ignore rule, which would hide TypeScript 7 until someone lifted it.
     Dependabot updates it in place as 7.x moves. When it unblocks, it also needs
     `"types": ["node"]` in `tsconfig.json`, since TypeScript 7 no longer includes `@types/*`
     by default. With that, 7.0.2 compiles `src/` (measured, noted on #56). `tsconfig.json`
     ships, so that change is a `fix:`. The signal to revisit is Dependabot's own
     typescript-eslint PR: read its `typescript` peer range. The maintainer wants Dependabot's
     PRs assessed, not merged by default. A PR tested on an older `main` gets
     `@dependabot rebase` first, or the combination is tested locally before merging.
2. **Small fixes that stand apart from the kernel-start design** (backlog review, 2026-10-17).
   - **#74's minimal half, a security fix:** refuse in `socketFault` any address longer than
     the platform's socket path. Sessions then go private at once, with the reason, rather than
     binding or connecting through a truncated path, which can land in a world-writable
     ancestor such as `/tmp`. Sharing at long paths (`chdir`, Linux's abstract namespace) stays
     a design question.
   - **#76's drain:** a session choosing again lets a retiring broker answer the call still on
     it, instead of `stop()` aborting it. Tighten the smoke check that accepts either outcome
     first. The acknowledge-and-resend form in its comment touches #80 and the protocol.
   - **#19's small part:** refuse only what would start a kernel (check for an idle kernel of
     the flavour first), and report the refusal window in the broker's `status`. The burst
     before the first failure is design work.
3. **Shorter test runs, and smaller CI items.**
   - **#40, its third point, a `test:` PR:** overlap the long-call section's 65 s with another
     section. It needs its own cache and runtime directories, since the section wipes and warms
     the cache. Look at #77's and #79's slow sections in the same PR.
   - **#58** (a release-path defect, not yet hit): `advance` plans only the newest release,
     trusts a tag by name, and tags the re-fetched branch rather than the commit it read.
     `test/release-branch.mjs` is its test's home.
   - **#88:** emit `::error` for each failing check across the five `check()` helpers, with
     `%`/CR/LF escaping.
   - **#69:** measure whether Claude Code lists a tool with `outputSchema: {type: "array"}`,
     then drop the tool or relay it in `RelayClient.listTools`. A boolean property schema
     (`true`) fails the same parse.
4. **Design the kernel-start cluster before code**, in `docs/plugin-plan.md`, the one plan.
   The pool shapes every session's latency and licence use.
   - **Settle #80's contract first:** what a ceiling counts from, on each path, and that
     expired queued work is dropped. #79's second head records one rejected answer.
   - **#16** is mostly superseded by #79: a ceiling now pings and keeps a broker that answers.
     Fold its leftovers into #80: a ceiling of 0 means none, and the broker uses the spawning
     session's start timeout.
   - **#12, one deadline owning every start**, including the pool's starts and a private idle
     restart, which both still run on the raw start timeout. It settles #70: a refresh after a
     start runs inside the triggering call's turn, so either it becomes its own queued task or
     it counts as part of the start.
   - **#22, #20 and #19's burst as one policy table** by failure kind, reusing `Backoff` in the
     pool. #22 includes a minimum start timeout (#15's other half). #20 includes the private
     idle restart outside the back-off. #19's constraints are pinned in the suite.
   - #74's long-path sharing and #76's resend form touch the same protocol, so note them there.
5. **Design the paclet cluster**: #3 (warm kernels serve an upgraded paclet's old server), #6's
   MD-4 (the cache key holds no paclet version), and #4 (loading a development paclet). They
   need one no-kernel reader for where a server resolves from: a paclet version alone misses a
   dev checkout and a rewritten user server. #20's eviction rule wants the same signal.
6. **Decisions and settings for the maintainer** (no PR needed for the first two):
   - **#82's first half:** require resolved conversations on `main`, a setting the review
     process already follows by hand. Its `strict` half waits on #81.
   - **A `refs/tags/v*` ruleset** (from #48): today only `release` and `wolfram--v*` are
     protected (rulesets 24615785 and 24615786).
   - **Waiting on design:** #81 (fewer CI runs), #49 (ordinary CI on the release PR, which
     couples with #81), #48 (immutable releases), #47 (provenance: it now belongs in `publish`
     or a job of its own, since `build` holds no token that can write), #83 (container
     scenarios in CI, whose images are pinned by tag, not digest) and #86 (the contract on a
     schedule).
7. **Backlog tidying the review proposed** (2026-10-17), none applied yet; agree it with the
   maintainer.
   - **Retype:** #58 and #76 from `enhancement` to `bug`.
   - **Retitle:** #40 to its remaining point, with `ci` for `area: broker`. #19 to the burst.
   - **Close #16 into #80**, carrying its leftovers.
   - **Labels:** add `area: startup` to #20, and `area: broker` to #60. Mark #74's security
     finding, since there is no `security` label.
   - **Split:** #6, as `clear-cache --server` (a `feat:`) apart from MD-4. #60 into its harness
     pieces (the stub broker's missing `error` handler, a socket preflight, `test:wl` failing on
     empty output), the LSP shutdown, the hang, and the userbase route.
8. **The one link of #7 left unobserved**: Claude Code running the auto-update pass itself,
    in an interactive session up to ten minutes after the first message, and saying `Plugin
    updated: wolfram`. A project following `release` on an older version should update
    itself when 0.1.6 ships. The maintainer runs it, since it needs a signed-in client. Try
    the route at the 2.1.75 client floor too, unmeasured for it. `docs/releasing.md` has the
    headless check.
9. **Restructure the agent instructions** (#36, `needs design`): a trimmed `AGENTS.md`, the
   handoff's durable rules moved out of it, and the project rules now in the maintainer's
   private Claude Code memory moved into the repository. Agree the design first, and how it
   lands, since it is docs only. The handoff has grown from 12.9 KB at 0.1.2 to about 36 KB.
10. **MA's experiments**, each a ledger row (plan §5 MA, *Order of work*): Codex installing a
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
11. **The restructure** (MA). M1's `archive` install, update and bad-digest rows need only public
   releases (`v0.1.0` then `v0.1.1` is an update), as does a Claude run of the plugin installed
   from the archive.
12. **MD, downstream packages** (plan §5 MD, D33), after the restructure: another project's
   plugin built on the release bundle. The startup defect for today's users — a server not
   found held off by the long back-off — is fixed in 0.1.2 (#5); its `test:custom` counterpart
   remains. #59 (filed 2026-10-08 from the downstream WolframVerifier, `needs design`) measured
   MD-2's split: two releases' bundles on one machine run two brokers, each sizing a pool from
   the whole licence, and with `autoUpdate` that happens after every release, both between the
   `wolfram` plugin and a downstream copy and across one plugin's update. It asks for MD-2's
   second candidate, a broker address keyed on `BROKER_PROTOCOL` rather than the version and
   the bundle's bytes, which needs its own argument that sharing never changes an answer.
13. **The rest of M1**: the chat checklist and M1b's client version, `SessionStart` and file
   workflow (run by a maintainer); entitlement leases outliving clean kernel exits by about an hour
   (measured, cause not found, matters only to entitlement users); a resumed Claude Desktop
   session after a re-upload may lose the LSP (a new session works).
14. **M2's design checkpoint**, which starts with the stable-2.2.0 union experiment and needs
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
  security regressions`). Codex's findings are answered and resolved the same way. It marks
  them P0 to P3 (P2 and P3 arrived on #73), so treat every badge as a finding. And read all
  of them: the comments API pages at 30, so list with `--paginate`. A P3 on #73 was on page 2,
  and was missed until the maintainer pointed to it. Then ask the maintainer to approve the
  merge.
- **Post every finding on a line of the diff**, the nearest related one if its file isn't in
  the diff, never as a conversation comment. One on #79 could not be resolved like a thread,
  went stale when the design changed, and was hidden as outdated.
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
- **A workflow fix needs no suite check** (the maintainer, 2026-10-10, on #84). `npm test`
  exercises no workflow, and a one-off auditor run only restates the diff. Instead, run the
  risky part directly, as #89 ran its anonymous git reads with every credential source off,
  and say in the PR what would catch a regression (#85's auditor).
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
