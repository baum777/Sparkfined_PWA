/**
 * Alpha Issue 0: Bootstrap & Flags
 * Core data types for token snapshots and market data
 */

/**
 * Normalized token snapshot from any provider
 * Used as the canonical data format across adapters
 */
export interface TokenSnapshot {
  address: string;
  symbol: string;
  name: string;
  price: number;
  high24: number;
  low24: number;
  volume24: number;
  liquidity: number;
  timestamp: number;
  provider: 'dexpaprika' | 'moralis' | 'dexscreener' | 'pumpfun';
}

/**
 * Provider metadata for telemetry
 */
export interface ProviderMetadata {
  provider: string;
  timestamp: number;
  latencyMs: number;
  cached: boolean;
  fallback: boolean;
}

/**
 * Token snapshot with provider metadata
 */
export interface TokenSnapshotWithMeta {
  snapshot: TokenSnapshot;
  meta: ProviderMetadata;
}
