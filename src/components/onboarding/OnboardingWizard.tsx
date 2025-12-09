import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { Bell, BookOpen, Star, X, type LucideIcon } from '@/lib/icons'
import OnboardingOverlay from './OnboardingOverlay'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useTelemetry } from '@/state/telemetry'

type StepDefinition = {
  id: string
  title: string
  description: string
  actionLabel: string
  icon: LucideIcon
  targetRoute: string
}

const STEPS: StepDefinition[] = [
  {
    id: 'journal',
    title: 'Journal your ritual',
    description: 'Capture thesis, risk and emotions in /journal-v2 so every session starts with clarity.',
    actionLabel: 'Open journal workspace',
    icon: BookOpen,
    targetRoute: '/journal-v2',
  },
  {
    id: 'watchlist',
    title: 'Curate your watchlist',
    description: 'Pin catalysts and conviction scores inside /watchlist-v2 to stay focused on high-quality setups.',
    actionLabel: 'Review watchlist',
    icon: Star,
    targetRoute: '/watchlist-v2',
  },
  {
    id: 'alerts',
    title: 'Stay ahead with alerts',
    description: 'Route price, volume and flow triggers into /alerts-v2 before the next volatility spike.',
    actionLabel: 'Enable alerts',
    icon: Bell,
    targetRoute: '/alerts-v2',
  },
]

export default function OnboardingWizard() {
  const navigate = useNavigate()
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding)
  const completeStep = useOnboardingStore((state) => state.completeStep)
  const skipOnboarding = useOnboardingStore((state) => state.skipOnboarding)
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)
  const { enqueue } = useTelemetry()
  const titleId = 'onboarding-title'

  if (hasCompletedOnboarding) {
    return null
  }

  const safeIndex = Math.max(0, Math.min(currentStepIndex, STEPS.length - 1))
  const activeStep = STEPS[safeIndex]

  if (!activeStep) {
    return null
  }

  const recordAction = React.useCallback(
    (action: 'advance' | 'skip', step: StepDefinition) => {
      const id = `${action}-${step.id}-${Date.now()}`
      enqueue({
        id,
        ts: Date.now(),
        type: `onboarding.${action}`,
        attrs: { step: step.id, target: step.targetRoute },
      })
    },
    [enqueue],
  )

  const handleNext = () => {
    completeStep(activeStep.id)
    recordAction('advance', activeStep)
    if (safeIndex === STEPS.length - 1) {
      navigate(activeStep.targetRoute)
      return
    }
    setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const handleSkip = () => {
    recordAction('skip', activeStep)
    skipOnboarding()
  }

  const handleClose = () => {
    handleSkip()
  }

  return (
    <OnboardingOverlay labelledBy={titleId}>
      <div className="relative" data-testid="onboarding-wizard">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full border border-border-subtle bg-surface px-2 py-2 text-text-secondary transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          data-testid="onboarding-close"
          aria-label="Close onboarding"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">First-run setup</p>
            <h2 id={titleId} className="text-3xl font-semibold leading-tight text-text-primary">
              Welcome to Sparkfined
            </h2>
            <p className="text-sm text-text-secondary">
              Start with a focused trio of workspaces. We keep the dashboard blurred behind this overlay until you finish or skip.
            </p>
          </div>

          <div className="flex items-center gap-2" aria-label="Onboarding progress">
            {STEPS.map((step, index) => {
              const isActive = index === currentStepIndex
              const isComplete = index < currentStepIndex
              return (
                <span
                  key={step.id}
                  className={[
                    'h-1.5 flex-1 rounded-full transition-all',
                    isComplete && 'bg-brand',
                    !isComplete && isActive && 'bg-brand/80',
                    !isComplete && !isActive && 'bg-border-moderate',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              )
            })}
          </div>

          <div className="space-y-5 rounded-2xl border border-border-subtle bg-surface/80 p-6 shadow-card-subtle">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-strong">
                <activeStep.icon className="h-7 w-7 text-brand" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">
                  Step {safeIndex + 1} of {STEPS.length}
                </p>
                <div className="space-y-1">
                  <h3
                    className="text-xl font-semibold text-text-primary"
                    data-testid="onboarding-active-step-title"
                    data-step-id={activeStep.id}
                  >
                    {activeStep.title}
                  </h3>
                  <p className="text-sm text-text-secondary">{activeStep.description}</p>
                </div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
                  <li>Jump straight to {activeStep.targetRoute} with guided context.</li>
                  <li>Finish or skip once — the wizard stays hidden after that.</li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Playbook</p>
              <ul className="space-y-2">
                {STEPS.map((step, index) => {
                  const isComplete = index < currentStepIndex
                  return (
                    <li
                      key={step.id}
                      className={[
                        'flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors',
                        isComplete ? 'bg-surface text-text-primary' : 'bg-surface/60 text-text-secondary',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      data-testid="onboarding-step-item"
                      data-step-id={step.id}
                      data-step-state={isComplete ? 'complete' : 'pending'}
                    >
                      <div className="flex items-center gap-3">
                        <step.icon className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                        <span className="font-semibold text-text-primary">{step.title}</span>
                      </div>
                      <span className="text-xs text-text-tertiary">{step.targetRoute}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleSkip}
              data-testid="onboarding-skip"
            >
              Maybe later
            </Button>
            <Button className="w-full" size="lg" onClick={handleNext} data-testid="onboarding-action">
              {activeStep.actionLabel}
            </Button>
          </div>

          <p className="text-xs text-text-tertiary">
            We dimmed and locked the dashboard while onboarding is active to keep your focus on setup.
          </p>
        </div>
      </div>
    </OnboardingOverlay>
  )
}
