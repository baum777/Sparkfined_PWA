/**
 * Signal Orchestrator & Learning Architect
 *
 * Core orchestration logic for:
 * 1. Ingesting market data & on-chain signals
 * 2. Detecting patterns and generating signals
 * 3. Creating trade plans with risk management
 * 4. Event-sourcing all actions as graph nodes
 * 5. Extracting lessons from outcomes
 *
 * @module lib/signalOrchestrator
 */

import type {
  Signal,
  TradePlan,
  ActionNode,
  Lesson,
  SignalOrchestratorOutput,
  MarketRegime,
  TradeOutcome,
  RiskCheck,
  SignalEventType,
} from '@/types/signal'
import type { MarketSnapshot } from '@/types/market'
import type { HeuristicAnalysis } from '@/types/analysis'
import type { OHLCSeries } from '@/lib/types/ohlc'
import {
  createSignal,
  signalDb,
  type Signal as SignalRecord,
  type SignalDatabase,
  type SignalRule,
} from './signalDb'
import { detectBreakout } from './signals/strategies/breakout'
import { detectVolumeSpike } from './signals/strategies/volumeSpike'

// ============================================================================
// SIGNAL DETECTION
// ============================================================================

/**
 * Detect trading signals from market snapshot + heuristic analysis
 * Combines price action, regime, and on-chain data
 */
export function detectSignal(
  snapshot: MarketSnapshot,
  heuristics: HeuristicAnalysis,
  regime: MarketRegime
): Signal {
  const now = new Date().toISOString()
  const id = `sig_${crypto.randomUUID()}`

  // Determine pattern from heuristics
  const pattern = detectPattern(heuristics, regime)

  // Determine direction and confidence
  const direction = heuristics.bias === 'Bullish' ? 'long' : heuristics.bias === 'Bearish' ? 'short' : 'neutral'
  const confidence = calculateSignalConfidence(heuristics, regime, snapshot)

  // Build thesis
  const thesis = buildThesis(pattern, heuristics, regime)

  // Extract risk flags
  const risk_flags = extractRiskFlags(snapshot, heuristics)

  // TODO[P1]: Replace placeholder on-chain metrics with live provider data
  return {
    id,
    timestamp_utc: now,
    market: {
      chain: snapshot.token.chain,
      symbol: snapshot.token.symbol,
      venue: snapshot.pairs?.[0]?.dex || 'unknown',
    },
    regime,
    features: {
      price: snapshot.price.current,
      atr: snapshot.price.high24h - snapshot.price.low24h,
      rsi: heuristics.rsiOverbought ? 70 : heuristics.rsiOversold ? 30 : 50,
      ema_fast: heuristics.entryZone?.min || snapshot.price.current * 0.98,
      ema_slow: heuristics.entryZone?.max || snapshot.price.current * 1.02,
      onchain: {
        holders_delta: 0,
        liquidity_usd: snapshot.liquidity.total,
        top10_share: 0.3,
        mint_age_days: 30,
      },
      risk_flags,
    },
    pattern,
    confidence,
    direction,
    thesis,
  }
}

/**
 * Detect pattern from heuristics and regime
 */
function detectPattern(
  heuristics: HeuristicAnalysis,
  regime: MarketRegime
): Signal['pattern'] {
  if (heuristics.source === 'ai' || heuristics.source === 'hybrid') {
    // AI-detected patterns (future)
    return 'breakout'
  }

  // Heuristic pattern detection
  if (regime.trend === 'up' && heuristics.bias === 'Bullish') {
    return 'continuation'
  }
  if (regime.trend === 'down' && heuristics.bias === 'Bearish') {
    return 'continuation'
  }
  if (regime.trend === 'side') {
    return 'range-bounce'
  }
  if (heuristics.rsiOverbought || heuristics.rsiOversold) {
    return 'mean-reversion'
  }

  return 'momentum'
}

/**
 * Calculate signal confidence based on multiple factors
 */
function calculateSignalConfidence(
  heuristics: HeuristicAnalysis,
  regime: MarketRegime,
  snapshot: MarketSnapshot
): number {
  let confidence = 0.5 // Base confidence

  // Boost for clear regime
  if (regime.trend !== 'side') confidence += 0.1
  if (regime.vol === 'low' || regime.vol === 'mid') confidence += 0.1

  // Boost for heuristic confidence
  confidence += heuristics.confidence * 0.2

  // Boost for liquidity
  if (snapshot.liquidity.total > 100000) confidence += 0.1
  if (snapshot.liquidity.total > 1000000) confidence += 0.1

  // Penalize for risk flags
  if (snapshot.metadata.confidence < 0.8) confidence -= 0.1

  return Math.max(0.1, Math.min(1.0, confidence))
}

/**
 * Build human-readable thesis
 */
function buildThesis(
  pattern: Signal['pattern'],
  heuristics: HeuristicAnalysis,
  regime: MarketRegime
): string {
  const parts: string[] = []

  // Pattern description
  if (pattern === 'breakout') {
    parts.push('Price breaking key resistance with volume')
  } else if (pattern === 'reversal') {
    parts.push('Potential reversal at support/resistance')
  } else if (pattern === 'range-bounce') {
    parts.push('Range-bound bounce off support/resistance')
  } else if (pattern === 'momentum') {
    parts.push('Strong momentum continuation')
  } else if (pattern === 'mean-reversion') {
    parts.push('Overextended price seeking mean reversion')
  }

  // Regime context
  parts.push(`in ${regime.trend} trend with ${regime.vol} volatility`)

  // Key levels
  if (heuristics.entryZone) {
    parts.push(`Entry zone: ${heuristics.entryZone.min.toFixed(4)}-${heuristics.entryZone.max.toFixed(4)}`)
  }

  return parts.join(', ')
}

/**
 * Extract risk flags from snapshot and heuristics
 */
function extractRiskFlags(
  snapshot: MarketSnapshot,
  heuristics: HeuristicAnalysis
): Signal['features']['risk_flags'] {
  const flags: Signal['features']['risk_flags'] = []

  // Low liquidity
  if (snapshot.liquidity.total < 50000) {
    flags.push('illiquid')
  }

  // High volatility + low confidence
  if (heuristics.rangeSize === 'High' && heuristics.confidence < 0.5) {
    flags.push('rug_suspect')
  }

  // Provider confidence
  if (snapshot.metadata.confidence < 0.7) {
    flags.push('dev_unverified')
  }

  return flags
}

// ============================================================================
// TRADE PLAN GENERATION
// ============================================================================

/**
 * Generate executable trade plan from signal
 * Includes risk management, targets, and expectancy
 */
export function generateTradePlan(
  signal: Signal,
  accountEquity: number,
  riskPercentage: number = 1.0 // Default 1% risk per trade
): TradePlan {
  const now = new Date().toISOString()
  const id = `plan_${crypto.randomUUID()}`

  // Entry price (use signal price or adjust for limit orders)
  const entryPrice = signal.features.price
  const atr = signal.features.atr

  // Stop loss calculation
  const stopDistance = atr * 1.5 // 1.5 ATR stop
  const stopPrice = signal.direction === 'long' 
    ? entryPrice - stopDistance 
    : entryPrice + stopDistance

  // Position sizing
  const riskAmount = accountEquity * (riskPercentage / 100)
  const stopLossPercent = Math.abs((stopPrice - entryPrice) / entryPrice) * 100
  const positionSize = riskAmount / (stopLossPercent / 100)

  // Take profit targets (R:R multiples)
  const targets: TradePlan['targets'] = [
    {
      tp: 1,
      price: signal.direction === 'long' 
        ? entryPrice + stopDistance * 1.5 
        : entryPrice - stopDistance * 1.5,
      share: 0.3, // Take 30% at 1.5R
    },
    {
      tp: 2,
      price: signal.direction === 'long' 
        ? entryPrice + stopDistance * 2.5 
        : entryPrice - stopDistance * 2.5,
      share: 0.4, // Take 40% at 2.5R
    },
    {
      tp: 3,
      price: signal.direction === 'long' 
        ? entryPrice + stopDistance * 4 
        : entryPrice - stopDistance * 4,
      share: 0.3, // Let 30% run to 4R
    },
  ]

  // Calculate R:R and expectancy
  const avgTarget = targets.reduce((sum, t) => sum + t.price * t.share, 0)
  const rr = Math.abs(avgTarget - entryPrice) / Math.abs(stopPrice - entryPrice)
  const winProb = signal.confidence // Use signal confidence as win probability estimate
  const expectancy = (winProb * rr) - ((1 - winProb) * 1) // Kelly-style expectancy

  // Build checklist based on regime and risk flags
  const checklist: TradePlan['checklist'] = ['regime_ok', 'position_size_ok']
  if (signal.features.risk_flags.length === 0) {
    checklist.push('rugcheck_ok', 'liquidity_ok')
  }
  if (signal.regime.vol !== 'high') {
    checklist.push('slippage_ok')
  }

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
      risk_pct_equity: riskPercentage,
      pos_size_units: positionSize,
      max_loss_usd: riskAmount,
    },
    targets,
    metrics: {
      rr,
      expectancy,
      win_prob: winProb,
      time_horizon: '2h-8h',
    },
    checklist,
    notes: `Generated from ${signal.pattern} signal with ${(signal.confidence * 100).toFixed(0)}% confidence. ${signal.thesis}`,
    status: 'pending',
    created_at: now,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30min expiry
  }
}

// ============================================================================
// ACTION GRAPH LOGGING
// ============================================================================

/**
 * Create action graph node for event sourcing
 */
export function createActionNode(
  type: SignalEventType,
  payload: Record<string, unknown>,
  refs: ActionNode['refs'] = {},
  tags: string[] = [],
  confidence: number = 1.0
): ActionNode {
  return {
    id: `node_${crypto.randomUUID()}`,
    type,
    ts_utc: new Date().toISOString(),
    refs,
    payload,
    tags,
    confidence,
  }
}

// ============================================================================
// LESSON EXTRACTION
// ============================================================================

/**
 * Extract lesson from trade outcomes
 * Analyzes patterns that work and patterns that fail
 */
export function extractLesson(
  signal: Signal,
  plan: TradePlan,
  outcome: TradeOutcome,
  similarOutcomes: TradeOutcome[]
): Lesson {
  const now = new Date().toISOString()
  const id = `lesson_${crypto.randomUUID()}`

  // Analyze when this pattern works
  const wins = similarOutcomes.filter((o) => o.result === 'win')
  const losses = similarOutcomes.filter((o) => o.result === 'loss')
  const winRate = wins.length / similarOutcomes.length

  // Build when_it_works
  const when_it_works = wins.length > 0
    ? `Works best in ${signal.regime.trend} trends with ${signal.regime.vol} volatility. Average R:R ${(wins.reduce((sum, w) => sum + w.rr_actual, 0) / wins.length).toFixed(2)}.`
    : 'Insufficient data - need more samples.'

  // Build when_it_fails
  const when_it_fails = losses.length > 0
    ? `Fails when ${signal.regime.trend === 'side' ? 'trend unclear' : 'countertrend'}. Common issue: ${losses[0]?.exit_reason ?? 'unknown'}.`
    : 'No failures yet - maintain vigilance.'

  // Build checklist from plan
  const checklist = plan.checklist.map((c) => c.replace('_', ' '))

  // Build dos/donts
  const dos = [
    'Wait for clear regime confirmation',
    'Size position according to volatility',
    'Take partial profits at targets',
  ]
  const donts = [
    'Do not chase entries outside zone',
    'Do not ignore risk flags',
    'Do not overtrade this setup',
  ]

  // Build next drill
  const next_drill = winRate < 0.5
    ? 'Review failed trades - identify common entry mistakes'
    : 'Backtest this setup on historical data for 50+ samples'

  return {
    id,
    from_nodes: [outcome.plan_id, outcome.signal_id],
    pattern: signal.pattern,
    when_it_works,
    when_it_fails,
    checklist,
    dos,
    donts,
    next_drill,
    created_at: now,
    updated_at: now,
    score: winRate * signal.confidence,
    stats: {
      trades_analyzed: similarOutcomes.length,
      win_rate: winRate,
      avg_rr: similarOutcomes.reduce((sum, o) => sum + o.rr_actual, 0) / similarOutcomes.length,
      sample_size: similarOutcomes.length,
    },
  }
}

// ============================================================================
// RISK CHECKS
// ============================================================================

/**
 * Perform pre-trade risk checks
 */
export function performRiskCheck(
  signal: Signal,
  plan: TradePlan,
  snapshot: MarketSnapshot
): RiskCheck {
  const warnings: string[] = []
  const blockers: string[] = []

  // Check spread
  const spread = Math.abs(snapshot.price.high24h - snapshot.price.low24h) / snapshot.price.current
  const spread_ok = spread < 0.05 // 5% spread threshold
  if (!spread_ok) {
    warnings.push('Wide spread detected - check slippage')
  }

  // Check slippage
  const slippage_ok = plan.entry.slippage_tolerance ? plan.entry.slippage_tolerance < 1.0 : true
  if (!slippage_ok) {
    warnings.push('High slippage tolerance - reduce position size')
  }

  // Check liquidity
  const liquidity_ok = snapshot.liquidity.total > 50000
  if (!liquidity_ok) {
    blockers.push('Insufficient liquidity - DO NOT TRADE')
  }

  // Check rug risk
  const rug_risk_ok = !signal.features.risk_flags.includes('rug_suspect')
  if (!rug_risk_ok) {
    blockers.push('Rug risk detected - AVOID')
  }

  // Check news (placeholder - needs real news API)
  const news_clear = true

  const passed = blockers.length === 0

  return {
    passed,
    checks: {
      spread_ok,
      slippage_ok,
      liquidity_ok,
      rug_risk_ok,
      news_clear,
    },
    warnings,
    blockers,
  }
}

// ============================================================================
// OUTPUT BUILDER
// ============================================================================

/**
 * Build standardized SignalOrchestratorOutput
 */
export function buildOrchestratorOutput(
  signals: Signal[],
  plans: TradePlan[],
  lessons: Lesson[],
  nodes: ActionNode[],
  edges: SignalOrchestratorOutput['action_graph_update']['edges'],
  explanation: string,
  warnings: string[] = []
): SignalOrchestratorOutput {
  return {
    action_graph_update: {
      nodes,
      edges,
    },
    signals,
    trade_plans: plans,
    lessons,
    explanation,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

// ============================================================================
// SIGNAL SCAN (M21)
// ============================================================================

type StrategyDetector = (series: OHLCSeries, rule: SignalRule) => SignalRecord | null

const strategyDetectors: Record<string, StrategyDetector> = {
  breakout: detectBreakout,
  volumeSpike: detectVolumeSpike,
}

export async function scanForSignals(
  rules: SignalRule[],
  fetchOHLC: (rule: SignalRule) => Promise<OHLCSeries>,
  db: SignalDatabase = signalDb
): Promise<SignalRecord[]> {
  const detectedSignals: SignalRecord[] = []

  for (const rule of rules) {
    const detect = strategyDetectors[rule.strategy]
    if (!detect) {
      continue
    }

    try {
      const series = await fetchOHLC(rule)
      const match = detect(series, rule)

      if (match) {
        const stored = await createSignal(match, db)
        detectedSignals.push(stored)
      }
    } catch (error) {
      console.error('scanForSignals: failed to evaluate rule', { ruleId: rule.id, error })
    }
  }

  return detectedSignals
}
