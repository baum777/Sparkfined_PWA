import type { OhlcPoint } from "./CandlesCanvas";

export function sma(points: OhlcPoint[], period: number): Array<number | undefined> {
  const out: Array<number | undefined> = new Array(points.length).fill(undefined);
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (!p) continue;
    sum += p.c;
    if (i >= period) {
      const old = points[i - period];
      if (old) sum -= old.c;
    }
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

export function ema(points: OhlcPoint[], period: number): Array<number | undefined> {
  const out: Array<number | undefined> = new Array(points.length).fill(undefined);
  if (period <= 1 || points.length === 0) return out;
  const k = 2 / (period + 1);
  // seed: SMA of first period
  let seed = 0;
  for (let i = 0; i < Math.min(period, points.length); i++) {
    const p = points[i];
    if (p) seed += p.c;
  }
  if (points.length >= period) {
    let prev = seed / period;
    for (let i = period - 1; i < points.length; i++) {
      const point = points[i];
      if (!point) continue;
      const cur = i === (period - 1) ? prev : (point.c - prev) * k + prev;
      out[i] = cur;
      prev = cur;
    }
  }
  return out;
}

export function vwap(points: OhlcPoint[]): Array<number | undefined> {
  // VWAP uses typical price * volume cumulative / cumulative volume
  const out: Array<number | undefined> = new Array(points.length).fill(undefined);
  let cumPV = 0;
  let cumV = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (!p) continue;
    const vol = typeof p.v === "number" && p.v > 0 ? p.v : 1; // fallback if volume missing
    const typical = (p.h + p.l + p.c) / 3;
    cumPV += typical * vol;
    cumV += vol;
    out[i] = cumV > 0 ? cumPV / cumV : undefined;
  }
  return out;
}
