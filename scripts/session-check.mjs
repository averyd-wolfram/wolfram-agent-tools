#!/usr/bin/env node
/**
 * The SessionStart hook: say, once, when this repo's enforcement is dark.
 *
 * The on-edit hook exits silently when the toolchain is missing, because a
 * fresh clone must not block every edit — which leaves exactly one failure
 * mode with no reporter: a contributor working without the gate and not
 * knowing it. This closes that. Healthy machines produce no output at all;
 * anything printed lands in the session's context, so the agent knows the
 * gate's actual state before the first edit.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const missing = [];

if (!existsSync(join(root, "node_modules", ".bin", "prettier"))) {
  missing.push(
    "the TypeScript gate (prettier, eslint, tsc on every edit) is OFF — run `npm install` once",
  );
} else if (!existsSync(join(root, "dist", "lib.js"))) {
  missing.push("dist/ is not built, so the MCP and LSP launchers will refuse — run `npm run build`");
}

// The plugin a session in this repo loads is the assembled tree, not the
// source: with none assembled, the plugin has nothing to run and its tools are
// simply absent, which says nothing about why.
if (!existsSync(join(root, "release", "plugin", "wolfram-mcp-server.mjs"))) {
  missing.push(
    "release/plugin/ is not assembled, so this repo's plugin has nothing to run — " +
      "run `npm run release:artifacts`, then start a new session",
  );
}

const wolframscript = spawnSync("command", ["-v", "wolframscript"], { shell: true });
if (wolframscript.status !== 0) {
  missing.push(
    "wolframscript is not on PATH — `npm run lint:wl`, `test:wl` and the LSP kernel need it",
  );
}

if (missing.length > 0) {
  process.stdout.write(
    `wolfram-mcp-server enforcement status:\n${missing.map((m) => `  - ${m}`).join("\n")}\n`,
  );
}
process.exit(0);
