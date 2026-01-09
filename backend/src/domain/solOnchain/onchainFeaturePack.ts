export type FeatureKey = "activity" | "holders" | "flows" | "liquidity" | "riskFlags";

export interface ProviderDescriptor {
  tag: string;
  version: string;
  fingerprint: string;
}

export interface FeatureAvailability {
  activity: boolean;
  holders: boolean;
  flows: boolean;
  liquidity: boolean;
  riskFlags: boolean;
  /**
   * Best-effort operator notes (e.g. "holder count not computed in v1").
   * Keys are only present when there are notes.
   */
  notes?: Partial<Record<FeatureKey, string[]>>;
}

export interface WindowedNumber {
  short: number | null;
  baseline: number | null;
}

export interface RiskFlag {
  value: boolean | null;
  /**
   * Short rationale. May include safe-to-expose public keys / derived metrics.
   */
  why?: string;
}

export interface RiskFlagsSection {
  mintAuthorityActive: RiskFlag;
  freezeAuthorityActive: RiskFlag;
  suddenSupplyChange: RiskFlag;
  largeHolderDominance: RiskFlag;
}

export interface HoldersSection {
  /**
   * Full holder count is intentionally not computed in v1.
   */
  current: number | null;
  /**
   * Ratio (0..1) of total supply held by top 10 token accounts.
   */
  concentrationTop10Pct: number | null;
  holdersDeltaPct: WindowedNumber;
}

export interface ActivitySection {
  txCount: WindowedNumber;
  /**
   * Requires parsing full transactions; v1 uses signatures-only mode.
   */
  uniqueWallets: WindowedNumber;
}

export interface FlowsSection {
  /**
   * Not implemented in v1. Keep schema explicit and cache-friendly.
   */
  netFlowUi: number | null;
  buyVolumeUi: number | null;
  sellVolumeUi: number | null;
}

export interface LiquiditySection {
  /**
   * Not implemented in v1. Keep schema explicit and cache-friendly.
   */
  tvlUi: number | null;
  poolCount: number | null;
}

export interface OnchainFeaturePack {
  provider: ProviderDescriptor;
  mint: string;
  asOfTs: number;
  availability: FeatureAvailability;
  activity: ActivitySection;
  holders: HoldersSection;
  flows: FlowsSection;
  liquidity: LiquiditySection;
  riskFlags: RiskFlagsSection;
}

export function createEmptyOnchainFeaturePack(
  provider: ProviderDescriptor,
  mint: string,
  asOfTs: number
): OnchainFeaturePack {
  return {
    provider,
    mint,
    asOfTs,
    availability: {
      activity: false,
      holders: false,
      flows: false,
      liquidity: false,
      riskFlags: false,
    },
    activity: {
      txCount: { short: null, baseline: null },
      uniqueWallets: { short: null, baseline: null },
    },
    holders: {
      current: null,
      concentrationTop10Pct: null,
      holdersDeltaPct: { short: null, baseline: null },
    },
    flows: {
      netFlowUi: null,
      buyVolumeUi: null,
      sellVolumeUi: null,
    },
    liquidity: {
      tvlUi: null,
      poolCount: null,
    },
    riskFlags: {
      mintAuthorityActive: { value: null },
      freezeAuthorityActive: { value: null },
      suddenSupplyChange: { value: null },
      largeHolderDominance: { value: null },
    },
  };
}

