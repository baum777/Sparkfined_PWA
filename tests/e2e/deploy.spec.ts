// tests/e2e/deploy.spec.ts
import { test, expect } from "./fixtures/baseTest";

test.describe("Sparkfined Deploy Smoke", () => {
  test("PWA installability & app shell", async ({ page, request }) => {
    await page.goto('/', { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();

    // Manifest
    const maniRes = await request.get(`/manifest.webmanifest`);
    expect(maniRes.status()).toBe(200);
    const mani = await maniRes.json();
    expect(mani.name).toBeTruthy();
    expect(Array.isArray(mani.icons)).toBeTruthy();

    // Service worker ready (heuristic)
    await page.addInitScript(() => {
      (window as any).__swReady = navigator.serviceWorker?.ready || Promise.resolve(null);
    });
    const swReady = await page.evaluate(async () => !!(await (window as any).__swReady));
    expect(swReady).toBeTruthy();
  });

  test("Access page renders", async ({ page }) => {
    await page.goto('/access', { waitUntil: "networkidle" });
    await expect(page.locator("body")).toBeVisible();
    // Minimal smoke check; adjust to your UI copy
    await expect(page.locator("text=Access").first()).toBeVisible();
  });
});
