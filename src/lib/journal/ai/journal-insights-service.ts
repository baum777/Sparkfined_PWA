/**
 * Journal AI Insights — Service (Loop J3-A)
 * 
 * Orchestrates AI-powered behavioral pattern detection.
 * Uses existing AI client abstraction (OpenAI/Grok).
 */

import type { JournalEntry } from '@/types/journal'
import type {
  JournalInsight,
  JournalInsightResult,
  JournalInsightLimitMetadata,
} from '@/types/journalInsights'
import { buildJournalInsightsPrompt, type JournalInsightPromptInput } from './journal-insights-prompt'

// Re-use existing AI client infrastructure
import { OpenAIClient } from '@/ai/backend/clients/openai_client'

const JOURNAL_INSIGHTS_PROMPT_VERSION = 'journal-insights-v1.0'
const DEFAULT_MAX_ENTRIES = 20
const MAX_ENTRIES_HARD_CAP = 50
const MAX_TOKENS_LIMIT = 1500

export interface JournalInsightRequest {
  entries: JournalEntry[]
  maxEntries?: number
  focusCategories?: string[]
  model?: string // Optional: override default model
  maxTokens?: number // Optional: override default token limit
}

export interface JournalInsightError {
  error: string
  rawResponse?: unknown
}

/**
 * Generate AI-powered insights for a collection of journal entries.
 * 
 * @param request - Journal entries and configuration
 * @returns Structured insights or empty array on error
 */
export async function getJournalInsightsForEntries(
  request: JournalInsightRequest
): Promise<JournalInsightResult> {
  const requestedMaxEntries = request.maxEntries ?? DEFAULT_MAX_ENTRIES
  const requestedMaxTokens = request.maxTokens ?? MAX_TOKENS_LIMIT
  const cappedMaxEntries = Math.min(requestedMaxEntries, MAX_ENTRIES_HARD_CAP)
  const effectiveMaxTokens = Math.min(requestedMaxTokens, MAX_TOKENS_LIMIT)
  const entriesForAnalysis = request.entries.slice(-cappedMaxEntries)
  const requestedEntryWindow = Math.min(request.entries.length, requestedMaxEntries)
  const entryCapApplied = requestedEntryWindow > cappedMaxEntries
  const tokenCapApplied = requestedMaxTokens > MAX_TOKENS_LIMIT
  const model = request.model ?? 'gpt-4o-mini'
  const limits: JournalInsightLimitMetadata = {
    entryCap: MAX_ENTRIES_HARD_CAP,
    requestedMaxEntries,
    effectiveEntries: entriesForAnalysis.length,
    maxTokens: effectiveMaxTokens,
    entryCapApplied,
    tokenCapApplied,
  }

  if (entriesForAnalysis.length === 0) {
    return {
      insights: [],
      generatedAt: Date.now(),
      modelUsed: model,
      promptVersion: JOURNAL_INSIGHTS_PROMPT_VERSION,
      limits,
    }
  }

  // 1. Build prompt
  const promptInput: JournalInsightPromptInput = {
    entries: entriesForAnalysis,
    maxEntries: cappedMaxEntries,
    focusCategories: request.focusCategories,
  }
  const { system, user } = buildJournalInsightsPrompt(promptInput)

  // 2. Call AI (using existing OpenAI client)
  let aiResponse: string
  let modelUsed = model
  let costUsd: number | undefined

  try {
    const client = new OpenAIClient({
      model,
      maxTokens: effectiveMaxTokens, // Insights need more tokens than bullets, but stay capped
      temperature: 0.3, // Slightly higher for creative pattern recognition
    })

    // Note: OpenAIClient.analyzeMarket expects MarketPayload, which we don't have.
    // We need to call the OpenAI API directly using the client's internal fetch.
    // For now, let's create a minimal wrapper that uses the fetch pattern.
    const response = await callOpenAIDirectly(client, system, user, {
      model,
      maxTokens: effectiveMaxTokens,
    })
    aiResponse = response.text
    modelUsed = response.model
    costUsd = response.costUsd
  } catch (error) {
    console.error('[JournalInsights] AI call failed:', error)
    return {
      insights: [],
      generatedAt: Date.now(),
      modelUsed,
      promptVersion: JOURNAL_INSIGHTS_PROMPT_VERSION,
      rawResponse: { error: error instanceof Error ? error.message : 'Unknown error' },
      limits,
    }
  }

  // 3. Parse AI response
  const insights = parseInsightsFromAI(aiResponse, entriesForAnalysis)

  // 4. Return result
  return {
    insights,
    generatedAt: Date.now(),
    modelUsed,
    promptVersion: JOURNAL_INSIGHTS_PROMPT_VERSION,
    costUsd,
    rawResponse: aiResponse,
    limits,
  }
}

/**
 * Direct OpenAI API call (reusing client infrastructure but with custom messages)
 */
async function callOpenAIDirectly(
  _client: OpenAIClient,
  system: string,
  user: string,
  options: { model: string; maxTokens: number }
): Promise<{ text: string; model: string; costUsd?: number }> {
  // Access private fields via type casting (not ideal, but avoids duplicate fetch logic)
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const { model, maxTokens } = options
  const endpoint = 'https://api.openai.com/v1/chat/completions'

  const body = {
    model,
    temperature: 0.3,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: { type: 'json_object' },
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error ${response.status}: ${errorText}`)
  }

  const json = await response.json()
  const text = json?.choices?.[0]?.message?.content ?? ''
  const usage = json?.usage

  // Estimate cost (same logic as openai_client.ts)
  let costUsd: number | undefined
  if (usage?.prompt_tokens && usage?.completion_tokens) {
    const inTok = usage.prompt_tokens
    const outTok = usage.completion_tokens
    const isMini = /mini|small/i.test(model)
    const price = isMini
      ? { in: 0.00015, out: 0.0006 }
      : { in: 0.005, out: 0.015 }
    costUsd = (inTok / 1000) * price.in + (outTok / 1000) * price.out
  }

  return { text, model, costUsd }
}

/**
 * Parse AI JSON response into structured JournalInsight objects.
 * Defensive: handle invalid JSON, missing fields, etc.
 */
function parseInsightsFromAI(
  rawResponse: string,
  entries: JournalEntry[]
): JournalInsight[] {
  // 1. Try to parse JSON
  let parsed: { insights?: unknown[] }
  try {
    parsed = JSON.parse(rawResponse)
  } catch (error) {
    console.error('[JournalInsights] Invalid JSON from AI:', error)
    return []
  }

  // 2. Validate structure
  if (!parsed.insights || !Array.isArray(parsed.insights)) {
    console.error('[JournalInsights] AI response missing "insights" array')
    return []
  }

  // 3. Map to JournalInsight objects
  const validInsights: JournalInsight[] = []
  const entryIds = new Set(entries.map((e) => e.id))

  for (const item of parsed.insights) {
    if (!item || typeof item !== 'object') {
      continue // Skip invalid items
    }

    const insight = item as Record<string, unknown>

    // Validate required fields
    const category = insight.category
    const severity = insight.severity
    const title = insight.title
    const summary = insight.summary
    const recommendation = insight.recommendation
    const evidenceEntries = insight.evidenceEntries

    if (
      typeof category !== 'string' ||
      typeof severity !== 'string' ||
      typeof title !== 'string' ||
      typeof summary !== 'string' ||
      typeof recommendation !== 'string' ||
      !Array.isArray(evidenceEntries)
    ) {
      console.warn('[JournalInsights] Skipping invalid insight:', insight)
      continue
    }

    // Validate category and severity
    const validCategories = ['BEHAVIOR_LOOP', 'TIMING', 'RISK_MANAGEMENT', 'SETUP_DISCIPLINE', 'EMOTIONAL_PATTERN', 'OTHER']
    const validSeverities = ['INFO', 'WARNING', 'CRITICAL']

    if (!validCategories.includes(category) || !validSeverities.includes(severity)) {
      console.warn('[JournalInsights] Invalid category/severity:', { category, severity })
      continue
    }

    // Filter evidence entries (only keep valid entry IDs)
    const filteredEvidence = evidenceEntries
      .filter((id): id is string => typeof id === 'string' && entryIds.has(id))

    if (filteredEvidence.length === 0) {
      console.warn('[JournalInsights] Skipping insight with no valid evidence entries:', insight)
      continue
    }

    // Generate stable ID (hash of category + title)
    const id = generateInsightId(category, title)

    validInsights.push({
      id,
      category: category as JournalInsight['category'],
      severity: severity as JournalInsight['severity'],
      title,
      summary,
      recommendation,
      evidenceEntries: filteredEvidence,
      confidence: typeof insight.confidence === 'number' ? insight.confidence : undefined,
      detectedAt: Date.now(),
    })
  }

  return validInsights
}

/**
 * Generate a stable insight ID from category and title.
 * Simple hash function for deterministic IDs.
 */
function generateInsightId(category: string, title: string): string {
  const input = `${category}:${title}`
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `insight-${Math.abs(hash).toString(36)}`
}
