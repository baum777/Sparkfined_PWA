import { expect, test } from '@playwright/test';
import { visitWatchlist } from '../fixtures/navigation';
import { WATCHLIST_SYMBOLS } from '../fixtures/testData';
import { stubNoisyAPIs } from '../fixtures/api-stubs';

test.describe('watchlist flows', () => {
  test.beforeEach(async ({ page }) => {
    await stubNoisyAPIs(page);
    await visitWatchlist(page);
  });

  test('@watchlist selecting a row loads its detail panel', async ({ page }) => {
    const row = page
      .locator(`[data-testid="watchlist-token-row"][data-symbol="${WATCHLIST_SYMBOLS.primary}"]`)
      .first();
    await row.click();

    await expect(page.getByTestId('watchlist-detail-panel')).toBeVisible();
    await expect(page.getByTestId('watchlist-detail-symbol')).toHaveText(WATCHLIST_SYMBOLS.primary);
  });

  test('@watchlist session filter narrows the list to NY session assets', async ({ page }) => {
    await page.getByTestId('watchlist-session-filter-NY').click();

    const rows = page.locator('[data-testid="watchlist-token-row"]');
    await expect(rows).not.toHaveCount(0);

    const sessions = await rows.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-session')));
    expect(sessions.every((session) => session === 'NY')).toBe(true);
  });

  test('@watchlist sort toggle promotes top movers to the first row', async ({ page }) => {
    const defaultFirst = await page.locator('[data-testid="watchlist-token-row"]').first().getAttribute('data-symbol');

    await page.getByTestId('watchlist-sort-toggle').click();

    const sortedFirst = await page.locator('[data-testid="watchlist-token-row"]').first().getAttribute('data-symbol');
    expect(sortedFirst).toBe(WATCHLIST_SYMBOLS.trending);
    expect(sortedFirst).not.toBe(defaultFirst);
  });

  test('@watchlist quick chart action deep-links into the chart workspace', async ({ page }) => {
    await page.locator(`[data-testid="watchlist-token-row"][data-symbol="${WATCHLIST_SYMBOLS.chartable}"]`).first().click();
    await page.getByTestId('button-open-chart').click();

    await expect(page).toHaveURL(/chart-v2\?/);
    expect(page.url()).toContain('address=');
  });

  test('@watchlist replay action links to replay view with symbol metadata', async ({ page }) => {
    await page.locator(`[data-testid="watchlist-token-row"][data-symbol="${WATCHLIST_SYMBOLS.chartable}"]`).first().click();
    await page.getByTestId('button-open-replay-from-watchlist').click();

    await expect(page).toHaveURL(/replay\?/);
    expect(page.url()).toContain(`symbol=${WATCHLIST_SYMBOLS.chartable}`);
  });
});
