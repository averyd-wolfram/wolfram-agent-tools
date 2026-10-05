/**
 * Wolfram's own record of which kernel you prefer.
 *
 * `wolframscript` keeps a plain-text configuration file whose
 * `WOLFRAMSCRIPT_KERNELPATH` names the kernel it uses by default, settable with
 * `wolframscript -configure WOLFRAMSCRIPT_KERNELPATH=...`. Reading it costs
 * nothing — no kernel, no licence seat — and it is a better default than "the
 * highest version number on disk", because a machine with an experimental build
 * installed alongside a stable one has a higher version that is not the one you
 * meant.
 *
 * Format is `KEY=VALUE` per line, with `//` marking a key as unset.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";

const CONF_NAME = "WolframScript.conf";

/** Candidate configuration files, most specific first. */
export function configurationFiles(): string[] {
  const candidates: string[] = [];

  // An explicit override may name either the file or its directory.
  const override = process.env["WOLFRAMSCRIPT_CONFIGURATIONPATH"]?.trim();
  if (override) {
    candidates.push(override);
    candidates.push(join(override, CONF_NAME));
  }

  const home = os.homedir();
  if (process.platform === "darwin") {
    candidates.push(
      join(home, "Library", "Application Support", "Wolfram", "WolframScript", CONF_NAME),
    );
  } else if (process.platform === "win32") {
    const appData = process.env["APPDATA"] ?? join(home, "AppData", "Roaming");
    candidates.push(join(appData, "Wolfram", "WolframScript", CONF_NAME));
  }
  const xdg = process.env["XDG_CONFIG_HOME"] ?? join(home, ".config");
  candidates.push(join(xdg, "Wolfram", "WolframScript", CONF_NAME));

  return candidates;
}

function parse(text: string): Map<string, string> {
  const values = new Map<string, string>();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    // `//` is how wolframscript writes a key that is not set.
    if (!line || line.startsWith("//") || line.startsWith("#")) continue;
    const at = line.indexOf("=");
    if (at <= 0) continue;
    const key = line.slice(0, at).trim();
    const value = line.slice(at + 1).trim();
    if (key && value) values.set(key, value);
  }
  return values;
}

export interface WolframScriptConfig {
  /** The file the values came from. */
  file: string;
  values: Map<string, string>;
}

/** Read the first configuration file that exists. */
export function readConfiguration(): WolframScriptConfig | null {
  for (const file of configurationFiles()) {
    try {
      if (!existsSync(file) || !statSync(file).isFile()) continue;
      return { file, values: parse(readFileSync(file, "utf8")) };
    } catch {
      // Unreadable is the same as absent for our purposes.
    }
  }
  return null;
}

export interface PreferredKernel {
  path: string;
  /** Where the preference came from, for diagnostics. */
  source: string;
}

/**
 * The kernel wolframscript would use, from the environment or its config file.
 *
 * The environment wins, matching how wolframscript itself resolves it.
 */
export function preferredKernel(): PreferredKernel | null {
  const fromEnv = process.env["WOLFRAMSCRIPT_KERNELPATH"]?.trim();
  if (fromEnv) return { path: fromEnv, source: "WOLFRAMSCRIPT_KERNELPATH" };

  const config = readConfiguration();
  const fromFile = config?.values.get("WOLFRAMSCRIPT_KERNELPATH");
  if (config && fromFile) return { path: fromFile, source: config.file };

  return null;
}
