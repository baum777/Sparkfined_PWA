# Dashboard – UI Specification

## Purpose

**Goal:** Provide traders with an at-a-glance overview of their performance, market status, and recent activity.

**User Actions:**
- Quickly scan KPIs (P&L, win rate, active alerts)
- See recent journal entries and market movers
- Navigate to detailed views (Chart, Journal, Alerts)

---

## Wireframe (Base Structure)

```
[Header]
  - Page Title: "Dashboard"
  - Date Range Filter (Today / 7D / 30D / All Time)
  - Sync Status Indicator (Online/Offline)

[Main Content]
  [Top Row - KPI Tiles (Grid)]
    - Total P&L
    - Win Rate %
    - Active Alerts
    - Journal Entries (count)

  [Middle Row - Two Columns]
    [Left Column - 2/3 width]
      - Recent Activity Feed
        - Recent journal entries (3-5)
        - Recent alerts triggered
        - "View All" link

    [Right Column - 1/3 width]
      - Market Movers Card
        - Top 3 gainers/losers today
        - Sparklines
        - Quick "Add to Watchlist" action

  [Bottom Row]
    - Quick Actions Bar
      - "New Journal Entry"
      - "Create Alert"
      - "Open Chart"
```

---

## Components

### KPITile
- **Type:** Card
- **Description:** Single metric display with icon, label, value, change indicator
- **Props:**
  - `label: string` (e.g. "Total P&L")
  - `value: string | number` (e.g. "$1,234.56")
  - `change?: number` (percentage change, e.g. +12.5)
  - `icon?: React.ReactNode`
  - `trend?: 'up' | 'down' | 'neutral'`
- **State:** Static (updates on data refresh)
- **Events:** Optional `onClick` to drill down

### ActivityFeed
- **Type:** List/Timeline
- **Description:** Scrollable list of recent actions (journal entries, alerts)
- **Props:**
  - `items: Array<ActivityItem>`
  - `maxItems?: number` (default 5)
- **State:** Loading, Empty, Success
- **Events:** `onItemClick(id)` → Navigate to detail

### MarketMoversCard
- **Type:** Card with Table
- **Description:** Top 3 tokens by 24h % change
- **Props:**
  - `tokens: Array<{ symbol, name, change, price, sparkline }>`
- **State:** Loading, Error, Success
- **Events:** `onAddToWatchlist(symbol)`

### QuickActionsBar
- **Type:** Button Group
- **Description:** Horizontal bar with primary actions
- **Props:**
  - `actions: Array<{ label, icon, onClick }>`
- **State:** Static
- **Events:** Individual button `onClick` handlers

---

## Layout Variants

### Variant 1 – KPI Focus (Recommended)

**Layout:**
```
[4 KPI Tiles - Full Width Grid]
[Activity Feed (60%) | Market Movers (40%)]
[Quick Actions Bar - Full Width]
```

**Pros:**
- KPIs immediately visible (most important data)
- Balanced split between activity and market context
- Clear visual hierarchy (metrics → details → actions)

**Cons:**
- Requires scrolling on mobile to see activity feed
- Market movers slightly compressed

**Best For:** Users who prioritize performance metrics and recent activity

---

### Variant 2 – Activity Focus

**Layout:**
```
[2 KPI Tiles Left | 2 KPI Tiles Right]
[Activity Feed - Full Width (larger, 8-10 items)]
[Market Movers - Full Width Below]
[Quick Actions - Floating FAB]
```

**Pros:**
- More space for activity feed (better for active traders)
- All content visible without horizontal scrolling
- Floating action button saves vertical space

**Cons:**
- KPIs less prominent (split attention)
- Market movers pushed below fold on smaller screens

**Best For:** Users who journal frequently and want easy access to history

---

### Variant 3 – Hybrid Dashboard + Chart Preview

**Layout:**
```
[4 KPI Tiles - Full Width Grid]
[Left: Activity Feed (40%) | Right: Mini Chart (60%)]
[Market Movers Bar - Horizontal Ticker]
[Quick Actions Bar]
```

**Pros:**
- Includes live chart preview (main feature visibility)
- Compact market movers as ticker (space efficient)
- Keeps KPIs prominent

**Cons:**
- Chart preview may feel cramped
- Activity feed reduced to 3-4 items
- More complex layout (higher cognitive load)

**Best For:** Users who want chart access without leaving dashboard

---

## Data & Parameters

### Incoming Data
- **KPI Metrics:**
  - `totalPnL: number`
  - `winRate: number` (0-100)
  - `activeAlerts: number`
  - `journalEntryCount: number`
- **Activity Feed:**
  - `activities: Array<{ id, type, timestamp, title, excerpt }>`
- **Market Movers:**
  - `topMovers: Array<{ symbol, name, price, change24h, sparkline }>`

### Filters/Parameters
- `dateRange: 'today' | '7d' | '30d' | 'all'` (affects KPIs and activity)
- `activityType?: 'journal' | 'alerts' | 'all'` (optional filter)

### Important IDs
- `userId` (for personalized data)
- `journalEntryId`, `alertId` (for navigation)

---

## Interactions & UX Details

### User Flows
1. **Quick Scan:** User opens app → Sees KPIs → Decides next action
2. **Dive Deep:** User clicks KPI tile → Navigates to detailed view (e.g. Journal page)
3. **Add to Watchlist:** User sees interesting token in Market Movers → Clicks "+" icon → Token added

### Empty States
- **No Journal Entries:** "Start tracking your trades" + "Create First Entry" button
- **No Active Alerts:** "Set up alerts to never miss opportunities" + "Create Alert" button
- **No Market Data:** "Market data unavailable offline" + "Go Online" prompt

### Loading States
- KPI Tiles: Skeleton with pulsing background
- Activity Feed: 3-5 skeleton rows
- Market Movers: Shimmer effect on table rows

### Error States
- Failed to load KPIs: Red error banner with "Retry" button
- Failed to load market data: Show cached data with "Data may be outdated" warning

---

## Mobile Considerations

- **KPI Tiles:** 2-column grid on mobile (4 tiles = 2 rows)
- **Activity Feed:** Full width, reduced to 3 items on mobile
- **Quick Actions:** Convert to floating action button (FAB) on mobile

---

## Open Questions / Todos

1. **Sparklines in KPI Tiles:** Include mini trend graphs? (Adds visual interest but increases complexity)
2. **Customizable Dashboard:** Allow users to rearrange tiles? (Future enhancement)
3. **Real-Time Updates:** WebSocket for live KPI updates or polling? (Decision pending)
4. **Activity Feed Limit:** Default to 5 or 10 items before "View All"?

---

**Status:** ✅ Ready for implementation  
**Recommended Variant:** Variant 1 (KPI Focus)  
**Last Updated:** 2025-11-14
