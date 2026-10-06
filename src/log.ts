/**
 * Logging for a stdio MCP server.
 *
 * stdout is the protocol channel: anything written there that is not framed
 * JSON-RPC terminates the session. Every diagnostic goes to stderr.
 */
export type Logger = (message: string) => void;

export interface LoggerOptions {
  /**
   * Stamp each line with the time it was written.
   *
   * Off for the proxy, whose stderr belongs to an MCP client that stamps it on
   * the way past — doing it here would only duplicate that. On for the broker,
   * which is detached with its output going to a `WOLFRAM_MCP_LOG` file that
   * outlives every session writing to it: without this, a file spanning days
   * held nothing that could be placed in time or matched to the session that
   * caused it, which is the half of `plan.md` §5.1 that never landed.
   */
  timestamps?: boolean;
}

export function createLogger(prefix: string, options: LoggerOptions = {}): Logger {
  const stamp = options.timestamps ?? false;
  return (message: string) => {
    // Once the client is gone stderr is a broken pipe. Writing to it is not
    // worth crashing over, and there is nowhere left to report the failure.
    try {
      // ISO-8601 and UTC: sortable, unambiguous across a DST boundary, and it
      // stays in front of the prefix so anything matching on `[prefix]` still
      // does. A broker log is read alongside a client's own, hours later.
      const at = stamp ? `${new Date().toISOString()} ` : "";
      process.stderr.write(`${at}[${prefix}] ${message}\n`);
    } catch {
      /* no channel left */
    }
  };
}

/** A logger that discards everything, for tests and programmatic embedding. */
export const silentLogger: Logger = () => {};

/**
 * A time budget as a person reads it: whole seconds, or milliseconds below
 * one. Rounded to seconds, a budget of 400ms read "within 0s" (#10).
 */
export function budgetText(ms: number): string {
  return ms < 1000 ? `${Math.floor(ms)}ms` : `${Math.round(ms / 1000)}s`;
}

/** Best-effort human-readable text for a thrown value. */
export function errorText(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/**
 * `errorText` for an `McpError`, without the prefix the SDK will add again.
 *
 * `McpError.message` already reads "MCP error -32602: Unknown tool: Foo", and
 * the SDK sends `err.message` verbatim as the JSON-RPC message, where the
 * receiving client wraps it in a fresh `McpError`. Anything relaying one
 * therefore doubles the prefix — measured: a model reading "MCP error -32602:
 * MCP error -32602: Unknown tool: NoSuchTool". Stripping one keeps the kernel's
 * own words and lets the SDK put the prefix back exactly once.
 */
export function bareMcpText(code: number, message: string): string {
  const prefix = `MCP error ${code}: `;
  return message.startsWith(prefix) ? message.slice(prefix.length) : message;
}
