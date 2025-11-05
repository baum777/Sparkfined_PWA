/**
 * Signal Orchestrator Unit Tests
 * 
 * Tests for the core orchestrator functionality
 */

import { describe, it, expect } from 'vitest'
import type { MarketSnapshot } from '../../src/types/market'
import type { MarketRegime } from '../../src/types/signal'

// Mock market snapshot for testing
const mockSnapshot: MarketSnapshot = {
  token: {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    chain: 'solana',
    decimals: 9,
  },
  price: {
    current: 95.5,
    high24h: 102.0,
    low24h: 89.0,
    change24h: 5.5,
  },
  volume: {
    volume24h: 2500000,
  },
  liquidity: {
    total: 850000,
  },
  metadata: {
    provider: 'dexpaprika',
    timestamp: Date.now(),
    cached: false,
    confidence: 0.9,
  },
}

describe('Signal Orchestrator', () => {
  describe('Regime Detection', () => {
    it('should detect uptrend correctly', async () => {
      const { detectRegime } = await import('../../src/lib/regimeDetector')
      
      const snapshot = {
        ...mockSnapshot,
        price: { ...mockSnapshot.price, change24h: 8.5 },
      }
      
      const regime = detectRegime(snapshot)
      
      expect(regime.trend).toBe('up')
    })
    
    it('should detect downtrend correctly', async () => {
      const { detectRegime } = await import('../../src/lib/regimeDetector')
      
      const snapshot = {
        ...mockSnapshot,
        price: { ...mockSnapshot.price, change24h: -8.5 },
      }
      
      const regime = detectRegime(snapshot)
      
      expect(regime.trend).toBe('down')
    })
    
    it('should detect sideways market correctly', async () => {
      const { detectRegime } = await import('../../src/lib/regimeDetector')
      
      const snapshot = {
        ...mockSnapshot,
        price: { ...mockSnapshot.price, change24h: 0.5 },
      }
      
      const regime = detectRegime(snapshot)
      
      expect(regime.trend).toBe('side')
    })
    
    it('should detect volatility levels', async () => {
      const { detectRegime } = await import('../../src/lib/regimeDetector')
      
      // Low volatility
      const lowVolSnapshot = {
        ...mockSnapshot,
        price: { ...mockSnapshot.price, high24h: 96.0, low24h: 95.0 },
      }
      const lowVolRegime = detectRegime(lowVolSnapshot)
      expect(lowVolRegime.vol).toBe('low')
      
      // High volatility
      const highVolSnapshot = {
        ...mockSnapshot,
        price: { ...mockSnapshot.price, high24h: 110.0, low24h: 85.0 },
      }
      const highVolRegime = detectRegime(highVolSnapshot)
      expect(highVolRegime.vol).toBe('high')
    })
    
    it('should detect liquidity levels', async () => {
      const { detectRegime } = await import('../../src/lib/regimeDetector')
      
      // Low liquidity
      const lowLiqSnapshot = {
        ...mockSnapshot,
        liquidity: { total: 30000 },
      }
      const lowLiqRegime = detectRegime(lowLiqSnapshot)
      expect(lowLiqRegime.liquidity).toBe('low')
      
      // High liquidity
      const highLiqSnapshot = {
        ...mockSnapshot,
        liquidity: { total: 2000000 },
      }
      const highLiqRegime = detectRegime(highLiqSnapshot)
      expect(highLiqRegime.liquidity).toBe('high')
    })
  })
  
  describe('Risk Checks', () => {
    it('should detect rug risk on low liquidity', async () => {
      const { checkRugRisk } = await import('../../src/lib/riskChecks')
      
      const riskySnapshot = {
        ...mockSnapshot,
        liquidity: { total: 5000 }, // Very low
      }
      
      const risk = checkRugRisk(riskySnapshot)
      
      expect(risk.passed).toBe(false)
      expect(risk.flags.length).toBeGreaterThan(0)
      expect(risk.score).toBeLessThan(0.5)
    })
    
    it('should pass on healthy liquidity', async () => {
      const { checkRugRisk } = await import('../../src/lib/riskChecks')
      
      const risk = checkRugRisk(mockSnapshot)
      
      expect(risk.score).toBeGreaterThan(0.5)
    })
    
    it('should calculate safe position sizes', async () => {
      const { checkLiquidity } = await import('../../src/lib/riskChecks')
      
      const positionSize = 10000 // $10k position
      const result = checkLiquidity(mockSnapshot, positionSize)
      
      expect(result.maxSafeSize).toBeGreaterThan(0)
      expect(result.slippageEstimate).toBeGreaterThan(0)
    })
    
    it('should warn on oversized positions', async () => {
      const { checkLiquidity } = await import('../../src/lib/riskChecks')
      
      const hugePosition = 1000000 // $1M position (way too big)
      const result = checkLiquidity(mockSnapshot, hugePosition)
      
      expect(result.passed).toBe(false)
      expect(result.warnings.length).toBeGreaterThan(0)
    })
  })
  
  describe('Signal Generation', () => {
    it('should generate valid signal structure', async () => {
      const { detectSignal } = await import('../../src/lib/signalOrchestrator')
      const { detectRegime } = await import('../../src/lib/regimeDetector')
      
      const regime = detectRegime(mockSnapshot)
      const heuristics = {
        bias: 'Bullish' as const,
        confidence: 0.7,
        rsiOverbought: false,
        rsiOversold: false,
        rangeSize: 'Medium' as const,
        entryZone: { min: 94.0, max: 97.0 },
        source: 'heuristic' as const,
      }
      
      const signal = detectSignal(mockSnapshot, heuristics, regime)
      
      expect(signal.id).toMatch(/^sig_/)
      expect(signal.pattern).toBeDefined()
      expect(signal.confidence).toBeGreaterThanOrEqual(0)
      expect(signal.confidence).toBeLessThanOrEqual(1)
      expect(signal.direction).toMatch(/long|short|neutral/)
      expect(signal.thesis).toBeTruthy()
    })
  })
  
  describe('Trade Plan Generation', () => {
    it('should generate valid trade plan', async () => {
      const { detectSignal, generateTradePlan } = await import('../../src/lib/signalOrchestrator')
      const { detectRegime } = await import('../../src/lib/regimeDetector')
      
      const regime = detectRegime(mockSnapshot)
      const heuristics = {
        bias: 'Bullish' as const,
        confidence: 0.7,
        rsiOverbought: false,
        rsiOversold: false,
        rangeSize: 'Medium' as const,
        entryZone: { min: 94.0, max: 97.0 },
        source: 'heuristic' as const,
      }
      
      const signal = detectSignal(mockSnapshot, heuristics, regime)
      const plan = generateTradePlan(signal, 10000, 1.0)
      
      expect(plan.id).toMatch(/^plan_/)
      expect(plan.signal_id).toBe(signal.id)
      expect(plan.entry.price).toBeGreaterThan(0)
      expect(plan.risk.stop).toBeGreaterThan(0)
      expect(plan.targets.length).toBeGreaterThan(0)
      expect(plan.metrics.rr).toBeGreaterThan(0)
      expect(plan.status).toBe('pending')
    })
    
    it('should calculate valid R:R ratio', async () => {
      const { detectSignal, generateTradePlan } = await import('../../src/lib/signalOrchestrator')
      const { detectRegime } = await import('../../src/lib/regimeDetector')
      
      const regime = detectRegime(mockSnapshot)
      const heuristics = {
        bias: 'Bullish' as const,
        confidence: 0.7,
        rsiOverbought: false,
        rsiOversold: false,
        rangeSize: 'Medium' as const,
        entryZone: { min: 94.0, max: 97.0 },
        source: 'heuristic' as const,
      }
      
      const signal = detectSignal(mockSnapshot, heuristics, regime)
      const plan = generateTradePlan(signal, 10000, 1.0)
      
      // R:R should be positive and reasonable (typically 1:1 to 10:1)
      expect(plan.metrics.rr).toBeGreaterThan(0.5)
      expect(plan.metrics.rr).toBeLessThan(10)
    })
    
    it('should include risk checklist', async () => {
      const { detectSignal, generateTradePlan } = await import('../../src/lib/signalOrchestrator')
      const { detectRegime } = await import('../../src/lib/regimeDetector')
      
      const regime = detectRegime(mockSnapshot)
      const heuristics = {
        bias: 'Bullish' as const,
        confidence: 0.7,
        rsiOverbought: false,
        rsiOversold: false,
        rangeSize: 'Medium' as const,
        entryZone: { min: 94.0, max: 97.0 },
        source: 'heuristic' as const,
      }
      
      const signal = detectSignal(mockSnapshot, heuristics, regime)
      const plan = generateTradePlan(signal, 10000, 1.0)
      
      expect(plan.checklist).toBeInstanceOf(Array)
      expect(plan.checklist.length).toBeGreaterThan(0)
    })
  })
  
  describe('Demo Data Generation', () => {
    it('should generate valid demo signal', async () => {
      const { generateDemoSignal } = await import('../../src/lib/demoDataGenerator')
      
      const signal = generateDemoSignal('momentum', 'long')
      
      expect(signal.id).toMatch(/^sig_/)
      expect(signal.pattern).toBe('momentum')
      expect(signal.direction).toBe('long')
      expect(signal.confidence).toBeGreaterThan(0)
      expect(signal.confidence).toBeLessThanOrEqual(1)
    })
    
    it('should generate valid demo plan', async () => {
      const { generateDemoSignal, generateDemoPlan } = await import('../../src/lib/demoDataGenerator')
      
      const signal = generateDemoSignal()
      const plan = generateDemoPlan(signal)
      
      expect(plan.id).toMatch(/^plan_/)
      expect(plan.signal_id).toBe(signal.id)
      expect(plan.targets.length).toBeGreaterThan(0)
    })
    
    it('should generate valid demo outcome', async () => {
      const { generateDemoSignal, generateDemoPlan, generateDemoOutcome } = await import('../../src/lib/demoDataGenerator')
      
      const signal = generateDemoSignal()
      const plan = generateDemoPlan(signal)
      const outcome = generateDemoOutcome(plan, signal)
      
      expect(outcome.plan_id).toBe(plan.id)
      expect(outcome.signal_id).toBe(signal.id)
      expect(outcome.result).toMatch(/win|loss|breakeven|partial/)
      expect(outcome.exit_reason).toBeDefined()
    })
  })
})
