import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DataExportCard from '@/features/settings/DataExportCard'
import DataImportCard from '@/features/settings/DataImportCard'

describe('DataExportCard', () => {
  beforeEach(() => {
    if (!('createObjectURL' in URL)) {
      Object.defineProperty(URL, 'createObjectURL', {
        writable: true,
        value: vi.fn(() => 'blob:mock'),
      })
    }

    if (!('revokeObjectURL' in URL)) {
      Object.defineProperty(URL, 'revokeObjectURL', {
        writable: true,
        value: vi.fn(),
      })
    }

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('updates the status message after exporting JSON', async () => {
    const user = userEvent.setup()
    render(<DataExportCard />)

    const message = screen.getByText(/No exports yet./i)
    await user.click(screen.getByRole('button', { name: /Export mock data as JSON/i }))

    expect(message).toHaveTextContent(/Exported mock JSON backup/i)
  })
})

describe('DataImportCard', () => {
  it('accepts a valid JSON backup', async () => {
    const user = userEvent.setup()
    render(<DataImportCard />)

    const input = screen.getByTestId('import-input')
    const file = new File([JSON.stringify({ summary: {}, payload: {} })], 'backup.json', {
      type: 'application/json',
    }) as File & { text: () => Promise<string> }
    file.text = async () => JSON.stringify({ summary: {}, payload: {} })

    await user.upload(input, file)

    const status = screen.getByTestId('import-status')
    expect(status).toHaveClass('settings-import-status--success')
    expect(status).toHaveTextContent(/Imported backup from backup\.json/i)
  })

  it('rejects an invalid file format', async () => {
    const user = userEvent.setup()
    render(<DataImportCard />)

    const input = screen.getByTestId('import-input')
    const file = new File([JSON.stringify({ invalid: true })], 'broken.json', {
      type: 'application/json',
    }) as File & { text: () => Promise<string> }
    file.text = async () => JSON.stringify({ invalid: true })

    await user.upload(input, file)

    const status = await screen.findByTestId('import-status')
    await waitFor(() => expect(status).toHaveClass('settings-import-status--error'))
    await waitFor(() => expect(status).toHaveTextContent(/Invalid file format/i))
  })
})
