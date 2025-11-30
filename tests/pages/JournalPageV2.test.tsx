import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import JournalPageV2 from '@/pages/JournalPageV2'
import { useJournalStore } from '@/store/journalStore'
import { queryEntries } from '@/lib/JournalService'

vi.mock('@/lib/JournalService', () => ({
  createEntry: vi.fn(),
  queryEntries: vi.fn(),
  updateEntry: vi.fn(),
  updateEntryNotes: vi.fn(),
}))

describe('JournalPageV2 cache warnings', () => {
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
        <JournalPageV2 />
      </MemoryRouter>
    )

    const warning = await screen.findByTestId('journal-cache-warning')
    expect(warning.textContent).toContain('Local journal cache is currently unavailable')
  })

  it('hydrates entry selection from the URL without triggering nested updates', async () => {
    vi.mocked(queryEntries).mockResolvedValue([
      {
        id: 'entry-1',
        thesis: 'Discipline over hype',
        status: 'active',
        setup: 'custom',
        emotion: 'custom',
        timestamp: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ])

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter initialEntries={['/journal-v2?entry=entry-1']}>
        <JournalPageV2 />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(useJournalStore.getState().entries.length).toBeGreaterThan(0)
      expect(useJournalStore.getState().activeId).toBe('entry-1')
    })

    expect(
      consoleErrorSpy.mock.calls.some(([message]) =>
        typeof message === 'string' && message.includes('Maximum update depth exceeded')
      )
    ).toBe(false)

    consoleErrorSpy.mockRestore()
  })
})
