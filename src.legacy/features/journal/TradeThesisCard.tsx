import React, { useState } from 'react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Textarea } from '@/components/ui'
import type { ThesisScreenshotReference } from '@/features/journal-v2/types'
import { TextfieldWithAutocomplete } from '@/features/journal/TextfieldWithAutocomplete'

export type ScreenshotReference = ThesisScreenshotReference

interface TradeThesisCardProps {
  reasoning: string
  expectation: string
  onReasoningChange: (value: string) => void
  onExpectationChange: (value: string) => void
  onReasoningBlur?: () => void
  onExpectationBlur?: () => void
  reasoningError?: string | null
  expectationError?: string | null
  screenshots: ScreenshotReference[]
  onScreenshotAdd: (reference: ScreenshotReference) => void
  onScreenshotRemove: (id: string) => void
  children?: React.ReactNode
}

export function TradeThesisCard({
  reasoning,
  expectation,
  onReasoningChange,
  onExpectationChange,
  onReasoningBlur,
  onExpectationBlur,
  reasoningError,
  expectationError,
  screenshots,
  onScreenshotAdd,
  onScreenshotRemove,
  children,
}: TradeThesisCardProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureError, setCaptureError] = useState<string | null>(null)

  const handleCapture = async () => {
    setCaptureError(null)
    setIsCapturing(true)

    try {
      const timestamp = Date.now()
      const reference: ScreenshotReference = {
        id: `chart-${timestamp}`,
        createdAt: timestamp,
        kind: 'chart',
      }

      // Deterministic stub to satisfy UX while capture is unavailable
      await new Promise((resolve) => setTimeout(resolve, 500))
      onScreenshotAdd(reference)
    } catch (error) {
      console.error('Screenshot capture failed', error)
      setCaptureError('Screenshot capture not available in this environment (stub). Please retry.')
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <Card variant="glass" className="sf-journal-thesis-card">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="warning" className="text-[10px]">Required</Badge>
          <CardTitle className="text-sm">3. Trade Thesis</CardTitle>
        </div>
        <p className="text-sm text-text-secondary">
          Capture your reasoning, expected outcome, and supporting context for this trade.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary" htmlFor="journal-thesis-reasoning">
            Reasoning
          </label>
          <Textarea
            id="journal-thesis-reasoning"
            value={reasoning}
            onChange={(event) => onReasoningChange(event.target.value)}
            onBlur={onReasoningBlur}
            placeholder="Setup, catalysts, and risk context. What is your thesis and invalidation?"
            rows={3}
            required
            aria-invalid={Boolean(reasoningError)}
          />
          {reasoningError ? <p className="text-xs text-status-danger">{reasoningError}</p> : null}
        </div>

        <div className="space-y-2">
          <TextfieldWithAutocomplete
            id="journal-thesis-expectation"
            label="Expectation"
            value={expectation}
            onChange={onExpectationChange}
            onBlur={onExpectationBlur}
            placeholder="What outcome are you anticipating?"
            error={expectationError ?? undefined}
            required
            dataTestId="journal-expectation-autocomplete"
          />
        </div>

        <div className="sf-journal-thesis-screenshot" data-testid="journal-screenshot-control">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-text-primary">Chart screenshot</p>
              <p className="text-xs text-text-tertiary">
                Screenshot capture not available in this environment (stub). A placeholder reference will be saved.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              loading={isCapturing}
              onClick={handleCapture}
            >
              {isCapturing ? 'Capturing…' : 'Add chart screenshot'}
            </Button>
          </div>

          {captureError ? (
            <div className="sf-journal-thesis-screenshot__error" role="alert">
              <p className="text-xs text-status-danger">{captureError}</p>
              <Button type="button" variant="ghost" size="sm" onClick={handleCapture}>
                Retry
              </Button>
            </div>
          ) : null}

          {screenshots.length ? (
            <div className="sf-journal-thesis-screenshot__list" aria-label="Captured screenshots">
              {screenshots.map((screenshot) => (
                <div key={screenshot.id} className="sf-journal-thesis-screenshot__item">
                  {screenshot.previewUrl ? (
                    <img
                      src={screenshot.previewUrl}
                      alt="Chart screenshot stub"
                      className="sf-journal-thesis-screenshot__preview"
                    />
                  ) : (
                    <div className="sf-journal-thesis-screenshot__preview sf-journal-thesis-screenshot__preview--empty">
                      No preview available (stub reference)
                    </div>
                  )}
                  <div className="sf-journal-thesis-screenshot__meta">
                    <p className="text-xs text-text-secondary">{new Date(screenshot.createdAt).toLocaleString()}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onScreenshotRemove(screenshot.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {children}
      </CardContent>
    </Card>
  )
}

export default TradeThesisCard
