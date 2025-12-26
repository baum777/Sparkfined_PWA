## Oracle — 00 Current UI (as implemented)

### What the user sees

- **Page shell**
  - Page container: `data-testid="oracle-page"`.
  - Wrapped in `DashboardShell`:
    - **Title**: “Oracle”
    - **Description**: “Daily meta-market intelligence at 09:00 UTC”
    - **Meta**:
      - If report loaded: “<date> · Score <score>/7”
      - Otherwise: “Auto-refreshes daily at 09:00 UTC”
    - Header actions:
      - Refresh button: `data-testid="oracle-refresh-button"`
      - “Mark as read” button (only when report exists and is unread): `data-testid="oracle-mark-read-button"`

- **Reward banner**
  - After marking as read, a glowing banner appears (aria-live) showing a reward message for ~5 seconds.

- **Today report section**
  - Loading state card with `StateView` (“Loading Oracle report...”).
  - Error state card with `StateView` and Retry.
  - Empty state card with `StateView` and “Load report”.
  - When report exists:
    - A 2-column (desktop) summary grid:
      - Left “glass” card (date / score / top theme) and an optional “Read” pill if read.
      - Right status card with:
        - Status: “Logged in journal” (read) or “Awaiting review” (unread)
        - Last sync time label
        - Theme filter summary (current selection)
    - “Full report” card:
      - Title “Full report”
      - A scrollable `<pre>` showing the report text: `data-testid="oracle-pre"`
    - Optional warning card if an error exists while still showing cached report content.

- **History + filtering (only when history exists)**
  - Theme filter card (left): `OracleThemeFilter` (E2E expects `data-testid="oracle-theme-filter"` in the filter UI).
  - History chart (right): `OracleHistoryChart`
  - Past reports list: `OracleHistoryList` (E2E references a “View” button that opens a modal titled “Oracle Report”).

### States

- **Today report**
  - Loading / Error / Empty / Loaded.
  - Loaded can still show a non-blocking warning message if refresh fails but cached data exists.

- **Mark as read**
  - Button is hidden once report is read.
  - While marking: button shows loading state (“Saving”).
  - Reward banner auto-dismisses after 5 seconds.

- **Theme filtering**
  - Selected theme defaults to “All”.
  - Filtered history list/chart update based on selected theme.

### Primary user interactions

- **Refresh**
  - Refresh button triggers `loadTodayReport({ forceRefresh: true })`.

- **Mark as read**
  - Marks today as read via store action; UI updates to show “Read” pill and removes mark button.
  - Triggers a reward banner message (XP + streak).

- **Read report**
  - Users scroll the preformatted report text inside the “Full report” card.

- **Filter history**
  - Use theme filter to narrow chart + list.
  - In history list, “View” opens a report modal (per E2E).

### Information scent (obvious vs hidden)

- **Obvious**
  - Daily cadence (09:00 UTC), Score out of 7, Top theme, and “Mark as read” reward framing.

- **Less obvious / conditional**
  - Rewards include XP/streak and an auto-journal entry (handled by store side effects).
  - High-score notifications exist (score ≥ 6), but are not surfaced in the UI unless browser notifications fire.

### Performance touchpoints

- **Parallel loading**
  - On mount, loads today report + 30-day history concurrently.

- **Timers**
  - Reward banner clears after a 5s timeout.

- **Persistence**
  - Reads/writes to IndexedDB (Dexie) via oracle DB helpers; refresh fetches `/api/oracle`.

