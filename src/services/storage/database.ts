// Dexie database for offline-first watchlist and trading data
import Dexie, { Table } from 'dexie'

export interface WatchlistItem {
  id?: number
  symbol: string
  name?: string
  lastPrice?: number
  lastChange24h?: number
  addedAt: number
  notes?: string
}

export interface ChartDrawing {
  id?: string
  symbol: string
  timeframe: string
  type: 'trendline' | 'fibonacci' | 'rectangle' | 'circle' | 'arrow'
  data: any // Drawing-specific data
  createdAt: number
}

class SparkfinedDatabase extends Dexie {
  watchlist!: Table<WatchlistItem>
  chartDrawings!: Table<ChartDrawing>

  constructor() {
    super('SparkfinedDB')
    this.version(1).stores({
      watchlist: '++id, symbol, addedAt',
      chartDrawings: '++id, symbol, timeframe, createdAt',
    })
  }
}

export const db = new SparkfinedDatabase()
