// Edge: Journal CRUD (KV) – per userId
export const config = { runtime: "edge" };
import { kvGet, kvSet, kvDel, kvSAdd, kvSMembers } from "../../src/lib/kv";
import type { JournalNote } from "../../src/lib/journal";

const json = (obj:any, status=200)=> new Response(JSON.stringify(obj), { status, headers:{ "content-type":"application/json" }});
const uid = (req:Request)=> (new URL(req.url)).searchParams.get("userId") || (req.headers.get("x-user-id") || "anon");
const now = ()=> Date.now();

export default async function handler(req: Request){
  const userId = uid(req);
  if (req.method === "GET"){
    const ids = await kvSMembers(`journal:byUser:${userId}`);
    const rows: JournalNote[] = [];
    for (const id of ids){
      const n = await kvGet<JournalNote>(`journal:${userId}:${id}`);
      if (n) rows.push(n);
    }
    // neueste zuerst
    rows.sort((a,b)=> (b.updatedAt||b.createdAt) - (a.updatedAt||a.createdAt));
    return json({ ok:true, notes: rows });
  }
  if (req.method === "POST"){
    const b = await req.json();
    if (b?.delete && b?.id){
      await kvDel(`journal:${userId}:${b.id}`);
      return json({ ok:true, deleted: b.id });
    }
    const id = b?.id || crypto.randomUUID();
    const rec: JournalNote = {
      id,
      createdAt: b?.createdAt || now(),
      updatedAt: now(),
      title: b?.title || "",
      body: String(b?.body ?? ""),
      address: b?.address || "",
      tf: b?.tf || undefined,
      ruleId: b?.ruleId || undefined,
      tags: Array.isArray(b?.tags) ? b.tags.slice(0,20) : [],
      aiAttachedAt: b?.aiAttachedAt || undefined
    };
    await kvSet(`journal:${userId}:${id}`, rec);
    await kvSAdd(`journal:byUser:${userId}`, id);
    return json({ ok:true, note: rec });
  }
  return json({ ok:false, error:"GET or POST only" }, 405);
}
