import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import {
  buildGlobalTokenList,
  fetchBirdeyeTopVolume,
  fetchDexScreenerTopGainers,
} from "../sources";

const createResponse = (ok: boolean, data: unknown, status = 200, statusText = "OK") => ({
  ok,
  status,
  statusText,
  json: vi.fn().mockResolvedValue(data),
});

const restoreGlobals = () => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
};

describe("grokPulse sources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    restoreGlobals();
  });

  test("buildGlobalTokenList dedupes across sources and respects maxUnique", async () => {
    const mockFetch = vi.fn((url: RequestInfo | URL) => {
      const href =
        typeof url === "string"
          ? url
          : url instanceof URL
          ? url.href
          : url instanceof Request
          ? url.url
          : (() => {
              throw new Error("Unsupported request url");
            })();
      if (href.includes("dexscreener.com") && href.includes("gainers")) {
        return Promise.resolve(
          createResponse(true, {
            pairs: [
              { baseToken: { address: "addr1", symbol: "sample" } },
              { baseToken: { address: "addr2", symbol: "toolongsymbolvalue" } },
              { baseToken: { address: "", symbol: "IGNORED" } },
            ],
          })
        );
      }

      if (href.includes("dexscreener.com") && href.includes("new-pairs")) {
        return Promise.resolve(
          createResponse(true, {
            pairs: [
              { baseToken: { address: "addr3" } },
              { baseToken: { address: "addr1", symbol: "duplicate" } },
            ],
          })
        );
      }

      if (href.includes("birdeye.so")) {
        return Promise.resolve(
          createResponse(true, {
            data: {
              tokens: [
                { address: "addr2", symbol: "DupeSym" },
                { address: "addr4", symbol: "MiXeDcAsE" },
              ],
            },
          })
        );
      }

      return Promise.resolve(createResponse(false, {}, 404, "not found"));
    });

    vi.stubGlobal("fetch", mockFetch as unknown as typeof fetch);

    const result = await buildGlobalTokenList({}, 3, false);

    expect(result).toEqual([
      { address: "addr1", symbol: "SAMPLE" },
      { address: "addr2", symbol: "TOOLONGSYMBO" },
      { address: "addr3", symbol: "UNKNOWN" },
    ]);
    expect(new Set(result.map((t) => t.address)).size).toBe(result.length);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  test("dexscreener normalization handles missing symbols and trimming", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        createResponse(true, {
          pairs: [
            { baseToken: { address: " addr5 ", symbol: " lower  " } },
            { baseToken: { address: "addr6", symbol: "   " } },
            { baseToken: { address: "addr7" } },
          ],
        })
      )
      .mockResolvedValueOnce(createResponse(true, { pairs: [] }));

    vi.stubGlobal("fetch", mockFetch as unknown as typeof fetch);

    const tokens = await fetchDexScreenerTopGainers({});

    expect(tokens).toEqual([
      { address: "addr5", symbol: "LOWER" },
      { address: "addr6", symbol: "UNKNOWN" },
      { address: "addr7", symbol: "UNKNOWN" },
    ]);
  });

  test("adapters tolerate HTTP failures and invalid payloads", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    let birdeyeCall = 0;

    const mockFetch = vi.fn((url: RequestInfo | URL) => {
      const href =
        typeof url === "string"
          ? url
          : url instanceof URL
          ? url.href
          : url instanceof Request
          ? url.url
          : (() => {
              throw new Error("Unsupported request url");
            })();
      if (href.includes("dexscreener.com") && href.includes("gainers")) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Server Error",
          json: vi.fn(),
        });
      }

      if (href.includes("dexscreener.com") && href.includes("new-pairs")) {
        return Promise.reject(new Error("network down"));
      }

      if (href.includes("birdeye.so")) {
        birdeyeCall += 1;
        if (birdeyeCall === 1) {
          return Promise.resolve({
            ok: true,
            status: 200,
            statusText: "OK",
            json: vi.fn().mockRejectedValue(new Error("invalid json")),
          });
        }

        return Promise.resolve(
          createResponse(true, {
            data: { tokens: [{ address: "x1", symbol: "sym" }] },
          })
        );
      }

      return Promise.resolve(createResponse(false, {}, 404, "not found"));
    });

    vi.stubGlobal("fetch", mockFetch as unknown as typeof fetch);

    const dexTokens = await fetchDexScreenerTopGainers({});
    expect(dexTokens).toEqual([]);

    const birdeyeFirst = await fetchBirdeyeTopVolume({});
    expect(birdeyeFirst).toEqual([]);

    const birdeyeTokens = await fetchBirdeyeTopVolume({});
    expect(birdeyeTokens).toEqual([{ address: "x1", symbol: "SYM" }]);
    expect(warnSpy).toHaveBeenCalled();
  });
});
