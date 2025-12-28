import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { connectedWalletsDB, getConnectedWallets } from '@/lib/solana/store/connectedWallets'
import {
  countUnconsumedBuyEvents,
  listUnconsumedBuyEvents,
  tradeEventsDB,
  type TradeEventRecord,
} from '@/lib/solana/store/tradeEvents'

interface TradeEventInboxItem extends TradeEventRecord {
  walletNickname: string
}

const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
})

function defaultWalletLabel(walletId: number | null): string {
  if (walletId == null) return 'Trading Wallet'
  return `Wallet ${walletId}`
}

function formatTimestamp(timestamp: number): string {
  return timestampFormatter.format(timestamp)
}

export function useTradeEventInbox(limit = 20) {
  const [events, setEvents] = useState<TradeEventInboxItem[]>([])
  const [unconsumedCount, setUnconsumedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const isMountedRef = useRef(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const [items, count, wallets] = await Promise.all([
        listUnconsumedBuyEvents(limit, tradeEventsDB),
        countUnconsumedBuyEvents(tradeEventsDB),
        getConnectedWallets(connectedWalletsDB),
      ])

      const walletNames = new Map<number, string>()
      wallets.forEach((wallet) => {
        if (wallet.id != null) {
          walletNames.set(wallet.id, wallet.nickname || defaultWalletLabel(wallet.id))
        }
      })

      if (!isMountedRef.current) return

      setEvents(
        items.map((event) => ({
          ...event,
          walletNickname: walletNames.get(event.walletId ?? -1) ?? defaultWalletLabel(event.walletId ?? null),
        })),
      )
      setUnconsumedCount(count)
    } catch (error) {
      console.warn('[trade-events] failed to load inbox', error)
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [limit])

  useEffect(() => {
    isMountedRef.current = true
    void load().catch(() => undefined)

    const handleChanges = () => {
      if (!isMountedRef.current) return
      void load()
    }

    tradeEventsDB.trade_events.hook('creating', handleChanges)
    tradeEventsDB.trade_events.hook('updating', handleChanges)
    tradeEventsDB.trade_events.hook('deleting', handleChanges)

    return () => {
      isMountedRef.current = false
      tradeEventsDB.trade_events.hook('creating').unsubscribe(handleChanges)
      tradeEventsDB.trade_events.hook('updating').unsubscribe(handleChanges)
      tradeEventsDB.trade_events.hook('deleting').unsubscribe(handleChanges)
    }
  }, [load])

  const formattedEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        formattedTimestamp: formatTimestamp(event.timestamp),
      })),
    [events],
  )

  return {
    events: formattedEvents,
    isLoading,
    unconsumedCount,
    refresh: load,
  }
}

export type { TradeEventInboxItem }
