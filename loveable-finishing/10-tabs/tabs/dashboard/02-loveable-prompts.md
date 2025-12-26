## Dashboard — 02 Loveable Prompts

### Prompt V0 (1:1 existing UI)

**Tab scope**: Dashboard  
**Component scope**: Page shell + existing widgets (no new UI concepts)

**Allowed paths (strict)**:
- root/src/pages/ | DashboardPage.tsx
- root/src/components/dashboard/*
- root/src/features/dashboard/*

**Task (atomic)**:
Reproduce and stabilize the existing Dashboard UI without changing behavior. Only fix obvious a11y/consistency issues (labels, roles, focus states) and remove any unintended layout jank.

**UI atoms / patterns to use**:
- Existing `DashboardShell`, `KPIBar`, `StateView`, `Skeleton`, `Drawer`, `Button`
- Existing `data-testid` attributes (do not rename)

**Guardrails**:
- No unrelated diffs and no refactors.
- No route changes.
- No hardcoded colors (use existing tokens/utilities).
- Performance: don’t increase render frequency; don’t add new polling loops; keep lazy/Suspense boundaries.
- Ask questions before coding if any behavior is unclear.

**Acceptance criteria**:
- Dashboard renders with the same hierarchy and sections as before.
- Keyboard users can reach primary interactive elements and see focus indicators.
- All existing `data-testid` values remain unchanged.

---

### Prompt V1 (polish — implement approved changes with minimal diff)

**Tab scope**: Dashboard  
**Component scope**: Header CTA + insight teaser + alerts snapshot + empty states

**Allowed paths (strict)**:
- root/src/pages/ | DashboardPage.tsx
- root/src/components/dashboard/ | AlertsSnapshot.tsx / InsightTeaser.tsx
- root/src/features/dashboard/*

**Task (atomic)**:
Implement the approved Dashboard polish changes:
1) Make disabled “Log entry” self-explanatory with an inline hint + “How to enable”.
2) Label the dummy insight as “Preview” (or gate it until real intel exists) so it can’t be mistaken as real data.
3) In Alerts snapshot, reduce to one primary CTA and strengthen “Triggered” status cue.
4) Add “Next step to mastery” microcopy to relevant empty states (Chart/Journal CTAs).

**UI atoms / patterns to use**:
- Existing `Button`, `StateView`, `Badge`, `Card` patterns already used in these components
- Keep stable selectors: `dashboard-*` `data-testid` values

**Guardrails**:
- No changes outside Allowed paths.
- No new global styling; keep changes component-local.
- Don’t change navigation URLs (keep `/chart`, `/journal`, `/alerts`).
- No new E2E selector churn; do not rename `data-testid`.
- Ask questions before coding if any behavior is unclear.

**Acceptance criteria**:
- Disabled header `data-testid="dashboard-log-entry"` shows a short explanation + “How to enable”.
- Dummy insight is explicitly marked “Preview” OR not rendered without real intel; no misleading “AI” feel.
- Alerts snapshot still satisfies existing E2E expectations:
  - `dashboard-alerts-snapshot` visible
  - `dashboard-alerts-armed-count` and `dashboard-alerts-triggered-count` still present
  - `dashboard-alerts-view-all` still navigates to `/alerts`
- Empty states include one-line “Next step to mastery” guidance without changing the CTA destinations.

---

### Prompt V2 (polish + micro-upgrade — still incremental)

**Tab scope**: Dashboard  
**Component scope**: Same as V1, plus micro-interaction clarity (no new features)

**Allowed paths (strict)**:
- root/src/pages/ | DashboardPage.tsx
- root/src/components/dashboard/*
- root/src/features/dashboard/*

**Task (atomic)**:
Apply V1 improvements, then add one small micro-upgrade that increases conversion without scope creep:
- Add a lightweight “progress cue” line near the KPI strip or empty-state areas that connects actions to the Hero’s Journey (e.g., “Log → Review → Improve” / “degen → mastery”), without changing data models or adding new screens.

**UI atoms / patterns to use**:
- Existing typography patterns and `StateView` copy areas
- Existing `Badge`/small pill styles if needed (no new token system)

**Guardrails**:
- No new stores, no telemetry, no new routes.
- No performance regressions (no extra fetches; no new intervals).
- Keep copy short; avoid long explanatory text walls.
- Ask questions before coding if any behavior is unclear.

**Acceptance criteria**:
- Includes exactly one new micro-upgrade cue; UI remains uncluttered.
- All `data-testid` remain intact and existing interactions still function.
- No new network calls or timers introduced.

