import type { VercelRequest, VercelResponse } from '@vercel/node';

type Ohlc = { t: number; o: number; h: number; l: number; c: number; v?: number };

const MORALIS_BASE = process.env.MORALIS_BASE || 'https://deep-index.moralis.io/api/v2.2';
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || '';
const CACHE_TTL = 10_000; // 10 seconds

type CacheEntry = { ts: number; data: Ohlc[] };
const cache: Record<string, CacheEntry> = {};

function ensureAuthorized(req: VercelRequest, res: VercelResponse): boolean {
  const secret = process.env.DATA_PROXY_SECRET?.trim();
  const env = process.env.NODE_ENV ?? 'production';
  const isProd = env === 'production';

  if (!secret) {
    if (!isProd) {
      console.warn('[moralis/ohlc] DATA_PROXY_SECRET missing – allowing request in non-production');
      return true;
    }
    res.status(503).json({ ok: false, error: 'data proxy disabled', provider: 'moralis' });
    return false;
  }

  const value = req.headers['authorization'];
  const header = Array.isArray(value) ? value[0] : value;
  if (!header) {
    res.status(401).json({ ok: false, error: 'unauthorized', provider: 'moralis' });
    return false;
  }

  const [scheme, token] = header.split(' ', 2);
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer' || token.trim() !== secret) {
    res.status(403).json({ ok: false, error: 'unauthorized', provider: 'moralis' });
    return false;
  }

  return true;
}

function normalizeRows(rows: any[]): Ohlc[] {
  return rows
    .map((row: any) => ({
      t: Number(row.t ?? row.time ?? row.timestamp),
      o: Number(row.o ?? row.open),
      h: Number(row.h ?? row.high),
      l: Number(row.l ?? row.low),
      c: Number(row.c ?? row.close),
      v: row.v != null ? Number(row.v ?? row.volume) : row.volume != null ? Number(row.volume) : undefined,
    }))
    .filter((x) =>
      Number.isFinite(x.t) &&
      Number.isFinite(x.o) &&
      Number.isFinite(x.h) &&
      Number.isFinite(x.l) &&
      Number.isFinite(x.c)
    );
}

function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

async function fetchMoralisOhlc(address: string, tf: string, limit: number): Promise<Ohlc[]> {
  const url = `${MORALIS_BASE}/erc20/${encodeURIComponent(address)}/ohlc?chain=solana&interval=${encodeURIComponent(tf)}&limit=${limit}`;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (MORALIS_API_KEY) headers['X-API-Key'] = MORALIS_API_KEY;

  const response = await fetch(url, { headers, cache: 'no-store' });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Moralis HTTP ${response.status}: ${text}`);
  }

  const raw = await response.json();
  const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  return normalizeRows(rows);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'method not allowed', provider: 'moralis' });
  }

  if (!ensureAuthorized(req, res)) {
    return;
  }

  if (!MORALIS_API_KEY) {
    return res.status(503).json({ ok: false, error: 'moralis api key missing', provider: 'moralis' });
  }

  const address = String(req.query.address || '').trim();
  const tf = String(req.query.tf || '15m');
  const limit = Number(req.query.limit ?? 600);

  if (!address || !isValidSolanaAddress(address)) {
    return res.status(400).json({ ok: false, error: 'invalid address', provider: 'moralis' });
  }

  if (!Number.isFinite(limit) || limit <= 0 || limit > 1000) {
    return res.status(400).json({ ok: false, error: 'invalid limit', provider: 'moralis' });
  }

  const cacheKey = `${address}:${tf}:${limit}`;
  const now = Date.now();
  const cached = cache[cacheKey];
  if (cached && now - cached.ts < CACHE_TTL) {
    res.setHeader('Cache-Control', 'public, max-age=10, s-maxage=10, stale-while-revalidate=30');
    return res.status(200).json({ ok: true, data: cached.data, provider: 'moralis', cached: true });
  }

  try {
    const data = await fetchMoralisOhlc(address, tf, limit);
    cache[cacheKey] = { ts: now, data };
    res.setHeader('Cache-Control', 'public, max-age=10, s-maxage=10, stale-while-revalidate=30');
    return res.status(200).json({ ok: true, data, provider: 'moralis', cached: false });
  } catch (error) {
    console.error('[moralis/ohlc] error fetching data', error);
    return res.status(502).json({
      ok: false,
      error: error instanceof Error ? error.message : 'moralis request failed',
      provider: 'moralis',
    });
  }
}
