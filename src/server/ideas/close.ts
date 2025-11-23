// src/server/ideas/close.ts
// Close Idea Handler (calculate outcome)
// Runtime: Node.js (required for KV)

import { kvGet, kvSet } from "@/lib/kv";
import type { Idea } from "@/lib/ideas";

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

export async function handleClose(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  const userId = getUserId(req);
  const body = await req.json();
  const { id, exitPrice, note } = body || {};

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

  const outcome = {
    exitPrice,
    entryPrice,
    pnlPct,
    durationMs: Date.now() - (rec.createdAt || Date.now()),
    exitAt: Date.now(),
    note: note || "",
  };

  const timeline = [
    ...(rec.timeline || []),
    { ts: Date.now(), type: "closed", meta: { exitPrice, pnlPct } },
  ].slice(-1000);

  const updated = {
    ...rec,
    status: "closed",
    outcome: { ...(rec.outcome || {}), ...outcome },
    updatedAt: Date.now(),
    timeline,
  };

  await kvSet(`idea:${userId}:${id}`, updated);
  return json({ ok: true, idea: updated });
}
