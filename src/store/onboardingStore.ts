import { create } from 'zustand';

const ONBOARDING_STORAGE_KEY = 'sparkfined_onboarding_completed';
const ONBOARDING_STEP_IDS = ['journal', 'watchlist', 'alerts'] as const;
const TOTAL_STEPS = ONBOARDING_STEP_IDS.length;

const isWindowAvailable = (): boolean => typeof window !== 'undefined';

const readCompletionFlag = (): boolean => {
  if (!isWindowAvailable()) {
    return false;
  }
  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
};

const persistCompletionFlag = (value: boolean) => {
  if (!isWindowAvailable()) {
    return;
  }
  if (value) {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } else {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  }
};

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  currentStep: number;
  completedSteps: Set<string>;
  skipOnboarding: () => void;
  completeStep: (stepId: string) => void;
  resetOnboarding: () => void;
}

const getInitialState = (): Pick<
  OnboardingState,
  'hasCompletedOnboarding' | 'currentStep' | 'completedSteps'
> => ({
  hasCompletedOnboarding: readCompletionFlag(),
  currentStep: 0,
  completedSteps: new Set<string>(),
});

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...getInitialState(),

  skipOnboarding: () => {
    persistCompletionFlag(true);
    set({ hasCompletedOnboarding: true });
  },

  completeStep: (stepId) => {
    set((state) => {
      const updatedSteps = new Set(state.completedSteps);
      updatedSteps.add(stepId);

      const hasFinished = updatedSteps.size >= TOTAL_STEPS;
      if (hasFinished) {
        persistCompletionFlag(true);
      }

      const nextStep = hasFinished
        ? Math.min(state.currentStep, TOTAL_STEPS - 1)
        : Math.min(state.currentStep + 1, TOTAL_STEPS - 1);

      return {
        completedSteps: updatedSteps,
        hasCompletedOnboarding: hasFinished || state.hasCompletedOnboarding,
        currentStep: nextStep,
      };
    });
  },

  resetOnboarding: () => {
    persistCompletionFlag(false);
    set(getInitialState());
  },
}));
