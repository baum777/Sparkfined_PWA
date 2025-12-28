import type { TradeContext } from '../types'
import {
  tradeLogsDB,
  type TradeLogRecord,
  type TradeLogsDB,
} from '@/lib/solana/store/tradeLogs'
import {
  markEventConsumed,
  tradeEventsDB,
  type TradeEventsDB,
} from '@/lib/solana/store/tradeEvents'

const FALLBACK_WINDOW_MS = 10 * 60 * 1000

async function findByTxHash(txHash: string, db: TradeLogsDB): Promise<TradeLogRecord | undefined> {
  if (!txHash) return undefined
  return db.trade_logs.where('txHash').equals(txHash).first()
}

async function findShadowWithinWindow(context: TradeContext, db: TradeLogsDB): Promise<TradeLogRecord | undefined> {
  const candidates = await db.trade_logs
    .where('status')
    .equals('shadow')
    .filter((log) => {
      const withinWindow = Math.abs(log.generatedAt - context.timestamp) <= FALLBACK_WINDOW_MS
      return withinWindow && log.action === context.side
    })
    .toArray()

  if (!candidates.length) return undefined

  return candidates.sort(
    (a, b) => Math.abs(a.generatedAt - context.timestamp) - Math.abs(b.generatedAt - context.timestamp),
  )[0]
}

interface ConfirmTradeOptions {
  context: TradeContext
  journalEntryId?: number
  tradeLogsDb?: TradeLogsDB
  tradeEventsDb?: TradeEventsDB
}

export async function confirmTradeFromContext({
  context,
  journalEntryId,
  tradeLogsDb = tradeLogsDB,
  tradeEventsDb = tradeEventsDB,
}: ConfirmTradeOptions): Promise<TradeLogRecord> {
  const confirmationTime = Date.now()

  let existing = await findByTxHash(context.txHash, tradeLogsDb)
  if (!existing) {
    existing = await findShadowWithinWindow(context, tradeLogsDb)
  }

  if (existing?.id != null) {
    await tradeLogsDb.trade_logs.update(existing.id, {
      status: 'confirmed',
      txHash: context.txHash,
      walletId: context.walletId,
      fillPrice: context.price ?? existing.fillPrice ?? null,
      confirmedAt: confirmationTime,
      journalEntryId: journalEntryId ?? existing.journalEntryId,
      quoteCurrency: existing.quoteCurrency ?? context.quoteCurrency,
      action: existing.action ?? context.side,
    })

    if (context.eventId != null) {
      await markEventConsumed(context.eventId, tradeEventsDb)
    }

    const updated = await tradeLogsDb.trade_logs.get(existing.id)
    return updated ?? { ...existing, id: existing.id }
  }

  const record: Omit<TradeLogRecord, 'id'> = {
    journalEntryId,
    action: context.side,
    origin: 'onchain',
    status: 'confirmed',
    generatedAt: context.timestamp,
    quoteCurrency: context.quoteCurrency,
    signalPrice: null,
    fillPrice: context.price ?? null,
    txHash: context.txHash,
    walletId: context.walletId,
    confirmedAt: confirmationTime,
  }

  const id = await tradeLogsDb.trade_logs.add(record)

  if (context.eventId != null) {
    await markEventConsumed(context.eventId, tradeEventsDb)
  }

  return { ...record, id }
}

export { FALLBACK_WINDOW_MS }
