import { error as logError } from '../../logger'
import { AICacheEntry } from './aiCacheTypes'

export interface AICacheStore {
  get(key: string): Promise<AICacheEntry | null>
  set(key: string, entry: AICacheEntry): Promise<void>
  del(key: string): Promise<void>
  delByModel?(modelId: string): Promise<void>
}

export function createInMemoryAICacheStore(): AICacheStore {
  const store = new Map<string, AICacheEntry>()

  return {
    async get(key) {
      return store.get(key) ?? null
    },
    async set(key, entry) {
      store.set(key, entry)
    },
    async del(key) {
      store.delete(key)
    },
    async delByModel(modelId) {
      try {
        for (const [key, entry] of store.entries()) {
          if (entry.modelId === modelId) {
            store.delete(key)
          }
        }
      } catch (err) {
        logError('Failed to delete AI cache entries by model', err)
      }
    },
  }
}
