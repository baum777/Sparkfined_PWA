# 🚀 Signal Orchestrator - Quick Start Guide

## What is This?

The **AI Signal Orchestrator & Learning Architect** is a complete crypto trading signal system that:
- 📊 Detects trading signals from market data
- 📋 Generates trade plans with risk management
- 🧠 Learns from outcomes to improve over time
- 📈 Tracks everything in an event-sourced knowledge graph

## 5-Minute Demo

### Step 1: Generate Demo Data

```bash
npm run signal:demo
```

This creates 20 realistic trading scenarios with signals, plans, and outcomes.

### Step 2: View Statistics

```bash
npm run signal:stats
```

See your win rate, average R:R, and performance breakdown.

### Step 3: Generate Lessons

```bash
npm run signal:lessons
```

The system analyzes your trades and creates actionable lessons.

### Step 4: Export Everything

```bash
npm run signal:export
```

Get JSON data + beautiful Markdown reports in the `exports/` folder.

## How to Use Programmatically

### Generate a Signal

```typescript
import { detectSignal, generateTradePlan } from '@/lib/signalOrchestrator'
import { detectRegime } from '@/lib/regimeDetector'
import { performComprehensiveRiskCheck } from '@/lib/riskChecks'

// Your market data
const marketSnapshot = {
  token: { chain: 'solana', symbol: 'SOL/USDC', ... },
  price: { current: 95.5, high24h: 102, low24h: 89, ... },
  liquidity: { total: 850000 },
  volume: { volume24h: 2500000 },
  ...
}

// 1. Detect regime
const regime = detectRegime(marketSnapshot)

// 2. Generate signal
const signal = detectSignal(marketSnapshot, heuristics, regime)

// 3. Create trade plan
const plan = generateTradePlan(signal, 10000, 1.0) // $10k equity, 1% risk

// 4. Validate
const riskCheck = performComprehensiveRiskCheck(signal, marketSnapshot, plan.risk.pos_size_units)

if (riskCheck.passed) {
  console.log('✅ Signal validated!')
  console.log('Pattern:', signal.pattern)
  console.log('Confidence:', signal.confidence)
  console.log('R:R:', plan.metrics.rr)
} else {
  console.log('❌ Failed risk checks:', riskCheck.blockers)
}
```

### Log a Trade Outcome

```typescript
import { saveTradeOutcome, saveActionNode } from '@/lib/signalDb'

const outcome = {
  plan_id: plan.id,
  signal_id: signal.id,
  result: 'win',
  pnl_usd: 215.5,
  pnl_pct: 21.5,
  rr_actual: 2.15,
  held_duration: 14400, // 4 hours
  exit_reason: 'tp',
}

await saveTradeOutcome(outcome)
```

### Generate Lessons

```typescript
import { generateLessonsFromOutcomes } from '@/lib/lessonGenerator'

const lessons = await generateLessonsFromOutcomes()

for (const lesson of lessons) {
  console.log(`Lesson: ${lesson.pattern}`)
  console.log(`Win Rate: ${(lesson.stats.win_rate * 100).toFixed(0)}%`)
  console.log(`When it works: ${lesson.when_it_works}`)
}
```

## API Endpoints

### Generate Signal from Market Data

```bash
POST /api/signals/generate
Content-Type: application/json

{
  "snapshot": { ... },
  "accountEquity": 10000,
  "riskPercentage": 1.0
}
```

### Generate Lessons

```bash
POST /api/signals/lessons
```

## File Structure

```
src/
├── types/
│   └── signal.ts              ← Type definitions
├── lib/
│   ├── signalOrchestrator.ts  ← Core logic
│   ├── signalDb.ts            ← Database layer
│   ├── regimeDetector.ts      ← Market regime classification
│   ├── riskChecks.ts          ← Risk validation
│   ├── lessonGenerator.ts     ← Learning layer
│   └── demoDataGenerator.ts   ← Demo data

api/
├── signals/
│   ├── generate.ts            ← Generate signals API
│   └── lessons.ts             ← Lessons API

scripts/
└── signal-orchestrator-cli.ts ← CLI tool
```

## Key Concepts

### 1. Signal

A normalized market opportunity with:
- **Pattern** (breakout, momentum, reversal, etc.)
- **Confidence** (0-1 score)
- **Regime** (trend, volatility, liquidity)
- **Thesis** (why this setup has edge)
- **Risk Flags** (rug, illiquid, etc.)

### 2. Trade Plan

An executable plan (NOT an order!) with:
- **Entry** (price, type, validity)
- **Risk** (stop loss, position size)
- **Targets** (partial exits at TP1, TP2, TP3)
- **Metrics** (R:R ratio, expectancy)
- **Checklist** (pre-trade validation)

### 3. Action Graph

Every decision logged as a node:
- `signal.detected` → `trade.plan.created` → `trade.opened` → `trade.closed`
- Full audit trail of all actions
- Powers the learning layer

### 4. Lessons

Distilled wisdom from outcomes:
- **When it works** (favorable conditions)
- **When it fails** (common mistakes)
- **DOs and DONTs** (best practices)
- **Next drill** (deliberate practice)

## CLI Commands Reference

```bash
npm run signal:demo          # Generate 20 demo trades
npm run signal:demo -- -c 50 # Generate 50 demo trades
npm run signal:lessons       # Generate lessons from outcomes
npm run signal:export        # Export all data (JSON + MD)
npm run signal:stats         # Show statistics
npm run signal:clear         # Clear all data (requires confirmation)
```

## Advanced Usage

### Custom Risk Checks

```typescript
import { checkRugRisk, checkLiquidity, checkSpread } from '@/lib/riskChecks'

const rugRisk = checkRugRisk(snapshot)
if (!rugRisk.passed) {
  console.warn('Rug risk flags:', rugRisk.flags)
}

const liquidityCheck = checkLiquidity(snapshot, positionSize)
console.log('Max safe position:', liquidityCheck.maxSafeSize)
console.log('Expected slippage:', liquidityCheck.slippageEstimate, '%')
```

### Regime Classification

```typescript
import { detectRegime, isFavorableRegime, describeRegime } from '@/lib/regimeDetector'

const regime = detectRegime(snapshot)
// { trend: 'up', vol: 'mid', liquidity: 'high', session: 'nyc' }

if (isFavorableRegime(regime)) {
  console.log('✅', describeRegime(regime))
  // "Uptrending, mid volatility, high liquidity (NYC session)"
}
```

### Custom Demo Data

```typescript
import { generateDemoSignal, generateDemoPlan } from '@/lib/demoDataGenerator'

const signal = generateDemoSignal('momentum', 'long')
const plan = generateDemoPlan(signal, 10000)
```

## Guardrails & Best Practices

### ✅ DO

- Wait for risk checks to pass
- Use the checklist before every trade
- Log outcomes for learning
- Review lessons regularly
- Test with demo data first

### ❌ DON'T

- Execute trades automatically
- Ignore risk flags
- Skip validation steps
- Trade without a plan
- Ignore regime classification

## Troubleshooting

### CLI not working?

Install tsx globally:
```bash
npm install -g tsx
```

Or use npx:
```bash
npx tsx scripts/signal-orchestrator-cli.ts demo
```

### Database not initialized?

```typescript
import { initSignalDB } from '@/lib/signalDb'
await initSignalDB()
```

### Want to reset everything?

```bash
npm run signal:clear
# Type "DELETE" to confirm
```

## Next Steps

1. **Try the demo**: `npm run signal:demo`
2. **Review the code**: Start with `src/types/signal.ts`
3. **Read the full docs**: See `docs/SIGNAL_ORCHESTRATOR_COMPLETE.md`
4. **Integrate with your data**: Replace demo data with real market feeds
5. **Build the UI**: Create components to display signals and lessons

## Questions?

- 📖 Full docs: `docs/SIGNAL_ORCHESTRATOR_COMPLETE.md`
- 🔧 Type definitions: `src/types/signal.ts`
- 💡 Examples: Run `npm run signal:demo` and explore the output

---

**Happy signal hunting!** 🎯
