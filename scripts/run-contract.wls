#!/usr/bin/env wolframscript
(* Runs test/agenttools-contract.wlt against a real kernel.

   Deliberately not part of `npm test`: that suite is hermetic and needs no
   Wolfram, while this one pins what the TypeScript hardcodes about the
   Wolfram/AgentTools paclet, which only an installed paclet can answer.
*)
file = FileNameJoin[{Directory[], "test", "agenttools-contract.wlt"}];
If[! FileExistsQ[file],
  Print["not found: ", file];
  Exit[2]
];

report = TestReport[file];
byOutcome = report["ResultsByOutcome"];
succeeded = Length @ Lookup[byOutcome, "Success", {}];
(* Values here are already lists of TestObject, not associations. *)
failures = Flatten @ Values @ KeyDrop[byOutcome, "Success"];

Print["Wolfram ", $Version];
Print["AgentTools ",
  Replace[PacletObject["Wolfram/AgentTools"]["Version"], Except[_String] -> "absent"]];
Print[succeeded, " passed, ", Length[failures], " failed"];

Scan[
  Print[
    "  FAIL  ", #["TestID"],
    "\n        expected: ", ReleaseHold @ #["ExpectedOutput"],
    "\n        actual:   ", ReleaseHold @ #["ActualOutput"]
  ] &,
  failures
];

Exit[If[TrueQ[report["ReportSucceeded"]] && Length[failures] === 0, 0, 1]]
