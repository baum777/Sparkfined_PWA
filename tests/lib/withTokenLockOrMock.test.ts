import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { readUsage, resetUsageForToday } from '@/features/settings/token-usage'
import { withTokenLockOrMock } from '@/lib/ai/withTokenLockOrMock'

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

describe('withTokenLockOrMock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-05-01T10:00:00Z'))
    vi.stubGlobal('localStorage', new MemoryStorage())
    resetUsageForToday(new Date('2024-05-01T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('routes to demo path without touching usage when budgets are exceeded', async () => {
    const doDemoCall = vi.fn(async () => 'demo-response')
    const doRealCall = vi.fn(async () => ({ result: 'real-response', tokensUsed: 50 }))

    const outcome = await withTokenLockOrMock<string>({
      requestedMaxOutputTokens: 200,
      reservedTokens: 200,
      dailyTokenBudget: 100,
      doDemoCall,
      doRealCall,
      now: () => new Date('2024-05-01T10:00:00Z'),
    })

    expect(outcome.mode).toBe('demo')
    expect(doDemoCall).toHaveBeenCalledTimes(1)
    expect(doRealCall).not.toHaveBeenCalled()
    expect(readUsage()).toEqual({ dateKey: '2024-05-01', tokens: 0, apiCalls: 0 })
  })

  it('commits usage once a real call completes', async () => {
    const doDemoCall = vi.fn()
    const doRealCall = vi.fn(async () => ({ result: { ok: true }, tokensUsed: 25 }))

    const outcome = await withTokenLockOrMock<{ ok: boolean }>({
      requestedMaxOutputTokens: 800,
      reservedTokens: 800,
      dailyTokenBudget: 1000,
      doDemoCall,
      doRealCall,
      now: () => new Date('2024-05-01T12:00:00Z'),
    })

    expect(outcome.mode).toBe('real')
    expect(outcome.usageSnapshot?.tokens).toBe(25)
    expect(outcome.usageSnapshot?.apiCalls).toBe(1)
    expect(readUsage()).toEqual({ dateKey: '2024-05-01', tokens: 25, apiCalls: 1 })
  })

  it('does not commit when the real call throws', async () => {
    const doDemoCall = vi.fn()
    const doRealCall = vi.fn(async () => {
      throw new Error('provider-failed')
    })

    await expect(
      withTokenLockOrMock({
        requestedMaxOutputTokens: 400,
        reservedTokens: 400,
        dailyTokenBudget: 1000,
        doDemoCall,
        doRealCall,
        now: () => new Date('2024-05-01T14:00:00Z'),
      }),
    ).rejects.toThrow('provider-failed')

    expect(readUsage()).toEqual({ dateKey: '2024-05-01', tokens: 0, apiCalls: 0 })
  })
})
