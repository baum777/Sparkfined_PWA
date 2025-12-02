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
    const now = Date.now()
    vi.mocked(queryEntries).mockResolvedValue([
      {
        id: 'entry-1',
        ticker: 'SOL',
        address: 'So11111111111111111111111111111111111111112',
        status: 'active',
        setup: 'custom',
        emotion: 'custom',
        thesis: 'Discipline over hype',
        timestamp: now,
        createdAt: now,
        updatedAt: now,
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
