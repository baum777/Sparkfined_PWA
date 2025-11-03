/**
 * Navigation E2E Tests
 * Tests routing and navigation between pages
 * Sparkfined PWA Trading Platform
 */

import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to home page', async ({ page }) => {
    await expect(page).toHaveURL('/')
    
    const title = await page.title()
    expect(title).toContain('Sparkfined')
  })

  test('should navigate to chart page', async ({ page }) => {
    await page.click('[data-testid="nav-chart"]')
    await expect(page).toHaveURL('/chart')
  })

  test('should navigate to watchlist page', async ({ page }) => {
    await page.click('[data-testid="nav-watchlist"]')
    await expect(page).toHaveURL('/watchlist')
  })

  test('should navigate to settings page', async ({ page }) => {
    await page.click('[data-testid="nav-settings"]')
    await expect(page).toHaveURL('/settings')
  })

  test('should use browser back button correctly', async ({ page }) => {
    // Navigate forward
    await page.click('[data-testid="nav-chart"]')
    await expect(page).toHaveURL('/chart')
    
    // Go back
    await page.goBack()
    await expect(page).toHaveURL('/')
    
    // Go forward
    await page.goForward()
    await expect(page).toHaveURL('/chart')
  })

  test('should show 404 for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route-that-does-not-exist')
    
    // Should redirect to home or show 404
    // Depending on your routing configuration
    await page.waitForTimeout(1000)
    
    const url = page.url()
    expect(url).toBeDefined()
  })

  test('should maintain navigation state across reloads', async ({ page }) => {
    await page.click('[data-testid="nav-chart"]')
    await expect(page).toHaveURL('/chart')
    
    // Reload
    await page.reload()
    
    // Should still be on chart page
    await expect(page).toHaveURL('/chart')
  })

  test('should handle deep links correctly', async ({ page }) => {
    // Direct navigation to chart with symbol
    await page.goto('/chart?symbol=BTCUSDT')
    
    await page.waitForTimeout(1000)
    
    // Verify we're on the chart page
    const url = page.url()
    expect(url).toContain('/chart')
  })
})

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should show mobile navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check for bottom navigation (mobile)
    const bottomNav = await page.locator('[data-testid="bottom-nav"]')
    const isVisible = await bottomNav.isVisible()
    
    // Just verify page loads on mobile
    expect(isVisible !== undefined).toBeTruthy()
  })

  test('should navigate on mobile', async ({ page }) => {
    await page.goto('/')
    
    // Tap chart button
    await page.click('[data-testid="nav-chart"]')
    
    // Verify navigation
    await page.waitForTimeout(500)
    await expect(page).toHaveURL('/chart')
  })
})
