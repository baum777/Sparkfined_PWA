/**
 * WebSocket Service for Real-Time Price Updates
 * Sparkfined PWA Trading Platform
 */

type PriceCallback = (symbol: string, data: PriceUpdate) => void

export interface PriceUpdate {
  price: number
  change24h: number
  volume24h?: number
  timestamp: number
}

class PriceSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private subscribers = new Map<string, Set<PriceCallback>>()
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(private baseUrl: string = 'wss://stream.binance.com:9443/ws') {}

  connect(symbols: string[]) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.subscribe(symbols)
      return
    }

    const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/')
    const url = `${this.baseUrl}/${streams}`

    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      console.log('[PriceSocket] Connected')
      this.reconnectAttempts = 0
      this.startHeartbeat()
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('[PriceSocket] Parse error:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('[PriceSocket] Error:', error)
    }

    this.ws.onclose = () => {
      console.log('[PriceSocket] Disconnected')
      this.stopHeartbeat()
      this.attemptReconnect()
    }
  }

  private handleMessage(data: any) {
    const symbol = data.s?.toUpperCase()
    if (!symbol) return

    const priceUpdate: PriceUpdate = {
      price: parseFloat(data.c),
      change24h: parseFloat(data.P),
      volume24h: parseFloat(data.v),
      timestamp: data.E
    }

    const callbacks = this.subscribers.get(symbol)
    if (callbacks) {
      callbacks.forEach(callback => callback(symbol, priceUpdate))
    }
  }

  subscribe(symbols: string[], callback: PriceCallback) {
    symbols.forEach(symbol => {
      const upperSymbol = symbol.toUpperCase()
      if (!this.subscribers.has(upperSymbol)) {
        this.subscribers.set(upperSymbol, new Set())
      }
      this.subscribers.get(upperSymbol)!.add(callback)
    })

    if (this.ws?.readyState === WebSocket.OPEN) {
      // Already connected, no need to reconnect
    } else {
      this.connect(symbols)
    }
  }

  unsubscribe(symbols: string[], callback?: PriceCallback) {
    symbols.forEach(symbol => {
      const upperSymbol = symbol.toUpperCase()
      if (callback) {
        this.subscribers.get(upperSymbol)?.delete(callback)
      } else {
        this.subscribers.delete(upperSymbol)
      }
    })

    if (this.subscribers.size === 0) {
      this.disconnect()
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[PriceSocket] Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`[PriceSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      const symbols = Array.from(this.subscribers.keys())
      if (symbols.length > 0) {
        this.connect(symbols)
      }
    }, delay)
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ method: 'ping' }))
      }
    }, 30000) // Ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.subscribers.clear()
  }

  getConnectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }
}

export const priceSocket = new PriceSocketService()
