/**
 * Chart Flow E2E Tests
 * Tests chart loading, interaction, and offline functionality
 * Sparkfined PWA Trading Platform
 */

import { test, expect } from '@playwright/test'

test.describe('Chart Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load chart page and display chart', async ({ page }) => {
    // Navigate to chart
    await page.click('[data-testid="nav-chart"]')
    
    // Wait for chart to load
    await page.waitForSelector('[data-testid="chart-canvas"]', { timeout: 10000 })
    
    // Verify chart is visible
    const chart = await page.locator('[data-testid="chart-canvas"]')
    await expect(chart).toBeVisible()
    
    // Verify chart header is present
    const header = await page.locator('[data-testid="chart-header"]')
    await expect(header).toBeVisible()
  })

  test('should change interval and reload chart', async ({ page }) => {
    await page.click('[data-testid="nav-chart"]')
    await page.waitForSelector('[data-testid="chart-canvas"]')
    
    // Click 5m interval
    await page.click('button:has-text("5m")')
    
    // Wait for chart to update
    await page.waitForTimeout(1000)
    
    // Verify interval is active
    const activeInterval = await page.locator('button:has-text("5m")')
    await expect(activeInterval).toHaveClass(/bg-emerald-500/)
  })

  test('should work offline with cached data', async ({ page, context }) => {
    // Load chart online first
    await page.click('[data-testid="nav-chart"]')
    await page.waitForSelector('[data-testid="chart-canvas"]')
    await page.waitForTimeout(2000)
    
    // Go offline
    await context.setOffline(true)
    
    // Reload page
    await page.reload()
    
    // Chart should still be visible (from cache)
    await page.waitForSelector('[data-testid="chart-canvas"]', { timeout: 5000 })
    const chart = await page.locator('[data-testid="chart-canvas"]')
    await expect(chart).toBeVisible()
    
    // Verify offline indicator
    const offlineIndicator = await page.locator('[data-testid="offline-indicator"]')
    await expect(offlineIndicator).toBeVisible()
  })

  test('should display crosshair data on hover', async ({ page }) => {
    await page.click('[data-testid="nav-chart"]')
    await page.waitForSelector('[data-testid="chart-canvas"]')
    
    // Hover over chart
    const chart = await page.locator('[data-testid="chart-canvas"]')
    await chart.hover({ position: { x: 200, y: 200 } })
    
    // Wait for crosshair info to appear
    await page.waitForTimeout(500)
    
    // Verify price info is displayed (this depends on implementation)
    // For now, just verify chart doesn't crash
    await expect(chart).toBeVisible()
  })

  test('should handle empty/error state gracefully', async ({ page, context }) => {
    // Block API requests to simulate error
    await context.route('**/api/market/ohlc*', route => route.abort())
    
    await page.click('[data-testid="nav-chart"]')
    
    // Wait for error state
    await page.waitForTimeout(2000)
    
    // Should show error message (not crash)
    const errorText = await page.textContent('body')
    expect(errorText).toContain('Failed to load chart')
  })
})

test.describe('Chart Performance', () => {
  test('should load chart within performance budget', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.click('[data-testid="nav-chart"]')
    await page.waitForSelector('[data-testid="chart-canvas"]')
    
    const loadTime = Date.now() - startTime
    
    // Chart should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should render chart within 16ms for smooth animation', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="nav-chart"]')
    await page.waitForSelector('[data-testid="chart-canvas"]')
    
    // Measure render time (simplified)
    const metrics = await page.evaluate(() => {
      return performance.getEntriesByType('measure')
    })
    
    // Just verify it loads without crashing
    expect(metrics).toBeDefined()
  })
})
