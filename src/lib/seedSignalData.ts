/**
 * Seed Data for Signal Orchestrator
 * 
 * Generates demo signals, plans, nodes, and lessons for testing UI
 * Use: Run once in console or via settings page
 */

import type { Signal, TradePlan, ActionNode, Lesson, TradeOutcome } from '@/types/signal'
import {
  saveSignal,
  saveTradePlan,
  saveActionNode,
  saveLesson,
  saveTradeOutcome,
  saveEdge,
} from '@/lib/legacySignalDb'

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

export async function seedDemoSignals() {
  console.log('🌱 Seeding demo signals...')

  const signals: Signal[] = [
    {
      id: 'sig_demo_1',
      timestamp_utc: new Date(Date.now() - 3600000).toISOString(), // 1h ago
      market: {
        chain: 'solana',
        symbol: 'SOL/USDC',
        venue: 'raydium',
      },
      regime: {
        trend: 'up',
        vol: 'mid',
        liquidity: 'high',
      },
      features: {
        price: 142.5,
        atr: 7.6,
        rsi: 58,
        ema_fast: 141.2,
        ema_slow: 140.0,
        onchain: {
          holders_delta: 120,
          liquidity_usd: 2500000,
          top10_share: 0.28,
          mint_age_days: 180,
        },
        risk_flags: [],
      },
      pattern: 'momentum',
      confidence: 0.78,
      direction: 'long',
      thesis:
        'Strong momentum continuation in up trend with mid volatility. Entry zone: 141.20-143.00. EMA fast above slow, RSI neutral, liquidity healthy.',
    },
    {
      id: 'sig_demo_2',
      timestamp_utc: new Date(Date.now() - 7200000).toISOString(), // 2h ago
      market: {
        chain: 'ethereum',
        symbol: 'ETH/USDC',
        venue: 'uniswap',
      },
      regime: {
        trend: 'down',
        vol: 'high',
        liquidity: 'mid',
      },
      features: {
        price: 2580.0,
        atr: 120.0,
        rsi: 35,
        ema_fast: 2590.0,
        ema_slow: 2600.0,
        risk_flags: ['high_concentration'],
      },
      pattern: 'reversal',
      confidence: 0.65,
      direction: 'short',
      thesis:
        'Potential reversal at resistance zone. High volatility environment, RSI oversold, looking for bounce confirmation.',
    },
    {
      id: 'sig_demo_3',
      timestamp_utc: new Date(Date.now() - 10800000).toISOString(), // 3h ago
      market: {
        chain: 'solana',
        symbol: 'BONK/USDC',
        venue: 'jupiter',
      },
      regime: {
        trend: 'side',
        vol: 'low',
        liquidity: 'low',
      },
      features: {
        price: 0.0000125,
        atr: 0.0000008,
        rsi: 50,
        ema_fast: 0.0000124,
        ema_slow: 0.0000126,
        onchain: {
          holders_delta: -50,
          liquidity_usd: 45000,
          top10_share: 0.65,
          mint_age_days: 90,
        },
        risk_flags: ['illiquid', 'high_concentration'],
      },
      pattern: 'range-bounce',
      confidence: 0.52,
      direction: 'neutral',
      thesis:
        'Range-bound price action. Low liquidity, high holder concentration. Wait for clearer direction.',
    },
  ]

  for (const signal of signals) {
    await saveSignal(signal)
  }

  console.log('✅ Seeded', signals.length, 'signals')
  return signals
}

export async function seedDemoPlans(_signals: Signal[]) {
  console.log('🌱 Seeding demo trade plans...')

  const plans: TradePlan[] = [
    {
      id: 'plan_demo_1',
      signal_id: 'sig_demo_1',
      entry: {
        type: 'limit',
        price: 142.5,
        valid_for: '30m',
        slippage_tolerance: 0.5,
      },
      risk: {
        stop: 131.1,
        risk_pct_equity: 1.0,
        pos_size_units: 8.77,
        max_loss_usd: 100,
      },
      targets: [
        { tp: 1, price: 147.6, share: 0.3 },
        { tp: 2, price: 153.85, share: 0.4 },
        { tp: 3, price: 168.6, share: 0.3 },
      ],
      metrics: {
        rr: 2.45,
        expectancy: 0.88,
        win_prob: 0.78,
        time_horizon: '2h-8h',
      },
      checklist: ['regime_ok', 'position_size_ok', 'rugcheck_ok', 'liquidity_ok', 'slippage_ok'],
      notes:
        'Generated from momentum signal with 78% confidence. Risk 1% of equity ($100). Partial exits at TP1 (30%), TP2 (40%), TP3 (30%).',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      expires_at: new Date(Date.now() + 1800000).toISOString(), // 30min from now
    },
  ]

  for (const plan of plans) {
    await saveTradePlan(plan)
  }

  console.log('✅ Seeded', plans.length, 'trade plans')
  return plans
}

export async function seedDemoNodes(_signals: Signal[], _plans: TradePlan[]) {
  console.log('🌱 Seeding demo action nodes...')

  const nodes: ActionNode[] = [
    {
      id: 'node_demo_1',
      type: 'signal.detected',
      ts_utc: new Date(Date.now() - 3600000).toISOString(),
      refs: {
        signal_id: 'sig_demo_1',
      },
      payload: {
        pattern: 'momentum',
        confidence: 0.78,
        price: 142.5,
      },
      tags: ['setup/momo', 'chain/solana', 'trend/up'],
      confidence: 0.78,
    },
    {
      id: 'node_demo_2',
      type: 'trade.plan.created',
      ts_utc: new Date(Date.now() - 3590000).toISOString(),
      refs: {
        signal_id: 'sig_demo_1',
        plan_id: 'plan_demo_1',
        prev_node_id: 'node_demo_1',
      },
      payload: {
        entry_price: 142.5,
        rr: 2.45,
        expectancy: 0.88,
      },
      tags: ['plan/created', 'rr>2', 'risk/1pct'],
      confidence: 1.0,
    },
  ]

  for (const node of nodes) {
    await saveActionNode(node)
  }

  // Save edges
  await saveEdge('node_demo_1', 'node_demo_2', 'CAUSES')

  console.log('✅ Seeded', nodes.length, 'action nodes')
  return nodes
}

export async function seedDemoLessons() {
  console.log('🌱 Seeding demo lessons...')

  const lessons: Lesson[] = [
    {
      id: 'lesson_demo_1',
      from_nodes: ['node_demo_1', 'node_demo_2'],
      pattern: 'momentum-breakout-nyc-session',
      when_it_works:
        'Works best in up trends with mid volatility. Average R:R 2.8. NYC session openings show 68% win rate. Strong momentum with volume confirmation.',
      when_it_fails:
        'Fails when trend unclear or volume too low. Common issue: premature entry before momentum confirmation. Avoid during Asia session low-volume periods.',
      checklist: [
        'Confirm trend with higher timeframe',
        'Check volume spike on breakout',
        'Wait for EMA fast > EMA slow',
        'Ensure liquidity > $1M',
        'Verify RSI not overbought (< 70)',
      ],
      dos: [
        'Wait for clear regime confirmation',
        'Size position according to volatility (ATR-based)',
        'Take partial profits at targets (30/40/30 split)',
        'Trail stop after TP1 hit',
        'Monitor volume for continuation',
      ],
      donts: [
        "Do not chase entries outside entry zone",
        'Do not ignore risk flags',
        'Do not overtrade this setup (max 2 per day)',
        'Do not hold through major resistance',
        'Do not scale in against momentum',
      ],
      next_drill:
        'Backtest this setup on historical data for 50+ samples. Focus on entry timing optimization and stop placement refinement. Record hit rate for each session (Asia/London/NYC).',
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      score: 0.72,
      stats: {
        trades_analyzed: 25,
        win_rate: 0.68,
        avg_rr: 2.8,
        sample_size: 25,
      },
    },
    {
      id: 'lesson_demo_2',
      from_nodes: [],
      pattern: 'range-bounce-low-volatility',
      when_it_works:
        'Works in sideways markets with clear support/resistance. Low volatility environments (ATR < 2%). Win rate: 55% with R:R 1.5:1.',
      when_it_fails:
        'Fails during trending markets or when support/resistance breaks. Loses effectiveness in high volatility. Avoid if volume declining.',
      checklist: [
        'Confirm sideways regime (last 20 candles)',
        'Identify clear support/resistance levels',
        'Check volume at bounce levels',
        'Ensure no major news events scheduled',
      ],
      dos: [
        'Enter at extremes of range',
        'Set tight stops (beyond S/R)',
        'Take profits at opposite range boundary',
        'Reduce position size vs trending setups',
      ],
      donts: [
        'Do not trade if range < 3% wide',
        'Do not hold through range breakout',
        'Do not ignore volume divergence',
        'Do not trade during news releases',
      ],
      next_drill:
        'Practice identifying range-bound markets on replay mode. Focus on false breakout recognition. Track 20 range trades to validate stats.',
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      score: 0.58,
      stats: {
        trades_analyzed: 18,
        win_rate: 0.55,
        avg_rr: 1.5,
        sample_size: 18,
      },
    },
  ]

  for (const lesson of lessons) {
    await saveLesson(lesson)
  }

  console.log('✅ Seeded', lessons.length, 'lessons')
  return lessons
}

export async function seedDemoOutcomes() {
  console.log('🌱 Seeding demo trade outcomes...')

  const outcomes: TradeOutcome[] = [
    {
      plan_id: 'plan_demo_1',
      signal_id: 'sig_demo_1',
      result: 'win',
      pnl_usd: 215.5,
      pnl_pct: 21.5,
      rr_actual: 2.15,
      held_duration: 14400, // 4 hours
      exit_reason: 'tp',
      notes: 'Hit TP2, let runner to TP3',
    },
  ]

  for (const outcome of outcomes) {
    await saveTradeOutcome(outcome)
  }

  console.log('✅ Seeded', outcomes.length, 'trade outcomes')
  return outcomes
}

// ============================================================================
// MASTER SEED FUNCTION
// ============================================================================

export async function seedAllDemoData() {
  console.log('🌱 Starting demo data seed...')

  try {
    const signals = await seedDemoSignals()
    const plans = await seedDemoPlans(signals)
    const nodes = await seedDemoNodes(signals, plans)
    const lessons = await seedDemoLessons()
    const outcomes = await seedDemoOutcomes()

    console.log('✅ Demo data seeded successfully!')
    console.log('   - Signals:', signals.length)
    console.log('   - Plans:', plans.length)
    console.log('   - Nodes:', nodes.length)
    console.log('   - Lessons:', lessons.length)
    console.log('   - Outcomes:', outcomes.length)

    return {
      signals,
      plans,
      nodes,
      lessons,
      outcomes,
    }
  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
    throw error
  }
}

// ============================================================================
// BROWSER CONSOLE HELPER
// ============================================================================

// Make available in browser console for testing
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).seedSignalData = seedAllDemoData
  console.log('💡 Run `seedSignalData()` in console to populate demo data')
}
