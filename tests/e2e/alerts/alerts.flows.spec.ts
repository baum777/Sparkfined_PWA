import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures/baseTest';
import { visitAlerts } from '../fixtures/navigation';
import { ALERT_IDS } from '../fixtures/testData';
import { awaitStableUI } from '../utils/wait';

async function createAlert(page: Page, symbol: string) {
  await page.getByTestId('alerts-new-alert-button').click();
  await page.getByTestId('alert-create-dialog').waitFor();
  await page.getByTestId('alert-symbol-input').fill(symbol);
  await page.getByTestId('alert-condition-input').fill('Automation condition for alert lifecycle.');
  await page.getByTestId('alert-threshold-input').fill('123');
  await page.getByTestId('alert-submit-button').click();
  await page.waitForSelector('[data-testid="alert-create-dialog"]', { state: 'detached' });
}

test.describe('alerts flows', () => {
  test.beforeEach(async ({ page }) => {
    await visitAlerts(page);
  });

  test('@alerts status filter shows only triggered alerts', async ({ page }) => {
    await page.getByTestId('alerts-status-filter-triggered').click();

    const items = page.locator('[data-testid="alerts-list-item"]');
    await expect(items).not.toHaveCount(0);

    const statuses = await items.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-alert-status')));
    expect(statuses.every((status) => status === 'triggered')).toBe(true);
  });

  test('@alerts type filter isolates price-above alerts', async ({ page }) => {
    await page.getByTestId('alerts-type-filter-price-above').click();

    const items = page.locator('[data-testid="alerts-list-item"]');
    await expect(items).not.toHaveCount(0);

    const types = await items.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-alert-type')));
    expect(types.every((type) => type === 'price-above')).toBe(true);
  });

  test('@alerts selecting an alert updates the detail panel and URL', async ({ page }) => {
    const targetId = ALERT_IDS.armed;
    const targetLocator = page.locator(`[data-testid="alerts-list-item"][data-alert-id="${targetId}"]`).first();

    await targetLocator.click();
    await expect(page.getByTestId('alerts-detail-panel')).toBeVisible();
    await expect(page.getByTestId('alerts-detail-condition')).toContainText('Price closes above');
    await expect(page).toHaveURL(new RegExp(`alert=${targetId}`));
  });

  test('@alerts respects preselected alert query params', async ({ page }) => {
    const preselected = ALERT_IDS.paused;
    await page.goto(`/alerts-v2?alert=${preselected}`);
    await awaitStableUI(page);

    await expect(page.getByTestId('alerts-detail-panel')).toBeVisible();
    await expect(page.getByTestId('alerts-detail-condition')).toContainText('Breaks above prior value area');
    await expect(page.locator(`[data-testid="alerts-list-item"][data-alert-id="${preselected}"]`)).toHaveAttribute(
      'data-alert-status',
      'paused',
    );
  });

  test('@alerts combined filters show the empty state when nothing matches', async ({ page }) => {
    await page.getByTestId('alerts-status-filter-armed').click();
    await page.getByTestId('alerts-type-filter-price-below').click();

    await expect(page.getByTestId('alerts-empty-state')).toBeVisible();
  });

  test('@alerts deleting the active alert clears the detail panel and URL', async ({ page }) => {
    const tempSymbol = 'E2ECLR';
    await createAlert(page, tempSymbol);

    const created = page.locator('[data-testid="alerts-list-item"]').filter({ hasText: tempSymbol }).first();
    const alertId = await created.getAttribute('data-alert-id');
    expect(alertId).toBeTruthy();

    await created.click();
    await expect(page.getByTestId('alerts-detail-panel')).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByTestId('alert-delete-button').click();

    if (alertId) {
      await expect(page.locator(`[data-alert-id="${alertId}"]`)).toHaveCount(0);
    }

    await expect(page.getByTestId('alerts-detail-empty')).toBeVisible();
    await expect(page).not.toHaveURL(/alert=/);
  });
});
