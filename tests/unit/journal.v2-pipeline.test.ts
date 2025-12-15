import { describe, expect, it } from 'vitest'
import { runJournalPipeline } from '@/features/journal-v2/engine'
import type { JournalRawInput } from '@/features/journal-v2/types'

const baseInput: JournalRawInput = {
  emotionalState: 'calm',
  emotionIntensity: 6,
  conviction: 7,
  patternQuality: 8,
  marketContext: 'breakout',
  reasoning: 'Capturing breakout retest with clear invalidation.',
  expectation: 'Momentum continuation into daily supply.',
  selfReflection: 'Stay patient on entries and avoid size creep.',
  createdAt: 1_700_000_000_000,
}

describe('journal-v2 pipeline', () => {
  it('returns archetype, metrics, and insights for a valid input', () => {
    const result = runJournalPipeline(baseInput)

    expect(result.archetype).toBeTypeOf('string')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.insights.length).toBeGreaterThan(0)
    expect(result.metrics.emotionalVolatility).toBeGreaterThanOrEqual(0)
    expect(['BUY', 'SELL', 'HOLD']).toContain(result.action)
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(100)
  })
})
