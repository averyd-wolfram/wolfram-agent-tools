#!/usr/bin/env node
/**
 * Launcher used by this repo's own .mcp.json, via `npm run --silent mcp`.
 *
 * Why this exists rather than `node dist/index.js` in .mcp.json directly:
 * .mcp.json is committed, so it cannot hold an absolute path, and an MCP client
 * does not guarantee the working directory — Claude Code launches servers with
 * the cwd that `claude` was started in, which may be any subdirectory. `npm run`
 * does guarantee cwd is the package root, and this file resolves dist/ relative
 * to itself regardless.
 *
 * It also turns a missing build into an instruction rather than a stack trace.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";


// Before anything that might use newer APIs: a plugin user's Node is whatever
// their machine happens to have, and a version failure without this reads as
// undefined breakage instead of an instruction.
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 13)) {
  process.stderr.write(
    `\n  wolfram-mcp-server needs Node 22.13 or newer; this is ${process.versions.node}.\n` +
    `  Install a current Node (https://nodejs.org) and restart your MCP client.\n\n`,
  );
  process.exit(1);
}

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const entry = join(root, "dist", "index.js");

if (!existsSync(entry)) {
  // stderr only: stdout is the MCP protocol channel.
  process.stderr.write(
    `\n  wolfram-mcp-server is not built yet — ${entry} is missing.\n\n` +
      `  Run this once, from anywhere in the repo:\n\n` +
      `      npm install\n\n` +
      `  (that builds dist/ via the prepare script), then restart your MCP client.\n\n`,
  );
  process.exit(1);
}

// pathToFileURL, not the bare path: an absolute path is not a valid ESM
// specifier (a Windows drive letter parses as a URL scheme), so a file:// URL
// is the portable form — the same handover lsp-server.mjs makes.
await import(pathToFileURL(entry).href);
