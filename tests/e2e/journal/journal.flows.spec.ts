import { expect, test } from '@playwright/test';
import { visitJournal } from '../fixtures/navigation';
import { makeJournalTestEntry } from '../fixtures/testData';
import { awaitStableUI } from '../utils/wait';
import { stubNoisyAPIs } from '../fixtures/api-stubs';

test.describe('journal flows', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors to debug
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[Browser Error] ${msg.text()}`);
      }
    });
    
    // Capture page errors
    page.on('pageerror', (error) => {
      console.log(`[Page Error] ${error.message}`);
    });
    
    await stubNoisyAPIs(page);
    await visitJournal(page);
  });

  test('@journal creates quick entry and shows it at the top of the list', async ({ page }) => {
    const entry = makeJournalTestEntry('Create flow');

    await page.getByTestId('journal-new-entry-button').click();
    await page.getByTestId('journal-new-entry-title').fill(entry.title);
    await page.getByTestId('journal-new-entry-notes').fill(entry.notes);
    await page.getByTestId('journal-save-entry-button').click();

    const newestEntry = page.getByTestId('journal-list-item').first();
    await expect(newestEntry).toContainText(entry.title);
    await expect(page.getByTestId('journal-detail-title')).toHaveText(entry.title);
    await expect(page.getByTestId('journal-notes-content')).toContainText(entry.notes);
  });

  test('@journal prevents saving when the title is empty', async ({ page }) => {
    await page.getByTestId('journal-new-entry-button').click();
    await page.getByTestId('journal-save-entry-button').click();
    await expect(page.getByTestId('journal-new-entry-error')).toContainText('title');
  });

  test('@journal editing notes persists the updated copy', async ({ page }) => {
    const newNotes = `Updated notes ${Date.now()}`;

    await page.getByTestId('journal-list-item').first().click();
    await page.getByTestId('journal-edit-notes-button').click();
    await page.getByTestId('journal-detail-notes-input').fill(newNotes);
    await page.getByTestId('journal-detail-save-notes').click();
    await expect(page.getByTestId('journal-notes-content')).toContainText(newNotes);
  });

  test('@journal direction filters narrow the list to short trades', async ({ page }) => {
    await page.getByTestId('journal-filter-short').click();

    const longRows = page.locator('[data-testid="journal-list-item"][data-direction="long"]');
    const shortRows = page.locator('[data-testid="journal-list-item"][data-direction="short"]');

    await expect(shortRows).not.toHaveCount(0);
    await expect(longRows).toHaveCount(0);
  });

  test('@journal respects entry query params on load', async ({ page }) => {
    await page.goto('/journal-v2?entry=2');
    await awaitStableUI(page);

    const preselected = page.locator('[data-testid="journal-list-item"][data-entry-id="2"]');
    await expect(preselected).toHaveAttribute('data-active', 'true');
    await expect(page).toHaveURL(/entry=2/);
  });
});
