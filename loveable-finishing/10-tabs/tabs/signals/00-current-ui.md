## Signals — 00 Current UI (as implemented)

### What the user sees

- **Page shell**
  - Page container: `data-testid="signals-page"`.
  - Wrapped in `DashboardShell`:
    - **Title**: “Signals”
    - **Description**: “Live AI and rule-based setups ready for review.”
    - **Meta**: “{filteredSignals.length} signals · {minConfidence%} min confidence”
    - Header “actions” shows “{filteredSignals.length} matching”.

- **Stats tiles (top)**
  - A 2×? responsive grid of 4 tiles:
    - Total
    - High confidence
    - Long
    - Short
  - Values are derived from the currently filtered signals list (pattern + min confidence).

- **Main split section**
  - Left: **Filters card**
    - Pattern filter buttons (All + several patterns like momentum/breakout/reversal/etc.)
    - Confidence slider (`input type="range"`, 0–1 step 0.05) with label showing current %.
  - Right: **Signals list card**
    - Loading: `StateView` “Loading signals...”
    - Error: `StateView` “Failed to load signals”
    - Empty: `StateView` “No signals match your filters” with an icon.
    - Loaded: vertical list of `SignalCard` items (clickable).

- **Signal details modal**
  - When a signal is selected:
    - Full-screen overlay (clicking backdrop closes).
    - Center/bottom sheet container (responsive):
      - Sticky header “Signal Details” with close “✕”
      - Body renders `SignalReviewCard` with:
        - Accept action (currently logs to console)
        - Reject action (currently logs to console)

### States

- **Loading / error / empty** handled in the list card via `StateView`.
- **Selection state**
  - `selectedSignalId` controls whether the modal is open.
  - Closing: click backdrop, click ✕, accept, or reject.

### Primary user interactions

- **Filter**
  - Pattern buttons change which signals are fetched (hook-level pattern filter).
  - Confidence slider filters locally (client-side) by `signal.confidence >= minConfidence`.

- **Select a signal**
  - Click a `SignalCard` to open the modal.

- **Review**
  - Accept/Reject buttons exist in the review card; current implementation logs and closes.

### Information scent (obvious vs hidden)

- **Obvious**
  - Signals count, confidence threshold, and pattern filters.
  - Modal “Signal Details” review step.

- **Less obvious / conditional**
  - Accept/reject outcomes are not persisted (console-only); users may not see any “saved” result.

### Performance touchpoints

- **Data loading**
  - `useSignals()` loads from a legacy signal DB and sorts by timestamp descending.
  - Pattern changes trigger a re-fetch.

- **Client-side filtering**
  - Confidence filtering and stats are computed on the client for the current signals list.

