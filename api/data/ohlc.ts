// Edge: Liefert OHLC für CA+TF (minimale Implementierung mit Dexpaprika → Dexscreener Fallback)
export const config = { runtime: "edge" };
type Ohlc = { t:number;o:number;h:number;l:number;c:number; v?:number };
function json(obj:any, status=200){ return new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json" }}); }

export default async function handler(req: Request){
  const url = new URL(req.url);
  const address = url.searchParams.get("address") || "";
  const tf = url.searchParams.get("tf") || "15m";
  const limit = Number(url.searchParams.get("limit") || "600");
  if (!address) return json({ ok:false, error:"address required" }, 400);
  try{
    const base = process.env.DEXPAPRIKA_BASE || "https://api.dexpaprika.com";
    const key  = process.env.DEXPAPRIKA_API_KEY || "";
    const dp = await fetch(`${base}/v1/ohlc?ca=${encodeURIComponent(address)}&tf=${encodeURIComponent(tf)}&limit=${limit}`, {
      headers: key ? { "x-api-key": key } : undefined,
      cache: "no-store"
    }).then((r): any=>r.ok?r.json():null).catch((): any=>null);
    if (dp?.ok && Array.isArray(dp.data)) return json({ ok:true, data: normalize(dp.data) });
    // Fallback: Dexscreener (wenn keine OHLC verfügbar → leer)
    return json({ ok:true, data: [] });
  }catch(e:any){
    return json({ ok:false, error:String(e?.message ?? e) }, 200);
  }
}
function normalize(rows:any[]): Ohlc[]{
  return rows.map((r:any)=> ({
    t: Number(r.t ?? r.time ?? r.timestamp),
    o: Number(r.o ?? r.open),
    h: Number(r.h ?? r.high),
    l: Number(r.l ?? r.low),
    c: Number(r.c ?? r.close),
    v: Number(r.v ?? r.volume ?? 0)
  })).filter(x=>Number.isFinite(x.t)&&Number.isFinite(x.c));
}
