---
TAB: Dashboard
Allowed paths (strict):
- root/src/pages/DashboardPage.tsx
- root/src/components/dashboard/*
- root/src/features/dashboard/*

Goal (conversion first):
Stabilize and polish Dashboard to make every disabled control self-explanatory, strengthen trust in intel/alerts, and guide users toward mastery with Hero's Journey cues.

Do:
1) IF you find instability/a11y gaps blocking polish: fix obvious issues (labels, roles, focus states, layout jank) where needed.
2) Apply these approved polish changes (minimal diff):
   - Make disabled "Log entry" self-explanatory with inline hint + "How to enable"
   - Label dummy insight as "Preview" OR gate it until real intel exists (no misleading "AI" feel)
   - In Alerts snapshot, reduce to one primary CTA and strengthen "Triggered" status cue
   - Add "Next step to mastery" microcopy to empty states (Chart/Journal CTAs)
   - Add lightweight "progress cue" near KPI strip connecting actions to Hero's Journey (e.g., "Log → Review → Improve" or "degen → mastery"), no new data models

Guardrails:
- Keep data-testid stable (never rename/remove): `dashboard-*` prefix, `dashboard-log-entry`, `dashboard-alerts-snapshot`, `dashboard-alerts-armed-count`, `dashboard-alerts-triggered-count`, `dashboard-alerts-view-all`
- No new polling/timers, no config changes, no route changes
- Keep changes component-local; no new global styling

Done when:
- Disabled header CTA shows short explanation + "How to enable"
- Dummy insight is explicitly marked "Preview" or gated
- Alerts snapshot satisfies E2E expectations with clear triggered status
- Empty states include "Next step to mastery" guidance
- Progress cue is visible and uncluttered

Output:
- Touched files list + short change summary (no long explanation).
