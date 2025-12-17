import { describe, expect, it } from "vitest";
import {
  normalizeHeliusToken,
  normalizeWalletAssetsResponse,
} from "@/lib/wallet/normalizeWalletAssets";

describe("normalizeWalletAssetsResponse", () => {
  it("returns SOL and fungible tokens with normalized values", () => {
    const response = {
      result: {
        nativeBalance: "123456789",
        items: [
          {
            id: "JUPm1nt",
            interface: "FungibleToken",
            tokenAmount: { amount: "2500000", decimals: 6, uiAmount: 2.5 },
            token_info: {
              symbol: "JUP",
              name: "Jupiter",
              decimals: 6,
              mint: "JUPm1nt",
              balance: "2500000",
            },
          },
          {
            id: "NFTm1nt",
            interface: "NonFungible",
            content: { metadata: { name: "NFT Badge" } },
            token_info: { mint: "NFTm1nt", symbol: "NFT", decimals: 0, balance: "1" },
          },
        ],
      },
    };

    const normalized = normalizeWalletAssetsResponse("ownerPubkey", response);

    expect(normalized.owner).toBe("ownerPubkey");
    expect(normalized.nativeBalanceLamports).toBe(123456789);
    expect(normalized.tokens).toHaveLength(2);
    expect(normalized.tokens[0]).toMatchObject({
      mint: "SOL",
      uiAmount: 0.123456789,
      decimals: 9,
    });
    expect(normalized.tokens[1]).toMatchObject({
      mint: "JUPm1nt",
      symbol: "JUP",
      name: "Jupiter",
      decimals: 6,
      uiAmount: 2.5,
      amount: "2500000",
    });
  });

  it("returns empty tokens when no fungible assets are present", () => {
    const response = {
      result: {
        nativeBalance: null,
        items: [
          {
            id: "NFTm1nt",
            interface: "NonFungible",
            token_info: { mint: "NFTm1nt", symbol: "NFT" },
          },
        ],
      },
    };

    const normalized = normalizeWalletAssetsResponse("ownerPubkey", response);
    expect(normalized.tokens).toHaveLength(0);
    expect(normalized.nativeBalanceLamports).toBeNull();
  });
});

describe("normalizeHeliusToken", () => {
  it("ignores non-fungible assets", () => {
    const token = normalizeHeliusToken({
      id: "NFTm1nt",
      interface: "NonFungible",
      token_info: { mint: "NFTm1nt", symbol: "NFT" },
    });

    expect(token).toBeNull();
  });
});
