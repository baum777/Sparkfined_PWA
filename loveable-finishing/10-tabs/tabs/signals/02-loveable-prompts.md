## Signals — 02 Loveable Prompts

### Prompt V0 (1:1 existing UI)

**Tab scope**: Signals  
**Component scope**: Signals list + filters + details modal (no behavior changes)

**Allowed paths (strict)**:
- root/src/pages/SignalsPage.tsx
- root/src/components/signals/*
- root/src/hooks/useSignals.ts

**Task (atomic)**:
Reproduce and stabilize the existing Signals UI without changing behavior. Fix only obvious a11y/consistency issues (modal semantics, focus, button labels) and avoid unrelated diffs.

**UI atoms / patterns to use**:
- Existing `DashboardShell`, `StateView`, `Button`
- Existing modal implementation in `SignalsPage` (overlay + panel)

**Guardrails**:
- No new global state stores.
- No new network calls.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Page renders with the same sections and interactions as before.
- Modal remains keyboard accessible and closes reliably.

---

### Prompt V1 (polish — implement approved changes with minimal diff)

**Tab scope**: Signals  
**Component scope**: Review modal actions + navigation CTA + filter presets + mastery nudge

**Allowed paths (strict)**:
- root/src/pages/SignalsPage.tsx
- root/src/components/signals/*

**Task (atomic)**:
Implement the approved Signals polish changes:
1) Replace console-only Accept/Reject with visible UI feedback (badge state + toast/inline message).
2) Add a primary “Open in Chart” CTA in Signal Details.
3) Add confidence preset buttons (60/75/90%) near the slider for quick filtering.
4) After Accept, show “Next step to mastery: Log outcome in Journal.”

**UI atoms / patterns to use**:
- Existing `Button` variants and text styles
- Existing modal header area for primary CTA placement

**Guardrails**:
- No unrelated diffs.
- Keep changes local; avoid new persistence layers unless a simple existing mechanism is already in place.
- Keep keyboard/focus behavior correct (new CTA and feedback).
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Accept/Reject shows visible feedback (not console-only).
- “Open in Chart” CTA navigates consistently and is visually primary.
- Preset buttons set the slider value and update list counts immediately.
- After Accept, a short mastery nudge appears.

---

### Prompt V2 (polish + micro-upgrade — still incremental)

**Tab scope**: Signals  
**Component scope**: Same as V1, plus one small usability upgrade

**Allowed paths (strict)**:
- root/src/pages/SignalsPage.tsx
- root/src/components/signals/*

**Task (atomic)**:
Apply V1 improvements, then add one micro-upgrade:
- Persist the last-used filter state (pattern + confidence) in the URL query params, so users can share and return to the same view—without adding new stores.

**UI atoms / patterns to use**:
- Existing router utilities (query params) already used elsewhere in the app

**Guardrails**:
- Avoid URL/state infinite loops (only update params when values change).
- No new network calls; no new timers.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Filters are reflected in the URL and respected on reload.
- No regressions in modal or list behavior.
