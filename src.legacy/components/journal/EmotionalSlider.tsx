import React, { useId, useMemo } from 'react'
import { cn } from '@/lib/ui/cn'

export type EmotionalZoneId = 'veryUnsure' | 'unsure' | 'neutral' | 'optimistic' | 'veryOptimistic'

export type EmotionalZone = {
  id: EmotionalZoneId
  /** User-facing semantics (also used as aria-valuetext). */
  label: string
  /** Inclusive bounds */
  min: number
  max: number
}

const ZONES: EmotionalZone[] = [
  { id: 'veryUnsure', label: 'Sehr unsicher', min: 0, max: 20 },
  { id: 'unsure', label: 'Unsicher', min: 21, max: 40 },
  { id: 'neutral', label: 'Neutral', min: 41, max: 60 },
  { id: 'optimistic', label: 'Optimistisch', min: 61, max: 80 },
  { id: 'veryOptimistic', label: 'Sehr optimistisch', min: 81, max: 100 },
]

const DEFAULT_ZONE: EmotionalZone = { id: 'neutral', label: 'Neutral', min: 41, max: 60 }

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 50
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function getEmotionalZone(score: number): EmotionalZone {
  const clamped = clampScore(score)
  return ZONES.find((zone) => clamped >= zone.min && clamped <= zone.max) ?? DEFAULT_ZONE
}

export type EmotionalSliderProps = {
  value: number
  onChange: (nextValue: number) => void
  /**
   * Used for screen readers (required for a11y). Defaults to "Emotionaler Zustand".
   * Visible labels are Unsicher/Neutral/Optimistisch.
   */
  ariaLabel?: string
  id?: string
  name?: string
  disabled?: boolean
  className?: string
  showNeutralMarker?: boolean
  'data-testid'?: string
}

export function EmotionalSlider({
  value,
  onChange,
  ariaLabel = 'Emotionaler Zustand',
  id,
  name,
  disabled = false,
  className,
  showNeutralMarker = true,
  'data-testid': dataTestId,
}: EmotionalSliderProps) {
  const fallbackId = useId()
  const sliderId = id ?? `emotional-slider-${fallbackId}`
  const clampedValue = clampScore(value)
  const zone = useMemo(() => getEmotionalZone(clampedValue), [clampedValue])

  return (
    <div className={cn('w-full', className)} data-emotional-slider>
      {/* Local styling to ensure a consistent, mobile-friendly thumb/track without global CSS. */}
      <style>{`
        [data-emotional-slider] input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          width: 100%;
          height: 44px; /* >=44px touch target */
          margin: 0;
        }
        [data-emotional-slider] input[type="range"]:focus {
          outline: none;
        }
        [data-emotional-slider] input[type="range"]::-webkit-slider-runnable-track {
          height: 10px;
          border-radius: 9999px;
          background: transparent;
        }
        [data-emotional-slider] input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          background: rgb(var(--color-surface-elevated));
          border: 2px solid rgb(var(--color-border-contrast) / 0.2);
          box-shadow: 0 0 0 3px rgb(var(--color-brand) / 0.12);
          margin-top: -6px; /* centers thumb on 10px track */
        }
        [data-emotional-slider] input[type="range"]::-moz-range-track {
          height: 10px;
          border-radius: 9999px;
          background: transparent;
        }
        [data-emotional-slider] input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          background: rgb(var(--color-surface-elevated));
          border: 2px solid rgb(var(--color-border-contrast) / 0.2);
          box-shadow: 0 0 0 3px rgb(var(--color-brand) / 0.12);
        }
        [data-emotional-slider] input[type="range"]:disabled::-webkit-slider-thumb {
          opacity: 0.6;
          box-shadow: none;
        }
        [data-emotional-slider] input[type="range"]:disabled::-moz-range-thumb {
          opacity: 0.6;
          box-shadow: none;
        }
      `}</style>

      <div className="relative">
        <div
          aria-hidden="true"
          className={cn(
            'h-[10px] w-full rounded-full border border-border/60',
            disabled ? 'opacity-60' : 'opacity-100',
          )}
          style={{
            background:
              'linear-gradient(90deg,' +
              ' rgb(var(--color-sentiment-bear) / 0.45) 0%,' +
              ' rgb(var(--color-sentiment-bear) / 0.22) 20%,' +
              ' rgb(var(--color-sentiment-neutral) / 0.22) 40%,' +
              ' rgb(var(--color-sentiment-bull) / 0.22) 60%,' +
              ' rgb(var(--color-sentiment-bull) / 0.45) 100%' +
              ')',
          }}
        />

        {showNeutralMarker ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[-2px] h-[14px] w-px -translate-x-1/2 bg-border/70"
          />
        ) : null}

        <input
          id={sliderId}
          name={name}
          type="range"
          min={0}
          max={100}
          step={1}
          value={clampedValue}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-valuetext={zone.label}
          onChange={(event) => onChange(clampScore(Number(event.target.value)))}
          className={cn(
            'absolute inset-0 cursor-pointer',
            'transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          )}
          data-testid={dataTestId}
        />
      </div>

      <div className="mt-2 grid grid-cols-3 items-center text-xs text-text-tertiary">
        <span className="justify-self-start">Unsicher</span>
        {showNeutralMarker ? <span className="justify-self-center">Neutral</span> : <span />}
        <span className="justify-self-end">Optimistisch</span>
      </div>
    </div>
  )
}

