# Chart (Market) – UI Specification

## Purpose

**Goal:** Enable deep technical analysis of tokens with interactive charts, indicators, and on-chain metrics.

**User Actions:**
- Search and select tokens to analyze
- Apply technical indicators (RSI, MACD, EMA, Bollinger Bands)
- Switch timeframes (1m, 5m, 1h, 4h, 1d)
- View on-chain metrics (volume, holders, social sentiment)
- Add tokens to watchlist
- Create price alerts directly from chart

---

## Wireframe (Base Structure)

```
[Header]
  - Token Search Bar (with autocomplete)
  - Selected Token: Symbol + Name + Price
  - Watchlist Toggle (Star icon)

[Main Content]
  [Top Section - Chart Area]
    [Chart Toolbar - Above Chart]
      - Timeframe Selector (1m, 5m, 15m, 1h, 4h, 1d, 1w)
      - Indicator Selector Dropdown (RSI, MACD, EMA, SMA, Bollinger)
      - Chart Type (Candlestick, Line, Area)
      - Fullscreen Toggle

    [Interactive Chart Canvas]
      - OHLC Candlesticks
      - Volume Bars (bottom overlay)
      - Active Indicators (overlays/panels)
      - Crosshair with price/time info

  [Bottom Section - Two Columns]
    [Left Column - 2/3 width]
      - Technical Indicators Panel
        - Active indicator cards (RSI: 65, MACD: Bullish, etc.)
        - Quick actions: "Add Indicator", "Configure"

    [Right Column - 1/3 width]
      - On-Chain Metrics Card
        - 24h Volume
        - Market Cap
        - Holders
        - Social Score (if available)
      
      - Quick Actions Card
        - "Create Alert"
        - "Add to Journal"
        - "Share Analysis"
```

---

## Components

### TokenSearchBar
- **Type:** Input with Autocomplete
- **Description:** Search tokens by symbol or name
- **Props:**
  - `onSelect: (token: Token) => void`
  - `placeholder?: string`
- **State:** Idle, Searching, Results, Selected
- **Events:** `onSelect(token)` → Load chart data

### ChartCanvas
- **Type:** Interactive Chart (Lightweight Charts or TradingView)
- **Description:** Main candlestick chart with overlays
- **Props:**
  - `data: Array<OHLC>`
  - `indicators: Array<Indicator>`
  - `timeframe: string`
  - `chartType: 'candlestick' | 'line' | 'area'`
- **State:** Loading, Error, Success
- **Events:**
  - `onCrosshairMove(price, time)` → Show tooltip
  - `onRangeChange(start, end)` → Load more data

### ChartToolbar
- **Type:** Button Group + Dropdowns
- **Description:** Controls for timeframe, indicators, chart type
- **Props:**
  - `activeTimeframe: string`
  - `activeIndicators: Array<string>`
  - `onTimeframeChange: (tf: string) => void`
  - `onIndicatorToggle: (indicator: string) => void`
- **State:** Static (controlled by parent)
- **Events:** User clicks buttons → Parent updates chart

### IndicatorCard
- **Type:** Card
- **Description:** Shows single indicator value with status
- **Props:**
  - `name: string` (e.g. "RSI")
  - `value: number | string`
  - `status?: 'bullish' | 'bearish' | 'neutral'`
  - `description?: string`
- **State:** Static
- **Events:** `onClick` → Open indicator config modal

### OnChainMetricsCard
- **Type:** Card with Key-Value List
- **Description:** Displays token on-chain data
- **Props:**
  - `metrics: { volume24h, marketCap, holders, socialScore }`
- **State:** Loading, Error, Success
- **Events:** None (read-only)

---

## Layout Variants

### Variant 1 – Chart Dominance (Recommended)

**Layout:**
```
[Token Search + Header - Full Width]
[Chart Toolbar - Full Width]
[Chart Canvas - 75% viewport height]
[Indicators (50%) | Metrics + Actions (50%) - Below Chart]
```

**Pros:**
- Maximum chart visibility (primary focus)
- All controls within easy reach
- Clean separation of chart and data panels

**Cons:**
- Requires scrolling to see metrics on mobile
- Indicators/metrics not visible while analyzing chart

**Best For:** Users who prioritize chart analysis and screen real estate

---

### Variant 2 – Split View (Chart + Sidebar)

**Layout:**
```
[Token Search + Header - Full Width]
[Left: Chart (70%) | Right: Sidebar (30%)]
  Chart Side:
    - Toolbar (inline)
    - Chart Canvas (full height)
  
  Sidebar:
    - Active Indicators Panel
    - On-Chain Metrics
    - Quick Actions
    - Watchlist Preview
```

**Pros:**
- All information visible at once (no scrolling)
- Easy access to metrics while analyzing
- Familiar trading terminal layout

**Cons:**
- Reduced chart width (less horizontal space)
- Sidebar may feel cramped on smaller screens
- Not ideal for mobile (requires collapse/expand)

**Best For:** Desktop users who want context-aware multi-panel view

---

### Variant 3 – Tabbed Panels (Chart + Info Tabs)

**Layout:**
```
[Token Search + Header - Full Width]
[Chart Toolbar - Full Width]
[Chart Canvas - 60% viewport height]
[Tabbed Panel Below Chart - Full Width]
  Tabs: [Indicators] [Metrics] [Social] [Alerts]
  Active Tab Content (full width)
```

**Pros:**
- Clean, uncluttered layout
- Easy to add new data sections (social, news, etc.)
- Mobile-friendly (vertical scroll)

**Cons:**
- Context switching required (tab clicks)
- Only one info panel visible at a time
- More clicks to compare indicator + metrics

**Best For:** Users who prefer focused, step-by-step analysis workflow

---

## Data & Parameters

### Incoming Data
- **Token Info:**
  - `symbol: string` (e.g. "SOL")
  - `name: string` (e.g. "Solana")
  - `price: number`
  - `change24h: number`
- **OHLC Data:**
  - `ohlc: Array<{ time, open, high, low, close, volume }>`
- **Indicators:**
  - `rsi: number` (0-100)
  - `macd: { value, signal, histogram }`
  - `ema: Array<{ period, value }>`
- **On-Chain Metrics:**
  - `volume24h: number`
  - `marketCap: number`
  - `holders: number`
  - `socialScore?: number`

### Filters/Parameters
- `timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'`
- `indicators: Array<'rsi' | 'macd' | 'ema' | 'sma' | 'bollinger'>`
- `chartType: 'candlestick' | 'line' | 'area'`

### Important IDs
- `tokenAddress: string` (for API calls)
- `chartSessionId: string` (for caching chart state)

---

## Interactions & UX Details

### User Flows
1. **Token Search:** User types "SOL" → Autocomplete shows results → User selects → Chart loads
2. **Add Indicator:** User clicks "Add Indicator" → Dropdown opens → User selects "RSI" → RSI overlay appears on chart
3. **Change Timeframe:** User clicks "1h" button → Chart reloads with 1h candles
4. **Create Alert:** User hovers on chart at $150 → Right-clicks → "Create Alert at $150" → Alert modal opens

### Empty States
- **No Token Selected:** "Search for a token to start analysis" + Search bar focus
- **No Indicators:** "Add indicators to enhance your analysis" + "Add Indicator" button
- **Offline Mode:** "Using cached data (last updated: 2h ago)" banner

### Loading States
- **Chart Loading:** Skeleton chart with pulsing candlestick shapes
- **Indicator Loading:** Spinner in indicator card
- **Token Search:** Loading spinner in autocomplete dropdown

### Error States
- **Chart Load Failed:** "Unable to load chart data" + "Retry" button
- **Indicator Calculation Failed:** Red error badge on indicator card + "Remove" option
- **Invalid Token:** "Token not found or unsupported" + "Try another search"

---

## Mobile Considerations

- **Chart Toolbar:** Horizontal scroll for timeframe buttons
- **Chart Canvas:** Full width, 50vh height (pinch-to-zoom enabled)
- **Indicators/Metrics:** Collapse into accordion or bottom sheet
- **Token Search:** Full-screen overlay on mobile

---

## Accessibility

- **Keyboard Navigation:**
  - Tab through toolbar buttons
  - Arrow keys to navigate timeframes
  - Enter to select indicator
- **Screen Readers:**
  - Announce price changes
  - Describe indicator values (e.g. "RSI 65, Overbought")
- **High Contrast:** Ensure chart lines meet 3:1 contrast ratio

---

## Open Questions / Todos

1. **Chart Library:** Lightweight Charts (faster) vs. TradingView (more features)? → Decision Q1 2025
2. **Drawing Tools:** Add trendlines, Fibonacci retracements? (Advanced feature, low priority)
3. **Multiple Charts:** Support side-by-side comparison? (Future enhancement)
4. **Indicator Presets:** Save/load indicator combinations? (UX improvement)
5. **Real-Time Updates:** WebSocket for live price updates or polling (1min interval)?

---

**Status:** ✅ Ready for implementation  
**Recommended Variant:** Variant 1 (Chart Dominance)  
**Last Updated:** 2025-11-14
