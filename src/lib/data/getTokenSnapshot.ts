/**
 * Alpha Issue 4: Provider Muxing + SWR Cache
 * Token snapshot retrieval with provider fallback
 */

import type { TokenSnapshotWithMeta } from '@/types/data';
import { pickProvider } from '@/lib/config/flags';

/**
 * Get token snapshot with provider muxing (Primary -> Secondary)
 * @param address - Solana token address
 * @returns TokenSnapshot with provider metadata
 *
 * TODO[P0]: Implement provider muxing + SWR cache (Issue #4)
 */
export async function getTokenSnapshot(
  address: string
): Promise<TokenSnapshotWithMeta> {
  const config = pickProvider();
  void config;
  void address;

  // TODO[P0]: Wire provider fetch + fallback and cache layer (Issue #4)
  throw new Error('Not implemented - Issue 4');
}

/**
 * Clear snapshot cache for a specific address or all
 * @param address - Optional address to clear, or undefined for all
 */
export function clearSnapshotCache(address?: string): void {
  void address;
  // TODO[P1]: Implement cache clearing once SWR cache is added
}
