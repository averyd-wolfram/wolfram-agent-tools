# Releasing

The pipeline turns Conventional Commits into a version, and release-please's release branch or a
tag into a GitHub Release that carries the built artifacts. It lives in
`.github/workflows/` and runs on the project's GitHub repository. Every piece is still exercisable locally first: the workflows are thin wrappers over
commands you can run by hand.

**A release is a release from 0.x on.** Merging the release PR publishes a normal GitHub
release, and the highest version published is Latest, so `releases/latest/download/…` serves
its files; only the release PR's
`v<x.y.z>-pre.<n>` builds are flagged Pre-release (plugin plan D24, changed 2026-10-06 — until
then every release below 1.0.0 was a pre-release, which `releases/latest` skips). The pipeline is
the one a 1.0.0 release will use, exercised now so it is proven before then. release-please runs
on `main`, the integration branch.

**Nobody types a version** (plugin plan D25). From `0.1.0`, a `fix:` makes `0.1.1` — as do
`perf:`, `refactor:` and `revert:`, the other visible changelog sections — a `feat:` makes
`0.2.0`, and a breaking change also makes `0.2.0` until 1.0.0 (`bump-minor-pre-major`), so
nothing reaches 1.0.0 by accident. `docs:`, `test:`, `ci:`, `chore:` and the rest bump nothing,
and a docs-only change makes no release. A change to what ships — the server's source, the
plugin and its skills, the licence, the build scripts, a production dependency — is a `fix:` or
`feat:`, and the `commit-types` check refuses a commit or PR title that says otherwise
(`pr-title.yml`, `scripts/commit-types.mjs`). Commits already inside a published build are not
judged again.

Three things shape it:

- **The artifacts are platform-independent.** The bundle is esbuild'd JavaScript, and the one
  production dependency tree (`@modelcontextprotocol/sdk`) is pure JS with no native modules, and
  the bundle inlines it. So a single build on any Node and any OS produces something that installs and runs
  everywhere. **Building is one job; there is nothing to matrix.**
- **Nothing publishes to npm.** The package is `private: true`. A "release" is a git tag plus a
  GitHub Release with assets attached — never `npm publish`.
- **CI spends no licence seat.** `npm test` is hermetic (it drives `test/fake-kernel.mjs` and
  starts no kernel), so it runs on any hosted runner. The kernel-backed checks — `test:wl`,
  `test:lsp`, `lint:wl`, `doctor` — need a real installation no runner has, and are run by hand.

## The install paths this feeds

A user never builds from source. They pick one of:

1. **The Claude Code plugin** — `wolfram-plugin-<version>.zip`, the `archive` marketplace source.
2. **The bundled server** — `wolfram-mcp-server.mjs`, a single file they point their MCP client's
   config at (`node /path/to/wolfram-mcp-server.mjs`).

`SHA256SUMS.txt` covers both, so the `archive` source can pin its download and a user can
verify one.

## What runs, and where

### `ci.yml` — every pull request

Triggered on `pull_request`, not on branch pushes: a branch is tested once it has a PR, and a
newer push to that PR supersedes the run in flight. release-please's own release PR is the
exception: opened by `GITHUB_TOKEN`, it triggers no workflows, so `release-build.yml` calls this
on its commit instead (`workflow_call`, with the commit as `ref`).

- **`test`**: `npm ci && npm test` on Ubuntu, matrixed over Node `22.13.0` and the newest release — and over
  Node *only*. The floor is the version the `engines` field and the launcher guards promise, so it
  is the version most likely to break when newer syntax creeps in; the newest line catches a
  deprecation removal before a user on it does. Not over OS: the maintainer develops on macOS, so
  every local `npm test` is a macOS run, and CI's job is to cover the Linux that one never sees.
- **`build`**: one job, one runner. `npm run release:artifacts`, uploaded as a workflow artifact,
  so a change that breaks bundling or the plugin archive is caught on the PR that makes it, and a
  reviewer can download the result.
- **`changes`**: decides whether the jobs below run at all. A pull request that changed only
  prose — markdown outside `plugin/`, `test/`, `src/`, `scripts/` and `examples/` — skips
  `test`, `build` and `validate-plugin`, since no test reads such a file. The plugin's skills
  are markdown too, but they are shipped and the suite runs them, so a skill edit runs
  everything, and so does a file renamed out of those trees (both ends of a rename count).
  The rule is `scripts/ci-changes.mjs`, checked by the suite against a real repository. It
  fails closed: the jobs are skipped only on an explicit `false` from a `changes` job that
  succeeded, so a broken detector runs everything rather than letting a PR merge untested.
  Jobs are skipped rather than the workflow filtered with `paths-ignore`, because a workflow
  that never starts leaves a required status check pending forever, where a skipped job
  counts as passing.
- **`public-content`**: `scripts/public-content.mjs` over the whole tree — absolute home paths,
  Wolfram hosts off its allow-list, credential-shaped strings. Never skipped, prose-only PRs
  included, since prose is where such things are pasted. It checks the head, not each commit: a
  pushed branch of a public repository is already public, so the pre-commit hook that
  `npm install` enables (`.githooks/pre-commit`, the same check over what is staged) is what
  keeps a finding out of history.
- **`ci-ok`**: the one check branch protection requires (see the repository settings below).
  It runs last, always, and passes only if every job above passed or was skipped.
- **`validate-plugin`**: Claude Code's own `claude plugin validate`, on the archive from `build`,
  extracted outside any checkout. Pinned to an exact Claude Code (2.1.283 is the first whose
  validator checks LSP paths), because an unpinned latest could change the verdict under an
  unchanged PR. That pin is the validator's, not the plugin's supported client floor. It needs
  no login.

All three run locally:

```bash
npm test
npm run release:artifacts
mkdir -p /tmp/wolfram-plugin && unzip -o release/wolfram-plugin-*.zip -d /tmp/wolfram-plugin
npx -y @anthropic-ai/claude-code@2.1.289 plugin validate /tmp/wolfram-plugin
```

### `release-please.yml` — the whole release, one run per push to `main`

**`release-please`** reads the commits since the last release on `main` (the one integration
branch, since every release writes into the one `-pre.<n>` tag namespace) and keeps one
**release pull request** open against it, on its own branch,
`release-please--branches--<branch>`. That PR carries the version it computed, written into
every file that holds one, and the new `CHANGELOG.md` section. Each merge into the integration
branch updates it: the version moves if a `feat:` arrives after only `fix:`es, and the
changelog grows. Then, **in the same run**:

- when release-please opened or updated its PR, the PR's branch is built and published as the
  next pre-release, `v<x.y.z>-pre.<n>` — a merge that brought nothing releasable (docs alone)
  leaves the PR as it was and builds nothing;
- when a **draft** GitHub release's tag exists — the state merging the PR leaves, since
  release-please makes both at once (`draft` with `force-tag-creation`) — the tag is built and
  the draft published.

**What is finished is read from GitHub, not from the action.** release-please makes the tag,
then the draft, then relabels its PR from `autorelease: pending` to `autorelease: tagged`, and
only a run that gets through all three reports a release. For 0.1.2 the relabel failed, so the
action reported nothing, the build never ran, and the PR stayed pending — which stops
release-please opening the next release PR, and makes its next run try to create the release
again. So after release-please, failed or not, the `pending` job runs
`scripts/pending-release.mjs`: every draft whose `v<x.y.z>` tag exists is built and published,
and every merged PR still pending whose tag has a release is relabelled as release-please would
have — in a job beside the build, so a label that will not change fails the run without holding
back the release. A tag with no release yet keeps its PR pending, so that release-please's next
run makes the release. Every step is idempotent, so a run that fails partway — a release build
that failed included — is finished by the next push to `main`, or at once by dispatching the
workflow from the Actions tab (`gh workflow run release-please.yml --ref main`).

**One run, and no personal token.** Everything here acts with `GITHUB_TOKEN`, and by GitHub's
rule against recursive runs nothing that token does — opening the PR, pushing its branch, making
the tag — starts another workflow. So the build is not started by those events; it is a job of
the run that caused them (`release-build.yml`, called). The cost: release-please's PR runs no
`pull_request` CI of its own. The build runs all of `ci.yml` on that PR's exact commit instead,
and then posts a `ci-ok` status on it, so branch protection sees the result.

### `release-build.yml` — building and publishing a release

The one job that builds and publishes anything, called by `release-please.yml` with the ref to
build. It names the build with `scripts/release-version.mjs` first, so a ref that names no
release fails at once, and pins the commit; runs `ci.yml` in full on that commit; then stamps
the version into the checkout, runs `node scripts/release-artifacts.mjs`, validates the
stamped archive with Claude Code at 2.1.289 and at the 2.1.75 floor, and publishes:

- **release-please's branch** becomes a GitHub pre-release, `v<x.y.z>-pre.<n>`, where `x.y.z`
  is the version release-please computed and `n` is one past the highest `-pre.` tag that
  version has. So every state of the release PR is a build someone can install, and each
  carries a new version string — Claude Code's update signal for an installed plugin is the
  manifest's version, so two builds that both said `0.1.0` would be one version to it.
- **A `v<version>` tag** — the one merging the release PR makes — finishes that release: the
  build uploads the assets to release-please's draft before publishing it, so nobody meets a
  release without its files, and a build that fails leaves only an invisible draft, which the
  next release run builds again. It is published as a normal release, a pre-release only when
  its version has a `-` suffix, with Latest off; then the highest version published is marked
  Latest (`release-version.mjs --latest`). GitHub makes a newly published release Latest unless
  told otherwise, so a draft finished late would take Latest from a newer one, and a version
  only tagged is not released. Read after the publish, so of two builds the last sees both.
- **Run by hand** — dispatched on a tag, or a tag pushed by a person — it builds that tag. A
  release already published is refused, never rebuilt: the new assets would differ byte for
  byte, and an `archive` source pinned to the first zip's digest would then refuse every
  install.
- **A version already tagged** is never built again as a pre-release: a `0.1.0-pre.N` after
  `0.1.0` would rank below the release, and an installed plugin would still take the changed
  string as an update. release-please's next PR names the next version instead.

Release runs never overlap, and GitHub keeps only the newest pending one, so pushes that land
while one runs collapse into one run that sees all of them. The version is stamped into the CI
checkout only and never committed.

## The artifacts

`npm run release:artifacts` writes the bundle, the plugin archive, and `SHA256SUMS.txt` into
`release/`:

```bash
npm run release:artifacts                       # bundle + plugin archive + sums
shasum -a 256 -c release/SHA256SUMS.txt          # verify every asset
```

## Versioning, and the two version strings

The version lives in `package.json` and `plugin/.claude-plugin/plugin.json`, and the suite fails
if the plugin's drifts from the package's. release-please keeps both in step: `release-type:
node` bumps `package.json` and the lockfile, and the `extra-files` entry in
`release-please-config.json` bumps the plugin's by JSON path. Add another place the version
appears and it must join that list, or the release PR will bump some of them and turn the suite
red.

A release build stamps its own version over all of them (`scripts/release-version.mjs --stamp`,
which also covers the lockfile), so a pre-release's archive and bundle both say `0.1.0-pre.3`
while the branch still says `0.1.0`. The suite checks the naming and the stamp.

`.release-please-manifest.json` records the last version released, which release-please bumps
from. Before the first release it finds no release matching the manifest's `0.0.0`, and
proposes its `initial-version` instead — `1.0.0` unless configured, which is what the first
release PR asked for. So the config sets `initial-version` to the
`0.1.0` the files carry, and while the manifest still says `0.0.0` the suite fails if the two
differ. After the first release the setting is inert and the check passes whatever it says;
from there every release is a `0.x` minor or patch until 1.0.0 (`bump-minor-pre-major`).

## Repo settings the automation depends on

The workflows assume a few one-time GitHub settings. Without them the pipeline does not error — it
just quietly fails to do its job, which is worse.

- **Let Actions open pull requests.** Settings → Actions → General → "Allow GitHub Actions to
  create and approve pull requests" (or `gh api -X PUT repos/<owner>/<repo>/actions/permissions/workflow
  -F can_approve_pull_request_reviews=true -f default_workflow_permissions=read`). release-please
  opens its PR with `GITHUB_TOKEN`; without this it cannot, and no release happens. No personal
  token is used anywhere.
- **Squash-merge, with the PR title as the commit message.** Settings → General → Pull Requests:
  enable "Allow squash merging", set the default squash commit message to "Pull request title,"
  and turn off merge commits and rebase merging, so squash is the only way in. This is the linchpin — it makes one PR equal one Conventional Commit, which is what release-please
  reads. `pr-title.yml` enforces that the title is a valid Conventional Commit so this never
  produces a commit that skips a bump.
- **Protect `main`.** No direct pushes, no force-pushes, no deletion: changes arrive only by pull
  request. Turn on secret scanning and push protection (Settings → Code security), the
  server-side half of what `public-content` checks.
- **Private vulnerability reporting.** Settings → Code security → "Private vulnerability
  reporting". `SECURITY.md` sends reporters there; with it off, its *Report a vulnerability*
  button does not exist and the only way left to report is a public issue.
- **Require the checks on `main`.** In the branch protection rules, require `conventional-title`,
  `commit-types` and `ci-ok` to pass before merge (`ci-ok` covers `public-content`) — `ci-ok` alone, not `test`, `build` or `validate-plugin`.
  Those are skipped on a prose-only PR, and a skipped matrix job reports one `test` check
  rather than `test (22.13.0)` and `test (node)`, so requiring them would leave such a PR
  waiting forever. `ci-ok` always runs, under that one name, and fails if any of them failed
  or was cancelled. This is what actually gates a
  release: a release PR whose suite is red cannot be merged, so a broken build never reaches a tag.

With those set, the day-to-day is your feature/fix PRs, merged into `main`. Each merge updates release-please's release PR, which
publishes the next pre-release of the computed version; merging that PR is the release. A tag
pushed by hand also builds, but release-please never learns of it: bump
`.release-please-manifest.json` to match in the same change, or its next release PR proposes a
version whose tag already exists.

## Acceptance on a separate machine: containers

`npm run test:container` runs the release bundle (build it first with
`npm run release:artifacts`) in fresh Linux containers: a machine this checkout has never
touched, and the Linux x86_64 the plugin supports. Each scenario mounts only the bundle,
`scripts/container-driver.mjs` and exactly Node 22.13.0, fetched once from nodejs.org and
checked against its published sums, so every run also tests the Node floor. It needs Docker
(OrbStack works) and spends no seat on this machine. Wolfram's `wolframresearch/wolframengine`
image is amd64 only, which an Apple Silicon Mac runs under emulation.

- **Unactivated:** the Engine image as published is unactivated, so this needs no licence.
- **No Wolfram:** a plain `ubuntu:24.04`.
- **Node below the floor:** `node:20-slim`.
- **The setup skill, before and after activation:** Claude Code 2.1.224 for Linux inside the
  Engine image, running `/wolfram:wolfram-setup` unactivated, then with the saved activation
  mounted. Its config directory, `~/.config/wolfram-mcp-server/claude-test-config-linux`, is
  signed in by you, interactively: `npm run test:container -- login` opens Claude Code in a
  container in your terminal for `/login`; the scenario is skipped until then.
- **Offline, on the paclet the Engine ships:** a saved activation and `--network none`, so the
  bundled AgentTools (2.1.17 in 15.0.0) cannot update itself and has to serve.
- **Licensed, by a saved activation** (preferred, no cost per run). The `mathpass` is
  node-locked to the container's machine ID, which the Engine derives from
  `/etc/machine-id`, and names the hostname it was made under; it validates only for the
  image's own user, uid 999. So pin both before activating, once, keeping everything on the
  host —

  ```bash
  d=~/.config/wolfram-mcp-server/container-licensing
  mkdir -p -m 700 "$d" && [ -f "$d/machine-id" ] || (uuidgen | tr -d - | tr A-F a-f > "$d/machine-id")
  docker run -it --rm --platform linux/amd64 --hostname wmcp-test \
    -v "$d/machine-id:/etc/machine-id:ro" \
    -v "$d:/home/wolframengine/.WolframEngine/Licensing" \
    wolframresearch/wolframengine:15.0.0
  ```

  — sign in at the prompt, then `Quit`. Later runs mount the same three read-only, so the
  activation serves every run on any host the directory is on. Never replace `machine-id`
  after activating. It uses one of the Wolfram ID's two free Engine activation keys; an
  activation another project already made for its own containers can be used instead, by
  pointing `WOLFRAM_MCP_TEST_LICENSING`, `WOLFRAM_MCP_TEST_MACHINE_ID` and
  `WOLFRAM_MCP_TEST_HOSTNAME` at its directory, machine-id file and hostname.
- **Licensed, by entitlement**, when there is no saved activation (or `WMCP_LICENCE=entitlement`
  forces it): only when `WOLFRAM_MCP_TEST_ENTITLEMENT`, or the 0600 file
  `~/.config/wolfram-mcp-server/test-entitlement`, holds an on-demand licence
  entitlement ID — Wolfram's documented route for automated runs (plugin plan D21). Create
  one, signed in, with
  `CreateLicenseEntitlement[<|"StandardKernelLimit" -> 2, "LicenseExpiration" -> Quantity[1, "Hours"], "EntitlementExpiration" -> Quantity[90, "Days"]|>]["EntitlementID"]`.
  Creating it is free; its kernels are charged to your Service Credits while they run,
  so the scenario ends by checking none is left. The ID never goes on a command line or into
  output: it reaches the container as `WOLFRAMINIT` through a 0600 env file deleted
  afterwards. Keep it out of the repository; in CI it would be a secret.

## Acceptance on exact Claude Code versions

`npm run test:client -- <version>…` runs the plugin, from the release archive, on exact Claude
Code versions installed from npm into their own prefixes, headless: the MCP server, the hook's
text, an evaluation, one kernel across a cold and a warm session, no LSP kernel with the option
unset, and `/wolfram:doctor`. Every version shares one test config directory,
`~/.config/wolfram-mcp-server/claude-test-config`, never `~/.claude`.

Signing that directory in is interactive and yours: `npm run test:client -- login <version>`
opens the client in your terminal, where you run `/login`, then `/exit`. Nothing here handles a
credential; a run that finds the directory signed out stops and prints that command. It uses
the signed-in account's model usage, and a licence seat per kernel.

## Trying it locally

Everything above the GitHub boundary runs locally: `npm test`, `npm run release:artifacts`, and
a build's name and stamp:

```bash
GITHUB_REF_NAME=release-please--branches--main GITHUB_REF_TYPE=branch \
  node scripts/release-version.mjs        # the version comes from package.json
node scripts/commit-types.mjs origin/main HEAD   # what CI asks of a PR's commits
GITHUB_REPOSITORY=<owner>/<repo> node scripts/pending-release.mjs   # what a release run would finish; reads only
GITHUB_REPOSITORY=<owner>/<repo> node scripts/release-version.mjs --latest   # the release that should be Latest
node scripts/release-version.mjs --stamp 0.1.0-pre.99   # then restore what it changed (git status)
```

The workflow YAML and the release-please config are what remain, and the honest way to prove
those is on the real repo:

- **The release PR** exercises all of it: merge a `fix:` or `feat:` into `main`;
  release-please opens or updates its PR, the PR's branch builds the next pre-release, and
  merging the PR makes the draft, the tag, and the published release. Check a build with
  `gh release download <tag> -D <dir>` and `shasum -a 256 -c SHA256SUMS.txt`.
- **`actionlint`** (`brew install actionlint`) statically checks the workflow syntax and the
  `${{ }}` expressions without running anything.
- **`act`** (`brew install act`) runs `ci.yml` in a Docker container. It cannot stand in for the
  release path, which depends on GitHub's release API and token, so scope it to CI:

  ```bash
  act -j test  -W .github/workflows/ci.yml -P ubuntu-latest=catthehacker/ubuntu:act-latest
  act -j build -W .github/workflows/ci.yml -P ubuntu-latest=catthehacker/ubuntu:act-latest \
    --artifact-server-path /tmp/act-artifacts
  ```

  **On Apple silicon, run the runner image at its native `arm64` — do not force
  `--container-architecture linux/amd64`.** The image is multi-arch, so drop the flag and, if the
  amd64 layer is already cached, pull the native one first:
  `docker pull --platform linux/arm64 catthehacker/ubuntu:act-latest`. This matters here
  specifically: qemu-emulated amd64 runs several times slower, and the suite has speed-sensitive
  checks — the cancellation test on the broker path loses its dispatch race under emulation and
  reports a failure that is an artifact of the emulator, not the code. Native `arm64` (or a real
  amd64 runner) passes. `setup-node`'s `cache: npm` also warns that it found no cache under `act` —
  harmless, there is no GitHub cache backend locally.

## Trying the plugin as a local install

There are two ways to try the built plugin locally; which one depends on whether you want it
*persisted* for a directory or just loaded for a session.

**Quickest — `--plugin-dir`, session only.** `--plugin-dir` loads a plugin with no marketplace,
and it accepts the archive `.zip` directly, so this runs the exact release artifact with nothing to
set up:

```bash
npm run release:artifacts
claude --plugin-dir <repo>/release/wolfram-plugin-<version>.zip
```

The plugin is active for that session — `/plugin`, `/mcp`, and the verification below all apply —
and nothing is written to any settings file. This is the most faithful "does the artifact work"
check; use it for iteration.

**Persisted at project scope — needs a marketplace.** There is no `settings.json` key that points
at a bare plugin directory: `enabledPlugins` identifies a plugin as `name@marketplace`, and
marketplaces are registered with `extraKnownMarketplaces`, so *persisting* a plugin to a project
always goes through a marketplace — a `directory` one pointing at a directory that contains
`.claude-plugin/marketplace.json`, not at a plugin directly. That is the one-file wrapper below,
and it is exactly what this repo does for itself. The marketplace-free routes are all
non-persistent (`--plugin-dir`, `--plugin-url`) or user-scoped (`~/.claude/skills/`), so project
scope is where the wrapper earns its keep. (Official docs, under `code.claude.com/docs/en`:
`plugins`, `plugin-marketplaces`, `discover-plugins`, `settings-reference`, `mcp`.)

Lay it out in one fresh, disposable directory — `~/wolfram-plugin-test` here:

1. Build the artifacts, from the repo:

   ```bash
   npm run release:artifacts
   ```

2. Extract the archive as the plugin, into a `wolfram/` subdirectory of the test dir:

   ```bash
   mkdir -p ~/wolfram-plugin-test/wolfram
   unzip <repo>/release/wolfram-plugin-<version>.zip -d ~/wolfram-plugin-test/wolfram
   ```

   That yields `~/wolfram-plugin-test/wolfram/.claude-plugin/plugin.json`, the plugin's README
   and LICENSE, and the bundle beside them — the assembled `release/plugin/` tree, exactly what a
   marketplace archive install extracts.

3. Write the wrapper marketplace at `~/wolfram-plugin-test/.claude-plugin/marketplace.json`:

   ```json
   {
     "name": "wolfram-local",
     "owner": { "name": "local test" },
     "plugins": [{ "name": "wolfram", "source": "./wolfram", "description": "local archive test" }]
   }
   ```

   `source` is relative to the marketplace directory; `./wolfram` is the plugin from step 2.

4. Enable it at **project scope**. Either write `~/wolfram-plugin-test/.claude/settings.json`
   directly (the version-stable way):

   ```json
   {
     "extraKnownMarketplaces": {
       "wolfram-local": { "source": { "source": "directory", "path": "." } }
     },
     "enabledPlugins": { "wolfram@wolfram-local": true }
   }
   ```

   or, running `claude` inside `~/wolfram-plugin-test`, through the UI:

   ```
   /plugin marketplace add ./.claude-plugin
   /plugin install wolfram@wolfram-local      # choose Project scope at the prompt
   ```

   Both write the same two keys. The enablement key is `<plugin>@<marketplace>` —
   `wolfram@wolfram-local`, the plugin's own name (from its `plugin.json`) before the `@`, the
   marketplace's after. Project scope is `.claude/settings.json`; local (git-ignored) is
   `.claude/settings.local.json`; user is `~/.claude/settings.json` — pick project so it stays in
   the one directory.

5. Verify, running `claude` inside `~/wolfram-plugin-test`:

   - `/plugin` — the Installed list shows `wolfram@wolfram-local` active and the Errors tab empty;
     `claude --debug` prints why anything was skipped.
   - `/mcp` — the `WolframLanguage` server is connected and lists its tools
     (`WolframLanguageEvaluator`, `wolfram_status`). This much needs no kernel and no licence seat:
     the list comes from the cold-start table, so it is the proof the bundle starts and speaks the
     protocol at all — the anyone-can-install path working end to end short of an evaluation.
   - Ask for `wolfram_status` — it answers without a kernel, reporting what it would start.
   - With a real Wolfram installation, call `WolframLanguageEvaluator` on `1+1`: that spawns a
     kernel (one seat) and is the full proof. Opening a `.wl` file exercises the LSP half — also a
     seat, declinable with `WOLFRAM_MCP_LSP=0` in the plugin's `env` if you want the MCP side only.

To iterate, rebuild (`npm run release:artifacts`), copy the fresh bundle over
`~/wolfram-plugin-test/wolfram/wolfram-mcp-server.mjs`, and restart the client. To tear down,
delete `~/wolfram-plugin-test` — nothing was written anywhere else.

**Simpler, MCP-only.** To check just the server — not the plugin packaging or the LSP — a project
`.mcp.json` in a fresh directory is enough:

```json
{
  "mcpServers": {
    "WolframLanguage": {
      "type": "stdio",
      "command": "node",
      "args": ["<repo>/release/wolfram-mcp-server.mjs"],
      "env": { "MCP_SERVER_NAME": "WolframLanguage" }
    }
  }
}
```

Run `claude` there, accept the workspace-trust prompt, and approve the project server when asked
(`claude mcp list` shows it pending until you do); `/mcp` then shows it connected.

The exact `/plugin` prompts and any `claude plugin …` flags shift between Claude Code versions —
the file contents above are the stable part, and `/help` and `/plugin` in your installed version
are the source of truth for the commands.
