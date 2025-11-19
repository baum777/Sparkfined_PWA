/**
 * Token Types
 *
 * Core types for cryptocurrency tokens used across the Sparkfined PWA.
 */

export interface Token {
  /** Token contract address (unique identifier) */
  address: string;

  /** Token symbol (e.g., "SOL", "BTC", "ETH") */
  symbol: string;

  /** Full token name (e.g., "Solana", "Bitcoin") */
  name: string;

  /** Logo/icon URI */
  logoURI?: string;

  /** Current price in USD */
  price: number;

  /** 24-hour price change percentage */
  change24h: number;

  /** 24-hour trading volume in USD */
  volume24h: number;

  /** Market capitalization in USD */
  marketCap?: number;

  /** Token category/tags */
  tags?: string[];

  /** Blockchain/network */
  chain?: string;
}

export interface TokenSearchResult extends Token {
  /** Relevance score (0-1) for search ranking */
  relevance?: number;
}
