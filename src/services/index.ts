/**
 * Services Exports
 * Sparkfined PWA Trading Platform
 */

// API
export { apiClient } from './api/client'

// Storage
export { db, clearOldPriceCache, getSyncedEvents, markEventsSynced } from './storage/database'
export type { WatchlistItem, ChartDrawing, PriceCache, JournalEntry, QueuedEvent } from './storage/database'

// WebSocket
export { priceSocket } from './websocket/priceSocket'
export type { PriceUpdate } from './websocket/priceSocket'

// Telemetry
export { 
  telemetryService, 
  trackEvent, 
  trackPageView, 
  trackInteraction, 
  trackPerformance,
  trackError 
} from './telemetry/telemetryService'
