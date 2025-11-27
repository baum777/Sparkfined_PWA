import { Page } from '@playwright/test';

/**
 * Stub noisy API endpoints that aren't needed for E2E tests
 * This prevents proxy errors from cluttering the test output
 */
export async function stubNoisyAPIs(page: Page): Promise<void> {
  // Stub telemetry - not needed for functional tests
  await page.route('**/api/telemetry', (route) => {
    return route.fulfill({
      status: 204,
      body: '',
    });
  });

  // Stub Moralis API - not needed for most journal/alerts/watchlist tests
  await page.route('**/api/moralis/**', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    });
  });

  // Stub other data APIs that might cause noise
  await page.route('**/api/data/**', (route) => {
    // Allow through, but catch errors
    return route.continue().catch(() => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: null, cached: true }),
      });
    });
  });
}
