---
name: doctor
description: >
  Diagnose the Wolfram plugin on this machine: which Wolfram installation it found and why,
  whether a kernel starts and answers, the AgentTools paclet, the licence, the account, and
  what every relevant setting is. Use when the Wolfram tools are missing, failing or slow,
  or when wolfram_status or an error message says to run /wolfram:doctor.
---

# Wolfram doctor

**In Claude chat, with no shell on the user's machine**, this cannot run: say that
`/wolfram:doctor` needs Claude Code or Cowork, where the plugin runs on the user's own
computer, and stop. In chat, Wolfram is available through the Wolfram connector instead.

**Otherwise**, run this with the shell tool and show the user its report:

```bash
WOLFRAM_MCP_DEFAULT_SERVER=WolframLanguage node "${CLAUDE_PLUGIN_ROOT}/wolfram-mcp-server.mjs" doctor
```

The variable is the plugin's default server, which Claude Code gives only to the plugin's
MCP server: without it, doctor would report on a different server than the one the plugin
runs. An explicit `MCP_SERVER_NAME` in the user's environment still wins.

It starts a kernel to check that the selected installation answers, so it uses one licence
seat while it runs, and it can take a couple of minutes on a machine it has not seen before.
If the user's licence may be fully in use, say so before running it. When nothing else finds
an installation it also asks `wolframscript`, and records what it finds, so the next session
finds that installation without asking.

Then explain the report, briefly:

- **Exit 0** — a kernel was selected and answered. If the user's tools still fail, the cause
  is in the failing call's own error, which carries the kernel's words.
- **Exit 1** — read the report for what is missing. For anything to do with installing,
  activating or choosing an installation, follow the `wolfram-setup` skill.

Do not edit any client's MCP configuration or run `InstallMCPServer` to fix what doctor
reports: the plugin already provides the server, and a second one bypasses its kernel
sharing.
