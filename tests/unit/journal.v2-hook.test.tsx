import { renderHook, act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useJournalV2 } from '@/features/journal-v2/hooks/useJournalV2'
import { runJournalPipeline } from '@/features/journal-v2/engine'
import type { JournalRawInput, JournalOutput } from '@/features/journal-v2/types'
import { getJournalEntries, saveJournalEntry } from '@/features/journal-v2/db'
import { createShadowTradeLogFromPipeline } from '@/features/journal-v2/services/shadowTradeLog'

vi.mock('@/features/journal-v2/db', () => ({
  getJournalEntries: vi.fn(),
  saveJournalEntry: vi.fn(),
  saveJournalEntries: vi.fn(),
  journalV2DB: {},
}))

vi.mock('@/features/journal-v2/services/shadowTradeLog', () => ({
  createShadowTradeLogFromPipeline: vi.fn(),
}))

vi.mock('@/state/settings', async () => {
  const actual = await vi.importActual<typeof import('@/state/settings')>('@/state/settings')
  return {
    ...actual,
    useSettings: () => ({ settings: actual.DEFAULT_SETTINGS, setSettings: vi.fn() }),
  }
})

const sampleInput: JournalRawInput = {
  emotionalState: 'excitement',
  emotionIntensity: 7,
  conviction: 6,
  patternQuality: 5,
  marketContext: 'trend-up',
  reasoning: 'Momentum setup on strong trend',
  expectation: 'Follow-through into prior highs',
  selfReflection: 'Avoid chasing late entries',
  createdAt: 1_700_000_100_000,
}

describe('useJournalV2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createShadowTradeLogFromPipeline).mockResolvedValue({} as any)
  })

  it('loads existing history on mount', async () => {
    const output: JournalOutput = runJournalPipeline(sampleInput)
    vi.mocked(getJournalEntries).mockResolvedValueOnce([
      { id: 1, raw: sampleInput, output, createdAt: sampleInput.createdAt, version: 2 },
    ])

    const { result } = renderHook(() => useJournalV2())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.history).toHaveLength(1)
    expect(result.current.latestResult).toEqual(output)
  })

  it('persists and exposes new results when submit is called', async () => {
    vi.mocked(getJournalEntries).mockResolvedValueOnce([])
    vi.mocked(saveJournalEntry).mockResolvedValue(10)

    const { result } = renderHook(() => useJournalV2())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.submit(sampleInput)
    })

    expect(saveJournalEntry).toHaveBeenCalled()
    expect(createShadowTradeLogFromPipeline).toHaveBeenCalledWith(
      expect.objectContaining({
        journalEntryId: 10,
        action: expect.any(String),
        quoteCurrency: 'USD',
      }),
    )
    expect(result.current.latestResult?.score).toBeGreaterThan(0)
    expect(result.current.history[0]?.id).toBe(10)
  })
})
