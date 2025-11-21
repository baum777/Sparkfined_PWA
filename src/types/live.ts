/**
 * Live Data v1 - Type Definitions
 * Types for real-time price polling and on-chain event streaming
 */

/**
 * Price snapshot from live polling
 */
export interface LivePriceSnapshot {
  symbol: string;
  price: number;
  priceChange24h: number | null;
  volume24h: number | null;
  timestamp: number;
  source: 'dexpaprika' | 'moralis' | 'dexscreener' | 'pumpfun';
}

/**
 * Price change direction for UI animations
 */
export type PriceDirection = 'up' | 'down' | 'flat';

/**
 * Extended price snapshot with direction
 */
export interface LivePriceWithDirection extends LivePriceSnapshot {
  direction: PriceDirection;
  previousPrice: number | null;
}

/**
 * Polling status for monitoring
 */
export type PollingStatus = 'idle' | 'active' | 'paused' | 'error';

/**
 * Polling error with retry context
 */
export interface PollingError {
  symbol: string;
  message: string;
  timestamp: number;
  attempt: number;
  willRetry: boolean;
}

/**
 * Symbol polling configuration
 */
export interface SymbolPollingConfig {
  symbol: string;
  intervalMs: number;
  priority: 'active' | 'passive';
}

/**
 * On-chain event from Solana WebSocket RPC
 */
export interface OnChainEvent {
  type: 'ONCHAIN_SWAP' | 'ONCHAIN_LIQUIDITY' | 'ONCHAIN_TRANSFER';
  txSignature: string;
  programId: string;
  slot: number;
  timestamp: number;
  rawLog: string;
}

/**
 * Normalized on-chain swap event
 */
export interface OnChainSwapEvent extends OnChainEvent {
  type: 'ONCHAIN_SWAP';
  baseMint: string;
  quoteMint: string;
  amountIn: number | null;
  amountOut: number | null;
  poolAddress: string | null;
}

/**
 * Live data mode
 */
export type LiveDataMode = 'polling' | 'websocket' | 'hybrid';

/**
 * Live data connection state
 */
export interface LiveDataConnectionState {
  mode: LiveDataMode;
  pollingStatus: PollingStatus;
  wsConnected: boolean;
  lastHeartbeat: number | null;
  activeSymbols: string[];
  errorCount: number;
}
