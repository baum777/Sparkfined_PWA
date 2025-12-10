export type SWRState = 'fresh' | 'stale' | 'miss'

export interface SWRCacheOptions {
  ttlMs: number
  staleWhileRevalidateMs?: number
}

export interface SWRCacheEntry<T> {
  data: T
  updatedAt: number
  isRevalidating?: boolean
}

export class SWRCache<T> {
  private cache = new Map<string, SWRCacheEntry<T>>()
  private inflight = new Map<string, Promise<T>>()
  private ttlMs: number
  private staleWhileRevalidateMs: number

  constructor(options: SWRCacheOptions) {
    this.ttlMs = options.ttlMs
    this.staleWhileRevalidateMs = options.staleWhileRevalidateMs ?? 0
  }

  get(key: string): { state: SWRState; entry?: SWRCacheEntry<T> } {
    const entry = this.cache.get(key)
    if (!entry) {
      return { state: 'miss' }
    }

    const now = Date.now()
    const age = now - entry.updatedAt
    const maxAge = this.ttlMs + this.staleWhileRevalidateMs

    if (this.staleWhileRevalidateMs > 0 && age > maxAge) {
      return { state: 'miss' }
    }

    if (age <= this.ttlMs) {
      return { state: 'fresh', entry }
    }

    return { state: 'stale', entry }
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      updatedAt: Date.now(),
      isRevalidating: false,
    })
  }

  async fetch(
    key: string,
    fetcher: () => Promise<T>,
    opts?: { forceRefresh?: boolean }
  ): Promise<T> {
    if (opts?.forceRefresh) {
      this.invalidate(key)
      return this.startFetch(key, fetcher)
    }

    const { state, entry } = this.get(key)

    if (state === 'fresh' && entry) {
      return entry.data
    }

    if (state === 'stale' && entry) {
      if (!this.inflight.has(key)) {
        void this.startFetch(key, fetcher)
      }
      return entry.data
    }

    return this.startFetch(key, fetcher)
  }

  invalidate(key: string): void {
    this.cache.delete(key)
    this.inflight.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.inflight.clear()
  }

  private startFetch(key: string, fetcher: () => Promise<T>): Promise<T> {
    const existing = this.inflight.get(key)
    if (existing) {
      return existing
    }

    const currentEntry = this.cache.get(key)
    if (currentEntry) {
      this.cache.set(key, { ...currentEntry, isRevalidating: true })
    }

    const promise = fetcher()
      .then((data) => {
        this.set(key, data)
        return data
      })
      .finally(() => {
        this.inflight.delete(key)
        const entry = this.cache.get(key)
        if (entry) {
          entry.isRevalidating = false
        }
      })

    this.inflight.set(key, promise)
    return promise
  }
}
