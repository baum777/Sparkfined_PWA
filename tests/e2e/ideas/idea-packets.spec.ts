import { expect, test } from '../fixtures/baseTest';

const NOTIFICATIONS_URL = '/notifications';
const STORAGE_KEY = 'sparkfined_idea_packets';
const MIGRATION_FLAG = 'sparkfined_idea_packets_migrated';
const DB_NAME = 'sparkfined-ideas';

test.describe('Idea packets @p0', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ({ storageKey, migrationFlag, dbName }: { storageKey: string; migrationFlag: string; dbName: string }) => {
        window.localStorage.removeItem(storageKey);
        window.localStorage.removeItem(migrationFlag);
        indexedDB.deleteDatabase(dbName);
      },
      { storageKey: STORAGE_KEY, migrationFlag: MIGRATION_FLAG, dbName: DB_NAME }
    );
  });

  test('user can create and persist an idea packet', async ({ page }) => {
    await page.goto(NOTIFICATIONS_URL);

    await page.getByTestId('idea-title-input').fill('Breakout on SOL');
    await page.getByTestId('idea-thesis-input').fill('Watching SOL/USDT for 4H breakout with rising volume.');
    await page.getByTestId('idea-timeframe-select').selectOption('swing');
    await page.getByTestId('idea-confidence-select').selectOption('high');
    await page.getByTestId('idea-save-button').click();

    const ideaList = page.getByTestId('idea-packet-list');
    await expect(ideaList).toBeVisible();
    await expect(ideaList.getByText('Breakout on SOL')).toBeVisible();

    await page.reload();

    await expect(page.getByTestId('idea-packet-list').getByText('Breakout on SOL')).toBeVisible();
    await expect(page.getByTestId('idea-packet-list').getByText('Confidence: high')).toBeVisible();
  });

  test('user can edit an existing idea packet', async ({ page }) => {
    await page.goto(NOTIFICATIONS_URL);

    await page.getByTestId('idea-title-input').fill('Range play');
    await page.getByTestId('idea-thesis-input').fill('Mean reversion setup on ETH.');
    await page.getByTestId('idea-save-button').click();

    await page.getByTestId('idea-edit-button').click();
    await page.getByTestId('idea-title-input').fill('Range play updated');
    await page.getByTestId('idea-confidence-select').selectOption('medium');
    await page.getByTestId('idea-save-button').click();

    const ideaList = page.getByTestId('idea-packet-list');
    await expect(ideaList.getByText('Range play updated')).toBeVisible();
    await expect(ideaList.getByText('Confidence: medium')).toBeVisible();
  });
});
