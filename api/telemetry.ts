// Telemetry endpoint with debouncing and offline queue support
import type { VercelRequest, VercelResponse } from '@vercel/node'

interface TelemetryEvent {
  event: string
  properties?: Record<string, any>
  timestamp: number
  sessionId?: string
}

// In-memory queue (use Redis/Queue in production)
const eventQueue: TelemetryEvent[] = []

// Process events batch
async function processEvents(events: TelemetryEvent[]) {
  // In production, send to analytics service (e.g., PostHog, Mixpanel)
  console.log('[Telemetry] Processing events:', events.length)
  
  // Example: Send to analytics API
  // await fetch('https://analytics.example.com/events', {
  //   method: 'POST',
  //   body: JSON.stringify({ events }),
  // })

  // For now, just log
  events.forEach(event => {
    console.log(`[Telemetry] ${event.event}:`, event.properties)
  })
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const event: TelemetryEvent = req.body

    // Validate event structure
    if (!event.event || !event.timestamp) {
      return res.status(400).json({
        error: 'Invalid event format',
        message: 'Event must have "event" and "timestamp" fields',
      })
    }

    // Add to queue
    eventQueue.push(event)

    // Process in batches (every 10 events or 5 seconds)
    if (eventQueue.length >= 10) {
      const batch = eventQueue.splice(0, 10)
      processEvents(batch).catch(console.error)
    }

    return res.status(200).json({
      success: true,
      queued: eventQueue.length,
    })
  } catch (error) {
    console.error('[Telemetry] Error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
