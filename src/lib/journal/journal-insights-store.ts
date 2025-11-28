/**
 * Journal Insights Store (Loop J3-C)
 * 
 * Persistence layer for AI-generated journal insights using IndexedDB.
 * Enables caching to avoid redundant AI calls for the same analysis.
 */

import { initDB } from '@/lib/db'
import type { JournalEntry } from '@/types/journal'
import type { JournalInsight, JournalInsightRecord, JournalInsightResult } from '@/types/journalInsights'

/**
 * Build a deterministic analysis key for a set of journal entries.
 * This key identifies a specific analysis run for caching purposes.
 * 
 * Format: "latest-{maxEntries}:{entry-id-1,entry-id-2,...}"
 */
export function buildAnalysisKey(entries: JournalEntry[], maxEntries: number): string {
  const ids = entries.slice(-maxEntries).map((e) => e.id).sort().join(',')
  return `latest-${maxEntries}:${ids}`
}

/**
 * Save insights for a specific analysis key to IndexedDB.
 * Overwrites any existing insights for the same key.
 */
export async function saveInsightsForAnalysisKey(
  analysisKey: string,
  result: JournalInsightResult
): Promise<void> {
  const db = await initDB()
  const nowIso = new Date(result.generatedAt).toISOString()

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
    generatedAt: nowIso,
    modelUsed: result.modelUsed,
    journeyPhaseAtGeneration: undefined, // TODO: Extract from entries if needed
    version: 1,
  }))

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_insights'], 'readwrite')
    const store = transaction.objectStore('journal_insights')

    // Delete existing insights for this analysisKey first
    const index = store.index('analysisKey')
    const deleteRequest = index.openCursor(IDBKeyRange.only(analysisKey))

    deleteRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }

    transaction.oncomplete = () => {
      // Now insert new records
      const insertTransaction = db.transaction(['journal_insights'], 'readwrite')
      const insertStore = insertTransaction.objectStore('journal_insights')

      let inserted = 0
      records.forEach((record) => {
        const request = insertStore.add(record)
        request.onsuccess = () => {
          inserted++
          if (inserted === records.length) {
            resolve()
          }
        }
        request.onerror = () => reject(request.error)
      })

      if (records.length === 0) {
        resolve()
      }
    }

    transaction.onerror = () => reject(transaction.error)
  })
}

/**
 * Load the most recent insights for a specific analysis key from IndexedDB.
 * Returns null if no cached insights exist.
 */
export async function loadLatestInsightsForAnalysisKey(
  analysisKey: string
): Promise<JournalInsightRecord[] | null> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_insights'], 'readonly')
    const store = transaction.objectStore('journal_insights')
    const index = store.index('analysisKey')
    const request = index.getAll(IDBKeyRange.only(analysisKey))

    request.onsuccess = () => {
      const records = request.result as JournalInsightRecord[]
      if (!records || records.length === 0) {
        resolve(null)
      } else {
        // Sort by generatedAt descending
        const sorted = records.sort((a, b) => {
          return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
        })
        resolve(sorted)
      }
    }

    request.onerror = () => reject(request.error)
  })
}

/**
 * Convert a JournalInsightRecord back to a JournalInsight for display.
 */
export function recordToInsight(record: JournalInsightRecord): JournalInsight {
  return {
    id: record.id,
    category: record.category,
    severity: record.severity,
    title: record.title,
    summary: record.summary,
    recommendation: record.recommendation,
    evidenceEntries: record.evidenceEntries,
    confidence: record.confidence ?? undefined,
    detectedAt: new Date(record.generatedAt).getTime(),
  }
}
