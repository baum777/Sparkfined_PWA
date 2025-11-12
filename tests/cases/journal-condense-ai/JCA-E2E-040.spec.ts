import { test, expect } from '@playwright/test'

test.describe('JCA-E2E-040 — Journal condense happy path', () => {
  test('user condenses draft entry', async ({ page }) => {
    test.skip(process.env.CI !== 'true', 'Execute only on seeded CI environment')

    await page.goto('/journal')
    await page.getByRole('textbox', { name: /journal-entwurf/i }).fill('Long an Daily SR, Stop unter Tages-Tief')
    await page.getByRole('button', { name: /verdichten/i }).click()

    await expect(page.getByText(/ai verdichtung/i)).toBeVisible({ timeout: 30000 })
  })
})
