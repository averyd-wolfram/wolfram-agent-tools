#!/usr/bin/env node
/**
 * The Claude Code plugin's LSP entry. The logic lives in src/lsp.ts as the
 * CLI's `lsp` subcommand — one implementation serving this launcher, the
 * single-file bundle, and any editor that invokes the CLI directly — so the
 * three entries cannot drift. What remains here is what a source clone needs
 * before dist/ exists: the Node version guard, and the npm install
 * instruction, each written for the person who will actually see it.
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
  // The same instruction mcp-server.mjs gives: a plugin install is a git
  // clone, and nothing in that path has run `npm install` yet.
  process.stderr.write(
    `\n  wolfram-mcp-server is not built yet — ${entry} is missing.\n\n` +
      `  Run this once, from the plugin directory:\n\n` +
      `      npm install\n\n` +
      `  (that builds dist/ via the prepare script), then run /reload-plugins.\n\n`,
  );
  process.exit(1);
}

// Hand over to the CLI's lsp subcommand in-process: index.js reads its
// arguments from process.argv, so rewrite them before the import runs it.
process.argv = [process.argv[0] ?? "node", entry, "lsp"];
await import(pathToFileURL(entry).href);
