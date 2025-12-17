export interface WalletTokenHolding {
  mint: string;
  amount: string | number | null;
  decimals: number | null;
  uiAmount: number | null;
  symbol: string | null;
  name: string | null;
}

export interface WalletHoldingsResponse {
  owner: string;
  nativeBalanceLamports: number | null;
  tokens: WalletTokenHolding[];
}
