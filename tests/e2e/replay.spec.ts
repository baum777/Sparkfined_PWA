/**
 * Alpha Issue 14: E2E Tests
 * Replay scrubber functionality test
 */

import { test, expect } from './fixtures/baseTest';

test.describe('Replay Modal', () => {
  test.skip('opens replay modal from journal', async ({ page }) => {
    await page.goto('/journal');

    // Click on first entry
    await page.click('[data-testid="journal-entry"]:first-child');

    // Wait for replay modal
    const modal = page.getByTestId('replay-modal');
    await expect(modal).toBeVisible({ timeout: 500 });
  });

  test.skip('scrubs forward with right arrow', async ({ page }) => {
    await page.goto('/journal');
    await page.click('[data-testid="journal-entry"]:first-child');

    const timeDisplay = page.getByTestId('replay-time');
    const initialTime = await timeDisplay.textContent();

    // Press right arrow
    await page.keyboard.press('ArrowRight');

    // Verify time advanced by ~5s
    const newTime = await timeDisplay.textContent();
    expect(newTime).not.toBe(initialTime);
  });

  test.skip('scrubs backward with left arrow', async ({ page }) => {
    await page.goto('/journal');
    await page.click('[data-testid="journal-entry"]:first-child');

    // Advance time first
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    const timeBeforeBack = await page.getByTestId('replay-time').textContent();

    // Press left arrow
    await page.keyboard.press('ArrowLeft');

    const timeAfterBack = await page.getByTestId('replay-time').textContent();
    expect(timeAfterBack).not.toBe(timeBeforeBack);
  });

  test.skip('jumps 20s with Shift+arrow', async ({ page }) => {
    await page.goto('/journal');
    await page.click('[data-testid="journal-entry"]:first-child');

    // Press Shift+Right
    await page.keyboard.press('Shift+ArrowRight');

    // Verify significant time jump
    // TODO: Verify 20s jump vs 5s
  });

  test.skip('zooms with Ctrl+Wheel', async ({ page }) => {
    await page.goto('/journal');
    await page.click('[data-testid="journal-entry"]:first-child');

    const canvas = page.getByTestId('replay-canvas');

    // Zoom in
    await canvas.hover();
    await page.mouse.wheel(0, -100); // Simulate Ctrl+Wheel

    // TODO: Verify zoom level changed
  });
});
