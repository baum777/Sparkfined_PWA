// api/market.ts
// Consolidated Market Data API
// Consolidates: api/data/ohlc, api/market/ohlc, api/dexpaprika/tokens/[address], api/mcap (4→1)
// Routes:
//   GET /api/market?action=ohlc&address=X&tf=15m[&auth=true] → OHLC data (optional Bearer auth)
//   GET /api/market?action=token&address=X                    → Token info from DexPaprika (Bearer auth)
//   GET /api/market?action=mcap                               → Market cap (mock)

export const runtime = "nodejs";

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Providers } from "../src/config/providers";
import { incrementFallback } from "../src/lib/metrics/providerFallback";

type Ohlc = { t: number; o: number; h: number; l: number; c: number; v?: number };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const action = String(req.query.action || "");

  try {
    switch (action) {
      case "ohlc":
        return handleOHLC(req, res);
      case "token":
        return handleToken(req, res);
      case "mcap":
        return handleMcap(req, res);
      default:
        return res.status(400).json({
          error: "Unknown action. Use ?action=ohlc|token|mcap",
        });
    }
  } catch (error: any) {
    console.error("[market] Handler error:", error);
    return res.status(500).json({ error: error.message || "Internal error" });
  }
}

// ============================================================================
// OHLC
// ============================================================================

async function handleOHLC(req: VercelRequest, res: VercelResponse) {
  const requireAuth = req.query.auth === "true";

  if (requireAuth) {
    if (!ensureDataProxyAuthorized(req, res, "ohlc")) {
      return;
    }
  }

  const address = String(req.query.address || "");
  const tf = String(req.query.tf || "15m");
  const limit = Number(req.query.limit ?? 600);

  if (!address) {
    return res.status(400).json({ error: "Missing address" });
  }

  if (!isLikelySolanaAddress(address)) {
    return res.status(400).json({ error: "Invalid Solana address" });
  }

  if (!Number.isFinite(limit) || limit <= 0 || limit > 1000) {
    return res.status(400).json({ error: "Invalid limit (1-1000)" });
  }

  let ohlc = await fromDexPaprika(address, tf, limit);
  if (!ohlc) {
    incrementFallback("moralis");
    ohlc = await fromMoralisProxy(req, address, tf, limit);
  }
  if (!ohlc) {
    incrementFallback("dexscreener");
    ohlc = await fromDexscreener(address, tf);
  }

  res.setHeader("Cache-Control", "public, max-age=10, s-maxage=10, stale-while-revalidate=30");

  // For auth=true, return in old format: { ok, data, provider }
  if (requireAuth) {
    return res.status(200).json({
      ok: true,
      data: ohlc ?? [],
      provider: ohlc && ohlc.length > 0 ? "dexpaprika" : "none",
    });
  }

  // For no-auth, return in old format: { ts, tf, ohlc }
  return res.status(200).json({
    ts: new Date().toISOString(),
    tf,
    ohlc: ohlc ?? [],
  });
}

async function fetchJSON<T>(url: string, init: RequestInit = {}, timeoutMs = 5000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: ctrl.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

function normalizeRows(rows: any[]): Ohlc[] {
  return rows
    .map((row: any) => {
      if (Array.isArray(row)) {
        const [t, o, h, l, c, v] = row;
        return {
          t: Number(t),
          o: Number(o),
          h: Number(h),
          l: Number(l),
          c: Number(c),
          v: v != null ? Number(v) : undefined,
        } as Ohlc;
      }

      return {
        t: Number(row.t ?? row.time ?? row.timestamp),
        o: Number(row.o ?? row.open),
        h: Number(row.h ?? row.high),
        l: Number(row.l ?? row.low),
        c: Number(row.c ?? row.close),
        v: row.v != null ? Number(row.v) : undefined,
      } as Ohlc;
    })
    .filter(
      (x: Ohlc) =>
        Number.isFinite(x.t) &&
        Number.isFinite(x.o) &&
        Number.isFinite(x.h) &&
        Number.isFinite(x.l) &&
        Number.isFinite(x.c)
    );
}

async function fromDexPaprika(address: string, tf: string, limit: number): Promise<Ohlc[] | null> {
  const base = (Providers.dexpaprika?.base || "").replace(/\/+$/, "");
  if (!base) return null;
  const rawHeaders = Providers.dexpaprika.headers?.();
  const headers = rawHeaders && Object.keys(rawHeaders).length > 0 ? { ...rawHeaders } : undefined;
  const candidates = [
    `/v1/ohlc/${encodeURIComponent(address)}?tf=${encodeURIComponent(tf)}&limit=${limit}`,
    `/ohlc/${encodeURIComponent(address)}?tf=${encodeURIComponent(tf)}&limit=${limit}`,
  ];
  for (const path of candidates) {
    try {
      const url = `${base}${path}`;
      const init: RequestInit = headers ? { headers } : {};
      const response: any = await fetchJSON(url, init, 5000);
      const arr = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      const out = normalizeRows(arr);
      if (out.length) return out;
    } catch {
      // continue trying other candidates
    }
  }
  return null;
}

function resolveOrigin(req: VercelRequest): string {
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = req.headers.host || process.env.VERCEL_URL;
  if (!host) return "http://localhost:3000";
  if (/^https?:\/\//.test(host)) return host;
  return `${proto}://${host}`;
}

async function fromMoralisProxy(
  req: VercelRequest,
  address: string,
  tf: string,
  limit: number
): Promise<Ohlc[] | null> {
  const origin = resolveOrigin(req).replace(/\/$/, "");
  const url = `${origin}/api/moralis/ohlc?address=${encodeURIComponent(address)}&tf=${encodeURIComponent(tf)}&limit=${limit}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  const secret = process.env.DATA_PROXY_SECRET?.trim();
  if (secret) headers.Authorization = `Bearer ${secret}`;
  try {
    const response = await fetchJSON<{ ok: boolean; data?: Ohlc[] }>(url, { headers }, 6000);
    if (response.ok && Array.isArray(response.data)) {
      return normalizeRows(response.data);
    }
  } catch {
    // swallow and return null to allow final fallback
  }
  return null;
}

async function fromDexscreener(_address: string, _tf: string): Promise<Ohlc[] | null> {
  return [];
}

function isLikelySolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(address);
}

// ============================================================================
// TOKEN (DexPaprika proxy)
// ============================================================================

async function handleToken(req: VercelRequest, res: VercelResponse) {
  if (!ensureDataProxyAuthorized(req, res, "dexpaprika")) {
    return;
  }

  const address = req.query.address;

  if (!address || typeof address !== "string") {
    return res.status(400).json({
      success: false,
      error: "Address parameter required",
      provider: "dexpaprika",
    });
  }

  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Solana address format",
      provider: "dexpaprika",
    });
  }

  try {
    const DEXPAPRIKA_BASE = process.env.DEXPAPRIKA_BASE || "https://api.dexpaprika.com";
    const DEXPAPRIKA_API_KEY = process.env.DEXPAPRIKA_API_KEY || "";
    const apiUrl = `${DEXPAPRIKA_BASE}/v1/solana/tokens/${address}`;

    const headers: HeadersInit = {
      Accept: "application/json",
    };

    if (DEXPAPRIKA_API_KEY) {
      headers.Authorization = `Bearer ${DEXPAPRIKA_API_KEY}`;
    }

    const response = await fetchWithRetry(apiUrl, { headers });
    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({
        success: true,
        data,
        provider: "dexpaprika",
      });
    } else {
      return res.status(response.status).json({
        success: false,
        error: data.error || data.message || "Request failed",
        provider: "dexpaprika",
      });
    }
  } catch (error) {
    console.error("[DexPaprika Proxy] Error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        error: "Request timeout",
        provider: "dexpaprika",
      });
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      provider: "dexpaprika",
    });
  }
}

function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 1
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout(url, options, 5000);
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error("Request failed after retries");
}

// ============================================================================
// MCAP (Mock)
// ============================================================================

async function handleMcap(req: VercelRequest, res: VercelResponse) {
  try {
    const mcap = 3_500_000;

    return res.status(200).json({
      mcap,
      timestamp: Date.now(),
      source: "mock",
      note: "Mock value - Pyth integration pending (Issue #2)",
    });
  } catch (error: unknown) {
    console.error("[API /mcap] Error:", error);

    const err = error as { message?: string };
    return res.status(500).json({
      error: "Failed to fetch market cap",
      message: err.message || "Unknown error",
    });
  }
}

// ============================================================================
// AUTH HELPER
// ============================================================================

function ensureDataProxyAuthorized(
  req: VercelRequest,
  res: VercelResponse,
  provider: "moralis" | "dexpaprika" | "ohlc"
): boolean {
  const secret = process.env.DATA_PROXY_SECRET?.trim();
  const env = process.env.NODE_ENV ?? "production";
  const isProd = env === "production";

  if (!secret) {
    if (!isProd) {
      console.warn(
        `[${provider}] DATA_PROXY_SECRET not set – allowing request in non-production environment`
      );
      return true;
    }
    res.status(503).json({
      success: false,
      error: "Data proxy disabled",
      provider,
    });
    return false;
  }

  const authHeaderValue = req.headers["authorization"];
  const authHeader = Array.isArray(authHeaderValue) ? authHeaderValue[0] : authHeaderValue;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      provider,
    });
    return false;
  }

  const [scheme, token] = authHeader.split(" ", 2);
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      provider,
    });
    return false;
  }

  if (token.trim() !== secret) {
    res.status(403).json({
      success: false,
      error: "Unauthorized",
      provider,
    });
    return false;
  }

  return true;
}
