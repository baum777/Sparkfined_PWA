// src/server/ideas/handlers.ts
// Ideas CRUD Handlers (list, create, update, delete)
// Runtime: Node.js (required for KV)

import { kvGet, kvSet, kvDel, kvSAdd, kvSMembers } from "@/lib/kv";
import type { Idea } from "@/lib/ideas";

// ============================================================================
// HELPERS
// ============================================================================

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

const getUserId = (req: Request): string => {
  const url = new URL(req.url);
  return (
    url.searchParams.get("userId") ||
    req.headers.get("x-user-id") ||
    "anon"
  );
};

const now = () => Date.now();

function numOr(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n : undefined;
}

function mergeTimeline(a?: any[], b?: any[]) {
  const arr = [...(a || [])];
  if (Array.isArray(b) && b.length) arr.push(...b);
  arr.sort((x, y) => (x.ts || 0) - (y.ts || 0));
  return arr.slice(-1000);
}

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
    const idea = await kvGet<Idea>(`idea:${userId}:${id}`);
    if (idea) rows.push(idea);
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
  const body = await req.json();

  // Handle delete action
  if (body?.delete && body?.id) {
    await kvDel(`idea:${userId}:${body.id}`);
    return json({ ok: true, deleted: body.id });
  }

  const id = body?.id || crypto.randomUUID();
  const prev = await kvGet<Idea>(`idea:${userId}:${id}`);

  const rec: Idea = {
    id,
    userId,
    address: body.address ?? prev?.address,
    tf: body.tf ?? prev?.tf,
    side: (body.side ?? prev?.side) || "long",
    title: body.title ?? prev?.title ?? "Idea",
    thesis: body.thesis ?? prev?.thesis ?? "",
    entry: numOr(body.entry ?? prev?.entry),
    invalidation: numOr(body.invalidation ?? prev?.invalidation),
    targets: Array.isArray(body.targets)
      ? body.targets.map(Number).slice(0, 6)
      : prev?.targets ?? [],
    status: body.status || prev?.status || "draft",
    createdAt: prev?.createdAt || body.createdAt || now(),
    updatedAt: now(),
    links: { ...(prev?.links || {}), ...(body.links || {}) },
    flags: { ...(prev?.flags || {}), ...(body.flags || {}) },
    outcome: { ...(prev?.outcome || {}), ...(body.outcome || {}) },
    timeline: mergeTimeline(prev?.timeline, body.timeline),
  };

  if (!rec.address || !rec.tf) {
    return json({ ok: false, error: "address & tf required" }, 400);
  }

  await kvSet(`idea:${userId}:${id}`, rec);
  await kvSAdd(`ideas:byUser:${userId}`, id);

  return json({ ok: true, idea: rec });
}
