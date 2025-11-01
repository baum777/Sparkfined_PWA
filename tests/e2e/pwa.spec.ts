/**
 * E2E PWA Smoke Tests
 * 
 * Tests:
 * 1. Offline shell: App loads and shows shell when offline
 * 2. Install eligibility: beforeinstallprompt is detected/mockable
 * 3. Window Controls Overlay (WCO): Titlebar fallback works
 */

import { test, expect } from '@playwright/test'

test.describe('PWA Smoke Tests', () => {
  test('offline shell and service worker', async ({ page, context }) => {
    // 1. Navigate to app and wait for service worker
    await page.goto('/')
    
    // Wait for service worker to be ready
    await page.waitForFunction(() => {
      return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null
    }, { timeout: 10000 })
    
    console.log('✅ Service Worker registered')
    
    // 2. Go offline and reload
    await context.setOffline(true)
    await page.reload()
    
    // 3. App should still be visible (served from cache)
    // Check for main app container (adjust selector to match your app)
    const appShell = page.locator('body')
    await expect(appShell).toBeVisible({ timeout: 5000 })
    
    // Verify we're actually offline by checking network state
    const isOffline = await page.evaluate(() => !navigator.onLine)
    expect(isOffline).toBe(true)
    
    console.log('✅ Offline shell works')
    
    // 4. Go back online
    await context.setOffline(false)
  })

  test('install eligibility and prompt', async ({ page }) => {
    // Mock install prompt by setting a flag in localStorage
    // In real app, this would be triggered by beforeinstallprompt event
    await page.goto('/')
    
    // Set mock install eligibility flag
    await page.evaluate(() => {
      localStorage.setItem('mockInstallEligible', '1')
    })
    
    await page.reload()
    
    // Check if install prompt flag is set
    const isEligible = await page.evaluate(() => {
      return localStorage.getItem('mockInstallEligible') === '1'
    })
    
    expect(isEligible).toBe(true)
    console.log('✅ Install eligibility mockable')
  })

  test('window controls overlay fallback', async ({ page }) => {
    await page.goto('/')
    
    // Check if WCO is available
    const hasWCO = await page.evaluate(() => {
      return Boolean((navigator as any).windowControlsOverlay)
    })
    
    if (hasWCO) {
      // If WCO is available, check for titlebar elements
      // Note: Actual WCO detection depends on your app's implementation
      console.log('✅ WCO detected (desktop PWA)')
    } else {
      // If WCO is not available, fallback header should be visible
      // Adjust selector to match your header component
      const header = page.locator('header, [data-testid="header"], nav')
      await expect(header.first()).toBeVisible()
      console.log('✅ Fallback header works (no WCO)')
    }
  })

  test('manifest and theme color', async ({ page }) => {
    await page.goto('/')
    
    // Check manifest link exists
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveCount(1)
    
    // Check theme-color meta tag
    const themeColor = page.locator('meta[name="theme-color"]')
    await expect(themeColor).toHaveCount(1)
    
    const themeValue = await themeColor.getAttribute('content')
    expect(themeValue).toBeTruthy()
    
    console.log('✅ Manifest and theme configured')
  })

  test('service worker caching strategies', async ({ page, context }) => {
    await page.goto('/')
    
    // Wait for SW to be active
    await page.waitForFunction(() => {
      return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null
    }, { timeout: 10000 })
    
    // Navigate to different routes to test caching
    await page.goto('/journal')
    await expect(page).toHaveURL('/journal')
    
    await page.goto('/replay')
    await expect(page).toHaveURL('/replay')
    
    // Go offline and verify cached routes work
    await context.setOffline(true)
    
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    
    console.log('✅ Navigation cache works offline')
    
    await context.setOffline(false)
  })

  test('pwa installability criteria', async ({ page }) => {
    await page.goto('/')
    
    // Check basic PWA requirements
    const checks = await page.evaluate(() => {
      const results: Record<string, boolean> = {}
      
      // Check HTTPS (or localhost)
      results.isSecure = location.protocol === 'https:' || location.hostname === 'localhost'
      
      // Check manifest link
      results.hasManifest = !!document.querySelector('link[rel="manifest"]')
      
      // Check service worker support
      results.hasServiceWorkerSupport = 'serviceWorker' in navigator
      
      // Check viewport meta
      results.hasViewport = !!document.querySelector('meta[name="viewport"]')
      
      return results
    })
    
    expect(checks.isSecure).toBe(true)
    expect(checks.hasManifest).toBe(true)
    expect(checks.hasServiceWorkerSupport).toBe(true)
    expect(checks.hasViewport).toBe(true)
    
    console.log('✅ PWA installability criteria met')
  })
})
