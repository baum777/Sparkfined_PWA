import { expect, test, type Page } from '@playwright/test';

const WATCHLIST_URL = '/watchlist-v2';
const candlePayload = JSON.stringify(
  Array.from({ length: 25 }, (_, index) => ({
    timestamp: Date.now() - (25 - index) * 60000,
    open: 90 + index,
    high: 100 + index,
    low: 80 + index,
    close: 95 + index,
  })),
);

async function bypassOnboarding(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('sparkfined_onboarding_completed', 'true');
  });
}

async function mockCandles(page: Page) {
  await page.route('**/networks/**/tokens/**/ohlcv**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: candlePayload });
  });
  await page.route('**/api/moralis/**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: candlePayload });
  });
}

test.beforeEach(async ({ page }) => {
  await bypassOnboarding(page);
  await mockCandles(page);
  await page.goto(WATCHLIST_URL);
  await expect(page.getByTestId('watchlist-page')).toBeVisible();
});

test('filters watchlist rows by session', async ({ page }) => {
  await page.getByTestId('watchlist-session-filter-London').click();
  const filteredRows = page.locator('[data-testid="watchlist-token-row"]');
  const rowCount = await filteredRows.count();
  expect(rowCount).toBeGreaterThan(0);
  const allMatch = await filteredRows.evaluateAll((nodes) => nodes.every((node) => node.getAttribute('data-session') === 'London'));
  expect(allMatch).toBe(true);
});

test('cycles sort toggle through default, top movers, and alphabetical', async ({ page }) => {
  const defaultSymbol = await page.locator('[data-testid="watchlist-token-row"]').first().getAttribute('data-symbol');
  expect(defaultSymbol).toBe('BTCUSDT');

  await page.getByTestId('watchlist-sort-toggle').click();
  const moversSymbol = await page.locator('[data-testid="watchlist-token-row"]').first().getAttribute('data-symbol');
  expect(moversSymbol).toBe('OPUSDT');

  await page.getByTestId('watchlist-sort-toggle').click();
  const alphabeticalSymbol = await page.locator('[data-testid="watchlist-token-row"]').first().getAttribute('data-symbol');
  expect(alphabeticalSymbol).toBe('ARBUSDT');
});

test('opens chart and replay flows from the detail panel', async ({ page }) => {
  const targetRow = page.locator('[data-testid="watchlist-token-row"][data-symbol="SOLUSDT"]').first();
  await targetRow.click();
  await page.getByTestId('button-open-chart').click();
  await expect(page).toHaveURL(/\/chart-v2/);
  await page.goBack();
  await expect(page.getByTestId('watchlist-page')).toBeVisible();

  await page.locator('[data-testid="watchlist-token-row"][data-symbol="SOLUSDT"]').first().click();
  await page.getByTestId('button-open-replay-from-watchlist').click();
  await expect(page).toHaveURL(/\/replay/);
  await expect(page.getByTestId('replay-page')).toBeVisible();
});
