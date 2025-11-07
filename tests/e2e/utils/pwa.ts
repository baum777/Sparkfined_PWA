import { expect, Page } from '@playwright/test';

export async function waitForServiceWorker(page: Page) {
  await page.waitForFunction(
    () => navigator.serviceWorker?.ready,
    null,
    { timeout: 15_000 }
  );
}

export async function readManifest(page: Page) {
  const manifestLink = page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveCount(1);

  const href = await manifestLink.getAttribute('href');
  expect(href).toBeTruthy();

  const manifestUrl = new URL(href!, page.url()).toString();
  const response = await page.request.get(manifestUrl);
  expect(response.ok()).toBeTruthy();

  const manifest = await response.json();
  expect(manifest.name || manifest.short_name).toBeTruthy();
  expect(Array.isArray(manifest.icons)).toBeTruthy();

  return manifest;
}

export async function offlineRoundtrip(page: Page, path = '/') {
  // Warm cache to ensure Service Worker has precached assets
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await waitForServiceWorker(page);

  await page.context().setOffline(true);
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.context().setOffline(false);

  expect(response?.ok()).toBeTruthy();

  // Basic shell check: root/app container should be visible
  await expect(page.locator('header, [data-app-shell], #root, #app')).toBeVisible();
}
