# WP-051 Checklist — Main Chart Area (Crosshair, Zoom, Markers)

## Snapshot
- Date: 2026-01-09
- WP: WP-051 (Cluster D)
- Scope: Restore live chart canvas with crosshair, zoom/pan, and journal marker overlay.
- Current state: `/chart` and `/chart-v2` render the chart shell layout only (`src/pages/ChartPage.tsx`, `src/features/chart/ChartLayout.tsx`).
- Current state: The main chart slot is a placeholder panel in `ChartLayout` (no engine mounted yet).
- Current state: `AdvancedChart` exists under `src/components/chart/AdvancedChart.tsx` and dynamically imports `lightweight-charts` on mount.
- Current state: Deep links use `/chart-v2?address=...&timeframe=...` via `buildChartUrl` (`src/lib/chartLinks.ts`).

## File targets
- CREATE  src/features/chart/ChartCanvas.tsx
- CREATE  src/features/chart/markers.ts
- MODIFY  src/api/journalEntries.ts (only if needed)
- MODIFY  src/features/chart/ChartLayout.tsx (mount chart canvas)

## Steps
1. Step 1 — Markers model + mock source — DONE (added journal marker types + mapping helper) — Files: src/features/chart/markers.ts
2. Step 2 — ChartCanvas skeleton (no engine import) — DONE (added chart canvas placeholder UI + status messaging) — Files: src/features/chart/ChartCanvas.tsx
3. Step 3 — Restore chart engine behind lazy boundary — DONE (lazy-mount AdvancedChart with live OHLC data hook) — Files: src/features/chart/ChartCanvas.tsx
4. Step 4 — URL param sync (symbol/timeframe) — DONE (sync timeframe state with search params + update URL on change) — Files: src/features/chart/ChartLayout.tsx, src/features/chart/ChartTopBar.tsx
5. Step 5 — Journal markers overlay — DONE (map journal entries to chart annotations + load mock entries when needed) — Files: src/features/chart/ChartCanvas.tsx, src/features/chart/markers.ts
6. Step 6 — Wire ChartCanvas into ChartLayout — DONE (mounted ChartCanvas in main chart slot) — Files: src/features/chart/ChartLayout.tsx
7. Step 7 — Docs + checklist — DONE (docs/index + docs/CHANGELOG updated; checklist finalized)

## Acceptance criteria mapping
- Crosshair visible — DONE (`AdvancedChart` sets CrosshairMode.Normal and is mounted via `ChartCanvas`).
- Zoom/pan works (mouse + touch where possible) — DONE (lightweight-charts defaults via `AdvancedChart`).
- Journal markers render from mocked entries — DONE (`ChartCanvas` loads mock `getRecentJournalEntries` and maps to annotations).

## Verification
- pnpm typecheck — PASS
- pnpm lint — PASS (warnings only; pre-existing)
- pnpm vitest run --reporter=basic — PASS
- pnpm build — PASS (MORALIS_API_KEY missing warning)
- pnpm run check:size — PASS (warnings about optional patterns)
- Network sanity check: /dashboard does NOT request vendor-charts — NOT RUN
- Network sanity check: /chart DOES request vendor-charts after navigation — NOT RUN
- pnpm test:e2e — FAILED (Playwright browsers missing; `pnpm exec playwright install` required)

## Notes
- Keep chart engine behind route-lazy boundary to avoid initial bundle regression.
