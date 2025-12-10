import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SWRCache } from '../swrCache'

describe('SWRCache', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('should report fresh, stale, and miss states', () => {
    vi.useFakeTimers()
    const cache = new SWRCache<string>({ ttlMs: 1000 })

    cache.set('key', 'value')

    expect(cache.get('key').state).toBe('fresh')

    vi.advanceTimersByTime(1500)
    expect(cache.get('key').state).toBe('stale')

    cache.invalidate('key')
    expect(cache.get('key').state).toBe('miss')
  })

  it('should return cached data while revalidating stale entries', async () => {
    vi.useFakeTimers()
    const cache = new SWRCache<number>({ ttlMs: 100 })
    cache.set('num', 1)

    vi.advanceTimersByTime(200)

    const fetcher = vi.fn().mockResolvedValue(2)
    const result = await cache.fetch('num', fetcher)
    expect(result).toBe(1)
    expect(fetcher).toHaveBeenCalledTimes(1)

    await Promise.resolve()
    await vi.runAllTimersAsync()

    const { entry, state } = cache.get('num')
    expect(state).toBe('fresh')
    expect(entry?.data).toBe(2)
  })

  it('should deduplicate concurrent fetches for the same key', async () => {
    const cache = new SWRCache<string>({ ttlMs: 1000 })
    const fetcher = vi.fn().mockResolvedValue('data')

    const [first, second] = await Promise.all([
      cache.fetch('k', fetcher),
      cache.fetch('k', fetcher),
    ])

    expect(first).toBe('data')
    expect(second).toBe('data')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('should force refresh when requested', async () => {
    const cache = new SWRCache<number>({ ttlMs: 1000 })
    const fetcher = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2)

    await cache.fetch('force', fetcher)
    const firstState = cache.get('force')
    expect(firstState.entry?.data).toBe(1)

    const refreshed = await cache.fetch('force', fetcher, { forceRefresh: true })
    expect(refreshed).toBe(2)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('should clear all entries', async () => {
    const cache = new SWRCache<string>({ ttlMs: 1000 })
    const fetcher = vi.fn().mockResolvedValue('value')

    await cache.fetch('a', fetcher)
    cache.clear()

    expect(cache.get('a').state).toBe('miss')
  })

  it('should treat entries past staleWhileRevalidate window as miss', () => {
    vi.useFakeTimers()
    const cache = new SWRCache<string>({ ttlMs: 50, staleWhileRevalidateMs: 50 })
    cache.set('window', 'value')

    vi.advanceTimersByTime(120)

    expect(cache.get('window').state).toBe('miss')
  })
})
