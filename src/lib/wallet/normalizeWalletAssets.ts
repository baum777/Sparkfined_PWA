import type { WalletHoldingsResponse, WalletTokenHolding } from "@/types/walletAssets";

type MaybeNumber = number | string | null | undefined;

type HeliusTokenAmount = {
  amount?: MaybeNumber;
  decimals?: number | null;
  uiAmount?: number | null;
  uiAmountString?: string | null;
};

type HeliusTokenInfo = {
  mint?: string | null;
  symbol?: string | null;
  name?: string | null;
  balance?: MaybeNumber;
  decimals?: number | null;
};

type HeliusContentMetadata = {
  symbol?: string | null;
  name?: string | null;
};

type HeliusAsset = {
  id?: string | null;
  interface?: string | null;
  content?: { metadata?: HeliusContentMetadata | null } | null;
  tokenAmount?: HeliusTokenAmount | null;
  tokenInfo?: HeliusTokenInfo | null;
  token_info?: HeliusTokenInfo | null;
};

type HeliusAssetsResponse = {
  result?: {
    items?: HeliusAsset[];
    nativeBalance?: MaybeNumber;
  } | null;
};

const SOLANA_DECIMALS = 9;
const SOLANA_MINT = "SOL";

function toFiniteNumber(value: MaybeNumber): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeAmount(value: MaybeNumber): string | number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return null;
}

function pickFirstString(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function deriveUiAmount(
  amount: string | number | null,
  decimals: number | null,
  rawUiAmount: MaybeNumber
): number | null {
  const parsedUiAmount = toFiniteNumber(rawUiAmount);
  if (parsedUiAmount != null) return parsedUiAmount;
  if (amount == null || decimals == null) return null;
  const numericAmount = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(numericAmount)) return null;
  const divisor = 10 ** decimals;
  if (!Number.isFinite(divisor) || divisor === 0) return null;
  return numericAmount / divisor;
}

function isFungibleAsset(asset: HeliusAsset): boolean {
  const iface = asset.interface?.toLowerCase() ?? "";
  if (iface.includes("nonfungible")) return false;
  if (iface.includes("fungible")) return true;
  const decimals = asset.tokenInfo?.decimals ?? asset.token_info?.decimals ?? asset.tokenAmount?.decimals;
  if (decimals != null) return true;
  return false;
}

export function normalizeHeliusToken(asset: HeliusAsset): WalletTokenHolding | null {
  if (!isFungibleAsset(asset)) return null;

  const mint = pickFirstString(asset.id, asset.tokenInfo?.mint, asset.token_info?.mint);
  if (!mint) return null;

  const decimals =
    toFiniteNumber(
      asset.tokenInfo?.decimals ?? asset.token_info?.decimals ?? asset.tokenAmount?.decimals
    ) ?? null;
  const amount = normalizeAmount(
    asset.tokenInfo?.balance ?? asset.token_info?.balance ?? asset.tokenAmount?.amount
  );
  const uiAmount = deriveUiAmount(
    amount,
    decimals,
    asset.tokenAmount?.uiAmount ?? asset.tokenAmount?.uiAmountString
  );

  const symbol = pickFirstString(
    asset.tokenInfo?.symbol,
    asset.token_info?.symbol,
    asset.content?.metadata?.symbol,
    asset.content?.metadata?.name
  );
  const name =
    pickFirstString(asset.tokenInfo?.name, asset.token_info?.name, asset.content?.metadata?.name) ??
    symbol;

  return {
    mint,
    amount,
    decimals,
    uiAmount,
    symbol: symbol ?? null,
    name: name ?? null,
  };
}

export function normalizeWalletAssetsResponse(
  owner: string,
  heliusResponse: HeliusAssetsResponse
): WalletHoldingsResponse {
  const items = Array.isArray(heliusResponse.result?.items) ? heliusResponse.result?.items : [];
  const nativeBalanceLamports = toFiniteNumber(heliusResponse.result?.nativeBalance) ?? null;

  const fungibleTokens = items
    .map((item) => normalizeHeliusToken(item))
    .filter((token): token is WalletTokenHolding => token !== null);

  const tokens: WalletTokenHolding[] = [...fungibleTokens];

  const hasSolEntry = tokens.some((token) => token.mint === SOLANA_MINT);
  if (nativeBalanceLamports != null && !hasSolEntry) {
    tokens.unshift({
      mint: SOLANA_MINT,
      amount: nativeBalanceLamports,
      decimals: SOLANA_DECIMALS,
      uiAmount: nativeBalanceLamports / 10 ** SOLANA_DECIMALS,
      symbol: SOLANA_MINT,
      name: "Solana",
    });
  }

  return {
    owner,
    nativeBalanceLamports,
    tokens,
  };
}
