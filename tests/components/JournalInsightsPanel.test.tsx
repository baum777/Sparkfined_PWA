import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { JournalInsightsPanel } from '@/components/journal/JournalInsightsPanel'
import { getJournalInsightsForEntries } from '@/lib/journal/ai'
import type { JournalEntry } from '@/types/journal'

vi.mock('@/lib/journal/ai', () => ({
  getJournalInsightsForEntries: vi.fn(),
}))

const mockEntries: JournalEntry[] = [
  {
    id: 'entry-1',
    timestamp: Date.now(),
    ticker: 'SOL',
    address: 'sol-address',
    setup: 'support',
    emotion: 'confident',
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'entry-2',
    timestamp: Date.now() - 1000,
    ticker: 'BONK',
    address: 'bonk-address',
    setup: 'breakout',
    emotion: 'fomo',
    status: 'closed',
    createdAt: Date.now() - 2000,
    updatedAt: Date.now() - 1500,
  },
]

describe('JournalInsightsPanel', () => {
  const mockedService = vi.mocked(getJournalInsightsForEntries)

  beforeEach(() => {
    mockedService.mockReset()
  })

  it('renders generate button', () => {
    render(<JournalInsightsPanel entries={mockEntries} />)

    const button = screen.getByTestId('journal-insights-generate-button')
    expect(button).to.exist
    expect(button.textContent).to.contain('Generate Insights')
  })

  it('calls service and renders insights on success', async () => {
    mockedService.mockResolvedValue({
      insights: [
        {
          id: 'insight-1',
          category: 'BEHAVIOR_LOOP',
          severity: 'WARNING',
          title: 'FOMO entries spike',
          summary: 'Entries show repeated FOMO during evening sessions.',
          recommendation: 'Set alerts and wait for confirmation before entering trades.',
          evidenceEntries: ['entry-1', 'entry-2'],
          detectedAt: Date.now(),
        },
      ],
      generatedAt: Date.now(),
      modelUsed: 'gpt-4o-mini',
    })

    render(<JournalInsightsPanel entries={mockEntries} />)

    fireEvent.click(screen.getByTestId('journal-insights-generate-button'))

    await screen.findByTestId('journal-insight-card')
    expect(mockedService).toHaveBeenCalledOnce()

    const callArgs = mockedService.mock.calls[0][0]
    expect(callArgs.entries).to.deep.equal(mockEntries)
    expect(callArgs.maxEntries).to.equal(20)

    const card = await screen.findByTestId('journal-insight-card')
    expect(card.textContent).to.contain('FOMO entries spike')
  })

  it('surfaces an error when service throws', async () => {
    mockedService.mockRejectedValue(new Error('boom'))

    render(<JournalInsightsPanel entries={mockEntries} />)

    fireEvent.click(screen.getByTestId('journal-insights-generate-button'))

    await waitFor(() => {
      const errorText = screen.getByText('Could not generate insights. Please try again.')
      expect(errorText).to.exist
    })
  })
})
