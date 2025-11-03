/**
 * Sparkfined PWA - Enhanced Database with Dexie 4.x
 * Replaces native IndexedDB with modern Dexie for better offline support
 * 
 * Stores:
 * - trades: Trading journal entries
 * - events: Session events and analytics
 * - metrics: Performance metrics
 * - feedback: User feedback
 * - watchlist: Saved watchlist items (NEW)
 * - chartDrawings: Saved chart drawings/annotations (NEW)
 * - chartSettings: User chart preferences (NEW)
 */

import Dexie, { type EntityTable } from 'dexie'

// Type definitions
export interface TradeEntry {
  id?: number
  token: string
  price: number
  timestamp: number
  localTime: string
  status: 'Taken' | 'Planned'
  notes: string
  screenshot?: string
  createdAt: number
}

export interface SessionEvent {
  id?: number
  sessionId: string
  type: string
  timestamp: number
  data?: Record<string, unknown>
}

export interface MetricEntry {
  eventType: string // Primary key
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

export interface WatchlistItem {
  id?: number
  symbol: string
  name?: string
  address?: string
  chain?: string
  addedAt: number
  lastPrice?: number
  lastChange24h?: number
  sortOrder?: number
  tags?: string[]
}

export interface ChartDrawing {
  id?: number
  symbol: string
  type: 'trendline' | 'rectangle' | 'fibonacci' | 'horizontal' | 'text'
  data: Record<string, unknown> // Flexible for different drawing types
  createdAt: number
  updatedAt: number
}

export interface ChartSettings {
  symbol: string // Primary key
  interval: string
  indicators: string[]
  theme?: 'dark' | 'light'
  layout?: Record<string, unknown>
  updatedAt: number
}

// Dexie Database
class SparkfinedDatabase extends Dexie {
  trades!: EntityTable<TradeEntry, 'id'>
  events!: EntityTable<SessionEvent, 'id'>
  metrics!: EntityTable<MetricEntry, 'eventType'>
  feedback!: EntityTable<FeedbackEntry, 'id'>
  watchlist!: EntityTable<WatchlistItem, 'id'>
  chartDrawings!: EntityTable<ChartDrawing, 'id'>
  chartSettings!: EntityTable<ChartSettings, 'symbol'>

  constructor() {
    super('sparkfined-pwa')
    
    // Version 1: Original stores
    this.version(1).stores({
      trades: '++id, timestamp, token, status',
      events: '++id, sessionId, timestamp, type',
      metrics: 'eventType, lastUpdated',
      feedback: '++id, timestamp, status, type',
    })

    // Version 2: Add watchlist, chart drawings, and settings
    this.version(2).stores({
      trades: '++id, timestamp, token, status',
      events: '++id, sessionId, timestamp, type',
      metrics: 'eventType, lastUpdated',
      feedback: '++id, timestamp, status, type',
      watchlist: '++id, symbol, addedAt, sortOrder',
      chartDrawings: '++id, symbol, type, createdAt',
      chartSettings: 'symbol, updatedAt',
    })
  }
}

// Singleton instance
export const db = new SparkfinedDatabase()

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

// Export utilities
export function exportTradesToCSV(trades: TradeEntry[]): string {
  const headers = ['ID', 'Token', 'Price', 'Timestamp (UTC)', 'Local Time', 'Status', 'Notes']
  const rows = trades.map((trade) => [
    trade.id || '',
    trade.token,
    trade.price,
    new Date(trade.timestamp).toISOString(),
    trade.localTime,
    trade.status,
    `"${trade.notes.replace(/"/g, '""')}"`,
  ])

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
}

export function downloadFile(content: string, filename: string, type = 'text/csv'): void {
  const blob = new Blob([content], { type: `${type};charset=utf-8;` })
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

// Helper: Log event
export async function logEvent(
  type: string,
  data?: Record<string, unknown>
): Promise<number> {
  return db.events.add({
    sessionId: getSessionId(),
    type,
    timestamp: Date.now(),
    data,
  })
}

// Helper: Increment metric
export async function incrementMetric(eventType: string): Promise<void> {
  const existing = await db.metrics.get(eventType)
  
  await db.metrics.put({
    eventType,
    count: (existing?.count || 0) + 1,
    lastUpdated: Date.now(),
  })
}

// Initialize DB
export async function initDB(): Promise<void> {
  try {
    await db.open()
    console.log('[DB] Sparkfined Database initialized')
  } catch (error) {
    console.error('[DB] Failed to initialize:', error)
    throw error
  }
}

// Auto-init on import
initDB().catch(console.error)
