// src/server/ideas/triggers.ts
// Attach Rule Trigger Handler
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

export async function handleAttachTrigger(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  const userId = getUserId(req);
  const body = await req.json();
  const {
    ideaId,
    ruleId,
    address,
    tf,
    price,
    ts = Date.now(),
    meta = {},
  } = body || {};

  if (!ideaId && !ruleId) {
    return json(
      { ok: false, error: "ideaId or ruleId required" },
      400
    );
  }

  const id = ideaId;
  if (!id && ruleId) {
    return json(
      {
        ok: false,
        error: "lookup by ruleId not implemented; provide ideaId",
      },
      400
    );
  }

  const rec = await kvGet<Idea>(`idea:${userId}:${id}`);
  if (!rec) {
    return json({ ok: false, error: "idea not found" }, 404);
  }

  const event = {
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

  const timeline = [...(rec.timeline || []), event].slice(-1000);
  const updated = { ...rec, updatedAt: Date.now(), timeline };

  await kvSet(`idea:${userId}:${id}`, updated);
  return json({ ok: true, idea: updated });
}
