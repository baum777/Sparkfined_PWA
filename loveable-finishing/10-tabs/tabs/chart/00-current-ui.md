## Chart — 00 Current UI (as implemented)

### What the user sees

- **Overall surface**
  - A full-height chart workspace (`sf-chart-layout`) with:
    - Sticky top bar
    - Main chart body (sidebar + chart canvas + tools)
    - Bottom “Insight panel”

- **Top bar (sticky)**
  - Left:
    - Title: `<SYMBOL> · <TIMEFRAME>` (defaults to `SOL/USDC · <timeframe>`)
    - Subtitle: “Chart foundation (WP-050)”
    - On medium screens (approx 768–1023): two icon buttons:
      - “Open chart sidebar”
      - “Open chart tools”
  - Right:
    - **Timeframe toggle** (buttons): `15m`, `1h`, `4h`, `1d` (aria-pressed reflects current timeframe)
    - **Replay controls**
      - Replay toggle (aria-pressed)
      - Replay speed buttons (disabled unless replay enabled)
      - Status label when replay enabled
    - **Utility buttons**
      - “Refresh” button (present; no explicit onClick wired in this component)
      - “Export” button (exports a JSON snapshot; shows a short status message in an aria-live region)

- **Mobile quick actions (small screens <768px)**
  - A fixed vertical cluster of pill buttons (“Sidebar”, “Tools”) floating above the bottom nav safe-area.
  - (Replay quick action exists in the component API but is not wired in current `ChartLayout` usage.)

- **Chart body**
  - **Sidebar**
    - Desktop: left sidebar is visible as an aside with placeholder content:
      - “Markets” list (static examples)
      - “Sessions” list (static examples)
    - Mobile/tablet: sidebar opens as a bottom sheet titled “Chart sidebar”.
  - **Main canvas**
    - Container: `data-testid="chart-canvas"`
    - Renders a lazily-loaded `AdvancedChart` with candles + annotations.
    - Shows a “Chart canvas” placeholder during loading or when no data is available.
    - Can display an inline retry strip when status is error/no-data and there are no candles.
  - **Toolbar / tools**
    - Desktop: right “Chart tools” panel (accordion sections).
    - Mobile/tablet: opens as a right sheet titled “Chart tools” with the same content.
    - Sections:
      - Indicators (currently a descriptive list / preset placeholders)
      - Drawings (currently a descriptive list / tool placeholders)
      - Alerts (loads recent alerts when expanded; includes Create/Open actions)

- **Bottom insight panel**
  - Header:
    - Label “Insight panel”
    - Collapse/expand toggle (aria-expanded + sr-only text)
  - Content:
    - Tablist with two tabs: “Grok Pulse”, “Journal Notes”
    - Panels render one at a time:
      - `GrokPulseCard` receives `symbol` + `timeframe` from URL query params
      - `InlineJournalNotes` receives `symbol` + `timeframe` from URL query params

### States

- **URL-initialization**
  - If query params are missing, the chart writes defaults into the URL (replace):
    - `timeframe`
    - `symbol`
    - `address`
    - `network`

- **Chart canvas**
  - Loading: placeholder with “Loading chart…” (or derived message)
  - No data: placeholder message “No data available for this timeframe yet.”
  - Error: placeholder message “Chart unavailable” (or error text)
  - Retry strip appears when error/no-data and there are no candles yet.

- **Alerts panel (in tools)**
  - Idle → Loading → Success/Error (error text indicates “cached data”, even though the UI is fed by the API call result state)
  - Empty: dashed empty box “No alerts yet…”
  - Success: shows up to 4 recent alerts with status chips (Armed/Triggered/Paused)

- **Bottom panel**
  - Collapsed: content is hidden; panel height shrinks.
  - Active tab: only one panel is visible at a time; tab uses `aria-selected`.

### Primary user interactions

- **Change timeframe**
  - Clicking a timeframe button updates the URL `timeframe=<value>` and re-renders the chart for that timeframe.

- **Open tools/sidebar**
  - On small screens:
    - Tap floating “Sidebar” / “Tools” buttons to open corresponding sheets.
  - On medium screens:
    - Use topbar icon buttons to open sidebar/tools.
  - On desktop:
    - Sidebar and tools are visible without sheets.

- **Replay controls**
  - Toggle Replay on/off.
  - Choose a replay speed (only enabled when replay is on).

- **Export**
  - Clicking Export triggers an async snapshot export and reports success/failure via a status label.

- **Bottom insight panel**
  - Collapse/expand.
  - Switch between “Grok Pulse” and “Journal Notes”.

- **Alerts actions (tools → Alerts section)**
  - “Create alert” navigates to `/alerts` with prefilled query parameters derived from the current `symbol` and `timeframe`.
  - “Open alerts” navigates to `/alerts`.

### Information scent (obvious vs hidden)

- **Obvious**
  - Timeframe control and Replay affordance are prominent.
  - Bottom panel clearly labeled “Insight panel” with two explicit tabs.

- **Less obvious / conditional**
  - Default symbol/address/network are injected into the URL (users may not realize why the URL changes).
  - Alerts list only loads after expanding the Alerts tools section (lazy loading).
  - Journal markers/annotations are sourced from recent journal entries in the background.

### Performance touchpoints

- **Heavy rendering**
  - `AdvancedChart` is lazily loaded and likely the most expensive render surface (candles + annotations).

- **Data fetching**
  - Candles are fetched via `useOhlcData` (network; includes status, error, source, lastUpdatedAt).
  - Recent journal entries are fetched to generate chart markers (loads up to 8 and filters by symbol).
  - Alerts are fetched only when the Alerts tools section is first expanded.

- **Avoiding unnecessary work**
  - Query-param initialization uses `replace` and guards against repeated updates.
  - Marker-to-annotation mapping is memoized.

