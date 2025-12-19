# Headroom Checklist

## Baseline (before optimizations)
- Command: `pnpm run check:size`
- Budgets: Initial 360KB, Chart route 240KB, Precache 1800KB
- Results: Initial 357KB, Chart route 214KB, Precache 792KB
- Top initial offenders (observed from build output):
  - vendor-react (~168KB)
  - vendor-dexie (~74KB)
  - DashboardPage chunk (~50KB)

## After optimizations
- Command: `pnpm run check:size`
- Results: Initial 329KB, Chart route 214KB, Precache 799KB
- Headroom gained vs. baseline: ~28KB on initial
- Modules moved off initial path:
  - Dashboard secondary widgets: RecentEntriesSection, AlertsOverviewWidget, JournalSnapshot, AlertsSnapshot, InsightTeaser
  - Action surfaces: FABMenu, LogEntryOverlayPanel, AlertCreateDialog
  - Main cards now lazy: HoldingsCard, TradeLogCard
- Current top initial offenders:
  - vendor-react (~168KB)
  - vendor-dexie (~74KB)
  - index/route bootstrap (~45KB)
- Notes: Added Suspense fallbacks on dashboard widgets/overlays to keep layout stable while chunks stream in.
