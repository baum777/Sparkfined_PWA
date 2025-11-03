/**
 * Telemetry API Endpoint
 * Collects and processes analytics events
 * Sparkfined PWA Trading Platform
 */

import { VercelRequest, VercelResponse } from '@vercel/node'

// In-memory storage for development (use Redis in production)
const eventStore: any[] = []
const MAX_EVENTS = 10000

interface TelemetryEvent {
  event: string
  properties?: Record<string, any>
  timestamp: number
  clientId?: string
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-client-id')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body as TelemetryEvent | { events: TelemetryEvent[] }
    const clientId = req.headers['x-client-id'] as string

    // Handle single event
    if ('event' in body && typeof body.event === 'string') {
      const event: TelemetryEvent = {
        ...body,
        clientId,
        timestamp: body.timestamp || Date.now()
      }

      eventStore.push(event)
      
      // Trim if too large
      if (eventStore.length > MAX_EVENTS) {
        eventStore.splice(0, eventStore.length - MAX_EVENTS)
      }

      console.log('[Telemetry] Event received:', event.event)
      
      return res.status(200).json({ 
        ok: true,
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`
      })
    }

    // Handle batch events
    if ('events' in body && Array.isArray(body.events)) {
      const events = body.events.map(e => ({
        ...e,
        clientId,
        timestamp: e.timestamp || Date.now()
      }))

      eventStore.push(...events)

      // Trim if too large
      if (eventStore.length > MAX_EVENTS) {
        eventStore.splice(0, eventStore.length - MAX_EVENTS)
      }

      console.log('[Telemetry] Batch received:', events.length, 'events')

      return res.status(200).json({ 
        ok: true, 
        count: events.length,
        stored: eventStore.length
      })
    }

    return res.status(400).json({ error: 'Invalid event format' })

  } catch (error) {
    console.error('[Telemetry] Error:', error)
    return res.status(500).json({ 
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
