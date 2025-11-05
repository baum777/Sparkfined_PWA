# Signal Orchestrator & Learning Architect - Complete Implementation

## 🎯 Overview

The **AI Signal Orchestrator & Learning Architect** is a comprehensive system for crypto trading signal generation, trade planning, and continuous learning. It implements event-sourced architecture with a knowledge graph of all trading actions.

## 📋 Mission

1. **Ingest & Normalize** - Market data & on-chain/off-chain signals
2. **Event Sourcing** - Every action captured as knowledge graph nodes
3. **Learning Layer** - Generate lessons from outcomes continuously
4. **Deterministic Output** - Reproducible, precise JSON + explanation

## 🏗️ Architecture

### Core Components

```
src/types/signal.ts          - Type definitions & schemas
src/lib/signalOrchestrator.ts - Signal detection & plan generation
src/lib/signalDb.ts           - IndexedDB storage layer
src/lib/regimeDetector.ts     - Market regime classification
src/lib/riskChecks.ts         - Pre-trade risk validation
src/lib/lessonGenerator.ts    - Learning layer worker
src/lib/demoDataGenerator.ts  - Demo data generation
```

### API Endpoints

```
api/signals/generate.ts  - POST - Generate signals from market snapshots
api/signals/lessons.ts   - POST - Generate lessons from outcomes
```

### CLI Tools

```bash
npm run signal:demo      # Generate demo data
npm run signal:lessons   # Run lesson generator
npm run signal:export    # Export all data (JSON + Markdown)
npm run signal:stats     # Show statistics
npm run signal:clear     # Clear all data
```

## 📊 Data Schemas

### 1. Signal

Normalized market signal with features, thesis, and confidence:

```typescript
interface Signal {
  id: string                    // sig_<uuid>
  timestamp_utc: string         // ISO8601
  market: {
    chain: 'solana' | 'ethereum' | ...
    symbol: string              // e.g., "SOL/USDC"
    venue: string               // e.g., "raydium"
  }
  regime: MarketRegime          // Trend/vol/liquidity classification
  features: {
    price: number
    atr: number
    rsi: number
    ema_fast: number
    ema_slow: number
    onchain?: { ... }
    risk_flags: Array<...>
  }
  pattern: 'breakout' | 'momentum' | ...
  confidence: number            // 0.0-1.0
  direction: 'long' | 'short' | 'neutral'
  thesis: string                // Human-readable edge explanation
}
```

### 2. TradePlan

Executable trade plan (NEVER an order!):

```typescript
interface TradePlan {
  id: string                    // plan_<uuid>
  signal_id: string
  entry: {
    type: 'limit' | 'market'
    price: number
    valid_for: string           // e.g., "30m"
  }
  risk: {
    stop: number
    risk_pct_equity: number
    pos_size_units: number
  }
  targets: Array<{
    tp: number
    price: number
    share: number               // Partial exit %
  }>
  metrics: {
    rr: number                  // Risk:Reward ratio
    expectancy: number          // Expected value
    win_prob: number            // Win probability estimate
  }
  checklist: Array<string>      // Pre-trade validation
  status: 'pending' | 'active' | ...
}
```

### 3. ActionNode (Event Sourcing)

Every action/decision as a graph node:

```typescript
interface ActionNode {
  id: string                    // node_<uuid>
  type: SignalEventType         // e.g., 'signal.detected'
  ts_utc: string
  refs: {
    signal_id?: string
    plan_id?: string
    prev_node_id?: string
  }
  payload: Record<string, unknown>
  tags: string[]                // e.g., ["setup/momo", "win/rr>2"]
  confidence: number
}
```

### 4. Lesson (Learning Layer)

Distilled lessons from action graph:

```typescript
interface Lesson {
  id: string                    // lesson_<uuid>
  from_nodes: string[]
  pattern: string               // e.g., "momentum-breakout-AM-session"
  when_it_works: string
  when_it_fails: string
  checklist: string[]
  dos: string[]
  donts: string[]
  next_drill: string
  stats?: {
    trades_analyzed: number
    win_rate: number
    avg_rr: number
    sample_size: number
  }
}
```

## 🔄 Workflow

### 1. Signal Generation

```typescript
import { detectSignal, generateTradePlan } from '@/lib/signalOrchestrator'
import { detectRegime } from '@/lib/regimeDetector'
import { performComprehensiveRiskCheck } from '@/lib/riskChecks'

// 1. Detect market regime
const regime = detectRegime(marketSnapshot)

// 2. Generate signal
const signal = detectSignal(marketSnapshot, heuristics, regime)

// 3. Create trade plan
const plan = generateTradePlan(signal, accountEquity, riskPercentage)

// 4. Validate with risk checks
const riskCheck = performComprehensiveRiskCheck(signal, marketSnapshot, plan.risk.pos_size_units)

// 5. Save to DB (if passed)
if (riskCheck.passed) {
  await saveSignal(signal)
  await saveTradePlan(plan)
  await saveActionNode(createActionNode('signal.detected', ...))
}
```

### 2. Trade Execution & Outcome Logging

```typescript
import { saveTradeOutcome, saveActionNode } from '@/lib/signalDb'

// When trade closes
const outcome: TradeOutcome = {
  plan_id: plan.id,
  signal_id: signal.id,
  result: 'win', // or 'loss'
  pnl_usd: 215.5,
  pnl_pct: 21.5,
  rr_actual: 2.15,
  held_duration: 14400, // seconds
  exit_reason: 'tp',
}

await saveTradeOutcome(outcome)
await saveActionNode(createActionNode('trade.closed', ...))
```

### 3. Lesson Generation

```typescript
import { generateLessonsFromOutcomes } from '@/lib/lessonGenerator'

// Run periodically (e.g., daily cron)
const lessons = await generateLessonsFromOutcomes()

// Export lessons as Markdown
import { exportLessonsAsMarkdown } from '@/lib/lessonGenerator'
const markdown = await exportLessonsAsMarkdown()
```

## 🛠️ Risk Checks

The system includes comprehensive pre-trade risk validation:

```typescript
import { performComprehensiveRiskCheck } from '@/lib/riskChecks'

const riskCheck = performComprehensiveRiskCheck(signal, snapshot, positionSize)

if (!riskCheck.passed) {
  console.error('BLOCKERS:', riskCheck.blockers)
  // DO NOT TRADE
}

if (riskCheck.warnings.length > 0) {
  console.warn('WARNINGS:', riskCheck.warnings)
  // Proceed with caution
}
```

**Risk Checks Include:**
- ✅ Rug risk detection (liquidity, holder concentration, volatility)
- ✅ Liquidity sufficiency (position size vs pool depth)
- ✅ Spread/slippage estimation
- ✅ News/event checks (placeholder for API integration)
- ✅ Signal risk flags validation

## 📈 Market Regime Detection

Automatic classification of market conditions:

```typescript
import { detectRegime, isFavorableRegime, describeRegime } from '@/lib/regimeDetector'

const regime = detectRegime(marketSnapshot)
// { trend: 'up', vol: 'mid', liquidity: 'high', session: 'nyc' }

if (isFavorableRegime(regime)) {
  console.log('Favorable conditions:', describeRegime(regime))
  // "Uptrending, mid volatility, high liquidity (NYC session)"
}
```

## 🎮 Demo Data Generation

Generate realistic demo data for testing:

```typescript
import { generateDemoDataset } from '@/lib/demoDataGenerator'

// Generate 20 complete trades (signals, plans, outcomes, nodes)
const dataset = await generateDemoDataset(20)

console.log('Generated:', dataset.signals.length, 'signals')
```

**Or use CLI:**

```bash
npm run signal:demo -- --count 50
```

## 📊 Statistics & Export

### View Statistics

```bash
npm run signal:stats
```

Output:
```
📈 Overall Statistics:

   Total Signals: 20
   Total Trade Plans: 20
   Total Outcomes: 20
   
💰 Trading Performance:
   Win Rate: 65.0%
   Wins: 13
   Losses: 7
   Avg P&L: $125.50
   Avg R:R: 1.85
```

### Export Data

```bash
npm run signal:export
```

Generates:
- `exports/signal-orchestrator-YYYY-MM-DD.json` - Full data export
- `exports/lessons-YYYY-MM-DD.md` - Formatted lessons report

## 🔌 API Integration

### Generate Signal from Market Data

```bash
curl -X POST http://localhost:3000/api/signals/generate \
  -H "Content-Type: application/json" \
  -d '{
    "snapshot": {
      "token": { "chain": "solana", "symbol": "SOL/USDC", ... },
      "price": { "current": 95.5, ... },
      "liquidity": { "total": 850000 },
      ...
    },
    "accountEquity": 10000,
    "riskPercentage": 1.0
  }'
```

Response:
```json
{
  "action_graph_update": {
    "nodes": [...],
    "edges": [["node_a", "node_b", "CAUSES"]]
  },
  "signals": [...],
  "trade_plans": [...],
  "lessons": [],
  "explanation": "Detected momentum signal with 78% confidence..."
}
```

### Generate Lessons

```bash
curl -X POST http://localhost:3000/api/signals/lessons
```

## 🧪 Testing

### Unit Tests

Run existing tests:
```bash
npm test
```

### Integration Testing

1. Generate demo data:
```bash
npm run signal:demo
```

2. View stats:
```bash
npm run signal:stats
```

3. Generate lessons:
```bash
npm run signal:lessons
```

4. Export results:
```bash
npm run signal:export
```

## 🚀 Production Deployment

### 1. Database Initialization

The system uses IndexedDB (browser) for storage. Initialize on app start:

```typescript
import { initSignalDB } from '@/lib/signalDb'

// In your app initialization
await initSignalDB()
```

### 2. Cron Jobs

Set up periodic lesson generation:

```typescript
// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  const { runLessonWorker } = await import('@/lib/lessonGenerator')
  await runLessonWorker()
})
```

### 3. Real-time Signal Generation

Integrate with your market data pipeline:

```typescript
// When new market snapshot arrives
marketStream.on('snapshot', async (snapshot) => {
  const regime = detectRegime(snapshot)
  const signal = detectSignal(snapshot, heuristics, regime)
  
  if (signal.confidence > 0.7) {
    const plan = generateTradePlan(signal, accountEquity)
    const riskCheck = performComprehensiveRiskCheck(signal, snapshot, plan.risk.pos_size_units)
    
    if (riskCheck.passed) {
      // Show to user / send notification
      await notifyUser(signal, plan)
    }
  }
})
```

## 📚 Next Steps

### Planned Enhancements

1. **AI Integration**
   - Replace heuristic analysis with ML models
   - Pattern recognition via computer vision
   - Sentiment analysis from social/news

2. **Real Data Sources**
   - CoinGecko API for news
   - Solscan/Etherscan for on-chain data
   - DEX aggregator for real-time prices

3. **Advanced Risk Management**
   - Kelly criterion position sizing
   - Portfolio heat management
   - Correlation analysis

4. **UI Components**
   - Signal dashboard
   - Trade plan review interface
   - Lesson browser
   - Action graph visualizer

## 🔒 Guardrails

**IMPORTANT:**
- ❌ This system generates PLANS, not ORDERS
- ❌ No automatic execution
- ❌ No financial advice
- ✅ All decisions require user confirmation
- ✅ Risk checks must pass before showing signals
- ✅ Transparency: Explain every signal's thesis

## 📝 License & Disclaimer

This is a trading analysis tool, not financial advice. Always:
- Do your own research (DYOR)
- Never risk more than you can afford to lose
- Test thoroughly with demo data before real trading
- Understand that past performance ≠ future results

---

## 🎉 Summary

You now have a complete **AI Signal Orchestrator & Learning Architect** system:

✅ Signal detection with regime awareness  
✅ Trade plan generation with risk management  
✅ Event-sourced action graph  
✅ Lesson extraction from outcomes  
✅ Risk checks & validation  
✅ Demo data generation  
✅ CLI tools  
✅ API endpoints  
✅ Export & statistics  

**Ready to start generating signals!** 🚀

Run `npm run signal:demo` to populate demo data and explore the system.
