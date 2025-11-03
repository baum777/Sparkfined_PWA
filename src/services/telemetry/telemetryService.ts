/**
 * Telemetry & Event Tracking Service
 * Offline-first with queue for later sync
 * Sparkfined PWA Trading Platform
 */

import { db } from '../storage/database'
import { debounce } from '@/utils'
import { apiClient } from '../api/client'

export interface TelemetryEvent {
  event: string
  properties?: Record<string, any>
  timestamp?: number
}

class TelemetryService {
  private isOnline: boolean = navigator.onLine
  private syncInProgress: boolean = false

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncQueuedEvents()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Sync queued events on startup if online
    if (this.isOnline) {
      this.syncQueuedEvents()
    }
  }

  /**
   * Track an event
   */
  track = debounce((event: string, properties?: Record<string, any>) => {
    const telemetryEvent: TelemetryEvent = {
      event,
      properties: {
        ...properties,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        standalone: this.isStandalone(),
        connectionType: this.getConnectionType()
      },
      timestamp: Date.now()
    }

    if (this.isOnline) {
      this.sendEvent(telemetryEvent)
    } else {
      this.queueEvent(telemetryEvent)
    }
  }, 250)

  /**
   * Track page view
   */
  trackPageView(page: string, properties?: Record<string, any>) {
    this.track('page_view', { page, ...properties })
  }

  /**
   * Track user interaction
   */
  trackInteraction(action: string, target: string, properties?: Record<string, any>) {
    this.track('interaction', { action, target, ...properties })
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
    this.track('performance', { metric, value, ...properties })
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context
    })
  }

  /**
   * Send event to API
   */
  private async sendEvent(event: TelemetryEvent) {
    try {
      const response = await apiClient.post('/telemetry', event, { timeout: 5000 })
      
      if (response.error) {
        console.warn('[Telemetry] Failed to send event:', response.error)
        await this.queueEvent(event)
      }
    } catch (error) {
      console.error('[Telemetry] Error sending event:', error)
      await this.queueEvent(event)
    }
  }

  /**
   * Queue event for later sync
   */
  private async queueEvent(event: TelemetryEvent) {
    try {
      await db.eventQueue.add({
        event: event.event,
        properties: JSON.stringify(event.properties),
        timestamp: event.timestamp || Date.now(),
        synced: false
      })
    } catch (error) {
      console.error('[Telemetry] Failed to queue event:', error)
    }
  }

  /**
   * Sync queued events
   */
  private async syncQueuedEvents() {
    if (this.syncInProgress || !this.isOnline) return

    this.syncInProgress = true

    try {
      const queuedEvents = await db.eventQueue
        .where('synced')
        .equals(0)
        .limit(50)
        .toArray()

      if (queuedEvents.length === 0) {
        this.syncInProgress = false
        return
      }

      const events: TelemetryEvent[] = queuedEvents.map(e => ({
        event: e.event,
        properties: JSON.parse(e.properties),
        timestamp: e.timestamp
      }))

      const response = await apiClient.post('/telemetry/batch', { events }, { timeout: 10000 })

      if (!response.error) {
        // Mark as synced
        const ids = queuedEvents.map(e => e.id!).filter(id => id !== undefined)
        await db.eventQueue.bulkUpdate(
          ids.map(id => ({ key: id, changes: { synced: true } }))
        )

        console.log(`[Telemetry] Synced ${ids.length} events`)

        // Clean up old synced events (keep last 1000)
        const syncedCount = await db.eventQueue.where('synced').equals(1).count()
        if (syncedCount > 1000) {
          const oldEvents = await db.eventQueue
            .where('synced')
            .equals(1)
            .sortBy('timestamp')

          const toDelete = oldEvents.slice(0, syncedCount - 1000)
          await db.eventQueue.bulkDelete(toDelete.map(e => e.id!))
        }
      }
    } catch (error) {
      console.error('[Telemetry] Failed to sync events:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Check if running as installed PWA
   */
  private isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    )
  }

  /**
   * Get connection type
   */
  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    return connection?.effectiveType || 'unknown'
  }

  /**
   * Get queue stats
   */
  async getQueueStats() {
    const total = await db.eventQueue.count()
    const synced = await db.eventQueue.where('synced').equals(1).count()
    const pending = total - synced

    return { total, synced, pending }
  }
}

export const telemetryService = new TelemetryService()

// Export convenience functions
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  telemetryService.track(event, properties)
}

export const trackPageView = (page: string, properties?: Record<string, any>) => {
  telemetryService.trackPageView(page, properties)
}

export const trackInteraction = (action: string, target: string, properties?: Record<string, any>) => {
  telemetryService.trackInteraction(action, target, properties)
}

export const trackPerformance = (metric: string, value: number, properties?: Record<string, any>) => {
  telemetryService.trackPerformance(metric, value, properties)
}

export const trackError = (error: Error, context?: Record<string, any>) => {
  telemetryService.trackError(error, context)
}
