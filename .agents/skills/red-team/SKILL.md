---
name: red-team
description: Attack a design decision or a change for every way its promise can fail, in one exhaustive pass, with independent attackers, then consolidate. Use before a design is marked decided, when a pull request's review rounds keep finding new edges, or when asked to red-team, attack, or take an adversarial look at something.
---

# Red team

A review asks whether a diff is right. A red team asks whether a promise can be kept. Reviews
of #176 found one to three new edges a round, round after round, because each pass reported its
strongest few findings and each fix widened the promise. A red team lists everything in one
pass, from attackers who do not see each other's work. This skill is shared by Codex and Claude
Code: `.claude/skills/red-team` links here.

## 1. State the promise

Write down, a sentence each: what the change guarantees, its scope, and where that is written
(`file:line`, or the issue). A promise you cannot state is the first finding: report that and
stop.

## 2. Brief

Put the brief in a file in your scratch directory, never the working tree. It says:

- What is under attack: the promise, quoted, and where it is.
- **Constraints.** Modify no file, run no test suite, start no Wolfram kernel or `wolframscript`
  (each costs a licence seat). Read `AGENTS.md` first.
- **What to find.** Every concrete scenario in which the promise breaks, from: concurrency and
  ordering; crashes, signals and partial failure at each step's boundary; cold start and unknown
  state; configuration and environment differences; licence kinds and seat accounting;
  platforms and filesystems; upgrades, downgrades and mixed versions; every code path in `src/`
  the promise covers, found by searching rather than assumed; and contradictions with
  `AGENTS.md`'s invariants or with how the code behaves today.
- **For each finding.** The scenario step by step, its consequence, whether the written design
  handles it (quote it), the smallest mitigation, and the check that would prove it.
- **Exhaustive.** Every finding in this pass, weak ones included and marked weak.
- **Threads last.** Only after its own pass, read the pull request's review threads
  (`gh api repos/{owner}/{repo}/pulls/<n>/comments --paginate`) and mark each finding new or
  already raised.
- **Output.** A numbered catalogue grouped by class, then a verdict: can the promise be kept as
  written, what narrower promise can, which findings are inherent to the mechanism, and whether
  another mechanism would remove a whole class of them.

## 3. Attack, in parallel

At least two attackers on the same brief, neither shown the other's output:

- **Codex.** From Codex, spawn the `red_team` agent (`.codex/agents/red-team.toml`); an agent
  cannot drop the session's MCP servers, so its brief alone keeps it off the Wolfram tools.
  From anywhere else, run it in the background. `--ignore-user-config` leaves out the user's
  Codex config, and with it this repository's trust, so the run has no MCP server at all: no
  Wolfram server, of this repository's or the user's, can start a kernel even to list its tools.
  Sign-in still works, and the skills still load:

  ```bash
  BRIEF=<scratch>/red-team-brief.md     # the brief from step 2
  OUT=<scratch>/red-team-codex.out
  codex exec --ignore-user-config -s read-only -c model_reasoning_effort=high \
    -C "$(git rev-parse --show-toplevel)" "$(cat "$BRIEF")" < /dev/null > "$OUT" 2>&1
  ```

  Without `< /dev/null` it prints `Reading additional input from stdin...` and waits forever. Check
  the banner says `reasoning effort: high`, and name the `model:` it printed when you report.
  Its answer follows the last line that reads `codex`.
- **A subagent of your own harness** on the same brief, read-only.
- **A devil's advocate**, when a decision is at stake: argue that the decision is wrong, and
  what to do instead.

## 4. Consolidate

- Merge duplicates across attackers, keeping each one's citations.
- Check every claim about today's code yourself before repeating it. One that holds is a bug in
  the code, not in the design: file it, labelled as `docs/next-session.md` *Working here* says.
- Report where the attackers agree, what only one found, the verdict, and what needs deciding.
  The findings inform the maintainer's decision; do not change the design on your own.
- Figures belong on the issue, not in `docs/` (`AGENTS.md`).
