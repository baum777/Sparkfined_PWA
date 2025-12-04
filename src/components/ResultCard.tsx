/**
 * ResultCard Component
 *
 * Displays analysis results with:
 * - Token metadata
 * - S/R levels visualization
 * - Entry/SL/TP recommendations
 * - Technical indicators
 * - AI teaser text
 * - Collapsible advanced section
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp } from '@/lib/icons'
import { Button } from '@/design-system'
import type { AnalysisResult, AITeaserAnalysis } from '@/types/analysis'

interface ResultCardProps {
  analysis: AnalysisResult
  teaser?: AITeaserAnalysis
  onSave?: () => void
  onNewAnalysis?: () => void
}

export default function ResultCard({
  analysis,
  teaser,
  onSave,
  onNewAnalysis,
}: ResultCardProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { heuristics, token } = analysis

  // Use teaser data if available, otherwise use heuristics
  const srLevels = teaser?.sr_levels || [
    { label: 'S1', price: heuristics.supportLevel, type: 'support' as const },
    { label: 'R1', price: heuristics.resistanceLevel, type: 'resistance' as const },
  ]
  const stopLoss = teaser?.stop_loss || heuristics.stopLoss
  const takeProfits = teaser?.tp || [heuristics.takeProfit1, heuristics.takeProfit2]
  const teaserText = teaser?.teaser_text || 'Analysis complete'

  // Format price for display
  const formatPrice = (price?: number) => {
    if (!price) return '—'
    if (price < 0.01) return price.toFixed(8)
    if (price < 1) return price.toFixed(6)
    return price.toFixed(2)
  }

  // Determine bias color
  const biasColor =
    heuristics.bias === 'Bullish'
      ? 'text-bull'
      : heuristics.bias === 'Bearish'
        ? 'text-bear'
        : 'text-text-secondary'

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Primary Card - Token Info */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-display font-semibold text-text-primary">
              {token?.symbol || 'Token'} Analysis
            </h3>
            {token?.name && (
              <p className="text-sm text-text-tertiary">{token.name}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-text-primary">
              ${formatPrice(token?.price || heuristics.supportLevel)}
            </p>
            {token?.priceChange24h !== undefined && (
              <p
                className={`text-sm font-mono ${
                  token.priceChange24h >= 0 ? 'text-bull' : 'text-bear'
                }`}
              >
                {token.priceChange24h >= 0 ? '+' : ''}
                {token.priceChange24h.toFixed(2)}%
              </p>
            )}
          </div>
        </div>

        {/* Contract Address */}
        {token?.address && (
          <div className="mb-4 p-2 bg-bg-tertiary rounded font-mono text-xs text-text-secondary break-all">
            {token.address}
          </div>
        )}

        {/* Bias Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-text-secondary">Bias:</span>
          <span className={`font-semibold ${biasColor}`}>
            {heuristics.bias}
          </span>
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              heuristics.bias === 'Bullish'
                ? 'bg-bull glow-accent'
                : heuristics.bias === 'Bearish'
                  ? 'bg-bear'
                  : 'bg-text-tertiary'
            }`}
          />
        </div>

        {/* AI Teaser Text */}
        {teaserText && (
          <div className="mb-4 p-3 bg-bg-tertiary rounded-lg border border-border-subtle">
            <p className="text-sm text-text-secondary leading-relaxed">
              {teaserText}
            </p>
          </div>
        )}

        {/* Key Levels Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-bg-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-1">Entry Zone</p>
            <p className="text-sm font-mono font-semibold text-text-primary">
              ${formatPrice(heuristics.entryZone?.min)} - $
              {formatPrice(heuristics.entryZone?.max)}
            </p>
          </div>
          <div className="p-3 bg-bg-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-1">Stop Loss</p>
            <p className="text-sm font-mono font-semibold text-bear">
              ${formatPrice(stopLoss)}
            </p>
          </div>
          <div className="p-3 bg-bg-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-1">Take Profit 1</p>
            <p className="text-sm font-mono font-semibold text-bull">
              ${formatPrice(takeProfits[0])}
            </p>
          </div>
          <div className="p-3 bg-bg-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-1">Take Profit 2</p>
            <p className="text-sm font-mono font-semibold text-bull">
              ${formatPrice(takeProfits[1])}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={onSave} className="w-full">
            Mark Entry
          </Button>
          <Button onClick={onNewAnalysis} variant="ghost" className="w-full">
            New Analysis
          </Button>
        </div>
      </div>

      {/* Support/Resistance Levels Card */}
      <div className="card border-accent/10">
        <h4 className="font-display font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="inline-block w-1 h-4 bg-accent rounded-full glow-accent" />
          Support & Resistance Levels
        </h4>
        <div className="space-y-2">
          {srLevels.map((level, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-2 bg-bg-tertiary rounded"
            >
              <span className="text-sm font-mono text-text-secondary">
                {level.label}
              </span>
              <span
                className={`text-sm font-mono font-semibold ${
                  level.type === 'support' ? 'text-cyan' : 'text-bear'
                }`}
              >
                ${formatPrice(level.price)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Section (Collapsible) */}
      <div className="card">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-left"
        >
          <h4 className="font-display font-semibold text-text-primary">
            Advanced Details
          </h4>
          {showAdvanced ? (
            <ChevronUp className="w-5 h-5 text-text-tertiary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-tertiary" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-3 animate-slide-up">
            {/* Technical Indicators */}
            <div>
              <p className="text-xs text-text-tertiary mb-2">
                Technical Indicators
              </p>
              <div className="space-y-1">
                {teaser?.indicators.map((indicator, idx) => (
                  <p key={idx} className="text-sm text-text-secondary">
                    • {indicator}
                  </p>
                ))}
                {!teaser?.indicators?.length && (
                  <p className="text-sm text-text-tertiary">
                    No specific indicators detected
                  </p>
                )}
              </div>
            </div>

            {/* Market Metrics */}
            {token && (
              <div>
                <p className="text-xs text-text-tertiary mb-2">Market Metrics</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {token.volume24h && (
                    <div>
                      <span className="text-text-tertiary">24h Vol:</span>{' '}
                      <span className="font-mono text-text-primary">
                        ${(token.volume24h / 1000).toFixed(1)}K
                      </span>
                    </div>
                  )}
                  {token.liquidity && (
                    <div>
                      <span className="text-text-tertiary">Liquidity:</span>{' '}
                      <span className="font-mono text-text-primary">
                        ${(token.liquidity / 1000).toFixed(1)}K
                      </span>
                    </div>
                  )}
                  {token.marketCap && (
                    <div>
                      <span className="text-text-tertiary">Market Cap:</span>{' '}
                      <span className="font-mono text-text-primary">
                        ${(token.marketCap / 1000).toFixed(1)}K
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-text-tertiary">Volatility:</span>{' '}
                    <span className="font-mono text-text-primary">
                      {heuristics.volatility24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Meta */}
            <div>
              <p className="text-xs text-text-tertiary mb-2">Analysis Info</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-text-tertiary">Source:</span>{' '}
                  <span className="font-mono text-text-primary">
                    {teaser?.provider || heuristics.source}
                  </span>
                </div>
                <div>
                  <span className="text-text-tertiary">Confidence:</span>{' '}
                  <span className="font-mono text-text-primary">
                    {((teaser?.confidence || heuristics.confidence) * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-text-tertiary">Processing:</span>{' '}
                  <span className="font-mono text-text-primary">
                    {analysis.processingTime.toFixed(0)}ms
                  </span>
                </div>
                <div>
                  <span className="text-text-tertiary">Range:</span>{' '}
                  <span className="font-mono text-text-primary">
                    {heuristics.rangeSize}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
