import { error as logError } from '../../logger'
import { AICacheStore, createInMemoryAICacheStore } from './aiCacheStore'
import { AICacheEntry, AICacheGetResult } from './aiCacheTypes'

let cacheStore: AICacheStore = createInMemoryAICacheStore()

function isEntryExpired(entry: AICacheEntry): boolean {
  return entry.createdAt + entry.ttlMs <= Date.now()
}

export function setAICacheStore(store: AICacheStore): void {
  cacheStore = store
}

export function getAICacheStore(): AICacheStore {
  return cacheStore
}

export async function getCachedAIResponse(key: string): Promise<AICacheGetResult> {
  try {
    const entry = await cacheStore.get(key)

    if (!entry) {
      return { hit: false }
    }

    if (isEntryExpired(entry)) {
      await cacheStore.del(key).catch((err) => logError('Failed to delete expired AI cache entry', err))
      return { hit: false }
    }

    return { hit: true, entry }
  } catch (err) {
    logError('Failed to read AI cache', err)
    return { hit: false }
  }
}

export async function setCachedAIResponse(key: string, entry: Omit<AICacheEntry, 'key'>): Promise<void> {
  try {
    await cacheStore.set(key, { ...entry, key })
  } catch (err) {
    logError('Failed to write AI cache', err)
  }
}

export async function invalidateAIResponse(key: string): Promise<void> {
  try {
    await cacheStore.del(key)
  } catch (err) {
    logError('Failed to invalidate AI cache entry', err)
  }
}

export async function invalidateAIResponsesByModel(modelId: string): Promise<void> {
  try {
    if (typeof cacheStore.delByModel === 'function') {
      await cacheStore.delByModel(modelId)
    }
  } catch (err) {
    logError('Failed to invalidate AI cache entries by model', err)
  }
}
