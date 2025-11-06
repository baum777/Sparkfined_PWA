// Edge: Optionale Server-Evaluation einer einzelnen Regel gegen aktuellen Kontext
// Nutze dieselbe Semantik wie Client-Eval; nützt für Offload/Double-Check
export const config = { runtime: "edge" };
type Rule =
  | { id:string; kind:"price-cross"; op:">"|"<"; value:number }
  | { id:string; kind:"pct-change-24h"; op:">"|"<"; value:number }
  | { id:string; kind:"breakout-atrx"; dir:"up"|"down"; mult:number; period?:number }
  | { id:string; kind:"vwap-cross"; dir:"above"|"below" }
  | { id:string; kind:"sma50-200-cross"; typ:"golden"|"death" };
type Ohlc = { t:number;o:number;h:number;l:number;c:number; v?:number };

export default async function handler(req: Request) {
  if (req.method !== "POST") return json({ ok:false, error:"POST only" }, 405);
  try {
    const { rule, data } = await req.json() as { rule: Rule; data: Ohlc[] };
    if (!rule || !Array.isArray(data) || data.length<2) return json({ ok:false, error:"invalid payload" }, 400);
    const ok = evalRule(rule, data);
    return json({ ok:true, match: ok });
  } catch (e:any) {
    return json({ ok:false, error: String(e?.message ?? e) }, 200);
  }
}
function json(obj:any, status=200){ return new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json" }}); }

function evalRule(rule: Rule, d: Ohlc[]){
  const n = d.length-1;
  const p = d[n];
  const prev = d[n-1];
  // Guard: Ensure we have current and previous data
  if (!p || !prev) return false;
  
  switch(rule.kind){
    case "price-cross": {
      const cond = rule.op === ">" ? p.c > rule.value : p.c < rule.value;
      const prevCond = rule.op === ">" ? prev.c > rule.value : prev.c < rule.value;
      return cond && !prevCond;
    }
    case "pct-change-24h": {
      const base = find24hBase(d, n);
      const pct = base ? ((p.c - base) / base) * 100 : 0;
      const cond = rule.op === ">" ? pct > rule.value : pct < rule.value;
      const prevBase = find24hBase(d, n-1);
      const prevPct = prevBase ? ((prev.c - prevBase) / prevBase) * 100 : 0;
      const prevCond = rule.op === ">" ? prevPct > rule.value : prevPct < rule.value;
      return cond && !prevCond;
    }
    case "breakout-atrx": {
      const period = rule.period ?? 14;
      const { atr, hi, lo } = atrHiLo(d, period);
      if (rule.dir === "up")  return p.c > (hi + atr * rule.mult) && prev.c <= (hi + atr * rule.mult);
      else                    return p.c < (lo - atr * rule.mult) && prev.c >= (lo - atr * rule.mult);
    }
    case "vwap-cross": {
      const { vwap, prevVwap } = calcVwap(d);
      const cond = rule.dir === "above" ? p.c > vwap : p.c < vwap;
      const prevCond = rule.dir === "above" ? prev.c > prevVwap : prev.c < prevVwap;
      return cond && !prevCond;
    }
    case "sma50-200-cross": {
      const sma50 = sma(d.map(x=>x.c), 50);
      const sma200 = sma(d.map(x=>x.c), 200);
      const now = (sma50[n] ?? 0) - (sma200[n] ?? 0);
      const before = (sma50[n-1] ?? 0) - (sma200[n-1] ?? 0);
      return rule.typ==="golden" ? (now>0 && before<=0) : (now<0 && before>=0);
    }
  }
}
function find24hBase(d: Ohlc[], i: number){
  const current = d[i];
  if (!current) return d[0]?.c ?? 0;
  const cutoff = current.t - 86_400_000;
  let j = i; while (j>0 && d[j]?.t && d[j].t >= cutoff) j--;
  return d[Math.max(0,j)]?.c ?? d[0]?.c ?? 0;
}
function atrHiLo(d: Ohlc[], period:number){
  const n = d.length; const m = Math.max(1, Math.min(period, n-1));
  let trSum = 0; let hi = -Infinity, lo = Infinity;
  for (let i=n-m;i<n;i++){
    const x = d[i];
    if (!x) continue; // Skip if data point missing
    const prev = d[i-1] ?? x;
    const tr = Math.max(x.h - x.l, Math.abs(x.h - prev.c), Math.abs(x.l - prev.c));
    trSum += tr; hi = Math.max(hi, x.h); lo = Math.min(lo, x.l);
  }
  return { atr: trSum / m, hi, lo };
}
function calcVwap(d: Ohlc[]){
  // einfache Session-VWAP Schätzung
  let pv=0, vv=0, pvPrev=0, vvPrev=0;
  const n = d.length-1;
  for(let i=0;i<=n;i++){ 
    const x = d[i]; 
    if (!x) continue; // Skip if missing
    const tp = (x.h+x.l+x.c)/3; 
    const v = Number(x.v||1); 
    if(i<n){ pvPrev += tp*v; vvPrev += v; } 
    pv += tp*v; vv += v; 
  }
  return { vwap: pv/Math.max(1,vv), prevVwap: pvPrev/Math.max(1,vvPrev) };
}
function sma(arr:number[], len:number){
  const out = Array(arr.length).fill(NaN);
  let sum = 0;
  for (let i=0;i<arr.length;i++){
    sum += arr[i];
    if (i>=len) sum -= arr[i-len];
    if (i>=len-1) out[i] = sum / len;
  }
  return out;
}
