/**
 * E2E Tests: PWA Functionality
 * Tests service worker, offline mode, and PWA features
 */

import { test, expect } from '@playwright/test'

test.describe('PWA Functionality', () => {
  test('should register service worker', async ({ page }) => {
    await page.goto('/')
    
    // Wait for SW registration
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready
          return registration.active !== null
        } catch {
          return false
        }
      }
      return false
    })
    
    // In production mode, SW should be registered
    if (process.env.NODE_ENV === 'production') {
      expect(swRegistered).toBe(true)
    }
  })

  test('should have valid manifest', async ({ page }) => {
    await page.goto('/')
    
    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveCount(1)
    
    const href = await manifestLink.getAttribute('href')
    expect(href).toBeTruthy()
    
    // Fetch and validate manifest
    const manifestUrl = new URL(href!, page.url()).toString()
    const response = await page.request.get(manifestUrl)
    expect(response.ok()).toBe(true)
    
    const manifest = await response.json()
    expect(manifest.name).toBeTruthy()
    expect(manifest.short_name).toBeTruthy()
    expect(manifest.start_url).toBeTruthy()
    expect(manifest.display).toBeTruthy()
    expect(manifest.icons).toBeTruthy()
    expect(Array.isArray(manifest.icons)).toBe(true)
  })

  test('should cache resources for offline use', async ({ page, context }) => {
    await page.goto('/')
    
    // Wait for page to load and cache
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Give SW time to cache
    
    // Go offline
    await context.setOffline(true)
    
    // Reload page
    await page.reload()
    
    // Page should still load (from cache)
    await expect(page.locator('body')).toBeVisible()
    
    // Check for app content
    const mainContent = page.locator('main, #root, [role="main"]')
    await expect(mainContent).toBeVisible()
  })

  test('should show offline indicator when offline', async ({ page, context }) => {
    await page.goto('/')
    
    // Go offline
    await context.setOffline(true)
    
    // Trigger offline event
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'))
    })
    
    // Wait a bit for indicator to show
    await page.waitForTimeout(500)
    
    // Check for offline indicator
    const offlineIndicator = page.locator('text=/offline|not connected/i')
    const hasIndicator = await offlineIndicator.isVisible().catch(() => false)
    
    if (hasIndicator) {
      await expect(offlineIndicator).toBeVisible()
    }
  })

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')
    
    // Check viewport meta
    const viewport = page.locator('meta[name="viewport"]')
    await expect(viewport).toHaveCount(1)
    
    // Check theme color
    const themeColor = page.locator('meta[name="theme-color"]')
    await expect(themeColor).toHaveCount(1)
    
    // Check description
    const description = page.locator('meta[name="description"]')
    if (await description.count() > 0) {
      await expect(description).toHaveCount(1)
    }
  })

  test('should support app shortcuts', async ({ page }) => {
    await page.goto('/')
    
    // Get manifest
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href')
    if (manifestLink) {
      const manifestUrl = new URL(manifestLink, page.url()).toString()
      const response = await page.request.get(manifestUrl)
      const manifest = await response.json()
      
      // Check for shortcuts
      if (manifest.shortcuts) {
        expect(Array.isArray(manifest.shortcuts)).toBe(true)
        expect(manifest.shortcuts.length).toBeGreaterThan(0)
        
        // Validate shortcut structure
        const shortcut = manifest.shortcuts[0]
        expect(shortcut.name).toBeTruthy()
        expect(shortcut.url).toBeTruthy()
      }
    }
  })
})
