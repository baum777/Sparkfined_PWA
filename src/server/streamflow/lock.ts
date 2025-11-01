/**
 * Streamflow Lock Orchestration
 * Server-side only
 * 
 * For MVP: Mock lock registration, focus on rank assignment
 * Full Streamflow SDK integration in later iterations
 */

import { promises as fs } from 'fs'
import path from 'path'
import { ACCESS_CONFIG } from '../../config/access'
import type { RankStorage, AccessError } from '../../types/access'

// SERVER_CONFIG reserved for future Streamflow API integration

const RANK_FILE_PATH = path.join(process.cwd(), ACCESS_CONFIG.RANK_STORAGE_PATH)

/**
 * Load rank storage from file
 */
async function loadRankStorage(): Promise<RankStorage> {
  try {
    const data = await fs.readFile(RANK_FILE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    // File doesn't exist, create default
    const defaultStorage: RankStorage = {
      currentRank: 0,
      locks: [],
      lastUpdated: Date.now(),
    }
    await saveRankStorage(defaultStorage)
    return defaultStorage
  }
}

/**
 * Save rank storage to file
 */
async function saveRankStorage(storage: RankStorage): Promise<void> {
  const dir = path.dirname(RANK_FILE_PATH)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(RANK_FILE_PATH, JSON.stringify(storage, null, 2))
}

/**
 * Get next available rank
 * Thread-safe via file locking (for MVP, simple increment)
 */
async function getNextRank(): Promise<number> {
  const storage = await loadRankStorage()
  const nextRank = storage.currentRank + 1
  
  if (nextRank > ACCESS_CONFIG.OG_SLOTS) {
    // Beyond OG slots, still assign rank but won't mint NFT
    return nextRank
  }
  
  return nextRank
}

/**
 * Register a lock and assign rank
 * 
 * @param wallet - User wallet address
 * @param amount - Lock amount
 * @param txSignature - Optional Streamflow transaction signature
 * @returns Object with rank and lockId
 */
export async function registerLock({
  wallet,
  amount,
  txSignature: _txSignature,
}: {
  wallet: string
  amount: number
  txSignature?: string
}): Promise<{
  rank: number
  lockId: string
}> {
  // txSignature reserved for future Streamflow verification
  const storage = await loadRankStorage()
  
  // Check if wallet already locked
  const existingLock = storage.locks.find((lock) => lock.wallet === wallet)
  if (existingLock) {
    throw {
      name: 'AccessError',
      message: 'Wallet already has a lock',
      code: 'DUPLICATE_LOCK',
      details: { existingRank: existingLock.rank },
    } as AccessError
  }
  
  // Assign next rank
  const rank = await getNextRank()
  const lockId = `sf_${Date.now()}_${wallet.slice(0, 8)}`
  
  // Save lock entry
  storage.currentRank = rank
  storage.locks.push({
    wallet,
    rank,
    timestamp: Date.now(),
    lockId,
  })
  storage.lastUpdated = Date.now()
  
  await saveRankStorage(storage)
  
  console.log(`[Lock] Registered: wallet=${wallet}, rank=${rank}, amount=${amount}`)
  
  return { rank, lockId }
}

/**
 * Get lock info for a wallet
 */
export async function getLockInfo(wallet: string): Promise<{
  hasLock: boolean
  rank: number | null
  lockId: string | null
  timestamp: number | null
} | null> {
  const storage = await loadRankStorage()
  const lock = storage.locks.find((l) => l.wallet === wallet)
  
  if (!lock) {
    return { hasLock: false, rank: null, lockId: null, timestamp: null }
  }
  
  return {
    hasLock: true,
    rank: lock.rank,
    lockId: lock.lockId,
    timestamp: lock.timestamp,
  }
}

/**
 * Get current rank count
 */
export async function getCurrentRankCount(): Promise<number> {
  const storage = await loadRankStorage()
  return storage.currentRank
}

/**
 * Get all locks (for leaderboard)
 */
export async function getAllLocks(): Promise<RankStorage['locks']> {
  const storage = await loadRankStorage()
  return storage.locks.sort((a, b) => a.rank - b.rank)
}

/**
 * Verify Streamflow transaction (MVP: basic signature check)
 * Full implementation would call Streamflow API
 */
export async function verifyStreamflowTransaction(
  signature: string,
  _expectedAmount: number
): Promise<boolean> {
  // MVP: Just check signature exists
  // TODO: Implement actual Streamflow API verification (will use expectedAmount)
  if (!signature || signature.length < 64) {
    return false
  }
  
  // In production, call Streamflow API:
  // const response = await fetch(`${SERVER_CONFIG.STREAMFLOW_API_BASE}/verify`, {
  //   headers: { 'Authorization': `Bearer ${SERVER_CONFIG.STREAMFLOW_API_KEY}` },
  //   body: JSON.stringify({ signature, amount: expectedAmount }),
  // })
  
  return true // Mock: assume valid for MVP
}
