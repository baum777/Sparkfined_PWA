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
    title: 'SUMMON: Journal Your Ritual',
    description: 'Capture thesis & emotions.',
    actionLabel: 'Open Journal',
    icon: BookOpen,
    targetRoute: '/journal-v2',
  },
  {
    id: 'watchlist',
    title: 'WATCH: Track Your Targets',
    description: 'Pin high-conviction setups.',
    actionLabel: 'Open Watchlist',
    icon: Star,
    targetRoute: '/watchlist-v2',
  },
  {
    id: 'alerts',
    title: 'MASTER: Automate Alerts',
    description: 'Never miss key levels.',
    actionLabel: 'Setup Alerts',
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
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">⚡ First-Run Setup</p>
              <h2 className="text-4xl font-bold leading-tight text-text-primary">
                Three Steps to Mastery
              </h2>
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

            <div className="group relative overflow-hidden rounded-3xl border border-border-moderate bg-gradient-to-br from-surface-subtle to-surface p-8 shadow-lg transition-all hover:shadow-glow-cyan-hover">
              {/* Icon - Large and Prominent */}
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-surface-elevated shadow-glow-cyan transition-transform group-hover:scale-105">
                <activeStep.icon className="h-12 w-12 text-accent" aria-hidden="true" />
              </div>
              
              {/* Content */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">
                  Step {safeIndex + 1} of {STEPS.length}
                </p>
                <h3 className="text-2xl font-bold text-text-primary">{activeStep.title}</h3>
                <p className="text-base text-text-secondary">{activeStep.description}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant='ghost'
                className="w-full text-text-tertiary hover:text-text-secondary"
                onClick={handleSkip}
                data-testid="onboarding-skip"
              >
                Skip
              </Button>
              <Button
                className="w-full shadow-glow-cyan transition-all hover:scale-[1.02] hover:shadow-glow-cyan-hover active:scale-95"
                size="lg"
                onClick={handleNext}
                data-testid="onboarding-action"
              >
                {activeStep.actionLabel} →
              </Button>
            </div>
          </div>

          <aside className="space-y-6 rounded-3xl border border-border-subtle bg-surface-subtle/50 p-6 backdrop-blur-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">🎯 Your Path</p>
            </div>
            <ul className="space-y-3">
              {STEPS.map((step, index) => {
                const isComplete = index < currentStepIndex
                const isActive = index === currentStepIndex
                return (
                  <li
                    key={step.id}
                    className={[
                      'relative flex items-center gap-4 rounded-2xl border px-4 py-4 transition-all',
                      isComplete && 'border-brand/60 bg-surface shadow-glow-phosphor',
                      isActive && !isComplete && 'border-accent/60 bg-surface shadow-glow-cyan',
                      !isComplete && !isActive && 'border-border-subtle bg-surface/50',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className={[
                      'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                      isComplete && 'bg-brand/20',
                      isActive && !isComplete && 'bg-accent/20',
                      !isComplete && !isActive && 'bg-surface-elevated',
                    ].filter(Boolean).join(' ')}>
                      <step.icon 
                        className={[
                          'h-5 w-5',
                          isComplete && 'text-brand',
                          isActive && !isComplete && 'text-accent',
                          !isComplete && !isActive && 'text-text-tertiary',
                        ].filter(Boolean).join(' ')} 
                        aria-hidden="true" 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{step.title}</p>
                      <p className="text-xs text-text-tertiary">{step.description}</p>
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
