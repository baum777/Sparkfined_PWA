/**
 * Oracle Edge Function
 * 
 * Daily meta-market intelligence endpoint that:
 * - Calls Grok 3x (Score, Theme, Alpha)
 * - Combines reports into structured response
 * - Returns { report, score, theme, timestamp, date }
 * 
 * Auth: Bearer token (ORACLE_CRON_SECRET)
 * Runtime: Edge
 * Cron: Daily at 09:00 UTC (configured in vercel.json)
 */

export const config = { runtime: 'edge' };

import type { OracleAPIResponse } from '../src/types/oracle';

// ===== Configuration =====

const XAI_API_KEY = process.env.XAI_API_KEY || '';
const XAI_BASE_URL = process.env.XAI_BASE_URL || 'https://api.x.ai/v1';
const ORACLE_CRON_SECRET = process.env.ORACLE_CRON_SECRET || '';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

// ===== Helper Functions =====

/**
 * JSON response helper
 */
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

/**
 * Call Grok API with a prompt
 */
async function callGrok(prompt: string, options?: {
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}): Promise<string> {
  const {
    temperature = 0.3,
    maxTokens = 1000,
    timeout = 30000,
  } = options || {};

  if (!XAI_API_KEY) {
    throw new Error('XAI_API_KEY not configured');
  }

  try {
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
            content: 'You are a crypto market analyst providing daily intelligence reports.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (!content) {
      throw new Error('Empty response from Grok API');
    }

    return content;
  } catch (error) {
    console.error('[Oracle] Grok API call failed:', error);
    throw error;
  }
}

// ===== Grok Prompts =====

const SCORE_PROMPT = `Analyze the current crypto market environment across 7 parameters:

1. **Liquidity**: DEX depth, slippage levels, available capital
2. **Volume**: 24h trading volume trends, velocity of capital
3. **Volatility**: ATR, Bollinger Band width, realized volatility
4. **Sentiment**: Fear & Greed Index, Crypto Twitter vibe, retail behavior
5. **Trend Strength**: Momentum indicators, breakout quality, follow-through
6. **Whale Activity**: Large wallet movements, accumulation/distribution patterns
7. **CEX Inflows**: Exchange net flows, funding rates

For each parameter, assign a rating:
- 0 = Extremely poor conditions
- 1 = Very unfavorable
- 2 = Unfavorable
- 3 = Neutral
- 4 = Favorable
- 5 = Very favorable
- 6 = Excellent
- 7 = Exceptional (rare)

Output format:
SCORE: X/7 (average of all 7 parameters, rounded to nearest integer)

BREAKDOWN:
1. Liquidity: X/7 - [1-2 sentence rationale]
2. Volume: X/7 - [1-2 sentence rationale]
3. Volatility: X/7 - [1-2 sentence rationale]
4. Sentiment: X/7 - [1-2 sentence rationale]
5. Trend Strength: X/7 - [1-2 sentence rationale]
6. Whale Activity: X/7 - [1-2 sentence rationale]
7. CEX Inflows: X/7 - [1-2 sentence rationale]

OVERALL CONTEXT: [2-3 sentences summarizing the market environment]`;

const THEME_PROMPT = `Based on current crypto market conditions, estimate the probability of a meta-shift towards each theme in the next 48 hours:

1. **Gaming**: Play-to-earn, gaming tokens (e.g., AXS, SAND, IMX)
2. **RWA**: Real-world assets, tokenized securities (e.g., ONDO, RIO)
3. **AI Agents**: Autonomous agents, AI-powered tokens (e.g., FET, AGIX)
4. **DePIN**: Decentralized physical infrastructure (e.g., HNT, RNDR)
5. **Privacy/ZK**: Zero-knowledge, privacy coins (e.g., ZK, ALEO)
6. **Collectibles/TCG**: NFTs, trading card games (e.g., BLUR, RARE)
7. **Stablecoin Yield**: Yield farms, stablecoin pairs (e.g., USDC/USDT farms)

Output format:
NEXT META PROBABILITIES:
- Gaming: XX%
- RWA: XX%
- AI Agents: XX%
- DePIN: XX%
- Privacy/ZK: XX%
- Collectibles/TCG: XX%
- Stablecoin Yield: XX%

TOP THEME: [Name of highest probability theme]

RATIONALE: [2-3 sentences explaining why this theme is most likely]`;

const ALPHA_PROMPT = `Identify 2-3 early-stage Solana contract addresses (CAs) showing signs of potential:

Criteria:
- Market cap < $5M
- Growing social momentum (Twitter mentions, Telegram activity)
- Recent liquidity additions
- Holder concentration changes (whales accumulating)
- No obvious rug signals (locked liquidity, verified contract)

Output format:
EARLY ALPHA CAs:

1. **[CA]** - [Ticker]
   - MCap: $XXk
   - Thesis: [1-2 sentence pitch]
   - Risk: [High/Medium/Low]

2. **[CA]** - [Ticker]
   - MCap: $XXk
   - Thesis: [1-2 sentence pitch]
   - Risk: [High/Medium/Low]

DISCLAIMER: All are high-risk speculative plays. DYOR.`;

// ===== Response Parsing =====

/**
 * Extract score from Grok response
 * Looks for "SCORE: X/7" pattern
 */
function extractScore(rawResponse: string): number {
  try {
    const match = rawResponse.match(/SCORE:\s*(\d+)\/7/i);
    if (match && match[1]) {
      const score = parseInt(match[1], 10);
      // Clamp to 0-7 range
      return Math.max(0, Math.min(7, score));
    }
  } catch (error) {
    console.error('[Oracle] Failed to extract score:', error);
  }

  // Default fallback: neutral score
  return 3;
}

/**
 * Extract top theme from Grok response
 * Looks for "TOP THEME: [theme]" pattern
 */
function extractTopTheme(rawResponse: string): string {
  try {
    const match = rawResponse.match(/TOP THEME:\s*(.+?)(?:\n|$)/i);
    if (match && match[1]) {
      return match[1].trim();
    }

    // Fallback: Parse probabilities and find highest
    const probabilities: Array<{ theme: string; prob: number }> = [];
    const lines = rawResponse.split('\n');

    for (const line of lines) {
      const probMatch = line.match(/[-•]\s*([^:]+):\s*(\d+)%/);
      if (probMatch && probMatch[1] && probMatch[2]) {
        const theme = probMatch[1].trim();
        const prob = parseInt(probMatch[2], 10);
        probabilities.push({ theme, prob });
      }
    }

    if (probabilities.length > 0) {
      probabilities.sort((a, b) => b.prob - a.prob);
      const topTheme = probabilities[0]?.theme;
      if (topTheme) {
        return topTheme;
      }
    }
  } catch (error) {
    console.error('[Oracle] Failed to extract theme:', error);
  }

  // Default fallback
  return 'Gaming';
}

/**
 * Combine all Grok responses into a single report
 */
function combineReports(
  scoreRaw: string,
  themeRaw: string,
  alphaRaw: string
): string {
  const divider = '\n\n' + '='.repeat(60) + '\n\n';

  return [
    '📊 MARKET SCORE ANALYSIS',
    divider,
    scoreRaw.trim(),
    divider,
    '🎯 META-SHIFT PROBABILITIES',
    divider,
    themeRaw.trim(),
    divider,
    '🔍 EARLY ALPHA SIGNALS',
    divider,
    alphaRaw.trim(),
  ].join('\n');
}

// ===== HTTP Handler =====

export default async function handler(req: Request): Promise<Response> {
  // Only allow GET (for both cron and client requests)
  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Auth: Bearer token
  if (!ORACLE_CRON_SECRET) {
    console.error('[Oracle] ORACLE_CRON_SECRET not configured');
    return json({ error: 'Oracle service not configured' }, 500);
  }

  // Check authorization header
  const authHeader = req.headers.get('authorization') || '';
  const [scheme, token] = authHeader.split(' ', 2);

  // Allow unauthenticated requests in development (for client testing)
  const env = process.env.NODE_ENV || 'production';
  const isDev = env === 'development';

  if (!isDev) {
    if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
      return json({ error: 'Unauthorized' }, 401);
    }

    if (token.trim() !== ORACLE_CRON_SECRET.trim()) {
      return json({ error: 'Unauthorized' }, 401);
    }
  }

  // Execute Oracle generation
  try {
    console.log('[Oracle] Starting daily report generation...');

    // Call Grok 3x in parallel
    const [scoreRaw, themeRaw, alphaRaw] = await Promise.all([
      callGrok(SCORE_PROMPT, { maxTokens: 1000 }),
      callGrok(THEME_PROMPT, { maxTokens: 800 }),
      callGrok(ALPHA_PROMPT, { maxTokens: 800 }),
    ]);

    console.log('[Oracle] All Grok calls completed successfully');

    // Extract score and theme
    const score = extractScore(scoreRaw);
    const theme = extractTopTheme(themeRaw);

    // Combine reports
    const fullReport = combineReports(scoreRaw, themeRaw, alphaRaw);

    // Build response
    const today = new Date().toISOString().split('T')[0];
    const response: OracleAPIResponse = {
      report: fullReport,
      score,
      theme: theme || 'Gaming', // Ensure theme is never undefined
      timestamp: Date.now(),
      date: today,
    };

    console.log('[Oracle] Report generated:', {
      date: today,
      score,
      theme,
      reportLength: fullReport.length,
    });

    return json(response, 200);
  } catch (error) {
    console.error('[Oracle] Failed to generate report:', error);

    // Return error response (don't expose internal details)
    return json(
      {
        error: 'ORACLE_FETCH_FAILED',
        message: 'Failed to generate Oracle report. Please try again later.',
      },
      500
    );
  }
}
