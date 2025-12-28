import { AICacheKeyInput } from './aiCacheTypes'

const DEFAULT_TTL_MS = 5 * 60 * 1000

function normalizeNumber(input?: number | string): number | undefined {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : undefined
  }

  if (typeof input === 'string') {
    const parsed = Number(input)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

function normalizeCacheKeyInput(input: AICacheKeyInput) {
  return {
    provider: input.provider.trim(),
    model: input.model.trim(),
    systemPrompt: input.systemPrompt?.trim() ?? '',
    userPrompt: input.userPrompt.trim(),
    temperature: normalizeNumber(input.temperature) ?? 1,
    topP: normalizeNumber(input.topP) ?? 1,
  }
}

function stableHash(value: string): string {
  let h1 = 0xdeadbeef ^ value.length
  let h2 = 0x41c6ce57 ^ value.length

  for (let i = 0; i < value.length; i += 1) {
    const ch = value.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)

  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)
}

function readEnvValue(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key]
  }

  if (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.[key]) {
    return (import.meta as { env?: Record<string, string> }).env?.[key]
  }

  return undefined
}

export function buildAICacheKey(input: AICacheKeyInput): string {
  const normalized = normalizeCacheKeyInput(input)
  const serialized = JSON.stringify(normalized)
  const hash = stableHash(serialized)

  return `ai:${normalized.provider}:${normalized.model}:${hash}`
}

export function getModelId(provider: string, model: string): string {
  return `${provider}:${model}`
}

export function getDefaultAICacheTTL(): number {
  const ttlMs = normalizeNumber(readEnvValue('AI_CACHE_TTL_MS'))
  if (typeof ttlMs === 'number') {
    return ttlMs
  }

  const ttlSeconds = normalizeNumber(readEnvValue('AI_CACHE_TTL_SECONDS'))
  if (typeof ttlSeconds === 'number') {
    return ttlSeconds * 1000
  }

  return DEFAULT_TTL_MS
}
