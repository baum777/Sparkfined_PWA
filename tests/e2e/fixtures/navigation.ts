import { expect, Page } from '@playwright/test';
import { awaitStableUI } from '../utils/wait';

async function visit(page: Page, path: string, testId: string) {
  await page.goto(path, { waitUntil: 'networkidle' });
  await awaitStableUI(page);
  
  // Wait for Suspense fallback to complete (if any)
  await page.waitForSelector('[data-testid]:not([data-testid*="loading"])', {
    state: 'visible',
    timeout: 10000,
  }).catch(() => {
    // Fallback: just wait for any content
    console.log(`[E2E] Suspense fallback detected for ${path}, waiting longer...`);
  });
  
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 10000 });
}

export async function visitJournal(page: Page) {
  await visit(page, '/journal-v2', 'journal-page');
}

export async function visitAlerts(page: Page) {
  await visit(page, '/alerts-v2', 'alerts-page');
}

export async function visitWatchlist(page: Page) {
  await visit(page, '/watchlist-v2', 'watchlist-page');
}
