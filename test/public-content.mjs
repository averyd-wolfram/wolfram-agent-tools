#!/usr/bin/env node
/**
 * The public-content check (scripts/public-content.mjs): what it refuses, what
 * it lets through, and that --staged reads the index rather than the disk.
 *
 * Every forbidden sample is assembled at run time, so this file passes the
 * check it tests — a literal sample here would fail the tree's own run.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findings } from "../scripts/public-content.mjs";

const scripts = join(dirname(fileURLToPath(import.meta.url)), "..", "scripts");
const script = join(scripts, "public-content.mjs");
const installer = join(scripts, "install-hooks.mjs");

let failures = 0;
let checks = 0;
const check = (label, ok, detail = "") => {
  checks++;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
};
const kinds = (text) => findings(text).map((finding) => finding.kind);

console.log("\npublic-content: what it refuses");
const internalHost = ["intranet", "wolfram", "com"].join(".");
check(
  "a Wolfram host off the public list",
  kinds(`see https://${internalHost}/x`).includes("a host not on the public list"),
);
check(
  "an off-list host however it is cased",
  findings(`git@${internalHost.toUpperCase()}:x`).length === 1,
);
const home = ["", "Users", "jdoe", "src"].join("/");
check("a macOS home path", kinds(`cd ${home}`).includes("an absolute home path"));
const linuxHome = ["", "home", "jdoe", "x"].join("/");
check("a Linux home path", kinds(linuxHome).includes("an absolute home path"));
const windowsHome = ["C:", "Users", "jdoe", "x"].join("\\");
check("a Windows home path", kinds(windowsHome).includes("an absolute home path"));
for (const [kind, sample] of [
  ["a GitHub token", "ghp" + "_" + "a1".repeat(18)],
  ["a fine-grained GitHub token", "github" + "_pat_" + "A".repeat(60)],
  ["an Anthropic API key", "sk" + "-ant-" + "api03-" + "x".repeat(40)],
  ["an AWS access key", "AKIA" + "ABCDEFGHIJKLMNOP"],
  ["a private key", "-----BEGIN " + "RSA PRIVATE KEY-----"],
  ["an npm token", "npm" + "_" + "b2".repeat(18)],
  ["a token straight after an underscore", "X_gh" + "p_" + "c3".repeat(18)],
  [
    "an on-demand licence entitlement",
    "-pwfile !cloudlm.wolfram.com -entitle" + "ment O-WSTD-DA42-GKX8Z-M3A1X",
  ],
]) {
  check(kind, findings(`token = "${sample}"`).length === 1);
}
check(
  "the line each finding is on",
  findings(`fine\nfine\ncd ${home}`)[0]?.line === 3,
  JSON.stringify(findings(`fine\nfine\ncd ${home}`)),
);

console.log("\npublic-content: what it lets through");
for (const [label, text] of [
  ["the public Wolfram hosts", "https://www.wolfram.com https://account.wolfram.com/x"],
  ["the entitlement host", "WOLFRAMINIT='-pwfile !cloudlm.wolfram.com -entitlement <id>'"],
  ["an author's address", "someone@wolfram.com"],
  ["a placeholder home path", "/Users/<user>/Library and /Users/you/Applications"],
  ["a home path built from a variable", "`/home/${user}/x` and C:\\Users\\%USERNAME%\\x"],
  ["the Engine image's home", "/home/wolframengine/.WolframEngine"],
  ["a home path written with a tilde", "~/.config/wolfram-mcp-server"],
  ["an unrelated domain", "https://notwolfram.community https://wolframalpha.com"],
  ["an entitlement placeholder", "-entitlement <id> and -entitlement O-AAAA and O-SECRET-ID"],
]) {
  const found = findings(text);
  check(label, found.length === 0, found.length ? JSON.stringify(found) : "");
}

console.log("\npublic-content: --staged reads the index");
const repo = mkdtempSync(join(tmpdir(), "public-content-"));
const git = (...args) => execFileSync("git", ["-C", repo, ...args], { stdio: "pipe" });
const run = (...args) =>
  spawnSync(process.execPath, [script, ...args], { cwd: repo, encoding: "utf8" });
try {
  git("init", "-q");
  writeFileSync(join(repo, "notes.md"), `path ${home}\n`);
  git("add", "notes.md");
  writeFileSync(join(repo, "notes.md"), "clean now\n");
  const staged = run("--staged");
  check(
    "a staged finding fails the commit though the disk is clean",
    staged.status === 1 && staged.stderr.includes("notes.md:1"),
    staged.stderr.trim(),
  );
  git("add", "notes.md");
  check("the corrected stage passes", run("--staged").status === 0);
  writeFileSync(join(repo, "binary.bin"), Buffer.from([0, 1, 2, ...Buffer.from(home)]));
  git("add", "binary.bin");
  check("a binary file is not read as text", run().status === 0, run().stderr.trim());
  git("add", "notes.md");
  rmSync(join(repo, "notes.md"));
  const deleted = run();
  check(
    "a tracked file deleted from disk is skipped, not a crash",
    deleted.status === 0,
    deleted.stderr.trim().split("\n")[0],
  );
} finally {
  rmSync(repo, { recursive: true, force: true });
}

console.log("\npre-commit: stops a commit it cannot check");
// An empty PATH, so where a machine keeps node cannot decide the result; the
// shell is named outright, and `command -v` is its own builtin.
const emptyPath = mkdtempSync(join(tmpdir(), "no-node-"));
try {
  const hook = join(scripts, "..", ".githooks", "pre-commit");
  const blind = spawnSync("/bin/sh", [hook], { encoding: "utf8", env: { PATH: emptyPath } });
  check(
    "with no node on PATH the commit is refused, and the message says why",
    blind.status === 1 && /node is not on PATH/.test(blind.stderr),
    `exit ${blind.status}: ${blind.stderr.trim().split("\n")[0] ?? ""}`,
  );
} finally {
  rmSync(emptyPath, { recursive: true, force: true });
}

console.log("\ninstall-hooks: never fails an install");
// The prepare script runs it, so a throw here fails `npm install` and
// `npm ci` outright — for a convenience. A repository git refuses (dubious
// ownership in a container, a broken gitdir) is the case that reaches the
// unguarded write.
const clone = mkdtempSync(join(tmpdir(), "install-hooks-"));
try {
  mkdirSync(join(clone, "scripts"));
  copyFileSync(installer, join(clone, "scripts", "install-hooks.mjs"));
  writeFileSync(join(clone, ".git"), `gitdir: ${join(clone, "missing")}\n`);
  const refused = spawnSync(process.execPath, [join(clone, "scripts", "install-hooks.mjs")], {
    encoding: "utf8",
  });
  check(
    "a repository git refuses leaves the install succeeding, with a warning",
    refused.status === 0 && /install-hooks:/.test(refused.stderr),
    `exit ${refused.status}: ${refused.stderr.trim().split("\n")[0] ?? ""}`,
  );
} finally {
  rmSync(clone, { recursive: true, force: true });
}

console.log(
  failures === 0
    ? `\n${checks} checks, all passed.\n`
    : `\n${failures} of ${checks} checks failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
