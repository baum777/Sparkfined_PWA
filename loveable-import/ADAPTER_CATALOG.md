# Adapter Catalog (Loveable UI API → Sparkfined Stores/Engines)

## Why
Loveable UI expects hooks and data shapes from loveable/src/features/*.
Sparkfined must keep existing stores/engines.
Adapters provide Loveable-compatible interfaces backed by Sparkfined.

---

## Telemetry Adapter (global)
- Requirement: UI must call Telemetry.log(...) using existing TelemetryService singleton.
- Provide helper:
  - src/lib/telemetry/uiTelemetry.ts
  - export function uiLog(eventName, value, metadata)

---

## Dashboard adapters
- useDashboardStatsAdapter()
  - sources: journalStore (entries), alertsStore (armed/triggered), gamificationStore (streak/xp), wallet monitoring state
  - outputs: KPI values, counts, “log entry disabled reason”

- useHoldingsAdapter()
  - sources: monitored wallet + existing holdings fetch route/component
  - outputs: holdings list + loading/error states

- useLastTradesAdapter()
  - sources: journalStore recent entries/trades
  - outputs: last N items + click handler to journal

---

## Journal adapters
- useTradesStore() (Loveable expected) → wraps useJournalStore()
  - trades = entries
  - addTrade = addEntry
  - updateTrade = updateEntry
  - deleteTrade = deleteEntry
  - derived: hasTrades, lastTrades

- useTemplatesAdapter()
  - wraps Sparkfined templates module (if exists) or existing template section
  - apply modes: overwrite/merge/suggest must remain

- useAiNotesAdapter()
  - wraps existing AI pipeline usage constraints (token lock) but UI should reflect demo/offline/real status

---

## Chart adapters
- useChartLayoutAdapter()
  - must preserve ChartLayout sections contract (TopBar, Sidebar, Toolbar, BottomPanel, Canvas)
  - Replay mode uses existing replay engine; UI toggles must connect

- useReplayAdapter()
  - wraps src/lib/replay/ohlcReplayEngine.ts (protected; do not edit)
  - UI exposes replay on/off, speed, session selection

- useChartTelemetryAdapter()
  - logs defined chart events (types in src/domain/telemetry.ts)

---

## Alerts adapters
- useAlertsAdapter()
  - wraps alertsStore + triggerEngine
  - exposes: list, create, pause, delete, counts armed/triggered
  - logs: create, armed, triggered, template apply, etc.

---

## Settings adapters
- Settings components must wire to existing:
  - userSettings store (appearance/theme/currency/etc.)
  - chart prefs store
  - notifications permissions status
  - connected wallets panel state
  - monitoring state
  - token usage AIStats
  - export/backup controls (JournalDataControls)
  - telemetry flags & diagnostics
  - danger zone actions (namespace clear + factory reset typed confirm)

No replacement of these stores/services; UI reads/writes through them.

---

## Lessons adapters
- useLessonsAdapter()
  - route stays /lessons but label can be "Learn"
  - unlock logic must reflect Sparkfined prerequisites