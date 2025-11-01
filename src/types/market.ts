/**
 * Market Data Types - Schema-First Design
 *
 * Unified MarketSnapshot schema that all data providers must normalize to.
 * This ensures consistent data shape across DexPaprika, Moralis, Dexscreener, Pump.fun
 *
 * @module types/market
 */

// ============================================================================
// CORE MARKET SNAPSHOT (Unified Schema)
// ============================================================================

/**
 * Normalized market data snapshot - Source of Truth for all providers
 * All adapters MUST transform their responses into this shape
 */
export interface MarketSnapshot {
  // Token Identity
  token: {
    address: string
    symbol: string
    name: string
    chain: 'solana' | 'ethereum' | 'bsc' | 'arbitrum' | 'base' | 'polygon'
    decimals?: number
  }

  // Price & Market Data
  price: {
    current: number          // USD price
    high24h: number
    low24h: number
    change24h: number        // Percentage (-100 to +∞)
    change24hUsd?: number    // Absolute USD change
  }

  // Volume & Liquidity
  volume: {
    volume24h: number        // USD volume
    volumeChange24h?: number // Percentage
    buyVolume24h?: number    // Buy-side volume
    sellVolume24h?: number   // Sell-side volume
  }

  liquidity: {
    total: number            // USD total liquidity
    base?: number            // Base token liquidity
    quote?: number           // Quote token liquidity
    reserves?: {             // Pool reserves
      token0: number
      token1: number
    }
  }

  // Market Metrics
  marketCap?: number         // USD market cap
  fdv?: number               // Fully diluted valuation
  holders?: number           // Token holder count

  // Trading Pairs
  pairs?: Array<{
    dex: string              // DEX name (Raydium, Orca, Uniswap, etc.)
    pairAddress: string
    baseToken: string
    quoteToken: string
    liquidity: number
    volume24h: number
    priceUsd: number
  }>

  // Metadata
  metadata: {
    provider: 'dexpaprika' | 'moralis' | 'dexscreener' | 'pumpfun'
    timestamp: number        // Unix timestamp (ms)
    cached: boolean          // Was this from cache?
    confidence: number       // 0-1 confidence score
    latency?: number         // API response time (ms)
  }

  // Optional: Social/Project Info (from some providers)
  social?: {
    website?: string
    twitter?: string
    telegram?: string
    discord?: string
  }
}

// ============================================================================
// PROVIDER-SPECIFIC RAW RESPONSES
// ============================================================================

/**
 * DexPaprika API Response Structure
 * Reference: https://api.dexpaprika.com/docs
 */
export interface DexPaprikaTokenResponse {
  // Token Info
  contract_address: string
  symbol: string
  name: string
  chain: string
  decimals: number

  // Price Data
  price_usd: number
  price_change_24h: number
  high_24h: number
  low_24h: number

  // Volume & Liquidity
  volume_24h: number
  volume_change_24h?: number
  liquidity_usd: number

  // Market Data
  market_cap?: number
  fdv?: number
  holders?: number

  // Trading Pairs
  pairs?: Array<{
    dex_name: string
    pair_address: string
    base_token: string
    quote_token: string
    liquidity_usd: number
    volume_24h: number
    price_usd: number
  }>

  // Metadata
  last_updated: string       // ISO timestamp
}

/**
 * Moralis API Response Structure
 * Reference: https://docs.moralis.io/web3-data-api/evm/reference
 */
export interface MoralisTokenResponse {
  // Token Identity
  address: string
  symbol: string
  name: string
  decimals: string           // String number (Moralis quirk)

  // Price Data (from /erc20/{address}/price)
  usdPrice?: number
  usdPriceFormatted?: string
  '24hrPercentChange'?: string

  // Market Data (from various endpoints)
  tokenAddress?: string
  exchange?: string

  // Pair Data (from /pairs)
  pairAddress?: string
  token0?: {
    address: string
    symbol: string
    name: string
  }
  token1?: {
    address: string
    symbol: string
    name: string
  }
  reserve0?: string
  reserve1?: string

  // Metadata
  blockTimestamp?: string
  possibleSpam?: boolean
}

/**
 * Moralis Multi-Chain Price Response
 */
export interface MoralisPriceResponse {
  tokenAddress: string
  usdPrice: number
  usdPriceFormatted: string
  '24hrPercentChange': string
  exchangeAddress: string
  exchangeName: string
  tokenName: string
  tokenSymbol: string
  tokenDecimals: string
  tokenLogo?: string
  pairAddress?: string
  pairTotalLiquidityUsd?: string
}

// ============================================================================
// ADAPTER INTERFACES
// ============================================================================

/**
 * Base adapter configuration
 */
export interface AdapterConfig {
  baseUrl: string
  apiKey?: string
  timeout: number            // Request timeout (ms)
  retries: number            // Max retry attempts
  cacheTtl: number           // Cache TTL (ms)
}

/**
 * Adapter response wrapper
 */
export interface AdapterResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    provider: string
    timestamp: number
  }
  metadata: {
    provider: string
    cached: boolean
    latency: number
    retries: number
  }
}

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  primary: 'dexpaprika' | 'moralis'
  fallbacks: Array<'dexscreener' | 'pumpfun' | 'dexpaprika' | 'moralis'>
  timeout: number            // Global timeout (ms)
  maxRetries: number
  cacheTtl: number
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Chain identifier union
 */
export type ChainId = 'solana' | 'ethereum' | 'bsc' | 'arbitrum' | 'base' | 'polygon'

/**
 * Provider identifier union
 */
export type ProviderId = 'dexpaprika' | 'moralis' | 'dexscreener' | 'pumpfun'

/**
 * API Error codes
 */
export type ApiErrorCode =
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'NOT_FOUND'
  | 'INVALID_ADDRESS'
  | 'NETWORK_ERROR'
  | 'PARSE_ERROR'
  | 'UNKNOWN'

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  provider: ProviderId
}
