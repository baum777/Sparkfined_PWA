import { expect, test, type Page } from '@playwright/test';

const ALERTS_URL = '/alerts-v2';

async function bypassOnboarding(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('sparkfined_onboarding_completed', 'true');
  });
}

async function goToAlerts(page: Page) {
  await page.goto(ALERTS_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await expect(page.getByTestId('alerts-page')).toBeVisible({ timeout: 10000 });
}

async function createAlert(page: Page, symbol: string) {
  await page.getByTestId('alerts-new-alert-button').click();
  await page.getByTestId('alert-create-dialog').waitFor();
  await page.getByTestId('alert-symbol-input').fill(symbol);
  await page.getByTestId('alert-condition-input').fill('Automation condition for alert CRUD tests.');
  await page.getByTestId('alert-threshold-input').fill('99');
  await page.getByTestId('alert-submit-button').click();
  await page.waitForSelector('[data-testid="alert-create-dialog"]', { state: 'detached' });
}

test.beforeEach(async ({ page }) => {
  await bypassOnboarding(page);
  await goToAlerts(page);
});

test('filters alerts by status', async ({ page }) => {
  await page.getByTestId('alerts-status-filter-armed').click();
  const visible = page.locator('[data-testid="alerts-list-item"]');
  const allArmed = await visible.evaluateAll((nodes) => nodes.every((node) => node.getAttribute('data-alert-status') === 'armed'));
  expect(allArmed).toBe(true);
});

test('filters alerts by type', async ({ page }) => {
  await page.getByTestId('alerts-type-filter-price-below').click();
  const visible = page.locator('[data-testid="alerts-list-item"]');
  const allPriceBelow = await visible.evaluateAll((nodes) => nodes.every((node) => node.getAttribute('data-alert-type') === 'price-below'));
  expect(allPriceBelow).toBe(true);
});

test('creates a new alert via the dialog', async ({ page }) => {
  const initialCount = await page.getByTestId('alerts-list-item').count();
  await createAlert(page, 'E2ECRT');
  const nextCount = await page.getByTestId('alerts-list-item').count();
  expect(nextCount).toBe(initialCount + 1);
});

test('edits and deletes a newly created alert', async ({ page }) => {
  const symbol = 'E2EDEL';
  await createAlert(page, symbol);
  const createdAlert = page
    .locator('[data-testid="alerts-list-item"]').filter({ hasText: symbol })
    .first();
  const alertId = await createdAlert.getAttribute('data-alert-id');
  expect(alertId).toBeTruthy();
  if (!alertId) {
    throw new Error('Missing alert id after creation');
  }
  await createdAlert.click();
  await expect(page.getByTestId('alerts-detail-panel')).toBeVisible();

  await page.getByTestId('alerts-edit-alert-button').click();
  await page.getByTestId('alert-edit-dialog').waitFor();
  const updatedCondition = 'Condition updated via Playwright.';
  await page.getByTestId('alert-edit-condition-input').fill(updatedCondition);
  await page.getByTestId('alert-edit-submit-button').click();
  await page.waitForSelector('[data-testid="alert-edit-dialog"]', { state: 'detached' });
  await expect(page.getByTestId('alerts-detail-condition')).toHaveText(updatedCondition);

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByTestId('alert-delete-button').click();
  await page.waitForSelector(`[data-alert-id="${alertId}"]`, { state: 'detached' });
});
