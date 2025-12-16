import { expect, test, type Page } from '@playwright/test';

const DASHBOARD_URL = '/dashboard-v2';
const ALERTS_URL = '/alerts';

async function bypassOnboarding(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('sparkfined_onboarding_completed', 'true');
  });
}

async function createAlertFromAlertsPage(page: Page, symbol: string) {
  await page.getByTestId('alerts-new-alert-button').click();
  await page.getByTestId('alert-create-dialog').waitFor();
  await page.getByTestId('alert-symbol-input').fill(symbol);
  await page.getByTestId('alert-condition-input').fill('Automation condition for KPI test.');
  await page.getByTestId('alert-threshold-input').fill('123');
  await page.getByTestId('alert-submit-button').click();
  await page.waitForSelector('[data-testid="alert-create-dialog"]', { state: 'detached' });
}

test.beforeEach(async ({ page }) => {
  await bypassOnboarding(page);
  await page.goto(DASHBOARD_URL);
});

test('shows snapshot counts for armed and triggered alerts', async ({ page }) => {
  await expect(page.getByTestId('dashboard-alerts-snapshot')).toBeVisible();
  await expect(page.getByTestId('dashboard-alerts-armed-count')).toHaveText('2');
  await expect(page.getByTestId('dashboard-alerts-triggered-count')).toHaveText('2');
});

test('navigates to alerts page from snapshot action', async ({ page }) => {
  await page.getByTestId('dashboard-alerts-view-all').click();
  await expect(page).toHaveURL(new RegExp(ALERTS_URL));
  await expect(page.getByTestId('alerts-page')).toBeVisible();
});

test('refreshes dashboard KPI counts after creating a new alert', async ({ page }) => {
  const initialCount = parseInt((await page.getByTestId('dashboard-alerts-armed-count').innerText()) || '0', 10);
  await page.getByTestId('dashboard-alerts-view-all').click();
  await expect(page.getByTestId('alerts-page')).toBeVisible();
  await createAlertFromAlertsPage(page, 'PLAYE2E');
  await page.goto(DASHBOARD_URL);
  await expect(page.getByTestId('dashboard-alerts-armed-count')).toHaveText(String(initialCount + 1));
});
