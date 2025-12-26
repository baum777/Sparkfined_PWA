## Oracle — 02 Loveable Prompts

### Prompt V0 (1:1 existing UI)

**Tab scope**: Oracle  
**Component scope**: Oracle page layout, report rendering, history filter/chart/list (no behavior changes)

**Allowed paths (strict)**:
- root/src/pages/OraclePage.tsx
- root/src/components/oracle/*
- root/src/store/oracleStore.ts

**Task (atomic)**:
Reproduce and stabilize the existing Oracle UI without changing behavior. Fix only obvious a11y/consistency issues (labels, focus states) and avoid unrelated diffs.

**UI atoms / patterns to use**:
- Existing `DashboardShell`, `StateView`, `Button`
- Existing Oracle components (`OracleThemeFilter`, `OracleHistoryChart`, `OracleHistoryList`)
- Keep existing `data-testid` attributes unchanged.

**Guardrails**:
- No new routes.
- No new timers/intervals (keep existing reward timeout behavior).
- No performance regressions (keep parallel loading behavior).
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Oracle renders with the same sections and interactions as before.
- E2E selectors remain valid (`oracle-page`, `oracle-refresh-button`, `oracle-mark-read-button`, `oracle-pre`).

---

### Prompt V1 (polish — implement approved changes with minimal diff)

**Tab scope**: Oracle  
**Component scope**: Reward banner copy + mark-read clarity + takeaway summary + theme filter labeling/count

**Allowed paths (strict)**:
- root/src/pages/OraclePage.tsx
- root/src/components/oracle/ | OracleThemeFilter.tsx / OracleHistoryList.tsx / OracleHistoryChart.tsx

**Task (atomic)**:
Implement the approved Oracle polish:
1) Replace the reward banner copy with calmer “degen → mastery” wording and add a “View auto-journal entry” link/CTA.
2) Add a short pre-click explanation near “Mark as read” describing rewards (XP/streak/auto-journal).
3) Add a compact “Today’s takeaway” summary block above the full report `<pre>`.
4) Improve theme filter discoverability by labeling “All themes” and showing a count.

**UI atoms / patterns to use**:
- Existing cards and text styles already used in Oracle
- Existing theme filter component UI patterns

**Guardrails**:
- No edits outside Allowed paths.
- Keep existing `data-testid` stable (Oracle E2E relies on them).
- Do not introduce new routes; if “View auto-journal entry” must navigate, use an existing route and keep it optional.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Reward banner is calm and includes an actionable “View auto-journal entry” affordance.
- Users can see “what happens” before clicking “Mark as read.”
- “Today’s takeaway” is visible above the full report text.
- Theme filter labeling and counts improve discoverability without clutter.

---

### Prompt V2 (polish + micro-upgrade — still incremental)

**Tab scope**: Oracle  
**Component scope**: Same as V1, plus one small conversion micro-upgrade

**Allowed paths (strict)**:
- root/src/pages/OraclePage.tsx
- root/src/components/oracle/*

**Task (atomic)**:
Apply V1 improvements, then add one micro-upgrade:
- Add a small “Next step to mastery” link row that connects Oracle → Chart → Journal (e.g., “Open Chart for context” and “Open Journal entry”), without new data fetching or new persistence.

**UI atoms / patterns to use**:
- Existing button/link styles used elsewhere on the page

**Guardrails**:
- Exactly one micro-upgrade row; avoid clutter.
- No new timers/intervals.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Adds one small “next step” row that improves actionability without changing core behaviors.
