/**
 * AI Teaser Adapter
 *
 * Orchestrates AI-powered analysis from multiple providers:
 * - none → Heuristic Fallback
 * - openai → GPT-4o-mini Vision
 * - grok → Grok Vision
 * - anthropic → Claude 4.5 Reasoning (Text)
 *
 * DoD: Response < 2s, UI non-blocking
 */

import type {
  AITeaserAnalysis,
  OCRResult,
  DexscreenerTokenData,
  PumpfunTokenData,
  HeuristicAnalysis,
} from '@/types/analysis'
import { calculateHeuristic, heuristicToTeaser } from '@/lib/analysis/heuristicEngine'

export type AIProvider = 'none' | 'openai' | 'grok' | 'anthropic'

export interface TeaserPayload {
  imageDataUrl?: string
  ocrData?: OCRResult
  dexData?: DexscreenerTokenData
  pumpfunData?: PumpfunTokenData
  contractAddress?: string
  heuristic?: HeuristicAnalysis
}

const AI_PROVIDER = (import.meta.env.ANALYSIS_AI_PROVIDER || 'none') as AIProvider
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY || ''
const GROK_API_KEY = import.meta.env.GROK_API_KEY || ''
const ANTHROPIC_API_KEY = import.meta.env.ANTHROPIC_API_KEY || ''

/**
 * Main entry point for AI teaser analysis
 */
export async function getTeaserAnalysis(
  payload: TeaserPayload,
  provider: AIProvider = AI_PROVIDER
): Promise<AITeaserAnalysis> {
  const startTime = performance.now()

  try {
    let result: AITeaserAnalysis

    switch (provider) {
      case 'openai':
        result = await getOpenAITeaser(payload)
        break
      case 'grok':
        result = await getGrokTeaser(payload)
        break
      case 'anthropic':
        result = await getClaudeTeaser(payload)
        break
      case 'none':
      default:
        result = await getHeuristicTeaser(payload)
        break
    }

    result.processingTime = performance.now() - startTime
    return result
  } catch (error) {
    console.error('AI Teaser failed, falling back to heuristic:', error)
    // Always fallback to heuristic on error
    return getHeuristicTeaser(payload)
  }
}

/**
 * Heuristic fallback (no external API)
 */
async function getHeuristicTeaser(payload: TeaserPayload): Promise<AITeaserAnalysis> {
  const startTime = performance.now()

  // Use provided heuristic or calculate new one
  let heuristic: HeuristicAnalysis

  if (payload.heuristic) {
    heuristic = payload.heuristic
  } else if (payload.dexData) {
    heuristic = calculateHeuristic({
      price: payload.dexData.price,
      high24: payload.dexData.high24,
      low24: payload.dexData.low24,
      vol24: payload.dexData.vol24,
      ocrData: payload.ocrData,
    })
  } else {
    // Minimal fallback
    heuristic = calculateHeuristic({
      price: 0.000042,
      ocrData: payload.ocrData,
    })
  }

  const teaser = heuristicToTeaser(heuristic)
  teaser.processingTime = performance.now() - startTime

  return teaser
}

/**
 * OpenAI GPT-4o-mini Vision analysis
 */
async function getOpenAITeaser(payload: TeaserPayload): Promise<AITeaserAnalysis> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const systemPrompt = buildSystemPrompt(payload)
  const userPrompt = buildUserPrompt(payload)

  const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }]

  // Add image if available
  if (payload.imageDataUrl) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: userPrompt },
        { type: 'image_url', image_url: { url: payload.imageDataUrl } },
      ],
    })
  } else {
    messages.push({ role: 'user', content: userPrompt })
  }

  const response = await callChatCompletion(
    {
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    },
    {
      apiKey: OPENAI_API_KEY,
    }
  )

  const content = response.choices?.[0]?.message?.content ?? '{}'
  return parseAIResponse(content, 'openai')
}

/**
 * Grok Vision analysis
 */
async function getGrokTeaser(payload: TeaserPayload): Promise<AITeaserAnalysis> {
  if (!GROK_API_KEY) {
    throw new Error('Grok API key not configured')
  }

  const systemPrompt = buildSystemPrompt(payload)
  const userPrompt = buildUserPrompt(payload)

  const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }]

  // Add image if available
  if (payload.imageDataUrl) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: userPrompt },
        { type: 'image_url', image_url: { url: payload.imageDataUrl } },
      ],
    })
  } else {
    messages.push({ role: 'user', content: userPrompt })
  }

  const response = await callChatCompletion(
    {
      model: 'grok-vision-beta',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    },
    {
      apiKey: GROK_API_KEY,
      baseUrl: 'https://api.x.ai/v1',
    }
  )

  const content = response.choices?.[0]?.message?.content ?? '{}'
  return parseAIResponse(content, 'grok')
}

/**
 * Anthropic Claude 4.5 analysis (Text only - Vision limited)
 */
async function getClaudeTeaser(payload: TeaserPayload): Promise<AITeaserAnalysis> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  const systemPrompt = buildSystemPrompt(payload)
  const userPrompt = buildUserPrompt(payload)

  // Note: Using fetch for Anthropic API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.content?.[0]?.text || '{}'

  return parseAIResponse(content, 'anthropic')
}

/**
 * Build system prompt for AI models
 */
function buildSystemPrompt(_payload: TeaserPayload): string {
  return `You are an expert crypto trading analyst specializing in Solana tokens.
Your task is to analyze chart images and market data to provide actionable trading insights.

Output MUST be valid JSON with this exact structure:
{
  "sr_levels": [{"label": "S1", "price": 0.000042, "type": "support"}],
  "stop_loss": 0.00004,
  "tp": [0.000044, 0.000046],
  "indicators": ["RSI: 65", "Bollinger: Middle"],
  "teaser_text": "Brief analysis summary (2-3 sentences)",
  "confidence": 0.75
}

Focus on:
- Support/Resistance levels (S1, S2, R1, R2)
- Stop loss placement
- Take profit targets (2 levels)
- Key technical indicators
- Brief trading recommendation

Be concise and actionable. This is a quick preview, not a full report.`
}

/**
 * Build user prompt with context data
 */
function buildUserPrompt(payload: TeaserPayload): string {
  let prompt = 'Analyze this trading chart and provide technical analysis.\n\n'

  if (payload.dexData) {
    prompt += `Current Price: $${payload.dexData.price}\n`
    prompt += `24h High: $${payload.dexData.high24}\n`
    prompt += `24h Low: $${payload.dexData.low24}\n`
    prompt += `24h Volume: $${payload.dexData.vol24}\n\n`
  }

  if (payload.ocrData && payload.ocrData.labels.length > 0) {
    prompt += `Detected indicators: ${payload.ocrData.labels.join(', ')}\n`
    if (payload.ocrData.indicators.rsi) {
      prompt += `RSI: ${payload.ocrData.indicators.rsi}\n`
    }
    prompt += '\n'
  }

  if (payload.pumpfunData) {
    prompt += `Token: ${payload.pumpfunData.symbol}\n`
    prompt += `Liquidity: $${payload.pumpfunData.liquidity}\n\n`
  }

  prompt += 'Provide your analysis in the specified JSON format.'

  return prompt
}

/**
 * Parse AI response to AITeaserAnalysis format
 */
function parseAIResponse(content: string, provider: AIProvider): AITeaserAnalysis {
  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
    const jsonStr = jsonMatch?.[1] ?? content

    const parsed = JSON.parse(jsonStr)

    return {
      sr_levels: parsed.sr_levels || [],
      stop_loss: parsed.stop_loss || 0,
      tp: parsed.tp || [],
      indicators: parsed.indicators || [],
      teaser_text: parsed.teaser_text || 'Analysis generated',
      confidence: parsed.confidence || 0.5,
      processingTime: 0, // Will be set by caller
      provider: provider === 'none' ? 'heuristic' as const : provider,
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    // Return minimal valid response
    return {
      sr_levels: [],
      stop_loss: 0,
      tp: [],
      indicators: [],
      teaser_text: 'Unable to parse AI response',
      confidence: 0,
      processingTime: 0,
      provider: provider === 'none' ? 'heuristic' as const : provider,
    }
  }
}

type ChatContentItem =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

type ChatMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string | ChatContentItem[] }

interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  response_format?: { type: 'json_object' | string }
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

async function callChatCompletion(request: ChatCompletionRequest, options: { apiKey: string; baseUrl?: string }) {
  const baseUrl = options.baseUrl ?? 'https://api.openai.com/v1'
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorText = await safeReadText(response)
    throw new Error(`AI provider error (${response.status}): ${errorText}`)
  }

  return (await response.json()) as ChatCompletionResponse
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text()
  } catch {
    return '<unreadable response>'
  }
}
