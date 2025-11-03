/**
 * IndexedDB Database Configuration
 * Using Dexie.js for offline-first storage
 * Sparkfined PWA Trading Platform
 */

import Dexie, { Table } from 'dexie'

export interface WatchlistItem {
  id?: number
  symbol: string
  name: string
  lastPrice: number
  lastChange24h: number
  addedAt: number
  order: number
}

export interface ChartDrawing {
  id?: number
  symbol: string
  interval: string
  drawing: string // JSON serialized DrawingTool
  createdAt: number
  updatedAt: number
}

export interface PriceCache {
  id?: number
  symbol: string
  price: number
  change24h: number
  volume24h: number
  timestamp: number
}

export interface JournalEntry {
  id?: number
  symbol: string
  entry: string
  direction: 'long' | 'short' | 'neutral'
  entryPrice?: number
  exitPrice?: number
  pnl?: number
  createdAt: number
  updatedAt: number
  images?: string[]
}

export interface QueuedEvent {
  id?: number
  event: string
  properties: string // JSON serialized
  timestamp: number
  synced: boolean
}

export class SparkfinedDB extends Dexie {
  watchlist!: Table<WatchlistItem, number>
  chartDrawings!: Table<ChartDrawing, number>
  priceCache!: Table<PriceCache, number>
  journal!: Table<JournalEntry, number>
  eventQueue!: Table<QueuedEvent, number>

  constructor() {
    super('SparkfinedDB')
    
    this.version(1).stores({
      watchlist: '++id, symbol, order',
      chartDrawings: '++id, symbol, interval, createdAt',
      priceCache: '++id, symbol, timestamp',
      journal: '++id, symbol, createdAt',
      eventQueue: '++id, timestamp, synced'
    })
  }
}

export const db = new SparkfinedDB()

// Export helper functions
export const clearOldPriceCache = async () => {
  const oneHourAgo = Date.now() - 3600000
  await db.priceCache.where('timestamp').below(oneHourAgo).delete()
}

export const getSyncedEvents = async () => {
  return db.eventQueue.where('synced').equals(0).toArray()
}

export const markEventsSynced = async (ids: number[]) => {
  await db.eventQueue.bulkUpdate(
    ids.map(id => ({ key: id, changes: { synced: true } }))
  )
}
