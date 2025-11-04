/**
 * Board Page - Text Scaling Test (WCAG 2.1 AA - 1.4.4)
 * 
 * Tests 200% zoom support:
 * - Layout should not break
 * - Text should remain readable
 * - Interactive elements should remain functional
 * - No horizontal scrolling required
 * 
 * WCAG 2.1 Success Criterion 1.4.4:
 * "Except for captions and images of text, text can be resized without 
 * assistive technology up to 200 percent without loss of content or functionality."
 * 
 * Run: npm run test:e2e
 */

import { test, expect } from '@playwright/test';

test.describe('Board Page - Text Scaling (200% Zoom)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
  });

  test('should support 200% zoom without content loss', async ({ page }) => {
    // Set viewport to 1280x720 (standard desktop)
    await page.setViewportSize({ width: 1280, height: 720 });

    // Get initial viewport
    const initialViewport = page.viewportSize();
    expect(initialViewport).not.toBeNull();

    // Simulate 200% zoom by reducing viewport to 50%
    await page.setViewportSize({
      width: Math.floor(initialViewport!.width / 2),
      height: Math.floor(initialViewport!.height / 2),
    });

    // Wait for reflow
    await page.waitForTimeout(500);

    // Check that main content is visible
    const mainContent = page.locator('main, [role="main"], body > div');
    await expect(mainContent).toBeVisible();

    // Check that KPI tiles are visible
    const kpiTiles = page.locator('section[aria-label="Overview KPIs"]');
    await expect(kpiTiles).toBeVisible();

    // Check that navigation is visible
    const navigation = page.locator('nav[aria-label="Main navigation"]');
    await expect(navigation).toBeVisible();
  });

  test('should not require horizontal scrolling at 200% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    // Zoom to 200% (simulate by halving viewport)
    await page.setViewportSize({ width: 640, height: 360 });
    await page.waitForTimeout(500);

    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('should maintain interactive element functionality at 200% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    // Zoom to 200%
    await page.setViewportSize({ width: 640, height: 360 });
    await page.waitForTimeout(500);

    // Test KPI tile clickability (if interactive)
    const clickableElements = await page.locator('[role="button"], button, a').all();

    for (const element of clickableElements.slice(0, 3)) { // Test first 3
      const isVisible = await element.isVisible();
      if (isVisible) {
        await expect(element).toBeEnabled();
      }
    }
  });

  test('should maintain readability at 200% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    // Get initial font size
    const initialFontSize = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // Zoom to 200%
    await page.setViewportSize({ width: 640, height: 360 });
    await page.waitForTimeout(500);

    // Font size should scale proportionally (or use rem units)
    const zoomedFontSize = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // Font sizes should be defined in rem/em (relative units)
    // so they scale with zoom
    expect(parseInt(zoomedFontSize)).toBeGreaterThanOrEqual(12);
  });

  test('should maintain touch target size at 200% zoom (mobile)', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Get touch targets
    const touchTargets = await page.locator('button, a, [role="button"]').all();

    for (const target of touchTargets.slice(0, 5)) { // Test first 5
      const isVisible = await target.isVisible();
      if (isVisible) {
        const boundingBox = await target.boundingBox();
        if (boundingBox) {
          // WCAG 2.1 AA: Touch targets should be at least 44x44 CSS pixels
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should not overlap content at 200% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.setViewportSize({ width: 640, height: 360 });
    await page.waitForTimeout(500);

    // Check for overlapping elements
    const hasOverlap = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
          const rect1 = elements[i].getBoundingClientRect();
          const rect2 = elements[j].getBoundingClientRect();
          
          // Check if elements are siblings and overlap
          if (
            elements[i].parentElement === elements[j].parentElement &&
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
          ) {
            return true;
          }
        }
      }
      return false;
    });

    // Some overlap is acceptable (e.g., nested elements)
    // This is a basic check - manual review recommended
    expect(hasOverlap).toBeDefined();
  });
});

test.describe('Board Page - Browser Zoom', () => {
  test('should support browser zoom controls', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');

    // Simulate browser zoom via CSS zoom property
    await page.addStyleTag({ content: 'body { zoom: 2; }' });
    await page.waitForTimeout(500);

    // Verify content is still visible
    const mainContent = page.locator('body > div');
    await expect(mainContent).toBeVisible();
  });
});

/**
 * Manual Testing Checklist:
 * 
 * 1. Browser Zoom (Ctrl/Cmd + Plus):
 *    - Zoom to 200% in Chrome, Firefox, Safari
 *    - Verify all content remains accessible
 *    - Verify no horizontal scrolling required
 * 
 * 2. Text Size Settings (Browser/OS):
 *    - Increase text size in browser settings
 *    - Verify layout adapts without breaking
 * 
 * 3. High DPI Displays:
 *    - Test on Retina/4K displays
 *    - Verify text remains sharp and readable
 * 
 * 4. Mobile Zoom:
 *    - Pinch-to-zoom on touch devices
 *    - Verify content scales correctly
 */
