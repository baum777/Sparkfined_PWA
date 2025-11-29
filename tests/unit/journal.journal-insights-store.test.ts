/**
 * Journal Insights Store Tests (Loop J3-C)
 * 
 * Tests for persistence layer for AI-generated journal insights.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  buildAnalysisKey,
  saveInsightsForAnalysisKey,
  loadLatestInsightsForAnalysisKey,
  recordToInsight,
} from '@/lib/journal/journal-insights-store'
import type { JournalEntry } from '@/types/journal'
import type { JournalInsightResult, JournalInsightRecord } from '@/types/journalInsights'

// Mock IndexedDB
const mockDB = {
  transaction: vi.fn(),
  objectStoreNames: {
    contains: vi.fn(() => true),
  },
}

const mockStore = {
  add: vi.fn(),
  getAll: vi.fn(),
  index: vi.fn(),
}

const mockTransaction = {
  objectStore: vi.fn(() => mockStore),
  oncomplete: null as (() => void) | null,
  onerror: null as ((event: unknown) => void) | null,
}

const mockIndex = {
  getAll: vi.fn(),
  openCursor: vi.fn(),
}

// Mock initDB
vi.mock('@/lib/db', () => ({
  initDB: vi.fn(() => Promise.resolve(mockDB)),
}))

describe('buildAnalysisKey', () => {
  it('builds deterministic key from entry IDs', () => {
    const entries: JournalEntry[] = [
      { id: 'entry-1', ticker: 'SOL', timestamp: 1000 } as JournalEntry,
      { id: 'entry-2', ticker: 'BONK', timestamp: 2000 } as JournalEntry,
      { id: 'entry-3', ticker: 'JTO', timestamp: 3000 } as JournalEntry,
    ]

    const key = buildAnalysisKey(entries, 3)
    expect(key).toContain('latest-3:')
    expect(key).toContain('entry-1')
    expect(key).toContain('entry-2')
    expect(key).toContain('entry-3')
  })

  it('respects maxEntries limit', () => {
    const entries: JournalEntry[] = [
      { id: 'entry-1', ticker: 'SOL', timestamp: 1000 } as JournalEntry,
      { id: 'entry-2', ticker: 'BONK', timestamp: 2000 } as JournalEntry,
      { id: 'entry-3', ticker: 'JTO', timestamp: 3000 } as JournalEntry,
    ]

    const key = buildAnalysisKey(entries, 2)
    expect(key).toContain('latest-2:')
    expect(key).not.toContain('entry-1')
    expect(key).toContain('entry-2')
    expect(key).toContain('entry-3')
  })

  it('sorts entry IDs for determinism', () => {
    const entries1: JournalEntry[] = [
      { id: 'entry-a', ticker: 'SOL', timestamp: 1000 } as JournalEntry,
      { id: 'entry-b', ticker: 'BONK', timestamp: 2000 } as JournalEntry,
    ]

    const entries2: JournalEntry[] = [
      { id: 'entry-b', ticker: 'BONK', timestamp: 2000 } as JournalEntry,
      { id: 'entry-a', ticker: 'SOL', timestamp: 1000 } as JournalEntry,
    ]

    const key1 = buildAnalysisKey(entries1, 2)
    const key2 = buildAnalysisKey(entries2, 2)
    expect(key1).toBe(key2)
  })
})

describe('saveInsightsForAnalysisKey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.index.mockReturnValue(mockIndex)
    mockDB.transaction.mockReturnValue(mockTransaction)
  })

  it('saves insights to IndexedDB', async () => {
    const analysisKey = 'latest-2:entry-1,entry-2'
    const result: JournalInsightResult = {
      insights: [
        {
          id: 'insight-1',
          category: 'BEHAVIOR_LOOP',
          severity: 'WARNING',
          title: 'FOMO Pattern',
          summary: 'You tend to enter on FOMO.',
          recommendation: 'Wait for confirmation.',
          evidenceEntries: ['entry-1'],
          confidence: 85,
          detectedAt: 1000,
        },
      ],
      generatedAt: Date.now(),
      modelUsed: 'gpt-4o-mini',
      promptVersion: 'journal-insights-v1.0',
    }

    // Mock cursor for delete operation
    mockIndex.openCursor.mockImplementation((_range) => ({
      onsuccess: (event: { target: { result: null } }) => {
        event.target.result = null
      },
    }))

    // Mock add success
    mockStore.add.mockImplementation(() => ({
      onsuccess: vi.fn(),
      onerror: vi.fn(),
    }))

    // Trigger transaction.oncomplete immediately
    mockDB.transaction.mockImplementation(() => {
      const txn = {
        ...mockTransaction,
        objectStore: vi.fn(() => mockStore),
      }
      setTimeout(() => {
        if (txn.oncomplete) txn.oncomplete()
      }, 0)
      return txn
    })

    await saveInsightsForAnalysisKey(analysisKey, result)

    expect(mockDB.transaction).toHaveBeenCalled()
  })
})

describe('loadLatestInsightsForAnalysisKey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.index.mockReturnValue(mockIndex)
    mockDB.transaction.mockReturnValue(mockTransaction)
  })

  it('returns null when no cached insights exist', async () => {
    const analysisKey = 'latest-2:entry-1,entry-2'

    mockIndex.getAll.mockImplementation(() => ({
      onsuccess: vi.fn(),
      onerror: vi.fn(),
      result: [],
    }))

    mockIndex.getAll.mockImplementation(() => {
      const request = {
        result: [],
        onsuccess: null as (() => void) | null,
        onerror: null as ((event: unknown) => void) | null,
      }
      setTimeout(() => {
        if (request.onsuccess) request.onsuccess()
      }, 0)
      return request
    })

    const result = await loadLatestInsightsForAnalysisKey(analysisKey)
    expect(result).toBeNull()
  })

  it('returns cached insights when they exist', async () => {
    const analysisKey = 'latest-2:entry-1,entry-2'
    const cached: JournalInsightRecord[] = [
      {
        id: 'insight-1',
        analysisKey,
        category: 'BEHAVIOR_LOOP',
        severity: 'WARNING',
        title: 'FOMO Pattern',
        summary: 'You tend to enter on FOMO.',
        recommendation: 'Wait for confirmation.',
        evidenceEntries: ['entry-1'],
        confidence: 85,
        generatedAt: new Date(1000).toISOString(),
        modelUsed: 'gpt-4o-mini',
        version: 1,
      },
    ]

    mockIndex.getAll.mockImplementation(() => {
      const request = {
        result: cached,
        onsuccess: null as (() => void) | null,
        onerror: null as ((event: unknown) => void) | null,
      }
      setTimeout(() => {
        if (request.onsuccess) request.onsuccess()
      }, 0)
      return request
    })

    const result = await loadLatestInsightsForAnalysisKey(analysisKey)
    expect(result).toBeTruthy()
    expect(result).toHaveLength(1)
    expect(result?.[0]?.id).toBe('insight-1')
  })
})

describe('recordToInsight', () => {
  it('converts JournalInsightRecord to JournalInsight', () => {
    const record: JournalInsightRecord = {
      id: 'insight-1',
      analysisKey: 'latest-2:entry-1,entry-2',
      category: 'BEHAVIOR_LOOP',
      severity: 'WARNING',
      title: 'FOMO Pattern',
      summary: 'You tend to enter on FOMO.',
      recommendation: 'Wait for confirmation.',
      evidenceEntries: ['entry-1'],
      confidence: 85,
      generatedAt: new Date(1000).toISOString(),
      modelUsed: 'gpt-4o-mini',
      version: 1,
    }

    const insight = recordToInsight(record)
    expect(insight.id).toBe('insight-1')
    expect(insight.category).toBe('BEHAVIOR_LOOP')
    expect(insight.severity).toBe('WARNING')
    expect(insight.title).toBe('FOMO Pattern')
    expect(insight.confidence).toBe(85)
    expect(insight.detectedAt).toBe(1000)
  })

  it('handles null confidence', () => {
    const record: JournalInsightRecord = {
      id: 'insight-1',
      analysisKey: 'latest-2:entry-1,entry-2',
      category: 'TIMING',
      severity: 'INFO',
      title: 'Evening trades',
      summary: 'Most trades happen in evening.',
      recommendation: 'Consider earlier sessions.',
      evidenceEntries: ['entry-1'],
      confidence: null,
      generatedAt: new Date(1000).toISOString(),
      version: 1,
    }

    const insight = recordToInsight(record)
    expect(insight.confidence).toBeUndefined()
  })
})
