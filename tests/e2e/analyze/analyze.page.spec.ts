import { expect, test } from '../fixtures/baseTest';

const ANALYSIS_URL = '/analysis-v2';

test.describe('Analyze page @p0', () => {
  test('user can view snapshot and metrics', async ({ page }) => {
    await page.goto(ANALYSIS_URL);

    await expect(page.getByTestId('analysis-page-root')).toBeVisible();
    await expect(page.getByTestId('analysis-layout')).toBeVisible();

    const stats = page.getByTestId('analysis-overview-stats');
    await stats.waitFor();
    await expect(stats).toBeVisible();

    await expect(page.getByTestId('analysis-stat-bias')).toBeVisible();
    await expect(page.getByTestId('analysis-stat-range')).toBeVisible();
    await expect(page.getByTestId('analysis-stat-price')).toBeVisible();
    await expect(page.getByTestId('analysis-stat-change')).toBeVisible();
  });
});
