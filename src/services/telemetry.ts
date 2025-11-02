// Telemetry service with debouncing and offline queue
import { TelemetryServiceClass } from '@/lib/TelemetryService'

interface TelemetryEvent {
  event: string
  properties?: Record<string, any>
  timestamp: number
  sessionId?: string
}

// Offline queue
const offlineQueue: TelemetryEvent[] = []
let debounceTimer: NodeJS.Timeout | null = null

// Debounce function
function debounce(func: () => void, wait: number) {
  return () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(func, wait)
  }
}

// Send events batch to API
async function sendEvents(events: TelemetryEvent[]) {
  if (!navigator.onLine) {
    // Queue for later
    offlineQueue.push(...events)
    return
  }

  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(events),
    })
  } catch (error) {
    console.error('[Telemetry] Send error:', error)
    // Queue on error
    offlineQueue.push(...events)
  }
}

// Process offline queue when back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (offlineQueue.length > 0) {
      const events = offlineQueue.splice(0)
      sendEvents(events).catch(console.error)
    }
  })
}

// Track event (debounced for performance)
export function trackEvent(event: string, properties?: Record<string, any>) {
  const telemetryEvent: TelemetryEvent = {
    event,
    properties,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  }

  // Debounce sending (batch events every 250ms)
  const send = debounce(() => {
    sendEvents([telemetryEvent]).catch(console.error)
  }, 250)

  send()
}

// Get or create session ID
function getSessionId(): string {
  const key = 'telemetry_session_id'
  let sessionId = sessionStorage.getItem(key)
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem(key, sessionId)
  }
  return sessionId
}

// Flush pending events (call on page unload)
export function flushTelemetry() {
  if (offlineQueue.length > 0 && navigator.onLine) {
    const events = offlineQueue.splice(0)
    // Use sendBeacon for reliable delivery on page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/telemetry',
        JSON.stringify(events)
      )
    } else {
      sendEvents(events).catch(console.error)
    }
  }
}

// Register unload handler
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushTelemetry)
}
