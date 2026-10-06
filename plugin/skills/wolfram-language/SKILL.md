---
name: wolfram-language
description: >
  How to use the Wolfram plugin's tools well: evaluating Wolfram Language and keeping state
  across calls, looking up documentation and definitions, linting code, running tests, and
  reading and writing notebooks. Use when computing anything with Wolfram Language or
  Wolfram|Alpha-style knowledge, or when working on .wl, .wls, .wlt, .m or .nb files.
---

# Using Wolfram Language through the plugin

**In Claude chat, with no shell on the user's machine**, none of the tools below exist. The
**Wolfram connector** provides Wolfram computation in chat, on Wolfram's servers; describe
it if the user asks, and give no local commands, file paths or slash commands.

**In Claude Code or Cowork**, the plugin's tools compute on the user's own Wolfram kernel.

## The tools

| Tool | Use it for |
|---|---|
| `WolframLanguageContext` | Ask first, for the current documentation and examples on a topic, before writing code |
| `WolframLanguageEvaluator` | Run Wolfram Language. Returns the result, and graphics as images |
| `SymbolDefinition` | Read how a symbol is defined: built-ins, loaded packages, and what the evaluator defined |
| `CodeInspector` | Lint Wolfram Language code, a file, or a directory |
| `TestReport` | Run a `.wlt` test file and report each test |
| `ReadNotebook`, `WriteNotebook` | Read a `.nb` as text, or write one from text |
| `wolfram_status` | What the plugin found and what state it is in. Never starts a kernel; ask it when the other tools fail |

## Working with the evaluator

- **Sessions keep state.** The evaluator returns a `session` ID; pass it back to keep
  definitions, variables and `%` between calls. Omit it for a fresh session.
- **Session definitions live in a context of their own,** ``Sessions`<id>` ``, so
  `SymbolDefinition` finds `f` defined there only by its full name,
  ``Sessions`<id>`f`` — it suggests that name when asked for the short one.
- **Long work.** An evaluation stops itself at 60 seconds unless a `timeConstraint` is
  passed or the user's `MCP_TOOL_OPTIONS` says otherwise. If the plugin stops waiting first,
  the kernel keeps working and the session survives; the result is simply not returned.
- **Natural language** inside code: `\[FreeformPrompt]["population of France"]` turns a
  phrase into an `Entity`, `Quantity` or expression.
- **The first call** in a session starts a kernel, which can take several seconds; it then
  stays up for ten idle minutes and is shared with other Claude sessions on this machine.

## Code and files

- Check a file with `CodeInspector` before claiming it is correct, and run its `.wlt` tests
  with `TestReport`. Its default hides Formatting and Scoping issues — unused variables and
  parameters among them — so pass `severityExclusions: "Formatting"` to see those too.
- `WriteNotebook` produces a real `.nb` file; prefer `.wl` source unless the user wants a
  notebook.

## When something fails

`wolfram_status` says why without starting anything. If calls fail at once with "retried
in …", a kernel failed to start and the plugin is waiting before trying again; the status
says why. For a full diagnosis use the `doctor` skill (`/wolfram:doctor`), and for installing
or activating Wolfram the `wolfram-setup` skill.
