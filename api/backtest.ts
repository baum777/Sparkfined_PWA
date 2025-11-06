// Vercel Edge Function: deterministisches Backtesting (stateless)
export const config = { runtime: "edge" };

type Rule =
  | { id:string; kind:"price-cross"; op:">"|"<"; value:number }
  | { id:string; kind:"pct-change-24h"; op:">"|"<"; value:number };

type Ohlc = { t:number;o:number;h:number;l:number;c:number; v?:number };
type Req = {
  ohlc: Ohlc[];
  rules: Rule[];
  fromIdx?:number; toIdx?:number;
  tf?: "1m"|"5m"|"15m"|"1h"|"4h"|"1d";
  page?: number;           // 0-based page index
  pageSize?: number;       // hits per page
};

export default async function handler(req: Request) {
  if (req.method !== "POST") return json({ ok:false, error:"POST only" }, 405);
  try {
    const body = (await req.json()) as Req;
    if (!Array.isArray(body.ohlc) || !Array.isArray(body.rules)) {
      return json({ ok:false, error:"invalid payload" }, 400);
    }
    const start = Math.max(0, body.fromIdx ?? 0);
    const end   = Math.min(body.ohlc.length, Math.max(start+1, body.toIdx ?? body.ohlc.length));
    const prev: Record<string, boolean> = {};
    const hits: any[] = [];
    const perRule: Record<string, { count:number }> = {};

    for (let i=start;i<end;i++){
      const p = body.ohlc[i];
      if (!p) continue; // Skip missing data points
      for (const r of body.rules){
        if (!perRule[r.id]) perRule[r.id] = { count:0 };
        if (r.kind === "price-cross") {
          const cond = r.op === ">" ? (p.c > r.value) : (p.c < r.value);
          const key = r.id;
          const prevState = prev[key] ?? !cond;
          if (cond && !prevState) { hits.push(hit(r, i, p.t, p.c, { op:r.op, value:r.value })); perRule[r.id].count++; }
          prev[key] = cond;
        } else if (r.kind === "pct-change-24h") {
          const base = find24hBase(body.ohlc, i);
          const pct = base ? ((p.c - base) / base) * 100 : 0;
          const cond = r.op === ">" ? (pct > r.value) : (pct < r.value);
          const key = r.id;
          const prevState = prev[key] ?? !cond;
          if (cond && !prevState) { hits.push(hit(r, i, p.t, p.c, { op:r.op, value:r.value, pct:round2(pct) })); perRule[r.id].count++; }
          prev[key] = cond;
        }
      }
    }
    const ms = Number(performance.now().toFixed(2));
    // Paging der Hits (nach Zeit/Index bereits geordnet)
    const pageSize = Math.max(1, Math.min(2000, body.pageSize ?? 500));
    const page = Math.max(0, body.page ?? 0);
    const startHit = page * pageSize;
    const endHit = Math.min(hits.length, startHit + pageSize);
    const slice = hits.slice(startHit, endHit);
    const hasMore = endHit < hits.length;
    return json({ ok:true, ms, count: hits.length, perRule, hits: slice, page, pageSize, hasMore });
  } catch (e:any) {
    return json({ ok:false, error: String(e?.message ?? e) }, 200);
  }
}

function find24hBase(d: Ohlc[], i: number){
  if (!d.length) return 0;
  const current = d[i];
  if (!current) return d[0]?.c ?? 0;
  const endTs = current.t;
  const cutoff = endTs - 86_400_000;
  let j = i;
  while (j>0 && d[j]?.t && d[j].t >= cutoff) j--;
  return d[Math.max(0,j)]?.c ?? d[0]?.c ?? 0;
}
const round2 = (n:number)=> Math.round(n*100)/100;
const hit = (r:any, i:number, t:number, c:number, meta:any)=>({ ruleId:r.id, kind:r.kind, i, t, c, meta });
const json = (obj:any, status=200)=> new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json" }});
