import { expect, test } from './fixtures/baseTest'

// Smoke coverage for the chart workspace flows. These tests assume the seeded watchlist rows
// and do not require live market data to validate UI anchors.

test.describe('chart flows', () => {
  test('Flow 1 – Watchlist → Chart → Indicators → Replay → Go-Live affordance', async ({ page }) => {
    await page.goto('/watchlist-v2')

    const row = page.locator('[data-testid="watchlist-token-row"]').first()
    await expect(row).toBeVisible()
    await row.click()

    await page.getByTestId('button-open-chart').click()
    await expect(page.getByTestId('chart-page')).toBeVisible()

    const indicatorToggle = page.getByTestId('indicator-toggle-sma-20')
    await expect(indicatorToggle).toBeVisible()
    await indicatorToggle.click()

    await page.getByTestId('button-open-replay').click()
    await expect(page.getByTestId('replay-page')).toBeVisible()

    const goLive = page.getByTestId('button-go-live')
    await expect(goLive).toBeVisible()
  })

  test('Flow 2 – Chart → Create Journal action remains accessible', async ({ page }) => {
    await page.goto('/chart-v2')
    await expect(page.getByTestId('chart-page')).toBeVisible()
    await expect(page.getByTestId('button-create-journal-from-chart')).toBeVisible()
    await page.getByTestId('button-create-journal-from-chart').click()
    await expect(page.getByTestId('chart-legend')).toBeVisible()
  })

  test.skip('Flow 3 – Pulse signal deep-link to chart annotations (requires pulse data seed)', async ({ page }) => {
    await page.goto('/chart-v2')
    await expect(page.getByTestId('chart-page')).toBeVisible()
    await expect(page.getByTestId('annotation-pill-signal')).toBeVisible()
  })
})
