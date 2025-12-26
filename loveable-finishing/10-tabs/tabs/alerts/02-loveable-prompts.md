## Alerts — 02 Loveable Prompts

### Prompt V0 (1:1 existing UI)

**Tab scope**: Alerts  
**Component scope**: Alerts list + filters + create sheet (no behavior changes)

**Allowed paths (strict)**:
- root/src/pages/AlertsPage.tsx
- root/src/features/alerts/*
- root/src/components/alerts/*

**Task (atomic)**:
Reproduce and stabilize the existing Alerts UI without changing behavior. Fix only obvious UX/a11y issues (labels, focus states, semantics) and avoid unrelated diffs.

**UI atoms / patterns to use**:
- Existing `StateView` / error + retry patterns already used in Alerts
- Existing `Button`, `Select`, `Input` primitives used by the create sheet

**Guardrails**:
- Keep all existing `data-testid` stable (see below).
- Preserve prefill behavior (open create sheet once, then strip URL params).
- No new polling/timers; no config changes.

**Acceptance criteria**:
- Alerts page renders and behaves the same as before.
- Keyboard focus is visible for filters and primary CTA.

**Selectors that must remain stable**:
- `alerts-page`, `alerts-new-alert-button`, `alerts-list`, `alerts-list-item`
- `alert-create-dialog`, `alert-create-form`, `alert-cancel-button`, `alert-submit-button`
- `alert-symbol-input`, `alert-type-select`, `alert-threshold-input`, `alert-condition-input`, `alert-timeframe-select`

---

### Prompt V1 (polish — implement approved changes with minimal diff)

**Tab scope**: Alerts  
**Component scope**: Empty states + filter clarity + template confirmation + list-item clarity

**Allowed paths (strict)**:
- root/src/pages/AlertsPage.tsx
- root/src/features/alerts/*
- root/src/components/alerts/*

**Task (atomic)**:
Implement the approved Alerts polish changes:
1) Replace text-only empty states with actionable empty states (CTA: create alert; secondary: go to `/chart`).
2) Add visible active-filter chips + one-click “Clear” + a subtle results count.
3) Replace template overwrite `window.confirm` with an in-app accessible confirmation UI.
4) Improve list-item clarity and keyboard friendliness while keeping all flows and test ids stable.

**UI atoms / patterns to use**:
- Existing empty/error patterns (`StateView` / existing card patterns)
- Existing dialog/sheet patterns already used for alert creation (no new routing)

**Guardrails**:
- Do not rename/remove any existing `data-testid`.
- Avoid “drive-by cleanup”; only change what is required for these improvements.
- Do not change URL sync semantics beyond preserving current prefill stripping.

**Acceptance criteria**:
- Empty states guide users to a successful “first alert created”.
- Filters are self-explanatory (chips + clear + count).
- Template apply flow is accessible and does not use `window.confirm`.
- No Playwright Alerts tests break (or, if they must change, update them to use the same stable test ids).

---

### Prompt V2 (polish + micro-upgrade — still incremental)

**Tab scope**: Alerts  
**Component scope**: V1 + one tiny speed boost

**Allowed paths (strict)**:
- root/src/pages/AlertsPage.tsx
- root/src/features/alerts/*
- root/src/components/alerts/*

**Task (atomic)**:
Apply V1 improvements, then add exactly one micro-upgrade:
- Add a lightweight “Quick create” affordance when a symbol is typed (e.g., preselect common type + focus threshold), without adding new API calls or routes.

**Guardrails**:
- Exactly one micro-upgrade; no new settings or global components.
- Keep `data-testid` stable; no new polling/timers.

**Acceptance criteria**:
- Users can move from “typed symbol” → “valid alert” with fewer steps, without changing underlying behavior.
