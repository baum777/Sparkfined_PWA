// src/server/ideas/export.ts
// Export Handlers (markdown export, execution pack)
// Runtime: Node.js (required for KV)

import { kvSMembers, kvGet } from "@/lib/kv";
import type { Idea } from "@/lib/ideas";
import { buildOrderText, buildLadder, LADDERS } from "@/lib/execution";

const getUserId = (req: Request): string => {
  const url = new URL(req.url);
  return (
    url.searchParams.get("userId") ||
    req.headers.get("x-user-id") ||
    "anon"
  );
};

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });

// ============================================================================
// EXPORT (Markdown)
// ============================================================================
export async function handleExport(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const userId = getUserId(req);
  const id = url.searchParams.get("id");

  const ids = id ? [id] : await kvSMembers(`ideas:byUser:${userId}`);
  const rows: Idea[] = [];

  for (const k of ids) {
    const it = await kvGet<Idea>(`idea:${userId}:${k}`);
    if (it) rows.push(it);
  }

  rows.sort((a, b) => a.createdAt - b.createdAt);
  const md = rows.map(toMarkdown).join("\n\n---\n\n");

  return new Response(md, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}

// ============================================================================
// EXPORT PACK (Execution Pack)
// ============================================================================
export async function handleExportPack(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const userId = getUserId(req);
  const id = url.searchParams.get("id");

  if (!id) {
    return json({ ok: false, error: "id required" }, 400);
  }

  const rec = await kvGet<Idea>(`idea:${userId}:${id}`);
  if (!rec) {
    return json({ ok: false, error: "idea not found" }, 404);
  }

  const ladderConfig = LADDERS[0];
  if (!ladderConfig) {
    return json({ ok: false, error: "No ladder config available" }, 500);
  }

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
    ...ladder.items.map(
      (x) =>
        `- TP${x.idx + 1}: ${x.units}u @ ${x.target} (${x.pct.toFixed(1)}%)`
    ),
    "",
    `## Chart Link`,
    `[Open in Chart](https://sparkfined.app/chart?idea=${rec.id})`,
    "",
    `Generated ${new Date().toISOString()}`,
  ].join("\n");

  return new Response(md, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}

// ============================================================================
// HELPERS
// ============================================================================

function toMarkdown(it: Idea): string {
  const head = [
    `# ${it.title} (${it.side.toUpperCase()})`,
    `*CA:* ${it.address}  `,
    `*TF:* ${it.tf}  `,
    `*Status:* ${it.status}  `,
    `*Erstellt:* ${new Date(it.createdAt).toISOString()}  `,
    it.outcome?.exitAt
      ? `*Geschlossen:* ${new Date(it.outcome.exitAt).toISOString()}  `
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const metrics = [
    `**Entry:** ${fmt(it.entry)}`,
    `**Invalidation:** ${fmt(it.invalidation)}`,
    `**Targets:** ${it.targets?.length ? it.targets.join(", ") : "—"}`,
  ].join(" · ");

  const outcome =
    it.status === "closed"
      ? `**Outcome:** Exit=${fmt(it.outcome?.exitPrice)} · P/L=${
          it.outcome?.pnlPct?.toFixed(2) ?? "n/a"
        }% · Dauer=${ms(it.outcome?.durationMs)}`
      : "";

  const tl = (it.timeline || [])
    .map(
      (ev) =>
        `- ${new Date(ev.ts).toISOString()} · ${ev.type} ${
          ev.meta?.price ? `· @${ev.meta.price}` : ""
        }`
    )
    .join("\n");

  return [
    head,
    "",
    `**These:** ${it.thesis || "—"}`,
    "",
    metrics,
    "",
    outcome,
    "",
    "## Timeline",
    tl || "—",
  ].join("\n");
}

function fmt(n?: number): string {
  return typeof n === "number" && isFinite(n) ? String(n) : "—";
}

function ms(n?: number): string {
  if (!n) return "—";
  const d = Math.floor(n / 86400000);
  const h = Math.floor((n % 86400000) / 3600000);
  return `${d}d ${h}h`;
}
