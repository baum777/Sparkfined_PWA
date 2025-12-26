## Dashboard — 01 Polish Suggestions (approved)

### Approved changes

1) **Disabled “Log entry” becomes self-explanatory**
   - Add an inline hint near the disabled CTA and a “How to enable” affordance (no navigation surprises).

2) **Dummy insight is clearly labeled (or hidden until real intel exists)**
   - Prevent “fake data” confusion by marking it as “Preview” or gating it behind real data availability.

3) **Alerts snapshot: clearer actions + stronger triggered cue**
   - Reduce competing CTAs and make “Triggered” status more salient.

4) **Empty states add “Next step to mastery” microcopy**
   - Nudge users toward the next highest-value action (Chart session → Journal entry) using the “degen → mastery” framing.

### Rationale (conversion/usability first)

- **(1)** Reduces frustration on a primary CTA by explaining the requirement and next step.
- **(2)** Increases trust by avoiding misleading “AI insight” content.
- **(3)** Improves decision clarity and urgency handling (triggered alerts) with fewer action choices.
- **(4)** Improves activation by making the next action obvious and narrative-consistent.

### Risks

- **E2E stability**: keep existing `data-testid` attributes intact (Dashboard + Alerts E2E rely on them).
- **Navigation expectations**: “How to enable” must not unexpectedly jump users to unrelated screens.
- **Copy-only drift**: avoid renaming UI labels used as selectors in tests (prefer `data-testid`).

### Acceptance criteria (testable)

- **(1)** When `data-testid="dashboard-log-entry"` is disabled, the UI shows a short explanatory hint and an obvious “How to enable” affordance; no console errors.
- **(2)** The “SOL Daily Bias” teaser cannot be mistaken as real intel (explicit “Preview” label) OR it is not rendered until real intel exists; no layout jump.
- **(3)** Alerts snapshot presents a single primary action and a clear triggered emphasis; `dashboard-alerts-armed-count`, `dashboard-alerts-triggered-count`, and `dashboard-alerts-view-all` remain present and functional.
- **(4)** Empty states include a one-line “Next step to mastery” guidance aligned to the existing CTA target (Chart/Journal), without adding new routes or flows.

### Affected paths (strict, from cluster map)

- root/src/pages/ | DashboardPage.tsx
- root/src/components/dashboard/* (Insight teaser + snapshots + overlay panel)
- root/src/features/dashboard/* (FAB/menu + dashboard styling)
- root/tests/e2e/* (only if selectors or flows must be updated; prefer no changes)

