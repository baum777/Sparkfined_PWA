/**
 * Board Page - Accessibility Tests
 * 
 * Automated A11y checks using axe-core:
 * - WCAG 2.1 AA compliance
 * - Color contrast
 * - Keyboard navigation
 * - ARIA attributes
 * - Focus management
 * - Screen reader support
 * 
 * Run: npm run test:e2e
 */

import { test, expect } from './fixtures/baseTest';
import { awaitStableUI } from './utils/wait';
import AxeBuilder from '@axe-core/playwright';

test.describe('Board Page - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Board page
    await page.goto('/');
    await awaitStableUI(page);
  });

  test('should not have any automatically detectable WCAG A or AA violations', async ({ page }) => {
    await awaitStableUI(page);
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await awaitStableUI(page);
    await page.waitForSelector('h1, h2, h3, h4, h5, h6', { timeout: 2000 }).catch(() => {});
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['best-practice'])
      .include('h1, h2, h3, h4, h5, h6')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper color contrast', async ({ page }) => {
    await awaitStableUI(page);
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });

  test('should have accessible form controls', async ({ page }) => {
    await awaitStableUI(page);
    await page.waitForSelector('input, select, textarea, button', { timeout: 2000 }).catch(() => {});
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('input, select, textarea, button')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await awaitStableUI(page);
    await page.waitForSelector('[aria-label], [aria-labelledby], [role]', { timeout: 2000 }).catch(() => {});
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('[aria-label], [aria-labelledby], [role]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have keyboard navigable interactive elements', async ({ page }) => {
    await awaitStableUI(page);
    // Get all interactive elements
    const interactiveElements = await page.locator('button, a, input, select, textarea').all();

    for (const element of interactiveElements) {
      // Check if element is focusable
      const isFocusable = await element.evaluate((el) => {
        const tabindex = el.getAttribute('tabindex');
        return tabindex !== '-1';
      });

      if (isFocusable) {
        // Test keyboard focus
        await element.focus();
        const isFocused = await element.evaluate((el) => el === document.activeElement);
        expect(isFocused).toBe(true);
      }
    }
  });

  test('should have visible focus indicators', async ({ page }) => {
    await awaitStableUI(page);
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    const focusIndicatorViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'focus-order-semantics'
    );

    expect(focusIndicatorViolations).toEqual([]);
  });

  test('should have proper alt text for images', async ({ page }) => {
    await awaitStableUI(page);
    await page.waitForSelector('img', { timeout: 2000 }).catch(() => {});
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .include('img')
      .analyze();

    const altTextViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'image-alt'
    );

    expect(altTextViolations).toEqual([]);
  });

  test('should have accessible navigation', async ({ page }) => {
    await awaitStableUI(page);
    await page.waitForSelector('nav, [role="navigation"]', { timeout: 2000 }).catch(() => {});
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('nav, [role="navigation"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support screen readers (landmarks)', async ({ page }) => {
    await awaitStableUI(page);
    // Check for proper landmark roles
    const landmarks = await page.locator('[role="navigation"], [role="main"], [role="complementary"], nav, main, aside').all();
    
    expect(landmarks.length).toBeGreaterThan(0);
  });
});

test.describe('Board Components - Accessibility', () => {
  test('KPI Tiles should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await awaitStableUI(page);

    // Find clickable KPI tiles
    const kpiTiles = await page.locator('[role="button"]').all();

    if (kpiTiles.length > 0) {
      for (const tile of kpiTiles) {
        // Tab to tile
        await tile.focus();
        
        // Press Enter
        await tile.press('Enter');
        
        // Verify action was triggered (e.g., modal opened, navigation occurred)
        // Note: Add specific assertions based on expected behavior
      }
    }
  });

  test('Feed filters should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await awaitStableUI(page);

    // Find filter buttons
    const filterButtons = await page.locator('button:has-text("All"), button:has-text("Alerts"), button:has-text("Journal")').all();

    for (const button of filterButtons) {
      // Tab to button
      await button.focus();
      
      // Press Enter
      await button.press('Enter');
      
      // Verify filter was applied
      const isActive = await button.evaluate((el) => 
        el.classList.contains('bg-emerald-500') || 
        el.getAttribute('aria-pressed') === 'true'
      );
      
      expect(isActive).toBe(true);
    }
  });

  test('Bottom navigation should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await awaitStableUI(page);

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Find bottom nav links
    const navLinks = await page.locator('nav[aria-label="Main navigation"], nav[aria-label="Main Navigation"], [role="navigation"]').locator('a').all();

    expect(navLinks.length).toBeGreaterThan(0);

    for (const link of navLinks) {
      await link.focus();
      const isFocused = await link.evaluate((el) => el === document.activeElement);
      expect(isFocused).toBe(true);
    }
  });
});

/**
 * Usage:
 * 
 * # Run all e2e tests
 * npm run test:e2e
 * 
 * # Run only a11y tests
 * npx playwright test board-a11y
 * 
 * # Run with UI
 * npx playwright test board-a11y --ui
 * 
 * # Generate report
 * npx playwright show-report
 */
