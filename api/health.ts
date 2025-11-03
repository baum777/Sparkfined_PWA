/**
 * Health Check API Endpoint
 * Returns service status and metrics
 * Sparkfined PWA Trading Platform
 */

import { VercelRequest, VercelResponse } from '@vercel/node'

const startTime = Date.now()

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const uptime = Date.now() - startTime

  return res.status(200).json({
    status: 'healthy',
    timestamp: Date.now(),
    uptime: Math.floor(uptime / 1000), // seconds
    version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev',
    environment: process.env.VERCEL_ENV || 'development',
    services: {
      api: 'operational',
      websocket: 'operational',
      cache: 'operational'
    }
  })
}
