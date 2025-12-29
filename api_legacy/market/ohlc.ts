export const runtime = "nodejs";

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Providers } from "../../src.legacy/config/providers";
import { incrementFallback } from "../../src.legacy/lib/metrics/providerFallback";

type Ohlc = { t: number; o: number; h: number; l: number; c: number; v?: number };

async function fetchJSON<T>(url: string, init: RequestInit = {}, timeoutMs = 5000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return (await res.json()) as T;
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
      const res: any = await fetchJSON(url, init, 5000);
      const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const address = String(req.query.address || "");
  const tf = String(req.query.tf || "15m");
  const limit = Number(req.query.limit ?? 600);
  if (!address) return res.status(400).json({ error: "Missing address" });

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
  return res.status(200).json({ ts: new Date().toISOString(), tf, ohlc: ohlc ?? [] });
}
