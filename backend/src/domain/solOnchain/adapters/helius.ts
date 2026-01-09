import { randomUUID } from "node:crypto";

import { getHeliusEnv } from "../../../config/env";
import {
  createEmptyOnchainFeaturePack,
  type FeatureKey,
  type OnchainFeaturePack,
  type ProviderDescriptor,
} from "../onchainFeaturePack";
import type { ActivityWindows, SolanaOnchainProvider } from "../solanaOnchainProvider";
import type {
  HeliusDasAsset,
  JsonRpcRequest,
  JsonRpcResponse,
  TokenLargestAccountsResult,
  TokenSupplyResult,
  TransactionsForAddressResult,
} from "./helius.types";

type RpcParams = unknown[] | Record<string, unknown>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function parseBigIntLoose(v: string | number | undefined | null): bigint | null {
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return null;
    try {
      return BigInt(s);
    } catch {
      return null;
    }
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    // Numbers may be unsafe if huge; but used only as a fallback.
    try {
      return BigInt(Math.trunc(v));
    } catch {
      return null;
    }
  }
  return null;
}

function ratioAsNumber(numerator: bigint, denominator: bigint): number | null {
  if (denominator === 0n) return null;
  if (numerator === 0n) return 0;
  // Scale to 1e6 to keep deterministic, avoid float overflow.
  const scaled = (numerator * 1_000_000n) / denominator;
  return Number(scaled) / 1_000_000;
}

async function fetchJsonWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  requestId: string
): Promise<{ status: number; json: unknown; headers: Headers }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = new Headers(init.headers);
    if (!headers.has("content-type")) headers.set("content-type", "application/json");
    if (!headers.has("x-request-id")) headers.set("x-request-id", requestId);

    const res = await fetch(url, { ...init, headers, signal: controller.signal });
    const status = res.status;
    const json = (await res.json().catch(() => null)) as unknown;
    return { status, json, headers: res.headers };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  opts: {
    maxAttempts: number;
    baseDelayMs: number;
  }
): Promise<T> {
  let attempt = 0;
  let lastErr: unknown;
  while (attempt < opts.maxAttempts) {
    attempt += 1;
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt >= opts.maxAttempts) break;
      const backoff = opts.baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 50);
      await sleep(backoff + jitter);
    }
  }
  throw lastErr;
}

async function rpcCall<TResult>(
  rpcUrl: string,
  timeoutMs: number,
  method: string,
  params: RpcParams
): Promise<TResult> {
  const requestId = randomUUID();
  const body: JsonRpcRequest<RpcParams> = {
    jsonrpc: "2.0",
    id: "1",
    method,
    params,
  };

  const { status, json } = await withRetry(
    async () => {
      const res = await fetchJsonWithTimeout(
        rpcUrl,
        { method: "POST", body: JSON.stringify(body) },
        timeoutMs,
        requestId
      );

      if (res.status === 429) {
        throw new Error(`[helius] rate_limited method=${method} status=429`);
      }
      if (res.status < 200 || res.status >= 300) {
        throw new Error(`[helius] http_error method=${method} status=${res.status}`);
      }
      return res;
    },
    { maxAttempts: 3, baseDelayMs: 250 }
  );

  const parsed = json as JsonRpcResponse<TResult>;
  if (parsed?.error) {
    throw new Error(
      `[helius] rpc_error method=${method} code=${parsed.error.code} message=${parsed.error.message}`
    );
  }
  if (parsed?.result === undefined) {
    throw new Error(`[helius] rpc_error method=${method} missing_result`);
  }
  return parsed.result;
}

async function dasGetAsset(dasRpcUrl: string, timeoutMs: number, id: string): Promise<HeliusDasAsset> {
  // Helius DAS is a JSON-RPC method called "getAsset" with params { id }.
  return await rpcCall<HeliusDasAsset>(dasRpcUrl, timeoutMs, "getAsset", { id });
}

async function getTokenSupplyUiAmount(
  rpcUrl: string,
  timeoutMs: number,
  mint: string,
  dasFallback?: { dasRpcUrl: string }
): Promise<{ supplyAmount: bigint; decimals: number } | null> {
  try {
    const res = await rpcCall<TokenSupplyResult>(rpcUrl, timeoutMs, "getTokenSupply", [mint]);
    const amount = parseBigIntLoose(res?.value?.amount);
    const decimals = res?.value?.decimals;
    if (amount === null || typeof decimals !== "number") return null;
    return { supplyAmount: amount, decimals };
  } catch {
    // best-effort fallback to DAS token_info.supply/decimals
    if (!dasFallback) return null;
    try {
      const asset = await dasGetAsset(dasFallback.dasRpcUrl, timeoutMs, mint);
      const amount = parseBigIntLoose(asset?.token_info?.supply as unknown as string | number);
      const decimals = asset?.token_info?.decimals;
      if (amount === null || typeof decimals !== "number") return null;
      return { supplyAmount: amount, decimals };
    } catch {
      return null;
    }
  }
}

async function getTop10ConcentrationPct(
  rpcUrl: string,
  timeoutMs: number,
  mint: string,
  dasRpcUrl: string
): Promise<number | null> {
  const supply = await getTokenSupplyUiAmount(rpcUrl, timeoutMs, mint, { dasRpcUrl });
  if (!supply) return null;

  const largest = await rpcCall<TokenLargestAccountsResult>(
    rpcUrl,
    timeoutMs,
    "getTokenLargestAccounts",
    [mint]
  );

  const top10 = (largest?.value ?? []).slice(0, 10);
  let sumTop10 = 0n;
  for (const row of top10) {
    const a = parseBigIntLoose(row?.amount);
    if (a !== null) sumTop10 += a;
  }

  return ratioAsNumber(sumTop10, supply.supplyAmount);
}

async function getTxCountsForMint(
  rpcUrl: string,
  timeoutMs: number,
  mint: string,
  windows: ActivityWindows,
  asOfTs: number
): Promise<{ short: number; baseline: number; pagesFetched: number }> {
  const shortCutoff = asOfTs - windows.shortWindowSec;
  const baselineCutoff = asOfTs - windows.baselineWindowSec;

  let shortCount = 0;
  let baselineCount = 0;
  let paginationToken: string | undefined = undefined;
  let pagesFetched = 0;

  const maxPages = 10;
  while (pagesFetched < maxPages) {
    pagesFetched += 1;

    const config: Record<string, unknown> = {
      transactionDetails: "signatures",
      limit: 100,
      sortOrder: "desc",
    };
    if (paginationToken) config.paginationToken = paginationToken;

    const res = await rpcCall<TransactionsForAddressResult>(
      rpcUrl,
      timeoutMs,
      "getTransactionsForAddress",
      [mint, config]
    );

    const txs = res?.transactions ?? [];
    let minBlockTimeInPage: number | null = null;
    for (const tx of txs) {
      const bt = tx?.blockTime;
      if (typeof bt !== "number" || !Number.isFinite(bt)) continue;
      if (bt > asOfTs) continue;

      if (minBlockTimeInPage === null || bt < minBlockTimeInPage) minBlockTimeInPage = bt;
      if (bt >= baselineCutoff) baselineCount += 1;
      if (bt >= shortCutoff) shortCount += 1;
    }

    paginationToken = res?.paginationToken;

    const baselineCovered = minBlockTimeInPage !== null && minBlockTimeInPage < baselineCutoff;
    if (baselineCovered) break;
    if (!paginationToken) break;
  }

  return { short: shortCount, baseline: baselineCount, pagesFetched };
}

function addAvailabilityNote(
  pack: OnchainFeaturePack,
  key: FeatureKey,
  note: string
): void {
  const notes = (pack.availability.notes ??= {});
  const arr = (notes[key] ??= []);
  arr.push(note);
}

export class HeliusAdapter implements SolanaOnchainProvider {
  readonly tag = "helius";
  readonly version = "1.0.0";

  capabilities() {
    return {
      activity: true,
      holders: true,
      flows: false,
      liquidity: false,
      riskFlags: true,
    };
  }

  fingerprint(): string {
    const caps = this.capabilities();
    const enabled = (Object.keys(caps) as Array<keyof typeof caps>)
      .filter((k) => caps[k])
      .sort()
      .join(",");
    return `${this.tag}@${this.version}:${enabled}`;
  }

  async getFeaturePack(mint: string, windows: ActivityWindows, asOfTs: number): Promise<OnchainFeaturePack> {
    const helius = getHeliusEnv();
    const provider: ProviderDescriptor = {
      tag: this.tag,
      version: this.version,
      fingerprint: this.fingerprint(),
    };

    const pack = createEmptyOnchainFeaturePack(provider, mint, asOfTs);

    // Flows & liquidity: explicit v1 unavailability.
    addAvailabilityNote(
      pack,
      "flows",
      "not implemented in v1; planned via Enhanced Transactions parsing"
    );
    addAvailabilityNote(
      pack,
      "liquidity",
      "not implemented in v1; planned via Enhanced Transactions parsing"
    );

    // Holders + activity in parallel (best-effort).
    const [holdersRes, activityRes] = await Promise.allSettled([
      (async () => {
        const concentrationTop10Pct = await getTop10ConcentrationPct(
          helius.rpcUrl,
          helius.timeoutMs,
          mint,
          helius.dasRpcUrl
        );
        if (typeof concentrationTop10Pct !== "number" || !Number.isFinite(concentrationTop10Pct)) {
          throw new Error("[helius] holders concentration unavailable");
        }
        return { concentrationTop10Pct };
      })(),
      (async () => {
        const txCount = await getTxCountsForMint(helius.rpcUrl, helius.timeoutMs, mint, windows, asOfTs);
        return txCount;
      })(),
    ]);

    if (holdersRes.status === "fulfilled") {
      pack.availability.holders = true;
      pack.holders.concentrationTop10Pct = holdersRes.value.concentrationTop10Pct;
      pack.holders.current = null;
      pack.holders.holdersDeltaPct = { short: null, baseline: null };
      addAvailabilityNote(
        pack,
        "holders",
        "holder count not computed (v1); only concentrationTop10Pct available"
      );
    } else {
      pack.availability.holders = false;
      pack.holders = createEmptyOnchainFeaturePack(provider, mint, asOfTs).holders;
      addAvailabilityNote(pack, "holders", "unavailable (rate limit, timeout, or RPC error)");
    }

    if (activityRes.status === "fulfilled") {
      pack.availability.activity = true;
      pack.activity.txCount = { short: activityRes.value.short, baseline: activityRes.value.baseline };
      pack.activity.uniqueWallets = { short: null, baseline: null };
      addAvailabilityNote(
        pack,
        "activity",
        "uniqueWallets not available in v1 (signatures-only mode)"
      );
      addAvailabilityNote(pack, "activity", `pagesFetched=${activityRes.value.pagesFetched}`);
    } else {
      pack.availability.activity = false;
      pack.activity = createEmptyOnchainFeaturePack(provider, mint, asOfTs).activity;
      addAvailabilityNote(pack, "activity", "unavailable (rate limit, timeout, or RPC error)");
    }

    // Risk flags (depends on DAS getAsset; largeHolderDominance is best-effort from holders concentration).
    try {
      const asset = await dasGetAsset(helius.dasRpcUrl, helius.timeoutMs, mint);
      const ti = asset?.token_info;
      if (!ti) {
        throw new Error("[helius] getAsset missing token_info");
      }

      const mintAuth = ti.mint_authority;
      const freezeAuth = ti.freeze_authority;

      const mintAuthorityActive = hasNonEmptyString(mintAuth);
      const freezeAuthorityActive = hasNonEmptyString(freezeAuth);

      pack.availability.riskFlags = true;
      pack.riskFlags.mintAuthorityActive = {
        value: mintAuthorityActive,
        why: mintAuthorityActive ? `mint_authority=${mintAuth}` : "mint_authority is null/empty",
      };
      pack.riskFlags.freezeAuthorityActive = {
        value: freezeAuthorityActive,
        why: freezeAuthorityActive ? `freeze_authority=${freezeAuth}` : "freeze_authority is null/empty",
      };
      pack.riskFlags.suddenSupplyChange = {
        value: null,
        why: "requires historical supply series (not implemented in v1)",
      };

      const concentration = pack.holders.concentrationTop10Pct;
      if (typeof concentration === "number" && Number.isFinite(concentration)) {
        const dominant = concentration > 0.6;
        pack.riskFlags.largeHolderDominance = {
          value: dominant,
          why: `concentrationTop10Pct=${concentration.toFixed(6)} threshold=0.60`,
        };
      } else {
        pack.riskFlags.largeHolderDominance = {
          value: null,
          why: "requires holders concentrationTop10Pct (unavailable)",
        };
      }
    } catch {
      pack.availability.riskFlags = false;
      pack.riskFlags = createEmptyOnchainFeaturePack(provider, mint, asOfTs).riskFlags;
      addAvailabilityNote(pack, "riskFlags", "unavailable (DAS getAsset error or missing token_info)");
    }

    return pack;
  }
}

