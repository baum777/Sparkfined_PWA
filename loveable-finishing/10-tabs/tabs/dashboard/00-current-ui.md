## Dashboard — 00 Current UI (as implemented)

### What the user sees

- **Page shell**
  - Page container: `data-testid="dashboard-page"`.
  - Header via `DashboardShell`:
    - **Title**: “Dashboard”
    - **Description**: “Command surface for your net risk, streaks, and live intelligence.”
    - **Meta**: “{journalEntries.length} journal entries · {alerts.length} alerts”
    - **Header action button**: “Log entry” (`data-testid="dashboard-log-entry"`)
  - **KPI strip** directly under header:
    - KPI bar container: `data-testid="dashboard-kpi-bar"`
    - Displays 5 KPI tiles/cards:
      - Net P&L
      - Win Rate (30d window)
      - Alerts Armed
      - Journal Streak
      - Trade Inbox

- **Main content stack (top → bottom)**
  - **Daily Bias card** (“Market Intel · Daily Bias”)
    - Shows bias tag + source + “As of …” timestamp + bullet insights.
    - Includes “Refresh” button(s) and a “View analysis” link.
  - **Two-column grid on desktop** (single column on smaller screens):
    - **Primary column**
      - (When user has journal data) “SOL Daily Bias” teaser card (dummy insight) with:
        - Badges (Long/Short/Neutral + Confidence)
        - Bullet summary
        - Buttons: “View full analysis”, “Open chart”
      - **Holdings + Trade Log split**:
        - Holdings card (“Wallet · Holdings”)
        - Trade Log card (“Trade Log · Recent trades”) with “Log entry” button in-card (`data-testid="trade-log-action"`)
    - **Secondary column**
      - Journal snapshot widget: `data-testid="dashboard-journal-snapshot"`
      - Alerts snapshot widget: `data-testid="dashboard-alerts-snapshot"`
        - Header shows counts:
          - Armed count: `data-testid="dashboard-alerts-armed-count"`
          - Triggered count: `data-testid="dashboard-alerts-triggered-count"`
        - Rows: `data-testid="dashboard-alert-row"`
        - Footer actions:
          - “View all”: `data-testid="dashboard-alerts-view-all"`
          - “New alert”: `data-testid="dashboard-alerts-new"`
  - **Bottom sections (two-column grid)**
    - Recent entries section: `data-testid="dashboard-recent-entries"` (links into Journal).
    - Alerts overview widget: `data-testid="dashboard-alerts-overview"` (stats: Armed/Triggered/Paused).

- **Floating action button (FAB)**
  - Persistent “Quick actions” button (plus icon), toggles a small menu.
  - Menu items (when open):
    - “Log entry” (`data-testid="fab-log-entry"`)
    - “Create alert” (`data-testid="fab-create-alert"`)

### States

- **Page-level loading**
  - Skeleton-based layout placeholders for the dashboard grid and cards.
  - `DailyBiasCard` also has its own loading skeleton.

- **Page-level error**
  - Shows `ErrorBanner` + an error `StateView` (“Unable to load dashboard” + “Retry sync”).

- **Empty data (no journal entries)**
  - Main area swaps the top hero insight for empty `StateView` panels:
    - “No insights yet” with CTA “Open chart”
    - “No journal entries” with CTA “Open journal”
  - Holdings + trade log split is still shown.
  - Alerts snapshot still renders (likely empty state if no alerts).

- **Daily Bias card states**
  - Loading / Error (“Bias unavailable” + Retry) / Empty (“No insights yet”) / Success (bias + bullets).

- **Holdings card states**
  - Wallet not connected: “Connect wallet” CTA (navigates to Settings monitoring anchor).
  - Loading skeleton rows.
  - Error with retry.
  - Empty holdings.
  - Success table: clickable rows navigate to Watchlist with query param.

- **Trade log card states**
  - Loading skeleton list (`data-testid="trade-log-loading"`).
  - Error state (`data-testid="trade-log-error"`) with Retry.
  - Empty state (`data-testid="trade-log-empty"`).
  - Success list (`data-testid="trade-log-list"`) + optional “Load more” (`data-testid="trade-log-load-more"`).

- **Log entry overlay panel (drawer)**
  - Opened by header “Log entry” button or Trade Log “Log entry” button or FAB menu item.
  - Loading list: `data-testid="log-entry-overlay-loading"`.
  - Empty list: `data-testid="log-entry-overlay-empty"`.
  - List: `data-testid="log-entry-overlay-list"`, each item has “Journal this Trade” button.

- **Create alert dialog**
  - Opened via FAB menu “Create alert” (and possibly other paths).
  - While loading, a centered modal-like skeleton is shown.

### Primary user interactions

- **Navigation**
  - “View analysis” / “View full analysis” navigates to `/analysis` (route redirects to `/chart`).
  - “Open chart” navigates to `/chart`.
  - Journal snapshot and Recent entries link to `/journal` (some links may include `/journal/<id>`).
  - Alerts snapshot “View all” and “New alert” navigate to `/alerts`; clicking an alert row navigates to `/alerts?alert=<id>`.
  - Holdings row click navigates to `/watchlist?asset=<symbol>`.

- **Dashboard actions**
  - Header “Log entry” button opens “Log entry inbox” overlay; it is **disabled unless a BUY signal is detected** (tooltip/title explains).
  - Inside overlay, selecting “Journal this Trade”:
    - sets trade context (bridge store)
    - closes overlay
    - navigates to `/journal`

- **FAB**
  - Click toggles open/close.
  - Menu closes on outside pointer down or Escape.
  - Focus jumps to first item when opened.

### Information scent (obvious vs hidden)

- **Obvious**
  - KPI strip as the “at-a-glance” command surface.
  - Daily Bias labeled “Market Intel” with “View analysis”.
  - Alerts and Journal snapshots clearly titled with direct CTAs.

- **Less obvious / conditional**
  - “Log entry” is conditional (enabled only when BUY signal detected).
  - Trade event inbox concept is introduced only once overlay opens (“Unjournaled BUY trades”).

### Performance touchpoints

- **Suspense/lazy loading**
  - Many widgets are `React.lazy()` loaded with skeleton fallbacks: holdings, trade log, snapshots, insight teaser, recent entries, alerts overview, FAB menu, overlay panel, alert create dialog.

- **Data fetch and rendering**
  - Page loads trades from IndexedDB (`getAllTrades`) and uses that count in KPIs.
  - `DailyBiasCard` fetches market intelligence and can be refreshed (network).
  - Trade log and recent entries fetch via API calls and support retries; trade log can increase list size (“Load more”).
  - Holdings can include per-row token icons with `loading="lazy"`.

