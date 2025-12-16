# Chart System Overview (V5)

## Dataflow
1. Providers deliver OHLC candles → cached in Dexie snapshots via `boardDB.charts`.
2. `useOhlcData` pulls from cache first, refreshes network, and exposes status/hasData/viewState.
3. `useIndicators` builds SMA/EMA/BB overlays from returned candles.
4. Annotation mappers convert Journal/Alert/Pulse events to `ChartAnnotation` markers.
5. `AdvancedChart` renders candles, volume, indicators, markers, and creation affordances.
6. `DrawingOverlay` sits above the chart container (devicePixelRatio aware) to render saved drawings from Dexie; it now also drives drawing lifecycle: view/select toggles, DPR-correct create previews, ESC cancel, move/resize handles on the selected drawing only, and Dexie commits on pointer-up/second click.
7. Pages (`ChartPageV2`, `ReplayPage`) wire URL params, indicator config, deep links, creation callbacks, and drawing interaction mode (view/select/create-line/create-box/create-fib/create-channel toggle) plus delete/undo/redo controls.

## Persistence (Dexie)
- `boardDB.chart_drawings` — string `id` primary key, compound `[symbol+timeframe]` index; stores `{ symbol, timeframe, type, points, style?, origin, createdAt, updatedAt }`.
- Helpers: `listDrawings(symbol, timeframe)`, `saveDrawing`, `deleteDrawing`, `clearDrawings` (read-only overlay refresh).

## Drawings lifecycle (CH-TA-3)
- Creation: chart toolbar exposes Line/Box create modes; first click anchors a draft, pointermove previews the second point, second click commits to Dexie. ESC cancels and returns to view.
- Editing: selection is required; pointer-down on handles resizes, body/line drag moves. Updates are RAF-scheduled and only persisted on pointer-up to avoid drift.
- Deletion: Delete key or toolbar action removes the selected drawing, clears selection, and re-syncs Dexie for the current symbol/timeframe.
- Undo/Redo: in-memory stack (20 steps) mirrors Dexie via `clearDrawings` + `saveDrawing` per commit (create/move/resize/delete). Keyboard shortcuts: `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`.

## Drawings lifecycle (CH-TA-4)
- Fib Retracements: toolbar “Fib” tool enters create mode (two clicks). Draft previews all configured levels (defaults: 0, 0.236, 0.382, 0.5, 0.618, 0.786, 1) using anchor price difference. Handles edit both anchors; body drag moves the whole fib. Undo/redo persists updated levels and anchors.
- Parallel Channels: toolbar “Channel” tool enters a three-click flow (baseline A→B, offset C). Preview shows baseline after click 2 and full channel fill/lines on move before click 3. Handles edit all three anchors; area or line click drags the channel. Fill opacity comes from drawing style (defaults to subtle accent fill).
- Hit-testing: DPR-aware tolerance now covers fib level lines, channel boundaries, and channel area. Selection is still single-select with highlight and handle rendering.

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
