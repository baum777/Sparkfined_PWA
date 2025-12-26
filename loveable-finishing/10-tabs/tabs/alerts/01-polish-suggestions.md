## Alerts — 01 Polish Suggestions (approved)

### Approved changes

1) **Make empty states actionable (first alert → armed)**
   - Upgrade text-only empties to an actionable empty state with a clear CTA to create an alert (and a secondary CTA to jump to Chart).

2) **Make filtering “obvious” and faster**
   - Show active filters as chips (Status / Type / Symbol query), add a one-click “Clear” action, and show a subtle results count for trust.

3) **Improve create-sheet template safety + UX**
   - Replace `window.confirm` template overwrite with an in-app confirmation UI (a11y-friendly) and clearer “what will change” messaging.

4) **Tighten list-item clarity + keyboard friendliness**
   - Ensure list rows/cards expose status + condition at a glance, keep actions consistent across mobile/desktop, and improve focus/keyboard affordances without changing flows.

### Rationale (conversion/usability first)
- **(1)** Reduces dead-ends and increases “first successful alert created”.
- **(2)** Cuts filter confusion and improves information scent (“why is my list empty?”).
- **(3)** Prevents accidental template overwrites and improves trust.
- **(4)** Improves confidence and speed for power users; reduces mis-clicks.

### Risks / guardrails
- **E2E stability**: keep all existing `data-testid` stable:
  - `alerts-page`, `alerts-new-alert-button`, `alerts-list`, `alerts-list-item`
  - `alert-create-dialog`, `alert-create-form`, `alert-cancel-button`, `alert-submit-button`
  - `alert-symbol-input`, `alert-type-select`, `alert-threshold-input`, `alert-condition-input`, `alert-timeframe-select`
- **URL prefill**: preserve the current prefill behavior (open once, then strip params).
- **No config weakening**: do not weaken validation; refine UI/UX around it.

### Acceptance criteria (testable)
- **(1)** With zero alerts, users see a clear CTA that opens the create sheet; secondary CTA navigates to `/chart`.
- **(2)** Active filters are visible as chips; “Clear” resets filters; results count updates consistently with filters.
- **(3)** Applying a template never uses `window.confirm`; overwrite confirmation is accessible and explains the impact.
- **(4)** Keyboard focus is visible across filter controls and alert items; interactions behave the same as before.

### Affected paths (strict, from cluster map)
- root/src/pages/AlertsPage.tsx
- root/src/features/alerts/*
- root/src/components/alerts/*
- root/tests/e2e/alerts*.spec.ts (only if selectors/flows must change; prefer no changes)
