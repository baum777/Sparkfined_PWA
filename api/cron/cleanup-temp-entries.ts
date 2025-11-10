/**
 * BLOCK 2: Temp Journal Entries Cleanup Cron Job
 * 
 * Runs daily to delete temp entries older than TTL (7 days default)
 * 
 * Vercel Cron Setup:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-temp-entries",
 *     "schedule": "0 2 * * *"  // Daily at 2 AM UTC
 *   }]
 * }
 * 
 * Manual test:
 * curl -X GET https://your-app.vercel.app/api/cron/cleanup-temp-entries \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = { runtime: 'edge' }

interface CleanupResult {
  success: boolean
  deletedCount: number
  ttlDays: number
  cutoffDate: string
  errors?: string[]
}

/**
 * Verify cron secret to prevent unauthorized access
 */
function verifyCronSecret(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  const env = process.env.NODE_ENV ?? 'production'
  const isProd = env === 'production'

  if (!secret) {
    if (!isProd) {
      console.warn('[Cron] CRON_SECRET not set – allowing request in non-production environment')
      return true
    }
    console.error('[Cron] CRON_SECRET missing – blocking request')
    return false
  }

  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    console.error('[Cron] Missing authorization header')
    return false
  }

  const token = authHeader.replace('Bearer ', '').trim()
  return token === secret
}

/**
 * Get all temp entries from KV store
 */
async function getTempEntriesFromKV(userId: string = 'default') {
  try {
    const { kvSMembers, kvGet } = await import('../../src/lib/kv')
    
    // Get temp entry IDs
    const tempIds = await kvSMembers(`journal:temp:${userId}`)
    
    if (tempIds.length === 0) {
      return []
    }

    // Fetch all temp entries
    const entries = []
    for (const id of tempIds) {
      const entry = await kvGet(`journal:${userId}:${id}`)
      if (entry && (entry).status === 'temp') {
        entries.push(entry)
      }
    }

    return entries
  } catch (error) {
    console.error('[Cron] Failed to fetch temp entries:', error)
    return []
  }
}

/**
 * Delete temp entry from KV store
 */
async function deleteTempEntry(entryId: string, userId: string = 'default') {
  try {
    const { kvDel, kvSRem } = await import('../../src/lib/kv')
    
    await kvDel(`journal:${userId}:${entryId}`)
    await kvSRem(`journal:byUser:${userId}`, entryId)
    await kvSRem(`journal:temp:${userId}`, entryId)
    
    return true
  } catch (error) {
    console.error('[Cron] Failed to delete entry:', entryId, error)
    return false
  }
}

/**
 * Main cleanup function
 */
async function cleanupTempEntries(ttlDays: number = 7) {
  const cutoffTime = Date.now() - ttlDays * 24 * 60 * 60 * 1000
  const userId = 'default' // TODO: Support multi-user cleanup

  console.log('[Cron] Starting cleanup:', {
    ttlDays,
    cutoffDate: new Date(cutoffTime).toISOString(),
  })

  // Get temp entries
  const tempEntries = await getTempEntriesFromKV(userId)
  
  if (tempEntries.length === 0) {
    console.log('[Cron] No temp entries found')
    return { deletedCount: 0, errors: [] }
  }

  console.log(`[Cron] Found ${tempEntries.length} temp entries`)

  // Filter old entries
  const toDelete = tempEntries.filter((entry: any) => {
    return entry.createdAt < cutoffTime
  })

  if (toDelete.length === 0) {
    console.log('[Cron] No entries to delete (all within TTL)')
    return { deletedCount: 0, errors: [] }
  }

  console.log(`[Cron] Deleting ${toDelete.length} old entries`)

  // Delete entries
  let deletedCount = 0
  const errors: string[] = []

  for (const entry of toDelete) {
    const success = await deleteTempEntry((entry).id, userId)
    if (success) {
      deletedCount++
    } else {
      errors.push(`Failed to delete entry ${(entry).id}`)
    }
  }

  console.log(`[Cron] ✅ Cleanup complete: ${deletedCount}/${toDelete.length} deleted`)

  return { deletedCount, errors }
}

/**
 * HTTP handler
 */
export default async function handler(req: Request): Promise<Response> {
  // Verify cron secret
  if (!verifyCronSecret(req)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Unauthorized',
      }),
      {
        status: process.env.CRON_SECRET ? 401 : 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Get TTL from query param (default: 7 days)
    const url = new URL(req.url)
    const ttlDays = parseInt(url.searchParams.get('ttl') || '7')

    if (ttlDays < 1 || ttlDays > 30) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid TTL (must be 1-30 days)',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Run cleanup
    const cutoffTime = Date.now() - ttlDays * 24 * 60 * 60 * 1000
    const result = await cleanupTempEntries(ttlDays)

    const response: CleanupResult = {
      success: true,
      deletedCount: result.deletedCount,
      ttlDays,
      cutoffDate: new Date(cutoffTime).toISOString(),
      errors: result.errors.length > 0 ? result.errors : undefined,
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[Cron] Error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
