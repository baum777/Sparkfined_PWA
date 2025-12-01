import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { Bell, BookOpen, Star, type LucideIcon } from '@/lib/icons'
import { cn } from '@/lib/ui/cn'
import { useOnboardingStore } from '@/store/onboardingStore'

interface StepDefinition {
  id: string
  title: string
  description: string
  actionLabel: string
  Illustration: LucideIcon
  targetPath: string
}

const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: 'journal',
    title: 'Track Your Trades',
    description: 'Log executions with context, screenshots, and AI summaries to build a repeatable process.',
    actionLabel: 'Create First Entry',
    Illustration: BookOpen,
    targetPath: '/journal-v2',
  },
  {
    id: 'watchlist',
    title: 'Monitor Your Plays',
    description: 'Centralize symbols, catalysts, and conviction so you never lose sight of the next setup.',
    actionLabel: 'Build Watchlist',
    Illustration: Star,
    targetPath: '/watchlist-v2',
  },
  {
    id: 'alerts',
    title: 'Never Miss a Move',
    description: 'Automate entries and exits with precise alerts for price, volume, or technical signals.',
    actionLabel: 'Create First Alert',
    Illustration: Bell,
    targetPath: '/alerts-v2',
  },
]

const TOTAL_STEPS = STEP_DEFINITIONS.length

export default function OnboardingWizard() {
  const navigate = useNavigate()
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding)
  const currentStep = useOnboardingStore((state) => state.currentStep)
  const completedSteps = useOnboardingStore((state) => state.completedSteps)
  const skipOnboarding = useOnboardingStore((state) => state.skipOnboarding)
  const completeStep = useOnboardingStore((state) => state.completeStep)

  const stepsWithHandlers = React.useMemo(
    () =>
      STEP_DEFINITIONS.map((step) => ({
        ...step,
        onAction: () => navigate(step.targetPath),
      })),
    [navigate]
  )

  if (hasCompletedOnboarding) {
    return null
  }

  if (!stepsWithHandlers.length) {
    return null
  }

  const safeStepIndex = Math.max(0, Math.min(currentStep, stepsWithHandlers.length - 1))
  const activeStep = stepsWithHandlers[safeStepIndex]!
  const progressPercent = Math.round((completedSteps.size / TOTAL_STEPS) * 100)

  const handlePrimaryAction = () => {
    completeStep(activeStep.id)
    activeStep.onAction()
  }

  return (
    <Dialog isOpen={!hasCompletedOnboarding}>
      <section className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-border-moderate bg-surface text-text-primary shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col gap-8 px-6 pb-10 pt-8 md:flex-row md:gap-12 md:px-10 md:pb-12">
          <div className="flex-1 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">First-run setup</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight text-text-primary">
                Welcome to Sparkfined
                <span className="block text-base font-normal text-text-secondary">Complete three quick steps to personalize your command center.</span>
              </h2>
            </div>

            <div className="flex items-center gap-2" aria-label="Onboarding progress">
              {stepsWithHandlers.map((step, index) => {
                const isComplete = completedSteps.has(step.id)
                const isActive = index === safeStepIndex

                return (
                  <span
                    key={step.id}
                    className={cn(
                      'h-2 flex-1 rounded-full transition-all',
                      isComplete && 'bg-brand shadow-[0_0_12px_rgba(16,185,129,0.45)]',
                      !isComplete && isActive && 'bg-brand/70',
                      !isComplete && !isActive && 'bg-border-moderate'
                    )}
                  />
                )
              })}
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-text-tertiary">
                Step {safeStepIndex + 1} of {TOTAL_STEPS}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-text-primary">{activeStep.title}</h3>
              <p className="mt-3 text-base text-text-secondary">{activeStep.description}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="ghost"
                className="w-full border border-transparent text-text-secondary hover:border-border-moderate hover:bg-surface-subtle"
                onClick={skipOnboarding}
              >
                Skip for now
              </Button>
              <Button className="w-full" size="lg" onClick={handlePrimaryAction}>
                {activeStep.actionLabel}
              </Button>
            </div>
          </div>

          <aside className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-border-subtle bg-gradient-to-br from-brand/5 via-transparent to-sentiment-bull-bg/30 p-8 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-sentiment-bull-bg/40">
              <activeStep.Illustration className="h-12 w-12 text-sentiment-bull" />
            </div>
            <p className="mt-6 max-w-sm text-sm text-text-secondary">
              Each action opens the exact workspace you need. You can always revisit this walkthrough from Settings → Onboarding.
            </p>
            <div className="mt-6 w-full rounded-2xl border border-border-subtle bg-surface px-5 py-4 text-left">
              <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Progress</p>
              <div className="mt-2 text-3xl font-semibold text-text-primary">{progressPercent}%</div>
              <p className="text-sm text-text-secondary">{completedSteps.size} of {TOTAL_STEPS} steps completed</p>
            </div>
          </aside>
        </div>
      </section>
    </Dialog>
  )
}

interface DialogProps {
  isOpen: boolean
  children: React.ReactNode
}

function Dialog({ isOpen, children }: DialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex min-h-screen w-full items-center justify-center bg-bg-overlay/75 px-4 py-6 backdrop-blur"
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  )
}
