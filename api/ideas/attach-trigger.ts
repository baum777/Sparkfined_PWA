// Edge: hängt ein Rule-Trigger-Event an eine Idee (für E-7/E-10 Dispatch-Pipeline)
export const config = { runtime: "edge" };
import { kvGet, kvSet } from "../../src/lib/kv";
import type { Idea } from "../../src/lib/ideas";
const json = (o:any,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json"}});
const uid = (req:Request)=> (new URL(req.url)).searchParams.get("userId") || (req.headers.get("x-user-id") || "anon");

export default async function handler(req: Request){
  if (req.method!=="POST") return json({ ok:false, error:"POST only" },405);
  const userId = uid(req);
  const b = await req.json();
  const { ideaId, ruleId, address, tf, price, ts=Date.now(), meta={} } = b||{};
  if (!ideaId && !ruleId) return json({ ok:false, error:"ideaId or ruleId required" },400);
  // 1) Idee suchen (by id, else by rule link)
  const id = ideaId;
  if (!id && ruleId){
    // naive Scan: in echten Systemen Index halten (ideas:byRule:<ruleId>)
    // hier: wir lesen nur diese eine Idee direkt (Client sollte id haben). Fallback: error.
    return json({ ok:false, error:"lookup by ruleId not implemented; provide ideaId" }, 400);
  }
  const rec = await kvGet<Idea>(`idea:${userId}:${id}`);
  if (!rec) return json({ ok:false, error:"idea not found" },404);
  const e = { ts, type: "rule_trigger", meta: { ruleId: ruleId||rec.links.ruleId, address: address||rec.address, tf: tf||rec.tf, price, ...meta } };
  const timeline = [...(rec.timeline||[]), e].slice(-1000);
  const updated = { ...rec, updatedAt: Date.now(), timeline };
  await kvSet(`idea:${userId}:${id}`, updated);
  return json({ ok:true, idea: updated });
}
