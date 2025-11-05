/**
 * Demo: Signal Orchestrator End-to-End
 * 
 * Demonstrates complete signal detection → trade plan → lesson extraction flow
 * Run with: deno run --allow-all scripts/demo-signal-orchestrator.ts
 * Or: tsx scripts/demo-signal-orchestrator.ts
 */

import type {
  Signal,
  TradePlan,
  ActionNode,
  Lesson,
  SignalOrchestratorOutput,
  MarketRegime,
  TradeOutcome,
} from '../src/types/signal'

// ============================================================================
// MOCK DATA
// ============================================================================

const mockOHLC = [
  { t: 1730817600000, o: 138.50, h: 139.20, l: 138.10, c: 138.90, v: 1200000 },
  { t: 1730818500000, o: 138.90, h: 139.80, l: 138.70, c: 139.50, v: 1350000 },
  { t: 1730819400000, o: 139.50, h: 140.30, l: 139.40, c: 140.10, v: 1450000 },
  { t: 1730820300000, o: 140.10, h: 141.00, l: 140.00, c: 140.80, v: 1550000 },
  { t: 1730821200000, o: 140.80, h: 141.90, l: 140.70, c: 141.60, v: 1680000 },
  { t: 1730822100000, o: 141.60, h: 142.50, l: 141.50, c: 142.35, v: 1820000 }, // Current
]

const mockSnapshot = {
  token: {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    chain: 'solana' as const,
  },
  price: {
    current: 142.35,
    high24h: 145.20,
    low24h: 137.80,
    change24h: 3.2,
  },
  volume: {
    volume24h: 45000000,
  },
  liquidity: {
    total: 2450000,
  },
  metadata: {
    provider: 'dexpaprika' as const,
    timestamp: Date.now(),
    cached: false,
    confidence: 0.85,
  },
}

const mockHeuristics = {
  supportLevel: 137.80,
  resistanceLevel: 145.20,
  rangeSize: 'Medium' as const,
  volatility24h: 5.37,
  bias: 'Bullish' as const,
  keyLevels: [137.80, 142.35, 145.20],
  roundNumbers: [140, 145, 150],
  entryZone: { min: 141.80, max: 143.00 },
  rsiOverbought: false,
  rsiOversold: false,
  confidence: 0.78,
  timestamp: Date.now(),
  source: 'heuristic' as const,
}

// ============================================================================
// REGIME DETECTION (Simplified)
// ============================================================================

function detectRegime(): MarketRegime {
  return {
    trend: 'up',
    vol: 'mid',
    liquidity: 'high',
    session: 'london',
    phase: 'markup',
  }
}

// ============================================================================
// SIGNAL DETECTION
// ============================================================================

function detectSignal(): Signal {
  const regime = detectRegime()
  
  return {
    id: `sig_${crypto.randomUUID()}`,
    timestamp_utc: new Date().toISOString(),
    market: {
      chain: 'solana',
      symbol: 'SOL/USDC',
      venue: 'raydium',
    },
    regime,
    features: {
      price: 142.35,
      atr: 3.42,
      rsi: 62.5,
      ema_fast: 141.20,
      ema_slow: 138.90,
      onchain: {
        holders_delta: 245,
        liquidity_usd: 2450000,
        top10_share: 0.28,
        mint_age_days: 890,
      },
      risk_flags: [],
    },
    pattern: 'momentum',
    confidence: 0.78,
    direction: 'long',
    thesis: 'Strong momentum continuation in uptrend with mid volatility. EMA fast above slow, RSI in bullish zone (62.5), price breaking recent resistance. Entry zone: 141.80-143.00',
    invalidation: {
      price_below: 138.50,
      time_expiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      conditions: [
        'EMA fast crosses below EMA slow',
        'RSI drops below 45',
        'Volume dries up significantly',
      ],
    },
  }
}

// ============================================================================
// TRADE PLAN GENERATION
// ============================================================================

function generateTradePlan(signal: Signal, accountEquity: number = 10000, riskPct: number = 1): TradePlan {
  const entryPrice = signal.features.price
  const atr = signal.features.atr
  const stopDistance = atr * 1.5

  return {
    id: `plan_${crypto.randomUUID()}`,
    signal_id: signal.id,
    entry: {
      type: 'limit',
      price: entryPrice,
      valid_for: '30m',
      slippage_tolerance: 0.5,
    },
    risk: {
      stop: entryPrice - stopDistance,
      risk_pct_equity: riskPct,
      pos_size_units: (accountEquity * (riskPct / 100)) / stopDistance,
      max_loss_usd: accountEquity * (riskPct / 100),
    },
    targets: [
      { tp: 1, price: entryPrice + stopDistance * 1.5, share: 0.3 },
      { tp: 2, price: entryPrice + stopDistance * 2.5, share: 0.4 },
      { tp: 3, price: entryPrice + stopDistance * 4, share: 0.3 },
    ],
    metrics: {
      rr: 2.8,
      expectancy: 0.42,
      win_prob: signal.confidence,
      time_horizon: '2h-8h',
    },
    checklist: ['regime_ok', 'position_size_ok', 'rugcheck_ok', 'liquidity_ok', 'slippage_ok'],
    notes: `Generated from ${signal.pattern} signal with ${(signal.confidence * 100).toFixed(0)}% confidence. ${signal.thesis}`,
    status: 'pending',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  }
}

// ============================================================================
// ACTION NODES
// ============================================================================

function createActionNodes(signal: Signal, plan: TradePlan): ActionNode[] {
  const node1: ActionNode = {
    id: `node_${crypto.randomUUID()}`,
    type: 'signal.detected',
    ts_utc: new Date().toISOString(),
    refs: {
      signal_id: signal.id,
    },
    payload: {
      signal_id: signal.id,
      pattern: signal.pattern,
      confidence: signal.confidence,
      regime: signal.regime,
    },
    tags: [`pattern/${signal.pattern}`, `confidence/${(signal.confidence * 100).toFixed(0)}`],
    confidence: signal.confidence,
  }

  const node2: ActionNode = {
    id: `node_${crypto.randomUUID()}`,
    type: 'trade.plan.created',
    ts_utc: new Date().toISOString(),
    refs: {
      signal_id: signal.id,
      plan_id: plan.id,
      prev_node_id: node1.id,
    },
    payload: {
      plan_id: plan.id,
      signal_id: signal.id,
      rr: plan.metrics.rr,
      expectancy: plan.metrics.expectancy,
    },
    tags: [`rr/${plan.metrics.rr.toFixed(1)}`, `expectancy/${plan.metrics.expectancy.toFixed(2)}`],
    confidence: 1.0,
  }

  return [node1, node2]
}

// ============================================================================
// LESSON EXTRACTION (Mock)
// ============================================================================

function createMockLesson(signal: Signal): Lesson {
  return {
    id: `lesson_${crypto.randomUUID()}`,
    from_nodes: [signal.id],
    pattern: 'momentum-breakout-london-session',
    when_it_works:
      'Works best in uptrend with mid volatility during London session. RSI 55-70 range, EMA fast > slow, volume above average. Average R:R 2.5-3.5. Win rate historically 68% in similar conditions.',
    when_it_fails:
      'Fails when volume spike is fake (low follow-through), RSI overbought (>75), or major resistance ahead. Common trap: Chasing late entries after 3%+ move. Exit reason often: false breakout reversal.',
    checklist: [
      'regime ok',
      'position size ok',
      'rugcheck ok',
      'liquidity ok',
      'slippage ok',
      'RSI not overbought (< 75)',
      'Volume confirming (> 1.3x avg)',
      'Clear resistance breakout',
    ],
    dos: [
      'Wait for clear regime confirmation (uptrend + mid/low vol)',
      'Size position according to volatility (ATR-based stops)',
      'Take partial profits at targets (30% at 1.5R minimum)',
      'Trail stop after TP1 hit to breakeven',
      'Enter within planned entry zone only',
    ],
    donts: [
      'Do not chase entries outside zone (max 1% slippage)',
      'Do not ignore risk flags (rug/liquidity warnings)',
      'Do not overtrade this setup (max 2-3 per session)',
      'Do not hold through major resistance without adjustment',
      'Do not skip rugcheck on new/unknown tokens',
    ],
    next_drill:
      'Backtest this setup on historical SOL/USDC 15m data for 100+ samples. Focus on: (1) Optimal RSI entry range, (2) Session performance (London vs Asia), (3) Volume confirmation threshold. Log each result in journal.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    score: 0.68,
    stats: {
      trades_analyzed: 42,
      win_rate: 0.68,
      avg_rr: 2.6,
      sample_size: 42,
    },
  }
}

// ============================================================================
// BUILD OUTPUT
// ============================================================================

function buildOutput(): SignalOrchestratorOutput {
  const signal = detectSignal()
  const plan = generateTradePlan(signal)
  const nodes = createActionNodes(signal, plan)
  const lesson = createMockLesson(signal)

  const edges: SignalOrchestratorOutput['action_graph_update']['edges'] = [[nodes[0].id, nodes[1].id, 'CAUSES']]

  const explanation = `Detected ${signal.pattern} signal with ${(signal.confidence * 100).toFixed(0)}% confidence in ${signal.regime.trend}trend (${signal.regime.vol} vol, ${signal.regime.liquidity} liquidity). Trade plan generated with ${plan.metrics.rr.toFixed(1)}:1 R:R and ${(plan.metrics.expectancy * 100).toFixed(0)}% expectancy. Risk checks passed.`

  return {
    action_graph_update: {
      nodes,
      edges,
    },
    signals: [signal],
    trade_plans: [plan],
    lessons: [lesson],
    explanation,
  }
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('🚀 Signal Orchestrator Demo\n')
  console.log('=' .repeat(80))
  console.log()

  const output = buildOutput()

  console.log('📊 OUTPUT (JSON):')
  console.log(JSON.stringify(output, null, 2))
  console.log()

  console.log('=' .repeat(80))
  console.log()
  console.log('✅ Demo completed successfully!')
  console.log()
  console.log('📝 Summary:')
  console.log(`   - Signals detected: ${output.signals.length}`)
  console.log(`   - Trade plans created: ${output.trade_plans.length}`)
  console.log(`   - Lessons extracted: ${output.lessons.length}`)
  console.log(`   - Action nodes: ${output.action_graph_update.nodes.length}`)
  console.log(`   - Graph edges: ${output.action_graph_update.edges.length}`)
  console.log()
  console.log(`📈 Signal: ${output.signals[0].pattern} (${(output.signals[0].confidence * 100).toFixed(0)}% confidence)`)
  console.log(`💰 Plan: ${output.trade_plans[0].metrics.rr.toFixed(1)}:1 R:R, ${(output.trade_plans[0].metrics.expectancy * 100).toFixed(0)}% expectancy`)
  console.log(`🎓 Lesson: ${output.lessons[0].pattern} (${output.lessons[0].stats?.win_rate ? (output.lessons[0].stats.win_rate * 100).toFixed(0) : '?'}% win rate)`)
  console.log()
  console.log('🛡️  Disclaimer: This is NOT financial advice. Educational purposes only.')
}

if (import.meta.main || require.main === module) {
  main()
}

export { buildOutput, detectSignal, generateTradePlan, createMockLesson }
