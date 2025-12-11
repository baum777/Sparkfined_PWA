export interface AICacheEntry {
  response: unknown
  createdAt: number
  ttlMs: number
  modelId: string
  key: string
}

export interface AICacheGetResult {
  hit: boolean
  entry?: AICacheEntry
}

export interface AICacheKeyInput {
  provider: string
  model: string
  systemPrompt?: string
  userPrompt: string
  temperature?: number
  topP?: number
}
