awaiting user confirmation

## Watchlist — 01 Polish Suggestions (approved)

### Approved changes

1) **Detail panel: one primary action**
   - Make “Analyze in Chart” the primary CTA; keep Replay secondary to reduce competing actions.

2) **Trend present becomes legible**
   - Replace/augment the tiny dot with a small “Trend” pill and include relevance % when available.

3) **Persist selection in URL**
   - Store the selected symbol in a query param so selection is shareable and survives reloads.

4) **Empty state guides the habit loop**
   - Improve empty state CTA/copy to guide: “Discover → Add → Track” (degen → mastery activation).

### Rationale (conversion/usability first)

- **(1)** Clarifies the next step (analysis) and increases click-through to the chart workflow.
- **(2)** Makes the trend signal discoverable and actionable (not just decorative).
- **(3)** Improves continuity and shareability (returning users resume where they left off).
- **(4)** Improves activation by making the path to “having a watchlist” explicit.

### Risks

- **URL/state sync loops**: ensure URL updates don’t cause repeated state churn.
- **E2E selectors**: keep existing `data-testid` values stable; update tests only if unavoidable.
- **Visual noise**: trend pill should remain compact and not overwhelm the row layout.

### Acceptance criteria (testable)

- **(1)** Detail panel presents a single primary CTA (“Analyze in Chart”) and a secondary Replay action; both remain functional.
- **(2)** Rows with a trend show a compact “Trend” indicator; relevance % is shown when available; no layout break on small screens.
- **(3)** Selecting a row updates the URL with a stable query param (e.g., `asset=<symbol>`); loading the page with that param preselects the row.
- **(4)** Empty state clearly points users to the next step to populate Watchlist (Discover/Add).

### Affected paths (strict, from cluster map)

- root/src/pages/ | WatchlistPage.tsx
- root/src/components/watchlist/*
- root/src/store/watchlistStore.ts
- root/tests/e2e/ | watchlist-sorting.spec.ts / watchlist/watchlist.flows.spec.ts (only if selectors/flows must change; prefer no changes)
