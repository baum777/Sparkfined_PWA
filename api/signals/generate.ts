/**
 * API: Generate Trading Signals
 * 
 * POST /api/signals/generate
 * 
 * Ingests market data and generates normalized signals with trade plans
 * 
 * @module api/signals/generate
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { Signal, TradePlan, ActionNode, SignalOrchestratorOutput } from '../../src/types/signal'
import type { MarketSnapshot } from '../../src/types/market'

// Note: These imports won't work in API routes as-is (need proper build setup)
// For now, we'll inline simplified versions

// ============================================================================
// TYPES
// ============================================================================

interface GenerateSignalRequest {
  snapshot: MarketSnapshot
  accountEquity?: number
  riskPercentage?: number
}

// ============================================================================
// HANDLER
// ============================================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { snapshot, accountEquity = 10000, riskPercentage = 1.0 } = req.body as GenerateSignalRequest

    if (!snapshot) {
      return res.status(400).json({ error: 'Missing snapshot in request body' })
    }

    // Validate snapshot structure
    if (!snapshot.token || !snapshot.price || !snapshot.liquidity) {
      return res.status(400).json({ error: 'Invalid snapshot structure' })
    }

    // Generate signal and plan
    const output = await generateSignalFromSnapshot(snapshot, accountEquity, riskPercentage)

    // Return orchestrator output
    return res.status(200).json(output)

  } catch (error) {
    console.error('[API] Signal generation error:', error)
    return res.status(500).json({ 
      error: 'Signal generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// ============================================================================
// SIGNAL GENERATION (Simplified inline version)
// ============================================================================

async function generateSignalFromSnapshot(
  snapshot: MarketSnapshot,
  accountEquity: number,
  riskPercentage: number
): Promise<SignalOrchestratorOutput> {
  
  // 1. Detect regime
  const regime = detectRegime(snapshot)
  
  // 2. Create heuristic analysis (simplified)
  const heuristics = createSimpleHeuristics(snapshot, regime)
  
  // 3. Detect signal
  const signal = detectSignal(snapshot, heuristics, regime)
  
  // 4. Generate trade plan
  const plan = generateTradePlan(signal, accountEquity, riskPercentage)
  
  // 5. Create action nodes
  const signalNode = createActionNode('signal.detected', {
    signal_id: signal.id,
    pattern: signal.pattern,
    confidence: signal.confidence,
  }, { signal_id: signal.id }, ['signal', `pattern/${signal.pattern}`], signal.confidence)
  
  const planNode = createActionNode('trade.plan.created', {
    plan_id: plan.id,
    signal_id: signal.id,
    entry_price: plan.entry.price,
    stop: plan.risk.stop,
    rr: plan.metrics.rr,
  }, { signal_id: signal.id, plan_id: plan.id, prev_node_id: signalNode.id }, ['plan', 'generated'], 1.0)
  
  // 6. Build orchestrator output
  return {
    action_graph_update: {
      nodes: [signalNode, planNode],
      edges: [[signalNode.id, planNode.id, 'CAUSES']],
    },
    signals: [signal],
    trade_plans: [plan],
    lessons: [],
    explanation: `Detected ${signal.pattern} signal with ${(signal.confidence * 100).toFixed(0)}% confidence in ${regime.trend} trend. Generated trade plan with ${plan.metrics.rr.toFixed(2)}R risk/reward ratio.`,
  }
}

// ============================================================================
// UTILITIES (Inline simplified versions)
// ============================================================================

function detectRegime(snapshot: MarketSnapshot) {
  const change24h = snapshot.price.change24h
  const atrPercent = ((snapshot.price.high24h - snapshot.price.low24h) / snapshot.price.current) * 100
  const liquidity = snapshot.liquidity.total

  return {
    trend: change24h >= 2 ? 'up' as const : change24h <= -2 ? 'down' as const : 'side' as const,
    vol: atrPercent < 5 ? 'low' as const : atrPercent < 15 ? 'mid' as const : 'high' as const,
    liquidity: liquidity < 50000 ? 'low' as const : liquidity < 500000 ? 'mid' as const : 'high' as const,
  }
}

function createSimpleHeuristics(snapshot: MarketSnapshot, regime: any) {
  return {
    bias: regime.trend === 'up' ? 'Bullish' : regime.trend === 'down' ? 'Bearish' : 'Neutral',
    confidence: 0.7,
    rsiOverbought: false,
    rsiOversold: false,
    rangeSize: regime.vol === 'high' ? 'High' : regime.vol === 'mid' ? 'Medium' : 'Low',
    entryZone: {
      min: snapshot.price.current * 0.98,
      max: snapshot.price.current * 1.02,
    },
    source: 'heuristic' as const,
  }
}

function detectSignal(snapshot: MarketSnapshot, heuristics: any, regime: any): Signal {
  const now = new Date().toISOString()
  const id = `sig_${randomId()}`

  const pattern = regime.trend === 'side' ? 'range-bounce' : 'momentum'
  const direction = heuristics.bias === 'Bullish' ? 'long' : heuristics.bias === 'Bearish' ? 'short' : 'neutral'
  const confidence = 0.7

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
      rsi: 50,
      ema_fast: snapshot.price.current * 0.98,
      ema_slow: snapshot.price.current * 1.02,
      onchain: {
        holders_delta: 0,
        liquidity_usd: snapshot.liquidity.total,
        top10_share: 0.3,
        mint_age_days: 30,
      },
      risk_flags: snapshot.liquidity.total < 50000 ? ['illiquid'] : [],
    },
    pattern,
    confidence,
    direction,
    thesis: `${pattern} signal in ${regime.trend} trend with ${regime.vol} volatility`,
  }
}

function generateTradePlan(signal: Signal, accountEquity: number, riskPercentage: number): TradePlan {
  const now = new Date().toISOString()
  const id = `plan_${randomId()}`

  const entryPrice = signal.features.price
  const atr = signal.features.atr
  const stopDistance = atr * 1.5
  const stopPrice = signal.direction === 'long' ? entryPrice - stopDistance : entryPrice + stopDistance

  const riskAmount = accountEquity * (riskPercentage / 100)
  const stopLossPercent = Math.abs((stopPrice - entryPrice) / entryPrice) * 100
  const positionSize = riskAmount / (stopLossPercent / 100)

  const targets = [
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
      expectancy: (signal.confidence * rr) - ((1 - signal.confidence) * 1),
      win_prob: signal.confidence,
      time_horizon: '2h-8h',
    },
    checklist: ['regime_ok', 'position_size_ok'],
    notes: `Generated from ${signal.pattern} signal`,
    status: 'pending',
    created_at: now,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  }
}

function createActionNode(
  type: string,
  payload: Record<string, unknown>,
  refs: any,
  tags: string[],
  confidence: number
): ActionNode {
  return {
    id: `node_${randomId()}`,
    type: type as any,
    ts_utc: new Date().toISOString(),
    refs,
    payload,
    tags,
    confidence,
  }
}

function randomId(): string {
  return Math.random().toString(36).substring(2, 15)
}
