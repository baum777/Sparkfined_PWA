/**
 * WebSocket Hook for Real-Time Price Updates
 * Sparkfined PWA Trading Platform
 */

import { useEffect, useState } from 'react'
import { priceSocket, PriceUpdate } from '@/services/websocket/priceSocket'

interface UsePriceSocketReturn {
  prices: Record<string, PriceUpdate>
  isConnected: boolean
  error: string | null
}

export function useWebSocket(symbols: string[]): UsePriceSocketReturn {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (symbols.length === 0) return

    const handlePriceUpdate = (symbol: string, data: PriceUpdate) => {
      setPrices(prev => ({
        ...prev,
        [symbol]: data
      }))
    }

    // Subscribe to price updates
    priceSocket.subscribe(symbols, handlePriceUpdate)

    // Check connection state
    const checkConnection = setInterval(() => {
      const state = priceSocket.getConnectionState()
      setIsConnected(state === WebSocket.OPEN)
      
      if (state === WebSocket.CLOSED || state === WebSocket.CLOSING) {
        setError('WebSocket disconnected')
      } else {
        setError(null)
      }
    }, 1000)

    return () => {
      clearInterval(checkConnection)
      priceSocket.unsubscribe(symbols, handlePriceUpdate)
    }
  }, [symbols.join(',')])

  return { prices, isConnected, error }
}
