import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface PackageJson {
  name: string;
  version: string;
  description?: string;
}

// Injected by scripts/bundle-js.mjs (esbuild --define), because the
// single-file artifact ships with no package.json beside it and this read is
// the one thing in the tree that assumes the repo's shape at runtime.
declare const __WOLFRAM_MCP_PKG__: string | undefined;

// dist/version.js -> <package root>/package.json
const here = dirname(fileURLToPath(import.meta.url));

// typeof on an undeclared identifier is the one reference that cannot throw,
// so every unbundled packaging mode falls through to the file read unharmed.
export const PKG: PackageJson =
  typeof __WOLFRAM_MCP_PKG__ === "string"
    ? (JSON.parse(__WOLFRAM_MCP_PKG__) as PackageJson)
    : (JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8")) as PackageJson);
