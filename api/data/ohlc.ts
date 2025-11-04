// Edge: Liefert OHLC für CA+TF (Hierarchie: Moralis → Dexpaprika → Dexscreener)
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
    // 1. Moralis (Primär)
    const moralisBase = process.env.MORALIS_BASE || "https://deep-index.moralis.io/api/v2.2";
    const moralisKey = process.env.MORALIS_API_KEY || "";
    if (moralisKey) {
      const moralisData = await fetch(`${moralisBase}/erc20/${address}/ohlc?chain=solana&interval=${tf}&limit=${limit}`, {
        headers: { "X-API-Key": moralisKey, "Accept": "application/json" },
        cache: "no-store"
      }).then((r): any=>r.ok?r.json():null).catch((): any=>null);
      if (moralisData && Array.isArray(moralisData)) return json({ ok:true, data: normalize(moralisData), provider: "moralis" });
    }
    
    // 2. Dexpaprika (Fallback 1)
    const dpBase = process.env.DEXPAPRIKA_BASE || "https://api.dexpaprika.com";
    const dpKey = process.env.DEXPAPRIKA_API_KEY || "";
    const dp = await fetch(`${dpBase}/v1/ohlc?ca=${encodeURIComponent(address)}&tf=${encodeURIComponent(tf)}&limit=${limit}`, {
      headers: dpKey ? { "x-api-key": dpKey } : undefined,
      cache: "no-store"
    }).then((r): any=>r.ok?r.json():null).catch((): any=>null);
    if (dp?.ok && Array.isArray(dp.data)) return json({ ok:true, data: normalize(dp.data), provider: "dexpaprika" });
    
    // 3. Dexscreener (Fallback 2 - TODO: Implement wenn nötig)
    return json({ ok:true, data: [], provider: "none" });
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
