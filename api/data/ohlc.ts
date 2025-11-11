// Edge: Liefert OHLC für CA+TF (Hierarchie: DexPaprika → Moralis → Dexscreener)
export const config = { runtime: "edge" };
type Ohlc = { t:number;o:number;h:number;l:number;c:number; v?:number };
function json(obj:any, status=200){ return new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json" }}); }

export default async function handler(req: Request){
  if (req.method !== "GET") {
    return json({ ok:false, error:"method not allowed" }, 405);
  }

  const authError = ensureDataProxyAuthorized(req);
  if (authError) return authError;

  const url = new URL(req.url);
  const address = url.searchParams.get("address") || "";
  const tf = url.searchParams.get("tf") || "15m";
  const limit = Number(url.searchParams.get("limit") || "600");
  if (!address) return json({ ok:false, error:"address required" }, 400);
  if (!isLikelySolanaAddress(address)) return json({ ok:false, error:"invalid address" }, 400);
  if (!Number.isFinite(limit) || limit <= 0 || limit > 1000) return json({ ok:false, error:"invalid limit (1-1000)" }, 400);
  
  try{
    // 1. DexPaprika (Primary)
    const dpBase = process.env.DEXPAPRIKA_BASE || "https://api.dexpaprika.com";
    const dpKey = process.env.DEXPAPRIKA_API_KEY || "";
    const dp = await fetch(`${dpBase}/v1/ohlc?ca=${encodeURIComponent(address)}&tf=${encodeURIComponent(tf)}&limit=${limit}`, {
      headers: dpKey ? { "x-api-key": dpKey } : undefined,
      cache: "no-store"
    }).then((r): any=>r.ok?r.json():null).catch((): any=>null);
    if (dp?.ok && Array.isArray(dp.data)) return json({ ok:true, data: normalize(dp.data), provider: "dexpaprika" });

    // 2. Moralis (Fallback)
    const moralisData = await fetchMoralisFallback(req, address, tf, limit);
    if (moralisData) return json({ ok:true, data: normalize(moralisData), provider: "moralis" });
    
    // 3. Dexscreener (Fallback 2 - TODO: Implement wenn nötig)
    return json({ ok:true, data: [], provider: "none" });
  }catch(e:any){
    return json({ ok:false, error:String(e?.message ?? e) }, 200);
  }
}

async function fetchMoralisFallback(req: Request, address: string, tf: string, limit: number): Promise<any[] | null> {
  const secret = process.env.DATA_PROXY_SECRET?.trim();
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || process.env.VERCEL_URL || "localhost:3000";
  const origin = host.startsWith("http") ? host : `${proto}://${host}`;
  const headers: Record<string, string> = { "accept": "application/json" };
  if (secret) headers["authorization"] = `Bearer ${secret}`;
  try {
    const res = await fetch(`${origin.replace(/\/$/, "")}/api/moralis/ohlc?address=${encodeURIComponent(address)}&tf=${encodeURIComponent(tf)}&limit=${limit}`, {
      headers,
      cache: "no-store"
    });
    if (!res.ok) return null;
    const body = await res.json();
    const rows = Array.isArray(body?.data) ? body.data : [];
    return rows;
  } catch {
    return null;
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

function ensureDataProxyAuthorized(req: Request): Response | null {
  const secret = process.env.DATA_PROXY_SECRET?.trim();
  const env = process.env.NODE_ENV ?? "production";
  const isProd = env === "production";

  if (!secret) {
    if (!isProd) {
      console.warn("[data/ohlc] DATA_PROXY_SECRET not set – allowing request in non-production environment");
      return null;
    }
    console.error("[data/ohlc] DATA_PROXY_SECRET missing – blocking data proxy request");
    return json({ ok:false, error:"data proxy disabled" }, 503);
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return json({ ok:false, error:"unauthorized" }, 401);
  }

  const [scheme, token] = authHeader.split(" ", 2);
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return json({ ok:false, error:"unauthorized" }, 401);
  }

  if (token.trim() !== secret) {
    return json({ ok:false, error:"unauthorized" }, 403);
  }

  return null;
}

function isLikelySolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(address);
}
