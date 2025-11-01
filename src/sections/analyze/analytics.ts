export type Ohlc = { t:number;o:number;h:number;l:number;c:number; v?:number };

export function pct(a:number, b:number){ return b === 0 ? 0 : ((a - b) / b) * 100; }
export function mean(arr:number[]){ return arr.length ? arr.reduce((s,x)=>s+x,0)/arr.length : 0; }
export function stdev(arr:number[]){ const m=mean(arr); return Math.sqrt(mean(arr.map(x=> (x-m)*(x-m) ))); }

export function returnsClose(data:Ohlc[]) {
  const out:number[] = [];
  for (let i=1;i<data.length;i++){ out.push(Math.log((data[i].c || 0) / (data[i-1].c || 1))); }
  return out;
}

export function atr(data:Ohlc[], n=14){
  if (data.length < 2) return 0;
  const tr:number[]=[];
  for (let i=1;i<data.length;i++){
    const h = data[i].h, l = data[i].l, pc = data[i-1].c;
    tr.push(Math.max(h-l, Math.abs(h-pc), Math.abs(l-pc)));
  }
  const m = n<=tr.length ? mean(tr.slice(-n)) : mean(tr);
  return m;
}

export function kpis(data:Ohlc[]){
  if (!data.length) return {
    lastClose: 0, change24h: 0, volStdev: 0, atr14: 0, hiLoPerc: 0, volumeSum: 0,
  };
  const last = data[data.length-1];
  // 24h window heuristik: ~96 bars ≈ 24h @15m (wird in späterer Phase TF-basiert dynamisch)
  const win = Math.min(data.length-1, 96);
  const base = data[data.length-1-win]?.c ?? data[0].c;
  const change24h = pct(last.c, base);
  const rets = returnsClose(data);
  const volStdev = stdev(rets.slice(-win)) * Math.sqrt(96); // annualisierungssurrogat pro 24h-fenster
  const atr14 = atr(data, 14);
  const minL = Math.min(...data.slice(-win).map(d=>d.l));
  const maxH = Math.max(...data.slice(-win).map(d=>d.h));
  const hiLoPerc = pct(maxH, minL);
  const volumeSum = data.slice(-win).reduce((s,d)=> s + (Number((d as any).v||0)), 0);
  return { lastClose: last.c, change24h, volStdev, atr14, hiLoPerc, volumeSum };
}

export function smaVec(arr:number[], n:number){
  const out:(number|undefined)[] = new Array(arr.length).fill(undefined);
  let acc=0;
  for (let i=0;i<arr.length;i++){
    acc += arr[i];
    if (i>=n) acc -= arr[i-n];
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
    prev = prev === undefined ? v : (v*k + prev*(1-k));
    if (i>=n-1) out[i] = prev;
  }
  return out;
}

export function signalMatrix(data:Ohlc[]){
  const closes = data.map(d=>d.c);
  const vwaps = vwapVec(data);
  const windows = [9,20,50,200] as const;
  const rows = [
    { id:"SMA", values: windows.map(w => vecSignal(closes, smaVec(closes, w))) },
    { id:"EMA", values: windows.map(w => vecSignal(closes, emaVec(closes, w))) },
    { id:"VWAP", values: [vecSignal(closes, vwaps)] },
  ];
  return { rows, windows };
}

// simple vwap per-bar cumulative
export function vwapVec(d:Ohlc[]){
  let pv=0, vv=0;
  const out:(number|undefined)[]=[];
  for (let i=0;i<d.length;i++){
    const v = Number((d[i] as any).v||0);
    const tp = (d[i].h + d[i].l + d[i].c)/3;
    pv += tp * v; vv += v;
    out.push(vv>0 ? pv/vv : undefined);
  }
  return out;
}

// last-bar signal for an indicator vector
function vecSignal(price:number[], ind:(number|undefined)[]){
  const i = ind.length-1;
  const v = ind[i];
  if (v === undefined) return 0;
  return price[i] > v ? +1 : price[i] < v ? -1 : 0;
}
