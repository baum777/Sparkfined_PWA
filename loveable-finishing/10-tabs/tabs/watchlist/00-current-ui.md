## Watchlist — 00 Current UI (as implemented)

### What the user sees

- **Page shell**
  - Page container: `data-testid="watchlist-page"`.
  - Wrapped in `DashboardShell`:
    - **Title**: “Watchlist”
    - **Description/meta**: “{assetCount} assets watched · Track sessions, sentiment and next moves.”
    - Header actions area: `WatchlistHeaderActions` shows:
      - A pill `{assetCount} assets`
      - Status text when loading (“Refreshing prices…”) or when error (“Price data unavailable…”)

- **Top control strip (filters + sort + live badge)**
  - A rounded, glassy panel with:
    - **Session filter** segmented pill buttons:
      - `All`, `London`, `NY`, `Asia`
      - Each is `aria-pressed` and has `data-testid="watchlist-session-filter-<Label>"`
    - **Sort toggle** button cycles label:
      - “Sort: Default” → “Sort: Top Movers” → “Sort: A-Z”
      - `data-testid="watchlist-sort-toggle"`
    - **LiveStatusBadge** (shows label)
  - Optional helper line beneath (only when not loading and no error):
    - “Filter, sort, and drill into price action without leaving your command center.”

- **Main two-column layout (desktop)**
  - A grid with:
    - **Left: table panel**
      - Offline banner (when offline): `data-testid="watchlist-offline-banner"` with a compact offline `StateView`.
      - Error banner (when error): compact error `StateView` with “Retry”.
      - Content state:
        - Loading skeleton table (when loading and no rows yet)
        - Empty state (“No assets yet…”)
        - Otherwise: `WatchlistTable` (`data-testid="watchlist-table"`)
      - Table rows:
        - Row container: `data-testid="watchlist-token-row"`
        - Attributes: `data-symbol`, `data-session`, `data-active`
        - Active row has brand ring/glow styling.
        - Row includes: symbol, name, price, 24h change, session pill.
        - Optional trend dot with `aria-label="Trend present"` when a trend snapshot exists for the symbol.
    - **Right: detail panel**
      - If no selection:
        - Empty panel: `data-testid="watchlist-detail-empty"` (“Select an asset…”)
      - If selected:
        - Detail container: `data-testid="watchlist-detail-panel"`
        - Symbol heading: `data-testid="watchlist-detail-symbol"`
        - “Quick actions” buttons:
          - “Open chart”: `data-testid="button-open-chart"`
          - “Replay”: `data-testid="button-open-replay-from-watchlist"`
        - “Social trend” card:
          - If no trend: copy indicates none yet.
          - If trend present: shows snippet, sentiment label (if known), meta badges (hype/score/CTA/relevance/updated time), and optional “View source tweet” link.

### States

- **Loading**
  - During quote refresh, header shows “Refreshing prices…”.
  - If the watchlist is empty and loading: skeleton table (`SkeletonTable`).
  - Detail side shows a skeleton card when loading and there is no active selection.

- **Empty**
  - When rows length is 0 and not loading:
    - “No assets yet” state with guidance: “Add an instrument from Discover…”

- **Error**
  - When quote fetch fails:
    - Header shows “Price data unavailable…”
    - Left panel shows a compact error `StateView` with “Retry”.
    - Copy indicates last known values are shown.

- **Offline**
  - When offline:
    - Shows offline banner with “Showing last cached prices.”
    - Core UI remains usable (select rows, view detail).

### Primary user interactions

- **Filter by session**
  - Clicking session pills filters the table rows; E2E asserts that all visible rows match the selected session.

- **Sort cycling**
  - Sort button cycles:
    - Default order (store order)
    - Top movers (sort by absolute 24h change)
    - A–Z (symbol ascending)

- **Select a row**
  - Clicking a row sets it as active and loads its detail panel.

- **Open chart**
  - From detail panel: “Open chart” navigates to the chart workspace URL built from the row’s token address and default timeframe.

- **Open replay**
  - From detail panel: “Replay” navigates to replay view with query params including `symbol` and `network`, plus a time window.

- **Retry pricing**
  - When error is present, user can press “Retry” to re-fetch quotes.

### Information scent (obvious vs hidden)

- **Obvious**
  - Session filter + Sort toggle as primary controls.
  - Row selection clearly drives the right-side detail.
  - “Quick actions” suggests a next step (Chart/Replay).

- **Less obvious / conditional**
  - Trend dot presence is subtle and only appears when a trend snapshot exists.
  - Offline mode is explained via banner, but “what still works” is implied rather than spelled out.
  - Watchlist rows are currently seeded/static and then hydrated with live quotes (not obvious to user).

### Performance touchpoints

- **Quote hydration**
  - On mount/when symbol set changes, the page fetches quotes for all symbols and hydrates the store.
  - A guard (`hydratedSymbolsKeyRef`) prevents repeated hydration for the same symbol set.

- **Sorting**
  - Top movers sort computes abs change via `parseFloat(change24h)` per row and sorts a cloned array.

- **Navigation**
  - Chart/Replay URLs are prebuilt from stored token metadata to avoid extra lookups at click time.

