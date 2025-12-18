# WP-011 Checklist

## Current state snapshot
- DashboardPage uses `DashboardShell` with an inline `DashboardKpiStrip` prop fed by journal/alerts-derived KPIs; KPI strip uses card-glass styling and sits inside the page header container.
- `dashboard.css` defines new WP-010 primitives (stack/grid helpers, card styling, typography utilities, horizontal scroll helper) for dashboard layouts.
- `DashboardKpiStrip` renders up to four KPI cards with trend badges using `DataFreshness`, relying on `dashboard-horizontal-scroll` for responsive scrolling.
- TopBar is already sticky at the shell level (`top: 0` with 60px height) but no dedicated dashboard-specific KPI bar exists yet.

## File targets
- [x] src/features/dashboard/KPIBar.tsx — created with KPI model scaffolding.
- [x] src/features/dashboard/KPICard.tsx — scaffolded card component using KPI model.
- [x] src/features/dashboard/kpi.css — initial structure placeholders.

## Implementation steps
- [x] Step 1 — KPI data + component contracts — Added KPIItem/KPIDelta types, KPIBar skeleton, and KPICard placeholder wiring. Files: src/features/dashboard/KPIBar.tsx, src/features/dashboard/KPICard.tsx, src/features/dashboard/kpi.css.
- [x] Step 2 — KPICard UI + tokenized styles — Built accessible KPICard markup with delta indicators, tokenized styling, and card hover/focus affordances. Files: src/features/dashboard/KPICard.tsx, src/features/dashboard/kpi.css.
- [x] Step 3 — Sticky + responsive behavior — Added sticky KPI bar positioning with offset variable plus mobile scroll-snap and desktop grid layout. Files: src/features/dashboard/kpi.css.
- [x] Step 4 — Wire into DashboardPage + states — Connected KPIBar with five placeholder-friendly KPIs, new icons, and trend wiring on the dashboard page. Files: src/pages/DashboardPage.tsx, src/features/dashboard/KPIBar.tsx.
- [x] Step 5 — Docs — Updated docs changelog and index with WP-011 hero KPI bar entry and artifact link. Files: docs/CHANGELOG.md, docs/index.md.

## Acceptance criteria
- [x] 4–5 KPI cards render — KPIBar now supplies five placeholder-friendly KPIs on DashboardPage.
- [x] Sticky behavior works (desktop) — kpi rail uses offset variable and sticky positioning under the TopBar.
- [x] Mobile horizontal scroll works — KPI track enables snap scrolling with safe-area padding.
- [x] Tokens only (no hard-coded colors) — styling relies on `--sf-*` tokens and shared dashboard/ui utilities.

## Verification
- [x] pnpm typecheck — passed.
- [x] pnpm lint — ran with existing repo warnings (no new errors introduced).
- [x] pnpm test — all Vitest suites passed.
- [ ] pnpm test:e2e — fails across alerts/watchlist/accessibility suites in current env; see run log.
