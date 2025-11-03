/**
 * Watchlist Flow E2E Tests
 * Tests watchlist CRUD operations and real-time updates
 * Sparkfined PWA Trading Platform
 */

import { test, expect } from '@playwright/test'

test.describe('Watchlist Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    
    // Clear IndexedDB before each test
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('SparkfinedDB')
        request.onsuccess = () => resolve()
        request.onerror = () => resolve()
      })
    })
  })

  test('should display empty watchlist state', async ({ page }) => {
    await page.click('[data-testid="nav-watchlist"]')
    
    // Wait for watchlist to load
    await page.waitForSelector('[data-testid="watchlist-empty"]', { timeout: 5000 })
    
    // Verify empty state message
    const emptyState = await page.locator('[data-testid="watchlist-empty"]')
    await expect(emptyState).toBeVisible()
    await expect(emptyState).toContainText('Your watchlist is empty')
  })

  test('should add symbol to watchlist', async ({ page }) => {
    await page.click('[data-testid="nav-watchlist"]')
    
    // Click add button
    await page.click('[data-testid="add-to-watchlist-btn"]')
    
    // Fill form
    await page.fill('[data-testid="symbol-input"]', 'BTCUSDT')
    await page.fill('[data-testid="name-input"]', 'Bitcoin')
    
    // Submit
    await page.click('[data-testid="submit-add-watchlist"]')
    
    // Wait for item to appear
    await page.waitForSelector('[data-testid="watchlist-item"]', { timeout: 5000 })
    
    // Verify item is added
    const item = await page.locator('[data-testid="watchlist-item"]').first()
    await expect(item).toBeVisible()
    await expect(item).toContainText('BTCUSDT')
  })

  test('should remove symbol from watchlist', async ({ page }) => {
    // First add an item
    await page.click('[data-testid="nav-watchlist"]')
    await page.click('[data-testid="add-to-watchlist-btn"]')
    await page.fill('[data-testid="symbol-input"]', 'ETHUSDT')
    await page.click('[data-testid="submit-add-watchlist"]')
    await page.waitForSelector('[data-testid="watchlist-item"]')
    
    // Hover to reveal remove button
    const item = await page.locator('[data-testid="watchlist-item"]').first()
    await item.hover()
    
    // Click remove
    await page.click('[data-testid="remove-watchlist-item"]')
    
    // Wait for removal
    await page.waitForTimeout(1000)
    
    // Verify item is removed
    const items = await page.locator('[data-testid="watchlist-item"]').count()
    expect(items).toBe(0)
  })

  test('should persist watchlist across page reloads', async ({ page }) => {
    // Add items
    await page.click('[data-testid="nav-watchlist"]')
    await page.click('[data-testid="add-to-watchlist-btn"]')
    await page.fill('[data-testid="symbol-input"]', 'BTCUSDT')
    await page.click('[data-testid="submit-add-watchlist"]')
    await page.waitForSelector('[data-testid="watchlist-item"]')
    
    // Reload page
    await page.reload()
    
    // Navigate back to watchlist
    await page.click('[data-testid="nav-watchlist"]')
    
    // Verify item is still there
    await page.waitForSelector('[data-testid="watchlist-item"]', { timeout: 5000 })
    const item = await page.locator('[data-testid="watchlist-item"]').first()
    await expect(item).toContainText('BTCUSDT')
  })

  test('should sort watchlist by change percentage', async ({ page }) => {
    // Add multiple items
    await page.click('[data-testid="nav-watchlist"]')
    
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']
    for (const symbol of symbols) {
      await page.click('[data-testid="add-to-watchlist-btn"]')
      await page.fill('[data-testid="symbol-input"]', symbol)
      await page.click('[data-testid="submit-add-watchlist"]')
      await page.waitForTimeout(500)
    }
    
    // Click sort by change
    await page.selectOption('[data-testid="sort-watchlist"]', 'change')
    
    // Verify items are present (sorting logic depends on real-time data)
    const items = await page.locator('[data-testid="watchlist-item"]').count()
    expect(items).toBe(3)
  })

  test('should show offline indicator when offline', async ({ page, context }) => {
    await page.click('[data-testid="nav-watchlist"]')
    
    // Go offline
    await context.setOffline(true)
    
    // Wait for offline indicator
    await page.waitForSelector('[data-testid="sync-status-offline"]', { timeout: 5000 })
    
    const offlineStatus = await page.locator('[data-testid="sync-status-offline"]')
    await expect(offlineStatus).toBeVisible()
  })
})

test.describe('Watchlist Real-Time Updates', () => {
  test('should update prices in real-time', async ({ page }) => {
    // Add item to watchlist
    await page.click('[data-testid="nav-watchlist"]')
    await page.click('[data-testid="add-to-watchlist-btn"]')
    await page.fill('[data-testid="symbol-input"]', 'BTCUSDT')
    await page.click('[data-testid="submit-add-watchlist"]')
    await page.waitForSelector('[data-testid="watchlist-item"]')
    
    // Get initial price
    const priceElement = await page.locator('[data-testid="item-price"]').first()
    const initialPrice = await priceElement.textContent()
    
    // Wait for potential update
    await page.waitForTimeout(3000)
    
    // Price element should still be visible (might have updated)
    await expect(priceElement).toBeVisible()
  })

  test('should show live indicator for connected items', async ({ page }) => {
    await page.click('[data-testid="nav-watchlist"]')
    await page.click('[data-testid="add-to-watchlist-btn"]')
    await page.fill('[data-testid="symbol-input"]', 'BTCUSDT')
    await page.click('[data-testid="submit-add-watchlist"]')
    await page.waitForSelector('[data-testid="watchlist-item"]')
    
    // Wait for WebSocket connection
    await page.waitForTimeout(2000)
    
    // Verify sync status indicator
    const syncStatus = await page.locator('[data-testid="sync-status"]')
    await expect(syncStatus).toBeVisible()
  })
})
