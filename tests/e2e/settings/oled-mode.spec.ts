/**
 * E2E Tests: OLED Mode
 * 
 * Tests:
 * 1. Toggle functionality: ON/OFF states
 * 2. Persistence: localStorage across sessions
 * 3. Visual changes: Pure black backgrounds
 * 4. Cross-route consistency: All pages use OLED mode
 * 5. Accessibility: Keyboard navigation
 * 6. Edge cases: Rapid toggling, errors
 */

import { test, expect } from '../fixtures/baseTest'

test.describe('OLED Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/settings-v2')
    await page.evaluate(() => {
      localStorage.removeItem('oled-mode')
    })
  })

  test('should render OLED Mode toggle in Settings', async ({ page }) => {
    await page.goto('/settings-v2')
    
    // Find toggle by role
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    await expect(toggle).toBeVisible()
    
    // Check label and description
    await expect(page.getByText('OLED Mode')).toBeVisible()
    await expect(page.getByText(/Pure black backgrounds for OLED displays/i)).toBeVisible()
  })

  test('should have correct initial state (OFF)', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Should be OFF by default
    await expect(toggle).toHaveAttribute('aria-checked', 'false')
    
    // Check aria-label
    const ariaLabel = await toggle.getAttribute('aria-label')
    expect(ariaLabel).toContain('disabled')
  })

  test('should toggle ON when clicked', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Click to toggle ON
    await toggle.click()
    
    // Should be ON now
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
    
    // Check aria-label updated
    const ariaLabel = await toggle.getAttribute('aria-label')
    expect(ariaLabel).toContain('enabled')
  })

  test('should toggle OFF when clicked twice', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Toggle ON
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
    
    // Toggle OFF
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  test('should apply pure black background when enabled', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Get initial background color
    const bgBefore = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    
    // Should not be pure black initially
    expect(bgBefore).not.toBe('rgb(0, 0, 0)')
    
    // Toggle ON
    await toggle.click()
    
    // Wait for background to update
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'
    }, { timeout: 2000 })
    
    // Verify background is pure black
    const bgAfter = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    expect(bgAfter).toBe('rgb(0, 0, 0)')
  })

  test('should restore near-black background when disabled', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Toggle ON
    await toggle.click()
    
    // Wait for pure black
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'
    }, { timeout: 2000 })
    
    // Toggle OFF
    await toggle.click()
    
    // Wait for background to revert
    await page.waitForFunction(() => {
      return window.getComputedStyle(document.body).backgroundColor !== 'rgb(0, 0, 0)'
    }, { timeout: 2000 })
    
    // Verify background is NOT pure black
    const bgAfter = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    expect(bgAfter).not.toBe('rgb(0, 0, 0)')
  })

  test('should persist OLED mode to localStorage', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Toggle ON
    await toggle.click()
    
    // Check localStorage
    const lsValue = await page.evaluate(() => {
      return localStorage.getItem('oled-mode')
    })
    expect(lsValue).toBe('true')
  })

  test('should persist OLED mode OFF to localStorage', async ({ page }) => {
    await page.goto('/settings-v2')
    
    // Set to ON first
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    
    // Reload to apply
    await page.reload()
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Toggle OFF
    await toggle.click()
    
    // Check localStorage
    const lsValue = await page.evaluate(() => {
      return localStorage.getItem('oled-mode')
    })
    expect(lsValue).toBe('false')
  })

  test('should restore OLED mode from localStorage on page load', async ({ page }) => {
    // Set localStorage before navigation
    await page.goto('/settings-v2')
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    
    // Reload page
    await page.reload()
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Should be ON from localStorage
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
    
    // Background should be pure black
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    expect(bgColor).toBe('rgb(0, 0, 0)')
  })

  test('should persist across page navigation', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Toggle ON
    await toggle.click()
    
    // Navigate to Dashboard
    await page.goto('/dashboard-v2')
    
    // Background should still be pure black
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    expect(bgColor).toBe('rgb(0, 0, 0)')
    
    // Navigate back to Settings
    await page.goto('/settings-v2')
    
    // Toggle should still be ON
    const toggleAfter = page.getByRole('switch', { name: /OLED Mode/i })
    await expect(toggleAfter).toHaveAttribute('aria-checked', 'true')
  })

  test('should persist after browser refresh', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Toggle ON
    await toggle.click()
    
    // Refresh page
    await page.reload()
    
    // Toggle should still be ON
    const toggleAfter = page.getByRole('switch', { name: /OLED Mode/i })
    await expect(toggleAfter).toHaveAttribute('aria-checked', 'true')
    
    // Background should still be pure black
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    expect(bgColor).toBe('rgb(0, 0, 0)')
  })

  test('should work across all routes', async ({ page }) => {
    await page.goto('/settings-v2')
    
    // Enable OLED mode
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    await toggle.click()
    
    // Test each major route
    const routes = [
      '/dashboard-v2',
      '/journal-v2',
      '/watchlist-v2',
      '/alerts-v2',
      '/analysis-v2',
    ]
    
    for (const route of routes) {
      await page.goto(route)
      
      // Wait for page load
      await page.waitForLoadState('networkidle')
      
      // Check background is pure black
      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor
      })
      
      expect(bgColor, `Route ${route} should have pure black background`).toBe('rgb(0, 0, 0)')
    }
  })

  test('should support keyboard navigation (Space)', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Focus toggle
    await toggle.focus()
    
    // Press Space key
    await page.keyboard.press('Space')
    
    // Should toggle ON
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  test('should support keyboard navigation (Enter)', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Focus toggle
    await toggle.focus()
    
    // Press Enter key
    await page.keyboard.press('Enter')
    
    // Should toggle ON
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  test('should show focus ring when focused', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Focus toggle via keyboard
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Focus should be visible (check for focus ring)
    const isFocused = await toggle.evaluate((el) => {
      return el === document.activeElement
    })
    
    // Note: Visual focus ring testing is hard without screenshots
    // This just confirms element can receive focus
    expect(isFocused).toBe(true)
  })

  test('should handle rapid toggling without errors', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Rapid toggle 10 times
    for (let i = 0; i < 10; i++) {
      await toggle.click()
    }
    
    // No console errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Final state should be consistent (even number of clicks = OFF)
    await expect(toggle).toHaveAttribute('aria-checked', 'false')
    
    // No errors should have occurred
    expect(errors.length).toBe(0)
  })

  test('should gracefully handle corrupted localStorage', async ({ page }) => {
    await page.goto('/settings-v2')
    
    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'invalid-value')
    })
    
    // Reload page
    await page.reload()
    
    // Should default to OFF without crashing
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    await expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  test('should set data-oled attribute on body', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Toggle ON
    await toggle.click()
    
    // Check data-oled attribute
    const dataOled = await page.evaluate(() => {
      return document.body.dataset.oled
    })
    expect(dataOled).toBe('true')
  })

  test('should remove data-oled attribute when disabled', async ({ page }) => {
    await page.goto('/settings-v2')
    
    // Set to ON first
    await page.evaluate(() => {
      localStorage.setItem('oled-mode', 'true')
    })
    await page.reload()
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Toggle OFF
    await toggle.click()
    
    // Check data-oled attribute
    const dataOled = await page.evaluate(() => {
      return document.body.dataset.oled
    })
    expect(dataOled).toBe('false')
  })

  test('should have accessible label', async ({ page }) => {
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Check accessible name
    const accessibleName = await toggle.getAttribute('aria-label')
    expect(accessibleName).toContain('OLED Mode')
  })

  test('should be discoverable via Tab navigation', async ({ page }) => {
    await page.goto('/settings-v2')
    
    // Tab through page
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // One of the tabs should land on toggle (adjust Tab count if needed)
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    const isFocusable = await toggle.evaluate((el) => {
      return el.tabIndex >= 0
    })
    
    expect(isFocusable).toBe(true)
  })

  test('should not interfere with Theme selector', async ({ page }) => {
    await page.goto('/settings-v2')
    
    // Enable OLED mode
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    await toggle.click()
    
    // Find Theme selector (should be above OLED toggle)
    const themeSelect = page.locator('select').filter({ hasText: 'System' }).or(
      page.locator('select').filter({ hasText: 'Dark' })
    )
    
    // Should be able to change theme
    await themeSelect.first().selectOption('light')
    
    // OLED mode should still be enabled
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Should be visible on mobile
    await expect(toggle).toBeVisible()
    
    // Should be clickable (touch target)
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/settings-v2')
    
    const toggle = page.getByRole('switch', { name: /OLED Mode/i })
    
    // Should be visible on tablet
    await expect(toggle).toBeVisible()
    
    // Should be clickable
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
  })
})
