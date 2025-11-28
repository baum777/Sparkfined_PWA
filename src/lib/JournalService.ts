/**
 * JournalService - BLOCK 1: Unified Journal Management
 * 
 * Provides CRUD operations for journal entries with IndexedDB storage
 * Replaces the stub implementation with full business logic
 * 
 * Features:
 * - Create/Update/Delete journal entries
 * - Query with filters (setup, emotion, status, date range)
 * - Pattern analytics (win rate, hold time, MCap analysis)
 * - Auto-cleanup for temp entries (TTL: 7 days)
 */

import { initDB } from './db'
import { useEventBusStore } from '@/store/eventBus'
import type {
  JournalEntry,
  JournalQueryOptions,
  PatternStats,
  JournalExport,
  JournalExportFormat,
  SetupTag,
  EmotionTag,
  TradeOutcome,
} from '@/types/journal'
import type { JournalEvent } from '@/types/journalEvents'

// Re-export types for external use
export type { JournalEntry, PatternStats, SetupTag, EmotionTag }

const REFLEXION_FIELD_KEYS = new Set(['thesis', 'setup', 'emotion', 'status'])

function emitJournalEvent(event: JournalEvent): void {
  try {
    useEventBusStore.getState().pushEvent(event)
  } catch {
    // Store not ready yet (SSR / tests) - safe to ignore
  }
}

function estimateReflexionQuality(entry: JournalEntry): number {
  let score = 40
  if (entry.thesis) score += 30
  if (entry.grokContext) score += 10
  if (entry.chartSnapshot) score += 10
  if (entry.outcome) score += 10
  return Math.min(100, score)
}

function maybeEmitReflexionCompleted(
  existing: JournalEntry,
  updated: JournalEntry,
  updatedFields: string[],
): void {
  const touchedReflexionField = updatedFields.some((field) =>
    REFLEXION_FIELD_KEYS.has(field),
  )
  const hasCoreReflectionData =
    Boolean(updated.thesis?.trim()) &&
    Boolean(updated.setup) &&
    Boolean(updated.emotion) &&
    updated.status !== 'temp'

  if (!touchedReflexionField || !hasCoreReflectionData) {
    return
  }

  emitJournalEvent({
    type: 'JournalReflexionCompleted',
    domain: 'journal',
    timestamp: Date.now(),
    payload: {
      entryId: updated.id,
      qualityScore: estimateReflexionQuality(updated),
      journeyMeta: updated.journeyMeta,
    },
  })
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Create a new journal entry
 * @param entry - Partial entry data (id/timestamps auto-generated)
 * @returns Created entry with generated fields
 */
export async function createEntry(
  entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<JournalEntry> {
  const db = await initDB()
  const now = Date.now()

  const newEntry: JournalEntry = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...entry,
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readwrite')
    const store = transaction.objectStore('journal_entries')
    const request = store.add(newEntry)

    request.onsuccess = () => {
      emitJournalEvent({
        type: 'JournalEntryCreated',
        domain: 'journal',
        timestamp: Date.now(),
        payload: {
          entryId: newEntry.id,
          snapshot: newEntry,
          source: 'manual',
        },
      })
      resolve(newEntry)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Update an existing journal entry
 * @param id - Entry ID
 * @param updates - Partial updates
 * @returns Updated entry or undefined if not found
 */
export async function updateEntry(
  id: string,
  updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>
): Promise<JournalEntry | undefined> {
  const db = await initDB()
  const existing = await getEntry(id)
  if (!existing) return undefined

  const updatedFields = Object.keys(updates)
  const updated: JournalEntry = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readwrite')
    const store = transaction.objectStore('journal_entries')
    const request = store.put(updated)

    request.onsuccess = () => {
      if (updatedFields.length > 0) {
        emitJournalEvent({
          type: 'JournalEntryUpdated',
          domain: 'journal',
          timestamp: Date.now(),
          payload: {
            entryId: updated.id,
            snapshot: updated,
            updatedFields,
          },
        })
        maybeEmitReflexionCompleted(existing, updated, updatedFields)
      }
      resolve(updated)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Update only the notes (thesis) field of a journal entry.
 * Returns the updated persisted entry.
 */
export async function updateEntryNotes(
  id: string,
  notes: string
): Promise<JournalEntry> {
  const updated = await updateEntry(id, {
    thesis: notes,
  })

  if (!updated) {
    throw new Error(`Journal entry ${id} not found`)
  }

  return updated
}

/**
 * Get a single journal entry by ID
 * @param id - Entry ID
 * @returns Entry or undefined
 */
export async function getEntry(id: string): Promise<JournalEntry | undefined> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readonly')
    const store = transaction.objectStore('journal_entries')
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result as JournalEntry | undefined)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Delete a journal entry
 * @param id - Entry ID
 */
export async function deleteEntry(id: string): Promise<void> {
  const existing = await getEntry(id)
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readwrite')
    const store = transaction.objectStore('journal_entries')
    const request = store.delete(id)

    request.onsuccess = () => {
      if (existing) {
        emitJournalEvent({
          type: 'JournalEntryDeleted',
          domain: 'journal',
          timestamp: Date.now(),
          payload: { entryId: existing.id },
        })
      }
      resolve()
    }
    request.onerror = () => reject(request.error)
  })
}

// ============================================================================
// QUERY & FILTERING
// ============================================================================

/**
 * Query journal entries with filters
 * @param options - Query filters (setup, emotion, status, date range, etc.)
 * @returns Filtered and sorted entries
 */
export async function queryEntries(
  options: JournalQueryOptions = {}
): Promise<JournalEntry[]> {
  const db = await initDB()

  // Get all entries first (IndexedDB doesn't support complex queries)
  const allEntries = await new Promise<JournalEntry[]>((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readonly')
    const store = transaction.objectStore('journal_entries')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result as JournalEntry[])
    request.onerror = () => reject(request.error)
  })

  // Apply filters in-memory
  let filtered = allEntries

  // Filter by status
  if (options.status && options.status !== 'all') {
    filtered = filtered.filter((e) => e.status === options.status)
  }

  // Filter by setup
  if (options.setup && options.setup !== 'all') {
    filtered = filtered.filter((e) => e.setup === options.setup)
  }

  // Filter by emotion
  if (options.emotion && options.emotion !== 'all') {
    filtered = filtered.filter((e) => e.emotion === options.emotion)
  }

  // Filter by outcome
  if (options.outcome && options.outcome !== 'all') {
    filtered = filtered.filter((e) => {
      if (!e.outcome) return options.outcome === 'pending'
      const isPnlPositive = e.outcome.pnl > 0
      return (
        (options.outcome === 'win' && isPnlPositive) ||
        (options.outcome === 'loss' && !isPnlPositive)
      )
    })
  }

  // Filter by date range
  if (options.dateRange) {
    filtered = filtered.filter(
      (e) =>
        e.timestamp >= options.dateRange!.from &&
        e.timestamp <= options.dateRange!.to
    )
  }

  // Search in ticker, thesis, notes
  if (options.search) {
    const searchLower = options.search.toLowerCase()
    filtered = filtered.filter((e) => {
      const searchable = [
        e.ticker,
        e.thesis || '',
        e.customTags?.join(' ') || '',
      ]
        .join(' ')
        .toLowerCase()
      return searchable.includes(searchLower)
    })
  }

  // Sort
  const sortBy = options.sortBy || 'timestamp'
  const sortOrder = options.sortOrder || 'desc'

  filtered.sort((a, b) => {
    let aVal: number
    let bVal: number

    switch (sortBy) {
      case 'pnl':
        aVal = a.outcome?.pnl || 0
        bVal = b.outcome?.pnl || 0
        break
      case 'winRate':
        aVal = a.outcome?.winRate || 0
        bVal = b.outcome?.winRate || 0
        break
      case 'timestamp':
      default:
        aVal = a.timestamp
        bVal = b.timestamp
        break
    }

    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
  })

  // Pagination
  const offset = options.offset || 0
  const limit = options.limit || filtered.length

  return filtered.slice(offset, offset + limit)
}

/**
 * Get entries by status (convenience method)
 */
export async function getEntriesByStatus(
  status: JournalEntry['status']
): Promise<JournalEntry[]> {
  return queryEntries({ status })
}

/**
 * Get temp entries (for auto-entry workflow)
 */
export async function getTempEntries(): Promise<JournalEntry[]> {
  return getEntriesByStatus('temp')
}

/**
 * Get active entries (current trades)
 */
export async function getActiveEntries(): Promise<JournalEntry[]> {
  return getEntriesByStatus('active')
}

// ============================================================================
// PATTERN ANALYTICS
// ============================================================================

/**
 * Calculate pattern statistics for entries
 * @param entries - Entries to analyze (or all if undefined)
 * @returns Aggregate stats (win rate, avg hold time, etc.)
 */
export async function calculatePatternStats(
  entries?: JournalEntry[]
): Promise<PatternStats> {
  const allEntries = entries || (await queryEntries({ status: 'all' }))
  const closedEntries = allEntries.filter((e) => e.status === 'closed' && e.outcome)

  if (closedEntries.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      avgPnl: 0,
      avgTimeToExit: 0,
      bySetup: [],
      byEmotion: [],
    }
  }

  // Win rate
  const wins = closedEntries.filter((e) => e.outcome!.pnl > 0)
  const winRate = (wins.length / closedEntries.length) * 100

  // Average hold time
  const totalHoldTime = closedEntries.reduce((sum, e) => {
    if (!e.outcome?.closedAt) return sum
    return sum + (e.outcome.closedAt - e.createdAt)
  }, 0)
  const avgTimeToExit = totalHoldTime / closedEntries.length // milliseconds

  // PnL stats
  const totalPnl = closedEntries.reduce((sum, e) => sum + e.outcome!.pnl, 0)
  const avgPnl = totalPnl / closedEntries.length

  // Count by setup
  const setupCount: Record<string, number> = {}
  closedEntries.forEach((e) => {
    setupCount[e.setup] = (setupCount[e.setup] || 0) + 1
  })

  // Count by emotion
  const emotionCount: Record<string, number> = {}
  closedEntries.forEach((e) => {
    emotionCount[e.emotion] = (emotionCount[e.emotion] || 0) + 1
  })

  // Calculate bySetup stats
  const bySetup = Object.entries(setupCount).map(([setup, count]) => {
    const setupEntries = closedEntries.filter((e) => e.setup === setup)
    const setupWins = setupEntries.filter((e) => e.outcome!.pnl > 0).length
    const setupPnl = setupEntries.reduce((sum, e) => sum + e.outcome!.pnl, 0)
    return {
      setup: setup as SetupTag,
      totalTrades: count,
      winCount: setupWins,
      lossCount: count - setupWins,
      avgPnl: setupPnl / count,
      totalPnl: setupPnl,
    }
  })

  // Calculate byEmotion stats
  const byEmotion = Object.entries(emotionCount).map(([emotion, count]) => {
    const emotionEntries = closedEntries.filter((e) => e.emotion === emotion)
    const emotionWins = emotionEntries.filter((e) => e.outcome!.pnl > 0).length
    const emotionPnl = emotionEntries.reduce((sum, e) => sum + e.outcome!.pnl, 0)
    return {
      emotion: emotion as EmotionTag,
      totalTrades: count,
      winCount: emotionWins,
      lossCount: count - emotionWins,
      avgPnl: emotionPnl / count,
      totalPnl: emotionPnl,
    }
  })

  return {
    totalTrades: closedEntries.length,
    winRate,
    avgPnl,
    avgTimeToExit,
    bySetup,
    byEmotion,
  }
}

// ============================================================================
// CLEANUP & MAINTENANCE
// ============================================================================

/**
 * Delete temp entries older than TTL (7 days)
 * Called by cron job
 * @param ttlDays - Time-to-live in days (default: 7)
 * @returns Number of deleted entries
 */
export async function cleanupTempEntries(ttlDays: number = 7): Promise<number> {
  const tempEntries = await getTempEntries()
  const cutoffTime = Date.now() - ttlDays * 24 * 60 * 60 * 1000

  const toDelete = tempEntries.filter((e) => e.createdAt < cutoffTime)

  for (const entry of toDelete) {
    await deleteEntry(entry.id)
  }

  return toDelete.length
}

/**
 * Mark temp entry as active (user confirmed trade)
 * @param id - Entry ID
 * @returns Updated entry
 */
export async function markAsActive(
  id: string
): Promise<JournalEntry | undefined> {
  const updated = await updateEntry(id, {
    status: 'active',
    markedActiveAt: Date.now(),
  })

  if (updated) {
    emitJournalEvent({
      type: 'JournalTradeMarkedActive',
      domain: 'journal',
      timestamp: Date.now(),
      payload: {
        entryId: updated.id,
        markedAt: updated.markedActiveAt ?? Date.now(),
        journeyMeta: updated.journeyMeta,
      },
    })
  }

  return updated
}

/**
 * Close active entry (trade completed)
 * @param id - Entry ID
 * @param outcome - Trade outcome (PnL, transactions, etc.)
 * @returns Updated entry
 */
export async function closeEntry(
  id: string,
  outcome: TradeOutcome
): Promise<JournalEntry | undefined> {
  const updated = await updateEntry(id, {
    status: 'closed',
    outcome: {
      ...outcome,
      closedAt: outcome.closedAt || Date.now(),
    },
  })

  if (updated?.outcome) {
    emitJournalEvent({
      type: 'JournalTradeClosed',
      domain: 'journal',
      timestamp: Date.now(),
      payload: {
        entryId: updated.id,
        outcome: updated.outcome,
        journeyMeta: updated.journeyMeta,
      },
    })
  }

  return updated
}

// ============================================================================
// EXPORT
// ============================================================================

/**
 * Export journal entries to JSON/CSV/Markdown
 * @param format - Export format
 * @param entries - Entries to export (or all if undefined)
 * @returns Export string
 */
export async function exportEntries(
  format: JournalExportFormat,
  entries?: JournalEntry[]
): Promise<string> {
  const allEntries = entries || (await queryEntries({ status: 'all' }))
  const stats = await calculatePatternStats(allEntries)

  if (format === 'json') {
    const exportData: JournalExport = {
      version: '1.0.0',
      exportedAt: Date.now(),
      entries: allEntries,
      stats,
    }
    return JSON.stringify(exportData, null, 2)
  }

  if (format === 'csv') {
    const headers = [
      'ID',
      'Ticker',
      'Address',
      'Setup',
      'Emotion',
      'Status',
      'PnL',
      'PnL %',
      'Created At',
      'Closed At',
    ]
    const rows = allEntries.map((e) => [
      e.id,
      e.ticker,
      e.address,
      e.setup,
      e.emotion,
      e.status,
      e.outcome?.pnl || 0,
      e.outcome?.pnlPercent || 0,
      new Date(e.createdAt).toISOString(),
      e.outcome?.closedAt ? new Date(e.outcome.closedAt).toISOString() : '',
    ])

    return [headers, ...rows].map((row) => row.join(',')).join('\n')
  }

  if (format === 'md') {
    let md = '# Journal Export\n\n'
    md += `**Exported:** ${new Date().toISOString()}\n\n`
    md += `## Stats\n\n`
    md += `- Total Trades: ${stats.totalTrades}\n`
    md += `- Win Rate: ${stats.winRate.toFixed(1)}%\n`
    md += `- Avg Time to Exit: ${(stats.avgTimeToExit / 3600000).toFixed(1)} hours\n`
    md += `- Avg PnL: $${stats.avgPnl.toFixed(2)}\n\n`
    md += `## Entries\n\n`

    allEntries.forEach((e) => {
      md += `### ${e.ticker} (${e.setup} - ${e.emotion})\n\n`
      md += `- **Status:** ${e.status}\n`
      md += `- **Created:** ${new Date(e.createdAt).toLocaleString()}\n`
      if (e.thesis) md += `- **Thesis:** ${e.thesis}\n`
      if (e.outcome) {
        md += `- **PnL:** $${e.outcome.pnl.toFixed(2)} (${e.outcome.pnlPercent.toFixed(1)}%)\n`
      }
      md += `\n---\n\n`
    })

    return md
  }

  throw new Error(`Unsupported format: ${format}`)
}
