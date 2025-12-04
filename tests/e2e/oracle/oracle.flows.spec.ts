import { expect, test } from '../fixtures/baseTest';
import { visitOracle } from '../fixtures/navigation';

test.describe('oracle flows', () => {
  test.beforeEach(async ({ page }) => {
    await visitOracle(page);
  });

  test('@oracle mark as read updates the report badge', async ({ page }) => {
    const markButton = page.getByTestId('oracle-mark-read-button');
    await expect(markButton).toBeVisible();
    await expect(markButton).toBeEnabled();

    await markButton.click();
    await expect(markButton).toBeDisabled();
    await expect(page.getByText('Read')).toBeVisible();
  });

  test('@oracle chart and history respond to theme filter', async ({ page }) => {
    await expect(page.getByTestId('oracle-theme-filter')).toBeVisible();
    await expect(page.getByTestId('oracle-history-chart')).toBeVisible();
    await expect(page.getByTestId('oracle-history-list')).toBeVisible();

    // Switch theme filter to Gaming (default stub) and ensure UI is still stable
    const filterTrigger = page.getByTestId('oracle-theme-select');
    await filterTrigger.click();
    await page.getByRole('option', { name: 'Gaming' }).click();

    await expect(page.getByTestId('oracle-history-chart')).toBeVisible();
    await expect(page.getByTestId('oracle-history-list')).toBeVisible();
  });
});
