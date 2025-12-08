import { expect, test } from '../fixtures/baseTest'

const ANALYSIS_URL = '/analysis-v2'

test.describe('analysis navigation flow', () => {
  test('@analysis switches tabs while retaining overview metrics', async ({ page }) => {
    await page.goto(ANALYSIS_URL)

    await expect(page.getByTestId('analysis-page-root')).toBeVisible()
    await expect(page.getByTestId('analysis-layout')).toBeVisible()

    await page.getByTestId('analysis-tab-flow').click()
    await expect(page).toHaveURL(/tab=flow/)

    await page.getByTestId('analysis-tab-overview').click()
    await expect(page).toHaveURL(/tab=overview/)
    await expect(page.getByTestId('analysis-overview-stats')).toBeVisible()
    await expect(page.getByTestId('analysis-stat-bias')).toBeVisible()
  })
})
