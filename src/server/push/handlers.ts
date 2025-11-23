// src/server/push/handlers.ts
// Consolidated Push Notification Handlers (subscribe, unsubscribe, test-send)
// Runtime: Node.js (required for KV and web-push SDK)

import { kvSet, kvSAdd, kvDel } from "@/lib/kv";
import { sha256Url } from "@/lib/sha";
import webpush from "web-push";

// ============================================================================
// HELPERS
// ============================================================================

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

// Configure VAPID once at module level
const PUB = process.env.VAPID_PUBLIC_KEY || "";
const PRIV = process.env.VAPID_PRIVATE_KEY || "";
const CONTACT = process.env.VAPID_CONTACT || "mailto:admin@example.com";

if (PUB && PRIV) {
  webpush.setVapidDetails(CONTACT, PUB, PRIV);
}

function ensureAlertsAdminAuthorized(req: Request): Response | null {
  const secret = process.env.ALERTS_ADMIN_SECRET?.trim();
  const isProd = process.env.NODE_ENV === "production";

  if (!secret) {
    if (!isProd) {
      console.warn("[push] ALERTS_ADMIN_SECRET not set – allowing in dev");
      return null;
    }
    return json({ ok: false, error: "push test disabled" }, 503);
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

  return null; // Authorized
}

// ============================================================================
// SUBSCRIBE
// ============================================================================
export async function handleSubscribe(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  try {
    const { subscription, userId = "anon" } = await req.json();

    if (!subscription?.endpoint) {
      return json({ ok: false, error: "subscription required" }, 400);
    }

    const id = await sha256Url(subscription.endpoint);
    const key = `push:sub:${id}`;

    await kvSet(key, { id, userId, subscription, ts: Date.now() });
    await kvSAdd(`push:subs:byUser:${userId}`, id);

    return json({ ok: true, id });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200);
  }
}

// ============================================================================
// UNSUBSCRIBE
// ============================================================================
export async function handleUnsubscribe(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  try {
    const { endpoint } = await req.json();

    if (!endpoint) {
      return json({ ok: false, error: "endpoint required" }, 400);
    }

    const id = await sha256Url(endpoint);
    const removed = await kvDel(`push:sub:${id}`);

    return json({ ok: true, removed });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200);
  }
}

// ============================================================================
// TEST SEND
// ============================================================================
export async function handleTestSend(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  // Auth check
  const authError = ensureAlertsAdminAuthorized(req);
  if (authError) return authError;

  try {
    if (!PUB || !PRIV) {
      return json({ ok: false, error: "VAPID keys missing" }, 500);
    }

    const { subscription, payload } = await req.json();

    if (!subscription) {
      return json({ ok: false, error: "subscription required" }, 400);
    }

    const data = payload || {
      title: "Sparkfined — Test Push",
      body: "Wenn du das siehst, ist Web-Push aktiv ✅",
      url: "/notifications",
      tag: "sparkfined-test",
    };

    await webpush.sendNotification(subscription, JSON.stringify(data));

    return json({ ok: true });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200);
  }
}
