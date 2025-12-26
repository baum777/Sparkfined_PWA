## Settings — 02 Loveable Prompts

### Prompt V0 (1:1 existing UI)

**Tab scope**: Settings  
**Component scope**: Settings page shell + existing cards (no behavior changes)

**Allowed paths (strict)**:
- root/src/pages/ | SettingsPage.tsx / SettingsContent.tsx
- root/src/features/settings/*
- root/src/components/settings/*

**Task (atomic)**:
Reproduce and stabilize the existing Settings UI without changing behavior. Fix only obvious a11y/consistency issues and avoid unrelated diffs.

**UI atoms / patterns to use**:
- Existing settings card patterns (`SettingsCard`, pills, lists, collapsibles)
- Existing button and form control patterns

**Guardrails**:
- No refactors, no new global styling.
- Keep existing semantics; do not introduce new timers.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Settings renders with the same card stack and interactions as before.
- Keyboard focus is visible for interactive controls.

---

### Prompt V1 (polish — implement approved changes with minimal diff)

**Tab scope**: Settings  
**Component scope**: Copy + prioritization + export/import test hooks + destructive confirmation

**Allowed paths (strict)**:
- root/src/features/settings/*
- root/src/pages/ | SettingsContent.tsx (only if this route variant must be kept consistent)
- root/tests/e2e/settings/data-export.spec.ts (only if selectors must be updated; prefer no changes)

**Task (atomic)**:
Implement the approved Settings polish:
1) Clearly label stub/mock actions in copy (or remove them from primary paths).
2) Add “degen → mastery” guidance by emphasizing the top 3 setup essentials: theme, wallet monitoring, export.
3) Ensure export/import UI exposes stable `data-testid` selectors expected by E2E and improve success feedback clarity.
4) Make factory reset require typed confirmation instead of timing-based double click.

**UI atoms / patterns to use**:
- Existing pill/badge styles for “Mock/Stub” labeling
- Existing card ordering/layout (reorder with minimal change)
- Existing modal/collapsible patterns for confirmations

**Guardrails**:
- No unrelated diffs; keep changes minimal and localized.
- Don’t rename existing `data-testid`; add missing ones as needed.
- No new global config changes.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Stubbed controls are clearly marked in UI.
- Top 3 essentials are visually emphasized and easy to find.
- Export/import shows clear “success” feedback; E2E selectors remain stable.
- Factory reset cannot proceed without typed confirmation.

---

### Prompt V2 (polish + micro-upgrade — still incremental)

**Tab scope**: Settings  
**Component scope**: Same as V1, plus one small usability micro-upgrade

**Allowed paths (strict)**:
- root/src/features/settings/*

**Task (atomic)**:
Apply V1 improvements, then add one micro-upgrade:
- Add a compact “Setup completeness” cue at the top (e.g., 0/3, 1/3, 2/3, 3/3) based on whether the three essentials are configured (theme selected, wallet monitoring configured, export understood via tooltip/help), without adding telemetry.

**UI atoms / patterns to use**:
- Existing pill row styles

**Guardrails**:
- Exactly one new cue element; keep the hero uncluttered.
- No new network calls, no telemetry, no extra timers.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Setup cue is readable and does not distract from primary controls.
- No behavioral regressions; all existing buttons still function.
