// Optionaler Stub zum Persistieren – aktuell NO-OP (dev-freundlich).
// Später: Upstash/Supabase/KV integrieren.
export const config = { runtime: "edge" };
import { kvSAdd, kvSet } from "../../src/lib/kv";
import { sha256Url } from "../../src/lib/sha";
export default async function handler(req: Request) {
  if (req.method !== "POST") return new Response("POST only", { status:405 });
  try {
    const { subscription, userId = "anon" } = await req.json();
    if (!subscription?.endpoint) return json({ ok:false, error:"subscription required" }, 400);
    const id = await sha256Url(subscription.endpoint);
    const key = `push:sub:${id}`;
    await kvSet(key, { id, userId, subscription, ts: Date.now() });
    await kvSAdd(`push:subs:byUser:${userId}`, id);
    return json({ ok:true, id });
  } catch (e:any) {
    return json({ ok:false, error:String(e?.message ?? e) }, 200);
  }
}
const json = (obj:any, status=200)=> new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json" }});
