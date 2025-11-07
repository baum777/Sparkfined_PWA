import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Providers } from "../../src/config/providers";

type Ohlc = { t: number; o: number; h: number; l: number; c: number; v?: number };

async function fetchJSON<T>(url: string, init: RequestInit = {}, timeoutMs = 5000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.json() as T;
  } finally { clearTimeout(t); }
}

// Try DexPaprika first — adjust paths as plan dictates; otherwise fall back to Dexscreener stub
async function fromDexPaprika(address: string, tf: string): Promise<Ohlc[] | null> {
  const base = (Providers.dexpaprika?.base || "").replace(/\/+$/, "");
  if (!base) return null;
  const rawHeaders = Providers.dexpaprika.headers?.();
  const headers: Record<string, string> = rawHeaders && Object.keys(rawHeaders).length > 0 ? rawHeaders : undefined as any;
  const candidates = [
    `/v1/ohlc/${encodeURIComponent(address)}?tf=${encodeURIComponent(tf)}`,
    `/ohlc/${encodeURIComponent(address)}?tf=${encodeURIComponent(tf)}`
  ];
  for (const path of candidates) {
    try {
      const url = `${base}${path}`;
      const res: any = await fetchJSON(url, headers ? { headers } : {}, 5000);
      const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const out = arr.map((row: any) => {
        if (Array.isArray(row)) {
          const [t,o,h,l,c,v] = row;
          return { t:Number(t), o:Number(o), h:Number(h), l:Number(l), c:Number(c), v: v!=null?Number(v):undefined };
        }
        return {
          t: Number(row.t ?? row.time ?? row.timestamp),
          o: Number(row.o ?? row.open),
          h: Number(row.h ?? row.high),
          l: Number(row.l ?? row.low),
          c: Number(row.c ?? row.close),
          v: row.v!=null?Number(row.v):undefined
        };
      }).filter((x: Ohlc) => Number.isFinite(x.t) && Number.isFinite(x.o) && Number.isFinite(x.h) && Number.isFinite(x.l) && Number.isFinite(x.c));
      if (out.length) return out;
    } catch { /* try next */ }
  }
  return null;
}

// Fallback: Dexscreener does not guarantee OHLC via public endpoints → return empty to keep UI responsive
async function fromDexscreener(_address: string, _tf: string): Promise<Ohlc[] | null> {
  return [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const address = String(req.query.address || "");
  const tf = String(req.query.tf || "15m");
  if (!address) return res.status(400).json({ error: "Missing address" });
  let ohlc = await fromDexPaprika(address, tf);
  if (!ohlc) ohlc = await fromDexscreener(address, tf);
  return res.status(200).json({ ts: new Date().toISOString(), tf, ohlc: ohlc ?? [] });
}
