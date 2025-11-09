/**
 * BLOCK 3: Grok X-Timeline Context Fetcher
 * 
 * Fetches token lore/hype from X/Twitter using Grok API
 * Returns 30 tweets (10 oldest + 10 newest + 10 top) + extracted essence
 * 
 * Setup:
 * - Requires XAI_API_KEY (Grok API key from x.ai)
 * - Auto-called when marking temp entry as "active" (if enabled in settings)
 * 
 * Example request:
 * POST /api/ai/grok-context
 * {
 *   "ticker": "BONK",
 *   "address": "DezXAZ8z...",
 *   "timestamp": 1699200000000
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "lore": "Bonk is a community-driven memecoin...",
 *     "sentiment": "bullish",
 *     "keyTweets": [...]
 *   }
 * }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = { runtime: 'edge' }

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

// Types
interface GrokContextRequest {
  ticker: string
  address: string
  timestamp: number
}

interface GrokTweet {
  author: string
  text: string
  url: string
  timestamp: number
  likes?: number
  retweets?: number
}

interface GrokContextResponse {
  success: boolean
  data?: {
    lore: string
    sentiment: 'bullish' | 'bearish' | 'neutral'
    keyTweets: GrokTweet[]
    fetchedAt: number
  }
  error?: string
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const XAI_API_KEY = process.env.XAI_API_KEY || ''
const XAI_BASE_URL = process.env.XAI_BASE_URL || 'https://api.x.ai/v1'

// Twitter/X search parameters
const TWEET_LOOKBACK_HOURS = 48 // Search tweets from last 48h
const TWEETS_PER_CATEGORY = 10 // 10 oldest + 10 newest + 10 top = 30 total

// ============================================================================
// GROK API CLIENT
// ============================================================================

/**
 * Search X/Twitter for token-related tweets using Grok
 * Note: This is a simplified implementation - actual X API integration
 * would require Twitter API credentials and more complex auth
 */
async function searchTwitterViaGrok(
  ticker: string,
  address: string,
  timestamp: number
): Promise<GrokTweet[]> {
  if (!XAI_API_KEY) {
    console.error('[Grok] XAI_API_KEY not configured')
    return []
  }

  try {
    // Calculate search time window (±24h around timestamp)
    const startTime = new Date(timestamp - 24 * 60 * 60 * 1000).toISOString()
    const endTime = new Date(timestamp + 24 * 60 * 60 * 1000).toISOString()

    // Build search query
    const query = `(${ticker} OR $${ticker} OR ${address.slice(0, 8)}) 
                   -is:retweet 
                   lang:en`

    // Call Grok API to fetch tweets
    // Note: This is a placeholder - actual implementation depends on X API access
    const tweets = await fetchTweetsFromXAPI(query, startTime, endTime)

    return tweets
  } catch (error) {
    console.error('[Grok] Twitter search failed:', error)
    return []
  }
}

/**
 * Fetch tweets from X API (placeholder implementation)
 * In production, this would use Twitter API v2 with proper authentication
 */
async function fetchTweetsFromXAPI(
  query: string,
  startTime: string,
  endTime: string
): Promise<GrokTweet[]> {
  // PLACEHOLDER: Actual implementation requires Twitter API credentials
  // For now, return mock data for development
  
  const mockTweets: GrokTweet[] = [
    {
      author: '@crypto_analyst',
      text: `${query.split(' ')[0]} showing strong community support. Chart looks bullish! 🚀`,
      url: 'https://x.com/crypto_analyst/status/123',
      timestamp: new Date(startTime).getTime(),
      likes: 150,
      retweets: 45,
    },
    {
      author: '@degen_trader',
      text: `Just aped into ${query.split(' ')[0]}. This could be the next 100x. DYOR!`,
      url: 'https://x.com/degen_trader/status/124',
      timestamp: new Date(startTime).getTime() + 3600000,
      likes: 89,
      retweets: 23,
    },
    // ... would fetch real tweets here
  ]

  return mockTweets
}

/**
 * Extract lore/essence from tweets using Grok LLM
 */
async function extractLoreWithGrok(tweets: GrokTweet[], ticker: string): Promise<{
  lore: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
}> {
  if (tweets.length === 0) {
    return {
      lore: 'Insufficient data to determine token lore.',
      sentiment: 'neutral',
    }
  }

  try {
    // Prepare prompt for Grok
    const tweetTexts = tweets.map((t, i) => `${i + 1}. @${t.author}: ${t.text}`).join('\n')
    
    const prompt = `Analyze these tweets about ${ticker} and provide:
1. A concise summary (2-3 sentences) of the token's lore, concept, and hype
2. Overall sentiment (bullish/bearish/neutral)

Tweets:
${tweetTexts}

Format your response as JSON:
{
  "lore": "...",
  "sentiment": "bullish|bearish|neutral"
}`

    // Call Grok API (GPT-4 compatible endpoint)
    const response = await fetch(`${XAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a crypto analyst extracting key insights from social media.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(15000), // 15s timeout
    })

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '{}'

    // Parse JSON response
    const parsed = JSON.parse(content)

    return {
      lore: parsed.lore || 'Unable to extract lore.',
      sentiment: parsed.sentiment || 'neutral',
    }
  } catch (error) {
    console.error('[Grok] Lore extraction failed:', error)
    
    // Fallback: Simple sentiment analysis based on keywords
    const positiveKeywords = ['moon', 'bullish', 'pump', 'rocket', 'gem', 'alpha']
    const negativeKeywords = ['dump', 'rug', 'scam', 'bearish', 'dead', 'rekt']
    
    const allText = tweets.map(t => t.text.toLowerCase()).join(' ')
    const positiveCount = positiveKeywords.filter(kw => allText.includes(kw)).length
    const negativeCount = negativeKeywords.filter(kw => allText.includes(kw)).length
    
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (positiveCount > negativeCount + 2) sentiment = 'bullish'
    if (negativeCount > positiveCount + 2) sentiment = 'bearish'

    return {
      lore: `Community discussing ${ticker}. ${tweets.length} tweets analyzed.`,
      sentiment,
    }
  }
}

/**
 * Categorize and select tweets (10 oldest + 10 newest + 10 top)
 */
function selectKeyTweets(tweets: GrokTweet[]): GrokTweet[] {
  if (tweets.length === 0) return []

  // Sort by timestamp
  const sorted = [...tweets].sort((a, b) => a.timestamp - b.timestamp)

  // 10 oldest
  const oldest = sorted.slice(0, Math.min(10, sorted.length))

  // 10 newest
  const newest = sorted.slice(-Math.min(10, sorted.length)).reverse()

  // 10 top (by engagement: likes + retweets)
  const byEngagement = [...tweets].sort((a, b) => {
    const aScore = (a.likes || 0) + (a.retweets || 0)
    const bScore = (b.likes || 0) + (b.retweets || 0)
    return bScore - aScore
  })
  const top = byEngagement.slice(0, Math.min(10, tweets.length))

  // Combine and dedupe (use Set by URL)
  const combined = new Map<string, GrokTweet>()
  oldest.forEach(t => combined.set(t.url, t))
  newest.forEach(t => combined.set(t.url, t))
  top.forEach(t => combined.set(t.url, t))

  return Array.from(combined.values())
}

// ============================================================================
// HTTP HANDLER
// ============================================================================

export default async function handler(req: Request): Promise<Response> {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
      }),
      {
        status: 405,
        headers: JSON_HEADERS,
      }
    )
  }

  const authError = ensureAiProxyAuthorized(req)
  if (authError) return authError

  try {
    // Parse request body
    const body: GrokContextRequest = await req.json()
    const { ticker, address, timestamp } = body

    if (!ticker || !address) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: ticker, address',
        }),
        {
          status: 400,
          headers: JSON_HEADERS,
        }
      )
    }

    console.log('[Grok] Fetching context for:', { ticker, address })

    // Search Twitter for tweets
    const allTweets = await searchTwitterViaGrok(ticker, address, timestamp)

    // Select key tweets (10 oldest + 10 newest + 10 top)
    const keyTweets = selectKeyTweets(allTweets)

    console.log(`[Grok] Found ${allTweets.length} tweets, selected ${keyTweets.length} key tweets`)

    // Extract lore using Grok
    const { lore, sentiment } = await extractLoreWithGrok(keyTweets, ticker)

    const response: GrokContextResponse = {
      success: true,
      data: {
        lore,
        sentiment,
        keyTweets,
        fetchedAt: Date.now(),
      },
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: JSON_HEADERS,
    })
  } catch (error) {
    console.error('[Grok] Error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: JSON_HEADERS,
      }
    )
  }
}

function ensureAiProxyAuthorized(req: Request): Response | null {
  const secret = process.env.AI_PROXY_SECRET?.trim()
  const env = process.env.NODE_ENV ?? 'production'
  const isProd = env === 'production'

  if (!secret) {
    if (!isProd) {
      console.warn('[ai/grok-context] AI_PROXY_SECRET not set – allowing request in non-production environment')
      return null
    }
    console.error('[ai/grok-context] AI_PROXY_SECRET missing – blocking AI proxy request')
    return new Response(
      JSON.stringify({
        success: false,
        error: 'AI proxy disabled',
      }),
      {
        status: 503,
        headers: JSON_HEADERS,
      }
    )
  }

  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized',
      }),
      {
        status: 401,
        headers: JSON_HEADERS,
      }
    )
  }

  const [scheme, token] = authHeader.split(' ')
  if (!token || scheme.toLowerCase() !== 'bearer') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized',
      }),
      {
        status: 401,
        headers: JSON_HEADERS,
      }
    )
  }

  if (token.trim() !== secret) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized',
      }),
      {
        status: 403,
        headers: JSON_HEADERS,
      }
    )
  }

  return null
}
