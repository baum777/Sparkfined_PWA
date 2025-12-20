# WP-075 — Mobile Alerts (Scrollable, Swipe Actions)

## Current state snapshot (pre-coding)
- `src/features/alerts/AlertsPage.tsx` always renders the desktop `AlertCard` list; there is no mobile-specific row/layout for <768px.
- `src/features/alerts/AlertCard.tsx` provides a full-size card layout with pause/delete buttons; no compact mobile row exists.
- `src/features/alerts/alerts.css` has desktop-oriented list styling and no mobile scroll/safe-area adjustments for the alerts list.
- Bottom nav safe-area variables (`--sf-bottom-nav-height`, `--sf-bottom-nav-safe-area`) are defined in `src/features/shell/bottom-nav.css` and applied to `.sf-shell .sf-canvas` on mobile.

## Plan & step log
- [x] Step 1 — Mobile row component
  - Notes: Added a compact MobileAlertRow with a kebab menu for pause/delete actions plus unit coverage.
  - Files touched: `src/features/alerts/MobileAlertRow.tsx`, `src/features/alerts/alerts.css`, `tests/components/alerts/MobileAlertRow.test.tsx`
- [x] Step 2 — Wire mobile rendering
  - Notes: Alerts list now swaps to MobileAlertRow under 768px using a matchMedia hook.
  - Files touched: `src/features/alerts/AlertsPage.tsx`
- [x] Step 3 — Scroll + safe-area UX
  - Notes: Added mobile list scrolling behavior and safe-area bottom padding for the alerts list container.
  - Files touched: `src/features/alerts/alerts.css`
- [x] Step 4 — Optional swipe actions
  - Notes: Swipe actions skipped; actions remain available via the MobileAlertRow kebab menu.
  - Files touched: `WP-Polish/WP-075/checklist.md`
- [x] Step 5 — Docs + checklist
  - Notes: Updated docs index/changelog, captured AC mapping, and recorded verification results.
  - Files touched: `docs/CHANGELOG.md`, `docs/index.md`, `WP-Polish/WP-075/checklist.md`

## Acceptance criteria mapping
- [x] Mobile list scrolls smoothly.
- [x] Swipe actions optional (document if skipped). (Skipped; actions available via kebab menu.)

## Verification
- [x] `pnpm typecheck`
- [x] `pnpm lint` (warnings present in existing files)
- [ ] `pnpm test` (vitest watch mode; cancelled after initial run)
- [x] `pnpm vitest run --reporter=basic`
- [x] `pnpm build`
- [x] `pnpm run check:size` (warnings about missing optional chunks)
- [ ] `pnpm test:e2e` (Playwright browsers missing in environment)
