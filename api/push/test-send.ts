// Node-Runtime (nicht Edge), sendet eine Test-Push an die übergebene Subscription.
export const runtime = "nodejs";

import type { VercelRequest, VercelResponse } from "@vercel/node";
import webpush from "web-push";

const PUB  = process.env.VAPID_PUBLIC_KEY || "";
const PRIV = process.env.VAPID_PRIVATE_KEY || "";
const CONTACT = process.env.VAPID_CONTACT || "mailto:admin@example.com";
if (PUB && PRIV) webpush.setVapidDetails(CONTACT, PUB, PRIV);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  if (!ensureAlertsAdminAuthorized(req, res)) return;
  try {
    if (!PUB || !PRIV) return res.status(500).json({ ok:false, error:"VAPID keys missing" });
    const { subscription, payload } = req.body || {};
    if (!subscription) return res.status(400).json({ ok:false, error:"subscription required" });
    const data = payload || {
      title: "Sparkfined — Test Push",
      body: "Wenn du das siehst, ist Web-Push aktiv ✅",
      url: "/notifications",
      tag: "sparkfined-test",
    };
    await webpush.sendNotification(subscription, JSON.stringify(data));
    return res.status(200).json({ ok: true });
  } catch (e:any) {
    return res.status(200).json({ ok:false, error: String(e?.message ?? e) });
  }
}

function ensureAlertsAdminAuthorized(req: VercelRequest, res: VercelResponse): boolean {
  const secret = process.env.ALERTS_ADMIN_SECRET?.trim();
  const env = process.env.NODE_ENV ?? "production";
  const isProd = env === "production";

  if (!secret) {
    if (!isProd) {
      console.warn("[push/test-send] ALERTS_ADMIN_SECRET not set – allowing request in non-production environment");
      return true;
    }
    res.status(503).json({ ok:false, error:"push test disabled" });
    return false;
  }

  const rawHeader = req.headers["authorization"];
  const authHeader = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  if (!authHeader) {
    res.status(401).json({ ok:false, error:"unauthorized" });
    return false;
  }

  const [scheme, token] = authHeader.split(" ", 2);
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    res.status(401).json({ ok:false, error:"unauthorized" });
    return false;
  }

  if (token.trim() !== secret) {
    res.status(403).json({ ok:false, error:"unauthorized" });
    return false;
  }

  return true;
}
