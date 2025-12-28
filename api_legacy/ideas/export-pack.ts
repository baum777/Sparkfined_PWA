// Edge: erstellt ein Execution-Pack (Idea + Order + Ladder + Chart-Link)
export const config = { runtime: "nodejs" };
import { kvGet } from "../../src/lib/kv";
import type { Idea } from "../../src/lib/ideas";
import { buildOrderText, buildLadder, LADDERS } from "../../src/lib/execution";

const json = (o: any, s = 200) => new Response(JSON.stringify(o, null, 2), {
  status: s,
  headers: { "content-type": "application/json" }
});

const uid = (req: Request) => {
  const u = new URL(req.url);
  return u.searchParams.get("userId") || req.headers.get("x-user-id") || "anon";
};

export default async function handler(req: Request) {
  const u = new URL(req.url);
  const userId = uid(req);
  const id = u.searchParams.get("id");
  
  if (!id) return json({ ok: false, error: "id required" }, 400);
  
  const rec = await kvGet<Idea>(`idea:${userId}:${id}`);
  if (!rec) return json({ ok: false, error: "idea not found" }, 404);
  
  const ladderConfig = LADDERS[0];
  if (!ladderConfig) return json({ ok: false, error: "No ladder config available" }, 500);
  
  const ladder = buildLadder(rec, ladderConfig);
  
  const md = [
    `# Execution Pack · ${rec.title}`,
    "",
    "## Order",
    "```",
    buildOrderText(rec),
    "```",
    "",
    "## TP Ladder",
    ...ladder.items.map(x => `- TP${x.idx + 1}: ${x.units}u @ ${x.target} (${x.pct.toFixed(1)}%)`),
    "",
    `## Chart Link`,
    `[Open in Chart](https://sparkfined.app/chart?idea=${rec.id})`,
    "",
    `Generated ${new Date().toISOString()}`
  ].join("\n");
  
  return new Response(md, {
    headers: { "content-type": "text/markdown; charset=utf-8" }
  });
}
