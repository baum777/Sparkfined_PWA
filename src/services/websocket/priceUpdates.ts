/**
 * WebSocket Service for Real-Time Price Updates
 * Manages connections to price feeds (Binance, Dexscreener, etc.)
 */

import { trackEvent, TelemetryEvents } from '../telemetry'

export interface PriceUpdate {
  symbol: string
  price: number
  change24h: number
  volume24h?: number
  timestamp: number
}

type PriceCallback = (update: PriceUpdate) => void
type ConnectionCallback = (connected: boolean) => void

class WebSocketPriceService {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000 // Start with 1s, exponential backoff

  private subscribers = new Map<string, Set<PriceCallback>>()
  private connectionCallbacks = new Set<ConnectionCallback>()

  private isConnected = false
  private shouldReconnect = true

  /**
   * Subscribe to price updates for a symbol
   */
  subscribe(symbol: string, callback: PriceCallback): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set())
    }

    this.subscribers.get(symbol)!.add(callback)

    // Connect if not already connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect()
    } else {
      // Send subscribe message for this symbol
      this.sendSubscribe(symbol)
    }

    // Return unsubscribe function
    return () => this.unsubscribe(symbol, callback)
  }

  /**
   * Unsubscribe from price updates
   */
  private unsubscribe(symbol: string, callback: PriceCallback): void {
    const callbacks = this.subscribers.get(symbol)
    if (callbacks) {
      callbacks.delete(callback)
      
      // If no more subscribers for this symbol, unsubscribe from server
      if (callbacks.size === 0) {
        this.subscribers.delete(symbol)
        this.sendUnsubscribe(symbol)
      }
    }
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback)
    
    // Immediately call with current status
    callback(this.isConnected)

    return () => this.connectionCallbacks.delete(callback)
  }

  /**
   * Connect to WebSocket
   */
  private connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }

    try {
      // Use Binance WebSocket for now (can be made configurable)
      const wsUrl = 'wss://stream.binance.com:9443/ws'
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('[WS] Connected to price feed')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.notifyConnectionChange(true)

        // Re-subscribe to all symbols
        for (const symbol of this.subscribers.keys()) {
          this.sendSubscribe(symbol)
        }

        trackEvent(TelemetryEvents.CHART_LOAD, { source: 'websocket' })
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handlePriceUpdate(data)
        } catch (error) {
          console.error('[WS] Failed to parse message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('[WS] Error:', error)
        trackEvent(TelemetryEvents.API_ERROR, { source: 'websocket' })
      }

      this.ws.onclose = () => {
        console.log('[WS] Disconnected')
        this.isConnected = false
        this.notifyConnectionChange(false)
        this.ws = null

        // Attempt reconnect if needed
        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }
    } catch (error) {
      console.error('[WS] Failed to connect:', error)
      this.scheduleReconnect()
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30s
    )

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, delay)
  }

  /**
   * Send subscribe message to WebSocket
   */
  private sendSubscribe(symbol: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

    const stream = `${symbol.toLowerCase()}@ticker`
    this.ws.send(JSON.stringify({
      method: 'SUBSCRIBE',
      params: [stream],
      id: Date.now(),
    }))
  }

  /**
   * Send unsubscribe message to WebSocket
   */
  private sendUnsubscribe(symbol: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

    const stream = `${symbol.toLowerCase()}@ticker`
    this.ws.send(JSON.stringify({
      method: 'UNSUBSCRIBE',
      params: [stream],
      id: Date.now(),
    }))
  }

  /**
   * Handle incoming price update
   */
  private handlePriceUpdate(data: any): void {
    // Binance ticker format
    if (data.e === '24hrTicker') {
      const update: PriceUpdate = {
        symbol: data.s,
        price: parseFloat(data.c), // Current price
        change24h: parseFloat(data.P), // 24h change percentage
        volume24h: parseFloat(data.v), // 24h volume
        timestamp: data.E, // Event time
      }

      // Notify subscribers
      const callbacks = this.subscribers.get(update.symbol)
      if (callbacks) {
        callbacks.forEach((callback) => callback(update))
      }
    }
  }

  /**
   * Notify connection change
   */
  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach((callback) => callback(connected))
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.shouldReconnect = false

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.subscribers.clear()
    this.connectionCallbacks.clear()
    this.isConnected = false
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; subscribers: number } {
    return {
      connected: this.isConnected,
      subscribers: this.subscribers.size,
    }
  }
}

// Singleton instance
export const priceWebSocket = new WebSocketPriceService()
