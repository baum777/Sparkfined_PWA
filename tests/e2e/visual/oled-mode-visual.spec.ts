/**
 * Visual Regression Tests: OLED Mode
 * 
 * Tests visual appearance of OLED mode across different pages.
 * Compares screenshots of OLED ON vs OFF states to detect:
 * - Background color changes (pure black vs near-black)
 * - Surface color changes
 * - Text readability
 * - No unintended visual side effects
 * 
 * How to use:
 * 1. First run: Generate baseline screenshots
 *    pnpm test:e2e tests/e2e/visual/oled-mode-visual.spec.ts --update-snapshots
 * 
 * 2. Subsequent runs: Compare against baseline
 *    pnpm test:e2e tests/e2e/visual/oled-mode-visual.spec.ts
 * 
 * 3. Review failures:
 *    npx playwright show-report
 */

import { test, expect } from '../fixtures/baseTest'

test.describe('OLED Mode - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    })
  })

  /**
   * Settings Page: OLED Toggle
   */
  test('Settings - OLED Mode OFF (baseline)', async ({ page }) => {
    await page.goto('/settings-v2')
    
    // Ensure OLED mode is OFF
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'false')
    })
    await page.reload()
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture full page screenshot
    await expect(page).toHaveScreenshot('settings-oled-off.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('Settings - OLED Mode ON', async ({ page }) => {
    await page.goto('/settings-v2')
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Wait for background to turn pure black
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'
    })
    
    // Capture full page screenshot
    await expect(page).toHaveScreenshot('settings-oled-on.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('Settings - OLED Toggle Component (zoomed)', async ({ page }) => {
    await page.goto('/settings-v2')
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for toggle to be visible
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    await expect(toggle).toBeVisible()
    
    // Scroll toggle into view
    await toggle.scrollIntoViewIfNeeded()
    
    // Capture just the toggle component
    const toggleContainer = toggle.locator('..')
    await expect(toggleContainer).toHaveScreenshot('oled-toggle-component-on.png', {
      animations: 'disabled',
    })
  })

  /**
   * Dashboard: Full Page Comparison
   */
  test('Dashboard - OLED Mode OFF', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Ensure OLED mode is OFF
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'false')
    })
    await page.reload()
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('dashboard-oled-off.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('Dashboard - OLED Mode ON', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for background to turn pure black
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'
    })
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('dashboard-oled-on.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  /**
   * Journal: Card Components
   */
  test('Journal - OLED Mode OFF', async ({ page }) => {
    await page.goto('/journal-v2')
    
    // Ensure OLED mode is OFF
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'false')
    })
    await page.reload()
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('journal-oled-off.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100, // Allow minor differences (dynamic content)
    })
  })

  test('Journal - OLED Mode ON', async ({ page }) => {
    await page.goto('/journal-v2')
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for background to turn pure black
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'
    })
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('journal-oled-on.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    })
  })

  /**
   * Watchlist: List Components
   */
  test('Watchlist - OLED Mode OFF', async ({ page }) => {
    await page.goto('/watchlist-v2')
    
    // Ensure OLED mode is OFF
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'false')
    })
    await page.reload()
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('watchlist-oled-off.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    })
  })

  test('Watchlist - OLED Mode ON', async ({ page }) => {
    await page.goto('/watchlist-v2')
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for background to turn pure black
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'
    })
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('watchlist-oled-on.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    })
  })

  /**
   * Alerts: Modal & Notifications
   */
  test('Alerts - OLED Mode OFF', async ({ page }) => {
    await page.goto('/alerts-v2')
    
    // Ensure OLED mode is OFF
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'false')
    })
    await page.reload()
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('alerts-oled-off.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    })
  })

  test('Alerts - OLED Mode ON', async ({ page }) => {
    await page.goto('/alerts-v2')
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for background to turn pure black
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'
    })
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('alerts-oled-on.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    })
  })

  /**
   * Analysis: Complex UI
   */
  test('Analysis - OLED Mode OFF', async ({ page }) => {
    await page.goto('/analysis-v2')
    
    // Ensure OLED mode is OFF
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'false')
    })
    await page.reload()
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('analysis-oled-off.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    })
  })

  test('Analysis - OLED Mode ON', async ({ page }) => {
    await page.goto('/analysis-v2')
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for background to turn pure black
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'
    })
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('analysis-oled-on.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    })
  })

  /**
   * Chart Page (if exists)
   */
  test('Chart - OLED Mode OFF', async ({ page }) => {
    // Try to navigate to chart page
    const response = await page.goto('/chart-v2')
    
    // Skip if page doesn't exist
    if (response?.status() === 404) {
      test.skip()
      return
    }
    
    // Ensure OLED mode is OFF
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'false')
    })
    await page.reload()
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Wait for chart to load (if present)
    await page.waitForTimeout(1000) // Allow chart to render
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('chart-oled-off.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 200, // Charts may have dynamic elements
    })
  })

  test('Chart - OLED Mode ON', async ({ page }) => {
    // Try to navigate to chart page
    const response = await page.goto('/chart-v2')
    
    // Skip if page doesn't exist
    if (response?.status() === 404) {
      test.skip()
      return
    }
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for background to turn pure black
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'
    })
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Wait for chart to load
    await page.waitForTimeout(1000)
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('chart-oled-on.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 200,
    })
  })

  /**
   * Mobile Viewport Tests
   */
  test('Mobile - Settings OLED ON', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/settings-v2')
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('mobile-settings-oled-on.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('Mobile - Dashboard OLED ON', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/dashboard-v2')
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for background to turn pure black
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'
    })
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('mobile-dashboard-oled-on.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    })
  })

  /**
   * Tablet Viewport Tests
   */
  test('Tablet - Dashboard OLED ON', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    
    await page.goto('/dashboard-v2')
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for background to turn pure black
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'
    })
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Capture screenshot
    await expect(page).toHaveScreenshot('tablet-dashboard-oled-on.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    })
  })

  /**
   * Component-Level Tests (specific UI elements)
   */
  test('Component - Card with OLED ON', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    
    // Find first card component (adjust selector as needed)
    const card = page.locator('.card').first()
    
    if (await card.count() > 0) {
      await card.scrollIntoViewIfNeeded()
      
      // Capture just the card
      await expect(card).toHaveScreenshot('component-card-oled-on.png', {
        animations: 'disabled',
      })
    } else {
      test.skip()
    }
  })

  /**
   * Dark Theme vs OLED Mode Comparison
   */
  test('Comparison - Dark Theme vs OLED Mode', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // First: Dark theme without OLED
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'false')
      localStorage.setItem('theme', 'dark')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Capture Dark Theme
    await expect(page).toHaveScreenshot('theme-dark-only.png', {
      fullPage: true,
      animations: 'disabled',
    })
    
    // Second: Dark theme WITH OLED
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'
    })
    await page.waitForLoadState('networkidle')
    
    // Capture Dark + OLED
    await expect(page).toHaveScreenshot('theme-dark-oled.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})
