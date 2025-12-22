import { getJSON, isStorageAvailable, setJSON } from '@/lib/safeStorage'

export type UsageSnapshot = {
  dateKey: string
  tokens: number
  apiCalls: number
}

const STORAGE_KEY = 'sf:usage:daily'

export function getBerlinDateKey(now: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(now)
}

function createDefaultSnapshot(now: Date = new Date()): UsageSnapshot {
  return {
    dateKey: getBerlinDateKey(now),
    tokens: 0,
    apiCalls: 0,
  }
}

function persistSnapshot(snapshot: UsageSnapshot): UsageSnapshot {
  setJSON(STORAGE_KEY, snapshot)
  return snapshot
}

export function maybeResetUsage(options: { now?: Date; forceReset?: boolean } = {}): UsageSnapshot {
  const { now = new Date(), forceReset = false } = options
  const todayKey = getBerlinDateKey(now)

  if (!isStorageAvailable()) {
    return createDefaultSnapshot(now)
  }

  const snapshot = getJSON<UsageSnapshot>(STORAGE_KEY, createDefaultSnapshot(now))
  if (forceReset || snapshot.dateKey !== todayKey) {
    return persistSnapshot({ dateKey: todayKey, tokens: 0, apiCalls: 0 })
  }

  return snapshot
}

export function readUsage(now?: Date): UsageSnapshot {
  return maybeResetUsage({ now })
}

export function resetUsageForToday(now?: Date): UsageSnapshot {
  return maybeResetUsage({ now, forceReset: true })
}

export function commitUsageAfterRealCall(params: { tokensUsed?: number; apiCallsDelta?: number; now?: Date }): UsageSnapshot {
  const { tokensUsed, apiCallsDelta = 1, now } = params
  const usage = maybeResetUsage({ now })
  const tokenDelta = Math.max(0, Math.floor(tokensUsed ?? 0))
  const callDelta = Math.max(0, Math.floor(apiCallsDelta ?? 0))

  if (tokenDelta === 0 && callDelta === 0) {
    return usage
  }

  const next = {
    ...usage,
    tokens: usage.tokens + tokenDelta,
    apiCalls: usage.apiCalls + callDelta,
  }
  return persistSnapshot(next)
}
