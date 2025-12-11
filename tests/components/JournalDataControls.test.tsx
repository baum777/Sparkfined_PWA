import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import JournalDataControls from '@/components/settings/JournalDataControls'
import { downloadAllAppData } from '@/lib/export/appDataExportService'
import {
  downloadJournalAsJSON,
  downloadJournalAsMarkdown,
  handleJournalImport,
} from '@/lib/export/journalExportService'

vi.mock('@/lib/export/journalExportService', () => ({
  downloadJournalAsJSON: vi.fn(),
  downloadJournalAsMarkdown: vi.fn(),
  handleJournalImport: vi.fn(),
}))

vi.mock('@/lib/export/appDataExportService', () => ({
  downloadAllAppData: vi.fn(),
}))

describe('JournalDataControls', () => {
  beforeEach(() => {
    vi.mocked(downloadJournalAsJSON).mockReset()
    vi.mocked(downloadJournalAsMarkdown).mockReset()
    vi.mocked(handleJournalImport).mockReset()
    vi.mocked(downloadAllAppData).mockReset()
  })

  it('triggers export helpers', async () => {
    render(<JournalDataControls />)

    fireEvent.click(screen.getByTestId('export-journal-json'))
    fireEvent.click(screen.getByTestId('export-journal-markdown'))
    fireEvent.click(screen.getByTestId('export-app-data'))

    expect(downloadJournalAsJSON).toHaveBeenCalled()
    expect(downloadJournalAsMarkdown).toHaveBeenCalled()
    expect(downloadAllAppData).toHaveBeenCalled()
  })

  it('imports a journal bundle with merge mode by default', async () => {
    vi.mocked(handleJournalImport).mockResolvedValue({ imported: 1, skipped: 0 })
    render(<JournalDataControls />)

    const file = new File([JSON.stringify({})], 'journal.json', { type: 'application/json' })

    fireEvent.change(screen.getByTestId('journal-import-input'), { target: { files: [file] } })

    await waitFor(() => expect(handleJournalImport).toHaveBeenCalled())
    expect(handleJournalImport).toHaveBeenCalledWith(file, { mode: 'merge' })
    expect(screen.getByText(/Import successful/)).toBeTruthy()
  })

  it('passes selected import mode and renders errors', async () => {
    vi.mocked(handleJournalImport).mockRejectedValue(new Error('Broken bundle'))
    render(<JournalDataControls />)

    fireEvent.change(screen.getByTestId('journal-import-mode'), { target: { value: 'replace' } })

    const file = new File([JSON.stringify({})], 'journal.json', { type: 'application/json' })

    fireEvent.change(screen.getByTestId('journal-import-input'), { target: { files: [file] } })

    await waitFor(() => expect(handleJournalImport).toHaveBeenCalled())
    expect(handleJournalImport).toHaveBeenCalledWith(file, { mode: 'replace' })
    expect(screen.getByText(/Broken bundle/)).toBeTruthy()
  })
})
