# WP-015 Checklist

## Current state snapshot
- Dashboard uses `JournalSnapshot` and `AlertsSnapshot` components in the secondary column; no combined recent entries + alerts section.
- `src/api/journalEntries.ts` only provides `getRecentTrades` with mock data; no recent journal entries endpoint.
- No `src/api/alerts.ts` module exists; alerts data comes from store and snapshot component.
- `/journal` and `/alerts` routes/pages exist in `src/pages` and are linked from dashboard components.
- Dashboard layout uses `dashboard-grid` and `dashboard-stack` patterns from `dashboard.css`; no responsive recent entries grid/scroll widget yet.

## File targets
- [x] CREATE  src/features/dashboard/RecentEntriesSection.tsx — Added responsive recent entries widget with loading/error/empty states (files: src/features/dashboard/RecentEntriesSection.tsx)
- [x] CREATE  src/features/dashboard/AlertsOverviewWidget.tsx — Added alerts stats widget with loading/error/empty handling and /alerts CTA (files: src/features/dashboard/AlertsOverviewWidget.tsx)
- [x] MODIFY  src/api/journalEntries.ts — Added `JournalEntryDTO`, mock entries, and `getRecentJournalEntries` fallback (files: src/api/journalEntries.ts)
- [x] MODIFY  src/api/alerts.ts (create if missing) — Added `AlertsOverviewDTO`, mock overview, and fetch helper (files: src/api/alerts.ts)
- [x] MODIFY  src/pages/DashboardPage.tsx (minimal integration) — Wired new dashboard footer grid with RecentEntriesSection and AlertsOverviewWidget (files: src/pages/DashboardPage.tsx)
- [x] (Optional) ADD CSS in src/features/dashboard/recent-entries.css — Scoped layout and tokenized styling for recent entries cards (files: src/features/dashboard/recent-entries.css)
- [x] (Optional) ADD CSS in src/features/dashboard/alerts-overview.css — Scoped styling for alerts overview widget (files: src/features/dashboard/alerts-overview.css)

## Implementation steps
- [x] Step 1 — Journal entries API + mock fallback — Implemented typed recent journal entries endpoint with deterministic mock data and shared sanitizers (files: src/api/journalEntries.ts)
- [x] Step 2 — Alerts API + mock fallback — Added alerts overview DTO and deterministic fallback for dashboard widget (files: src/api/alerts.ts)
- [x] Step 3 — RecentEntriesSection UI — Implemented responsive grid/scroll cards with CTA, pill accents, and state handling (files: src/features/dashboard/RecentEntriesSection.tsx, src/features/dashboard/recent-entries.css)
- [x] Step 4 — AlertsOverviewWidget UI — Built alerts overview stats with states and navigation to /alerts (files: src/features/dashboard/AlertsOverviewWidget.tsx, src/features/dashboard/alerts-overview.css)
- [x] Step 5 — Wire into DashboardPage — Added bottom dashboard grid with recent entries and alerts overview widgets (files: src/pages/DashboardPage.tsx)
- [x] Step 6 — Docs updates — Added WP-015 delivery notes to docs/CHANGELOG.md and docs/index.md (files: docs/CHANGELOG.md, docs/index.md)
- [x] Step 7 — Finalize checklist — Recorded acceptance + verification outcomes (files: WP-Polish/WP-015/checklist.md)

## Acceptance criteria
- [x] Responsive layout (grid vs scroll) — Recent entries uses mobile scroll + desktop grid; alerts stats uses responsive grid (files: src/features/dashboard/RecentEntriesSection.tsx, src/features/dashboard/recent-entries.css, src/features/dashboard/alerts-overview.css)
- [x] Links work (/journal and /alerts) — Widgets link to journal and alerts destinations (files: src/features/dashboard/RecentEntriesSection.tsx, src/features/dashboard/AlertsOverviewWidget.tsx)
- [x] Tokens only — Styling uses theme CSS variables and shared dashboard card surfaces (files: src/features/dashboard/recent-entries.css, src/features/dashboard/alerts-overview.css)

## Verification
- [x] pnpm typecheck — Passed (`pnpm typecheck`) (files/commands: CLI)
- [x] pnpm lint — Completed with existing warnings in unrelated files (`pnpm lint`) (files/commands: CLI)
- [x] pnpm test or pnpm vitest run — Passed (`pnpm test -- --reporter=basic`) with existing warning logs (files/commands: CLI)
- [ ] pnpm test:e2e (note Playwright install status) — Not run; Playwright browsers not installed (run `pnpm exec playwright install chromium` first)
