import Dexie, { type Table } from 'dexie'
import type { JournalEntry, JourneyPhase } from '@/types/journal'
import type {
  JournalInsight,
  JournalInsightRecord,
  JournalInsightResult,
} from '@/types/journalInsights'

const DB_NAME = 'sparkfined-journal-insights'
const DB_VERSION = 1

class JournalInsightsDatabase extends Dexie {
  journalInsights!: Table<JournalInsightRecord, string>

  constructor() {
    super(DB_NAME)
    this.version(DB_VERSION).stores({
      journalInsights: 'id, analysisKey, generatedAt',
    })
  }
}

type JournalInsightsDbLike = Pick<JournalInsightsDatabase, 'journalInsights'>

let dbInstance: JournalInsightsDatabase | null = null
let testDbOverride: JournalInsightsDbLike | null = null

function hasIndexedDB(): boolean {
  return typeof globalThis !== 'undefined' && 'indexedDB' in globalThis
}

function getDb(): JournalInsightsDbLike | null {
  if (testDbOverride) {
    return testDbOverride
  }
  if (dbInstance) {
    return dbInstance
  }
  if (!hasIndexedDB()) {
    return null
  }
  dbInstance = new JournalInsightsDatabase()
  return dbInstance
}

/**
 * Generate a deterministic key describing the current analysis input set.
 * Includes the maxEntries parameter to distinguish different panel limits.
 */
export function buildAnalysisKey(entries: JournalEntry[], maxEntries: number): string {
  const relevant = entries.slice(-maxEntries)
  if (relevant.length === 0) {
    return `v1:max-${maxEntries}:empty`
  }

  const ids = relevant.map((entry, index) => entry.id || `unknown-${index}`)
  return `v1:max-${maxEntries}:${ids.join(',')}`
}

export async function saveInsightsForAnalysisKey(
  analysisKey: string,
  result: JournalInsightResult,
  options?: { journeyPhase?: JourneyPhase }
): Promise<void> {
  const db = getDb()
  if (!db) {
    return
  }

  const generatedAtIso = new Date(result.generatedAt ?? Date.now()).toISOString()
  const records: JournalInsightRecord[] = result.insights.map((insight) => ({
    id: insight.id,
    analysisKey,
    category: insight.category,
    severity: insight.severity,
    title: insight.title,
    summary: insight.summary,
    recommendation: insight.recommendation,
    evidenceEntries: insight.evidenceEntries,
    confidence: insight.confidence ?? null,
    generatedAt: generatedAtIso,
    modelUsed: result.modelUsed,
    journeyPhaseAtGeneration: options?.journeyPhase,
    version: 1,
  }))

  try {
    await db.journalInsights.bulkPut(records)
  } catch (error) {
    console.warn('[journal-insights-store] Failed to persist insights', error)
  }
}

export async function loadLatestInsightsForAnalysisKey(
  analysisKey: string
): Promise<JournalInsightRecord[] | null> {
  const db = getDb()
  if (!db) {
    return null
  }

  try {
    const records = await db.journalInsights
      .where('analysisKey')
      .equals(analysisKey)
      .sortBy('generatedAt')

    if (!records.length) {
      return null
    }

    return records.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
  } catch (error) {
    console.warn('[journal-insights-store] Failed to load cached insights', error)
    return null
  }
}

export function mapRecordToJournalInsight(record: JournalInsightRecord): JournalInsight {
  const detectedAt = Date.parse(record.generatedAt)
  return {
    id: record.id,
    category: record.category,
    severity: record.severity,
    title: record.title,
    summary: record.summary,
    recommendation: record.recommendation,
    evidenceEntries: record.evidenceEntries,
    confidence: record.confidence ?? undefined,
    detectedAt: Number.isNaN(detectedAt) ? Date.now() : detectedAt,
  }
}

// ===== Test Helpers =====

export function __setJournalInsightsDbForTests(db: JournalInsightsDbLike | null): void {
  testDbOverride = db
}
