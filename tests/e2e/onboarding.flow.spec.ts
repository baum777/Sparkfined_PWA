import { expect, test } from './fixtures/baseTest'
import { awaitStableUI } from './utils/wait'

const ONBOARDING_FLAG = 'sparkfined_onboarding_completed'

test.describe('onboarding first-run flow', () => {
  test.use({ skipOnboarding: false })

  test.beforeEach(async ({ page }) => {
    await page.goto('about:blank')
    await page.evaluate((flagKey) => {
      window.localStorage.removeItem(flagKey)
    }, ONBOARDING_FLAG)
  })

  test('@onboarding guides through all steps and persists completion', async ({ page }) => {
    await page.goto('/')
    await awaitStableUI(page)

    const overlay = page.getByTestId('onboarding-overlay')
    const wizard = page.getByTestId('onboarding-wizard')
    await expect(overlay).toBeVisible()
    await expect(wizard).toBeVisible()

    const activeTitle = page.getByTestId('onboarding-active-step-title')
    await expect(activeTitle).toHaveText('Journal your ritual')

    await page.getByTestId('onboarding-action').click()
    await expect(activeTitle).toHaveAttribute('data-step-id', 'watchlist')
    await expect(activeTitle).toHaveText('Curate your watchlist')

    await page.getByTestId('onboarding-action').click()
    await expect(activeTitle).toHaveAttribute('data-step-id', 'alerts')
    await expect(activeTitle).toHaveText('Stay ahead with alerts')

    await page.getByTestId('onboarding-action').click()

    await expect(page).toHaveURL(/\/alerts-v2/)
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toHaveCount(0)
    await expect(page.locator('[data-testid="onboarding-overlay"]')).toHaveCount(0)

    await page.goto('/')
    await awaitStableUI(page)
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toHaveCount(0)
    await expect(page.locator('[data-testid="onboarding-overlay"]')).toHaveCount(0)
  })

  test('@onboarding skip action hides wizard and remembers choice', async ({ page }) => {
    await page.goto('/')
    await awaitStableUI(page)

    await expect(page.getByTestId('onboarding-overlay')).toBeVisible()
    await expect(page.getByTestId('onboarding-wizard')).toBeVisible()
    await page.getByTestId('onboarding-skip').click()
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toHaveCount(0)
    await expect(page.locator('[data-testid="onboarding-overlay"]')).toHaveCount(0)

    await page.reload()
    await awaitStableUI(page)
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toHaveCount(0)
    await expect(page.locator('[data-testid="onboarding-overlay"]')).toHaveCount(0)
  })
})
