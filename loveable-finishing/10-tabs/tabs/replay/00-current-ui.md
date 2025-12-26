## Replay — 00 Current UI (as implemented)

### What the user sees

- **Page shell**
  - Page container: `data-testid="replay-page"`.
  - Wrapped in `DashboardShell`:
    - **Title**: “Replay”
    - **Description**: “Historical playback and pattern analytics to stress-test your execution.”
    - Header actions:
      - Toggle button: “View dashboard” / “View player”
      - “Journal” button (navigates to `/journal`)

- **Two top-level view modes**
  - **Player mode** (default when visiting `/replay/:sessionId`, otherwise default is dashboard)
  - **Dashboard mode** (pattern analytics)

- **Player mode UI**
  - A banner: `data-testid="replay-mode-banner"` describing replay mode and “Go live”.
  - Controls strip card:
    - Timeframe pills (`FilterPills`): `15m`, `1h`, `4h`, `1d`
    - Actions:
      - “Refresh data” (calls `useOhlcData().refresh()`)
      - “Go live” button: `data-testid="button-go-live"` (disabled if no candles)
      - “Open live chart” (navigates to chart URL for the asset/timeframe)
      - A small mode pill showing `replay` / `live`
    - Status line (text-only):
      - “Using cached data” when stale
      - “No candles yet”
      - Error text when status is error
  - Main content area:
    - If loading a session (and no session loaded): `StateView` loading (“Loading replay session…”)
    - If session exists:
      - A 2-column layout:
        - **Left: Chart View**
          - A lazily-loaded `AdvancedChart` in “replay” mode with:
            - Candles from `useOhlcData`
            - Indicators from `useIndicators`
            - Annotations merged from journal entries + alerts for the current symbol
            - Clickable annotations (jump to that candle index)
            - Chart callbacks to create:
              - a journal draft from chart point
              - an alert draft from chart point
          - Frame counter text: “Frame X / Y” (when candles exist)
          - No-data helper copy when `no-data`
        - **Right: ReplayPlayer**
          - Shows session title, timeline scrubber, play/pause, speed controls, bookmark tools, session info.
    - If no session selected:
      - Empty `StateView` with CTA “View dashboard”

- **Dashboard mode UI**
  - A single card that renders:
    - `PatternDashboard` when `patternStats` exists
    - Otherwise an empty `StateView` (“No data yet”)
  - Dashboard mode loads entries and computes pattern stats (journal history).

### States

- **OHL C data states**
  - `useOhlcData` drives: loading/stale/no-data/error plus lastUpdatedAt/source metadata passed to the chart.

- **Replay engine states**
  - `isPlaying` boolean drives playback loop.
  - `currentFrame` resets to 0 when candles disappear; wraps to 0 if beyond length.
  - “Go live” sets mode to `live` and jumps to latest candle.

- **Session selection**
  - If `sessionId` is present in route params, the page attempts to load it from `ReplayService`.
  - If not found, the view mode falls back to dashboard.

- **Reward/telemetry**
  - Chart replay telemetry events are emitted via a lazily-loaded `ChartTelemetryBridge` once ready.

### Primary user interactions

- **Switch view mode**
  - Toggle between player and dashboard.

- **Timeframe**
  - Change timeframe via pills; updates query params for symbol/address/network/timeframe.

- **Playback**
  - Play/Pause
  - Seek/scrub (via `ReplayPlayer`)
  - Change speed
  - Jump to bookmark
  - Add/delete bookmarks

- **Navigation**
  - “Open live chart” navigates to chart URL for the current asset/timeframe.
  - “Journal” button navigates to `/journal`.

- **Create from replay**
  - From `AdvancedChart` callbacks:
    - Create a journal draft from the current point.
    - Create an alert draft from the current point.

### Information scent (obvious vs hidden)

- **Obvious**
  - Replay vs dashboard toggle.
  - “Go live” as a mode switch.
  - “Open live chart” and “Journal” for next steps.

- **Less obvious / conditional**
  - Session existence controls whether the player view shows chart+controls vs an empty state.
  - Annotations come from existing alerts/journal entries matching the symbol.

### Performance touchpoints

- **Heavy rendering**
  - `AdvancedChart` is lazily loaded and renders candles + overlays + annotations.

- **Timers/loops**
  - Playback uses an engine (`OhlcReplayEngine`) that ticks on an interval derived from speed; it is created/stopped in effects and paused on cleanup.

- **Data loading**
  - Dashboard mode loads journal entries and computes stats.
  - Player mode loads session metadata from `ReplayService` and candles from `useOhlcData`.

