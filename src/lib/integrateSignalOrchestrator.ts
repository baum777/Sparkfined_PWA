/**
 * Signal Orchestrator Integration Example
 * 
 * Shows how to integrate the orchestrator with existing market data adapters
 * 
 * @module lib/integrateSignalOrchestrator
 */

import type { MarketSnapshot } from '@/types/market'
import type { Signal, TradePlan, SignalOrchestratorOutput } from '@/types/signal'
import { getTokenSnapshot } from './data/getTokenSnapshot'
import { detectRegime } from './regimeDetector'
import { detectSignal, generateTradePlan, createActionNode, buildOrchestratorOutput } from './signalOrchestrator'
import { performComprehensiveRiskCheck } from './riskChecks'
import { saveSignal, saveTradePlan, saveActionNode, saveEdge } from './signalDb'
import { calculateHeuristics } from './analysis/heuristicEngine'

// ============================================================================
// FULL PIPELINE: TOKEN ADDRESS → SIGNAL + PLAN
// ============================================================================

/**
 * Generate trading signal from token address
 * Complete pipeline: fetch data → analyze → generate signal → create plan → validate
 */
export async function generateSignalFromToken(
  tokenAddress: string,
  chain: MarketSnapshot['token']['chain'] = 'solana',
  accountEquity: number = 10000,
  riskPercentage: number = 1.0
): Promise<SignalOrchestratorOutput> {
  
  console.log(`[Orchestrator] Generating signal for ${tokenAddress}...`)
  
  try {
    // 1. Fetch market snapshot
    const snapshot = await getTokenSnapshot(chain, tokenAddress)
    
    if (!snapshot) {
      throw new Error('Failed to fetch market snapshot')
    }
    
    // 2. Detect market regime
    const regime = detectRegime(snapshot)
    console.log(`[Orchestrator] Regime: ${regime.trend} trend, ${regime.vol} vol, ${regime.liquidity} liquidity`)
    
    // 3. Calculate heuristics
    const heuristics = calculateHeuristics(snapshot)
    console.log(`[Orchestrator] Heuristics: ${heuristics.bias} bias, ${(heuristics.confidence * 100).toFixed(0)}% confidence`)
    
    // 4. Detect signal
    const signal = detectSignal(snapshot, heuristics, regime)
    console.log(`[Orchestrator] Signal: ${signal.pattern} (${signal.direction}), confidence ${(signal.confidence * 100).toFixed(0)}%`)
    
    // 5. Generate trade plan
    const plan = generateTradePlan(signal, accountEquity, riskPercentage)
    console.log(`[Orchestrator] Plan: ${plan.metrics.rr.toFixed(2)}R, entry ${plan.entry.price.toFixed(4)}`)
    
    // 6. Risk checks
    const riskCheck = performComprehensiveRiskCheck(signal, snapshot, plan.risk.pos_size_units)
    
    if (!riskCheck.passed) {
      console.warn(`[Orchestrator] Risk check failed:`, riskCheck.blockers)
      return buildOrchestratorOutput(
        [signal],
        [plan],
        [],
        [],
        [],
        `Signal detected but risk check failed: ${riskCheck.blockers.join(', ')}`,
        riskCheck.blockers
      )
    }
    
    if (riskCheck.warnings.length > 0) {
      console.warn(`[Orchestrator] Warnings:`, riskCheck.warnings)
    }
    
    // 7. Save to database
    await saveSignal(signal)
    await saveTradePlan(plan)
    
    // 8. Create action nodes
    const signalNode = createActionNode(
      'signal.detected',
      {
        pattern: signal.pattern,
        confidence: signal.confidence,
        price: signal.features.price,
      },
      { signal_id: signal.id },
      ['signal', `pattern/${signal.pattern}`, `chain/${chain}`],
      signal.confidence
    )
    
    const planNode = createActionNode(
      'trade.plan.created',
      {
        entry_price: plan.entry.price,
        stop: plan.risk.stop,
        rr: plan.metrics.rr,
        expectancy: plan.metrics.expectancy,
      },
      { signal_id: signal.id, plan_id: plan.id, prev_node_id: signalNode.id },
      ['plan', `rr/${plan.metrics.rr.toFixed(1)}`],
      1.0
    )
    
    await saveActionNode(signalNode)
    await saveActionNode(planNode)
    await saveEdge(signalNode.id, planNode.id, 'CAUSES')
    
    // 9. Build output
    const explanation = `Detected ${signal.pattern} ${signal.direction} signal with ${(signal.confidence * 100).toFixed(0)}% confidence. ` +
      `${signal.thesis}. Generated trade plan with ${plan.metrics.rr.toFixed(2)}R risk/reward ratio. ` +
      `Entry at ${plan.entry.price.toFixed(4)}, stop at ${plan.risk.stop.toFixed(4)}. ` +
      `${riskCheck.warnings.length > 0 ? `Warnings: ${riskCheck.warnings.join(', ')}` : 'All checks passed.'}`
    
    return buildOrchestratorOutput(
      [signal],
      [plan],
      [],
      [signalNode, planNode],
      [[signalNode.id, planNode.id, 'CAUSES']],
      explanation,
      riskCheck.warnings
    )
    
  } catch (error) {
    console.error('[Orchestrator] Error:', error)
    throw error
  }
}

// ============================================================================
// BATCH SIGNAL GENERATION
// ============================================================================

/**
 * Generate signals for multiple tokens
 */
export async function generateSignalsForWatchlist(
  watchlist: Array<{ address: string; chain: MarketSnapshot['token']['chain'] }>,
  accountEquity: number = 10000,
  minConfidence: number = 0.6
): Promise<Array<{ token: string; output: SignalOrchestratorOutput }>> {
  
  console.log(`[Orchestrator] Scanning ${watchlist.length} tokens...`)
  
  const results: Array<{ token: string; output: SignalOrchestratorOutput }> = []
  
  for (const { address, chain } of watchlist) {
    try {
      const output = await generateSignalFromToken(address, chain, accountEquity)
      
      // Filter by confidence
      if (output.signals.length > 0 && output.signals[0].confidence >= minConfidence) {
        results.push({ token: address, output })
      }
      
    } catch (error) {
      console.warn(`[Orchestrator] Skipped ${address}:`, error)
    }
  }
  
  console.log(`[Orchestrator] Found ${results.length} signals above ${minConfidence} confidence`)
  
  return results
}

// ============================================================================
// REAL-TIME SIGNAL MONITORING
// ============================================================================

/**
 * Monitor a token and generate signals when conditions are favorable
 */
export async function monitorTokenForSignals(
  tokenAddress: string,
  chain: MarketSnapshot['token']['chain'],
  callback: (output: SignalOrchestratorOutput) => void,
  intervalMs: number = 60000 // 1 minute
): Promise<() => void> {
  
  console.log(`[Orchestrator] Monitoring ${tokenAddress} every ${intervalMs}ms...`)
  
  const interval = setInterval(async () => {
    try {
      const output = await generateSignalFromToken(tokenAddress, chain)
      
      // Only callback if we have a valid signal with passed risk checks
      if (output.signals.length > 0 && output.trade_plans.length > 0 && !output.warnings?.includes('Risk check failed')) {
        callback(output)
      }
      
    } catch (error) {
      console.warn(`[Orchestrator] Monitor error for ${tokenAddress}:`, error)
    }
  }, intervalMs)
  
  // Return cleanup function
  return () => {
    clearInterval(interval)
    console.log(`[Orchestrator] Stopped monitoring ${tokenAddress}`)
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Generate signal for SOL
 */
export async function exampleGenerateSOLSignal() {
  const SOL_ADDRESS = 'So11111111111111111111111111111111111111112'
  
  const output = await generateSignalFromToken(SOL_ADDRESS, 'solana', 10000, 1.0)
  
  console.log('\n📊 Signal Output:')
  console.log(JSON.stringify(output, null, 2))
  
  return output
}

/**
 * Example: Scan watchlist
 */
export async function exampleScanWatchlist() {
  const watchlist = [
    { address: 'So11111111111111111111111111111111111111112', chain: 'solana' as const },
    { address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', chain: 'solana' as const }, // RAY
    { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', chain: 'solana' as const }, // USDC
  ]
  
  const signals = await generateSignalsForWatchlist(watchlist, 10000, 0.65)
  
  console.log(`\n📊 Found ${signals.length} high-confidence signals`)
  for (const { token, output } of signals) {
    const signal = output.signals[0]
    const plan = output.trade_plans[0]
    console.log(`   ${token}: ${signal.pattern} ${signal.direction} (${(signal.confidence * 100).toFixed(0)}%) - ${plan.metrics.rr.toFixed(2)}R`)
  }
  
  return signals
}

/**
 * Example: Monitor token in real-time
 */
export async function exampleMonitorToken() {
  const SOL_ADDRESS = 'So11111111111111111111111111111111111111112'
  
  const stop = await monitorTokenForSignals(
    SOL_ADDRESS,
    'solana',
    (output) => {
      const signal = output.signals[0]
      const plan = output.trade_plans[0]
      
      console.log(`\n🚨 NEW SIGNAL!`)
      console.log(`   Pattern: ${signal.pattern}`)
      console.log(`   Direction: ${signal.direction}`)
      console.log(`   Confidence: ${(signal.confidence * 100).toFixed(0)}%`)
      console.log(`   R:R: ${plan.metrics.rr.toFixed(2)}`)
      console.log(`   Entry: ${plan.entry.price.toFixed(4)}`)
      console.log(`   Stop: ${plan.risk.stop.toFixed(4)}`)
      
      // You could send notification, show UI alert, etc.
    },
    60000 // Check every minute
  )
  
  // Stop after 10 minutes
  setTimeout(() => {
    stop()
    console.log('\n✅ Monitoring stopped')
  }, 600000)
  
  return stop
}
