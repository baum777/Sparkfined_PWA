import { test, expect } from '@playwright/test'

test.describe('ABA-E2E-040 — Analyze dashboard bullet generation', () => {
  test('user triggers AI bullets and sees response toast', async ({ page }) => {
    test.skip(process.env.CI !== 'true', 'Run only in CI with seeded dataset')

    await page.goto('/analyze')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /generieren/i }).click()

    const toast = page.getByText(/ai-result/i)
    await expect(toast).toBeVisible({ timeout: 30_000 })
  })
})
