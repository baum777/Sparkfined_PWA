import type { QuoteCurrency } from '@/types/currency'
import type { TradeAction } from '@/types/trade'
import {
  createTradeLog,
  getTradeLogByJournalEntryId,
  tradeLogsDB,
  type TradeLogsDB,
} from '@/lib/solana/store/tradeLogs'

export interface ShadowTradeLogInput {
  journalEntryId: number
  action: TradeAction
  quoteCurrency: QuoteCurrency
  generatedAt: number
  signalPrice?: number | null
}

export async function createShadowTradeLogFromPipeline(
  input: ShadowTradeLogInput,
  db: TradeLogsDB = tradeLogsDB,
) {
  const existing = await getTradeLogByJournalEntryId(input.journalEntryId, db)
  if (existing) {
    return existing
  }

  const record = {
    journalEntryId: input.journalEntryId,
    action: input.action,
    origin: 'pipeline' as const,
    status: 'shadow' as const,
    generatedAt: input.generatedAt,
    quoteCurrency: input.quoteCurrency,
    signalPrice: input.signalPrice ?? null,
    fillPrice: null,
    txHash: null,
    walletId: null,
    confirmedAt: null,
  }

  return createTradeLog(record, db)
}
