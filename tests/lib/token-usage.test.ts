import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import {
  getBerlinDateKey,
  commitUsageAfterRealCall,
  maybeResetUsage,
  readUsage,
  resetUsageForToday,
  type UsageSnapshot,
} from '@/features/settings/token-usage'

class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  get length(): number {
    return this.store.size
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
}

const setSnapshot = (snapshot: UsageSnapshot) => {
  window.localStorage?.setItem('sf:usage:daily', JSON.stringify(snapshot))
}

describe('token-usage helper', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-05-01T10:00:00Z'))
    vi.stubGlobal('localStorage', new MemoryStorage())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('creates a Berlin dateKey independent of host timezone', () => {
    expect(getBerlinDateKey(new Date('2024-05-01T22:30:00Z'))).toBe('2024-05-02')
    expect(getBerlinDateKey(new Date('2024-12-01T00:10:00Z'))).toBe('2024-12-01')
  })

  it('resets usage when the stored dateKey is stale', () => {
    setSnapshot({ dateKey: '2024-04-30', tokens: 120, apiCalls: 8 })

    vi.setSystemTime(new Date('2024-05-01T06:00:00Z'))
    const snapshot = maybeResetUsage()

    expect(snapshot.dateKey).toBe('2024-05-01')
    expect(snapshot.tokens).toBe(0)
    expect(snapshot.apiCalls).toBe(0)
    expect(readUsage()).toEqual(snapshot)
  })

  it('commits usage only when a real call completes', () => {
    const first = commitUsageAfterRealCall({ tokensUsed: 250, apiCallsDelta: 1 })
    expect(first.tokens).toBe(250)
    expect(first.apiCalls).toBe(1)

    const second = commitUsageAfterRealCall({ tokensUsed: 0, apiCallsDelta: 0 })
    expect(second).toEqual(first)

    const third = commitUsageAfterRealCall({ tokensUsed: 50, apiCallsDelta: 2 })
    expect(third.tokens).toBe(300)
    expect(third.apiCalls).toBe(3)
  })

  it('forces a same-day reset when requested', () => {
    commitUsageAfterRealCall({ tokensUsed: 75, apiCallsDelta: 1 })

    const snapshot = resetUsageForToday()
    expect(snapshot.tokens).toBe(0)
    expect(snapshot.apiCalls).toBe(0)
  })
})
