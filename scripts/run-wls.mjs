#!/usr/bin/env node
/**
 * Runs one of this repo's Wolfram Language scripts through wolframscript, and
 * fails unless the kernel printed the summary line that script ends with, and
 * that line says something ran: `npm run test:wl` and `npm run lint:wl`.
 *
 *   node scripts/run-wls.mjs scripts/run-contract.wls
 *
 * wolframscript's exit status alone cannot say a kernel read the script.
 * Measured in a Linux coding-agent sandbox (#60): `wolframscript -code '1+1'`
 * exited 0 and printed nothing, cause not established, so either script would
 * have passed there with no kernel ever running it (#107). The line is each
 * script's own last word, printed only once its work is done.
 */
import { spawn } from "node:child_process";
import { basename } from "node:path";

/**
 * The line each script ends with, and how many things it says ran. A script
 * that is not here has no known summary, so it is refused rather than run on
 * its exit status alone.
 */
const SUMMARIES = {
  "run-contract.wls": {
    line: /^(\d+) passed, (\d+) failed$/m,
    shape: "N passed, M failed",
    ran: (match) => Number(match[1]) + Number(match[2]),
    what: "tests to run",
  },
  "lint-wl.wls": {
    line: /^(\d+) file\(s\) checked, (\d+) finding\(s\)$/m,
    shape: "N file(s) checked, M finding(s)",
    ran: (match) => Number(match[1]),
    what: "files to check",
  },
};

const script = process.argv[2] ?? "";
const summary = SUMMARIES[basename(script)];
if (!summary) {
  console.error(
    script
      ? `${script} has no known summary line, so a pass could not be told from nothing run`
      : "usage: node scripts/run-wls.mjs <script.wls>",
  );
  process.exit(2);
}

// Its output is passed through as it arrives, and kept to be read at the end.
const child = spawn("wolframscript", ["-file", script], { stdio: ["inherit", "pipe", "inherit"] });
let stdout = "";
child.stdout.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  stdout += chunk;
  process.stdout.write(chunk);
});
const status = await new Promise((resolve) => {
  child.on("error", (err) => {
    console.error(
      err.code === "ENOENT" ? "wolframscript is not on PATH" : `could not run wolframscript: ${err.message}`,
    );
    resolve(-1);
  });
  child.on("close", (code) => resolve(code));
});
if (status === -1) process.exit(1);
// wolframscript's own status where it failed, so a failing contract still exits
// as the contract chose; a signal is a failure too.
if (status !== 0) process.exit(status ?? 1);

const match = summary.line.exec(stdout);
const fault = !match
  ? `wolframscript exited 0 but printed no "${summary.shape}" line, so no kernel is known to have run ${script}`
  : summary.ran(match) === 0
    ? `${script} ran, but found no ${summary.what}`
    : null;
if (fault) {
  console.error(`\nnot a pass: ${fault}`);
  process.exit(1);
}
