import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { JournalJourneyBanner } from '@/components/journal/JournalJourneyBanner'
import type { UserJourneySnapshot } from '@/lib/journal/journey-snapshot'

describe('JournalJourneyBanner', () => {
  it('renders phase, XP, and streak values', () => {
    const snapshot: UserJourneySnapshot = {
      phase: 'WARRIOR',
      xpTotal: 840,
      streak: 5,
    }

    render(<JournalJourneyBanner snapshot={snapshot} />)

    const banner = screen.getByTestId('journal-journey-banner')
    expect(banner).to.exist
    const text = banner.textContent ?? ''
    expect(text).to.contain('WARRIOR')
    expect(text).to.contain('840')
    expect(text).to.contain('5')
  })
})
