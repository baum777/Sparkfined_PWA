# WP-056 Checklist — Mobile Chart UX (Bottom Sheet + Floating Buttons)

## Current state snapshot (pre-check)
- Spec location: `tasks/WP-polish/UI_&_UX_polish.md` (Cluster D, WP-056).
- Mobile chart triggers: `src/features/chart/ChartTopBar.tsx` renders mobile action buttons for sidebar/tools; `src/features/chart/ChartSidebar.tsx` uses `BottomSheet`, and `src/features/chart/ChartToolbar.tsx` uses `RightSheet`.
- Safe-area variables: `src/features/shell/bottom-nav.css` defines `--sf-bottom-nav-height` and `--sf-bottom-nav-safe-area` for mobile padding.

## Steps
- [x] Step 1 — MobileChartControls component.
- [x] Step 2 — Wire MobileChartControls into ChartLayout (mobile only).
- [x] Step 3 — Safe-area + overlap fixes.
- [x] Step 4 — Docs + checklist finalization.

## Acceptance criteria mapping
- [x] Mobile tool access via sheet + floating controls.
- [x] No overlap with bottom nav safe area.

## Verification
- [x] `pnpm typecheck`
- [x] `pnpm lint` (warnings pre-existing in repo)
- [x] `pnpm test` (watch mode; exited after run)
- [x] `pnpm vitest run --reporter=basic`
- [x] `pnpm build`
- [x] `pnpm run check:size` (warnings for optional patterns)
- [ ] `pnpm test:e2e` (failed: Playwright browsers missing)

## Change log
- Step 1 notes: Added `MobileChartControls` component with floating buttons for sidebar/tools (optional replay). Files: `src/features/chart/MobileChartControls.tsx`, `WP-Polish/WP-056/checklist.md`.
- Step 2 notes: Mounted `MobileChartControls` behind a mobile media query and wired callbacks in `ChartLayout`. Files: `src/features/chart/ChartLayout.tsx`, `WP-Polish/WP-056/checklist.md`.
- Step 3 notes: Added floating control styles, mobile padding, topbar action suppression for <768px, and unit coverage for mobile controls. Files: `src/features/chart/chart.css`, `tests/components/chart/MobileChartControls.test.tsx`, `WP-Polish/WP-056/checklist.md`.
- Step 4 notes: Updated docs index/changelog and finalized checklist verification. Files: `docs/CHANGELOG.md`, `docs/index.md`, `WP-Polish/WP-056/checklist.md`.
