# WP-052 Checklist — Right Toolbar (Indicators, Drawings, Alerts)

## Current State Snapshot (before coding)
- Chart toolbar renders static lists for Indicators, Draw tools, Alerts inside `src/features/chart/ChartToolbar.tsx`.
- No expandable/accordion UI; content is always visible.
- No `toolbar-sections.tsx` model file yet.
- Alerts API only provides `getAlertsOverview` in `src/api/alerts.ts` (no list endpoint).
- Chart toolbar is rendered in desktop aside and mobile `RightSheet` via `ChartLayout`.

## Steps
- [x] Step 1 — Toolbar section model
  - Notes: Added section model with placeholder panels and icons for indicators/drawings/alerts.
  - Files touched: src/features/chart/toolbar-sections.tsx
- [x] Step 2 — Expandable UI in ChartToolbar
  - Notes: Implemented accordion-style triggers with aria-expanded regions using toolbar section model.
  - Files touched: src/features/chart/ChartToolbar.tsx
- [x] Step 3 — Alerts entry point wiring
  - Notes: Added alerts list API mock + lazy fetch and create/open actions inside toolbar; added unit coverage for toolbar sections.
  - Files touched: src/api/alerts.ts, src/features/chart/toolbar-sections.tsx, tests/components/chart/ChartToolbar.test.tsx
- [x] Step 4 — Styling + docs
  - Notes: Added tokenized toolbar styles and documented WP-052 in docs changelog/index.
  - Files touched: src/features/chart/chart.css, docs/CHANGELOG.md, docs/index.md
- [x] Step 5 — Finalize checklist
  - Notes: Recorded AC + verification outcomes (E2E blocked by missing Playwright browsers).
  - Files touched: WP-Polish/WP-052/checklist.md

## Acceptance Criteria
- [x] Indicators section UI present
- [x] Drawings section UI present
- [x] Alerts manager entry point exists
- [x] Works with mock data

## Verification
- [x] pnpm typecheck
- [x] pnpm lint (warns on pre-existing lint warnings)
- [x] pnpm vitest run --reporter=basic
- [x] pnpm build (warns on missing MORALIS_API_KEY)
- [x] pnpm run check:size (warns on optional chunk patterns)
- [ ] pnpm test:e2e (blocked: Playwright browsers missing; requires `pnpm exec playwright install`)
