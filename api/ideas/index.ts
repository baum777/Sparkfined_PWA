export const config = { runtime: "edge" };
import { kvGet, kvSet, kvDel, kvSAdd, kvSMembers } from "../../src/lib/kv";
import type { Idea } from "../../src/lib/ideas";
const json = (o:any,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json"}});
const uid = (req:Request)=> (new URL(req.url)).searchParams.get("userId") || (req.headers.get("x-user-id") || "anon");
const now = ()=>Date.now();

export default async function handler(req: Request){
  const userId = uid(req);
  if (req.method==="GET"){
    const ids = await kvSMembers(`ideas:byUser:${userId}`);
    const rows: Idea[] = [];
    for (const id of ids){ const it = await kvGet<Idea>(`idea:${userId}:${id}`); if (it) rows.push(it); }
    rows.sort((a,b)=>b.updatedAt-a.updatedAt);
    return json({ ok:true, ideas: rows });
  }
  if (req.method==="POST"){
    const b = await req.json();
    if (b?.delete && b?.id){ await kvDel(`idea:${userId}:${b.id}`); return json({ ok:true, deleted:b.id }); }
    const id = b?.id || crypto.randomUUID();
    const rec: Idea = {
      id,
      userId,
      address: b.address,
      tf: b.tf,
      side: b.side ?? "long",
      title: b.title || "Idea",
      thesis: b.thesis || "",
      entry: numOr(b.entry), invalidation: numOr(b.invalidation),
      targets: Array.isArray(b.targets)? b.targets.map(Number).slice(0,6):[],
      status: (b.status as any) || "draft",
      createdAt: b.createdAt || now(),
      updatedAt: now(),
      links: b.links || {},
      flags: b.flags || {}
    };
    if (!rec.address || !rec.tf) return json({ ok:false, error:"address & tf required" }, 400);
    await kvSet(`idea:${userId}:${id}`, rec);
    await kvSAdd(`ideas:byUser:${userId}`, id);
    return json({ ok:true, idea: rec });
  }
  return json({ ok:false, error:"GET or POST only" }, 405);
}
function numOr(x:any){ const n = Number(x); return Number.isFinite(n)?n:undefined; }
