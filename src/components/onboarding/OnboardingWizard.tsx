import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { Bell, BookOpen, Star, X, type LucideIcon } from '@/lib/icons'
import { useOnboardingStore } from '@/store/onboardingStore'

interface OnboardingStep {
  id: string
  title: string
  icon: LucideIcon
  actionLabel: string
  targetRoute: string
}

const STEPS: OnboardingStep[] = [
  {
    id: 'journal',
    title: 'Track Your Trades',
    icon: BookOpen,
    actionLabel: 'Create First Entry',
    targetRoute: '/journal-v2',
  },
  {
    id: 'watchlist',
    title: 'Monitor Your Plays',
    icon: Star,
    actionLabel: 'Build Watchlist',
    targetRoute: '/watchlist-v2',
  },
  {
    id: 'alerts',
    title: 'Never Miss a Move',
    icon: Bell,
    actionLabel: 'Create First Alert',
    targetRoute: '/alerts-v2',
  },
]

const STEP_DESCRIPTIONS: Record<string, string> = {
  journal: 'Log executions with context, screenshots, and AI summaries to build a repeatable process.',
  watchlist: 'Centralize symbols, catalysts, and conviction so you never lose sight of the next setup.',
  alerts: 'Automate entries and exits with precise alerts for price, volume, or technical signals.',
}

const TOTAL_STEPS = STEPS.length

export default function OnboardingWizard() {
  const navigate = useNavigate()
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding)
  const skipOnboarding = useOnboardingStore((state) => state.skipOnboarding)
  const completeStep = useOnboardingStore((state) => state.completeStep)
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)

  React.useEffect(() => {
    if (!hasCompletedOnboarding) {
      setCurrentStepIndex(0)
    }
  }, [hasCompletedOnboarding])

  if (hasCompletedOnboarding) {
    return null
  }

  const activeStep = STEPS[currentStepIndex]!
  const Icon = activeStep.icon

  const handleNext = () => {
    completeStep(activeStep.id)

    if (currentStepIndex === TOTAL_STEPS - 1) {
      navigate(activeStep.targetRoute)
      return
    }

    setCurrentStepIndex((index) => Math.min(index + 1, TOTAL_STEPS - 1))
  }

  const handleSkip = () => {
    skipOnboarding()
  }

  const handleClose = () => {
    skipOnboarding()
  }

  const renderBarState = (index: number) => {
    if (index < currentStepIndex) {
      return 'bg-emerald-500'
    }

    if (index === currentStepIndex) {
      return 'bg-emerald-400'
    }

    return 'bg-white/15'
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8"
      role="dialog"
      aria-modal="true"
      data-testid="onboarding-wizard"
    >
      <section className="relative w-full max-w-2xl rounded-3xl bg-zinc-900 px-8 py-10 text-white shadow-2xl">
        <button
          type="button"
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          onClick={handleClose}
          aria-label="Close onboarding"
          data-testid="onboarding-close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {STEPS.map((step, index) => (
                <span
                  key={step.id}
                  className={`h-2 flex-1 rounded-full transition ${renderBarState(index)}`}
                />
              ))}
            </div>
            <p className="text-sm text-zinc-400">
              Step {currentStepIndex + 1} of {TOTAL_STEPS}
            </p>
          </div>

          <div className="flex items-start gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <Icon className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold">{activeStep.title}</h2>
              <p className="mt-3 text-base text-zinc-300">{STEP_DESCRIPTIONS[activeStep.id]}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="ghost"
              className="w-full border border-white/10 bg-transparent text-white hover:bg-white/10"
              onClick={handleSkip}
              data-testid="onboarding-skip"
            >
              Skip
            </Button>
            <Button className="w-full" size="lg" onClick={handleNext} data-testid="onboarding-action">
              {activeStep.actionLabel}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
