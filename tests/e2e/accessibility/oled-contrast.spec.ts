/**
 * Accessibility Tests: OLED Mode Color Contrast
 * 
 * Validates that OLED mode maintains WCAG AA/AAA contrast ratios:
 * - Text vs Background: 7:1 (AAA) or 4.5:1 (AA)
 * - Large Text: 3:1 minimum
 * - Interactive elements: Clear focus indicators
 * 
 * References:
 * - WCAG 2.1: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 * - Design tokens: /workspace/src/styles/tokens.css
 */

import { test, expect } from '../fixtures/baseTest'
import type { Page } from '@playwright/test'

/**
 * Helper: Calculate contrast ratio between two RGB colors
 * Formula: https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const normalized = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  const [rs = 0, gs = 0, bs = 0] = normalized
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastRatio(rgb1: string, rgb2: string): number {
  const parseRgb = (rgb: string): [number, number, number] => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!match) return [0, 0, 0]
    return [
      parseInt(match[1] || '0', 10),
      parseInt(match[2] || '0', 10),
      parseInt(match[3] || '0', 10)
    ]
  }

  const [r1, g1, b1] = parseRgb(rgb1)
  const [r2, g2, b2] = parseRgb(rgb2)

  const l1 = getRelativeLuminance(r1, g1, b1)
  const l2 = getRelativeLuminance(r2, g2, b2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Helper: Get computed colors for text and background
 */
async function getTextContrast(page: Page, selector: string): Promise<{
  textColor: string
  bgColor: string
  contrastRatio: number
}> {
  const element = page.locator(selector).first()
  
  const colors = await element.evaluate((el) => {
    const style = window.getComputedStyle(el)
    return {
      textColor: style.color,
      backgroundColor: style.backgroundColor,
    }
  })

  // If background is transparent, check parent background
  let bgColor = colors.backgroundColor
  if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
    bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
  }

  const contrastRatio = getContrastRatio(colors.textColor, bgColor)

  return {
    textColor: colors.textColor,
    bgColor,
    contrastRatio,
  }
}

test.describe('OLED Mode - Color Contrast (WCAG)', () => {
  test.beforeEach(async ({ page }) => {
    // Enable OLED mode for all tests
    await page.goto('/dashboard-v2')
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    // Wait for OLED mode to apply
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'
    })
  })

  /**
   * Background Color Tests
   */
  test('should have pure black background', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    
    expect(bgColor).toBe('rgb(0, 0, 0)')
  })

  test('should have near-black surface colors', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Find card/surface elements
    const cards = page.locator('.card, [class*="card-"], [class*="surface"]')
    
    if (await cards.count() > 0) {
      const firstCard = cards.first()
      
      const bgColor = await firstCard.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor
      })
      
      // Should be near-black (not pure black, for visual hierarchy)
      // Expected: rgb(8, 8, 8) or similar
      const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      const r = match ? parseInt(match[1] || '0', 10) : 0
      const g = match ? parseInt(match[2] || '0', 10) : 0
      const b = match ? parseInt(match[3] || '0', 10) : 0
      
      // Near-black means 0-20 for each channel
      expect(r).toBeLessThanOrEqual(20)
      expect(g).toBeLessThanOrEqual(20)
      expect(b).toBeLessThanOrEqual(20)
      
      // But not pure black (should have slight lift)
      expect(r + g + b).toBeGreaterThan(0)
    }
  })

  /**
   * Primary Text Contrast (AAA: 7:1)
   */
  test('should meet AAA contrast for primary text', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Find primary text elements (headings, main content)
    const headings = page.locator('h1, h2, h3, [class*="text-primary"]')
    
    if (await headings.count() > 0) {
      const { contrastRatio, textColor, bgColor } = await getTextContrast(page, 'h1, h2, h3, [class*="text-primary"]')
      
      console.log(`Primary text: ${textColor} on ${bgColor} = ${contrastRatio.toFixed(2)}:1`)
      
      // WCAG AAA: 7:1
      expect(contrastRatio).toBeGreaterThanOrEqual(7)
    }
  })

  /**
   * Secondary Text Contrast (AA: 4.5:1)
   */
  test('should meet AA contrast for secondary text', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Find secondary text elements
    const secondaryText = page.locator('[class*="text-secondary"], p, span')
    
    if (await secondaryText.count() > 0) {
      const { contrastRatio, textColor, bgColor } = await getTextContrast(page, '[class*="text-secondary"], p')
      
      console.log(`Secondary text: ${textColor} on ${bgColor} = ${contrastRatio.toFixed(2)}:1`)
      
      // WCAG AA: 4.5:1
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5)
    }
  })

  /**
   * Tertiary Text Contrast (AA: 4.5:1)
   */
  test('should meet AA contrast for tertiary text', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Find tertiary text elements (captions, helper text)
    const tertiaryText = page.locator('[class*="text-tertiary"], [class*="text-muted"]')
    
    if (await tertiaryText.count() > 0) {
      const { contrastRatio, textColor, bgColor } = await getTextContrast(page, '[class*="text-tertiary"]')
      
      console.log(`Tertiary text: ${textColor} on ${bgColor} = ${contrastRatio.toFixed(2)}:1`)
      
      // WCAG AA: 4.5:1 (even for tertiary)
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5)
    }
  })

  /**
   * Brand Color Contrast (Large text: 3:1)
   */
  test('should meet contrast for brand color elements', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Find brand-colored elements
    const brandElements = page.locator('[class*="text-brand"], [class*="bg-brand"]')
    
    if (await brandElements.count() > 0) {
      const { contrastRatio, textColor, bgColor } = await getTextContrast(page, '[class*="text-brand"]')
      
      console.log(`Brand text: ${textColor} on ${bgColor} = ${contrastRatio.toFixed(2)}:1`)
      
      // Brand color should be visible (at least 3:1 for large text)
      expect(contrastRatio).toBeGreaterThanOrEqual(3)
    }
  })

  /**
   * Button Text Contrast
   */
  test('should meet contrast for button text', async ({ page }) => {
    await page.goto('/settings-v2')
    
    // Find buttons
    const buttons = page.locator('button:not([disabled])')
    
    if (await buttons.count() > 0) {
      const { contrastRatio, textColor, bgColor } = await getTextContrast(page, 'button:not([disabled])')
      
      console.log(`Button text: ${textColor} on ${bgColor} = ${contrastRatio.toFixed(2)}:1`)
      
      // Buttons should have strong contrast (AA: 4.5:1)
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5)
    }
  })

  /**
   * Link Contrast
   */
  test('should meet contrast for links', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Find links
    const links = page.locator('a:not([disabled])')
    
    if (await links.count() > 0) {
      const { contrastRatio, textColor, bgColor } = await getTextContrast(page, 'a:not([disabled])')
      
      console.log(`Link text: ${textColor} on ${bgColor} = ${contrastRatio.toFixed(2)}:1`)
      
      // Links should be visible (AA: 4.5:1)
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5)
    }
  })

  /**
   * Badge/Pill Contrast
   */
  test('should meet contrast for badges', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Find badges/pills
    const badges = page.locator('[class*="badge"], [class*="pill"]')
    
    if (await badges.count() > 0) {
      const { contrastRatio, textColor, bgColor } = await getTextContrast(page, '[class*="badge"], [class*="pill"]')
      
      console.log(`Badge text: ${textColor} on ${bgColor} = ${contrastRatio.toFixed(2)}:1`)
      
      // Badges should be readable (AA: 4.5:1)
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5)
    }
  })

  /**
   * Cross-Route Contrast Tests
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
    test(`should meet contrast standards on ${route.name}`, async ({ page }) => {
      await page.goto(route.path)
      
      // Wait for page to stabilize
      await page.waitForLoadState('networkidle')
      
      // Check background is pure black
      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor
      })
      expect(bgColor, `${route.name} should have pure black background`).toBe('rgb(0, 0, 0)')
      
      // Check primary text contrast (if any)
      const headings = page.locator('h1, h2, h3')
      if (await headings.count() > 0) {
        const { contrastRatio } = await getTextContrast(page, 'h1, h2, h3')
        expect(contrastRatio, `${route.name} headings should meet AAA (7:1)`).toBeGreaterThanOrEqual(7)
      }
      
      // Check body text contrast (if any)
      const paragraphs = page.locator('p, span')
      if (await paragraphs.count() > 0) {
        const { contrastRatio } = await getTextContrast(page, 'p, span')
        expect(contrastRatio, `${route.name} body text should meet AA (4.5:1)`).toBeGreaterThanOrEqual(4.5)
      }
    })
  }

  /**
   * Focus Indicator Tests
   */
  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Focus the toggle
    await toggle.focus()
    
    // Check for focus ring
    const focusRing = await toggle.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return {
        outline: style.outline,
        outlineColor: style.outlineColor,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      }
    })
    
    // Should have some form of focus indicator
    const hasFocus = 
      focusRing.outline !== 'none' || 
      focusRing.boxShadow !== 'none' ||
      focusRing.outlineWidth !== '0px'
    
    expect(hasFocus).toBe(true)
  })

  /**
   * Interactive Element Tests
   */
  test('should distinguish interactive elements', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Find buttons
    const buttons = page.locator('button:visible')
    
    // Buttons should be visually distinct
    // (either by color, underline, or other styling)
    if (await buttons.count() > 0) {
      const buttonStyle = await buttons.first().evaluate((el) => {
        const style = window.getComputedStyle(el)
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
          border: style.border,
          textDecoration: style.textDecoration,
        }
      })
      
      // Should have some visual distinction
      const hasDistinction = 
        buttonStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
        buttonStyle.border !== 'none' ||
        buttonStyle.textDecoration !== 'none'
      
      expect(hasDistinction).toBe(true)
    }
  })

  /**
   * Error/Warning Color Contrast
   */
  test('should meet contrast for error messages', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Look for error/danger elements
    const errorElements = page.locator('[class*="danger"], [class*="error"], [class*="text-red"]')
    
    if (await errorElements.count() > 0) {
      const { contrastRatio, textColor, bgColor } = await getTextContrast(page, '[class*="danger"], [class*="error"]')
      
      console.log(`Error text: ${textColor} on ${bgColor} = ${contrastRatio.toFixed(2)}:1`)
      
      // Error text should be clearly visible (AA: 4.5:1)
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5)
    }
  })

  test('should meet contrast for success messages', async ({ page }) => {
    await page.goto('/dashboard-v2')
    
    // Look for success elements
    const successElements = page.locator('[class*="success"], [class*="text-green"]')
    
    if (await successElements.count() > 0) {
      const { contrastRatio, textColor, bgColor } = await getTextContrast(page, '[class*="success"]')
      
      console.log(`Success text: ${textColor} on ${bgColor} = ${contrastRatio.toFixed(2)}:1`)
      
      // Success text should be visible (AA: 4.5:1)
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5)
    }
  })

  /**
   * Mobile Viewport Contrast
   */
  test('should maintain contrast on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/dashboard-v2')
    
    // Check primary text contrast
    const headings = page.locator('h1, h2, h3')
    if (await headings.count() > 0) {
      const { contrastRatio } = await getTextContrast(page, 'h1, h2, h3')
      expect(contrastRatio, 'Mobile headings should meet AAA (7:1)').toBeGreaterThanOrEqual(7)
    }
  })
})
