/**
 * Unit Tests: Journal Insights — Service (Loop J3-A)
 * 
 * Tests AI service logic with mocked responses (no real API calls).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { JournalEntry } from '@/types/journal'
import type { JournalInsight, JournalInsightResult } from '@/types/journalInsights'

// Mock global fetch before importing the service
const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

// Now import the service
import { getJournalInsightsForEntries } from '@/lib/journal/ai/journal-insights-service'

function getSingleInsight(result: JournalInsightResult): JournalInsight {
  expect(result.insights, 'expected exactly one insight').to.have.lengthOf(1)
  const [first] = result.insights

  if (!first) {
    throw new Error('Expected at least one insight')
  }

  return first
}

describe('getJournalInsightsForEntries', () => {
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

  const PROMPT_VERSION = 'journal-insights-v1.0'

  const validAIResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            insights: [
              {
                category: 'BEHAVIOR_LOOP',
                severity: 'WARNING',
                title: 'FOMO-Breakout Pattern',
                summary: 'Du steigst häufig bei Breakouts ein, die bereits stark gelaufen sind.',
                recommendation: 'Warte auf Pullbacks oder nutze Limit-Orders.',
                evidenceEntries: ['entry-1'],
                confidence: 85,
              },
            ],
          }),
        },
      },
    ],
    usage: {
      prompt_tokens: 500,
      completion_tokens: 200,
    },
  }

  beforeEach(() => {
    mockFetch.mockClear()
    // Set env var for tests
    process.env.OPENAI_API_KEY = 'test-key-123'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return structured insights from valid AI response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => validAIResponse,
    })

    const result = await getJournalInsightsForEntries({
      entries: [mockEntry],
    })

    const insight = getSingleInsight(result)

    expect(insight).toMatchObject({
      category: 'BEHAVIOR_LOOP',
      severity: 'WARNING',
      title: 'FOMO-Breakout Pattern',
      summary: expect.stringContaining('Breakouts'),
      recommendation: expect.stringContaining('Limit-Orders'),
      evidenceEntries: ['entry-1'],
      confidence: 85,
    })
    expect(insight.id).toBeDefined()
    expect(insight.detectedAt).toBeDefined()
  })

  it('should return metadata with result', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => validAIResponse,
    })

    const result = await getJournalInsightsForEntries({
      entries: [mockEntry],
    })

    expect(result.generatedAt).toBeDefined()
    expect(result.modelUsed).toBe('gpt-4o-mini')
    expect(result.promptVersion).toBe(PROMPT_VERSION)
    expect(result.costUsd).toBeDefined()
    expect(result.rawResponse).toBeDefined()
  })

  it('should handle empty entries array', async () => {
    // Mock should not be called for empty entries
    const result = await getJournalInsightsForEntries({
      entries: [],
    })

    expect(result.insights).toHaveLength(0)
    expect(result.promptVersion).toBe(PROMPT_VERSION)
  })

  it('should handle invalid JSON from AI', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'This is not JSON',
            },
          },
        ],
      }),
    })

    const result = await getJournalInsightsForEntries({
      entries: [mockEntry],
    })

    expect(result.insights).toHaveLength(0)
    expect(result.promptVersion).toBe(PROMPT_VERSION)
    expect(result.rawResponse).toBeDefined()
  })

  it('should handle AI response without insights array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({ message: 'No insights found' }),
            },
          },
        ],
      }),
    })

    const result = await getJournalInsightsForEntries({
      entries: [mockEntry],
    })

    expect(result.insights).toHaveLength(0)
    expect(result.promptVersion).toBe(PROMPT_VERSION)
  })

  it('should filter out insights with invalid categories', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                insights: [
                  {
                    category: 'INVALID_CATEGORY',
                    severity: 'WARNING',
                    title: 'Test',
                    summary: 'Test',
                    recommendation: 'Test',
                    evidenceEntries: ['entry-1'],
                  },
                ],
              }),
            },
          },
        ],
      }),
    })

    const result = await getJournalInsightsForEntries({
      entries: [mockEntry],
    })

    expect(result.insights).toHaveLength(0)
  })

  it('should filter out insights with invalid evidence entries', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                insights: [
                  {
                    category: 'BEHAVIOR_LOOP',
                    severity: 'WARNING',
                    title: 'Test',
                    summary: 'Test',
                    recommendation: 'Test',
                    evidenceEntries: ['non-existent-entry'],
                  },
                ],
              }),
            },
          },
        ],
      }),
    })

    const result = await getJournalInsightsForEntries({
      entries: [mockEntry],
    })

    expect(result.insights).toHaveLength(0)
  })

  it('should keep only valid evidence entries', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                insights: [
                  {
                    category: 'BEHAVIOR_LOOP',
                    severity: 'WARNING',
                    title: 'Test',
                    summary: 'Test',
                    recommendation: 'Test',
                    evidenceEntries: ['entry-1', 'non-existent-entry'],
                  },
                ],
              }),
            },
          },
        ],
      }),
    })

    const result = await getJournalInsightsForEntries({
      entries: [mockEntry],
    })

    const insight = getSingleInsight(result)

    expect(insight.evidenceEntries).toEqual(['entry-1'])
  })

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    })

    const result = await getJournalInsightsForEntries({
      entries: [mockEntry],
    })

    expect(result.insights).toHaveLength(0)
    expect(result.promptVersion).toBe(PROMPT_VERSION)
    expect(result.rawResponse).toBeDefined()
  })

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const result = await getJournalInsightsForEntries({
      entries: [mockEntry],
    })

    expect(result.insights).toHaveLength(0)
    expect(result.promptVersion).toBe(PROMPT_VERSION)
  })

  it('should generate stable IDs for insights', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => validAIResponse,
    })

    const result1 = await getJournalInsightsForEntries({
      entries: [mockEntry],
    })

    // Reset mock
    mockFetch.mockClear()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => validAIResponse,
    })

    const result2 = await getJournalInsightsForEntries({
      entries: [mockEntry],
    })

    // IDs should be stable for same category + title
    const firstInsightRun1 = getSingleInsight(result1)
    const firstInsightRun2 = getSingleInsight(result2)

    expect(firstInsightRun1.id).toBe(firstInsightRun2.id)
  })

  it('should handle multiple insights', async () => {
    const multiInsightResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              insights: [
                {
                  category: 'BEHAVIOR_LOOP',
                  severity: 'WARNING',
                  title: 'Pattern 1',
                  summary: 'Test 1',
                  recommendation: 'Rec 1',
                  evidenceEntries: ['entry-1'],
                },
                {
                  category: 'TIMING',
                  severity: 'INFO',
                  title: 'Pattern 2',
                  summary: 'Test 2',
                  recommendation: 'Rec 2',
                  evidenceEntries: ['entry-1'],
                },
              ],
            }),
          },
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => multiInsightResponse,
    })

    const result = await getJournalInsightsForEntries({
      entries: [mockEntry],
    })

    expect(result.insights).toHaveLength(2)
    const [first, second] = result.insights

    if (!first || !second) {
      throw new Error('Expected at least two insights')
    }

    expect(first.category).toBe('BEHAVIOR_LOOP')
    expect(second.category).toBe('TIMING')
  })

  it('should respect maxEntries parameter', async () => {
    const manyEntries = Array.from({ length: 30 }, (_, i) => ({
      ...mockEntry,
      id: `entry-${i}`,
    }))

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => validAIResponse,
    })

    await getJournalInsightsForEntries({
      entries: manyEntries,
      maxEntries: 10,
    })

    // Verify that fetch was called (prompt was built)
    expect(mockFetch).toHaveBeenCalled()
  })

  it('should handle missing confidence field', async () => {
    const responseNoConfidence = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              insights: [
                {
                  category: 'BEHAVIOR_LOOP',
                  severity: 'WARNING',
                  title: 'Test',
                  summary: 'Test',
                  recommendation: 'Test',
                  evidenceEntries: ['entry-1'],
                  // No confidence field
                },
              ],
            }),
          },
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => responseNoConfidence,
    })

    const result = await getJournalInsightsForEntries({
      entries: [mockEntry],
    })

    const insight = getSingleInsight(result)

    expect(insight.confidence).toBeUndefined()
  })
})
