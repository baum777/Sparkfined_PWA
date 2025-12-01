import React from 'react'
import { X } from '@/lib/icons'
import { useOnboardingStore } from '@/store/onboardingStore'

interface FeatureTooltipProps {
  featureId: string
  title: string
  description: string
  children: React.ReactNode
}

export default function FeatureTooltip({ featureId, title, description, children }: FeatureTooltipProps) {
  const completedSteps = useOnboardingStore((state) => state.completedSteps)
  const [isDismissed, setIsDismissed] = React.useState(false)

  if (completedSteps.has(featureId) || isDismissed) {
    return <>{children}</>
  }

  return (
    <span className="relative inline-flex">
      <span className="absolute bottom-full left-1/2 z-40 mb-3 w-max -translate-x-1/2">
        <span className="flex max-w-xs flex-col gap-2 rounded-2xl border border-sentiment-bull-border bg-surface px-4 py-3 text-left text-text-primary shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sentiment-bull">{title}</p>
              <p className="mt-2 text-sm text-text-secondary">{description}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-text-tertiary transition hover:border-border-moderate hover:text-text-primary"
              aria-label="Dismiss feature tooltip"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </span>
      </span>
      {children}
    </span>
  )
}
