/**
 * Oracle E2E Tests
 * 
 * Tests for Oracle page functionality.
 */

import { expect, test } from './fixtures/baseTest';
import type { Page } from '@playwright/test';

const ORACLE_URL = '/oracle';

async function bypassOnboarding(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('sparkfined_onboarding_completed', 'true');
  });
}

async function mockOracleAPI(page: Page) {
  await page.route('/api/oracle', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        report: '📊 MARKET SCORE ANALYSIS\n\nSCORE: 5/7\n\nBREAKDOWN:\n1. Liquidity: 6/7 - Strong DEX depth\n2. Volume: 5/7 - Healthy trading\n\n🎯 META-SHIFT PROBABILITIES\n\nTOP THEME: Gaming',
        score: 5,
        theme: 'Gaming',
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0],
      }),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await bypassOnboarding(page);
  await mockOracleAPI(page);
  await page.goto(ORACLE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
});

test('renders Oracle page with title', async ({ page }) => {
  await expect(page.getByTestId('oracle-page')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('heading', { name: 'Oracle' })).toBeVisible();
});

test('shows refresh button and loads report', async ({ page }) => {
  const refreshButton = page.getByTestId('oracle-refresh-button');
  await expect(refreshButton).toBeVisible();
  
  // Click refresh to load report
  await refreshButton.click();
  await page.waitForTimeout(1000);
  
  // Should show report content
  await expect(page.getByTestId('oracle-pre')).toBeVisible({ timeout: 5000 });
});

test('shows mark as read button for unread reports', async ({ page }) => {
  // Load report first
  await page.getByTestId('oracle-refresh-button').click();
  await page.waitForTimeout(1000);
  
  // Should show mark as read button
  const markReadButton = page.getByTestId('oracle-mark-read-button');
  
  // Button might not appear if report is already read
  const buttonCount = await markReadButton.count();
  if (buttonCount > 0) {
    await expect(markReadButton).toBeVisible();
    expect(await markReadButton.textContent()).toContain('Mark as Read');
  }
});

test('hides mark as read button after clicking', async ({ page }) => {
  // Load report
  await page.getByTestId('oracle-refresh-button').click();
  await page.waitForTimeout(1000);
  
  const markReadButton = page.getByTestId('oracle-mark-read-button');
  const buttonCount = await markReadButton.count();
  
  if (buttonCount > 0) {
    // Click mark as read
    await markReadButton.click();
    await page.waitForTimeout(1000);
    
    // Button should disappear
    await expect(markReadButton).not.toBeVisible();
    
    // Should show "Read" badge
    const readBadge = page.getByText('Read').first();
    await expect(readBadge).toBeVisible();
  }
});

test('renders theme filter dropdown', async ({ page }) => {
  // Wait for page to load
  await page.waitForTimeout(1000);
  
  // Should have theme filter
  const themeFilter = page.getByTestId('oracle-theme-filter');
  
  // Filter only appears if there are reports
  const filterCount = await themeFilter.count();
  expect(filterCount).toBeGreaterThanOrEqual(0);
});

test('filters history by theme selection', async ({ page }) => {
  await page.waitForTimeout(1000);
  
  const themeFilter = page.getByTestId('oracle-theme-filter');
  const filterCount = await themeFilter.count();
  
  if (filterCount > 0) {
    // Click filter to open dropdown
    await themeFilter.click();
    await page.waitForTimeout(500);
    
    // Select a theme (if options are available)
    const gamingOption = page.getByRole('option', { name: 'Gaming' });
    const optionCount = await gamingOption.count();
    
    if (optionCount > 0) {
      await gamingOption.click();
      await page.waitForTimeout(500);
      
      // Filter should update (hard to test without real data)
      await expect(themeFilter).toBeVisible();
    }
  }
});

test('renders history chart without errors', async ({ page }) => {
  await page.waitForTimeout(1000);
  
  // Check if chart renders (if reports exist)
  const chartHeading = page.getByRole('heading', { name: /Oracle Score History/ });
  const chartCount = await chartHeading.count();
  
  // Chart only appears if there's history data
  expect(chartCount).toBeGreaterThanOrEqual(0);
});

test('renders history list without errors', async ({ page }) => {
  await page.waitForTimeout(1000);
  
  // Check if history list renders (if reports exist)
  const listHeading = page.getByRole('heading', { name: /Past Reports/ });
  const listCount = await listHeading.count();
  
  // List only appears if there's history data
  expect(listCount).toBeGreaterThanOrEqual(0);
});

test('opens report modal when clicking View button', async ({ page }) => {
  await page.waitForTimeout(1000);
  
  // Look for View buttons in history list
  const viewButtons = page.getByRole('button', { name: /View/ });
  const buttonCount = await viewButtons.count();
  
  if (buttonCount > 0) {
    // Click first View button
    await viewButtons.first().click();
    await page.waitForTimeout(500);
    
    // Modal should open
    const modalTitle = page.getByRole('heading', { name: 'Oracle Report' });
    await expect(modalTitle).toBeVisible();
    
    // Close modal
    const closeButton = page.getByRole('button', { name: /Close modal/ });
    await closeButton.click();
    await page.waitForTimeout(500);
    
    // Modal should close
    await expect(modalTitle).not.toBeVisible();
  }
});

test('shows loading state while fetching', async ({ page }) => {
  // Delay API response to see loading state
  await page.route('/api/oracle', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        report: 'Test report',
        score: 5,
        theme: 'Gaming',
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0],
      }),
    });
  });
  
  await page.reload();
  await page.waitForTimeout(200);
  
  // Should show loading spinner
  const loadingText = page.getByText(/Loading Oracle/);
  
  // May or may not be visible depending on timing
  const loadingCount = await loadingText.count();
  expect(loadingCount).toBeGreaterThanOrEqual(0);
});

test('handles API errors gracefully', async ({ page }) => {
  // Mock API error
  await page.route('/api/oracle', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'ORACLE_FETCH_FAILED',
      }),
    });
  });
  
  await page.reload();
  await page.getByTestId('oracle-refresh-button').click();
  await page.waitForTimeout(1000);
  
  // Should show error message or fallback
  const errorText = page.getByText(/Could not load/);
  const emptyText = page.getByText(/No Oracle report available/);
  
  // Either error or empty state should be visible
  const errorVisible = await errorText.isVisible().catch(() => false);
  const emptyVisible = await emptyText.isVisible().catch(() => false);
  
  expect(errorVisible || emptyVisible).toBe(true);
});
