// Optionaler Stub zum Persistieren – aktuell NO-OP (dev-freundlich).
// Später: Upstash/Supabase/KV integrieren.
export const config = { runtime: "edge" };
export default async function handler(req: Request) {
  if (req.method !== "POST") return new Response("POST only", { status:405 });
  try {
    const { subscription } = await req.json();
    if (!subscription) return json({ ok:false, error:"subscription required" }, 400);
    // TODO: persist subscription (KV/DB). Derzeit: noop
    return json({ ok:true, persisted:false });
  } catch (e:any) {
    return json({ ok:false, error:String(e?.message ?? e) }, 200);
  }
}
const json = (obj:any, status=200)=> new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json" }});
