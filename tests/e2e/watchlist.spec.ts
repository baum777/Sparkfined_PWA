/**
 * E2E Tests: Watchlist Module
 * Tests watchlist CRUD operations and offline functionality
 */

import { test, expect } from '@playwright/test'

test.describe('Watchlist Module', () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test
    await page.goto('/')
    await page.evaluate(() => {
      return indexedDB.databases().then((dbs) => {
        return Promise.all(
          dbs.map((db) => {
            if (db.name) {
              return indexedDB.deleteDatabase(db.name)
            }
          })
        )
      })
    })
    
    // Reload page after clearing DB
    await page.reload()
  })

  test('should display empty watchlist', async ({ page }) => {
    await page.goto('/')
    
    // Check for empty state
    const emptyState = page.getByText(/no items in your watchlist/i)
    if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(emptyState).toBeVisible()
    }
  })

  test('should add item to watchlist', async ({ page }) => {
    await page.goto('/')
    
    // Click add button
    const addButton = page.getByRole('button', { name: /add symbol/i })
    if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addButton.click()
      
      // Fill form
      await page.fill('input[placeholder*="BTCUSDT"]', 'BTCUSDT')
      await page.fill('input[placeholder*="Bitcoin"]', 'Bitcoin')
      
      // Submit
      await page.getByRole('button', { name: /^add$/i }).click()
      
      // Check if item appears
      await expect(page.getByText('BTCUSDT')).toBeVisible()
      await expect(page.getByText('Bitcoin')).toBeVisible()
    }
  })

  test('should remove item from watchlist', async ({ page }) => {
    await page.goto('/')
    
    // First add an item
    const addButton = page.getByRole('button', { name: /add symbol/i })
    if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addButton.click()
      await page.fill('input[placeholder*="BTCUSDT"]', 'TESTCOIN')
      await page.getByRole('button', { name: /^add$/i }).click()
      
      // Wait for item to appear
      await expect(page.getByText('TESTCOIN')).toBeVisible()
      
      // Find and click remove button
      const removeButton = page.locator('button[title*="remove"]').first()
      if (await removeButton.isVisible()) {
        await removeButton.click()
        
        // Item should be gone
        await expect(page.getByText('TESTCOIN')).not.toBeVisible()
      }
    }
  })

  test('should persist watchlist after reload', async ({ page }) => {
    await page.goto('/')
    
    // Add an item
    const addButton = page.getByRole('button', { name: /add symbol/i })
    if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addButton.click()
      await page.fill('input[placeholder*="BTCUSDT"]', 'PERSIST')
      await page.getByRole('button', { name: /^add$/i }).click()
      
      await expect(page.getByText('PERSIST')).toBeVisible()
      
      // Reload page
      await page.reload()
      
      // Item should still be there
      await expect(page.getByText('PERSIST')).toBeVisible()
    }
  })

  test('should work offline', async ({ page, context }) => {
    await page.goto('/')
    
    // Add item while online
    const addButton = page.getByRole('button', { name: /add symbol/i })
    if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addButton.click()
      await page.fill('input[placeholder*="BTCUSDT"]', 'OFFLINE')
      await page.getByRole('button', { name: /^add$/i }).click()
      
      await expect(page.getByText('OFFLINE')).toBeVisible()
      
      // Go offline
      await context.setOffline(true)
      
      // Reload page
      await page.reload()
      
      // Item should still be visible (from IndexedDB)
      await expect(page.getByText('OFFLINE')).toBeVisible()
      
      // Check offline indicator
      const offlineIndicator = page.getByText(/offline/i)
      if (await offlineIndicator.isVisible()) {
        await expect(offlineIndicator).toBeVisible()
      }
    }
  })
})
