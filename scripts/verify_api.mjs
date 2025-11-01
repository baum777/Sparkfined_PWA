// scripts/verify_api.mjs
import assert from "node:assert/strict";

const BASE = process.env.VERIFY_BASE_URL || process.env.npm_config_verify_base_url;
if (!BASE) {
  console.error("❌ VERIFY_BASE_URL is not set. Example:");
  console.error("   VERIFY_BASE_URL=https://your-app.vercel.app node scripts/verify_api.mjs");
  process.exit(1);
}

const get = async (path) => {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  let body = null;
  try { body = await res.clone().json(); } catch {}
  return { status: res.status, headers: res.headers, body };
};

(async () => {
  console.log("🔎 Verifying:", BASE);

  // 1) Root
  const root = await get("/");
  assert.equal(root.status, 200, "Root not 200");
  console.log("✅ / 200 OK");

  // 2) Manifest
  const manifest = await get("/manifest.webmanifest");
  assert.equal(manifest.status, 200, "manifest missing");
  assert.ok(manifest.body?.name && manifest.body?.icons?.length, "manifest invalid");
  console.log("✅ manifest.webmanifest present");

  // 3) Service Worker (path may vary; presence optional)
  const sw = await get("/sw.js");
  console.log(sw.status === 200 ? "✅ sw.js present" : "ℹ️ sw.js not at root (ok if injected) ");

  // 4) Security headers
  const csp = root.headers.get("content-security-policy");
  assert.ok(csp && csp.includes("default-src"), "CSP header weak/absent");
  console.log("✅ CSP present");

  // 5) API: /api/mcap
  const mcap = await get("/api/mcap");
  assert.equal(mcap.status, 200, "/api/mcap not 200");
  assert.ok(typeof mcap.body?.mcap === "number", "mcap invalid");
  console.log("✅ /api/mcap ok:", mcap.body.mcap);

  // 6) API: /api/access-status (optional wallet)
  const wallet = process.env.VERIFY_DEV_WALLET;
  if (wallet) {
    const acc = await get(`/api/access-status?wallet=${wallet}`);
    assert.equal(acc.status, 200, "/api/access-status not 200");
    assert.ok(["og", "holder", "none", "loading"].includes(acc.body?.status), "access-status invalid");
    console.log("✅ /api/access-status ok:", acc.body.status);
  } else {
    console.log("ℹ️ VERIFY_DEV_WALLET not set → skipping /api/access-status");
  }

  console.log("🎉 API & headers verification PASSED");
})().catch((e) => {
  console.error("❌ Verification failed:", e?.message || e);
  process.exit(1);
});
