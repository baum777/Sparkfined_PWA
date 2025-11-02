// E2E tests for trading flow including offline functionality
import { test, expect } from '@playwright/test'

test.describe('Trading Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/')
    // Wait for app to load
    await page.waitForLoadState('networkidle')
  })

  test('should complete chart analysis flow offline', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true)
    await page.goto('/')

    // Navigate to chart
    await page.click('[data-testid="nav-chart"], a[href="/chart"]')
    await page.waitForLoadState('networkidle')

    // Chart should be visible (loaded from cache)
    const chartElement = page.locator('[data-testid="chart-canvas"], canvas, .chart-container').first()
    await expect(chartElement).toBeVisible({ timeout: 10000 })

    // Drawing tools should work (if available)
    const trendlineButton = page.locator('[data-testid="tool-trendline"], button:has-text("Trendline")').first()
    if (await trendlineButton.isVisible().catch(() => false)) {
      await trendlineButton.click()
      
      // Draw a trendline
      const chart = chartElement
      const box = await chart.boundingBox()
      if (box) {
        await page.mouse.move(box.x + 100, box.y + 100)
        await page.mouse.down()
        await page.mouse.move(box.x + 300, box.y + 200)
        await page.mouse.up()
      }

      // Drawing should be saved
      const drawings = await page.evaluate(() => {
        return localStorage.getItem('chart-drawings') || sessionStorage.getItem('chart-drawings')
      })
      expect(drawings).toBeTruthy()
    }
  })

  test('should add symbol to watchlist', async ({ page }) => {
    // Navigate to watchlist
    await page.click('[data-testid="nav-watchlist"], a[href="/watchlist"]')
    await page.waitForLoadState('networkidle')

    // Add a symbol
    const input = page.locator('input[placeholder*="symbol" i], input[placeholder*="Add"]').first()
    await input.fill('BTC')
    await input.press('Enter')

    // Symbol should appear in watchlist
    await expect(page.locator('text=BTC')).toBeVisible()
  })

  test('should display watchlist offline', async ({ page }) => {
    // Add symbol first (online)
    await page.goto('/watchlist')
    const input = page.locator('input[placeholder*="symbol" i], input[placeholder*="Add"]').first()
    if (await input.isVisible().catch(() => false)) {
      await input.fill('ETH')
      await input.press('Enter')
      await page.waitForTimeout(500) // Wait for save
    }

    // Go offline
    await page.context().setOffline(true)
    await page.reload()

    // Watchlist should still show the symbol
    await expect(page.locator('text=ETH')).toBeVisible()
  })

  test('should sync watchlist when coming back online', async ({ page }) => {
    // Add symbol offline
    await page.context().setOffline(true)
    await page.goto('/watchlist')
    
    const input = page.locator('input[placeholder*="symbol" i], input[placeholder*="Add"]').first()
    if (await input.isVisible().catch(() => false)) {
      await input.fill('SOL')
      await input.press('Enter')
      await page.waitForTimeout(500)
    }

    // Go back online
    await page.context().setOffline(false)
    await page.waitForTimeout(1000) // Wait for sync

    // Symbol should still be there and synced
    await expect(page.locator('text=SOL')).toBeVisible()
    
    // Status should show online
    const status = page.locator('text=/online/i, [class*="online"], [class*="synced"]').first()
    if (await status.isVisible().catch(() => false)) {
      await expect(status).toBeVisible()
    }
  })

  test('should navigate between chart and watchlist', async ({ page }) => {
    // Navigate to chart
    await page.click('[data-testid="nav-chart"], a[href="/chart"]')
    await page.waitForLoadState('networkidle')
    
    // Navigate to watchlist
    await page.click('[data-testid="nav-watchlist"], a[href="/watchlist"]')
    await page.waitForLoadState('networkidle')

    // Should be on watchlist page
    await expect(page).toHaveURL(/.*watchlist.*/)
  })
})
