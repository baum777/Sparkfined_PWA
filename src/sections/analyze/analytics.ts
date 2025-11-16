export type Ohlc = { t:number;o:number;h:number;l:number;c:number; v?:number };
import { MS, tfMinutes, type TF } from "../../lib/timeframe";

export function pct(a:number, b:number){ return b === 0 ? 0 : ((a - b) / b) * 100; }
export function mean(arr:number[]){ return arr.length ? arr.reduce((s,x)=>s+x,0)/arr.length : 0; }
export function stdev(arr:number[]){ const m=mean(arr); return Math.sqrt(mean(arr.map(x=> (x-m)*(x-m) ))); }

export function returnsClose(data:Ohlc[]) {
  const out:number[] = [];
  for (let i=1;i<data.length;i++){ 
    const curr = data[i];
    const prev = data[i-1];
    if (curr && prev) {
      out.push(Math.log((curr.c || 0) / (prev.c || 1)));
    }
  }
  return out;
}

export function atr(data:Ohlc[], n=14){
  if (data.length < 2) return 0;
  const tr:number[]=[];
  for (let i=1;i<data.length;i++){
    const curr = data[i];
    const prev = data[i-1];
    if (curr && prev) {
      const h = curr.h, l = curr.l, pc = prev.c;
      tr.push(Math.max(h-l, Math.abs(h-pc), Math.abs(l-pc)));
    }
  }
  const m = n<=tr.length ? mean(tr.slice(-n)) : mean(tr);
  return m;
}

export function kpis(data:Ohlc[], tf: TF){
  if (!data.length) return {
    lastClose: 0, change24h: 0, volStdev: 0, atr14: 0, hiLoPerc: 0, volumeSum: 0,
  };
  const last = data[data.length-1];
  if (!last) return {
    lastClose: 0, change24h: 0, volStdev: 0, atr14: 0, hiLoPerc: 0, volumeSum: 0,
  };
  // Präzises 24h-Fenster: über Timestamp nach hinten wandern
  const cutoff = last.t - MS.day;
  let j = data.length-1;
  while (j>0 && data[j]?.t && data[j]!.t >= cutoff) j--;
  const base = data[Math.max(0, j)]?.c ?? data[0]?.c ?? 0;
  const change24h = pct(last.c, base);
  const rets = returnsClose(data);
  // σ in 24h-Fenster, skaliert auf 24h je TF (barsPer24 = 24h / tf)
  const barsPer24 = Math.max(1, Math.floor((MS.day / (tfMinutes(tf)*MS.min))));
  const volStdev = stdev(rets.slice(-barsPer24)) * Math.sqrt(barsPer24);
  const atr14 = atr(data, 14);
  const recent = sliceByTime(data, MS.day);
  const minL = Math.min(...recent.map(d=>d?.l ?? Infinity));
  const maxH = Math.max(...recent.map(d=>d?.h ?? 0));
  const hiLoPerc = pct(maxH, minL);
  const volumeSum = recent.reduce((s,d)=> s + (Number((d as any).v||0)), 0);
  return { lastClose: last.c, change24h, volStdev, atr14, hiLoPerc, volumeSum };
}

export function smaVec(arr:number[], n:number){
  const out:(number|undefined)[] = new Array(arr.length).fill(undefined);
  let acc=0;
  for (let i=0;i<arr.length;i++){
    const val = arr[i];
    if (val !== undefined) {
      acc += val;
    }
    if (i>=n) {
      const oldVal = arr[i-n];
      if (oldVal !== undefined) acc -= oldVal;
    }
    if (i>=n-1) out[i] = acc/n;
  }
  return out;
}
export function emaVec(arr:number[], n:number){
  const out:(number|undefined)[] = new Array(arr.length).fill(undefined);
  const k = 2/(n+1);
  let prev: number | undefined = undefined;
  for (let i=0;i<arr.length;i++){
    const v = arr[i];
    if (v === undefined) continue;
    prev = prev === undefined ? v : (v*k + prev*(1-k));
    if (i>=n-1) out[i] = prev;
  }
  return out;
}

export function signalMatrix(data:Ohlc[]){
  const closes = data.map(d=>d.c);
  const vwaps = vwapVec(data);
  const windows = [9,20,50,200] as const;
  
  // Calculate MACD
  const macdData = macdVec(data);
  const macdSig = macdSignalVec(macdData);
  
  const rows = [
    { id:"SMA", values: windows.map(w => vecSignal(closes, smaVec(closes, w))) },
    { id:"EMA", values: windows.map(w => vecSignal(closes, emaVec(closes, w))) },
    { id:"VWAP", values: [vecSignal(closes, vwaps)] },
    { id:"MACD", values: [macdSig] },
  ];
  return { rows, windows, macd: macdData };
}

// simple vwap per-bar cumulative
export function vwapVec(d:Ohlc[]){
  let pv=0, vv=0;
  const out:(number|undefined)[]=[];
  for (let i=0;i<d.length;i++){
    const bar = d[i];
    if (!bar) continue;
    const v = Number((bar as any).v||0);
    const tp = (bar.h + bar.l + bar.c)/3;
    pv += tp * v; vv += v;
    out.push(vv>0 ? pv/vv : undefined);
  }
  return out;
}

// last-bar signal for an indicator vector
function vecSignal(price:number[], ind:(number|undefined)[]){
  const i = ind.length-1;
  const v = ind[i];
  const p = price[i];
  if (v === undefined || p === undefined) return 0;
  return p > v ? +1 : p < v ? -1 : 0;
}

// slice letzte periodMs relativ zu letztem Punkt
export function sliceByTime<T extends {t:number}>(arr:T[], periodMs:number): T[] {
  if (!arr.length) return [];
  const last = arr[arr.length-1];
  if (!last) return [];
  const end = last.t;
  const startTs = end - periodMs;
  let i = arr.length-1;
  while (i>0 && arr[i]?.t && arr[i]!.t >= startTs) i--;
  return arr.slice(Math.max(0,i), arr.length);
}

// ============================================================================
// MACD Implementation
// ============================================================================

export interface MacdData {
  macd: (number|undefined)[];
  signal: (number|undefined)[];
  histogram: (number|undefined)[];
}

/**
 * Calculate MACD from OHLC data
 * MACD = EMA(12) - EMA(26)
 * Signal = EMA(9) of MACD
 * Histogram = MACD - Signal
 */
export function macdVec(data: Ohlc[], fast=12, slow=26, sig=9): MacdData {
  const closes = data.map(d => d.c);
  
  // Calculate fast and slow EMAs
  const fastEma = emaVec(closes, fast);
  const slowEma = emaVec(closes, slow);
  
  // MACD Line = Fast EMA - Slow EMA
  const macdLine: (number|undefined)[] = [];
  for (let i=0; i<closes.length; i++) {
    const f = fastEma[i];
    const s = slowEma[i];
    if (f !== undefined && s !== undefined) {
      macdLine.push(f - s);
    } else {
      macdLine.push(undefined);
    }
  }
  
  // Signal Line = EMA of MACD
  const signalLine = emaVec(macdLine.map(v => v ?? 0), sig);
  
  // Histogram = MACD - Signal
  const histogram: (number|undefined)[] = [];
  for (let i=0; i<macdLine.length; i++) {
    const m = macdLine[i];
    const s = signalLine[i];
    if (m !== undefined && s !== undefined) {
      histogram.push(m - s);
    } else {
      histogram.push(undefined);
    }
  }
  
  return { macd: macdLine, signal: signalLine, histogram };
}

/**
 * Get MACD signal from last bar
 * Returns: +1 (bullish), -1 (bearish), 0 (neutral)
 * 
 * Bullish: MACD > Signal or bullish crossover
 * Bearish: MACD < Signal or bearish crossover
 */
export function macdSignalVec(macdData: MacdData): number {
  const len = macdData.macd.length;
  if (len < 2) return 0;
  
  const currMacd = macdData.macd[len-1];
  const currSignal = macdData.signal[len-1];
  const prevMacd = macdData.macd[len-2];
  const prevSignal = macdData.signal[len-2];
  
  if (currMacd === undefined || currSignal === undefined) return 0;
  if (prevMacd === undefined || prevSignal === undefined) return 0;
  
  // Detect crossovers (stronger signal)
  const wasBelowSignal = prevMacd <= prevSignal;
  const isAboveSignal = currMacd > currSignal;
  const wasAboveSignal = prevMacd >= prevSignal;
  const isBelowSignal = currMacd < currSignal;
  
  // Bullish crossover
  if (wasBelowSignal && isAboveSignal) return +1;
  
  // Bearish crossover
  if (wasAboveSignal && isBelowSignal) return -1;
  
  // No crossover, just check current position
  if (currMacd > currSignal) return +1;
  if (currMacd < currSignal) return -1;
  
  return 0;
}
