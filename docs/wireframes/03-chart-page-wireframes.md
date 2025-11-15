# Chart-Page — Detaillierte Wireframes

> **Seite:** Chart (Technical-Analysis)
> **Route:** `/chart`
> **Zweck:** OHLC-Charts, Indicators, Drawing-Tools, Backtest
> **Priorität:** P0 (Core-Feature, Trading-Command-Center)

---

## Inhaltsverzeichnis

1. [Desktop-Layout](#1-desktop-layout)
2. [Chart-Canvas-Spezifikation](#2-chart-canvas-spezifikation)
3. [Toolbar-Spezifikation](#3-toolbar-spezifikation)
4. [Indicator-Panel-Spezifikation](#4-indicator-panel-spezifikation)
5. [Drawing-Tools-Spezifikation](#5-drawing-tools-spezifikation)
6. [Timeline-MiniMap-Spezifikation](#6-timeline-minimap-spezifikation)
7. [Backtest-Panel-Spezifikation](#7-backtest-panel-spezifikation)
8. [Mobile-Layout](#8-mobile-layout)
9. [Interaktions-States](#9-interaktions-states)

---

## 1. Desktop-Layout

### 1.1 Gesamt-Layout (≥1280px)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Toolbar (h-14, sticky top-64)                                            │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ [Token-Search] [SOL ▼] | 1m 5m 15m [1h] 4h 1D | [Indicators] [Draw] │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────┤
│ Chart-Canvas-Area (flex-1, min-h-screen)                                 │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ Price-Axis (Right, 60px)                                              │ │
│ │                                                                       │ │
│ │              📊 OHLC-Candlestick-Chart                                │ │
│ │                                                                       │ │
│ │              ─── EMA-20 (emerald)                                     │ │
│ │              ─── EMA-50 (cyan)                                        │ │
│ │              ─── SMA-200 (amber)                                      │ │
│ │                                                                       │ │
│ │              🟢 Long-Entry-Marker                                     │ │
│ │              🔴 Short-Entry-Marker                                    │ │
│ │                                                                       │ │
│ │ ──────────────────────────────────────────────────────────────────── │ │
│ │                                                                       │ │
│ │              📈 Indicator-1: RSI (h-100px)                            │ │
│ │              Overbought (70) ─── ─── ─── ─── ───                     │ │
│ │              Oversold (30)   ─── ─── ─── ─── ───                     │ │
│ │                                                                       │ │
│ │ ──────────────────────────────────────────────────────────────────── │ │
│ │                                                                       │ │
│ │              📊 Indicator-2: Volume (h-80px)                          │ │
│ │              ▂▃▅▇▅▃▂▁▂▃▅▇▅▃▂▁                                        │ │
│ │                                                                       │ │
│ │ ──────────────────────────────────────────────────────────────────── │ │
│ │ Time-Axis (Bottom, h-30px)                                            │ │
│ │ 10:00   10:30   11:00   11:30   12:00   12:30   13:00               │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────┤
│ Bottom-Controls (h-12, flex justify-between)                             │
│ ┌────────────────────────┬──────────────────────────────────────────────┐ │
│ │ [🔍 Zoom] [🖐 Pan]     │ MiniMap (w-200px, h-40px)  [⏯ Replay]      │ │
│ └────────────────────────┴──────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

**Layout-Details:**
- **Toolbar-Height:** 56px (h-14, sticky below header)
- **Chart-Canvas:** flex-1 (fills remaining viewport height)
- **Price-Axis:** 60px width, right-aligned, absolute position
- **Time-Axis:** 30px height, bottom-aligned
- **Indicator-Panels:** Stacked below main-chart (collapsible)
- **Bottom-Controls:** 48px height, fixed bottom (above mobile-nav)

---

## 2. Chart-Canvas-Spezifikation

### 2.1 Main-Chart-Area

```
┌────────────────────────────────────────────────────────────┬─────┐
│                                                            │ P   │
│              OHLC-Candlestick-Chart                        │ r   │
│              (min-h-500px)                                 │ i   │
│                                                            │ c   │
│              🕯️ Candles (green/red)                        │ e   │
│              ─── Overlay-Indicators                        │     │
│              ─── Drawing-Objects                           │ A   │
│              🟢 Trade-Markers                              │ x   │
│                                                            │ i   │
│              Crosshair (on hover)                          │ s   │
│              Tooltip: O:125.34 H:126.50 L:124.80 C:125.90  │     │
│                                                            │ 6   │
│                                                            │ 0   │
│                                                            │ p   │
│                                                            │ x   │
└────────────────────────────────────────────────────────────┴─────┘
```

**Maße & Styling:**
- **Canvas-Background:** bg-zinc-950 (darkest)
- **Grid-Lines:** 1px, zinc-800/50 (subtle)
- **Grid-Spacing:** Horizontal: Every 4 hours, Vertical: Every 1% price-move
- **Candlestick-Colors:**
  - Bullish (Close > Open): fill-emerald-500, stroke-emerald-400
  - Bearish (Close < Open): fill-rose-500, stroke-rose-400
  - Doji (Close = Open): fill-zinc-600, stroke-zinc-500

**Overlay-Indicators:**
- **EMA-20:** stroke-emerald-400, stroke-width-2, dashed
- **EMA-50:** stroke-cyan-400, stroke-width-2, dashed
- **SMA-200:** stroke-amber-400, stroke-width-2.5, solid
- **Bollinger-Bands:** stroke-cyan-500/30, fill-cyan-500/10

**Trade-Markers:**
- **Long-Entry:** 🟢 Circle (r=8px), fill-emerald-500, stroke-white (2px)
  - Label: "LONG $125.34" (bg-emerald-500, text-white, px-2 py-1, rounded)
- **Short-Entry:** 🔴 Circle (r=8px), fill-rose-500, stroke-white (2px)
  - Label: "SHORT $132.50" (bg-rose-500, text-white, px-2 py-1, rounded)
- **Stop-Loss:** 🟠 Diamond (side=12px), fill-amber-500, stroke-white
- **Take-Profit:** 🟢 Star (5-points), fill-emerald-400, stroke-white

**Crosshair:**
- **Lines:** stroke-zinc-500, stroke-width-1, stroke-dasharray="4 4" (dashed)
- **Tooltip-Box:** bg-zinc-900/95, border-zinc-700, rounded-md, p-2, shadow-lg
  - **Content:** "O: 125.34  H: 126.50  L: 124.80  C: 125.90  Vol: 1.2M"
  - **Font:** font-mono, text-xs (12px), text-zinc-300
  - **Position:** Follows cursor, offset-right-10px, offset-top-10px

### 2.2 Price-Axis (Right-Side)

```
┌───────┐
│ 130.0 │ ← Current-Price-Line (Horizontal, emerald-500 if rising)
│ 129.5 │
│ 129.0 │ ← Price-Tick (text-xs, zinc-500)
│ 128.5 │
│ 128.0 │
│ 127.5 │
│ 127.0 │
│ 126.5 │
│ 126.0 │ ← Support-Level (amber-500, dashed)
│ 125.5 │
│ 125.0 │ ← Current-Price-Label (emerald-500, font-bold)
│ 124.5 │
│ 124.0 │
└───────┘
```

**Maße & Styling:**
- **Width:** 60px (fixed)
- **Background:** bg-zinc-900/50 (semi-transparent)
- **Price-Ticks:** text-xs (12px), font-mono, text-zinc-500
  - Spacing: Every 0.5% price-move
- **Current-Price-Label:** bg-emerald-500, text-white, px-2 py-1, rounded-sm
  - Font: font-mono, text-sm (14px), font-bold (700)
  - Animation: pulse (2s) if price-change-active

**Special-Levels:**
- **Support/Resistance:** amber-500, dashed-line across chart + label on axis
- **Entry-Price:** emerald-500 (if long), rose-500 (if short), solid-line
- **Stop-Loss:** rose-600, dashed-line
- **Take-Profit:** emerald-600, dashed-line

### 2.3 Time-Axis (Bottom)

```
┌────────────────────────────────────────────────────────────┐
│ 10:00   10:30   11:00   11:30   12:00   12:30   13:00     │
│   │       │       │       │       │       │       │        │
└────────────────────────────────────────────────────────────┘
```

**Maße & Styling:**
- **Height:** 30px (fixed)
- **Background:** bg-zinc-900/50
- **Time-Labels:** text-xs (12px), font-mono, text-zinc-500
  - Spacing: Depends on timeframe:
    - 1m: Every 10 candles (10 min)
    - 5m: Every 12 candles (1 hour)
    - 15m: Every 16 candles (4 hours)
    - 1h: Every 12 candles (12 hours)
    - 4h: Every 6 candles (1 day)
    - 1D: Every 7 candles (1 week)
- **Tick-Marks:** 1px vertical-line, zinc-700, extends 4px above axis

---

## 3. Toolbar-Spezifikation

### 3.1 Wireframe

```
┌───────────────────────────────────────────────────────────────────────────┐
│ [🔍 SOL ▼] | [1m] [5m] [15m] [1h] [4h] [1D] | [📊 Indicators] [✏️ Draw] │
│ Token-Search  Timeframe-Selector              Tools                      │
└───────────────────────────────────────────────────────────────────────────┘
```

**Layout:**
- **Height:** 56px (h-14)
- **Padding:** px-6 py-3
- **Background:** bg-zinc-900/95, border-b border-zinc-800, backdrop-blur-sm
- **Position:** sticky top-64 (below main-header), z-30
- **Display:** flex items-center gap-4

### 3.2 Token-Search-Dropdown

```
┌───────────────────┐
│ 🔍 SOL         ▼ │ ← Selected-Token, with logo
└───────────────────┘
```

**Maße & Styling:**
- **Width:** 180px
- **Height:** 40px (h-10)
- **Padding:** pl-10 pr-3 (icon-inset)
- **Background:** bg-zinc-800, border border-zinc-700
- **Border-Radius:** rounded-md (8px)
- **Hover:** border-emerald-500/50
- **Focus:** ring-2 ring-emerald-500

**Dropdown-Menu:**
```
┌───────────────────────────────┐
│ 🔍 [Search tokens...]         │ ← Search-Input
├───────────────────────────────┤
│ Recent:                       │
│ ┌───────────────────────────┐ │
│ │ [Logo] SOL  $125.34  +2%  │ │ ← Token-Item (hover: bg-zinc-700)
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ [Logo] BTC  $65,430  -1%  │ │
│ └───────────────────────────┘ │
├───────────────────────────────┤
│ Popular:                      │
│ │ [Logo] ETH  $3,450   +3%  │ │
│ │ [Logo] BONK $0.00023 +45% │ │
└───────────────────────────────┘
```

**Dropdown-Maße:**
- **Width:** 320px
- **Max-Height:** 400px (scrollable)
- **Background:** bg-zinc-800, border border-zinc-700, shadow-xl
- **Item-Padding:** px-3 py-2.5
- **Item-Hover:** bg-zinc-700

### 3.3 Timeframe-Selector

```
┌────────────────────────────────────┐
│ [1m] [5m] [15m] [1h] [4h] [1D]    │
└────────────────────────────────────┘
```

**Button-Specs:**
- **Size:** px-3 py-1.5, text-sm (14px)
- **Gap:** gap-1 (4px) between buttons
- **States:**
  - **Inactive:** bg-zinc-800, text-zinc-400, hover:bg-zinc-700, hover:text-zinc-200
  - **Active:** bg-emerald-500, text-white, font-semibold (600)
- **Border-Radius:** rounded-md (8px)
- **Transition:** all 150ms

**Timeframes:**
- 1m, 5m, 15m, 1h, 4h, 1D, 1W (7 options)

### 3.4 Indicators-Button

```
┌──────────────────┐
│ 📊 Indicators ▼ │
└──────────────────┘
```

**Button-Specs:**
- **Size:** px-4 py-2, text-sm (14px)
- **Background:** bg-zinc-800, border border-zinc-700
- **Hover:** bg-zinc-700, border-emerald-500/50
- **Icon:** 20×20px, text-cyan-400
- **Dropdown-Arrow:** 12×12px, text-zinc-500

**Dropdown-Menu:**
```
┌────────────────────────────────┐
│ Active Indicators:             │
│ ┌────────────────────────────┐ │
│ │ ☑ EMA-20   [⚙️] [🗑️]       │ │ ← Checked, with Settings & Remove
│ │ ☑ RSI      [⚙️] [🗑️]       │ │
│ │ ☑ Volume   [⚙️] [🗑️]       │ │
│ └────────────────────────────┘ │
├────────────────────────────────┤
│ Add Indicator:                 │
│ ┌────────────────────────────┐ │
│ │ [Search indicators...]     │ │
│ ├────────────────────────────┤ │
│ │ Trend:                     │ │
│ │ ☐ EMA-50                   │ │ ← Unchecked, click to add
│ │ ☐ SMA-200                  │ │
│ │ ☐ MACD                     │ │
│ ├────────────────────────────┤ │
│ │ Momentum:                  │ │
│ │ ☐ Stochastic               │ │
│ │ ☐ CCI                      │ │
│ ├────────────────────────────┤ │
│ │ Volatility:                │ │
│ │ ☐ Bollinger-Bands          │ │
│ │ ☐ ATR                      │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

**Dropdown-Maße:**
- **Width:** 280px
- **Max-Height:** 500px (scrollable)
- **Background:** bg-zinc-800, border border-zinc-700, shadow-xl

**Indicator-Item:**
- **Padding:** px-3 py-2
- **Checkbox:** 18×18px, emerald-500 when checked
- **Settings-Icon:** 16×16px, text-zinc-500, hover:text-zinc-300
- **Remove-Icon:** 16×16px, text-rose-500, hover:text-rose-400

### 3.5 Drawing-Tools-Button

```
┌────────────────┐
│ ✏️ Draw      ▼ │
└────────────────┘
```

**Dropdown-Menu:**
```
┌────────────────────────────┐
│ Drawing Tools:             │
│ ┌────────────────────────┐ │
│ │ [✏️] Trend-Line        │ │ ← Click to activate tool
│ │ [📏] Horizontal-Line   │ │
│ │ [📐] Fibonacci-Retr.   │ │
│ │ [📦] Rectangle         │ │
│ │ [🔺] Triangle          │ │
│ │ [📝] Text-Label        │ │
│ └────────────────────────┘ │
├────────────────────────────┤
│ [🗑️ Clear All Drawings]   │
└────────────────────────────┘
```

**Tool-Activation:**
- **Click-Tool:** Activates drawing-mode (cursor changes)
- **Active-Visual:** bg-emerald-500/20, border-l-2 border-emerald-500
- **Cancel:** Escape-Key, or click tool again

---

## 4. Indicator-Panel-Spezifikation

### 4.1 RSI-Panel (Example)

```
┌────────────────────────────────────────────────────────────┬─────┐
│ RSI (14)                                          [−] [X]  │ V   │
│ ──────────────────────────────────────────────────────── │ a   │
│ Overbought (70) ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │ l   │
│                       ╱╲                                   │ u   │
│                     ╱    ╲╱╲                              │ e   │
│                   ╱          ╲                            │     │
│ ─ ─ ─ ─ ─ ─ ─ ─ ╱─ ─ ─ ─ ─ ─ ╲─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │ 0-  │
│                                 ╲                         │ 100 │
│                                   ╲                       │     │
│ Oversold (30)  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─╲─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │     │
│ ──────────────────────────────────────────────────────── │     │
└────────────────────────────────────────────────────────────┴─────┘
```

**Maße & Styling:**
- **Height:** 100px (fixed, collapsible)
- **Background:** bg-zinc-900/80
- **Border-Top:** 1px border-zinc-800
- **Padding:** p-3

**Header:**
- **Title:** text-sm (14px), font-semibold (600), text-zinc-300
  - Format: "RSI (14)" (Indicator-Name + Settings)
- **Controls:** flex gap-2 (top-right, absolute)
  - **Minimize:** [−] Button (w-6 h-6, collapses panel to header-only)
  - **Close:** [X] Button (removes indicator)

**Chart-Area:**
- **Line-Color:** cyan-400 (RSI-line)
- **Overbought-Line:** amber-500, dashed (y=70)
- **Oversold-Line:** emerald-500, dashed (y=30)
- **Fill:** gradient-fill-cyan-500/10 (under-line)

**Value-Axis (Right):**
- **Width:** 40px
- **Labels:** 0, 30, 50, 70, 100 (text-xs, zinc-500)

### 4.2 Volume-Panel

```
┌────────────────────────────────────────────────────────────┐
│ Volume                                        [−] [X]      │
│ ──────────────────────────────────────────────────────── │
│ ▂▃▅▇▅▃▂▁▂▃▅▇▅▃▂▁▂▃▅▇▅▃▂▁                                  │
│ Green=Bullish, Red=Bearish                                │
│ ──────────────────────────────────────────────────────── │
└────────────────────────────────────────────────────────────┘
```

**Maße & Styling:**
- **Height:** 80px (smaller than RSI)
- **Bars:** Width=candlestick-width, colors:
  - Bullish-Volume: fill-emerald-500/60
  - Bearish-Volume: fill-rose-500/60
- **MA-20-Volume:** amber-400 (overlay-line)

---

## 5. Drawing-Tools-Spezifikation

### 5.1 Trend-Line-Tool

**User-Flow:**
1. User clicks [Trend-Line] in Toolbar
2. Cursor changes to crosshair + line-icon
3. User clicks point-A (start)
4. User drags to point-B (end)
5. User releases mouse → Line created
6. Line persists with control-points (resize-handles)

**Visual-Specs:**
- **Line:** stroke-emerald-400, stroke-width-2, stroke-dasharray="4 4" (dashed)
- **Control-Points:** Circle (r=6px), fill-emerald-500, stroke-white (2px)
  - Hover: fill-emerald-400
  - Drag: cursor-move
- **Delete:** Click-line → [Delete] Button, or Backspace-Key

### 5.2 Horizontal-Line (Support/Resistance)

**Visual-Specs:**
- **Line:** stroke-amber-500, stroke-width-2, full-width across chart
- **Label:** bg-amber-500, text-white, px-2 py-1, rounded-sm, font-mono
  - Format: "R: $126.50" (Resistance), "S: $124.00" (Support)
- **Drag:** Vertical-only (y-axis), cursor-ns-resize

### 5.3 Fibonacci-Retracement

**User-Flow:**
1. User clicks [Fibonacci] in Toolbar
2. User clicks swing-low (point-A)
3. User drags to swing-high (point-B)
4. Tool draws horizontal-lines at Fib-levels

**Fib-Levels:**
- 0% (Low): cyan-500
- 23.6%: zinc-500
- 38.2%: amber-500
- 50%: emerald-500
- 61.8%: amber-500 (golden-ratio, emphasized)
- 78.6%: zinc-500
- 100% (High): rose-500

**Visual-Specs:**
- **Lines:** stroke-width-1, stroke-dasharray="2 2"
- **Labels:** Right-side, bg-color/20, text-color, px-2 py-0.5

### 5.4 Rectangle/Zone

**Visual-Specs:**
- **Border:** stroke-cyan-500, stroke-width-2, stroke-dasharray="4 4"
- **Fill:** fill-cyan-500/10 (semi-transparent)
- **Control-Points:** 4 corners + 4 mid-edges (resize-handles)
- **Use-Cases:** Mark consolidation-zones, support/resistance-zones

---

## 6. Timeline-MiniMap-Spezifikation

### 6.1 Wireframe

```
┌──────────────────────────────────────────────┐
│ MiniMap (200×40px, bottom-right)            │
│ ┌──────────────────────────────────────────┐ │
│ │ ▁▂▃▅▇▅▃▂▁▂▃▅▇▅▃▂▁▂▃▅▇▅▃▂▁▂▃▅▇▅▃▂▁        │ │
│ │            [━━━━━━]                      │ │ ← Viewport-Indicator
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**Maße & Styling:**
- **Width:** 200px
- **Height:** 40px
- **Background:** bg-zinc-800/50, border border-zinc-700
- **Border-Radius:** rounded-md (8px)
- **Position:** absolute bottom-4 right-4

**Chart-Miniature:**
- **Line:** stroke-cyan-400, stroke-width-1
- **Fill:** fill-cyan-500/20

**Viewport-Indicator:**
- **Box:** border-2 border-emerald-500, fill-emerald-500/10
- **Drag:** Click-and-drag to pan main-chart
- **Resize:** Drag left/right-edges to zoom

---

## 7. Backtest-Panel-Spezifikation

### 7.1 Backtest-Mode-Activation

**Trigger:** Click [⏯ Replay] Button (bottom-right)

**UI-Changes:**
1. Toolbar adds Backtest-Controls
2. Chart overlay shows Replay-HUD
3. Bottom adds Timeline-Scrubber

### 7.2 Replay-HUD (Overlay)

```
┌────────────────────────────────────────────────┐
│ BACKTEST MODE                           [Exit] │
│ ────────────────────────────────────────────── │
│ Session: "SOL Breakout 2025-11-15"             │
│ Progress: 45% (27/60 candles)                  │
│                                                │
│ Current-Position: LONG @ $125.34               │
│ Unrealized-P&L: +$720 (+5.7%)                  │
│                                                │
│ [⏪ -10] [⏸ Pause] [⏩ +10] [⏭ Fast-Forward]  │
└────────────────────────────────────────────────┘
```

**Maße & Styling:**
- **Position:** absolute top-4 left-4, z-50
- **Width:** 320px
- **Background:** bg-zinc-900/95, border border-zinc-700, shadow-xl, rounded-lg
- **Padding:** p-4

**Session-Info:**
- **Title:** text-base (16px), font-semibold (600), text-zinc-100
- **Progress:** text-sm (14px), text-zinc-400

**Position-Info:**
- **Label:** text-sm (14px), font-medium (500), text-zinc-300
- **P&L:** text-lg (18px), font-bold (700)
  - Positive: text-emerald-500
  - Negative: text-rose-500

**Playback-Controls:**
- **Buttons:** px-3 py-2, text-sm, bg-zinc-800, hover:bg-zinc-700
  - **-10:** Rewind 10 candles
  - **Pause:** Stop playback
  - **+10:** Forward 10 candles
  - **Fast-Forward:** Play at 2x/4x speed

### 7.3 Timeline-Scrubber (Bottom-Bar)

```
┌────────────────────────────────────────────────────────────┐
│ [●───────────────────────o───────────────────────────────] │
│ Start                  Current                         End │
│ 10:00                  12:30                         16:00 │
└────────────────────────────────────────────────────────────┘
```

**Maße & Styling:**
- **Height:** 60px
- **Background:** bg-zinc-900, border-t border-zinc-800
- **Slider:**
  - **Track:** bg-zinc-700, h-2 (8px), rounded-full
  - **Progress:** bg-emerald-500, h-2
  - **Thumb:** w-4 h-4 (16×16px), rounded-full, bg-emerald-500, shadow-emerald-glow
  - **Drag:** cursor-grabbing

**Time-Labels:**
- **Font:** text-xs (12px), font-mono, text-zinc-500
- **Position:** Below slider, left/center/right-aligned

---

## 8. Mobile-Layout

### 8.1 Mobile-Wireframe (<768px)

```
┌────────────────────────────┐
│ Header: "Chart"            │
│ [SOL ▼] [1h ▼]            │ ← Compact-Token + Timeframe
├────────────────────────────┤
│ Chart-Canvas (Full-Width)  │
│ ┌────────────────────────┐ │
│ │ 📊 OHLC-Chart          │ │ ← Touch-interactions (pinch-zoom)
│ │                        │ │
│ │ (min-h-400px)          │ │
│ │                        │ │
│ └────────────────────────┘ │
├────────────────────────────┤
│ [Indicators] [Draw] [More] │ ← Bottom-Sheet-Triggers
├────────────────────────────┤
│ Indicator-Panel (RSI)      │ ← Collapsible
│ (h-80px)                   │
├────────────────────────────┤
│ Indicator-Panel (Volume)   │
│ (h-60px)                   │
└────────────────────────────┘
```

**Responsive-Changes:**
- **Toolbar:** Collapsed into Hamburger-Menu
- **Token-Search:** Full-width-dropdown
- **Timeframe:** Horizontal-scroll-buttons
- **Indicators:** Bottom-Sheet (slide-up)
- **Drawing-Tools:** Simplified (3-4 tools only)
- **Zoom/Pan:** Touch-gestures (pinch-zoom, two-finger-pan)

### 8.2 Touch-Interactions

**Gestures:**
- **Tap:** Show crosshair + tooltip
- **Drag:** Pan chart (horizontal + vertical)
- **Pinch:** Zoom in/out
- **Double-Tap:** Reset zoom
- **Long-Press:** Opens context-menu (Add-Marker, Draw-Line)

**Crosshair-Mobile:**
- **Trigger:** Tap-and-hold
- **Visual:** Larger crosshair-circle (r=40px), with haptic-feedback
- **Tooltip:** Bottom-of-screen (full-width), bg-zinc-900, p-4

---

## 9. Interaktions-States

### 9.1 Chart-Navigation

**Desktop:**
- **Zoom:** Mouse-wheel (scroll up=zoom-in, down=zoom-out)
- **Pan:** Click-and-drag with mouse
- **Crosshair:** Hover (follows cursor)

**Mobile:**
- **Zoom:** Pinch-gesture
- **Pan:** Swipe (horizontal/vertical)
- **Crosshair:** Tap-and-hold

### 9.2 Drawing-Mode

**Active-Tool:**
- **Cursor:** Changes to tool-specific (crosshair, hand, pencil)
- **ESC-Key:** Cancel/Exit drawing-mode
- **Click-Outside:** Deselect active-drawing

**Edit-Mode:**
- **Click-Drawing:** Selects object (shows control-points)
- **Drag-Control-Point:** Resize/Reposition
- **Delete-Key:** Remove selected-object
- **Ctrl+Z:** Undo last-action

### 9.3 Indicator-Settings

**Open-Settings:**
- **Trigger:** Click [⚙️] Icon on Indicator
- **Modal:** Opens Settings-Modal

**Settings-Modal:**
```
┌─────────────────────────────┐
│ RSI Settings           [X]  │
├─────────────────────────────┤
│ Period: [14]           ←→   │ ← Slider
│ Overbought: [70]       ←→   │
│ Oversold: [30]         ←→   │
│ ─────────────────────────── │
│ Line-Color: [Cyan ▼]        │
│ Line-Width: [2px ▼]         │
│ ─────────────────────────── │
│ [Reset-Defaults] [Apply]    │
└─────────────────────────────┘
```

---

## 10. Component-Mapping

### 10.1 Existierende Components

- **ChartPageV2.tsx:** Page-Container
- **ChartHeader.tsx:** Toolbar
- **CandlesCanvas.tsx:** Main-Chart-Canvas
- **IndicatorBar.tsx:** Indicator-Panel
- **ZoomPanBar.tsx:** Zoom/Pan-Controls
- **Timeline.tsx:** Time-Axis
- **MiniMap.tsx:** MiniMap-Component
- **BacktestPanel.tsx:** Backtest-HUD
- **ReplayBar.tsx:** Timeline-Scrubber
- **ReplayHud.tsx:** Replay-Overlay
- **DrawToolbar.tsx:** Drawing-Tools-Menu

### 10.2 Missing/TODO

- **Token-Search-Dropdown:** Auto-complete with Recent/Popular
- **Indicator-Settings-Modal:** Configurable-Parameters
- **Fibonacci-Tool:** Interactive-Fibonacci-Retracement
- **Mobile-Touch-Handlers:** Pinch-zoom, swipe-pan
- **Chart-Library-Integration:** Lightweight-Charts or Custom-Canvas

---

**Status:** ✅ Wireframe-Spezifikation komplett
**Nächste-Schritte:** Analyze-Page, Access-Page, Signals-Page
