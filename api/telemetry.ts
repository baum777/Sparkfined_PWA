/**
 * Vercel Edge Function: Telemetry API
 * Collects anonymous telemetry events
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

interface TelemetryEvent {
  event: string
  properties?: Record<string, unknown>
  timestamp: number
}

// In production, send to analytics service (Posthog, Mixpanel, etc.)
// For now, just log to console
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
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

    if (!event.event || !event.timestamp) {
      return res.status(400).json({ error: 'Invalid event format' })
    }

    // Log event (in production, send to analytics service)
    console.log('[Telemetry]', {
      event: event.event,
      properties: event.properties,
      timestamp: new Date(event.timestamp).toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.socket?.remoteAddress,
    })

    // TODO: Send to analytics service
    // await posthog.capture({
    //   distinctId: clientId,
    //   event: event.event,
    //   properties: event.properties,
    // })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Telemetry Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
