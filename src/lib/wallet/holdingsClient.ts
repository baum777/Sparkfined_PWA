import type { WalletHoldingsResponse } from "@/types/walletAssets";

const holdingsCache = new Map<string, WalletHoldingsResponse>();

interface FetchWalletHoldingsOptions {
  signal?: AbortSignal;
  force?: boolean;
}

export async function fetchWalletHoldings(
  owner: string,
  options?: FetchWalletHoldingsOptions
): Promise<WalletHoldingsResponse> {
  if (!options?.force && holdingsCache.has(owner)) {
    return holdingsCache.get(owner) as WalletHoldingsResponse;
  }

  const response = await fetch(`/api/wallet/assets?owner=${encodeURIComponent(owner)}`, {
    signal: options?.signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as WalletHoldingsResponse;
  holdingsCache.set(owner, data);
  return data;
}

export function clearWalletHoldingsCache(owner?: string): void {
  if (owner) {
    holdingsCache.delete(owner);
  } else {
    holdingsCache.clear();
  }
}
