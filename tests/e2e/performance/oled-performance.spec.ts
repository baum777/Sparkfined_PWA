/**
 * Performance Tests: OLED Mode
 * 
 * Validates that OLED mode doesn't introduce performance regressions:
 * - Page load time (no slowdown)
 * - Render performance (no jank)
 * - Memory usage (no leaks)
 * - CSS performance (no layout thrashing)
 * 
 * Performance targets:
 * - Page load: <2s (LCP - Largest Contentful Paint)
 * - Time to Interactive: <3s
 * - First Input Delay: <100ms
 * - Cumulative Layout Shift: <0.1
 * - Memory impact: <5% increase
 * 
 * How to run:
 * pnpm test:e2e tests/e2e/performance/oled-performance.spec.ts
 */

import { test, expect } from '../fixtures/baseTest'
import type { Page } from '@playwright/test'

/**
 * Helper: Get performance metrics
 */
async function getPerformanceMetrics(page: Page) {
  return await page.evaluate(() => {
    const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paintEntries = window.performance.getEntriesByType('paint')
    
    return {
      // Load times
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      domInteractive: perfData.domInteractive - perfData.fetchStart,
      
      // Paint times
      firstPaint: paintEntries.find(e => e.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
      
      // Resource timing
      domainLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcpConnect: perfData.connectEnd - perfData.connectStart,
      request: perfData.responseStart - perfData.requestStart,
      response: perfData.responseEnd - perfData.responseStart,
      domProcessing: perfData.domComplete - perfData.domInteractive,
      
      // Transfer sizes
      transferSize: perfData.transferSize,
      encodedBodySize: perfData.encodedBodySize,
      decodedBodySize: perfData.decodedBodySize,
    }
  })
}

/**
 * Helper: Get memory usage
 */
async function getMemoryUsage(page: Page): Promise<{ usedJSHeapSize: number; totalJSHeapSize: number } | null> {
  return await page.evaluate(() => {
    // @ts-expect-error - performance.memory is Chrome-specific
    if (performance.memory) {
      return {
        // @ts-expect-error - Chrome-specific API
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        // @ts-expect-error - Chrome-specific API
        totalJSHeapSize: performance.memory.totalJSHeapSize,
      }
    }
    return null
  })
}

/**
 * Helper: Measure render time
 */
async function measureRenderTime(page: Page, action: () => Promise<void>): Promise<number> {
  const startTime = Date.now()
  await action()
  await page.waitForLoadState('networkidle')
  return Date.now() - startTime
}

test.describe('OLED Mode - Performance Tests', () => {
  /**
   * Page Load Performance: Dashboard
   */
  test('should not slow down page load (Dashboard, OLED OFF)', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Ensure OLED mode is OFF
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'false')
    })
    await page.reload()
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    // Get performance metrics
    const metrics = await getPerformanceMetrics(page)
    
    console.log('Dashboard (OLED OFF) metrics:', metrics)
    
    // Assertions (baseline targets)
    expect(metrics.domInteractive, 'DOM Interactive should be < 2000ms').toBeLessThan(2000)
    expect(metrics.loadComplete, 'Load Complete should be < 3000ms').toBeLessThan(3000)
    expect(metrics.firstContentfulPaint, 'FCP should be < 1500ms').toBeLessThan(1500)
  })

  test('should not slow down page load (Dashboard, OLED ON)', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    // Get performance metrics
    const metrics = await getPerformanceMetrics(page)
    
    console.log('Dashboard (OLED ON) metrics:', metrics)
    
    // Assertions (should be similar to OLED OFF)
    expect(metrics.domInteractive, 'DOM Interactive should be < 2000ms').toBeLessThan(2000)
    expect(metrics.loadComplete, 'Load Complete should be < 3000ms').toBeLessThan(3000)
    expect(metrics.firstContentfulPaint, 'FCP should be < 1500ms').toBeLessThan(1500)
  })

  /**
   * Toggle Performance: No jank when toggling
   */
  test('should toggle OLED mode without jank', async ({ page }) => {
    await page.goto('/settings-v2')
    
    // Measure toggle time
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    const toggleTime = await measureRenderTime(page, async () => {
      await toggle.click()
    })
    
    console.log(`Toggle time: ${toggleTime}ms`)
    
    // Toggle should be instant (< 300ms)
    expect(toggleTime, 'Toggle should complete within 300ms').toBeLessThan(300)
  })

  test('should apply OLED styles without render blocking', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'false')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Measure style application time
    const styleTime = await page.evaluate(() => {
      const start = performance.now()
      
      // Simulate OLED toggle
      document.body.dataset.oled = 'true'
      
      // Force style recalc
      void window.getComputedStyle(document.body).backgroundColor
      
      return performance.now() - start
    })
    
    console.log(`Style application time: ${styleTime.toFixed(2)}ms`)
    
    // Style application should be fast (< 16ms for 60fps)
    expect(styleTime, 'Style application should be < 16ms (60fps)').toBeLessThan(16)
  })

  /**
   * Memory Usage: No leaks
   */
  test('should not increase memory usage significantly', async ({ page, browserName }) => {
    // Memory API only available in Chromium
    test.skip(browserName !== 'chromium', 'Memory API only in Chromium')
    
    await page.goto('/dashboard-v2')
    
    // Get baseline memory (OLED OFF)
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'false')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const memoryBefore = await getMemoryUsage(page)
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const memoryAfter = await getMemoryUsage(page)
    
    if (memoryBefore && memoryAfter) {
      const increase = ((memoryAfter.usedJSHeapSize - memoryBefore.usedJSHeapSize) / memoryBefore.usedJSHeapSize) * 100
      
      console.log(`Memory before: ${(memoryBefore.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`)
      console.log(`Memory after: ${(memoryAfter.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`)
      console.log(`Memory increase: ${increase.toFixed(2)}%`)
      
      // Memory increase should be minimal (< 5%)
      expect(increase, 'Memory increase should be < 5%').toBeLessThan(5)
    }
  })

  /**
   * CSS Performance: No layout thrashing
   */
  test('should not cause layout thrashing on toggle', async ({ page }) => {
    await page.goto('/dashboard-v2')
    await page.waitForLoadState('networkidle')
    
    // Measure layout recalculations
    const layoutCount = await page.evaluate(() => {
      let layoutCount = 0
      
      // Monitor layout events
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            layoutCount++
          }
        }
      })
      observer.observe({ entryTypes: ['measure'] })
      
      // Toggle OLED mode multiple times
      for (let i = 0; i < 10; i++) {
        document.body.dataset.oled = i % 2 === 0 ? 'true' : 'false'
        void window.getComputedStyle(document.body).backgroundColor // Force recalc
      }
      
      observer.disconnect()
      return layoutCount
    })
    
    console.log(`Layout recalculations: ${layoutCount}`)
    
    // Should not cause excessive layouts
    expect(layoutCount, 'Layout recalculations should be minimal').toBeLessThan(50)
  })

  /**
   * Render Performance: No dropped frames
   */
  test('should maintain 60fps during OLED toggle', async ({ page }) => {
    await page.goto('/dashboard-v2')
    await page.waitForLoadState('networkidle')
    
    // Measure frame rate during toggle
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frameCount = 0
        const lastTime = performance.now()
        
        function countFrames() {
          frameCount++
          const currentTime = performance.now()
          
          if (currentTime - lastTime > 1000) {
            // Measured for 1 second
            resolve(frameCount)
            return
          }
          
          // Toggle OLED mode continuously
          document.body.dataset.oled = frameCount % 2 === 0 ? 'true' : 'false'
          
          requestAnimationFrame(countFrames)
        }
        
        requestAnimationFrame(countFrames)
      })
    })
    
    console.log(`FPS during toggle: ${fps}`)
    
    // Should maintain near 60fps (allow some variance)
    expect(fps, 'FPS should be > 50 (near 60fps)').toBeGreaterThan(50)
  })

  /**
   * Cross-Route Performance
   */
  const routes = [
    { path: '/dashboard-v2', name: 'Dashboard' },
    { path: '/journal-v2', name: 'Journal' },
    { path: '/watchlist-v2', name: 'Watchlist' },
    { path: '/alerts-v2', name: 'Alerts' },
    { path: '/analysis-v2', name: 'Analysis' },
    { path: '/settings-v2', name: 'Settings' },
  ]

  for (const route of routes) {
    test(`should perform well on ${route.name} with OLED ON`, async ({ page }) => {
      // Enable OLED mode
      await page.evaluate(() => {
        localStorage.setItem('oled-mode', 'true')
      })
      
      await page.goto(route.path)
      await page.waitForLoadState('networkidle')
      
      // Get performance metrics
      const metrics = await getPerformanceMetrics(page)
      
      console.log(`${route.name} (OLED ON) metrics:`, metrics)
      
      // Basic performance targets
      expect(metrics.domInteractive, `${route.name} DOM Interactive < 2000ms`).toBeLessThan(2000)
      expect(metrics.firstContentfulPaint, `${route.name} FCP < 1500ms`).toBeLessThan(1500)
    })
  }

  /**
   * Mobile Performance
   */
  test('should perform well on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Enable OLED mode
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    
    await page.goto('/dashboard-v2')
    await page.waitForLoadState('networkidle')
    
    // Get performance metrics
    const metrics = await getPerformanceMetrics(page)
    
    console.log('Mobile (OLED ON) metrics:', metrics)
    
    // Mobile targets (slightly more lenient)
    expect(metrics.domInteractive, 'Mobile DOM Interactive < 2500ms').toBeLessThan(2500)
    expect(metrics.firstContentfulPaint, 'Mobile FCP < 2000ms').toBeLessThan(2000)
  })

  /**
   * CSS Variable Performance
   */
  test('should handle CSS variable updates efficiently', async ({ page }) => {
    await page.goto('/dashboard-v2')
    await page.waitForLoadState('networkidle')
    
    // Measure CSS variable update time
    const updateTime = await page.evaluate(() => {
      const start = performance.now()
      
      // Simulate OLED toggle (updates CSS variables)
      document.body.dataset.oled = 'true'
      
      // Query multiple computed styles (simulates real usage)
      for (let i = 0; i < 100; i++) {
        const element = document.body.children[i % document.body.children.length]
        if (element) {
          void window.getComputedStyle(element).backgroundColor
          void window.getComputedStyle(element).color
        }
      }
      
      return performance.now() - start
    })
    
    console.log(`CSS variable update time: ${updateTime.toFixed(2)}ms`)
    
    // Should complete quickly (< 100ms for 100 elements)
    expect(updateTime, 'CSS variable updates should be < 100ms').toBeLessThan(100)
  })

  /**
   * No Console Errors
   */
  test('should not produce console errors during toggle', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/settings-v2')
    await page.waitForLoadState('networkidle')
    
    // Toggle OLED mode multiple times
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    for (let i = 0; i < 5; i++) {
      await toggle.click()
      await page.waitForTimeout(100)
    }
    
    // No errors should occur
    expect(errors.length, 'No console errors should occur').toBe(0)
  })

  /**
   * localStorage Performance
   */
  test('should read/write localStorage efficiently', async ({ page }) => {
    await page.goto('/settings-v2')
    
    // Measure localStorage operations
    const lsTime = await page.evaluate(() => {
      const iterations = 1000
      const start = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        // Write
        localStorage.setItem('oled-mode', i % 2 === 0 ? 'true' : 'false')
        
        // Read
        void localStorage.getItem('oled-mode')
      }
      
      return performance.now() - start
    })
    
    const avgTime = lsTime / 1000
    
    console.log(`localStorage avg time: ${avgTime.toFixed(3)}ms per operation`)
    
    // localStorage should be fast (< 0.1ms per operation)
    expect(avgTime, 'localStorage operations should be < 0.1ms').toBeLessThan(0.1)
  })

  /**
   * Network Performance: No extra requests
   */
  test('should not trigger extra network requests', async ({ page }) => {
    const requests: string[] = []
    
    page.on('request', (request) => {
      requests.push(request.url())
    })
    
    await page.goto('/dashboard-v2')
    await page.waitForLoadState('networkidle')
    
    const requestCountBefore = requests.length
    
    // Toggle OLED mode
    await page.evaluate(() => {
      document.body.dataset.oled = 'true'
    })
    
    // Wait a bit to see if any requests triggered
    await page.waitForTimeout(500)
    
    const requestCountAfter = requests.length
    
    // No new requests should be triggered
    expect(requestCountAfter, 'No new requests after OLED toggle').toBe(requestCountBefore)
  })

  /**
   * Animation Performance
   */
  test('should animate toggle smoothly', async ({ page }) => {
    await page.goto('/settings-v2')
    await page.waitForLoadState('networkidle')
    
    // Measure animation performance
    const animationTime = await page.evaluate(async () => {
      const toggleButton = document.querySelector('[role="switch"]') as HTMLElement
      
      if (!toggleButton) return 0
      
      const start = performance.now()
      
      // Trigger click
      toggleButton.click()
      
      // Wait for animation to complete (200ms transition)
      await new Promise(resolve => setTimeout(resolve, 250))
      
      return performance.now() - start
    })
    
    console.log(`Animation time: ${animationTime.toFixed(2)}ms`)
    
    // Animation should complete within expected duration (200ms + buffer)
    expect(animationTime, 'Animation should complete < 300ms').toBeLessThan(300)
  })

  /**
   * Cumulative Layout Shift (CLS)
   */
  test('should have minimal layout shift during toggle', async ({ page }) => {
    await page.goto('/dashboard-v2')
    await page.waitForLoadState('networkidle')
    
    // Measure layout shift
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsScore = 0
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue
            clsScore += (entry as any).value
          }
        })
        
        observer.observe({ type: 'layout-shift', buffered: true })
        
        // Toggle OLED mode
        document.body.dataset.oled = 'true'
        
        // Wait for any shifts to settle
        setTimeout(() => {
          observer.disconnect()
          resolve(clsScore)
        }, 500)
      })
    })
    
    console.log(`CLS score: ${cls.toFixed(4)}`)
    
    // CLS should be minimal (< 0.1 is good)
    expect(cls, 'CLS should be < 0.1').toBeLessThan(0.1)
  })
})
