import { expect, test } from '../fixtures/baseTest'
import { visitWatchlist } from '../fixtures/navigation'
import { WATCHLIST_SYMBOLS } from '../fixtures/testData'

const WATCHLIST_ROW_LOCATOR = '[data-testid="watchlist-token-row"]'

test.describe('watchlist offline resilience', () => {
  test.beforeEach(async ({ page }) => {
    await visitWatchlist(page)
  })

  test('@watchlist shows cached data and offline banner when offline', async ({ page, context }) => {
    await context.setOffline(true)
    await page.reload({ waitUntil: 'networkidle' })

    await expect(page.getByTestId('watchlist-offline-banner')).toBeVisible()

    const rows = page.locator(WATCHLIST_ROW_LOCATOR)
    await expect(rows).not.toHaveCount(0)
    const symbols = await rows.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-symbol')))
    expect(symbols).toContain(WATCHLIST_SYMBOLS.primary)

    await context.setOffline(false)
  })
})
