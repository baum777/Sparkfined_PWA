/**
 * Wallet Flow Data Adapter (Alpha Placeholder)
 * 
 * Purpose: Analyze wallet accumulation/distribution patterns
 * Status: STUB - Returns safe defaults, no external API calls
 * Future: Integrate with Nansen, Arkham, or on-chain analytics
 * 
 * @module walletFlow
 */

export type WalletAccumulation = 'accum' | 'dist' | 'neutral'
export type WalletTier = 'whale' | 'shark' | 'dolphin' | 'shrimp' | 'unknown'

export interface WalletFlowSnapshot {
  accumulation: WalletAccumulation
  confidence: number // 0-1 score
  whaleActivity?: {
    buying: number // count of large buys in 24h
    selling: number // count of large sells in 24h
    netFlow: number // positive = accumulation
  }
  holderDistribution?: {
    top10Percentage: number
    top100Percentage: number
    uniqueHolders: number
  }
  timestamp: number
  source: 'placeholder' | 'nansen' | 'arkham' | 'custom'
}

/**
 * Get wallet accumulation/distribution hint for a token
 * @param mintOrCA - Token mint address (Solana) or contract address (EVM)
 * @returns Wallet flow analysis snapshot
 * 
 * @alpha This is a placeholder stub. Always returns neutral/low confidence.
 * No external API calls are made in Beta/Alpha phases.
 */
export async function getAccumulationHint(
  mintOrCA: string
): Promise<WalletFlowSnapshot> {
  // Validate input format (basic check)
  if (!mintOrCA || mintOrCA.length < 32) {
    console.warn('[walletFlow] Invalid mint/CA format:', mintOrCA)
  }

  // Alpha placeholder: always return neutral
  // Future: Call external API based on WALLETFLOW_PROVIDER env var
  const provider = import.meta.env.VITE_WALLETFLOW_PROVIDER || 'none'
  
  if (provider !== 'none') {
    console.info('[walletFlow] Provider configured but not implemented:', provider)
    // Provider-specific logic tracked in Phase 6 roadmap
  }

  return {
    accumulation: 'neutral',
    confidence: 0,
    whaleActivity: undefined,
    holderDistribution: undefined,
    timestamp: Date.now(),
    source: 'placeholder',
  }
}

/**
 * Analyze smart money wallet patterns (placeholder)
 */
export async function getSmartMoneyHint(
  _mintOrCA: string
): Promise<{ following: number; against: number; confidence: number }> {
  // Future: Track wallets known for high win rates
  return {
    following: 0,
    against: 0,
    confidence: 0,
  }
}

/**
 * Check if wallet flow provider is configured
 */
export function isWalletFlowEnabled(): boolean {
  const provider = import.meta.env.VITE_WALLETFLOW_PROVIDER || 'none'
  return provider !== 'none'
}

/**
 * Get list of supported providers
 */
export function getSupportedProviders(): string[] {
  return ['none', 'nansen', 'arkham', 'custom']
}
