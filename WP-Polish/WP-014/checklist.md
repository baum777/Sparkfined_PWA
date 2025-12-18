# WP-014 — Recent Trades (Trade Log Card)

## Current state snapshot
- Dashboard currently renders `TradeLogList` (`src/components/dashboard/TradeLogList.tsx`) fed from `getAllTrades`/Dexie and opens `LogEntryOverlayPanel` when "Mark entry" or header action is clicked.
- Existing log entry overlay lives at `src/components/dashboard/LogEntryOverlayPanel.tsx` and routes selected BUY trade events to the journal via `handleJournalTrade` on the dashboard.
- BUY signal availability is provided by `useTradeEventInbox` (`src/hooks/useTradeEventInbox.ts`), which exposes `unconsumedCount`, `events`, and `refresh` for pending BUY trades.
- No `journalEntries` API exists yet; existing API modules (e.g., `src/api/wallet.ts`) define DTOs plus sanitized responses with deterministic mock fallbacks.
- Dashboard actions already gate the header "Log entry" button using `unconsumedCount === 0` and default to a disabled state when no BUY signals exist.

## File targets
- [x] CREATE `src/features/dashboard/TradeLogCard.tsx` — Added card wrapper with loading/error/empty states and load more control (files: src/features/dashboard/TradeLogCard.tsx)
- [x] CREATE `src/features/dashboard/TradeLogEntry.tsx` — Added accessible entry row linking to journal fallback and accent styling (files: src/features/dashboard/TradeLogEntry.tsx, src/features/dashboard/trade-log.css)
- [x] MODIFY `src/api/journalEntries.ts` — Added typed DTO and mock-backed `getRecentTrades` API (file: src/api/journalEntries.ts)
- [x] MODIFY `src/features/journal/*` (signal wiring) — Added `useLogEntryAvailability` wrapper exposing BUY signal count (file: src/features/journal/useLogEntryAvailability.ts)
- [ ] MODIFY `src/pages/DashboardPage.tsx`
- [x] (Optional) ADD `src/features/dashboard/trade-log.css` — Scoped styles for trade log card + entries (file: src/features/dashboard/trade-log.css)

## Implementation steps
- [x] Step 1 — Journal/trade data API + mock fallback — Created `getRecentTrades` with sanitization + deterministic mock list (file: src/api/journalEntries.ts)
- [x] Step 2 — TradeLogEntry component — Implemented clickable trade row with tokenized accent and journal fallback link (files: src/features/dashboard/TradeLogEntry.tsx, src/features/dashboard/trade-log.css)
- [x] Step 3 — TradeLogCard UI (states + load more) — Built card shell with header badge, states, and load-more paging (file: src/features/dashboard/TradeLogCard.tsx)
- [x] Step 4 — Log entry gating via BUY signal availability — Default-disabled CTA now accepts enabled flag + tooltip; created BUY signal hook (files: src/features/dashboard/TradeLogCard.tsx, src/features/journal/useLogEntryAvailability.ts)
- [x] Step 5 — Wire log entry action to existing entry overlay — Dashboard log action now reuses overlay opener + BUY gating from signal hook (file: src/pages/DashboardPage.tsx)
- [x] Step 6 — Wire TradeLogCard into DashboardPage — Replaced legacy TradeLogList with new card using BUY-signal gating (file: src/pages/DashboardPage.tsx)
- [x] Step 7 — Docs update — Logged WP-014 delivery in CHANGELOG + docs index (files: docs/CHANGELOG.md, docs/index.md)
- [x] Step 8 — Finalize checklist — Recorded acceptance + verification after test runs (file: WP-Polish/WP-014/checklist.md)

## Acceptance criteria
- [x] Recent trades render with empty + loading states — TradeLogCard shows skeleton/error/empty states before rendering items (src/features/dashboard/TradeLogCard.tsx)
- [x] Load more works — Card appends additional trades via limit growth and mock fallback (src/features/dashboard/TradeLogCard.tsx)
- [x] Log entry button disabled by default — TradeLogCard CTA defaults to disabled until enabled flag provided (src/features/dashboard/TradeLogCard.tsx)
- [x] Log entry enables when BUY signal is present — Dashboard passes BUY signal availability to enable CTA (src/pages/DashboardPage.tsx)
- [x] Tokens only — Styling uses theme tokens and scoped CSS vars (src/features/dashboard/trade-log.css)

## Verification
- [x] pnpm typecheck — Passed (tsc --noEmit)
- [x] pnpm lint — Completed with existing warnings only (see warnings output)
- [x] pnpm test (or pnpm vitest run) — Passed (Vitest suite, reporter=basic)
- [ ] pnpm test:e2e (document if Playwright not installed) — Not run; Playwright browsers not installed (`pnpm exec playwright install chromium` required)
