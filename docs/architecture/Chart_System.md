# Chart System Overview (V5)

## Dataflow
1. Providers deliver OHLC candles → cached in Dexie snapshots via `boardDB.charts`.
2. `useOhlcData` pulls from cache first, refreshes network, and exposes status/hasData/viewState.
3. `useIndicators` builds SMA/EMA/BB overlays from returned candles.
4. Annotation mappers convert Journal/Alert/Pulse events to `ChartAnnotation` markers.
5. `AdvancedChart` renders candles, volume, indicators, markers, and creation affordances.
6. `DrawingOverlay` sits above the chart container (devicePixelRatio aware) to render saved drawings from Dexie without user interaction.
7. Pages (`ChartPageV2`, `ReplayPage`) wire URL params, indicator config, deep links, and creation callbacks.

## Persistence (Dexie)
- `boardDB.chart_drawings` — string `id` primary key, compound `[symbol+timeframe]` index; stores `{ symbol, timeframe, type, points, style?, origin, createdAt, updatedAt }`.
- Helpers: `listDrawings(symbol, timeframe)`, `saveDrawing`, `deleteDrawing`, `clearDrawings` (read-only overlay refresh).

## Extending
- **Add an indicator**: update `ChartIndicatorOverlay`/`ComputedIndicator` in `src/domain/chart.ts`, add math in `src/lib/indicators.ts`, thread through `useIndicators` and `AdvancedChart` props.
- **Add an annotation source**: create a mapper in `src/lib/annotations.ts` returning `ChartAnnotation`, merge it in the page-level annotation arrays.
- **Add a deep link**: use `buildChartUrl` / `buildReplayUrl` from `src/lib/chartLinks.ts` with address/timeframe (+ optional range).

## UX Hooks
- Indicator presets & toggles persist per address via `useChartUiStore` (localStorage-backed).
- Chart/Replays expose `onCreateJournalAtPoint` / `onCreateAlertAtPoint` for “create from chart” flows, fed with last candle price/time.
- Stable `data-testid` anchors added for chart/replay, go-live, indicator toggles, creation buttons, and annotation pills to aid E2E scripting.
- V5 onboarding: dismissible intro banner, toolbar tooltips, replay helper copy, and legend to clarify signals/alerts/journal markers.
- Telemetry hooks via `useChartTelemetry` emit typed events for view opens, indicator actions, replay controls, and chart-driven draft creation.
