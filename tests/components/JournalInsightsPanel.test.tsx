import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

import { JournalInsightsPanel } from '@/components/journal/JournalInsightsPanel'
import { getJournalInsightsForEntries } from '@/lib/journal/ai'
import {
  buildAnalysisKey,
  loadLatestInsightsForAnalysisKey,
  mapRecordToJournalInsight,
  saveInsightsForAnalysisKey,
} from '@/lib/journal/journal-insights-store'
import { sendJournalInsightsGeneratedEvent } from '@/lib/journal/journal-insights-telemetry'
import type { JournalEntry as StoreJournalEntry } from '@/store/journalStore'

vi.mock('@/lib/journal/ai', () => ({
  getJournalInsightsForEntries: vi.fn(),
}))

vi.mock('@/lib/journal/journal-insights-store', () => {
  return {
    buildAnalysisKey: vi.fn(() => 'analysis-key'),
    loadLatestInsightsForAnalysisKey: vi.fn(),
    saveInsightsForAnalysisKey: vi.fn(),
    mapRecordToJournalInsight: vi.fn((record) => ({
      id: record.id ?? 'cached',
      category: 'OTHER',
      severity: 'INFO',
      title: (record as { title?: string }).title ?? 'Cached Insight',
      summary: 'Cached summary',
      recommendation: 'Cached recommendation',
      evidenceEntries: record.evidenceEntries ?? [],
    })),
  }
})

vi.mock('@/lib/journal/journal-insights-telemetry', () => ({
  sendJournalInsightsGeneratedEvent: vi.fn(),
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
  const mockedLoadCached = vi.mocked(loadLatestInsightsForAnalysisKey)
  const mockedSaveInsights = vi.mocked(saveInsightsForAnalysisKey)
  const mockedBuildKey = vi.mocked(buildAnalysisKey)
  const mockedTelemetry = vi.mocked(sendJournalInsightsGeneratedEvent)

  beforeEach(() => {
    mockedService.mockReset()
    mockedLoadCached.mockReset()
    mockedSaveInsights.mockReset()
    mockedBuildKey.mockReturnValue('analysis-key')
    mockedTelemetry.mockReset()
    vi.mocked(mapRecordToJournalInsight).mockClear()
    mockedLoadCached.mockResolvedValue(null)
  })

  it('renders generate button', async () => {
    render(<JournalInsightsPanel entries={mockEntries} />)

    await waitFor(() => {
      expect(mockedLoadCached).toHaveBeenCalledWith('analysis-key')
    })

    const button = screen.getByTestId('journal-insights-generate-button')
    expect(button).toBeTruthy()
    expect(button.textContent).to.contain('Generate Insights')
  })

  it('calls service and renders insights on success', async () => {
    const generatedAt = Date.now()
    const mockResult = {
      insights: [
        {
          id: 'insight-1',
          category: 'BEHAVIOR_LOOP',
          severity: 'WARNING',
          title: 'FOMO entries spike',
          summary: 'Entries show repeated FOMO during evening sessions.',
          recommendation: 'Set alerts and wait for confirmation before entering trades.',
          evidenceEntries: ['entry-1', 'entry-2'],
          detectedAt: generatedAt,
        },
      ],
      generatedAt,
      modelUsed: 'gpt-4o-mini',
    }
    mockedService.mockResolvedValue(mockResult)

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

    expect(mockedSaveInsights).toHaveBeenCalledWith('analysis-key', mockResult, {
      journeyPhase: 'SEEKER',
    })
    expect(mockedTelemetry).toHaveBeenCalledWith('analysis-key', mockResult)
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

  it('hydrates cached insights on mount', async () => {
    mockedLoadCached.mockResolvedValue([
      {
        id: 'cached-1',
        analysisKey: 'analysis-key',
        category: 'OTHER',
        severity: 'INFO',
        title: 'Cached',
        summary: 'Summary',
        recommendation: 'Recommendation',
        evidenceEntries: ['entry-1'],
        generatedAt: new Date().toISOString(),
        version: 1,
      },
    ])

    render(<JournalInsightsPanel entries={mockEntries} />)

    const card = await screen.findByTestId('journal-insight-card')
    expect(card.textContent).to.contain('Cached Insight')
    expect(mockedService).not.toHaveBeenCalled()
    expect(screen.getByTestId('journal-insights-generate-button').textContent).toContain(
      'Regenerate Insights'
    )
  })
})
