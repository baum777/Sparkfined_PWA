/**
 * Signal Detection API Endpoint
 * 
 * Detects trading signals from market data using Signal Orchestrator
 * 
 * @endpoint POST /api/signals/detect
 * @param {string} address - Token contract address
 * @param {string} chain - Blockchain (solana, ethereum, etc.)
 * @param {string} tf - Timeframe (5m, 15m, 1h, 4h, 1d)
 * @param {number} accountEquity - Account equity for position sizing (USD)
 * @param {number} riskPercentage - Risk per trade (default: 1%)
 * 
 * @returns {SignalOrchestratorOutput} Signals, trade plans, lessons, and action graph
 */

export const config = { runtime: 'edge' }

import type { SignalOrchestratorOutput } from '@/types/signal'
import { detectSignal, generateTradePlan, createActionNode, buildOrchestratorOutput, performRiskCheck } from '@/lib/signalOrchestrator'
import { detectMarketRegime, calculateRSI, describeRegime } from '@/lib/regimeDetection'

// ============================================================================
// HELPER: Fetch OHLC Data
// ============================================================================

async function fetchOHLC(address: string, tf: string, limit: number = 100): Promise<any[]> {
  const ohlcUrl = `/api/data/ohlc?address=${encodeURIComponent(address)}&tf=${tf}&limit=${limit}`
  
  try {
    const res = await fetch(ohlcUrl)
    if (!res.ok) return []
    
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

// ============================================================================
// HELPER: Fetch Market Snapshot
// ============================================================================

async function fetchMarketSnapshot(address: string, chain: string): Promise<any> {
  // TODO: Implement real market snapshot fetching
  // For now, return mock data
  return {
    token: {
      address,
      symbol: 'TOKEN',
      name: 'Token',
      chain,
    },
    price: {
      current: 1.0,
      high24h: 1.1,
      low24h: 0.9,
      change24h: 5,
    },
    volume: {
      volume24h: 100000,
    },
    liquidity: {
      total: 500000,
    },
    metadata: {
      provider: 'dexpaprika',
      timestamp: Date.now(),
      cached: false,
      confidence: 0.8,
    },
  }
}

// ============================================================================
// HELPER: Build Mock Heuristics (until real analysis integration)
// ============================================================================

function buildMockHeuristics(ohlc: any[], snapshot: any): any {
  if (ohlc.length === 0) {
    return {
      supportLevel: snapshot.price.low24h,
      resistanceLevel: snapshot.price.high24h,
      rangeSize: 'Medium',
      volatility24h: Math.abs(snapshot.price.change24h),
      bias: snapshot.price.change24h > 0 ? 'Bullish' : 'Bearish',
      keyLevels: [snapshot.price.low24h, snapshot.price.current, snapshot.price.high24h],
      roundNumbers: [],
      entryZone: { min: snapshot.price.current * 0.98, max: snapshot.price.current * 1.02 },
      confidence: 0.6,
      timestamp: Date.now(),
      source: 'heuristic',
    }
  }

  const closes = ohlc.map((c: any) => c.c)
  const highs = ohlc.map((c: any) => c.h)
  const lows = ohlc.map((c: any) => c.l)

  const high = Math.max(...highs)
  const low = Math.min(...lows)
  const current = closes[closes.length - 1]

  const rsi = calculateRSI(closes, 14)

  return {
    supportLevel: low,
    resistanceLevel: high,
    rangeSize: (high - low) / low > 0.1 ? 'High' : (high - low) / low > 0.05 ? 'Medium' : 'Low',
    volatility24h: ((high - low) / low) * 100,
    bias: rsi > 55 ? 'Bullish' : rsi < 45 ? 'Bearish' : 'Neutral',
    keyLevels: [low, current, high],
    roundNumbers: [],
    entryZone: { min: current * 0.98, max: current * 1.02 },
    rsiOverbought: rsi > 70,
    rsiOversold: rsi < 30,
    confidence: 0.7,
    timestamp: Date.now(),
    source: 'heuristic',
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default async function handler(req: Request) {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    const { address, chain = 'solana', tf = '15m', accountEquity = 10000, riskPercentage = 1 } = body

    if (!address) {
      return new Response(JSON.stringify({ error: 'Missing address parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 1. Fetch OHLC data
    const ohlc = await fetchOHLC(address, tf)

    // 2. Fetch market snapshot
    const snapshot = await fetchMarketSnapshot(address, chain)

    // 3. Detect market regime
    const regime = detectMarketRegime(ohlc, snapshot)

    // 4. Build heuristics
    const heuristics = buildMockHeuristics(ohlc, snapshot)

    // 5. Detect signal
    const signal = detectSignal(snapshot, heuristics, regime)

    // 6. Generate trade plan
    const plan = generateTradePlan(signal, accountEquity, riskPercentage)

    // 7. Perform risk check
    const riskCheck = performRiskCheck(signal, plan, snapshot)

    // 8. Create action graph nodes
    const nodes = [
      createActionNode(
        'signal.detected',
        {
          signal_id: signal.id,
          pattern: signal.pattern,
          confidence: signal.confidence,
          regime: regime,
        },
        { signal_id: signal.id },
        [`pattern/${signal.pattern}`, `confidence/${(signal.confidence * 100).toFixed(0)}`],
        signal.confidence
      ),
      createActionNode(
        'trade.plan.created',
        {
          plan_id: plan.id,
          signal_id: signal.id,
          rr: plan.metrics.rr,
          expectancy: plan.metrics.expectancy,
        },
        { signal_id: signal.id, plan_id: plan.id },
        [`rr/${plan.metrics.rr.toFixed(1)}`, `expectancy/${plan.metrics.expectancy.toFixed(2)}`],
        1.0
      ),
    ]

    // 9. Create edges (signal → plan)
    const edges: SignalOrchestratorOutput['action_graph_update']['edges'] = []
    if (nodes[0] && nodes[1]) {
      edges.push([nodes[0].id, nodes[1].id, 'CAUSES'])
    }

    // 10. Build explanation
    const explanation = `Detected ${signal.pattern} signal with ${(signal.confidence * 100).toFixed(0)}% confidence in ${describeRegime(regime)}. Trade plan generated with ${plan.metrics.rr.toFixed(1)}:1 R:R and ${(plan.metrics.expectancy * 100).toFixed(0)}% expectancy. ${riskCheck.passed ? 'Risk checks passed.' : `Risk warnings: ${riskCheck.warnings.join(', ')}`}`

    // 11. Build output
    const output = buildOrchestratorOutput(
      [signal],
      [plan],
      [], // Lessons require historical data
      nodes,
      edges,
      explanation,
      riskCheck.warnings || []
    )

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: 'Signal detection failed',
        message: error?.message || String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
