import { expect, test } from './fixtures/baseTest';
import type { Page } from '@playwright/test';

const CHART_URL = '/chart-v2';
const candlePayload = JSON.stringify(
  Array.from({ length: 50 }, (_, index) => ({
    timestamp: Date.now() - (50 - index) * 60000,
    open: 100 + index,
    high: 105 + index,
    low: 95 + index,
    close: 102 + index,
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
  await page.goto(CHART_URL);
  await expect(page.getByTestId('chart-page')).toBeVisible();
});

test('switches timeframe via toolbar', async ({ page }) => {
  await page.getByRole('button', { name: '4h' }).click();
  await expect(page).toHaveURL(/timeframe=4h/);
});

test('toggles indicators and applies presets', async ({ page }) => {
  const smaToggle = page.getByTestId('indicator-toggle-sma-20');
  await smaToggle.click();
  await expect(smaToggle).toHaveClass(/bg-surface-subtle/);

  const presetToggle = page.getByTestId('indicator-preset-swing');
  await presetToggle.click();
  await expect(presetToggle).toHaveClass(/bg-surface-subtle/);
});

test('opens replay from the chart toolbar', async ({ page }) => {
  await page.getByTestId('button-open-replay').click();
  await expect(page).toHaveURL(/\/replay/);
  await expect(page.getByTestId('replay-page')).toBeVisible();
});
