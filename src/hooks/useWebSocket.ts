// WebSocket hook for real-time price updates
import { useEffect, useState, useRef } from 'react'

interface PriceData {
  symbol: string
  price: number
  change24h: number
}

export function useWebSocket(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!symbols.length || typeof window === 'undefined') return

    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return

      try {
        // Binance WebSocket endpoint (example)
        // In production, use your own WebSocket proxy
        const wsUrl = `wss://stream.binance.com:9443/ws/${symbols.map(s => s.toLowerCase() + '@ticker').join('/')}`
        
        const ws = new WebSocket(wsUrl)
        
        ws.onopen = () => {
          console.log('[WebSocket] Connected')
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.e === '24hrTicker') {
              const symbol = data.s.replace('USDT', '') // Remove USDT suffix
              setPrices(prev => ({
                ...prev,
                [symbol]: {
                  symbol,
                  price: parseFloat(data.c), // Last price
                  change24h: parseFloat(data.P), // 24h price change percent
                },
              }))
            }
          } catch (err) {
            console.error('[WebSocket] Parse error:', err)
          }
        }

        ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error)
        }

        ws.onclose = () => {
          console.log('[WebSocket] Closed, reconnecting...')
          // Reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 3000)
        }

        wsRef.current = ws
      } catch (error) {
        console.error('[WebSocket] Connection error:', error)
        reconnectTimeoutRef.current = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [symbols.join(',')]) // Reconnect if symbols change

  return { prices }
}
