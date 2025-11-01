export type OhlcPoint = { t: number; o: number; h: number; l: number; c: number; v?: number };
export type FetchOhlcParams = { address: string; tf: "1m"|"5m"|"15m"|"1h"|"4h"|"1d" };

export async function fetchOhlc(p: FetchOhlcParams, timeoutMs = 6000): Promise<OhlcPoint[]> {
  const q = new URLSearchParams({ address: p.address, tf: p.tf });
  const url = `/api/market/ohlc?${q.toString()}`;
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const arr = Array.isArray(json?.ohlc) ? json.ohlc : [];
    return arr.filter(isOhlc);
  } finally {
    clearTimeout(t);
  }
}

function isOhlc(x: any): x is OhlcPoint {
  return x && typeof x.t==="number" && ["o","h","l","c"].every(k => typeof x[k]==="number");
}
