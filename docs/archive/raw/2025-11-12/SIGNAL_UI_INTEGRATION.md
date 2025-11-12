# Signal Orchestrator UI Integration - Complete Guide

**Status:** ✅ **UI Components Ready**  
**Date:** 2025-11-04

---

## 🎨 ERSTELLTE UI COMPONENTS

### 1. **SignalCard** (`src/components/signals/SignalCard.tsx`)

Kompakte Karte für Signal-Übersichten

**Props:**
```typescript
{
  signal: Signal
  onClick?: () => void
  compact?: boolean
}
```

**Features:**
- Direction indicator (Long/Short) mit Icons
- Confidence Score mit Farb-Coding
- Pattern Badge
- Regime Display (Trend/Volatility)
- Risk Flags Warning
- Time Ago formatting
- Hover/Active states

---

### 2. **SignalReviewCard** (`src/components/signals/SignalReviewCard.tsx`)

Vollständige Signal-Review-Oberfläche mit Trade Plan

**Props:**
```typescript
{
  signal: Signal
  plan?: TradePlan
  onAccept?: () => void
  onReject?: () => void
}
```

**Features:**
- Signal Header mit Confidence
- Thesis Display
- Market Context (Trend/Vol/Liquidity)
- Risk Flags Warning
- Trade Plan Details:
  - Entry/Stop prices
  - Position Size
  - Take Profit Targets (TP1/TP2/TP3)
  - R:R, Expectancy, Win Prob
- Interactive Checklist
- Accept/Reject Actions

**UX:**
- Checklist must be completed before Accept
- Accept button disabled until all checks done
- Modal-ready (responsive for mobile/desktop)

---

### 3. **LessonCard** (`src/components/signals/LessonCard.tsx`)

Trading Lesson Display mit DOs/DONTs

**Props:**
```typescript
{
  lesson: Lesson
  onClick?: () => void
  compact?: boolean
}
```

**Features:**
- Pattern name & confidence score
- Win Rate, Avg R:R, Sample Size stats
- "When It Works" section (success conditions)
- "When It Fails" section (failure conditions)
- Checklist für Setup-Validation
- DOs (best practices)
- DON'Ts (common mistakes)
- Next Drill suggestion
- Compact mode for lists

**Color Coding:**
- Green zones: "When It Works", DOs
- Red zones: "When It Fails", DONTs
- Cyan zones: Next Drill

---

## 📄 NEUE PAGES

### 1. **SignalsPage** (`src/pages/SignalsPage.tsx`)

Trading Signals Dashboard

**Route:** `/signals`

**Features:**
- Stats Overview (Total, High Confidence, Long/Short counts)
- Pattern Filter (momentum, breakout, reversal, etc.)
- Confidence Threshold Slider
- Signals Grid mit SignalCard
- Signal Detail Modal (SignalReviewCard)
- Loading/Empty/Error states

**User Flow:**
1. User navigates to `/signals`
2. Sees all detected signals sorted by recent
3. Filters by pattern or confidence threshold
4. Clicks signal → Modal opens with full details
5. Reviews checklist → Accepts or Rejects

---

### 2. **LessonsPage** (`src/pages/LessonsPage.tsx`)

Trading Lessons Library

**Route:** `/lessons`

**Features:**
- Stats Overview (Total, High Score, Avg WR, Total Trades)
- Info Banner (explains how lessons work)
- Pattern Filter
- Score Threshold Slider
- Lessons List mit LessonCard (full detail)
- Empty State mit CTA to Chart Page

**User Flow:**
1. User navigates to `/lessons`
2. Sees extracted lessons sorted by confidence score
3. Filters by pattern
4. Reads "When It Works/Fails" sections
5. Reviews DOs/DONTs
6. Gets drill suggestions

---

## 🎣 CUSTOM HOOKS (`src/hooks/useSignals.ts`)

### Available Hooks:

```typescript
// All signals (optionally filtered by pattern)
const { signals, loading, error, refetch } = useSignals(pattern?)

// Single signal by ID
const { signal, loading, error } = useSignalById(id)

// Trade plans (optionally filtered by status)
const { plans, loading, error, refetch } = useTradePlans(status?)

// Single plan by ID
const { plan, loading, error } = useTradePlanById(id)

// Top lessons (optionally limited & filtered by pattern)
const { lessons, loading, error, refetch } = useLessons(limit?, pattern?)

// Single lesson by ID
const { lesson, loading, error } = useLessonById(id)

// Pattern performance stats
const { stats, loading, error } = usePatternStats(pattern)

// All trade outcomes
const { outcomes, loading, error, refetch } = useTradeOutcomes()

// Signal with associated plan (combined)
const { signal, plan, loading } = useSignalWithPlan(signalId)
```

---

## 🛣️ ROUTING

**Neue Routes hinzugefügt in `src/routes/RoutesRoot.tsx`:**

```typescript
<Route path="/signals" element={
  <Layout>
    <SignalsPage />
  </Layout>
} />

<Route path="/lessons" element={
  <Layout>
    <LessonsPage />
  </Layout>
} />
```

---

## 🌱 DEMO DATA SEEDING

**File:** `src/lib/seedSignalData.ts`

### Verwendung:

**Browser Console:**
```javascript
// Runs automatically on load (window.seedSignalData available)
seedSignalData()
```

**In Code:**
```typescript
import { seedAllDemoData } from '@/lib/seedSignalData'

// One-time seed (e.g., in Settings page)
await seedAllDemoData()
```

**Was wird geseedet:**
- 3 Demo Signals (SOL, ETH, BONK mit verschiedenen Patterns)
- 1 Demo Trade Plan (für SOL momentum signal)
- 2 Demo Action Nodes (signal.detected, trade.plan.created)
- 2 Demo Lessons (momentum-breakout, range-bounce)
- 1 Demo Trade Outcome (winning trade)

---

## 🔗 INTEGRATION IN BESTEHENDE PWA

### Schritt 1: Navigation Links hinzufügen

**BottomNav (Mobile) oder Sidebar (Desktop):**

```typescript
// src/components/layout/BottomNav.tsx oder Sidebar
import { TrendingUp, BookOpen } from 'lucide-react'

const navItems = [
  { path: '/signals', icon: TrendingUp, label: 'Signals' },
  { path: '/lessons', icon: BookOpen, label: 'Lessons' },
  // ... existing items
]
```

### Schritt 2: Signal Detection in ChartPage

**After HeuristicAnalysis:**

```typescript
import { detectSignal, generateTradePlan, createActionNode } from '@/lib/signalOrchestrator'
import { saveSignal, saveTradePlan, saveActionNode } from '@/lib/signalDb'

// Nach Erhalt von MarketSnapshot + Heuristics
const regime: MarketRegime = {
  trend: heuristics.bias === 'Bullish' ? 'up' : heuristics.bias === 'Bearish' ? 'down' : 'side',
  vol: heuristics.rangeSize === 'High' ? 'high' : heuristics.rangeSize === 'Low' ? 'low' : 'mid',
  liquidity: snapshot.liquidity.total > 1000000 ? 'high' : snapshot.liquidity.total > 100000 ? 'mid' : 'low',
}

const signal = detectSignal(snapshot, heuristics, regime)
await saveSignal(signal)

// Optional: Generate plan if confidence > 0.6
if (signal.confidence > 0.6) {
  const plan = generateTradePlan(signal, 10000, 1.0) // $10k account, 1% risk
  await saveTradePlan(plan)
  
  // Show SignalReviewCard in UI
  setShowSignalReview(true)
  setCurrentSignal(signal)
  setCurrentPlan(plan)
}
```

### Schritt 3: Outcome Tracking in JournalPage

**After Trade Close:**

```typescript
import { saveTradeOutcome, extractLesson, saveLesson } from '@/lib/signalDb'

const outcome: TradeOutcome = {
  plan_id: planId,
  signal_id: signalId,
  result: 'win', // or 'loss', 'breakeven'
  pnl_usd: 215.5,
  pnl_pct: 21.5,
  rr_actual: 2.15,
  held_duration: 14400,
  exit_reason: 'tp', // or 'sl', 'manual'
}

await saveTradeOutcome(outcome)

// After 10+ trades, extract lesson
const allOutcomes = await getAllTradeOutcomes()
if (allOutcomes.length >= 10) {
  const lesson = extractLesson(signal, plan, outcome, allOutcomes)
  await saveLesson(lesson)
}
```

---

## 🎨 DESIGN SYSTEM COMPLIANCE

**Alle Components folgen dem bestehenden Design:**

✅ **Design Tokens** (`tokens.css`):
- Colors: zinc palette, emerald (success), rose (danger), cyan (info)
- Spacing: 8px grid
- Radius: `var(--radius-md)`, `var(--radius-lg)`
- Typography: JetBrains Mono, font scales
- Motion: `var(--duration-short)`, `var(--ease-in-out)`

✅ **Component Patterns:**
- KPITile-style cards
- StateView für Loading/Error/Empty
- Hover/Active states mit scale
- Mobile-first responsive
- Tailwind CSS classes
- Lucide-react icons

✅ **Accessibility:**
- Semantic HTML
- ARIA labels wo nötig
- Keyboard navigation (Tab, Enter)
- Focus indicators
- Color contrast (WCAG AA)

---

## 📊 DATA FLOW

```
1. User uploads chart → HeuristicAnalysis
                       ↓
2. detectSignal() → Signal (with thesis, confidence)
                       ↓
3. saveSignal() → IndexedDB
                       ↓
4. generateTradePlan() → TradePlan (with R:R, targets)
                       ↓
5. saveTradePlan() → IndexedDB
                       ↓
6. User reviews SignalReviewCard → Accepts or Rejects
                       ↓
7. Trade execution (manual) → Record outcome
                       ↓
8. saveTradeOutcome() → IndexedDB
                       ↓
9. After 10+ trades → extractLesson()
                       ↓
10. saveLesson() → IndexedDB
                       ↓
11. User views LessonsPage → Learns from outcomes
```

---

## 🧪 TESTING

### Manual Testing Checklist:

**SignalsPage:**
- [ ] Navigate to `/signals`
- [ ] Seed demo data: `seedSignalData()`
- [ ] Verify signals appear
- [ ] Test pattern filter
- [ ] Test confidence slider
- [ ] Click signal → Modal opens
- [ ] Review SignalReviewCard
- [ ] Check checklist interaction
- [ ] Test Accept/Reject buttons

**LessonsPage:**
- [ ] Navigate to `/lessons`
- [ ] Verify lessons appear (if seeded)
- [ ] Test pattern filter
- [ ] Test score slider
- [ ] Verify stats display
- [ ] Read "When It Works/Fails" sections
- [ ] Check DOs/DONTs formatting
- [ ] Verify Next Drill display

**Hooks:**
- [ ] `useSignals()` loads data
- [ ] `useLessons()` loads data
- [ ] `useTradePlans()` loads data
- [ ] Loading states work
- [ ] Empty states display correctly

---

## 🚀 DEPLOYMENT CHECKLIST

- [x] UI Components erstellt
- [x] Pages erstellt (SignalsPage, LessonsPage)
- [x] Hooks erstellt (useSignals, useLessons, etc.)
- [x] Routes hinzugefügt
- [x] Seed Data Utility erstellt
- [ ] Navigation Links hinzufügen (BottomNav/Sidebar)
- [ ] ChartPage Integration (detectSignal nach Analyse)
- [ ] JournalPage Integration (Outcome Tracking)
- [ ] Build Test (npm run build)
- [ ] E2E Test (Signals → Lessons Flow)

---

## 📁 DATEIEN ÜBERSICHT

```
src/
├── components/
│   └── signals/
│       ├── SignalCard.tsx           ✅ Kompakte Signal-Karte
│       ├── SignalReviewCard.tsx     ✅ Vollständige Signal-Review
│       └── LessonCard.tsx           ✅ Lesson Display
├── pages/
│   ├── SignalsPage.tsx              ✅ Signals Dashboard
│   └── LessonsPage.tsx              ✅ Lessons Library
├── hooks/
│   └── useSignals.ts                ✅ DB Query Hooks
├── lib/
│   ├── signalOrchestrator.ts        ✅ Core Logic
│   ├── signalDb.ts                  ✅ IndexedDB Layer
│   └── seedSignalData.ts            ✅ Demo Data Seeding
├── types/
│   └── signal.ts                    ✅ Type Definitions
└── routes/
    └── RoutesRoot.tsx               ✅ Routes hinzugefügt
```

---

## 💡 NÄCHSTE SCHRITTE

### Immediate:
1. **Navigation Links hinzufügen** → BottomNav + Sidebar
2. **Seed Data testen** → Run `seedSignalData()` in console
3. **Pages testen** → Navigate to `/signals` & `/lessons`
4. **ChartPage Integration** → `detectSignal()` nach Analyse

### Short-Term:
1. **Real Signal Detection** → Integrate in ChartPage workflow
2. **Outcome Tracking** → Connect JournalPage to record results
3. **Lesson Extraction** → Trigger after 10+ trades
4. **Analytics Dashboard** → Pattern performance stats

### Medium-Term:
1. **On-Chain Data** → Real holder/liquidity metrics
2. **AI Commentary** → Enhanced thesis via OpenAI/Grok
3. **Backtesting** → Historical pattern validation
4. **Notifications** → Alert on high-confidence signals

---

**Status:** ✅ **UI READY FOR TESTING**  
**Next:** Add navigation links + seed demo data + integrate in ChartPage

**Quick Start:**
```bash
# 1. Build & Run
npm run dev

# 2. In Browser Console
seedSignalData()

# 3. Navigate
http://localhost:5173/signals
http://localhost:5173/lessons
```

---

**Dokumentation erstellt:** 2025-11-04  
**UI Components:** 3 Components, 2 Pages, 7 Hooks  
**Status:** Production-ready für Testing & Iteration
