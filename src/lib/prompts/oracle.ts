/**
 * Oracle subsystem Grok prompt templates.
 * Mirrors the definitions in docs/core/concepts/oracle-subsystem.md.
 */
export const ORACLE_SCORE_PROMPT = `
Analyze the current crypto market environment across 7 parameters:

1. Liquidity – DEX depth, slippage levels, available capital
2. Volume – 24h trading volume trends, velocity of capital
3. Volatility – ATR, Bollinger Band width, realized volatility
4. Sentiment – Fear & Greed Index, Crypto Twitter vibe, retail behavior
5. Trend Strength – Momentum indicators, breakout quality, follow-through
6. Whale Activity – Large wallet movements, accumulation/distribution patterns
7. CEX Inflows – Exchange net flows, funding rates

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
SCORE: X/7 (sum of all parameters)

BREAKDOWN:
1. Liquidity: X/7 - [1-2 sentence rationale]
2. Volume: X/7 - [1-2 sentence rationale]
3. Volatility: X/7 - [1-2 sentence rationale]
4. Sentiment: X/7 - [1-2 sentence rationale]
5. Trend Strength: X/7 - [1-2 sentence rationale]
6. Whale Activity: X/7 - [1-2 sentence rationale]
7. CEX Inflows: X/7 - [1-2 sentence rationale]

OVERALL CONTEXT: [2-3 sentences summarizing the market environment]
`.trim();

export const ORACLE_THEME_PROMPT = `
Based on the current market conditions, estimate the probability of a meta-shift towards each of these themes in the next 48 hours:

1. Gaming – Play-to-earn, gaming tokens (AXS, SAND, IMX)
2. RWA – Real-world assets, tokenized securities (ONDO, RIO)
3. AI Agents – Autonomous agents, AI-focused tokens (FET, AGIX)
4. DePIN – Decentralized physical infrastructure (HNT, RNDR)
5. Privacy/ZK – Zero-knowledge, privacy coins (ZK, ALEO)
6. Collectibles/TCG – NFTs, trading card games (BLUR, RARE)
7. Stablecoin Yield – Yield farms, stablecoin pairs (USDC/USDT strategies)

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

RATIONALE: [2-3 sentences explaining why this theme is most likely]
`.trim();

export const ORACLE_ALPHA_PROMPT = `
Identify 2-3 early-stage Solana contract addresses (CAs) showing signs of potential:

Criteria:
- Market cap < $5M
- Growing social momentum (Twitter mentions, Telegram activity)
- Recent liquidity additions
- Holder concentration changes (whales accumulating)
- No obvious rug signals (locked liquidity, verified contract)

Output format:
EARLY ALPHA CAs:

1. [CA] - [Ticker]
   - MCap: $XXk
   - Thesis: [1-2 sentence pitch]
   - Risk: [High/Medium/Low]

2. [CA] - [Ticker]
   - MCap: $XXk
   - Thesis: [1-2 sentence pitch]
   - Risk: [High/Medium/Low]

3. (Optional) Additional candidate if conviction is high

DISCLAIMER: All are high-risk speculative plays. DYOR.
`.trim();

export const ORACLE_SYSTEM_PROMPT =
  "You are Sparkfined's Daily Oracle assistant. Respond with concise, well-structured analysis strictly following the provided template. Do not invent formatting beyond the prompt.";
