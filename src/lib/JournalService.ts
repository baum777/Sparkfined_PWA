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
import type {
  JournalEntry,
  JournalQueryOptions,
  PatternStats,
  JournalExport,
  JournalExportFormat,
  SetupTag,
  EmotionTag,
} from '@/types/journal'

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

    request.onsuccess = () => resolve(newEntry)
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

  const updated: JournalEntry = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readwrite')
    const store = transaction.objectStore('journal_entries')
    const request = store.put(updated)

    request.onsuccess = () => resolve(updated)
    request.onerror = () => reject(request.error)
  })
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
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readwrite')
    const store = transaction.objectStore('journal_entries')
    const request = store.delete(id)

    request.onsuccess = () => resolve()
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
      totalEntries: allEntries.length,
      winRate: 0,
      avgHoldTime: 0,
      avgMcap: 0,
      avgPnl: 0,
      totalPnl: 0,
      emotionBreakdown: {} as Record<EmotionTag, number>,
      setupBreakdown: {} as Record<SetupTag, number>,
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
  const avgHoldTime = totalHoldTime / closedEntries.length / 1000 // seconds

  // Average MCap (from first buy transaction)
  const totalMcap = closedEntries.reduce((sum, e) => {
    const firstBuy = e.outcome?.transactions.find((t) => t.type === 'buy')
    return sum + (firstBuy?.mcap || 0)
  }, 0)
  const avgMcap = totalMcap / closedEntries.length

  // PnL stats
  const totalPnl = closedEntries.reduce((sum, e) => sum + e.outcome!.pnl, 0)
  const avgPnl = totalPnl / closedEntries.length

  // Emotion breakdown
  const emotionBreakdown: Record<string, number> = {}
  allEntries.forEach((e) => {
    emotionBreakdown[e.emotion] = (emotionBreakdown[e.emotion] || 0) + 1
  })

  // Setup breakdown
  const setupBreakdown: Record<string, number> = {}
  allEntries.forEach((e) => {
    setupBreakdown[e.setup] = (setupBreakdown[e.setup] || 0) + 1
  })

  return {
    totalEntries: allEntries.length,
    winRate,
    avgHoldTime,
    avgMcap,
    avgPnl,
    totalPnl,
    emotionBreakdown: emotionBreakdown as Record<EmotionTag, number>,
    setupBreakdown: setupBreakdown as Record<SetupTag, number>,
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
  return updateEntry(id, {
    status: 'active',
    markedActiveAt: Date.now(),
  })
}

/**
 * Close active entry (trade completed)
 * @param id - Entry ID
 * @param outcome - Trade outcome (PnL, transactions, etc.)
 * @returns Updated entry
 */
export async function closeEntry(
  id: string,
  outcome: JournalEntry['outcome']
): Promise<JournalEntry | undefined> {
  return updateEntry(id, {
    status: 'closed',
    outcome: {
      ...outcome,
      closedAt: outcome?.closedAt || Date.now(),
    },
  })
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
    md += `- Total Entries: ${stats.totalEntries}\n`
    md += `- Win Rate: ${stats.winRate.toFixed(1)}%\n`
    md += `- Avg Hold Time: ${(stats.avgHoldTime / 3600).toFixed(1)} hours\n`
    md += `- Total PnL: $${stats.totalPnl.toFixed(2)}\n\n`
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
