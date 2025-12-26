---
TAB: Alerts
Allowed paths (strict):
- root/src/pages/AlertsPage.tsx
- root/src/features/alerts/*
- root/src/components/alerts/*

Goal (conversion first):
Stabilize and polish the Alerts UI to guide users from discovery → first alert → successful monitoring, with accessible empty states, clear filters, and explicit template confirmation.

Do:
1) IF you find instability/a11y gaps blocking polish: fix obvious issues (focus states, labels, semantics) where needed.
2) Apply these approved polish changes (minimal diff):
   - Replace text-only empty states with actionable CTAs ("Create alert" primary, "Go to Chart" secondary)
   - Add visible active-filter chips + one-click "Clear" + subtle results count
   - Replace template overwrite `window.confirm` with in-app accessible confirmation UI
   - Improve list-item clarity and keyboard friendliness
   - Add lightweight "Quick create" affordance when symbol is typed (preselect common type, focus threshold)
   - Preserve prefill behavior (open create sheet once, then strip URL params)

Guardrails:
- Keep data-testid stable (never rename/remove): `alerts-page`, `alerts-new-alert-button`, `alerts-list`, `alerts-list-item`, `alert-create-dialog`, `alert-create-form`, `alert-cancel-button`, `alert-submit-button`, `alert-symbol-input`, `alert-type-select`, `alert-threshold-input`, `alert-condition-input`, `alert-timeframe-select`
- No new polling/timers, no config changes, no route changes
- Avoid drive-by cleanup; only change what's required

Done when:
- Empty states guide users to first successful alert
- Filters are self-explanatory (chips + clear + count visible)
- Template apply flow is accessible (no `window.confirm`)
- Quick create reduces steps from "typed symbol" → "valid alert"
- No Playwright alerts tests break

Output:
- Touched files list + short change summary (no long explanation).
