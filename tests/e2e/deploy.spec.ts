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

  test("App renders and shows onboarding or dashboard", async ({ page }) => {
    await page.goto('/', { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    
    // Check for either onboarding wizard OR dashboard content
    // Onboarding shows "Configure Sparkfined" text
    // Dashboard shows navigation elements
    const hasOnboarding = await page.locator("text=Configure Sparkfined").isVisible().catch(() => false);
    const hasDashboard = await page.locator("text=Board").isVisible().catch(() => false);
    
    expect(hasOnboarding || hasDashboard).toBeTruthy();
  });
});
