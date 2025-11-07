/**
 * Onboarding Store - Manages onboarding state and progress
 * 
 * Tracks:
 * - User persona (beginner, intermediate, advanced)
 * - Tour completion status
 * - Feature discovery progress
 * - Dismissed hints
 * - Overall onboarding completion
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced' | null;

interface OnboardingState {
  // User Persona
  userLevel: UserLevel;
  setUserLevel: (level: UserLevel) => void;

  // Tour Progress
  tourCompleted: boolean;
  currentTourStep: number;
  completeTour: () => void;
  setTourStep: (step: number) => void;
  resetTour: () => void;

  // Feature Discovery (checklist items)
  discoveredFeatures: string[];
  discoverFeature: (feature: string) => void;
  
  // Hints & Tips (dismissed state)
  dismissedHints: string[];
  dismissHint: (hintId: string) => void;
  isHintDismissed: (hintId: string) => boolean;

  // Progress Tracking
  progress: number;
  calculateProgress: () => void;
  
  // First visit tracking
  firstVisit: boolean;
  markVisited: () => void;
  
  // Reset all onboarding
  resetOnboarding: () => void;
}

const CHECKLIST_ITEMS = [
  // Getting Started (3 items)
  'tour-completed',
  'theme-customized',
  'watchlist-created',
  
  // First Steps (4 items)
  'token-analyzed',
  'chart-created',
  'alert-added',
  'journal-entry-written',
  
  // Advanced Features (3 items)
  'replay-mode-used',
  'ai-analysis-used',
  'alert-backtested',
];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial State
      userLevel: null as UserLevel,
      tourCompleted: false,
      currentTourStep: 0,
      discoveredFeatures: [] as string[],
      dismissedHints: [] as string[],
      progress: 0,
      firstVisit: true,

      // Actions
      setUserLevel: (level) => {
        set({ userLevel: level });
        get().calculateProgress();
      },

      completeTour: () => {
        set({ tourCompleted: true });
        get().discoverFeature('tour-completed');
      },

      setTourStep: (step) => set({ currentTourStep: step }),

      resetTour: () => set({ tourCompleted: false, currentTourStep: 0 }),

      discoverFeature: (feature) => {
        const { discoveredFeatures } = get();
        if (!discoveredFeatures.includes(feature)) {
          set({ 
            discoveredFeatures: [...discoveredFeatures, feature],
          });
          get().calculateProgress();
        }
      },

      dismissHint: (hintId) => {
        const { dismissedHints } = get();
        if (!dismissedHints.includes(hintId)) {
          set({ dismissedHints: [...dismissedHints, hintId] });
        }
      },

      isHintDismissed: (hintId) => {
        return get().dismissedHints.includes(hintId);
      },

      calculateProgress: () => {
        const { discoveredFeatures } = get();
        const totalItems = CHECKLIST_ITEMS.length;
        const completedItems = discoveredFeatures.filter(f => 
          CHECKLIST_ITEMS.includes(f)
        ).length;
        
        const progress = Math.round((completedItems / totalItems) * 100);
        set({ progress });
      },

      markVisited: () => set({ firstVisit: false }),

      resetOnboarding: () => {
        set({
          userLevel: null,
          tourCompleted: false,
          currentTourStep: 0,
          discoveredFeatures: [],
          dismissedHints: [],
          progress: 0,
          firstVisit: true,
        });
      },
    }),
    {
      name: 'sparkfined-onboarding',
      version: 1,
    }
  )
);

// Checklist structure for UI
export const ONBOARDING_CHECKLIST = {
  'Getting Started': [
    { id: 'tour-completed', label: 'Complete product tour' },
    { id: 'theme-customized', label: 'Set display theme' },
    { id: 'watchlist-created', label: 'Create watchlist' },
  ],
  'First Steps': [
    { id: 'token-analyzed', label: 'Analyze your first token' },
    { id: 'chart-created', label: 'Create your first chart' },
    { id: 'alert-added', label: 'Add your first alert' },
    { id: 'journal-entry-written', label: 'Write a journal entry' },
  ],
  'Advanced Features': [
    { id: 'replay-mode-used', label: 'Try Chart Replay mode' },
    { id: 'ai-analysis-used', label: 'Use AI-powered analysis' },
    { id: 'alert-backtested', label: 'Backtest an alert rule' },
  ],
};
