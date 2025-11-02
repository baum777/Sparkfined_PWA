// Edge CRUD für Server-Rules (KV)
export const config = { runtime: "edge" };
import { kvGet, kvSet, kvDel, kvSAdd, kvSMembers } from "../../src/lib/kv";
import type { ServerRule } from "../../src/lib/serverRules";

function json(obj:any, status=200){ return new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json" }}); }
const now = ()=> Date.now();
const uid = (req:Request)=> (new URL(req.url)).searchParams.get("userId") || (req.headers.get("x-user-id") || "anon");

export default async function handler(req: Request){
  const userId = uid(req);
  if (req.method === "GET"){
    const ids = await kvSMembers(`rules:byUser:${userId}`);
    const rows: ServerRule[] = [];
    for (const id of ids){
      const r = await kvGet<ServerRule>(`rule:${userId}:${id}`);
      if (r) rows.push(r);
    }
    return json({ ok:true, rules: rows });
  }
  if (req.method === "POST"){
    const body = await req.json();
    // modes: create/update/delete
    if (body?.delete && body?.id){
      await kvDel(`rule:${userId}:${body.id}`);
      // set membership cleanup optional
      return json({ ok:true, deleted: body.id });
    }
    const id = body?.id || crypto.randomUUID();
    const rec: ServerRule = {
      id,
      userId,
      address: body.address,
      tf: body.tf,
      active: body.active ?? true,
      createdAt: body.createdAt ?? now(),
      updatedAt: now(),
      rule: body.rule
    };
    if (!rec.address || !rec.tf || !rec.rule) return json({ ok:false, error:"address, tf, rule required" }, 400);
    await kvSet(`rule:${userId}:${id}`, rec);
    await kvSAdd(`rules:byUser:${userId}`, id);
    return json({ ok:true, id, rule: rec });
  }
  return json({ ok:false, error:"GET or POST only" }, 405);
}
