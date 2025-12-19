# WP-053 Checklist — Bottom Panel (Grok Pulse + Journal Notes)

## Current State Snapshot (before coding)
- `ChartBottomPanel` renders placeholder text for Grok Pulse and Journal Notes tabs with a collapse toggle in `src/features/chart/ChartBottomPanel.tsx`.
- Bottom panel styles exist in `src/features/chart/chart.css`, but no Grok Pulse or notes components are implemented.
- Chart layout mounts the bottom panel in `src/features/chart/ChartLayout.tsx`.
- No chart bottom-panel tests exist beyond toolbar coverage in `tests/components/chart/ChartToolbar.test.tsx`.

## Steps
- [x] Step 1 — GrokPulseCard (mock-backed, resilient)
  - Notes: Added GrokPulseCard with typed DTOs, deterministic mock fallback, and loading/error states with refresh; tightened mock picker typing.
  - Files touched: src/features/chart/GrokPulseCard.tsx
- [x] Step 2 — InlineJournalNotes (draft persistence)
  - Notes: Added inline journal notes editor with localStorage draft persistence and saved status metadata.
  - Files touched: src/features/chart/InlineJournalNotes.tsx
- [x] Step 3 — Bottom panel tabs + collapse behavior
  - Notes: Wired tab panels with Grok Pulse + Journal Notes components, preserved collapse behavior, added tokenized styles and unit coverage for notes persistence; updated test assertions to avoid jest-dom matchers.
  - Files touched: src/features/chart/ChartBottomPanel.tsx, src/features/chart/chart.css, tests/components/chart/ChartBottomPanel.test.tsx
- [x] Step 4 — Docs + checklist
  - Notes: Updated docs changelog/index and recorded acceptance criteria + verification results.
  - Files touched: docs/CHANGELOG.md, docs/index.md, WP-Polish/WP-053/checklist.md

## Acceptance Criteria
- [x] Collapsible bottom panel
- [x] Notes editable + persists draft
- [x] Tokens only

## Verification
- [x] pnpm typecheck
- [x] pnpm lint (warns on pre-existing lint warnings)
- [x] pnpm vitest run --reporter=basic
- [x] pnpm build (warns on missing MORALIS_API_KEY)
- [x] pnpm run check:size (warns on optional chunk patterns + missing optional chunks)
- [ ] pnpm test:e2e (failed: Playwright browsers missing; requires `pnpm exec playwright install`)
