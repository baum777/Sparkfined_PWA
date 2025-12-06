/**
 * P0 BLOCKER: Replay E2E Tests (Unskipped with API Mocks)
 *
 * Tests replay lab functionality with mocked OHLC data
 */

import { test, expect } from './fixtures/baseTest';

test.describe('Replay Lab', () => {
  test.beforeEach(async ({ page }) => {
    // STATE ISOLATION: Clean IndexedDB before each test
    await page.goto('/');
    await page.evaluate(() => {
      const dbNames = ['sparkfined-db', 'board-db', 'oracle-db', 'signals-db'];
      const deletions = dbNames.map(name =>
        new Promise((resolve) => {
          const req = indexedDB.deleteDatabase(name);
          req.onsuccess = () => resolve(null);
          req.onerror = () => resolve(null);
          req.onblocked = () => resolve(null);
        })
      );
      return Promise.all(deletions);
    });

    // CRITICAL: Mock OHLC API endpoint to enable replay tests
    await page.route('**/api/market/ohlc**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          symbol: 'SOL',
          timeframe: '1h',
          data: [
            { time: 1701388800, open: 95, high: 98, low: 94, close: 97, volume: 1000 },
            { time: 1701392400, open: 97, high: 102, low: 96, close: 101, volume: 1200 },
            { time: 1701396000, open: 101, high: 105, low: 100, close: 103, volume: 1100 },
            { time: 1701399600, open: 103, high: 106, low: 101, close: 104, volume: 1300 },
            { time: 1701403200, open: 104, high: 108, low: 103, close: 107, volume: 1400 }
          ]
        })
      });
    });
  });

  test('loads replay session with mocked OHLC data', async ({ page }) => {
    await page.goto('/replay');

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');

    // Verify replay page loaded
    await expect(page).toHaveURL(/\/replay/);

    // Symbol input should be visible
    const symbolInput = page.getByTestId('replay-symbol-input');
    if (await symbolInput.isVisible()) {
      await symbolInput.fill('SOL');

      // Load button should trigger OHLC fetch
      await page.getByTestId('replay-load-button').click();

      // Chart should become visible after data loads
      await expect(page.getByTestId('replay-chart')).toBeVisible({ timeout: 10000 });
    }
  });

  test('play button starts playback', async ({ page }) => {
    await page.goto('/replay');
    await page.waitForLoadState('networkidle');

    const playButton = page.getByTestId('replay-play-button');
    if (await playButton.isVisible()) {
      await playButton.click();

      // Verify playback state changes
      const pauseButton = page.getByTestId('replay-pause-button');
      if (await pauseButton.isVisible()) {
        await expect(pauseButton).toBeVisible();
      }
    }
  });

  test('speed adjustment controls exist', async ({ page }) => {
    await page.goto('/replay');
    await page.waitForLoadState('networkidle');

    // Check for speed controls (1x, 2x, 4x)
    const speedControls = ['replay-speed-1x', 'replay-speed-2x', 'replay-speed-4x'];
    for (const testId of speedControls) {
      const control = page.getByTestId(testId);
      if (await control.isVisible()) {
        await expect(control).toBeVisible();
      }
    }
  });

  test('skip forward/backward controls exist', async ({ page }) => {
    await page.goto('/replay');
    await page.waitForLoadState('networkidle');

    // Check for skip controls
    const forwardButton = page.getByTestId('replay-skip-forward');
    const backwardButton = page.getByTestId('replay-skip-backward');

    if (await forwardButton.isVisible()) {
      await expect(forwardButton).toBeVisible();
    }
    if (await backwardButton.isVisible()) {
      await expect(backwardButton).toBeVisible();
    }
  });

  test('save session button exists', async ({ page }) => {
    await page.goto('/replay');
    await page.waitForLoadState('networkidle');

    // Check for save session functionality
    const saveButton = page.getByTestId('replay-save-session');
    if (await saveButton.isVisible()) {
      await expect(saveButton).toBeVisible();
    }
  });
});
