#!/usr/bin/env node
/**
 * Stands in for a Wolfram kernel. Speaks minimal MCP over stdio, deliberately
 * without the SDK, and emits the kinds of non-protocol stdout noise a real
 * kernel produces *when something is wrong* — measured, a healthy session emits
 * none at all, so the banner here is pessimism on purpose: it keeps the
 * filtering transport under test on every single check.
 *
 * FAKE_MODE
 *   normal          banner noise, then well-behaved MCP            (default)
 *   fail-list-once  tools/list and resources/list error in the first process only
 *   mute            spawns, never speaks (activation deadlock)
 *   extra-tool      serves an additional tool, to exercise refresh
 *   no-agenttools   prints the paclet-missing message, never speaks
 *   paged-tools     serves tools/list one tool at a time with a nextCursor, which
 *                   a pooled kernel makes dangerous: page 2 asked of a kernel
 *                   that never issued page 1 is a different kernel's state
 *   dying-word      writes its reason with NO trailing newline and exits, the
 *                   shape of a licence refusal — the last thing it says used to
 *                   be dropped, because a line is only recorded at a newline
 *   unactivated     prints "No valid password found." and exits 70 — measured,
 *                   15.0.0 started with a user base holding no mathpass. It does
 *                   not wait for credentials, so it fails fast, and the words
 *                   alone did not tell a user what to do
 *   no-such-server  prints the paclet's MCPServerNotFound and StartMCPServer's
 *                   InvalidArguments, then sits in its REPL — the measured shape
 *                   of a MCP_SERVER_NAME the paclet cannot resolve, which does
 *                   not exit and so used to be ended only by the start timeout
 *   shadowed-start  warns StartMCPServer::shdw, as a kernel does when another
 *                   context defines a symbol of that name, then serves normally
 *   unreadable-server-file  a server whose file will not read: a cause other
 *                   than not-found, followed by the same StartMCPServer failure
 *   no-paclet-extension  a paclet-qualified name whose paclet has no AgentTools
 *                   extension, as a real 15.0 kernel with AgentTools 2.2.7 printed
 *                   it (issue #5): MCPServerObject::PacletExtensionNotFound, then
 *                   StartMCPServer::InvalidArguments, then the kernel's REPL,
 *                   which reads the client's JSON as Wolfram Language and answers
 *                   it with a syntax error rather than MCP
 * FAKE_MARKER   append a line per process start, to count kernel starts
 * FAKE_STATE    file used to remember that the first process has run
 *
 * Timing knobs. Several bugs in this server are invisible against a kernel that
 * answers instantly: the pool grew to the whole licence budget on a single call,
 * but only once an evaluation took longer than about 200ms. A check that would
 * still pass with FAKE_CALL_DELAY_MS set is not testing what it appears to test.
 *
 * FAKE_CALL_DELAY_MS  delay before answering tools/call; negative never answers
 * FAKE_PROMPT_DELAY_MS  the same for prompts/get, which a real kernel evaluates
 *                     as it does a call: the paclet's prompts run its searches
 * FAKE_RESOURCE_DELAY_MS  the same for resources/read
 * FAKE_DELAY_FIRST_ONLY  apply that delay to the first call only, so a session
 *                     can have one call that outlives the server's ceiling and
 *                     then carry on normally — the shape of a real long build
 * FAKE_INIT_DELAY_MS  delay before answering initialize: a slow handshake, the
 *                     last stage of a preparation, that does eventually answer
 * FAKE_EMPTY_TOOLS    report zero tools, successfully
 * FAKE_OUTPUT_SCHEMA  JSON: serve one more tool, Structured, declaring this as its
 *                     outputSchema and answering with structuredContent. No server
 *                     AgentTools 2.2.7 serves can: it builds a tool's entry from
 *                     five fixed keys and leaves structuredContent out. A paclet
 *                     that allows one could send a schema ajv cannot compile — a
 *                     malformed `$id` — which failed the whole tools/list in the
 *                     SDK's client (#31)
 * FAKE_RESOURCES      declare the resources capability and serve one resource.
 *                     AgentTools 2.2.7 answers resources/list and resources/read,
 *                     for MCP Apps' UI resources, but declares no resources
 *                     capability, so without this a session never offers them
 * FAKE_ERROR_DATA     JSON to send as the `data` of each error the fake answers
 *                     with, for a list, a prompt or a resource, as a server whose
 *                     errors carry data would; AgentTools 2.2.7's carry none
 * FAKE_METHOD_LOG     append every method received, to see what reaches a kernel,
 *                     and "(replied tools/call)" as each call is answered — or
 *                     prompts/get, or resources/read — so a check can wait for a
 *                     reply instead of sleeping past it
 *
 * Installation facts. Every kernel's -run expression writes one line of JSON
 * between markers after loading AgentTools and before its server starts
 * (src/kernel.ts KERNEL_ARGS, plugin plan D20), and this does the same whenever
 * its command line asks — as a real kernel does, only once it gets as far as
 * evaluating: not when a licence refusal or activation stops it first.
 *
 * FAKE_MAX_LICENSE    what it reports for $MaxLicenseProcesses
 * FAKE_BASE           what it reports for $BaseDirectory
 * FAKE_WOLFRAM_ID     the account it reports; unset means not signed in
 * FAKE_AGENTTOOLS     the AgentTools version it reports (default 2.2.7), as a
 *                     paclet that updated itself between two starts would
 * FAKE_ANNOUNCE_TOOL  after the first call, gain a tool and say the list changed,
 *                     as a paclet upgraded under a running session would
 * FAKE_LSP_LAST_WORDS as LSPServer, answer a hover with a large reply and exit at
 *                     once, as a kernel that dies right after replying does
 *
 * A tools/call carrying _meta.progressToken gets two progress notifications
 * before its result. A real kernel sends none — measured, which is why the
 * call timeout is a deadline for the caller — so these exist only to tell
 * whether the proxy would relay them if a paclet ever did.
 */
import { appendFileSync, existsSync, writeFileSync } from "node:fs";

const mode = process.env.FAKE_MODE ?? "normal";
const callDelay = Number(process.env.FAKE_CALL_DELAY_MS ?? "0");
const delayFirstOnly = Boolean(process.env.FAKE_DELAY_FIRST_ONLY);
const serverName = process.env.MCP_SERVER_NAME ?? "(unset)";

if (process.env.FAKE_MARKER) {
  appendFileSync(process.env.FAKE_MARKER, `${mode} ${Date.now()}\n`);
}

// Started as Wolfram's LSPServer (src/lsp.ts): speak LSP the way it does,
// including how it fails. Measured on 15.0.0, LSPServer has no handler for a
// request it never advertised — workspace/symbol, call hierarchy — and the
// kernel exits on "Internal assert 4 failed" instead of answering, taking every
// later request with it.
if (process.argv.some((arg) => arg.includes("LSPServer`StartServer"))) {
  // FAKE_ARGV_LOG: where to write the command line, to check the flags the
  // launcher starts LSPServer with.
  if (process.env.FAKE_ARGV_LOG) writeFileSync(process.env.FAKE_ARGV_LOG, JSON.stringify(process.argv.slice(2)));
  const send = (msg) => {
    const body = JSON.stringify({ jsonrpc: "2.0", ...msg });
    process.stdout.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
  };
  const handled = {
    // Semantic tokens as LSPServer advertises them to a client that opts in:
    // the full request only.
    initialize: () => ({
      capabilities: {
        hoverProvider: true,
        documentSymbolProvider: true,
        semanticTokensProvider: { legend: { tokenTypes: [], tokenModifiers: [] }, range: false, full: { delta: false } },
      },
    }),
    "textDocument/semanticTokens/full": () => ({ data: [] }),
    "textDocument/hover": () => ({ contents: { kind: "markdown", value: "**Usage** fake" } }),
    "textDocument/documentSymbol": () => [],
    shutdown: () => null,
  };
  let buf = Buffer.alloc(0);
  process.stdin.on("data", (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    for (;;) {
      const end = buf.indexOf("\r\n\r\n");
      if (end === -1) return;
      const length = Number(/Content-Length: (\d+)/i.exec(buf.subarray(0, end).toString())?.[1]);
      if (buf.length < end + 4 + length) return;
      const msg = JSON.parse(buf.subarray(end + 4, end + 4 + length).toString());
      buf = buf.subarray(end + 4 + length);
      if (msg.method === "exit") process.exit(0);
      if (msg.id === undefined || !msg.method) continue; // notifications, replies
      const handler = handled[msg.method];
      if (!handler) {
        process.stderr.write(`Internal assert 4 failed: list of Associations: ${msg.method}\nKERNEL IS EXITING HARD\n`);
        process.exit(1);
      }
      if (process.env.FAKE_LSP_LAST_WORDS && msg.method === "textDocument/hover") {
        // Written, then gone: the launcher has to deliver this after the exit.
        const body = JSON.stringify({ jsonrpc: "2.0", id: msg.id, result: { contents: { kind: "plaintext", value: "x".repeat(4_000_000) } } });
        process.stdout.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`, () => process.exit(0));
        return;
      }
      send({ id: msg.id, result: handler() });
    }
  });
} else {
let firstProcess = true;
if (process.env.FAKE_STATE) {
  firstProcess = !existsSync(process.env.FAKE_STATE);
  if (firstProcess) writeFileSync(process.env.FAKE_STATE, "used");
}

// What a real kernel writes once AgentTools has loaded, if its command line
// asks: one line, framed by markers so a banner cannot corrupt it.
const asksForFacts = process.argv.some((arg) => arg.includes("<<WMCPFACTS>>"));
function reportFacts(agentTools = process.env.FAKE_AGENTTOOLS ?? "2.2.7") {
  if (!asksForFacts) return;
  const base = process.env.FAKE_BASE ?? "/fake/base";
  process.stdout.write(
    `<<WMCPFACTS>>${JSON.stringify({
      version: "15.1.0",
      systemID: "MacOSX-ARM64",
      // What a kernel computes, unless its environment says otherwise — as a
      // real one reads WOLFRAM_*BASE at startup.
      base: process.env.WOLFRAM_BASE ?? base,
      userBase: process.env.WOLFRAM_USERBASE ?? `${base}/userbase`,
      localBase: process.env.WOLFRAM_LOCALBASE ?? `${base}/localbase`,
      maxLicenseProcesses: process.env.FAKE_MAX_LICENSE ?? "4",
      licenseType: "Professional",
      networkLicense: false,
      agentTools,
      wolframID: process.env.FAKE_WOLFRAM_ID ?? "None",
      cloudConnected: Boolean(process.env.FAKE_WOLFRAM_ID),
    })}<<END>>\n`,
  );
}

// The exact shape of noise the filtering transport exists to survive.
process.stdout.write("Wolfram Language 15.1.0 Kernel for Mac OS X ARM (64-bit)\n");
process.stdout.write("Copyright 1988-2026 Wolfram Research, Inc.\n");
process.stdout.write("\n");

if (mode === "no-seats") {
  // The shape of licence-seat exhaustion: complain on stdout, then exit.
  process.stdout.write(
    "Wolfram Language is unable to start because the maximum number of licensed\n" +
    "processes has been reached. (MathLM: all 2 seats in use.)\n");
  process.exit(1);
} else if (mode === "no-agenttools") {
  process.stdout.write("Get::noopen: Cannot open Wolfram`AgentTools`.\n");
  // The load failed, but evaluation carries on, so the facts still arrive.
  reportFacts(null);
  process.stdin.resume();
  setInterval(() => {}, 1000);
} else if (mode === "unactivated") {
  process.stdout.write("No valid password found.\n");
  process.exit(70);
} else if (mode === "dying-word") {
  // No "\n": that is the whole point. A real kernel refused a licence and died
  // mid-line, and the transport only ever recorded a line when it saw a newline.
  process.stdout.write("MathLM: all 2 seats in use, giving up");
  process.exit(1);
} else if (mode === "no-such-server") {
  reportFacts();
  // What a 15.0 kernel with AgentTools 2.2.7 printed for a name it could not
  // resolve: the cause, verbatim from the paclet's Messages.wl with the name it
  // was given, then StartMCPServer's failure, then its REPL, which answers the
  // client's JSON with a syntax error rather than MCP.
  process.stdout.write(
    `Wolfram\`AgentTools\`MCPServerObject::MCPServerNotFound: No MCPServerObject found for name "${serverName}".\n` +
    `Wolfram\`AgentTools\`StartMCPServer::InvalidArguments: Invalid arguments given for Wolfram\`AgentTools\`StartMCPServer in Wolfram\`AgentTools\`StartMCPServer[No MCPServerObject found for name "${serverName}".].\n`);
  process.stdin.on("data", () => {
    process.stdout.write(`Syntax::sntxf: "{"jsonrpc"" cannot be followed by ":"2.0",…}".\n`);
  });
  setInterval(() => {}, 1000);
} else if (mode === "no-paclet-extension") {
  reportFacts();
  const paclet = serverName.split("/")[0];
  process.stdout.write(
    `Wolfram\`AgentTools\`MCPServerObject::PacletExtensionNotFound: No AgentTools extension found in paclet "${paclet}".\n` +
    `Wolfram\`AgentTools\`StartMCPServer::InvalidArguments: Invalid arguments given for Wolfram\`AgentTools\`StartMCPServer in Wolfram\`AgentTools\`StartMCPServer[No AgentTools extension found in paclet "${paclet}".].\n`);
  process.stdin.on("data", () => {
    process.stdout.write(`Syntax::sntxf: "{"method"" cannot be followed by ":"initialize",…}".\n`);
  });
  setInterval(() => {}, 1000);
} else if (mode === "unreadable-server-file") {
  reportFacts();
  // A cause no list of the paclet's not-found messages named: the user's
  // server exists but its Metadata.wxf will not read. StartMCPServer fails the
  // same way whatever the cause, which is the line worth watching.
  process.stdout.write(
    `Wolfram\`AgentTools\`MCPServerObject::InvalidMCPServerFile: Invalid MCPServerObject file for "${serverName}".\n` +
    `Wolfram\`AgentTools\`StartMCPServer::InvalidArguments: Invalid arguments given for Wolfram\`AgentTools\`StartMCPServer in Wolfram\`AgentTools\`StartMCPServer[Invalid MCPServerObject file for "${serverName}".].\n`);
  process.stdin.on("data", () => {
    process.stdout.write(`Syntax::sntxf: "{"jsonrpc"" cannot be followed by ":"2.0",…}".\n`);
  });
  setInterval(() => {}, 1000);
} else if (mode === "mute") {
  process.stdin.resume();
  setInterval(() => {}, 1000);
} else if (mode === "shadowed-start") {
  // A symbol named StartMCPServer defined in another context, by an init file
  // or a loaded package: the kernel warns, then the server starts as usual.
  reportFacts();
  process.stdout.write(
    "StartMCPServer::shdw: Symbol StartMCPServer appears in multiple contexts " +
      "{Wolfram`AgentTools`, Global`}; definitions in context Wolfram`AgentTools` may " +
      "shadow or be shadowed by other definitions.\n");
  run();
} else {
  reportFacts();
  run();
}

function run() {
  const send = (m) => process.stdout.write(`${JSON.stringify(m)}\n`);

  const tools = [
    {
      name: "WolframLanguageEvaluator",
      title: "Wolfram Language Evaluator",
      description: "Evaluates Wolfram Language code.",
      inputSchema: {
        type: "object",
        properties: { code: { type: "string" } },
        required: ["code"],
      },
    },
  ];
  if (mode === "paged-tools") {
    // Three tools, so one page each and two cursors between them.
    for (const name of ["PagedTwo", "PagedThree"]) {
      tools.push({
        name,
        description: `Tool ${name}, to be paged`,
        inputSchema: { type: "object", properties: {} },
      });
    }
  }
  if (mode === "extra-tool") {
    tools.push({
      name: "WolframAlpha",
      title: "Wolfram Alpha",
      description: "Answers a natural-language query.",
      inputSchema: { type: "object", properties: { query: { type: "string" } } },
    });
  }
  if (process.env.FAKE_OUTPUT_SCHEMA) {
    // Last, so a client that compiles schemas in order has listed every other
    // tool before it reaches this one, and still fails the list.
    tools.push({
      name: "Structured",
      description: "Answers with structured content.",
      inputSchema: { type: "object", properties: {} },
      outputSchema: JSON.parse(process.env.FAKE_OUTPUT_SCHEMA),
    });
  }

  /** An error response, carrying FAKE_ERROR_DATA as its `data` when set. */
  const fail = (msg, code, message) =>
    send({
      jsonrpc: "2.0",
      id: msg.id,
      error: {
        code,
        message,
        ...(process.env.FAKE_ERROR_DATA ? { data: JSON.parse(process.env.FAKE_ERROR_DATA) } : {}),
      },
    });
  let announced = false;
  let callsSeen = 0;
  // Calls accepted and not yet answered. A real kernel is not reading its
  // stdin while one is in progress, so nothing it is sent meanwhile — a ping
  // included — gets an answer until that call finishes.
  let outstanding = 0;
  /**
   * Answer an evaluation after `delay` ms, or never when it is negative, as
   * outstanding work meanwhile — deaf to ping, as a busy kernel is.
   */
  function evaluate(msg, delay, result) {
    outstanding++;
    const answer = () => {
      outstanding--;
      if (process.env.FAKE_METHOD_LOG) {
        appendFileSync(process.env.FAKE_METHOD_LOG, `(replied ${msg.method})\n`);
      }
      send({ jsonrpc: "2.0", id: msg.id, result: result() });
    };
    if (delay < 0) return;
    if (delay === 0) answer();
    else setTimeout(answer, delay);
  }
  let buffer = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    let index;
    while ((index = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, index).trim();
      buffer = buffer.slice(index + 1);
      if (line) handle(JSON.parse(line));
    }
  });

  function handle(msg) {
    if (process.env.FAKE_METHOD_LOG) {
      appendFileSync(process.env.FAKE_METHOD_LOG, `${msg.method ?? "(response)"}\n`);
    }
    if (msg.method === "initialize") {
      const reply = () => {
        send({
          jsonrpc: "2.0",
          id: msg.id,
          result: {
            protocolVersion: msg.params.protocolVersion,
            capabilities: {
              tools: { listChanged: true },
              prompts: {},
              ...(process.env.FAKE_RESOURCES ? { resources: {} } : {}),
            },
            serverInfo: { name: "fake-wolfram", version: "1.0.0" },
          },
        });
        // More stdout noise after the handshake, interleaved with protocol.
        process.stdout.write("General::stop: Further output of Set::write will be suppressed.\n");
      };
      const initDelay = Number(process.env.FAKE_INIT_DELAY_MS ?? "0");
      if (initDelay > 0) setTimeout(reply, initDelay);
      else reply();
      return;
    }
    // MCP's liveness check, and what this server uses to tell a wedged kernel
    // from one that merely answered "unknown tool". AgentTools answers it from
    // its dispatch table with an empty result and no evaluation
    // (2.2.7 `Kernel/Server/Shared.wl:424`), so a healthy kernel replies in
    // milliseconds however long the last call took.
    //
    // Busy means deaf: AgentTools' dispatch is synchronous — `tools/call` calls
    // `evaluateTool` inline — so a kernel grinding on an evaluation cannot
    // answer ping. This used to be a knob, FAKE_DEAF_PING, that a scenario had
    // to remember to set; left unset, the fake stayed chatty while claiming to
    // be wedged. Nothing in src/ pings a kernel today, which is exactly when a
    // reintroduced probe would find an unfaithful fake and pass.
    if (msg.method === "ping") {
      if (outstanding > 0) return;
      send({ jsonrpc: "2.0", id: msg.id, result: {} });
      return;
    }
    if (msg.method === "tools/list") {
      if (process.env.FAKE_EMPTY_TOOLS) {
        send({ jsonrpc: "2.0", id: msg.id, result: { tools: [] } });
        return;
      }
      if (mode === "fail-list-once" && firstProcess) {
        fail(msg, -32603, "transient upstream hiccup");
        return;
      }
      if (mode === "paged-tools") {
        // One tool per page. A cursor is this process's state: another kernel
        // asked for page 2 has never heard of it, which is what makes relaying
        // one across a pool wrong.
        const at = Number(msg.params?.cursor ?? "0");
        const tool = tools[at];
        send({
          jsonrpc: "2.0",
          id: msg.id,
          result: {
            tools: tool ? [tool] : [],
            ...(at + 1 < tools.length ? { nextCursor: String(at + 1) } : {}),
          },
        });
        return;
      }
      send({ jsonrpc: "2.0", id: msg.id, result: { tools } });
      return;
    }
    if (msg.method === "prompts/list") {
      send({
        jsonrpc: "2.0",
        id: msg.id,
        result: {
          prompts: [{ name: "Search", description: "Searches Wolfram information." }],
        },
      });
      return;
    }
    if (msg.method === "prompts/get") {
      // A name it does not have fails as AgentTools 2.2.7's does: getPrompt's
      // Enclose fails, and processRequest answers its catch-all.
      if (msg.params?.name !== "Search") {
        fail(msg, -32603, "Internal error");
        return;
      }
      evaluate(msg, Number(process.env.FAKE_PROMPT_DELAY_MS ?? "0"), () => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `prompted ${msg.params?.name} ${JSON.stringify(msg.params?.arguments ?? {})} server=${serverName}`,
            },
          },
        ],
      }));
      return;
    }
    if (msg.method === "resources/list" && process.env.FAKE_RESOURCES) {
      if (mode === "fail-list-once" && firstProcess) {
        fail(msg, -32603, "transient upstream hiccup");
        return;
      }
      send({
        jsonrpc: "2.0",
        id: msg.id,
        result: {
          resources: [{ uri: "ui://fake/view", name: "view", mimeType: "text/html;profile=mcp-app" }],
        },
      });
      return;
    }
    if (msg.method === "resources/read" && process.env.FAKE_RESOURCES) {
      // As 2.2.7's resourceReadError answers a URI it has not registered.
      if (msg.params?.uri !== "ui://fake/view") {
        fail(msg, -32602, `UI resource not found: ${msg.params?.uri}`);
        return;
      }
      evaluate(msg, Number(process.env.FAKE_RESOURCE_DELAY_MS ?? "0"), () => ({
        contents: [
          {
            uri: msg.params?.uri,
            mimeType: "text/html;profile=mcp-app",
            text: `read ${msg.params?.uri} server=${serverName}`,
          },
        ],
      }));
      return;
    }
    if (msg.method === "tools/call") {
      callsSeen++;
      if (!tools.some((t) => t.name === msg.params?.name)) {
        // What a real MCP server answers for a name it does not have: an error
        // response, not a result that happens to say something went wrong.
        send({
          jsonrpc: "2.0",
          id: msg.id,
          error: { code: -32602, message: `Unknown tool: ${msg.params?.name}` },
        });
        return;
      }
      // A server that gains a tool while a session is running: the list changes
      // and it says so, which is what tools.listChanged means.
      if (process.env.FAKE_ANNOUNCE_TOOL && !announced) {
        announced = true;
        setTimeout(() => {
          tools.push({
            name: "ToolThatAppearedLater",
            description: "registered after the session began.",
            inputSchema: { type: "object", properties: {} },
          });
          send({ jsonrpc: "2.0", method: "notifications/tools/list_changed", params: {} });
        }, 60);
      }
      // Progress has to arrive strictly before the result, spread over time, as
      // a real evaluation reports it. Emitting it in the same tick as the result
      // is not a faster version of the same thing: the SDK drops the progress
      // handler the moment a response lands, so every notification then arrives
      // "for an unknown token" and the test measures nothing.
      const token = msg.params?._meta?.progressToken;
      let progressDone = 0;
      if (token !== undefined) {
        for (const [i, at] of [[1, 20], [2, 40]]) {
          progressDone = at + 20;
          setTimeout(
            () =>
              send({
                jsonrpc: "2.0",
                method: "notifications/progress",
                params: { progressToken: token, progress: i, total: 2, message: `step ${i}` },
              }),
            at,
          );
        }
      }
      // Holding a slot for the length of an evaluation is the normal case, not
      // the exception. A negative delay never answers at all.
      const slow = !delayFirstOnly || callsSeen === 1;
      const wait = callDelay < 0 && slow ? -1 : Math.max(slow ? callDelay : 0, progressDone);
      evaluate(msg, wait, () => ({
        content: [
          {
            type: "text",
            text:
              `evaluated ${JSON.stringify(msg.params.arguments)} server=${serverName}` +
              ` base=${process.env.WOLFRAM_BASE ?? "(unset)"}` +
              ` userbase=${process.env.WOLFRAM_USERBASE ?? "(unset)"}` +
              // AgentTools reads MCP_TOOL_OPTIONS from the environment at
              // startup and it is what sets each tool's effective
              // TimeConstraint. It reaches the kernel only because kernel.ts
              // spreads process.env, so it is reported here to be checked.
              ` toolOptions=${process.env.MCP_TOOL_OPTIONS ?? "(unset)"}`,
          },
        ],
        // A tool that declares an output schema owes its caller structured
        // content, as the spec says.
        ...(msg.params?.name === "Structured" ? { structuredContent: { answer: 42 } } : {}),
      }));
      return;
    }
    if (msg.id !== undefined) {
      send({ jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: "Method not found" } });
    }
  }
}
} // not started as LSPServer
