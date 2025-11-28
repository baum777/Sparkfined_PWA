import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

import { JournalInsightsPanel } from '@/components/journal/JournalInsightsPanel'
import { getJournalInsightsForEntries } from '@/lib/journal/ai'
import type { JournalEntry as StoreJournalEntry } from '@/store/journalStore'

vi.mock('@/lib/journal/ai', () => ({
  getJournalInsightsForEntries: vi.fn(),
}))

vi.mock('@/lib/journal/journal-insights-store', () => ({
  buildAnalysisKey: vi.fn((entries, maxEntries) => `latest-${maxEntries}:${entries.map((e: { id: string }) => e.id).join(',')}`),
  saveInsightsForAnalysisKey: vi.fn(() => Promise.resolve()),
  loadLatestInsightsForAnalysisKey: vi.fn(() => Promise.resolve(null)),
  recordToInsight: vi.fn((record) => ({
    id: record.id,
    category: record.category,
    severity: record.severity,
    title: record.title,
    summary: record.summary,
    recommendation: record.recommendation,
    evidenceEntries: record.evidenceEntries,
    confidence: record.confidence ?? undefined,
    detectedAt: new Date(record.generatedAt).getTime(),
  })),
}))

vi.mock('@/lib/journal/journal-insights-telemetry', () => ({
  sendJournalInsightsGeneratedEvent: vi.fn(() => Promise.resolve()),
}))

function getFirstCallArgs<TArgs extends unknown[], TReturn>(
  mockFn: Mock<TArgs, TReturn>
): TArgs[0] {
  expect(mockFn.mock.calls.length).to.be.greaterThan(0)
  const [firstCall] = mockFn.mock.calls
  if (!firstCall) {
    throw new Error('Expected mocked service to be called at least once')
  }
  const [firstArg] = firstCall
  if (typeof firstArg === 'undefined') {
    throw new Error('Expected mocked service to be called with arguments')
  }
  return firstArg
}

const mockEntries: StoreJournalEntry[] = [
  {
    id: 'entry-1',
    title: 'SOL breakout retest',
    date: 'Mar 14 · 09:45 UTC',
    direction: 'long',
    pnl: '+3.4%',
    notes: 'Scaled into reclaim after sweeping liquidity.',
    tags: ['SOL'],
    journeyMeta: {
      phase: 'SEEKER',
      xpTotal: 120,
      streak: 3,
      lastEventAt: Date.now() - 1000,
    },
  },
  {
    id: 'entry-2',
    title: 'BONK fade attempt',
    date: 'Mar 13 · 22:10 UTC',
    direction: 'short',
    pnl: '-1.2%',
    notes: 'Chased weakness into a tested level.',
    tags: ['BONK'],
  },
]

describe('JournalInsightsPanel', () => {
  const mockedService = vi.mocked(getJournalInsightsForEntries)

  beforeEach(async () => {
    mockedService.mockReset()
    
    // Reset all mocked modules
    const { loadLatestInsightsForAnalysisKey, saveInsightsForAnalysisKey } = await import('@/lib/journal/journal-insights-store')
    const { sendJournalInsightsGeneratedEvent } = await import('@/lib/journal/journal-insights-telemetry')
    
    vi.mocked(loadLatestInsightsForAnalysisKey).mockReset()
    vi.mocked(loadLatestInsightsForAnalysisKey).mockResolvedValue(null)
    vi.mocked(saveInsightsForAnalysisKey).mockReset()
    vi.mocked(sendJournalInsightsGeneratedEvent).mockReset()
  })

  it('renders generate button', () => {
    render(<JournalInsightsPanel entries={mockEntries} />)

    const button = screen.getByTestId('journal-insights-generate-button')
    expect(button).toBeTruthy()
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
    expect(mockedService.mock.calls.length).to.equal(1)

    const callArgs = getFirstCallArgs(mockedService)
    expect(callArgs.entries).to.have.lengthOf(mockEntries.length)
    const [firstMapped] = callArgs.entries
    if (!firstMapped) {
      throw new Error('Expected at least one mapped entry')
    }
    expect(firstMapped).toBeTruthy()
    expect(firstMapped.ticker).to.equal('SOL')
    expect(firstMapped.status).to.equal('active')
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
      expect(errorText).toBeTruthy()
    })
  })

  it('loads cached insights on mount', async () => {
    const { loadLatestInsightsForAnalysisKey } = await import('@/lib/journal/journal-insights-store')
    
    const cachedRecords = [
      {
        id: 'insight-cached',
        analysisKey: 'latest-20:entry-1,entry-2',
        category: 'BEHAVIOR_LOOP' as const,
        severity: 'WARNING' as const,
        title: 'Cached FOMO Pattern',
        summary: 'This is from cache.',
        recommendation: 'Use cached insights.',
        evidenceEntries: ['entry-1'],
        confidence: 90,
        generatedAt: new Date().toISOString(),
        version: 1 as const,
      },
    ]

    vi.mocked(loadLatestInsightsForAnalysisKey).mockResolvedValue(cachedRecords)

    render(<JournalInsightsPanel entries={mockEntries} />)

    await waitFor(() => {
      const card = screen.queryByTestId('journal-insight-card')
      expect(card).toBeTruthy()
      expect(card?.textContent).toContain('Cached FOMO Pattern')
    })

    // Button should say "Regenerate"
    const button = screen.getByTestId('journal-insights-generate-button')
    expect(button.textContent).toContain('Regenerate Insights')
  })

  it('saves insights after successful generation', async () => {
    const { saveInsightsForAnalysisKey } = await import('@/lib/journal/journal-insights-store')
    const { sendJournalInsightsGeneratedEvent } = await import('@/lib/journal/journal-insights-telemetry')

    const result = {
      insights: [
        {
          id: 'insight-new',
          category: 'TIMING' as const,
          severity: 'INFO' as const,
          title: 'Evening Pattern',
          summary: 'Most trades happen in evening.',
          recommendation: 'Try morning sessions.',
          evidenceEntries: ['entry-1'],
          detectedAt: Date.now(),
        },
      ],
      generatedAt: Date.now(),
      modelUsed: 'gpt-4o-mini',
    }

    mockedService.mockResolvedValue(result)

    render(<JournalInsightsPanel entries={mockEntries} />)

    fireEvent.click(screen.getByTestId('journal-insights-generate-button'))

    await waitFor(() => {
      const card = screen.queryByTestId('journal-insight-card')
      expect(card).toBeTruthy()
    })

    // Should save to cache
    expect(vi.mocked(saveInsightsForAnalysisKey)).toHaveBeenCalledWith(
      expect.stringContaining('latest-20:'),
      result
    )

    // Should send telemetry
    expect(vi.mocked(sendJournalInsightsGeneratedEvent)).toHaveBeenCalledWith(
      expect.stringContaining('latest-20:'),
      result
    )
  })

  it('does not save or send telemetry for empty insights', async () => {
    const { saveInsightsForAnalysisKey } = await import('@/lib/journal/journal-insights-store')
    const { sendJournalInsightsGeneratedEvent } = await import('@/lib/journal/journal-insights-telemetry')

    const result = {
      insights: [],
      generatedAt: Date.now(),
      modelUsed: 'gpt-4o-mini',
    }

    mockedService.mockResolvedValue(result)

    render(<JournalInsightsPanel entries={mockEntries} />)

    fireEvent.click(screen.getByTestId('journal-insights-generate-button'))

    await waitFor(() => {
      const errorText = screen.queryByText('No meaningful patterns detected yet—log a few more trades.')
      expect(errorText).toBeTruthy()
    })

    // Should NOT save or send telemetry
    expect(vi.mocked(saveInsightsForAnalysisKey)).not.toHaveBeenCalled()
    expect(vi.mocked(sendJournalInsightsGeneratedEvent)).not.toHaveBeenCalled()
  })
})
