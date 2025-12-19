import React from 'react'
import type { MarketContext } from '@/features/journal-v2/types'

export type MarketRegimeVariant = 'desktop' | 'mobile'

type MarketRegimeSelectorProps = {
  value: MarketContext
  onChange: (regime: MarketContext) => void
  variant?: MarketRegimeVariant
}

export const MARKET_REGIMES: Array<{ value: MarketContext; label: string; description: string }> = [
  { value: 'breakout', label: 'Breakout', description: 'Range break or momentum extension' },
  { value: 'mean-reversion', label: 'Mean Reversion', description: 'Snapback and fade setups' },
  { value: 'chop', label: 'Choppy / Range', description: 'No clear direction, fading edges' },
  { value: 'high-vol', label: 'High Volatility', description: 'Wide ranges, fast swings' },
  { value: 'low-vol', label: 'Low Volatility', description: 'Compressed ranges, slow drift' },
  { value: 'trend-up', label: 'Trending Up', description: 'Higher highs, pro-trend bias' },
  { value: 'trend-down', label: 'Trending Down', description: 'Lower lows, defensive bias' },
]

export function MarketRegimeSelector({ value, onChange, variant = 'desktop' }: MarketRegimeSelectorProps) {
  if (variant === 'desktop') {
    return (
      <div className="sf-journal-context-selector">
        <label className="sf-journal-context-label" htmlFor="sf-market-regime-select">
          Current market regime
        </label>
        <select
          id="sf-market-regime-select"
          className="sf-journal-context-select"
          value={value}
          aria-label="Market regime"
          onChange={(event) => onChange(event.target.value as MarketContext)}
          data-testid="market-regime-select"
        >
          {MARKET_REGIMES.map((regime) => (
            <option key={regime.value} value={regime.value}>
              {regime.label}
            </option>
          ))}
        </select>
        <p className="sf-journal-context-helper">Helps map performance across conditions.</p>
      </div>
    )
  }

  return (
    <div className="sf-journal-context-selector" data-variant="mobile">
      <div className="sf-journal-context-label">Market regime</div>
      <div className="sf-journal-context-pills" role="group" aria-label="Market regime options">
        {MARKET_REGIMES.map((regime) => {
          const isSelected = regime.value === value
          return (
            <button
              key={regime.value}
              type="button"
              className={`sf-journal-context-pill ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onChange(regime.value)}
              aria-pressed={isSelected}
              data-testid={`market-regime-${regime.value}`}
            >
              <span className="sf-journal-context-pill__label">{regime.label}</span>
              <span className="sf-journal-context-pill__hint">{regime.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
