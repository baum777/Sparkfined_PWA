import React, { useId, useState } from 'react'
import type { MarketContext } from '@/features/journal-v2/types'
import { MarketRegimeSelector, type MarketRegimeVariant } from './MarketRegimeSelector'

type MarketContextAccordionProps = {
  value: MarketContext
  onChange: (value: MarketContext) => void
  selectorVariant?: MarketRegimeVariant
  defaultOpen?: boolean
  children?: React.ReactNode
}

export function MarketContextAccordion({
  value,
  onChange,
  selectorVariant = 'desktop',
  defaultOpen = false,
  children,
}: MarketContextAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentId = useId()
  const buttonId = useId()

  return (
    <div className="sf-journal-context-accordion">
      <button
        type="button"
        id={buttonId}
        className="sf-journal-context-toggle"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="sf-journal-context-toggle__text">
          <span className="sf-journal-context-overline">Optional</span>
          <span className="sf-journal-context-title">2. Market Context</span>
          <span className="sf-journal-context-subtitle">
            Capture the prevailing regime to match patterns later.
          </span>
        </div>
        <span aria-hidden className={`sf-journal-context-caret ${isOpen ? 'is-open' : ''}`}>▼</span>
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className={`sf-journal-context-panel ${isOpen ? 'is-open' : ''}`}
      >
        <div className="sf-journal-context-body">
          <p className="sf-journal-context-helper">
            Mark the dominant structure so you can compare results across regimes.
          </p>
          <div className="sf-journal-context-inputs">
            <div className="sf-journal-context-desktop">
              <MarketRegimeSelector value={value} onChange={onChange} variant={selectorVariant} />
            </div>
            <div className="sf-journal-context-mobile">
              <MarketRegimeSelector value={value} onChange={onChange} variant="mobile" />
            </div>
          </div>
          {children ? <div className="sf-journal-context-children">{children}</div> : null}
        </div>
      </div>
    </div>
  )
}
