export type AlertRule =
  | { id:string; kind:"price-cross"; op:">"|"<"; value:number }
  | { id:string; kind:"pct-change-24h"; op:">"|"<"; value:number };

export type BacktestInput = {
  ohlc: Array<{ t:number;o:number;h:number;l:number;c:number }>;
  rules: AlertRule[];
  fromIdx?: number;
  toIdx?: number;
};

export type BacktestHit = {
  ruleId: string;
  kind: AlertRule["kind"];
  i: number;             // index in series
  t: number;
  c: number;             // close at hit
  meta?: Record<string, unknown>;
};

export type BacktestResult = {
  hits: BacktestHit[];
  perRule: Record<string, { count:number }>;
};

export function runBacktest(input: BacktestInput): BacktestResult {
  const { ohlc, rules } = input;
  const start = Math.max(0, input.fromIdx ?? 0);
  const end   = Math.min(ohlc.length, Math.max(start+1, input.toIdx ?? ohlc.length));
  const hits: BacktestHit[] = [];
  const perRule: Record<string, { count:number }> = {};
  const prev: Record<string, boolean> = {};
  // precompute 24h window size (approx by index distance if minute bars unknown)
  // fallback: 96 bars ≈ 24h for 15m timeframe; the UI can adapt later
  const win24 = 96;
  for (let i=start;i<end;i++){
    const p = ohlc[i];
    if (!p) continue; // Skip missing data
    for (const r of rules){
      if (!perRule[r.id]) perRule[r.id] = { count:0 };
      if (r.kind === "price-cross") {
        const cond = r.op === ">" ? (p.c > r.value) : (p.c < r.value);
        const key = `${r.id}`;
        const prevState = prev[key] ?? !cond; // force edge on first true
        if (cond && !prevState) {
          hits.push({ ruleId:r.id, kind:r.kind, i, t:p.t, c:p.c, meta:{ op:r.op, value:r.value } });
          perRule[r.id].count++;
        }
        prev[key] = cond;
      } else if (r.kind === "pct-change-24h") {
        const j = Math.max(start, i - win24);
        const base = ohlc[j]?.c ?? p.c;
        const pct = base ? ((p.c - base) / base) * 100 : 0;
        const cond = r.op === ">" ? (pct > r.value) : (pct < r.value);
        const key = `${r.id}`;
        const prevState = prev[key] ?? !cond;
        if (cond && !prevState) {
          hits.push({ ruleId:r.id, kind:r.kind, i, t:p.t, c:p.c, meta:{ op:r.op, value:r.value, pct:round2(pct) } });
          perRule[r.id].count++;
        }
        prev[key] = cond;
      }
    }
  }
  return { hits, perRule };
}

function round2(n:number){ return Math.round(n*100)/100; }
