import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getCachedAIResponse, invalidateAIResponse, setAICacheStore, setCachedAIResponse } from '../aiCache'
import { buildAICacheKey, getDefaultAICacheTTL, getModelId } from '../aiCacheKey'
import { createInMemoryAICacheStore } from '../aiCacheStore'

const baseEntry = {
  response: { message: 'hello' },
  createdAt: Date.now(),
  ttlMs: 1_000,
  modelId: 'openai:gpt-4.1',
}

const baseKeyInput = {
  provider: 'openai',
  model: 'gpt-4.1',
  userPrompt: 'Hello world',
  systemPrompt: 'You are helpful',
  temperature: 0.1,
  topP: 0.9,
}

const envKeys = ['AI_CACHE_TTL_MS', 'AI_CACHE_TTL_SECONDS'] as const

describe('AI Cache', () => {
  beforeEach(() => {
    setAICacheStore(createInMemoryAICacheStore())
  })

  afterEach(() => {
    envKeys.forEach((key) => {
      delete process.env[key]
    })
  })

  it('returns cache miss when no entry is stored', async () => {
    const result = await getCachedAIResponse('missing')

    expect(result.hit).toBe(false)
    expect(result.entry).toBeUndefined()
  })

  it('stores and retrieves an entry', async () => {
    await setCachedAIResponse('key-1', baseEntry)

    const result = await getCachedAIResponse('key-1')

    expect(result.hit).toBe(true)
    expect(result.entry?.response).toEqual(baseEntry.response)
    expect(result.entry?.modelId).toBe(baseEntry.modelId)
    expect(result.entry?.key).toBe('key-1')
  })

  it('invalidates a cached entry', async () => {
    await setCachedAIResponse('key-2', baseEntry)

    await invalidateAIResponse('key-2')

    const result = await getCachedAIResponse('key-2')

    expect(result.hit).toBe(false)
    expect(result.entry).toBeUndefined()
  })

  it('treats expired entries as cache miss', async () => {
    const expiredEntry = {
      ...baseEntry,
      createdAt: Date.now() - 5_000,
      ttlMs: 1_000,
    }

    await setCachedAIResponse('key-3', expiredEntry)

    const result = await getCachedAIResponse('key-3')

    expect(result.hit).toBe(false)
    expect(result.entry).toBeUndefined()
  })

  it('builds deterministic cache keys', () => {
    const keyA = buildAICacheKey(baseKeyInput)
    const keyB = buildAICacheKey({ ...baseKeyInput })

    expect(keyA).toBe(keyB)
    expect(keyA.startsWith('ai:openai:gpt-4.1:')).toBe(true)
  })

  it('changes cache keys when prompts or params differ', () => {
    const baseKey = buildAICacheKey(baseKeyInput)
    const differentPrompt = buildAICacheKey({ ...baseKeyInput, userPrompt: 'Hi there' })
    const differentTemperature = buildAICacheKey({ ...baseKeyInput, temperature: 0.5 })

    expect(differentPrompt).not.toBe(baseKey)
    expect(differentTemperature).not.toBe(baseKey)
  })

  it('builds model identifiers', () => {
    expect(getModelId('openai', 'gpt-4')).toBe('openai:gpt-4')
  })

  it('returns default TTL when env is not set', () => {
    expect(getDefaultAICacheTTL()).toBe(5 * 60 * 1000)
  })

  it('prefers millisecond TTL env override', () => {
    process.env.AI_CACHE_TTL_MS = '120000'

    expect(getDefaultAICacheTTL()).toBe(120_000)
  })

  it('falls back to seconds TTL env override', () => {
    process.env.AI_CACHE_TTL_SECONDS = '30'

    expect(getDefaultAICacheTTL()).toBe(30_000)
  })
})
