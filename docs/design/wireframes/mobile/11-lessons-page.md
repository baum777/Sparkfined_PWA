# Mobile Wireframe: LessonsPage (375px)

**Route:** `/lessons`  
**Purpose:** Trading Lessons Library - Extracted Wisdom from Trade Outcomes  
**Complexity:** ⭐⭐⭐ Medium (Filtering, stats, expandable cards)  
**Status:** ✅ Production Ready

---

## State 1: DEFAULT VIEW (With Lessons)

```
┌─────────────────────────────────┐
│ ┌───────────────────────────┐   │
│ │ 📚 Trading Lessons        │   │ ← Header (zinc-900)
│ │ Extracted wisdom from     │   │   Sticky header
│ │ your trades               │   │
│ └───────────────────────────┘   │
│                                 │
│ ╔═══════════════════════════════╗
│ ║  STATS OVERVIEW (4-Grid)     ║
│ ╠═══════════════════════════════╣
│ ║ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ║
│ ║ │Tot │ │High│ │Avg │ │Trds│ ║
│ ║ │ 18 │ │ 9  │ │72% │ │342 │ ║ ← Stats tiles
│ ║ └────┘ └────┘ └────┘ └────┘ ║   (Total, High Score,
│ ╚═══════════════════════════════╝   Avg WR, Total Trades)
│                                 │
│ ╔═══════════════════════════════╗
│ ║  ℹ️ HOW LESSONS WORK          ║
│ ╠═══════════════════════════════╣
│ ║  Lessons are automatically    ║
│ ║  extracted after accumulating ║ ← Info banner
│ ║  10+ trades for a pattern.    ║   (cyan-950/20)
│ ║  They analyze what works,     ║
│ ║  what fails, and provide      ║
│ ║  actionable checklists.       ║
│ ╚═══════════════════════════════╝
│                                 │
│ ╔═══════════════════════════════╗
│ ║  🔍 FILTERS                  ║
│ ╠═══════════════════════════════╣
│ ║  Pattern:                    ║
│ ║  [All] [Momentum] [Breakout] ║ ← Pill buttons
│ ║  [Reversal] [Range-Bounce]   ║   (flex-wrap)
│ ║                              ║
│ ║  Min Score: 50%              ║ ← Slider label
│ ║  ────●────────────────       ║ ← Range slider
│ ╚═══════════════════════════════╝
│                                 │
│ ╔═══════════════════════════════╗
│ ║  LESSON CARD 1               ║
│ ╠═══════════════════════════════╣
│ ║  💡 Momentum Lessons         ║ ← Pattern type
│ ║  Score: 85% · WR: 72%        ║ ← Score + Win Rate
│ ║  Sample: 24 trades           ║ ← Sample size
│ ║                              ║
│ ║  ✅ WHAT WORKS:              ║
│ ║  • Enter on volume spike     ║
│ ║  • Wait for SMA(20) cross    ║ ← Bullet list
│ ║  • Set stops below support   ║   (collapsible)
│ ║                              ║
│ ║  ❌ WHAT FAILS:              ║
│ ║  • Entering too early        ║
│ ║  • Ignoring macro trends     ║
│ ║                              ║
│ ║  [ Expand Details ▼ ]       ║ ← Expand button
│ ╚═══════════════════════════════╝
│                                 │
│ ╔═══════════════════════════════╗
│ ║  LESSON CARD 2               ║
│ ║  [Similar layout...]         ║
│ ╚═══════════════════════════════╝
│                                 │
│ [Bottom Navigation Bar]         │
└─────────────────────────────────┘
```

**Visual Hierarchy:**
- **Header:** Fixed with icon, title, subtitle
- **Stats:** 4-column grid, compact tiles
- **Info Banner:** Cyan accent, dismissible (optional)
- **Filters:** Collapsible panel (always visible on mobile)
- **Lesson Cards:** Vertical stack, expandable

---

## State 2: EXPANDED LESSON CARD

```
┌─────────────────────────────────┐
│ [HEADER, STATS, FILTERS - Same] │
│                                 │
│ ╔═══════════════════════════════╗
│ ║  LESSON CARD 1 (Expanded)    ║
│ ╠═══════════════════════════════╣
│ ║  💡 Momentum Lessons         ║
│ ║  Score: 85% · WR: 72%        ║
│ ║  Sample: 24 trades           ║
│ ║                              ║
│ ║  ✅ WHAT WORKS:              ║
│ ║  • Enter on volume spike     ║
│ ║  • Wait for SMA(20) cross    ║
│ ║  • Set stops below support   ║
│ ║  • Take profits at R:R 1:2   ║ ← More bullets visible
│ ║  • Confirm with RSI > 50     ║
│ ║                              ║
│ ║  ❌ WHAT FAILS:              ║
│ ║  • Entering too early        ║
│ ║  • Ignoring macro trends     ║
│ ║  • Overleveraging positions  ║
│ ║  • Moving stops too soon     ║
│ ║                              ║
│ ║  ─────────────────────       ║
│ ║                              ║
│ ║  📊 DETAILED STATS:          ║
│ ║  • Win Rate: 72% (18/25)     ║
│ ║  • Avg R:R: 1:2.3            ║ ← Detailed breakdown
│ ║  • Best Entry Time: 10-11 AM ║
│ ║  • Worst Time: 16-17 PM      ║
│ ║                              ║
│ ║  ─────────────────────       ║
│ ║                              ║
│ ║  📝 CHECKLIST (Before Entry):║
│ ║  ☐ Volume > 1.5x avg         ║
│ ║  ☐ Price > SMA(20)           ║ ← Interactive checklist
│ ║  ☐ RSI between 50-70         ║   (checkboxes)
│ ║  ☐ Stop set at key support   ║
│ ║  ☐ R:R ratio > 1:2           ║
│ ║                              ║
│ ║  [ Collapse Details ▲ ]      ║ ← Collapse button
│ ╚═══════════════════════════════╝
│                                 │
└─────────────────────────────────┘
```

**Behavior:**
- Click "Expand Details" → Card expands with animation
- Shows full DOs/DONTs, stats, and checklist
- Click "Collapse" → Card returns to summary view
- Smooth height transition (0.3s)

---

## State 3: EMPTY STATE (No Lessons)

```
┌─────────────────────────────────┐
│ [HEADER - Same as State 1]      │
│                                 │
│ [STATS - All zeros]             │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│ │ 0  │ │ 0  │ │ 0  │ │ 0  │    │
│ └────┘ └────┘ └────┘ └────┘    │
│                                 │
│ [INFO BANNER - Same]            │
│                                 │
│ ┌─────────────────────────────┐ │
│ │        📚                   │ │
│ │                             │ │ ← Empty state
│ │  No lessons yet. Trade more │ │   (StateView component)
│ │  to accumulate wisdom!      │ │
│ │                             │ │
│ │  ───────────────────        │ │
│ │                             │ │
│ │  Start detecting signals    │ │ ← CTA text
│ │  and tracking trades to     │ │
│ │  build your lesson library  │ │
│ │                             │ │
│ │  ┌─────────────────────┐   │ │
│ │  │ Analyze First Chart │   │ │ ← CTA button (cyan-600)
│ │  └─────────────────────┘   │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Trigger:** `lessons.length === 0 && !loading`  
**CTA:** Navigates to `/chart`

---

## State 4: LOADING STATE

```
┌─────────────────────────────────┐
│ [HEADER - Same]                 │
│                                 │
│ [STATS - Skeleton placeholders] │
│                                 │
│ [INFO BANNER - Hidden]          │
│                                 │
│ [FILTERS - Visible but disabled]│
│                                 │
│ ┌─────────────────────────────┐ │
│ │        ⏳                   │ │
│ │                             │ │ ← Loading state
│ │  Loading lessons...         │ │   (StateView component)
│ │                             │ │
│ │  [Spinner animation]        │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Trigger:** Initial data fetch from `useLessons()` hook

---

## Component Breakdown

### 1. Header
```
┌─────────────────────────────────┐
│ ┌───┐ Trading Lessons           │
│ │📚 │ Extracted wisdom from     │ ← Icon + Title
│ └───┘ your trades               │   Subtitle
└─────────────────────────────────┘
```
**Class:** `border-b border-zinc-800 bg-zinc-900 p-4`  
**Icon:** `<BookOpen>` in cyan-950/30 rounded box  
**Sticky:** Fixed at top when scrolling

### 2. Stats Overview
```
┌────┐ ┌────┐ ┌────┐ ┌────┐
│Tot │ │High│ │Avg │ │Trds│
│ 18 │ │ 9  │ │72% │ │342 │
└────┘ └────┘ └────┘ └────┘
```
**Grid:** `grid-cols-4 gap-2`  
**Tiles:** `border border-zinc-800 bg-zinc-900 p-3 text-center`  
**Colors:**
- Total: zinc-100
- High Score: emerald-500
- Avg WR: cyan-500
- Total Trades: zinc-100

**Calculations:**
```typescript
{
  total: filteredLessons.length,
  high_score: filteredLessons.filter(l => l.score >= 0.75).length,
  avg_win_rate: sum(l.stats.win_rate) / total,
  total_trades: sum(l.stats.trades_analyzed)
}
```

### 3. Info Banner
```
┌─────────────────────────────────┐
│ 📈 How Lessons Work             │
│                                 │
│ Lessons are automatically       │
│ extracted after accumulating... │
└─────────────────────────────────┘
```
**Layout:** `border border-cyan-800/50 bg-cyan-950/20 p-4`  
**Icon:** `<TrendingUp>` (cyan-500)  
**Dismissible:** Optional (not implemented in current version)

### 4. Filters Panel
```
┌─────────────────────────────────┐
│ 🔍 Filters                      │
├─────────────────────────────────┤
│ Pattern:                        │
│ [All] [Momentum] [Breakout]...  │
│                                 │
│ Min Score: 50%                  │
│ ────●────────────────           │
└─────────────────────────────────┘
```
**Same as SignalsPage, but with cyan accent colors**  
**Pattern Pills:**
- Active: `bg-cyan-600 text-white`
- Inactive: `bg-zinc-800 text-zinc-400 hover:bg-zinc-700`

### 5. Lesson Card (Collapsed)
```
┌───────────────────────────────┐
│ 💡 Momentum Lessons           │ ← Pattern type
│ Score: 85% · WR: 72%          │ ← Key metrics
│ Sample: 24 trades             │
│                               │
│ ✅ WHAT WORKS:                │
│ • Enter on volume spike       │ ← Top 3 DOs
│ • Wait for SMA(20) cross      │
│ • Set stops below support     │
│                               │
│ ❌ WHAT FAILS:                │
│ • Entering too early          │ ← Top 2 DON'Ts
│ • Ignoring macro trends       │
│                               │
│ [ Expand Details ▼ ]          │ ← Expand button
└───────────────────────────────┘
```
**Component:** `<LessonCard>`  
**Props:** `{ lesson: Lesson }`  
**Layout:** `border border-zinc-800 bg-zinc-900 p-4 space-y-3`  
**Hover:** `hover:border-cyan-500/50`

### 6. Lesson Card (Expanded)
**Adds:**
- Full DOs/DONTs lists (not truncated)
- Detailed stats section
- Interactive checklist
- "Collapse Details" button

**Animation:** Height transition (0.3s ease)

---

## Responsive Behavior

**Mobile (< 768px):**
- Stats: 4-column grid (compact)
- Filters: Full-width
- Lesson cards: Full-width stack
- Expanded cards: Full-width with scroll

**Tablet (768px - 1024px):**
- Stats: 4-column grid (more spacing)
- Filters: Full-width or sidebar (optional)
- Lesson cards: 2-column grid (optional)

**Desktop (> 1024px):**
- Stats: 4-column grid (wider spacing)
- Filters: Sticky sidebar (left) with cards on right
- Lesson cards: 2-column grid
- Expanded cards: May span 1 column or full-width

---

## Accessibility

| Criterion | Status | Implementation |
|-----------|--------|----------------|
| **Semantic HTML** | ✅ | `<header>`, `<section>`, `<button>`, `<ul>` |
| **Keyboard Nav** | ✅ | Tab through cards, Enter to expand/collapse |
| **Focus Management** | ✅ | Expanded card maintains focus on collapse button |
| **ARIA Labels** | ✅ | Stats have `aria-label`, expand buttons have descriptive text |
| **Color Contrast** | ✅ | All text meets WCAG AA |
| **Screen Reader** | ✅ | Lists announced, checkboxes interactive |

**Improvements Needed:**
- Add `aria-expanded` to expand/collapse buttons
- Announce lesson count on filter change

---

## Animations

**Page Load:**
- Stats tiles fade in (stagger by 0.1s)
- Info banner slide down
- Filter panel slide down
- Lesson cards stagger fade-in

**Expand/Collapse:**
- Card height transition (0.3s ease)
- Button icon rotation (▼ → ▲)
- Content fade-in/out (0.2s)

**Filter Changes:**
- Lesson cards fade out → new cards fade in (0.3s)
- Stats numbers animate on update

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| **No Lessons** | Empty state with CTA to analyze chart |
| **All Filtered Out** | Empty state with filter adjustment hint |
| **Loading Error** | Error state with retry button |
| **Network Offline** | Shows cached lessons (if available) + offline indicator |
| **Invalid Score** | Slider clamps to 0-1 range |
| **Insufficient Sample** | Lesson shows "Low confidence (< 10 trades)" warning |
| **Rapid Filter Changes** | Debounce by 300ms to avoid excessive re-renders |

---

## Data Flow

```
useLessons() Hook
    ↓
GET /api/lessons (or computed from trades locally)
    ↓
Filter by pattern (client-side)
    ↓
Filter by minScore (client-side)
    ↓
Calculate stats (total, high_score, avg_win_rate, total_trades)
    ↓
Render lesson cards
    ↓
onClick Expand → Show full details
```

**Hook:** `useLessons()` from `@/hooks/useSignals`  
**Return:** `{ lessons, loading, error }`  
**Lesson Type:** See `@/types/signal.ts` (Lesson interface)

---

## Lesson Extraction Logic (Backend)

**Trigger:** After accumulating 10+ trades for a pattern  
**Process:**
1. Aggregate all trades for pattern
2. Separate winners vs. losers
3. Identify common factors in winners (WHAT WORKS)
4. Identify common factors in losers (WHAT FAILS)
5. Calculate win rate, avg R:R, best/worst times
6. Generate checklist from top factors
7. Assign confidence score based on sample size

**Example:**
- 24 Momentum trades (18 wins, 6 losses)
- Winners: All had volume > 1.5x avg, price > SMA(20)
- Losers: All entered before volume spike
- → Lesson: "Wait for volume confirmation"

---

## Related Flows

| Flow | Link |
|------|------|
| **Lesson Extraction** | User Flows → Trade Outcome Analysis Flow |
| **Apply Lesson** | Checklist used in Chart Page → Pre-entry validation |
| **View Related Trades** | Lesson detail → "View Trades" button → Trade history |
| **Export Lessons** | Future: Export as PDF/MD for reference |

---

## Implementation Notes

**Key Dependencies:**
- `useLessons()` hook - Lesson fetching/computation
- `<LessonCard>` - Card component
- `<StateView>` - Loading/empty/error states
- `lucide-react` - Icons (BookOpen, TrendingUp, Filter)

**File:** `src/pages/LessonsPage.tsx`  
**Lines:** 197 lines  
**Complexity:** Medium (filtering, stats, expand/collapse)

**Future Enhancements:**
- Interactive checklist (save checked state)
- Export lessons as markdown
- "Apply Lesson" → Pre-fills chart setup
- Lesson versioning (track changes over time)

---

**Status:** ✅ Complete - Production ready with filtering & expandable cards
