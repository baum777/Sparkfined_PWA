// Node-Runtime (nicht Edge), sendet eine Test-Push an die übergebene Subscription.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import webpush from "web-push";

const PUB  = process.env.VAPID_PUBLIC_KEY || "";
const PRIV = process.env.VAPID_PRIVATE_KEY || "";
const CONTACT = process.env.VAPID_CONTACT || "mailto:admin@example.com";
if (PUB && PRIV) webpush.setVapidDetails(CONTACT, PUB, PRIV);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
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
