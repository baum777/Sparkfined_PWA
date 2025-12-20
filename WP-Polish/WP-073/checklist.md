# WP-073 — Filter System (Status, Type, Symbol, Search)

## Current state snapshot (pre-coding)
- Filters bar in `src/features/alerts/FiltersBar.tsx` uses local state only (status/type/search) and does not affect list rendering.
- Alerts list in `src/features/alerts/AlertsPage.tsx` renders full mock-backed list without filtering.
- Alert API DTOs already include `status`, `type`, and `symbol` (`src/api/alerts.ts`).

## Plan & step log
- [x] Step 1 — Pure filtering helpers
  - Notes: Added pure filter state/type definitions and `applyAlertFilters` helper.
  - Files touched: `src/features/alerts/filtering.ts`
- [x] Step 2 — Wire FiltersBar state + debounce
  - Notes: Converted FiltersBar to controlled props and added debounced search updates.
  - Files touched: `src/features/alerts/FiltersBar.tsx`
- [x] Step 3 — Apply filters in AlertsPage
  - Notes: Applied filters to the alerts list and added a filtered empty state message.
  - Files touched: `src/features/alerts/AlertsPage.tsx`
- [x] Step 4 — Tests
  - Notes: Added unit coverage for filtering helpers and debounced search behavior.
  - Files touched: `tests/components/alerts/AlertsFiltering.test.tsx`
- [x] Step 5 — Docs + checklist
  - Notes: Updated docs index/changelog and finalized checklist.
  - Files touched: `docs/CHANGELOG.md`, `docs/index.md`, `WP-Polish/WP-073/checklist.md`

## Acceptance criteria mapping
- [x] Filters update list.
- [x] Search works (debounced).

## Verification
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm test:e2e` (only if browsers installed)
- [ ] `pnpm build`
- [ ] `pnpm run check:size`
