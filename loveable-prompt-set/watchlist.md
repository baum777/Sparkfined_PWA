---
TAB: Watchlist
Allowed paths (strict):
- root/src/pages/WatchlistPage.tsx
- root/src/components/watchlist/*
- root/src/store/watchlistStore.ts

Goal (conversion first):
Stabilize and polish Watchlist to guide users through "Discover → Add → Track → Analyze" with clear CTA hierarchy, readable trend indicators, and URL selection persistence.

Do:
1) IF you find instability/a11y gaps blocking polish: fix obvious issues (focus states, button labels, semantics) where needed.
2) Apply these approved polish changes (minimal diff):
   - Make "Analyze in Chart" the primary CTA in detail panel; keep Replay secondary
   - Replace/augment trend dot with compact "Trend" pill and include relevance % when available
   - Persist selected symbol in URL query params and preselect on load
   - Improve empty state guidance to "Discover → Add → Track" (degen → mastery activation)
   - Add small "Next step to mastery" line in detail panel after selection (e.g., "Open Chart → Mark levels → Log in Journal"), no new actions/routes

Guardrails:
- Keep data-testid stable (never rename/remove): `watchlist-*`, `button-open-chart`, `button-open-replay-from-watchlist`
- Avoid URL/state infinite loops; update query params only when selection changes
- No changes to quote fetching behavior
- No new network calls or timers

Done when:
- Detail panel has obvious primary CTA ("Analyze in Chart"), Replay remains available
- Trend rows show compact readable indicator and relevance % when present
- URL sync works: selecting row updates query param, loading with param preselects row
- Empty state copy points to Discover/Add, remains compact
- Mastery cue improves clarity without clutter

Output:
- Touched files list + short change summary (no long explanation).
