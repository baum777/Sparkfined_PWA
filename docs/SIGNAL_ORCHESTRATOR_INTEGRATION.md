# Signal Orchestrator Integration Guide

**AI Signal Orchestrator & Learning Architect** - Complete integration documentation for Sparkfined PWA.

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIGNAL ORCHESTRATOR LAYER                     │
│                                                                   │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐              │
│  │   Signals  │──→│ TradePlans │──→│  Outcomes  │              │
│  │ (Detected) │   │(Generated) │   │ (Tracked)  │              │
│  └────────────┘   └────────────┘   └────────────┘              │
│         │                 │                 │                    │
│         └─────────────────┴─────────────────┘                   │
│                           │                                      │
│                    ┌──────▼───────┐                             │
│                    │ Action Graph │  (Event Sourcing)           │
│                    │    Nodes     │                             │
│                    └──────┬───────┘                             │
│                           │                                      │
│                    ┌──────▼───────┐                             │
│                    │   Lessons    │  (Learning Layer)           │
│                    │  (Extracted) │                             │
│                    └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
          ┌──────────────────────────────────────┐
          │     EXISTING SPARKFINED PWA          │
          │                                      │
          │  • MarketSnapshot normalization      │
          │  • Provider orchestration            │
          │  • HeuristicAnalysis                 │
          │  • IndexedDB (trades/events)         │
          │  • Board/Chart/Journal UIs           │
          └──────────────────────────────────────┘
```

---

## 📦 Components Created

### 1. **Type Definitions** (`src/types/signal.ts`)

- `Signal` - Normalized signal with thesis, confidence, regime
- `TradePlan` - Executable plan with risk/targets/expectancy
- `ActionNode` - Event-sourced graph node
- `Lesson` - Distilled learning from outcomes
- `SignalOrchestratorOutput` - Standardized output contract

### 2. **Core Logic** (`src/lib/signalOrchestrator.ts`)

- `detectSignal()` - Pattern detection from MarketSnapshot + Heuristics
- `generateTradePlan()` - Risk management + position sizing
- `createActionNode()` - Event sourcing
- `extractLesson()` - Learning from outcomes
- `performRiskCheck()` - Pre-trade guardrails

### 3. **Database Layer** (`src/lib/signalDb.ts`)

- Extended IndexedDB schema: `signals`, `trade_plans`, `action_nodes`, `lessons`, `trade_outcomes`, `edges`
- Full CRUD operations
- Analytics: `getPatternStats()`, `exportAllData()`

---

## 🚀 Integration Steps

### Step 1: Connect to Existing Analysis Flow

**File:** `src/pages/ChartPage.tsx` (or wherever analysis happens)

```typescript
import { detectSignal, generateTradePlan, createActionNode, buildOrchestratorOutput } from '@/lib/signalOrchestrator'
import { saveSignal, saveTradePlan, saveActionNode } from '@/lib/signalDb'
import type { MarketRegime } from '@/types/signal'

// After receiving MarketSnapshot + HeuristicAnalysis:
async function processMarketData(snapshot: MarketSnapshot, heuristics: HeuristicAnalysis) {
  // 1. Classify regime (can be enhanced with ML later)
  const regime: MarketRegime = {
    trend: heuristics.bias === 'Bullish' ? 'up' : heuristics.bias === 'Bearish' ? 'down' : 'side',
    vol: heuristics.rangeSize === 'High' ? 'high' : heuristics.rangeSize === 'Low' ? 'low' : 'mid',
    liquidity: snapshot.liquidity.total > 1000000 ? 'high' : snapshot.liquidity.total > 100000 ? 'mid' : 'low',
  }

  // 2. Detect signal
  const signal = detectSignal(snapshot, heuristics, regime)
  await saveSignal(signal)

  // 3. Create action node
  const signalNode = createActionNode(
    'signal.detected',
    { pattern: signal.pattern, confidence: signal.confidence },
    { signal_id: signal.id },
    [`setup/${signal.pattern}`, `chain/${signal.market.chain}`],
    signal.confidence
  )
  await saveActionNode(signalNode)

  // 4. Generate trade plan (if signal confidence > 0.6)
  if (signal.confidence > 0.6) {
    const plan = generateTradePlan(signal, 10000, 1.0) // $10k account, 1% risk
    await saveTradePlan(plan)

    const planNode = createActionNode(
      'trade.plan.created',
      { entry_price: plan.entry.price, rr: plan.metrics.rr },
      { signal_id: signal.id, plan_id: plan.id, prev_node_id: signalNode.id },
      [`plan/created`, `rr>${Math.floor(plan.metrics.rr)}`],
      1.0
    )
    await saveActionNode(planNode)

    // 5. Return orchestrator output
    return buildOrchestratorOutput(
      [signal],
      [plan],
      [],
      [signalNode, planNode],
      [[signalNode.id, planNode.id, 'CAUSES']],
      `Detected ${signal.pattern} signal on ${signal.market.symbol} with ${(signal.confidence * 100).toFixed(0)}% confidence. Generated plan with ${plan.metrics.rr.toFixed(1)}:1 R:R. Entry: ${plan.entry.price.toFixed(2)}, Stop: ${plan.risk.stop.toFixed(2)}.`
    )
  }

  return null
}
```

---

### Step 2: Add Signal Review UI

**New Component:** `src/components/SignalReviewCard.tsx`

```typescript
import type { Signal, TradePlan } from '@/types/signal'

interface SignalReviewCardProps {
  signal: Signal
  plan?: TradePlan
}

export function SignalReviewCard({ signal, plan }: SignalReviewCardProps) {
  return (
    <div className="signal-review-card">
      <h3>{signal.market.symbol} - {signal.pattern}</h3>
      <p className="thesis">{signal.thesis}</p>
      
      <div className="metrics">
        <span>Confidence: {(signal.confidence * 100).toFixed(0)}%</span>
        <span>Direction: {signal.direction.toUpperCase()}</span>
        <span>Regime: {signal.regime.trend}/{signal.regime.vol}</span>
      </div>

      {plan && (
        <div className="trade-plan">
          <h4>Trade Plan</h4>
          <table>
            <tr><td>Entry:</td><td>${plan.entry.price.toFixed(2)}</td></tr>
            <tr><td>Stop:</td><td>${plan.risk.stop.toFixed(2)}</td></tr>
            <tr><td>R:R:</td><td>{plan.metrics.rr.toFixed(1)}:1</td></tr>
            <tr><td>Position:</td><td>{plan.risk.pos_size_units.toFixed(2)} units</td></tr>
          </table>

          <h5>Targets</h5>
          <ul>
            {plan.targets.map((t) => (
              <li key={t.tp}>TP{t.tp}: ${t.price.toFixed(2)} ({(t.share * 100).toFixed(0)}%)</li>
            ))}
          </ul>

          <h5>Checklist</h5>
          <ul>
            {plan.checklist.map((c) => (
              <li key={c}>
                <input type="checkbox" /> {c.replace('_', ' ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {signal.features.risk_flags.length > 0 && (
        <div className="risk-flags warning">
          ⚠️ Risk Flags: {signal.features.risk_flags.join(', ')}
        </div>
      )}
    </div>
  )
}
```

---

### Step 3: Track Trade Outcomes

**After trade closes:**

```typescript
import { saveTradeOutcome, extractLesson, saveLesson, saveActionNode } from '@/lib/signalDb'
import type { TradeOutcome } from '@/types/signal'

async function recordTradeOutcome(
  planId: string,
  signalId: string,
  result: 'win' | 'loss' | 'breakeven',
  pnlUsd: number,
  exitReason: 'tp' | 'sl' | 'manual'
) {
  const outcome: TradeOutcome = {
    plan_id: planId,
    signal_id: signalId,
    result,
    pnl_usd: pnlUsd,
    pnl_pct: pnlUsd / 100, // Calculate from initial investment
    rr_actual: 2.5, // Calculate from actual exit vs stop
    held_duration: 3600 * 4, // 4 hours in seconds
    exit_reason: exitReason,
  }

  await saveTradeOutcome(outcome)

  // Create outcome node
  const outcomeNode = createActionNode(
    result === 'win' ? 'takeprofit.hit' : 'stoploss.hit',
    { pnl_usd: pnlUsd, rr_actual: outcome.rr_actual },
    { plan_id: planId, signal_id: signalId },
    [result === 'win' ? 'win/trade' : 'loss/trade', `rr>${Math.floor(outcome.rr_actual)}`],
    1.0
  )
  await saveActionNode(outcomeNode)

  // Extract lesson (after accumulating ~10 trades)
  const similarOutcomes = await getTradeOutcomesBySignal(signalId) // from signalDb
  if (similarOutcomes.length >= 10) {
    const signal = await getSignalById(signalId)
    const plan = await getTradePlanById(planId)
    if (signal && plan) {
      const lesson = extractLesson(signal, plan, outcome, similarOutcomes)
      await saveLesson(lesson)

      const lessonNode = createActionNode(
        'lesson.curated',
        { pattern: lesson.pattern, score: lesson.score },
        { signal_id: signalId, plan_id: planId },
        ['lesson/extracted', `pattern/${lesson.pattern}`],
        lesson.score
      )
      await saveActionNode(lessonNode)
    }
  }
}
```

---

### Step 4: Display Lessons

**New Page:** `src/pages/LessonsPage.tsx`

```typescript
import { useEffect, useState } from 'react'
import { getTopLessons } from '@/lib/signalDb'
import type { Lesson } from '@/types/signal'

export function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])

  useEffect(() => {
    getTopLessons(10).then(setLessons)
  }, [])

  return (
    <div className="lessons-page">
      <h1>📚 Trading Lessons</h1>
      <p>Distilled wisdom from your action graph</p>

      {lessons.map((lesson) => (
        <div key={lesson.id} className="lesson-card">
          <h2>{lesson.pattern}</h2>
          <p className="score">Confidence: {(lesson.score * 100).toFixed(0)}%</p>

          {lesson.stats && (
            <div className="stats">
              <span>Win Rate: {(lesson.stats.win_rate * 100).toFixed(0)}%</span>
              <span>Avg R:R: {lesson.stats.avg_rr.toFixed(1)}</span>
              <span>Trades: {lesson.stats.trades_analyzed}</span>
            </div>
          )}

          <section>
            <h3>✅ When It Works</h3>
            <p>{lesson.when_it_works}</p>
          </section>

          <section>
            <h3>❌ When It Fails</h3>
            <p>{lesson.when_it_fails}</p>
          </section>

          <section>
            <h3>📋 Checklist</h3>
            <ul>
              {lesson.checklist.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>✅ DOs</h3>
            <ul>
              {lesson.dos.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>❌ DON'Ts</h3>
            <ul>
              {lesson.donts.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>🎯 Next Drill</h3>
            <p>{lesson.next_drill}</p>
          </section>
        </div>
      ))}
    </div>
  )
}
```

---

## 🔗 API Endpoints (Optional - For Server-Side Processing)

### `POST /api/signals/detect`

**Input:**
```json
{
  "snapshot": { /* MarketSnapshot */ },
  "heuristics": { /* HeuristicAnalysis */ }
}
```

**Output:** `SignalOrchestratorOutput` (see `SIGNAL_ORCHESTRATOR_EXAMPLE.json`)

### `GET /api/signals?pattern=momentum&limit=10`

Returns recent signals filtered by pattern.

### `GET /api/lessons?min_score=0.7`

Returns lessons above score threshold.

### `POST /api/outcomes/record`

Records trade outcome and triggers lesson extraction.

---

## 🧪 Testing

### Unit Test Example

```typescript
import { detectSignal, generateTradePlan } from '@/lib/signalOrchestrator'
import type { MarketSnapshot, HeuristicAnalysis, MarketRegime } from '@/types'

describe('Signal Orchestrator', () => {
  it('detects momentum signal from bullish heuristics', () => {
    const snapshot: MarketSnapshot = { /* mock data */ }
    const heuristics: HeuristicAnalysis = { bias: 'Bullish', confidence: 0.8, /* ... */ }
    const regime: MarketRegime = { trend: 'up', vol: 'mid', liquidity: 'high' }

    const signal = detectSignal(snapshot, heuristics, regime)

    expect(signal.pattern).toBe('momentum')
    expect(signal.direction).toBe('long')
    expect(signal.confidence).toBeGreaterThan(0.6)
  })

  it('generates trade plan with correct R:R', () => {
    const signal = { /* mock signal */ }
    const plan = generateTradePlan(signal, 10000, 1.0)

    expect(plan.metrics.rr).toBeGreaterThan(2.0)
    expect(plan.risk.risk_pct_equity).toBe(1.0)
    expect(plan.targets.length).toBe(3)
  })
})
```

---

## 📊 Guardrails & Best Practices

### 1. **Never Generate Orders**
- TradePlans are **NOT orders**
- Always require manual checklist review
- Display risk flags prominently

### 2. **Confidence Thresholds**
- Only generate plans for signals with `confidence > 0.6`
- Warn users if confidence < 0.7
- Block trades if `risk_flags` include `rug_suspect` or `illiquid`

### 3. **Event Sourcing**
- Log every action as ActionNode
- Never delete nodes (immutable history)
- Use edges to build causal graph

### 4. **Learning Layer**
- Extract lessons only after min 10 trades
- Update lesson scores as sample size grows
- Show confidence intervals in UI

---

## 🎓 Next Steps

1. **Implement** signal detection in ChartPage
2. **Add** SignalReviewCard component
3. **Create** LessonsPage
4. **Connect** trade outcome tracking to Journal
5. **Build** analytics dashboard (pattern stats, win rates)
6. **Integrate** on-chain data sources (holders, liquidity, dev wallets)
7. **Add** AI commentary (OpenAI/Grok) for enhanced thesis generation

---

## 📚 References

- Type Definitions: `src/types/signal.ts`
- Core Logic: `src/lib/signalOrchestrator.ts`
- Database Layer: `src/lib/signalDb.ts`
- Example Output: `docs/SIGNAL_ORCHESTRATOR_EXAMPLE.json`
