# WP-003 — Desktop Navigation Sidebar (Rail)

## Current state snapshot
- NAV_ITEMS already list Dashboard, Journal, Chart, Watchlist, Alerts with aliases; settings is exported separately as SETTINGS_NAV_ITEM.
- AppShell uses the legacy `Rail` component with expandable labels and no pinned settings block; mobile BottomNav from WP-001 is active and hidden at `md`+.
- Theme tokens from `src/styles/theme.css` and utilities in `src/styles/ui.css` are globally imported via `src/App.tsx`.
- Shell layout still relies on the legacy `.sf-shell` grid with an action panel column and topbar row.
- No dedicated WP checklist exists yet for WP-003; WP-001 and WP-002 artifacts are already tracked.

## Acceptance criteria
- [x] Visible on ≥768px, hidden on <768px (Sidebar rail inherits the existing shell hide rule under 768px while BottomNav stays mobile-only).
- [x] Correct ordering + routing (NAV_ITEMS order is reused directly in the Sidebar for desktop links).
- [x] Settings icon is separate at bottom (pinned settings block with its own section at the rail footer).
- [x] Active item visible (active state renders primary-accent highlight and focus ring using theme tokens).
- [x] No hard-coded colors (all rail styles consume `--sf-*` variables; no hex/rgba literals added).

## File targets
- [x] CREATE  src/features/shell/Sidebar.tsx
- [x] CREATE  src/features/shell/sidebar.css
- [ ] MODIFY  src/layouts/MainLayout.tsx (N/A; repo uses AppShell instead)
- [x] MODIFY  src/components/layout/AppShell.tsx
- [ ] MODIFY  src/config/navigation.ts

## Implementation steps
- [x] Confirm desktop ordering from `src/config/navigation.ts` and reuse NAV_ITEMS/SETTINGS_NAV_ITEM without duplication.
  - Note: NAV_ITEMS already matched the required desktop order; Sidebar consumes NAV_ITEMS and SETTINGS_NAV_ITEM directly for routing/aliases without adding new sources (`src/features/shell/Sidebar.tsx`).
- [x] Build Sidebar rail component (64–80px), column of icons, settings block pinned at bottom, with hover/focus tooltips for the collapsed rail.
  - Note: Added a compact nav rail with primary items and a pinned settings link plus tooltip content for hover/focus (`src/features/shell/Sidebar.tsx`).
- [x] Style active/hover states with `--sf-*` tokens (no hard-coded colors) and ensure touch targets ≥44px.
  - Note: Sidebar rail styles use theme tokens for background, borders, focus ring, and active accent while keeping 64–78px width and 64px targets (`src/features/shell/sidebar.css`).
- [x] Wire Sidebar into the shell integration point (AppShell) for ≥768px only; keep mobile BottomNav unchanged.
  - Note: Replaced the legacy Rail with the new Sidebar while preserving action panel + BottomNav wiring in AppShell (`src/components/layout/AppShell.tsx`).
- [x] Update docs and record verification commands.
  - Note: Added docs/index.md and docs/CHANGELOG.md entries for WP-003 plus recorded typecheck/lint/test runs and e2e browser gap (docs/index.md, docs/CHANGELOG.md).

## Verification checklist
- [x] pnpm typecheck
- [x] pnpm lint (pre-existing warnings in untouched files)
- [x] pnpm test or pnpm vitest run
- [ ] pnpm test:e2e (blocked: Playwright browsers missing; see log)
