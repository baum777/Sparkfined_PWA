import { expect, test } from './fixtures/baseTest';
import type { Page } from '@playwright/test';

const JOURNAL_URL = '/journal';

test.skip(true, 'Legacy journal CRUD flows pending migration to the new journal pipeline');

async function bypassOnboarding(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('sparkfined_onboarding_completed', 'true');
  });
}

async function createJournalEntry(page: Page, title: string, notes: string) {
  await page.getByTestId('journal-new-entry-button').click();
  await page.getByTestId('journal-new-entry-dialog').waitFor();
  await page.getByTestId('journal-new-entry-title').fill(title);
  await page.getByTestId('journal-new-entry-notes').fill(notes);
  await page.getByTestId('journal-save-entry-button').click();
  await page.waitForSelector('[data-testid="journal-new-entry-dialog"]', { state: 'detached' });
}

test.beforeEach(async ({ page }) => {
  await bypassOnboarding(page);
  await page.goto(JOURNAL_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await expect(page.getByTestId('journal-page')).toBeVisible({ timeout: 10000 });
});

test('shows journal entries and detail panel updates', async ({ page }) => {
  const firstEntry = page.getByTestId('journal-list-item').first();
  await expect(firstEntry).toBeVisible();
  await firstEntry.click();
  await expect(firstEntry).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('journal-detail-panel')).toBeVisible();
});

test('filters entries by direction toggle', async ({ page }) => {
  const allCount = await page.getByTestId('journal-list-item').count();
  await page.getByTestId('journal-filter-long').click();
  const longEntries = page.locator('[data-testid="journal-list-item"]');
  const longCount = await longEntries.count();
  expect(longCount).toBeGreaterThan(0);
  expect(longCount).toBeLessThanOrEqual(allCount);
  const allLong = await longEntries.evaluateAll((nodes) => nodes.every((node) => node.getAttribute('data-direction') === 'long'));
  expect(allLong).toBe(true);
});

test('creates a new journal entry via the dialog', async ({ page }) => {
  const initialCount = await page.getByTestId('journal-list-item').count();
  const entryTitle = 'Playwright Entry';
  await createJournalEntry(page, entryTitle, 'Documented from automated onboarding test.');
  await expect(page.getByTestId('journal-entry-list')).toContainText(entryTitle);
  const nextCount = await page.getByTestId('journal-list-item').count();
  expect(nextCount).toBe(initialCount + 1);
});

test('updates notes and deletes a created entry', async ({ page }) => {
  const entryTitle = 'Playwright Edit Target';
  await createJournalEntry(page, entryTitle, 'Initial draft');
  const createdEntry = page
    .locator('[data-testid="journal-list-item"]')
    .filter({ hasText: entryTitle })
    .first();
  const entryId = await createdEntry.getAttribute('data-entry-id');
  expect(entryId).toBeTruthy();
  if (!entryId) {
    throw new Error('Failed to resolve entry id for created journal entry');
  }
  await createdEntry.click();

  await page.getByTestId('journal-edit-notes-button').click();
  const updatedNotes = 'Updated via Playwright to verify edit pipeline.';
  await page.getByTestId('journal-detail-notes-input').fill(updatedNotes);
  await page.getByTestId('journal-detail-save-notes').click();
  await expect(page.getByTestId('journal-notes-content')).toContainText(updatedNotes);

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByTestId('journal-delete-button').click();
  await page.waitForSelector(`[data-entry-id="${entryId}"]`, { state: 'detached' });
});
