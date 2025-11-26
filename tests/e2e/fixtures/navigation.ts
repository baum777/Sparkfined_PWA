import { expect, Page } from '@playwright/test';
import { awaitStableUI } from '../utils/wait';

async function visit(page: Page, path: string, testId: string) {
  await page.goto(path);
  await awaitStableUI(page);
  await expect(page.getByTestId(testId)).toBeVisible();
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
