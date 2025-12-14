import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import JournalPage from '@/pages/JournalPage'
import { runJournalPipeline } from '@/features/journal-v2/engine'
import type { JournalRawInput, JournalOutput } from '@/features/journal-v2/types'

const mockSubmit = vi.fn()

const sampleInput: JournalRawInput = {
  emotionalState: 'calm',
  emotionIntensity: 4,
  conviction: 6,
  patternQuality: 6,
  marketContext: 'mean-reversion',
  reasoning: 'Fade extended move into liquidity pocket.',
  expectation: 'Snap back to VWAP',
  selfReflection: 'Respect stop placement',
  createdAt: 1_700_000_200_000,
}

const mockResult: JournalOutput = runJournalPipeline(sampleInput)

vi.mock('@/features/journal-v2/hooks/useJournalV2', () => ({
  useJournalV2: () => ({
    submit: mockSubmit,
    latestResult: mockResult,
    history: [
      { id: 1, raw: sampleInput, output: mockResult, createdAt: sampleInput.createdAt, version: 2 },
    ],
    isSaving: false,
    isLoading: false,
    error: null,
  }),
}))

describe('JournalPage', () => {
  it('renders form, result, and history', () => {
    render(
      <MemoryRouter>
        <JournalPage />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('journal-v2-form')).toBeTruthy()
    expect(screen.getByTestId('journal-v2-result')).toBeTruthy()
    expect(screen.getByTestId('journal-v2-history')).toBeTruthy()
  })
})
