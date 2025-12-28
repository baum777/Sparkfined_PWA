// Edge: Export als JSON oder Markdown (flattened)
export const config = { runtime: "nodejs" };
import { kvSMembers, kvGet } from "../../src/lib/kv";
import type { JournalNote } from "../../src/lib/journal";
const uid = (req:Request)=> (new URL(req.url)).searchParams.get("userId") || (req.headers.get("x-user-id") || "anon");

export default async function handler(req: Request){
  const u = new URL(req.url);
  const userId = uid(req);
  const fmt = (u.searchParams.get("fmt")||"json").toLowerCase(); // json|md
  const ids = await kvSMembers(`journal:byUser:${userId}`);
  const rows: JournalNote[] = [];
  for (const id of ids){
    const n = await kvGet<JournalNote>(`journal:${userId}:${id}`);
    if (n) rows.push(n);
  }
  rows.sort((a,b)=> (a.createdAt)-(b.createdAt)); // chronologisch
  if (fmt === "md"){
    const md = rows.map(n => [
      `# ${n.title || "(ohne Titel)"}  `,
      `*ID:* ${n.id} · *Datum:* ${new Date(n.createdAt).toISOString()}  `,
      n.address ? `*CA:* ${n.address}  ` : "",
      n.tf ? `*TF:* ${n.tf}  ` : "",
      n.ruleId ? `*Rule:* ${n.ruleId}  ` : "",
      n.tags?.length ? `*Tags:* ${n.tags.join(", ")}  ` : "",
      "",
      n.body || "",
      "\n---\n"
    ].filter(Boolean).join("\n")).join("\n");
    return new Response(md, { headers:{ "content-type":"text/markdown; charset=utf-8" }});
  }
  return new Response(JSON.stringify({ ok:true, notes: rows }, null, 2), { headers:{ "content-type":"application/json" }});
}
