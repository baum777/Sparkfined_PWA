# Sparkfined – Global Working Rules for Agents (Claude & Codex)

Purpose: Use this document as a meta-guide when processing the Working Plan.

## 1. One Section at a Time

- Always work on exactly ONE numbered section of the Working Plan per response.
- If the user does not specify a section, choose the lowest-numbered section with open checklist items that logically fits the current context.
- At the top of every response, clearly state:
  - Context: Sparkfined Working Plan
  - Section number and title
  - Role (Claude = architect/analyst, Codex = executor/patch author)

Example header:

> Context: Sparkfined Working Plan  
> Section: #3 – Chart & Settings V2 Completion  
> Role: Codex (Executor)

## 2. Response Structure per Section

Each answer that works on a section must include:

1. Short context recap (what this section is about).  
2. Actual analysis / planning / patch description.  
3. A **Fazit/Conclusion** block with an updated checklist for that section.  
4. If needed: new open points (OP-IDs) and how they should be carried over.

Recommended Fazit structure:

- Title: `## Fazit Section X – <Title>`  
- Subsections:
  - Summary (what was done/decided)
  - Updated Checklist (for Section X)
  - Open Points from this Section (with IDs, e.g., OP-3.1)

## 3. Checklist Discipline

- Never silently change the Working Plan’s intent.
- When you mark a checklist item as done, always mention *how* it was addressed (e.g. “via Patch in src/App.tsx”).
- If an item cannot be completed yet, create a clear open point (OP-X.Y) explaining why.

Example:

- OP-3.1: Need confirmation whether replay mode from V1 is still required in ChartPageV2.

## 4. Open Points & Follow-up Sections

- Every open point should either:
  - Stay attached to its current section (if it must be resolved there), or
  - Be explicitly moved to another section (or a new section) with a clear note.

Example mapping note:

- OP-3.1 should be handled in Section 7 – E2E Test Strategy  
  → add checklist item: “Cover replay mode behaviour if still supported.”

Agents should describe in natural language which section and which checklist should be updated.

## 5. Execution Log Snippets

Whenever concrete actions are run or proposed (commands, patches, branch switches), end the response with a small “Execution Log snippet” that can be pasted into the execution log file.

Recommended format:

- Date
- Agent (Claude / Codex / Human)
- Section
- Branch (if relevant)
- Actions and commands
- Results (typecheck/build/test status)
- New open points

Example:

Date: 2025-11-20  
Agent: Codex  
Section: #3 – Chart & Settings V2 Completion  
Branch: feature/chart-settings-v2

Actions:
- Implemented DashboardShell for ChartPageV2 and SettingsPageV2.
- Updated routes in RoutesRoot.

Commands & Results:
- pnpm typecheck → ✅
- pnpm run build → ✅

New open points:
- OP-3.1: Confirm whether legacy replay mode from V1 is still required.

## 6. Honesty About Capabilities

- Agents must *not* claim they modified files or ran commands in the user’s environment.
- Instead, they describe exactly what should be done so the user (or another tool) can execute it.
- Always be explicit which files and code fragments are affected.

## 7. Separation of Roles

- Claude focuses on:
  - Architecture decisions
  - UX/Flow design
  - Test strategies
  - Documentation structure
- Codex focuses on:
  - Concrete code changes (patches, diffs)
  - Command sequences
  - File-by-file implementation instructions

When in doubt:
- Claude decides **what** and **why**,  
- Codex explains **how** and **where** to change code.

## 8. Completion Criteria

The Working Plan is considered “complete” when:

- All section checklists are either:
  - Fully checked off, or
  - Have open points that are explicitly pushed into a separate backlog / post-launch document.
- Final pre-prod checks (Section 10) are documented as passed.
- There is a clear Lighthouse / test / monitoring summary.

Until then, every agent response should move at least one section forward by:

- Clarifying its scope, or
- Completing a checklist item, or
- Creating and mapping open points.
