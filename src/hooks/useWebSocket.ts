/**
 * React Hook for WebSocket Price Updates
 * Manages subscriptions and provides real-time price data
 */

import { useEffect, useState } from 'react'
import { priceWebSocket, type PriceUpdate } from '@/services/websocket/priceUpdates'

interface PriceData {
  [symbol: string]: PriceUpdate
}

interface UseWebSocketResult {
  prices: PriceData
  connected: boolean
  subscribe: (symbol: string) => void
  unsubscribe: (symbol: string) => void
}

/**
 * Hook to subscribe to real-time price updates
 */
export function useWebSocket(initialSymbols: string[] = []): UseWebSocketResult {
  const [prices, setPrices] = useState<PriceData>({})
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Subscribe to connection status
    const unsubConnection = priceWebSocket.onConnectionChange(setConnected)

    return () => {
      unsubConnection()
    }
  }, [])

  useEffect(() => {
    const unsubscribers: Array<() => void> = []

    // Subscribe to initial symbols
    for (const symbol of initialSymbols) {
      const unsubscribe = priceWebSocket.subscribe(symbol, (update) => {
        setPrices((prev) => ({
          ...prev,
          [update.symbol]: update,
        }))
      })
      unsubscribers.push(unsubscribe)
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [initialSymbols.join(',')])

  const subscribe = (symbol: string) => {
    priceWebSocket.subscribe(symbol, (update) => {
      setPrices((prev) => ({
        ...prev,
        [update.symbol]: update,
      }))
    })
  }

  const unsubscribe = (symbol: string) => {
    setPrices((prev) => {
      const next = { ...prev }
      delete next[symbol]
      return next
    })
  }

  return {
    prices,
    connected,
    subscribe,
    unsubscribe,
  }
}
