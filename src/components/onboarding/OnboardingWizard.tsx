import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { Bell, BookOpen, Star, X, type LucideIcon } from '@/lib/icons'
import { useOnboardingStore } from '@/store/onboardingStore'

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

  if (hasCompletedOnboarding) {
    return null
  }

  const safeIndex = Math.max(0, Math.min(currentStepIndex, STEPS.length - 1))
  const activeStep = STEPS[safeIndex]

  if (!activeStep) {
    return null
  }

  const handleNext = () => {
    completeStep(activeStep.id)
    if (safeIndex === STEPS.length - 1) {
      navigate(activeStep.targetRoute)
      return
    }
    setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const handleSkip = () => {
    skipOnboarding()
  }

  const handleClose = () => {
    skipOnboarding()
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-bg-overlay/80 px-4 py-8 backdrop-blur"
      role="dialog"
      aria-modal="true"
      data-testid="onboarding-wizard"
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-border-moderate bg-surface text-text-primary shadow-[0_24px_120px_rgba(0,0,0,0.55)]">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full border border-border-subtle bg-surface px-2 py-2 text-text-secondary transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          data-testid="onboarding-close"
          aria-label="Close onboarding"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">First-run setup</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight text-text-primary">
                Configure Sparkfined in three moves
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Each step drops you into the exact workspace so you can finish onboarding without losing momentum.
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
                      !isComplete && isActive && 'bg-brand/70',
                      !isComplete && !isActive && 'bg-border-moderate',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  />
                )
              })}
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">
                Step {safeIndex + 1} of {STEPS.length}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
                  <activeStep.icon className="h-8 w-8 text-brand" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary">{activeStep.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{activeStep.description}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant='ghost'
                className="w-full"
                onClick={handleSkip}
                data-testid="onboarding-skip"
              >
                Skip onboarding
              </Button>
              <Button
                className="w-full"
                size="lg"
                onClick={handleNext}
                data-testid="onboarding-action"
              >
                {activeStep.actionLabel}
              </Button>
            </div>
          </div>

          <aside className="space-y-4 rounded-2xl border border-border-subtle bg-surface-subtle p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Playbook</p>
            <p className="text-sm text-text-secondary">
              Finish onboarding once and the wizard stays hidden via local storage (<code>sparkfined_onboarding_completed</code>).
              You can relaunch it anytime under Settings.
            </p>
            <ul className="space-y-3">
              {STEPS.map((step, index) => {
                const isComplete = index < currentStepIndex
                return (
                  <li
                    key={step.id}
                    className={[
                      'flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm',
                      isComplete ? 'border-brand/60 bg-surface' : 'border-border-moderate bg-surface',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <step.icon className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-text-primary">{step.title}</p>
                      <p className="text-xs text-text-tertiary">{step.targetRoute}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  )
}
