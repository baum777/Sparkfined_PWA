/**
 * ReplayService - BLOCK 1: Replay & Pattern Recognition
 * 
 * Replaces stub implementation with full business logic
 * Manages replay sessions, OHLC data caching, and pattern analytics
 * 
 * Features:
 * - Create/Update/Delete replay sessions
 * - Link replay to journal entries
 * - Cache OHLC data for offline replay
 * - Calculate scrub jumps (existing math helpers kept)
 * - Pattern library (success setups)
 */

import { initDB } from './db'
import type {
  ReplaySession,
  ReplayBookmark,
  OhlcPoint,
  JournalEntry,
  PatternStats,
} from '@/types/journal'

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Create a new replay session
 * @param session - Session data (id/timestamps auto-generated)
 * @returns Created session
 */
export async function createSession(
  session: Omit<ReplaySession, 'id' | 'createdAt'>
): Promise<ReplaySession> {
  const db = await initDB()

  const newSession: ReplaySession = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    ...session,
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['replay_sessions'], 'readwrite')
    const store = transaction.objectStore('replay_sessions')
    const request = store.add(newSession)

    request.onsuccess = () => resolve(newSession)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Update an existing replay session
 * @param id - Session ID
 * @param updates - Partial updates
 * @returns Updated session or undefined
 */
export async function updateSession(
  id: string,
  updates: Partial<Omit<ReplaySession, 'id' | 'createdAt'>>
): Promise<ReplaySession | undefined> {
  const db = await initDB()
  const existing = await getSession(id)
  if (!existing) return undefined

  const updated: ReplaySession = {
    ...existing,
    ...updates,
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['replay_sessions'], 'readwrite')
    const store = transaction.objectStore('replay_sessions')
    const request = store.put(updated)

    request.onsuccess = () => resolve(updated)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get a single replay session by ID
 * @param id - Session ID
 * @returns Session or undefined
 */
export async function getSession(id: string): Promise<ReplaySession | undefined> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['replay_sessions'], 'readonly')
    const store = transaction.objectStore('replay_sessions')
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result as ReplaySession | undefined)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get replay sessions by journal entry ID
 * @param journalEntryId - Journal entry ID
 * @returns Array of linked replay sessions
 */
export async function getSessionsByJournalEntry(
  journalEntryId: string
): Promise<ReplaySession[]> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['replay_sessions'], 'readonly')
    const store = transaction.objectStore('replay_sessions')
    const index = store.index('journalEntryId')
    const request = index.getAll(journalEntryId)

    request.onsuccess = () => resolve(request.result as ReplaySession[])
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get all replay sessions (for pattern library)
 * @returns All sessions sorted by createdAt desc
 */
export async function getAllSessions(): Promise<ReplaySession[]> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['replay_sessions'], 'readonly')
    const store = transaction.objectStore('replay_sessions')
    const request = store.getAll()

    request.onsuccess = () => {
      const sessions = request.result as ReplaySession[]
      // Sort by most recent
      sessions.sort((a, b) => b.createdAt - a.createdAt)
      resolve(sessions)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Delete a replay session
 * @param id - Session ID
 */
export async function deleteSession(id: string): Promise<void> {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['replay_sessions'], 'readwrite')
    const store = transaction.objectStore('replay_sessions')
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// ============================================================================
// BOOKMARKS
// ============================================================================

/**
 * Add bookmark to replay session
 * @param sessionId - Session ID
 * @param bookmark - Bookmark data
 * @returns Updated session
 */
export async function addBookmark(
  sessionId: string,
  bookmark: ReplayBookmark
): Promise<ReplaySession | undefined> {
  const session = await getSession(sessionId)
  if (!session) return undefined

  const bookmarks = [...session.bookmarks, bookmark]
  return updateSession(sessionId, { bookmarks })
}

/**
 * Remove bookmark from replay session
 * @param sessionId - Session ID
 * @param timestamp - Bookmark timestamp to remove
 * @returns Updated session
 */
export async function removeBookmark(
  sessionId: string,
  timestamp: number
): Promise<ReplaySession | undefined> {
  const session = await getSession(sessionId)
  if (!session) return undefined

  const bookmarks = session.bookmarks.filter((b) => b.timestamp !== timestamp)
  return updateSession(sessionId, { bookmarks })
}

// ============================================================================
// OHLC DATA CACHING
// ============================================================================

/**
 * Cache OHLC data for offline replay
 * @param sessionId - Session ID
 * @param ohlcData - OHLC candle data
 * @returns Updated session
 */
export async function cacheOhlcData(
  sessionId: string,
  ohlcData: OhlcPoint[]
): Promise<ReplaySession | undefined> {
  return updateSession(sessionId, { ohlcData })
}

/**
 * Get cached OHLC data for session
 * @param sessionId - Session ID
 * @returns OHLC data or undefined if not cached
 */
export async function getCachedOhlc(
  sessionId: string
): Promise<OhlcPoint[] | undefined> {
  const session = await getSession(sessionId)
  return session?.ohlcData
}

// ============================================================================
// PATTERN LIBRARY
// ============================================================================

/**
 * Get replay sessions for winning trades (pattern library)
 * Requires linked journal entries with positive PnL
 * @param minPnlPercent - Minimum PnL % to qualify (default: 10%)
 * @returns Sessions linked to winning trades
 */
export async function getSuccessPatterns(
  minPnlPercent: number = 10
): Promise<
  Array<{
    session: ReplaySession
    journalEntry?: JournalEntry
    pnl: number
    pnlPercent: number
  }>
> {
  // Import JournalService here to avoid circular dependency
  const { getEntry } = await import('./JournalService')

  const allSessions = await getAllSessions()
  const successPatterns: Array<{
    session: ReplaySession
    journalEntry?: JournalEntry
    pnl: number
    pnlPercent: number
  }> = []

  for (const session of allSessions) {
    if (!session.journalEntryId) continue

    const entry = await getEntry(session.journalEntryId)
    if (!entry?.outcome) continue

    const { pnl, pnlPercent } = entry.outcome
    if (pnl > 0 && pnlPercent >= minPnlPercent) {
      successPatterns.push({
        session,
        journalEntry: entry,
        pnl,
        pnlPercent,
      })
    }
  }

  // Sort by PnL % descending
  successPatterns.sort((a, b) => b.pnlPercent - a.pnlPercent)

  return successPatterns
}

// ============================================================================
// SCRUBBER MATH (Keep existing helpers)
// ============================================================================

export type ScrubDirection = 'left' | 'right' | 'shift-left' | 'shift-right'

/**
 * Calculate time jump for scrubber navigation
 * - Regular arrows: 5s jump
 * - Shift arrows: 20s jump
 *
 * @param currentTime - Current playback time in seconds
 * @param direction - Scrub direction
 * @returns New time position
 */
export function calculateScrubJump(
  currentTime: number,
  direction: ScrubDirection
): number {
  const isShift = direction.includes('shift')
  const jumpAmount = isShift ? 20 : 5
  const multiplier = direction.includes('right') ? 1 : -1

  return Math.max(0, currentTime + jumpAmount * multiplier)
}

/**
 * Interpolate ghost cursor position between keyframes
 * Simple linear interpolation for MVP
 */
export function interpolateGhostCursor(
  time: number,
  keyframes: Array<{ time: number; x: number; y: number }>
): { x: number; y: number } | null {
  if (keyframes.length === 0) return null

  // If time is before first keyframe, return first keyframe position
  const first = keyframes[0]
  if (!first) return null
  if (time <= first.time) {
    return { x: first.x, y: first.y }
  }

  // If time is after last keyframe, return last keyframe position
  const last = keyframes[keyframes.length - 1]
  if (!last) return null
  if (time >= last.time) {
    return { x: last.x, y: last.y }
  }

  // Find surrounding keyframes
  let before = keyframes[0]
  let after = keyframes[keyframes.length - 1]

  for (let i = 0; i < keyframes.length - 1; i++) {
    const current = keyframes[i]
    const next = keyframes[i + 1]
    if (current && next && current.time <= time && next.time >= time) {
      before = current
      after = next
      break
    }
  }

  // Linear interpolation
  if (!before || !after) return null
  if (before.time === after.time) return { x: before.x, y: before.y }

  const t = (time - before.time) / (after.time - before.time)
  return {
    x: before.x + (after.x - before.x) * t,
    y: before.y + (after.y - before.y) * t,
  }
}

/**
 * Handle zoom level for Ctrl+Wheel
 * @param currentZoom - Current zoom level (1.0 = 100%)
 * @param delta - Wheel delta
 * @returns New zoom level (clamped 0.5 - 3.0)
 */
export function calculateZoom(currentZoom: number, delta: number): number {
  const zoomSensitivity = 0.001
  const newZoom = currentZoom + delta * zoomSensitivity
  return Math.max(0.5, Math.min(3.0, newZoom))
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Calculate replay engagement stats
 * @returns Aggregate stats (total sessions, avg duration, etc.)
 */
export async function getReplayStats(): Promise<{
  totalSessions: number
  avgDuration: number
  totalBookmarks: number
  linkedToJournal: number
}> {
  const sessions = await getAllSessions()

  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
  const totalBookmarks = sessions.reduce((sum, s) => sum + s.bookmarks.length, 0)
  const linkedToJournal = sessions.filter((s) => s.journalEntryId).length

  return {
    totalSessions: sessions.length,
    avgDuration: sessions.length > 0 ? totalDuration / sessions.length : 0,
    totalBookmarks,
    linkedToJournal,
  }
}
