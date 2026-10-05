(* The reproducible truth for Wolfram Language sources: every .wl/.wls/.wlt in
   the tree must lint clean under CodeInspector, the same paclet the plugin's
   LSP runs, so what CI checks is exactly what sessions saw live. Needs a
   kernel, so it is opt-in like the contract: npm run lint:wl.

   Deliberately no formatting check. CodeFormatter has no fixed point on block
   comments -- measured, it inserts a fresh blank line into a multi-line
   comment on every pass, so a formatted file grows without bound and a
   format-check can never be satisfied. plan.md records the defect; revisit
   when the paclet converges. *)

Needs["CodeInspector`"]

(* CodeInspector`ConfidenceLevel collides with System`ConfidenceLevel; both
   contexts are loaded here and the reference below is fully qualified, so the
   shadow warning is noise. *)
Off[General::shdw]

root = ParentDirectory[DirectoryName[ExpandFileName[$InputFileName]]];
files = Select[
    FileNames[{"*.wl", "*.wls", "*.wlt"}, root, Infinity],
    StringFreeQ[#, "node_modules" | "dist"] &
];

(* Mirror the MCP CodeInspector tool's defaults: Formatting and Scoping are
   excluded (layout and scoping style are the author's), and low-confidence
   findings stay out. DifferentLine is excluded by decision: it fires on long
   operands wrapped across lines, which this repo's hand formatting does on
   purpose. *)
failures = 0;
Do[
    Module[{issues},
        issues = Select[
            CodeInspect[File[file]],
            FreeQ[#[[3]], "Formatting" | "Scoping"] &&
                FreeQ[#[[1]], "DifferentLine"] &&
                Lookup[#[[4]], CodeInspector`ConfidenceLevel, 1.0] >= 0.75 &
        ];
        Do[
            failures++;
            Print[file, ": ", issue[[1]], " -- ", issue[[2]]],
            {issue, issues}
        ];
    ],
    {file, files}
];

Print[Length[files], " file(s) checked, ", failures, " finding(s)"];
Exit[If[failures > 0, 1, 0]]
