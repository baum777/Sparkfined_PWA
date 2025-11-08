/**
 * Orderflow Data Adapter (Alpha Placeholder)
 * 
 * Purpose: Fetch orderflow/volume metrics for tokens
 * Status: STUB - Returns safe defaults, no external API calls
 * Future: Integrate with Birdeye, Bubblemaps, or custom providers
 * 
 * @module orderflow
 */

import { ENV } from '@/config/env'

export type OrderflowDirection = 'inflow' | 'outflow' | 'neutral'
export type OrderflowStrength = 0 | 1 | 2 // 0=weak, 1=moderate, 2=strong

export interface OrderflowSnapshot {
  direction: OrderflowDirection
  strength: OrderflowStrength
  volumeDelta24h?: number
  buyPressure?: number  // 0-1 ratio
  sellPressure?: number // 0-1 ratio
  timestamp: number
  source: 'placeholder' | 'birdeye' | 'bubblemaps' | 'custom'
}

/**
 * Get orderflow snapshot for a token
 * @param mintOrCA - Token mint address (Solana) or contract address (EVM)
 * @returns Orderflow metrics snapshot
 * 
 * @alpha This is a placeholder stub. Always returns neutral/0 strength.
 * No external API calls are made in Beta/Alpha phases.
 */
export async function getOrderflowSnapshot(
  mintOrCA: string
): Promise<OrderflowSnapshot> {
  // Validate input format (basic check)
  if (!mintOrCA || mintOrCA.length < 32) {
    console.warn('[orderflow] Invalid mint/CA format:', mintOrCA)
  }

  // Alpha placeholder: always return neutral
  // Future: Call external API based on ORDERFLOW_PROVIDER env var
    const provider = ENV.ORDERFLOW_PROVIDER || 'none'
  
  if (provider !== 'none') {
    console.info('[orderflow] Provider configured but not implemented:', provider)
    // TODO: Implement provider-specific logic in Phase 6+
  }

  return {
    direction: 'neutral',
    strength: 0,
    volumeDelta24h: undefined,
    buyPressure: undefined,
    sellPressure: undefined,
    timestamp: Date.now(),
    source: 'placeholder',
  }
}

/**
 * Check if orderflow provider is configured
 */
export function isOrderflowEnabled(): boolean {
  const provider = ENV.ORDERFLOW_PROVIDER || 'none'
  return provider !== 'none'
}

/**
 * Get list of supported providers
 */
export function getSupportedProviders(): string[] {
  return ['none', 'birdeye', 'bubblemaps', 'custom']
}
