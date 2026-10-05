#!/usr/bin/env node
/**
 * Build the single-file artifact: the whole CLI — serve, doctor, broker, lsp —
 * with its one dependency tree (@modelcontextprotocol/sdk) inlined, so the
 * distributed deliverable is a file, not a clone. A marketplace install is a
 * copy into a cache directory the user must never be told to `npm install`
 * inside; this is what makes that instruction unnecessary.
 *
 * The package identity is injected via --define, because the bundle ships with
 * no package.json beside it and src/version.ts otherwise reads one from disk.
 */
import { chmodSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const outfile = join(root, "bundle", "wolfram-mcp-server.mjs");
mkdirSync(dirname(outfile), { recursive: true });

await build({
  entryPoints: [join(root, "dist", "index.js")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: ["node22.13"],
  outfile,
  banner: {
    // The entry's own shebang is hoisted above this banner by esbuild, so the
    // file stays directly runnable without a second shebang colliding on line
    // two. The createRequire shim is for any CommonJS corner of the dependency
    // tree that esbuild lowers to a require call, which does not exist in a
    // real ESM module scope.
    //
    // The Node-floor guard runs before any bundled code, because the launchers
    // (scripts/*.mjs) that carry it for the source clone are not present in the
    // single-file artifact — it is launched directly (`node …/wolfram-mcp-server.mjs`),
    // so without this an old-Node user of the one file a release delivers gets a
    // raw crash instead of the instruction. (Node < 14.8 cannot parse the
    // top-level await this bundle ends with and so fails earlier with a bare
    // SyntaxError; the floor is 22.13, so that older gap is academic.)
    js:
      'import { createRequire as __createRequire } from "node:module";\n' +
      "const require = __createRequire(import.meta.url);\n" +
      "{\n" +
      "  const __n = process.versions.node.split('.').map(Number);\n" +
      "  if (__n[0] < 22 || (__n[0] === 22 && __n[1] < 13)) {\n" +
      "    process.stderr.write(`\\n  wolfram-mcp-server needs Node 22.13 or newer; this is ${process.versions.node}.\\n` +\n" +
      "      `  Install a current Node (https://nodejs.org) and restart your MCP client.\\n\\n`);\n" +
      "    process.exit(1);\n" +
      "  }\n" +
      "}",
  },
  define: {
    __WOLFRAM_MCP_PKG__: JSON.stringify(
      JSON.stringify({ name: pkg.name, version: pkg.version, description: pkg.description }),
    ),
  },
});
chmodSync(outfile, 0o755);
const size = statSync(outfile).size;
process.stdout.write(`bundle/wolfram-mcp-server.mjs  ${(size / 1024).toFixed(0)} KiB\n`);
