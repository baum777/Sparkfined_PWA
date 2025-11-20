/**
 * Alpha Issue 6: Heuristic Fallback
 * Local deterministic analysis without AI
 */

import type { TokenSnapshot } from '@/types/data';

export interface HeuristicResult {
  sr_levels: Array<{ label: string; price: number }>;
  stop_loss: number;
  take_profit: number[];
  confidence: number;
  timestamp: number;
}

/**
 * Calculate support/resistance levels using price action
 * @param snapshot - Token snapshot data
 * @returns Heuristic analysis result
 *
 * NOTE(P2-backlog): Keep heuristic lightweight for now. Future iteration
 * (Issue 6) can add seeded determinism and more nuanced S/R math while
 * retaining <300ms execution time.
 */
export function heuristic(snapshot: TokenSnapshot): HeuristicResult {
  const { price } = snapshot;

  // Simple implementation: S/R within ±3% of current price
  // NOTE(P2-backlog): Enhance with richer price-action heuristics in Issue 6
  const resistance = price * 1.03; // +3%
  const support = price * 0.97; // -3%
  const stop_loss = price * 0.95; // -5%
  const take_profit = [price * 1.05, price * 1.10]; // +5%, +10%

  return {
    sr_levels: [
      { label: 'R1', price: resistance },
      { label: 'S1', price: support },
    ],
    stop_loss,
    take_profit,
    confidence: 0.6,
    timestamp: Date.now(),
  };
}
