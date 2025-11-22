// Node Runtime: zieht Items aus Queue & sendet Web-Push an alle Subs (oder pro userId)
export const runtime = "nodejs";

import type { VercelRequest, VercelResponse } from "@vercel/node";
import webpush from "web-push";

// Fix relative import because Node runtime resolves from project root
const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;
if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.warn("[alerts/worker] Upstash env missing");
}
const PUB  = process.env.VAPID_PUBLIC_KEY || "";
const PRIV = process.env.VAPID_PRIVATE_KEY || "";
const CONTACT = process.env.VAPID_CONTACT || "mailto:admin@example.com";
if (PUB && PRIV) webpush.setVapidDetails(CONTACT, PUB, PRIV);

// rudimentäres LPOP via LRANGE + TRIM nicht verfügbar in REST → wir konsumieren „batch-like"
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!ensureAlertsAdminAuthorized(req, res)) {
    return;
  }

  try {
    // 1) Batch lesen
    const batch = await fetch(`${UPSTASH_REDIS_REST_URL}/LRANGE/alerts:queue/0/49`, {
      headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` }
    }).then(r=>r.json()).then(j => (j.result||[]).map((s:string)=>{ try{return JSON.parse(s);}catch{return null} }).filter(Boolean));
    if (!batch.length) return res.status(200).json({ ok:true, processed:0 });

    // 2) Senden
    let sent = 0, failed = 0;
    for (const item of batch) {
      const title = item.title || "Sparkfined Alert";
      const body  = item.body  || `${item.address} · ${item.ruleId}`;
      const payload = JSON.stringify({ title, body, url: item.url || "/notifications", tag: "sparkfined-alert" });
      // Zielgruppe: alle Subs (oder später: nur userId)
      const subIds = await listAllSubIds(item.userId);
      for (const id of subIds) {
        const rec = await kvGet<any>(`push:sub:${id}`);
        if (!rec?.subscription) continue;
        try { await webpush.sendNotification(rec.subscription, payload); sent++; }
        catch { failed++; /* optional: delete invalid subs */ }
      }
    }
    // 3) Batch trimmen (LREM jedes Elements)
    await clearRange("alerts:queue", batch.length);
    return res.status(200).json({ ok:true, processed: batch.length, sent, failed });
  } catch (e:any) {
    return res.status(200).json({ ok:false, error:String(e?.message ?? e) });
  }
}

async function kvGet<T=any>(key:string): Promise<T|null> {
  const base = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const r = await fetch(`${base}/GET/${encodeURIComponent(key)}`, { headers: { Authorization:`Bearer ${token}` } });
  const j = await r.json();
  if (!j?.result) return null;
  try { return JSON.parse(j.result); }
  catch { return j.result; }
}

async function listAllSubIds(userId?:string){
  const base = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const key = userId ? `push:subs:byUser:${userId}` : "push:subs:*"; // fallback: * nicht unterstützt → global nicht trivial
  if (userId) {
    const res = await fetch(`${base}/SMEMBERS/${encodeURIComponent(key)}`, { headers: { Authorization:`Bearer ${token}` } }).then(r=>r.json());
    return res?.result ?? [];
  }
  // ohne user filter: lesen wir alle per Schlüsselset (einfachheitshalber: iterativ nicht implementiert)
  return [];
}
async function clearRange(key:string, count:number){
  const base = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  // naive: LTRIM auf Rest (count Elemente entfernen)
  await fetch(`${base}/LTRIM/${encodeURIComponent(key)}/${count}/-1`, { headers:{ Authorization:`Bearer ${token}` } });
}

function ensureAlertsAdminAuthorized(req: VercelRequest, res: VercelResponse): boolean {
  const secret = process.env.ALERTS_ADMIN_SECRET?.trim();
  const env = process.env.NODE_ENV ?? "production";
  const isProd = env === "production";

  if (!secret) {
    if (!isProd) {
      console.warn("[alerts/worker] ALERTS_ADMIN_SECRET not set – allowing request in non-production environment");
      return true;
    }
    res.status(503).json({ ok:false, error:"alerts worker disabled" });
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
