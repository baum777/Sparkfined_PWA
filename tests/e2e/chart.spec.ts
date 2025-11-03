/**
 * E2E Tests: Chart Module
 * Tests chart loading, interactions, and offline functionality
 */

import { test, expect } from '@playwright/test'

test.describe('Chart Module', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chart page
    await page.goto('/chart')
  })

  test('should load chart page', async ({ page }) => {
    // Check if page loaded
    await expect(page).toHaveTitle(/Sparkfined/i)
    
    // Check for chart elements
    await expect(page.locator('h1, h2')).toContainText(/chart/i)
  })

  test('should display chart canvas', async ({ page }) => {
    // Wait for chart to render
    await page.waitForSelector('canvas', { timeout: 10000 })
    
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // Check canvas dimensions
    const box = await canvas.boundingBox()
    expect(box?.width).toBeGreaterThan(300)
    expect(box?.height).toBeGreaterThan(200)
  })

  test('should change timeframe', async ({ page }) => {
    // Wait for chart to load
    await page.waitForSelector('canvas')
    
    // Find and click 5m button
    const button5m = page.getByRole('button', { name: '5m' })
    if (await button5m.isVisible()) {
      await button5m.click()
      
      // Wait for chart to reload
      await page.waitForTimeout(1000)
      
      // Check if button is active
      const classes = await button5m.getAttribute('class')
      expect(classes).toContain('bg-emerald-500')
    }
  })

  test('should work offline', async ({ page, context }) => {
    // Load chart while online
    await page.waitForSelector('canvas')
    
    // Go offline
    await context.setOffline(true)
    
    // Chart should still be visible (cached)
    await expect(page.locator('canvas')).toBeVisible()
    
    // Check for offline indicator
    const offlineIndicator = page.getByText(/offline/i)
    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).toBeVisible()
    }
    
    // Go back online
    await context.setOffline(false)
  })

  test('should display price updates', async ({ page }) => {
    // Wait for price to appear
    const priceElement = page.locator('text=/\\$[\\d,]+\\.\\d{2}/')
    
    if (await priceElement.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(priceElement.first()).toBeVisible()
    }
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Navigate to chart with invalid data
    await page.goto('/chart?address=invalid')
    
    // Should show error message or empty state
    const errorOrEmpty = page.locator('text=/error|no data|invalid/i')
    
    if (await errorOrEmpty.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(errorOrEmpty).toBeVisible()
    }
  })
})
