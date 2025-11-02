// Edge: Case-Study Export als Markdown (eine oder mehrere Ideen)
export const config = { runtime: "edge" };
import { kvSMembers, kvGet } from "../../src/lib/kv";
import type { Idea } from "../../src/lib/ideas";
const uid = (req:Request)=> (new URL(req.url)).searchParams.get("userId") || (req.headers.get("x-user-id") || "anon");

export default async function handler(req: Request){
  const u = new URL(req.url);
  const userId = uid(req);
  const id = u.searchParams.get("id"); // optional: nur eine Idea
  const ids = id ? [id] : await kvSMembers(`ideas:byUser:${userId}`);
  const rows: Idea[] = [];
  for (const k of ids){ const it = await kvGet<Idea>(`idea:${userId}:${k}`); if (it) rows.push(it); }
  rows.sort((a,b)=> a.createdAt-b.createdAt);
  const md = rows.map(toMD).join("\n\n---\n\n");
  return new Response(md, { headers:{ "content-type":"text/markdown; charset=utf-8" }});
}

function toMD(it: Idea){
  const head = [
    `# ${it.title} (${it.side.toUpperCase()})`,
    `*CA:* ${it.address}  `,
    `*TF:* ${it.tf}  `,
    `*Status:* ${it.status}  `,
    `*Erstellt:* ${new Date(it.createdAt).toISOString()}  `,
    it.outcome?.exitAt ? `*Geschlossen:* ${new Date(it.outcome.exitAt).toISOString()}  ` : ""
  ].filter(Boolean).join("\n");
  const metrics = [
    `**Entry:** ${fmt(it.entry)}`,
    `**Invalidation:** ${fmt(it.invalidation)}`,
    `**Targets:** ${it.targets?.length? it.targets.join(", "):"—"}`
  ].join(" · ");
  const outcome = it.status==="closed"
    ? `**Outcome:** Exit=${fmt(it.outcome?.exitPrice)} · P/L=${it.outcome?.pnlPct?.toFixed(2) ?? "n/a"}% · Dauer=${ms(it.outcome?.durationMs)}`
    : "";
  const tl = (it.timeline||[]).map(ev => `- ${new Date(ev.ts).toISOString()} · ${ev.type} ${ev.meta?.price?`· @${ev.meta.price}`:""}`).join("\n");
  return [head, "", `**These:** ${it.thesis||"—"}`, "", metrics, "", outcome, "", "## Timeline", tl||"—"].join("\n");
}
function fmt(n?: number){ return (typeof n==="number" && isFinite(n)) ? String(n) : "—"; }
function ms(n?: number){ if(!n) return "—"; const d=Math.floor(n/86400000), h=Math.floor((n%86400000)/3600000); return `${d}d ${h}h`; }
