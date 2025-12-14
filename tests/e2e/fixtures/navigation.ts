import { expect, Page } from '@playwright/test';
import { awaitStableUI } from '../utils/wait';

async function visit(page: Page, path: string, testId: string) {
  await page.goto(path, { waitUntil: 'networkidle' });
  await awaitStableUI(page);

  // Wait for Suspense fallback to disappear (if present)
  const loadingIndicator = page.getByTestId('app-loading');
  const isLoading = await loadingIndicator.isVisible().catch(() => false);
  if (isLoading) {
    await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
  }

  // Wait for the specific page element to be visible
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 15000 });
}

export async function visitJournal(page: Page) {
  await visit(page, '/journal', 'journal-page');
}

export async function visitAlerts(page: Page) {
  await visit(page, '/alerts-v2', 'alerts-page');
}

export async function visitWatchlist(page: Page) {
  await visit(page, '/watchlist-v2', 'watchlist-page');
}
