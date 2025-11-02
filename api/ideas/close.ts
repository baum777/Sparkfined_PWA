// Edge: schließt eine Idee und berechnet Outcome grob (pnlPct optional)
export const config = { runtime: "edge" };
import { kvGet, kvSet } from "../../src/lib/kv";
import type { Idea } from "../../src/lib/ideas";
const json = (o:any,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json"}});
const uid = (req:Request)=> (new URL(req.url)).searchParams.get("userId") || (req.headers.get("x-user-id") || "anon");

export default async function handler(req: Request){
  if (req.method!=="POST") return json({ ok:false, error:"POST only" },405);
  const userId = uid(req);
  const b = await req.json();
  const { id, exitPrice, note } = b||{};
  if (!id) return json({ ok:false, error:"id required" },400);
  const rec = await kvGet<Idea>(`idea:${userId}:${id}`);
  if (!rec) return json({ ok:false, error:"idea not found" },404);
  const entryPrice = rec.entry ?? exitPrice;
  const pnlPct = (entryPrice && exitPrice) ? ((exitPrice - entryPrice) / entryPrice) * 100 * (rec.side==="short" ? -1 : 1) : undefined;
  const out = {
    exitPrice,
    entryPrice,
    pnlPct,
    durationMs: (Date.now() - (rec.createdAt||Date.now())),
    exitAt: Date.now(),
    note: note || ""
  };
  const timeline = [...(rec.timeline||[]), { ts: Date.now(), type:"closed", meta: { exitPrice, pnlPct } }].slice(-1000);
  const updated = { ...rec, status:"closed", outcome: { ...(rec.outcome||{}), ...out }, updatedAt: Date.now(), timeline };
  await kvSet(`idea:${userId}:${id}`, updated);
  return json({ ok:true, idea: updated });
}
