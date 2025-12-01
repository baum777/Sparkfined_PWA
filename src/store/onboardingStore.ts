import { create } from 'zustand'

const ONBOARDING_STORAGE_KEY = 'sparkfined_onboarding_completed'
const ONBOARDING_STEP_IDS = ['journal', 'watchlist', 'alerts'] as const
const TOTAL_WIZARD_STEPS = ONBOARDING_STEP_IDS.length

const isClient = () => typeof window !== 'undefined'

const readCompletionFlag = () => {
  if (!isClient()) {
    return false
  }

  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true'
}

const persistCompletionFlag = () => {
  if (!isClient()) {
    return
  }

  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
}

const clearCompletionFlag = () => {
  if (!isClient()) {
    return
  }

  window.localStorage.removeItem(ONBOARDING_STORAGE_KEY)
}

const getDefaultState = (): Pick<OnboardingState, 'hasCompletedOnboarding' | 'currentStep' | 'completedSteps'> => ({
  hasCompletedOnboarding: readCompletionFlag(),
  currentStep: 0,
  completedSteps: new Set<string>(),
})

export interface OnboardingState {
  hasCompletedOnboarding: boolean
  currentStep: number
  completedSteps: Set<string>
  skipOnboarding: () => void
  completeStep: (step: string) => void
  resetOnboarding: () => void
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...getDefaultState(),

  skipOnboarding: () => {
    persistCompletionFlag()
    set({
      hasCompletedOnboarding: true,
      completedSteps: new Set<string>(ONBOARDING_STEP_IDS),
      currentStep: TOTAL_WIZARD_STEPS,
    })
  },

  completeStep: (stepId) => {
    const { completedSteps, hasCompletedOnboarding } = get()
    const nextCompletedSteps = new Set(completedSteps)
    nextCompletedSteps.add(stepId)

    const hasCompleted = nextCompletedSteps.size === TOTAL_WIZARD_STEPS
    if (hasCompleted) {
      persistCompletionFlag()
    }

    set({
      completedSteps: nextCompletedSteps,
      currentStep: Math.min(nextCompletedSteps.size, TOTAL_WIZARD_STEPS),
      hasCompletedOnboarding: hasCompleted ? true : hasCompletedOnboarding,
    })
  },

  resetOnboarding: () => {
    clearCompletionFlag()
    set(getDefaultState())
  },
}))
