export const config = { runtime: "nodejs" };
import { kvDel } from "../../src/lib/kv";
import { sha256Url } from "../../src/lib/sha";
export default async function handler(req: Request) {
  if (req.method !== "POST") return new Response("POST only", { status:405 });
  try {
    const { endpoint } = await req.json();
    if (!endpoint) return json({ ok:false, error:"endpoint required" }, 400);
    const id = await sha256Url(endpoint);
    const del = await kvDel(`push:sub:${id}`);
    return json({ ok:true, removed: del });
  } catch (e:any) {
    return json({ ok:false, error:String(e?.message ?? e) }, 200);
  }
}
const json = (obj:any, status=200)=> new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json" }});
