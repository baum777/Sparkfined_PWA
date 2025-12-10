import { render, screen } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import JournalPage from '@/pages/JournalPage'
import { useJournalStore } from '@/store/journalStore'
import { queryEntries } from '@/lib/JournalService'

vi.mock('@/lib/JournalService', () => ({
  createEntry: vi.fn(),
  queryEntries: vi.fn(),
  updateEntry: vi.fn(),
  updateEntryNotes: vi.fn(),
}))

describe('JournalPage cache warnings', () => {
  beforeEach(() => {
    useJournalStore.setState({
      entries: [],
      isLoading: false,
      error: null,
      activeId: undefined,
    })
    vi.mocked(queryEntries).mockReset()
  })

  it('shows a gentle cache warning if IndexedDB load fails', async () => {
    vi.mocked(queryEntries).mockRejectedValue(new Error('idb blocked'))

    render(
      <MemoryRouter>
        <JournalPage />
      </MemoryRouter>
    )

    const warning = await screen.findByTestId('journal-cache-warning')
    expect(warning.textContent).toContain('Local journal cache is currently unavailable')
  })
})
