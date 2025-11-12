import { test, expect } from '@playwright/test'

test.describe('TVA-E2E-040 — Teaser vision analysis', () => {
  test('renders AI teaser card after analysis', async ({ page }) => {
    test.skip(process.env.CI !== 'true', 'Requires CI assets and mock vision server')

    await page.goto('/teaser')
    await page.getByRole('button', { name: /analyse starten/i }).click()

    await expect(page.getByText(/teaser analysis/i)).toBeVisible({ timeout: 45000 })
  })
})
