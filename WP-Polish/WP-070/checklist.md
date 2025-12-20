# WP-070 — Alerts Desktop Layout (Top-Bar, Filters, List)

## Current state snapshot (pre-work)
- Alerts route renders legacy dashboard shell with AlertsLayout, list, and detail panel (`src/pages/AlertsPage.tsx`).
- Existing alerts UI relies on `DashboardShell` and multiple `src/components/alerts/*` components.
- Typed alerts API with mock fallback exists at `src/api/alerts.ts`.
- App shell with Sidebar/TopBar is already mounted in `src/components/layout/AppShell.tsx`.
- No `src/features/alerts/` feature scaffold exists yet for the new layout.

## File targets
- CREATE `src/features/alerts/AlertsPage.tsx`
- CREATE `src/features/alerts/alerts.css`
- CREATE `src/features/alerts/FiltersBar.tsx`
- MODIFY `src/pages/AlertsPage.tsx`
- MODIFY `docs/CHANGELOG.md`
- MODIFY `docs/index.md`

## Steps
- [x] Step 1 — alerts.css + layout skeleton
  - Change note: added tokenized layout primitives and list styles for Alerts desktop scaffold.
  - Files touched: `src/features/alerts/alerts.css`
- [x] Step 2 — FiltersBar scaffold (UI only)
  - Change note: added accessible status/type/search controls with local UI state and focus rings.
  - Files touched: `src/features/alerts/FiltersBar.tsx`
- [x] Step 3 — AlertsPage list scaffold (mock-backed)
  - Change note: added alerts page scaffold with header, filters mount, mock-backed list, and loading/empty/error states.
  - Files touched: `src/features/alerts/AlertsPage.tsx`
- [x] Step 4 — Route wiring
  - Change note: wired /alerts route to render the new feature AlertsPage component.
  - Files touched: `src/pages/AlertsPage.tsx`
- [x] Step 5 — Docs + checklist
  - Change note: documented WP-070 in docs index/changelog and finalized checklist with AC + verification status.
  - Files touched: `docs/CHANGELOG.md`, `docs/index.md`, `WP-Polish/WP-070/checklist.md`

## Acceptance criteria mapping
- [x] Desktop layout: filters + list
- [x] Tokens only

## Verification
- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm vitest run --reporter=basic`
- [x] `pnpm build`
- [x] `pnpm run check:size`
- [ ] `pnpm test:e2e` (only if browsers installed)

Notes:
- `pnpm test:e2e` failed locally with multiple Playwright spec failures after the alerts layout swap.
