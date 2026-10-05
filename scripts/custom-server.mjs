#!/usr/bin/env node
/**
 * End to end against a server the user built, with a real kernel.
 *
 * The hermetic suite cannot cover this: a custom MCP server is a file the paclet
 * writes, and only a real kernel can make one or serve it. The `.wlt` covers the
 * paclet's half — that such a name resolves, and where its metadata lives — and
 * this covers ours: that `MCP_SERVER_NAME` carrying a name no list in this
 * package contains reaches the kernel intact and comes back with *that server's*
 * tool. Before `resolveServerName` passed unknown names through, this served the
 * three built-in `Wolfram` tools instead, with one line on stderr and no error.
 *
 * It builds its own throwaway server and removes it, so it neither depends on
 * nor touches whatever this machine already has. Two kernels, one after the
 * other: one to write the server, one to serve it.
 *
 * Opt-in, like `npm run test:wl`, because it needs a licensed installation.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** A name with a space, because names have spaces and that used to matter. */
const SERVER = "Wolfram MCP Server End To End";
/** Prime[10]. Small enough to be instant, specific enough to prove it ran. */
const NTH = 10;
const EXPECTED = "29";

let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
};

// One kernel for every step: writing the server, serving it, removing it.
// Resolved once, by this package's own discovery, so every selector it honours
// — WOLFRAM_MCP_KERNEL, WOLFRAM_MCP_VERSION, WOLFRAMSCRIPT_KERNELPATH and the
// rest — chooses all three. Passing selectors through to the serving process
// alone left the writer on bare wolframscript, which reads none of ours.
const lib = await import(pathToFileURL(join(root, "dist", "lib.js")).href);
const config = lib.loadConfig(() => {});
const install = lib.locateKernel({
  override: config.kernelPath,
  version: config.version,
  minVersion: config.minVersion,
});
if (!install) {
  console.log("\nNo usable Wolfram installation was found; run npm run doctor.\n");
  process.exit(1);
}
console.log(`\nKernel: ${install.bin} (${install.version ?? "unknown version"})`);

const wolfram = (code) =>
  execFileSync("wolframscript", ["-code", code], {
    encoding: "utf8",
    cwd: tmpdir(),
    env: { ...process.env, WOLFRAMSCRIPT_KERNELPATH: install.bin },
  }).trim();

console.log(`\nCreating a server named "${SERVER}"`);
// OverwriteTarget, so a run that died half way does not block every later one.
const created = wolfram(`
  Needs["Wolfram\`AgentTools\`"];
  Quiet @ Wolfram\`AgentTools\`CreateMCPServer[
    "${SERVER}",
    <| "Tools" -> { LLMTool[ "PrimeFinder", { "n" -> "Integer" }, Prime[ #n ] & ] } |>,
    OverwriteTarget -> True
  ];
  { Wolfram\`AgentTools\`MCPServerObjectQ[
      Quiet @ Wolfram\`AgentTools\`MCPServerObject[ "${SERVER}" ]
    ],
    TextString[ $VersionNumber ] <> "." <> ToString[ $ReleaseNumber ] }
`);
const createdLine = created.split("\n").pop() ?? "";
check("the paclet created it", /True/.test(createdLine), createdLine);
/** The version of the kernel that wrote the server, for the serving side to match. */
const creatorVersion = /(\d+\.\d+\.\d+)/.exec(createdLine)?.[1];

try {
  console.log("\nServing it through this package");
  const home = mkdtempSync(join(tmpdir(), "wolfram-custom-"));
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(root, "dist", "index.js")],
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      // The kernel that wrote the server, by path, so nothing is left for
      // discovery to choose differently.
      WOLFRAM_MCP_KERNEL: install.bin,
      // Its own cache, so a real installation's entries are left alone.
      XDG_CACHE_HOME: join(home, "cache"),
      MCP_SERVER_NAME: SERVER,
      // One private kernel: no broker to outlive this script.
      WOLFRAM_MCP_SHARE: "0",
    },
    stderr: "pipe",
  });
  let stderr = "";
  const client = new Client({ name: "custom-server-check", version: "0" });
  await client.connect(transport);
  transport.stderr?.on("data", (chunk) => (stderr += chunk.toString()));

  try {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    check(
      "the kernel offers the tool this server was given",
      names.includes("PrimeFinder"),
      names.join(", "),
    );
    check(
      "and not a built-in server's tools instead",
      !names.includes("WolframLanguageEvaluator"),
      "regression: an unrecognised name used to be replaced by Wolfram",
    );
    check(
      "the name reached the kernel intact, spaces and all",
      /passing it to the kernel as given/.test(stderr) && stderr.includes(SERVER),
      stderr.split("\n").find((l) => l.includes(SERVER))?.slice(0, 80) ?? "",
    );

    const result = await client.callTool(
      { name: "PrimeFinder", arguments: { n: NTH } },
      undefined,
      { timeout: 180_000 },
    );
    const text = result?.content?.[0]?.text ?? "";
    check(
      `calling it answers Prime[${NTH}] = ${EXPECTED}`,
      result.isError !== true && text.includes(EXPECTED),
      `${result.isError ? "isError: " : ""}${text.trim().slice(0, 60)}`,
    );

    // The installation probe ran before that kernel started, into this run's
    // own cache. Its version is built in Wolfram Language, which the fake
    // kernel only imitates, so only a real kernel can say whether it comes out
    // dotted: ToString[$VersionNumber] made every 15.0 installation "15..0".
    const installations = join(home, "cache", "wolfram-mcp-server", "installations");
    const facts = readdirSync(installations)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(join(installations, f), "utf8")));
    const versions = facts.map((entry) => entry.version);
    check(
      "the probe records the kernel's version in dotted form",
      versions.length > 0 && versions.every((v) => /^\d+\.\d+\.\d+$/.test(v)),
      versions.join(", "),
    );
    check(
      "and it is the kernel that wrote the server, not another installation",
      versions.length > 0 && versions.every((v) => v === creatorVersion),
      `wrote on ${creatorVersion}, served on ${versions.join(", ")}`,
    );
  } finally {
    await client.close().catch(() => {});
    rmSync(home, { recursive: true, force: true });
  }
} finally {
  // Always, and only what this script made.
  console.log("\nRemoving it");
  const gone = wolfram(`
    Quiet @ Module[ { dir },
      dir = FileNameJoin @ {
        $UserBaseDirectory, "ApplicationData", "Wolfram", "AgentTools", "Servers",
        URLEncode[ "${SERVER}" ]
      };
      DeleteDirectory[ dir, DeleteContents -> True ];
      ! DirectoryQ @ dir
    ]
  `);
  check("nothing is left behind", /True/.test(gone), gone.split("\n").pop() ?? "");
}

console.log(failures === 0 ? "\nAll checks passed.\n" : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
