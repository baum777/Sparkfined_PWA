import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { SocialStatsSnapshot } from '@/types/journalSocial'
import { JournalSocialPreview } from '@/components/journal/JournalSocialPreview'

describe('JournalSocialPreview', () => {
  it('renders nothing when there are no patterns or insights', () => {
    const snapshot: SocialStatsSnapshot = {
      schemaVersion: 1,
      totalInsights: 0,
      totalTraders: null,
      topPatterns: [],
    }

    const { container } = render(<JournalSocialPreview snapshot={snapshot} />)
    expect(container.querySelector('[data-testid="journal-social-preview"]')).to.be.null
  })

  it('renders top patterns with severity counts when snapshot has data', () => {
    const snapshot: SocialStatsSnapshot = {
      schemaVersion: 1,
      totalInsights: 5,
      totalTraders: null,
      topPatterns: [
        {
          category: 'BEHAVIOR_LOOP',
          totalInsights: 5,
          severityCounts: {
            INFO: 0,
            WARNING: 3,
            CRITICAL: 2,
          },
        },
      ],
    }

    render(<JournalSocialPreview snapshot={snapshot} />)

    const root = screen.getByTestId('journal-social-preview')
    expect(root).to.exist
    expect(root.textContent).to.contain('Dominant Patterns')
    expect(root.textContent).to.contain('Behavior Loop')
    expect(root.textContent).to.contain('5 insight')
    expect(root.textContent).to.contain('Warn 3')
    expect(root.textContent).to.contain('Crit 2')
  })
})
