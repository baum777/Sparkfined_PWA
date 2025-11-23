// api/alerts.ts
// Consolidated Alerts API
// Consolidates: api/alerts/{dispatch, worker} (2→1)
// Routes:
//   POST /api/alerts?action=dispatch → Enqueue alert to processing queue
//   POST /api/alerts?action=worker   → Process alerts from queue and send push notifications

export const runtime = "nodejs";

import webpush from "web-push";
import { kvSet, kvLPush } from "../src/lib/kv";
import { sha256Url } from "../src/lib/sha";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("POST only", { status: 405 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    switch (action) {
      case "dispatch":
        return handleDispatch(req);
      case "worker":
        return handleWorker(req);
      default:
        return json(
          { ok: false, error: "Unknown action. Use ?action=dispatch|worker" },
          400
        );
    }
  } catch (error: any) {
    console.error("[alerts] Handler error:", error);
    return json({ ok: false, error: error.message || "Internal error" }, 500);
  }
}

// ============================================================================
// DISPATCH
// ============================================================================

async function handleDispatch(req: Request): Promise<Response> {
  try {
    const {
      ruleId,
      address,
      tf,
      title,
      body,
      url = "/notifications",
      userId = "anon",
    } = await req.json();

    if (!ruleId || !address) {
      return json({ ok: false, error: "ruleId & address required" }, 400);
    }

    // Dedupe (rule+address pro 60s)
    const sig = await sha256Url(
      `${ruleId}|${address}|${Math.floor(Date.now() / 60000)}`
    );
    const ok = await kvSet(`alerts:dedupe:${sig}`, 1, { ttlSec: 65 });

    // Always enqueue, but include flag
    const msg = {
      ts: Date.now(),
      ruleId,
      address,
      tf,
      title,
      body,
      url,
      userId,
      dedupSig: sig,
      dedupAccepted: ok,
    };

    await kvLPush("alerts:queue", msg);

    return json({ ok: true, queued: true, dedupAccepted: ok });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200);
  }
}

// ============================================================================
// WORKER
// ============================================================================

const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.warn("[alerts/worker] Upstash env missing");
}

const PUB = process.env.VAPID_PUBLIC_KEY || "";
const PRIV = process.env.VAPID_PRIVATE_KEY || "";
const CONTACT = process.env.VAPID_CONTACT || "mailto:admin@example.com";

if (PUB && PRIV) {
  webpush.setVapidDetails(CONTACT, PUB, PRIV);
}

async function handleWorker(req: Request): Promise<Response> {
  const authError = ensureAlertsAdminAuthorized(req);
  if (authError) return authError;

  try {
    // 1) Read batch from queue
    const batch = await fetch(
      `${UPSTASH_REDIS_REST_URL}/LRANGE/alerts:queue/0/49`,
      {
        headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
      }
    )
      .then((r) => r.json())
      .then((j) =>
        (j.result || [])
          .map((s: string) => {
            try {
              return JSON.parse(s);
            } catch {
              return null;
            }
          })
          .filter(Boolean)
      );

    if (!batch.length) {
      return json({ ok: true, processed: 0 });
    }

    // 2) Send notifications
    let sent = 0,
      failed = 0;

    for (const item of batch) {
      const title = item.title || "Sparkfined Alert";
      const body = item.body || `${item.address} · ${item.ruleId}`;
      const payload = JSON.stringify({
        title,
        body,
        url: item.url || "/notifications",
        tag: "sparkfined-alert",
      });

      // Target: all subscriptions (or by userId later)
      const subIds = await listAllSubIds(item.userId);

      for (const id of subIds) {
        const rec = await kvGet<any>(`push:sub:${id}`);
        if (!rec?.subscription) continue;

        try {
          await webpush.sendNotification(rec.subscription, payload);
          sent++;
        } catch {
          failed++;
          /* optional: delete invalid subs */
        }
      }
    }

    // 3) Trim processed batch from queue
    await clearRange("alerts:queue", batch.length);

    return json({ ok: true, processed: batch.length, sent, failed });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200);
  }
}

async function kvGet<T = any>(key: string): Promise<T | null> {
  const base = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const r = await fetch(`${base}/GET/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = await r.json();
  if (!j?.result) return null;
  try {
    return JSON.parse(j.result);
  } catch {
    return j.result;
  }
}

async function listAllSubIds(userId?: string) {
  const base = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const key = userId
    ? `push:subs:byUser:${userId}`
    : "push:subs:*"; // fallback: * not supported → global not trivial

  if (userId) {
    const res = await fetch(
      `${base}/SMEMBERS/${encodeURIComponent(key)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ).then((r) => r.json());
    return res?.result ?? [];
  }

  // without user filter: would need to read all via key iteration (not implemented)
  return [];
}

async function clearRange(key: string, count: number) {
  const base = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  // naive: LTRIM to remaining elements (remove first count elements)
  await fetch(
    `${base}/LTRIM/${encodeURIComponent(key)}/${count}/-1`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

function ensureAlertsAdminAuthorized(req: Request): Response | null {
  const secret = process.env.ALERTS_ADMIN_SECRET?.trim();
  const env = process.env.NODE_ENV ?? "production";
  const isProd = env === "production";

  if (!secret) {
    if (!isProd) {
      console.warn(
        "[alerts/worker] ALERTS_ADMIN_SECRET not set – allowing request in non-production environment"
      );
      return null;
    }
    return json({ ok: false, error: "alerts worker disabled" }, 503);
  }

  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const [scheme, token] = authHeader.split(" ", 2);
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  if (token.trim() !== secret) {
    return json({ ok: false, error: "unauthorized" }, 403);
  }

  return null;
}
