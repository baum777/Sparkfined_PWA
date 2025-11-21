import { afterEach, describe, expect, test, vi } from "vitest";
import { buildTokenContext } from "../contextBuilder";
import type { PulseGlobalToken } from "../types";

const token: PulseGlobalToken = {
  symbol: "BONK",
  address: "addr1",
};

const createResponse = (ok: boolean, data: unknown, status = 200, statusText = "OK") => ({
  ok,
  status,
  statusText,
  json: vi.fn().mockResolvedValue(data),
});

describe("contextBuilder", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("builds context from on-chain metrics and social snippets", async () => {
    const fetchMock = vi
      .fn()
      // Dexscreener detail
      .mockResolvedValueOnce(
        createResponse(true, {
          pairs: [
            {
              priceUsd: "0.0123",
              liquidity: { usd: 55000 },
              volume: { h24: 125000 },
              priceChange: { h24: 18.5 },
            },
          ],
        })
      )
      // Birdeye detail (not used if Dexscreener already returns data)
      .mockResolvedValueOnce(
        createResponse(true, {
          data: {
            price: 0.0118,
            v24hUSD: 130000,
            liquidity: 60000,
            priceChange24hPercent: 16,
          },
        })
      )
      // Social search
      .mockResolvedValueOnce(
        createResponse(true, {
          results: [
            { text: "bonk back on radar, volume spiking", score: 0.82 },
            { snippet: "community hyped, new meme listings" },
          ],
        })
      );

    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const context = await buildTokenContext(token, {
      dexscreenerBaseUrl: "https://dex.test",
      birdeyeBaseUrl: "https://bird.test",
      socialBaseUrl: "https://social.test",
    });

    expect(context).toContain("BONK");
    expect(context).toContain("On-chain (dexscreener)");
    expect(context).toContain("Social (2)");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  test("falls back gracefully when sources fail", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network unavailable")) as unknown as typeof fetch
    );

    const context = await buildTokenContext(token, {
      dexscreenerBaseUrl: "https://dex.test",
      birdeyeBaseUrl: "https://bird.test",
      socialBaseUrl: "https://social.test",
    });

    expect(context).toContain("missing live market metrics");
    expect(context).toContain("No live mentions fetched");
    expect(warnSpy).toHaveBeenCalled();
  });
});
