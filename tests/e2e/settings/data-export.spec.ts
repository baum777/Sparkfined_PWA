import { Buffer } from 'buffer'
import { expect, test } from '../fixtures/baseTest'

const JOURNAL_BUNDLE = {
  version: '1.0.0',
  exportedAt: new Date().toISOString(),
  entries: [
    {
      id: 'e2e-import-1',
      createdAt: new Date().toISOString(),
      ticker: 'E2E',
      address: 'e2e-address',
      setup: 'custom',
      emotion: 'custom',
      status: 'active',
      thesis: 'Imported via e2e test',
    },
  ],
}

test.describe('settings data export & import', () => {
  test('allows exporting and importing journal data', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('settings-page')).toBeVisible()

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-app-data').click(),
    ])
    expect(download.suggestedFilename()).toContain('sparkfined-app-data-export')

    await page.getByTestId('journal-import-mode').selectOption('replace')
    await page.setInputFiles('[data-testid="journal-import-input"]', {
      name: 'journal-bundle.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(JOURNAL_BUNDLE)),
    })

    await expect(page.getByText(/Import successful/)).toBeVisible()
  })
})
