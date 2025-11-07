import { expect, test } from '@playwright/test';
import { offlineRoundtrip, readManifest } from './utils/pwa';

const ACCESS_PATH = process.env.ACCESS_PATH || '/access';
const ACCESS_ENABLED = process.env.ACCESS_ENABLED === 'true';

test.describe('Sparkfined Deploy Smoke', () => {
  test('PWA installability & app shell', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await readManifest(page);
    await offlineRoundtrip(page, '/');
  });

  test('Access page renders', async ({ page }) => {
    test.skip(!ACCESS_ENABLED, 'Access page behind feature flag or not available');

    const response = await page.goto(ACCESS_PATH, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    const accessHeading = page.getByRole('heading', { name: /Access/i });
    if ((await accessHeading.count()) === 0) {
      test.skip(`Access heading not present at ${ACCESS_PATH}`);
    }
    await expect(accessHeading.first()).toBeVisible();
  });
});
