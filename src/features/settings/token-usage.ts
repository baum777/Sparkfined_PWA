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

function createDefaultSnapshot(): UsageSnapshot {
  return {
    dateKey: getBerlinDateKey(),
    tokens: 0,
    apiCalls: 0,
  }
}

function persistSnapshot(snapshot: UsageSnapshot): UsageSnapshot {
  setJSON(STORAGE_KEY, snapshot)
  return snapshot
}

export function loadUsage(): UsageSnapshot {
  if (!isStorageAvailable()) return createDefaultSnapshot()
  const snapshot = getJSON<UsageSnapshot>(STORAGE_KEY, createDefaultSnapshot())
  return snapshot.dateKey === getBerlinDateKey() ? snapshot : persistSnapshot(createDefaultSnapshot())
}

export function resetIfNewDay(): UsageSnapshot {
  const snapshot = loadUsage()
  const currentKey = getBerlinDateKey()
  if (snapshot.dateKey !== currentKey) {
    return persistSnapshot({ ...createDefaultSnapshot(), dateKey: currentKey })
  }
  return snapshot
}

export function incrementTokens(deltaTokens: number): UsageSnapshot {
  const usage = resetIfNewDay()
  const next = {
    ...usage,
    tokens: Math.max(0, usage.tokens + Math.max(0, deltaTokens)),
  }
  return persistSnapshot(next)
}

export function incrementApiCalls(deltaCalls: number = 1): UsageSnapshot {
  const usage = resetIfNewDay()
  const next = {
    ...usage,
    apiCalls: Math.max(0, usage.apiCalls + Math.max(0, deltaCalls)),
  }
  return persistSnapshot(next)
}
