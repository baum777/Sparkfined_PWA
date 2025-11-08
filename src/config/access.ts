/**
 * Access Pass Configuration
 * 
 * Centralized config for Sparkfiend Access Pass system
 */

export const ACCESS_CONFIG = {
  // OG Pass Settings
  OG_SLOTS: 333,
  OG_SYMBOL: (typeof process !== 'undefined' && process.env?.ACCESS_OG_SYMBOL) || import.meta.env?.VITE_ACCESS_OG_SYMBOL || 'OGPASS',
  OG_COLLECTION_NAME: 'Sparkfiend OG Pass',
  
  // Hold Requirements
  HOLD_REQUIREMENT: 100_000, // 100k tokens
  
  // Solana Network
  NETWORK: (import.meta.env?.VITE_SOLANA_NETWORK || 'devnet') as 'devnet' | 'mainnet-beta',
  RPC_URL: import.meta.env?.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  
  // Token Mint (replace with actual mint address)
  TOKEN_MINT: (typeof process !== 'undefined' && process.env?.ACCESS_TOKEN_MINT) || import.meta.env?.VITE_ACCESS_TOKEN_MINT || 'So11111111111111111111111111111111111111112', // SOL for testing
  
  // Metaplex
  COLLECTION_MINT: (typeof process !== 'undefined' && process.env?.METAPLEX_COLLECTION_MINT) || import.meta.env?.VITE_METAPLEX_COLLECTION_MINT || undefined,
  
  // API Endpoints
  API_BASE: '/api',
  
  // Cache/Storage
  RANK_STORAGE_PATH: '.data/og_rank.json',
  
  // Rate Limiting
  LOCK_COOLDOWN_MS: 24 * 60 * 60 * 1000, // 24 hours
} as const

// Server-only config (not exposed to client)
// Safe to use process.env here as this is only accessed in server/API routes
export const SERVER_CONFIG = {
  SOLANA_KEYPAIR_JSON: typeof process !== 'undefined' ? process.env?.SOLANA_KEYPAIR_JSON : undefined,
  STREAMFLOW_API_BASE: (typeof process !== 'undefined' && process.env?.STREAMFLOW_API_BASE) || 'https://api.streamflow.finance',
  STREAMFLOW_API_KEY: typeof process !== 'undefined' ? process.env?.STREAMFLOW_API_KEY : undefined,
}

// Metadata URI template
export const getOGPassMetadataURI = (rank: number): string => {
  return `https://meta.sparkfiend.xyz/ogpass/${rank}.json`
}

// Validate rank is within OG range
export const isOGRank = (rank: number): boolean => {
  return rank > 0 && rank <= ACCESS_CONFIG.OG_SLOTS
}
