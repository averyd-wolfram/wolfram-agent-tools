---
name: wolfram-setup
description: >
  Get this Wolfram plugin working: find or install a Wolfram kernel (14.3 or newer), activate
  it, choose which installation the plugin uses, and verify the plugin's tools answer. Use
  when the Wolfram tools are missing or failing, when wolfram_status says no installation was
  found, when installing or activating the Wolfram Engine, or when the user asks how to set
  up Wolfram for Claude.
---

# Wolfram setup

Adapted from Wolfram Research's
[`wolfram-setup`](https://github.com/WolframResearch/skills/tree/main/skills/wolfram-setup)
skill (MIT; see `NOTICE` in the plugin root). This version sets up *this plugin*, which is
already installed: it never runs `InstallMCPServer`, and never adds a server or a hosted
endpoint to any client's configuration. A second Wolfram server beside the plugin would
bypass the kernel sharing that keeps licence seats free, and duplicate every tool.

## Step 1: Where are you running?

**Claude chat, with no shell on the user's machine.** This plugin's tools do not run here.
Describe the **Wolfram connector** instead: in Claude's settings, under connectors, the user
can connect Wolfram, which computes on Wolfram's servers with no local install. Give no
local commands, paths or `/wolfram:doctor` — none of them exist in chat. Stop here.

**Claude Code or Cowork, with a shell.** Continue.

## Step 2: Ask the plugin what it found

**If none of the plugin's Wolfram tools exist** (not even `wolfram_status`), its server did
not start, and the likeliest cause is Node: run `node --version`. Missing, or older than
22.13, means installing Node from <https://nodejs.org>, then restarting Claude Code. Claude
Code remembers a failed server start for up to 15 minutes, so the tools may take that long
to appear; say so. `/wolfram:doctor` needs Node too, so it cannot help until then.

Otherwise run `/wolfram:doctor`. It starts a kernel to check that the installation it selected
actually answers, so it uses one licence seat while it runs; tell the user before running it
if their licence is fully in use. It asks `wolframscript` only when nothing else finds an
installation. It reports:

- **A selected kernel that answered** → go to Step 5.
- **A kernel below 14.3** → the plugin needs 14.3 or newer, because `Wolfram/AgentTools`
  does. If a newer one is installed, go to Step 4 to select it; otherwise Step 3.
- **A kernel that failed to start**, with its last output → read that output. "This kernel
  is not activated" (the kernel's own words: `No valid password found.`), or a start that
  times out waiting for credentials it cannot be given here, means activation: go to the
  activation part of Step 3. A missing or downloading paclet is fixed by starting the
  kernel once with network access.
- **No installation** → Step 3. Before concluding nothing is installed, check the usual
  places, since `wolframscript` may simply not be on `PATH`:
  - macOS: `/Applications/Wolfram*.app`, `/Applications/Mathematica.app`
  - Linux: `/usr/local/Wolfram/`

  If one is there, go to Step 4 rather than installing a second copy.

## Step 3: Get and activate a kernel (only if needed)

The free **Wolfram Engine** is a full local kernel. The user needs a
[Wolfram ID](https://account.wolfram.com/login/create) and a
[free licence](https://account.wolfram.com/access/wolfram-engine/free), which they must get
themselves. `references/get-wolfram-engine.md` has the platform steps. Always ask before
running an installer.

Activate the Engine with `wolframscript -activate`, run where the user can type their Wolfram
ID and password — interactively if you can open a terminal for them, otherwise as an
instruction. A Wolfram desktop app (Wolfram, Mathematica) is activated instead by opening it
once and signing in. Each Wolfram ID has two free Engine activation keys;
[Wolfram support](mailto:support@wolfram.com) resets them.

**No one at the keyboard** — a headless server, a container, CI — needs one of these, since
activation itself asks for a Wolfram ID:

- **Activate once and keep the result.** Activation writes a `mathpass` (its location is
  `$PasswordFile`), tied to the machine's ID and the hostname it was made under, so it serves
  that machine again. In a container the machine ID comes from `/etc/machine-id`: give the
  container a fixed machine-id file and hostname, activate it interactively once with its
  `~/.WolframEngine/Licensing` directory mounted from the host, then mount all three
  read-only into later containers, running as the image's own user. Never replace the
  machine-id file afterwards; a container with a different identity needs its own
  activation.
- **An on-demand licence entitlement**, made with `CreateLicenseEntitlement` by an account
  with Service Credits. The plugin starts kernels itself rather than through `wolframscript`,
  so pass it the way a directly started kernel reads it:
  `WOLFRAMINIT="-pwfile !cloudlm.wolfram.com -entitlement <id>"` in the environment Claude
  Code starts the plugin from. Kernels are charged per hour while they run, up to the
  entitlement's kernel limit; treat the ID as a secret.
- **A network licence server (MathLM)**, if the organisation has one: a `mathpass` whose only
  line is `!<server>`.

**Required:** `wolframscript -code '1+1'` prints `2` before you go on. That evaluation starts
a kernel, so it uses a licence seat while it runs.

## Step 4: Choose the installation, if there is more than one

The plugin uses, in order: `WOLFRAM_MCP_KERNEL` (a path) or `WOLFRAM_MCP_VERSION` (such as
`14.3`) if the user set one; then the kernel **`wolframscript` is configured to use**; then the
newest installation on disk. So to change which one the plugin uses without touching any
plugin setting:

```bash
# macOS
wolframscript -configure WOLFRAMSCRIPT_KERNELPATH="/Applications/Wolfram 14.3.0 (2025-07-08).app"
# Linux
wolframscript -configure WOLFRAMSCRIPT_KERNELPATH=/usr/local/Wolfram/WolframEngine/15.0/Executables/WolframKernel
```

`wolframscript -configure` with no value shows the current setting and where its
`WolframScript.conf` lives. A new Claude Code session picks up the change.

## Step 5: Verify the plugin

1. Run `/wolfram:doctor` again. It should report a selected kernel that answered.
2. Ask for one computation through the plugin's evaluator, for example
   `Expand[(x + 1)^5]` with the `WolframLanguageEvaluator` tool. Expect
   `1 + 5 x + 10 x^2 + 10 x^3 + 5 x^4 + x^5`.

If both work, setup is complete. If the tools are missing entirely, the user may have
switched the plugin's server off in `/mcp`, or started this session before installing the
plugin; a new session fixes the second.

## Troubleshooting

| Problem | What to do |
|---|---|
| `wolframscript` not found after installing | Check `PATH`, or point at the kernel with `wolframscript -configure WOLFRAMSCRIPT_KERNELPATH=...` ([support article](https://support.wolfram.com/47243)) |
| Every call fails at once with `No valid password found.` | The kernel is not activated: see Step 3. A Wolfram app is activated by opening it once and signing in |
| "No valid keys" on activation | Each Wolfram ID has two keys; [Wolfram support](mailto:support@wolfram.com) resets them |
| Activation fails behind a proxy | Set `https_proxy` before running `wolframscript` |
| macOS blocks the app | Right-click the `.app`, Open, then confirm |
| Every call fails at once, "retried in …" | A kernel failed to start and the plugin is waiting before trying again. `wolfram_status` shows why. Fixing or replacing the installation ends the wait immediately |
| doctor or the log says "not sharing kernels" | Sessions are using a kernel each, which costs a seat each. The directory for the shared socket must be the user's and writable by no one else; set `WOLFRAM_MCP_RUNTIME_DIR` to such a directory if the default does not suit |
| Calls fail after a long wait | The first call can include a paclet download; a slow network or an unactivated Engine shows up here. `/wolfram:doctor` shows the kernel's own words |
