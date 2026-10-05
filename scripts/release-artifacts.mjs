#!/usr/bin/env node
/**
 * Assemble the files a release hands out, into `release/`, from a working tree
 * — no GitHub, no licence seat — so the whole release build is one command you
 * can run and inspect locally before any of it runs in CI.
 *
 * The artifacts are platform-independent: the bundle is esbuild'd JavaScript and
 * the one production dependency tree is pure JS, so a single build on any Node
 * and any OS produces something that installs and runs everywhere. There is no
 * per-platform build to matrix.
 *
 *   - `wolfram-mcp-server.mjs`, the single-file CLI (see scripts/bundle-js.mjs).
 *   - `plugin/`, the assembled plugin: the `plugin/` template in this repo —
 *     manifest, README, and what else it holds — with the repo's LICENSE and
 *     the bundle added. The template's manifest already names only paths inside
 *     the plugin root, so nothing is rewritten on the way: what is reviewed in
 *     the template is what ships. `--plugin-dir release/plugin` runs it, and
 *     this repo's own marketplace serves it to sessions here.
 *   - `wolfram-plugin-<version>.zip`, the `archive`-source plugin: exactly the
 *     assembled tree, zipped from inside it.
 *
 * SHA256SUMS.txt covers every file in `release/`, because the `archive`
 * marketplace source pins its download by sha256 and a release whose checksums
 * omit an asset cannot be one.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

// Where to assemble: release/ by default. The suite passes a scratch directory,
// so checking the artifact never replaces the one a developer is running.
let releaseDir = join(root, "release");
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--out" && args[i + 1]) releaseDir = resolve(args[++i]);
  else fail(`unknown argument: ${args[i]}`);
}

function fail(message) {
  process.stderr.write(`release-artifacts: ${message}\n`);
  process.exit(1);
}

// `zip` is on macOS and every Ubuntu runner, but say so plainly rather than
// let the archive step fail with a bare ENOENT from spawn.
if (spawnSync("zip", ["--version"], { stdio: "ignore" }).error) {
  fail("the `zip` command is required to build the plugin archive and was not found");
}

// A stale artifact passing review is worse than none, and a version bump leaves
// last version's zip behind, so the directory is rebuilt from empty every run.
rmSync(releaseDir, { recursive: true, force: true });
mkdirSync(releaseDir, { recursive: true });

// The bundle is the artifact everything else points at, so build it fresh from
// source (`bundle:js` runs the tsc build first) rather than trust whatever is
// in bundle/ from a previous, possibly stale, run.
run("npm", ["run", "bundle:js"]);
const bundleName = "wolfram-mcp-server.mjs";
const bundleSrc = join(root, "bundle", bundleName);
if (!existsSync(bundleSrc)) fail(`bundle:js did not produce ${bundleName}`);
copyFileSync(bundleSrc, join(releaseDir, bundleName));

// The assembled plugin, kept in place: it is what a local install runs, and the
// zip below is made from it, so the two cannot differ.
const plugin = join(releaseDir, "plugin");
cpSync(join(root, "plugin"), plugin, { recursive: true });
copyFileSync(join(root, "LICENSE"), join(plugin, "LICENSE"));
copyFileSync(bundleSrc, join(plugin, bundleName));
const zipName = `wolfram-plugin-${pkg.version}.zip`;
// -X drops the extra file attributes that make a zip differ byte-for-byte
// between machines; -r recurses. Run from inside the tree so the archive holds
// `.claude-plugin/...`, not `release/plugin/...`.
run("zip", ["-X", "-r", join("..", zipName), "."], { cwd: plugin });

// One checksums file over the whole directory, in the `sha256sum -c` format, so
// a consumer — and the archive source's own pin — can verify every asset.
// Files only: the assembled tree is a working directory, not an asset, and is
// covered through the zip made from it.
const assets = readdirSync(releaseDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name !== "SHA256SUMS.txt")
  .map((entry) => entry.name)
  .sort();
const sums = assets.map((name) => `${sha256(join(releaseDir, name))}  ${name}\n`).join("");
writeFileSync(join(releaseDir, "SHA256SUMS.txt"), sums);

process.stdout.write(`\n${releaseDir} (${pkg.name} ${pkg.version})\n`);
for (const name of ["plugin/", ...assets, "SHA256SUMS.txt"]) process.stdout.write(`  ${name}\n`);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", cwd: root, ...options });
  if (result.status !== 0) {
    fail(`${command} ${args.join(" ")} exited ${result.status ?? "on a signal"}`);
  }
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}
