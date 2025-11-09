// IndexedDB utilities for Sparkfined TA-PWA
// Handles trades, events, metrics, feedback, journal, and replay storage with offline-first approach

const DB_NAME = 'sparkfined-ta-pwa'
const DB_VERSION = 3 // Bumped for journal_entries + replay_sessions stores

export interface TradeEntry {
  id?: number
  token: string
  price: number
  timestamp: number // Unix timestamp UTC
  localTime: string // ISO string with local timezone
  status: 'Taken' | 'Planned'
  notes: string
  screenshot?: string // Base64 or blob URL
  createdAt: number
}

export interface SessionEvent {
  id?: number
  sessionId: string
  type: string // e.g., "screenshot_dropped", "save_trade_clicked"
  timestamp: number
  data?: Record<string, unknown>
}

export interface MetricEntry {
  id?: number
  eventType: string // e.g., "drop_to_result", "save_trade", "open_replay", "export_share"
  count: number
  lastUpdated: number
}

export interface FeedbackEntry {
  id?: number
  type: 'Bug' | 'Idea' | 'Other'
  text: string
  timestamp: number
  status: 'queued' | 'exported'
  sessionId: string
}

// Import unified journal types
import type { JournalEntry, ReplaySession } from '@/types/journal'

// Re-export for convenience
export type { JournalEntry, ReplaySession }

let dbInstance: IDBDatabase | null = null

// Initialize IndexedDB
export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create trades store
      if (!db.objectStoreNames.contains('trades')) {
        const tradeStore = db.createObjectStore('trades', {
          keyPath: 'id',
          autoIncrement: true,
        })
        tradeStore.createIndex('timestamp', 'timestamp', { unique: false })
        tradeStore.createIndex('token', 'token', { unique: false })
        tradeStore.createIndex('status', 'status', { unique: false })
      }

      // Create events store
      if (!db.objectStoreNames.contains('events')) {
        const eventStore = db.createObjectStore('events', {
          keyPath: 'id',
          autoIncrement: true,
        })
        eventStore.createIndex('sessionId', 'sessionId', { unique: false })
        eventStore.createIndex('timestamp', 'timestamp', { unique: false })
        eventStore.createIndex('type', 'type', { unique: false })
      }

      // Create metrics store (Phase 4)
      if (!db.objectStoreNames.contains('metrics')) {
        const metricsStore = db.createObjectStore('metrics', {
          keyPath: 'eventType',
        })
        metricsStore.createIndex('lastUpdated', 'lastUpdated', { unique: false })
      }

      // Create feedback store (Phase 4)
      if (!db.objectStoreNames.contains('feedback')) {
        const feedbackStore = db.createObjectStore('feedback', {
          keyPath: 'id',
          autoIncrement: true,
        })
        feedbackStore.createIndex('timestamp', 'timestamp', { unique: false })
        feedbackStore.createIndex('status', 'status', { unique: false })
        feedbackStore.createIndex('type', 'type', { unique: false })
      }

      // Create journal_entries store (BLOCK 1: Unified Schema)
      if (!db.objectStoreNames.contains('journal_entries')) {
        const journalStore = db.createObjectStore('journal_entries', {
          keyPath: 'id',
        })
        journalStore.createIndex('timestamp', 'timestamp', { unique: false })
        journalStore.createIndex('ticker', 'ticker', { unique: false })
        journalStore.createIndex('address', 'address', { unique: false })
        journalStore.createIndex('status', 'status', { unique: false })
        journalStore.createIndex('setup', 'setup', { unique: false })
        journalStore.createIndex('emotion', 'emotion', { unique: false })
        journalStore.createIndex('createdAt', 'createdAt', { unique: false })
        journalStore.createIndex('walletAddress', 'walletAddress', { unique: false })
      }

      // Create replay_sessions store (BLOCK 1: Unified Schema)
      if (!db.objectStoreNames.contains('replay_sessions')) {
        const replayStore = db.createObjectStore('replay_sessions', {
          keyPath: 'id',
        })
        replayStore.createIndex('journalEntryId', 'journalEntryId', { unique: false })
        replayStore.createIndex('ticker', 'ticker', { unique: false })
        replayStore.createIndex('address', 'address', { unique: false })
        replayStore.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

// Trade operations
export async function saveTrade(trade: Omit<TradeEntry, 'id'>): Promise<number> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['trades'], 'readwrite')
    const store = transaction.objectStore('trades')
    const request = store.add(trade)

    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllTrades(): Promise<TradeEntry[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['trades'], 'readonly')
    const store = transaction.objectStore('trades')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result as TradeEntry[])
    request.onerror = () => reject(request.error)
  })
}

export async function getTradeById(id: number): Promise<TradeEntry | undefined> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['trades'], 'readonly')
    const store = transaction.objectStore('trades')
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result as TradeEntry | undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteTrade(id: number): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['trades'], 'readwrite')
    const store = transaction.objectStore('trades')
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Event operations
export async function logEvent(event: Omit<SessionEvent, 'id'>): Promise<number> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['events'], 'readwrite')
    const store = transaction.objectStore('events')
    const request = store.add(event)

    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

export async function getEventsBySession(sessionId: string): Promise<SessionEvent[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['events'], 'readonly')
    const store = transaction.objectStore('events')
    const index = store.index('sessionId')
    const request = index.getAll(sessionId)

    request.onsuccess = () => resolve(request.result as SessionEvent[])
    request.onerror = () => reject(request.error)
  })
}

export async function getAllEvents(): Promise<SessionEvent[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['events'], 'readonly')
    const store = transaction.objectStore('events')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result as SessionEvent[])
    request.onerror = () => reject(request.error)
  })
}

// Export trades to CSV
export function exportTradesToCSV(trades: TradeEntry[]): string {
  const headers = ['ID', 'Token', 'Price', 'Timestamp (UTC)', 'Local Time', 'Status', 'Notes']
  const rows = trades.map((trade) => [
    trade.id || '',
    trade.token,
    trade.price,
    new Date(trade.timestamp).toISOString(),
    trade.localTime,
    trade.status,
    `"${trade.notes.replace(/"/g, '""')}"`, // Escape quotes
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  return csvContent
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Session management
let currentSessionId: string | null = null

export function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  return currentSessionId
}

export function startNewSession(): string {
  currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  return currentSessionId
}

// Metrics operations (Phase 4 - Telemetry Light)
export async function incrementMetric(eventType: string): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['metrics'], 'readwrite')
    const store = transaction.objectStore('metrics')
    const getRequest = store.get(eventType)

    getRequest.onsuccess = () => {
      const existing = getRequest.result as MetricEntry | undefined
      const updated: MetricEntry = {
        eventType,
        count: (existing?.count || 0) + 1,
        lastUpdated: Date.now(),
      }
      const putRequest = store.put(updated)
      putRequest.onsuccess = () => resolve()
      putRequest.onerror = () => reject(putRequest.error)
    }

    getRequest.onerror = () => reject(getRequest.error)
  })
}

export async function getAllMetrics(): Promise<MetricEntry[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['metrics'], 'readonly')
    const store = transaction.objectStore('metrics')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result as MetricEntry[])
    request.onerror = () => reject(request.error)
  })
}

export async function resetMetrics(): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['metrics'], 'readwrite')
    const store = transaction.objectStore('metrics')
    const request = store.clear()

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Feedback operations (Phase 4)
export async function saveFeedback(
  feedback: Omit<FeedbackEntry, 'id'>
): Promise<number> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['feedback'], 'readwrite')
    const store = transaction.objectStore('feedback')
    const request = store.add(feedback)

    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllFeedback(): Promise<FeedbackEntry[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['feedback'], 'readonly')
    const store = transaction.objectStore('feedback')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result as FeedbackEntry[])
    request.onerror = () => reject(request.error)
  })
}

export async function markFeedbackExported(ids: number[]): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['feedback'], 'readwrite')
    const store = transaction.objectStore('feedback')

    let completed = 0
    ids.forEach((id) => {
      const getRequest = store.get(id)
      getRequest.onsuccess = () => {
        const feedback = getRequest.result as FeedbackEntry
        if (feedback) {
          feedback.status = 'exported'
          const putRequest = store.put(feedback)
          putRequest.onsuccess = () => {
            completed++
            if (completed === ids.length) resolve()
          }
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          completed++
          if (completed === ids.length) resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  })
}

// Export utilities for metrics + feedback (Phase 4)
export function exportMetricsAndFeedbackJSON(
  metrics: MetricEntry[],
  feedback: FeedbackEntry[]
): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      metrics: metrics.map((m) => ({
        eventType: m.eventType,
        count: m.count,
        lastUpdated: new Date(m.lastUpdated).toISOString(),
      })),
      feedback: feedback.map((f) => ({
        type: f.type,
        text: f.text,
        timestamp: new Date(f.timestamp).toISOString(),
        status: f.status,
      })),
      privacyNote: 'No PII collected - anonymous usage data only',
    },
    null,
    2
  )
}

export function exportMetricsAndFeedbackCSV(
  metrics: MetricEntry[],
  feedback: FeedbackEntry[]
): string {
  const lines: string[] = []

  // Header + Privacy notice
  lines.push('# Sparkfined TA-PWA - Metrics & Feedback Export')
  lines.push(`# Exported at: ${new Date().toISOString()}`)
  lines.push('# Privacy: No PII collected - anonymous usage data only')
  lines.push('')

  // Metrics section
  lines.push('=== METRICS ===')
  lines.push('Event Type,Count,Last Updated')
  metrics.forEach((m) => {
    lines.push(`${m.eventType},${m.count},${new Date(m.lastUpdated).toISOString()}`)
  })
  lines.push('')

  // Feedback section
  lines.push('=== FEEDBACK ===')
  lines.push('Type,Text,Timestamp,Status')
  feedback.forEach((f) => {
    const escapedText = `"${f.text.replace(/"/g, '""')}"`
    lines.push(`${f.type},${escapedText},${new Date(f.timestamp).toISOString()},${f.status}`)
  })

  return lines.join('\n')
}

export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
