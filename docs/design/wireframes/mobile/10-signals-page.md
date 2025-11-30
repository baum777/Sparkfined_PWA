# Mobile Wireframe: SignalsPage (375px)

**Route:** `/signals`  
**Purpose:** Trading Signals Dashboard - Pattern Detection & Trade Opportunities  
**Complexity:** ⭐⭐⭐ Medium-High (Filtering, stats, modal views)  
**Status:** ✅ Production Ready

---

## State 1: DEFAULT VIEW (With Signals)

```
┌─────────────────────────────────┐
│ ┌───────────────────────────┐   │
│ │ 📈 Trading Signals        │   │ ← Header (zinc-900)
│ │ Detected patterns & trade │   │   Sticky header
│ │ opportunities             │   │
│ └───────────────────────────┘   │
│                                 │
│ ╔═══════════════════════════════╗
│ ║  STATS OVERVIEW (4-Grid)     ║
│ ╠═══════════════════════════════╣
│ ║ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ║
│ ║ │Tot │ │High│ │Long│ │Shrt│ ║
│ ║ │ 24 │ │ 12 │ │ 15 │ │ 9  │ ║ ← Stats tiles
│ ║ └────┘ └────┘ └────┘ └────┘ ║   (4-column grid)
│ ╚═══════════════════════════════╝
│                                 │
│ ╔═══════════════════════════════╗
│ ║  🔍 FILTERS                  ║
│ ╠═══════════════════════════════╣
│ ║  Pattern:                    ║
│ ║  [All] [Momentum] [Breakout] ║ ← Pill buttons
│ ║  [Reversal] [Range-Bounce]   ║   (flex-wrap)
│ ║  [Mean-Reversion] [Continue] ║
│ ║                              ║
│ ║  Min Confidence: 60%         ║ ← Slider label
│ ║  ────●────────────────       ║ ← Range slider
│ ╚═══════════════════════════════╝
│                                 │
│ ╔═══════════════════════════════╗
│ ║  SIGNAL CARD 1               ║
│ ╠═══════════════════════════════╣
│ ║  🟢 Momentum · Long          ║ ← Pattern + Direction
│ ║  SOL/USDT                    ║ ← Symbol
│ ║  Confidence: 85%             ║ ← Confidence (emerald)
│ ║  Entry: $142.50 · Target: $155│ ← Trade params
│ ║  ⏰ Detected 5 mins ago      ║ ← Timestamp
│ ╚═══════════════════════════════╝
│                                 │
│ ╔═══════════════════════════════╗
│ ║  SIGNAL CARD 2               ║
│ ╠═══════════════════════════════╣
│ ║  🔴 Reversal · Short         ║
│ ║  BTC/USDT                    ║
│ ║  Confidence: 72%             ║
│ ║  Entry: $45,200 · Target: $44k│
│ ║  ⏰ Detected 12 mins ago     ║
│ ╚═══════════════════════════════╝
│                                 │
│ ╔═══════════════════════════════╗
│ ║  SIGNAL CARD 3               ║
│ ║  [Similar layout...]         ║
│ ╚═══════════════════════════════╝
│                                 │
│ [Bottom Navigation Bar]         │
└─────────────────────────────────┘
```

**Visual Hierarchy:**
- **Header:** Fixed with icon, title, subtitle
- **Stats:** 4-column grid, compact tiles
- **Filters:** Collapsible panel (always visible on mobile)
- **Signal Cards:** Vertical stack, full-width
- **Bottom Nav:** Standard 20px padding-bottom

---

## State 2: EMPTY STATE (No Signals / No Matches)

```
┌─────────────────────────────────┐
│ [HEADER - Same as State 1]      │
│                                 │
│ [STATS - All zeros]             │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│ │ 0  │ │ 0  │ │ 0  │ │ 0  │    │
│ └────┘ └────┘ └────┘ └────┘    │
│                                 │
│ [FILTERS - Same as State 1]     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │        ⚠️                   │ │
│ │                             │ │ ← Empty state
│ │  No signals match your      │ │   (StateView component)
│ │  filters                    │ │
│ │                             │ │
│ │  Try adjusting the pattern  │ │ ← Hint text
│ │  or lowering the confidence │ │
│ │  threshold                  │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Behavior:**
- Shows when `filteredSignals.length === 0`
- Provides actionable feedback (adjust filters)
- Icon: `<AlertCircle>` (zinc-700)

---

## State 3: LOADING STATE

```
┌─────────────────────────────────┐
│ [HEADER - Same]                 │
│                                 │
│ [STATS - Skeleton placeholders] │
│                                 │
│ [FILTERS - Visible but disabled]│
│                                 │
│ ┌─────────────────────────────┐ │
│ │        ⏳                   │ │
│ │                             │ │ ← Loading state
│ │  Loading signals...         │ │   (StateView component)
│ │                             │ │
│ │  [Spinner animation]        │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Trigger:** Initial data fetch from `useSignals()` hook

---

## State 4: SIGNAL DETAIL MODAL

```
┌─────────────────────────────────┐
│ [BACKDROP: bg-black/60]         │ ← Full-screen overlay
│                                 │
│ ┌───────────────────────────┐   │
│ │ Signal Details        [✕] │   │ ← Modal header
│ ├───────────────────────────┤   │
│ │                           │   │
│ │ 📊 SIGNAL CARD (Expanded) │   │
│ │                           │   │
│ │ Pattern: Momentum         │   │
│ │ Direction: Long           │   │
│ │ Symbol: SOL/USDT          │   │
│ │ Confidence: 85%           │   │
│ │                           │   │
│ │ ─────────────────────     │   │
│ │                           │   │
│ │ Entry: $142.50            │   │
│ │ Target: $155.00           │   │
│ │ Stop Loss: $138.20        │   │
│ │ Risk/Reward: 1:2.5        │   │
│ │                           │   │
│ │ ─────────────────────     │   │
│ │                           │   │
│ │ 📈 CHART PREVIEW          │   │
│ │ [Mini chart placeholder]  │   │ ← Future: mini chart
│ │                           │   │
│ │ ─────────────────────     │   │
│ │                           │   │
│ │ 📝 RATIONALE              │   │
│ │ • Strong momentum above   │   │ ← AI-generated
│ │   SMA(20)                 │   │   reasoning
│ │ • Volume spike confirmed  │   │
│ │ • RSI showing strength    │   │
│ │                           │   │
│ │ ─────────────────────     │   │
│ │                           │   │
│ │ ┌───────────┐ ┌─────────┐│   │
│ │ │ ✅ Accept │ │ ❌ Reject││   │ ← Action buttons
│ │ └───────────┘ └─────────┘│   │
│ │                           │   │
│ │ [ Copy to Clipboard ]     │   │ ← Secondary action
│ │                           │   │
│ └───────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Trigger:** Click any signal card  
**Dismiss:** Click backdrop, close button, or after action  
**Component:** `<SignalReviewCard>`  
**Actions:**
- **Accept:** Logs acceptance, creates trade idea (future)
- **Reject:** Logs rejection, provides feedback (future)
- **Copy:** Copies signal details to clipboard

---

## Component Breakdown

### 1. Header
```
┌─────────────────────────────────┐
│ ┌───┐ Trading Signals          │
│ │📈 │ Detected patterns & trade │ ← Icon + Title
│ └───┘ opportunities             │   Subtitle
└─────────────────────────────────┘
```
**Class:** `border-b border-zinc-800 bg-zinc-900 p-4`  
**Icon:** `<TrendingUp>` in emerald-950/30 rounded box  
**Sticky:** Fixed at top when scrolling

### 2. Stats Overview
```
┌────┐ ┌────┐ ┌────┐ ┌────┐
│Tot │ │High│ │Long│ │Shrt│
│ 24 │ │ 12 │ │ 15 │ │ 9  │
└────┘ └────┘ └────┘ └────┘
```
**Grid:** `grid-cols-4 gap-2`  
**Tiles:** `border border-zinc-800 bg-zinc-900 p-3 text-center`  
**Colors:**
- Total: zinc-100
- High Conf: emerald-500
- Long: emerald-500
- Short: rose-500

### 3. Filters Panel
```
┌─────────────────────────────────┐
│ 🔍 Filters                      │
├─────────────────────────────────┤
│ Pattern:                        │
│ [All] [Momentum] [Breakout]...  │
│                                 │
│ Min Confidence: 60%             │
│ ────●────────────────           │
└─────────────────────────────────┘
```
**Layout:** `border border-zinc-800 bg-zinc-900 p-4 space-y-3`  
**Pattern Pills:**
- Active: `bg-emerald-600 text-white`
- Inactive: `bg-zinc-800 text-zinc-400 hover:bg-zinc-700`
**Slider:** Native `<input type="range">`  
- Min: 0, Max: 1, Step: 0.05
- Value displayed as percentage

### 4. Signal Card
```
┌───────────────────────────────┐
│ 🟢 Momentum · Long            │
│ SOL/USDT                      │
│ Confidence: 85%               │
│ Entry: $142.50 · Target: $155 │
│ ⏰ Detected 5 mins ago        │
└───────────────────────────────┘
```
**Component:** `<SignalCard>`  
**Props:** `{ signal: Signal, onClick: () => void }`  
**Layout:** `border border-zinc-800 bg-zinc-900 p-4 space-y-2`  
**Clickable:** Opens detail modal  
**Hover:** `hover:border-emerald-500/50 hover:bg-zinc-800`

---

## Responsive Behavior

**Mobile (< 768px):**
- Stats: 4-column grid (compact)
- Filters: Full-width, always visible
- Signal cards: Full-width stack
- Modal: Slide up from bottom (`rounded-t-2xl`)

**Tablet (768px - 1024px):**
- Stats: 4-column grid (more spacing)
- Filters: Full-width
- Signal cards: May use 2-column grid (optional)
- Modal: Centered with max-width

**Desktop (> 1024px):**
- Stats: 4-column grid (wider spacing)
- Filters: Sticky sidebar (left) with cards on right (future)
- Signal cards: 2-column grid
- Modal: Centered with max-width-2xl

---

## Accessibility

| Criterion | Status | Implementation |
|-----------|--------|----------------|
| **Semantic HTML** | ✅ | `<header>`, `<section>`, `<button>` |
| **Keyboard Nav** | ✅ | Tab through cards, Enter to open, Esc to close modal |
| **Focus Trap** | ⚠️ | Modal should trap focus (implement with focus-lock) |
| **ARIA Labels** | ✅ | Stats have `aria-label`, modal has `role="dialog"` |
| **Color Contrast** | ✅ | All text meets WCAG AA |
| **Screen Reader** | ✅ | Signal details announced on modal open |

**Improvements Needed:**
- Add focus trap to modal
- Announce filter changes to screen readers
- Add skip link to main content

---

## Animations

**Page Load:**
- Stats tiles fade in (stagger by 0.1s)
- Filter panel slide down
- Signal cards stagger fade-in

**Modal:**
- Backdrop fade-in (0.2s)
- Modal slide-up from bottom (mobile) or fade-in (desktop)
- Close with reverse animation

**Filter Changes:**
- Signal cards fade out → new cards fade in (0.3s)
- Stats numbers animate on update

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| **No Signals** | Empty state with icon + hint |
| **All Filtered Out** | Empty state with filter adjustment hint |
| **Loading Error** | Error state with retry button (StateView type="error") |
| **Network Offline** | Shows cached signals (if available) + offline indicator |
| **Invalid Confidence** | Slider clamps to 0-1 range |
| **Rapid Filter Changes** | Debounce by 300ms to avoid excessive re-renders |

---

## Data Flow

```
useSignals(pattern) Hook
    ↓
GET /api/signals?pattern={pattern}
    ↓
Filter by minConfidence (client-side)
    ↓
Calculate stats (total, high_conf, long, short)
    ↓
Render signal cards
    ↓
onClick → Open detail modal with <SignalReviewCard>
```

**Hook:** `useSignals()` from `@/hooks/useSignals`  
**Return:** `{ signals, loading, error }`  
**Signal Type:** See `@/types/signal.ts`

---

## Related Flows

| Flow | Link |
|------|------|
| **Signal Detection** | User Flows → Signal Generation Flow |
| **Accept Signal** | Creates Trade Idea → Notifications Page |
| **Reject Signal** | Logs feedback → Improves future signals (ML) |
| **View Chart** | Signal detail → "View Chart" button → Chart Page |

---

## Implementation Notes

**Key Dependencies:**
- `useSignals()` hook - Signal fetching
- `<SignalCard>` - Card component
- `<SignalReviewCard>` - Detail view component
- `<StateView>` - Loading/empty/error states
- `lucide-react` - Icons (TrendingUp, Filter, AlertCircle)

**File:** `src/pages/SignalsPage.tsx`  
**Lines:** 201 lines  
**Complexity:** Medium-High (filtering, modal, stats calculation)

---

**Status:** ✅ Complete - Production ready with filtering & detail view
