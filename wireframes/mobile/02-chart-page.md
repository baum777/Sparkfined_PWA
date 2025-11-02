# Chart Page — Mobile Wireframe (375px)

**Screen:** ChartPage (`/chart`)  
**TL;DR:** Advanced candlestick charting with drawing tools, replay mode, backtest engine, and export

---

## State 1: Default (With Data)

```
┌─────────────────────────────────────────┐
│  [Header: Chart]                   [⚙️]  │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │ // ChartHeader component
│  │ [CA Input]         [TF⌄] [Load]  │  │ // Sticky header controls
│  │ 7xKF...abc123       15m           │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────────┐│ // Indicator Bar
│  │ [x] SMA20  [x] EMA20  [ ] VWAP     ││ // Checkboxes for indicators
│  └─────────────────────────────────────┘│ // text-xs gap-2
│                                         │
│  ┌─────────────────────────────────────┐│ // DrawToolbar
│  │ [→] [—] [/] [ψ] [↶] [↷] [Clear]   ││ // Tool icons: Cursor, HLine, Trend, Fib
│  │  •   •   •   •   •   •   •          ││ // Active tool has bg-emerald-700
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // ZoomPan Bar
│  │ [+][-][Reset] Snap:[ON] Range:...  ││ // Zoom controls + snap toggle
│  └─────────────────────────────────────┘│ // text-xs flex items-center
│                                         │
│  ┌─────────────────────────────────────┐│ // ReplayBar
│  │ [▶️] [⏸️] Speed:[2x⌄] [←][→]         ││ // Play/Pause, speed selector, step buttons
│  │ [+Bookmark] Bookmarks: [1][2][3]   ││ // Add bookmark + quick jump (1-6 keys)
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Chart Canvas (main)
│  │                                     ││ // border-zinc-800 rounded-2xl
│  │     📈 Candlestick Chart            ││ // bg-zinc-900/40 p-2
│  │                                     ││
│  │    ▌▌▌▌▌▌▌▌▌▌▌▌▌▌                  ││ // Canvas element 
│  │    ││││││││││││││                  ││ // Candles + indicators + shapes
│  │  ╔═══════════════╗                 ││ // Drawing example (user shape)
│  │  ║               ║                 ││
│  │  ╚═══════════════╝                 ││
│  │    ││││││││││││││                  ││
│  │    ▌▌▌▌▌▌▌▌▌▌▌▌▌▌                  ││
│  │                                     ││
│  │  ┌─────────────────────────────┐   ││ // HUD Overlay (top-left)
│  │  │ 7xKF...abc · 15m            │   ││ // if showHud enabled
│  │  │ Bar 45/96  O:0.0045         │   ││ // text-xs bg-black/80 p-2
│  │  │ H:0.0047 L:0.0043 C:0.0046  │   ││ // rounded text-zinc-300
│  │  └─────────────────────────────┘   ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Export Actions (scrollable)
│  │ [Export PNG][Copy PNG][Shortlink]  ││ // flex-wrap gap-2
│  │ [→Journal][Export JSON][Import...]  ││
│  └─────────────────────────────────────┘│
│                                         │
│  [MiniMap] [Timeline] [Backtest Panel] │ // Collapsible sections below
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Canvas**: `<canvas>` element, aspect ratio ~16:9 or dynamic height
- **HUD Overlay**: Positioned absolute top-left within canvas container
- **Drawing Tools**: Active tool has `bg-emerald-700`, others `border-zinc-700`
- **Replay Cursor**: Vertical line on canvas (not shown in ASCII)

---

## State 2: Replay Mode Active

```
┌─────────────────────────────────────────┐
│  [Header: Chart]                   [⚙️]  │
├─────────────────────────────────────────┤
│  [Controls collapsed to save space]     │
│                                         │
│  ┌─────────────────────────────────────┐│ // ReplayBar (expanded)
│  │ [⏸️] Speed:[4x⌄] [←←][←][→][→→]     ││ // Playing at 4x speed
│  │ Progress: ▓▓▓▓▓▓░░░░░ 67/96        ││ // Progress bar
│  │ [+Bookmark] Bookmarks: [1][2][3]   ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Chart with Replay Cursor
│  │     📈 Chart (Replay Active)        ││
│  │                                     ││
│  │    ▌▌▌▌▌▌▌▌▌▌▌▌▌│                  ││ // Replay cursor (│) at bar 67
│  │    ││││││││││││││                  ││ // Bars after cursor are hidden/dimmed
│  │    ▌▌▌▌▌▌▌▌▌▌▌▌▌│░░░░░░           ││
│  │                                     ││
│  │  ┌─────────────────────────────┐   ││ // Replay HUD (enhanced)
│  │  │ ▶️ Playing 4x                │   ││
│  │  │ Bar 67/96  O:0.0046         │   ││
│  │  │ H:0.0048 L:0.0045 C:0.0047  │   ││
│  │  └─────────────────────────────┘   ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  View follows cursor automatically      │ // text-xs text-zinc-500
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Replay Cursor**: Vertical line that advances automatically or via step buttons
- **View Auto-Follow**: View window adjusts to keep cursor in frame (70% from left)
- **Hidden Bars**: Bars after cursor are dimmed or hidden in replay mode

---

## State 3: Drawing Mode (Trend Line)

```
┌─────────────────────────────────────────┐
│  [Header: Chart]                   [⚙️]  │
├─────────────────────────────────────────┤
│  [CA: 7xKF...abc] [15m] [Load]          │
│                                         │
│  ┌─────────────────────────────────────┐│ // DrawToolbar
│  │ [ ] [—] [/] [ψ] [↶] [↷] [Clear]   ││ // Trend tool active (/)
│  │  •   •   •   •   •   •   •          ││ // bg-emerald-700 on active
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Chart with Shape
│  │     📈 Chart (Drawing Mode)         ││
│  │                                     ││
│  │    ▌▌▌▌▌▌▌▌▌▌▌▌▌▌                  ││
│  │    ││││││││││││││                  ││
│  │     ╱                               ││ // User-drawn trend line
│  │    ╱                                ││ // Snaps to candle wicks if snap=ON
│  │   ╱                                 ││
│  │  ╱   ▌▌▌▌▌▌▌▌▌▌                    ││
│  │      ││││││││││                    ││
│  │                                     ││
│  │  Snap: ON                           ││ // Indicator text
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  Selected: trend-abc123…                │ // text-xs text-zinc-500
│  [Löschen] [Undo] [Redo]                │ // Action buttons for selected shape
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Drawing**: Touch/mouse drag to create shape
- **Snap**: When enabled, shapes snap to OHLC points
- **Selection**: Click shape to select, shows ID + delete button
- **Persistence**: Shapes saved to localStorage on change

---

## State 4: Backtest Results

```
┌─────────────────────────────────────────┐
│  [Header: Chart]                   [⚙️]  │
├─────────────────────────────────────────┤
│  [Controls collapsed]                   │
│                                         │
│  ┌─────────────────────────────────────┐│ // BacktestPanel (expanded)
│  │ 🔬 Backtest Panel                   ││ // border-cyan-900 bg-cyan-950/20
│  │                                     ││
│  │ Rules: 3 active                     ││
│  │ [Run Client] [Run Server]           ││
│  │                                     ││
│  │ Results: 12 hits (234 ms)           ││ // Server execution time
│  │                                     ││
│  │ ┌───────────────────────────────┐   ││ // Results table (scrollable)
│  │ │ #  Rule        Bar    Price   │   ││
│  │ │ 1  price-cross  23   0.00451 │   ││ // Clickable rows
│  │ │ 2  pct-change   45   0.00478 │   ││ // onClick: jumps to bar
│  │ │ 3  price-cross  67   0.00492 │   ││
│  │ │ ...                           │   ││
│  │ └───────────────────────────────┘   ││
│  │                                     ││
│  │ [← Prev] [Next →]                   ││ // Pagination (500/page)
│  │ Page 1/3                            ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Chart with Timeline markers
│  │     📈 Chart (with BT markers)      ││
│  │                                     ││
│  │    ▌▌▌▌▌▌▌▌▌▌▌▌▌▌                  ││
│  │    ││││││││││││││                  ││
│  │        🔵  🔵     🔵                ││ // Markers at hit timestamps
│  │    ▌▌▌▌▌▌▌▌▌▌▌▌▌▌                  ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Backtest Panel**: `border-cyan-900 bg-cyan-950/20 p-3 rounded-xl`
- **Hit Markers**: Circles on timeline at trigger timestamps
- **Clickable Rows**: Jump to specific bar on chart
- **Pagination**: Server backtest supports pagination (500 hits/page)

---

## State 5: MiniMap & Timeline Visible

```
┌─────────────────────────────────────────┐
│  [Header: Chart]                   [⚙️]  │
├─────────────────────────────────────────┤
│  [Main Chart - scrolled down]           │
│                                         │
│  ┌─────────────────────────────────────┐│ // MiniMap (if showMinimap=true)
│  │ 🗺️ Mini-Map Navigator               ││ // border-zinc-800 p-2 rounded
│  │ ┌─────────────────────────────────┐ ││
│  │ │ ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁                 │ ││ // Miniature chart outline
│  │ │   ╔═══════╗                     │ ││ // View window indicator
│  │ │ ▁▂╚═══════╝▃▂▁                 │ ││ // Draggable to change view
│  │ └─────────────────────────────────┘ ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Timeline (if showTimeline=true)
│  │ ⏱️ Event Timeline                   ││ // border-zinc-800 p-2 rounded
│  │ ┌─────────────────────────────────┐ ││
│  │ │ ●    ●        ●     ●   ●       │ ││ // Event markers (bookmarks, alerts)
│  │ │ ├────┼────────┼─────┼───┼───────┤││ // Timeline axis
│  │ │ 0   20       50    70  96       │ ││ // Bar indices
│  │ └─────────────────────────────────┘ ││
│  │ Click marker to jump                ││
│  └─────────────────────────────────────┘│
│  [Clear Events]                         │
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **MiniMap**: Draggable view window, shows full data range
- **Timeline**: Event markers clickable, jumps replay cursor to timestamp
- **Toggle**: Both can be hidden via Settings (showMinimap, showTimeline)

---

## COMPONENT BREAKDOWN

| Component | Event | Action | Animation |
|-----------|-------|--------|-----------|
| Input: CA | onChange | setAddress(value) | none |
| Dropdown: TF | onChange | setTf(value) | none |
| Button: Load | onClick | load() → fetchOhlc() | loading text |
| Checkbox: SMA20/EMA20/VWAP | onChange | setIndState() | recalc indicators |
| Tool Button | onClick | setTool(kind) | bg-emerald-700 on active |
| Button: Undo/Redo | onClick | doUndo() / doRedo() | shape restore |
| Button: Clear | onClick | clearAll() | confirm prompt |
| Button: Zoom In/Out | onClick | zoomStep(0.85 or 1.15) | view adjust |
| Button: Play/Pause | onClick | replay.start/stop() | icon swap |
| Dropdown: Speed | onChange | replay.setSpeed(value) | speed change |
| Button: Step | onClick | onStep(dir, size) | cursor move |
| Button: Add Bookmark | onClick | addBookmark(label) | prompt for label |
| Bookmark Badge | onClick | onJumpTimestamp(t) | view jump |
| Button: Export PNG | onClick | exportWithHud() → download | none |
| Button: Copy PNG | onClick | exportWithHud() → clipboard | alert |
| Button: Copy Shortlink | onClick | encodeToken() → clipboard | alert |
| Button: →Journal | onClick | exportPng() + broadcast event | alert |
| Button: Export JSON | onClick | downloadJson(state) | none |
| Button: Import JSON | onChange | importAppData(file) | state restore |
| Button: Run Backtest | onClick | runBacktest() or POST /api/backtest | loading state |
| Backtest Row | onClick | onJumpTimestamp(hit.t) | view jump + cursor |
| MiniMap View Window | onDrag | setView({ start, end }) | view pan |
| Timeline Marker | onClick | onJumpTimestamp(event.t) | view jump |

---

## KEYBOARD SHORTCUTS

| Key | Action |
|-----|--------|
| **Space** | Play/Pause replay |
| **← / →** | Step backward/forward (1 bar) |
| **Shift + ← / →** | Step backward/forward (10 bars) |
| **1-6** | Jump to bookmark N |
| **H** | Select HLine tool |
| **T** | Select Trend tool |
| **F** | Select Fib tool |
| **Esc** | Select Cursor tool (default) |
| **Ctrl/Cmd + Z** | Undo |
| **Ctrl/Cmd + Y** | Redo |
| **Delete / Backspace** | Delete selected shape |

---

## RESPONSIVE BEHAVIOR

### Mobile (<768px)
- Chart: Full width, aspect ratio ~1.5:1
- Toolbars: Flex-wrap, icons may stack
- Buttons: Smaller text (text-xs), compact padding

### Tablet (768px - 1024px)
- Chart: Wider, aspect ratio ~2:1
- Toolbars: Single row, horizontal scroll if needed

### Desktop (>1024px)
- Chart: Max-width 1152px, aspect ratio ~2.5:1
- Toolbars: Full row, no wrapping
- MiniMap/Timeline: Side-by-side on ultra-wide

---

## ACCESSIBILITY

- **Canvas**: ARIA role="img", alt text for chart
- **Hotkeys**: Document in help tooltip
- **Touch Targets**: Buttons should be min 44px (currently ~36px)
- **Color Contrast**: Indicators use distinct colors (green/red/blue)

---

## PERFORMANCE NOTES

- **Canvas Rendering**: Optimized for 60 FPS
- **Shape Persistence**: LocalStorage write on debounced change (not every pixel)
- **Indicator Calc**: Memoized (useMemo), only recalc on data/state change
- **Replay**: requestAnimationFrame loop with speed multiplier

---

**Storybook Variants:** Default, Replay Active, Drawing Mode, Backtest Results, Empty State
