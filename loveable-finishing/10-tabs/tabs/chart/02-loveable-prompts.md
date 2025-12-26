## Chart — 02 Loveable Prompts

### Prompt V0 (1:1 existing UI)

**Tab scope**: Chart  
**Component scope**: Chart workspace layout + existing sidebar/tools/bottom panel (no behavior changes)

**Allowed paths (strict)**:
- root/src/features/chart/*
- root/src/components/chart/*

**Task (atomic)**:
Reproduce and stabilize the existing chart workspace UI without changing behavior. Fix only obvious a11y/consistency issues (labels, focus, roles) and remove any unintended layout jank.

**UI atoms / patterns to use**:
- Existing chart layout components (`ChartLayout`, `ChartTopBar`, `ChartCanvas`, `ChartToolbar`, `ChartSidebar`, `ChartBottomPanel`)
- Existing sheet patterns (`BottomSheet`, `RightSheet`)
- Keep existing selectors (do not rename `data-testid` used by tests)

**Guardrails**:
- No unrelated diffs; no refactors.
- No global styling changes.
- Performance-first: do not add new polling, do not increase chart re-render frequency.
- Ask questions before coding if any behavior is unclear.

**Acceptance criteria**:
- Chart renders with the same sections and interactions as before.
- Keyboard focus is visible on primary controls (timeframes, tools, collapse/tabs).
- No changes to existing `data-testid` used by chart E2E.

---

### Prompt V1 (polish — implement approved changes with minimal diff)

**Tab scope**: Chart  
**Component scope**: Top bar affordances + tools guidance + journal CTA + URL hint

**Allowed paths (strict)**:
- root/src/features/chart/*
- root/src/components/chart/*

**Task (atomic)**:
Implement the approved polish:
1) Add a clear primary CTA near the bottom panel: “Log this setup → Journal”.
2) Add a subtle one-time hint when the chart auto-populates missing URL params (symbol/timeframe/address/network).
3) Make the top bar “Refresh” button actually refresh chart data OR remove/replace it.
4) Present tools with a simple guided sequence: “Analyze → Mark → Alert” (still backed by the existing sections).

**UI atoms / patterns to use**:
- Existing button styles and chart panel typography (`sf-chart-panel-heading/subtext`)
- Existing bottom panel and tools sections (no new navigation surface)

**Guardrails**:
- No edits outside Allowed paths.
- Do not introduce URL/state infinite loops.
- Do not add new timers/intervals.
- Preserve existing E2E selectors and interactions.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- A primary “Log this setup → Journal” CTA is visible and keyboard accessible.
- URL-default hint appears once (e.g., dismissible or session-scoped) and does not flash repeatedly.
- “Refresh” has a real effect (triggers data reload) or is removed so there’s no dead control.
- Tools sequence is understandable at a glance without removing existing indicators/drawings/alerts content.

---

### Prompt V2 (polish + micro-upgrade — still incremental)

**Tab scope**: Chart  
**Component scope**: Same as V1, with one small conversion micro-upgrade

**Allowed paths (strict)**:
- root/src/features/chart/*
- root/src/components/chart/*

**Task (atomic)**:
Apply V1 improvements, then add one micro-upgrade that increases conversion without scope creep:
- Add a lightweight “next best action” cue that adapts to state (e.g., when no data: “Try 1h timeframe” / when alerts section empty: “Create first alert”), without new data fetching.

**UI atoms / patterns to use**:
- Existing `StateView`/hint text styles already used in chart placeholder/alerts empty blocks

**Guardrails**:
- Exactly one micro-upgrade cue; avoid clutter.
- No new network calls, no timers, no chart redraw triggers beyond existing ones.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Adds one small adaptive cue that helps users progress (Analyze → Mark → Alert → Journal).
- No measurable behavior regressions; existing flows remain intact.
