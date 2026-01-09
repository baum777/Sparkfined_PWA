import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { HeliusAdapter } from "../adapters/helius";

function makeJsonRpcResult(result: unknown) {
  return { jsonrpc: "2.0", id: "1", result };
}

function makeResponse(status: number, body: unknown) {
  return {
    status,
    headers: new Headers(),
    json: async () => body,
  } as unknown as Response;
}

describe("HeliusAdapter", () => {
  const mint = "So11111111111111111111111111111111111111112";

  beforeEach(() => {
    process.env.HELIUS_API_KEY = "test-key";
    process.env.HELIUS_RPC_URL = "https://example.invalid/rpc?api-key=test-key";
    process.env.HELIUS_DAS_RPC_URL = "https://example.invalid/das?api-key=test-key";
    process.env.HELIUS_TIMEOUT_MS = "1000";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("computes riskFlags from DAS token_info authorities", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const req = JSON.parse(String(init?.body ?? "{}")) as { method?: string };
      switch (req.method) {
        case "getAsset":
          return makeResponse(
            200,
            makeJsonRpcResult({
              id: mint,
              token_info: {
                mint_authority: "MintAuthPubkey1111111111111111111111111111",
                freeze_authority: null,
                supply: "1000",
                decimals: 0,
              },
            })
          );
        case "getTokenSupply":
          return makeResponse(
            200,
            makeJsonRpcResult({
              value: { amount: "1000", decimals: 0, uiAmount: 1000, uiAmountString: "1000" },
            })
          );
        case "getTokenLargestAccounts":
          return makeResponse(
            200,
            makeJsonRpcResult({
              value: Array.from({ length: 10 }, (_, i) => ({
                address: `Acct${i}`,
                amount: i === 0 ? "700" : "0",
                decimals: 0,
                uiAmount: i === 0 ? 700 : 0,
                uiAmountString: i === 0 ? "700" : "0",
              })),
            })
          );
        case "getTransactionsForAddress":
          return makeResponse(
            200,
            makeJsonRpcResult({
              transactions: [],
            })
          );
        default:
          return makeResponse(500, { error: "unexpected" });
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new HeliusAdapter();
    const pack = await adapter.getFeaturePack(
      mint,
      { shortWindowSec: 3600, baselineWindowSec: 86400 },
      1_700_000_000
    );

    expect(pack.availability.riskFlags).toBe(true);
    expect(pack.riskFlags.mintAuthorityActive.value).toBe(true);
    expect(pack.riskFlags.freezeAuthorityActive.value).toBe(false);
    expect(pack.riskFlags.largeHolderDominance.value).toBe(true); // 700/1000 > 0.60
  });

  it("computes holders.concentrationTop10Pct using getTokenLargestAccounts + getTokenSupply", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const req = JSON.parse(String(init?.body ?? "{}")) as { method?: string };
      switch (req.method) {
        case "getTokenSupply":
          return makeResponse(
            200,
            makeJsonRpcResult({
              value: { amount: "1000", decimals: 0, uiAmount: 1000, uiAmountString: "1000" },
            })
          );
        case "getTokenLargestAccounts":
          return makeResponse(
            200,
            makeJsonRpcResult({
              value: [
                { address: "A", amount: "400", decimals: 0, uiAmount: 400, uiAmountString: "400" },
                { address: "B", amount: "300", decimals: 0, uiAmount: 300, uiAmountString: "300" },
              ],
            })
          );
        case "getTransactionsForAddress":
          return makeResponse(200, makeJsonRpcResult({ transactions: [] }));
        case "getAsset":
          return makeResponse(200, makeJsonRpcResult({ token_info: { mint_authority: null, freeze_authority: null } }));
        default:
          return makeResponse(500, { error: "unexpected" });
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new HeliusAdapter();
    const pack = await adapter.getFeaturePack(
      mint,
      { shortWindowSec: 3600, baselineWindowSec: 86400 },
      1_700_000_000
    );

    expect(pack.availability.holders).toBe(true);
    expect(pack.holders.concentrationTop10Pct).toBeCloseTo(0.7, 6);
    expect(pack.holders.current).toBeNull();
  });

  it("computes activity txCount using getTransactionsForAddress paginationToken and stops after cutoff", async () => {
    const asOfTs = 1_700_000_000;
    const baselineWindowSec = 86_400; // 1 day
    const shortWindowSec = 3600; // 1 hour
    const baselineCutoff = asOfTs - baselineWindowSec;

    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const req = JSON.parse(String(init?.body ?? "{}")) as { method?: string; params?: unknown[] };
      switch (req.method) {
        case "getTransactionsForAddress": {
          const cfg = (req.params?.[1] ?? {}) as Record<string, unknown>;
          const token = cfg.paginationToken as string | undefined;
          if (!token) {
            return makeResponse(
              200,
              makeJsonRpcResult({
                transactions: [
                  { blockTime: asOfTs - 100 }, // short+baseline
                  { blockTime: asOfTs - 5000 }, // baseline only (outside short window)
                ],
                paginationToken: "page2",
              })
            );
          }
          return makeResponse(
            200,
            makeJsonRpcResult({
              transactions: [
                { blockTime: baselineCutoff - 10 }, // older than baseline cutoff -> should cause stop after this page
              ],
              paginationToken: "page3-should-not-be-used",
            })
          );
        }
        case "getTokenSupply":
          return makeResponse(
            200,
            makeJsonRpcResult({
              value: { amount: "1", decimals: 0, uiAmount: 1, uiAmountString: "1" },
            })
          );
        case "getTokenLargestAccounts":
          return makeResponse(200, makeJsonRpcResult({ value: [] }));
        case "getAsset":
          return makeResponse(200, makeJsonRpcResult({ token_info: { mint_authority: null, freeze_authority: null } }));
        default:
          return makeResponse(500, { error: "unexpected" });
      }
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new HeliusAdapter();
    const pack = await adapter.getFeaturePack(
      mint,
      { shortWindowSec, baselineWindowSec },
      asOfTs
    );

    expect(pack.availability.activity).toBe(true);
    expect(pack.activity.txCount.short).toBe(1);
    expect(pack.activity.txCount.baseline).toBe(2);

    const calls = fetchMock.mock.calls.map((c) => JSON.parse(String((c[1] as RequestInit | undefined)?.body ?? "{}")).method);
    const txCalls = calls.filter((m) => m === "getTransactionsForAddress");
    expect(txCalls.length).toBe(2);
  });

  it("has a stable deterministic fingerprint", () => {
    const adapter = new HeliusAdapter();
    expect(adapter.fingerprint()).toBe("helius@1.0.0:activity,holders,riskFlags");
  });
});

