# WP-050 Checklist — Chart Foundation (Layout, Sidebar, TopBar, Toolbar, Bottom Panel)

## Snapshot
- Date: 2026-01-08
- WP: WP-050 (Cluster D)
- Scope: Chart page shell layout + UI scaffolding with tokenized styles
- Current state: `/chart` and `/chart-v2` now render the shell layout from `src/features/chart/ChartLayout.tsx` to keep vendor charts out of the initial route.
- Current state: Chart layout components live under `src/features/chart/` and are styled with tokenized layout primitives in `src/features/chart/chart.css`.
- Current state: Overlay primitives for mobile sheets are wired for sidebar/toolbar (`src/components/ui/RightSheet.tsx`, `src/shared/components/BottomSheet.tsx`).

## File targets
- CREATE  src/features/chart/ChartLayout.tsx
- CREATE  src/features/chart/ChartSidebar.tsx
- CREATE  src/features/chart/ChartTopBar.tsx
- CREATE  src/features/chart/ChartToolbar.tsx
- CREATE  src/features/chart/ChartBottomPanel.tsx
- CREATE  src/features/chart/chart.css
- MODIFY  src/pages/ChartPage.tsx

## Steps
1. Step 1 — chart.css + layout primitives — DONE (added chart layout/token classes and responsive visibility helpers) — Files: src/features/chart/chart.css
2. Step 2 — ChartLayout skeleton — DONE (added layout shell with placeholder topbar, side areas, main placeholder, bottom panel shell) — Files: src/features/chart/ChartLayout.tsx
3. Step 3 — ChartTopBar (UI only) — DONE (added timeframe toggle + action buttons with aria labels) — Files: src/features/chart/ChartTopBar.tsx, src/features/chart/ChartLayout.tsx
4. Step 4 — ChartSidebar + ChartToolbar (desktop + mobile triggers) — DONE (desktop columns + BottomSheet/RightSheet mobile drawers wired to topbar triggers) — Files: src/features/chart/ChartSidebar.tsx, src/features/chart/ChartToolbar.tsx, src/features/chart/ChartLayout.tsx
5. Step 5 — ChartBottomPanel (collapsible + tabs placeholders) — DONE (collapsible panel with Grok Pulse/Journal Notes tabs + placeholders) — Files: src/features/chart/ChartBottomPanel.tsx, src/features/chart/ChartLayout.tsx
6. Step 6 — Wire into /chart route — DONE (ChartPage now mounts ChartLayout to keep vendor charts out of the route) — Files: src/pages/ChartPage.tsx
7. Step 7 — Docs + checklist — DONE (docs/index + docs/CHANGELOG updated)

## Acceptance criteria mapping
- Chart page renders full-height without overflow bugs — DONE (shell uses 100% height + overflow guards in `chart.css`)
- Desktop layout shows 3 columns — DONE (sidebar + main + toolbar grid at ≥1024px)
- Mobile collapses side areas into sheets — DONE (BottomSheet + RightSheet triggers in TopBar)
- Tokens only — DONE (layout colors/spacing use CSS variables)

## Verification
- pnpm typecheck — PENDING
- pnpm lint — PENDING
- pnpm test — PENDING
- pnpm test:e2e — PENDING (only if Playwright browsers installed)

## Notes
- Ensure chart placeholder remains lightweight to keep vendor chart bundles off the initial /chart route.
