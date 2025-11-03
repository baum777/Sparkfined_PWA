/**
 * Enhanced Telemetry Service for Sparkfined PWA
 * Implements debounced event tracking with offline queue support
 * 
 * Features:
 * - Debounced events for performance
 * - Offline queue with sync on reconnect
 * - Privacy-first: No PII, anonymous usage only
 */

interface TelemetryEvent {
  event: string
  properties?: Record<string, unknown>
  timestamp: number
}

interface QueuedEvent extends TelemetryEvent {
  retries: number
}

class TelemetryServiceEnhanced {
  private queue: QueuedEvent[] = []
  private readonly MAX_QUEUE_SIZE = 100
  private readonly MAX_RETRIES = 3
  private debounceTimers = new Map<string, NodeJS.Timeout>()

  constructor() {
    // Setup online/offline listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.syncQueue())
    }
  }

  /**
   * Track event with debouncing for performance
   */
  trackEvent(event: string, properties?: Record<string, unknown>): void {
    const debounceKey = `${event}-${JSON.stringify(properties)}`
    
    // Clear existing timer
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey)!)
    }

    // Set new debounced timer
    const timer = setTimeout(() => {
      this.sendEvent(event, properties)
      this.debounceTimers.delete(debounceKey)
    }, 250)

    this.debounceTimers.set(debounceKey, timer)
  }

  /**
   * Send event immediately (bypasses debounce)
   */
  trackEventImmediate(event: string, properties?: Record<string, unknown>): void {
    this.sendEvent(event, properties)
  }

  /**
   * Internal: Send event or queue if offline
   */
  private sendEvent(event: string, properties?: Record<string, unknown>): void {
    const telemetryEvent: TelemetryEvent = {
      event,
      properties,
      timestamp: Date.now(),
    }

    if (navigator.onLine) {
      this.sendToServer(telemetryEvent)
    } else {
      this.queueEvent(telemetryEvent)
    }
  }

  /**
   * Queue event for later sync
   */
  private queueEvent(event: TelemetryEvent): void {
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      // Remove oldest event
      this.queue.shift()
    }

    this.queue.push({ ...event, retries: 0 })
    
    // Persist to localStorage
    this.persistQueue()
  }

  /**
   * Send event to server
   */
  private async sendToServer(event: TelemetryEvent): Promise<void> {
    try {
      const response = await fetch('/api/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
        // Don't wait for response
        keepalive: true,
      })

      if (!response.ok) {
        console.warn('Telemetry send failed:', response.status)
      }
    } catch (error) {
      console.warn('Telemetry error:', error)
      // Queue for retry
      this.queueEvent(event)
    }
  }

  /**
   * Sync queued events when back online
   */
  private async syncQueue(): Promise<void> {
    if (this.queue.length === 0) return

    console.log(`[Telemetry] Syncing ${this.queue.length} queued events`)

    const eventsToSync = [...this.queue]
    this.queue = []

    for (const queuedEvent of eventsToSync) {
      const { retries, ...event } = queuedEvent

      try {
        await this.sendToServer(event)
      } catch (error) {
        // Retry with exponential backoff
        if (retries < this.MAX_RETRIES) {
          setTimeout(() => {
            this.queue.push({ ...event, retries: retries + 1 })
            this.persistQueue()
          }, Math.pow(2, retries) * 1000)
        }
      }
    }

    this.persistQueue()
  }

  /**
   * Persist queue to localStorage
   */
  private persistQueue(): void {
    try {
      localStorage.setItem('telemetry_queue', JSON.stringify(this.queue))
    } catch (error) {
      console.warn('Failed to persist telemetry queue:', error)
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem('telemetry_queue')
      if (stored) {
        this.queue = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load telemetry queue:', error)
      this.queue = []
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { size: number; synced: boolean } {
    return {
      size: this.queue.length,
      synced: this.queue.length === 0,
    }
  }

  /**
   * Clear all queued events
   */
  clearQueue(): void {
    this.queue = []
    this.persistQueue()
  }
}

// Singleton instance
export const telemetryService = new TelemetryServiceEnhanced()

// Convenience function
export const trackEvent = (event: string, properties?: Record<string, unknown>): void => {
  telemetryService.trackEvent(event, properties)
}

// Common event names
export const TelemetryEvents = {
  // Chart interactions
  CHART_LOAD: 'chart_load',
  CHART_INTERACTION: 'chart_interaction',
  DRAWING_TOOL_USED: 'drawing_tool_used',
  INDICATOR_ADDED: 'indicator_added',
  TIMEFRAME_CHANGED: 'timeframe_changed',
  
  // Watchlist
  WATCHLIST_ADD: 'watchlist_add',
  WATCHLIST_REMOVE: 'watchlist_remove',
  WATCHLIST_SORT: 'watchlist_sort',
  
  // Constellation UI
  STAR_HOVER: 'star_hover',
  STAR_CLICK: 'star_click',
  CONSTELLATION_ROTATE: 'constellation_rotate',
  FEATURE_FILTER: 'feature_filter',
  
  // Performance
  PAGE_LOAD: 'page_load',
  API_REQUEST: 'api_request',
  CACHE_HIT: 'cache_hit',
  CACHE_MISS: 'cache_miss',
  
  // Errors
  API_ERROR: 'api_error',
  RENDER_ERROR: 'render_error',
} as const

export type TelemetryEventName = typeof TelemetryEvents[keyof typeof TelemetryEvents]
