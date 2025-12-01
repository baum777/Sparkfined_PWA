import { create } from 'zustand';

const ONBOARDING_STORAGE_KEY = 'onboarding_completed';
const ONBOARDING_PROGRESS_KEY = 'onboarding_progress_steps';
const ONBOARDING_STEP_INDEX_KEY = 'onboarding_current_step';
export const ONBOARDING_STEP_IDS = ['journal', 'watchlist', 'alerts'] as const;
const TOTAL_WIZARD_STEPS = ONBOARDING_STEP_IDS.length;

const isWindowAvailable = (): boolean => typeof window !== 'undefined';

const readCompletionFlag = (): boolean => {
  if (!isWindowAvailable()) {
    return false;
  }

  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
};

const persistCompletionFlag = (isComplete: boolean) => {
  if (!isWindowAvailable()) {
    return;
  }

  if (isComplete) {
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

const readCompletedSteps = (): Set<string> => {
  if (!isWindowAvailable()) {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(ONBOARDING_PROGRESS_KEY);
    if (!raw) {
      return new Set<string>();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    const validSteps = parsed.filter((value): value is string =>
      typeof value === 'string' && ONBOARDING_STEP_IDS.includes(value as (typeof ONBOARDING_STEP_IDS)[number])
    );

    return new Set(validSteps);
  } catch {
    return new Set<string>();
  }
};

const readCurrentStepIndex = (): number => {
  if (!isWindowAvailable()) {
    return 0;
  }

  const raw = window.localStorage.getItem(ONBOARDING_STEP_INDEX_KEY);
  const parsed = Number(raw);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(Math.max(0, parsed), TOTAL_WIZARD_STEPS - 1);
};

const persistProgress = (steps: Set<string>, currentStep: number) => {
  if (!isWindowAvailable()) {
    return;
  }

  window.localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(Array.from(steps)));
  window.localStorage.setItem(ONBOARDING_STEP_INDEX_KEY, currentStep.toString());
};

const clearProgress = () => {
  if (!isWindowAvailable()) {
    return;
  }

  window.localStorage.removeItem(ONBOARDING_PROGRESS_KEY);
  window.localStorage.removeItem(ONBOARDING_STEP_INDEX_KEY);
};

const getDefaultState = (): Pick<
  OnboardingState,
  'hasCompletedOnboarding' | 'currentStep' | 'completedSteps'
> => ({
  hasCompletedOnboarding: readCompletionFlag(),
  currentStep: readCurrentStepIndex(),
  completedSteps: readCompletedSteps(),
});

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...getDefaultState(),

  skipOnboarding: () => {
    persistCompletionFlag(true);
    set({ hasCompletedOnboarding: true });
  },

  completeStep: (stepId) => {
    const { completedSteps, currentStep, hasCompletedOnboarding } = get();
    const alreadyCompleted = completedSteps.has(stepId);
    const nextCompletedSteps = new Set(completedSteps);
    nextCompletedSteps.add(stepId);

    const hasCompleted = nextCompletedSteps.size >= TOTAL_WIZARD_STEPS;
    if (hasCompleted) {
      persistCompletionFlag(true);
    }

    const nextStepIndex =
      hasCompleted || alreadyCompleted
        ? Math.min(TOTAL_WIZARD_STEPS - 1, currentStep)
        : Math.min(TOTAL_WIZARD_STEPS - 1, currentStep + 1);

    set({
      completedSteps: nextCompletedSteps,
      hasCompletedOnboarding: hasCompleted || hasCompletedOnboarding,
      currentStep: nextStepIndex,
    });

    persistProgress(nextCompletedSteps, nextStepIndex);
  },

  resetOnboarding: () => {
    persistCompletionFlag(false);
    clearProgress();
    set(getDefaultState());
  },
}));
