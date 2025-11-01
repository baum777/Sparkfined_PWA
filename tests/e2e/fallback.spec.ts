/**
 * Alpha Issue 14: E2E Tests
 * Provider fallback flow test
 */

import { test, expect } from '@playwright/test';

test.describe('Provider Fallback', () => {
  test.skip('falls back to secondary provider on primary failure', async ({ page, context }) => {
    // Mock primary provider to fail
    await context.route('**/api/dexpaprika/**', route => {
      route.abort('failed');
    });

    // Allow secondary provider to succeed
    await context.route('**/api/moralis/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          provider: 'moralis',
          data: { symbol: 'SOL', price: 150 },
        }),
      });
    });

    await page.goto('/analyze');

    // Enter token address
    await page.fill('input[name="token-address"]', 'So11111111111111111111111111111111111111112');
    await page.click('button[type="submit"]');

    // Wait for result
    await page.waitForSelector('[data-testid="result-card"]');

    // Verify fallback provider badge
    await expect(page.getByText(/moralis/i)).toBeVisible();
    await expect(page.getByText(/fallback/i)).toBeVisible();
  });

  test.skip('shows error when all providers fail', async ({ page, context }) => {
    // Mock all providers to fail
    await context.route('**/api/**', route => {
      route.abort('failed');
    });

    await page.goto('/analyze');

    await page.fill('input[name="token-address"]', 'So11111111111111111111111111111111111111112');
    await page.click('button[type="submit"]');

    // Verify error state
    await expect(page.getByText(/unable to fetch data/i)).toBeVisible();
  });
});
