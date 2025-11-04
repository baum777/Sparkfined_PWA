/**
 * API Configuration & Hierarchy
 * 
 * Primäre Datenquellen:
 * 1. Moralis (Price, OHLC, Market Cap, On-Chain-Metrics)
 * 2. Dexpaprika (Token-Metadata, Backup OHLC)
 * 3. Dexscreener (Fallback für Token-Search)
 * 
 * Cortex (First Update):
 * - Moralis Cortex API für AI-powered Insights
 */

export const API_ENDPOINTS = {
  // Internal Vercel Functions (Proxies)
  moralis: '/api/moralis/token',
  dexpaprika: '/api/dexpaprika/tokens',
  ohlc: '/api/data/ohlc',
  
  // External (Fallback, client-side)
  dexscreener: 'https://api.dexscreener.com/latest/dex',
} as const;

export const API_PRIORITIES = {
  tokenMetadata: ['dexpaprika', 'moralis', 'dexscreener'],
  priceData: ['moralis', 'dexpaprika', 'dexscreener'],
  ohlcData: ['moralis', 'dexpaprika', 'dexscreener'],
} as const;

export const CACHE_DURATION = {
  tokenMetadata: 60 * 60 * 1000, // 1h
  priceData: 30 * 1000, // 30s
  ohlcData: 30 * 1000, // 30s (stale-while-revalidate)
  search: 5 * 60 * 1000, // 5min
} as const;

export const RATE_LIMITS = {
  moralis: {
    requestsPerMinute: 1500,
    requestsPerDay: 40000,
  },
  dexpaprika: {
    requestsPerMinute: 300,
  },
  dexscreener: {
    requestsPerMinute: 300,
  },
} as const;

// Moralis Cortex (für "First Update")
export const CORTEX_ENDPOINTS = {
  sentiment: '/cortex/v1/sentiment',
  whaleActivity: '/cortex/v1/whale-activity',
  riskScore: '/cortex/v1/risk-score',
} as const;
