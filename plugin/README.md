# Wolfram plugin for Claude Code

Wolfram Language in Claude Code, computed by the Wolfram kernel on your own machine: the
`WolframLanguage` tools (evaluation, documentation search, notebooks, code inspection, tests),
and code intelligence, on by default, for `.wl`, `.wls`, `.wlt` and `.m` files from Wolfram's own
LSPServer.

## Requirements

- **macOS or Linux.**
- **Node.js 22.13 or newer**, as `node` on your `PATH`. Claude Code starts the plugin with
  `node`; without it the plugin's server never starts, and Claude Code shows the server as
  failed, with no Wolfram tools, because nothing of the plugin's own has run yet to say more.
  Install Node from <https://nodejs.org> and restart Claude Code. Claude Code remembers a
  failed start for up to 15 minutes, so the tools may not appear at once: its message says
  it retries by itself, or sooner if you edit the plugin's configuration. With an older Node,
  the plugin says which version it needs.
- **Claude Code 2.1.75 or newer.** Older versions reject the plugin's settings and load none
  of it, with no Wolfram tools and no error shown; `claude --version`, or `/status` in Claude
  Desktop's Code tab, says which you have. Installing from a release archive needs 2.1.224 or
  newer.
- **An activated Wolfram kernel, 14.3 or newer**: Wolfram, Mathematica or the free Wolfram
  Engine. The `Wolfram/AgentTools` paclet it needs installs itself on first use.

If a requirement is missing, `wolfram_status` and `/wolfram:doctor` say which one and how to
get it.

## Using it

Ask Claude to compute something. The first call in a session starts a kernel; it takes a
licence seat while it runs, is shared with other Claude sessions on this machine, and shuts
down after ten idle minutes.

- `/wolfram:doctor` reports what the plugin found on this machine, and finds an
  installation that only `wolframscript` knows about.
- The `wolfram_status` tool answers without starting a kernel, including when kernels are
  the thing that is broken.

## Code intelligence

On by default: diagnostics, completion and hover in Wolfram Language files (`.wl`, `.wls`,
`.wlt`, `.m`). From the first such file a session opens, it runs a second kernel for the rest
of the session, which holds one licence seat outside the ones the evaluation tools share — on a
two-seat licence, that is half of it. To keep that seat, turn off the plugin's **lsp** option;
it applies from the next session. Setting `WOLFRAM_MCP_LSP=0` or `1` in your environment
overrides the option.

## Limitations

- **Local only.** Every computation runs on your kernel. There is no hosted fallback.
- **No combined seat limit across the two kernels.** The code-intelligence kernel, when on,
  is counted separately from the evaluation kernels.
- **The first session on a cold cache starts one kernel at startup**, to learn the tool list:
  after installing, after clearing the cache, or every session if the cache is disabled or
  cannot be written. Prompts appear from the next session after that, and not at all while
  the cache is disabled or unwritable.
- **A shared kernel that cannot start is retried on every call.** Sessions share kernels by
  default. When the shared kernel fails to start, the error can take up to about four minutes
  to arrive, and the next call tries again instead of waiting ten minutes as an unshared
  session does. Each attempt briefly takes a licence seat. Run `/wolfram:doctor` to find the
  cause; setting `WOLFRAM_MCP_SHARE=0` gives the session its own kernel, with the full time
  limit and wait.
- **Claude Code only** in this release.

## Licence

MIT, as `LICENSE` in this directory says.
