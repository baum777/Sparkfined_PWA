import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useWalletHoldings } from "@/hooks/useWalletHoldings";
import type { WalletHoldingsResponse } from "@/types/walletAssets";

const VALID_WALLET = "4Nd1mYpivkQmZKSei1xDzc3gQ8ffNk31DJ7tY8Db68de";

describe("useWalletHoldings", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns idle state when owner is null", () => {
    const { result } = renderHook(() => useWalletHoldings(null));

    expect(result.current.status).toBe("idle");
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("fetches holdings when owner is provided", async () => {
    const mockResponse: WalletHoldingsResponse = {
      owner: VALID_WALLET,
      nativeBalanceLamports: 10,
      tokens: [
        {
          mint: "SOL",
          amount: 10,
          decimals: 9,
          uiAmount: 0.00000001,
          symbol: "SOL",
          name: "Solana",
        },
      ],
    };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useWalletHoldings(VALID_WALLET));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/wallet/assets?owner=${encodeURIComponent(VALID_WALLET)}`,
      {
        signal: expect.any(AbortSignal),
      }
    );
  });

  it("surfaces invalid owners as an error state", async () => {
    const { result } = renderHook(() => useWalletHoldings("not-base58"));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toContain("Invalid wallet address");
  });
});
