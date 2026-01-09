import type { OnchainFeaturePack } from "./onchainFeaturePack";

export interface SolanaOnchainProviderCapabilities {
  activity: boolean;
  holders: boolean;
  flows: boolean;
  liquidity: boolean;
  riskFlags: boolean;
}

export interface ActivityWindows {
  /**
   * Window sizes in seconds (blockTime is seconds).
   */
  shortWindowSec: number;
  baselineWindowSec: number;
}

export interface SolanaOnchainProvider {
  readonly tag: string;
  readonly version: string;

  capabilities(): SolanaOnchainProviderCapabilities;
  fingerprint(): string;

  /**
   * Provider convenience API: best-effort pack in one call.
   * Implementations MUST NOT throw for partial failures.
   */
  getFeaturePack(mint: string, windows: ActivityWindows, asOfTs: number): Promise<OnchainFeaturePack>;
}

