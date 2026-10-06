(* Pins the Wolfram/AgentTools facts that src/kernel.ts and src/config.ts
   hardcode. If a paclet upgrade changes any of these, the TypeScript is wrong
   and this file is where you find out.

   Run:  npm run test:wl                  (from a clone; exits non-zero on failure)
         npm run doctor                   (checks the environment instead)
         or the TestReport tool, or:
         wolframscript -code 'TestReport["test/agenttools-contract.wlt"]' *)

VerificationTest[
    (* =!= Missing was a tautology: the bare symbol is never what is returned. *)
    Needs["Wolfram`AgentTools`"]; StringQ[PacletObject["Wolfram/AgentTools"]["Version"]],
    True,
    TestID -> "paclet-present"
]

VerificationTest[
    (* src/config.ts DEFAULT_MIN_VERSION must not be below what AgentTools needs.

       Compared against the LOWEST requirement among the available paclets, not
       the newest paclet's. The paclet manager picks a release to suit the
       kernel, so 2.2.7 requiring 15.0+ does not make a 14.3 floor wrong while
       2.2.0 still serves 14.3+. Asking PacletObject for "the" requirement gets
       you the newest one, which is why this reads the whole set.

       Order[floor, requirement] is -1 when the floor is safely above the
       requirement and 0 when they are equal. 1 means the floor is TOO LOW,
       which is the state this test exists to catch. *)
    With[
        {parse = PadRight[ToExpression /@ StringSplit[#, "."], 4, 0] &},
        Order[
            parse["14.3"],
            First @ Sort @ Map[
                parse[StringReplace[#["WolframVersion"], "+" -> ""]] &,
                PacletFind["Wolfram/AgentTools", "UpdatePacletSites" -> False]
            ]
        ]
    ],
    -1 | 0,
    SameTest -> MatchQ,
    TestID -> "min-version-floor-is-not-too-low"
]

VerificationTest[
    (* src/kernel.ts PACLET_KERNEL_ARGS is copied from this, verbatim; KERNEL_ARGS
       runs it unchanged, after writing the installation facts (plugin plan D20) *)
    Wolfram`AgentTools`MCPServerObject`Private`$defaultCommandLineArguments,
    {"-run", "PacletSymbol[\"Wolfram/AgentTools\",\"Wolfram`AgentTools`StartMCPServer\"][]",
     "-noinit", "-noprompt"},
    TestID -> "kernel-args-match-src-kernel-ts"
]

VerificationTest[
    (* src/config.ts MCP_SERVERS -- every name must resolve to a real server.

       These are the BUILT-IN servers, not the whole vocabulary: MCP_SERVERS is
       a subset and the next test says why. An earlier comment here claimed it
       was "the paclet's own vocabulary", and resolveServerName was built on
       that claim. *)
    AllTrue[
        {"Wolfram", "WolframLanguage", "WolframAlpha", "WolframPacletDevelopment"},
        Wolfram`AgentTools`MCPServerObjectQ[Wolfram`AgentTools`MCPServerObject[#]] &
    ],
    True,
    TestID -> "all-configured-server-names-exist"
]

VerificationTest[
    (* Why src/config.ts resolveServerName passes an unrecognised name through
       rather than substituting a built-in for it: the name space is open, and
       nothing this package can hold is a list of the valid names.

       A name is resolved from, in this order: the user's own directory, the
       built-ins, then a paclet-qualified Publisher/Server. So a name we do not
       know is ordinarily somebody's own server, and the user's directory is
       consulted FIRST -- a user server can even shadow a built-in. *)
    With[
        {source = Import[FileNameJoin[{PacletObject["Wolfram/AgentTools"]["Location"],
                                       "Kernel", "MCPServerObject.wl"}], "Text"]},
        And[
            (* the user's own file, tried before either fallback *)
            StringContainsQ[source, "file = ConfirmBy[ mcpServerFile @ name"],
            (* and only then the built-ins, or a paclet that declares servers *)
            StringContainsQ[source, "checkBuiltInMCPServer @ name"],
            StringContainsQ[source, "checkPacletMCPServer @ name"],
            StringContainsQ[source, "getAgentToolsDeclaredItems[ paclet, \"MCPServers\" ]"]
        ]
    ],
    True,
    TestID -> "server-names-are-not-limited-to-the-built-ins"
]

VerificationTest[
    (* A typo still does not resolve -- which is why an unresolvable name has to
       be DIAGNOSED rather than pre-empted by a whitelist. Such a kernel does
       not fail: it prints the message below and runs on as a non-server. *)
    Wolfram`AgentTools`MCPServerObjectQ[
        Quiet @ Wolfram`AgentTools`MCPServerObject["Wolframm"]],
    False,
    TestID -> "unknown-server-name-does-not-resolve"
]

VerificationTest[
    (* src/flavour.ts FLAVOUR_VARS is built from this set: the variables the
       paclet reads at kernel startup are what decide whether two sessions can
       share a kernel. If an upgrade reads a NEW one, a person has to decide
       whether it changes what a kernel is -- deciding by omission means silently
       serving one project's calls from another project's kernel, which is the
       bug this list exists to prevent.

       Sort on both sides, so this compares sets rather than orderings. *)
    Union @ Flatten @ Map[
        StringCases[
            Import[#, "Text"],
            RegularExpression["Environment\\[ *\"([A-Za-z_0-9]+)\""] -> "$1"
        ] &,
        FileNames[
            "*.wl",
            FileNameJoin[{PacletObject["Wolfram/AgentTools"]["Location"], "Kernel"}],
            Infinity
        ]
    ],
    Sort @ {
        (* in FLAVOUR_VARS: these change what a call does *)
        "LLMKIT_ENABLED", "MCP_APPS_ENABLED", "MCP_APPS_NOTEBOOK_METHOD",
        "MCP_SERVER_NAME", "MCP_TOOL_OPTIONS", "WOLFRAM_CLOUDBASE",
        (* deliberately not: a Windows system path, and two build stamps the
           paclet reports rather than acts on *)
        "SystemRoot", "GITHUB_SHA",
        "BUILD_VCS_NUMBER_WolframLanguage_Paclets_AgentTools_AgentTools"
    },
    TestID -> "agenttools-env-reads-are-known"
]

(* ::**************************************************************************:: *)
(* Servers the user built. This is the case src/config.ts resolveServerName
   exists to allow, and the tests above only read the paclet's source to say it
   is possible -- these make one and prove it.

   Two names, on purpose. A throwaway exercises creation and removal on every
   run, whatever the machine already has. "My Prime Finder" is then whatever the
   person at this machine actually built: created only if absent, and removed
   only if these tests created it, because a test may not delete somebody's work.
   CreateMCPServer refuses to overwrite without OverwriteTarget, so neither path
   can clobber one either.

   Removal is by directory rather than DeleteObject, which also runs
   UninstallMCPServer and edits MCP client configuration files -- not something a
   test may do to a machine. *)

$wolframMcpServersDir = FileNameJoin @ {
    $UserBaseDirectory, "ApplicationData", "Wolfram", "AgentTools", "Servers"
};

$wolframMcpServerDir = FileNameJoin @ { $wolframMcpServersDir, URLEncode @ # } &;

$wolframMcpTestName = "Wolfram MCP Server Contract Test";

VerificationTest[
    (* Creation, with the shape a user actually writes. Any leftover from a run
       that died half way is cleared first, so this heals rather than failing
       forever on a file nobody remembers. The name has spaces because names do --
       and because a space in a server name used to collide in the broker socket
       digest, which src/broker-protocol.ts now NUL-separates. *)
    Quiet @ DeleteDirectory[ $wolframMcpServerDir @ $wolframMcpTestName, DeleteContents -> True ];
    Quiet @ Wolfram`AgentTools`CreateMCPServer[
        $wolframMcpTestName,
        <| "Tools" -> { LLMTool[ "PrimeFinder", { "n" -> "Integer" }, Prime[ #n ] & ] } |>
    ];
    Wolfram`AgentTools`MCPServerObjectQ[
        Quiet @ Wolfram`AgentTools`MCPServerObject @ $wolframMcpTestName
    ],
    True,
    TestID -> "a-server-the-user-builds-resolves-by-name"
]

VerificationTest[
    (* src/flavour.ts and docs/environment.md both state this path, and until now
       it was read out of the paclet's source rather than observed. It matters
       because it is what a user-defined server *is*: no registry, a file. Note
       URLEncode -- a name with spaces is encoded on disk. *)
    FileExistsQ @ FileNameJoin @ { $wolframMcpServerDir @ $wolframMcpTestName, "Metadata.wxf" },
    True,
    TestID -> "user-server-metadata-is-where-flavour-ts-says-it-is"
]

VerificationTest[
    (* Two things this cannot be written as. A pattern in the expected slot is
       evaluated first, so `LLMTool["PrimeFinder", ___]` becomes $Failed with an
       argument-count message. And Part cannot reach inside: an LLMTool is atomic,
       so `[[1, "Name"]]` stays unevaluated and Quiet hides the message saying so.
       Property access is the way in. *)
    #[ "Name" ] & /@ Wolfram`AgentTools`MCPServerObject[ $wolframMcpTestName ][ "Tools" ],
    { "PrimeFinder" },
    TestID -> "a-user-built-server-exposes-the-tool-it-was-given"
]

VerificationTest[
    Quiet @ DeleteDirectory[ $wolframMcpServerDir @ $wolframMcpTestName, DeleteContents -> True ];
    DirectoryQ @ $wolframMcpServerDir @ $wolframMcpTestName,
    False,
    TestID -> "and-removing-it-leaves-nothing-behind"
]

VerificationTest[
    (* The one on this machine, if there is one. Created only if absent, and the
       tool set is deliberately not asserted: if it was already here, its
       definition is the user's business, not this test's. *)
    $wolframMcpPrimeFinderExisted =
        Wolfram`AgentTools`MCPServerObjectQ[
            Quiet @ Wolfram`AgentTools`MCPServerObject[ "My Prime Finder" ]
        ];

    If[ ! TrueQ @ $wolframMcpPrimeFinderExisted,
        Quiet @ Wolfram`AgentTools`CreateMCPServer[
            "My Prime Finder",
            <| "Tools" -> { LLMTool[ "PrimeFinder", { "n" -> "Integer" }, Prime[ #n ] & ] } |>
        ]
    ];

    MatchQ[
        Quiet @ Wolfram`AgentTools`MCPServerObject[ "My Prime Finder" ][ "Tools" ],
        { __ }
    ],
    True,
    TestID -> "the-server-on-this-machine-resolves-and-has-tools"
]

VerificationTest[
    (* What this test made, it removes; what it found, it leaves exactly where it
       was -- and says which of the two happened by asserting the outcome. *)
    If[ TrueQ @ $wolframMcpPrimeFinderExisted,
        DirectoryQ @ $wolframMcpServerDir @ "My Prime Finder",
        Quiet @ DeleteDirectory[
            $wolframMcpServerDir @ "My Prime Finder", DeleteContents -> True
        ];
        ! DirectoryQ @ $wolframMcpServerDir @ "My Prime Finder"
    ],
    True,
    TestID -> "and-a-server-the-test-did-not-create-is-left-alone"
]

VerificationTest[
    (* src/kernel.ts SERVER_NOT_FOUND matches this message, and turns a name the
       paclet cannot resolve into an error in the kernel's first second instead
       of a wait for the whole start timeout. If the wording changes, the watch
       stops working and nothing else would notice. *)
    StringContainsQ[
        Import[FileNameJoin[{PacletObject["Wolfram/AgentTools"]["Location"],
                             "Kernel", "Messages.wl"}], "Text"],
        "MCPServerNotFound" ~~ Whitespace ~~ "=" ~~ Whitespace ~~
            "\"No MCPServerObject found for name"
    ],
    True,
    TestID -> "server-not-found-message-is-what-we-watch-for"
]

VerificationTest[
    (* The same watch, for a paclet-qualified Publisher/Server: SERVER_NOT_FOUND
       also matches these message names, which a real 15.0 kernel printed for a
       paclet with no AgentTools extension before StartMCPServer dropped it to
       its REPL (issue #5). A message renamed here would bring back the wait for
       the whole start timeout, so each name is pinned to the paclet's own
       Messages.wl. *)
    With[{messages = Import[FileNameJoin[{PacletObject["Wolfram/AgentTools"]["Location"],
                                          "Kernel", "Messages.wl"}], "Text"]},
        Select[
            {"MCPServerFileNotFound", "PacletNotInstalled", "PacletExtensionNotFound",
             "PacletServerNotFound", "InvalidPacletServerDefinition",
             "InvalidAgentToolsPacletExtension"},
            !StringContainsQ[messages, "AgentTools::" <> # ~~ Whitespace ~~ "="] &
        ]
    ],
    {},
    TestID -> "paclet-server-messages-are-what-we-watch-for"
]

VerificationTest[
    (* Why the server name travels as an environment variable rather than an argument:
       the no-argument overload reads it itself. StartMCPServer is ReadProtected,
       so Definition[] shows only attributes; read the shipped source instead. *)
    StringContainsQ[
        Import[FileNameJoin[{PacletObject["Wolfram/AgentTools"]["Location"],
                             "Kernel", "Server", "Local.wl"}], "Text"],
        RegularExpression["Environment\\[\\s*\"MCP_SERVER_NAME\"\\s*\\]"]
    ],
    True,
    TestID -> "server-name-is-read-from-MCP_SERVER_NAME"
]

VerificationTest[
    (* Each server is described by the tools it offers, and nothing else checks
       those counts. Pinning them here means a paclet that changes a server's
       tools fails a test instead of quietly making a description wrong. *)
    AssociationMap[
        Length[Wolfram`AgentTools`MCPServerObject[#]["Tools"]] &,
        {"Wolfram", "WolframLanguage", "WolframAlpha", "WolframPacletDevelopment"}
    ],
    <|
        "Wolfram" -> 3,
        "WolframLanguage" -> 7,
        "WolframAlpha" -> 2,
        "WolframPacletDevelopment" -> 13
    |>,
    TestID -> "documented-tool-counts-are-the-real-ones"
]

(* Whether a server offers prompts. This read ["Prompts"], which is not a
   property: it returns Missing["UnknownProperty", "Prompts"], whose Length is 2,
   so the test below passed for any server at all. PromptNames is the property,
   and a pattern rather than a Length is what keeps a Missing from passing. *)
$wolframMcpOffersPrompts = MatchQ[ #[ "PromptNames" ], { __String } ] &;

VerificationTest[
    (* docs/design.md: "All four servers advertise prompts; none advertise
       resources." The server only advertises what a kernel was seen to offer,
       so if this ever became false the capability would quietly disappear
       rather than break -- which is exactly the kind of change worth failing on. *)
    AllTrue[
        {"Wolfram", "WolframLanguage", "WolframAlpha", "WolframPacletDevelopment"},
        $wolframMcpOffersPrompts @ Wolfram`AgentTools`MCPServerObject[ # ] &
    ],
    True,
    TestID -> "every-server-offers-at-least-one-prompt"
]

VerificationTest[
    (* The test above can fail. A server declaring no prompts must not count as
       offering one -- the ["Prompts"] reading said it did. Removed by directory,
       for the reason the custom-server tests give. *)
    Module[ { name = "Wolfram MCP Server Contract Test No Prompts", offers },
        Quiet @ DeleteDirectory[ $wolframMcpServerDir @ name, DeleteContents -> True ];
        Quiet @ Wolfram`AgentTools`CreateMCPServer[
            name,
            <| "Tools" -> { LLMTool[ "PrimeFinder", { "n" -> "Integer" }, Prime[ #n ] & ] } |>
        ];
        offers = $wolframMcpOffersPrompts @ Wolfram`AgentTools`MCPServerObject[ name ];
        Quiet @ DeleteDirectory[ $wolframMcpServerDir @ name, DeleteContents -> True ];
        { offers, DirectoryQ @ $wolframMcpServerDir @ name }
    ],
    { False, False },
    TestID -> "a-server-with-no-prompts-is-not-counted-as-offering-one"
]

VerificationTest[
    (* The single fact the whole timeout design rests on: dispatch is
       synchronous, tools/call calls evaluateTool inline. Three consequences, all
       measured against a real kernel -- a ping sent 500ms into a 20s evaluation
       was not answered until 22.8s:

         1. A busy kernel and a hung one are equally deaf, so no probe and no
            timeout can tell a legitimate long call from a wedged one. This is
            why src/kernel.ts stops guessing and leaves the kernel alone.
         2. The kernel's eventual reply is the only evidence of life available,
            which is why the request is left outstanding rather than given to
            the SDK as a timeout that would discard it.
         3. notifications/cancelled cannot stop work already running -- the loop
            will not read it until the evaluation it would cancel has finished --
            so stopping the process is the only thing that honours a cancel.

       Were dispatch ever made concurrent, all three would need revisiting, and
       test/fake-kernel.mjs' silence on ping during a call would stop modelling
       anything real. *)
    StringContainsQ[
        Import[FileNameJoin[{PacletObject["Wolfram/AgentTools"]["Location"],
                             "Kernel", "Server", "Shared.wl"}], "Text"],
        RegularExpression["handleMethod\\[\\s*\"tools/call\"\\s*,[^\\n]*evaluateTool"]
    ],
    True,
    TestID -> "tool-dispatch-is-synchronous"
]
