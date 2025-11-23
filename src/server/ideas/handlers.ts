// Ideas handlers — consolidated from api/ideas/*.ts
// Handles CRUD operations, close, export, export-pack, and attach-trigger

import { kvGet, kvSet, kvDel, kvSAdd, kvSMembers } from "@/lib/kv";
import type { Idea } from "@/lib/ideas";
import { buildOrderText, buildLadder, LADDERS } from "@/lib/execution";

// ============================================================================
// JSON Response Helper
// ============================================================================
const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

// ============================================================================
// User ID Helper
// ============================================================================
const getUserId = (req: Request): string => {
  const url = new URL(req.url);
  return url.searchParams.get("userId") || req.headers.get("x-user-id") || "anon";
};

const now = () => Date.now();

// ============================================================================
// LIST IDEAS
// ============================================================================
export async function handleList(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return json({ ok: false, error: "GET only" }, 405);
  }

  const userId = getUserId(req);
  const ids = await kvSMembers(`ideas:byUser:${userId}`);
  const rows: Idea[] = [];

  for (const id of ids) {
    const it = await kvGet<Idea>(`idea:${userId}:${id}`);
    if (it) rows.push(it);
  }

  rows.sort((a, b) => b.updatedAt - a.updatedAt);
  return json({ ok: true, ideas: rows });
}

// ============================================================================
// CREATE / UPDATE / DELETE IDEA
// ============================================================================
export async function handleCreateOrUpdate(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  const userId = getUserId(req);
  const b = await req.json();

  // Handle delete action
  if (b?.delete && b?.id) {
    await kvDel(`idea:${userId}:${b.id}`);
    return json({ ok: true, deleted: b.id });
  }

  const id = b?.id || crypto.randomUUID();
  const prev = await kvGet<Idea>(`idea:${userId}:${id}`);

  const rec: Idea = {
    id,
    userId,
    address: b.address ?? prev?.address,
    tf: b.tf ?? prev?.tf,
    side: (b.side ?? prev?.side) || "long",
    title: b.title ?? prev?.title ?? "Idea",
    thesis: b.thesis ?? prev?.thesis ?? "",
    entry: numOr(b.entry ?? prev?.entry),
    invalidation: numOr(b.invalidation ?? prev?.invalidation),
    targets: Array.isArray(b.targets)
      ? b.targets.map(Number).slice(0, 6)
      : (prev?.targets ?? []),
    status: b.status || prev?.status || "draft",
    createdAt: prev?.createdAt || b.createdAt || now(),
    updatedAt: now(),
    links: { ...(prev?.links || {}), ...(b.links || {}) },
    flags: { ...(prev?.flags || {}), ...(b.flags || {}) },
    outcome: { ...(prev?.outcome || {}), ...(b.outcome || {}) },
    timeline: mergeTimeline(prev?.timeline, b.timeline),
  };

  if (!rec.address || !rec.tf) {
    return json({ ok: false, error: "address & tf required" }, 400);
  }

  await kvSet(`idea:${userId}:${id}`, rec);
  await kvSAdd(`ideas:byUser:${userId}`, id);

  return json({ ok: true, idea: rec });
}

// ============================================================================
// CLOSE IDEA
// ============================================================================
export async function handleClose(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  const userId = getUserId(req);
  const b = await req.json();
  const { id, exitPrice, note } = b || {};

  if (!id) {
    return json({ ok: false, error: "id required" }, 400);
  }

  const rec = await kvGet<Idea>(`idea:${userId}:${id}`);
  if (!rec) {
    return json({ ok: false, error: "idea not found" }, 404);
  }

  const entryPrice = rec.entry ?? exitPrice;
  const pnlPct =
    entryPrice && exitPrice
      ? ((exitPrice - entryPrice) / entryPrice) *
        100 *
        (rec.side === "short" ? -1 : 1)
      : undefined;

  const out = {
    exitPrice,
    entryPrice,
    pnlPct,
    durationMs: now() - (rec.createdAt || now()),
    exitAt: now(),
    note: note || "",
  };

  const timeline = [
    ...(rec.timeline || []),
    { ts: now(), type: "closed", meta: { exitPrice, pnlPct } },
  ].slice(-1000);

  const updated = {
    ...rec,
    status: "closed",
    outcome: { ...(rec.outcome || {}), ...out },
    updatedAt: now(),
    timeline,
  };

  await kvSet(`idea:${userId}:${id}`, updated);
  return json({ ok: true, idea: updated });
}

// ============================================================================
// EXPORT (Markdown)
// ============================================================================
export async function handleExport(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const userId = getUserId(req);
  const id = url.searchParams.get("id"); // optional: only one idea

  const ids = id ? [id] : await kvSMembers(`ideas:byUser:${userId}`);
  const rows: Idea[] = [];

  for (const k of ids) {
    const it = await kvGet<Idea>(`idea:${userId}:${k}`);
    if (it) rows.push(it);
  }

  rows.sort((a, b) => a.createdAt - b.createdAt);
  const md = rows.map(toMD).join("\n\n---\n\n");

  return new Response(md, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}

// ============================================================================
// EXPORT PACK (Execution Pack: Order + Ladder + Chart Link)
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
      (x) => `- TP${x.idx + 1}: ${x.units}u @ ${x.target} (${x.pct.toFixed(1)}%)`
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
// ATTACH TRIGGER
// ============================================================================
export async function handleAttachTrigger(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  const userId = getUserId(req);
  const b = await req.json();
  const {
    ideaId,
    ruleId,
    address,
    tf,
    price,
    ts = now(),
    meta = {},
  } = b || {};

  if (!ideaId && !ruleId) {
    return json({ ok: false, error: "ideaId or ruleId required" }, 400);
  }

  // 1) Find idea (by id, else by rule link)
  const id = ideaId;
  if (!id && ruleId) {
    // naive scan: in real systems keep index (ideas:byRule:<ruleId>)
    // here: we read only this one idea directly (client should have id). Fallback: error.
    return json(
      { ok: false, error: "lookup by ruleId not implemented; provide ideaId" },
      400
    );
  }

  const rec = await kvGet<Idea>(`idea:${userId}:${id}`);
  if (!rec) {
    return json({ ok: false, error: "idea not found" }, 404);
  }

  const e = {
    ts,
    type: "rule_trigger",
    meta: {
      ruleId: ruleId || rec.links.ruleId,
      address: address || rec.address,
      tf: tf || rec.tf,
      price,
      ...meta,
    },
  };

  const timeline = [...(rec.timeline || []), e].slice(-1000);
  const updated = { ...rec, updatedAt: now(), timeline };

  await kvSet(`idea:${userId}:${id}`, updated);
  return json({ ok: true, idea: updated });
}

// ============================================================================
// HELPERS
// ============================================================================
function numOr(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n : undefined;
}

function mergeTimeline(a?: any[], b?: any[]) {
  const arr = [...(a || [])];
  if (Array.isArray(b) && b.length) arr.push(...b);
  // sort by ts asc, cap length
  arr.sort((x, y) => (x.ts || 0) - (y.ts || 0));
  return arr.slice(-1000);
}

function toMD(it: Idea) {
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
      ? `**Outcome:** Exit=${fmt(it.outcome?.exitPrice)} · P/L=${it.outcome?.pnlPct?.toFixed(2) ?? "n/a"}% · Dauer=${ms(it.outcome?.durationMs)}`
      : "";

  const tl = (it.timeline || [])
    .map(
      (ev) =>
        `- ${new Date(ev.ts).toISOString()} · ${ev.type} ${ev.meta?.price ? `· @${ev.meta.price}` : ""}`
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

function fmt(n?: number) {
  return typeof n === "number" && isFinite(n) ? String(n) : "—";
}

function ms(n?: number) {
  if (!n) return "—";
  const d = Math.floor(n / 86400000),
    h = Math.floor((n % 86400000) / 3600000);
  return `${d}d ${h}h`;
}
