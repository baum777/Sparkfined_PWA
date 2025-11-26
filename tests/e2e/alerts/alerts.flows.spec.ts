import { expect, test } from '@playwright/test';
import { visitAlerts } from '../fixtures/navigation';
import { ALERT_IDS } from '../fixtures/testData';
import { awaitStableUI } from '../utils/wait';

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

  test('@alerts type filter isolates volume alerts', async ({ page }) => {
    await page.getByTestId('alerts-type-filter-volume').click();

    const items = page.locator('[data-testid="alerts-list-item"]');
    await expect(items).not.toHaveCount(0);

    const types = await items.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-alert-type')));
    expect(types.every((type) => type === 'volume')).toBe(true);
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
    const preselected = ALERT_IDS.snoozed;
    await page.goto(`/alerts-v2?alert=${preselected}`);
    await awaitStableUI(page);

    await expect(page.getByTestId('alerts-detail-panel')).toBeVisible();
    await expect(page.getByTestId('alerts-detail-condition')).toContainText('Volatility compression');
    await expect(page.locator(`[data-testid="alerts-list-item"][data-alert-id="${preselected}"]`)).toHaveAttribute(
      'data-alert-status',
      'snoozed',
    );
  });

  test('@alerts combined filters show the empty state when nothing matches', async ({ page }) => {
    await page.getByTestId('alerts-status-filter-triggered').click();
    await page.getByTestId('alerts-type-filter-trend').click();

    await expect(page.getByTestId('alerts-empty-state')).toBeVisible();
  });
});
