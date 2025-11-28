import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { JournalEntry } from '@/types/journal'
import type { JournalInsightRecord } from '@/types/journalInsights'
import {
  __setJournalInsightsDbForTests,
  buildAnalysisKey,
  loadLatestInsightsForAnalysisKey,
  mapRecordToJournalInsight,
  saveInsightsForAnalysisKey,
} from '@/lib/journal/journal-insights-store'

function createMockDb() {
  const store = new Map<string, JournalInsightRecord>()

  return {
    journalInsights: {
      async bulkPut(records: JournalInsightRecord[]) {
        records.forEach((record) => {
          store.set(record.id, record)
        })
      },
      where(index: string) {
        expect(index).toBe('analysisKey')
        return {
          equals(value: string) {
            const records = Array.from(store.values()).filter(
              (record) => record.analysisKey === value
            )
            return {
              async sortBy(field: keyof JournalInsightRecord) {
                expect(field).toBe('generatedAt')
                return records.sort((a, b) => a.generatedAt.localeCompare(b.generatedAt))
              },
            }
          },
        }
      },
    },
    __store: store,
  }
}

describe('journal-insights-store', () => {
  let mockDb: ReturnType<typeof createMockDb>

  beforeEach(() => {
    mockDb = createMockDb()
    __setJournalInsightsDbForTests(mockDb)
  })

  afterEach(() => {
    __setJournalInsightsDbForTests(null)
  })

  function buildEntry(id: string, timestamp = Date.now()): JournalEntry {
    return {
      id,
      timestamp,
      ticker: 'SOL',
      address: 'So11111111111111111111111111111111111111112',
      setup: 'custom',
      emotion: 'custom',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  }

  it('builds a deterministic analysis key', () => {
    const entries: JournalEntry[] = [buildEntry('a', 1), buildEntry('b', 2)]

    const key = buildAnalysisKey(entries, 2)
    expect(key).toBe('v1:max-2:a,b')
  })

  it('persists and loads insights for a given analysis key', async () => {
    const analysisKey = 'v1:max-2:a,b'
    const now = Date.now()

    await saveInsightsForAnalysisKey(analysisKey, {
      insights: [
        {
          id: 'insight-1',
          category: 'BEHAVIOR_LOOP',
          severity: 'WARNING',
          title: 'Pattern',
          summary: 'Summary',
          recommendation: 'Do better',
          evidenceEntries: ['a'],
          detectedAt: now,
        },
      ],
      generatedAt: now,
      modelUsed: 'gpt-4o-mini',
    })

    const records = await loadLatestInsightsForAnalysisKey(analysisKey)
    expect(records).not.toBeNull()
    expect(records![0]?.analysisKey).toBe(analysisKey)
    expect(records![0]?.modelUsed).toBe('gpt-4o-mini')
    expect(records![0]?.version).toBe(1)
  })

  it('maps records back to runtime insights', () => {
    const detected = mapRecordToJournalInsight({
      id: 'insight-1',
      analysisKey: 'key',
      category: 'OTHER',
      severity: 'INFO',
      title: 'Title',
      summary: 'Summary',
      recommendation: 'Recommendation',
      evidenceEntries: ['a'],
      confidence: null,
      generatedAt: new Date().toISOString(),
      version: 1,
    })

    expect(detected.id).toBe('insight-1')
    expect(detected.detectedAt).to.be.a('number')
  })
})
