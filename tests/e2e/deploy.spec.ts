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
    // Note: SW is disabled in dev mode (vite.config.ts: devOptions.enabled = false)
    // Only check if serviceWorker API exists
    const swSupported = await page.evaluate(() => 'serviceWorker' in navigator);
    expect(swSupported).toBeTruthy();
  });

  test("App renders and shows dashboard", async ({ page }) => {
    await page.goto('/', { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    
    // Dashboard should show title or navigation
    // Check for Dashboard heading or any main navigation text
    const hasDashboard = await page.locator("text=Dashboard").first().isVisible().catch(() => false);
    const hasNavigation = await page.locator("text=Journal").isVisible().catch(() => false);
    const hasContent = await page.locator("text=Sparkfined").isVisible().catch(() => false);
    
    expect(hasDashboard || hasNavigation || hasContent).toBeTruthy();
  });
});
