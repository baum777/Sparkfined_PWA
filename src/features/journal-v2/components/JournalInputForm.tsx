import React, { useMemo, useState } from 'react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from '@/components/ui'
import type { JournalRawInput, EmotionLabel, MarketContext } from '../types'

interface JournalInputFormProps {
  onSubmit: (input: JournalRawInput) => Promise<void> | void
  isSubmitting?: boolean
}

const emotionOptions: Array<{ value: EmotionLabel; label: string }> = [
  { value: 'calm', label: 'Calm' },
  { value: 'excitement', label: 'Excitement' },
  { value: 'greed', label: 'Greed' },
  { value: 'fear', label: 'Fear' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'overconfidence', label: 'Overconfidence' },
]

const contextOptions: Array<{ value: MarketContext; label: string }> = [
  { value: 'breakout', label: 'Breakout' },
  { value: 'mean-reversion', label: 'Mean Reversion' },
  { value: 'chop', label: 'Chop / Range' },
  { value: 'high-vol', label: 'High Volatility' },
  { value: 'low-vol', label: 'Low Volatility' },
  { value: 'trend-up', label: 'Trending Up' },
  { value: 'trend-down', label: 'Trending Down' },
]

const sliderClasses =
  'w-full accent-brand transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus'

export function JournalInputForm({ onSubmit, isSubmitting }: JournalInputFormProps) {
  const [emotionalState, setEmotionalState] = useState<EmotionLabel>('calm')
  const [emotionIntensity, setEmotionIntensity] = useState(5)
  const [conviction, setConviction] = useState(5)
  const [patternQuality, setPatternQuality] = useState(5)
  const [marketContext, setMarketContext] = useState<MarketContext>('chop')
  const [reasoning, setReasoning] = useState('')
  const [expectation, setExpectation] = useState('')
  const [selfReflection, setSelfReflection] = useState('')

  const intensityLabels = useMemo(
    () => ({
      emotion: `${emotionIntensity}/10`,
      conviction: `${conviction}/10`,
      pattern: `${patternQuality}/10`,
    }),
    [conviction, emotionIntensity, patternQuality]
  )

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    onSubmit({
      emotionalState,
      emotionIntensity,
      conviction,
      patternQuality,
      marketContext,
      reasoning,
      expectation,
      selfReflection,
      createdAt: Date.now(),
    })
  }

  return (
    <Card variant="glass" className="border-border/70 shadow-card-subtle" data-testid="journal-v2-form">
      <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="brand" className="mb-2 uppercase tracking-wide text-xs">Journal</Badge>
          <CardTitle className="text-xl">Capture your trading state</CardTitle>
          <p className="text-sm text-text-secondary">
            Map emotions, conviction, and context before you enter. Insights are generated locally and saved for offline review.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <span className="inline-flex h-2 w-2 rounded-full bg-brand" aria-hidden />
          Offline-first · Dexie persisted
        </div>
      </CardHeader>

      <CardContent>
        <form className="grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Emotional state</label>
              <Select
                value={emotionalState}
                onChange={(value) => setEmotionalState(value as EmotionLabel)}
                options={emotionOptions}
                placeholder="Select your current state"
                triggerProps={{ 'data-testid': 'journal-v2-emotion' }}
              />
              <p className="text-xs text-text-tertiary">Identify the dominant emotion guiding your decision.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-medium text-text-primary">
                <span>Emotion intensity</span>
                <span className="text-text-secondary">{intensityLabels.emotion}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={emotionIntensity}
                onChange={(event) => setEmotionIntensity(Number(event.target.value))}
                className={sliderClasses}
                data-testid="journal-v2-emotion-intensity"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-medium text-text-primary">
                <span>Conviction</span>
                <span className="text-text-secondary">{intensityLabels.conviction}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={conviction}
                onChange={(event) => setConviction(Number(event.target.value))}
                className={sliderClasses}
                data-testid="journal-v2-conviction"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-medium text-text-primary">
                <span>Pattern quality</span>
                <span className="text-text-secondary">{intensityLabels.pattern}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={patternQuality}
                onChange={(event) => setPatternQuality(Number(event.target.value))}
                className={sliderClasses}
                data-testid="journal-v2-pattern-quality"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Market context</label>
              <Select
                value={marketContext}
                onChange={(value) => setMarketContext(value as MarketContext)}
                options={contextOptions}
                placeholder="Where is the market right now?"
                triggerProps={{ 'data-testid': 'journal-v2-market-context' }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Reasoning</label>
              <Textarea
                value={reasoning}
                onChange={(event) => setReasoning(event.target.value)}
                placeholder="Setup, catalysts, and risk context"
                data-testid="journal-v2-reasoning"
              />
              <p className="text-xs text-text-tertiary">Keep it concise: what is your thesis and invalidation?</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Expectation</label>
              <Input
                value={expectation}
                onChange={(event) => setExpectation(event.target.value)}
                placeholder="What outcome are you anticipating?"
                data-testid="journal-v2-expectation"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Self reflection</label>
              <Textarea
                value={selfReflection}
                onChange={(event) => setSelfReflection(event.target.value)}
                placeholder="What bias or habit should you watch?"
                data-testid="journal-v2-reflection"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-text-tertiary">
                Entries are stored locally with timestamps to track your emotional trend.
              </p>
              <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting} data-testid="journal-v2-submit">
                {isSubmitting ? 'Analyzing…' : 'Run Journal'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
