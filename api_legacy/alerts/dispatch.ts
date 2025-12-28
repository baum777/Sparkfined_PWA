// Edge: nimmt lokale Trigger entgegen, dedupliziert, enqueued zur Verarbeitung
export const config = { runtime: "nodejs" };
import { kvSet, kvLPush } from "../../src/lib/kv";
import { sha256Url } from "../../src/lib/sha";

export default async function handler(req: Request) {
  if (req.method !== "POST") return new Response("POST only", { status:405 });
  try {
    const { ruleId, address, tf, title, body, url="/notifications", userId="anon" } = await req.json();
    if (!ruleId || !address) return json({ ok:false, error:"ruleId & address required" }, 400);
    // Dedupe (rule+address pro 60s)
    const sig = await sha256Url(`${ruleId}|${address}|${Math.floor(Date.now()/60000)}`);
    const ok = await kvSet(`alerts:dedupe:${sig}`, 1, { ttlSec: 65 });
    // immer enqueuen, aber Flag mitgeben
    const msg = { ts: Date.now(), ruleId, address, tf, title, body, url, userId, dedupSig: sig, dedupAccepted: ok };
    await kvLPush("alerts:queue", msg);
    return json({ ok:true, queued: true, dedupAccepted: ok });
  } catch (e:any) {
    return json({ ok:false, error:String(e?.message ?? e) }, 200);
  }
}
const json = (obj:any, status=200)=> new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json" }});
