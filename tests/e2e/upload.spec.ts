/**
 * Alpha Issue 14: E2E Tests
 * Upload to result flow test
 */

import { test, expect } from '@playwright/test';

test.describe('Upload Flow', () => {
  test.skip('uploads chart and displays result card', async ({ page }) => {
    await page.goto('/');

    // Upload file
    const fileInput = page.locator('input[type=file]');
    await fileInput.setInputFiles('tests/fixtures/sample-chart.png');

    // Wait for analysis to complete
    await page.waitForSelector('[data-testid="result-card"]', { timeout: 10000 });

    // Verify result card is visible
    const resultCard = page.getByTestId('result-card');
    await expect(resultCard).toBeVisible();

    // Verify key levels are displayed
    await expect(page.getByText(/S1|R1/)).toBeVisible();

    // Verify provider badge
    await expect(page.getByText(/dexpaprika|moralis/i)).toBeVisible();
  });

  test.skip('shows loading skeleton during analysis', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type=file]');
    await fileInput.setInputFiles('tests/fixtures/sample-chart.png');

    // Verify skeleton appears quickly
    const skeleton = page.getByTestId('loading-skeleton');
    await expect(skeleton).toBeVisible({ timeout: 300 });
  });

  test.skip('handles upload errors gracefully', async ({ page }) => {
    await page.goto('/');

    // Try to upload invalid file
    const fileInput = page.locator('input[type=file]');
    await fileInput.setInputFiles('tests/fixtures/invalid.txt');

    // Verify error message
    await expect(page.getByText(/invalid file type/i)).toBeVisible();
  });
});
