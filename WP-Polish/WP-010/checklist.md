# WP-010 Checklist

## Current state snapshot
- Dashboard view is rendered via `src/pages/DashboardPage.tsx` using `DashboardShell` and several dashboard components for KPIs, holdings, trades, and snapshots.
- Theme tokens and utilities already exist in `src/styles/theme.css` and `src/styles/ui.css`, providing `--sf-*` variables and `.sf-card` styles.
- Dashboard components currently rely on Tailwind utility classes and card helper classes (e.g., `card-elevated`, `card-glass`) rather than dashboard-specific CSS.
- No `src/features/dashboard` directory or dashboard-specific CSS file is present yet.

## File targets
- [ ] CREATE `src/features/dashboard/dashboard.css`
- [ ] MODIFY `src/pages/DashboardPage.tsx`
- [ ] (Optional) CREATE `src/features/dashboard/DashboardLayout.tsx` if needed by implementation
- [ ] UPDATE docs in `/docs/` to reflect dashboard layout foundation

## Implementation steps
- [x] Step 1: Define dashboard layout classes in `dashboard.css` (section gaps, card padding, responsive grid helpers) — Created `src/features/dashboard/dashboard.css` with spacing, grid, card surface, hover, and typography utilities.
- [x] Step 2: Apply `.sf-card` surfaces and new layout classes within the dashboard page/layout structure — Wired `DashboardPage` to the new layout utilities and updated dashboard components to accept dashboard card styling (`DashboardPage.tsx`, dashboard component files).
- [x] Step 3: Align typography sizing for titles/section headers/body per spec within dashboard components — Added dashboard typography helpers and applied them to hero/section headers in dashboard cards (InsightTeaser, HoldingsList, TradeLogList, JournalSnapshot, AlertsSnapshot).
- [x] Step 4: Add subtle hover interactions for cards (scale + shadow) using tokens — Tuned `.dashboard-card` hover/focus motion with token-based shadows and transform origin.
- [x] Step 5: Ensure responsive behavior (desktop grid vs. mobile stack/horizontal scroll for KPI or similar elements) — Updated dashboard grids/splits for mobile stacking and connected KPI strip to the horizontal scroll helper.
- [x] Step 6: Documentation update describing the dashboard foundation changes — Added WP-010 notes to `docs/index.md` and recorded the documentation change in `docs/CHANGELOG.md`.

## Acceptance criteria
- [x] Consistent spacing between sections — Dashboard grids/splits now use tokenized gaps via `dashboard.css`.
- [x] Cards use token-based surfaces (no hard-coded colors) — Dashboard cards consume `.dashboard-card`/`.sf-card` with `--sf-*` tokens.
- [x] No hard-coded colors introduced — All new styles rely on theme variables and existing tokenized components.
- [x] Mobile layout remains readable without overflow issues — Mobile defaults to single-column stacks and horizontal KPI scroll helper.

## Verification
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm test:e2e` (note if browsers missing)
