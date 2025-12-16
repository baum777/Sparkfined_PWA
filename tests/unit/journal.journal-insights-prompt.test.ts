/**
 * Unit Tests: Journal Insights — Prompt Builder (Loop J3-A)
 */

import { describe, it, expect } from 'vitest'
import { buildJournalInsightsPrompt } from '@/lib/journal/ai/journal-insights-prompt'
import type { JournalEntry } from '@/types/journal'

describe('buildJournalInsightsPrompt', () => {
  const mockEntry: JournalEntry = {
    id: 'entry-1',
    timestamp: Date.now(),
    ticker: 'BONK',
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    setup: 'breakout',
    emotion: 'fomo',
    status: 'closed',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    outcome: {
      pnl: -50,
      pnlPercent: -25,
      transactions: [],
    },
    journeyMeta: {
      phase: 'DEGEN',
      xpTotal: 100,
      streak: 2,
      lastEventAt: Date.now(),
    },
  }

  it('should generate system and user prompts', () => {
    const result = buildJournalInsightsPrompt({
      entries: [mockEntry],
    })

    expect(result).toHaveProperty('system')
    expect(result).toHaveProperty('user')
    expect(typeof result.system).toBe('string')
    expect(typeof result.user).toBe('string')
  })

  it('system prompt should mention coaching and pattern detection', () => {
    const result = buildJournalInsightsPrompt({
      entries: [mockEntry],
    })

    expect(result.system).toContain('Trading-Coach')
    expect(result.system).toContain('Verhaltensmuster')
    expect(result.system).toContain('BEHAVIOR_LOOP')
    expect(result.system).toContain('TIMING')
    expect(result.system).toContain('RISK_MANAGEMENT')
    expect(result.system).toContain('SETUP_DISCIPLINE')
    expect(result.system).toContain('EMOTIONAL_PATTERN')
  })

  it('system prompt should define JSON output format', () => {
    const result = buildJournalInsightsPrompt({
      entries: [mockEntry],
    })

    expect(result.system).toContain('insights')
    expect(result.system).toContain('category')
    expect(result.system).toContain('severity')
    expect(result.system).toContain('title')
    expect(result.system).toContain('summary')
    expect(result.system).toContain('recommendation')
    expect(result.system).toContain('evidenceEntries')
  })

  it('user prompt should include entry data', () => {
    const result = buildJournalInsightsPrompt({
      entries: [mockEntry],
    })

    expect(result.user).toContain('BONK')
    expect(result.user).toContain('entry-1')
    expect(result.user).toContain('breakout')
    expect(result.user).toContain('fomo')
    expect(result.user).toContain('DEGEN')
  })

  it('should limit entries to maxEntries', () => {
    const manyEntries: JournalEntry[] = Array.from({ length: 30 }, (_, i) => ({
      ...mockEntry,
      id: `entry-${i}`,
    }))

    const result = buildJournalInsightsPrompt({
      entries: manyEntries,
      maxEntries: 10,
    })

    // Count how many entry IDs appear in user prompt
    const entryMatches = result.user.match(/entry-\d+/g)
    expect(entryMatches).toBeDefined()
    expect(entryMatches!.length).toBeLessThanOrEqual(10)
  })

  it('should use default maxEntries of 20', () => {
    const manyEntries: JournalEntry[] = Array.from({ length: 30 }, (_, i) => ({
      ...mockEntry,
      id: `entry-${i}`,
    }))

    const result = buildJournalInsightsPrompt({
      entries: manyEntries,
    })

    // Count how many entry IDs appear in user prompt
    const entryMatches = result.user.match(/entry-\d+/g)
    expect(entryMatches).toBeDefined()
    expect(entryMatches!.length).toBeLessThanOrEqual(20)
  })

  it('should handle empty entries array', () => {
    const result = buildJournalInsightsPrompt({
      entries: [],
    })

    expect(result.user).toContain('No entries available')
  })

  it('should include focusCategories in user prompt', () => {
    const result = buildJournalInsightsPrompt({
      entries: [mockEntry],
      focusCategories: ['BEHAVIOR_LOOP', 'TIMING'],
    })

    expect(result.user).toContain('Fokus')
    expect(result.user).toContain('BEHAVIOR_LOOP')
    expect(result.user).toContain('TIMING')
  })

  it('should format outcome data correctly', () => {
    const entryWithLoss = {
      ...mockEntry,
      outcome: {
        pnl: -50,
        pnlPercent: -25,
        transactions: [],
      },
    }

    const result = buildJournalInsightsPrompt({
      entries: [entryWithLoss],
    })

    expect(result.user).toContain('-50')
    expect(result.user).toContain('-25')
  })

  it('should handle entries without outcome', () => {
    const entryNoOutcome = {
      ...mockEntry,
      outcome: undefined,
    }

    const result = buildJournalInsightsPrompt({
      entries: [entryNoOutcome],
    })

    expect(result.user).toContain('N/A')
  })

  it('should include journey metadata', () => {
    const result = buildJournalInsightsPrompt({
      entries: [mockEntry],
    })

    expect(result.user).toContain('DEGEN')
    expect(result.user).toContain('XP: 100')
    expect(result.user).toContain('Streak: 2')
  })

  it('should handle entries without journeyMeta', () => {
    const entryNoJourney = {
      ...mockEntry,
      journeyMeta: undefined,
    }

    const result = buildJournalInsightsPrompt({
      entries: [entryNoJourney],
    })

    // Should use defaults
    expect(result.user).toContain('DEGEN')
    expect(result.user).toContain('XP: 0')
    expect(result.user).toContain('Streak: 0')
  })

  it('should include custom tags', () => {
    const entryWithTags = {
      ...mockEntry,
      customTags: ['scalp', 'high-volume'],
    }

    const result = buildJournalInsightsPrompt({
      entries: [entryWithTags],
    })

    expect(result.user).toContain('scalp')
    expect(result.user).toContain('high-volume')
  })

  it('should handle missing thesis', () => {
    const entryNoThesis = {
      ...mockEntry,
      thesis: undefined,
    }

    const result = buildJournalInsightsPrompt({
      entries: [entryNoThesis],
    })

    expect(result.user).toContain('Keine Notiz')
  })
})
