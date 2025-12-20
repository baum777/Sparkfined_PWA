# WP-055 Checklist — Default Chart & Fallback (SOL/USDC)

## Current state snapshot (pre-check)
- Spec location: `tasks/WP-polish/UI_&_UX_polish.md` (Cluster D, WP-055).
- URL sync model: `src/features/chart/ChartLayout.tsx` resolves symbol/timeframe from `useSearchParams` with defaults and passes the selection into `ChartTopBar` + `ChartCanvas`.
- Chart data fetch: `src/hooks/useOhlcData.ts` loads candles via `fetchTokenCandles` (DexPaprika → Moralis) and caches snapshots in Dexie.
- Chart UI state: `src/features/chart/ChartCanvas.tsx` renders `AdvancedChart` with loading/no-data/error overlays.

## Steps
- [x] Step 1 — Market data client (typed + deterministic mock fallback).
- [x] Step 2 — Default symbol/timeframe resolver (SOL/USDC).
- [x] Step 3 — Wire candles via marketData + add retry UI.
- [x] Step 4 — Docs + checklist finalization.

## Acceptance criteria mapping
- [x] Defaults to SOL/USDC if no symbol chosen.
- [x] Clear empty/error states if data missing.

## Verification
- [x] `pnpm typecheck`
- [x] `pnpm lint` (warnings pre-existing in repo)
- [x] `CI=1 pnpm test` (run mode)
- [x] `pnpm vitest run --reporter=basic`
- [x] `pnpm build`
- [x] `pnpm run check:size`
- [ ] `pnpm test:e2e` (failed: numerous Playwright spec failures; run interrupted)

## Change log
- Step 1 notes: Added typed market data client with deterministic mock candles and tests. Files: `src/api/marketData.ts`, `tests/lib/marketData.test.ts`, `WP-Polish/WP-055/checklist.md`.
- Step 2 notes: Defaulted chart URL resolution to SOL/USDC + timeframe defaults and synced missing params into the URL. Files: `src/features/chart/ChartLayout.tsx`, `src/features/chart/ChartCanvas.tsx`, `WP-Polish/WP-055/checklist.md`.
- Step 3 notes: Routed chart candle fetches through `marketData`, updated `useOhlcData` coverage, and added retry UI for empty/error states. Files: `src/hooks/useOhlcData.ts`, `src/features/chart/ChartCanvas.tsx`, `tests/unit/useOhlcData.test.ts`, `WP-Polish/WP-055/checklist.md`.
- Step 4 notes: Updated docs index/changelog and finalized verification notes. Files: `docs/CHANGELOG.md`, `docs/index.md`, `WP-Polish/WP-055/checklist.md`.
