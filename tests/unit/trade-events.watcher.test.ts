import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import { TradeEventWatcher } from '@/lib/solana/tradeEventWatcher'
import type { NormalizedTradeEvent } from '@/lib/solana/providers/moralisTradeEvents'
import { TradeEventsDB, countUnconsumedBuyEvents } from '@/lib/solana/store/tradeEvents'
import type { ConnectedWalletRecord } from '@/lib/solana/store/connectedWallets'
import { MoralisClientError } from '@/lib/solana/providers/moralisClient'
import { saveTradeEvents } from '@/lib/solana/store/tradeEvents'

const createDb = () => new TradeEventsDB(`trade-events-${Date.now()}-${Math.random()}`)

const baseEvent: NormalizedTradeEvent = {
  walletAddress: 'wallet-1',
  txHash: 'tx-1',
  timestamp: 1_700_000_000_000,
  side: 'BUY',
  source: 'moralis',
  amount: 1,
  price: 0.5,
  baseSymbol: 'SOL',
  quoteSymbol: 'USDC',
  baseMint: null,
  quoteMint: null,
}

const wallets: ConnectedWalletRecord[] = [
  { id: 1, address: 'wallet-1', nickname: 'Main', chain: 'solana', createdAt: 1 },
  { id: 2, address: 'wallet-2', nickname: 'Alt', chain: 'solana', createdAt: 2 },
]

function createTracingSchedule(
  scheduledDelays: number[],
  pendingRuns: Array<() => Promise<void>>,
): { schedule: typeof setTimeout; cancelSchedule: typeof clearTimeout } {
  const schedule = ((cb: () => Promise<void>, delay?: number) => {
    scheduledDelays.push(delay ?? 0)
    pendingRuns.push(() => cb())

    return {} as NodeJS.Timeout
  }) as unknown as typeof setTimeout

  ;(schedule as any).__promisify__ = (setTimeout as any).__promisify__

  const cancelSchedule = (() => {}) as typeof clearTimeout

  return { schedule, cancelSchedule }
}

describe('TradeEventWatcher', () => {
  let db: TradeEventsDB

  beforeEach(() => {
    db = createDb()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('persists new BUY swap events for connected wallets and ignores duplicates', async () => {
    const pendingRuns: Array<() => Promise<void>> = []
    const fetchSwaps = vi
      .fn()
      .mockResolvedValue([baseEvent])
      .mockResolvedValueOnce([baseEvent, { ...baseEvent, txHash: 'tx-2', side: 'SELL' }])

    const { schedule, cancelSchedule } = createTracingSchedule([], pendingRuns)
    const watcher = new TradeEventWatcher(
      { intervalMs: 10 },
      {
        getWallets: async () => wallets,
        fetchWalletSwaps: fetchSwaps,
        saveEvents: (events) => saveTradeEvents(events, db),
        hasApiKey: () => true,
        schedule,
        cancelSchedule,
      },
    )

    await watcher.start()

    let guard = 0
    while (fetchSwaps.mock.calls.length < 4 && pendingRuns.length && guard < 5) {
      const nextRun = pendingRuns.shift()
      if (nextRun) {
        await nextRun()
      }
      guard += 1
    }

    watcher.stop()
    pendingRuns.length = 0

    expect(fetchSwaps).toHaveBeenCalledTimes(4)
    expect(await countUnconsumedBuyEvents(db)).toBe(1)
  })

  it('applies exponential backoff on rate limits and resets after success', async () => {
    const scheduledDelays: number[] = []
    const pendingRuns: Array<() => Promise<void>> = []
    const fetchSwaps = vi
      .fn()
      .mockRejectedValueOnce(new MoralisClientError('rate limited', 429))
      .mockResolvedValueOnce([baseEvent])

    const { schedule, cancelSchedule } = createTracingSchedule(scheduledDelays, pendingRuns)
    const watcher = new TradeEventWatcher(
      { intervalMs: 10, maxBackoffMs: 40 },
      {
        getWallets: async () => [wallets[0]!],
        fetchWalletSwaps: fetchSwaps,
        saveEvents: (events) => saveTradeEvents(events, db),
        hasApiKey: () => true,
        schedule,
        cancelSchedule,
      },
    )

    await watcher.start()

    for (let i = 0; i < 2; i++) {
      const nextRun = pendingRuns.shift()
      if (nextRun) {
        await nextRun()
      }
    }

    watcher.stop()
    pendingRuns.length = 0

    expect(scheduledDelays.slice(0, 3)).toEqual([0, 20, 10])
    expect(await countUnconsumedBuyEvents(db)).toBe(1)
  })
})
