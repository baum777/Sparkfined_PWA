import Dexie, { type Table } from 'dexie'
import type { QuoteCurrency } from '@/types/currency'
import type { TradeAction } from '@/types/trade'

export type TradeLogStatus = 'shadow' | 'confirmed'
export type TradeLogOrigin = 'pipeline' | 'onchain' | 'manual'

export interface TradeLogRecord {
  id?: number
  journalEntryId?: number
  action: TradeAction
  origin: TradeLogOrigin
  status: TradeLogStatus
  generatedAt: number
  quoteCurrency: QuoteCurrency
  signalPrice: number | null
  fillPrice: number | null
  txHash: string | null
  walletId: number | null
  confirmedAt: number | null
}

export class TradeLogsDB extends Dexie {
  trade_logs!: Table<TradeLogRecord, number>

  constructor(name = 'sparkfined-trades') {
    super(name)

    this.version(1).stores({
      trade_logs: '++id, journalEntryId, origin, status, generatedAt',
    })
  }
}

export const tradeLogsDB = new TradeLogsDB()

export async function createTradeLog(entry: Omit<TradeLogRecord, 'id'>, db: TradeLogsDB = tradeLogsDB) {
  const id = await db.trade_logs.add(entry)
  return { ...entry, id }
}

export async function getTradeLogByJournalEntryId(
  journalEntryId: number,
  db: TradeLogsDB = tradeLogsDB,
): Promise<TradeLogRecord | undefined> {
  return db.trade_logs.where('journalEntryId').equals(journalEntryId).first()
}

export async function getTradeLogById(id: number, db: TradeLogsDB = tradeLogsDB) {
  return db.trade_logs.get(id)
}
