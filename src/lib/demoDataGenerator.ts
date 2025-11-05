/**
 * Demo Data Generator for Signal Orchestrator
 * 
 * Generates realistic demo signals, trade plans, outcomes, and lessons
 * for testing and demonstration purposes
 * 
 * @module lib/demoDataGenerator
 */

import type { Signal, TradePlan, TradeOutcome, Lesson, ActionNode, MarketRegime } from '@/types/signal'
import {
  saveSignal,
  saveTradePlan,
  saveTradeOutcome,
  saveLesson,
  saveActionNode,
  saveEdge,
} from './signalDb'

// ============================================================================
// DEMO SIGNAL GENERATION
// ============================================================================

/**
 * Generate demo market snapshots
 */
function generateDemoSnapshots() {
  const baseTokens = [
    { symbol: 'SOL/USDC', chain: 'solana' as const, price: 95.5, liquidity: 850000 },
    { symbol: 'RAY/USDC', chain: 'solana' as const, price: 2.34, liquidity: 450000 },
    { symbol: 'BONK/USDC', chain: 'solana' as const, price: 0.000023, liquidity: 120000 },
    { symbol: 'WIF/USDC', chain: 'solana' as const, price: 1.87, liquidity: 680000 },
    { symbol: 'JTO/USDC', chain: 'solana' as const, price: 3.42, liquidity: 320000 },
  ]
  
  return baseTokens.map((token) => ({
    ...token,
    high24h: token.price * 1.08,
    low24h: token.price * 0.95,
    change24h: (Math.random() - 0.5) * 20, // -10% to +10%
    volume24h: token.liquidity * (2 + Math.random() * 3), // 2-5x liquidity
  }))
}

/**
 * Generate demo signal with realistic data
 */
export function generateDemoSignal(
  pattern: Signal['pattern'] = 'momentum',
  direction: Signal['direction'] = 'long'
): Signal {
  const snapshots = generateDemoSnapshots()
  const snapshot = snapshots[Math.floor(Math.random() * snapshots.length)]
  
  const now = new Date()
  const id = `sig_${crypto.randomUUID()}`
  
  // Generate regime
  const regime: MarketRegime = {
    trend: snapshot.change24h > 3 ? 'up' : snapshot.change24h < -3 ? 'down' : 'side',
    vol: snapshot.high24h / snapshot.low24h > 1.15 ? 'high' : snapshot.high24h / snapshot.low24h > 1.08 ? 'mid' : 'low',
    liquidity: snapshot.liquidity > 500000 ? 'high' : snapshot.liquidity > 100000 ? 'mid' : 'low',
    session: getSession(now),
  }
  
  const confidence = 0.6 + Math.random() * 0.3 // 0.6-0.9
  
  const atr = snapshot.high24h - snapshot.low24h
  
  // Risk flags
  const risk_flags: Signal['features']['risk_flags'] = []
  if (snapshot.liquidity < 200000) risk_flags.push('illiquid')
  if (regime.vol === 'high' && regime.liquidity === 'low') risk_flags.push('rug_suspect')
  
  return {
    id,
    timestamp_utc: now.toISOString(),
    market: {
      chain: snapshot.chain,
      symbol: snapshot.symbol,
      venue: 'raydium',
    },
    regime,
    features: {
      price: snapshot.price,
      atr,
      rsi: 45 + Math.random() * 20, // 45-65
      ema_fast: snapshot.price * 0.99,
      ema_slow: snapshot.price * 1.01,
      onchain: {
        holders_delta: Math.floor(Math.random() * 200) - 50, // -50 to +150
        liquidity_usd: snapshot.liquidity,
        top10_share: 0.2 + Math.random() * 0.3, // 0.2-0.5
        mint_age_days: Math.floor(Math.random() * 365) + 30, // 30-395 days
      },
      risk_flags,
    },
    pattern,
    confidence,
    direction,
    thesis: generateThesis(pattern, regime, snapshot.symbol),
  }
}

/**
 * Generate demo trade plan from signal
 */
export function generateDemoPlan(signal: Signal, accountEquity: number = 10000): TradePlan {
  const now = new Date()
  const id = `plan_${crypto.randomUUID()}`
  
  const entryPrice = signal.features.price
  const atr = signal.features.atr
  const stopDistance = atr * 1.5
  
  const stopPrice = signal.direction === 'long' 
    ? entryPrice - stopDistance 
    : entryPrice + stopDistance
  
  const riskPct = 1.0 + Math.random() * 1.5 // 1-2.5%
  const riskAmount = accountEquity * (riskPct / 100)
  const stopLossPercent = Math.abs((stopPrice - entryPrice) / entryPrice)
  const positionSize = riskAmount / stopLossPercent
  
  const targets: TradePlan['targets'] = [
    {
      tp: 1,
      price: signal.direction === 'long' ? entryPrice + stopDistance * 1.5 : entryPrice - stopDistance * 1.5,
      share: 0.3,
    },
    {
      tp: 2,
      price: signal.direction === 'long' ? entryPrice + stopDistance * 2.5 : entryPrice - stopDistance * 2.5,
      share: 0.4,
    },
    {
      tp: 3,
      price: signal.direction === 'long' ? entryPrice + stopDistance * 4 : entryPrice - stopDistance * 4,
      share: 0.3,
    },
  ]
  
  const avgTarget = targets.reduce((sum, t) => sum + t.price * t.share, 0)
  const rr = Math.abs(avgTarget - entryPrice) / Math.abs(stopPrice - entryPrice)
  const expectancy = (signal.confidence * rr) - ((1 - signal.confidence) * 1)
  
  return {
    id,
    signal_id: signal.id,
    entry: {
      type: 'limit',
      price: entryPrice,
      valid_for: '30m',
      slippage_tolerance: 0.5,
    },
    risk: {
      stop: stopPrice,
      risk_pct_equity: riskPct,
      pos_size_units: positionSize,
      max_loss_usd: riskAmount,
    },
    targets,
    metrics: {
      rr,
      expectancy,
      win_prob: signal.confidence,
      time_horizon: '2h-8h',
    },
    checklist: ['regime_ok', 'liquidity_ok', 'position_size_ok'],
    notes: generatePlanNotes(signal),
    status: 'pending',
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
  }
}

/**
 * Generate demo trade outcome
 */
export function generateDemoOutcome(plan: TradePlan, signal: Signal): TradeOutcome {
  // Win probability based on signal confidence
  const won = Math.random() < signal.confidence
  
  const result = won ? 'win' : 'loss'
  
  // Calculate PnL
  const entryPrice = plan.entry.price
  const stopPrice = plan.risk.stop
  const avgTarget = plan.targets.reduce((sum, t) => sum + t.price * t.share, 0)
  
  let exitPrice: number
  let rr_actual: number
  
  if (won) {
    // Hit somewhere between first target and avg target
    const minTarget = plan.targets[0].price
    exitPrice = minTarget + (avgTarget - minTarget) * Math.random()
    rr_actual = Math.abs(exitPrice - entryPrice) / Math.abs(stopPrice - entryPrice)
  } else {
    // Hit stop or worse
    exitPrice = stopPrice
    rr_actual = -1
  }
  
  const pnl_pct = ((exitPrice - entryPrice) / entryPrice) * 100 * (signal.direction === 'short' ? -1 : 1)
  const pnl_usd = (plan.risk.max_loss_usd || 100) * rr_actual
  
  const held_duration = Math.floor(Math.random() * 6 * 3600) + 1800 // 30min - 6h in seconds
  
  const exit_reasons: TradeOutcome['exit_reason'][] = won 
    ? ['tp', 'manual'] 
    : ['sl', 'invalidation', 'time']
  const exit_reason = exit_reasons[Math.floor(Math.random() * exit_reasons.length)]
  
  return {
    plan_id: plan.id,
    signal_id: signal.id,
    result,
    pnl_usd,
    pnl_pct,
    rr_actual,
    held_duration,
    exit_reason,
    notes: `${result === 'win' ? 'Winner' : 'Stopped out'} - ${exit_reason}`,
  }
}

/**
 * Generate demo action nodes for a trade lifecycle
 */
export function generateDemoActionNodes(
  signal: Signal,
  plan: TradePlan,
  outcome: TradeOutcome
): ActionNode[] {
  const nodes: ActionNode[] = []
  
  // 1. Signal detected
  const signalNode: ActionNode = {
    id: `node_${crypto.randomUUID()}`,
    type: 'signal.detected',
    ts_utc: signal.timestamp_utc,
    refs: { signal_id: signal.id },
    payload: {
      pattern: signal.pattern,
      confidence: signal.confidence,
      direction: signal.direction,
    },
    tags: ['signal', `pattern/${signal.pattern}`, `confidence/${(signal.confidence * 100).toFixed(0)}`],
    confidence: signal.confidence,
  }
  nodes.push(signalNode)
  
  // 2. Plan created
  const planNode: ActionNode = {
    id: `node_${crypto.randomUUID()}`,
    type: 'trade.plan.created',
    ts_utc: plan.created_at,
    refs: { signal_id: signal.id, plan_id: plan.id, prev_node_id: signalNode.id },
    payload: {
      entry_price: plan.entry.price,
      stop: plan.risk.stop,
      rr: plan.metrics.rr,
    },
    tags: ['plan', `rr/${plan.metrics.rr.toFixed(1)}`],
    confidence: 1.0,
  }
  nodes.push(planNode)
  
  // 3. Trade opened
  const openedNode: ActionNode = {
    id: `node_${crypto.randomUUID()}`,
    type: 'trade.opened',
    ts_utc: new Date(new Date(plan.created_at).getTime() + 5 * 60 * 1000).toISOString(), // 5min later
    refs: { signal_id: signal.id, plan_id: plan.id, prev_node_id: planNode.id },
    payload: {
      fill_price: plan.entry.price * (1 + (Math.random() - 0.5) * 0.002), // Small slippage
      pos_size: plan.risk.pos_size_units,
    },
    tags: ['trade', 'opened'],
    confidence: 1.0,
  }
  nodes.push(openedNode)
  
  // 4. Trade closed
  const closedNode: ActionNode = {
    id: `node_${crypto.randomUUID()}`,
    type: outcome.exit_reason === 'tp' ? 'takeprofit.hit' : outcome.exit_reason === 'sl' ? 'stoploss.hit' : 'trade.closed',
    ts_utc: new Date(new Date(plan.created_at).getTime() + outcome.held_duration * 1000).toISOString(),
    refs: { signal_id: signal.id, plan_id: plan.id, prev_node_id: openedNode.id },
    payload: {
      exit_price: plan.entry.price * (1 + outcome.pnl_pct / 100),
      pnl_usd: outcome.pnl_usd,
      pnl_pct: outcome.pnl_pct,
      rr_actual: outcome.rr_actual,
    },
    tags: ['trade', 'closed', outcome.result, `rr/${outcome.rr_actual.toFixed(1)}`],
    confidence: 1.0,
  }
  nodes.push(closedNode)
  
  return nodes
}

// ============================================================================
// BULK DEMO DATA GENERATION
// ============================================================================

/**
 * Generate complete demo dataset
 */
export async function generateDemoDataset(count: number = 20): Promise<{
  signals: Signal[]
  plans: TradePlan[]
  outcomes: TradeOutcome[]
  nodes: ActionNode[]
}> {
  console.log(`[DemoGenerator] Generating ${count} demo trades...`)
  
  const signals: Signal[] = []
  const plans: TradePlan[] = []
  const outcomes: TradeOutcome[] = []
  const nodes: ActionNode[] = []
  
  const patterns: Signal['pattern'][] = ['breakout', 'momentum', 'range-bounce', 'reversal', 'mean-reversion']
  const directions: Signal['direction'][] = ['long', 'short']
  
  for (let i = 0; i < count; i++) {
    const pattern = patterns[Math.floor(Math.random() * patterns.length)]
    const direction = directions[Math.floor(Math.random() * directions.length)]
    
    const signal = generateDemoSignal(pattern, direction)
    const plan = generateDemoPlan(signal)
    const outcome = generateDemoOutcome(plan, signal)
    const tradeNodes = generateDemoActionNodes(signal, plan, outcome)
    
    signals.push(signal)
    plans.push(plan)
    outcomes.push(outcome)
    nodes.push(...tradeNodes)
    
    // Save to DB
    await saveSignal(signal)
    await saveTradePlan(plan)
    await saveTradeOutcome(outcome)
    
    for (const node of tradeNodes) {
      await saveActionNode(node)
    }
    
    // Save edges
    for (let j = 1; j < tradeNodes.length; j++) {
      await saveEdge(tradeNodes[j - 1].id, tradeNodes[j].id, 'FOLLOWS')
    }
  }
  
  console.log(`[DemoGenerator] Generated ${count} complete trades`)
  
  return { signals, plans, outcomes, nodes }
}

/**
 * Clear all demo data
 */
export async function clearDemoData(): Promise<void> {
  // TODO: Implement clear functionality
  console.log('[DemoGenerator] Clear demo data not yet implemented')
}

// ============================================================================
// UTILITIES
// ============================================================================

function getSession(date: Date): MarketRegime['session'] {
  const hour = date.getUTCHours()
  if (hour >= 0 && hour < 8) return 'asia'
  if (hour >= 13 && hour < 16) return 'overlap'
  if (hour >= 8 && hour < 21) return hour >= 13 ? 'nyc' : 'london'
  return 'offhours'
}

function generateThesis(pattern: Signal['pattern'], regime: MarketRegime, symbol: string): string {
  const thesisTemplates: Record<Signal['pattern'], string[]> = {
    'breakout': [
      `${symbol} breaking resistance in ${regime.trend} trend with volume`,
      `Strong breakout above key level, ${regime.vol} volatility favors continuation`,
      `Clean breakout structure with ${regime.liquidity} liquidity support`,
    ],
    'momentum': [
      `${symbol} showing strong momentum in ${regime.trend} trend`,
      `Momentum continuation play with ${regime.vol} volatility`,
      `Strong directional move with good ${regime.liquidity} liquidity`,
    ],
    'range-bounce': [
      `${symbol} bouncing off range support/resistance`,
      `Range-bound setup in ${regime.trend} market`,
      `Mean reversion play at range extremes`,
    ],
    'reversal': [
      `Potential reversal at key ${symbol} level`,
      `Exhaustion pattern in ${regime.trend} trend`,
      `Reversal signals emerging at support/resistance`,
    ],
    'mean-reversion': [
      `${symbol} overextended, expecting reversion`,
      `Mean reversion setup with ${regime.vol} volatility`,
      `Statistical edge for reversion to mean`,
    ],
    'continuation': [
      `${symbol} continuing ${regime.trend} trend`,
      `Trend continuation with healthy pullback`,
      `Riding the ${regime.trend} trend with momentum`,
    ],
    'divergence': [
      `Price/momentum divergence in ${symbol}`,
      `Divergence signal at key level`,
      `Technical divergence suggests ${regime.trend} change`,
    ],
  }
  
  const templates = thesisTemplates[pattern]
  return templates[Math.floor(Math.random() * templates.length)]
}

function generatePlanNotes(signal: Signal): string {
  const notes: string[] = []
  
  notes.push(`${signal.pattern} setup with ${(signal.confidence * 100).toFixed(0)}% confidence`)
  notes.push(`Regime: ${signal.regime.trend} trend, ${signal.regime.vol} vol, ${signal.regime.liquidity} liquidity`)
  
  if (signal.features.risk_flags.length > 0) {
    notes.push(`⚠️ Risk flags: ${signal.features.risk_flags.join(', ')}`)
  }
  
  notes.push(`Entry zone: ${signal.features.ema_fast.toFixed(4)}-${signal.features.ema_slow.toFixed(4)}`)
  
  return notes.join('. ')
}
