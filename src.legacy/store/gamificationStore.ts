/**
 * Gamification Store
 * 
 * Manages XP, streaks, badges, and journey phase progression.
 * Persisted to localStorage for offline-first experience.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===== Types =====

export type JourneyPhase = 'DEGEN' | 'SEEKER' | 'WARRIOR' | 'MASTER' | 'SAGE';

export type StreakType = 'journal' | 'oracle' | 'analysis';

export interface Streaks {
  journal: number;      // Consecutive journal entries
  oracle: number;       // Consecutive Oracle reads
  analysis: number;     // Consecutive analysis sessions
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlockedAt: number;
}

// ===== Phase Thresholds =====

export const PHASE_THRESHOLDS: Record<JourneyPhase, number> = {
  DEGEN: 0,
  SEEKER: 500,
  WARRIOR: 2000,
  MASTER: 5000,
  SAGE: 10000,
};

// ===== Badge Definitions =====

export const BADGE_DEFINITIONS: Record<string, Omit<Badge, 'unlockedAt'>> = {
  'oracle-week': {
    id: 'oracle-week',
    name: 'Oracle Devotee',
    description: 'Read Oracle 7 days in a row',
  },
  'oracle-master': {
    id: 'oracle-master',
    name: 'Oracle Master',
    description: 'Read Oracle 21 days in a row',
  },
  'journal-week': {
    id: 'journal-week',
    name: 'Journal Keeper',
    description: 'Journal 7 days in a row',
  },
  'journal-master': {
    id: 'journal-master',
    name: 'Journal Master',
    description: 'Journal 21 days in a row',
  },
  'first-analysis': {
    id: 'first-analysis',
    name: 'Analyst',
    description: 'Complete your first analysis',
  },
  'seeker': {
    id: 'seeker',
    name: 'The Seeker',
    description: 'Reached Seeker phase',
  },
  'warrior': {
    id: 'warrior',
    name: 'The Warrior',
    description: 'Reached Warrior phase',
  },
  'master': {
    id: 'master',
    name: 'The Master',
    description: 'Reached Master phase',
  },
  'sage': {
    id: 'sage',
    name: 'The Sage',
    description: 'Reached Sage phase',
  },
};

// ===== State Interface =====

export interface GamificationState {
  // Core Stats
  xp: number;
  phase: JourneyPhase;
  streaks: Streaks;
  badges: string[]; // Badge IDs

  // Metadata
  lastActivityAt: number;
  lastPhaseChangeAt: number | null;
  lastStreakCheckAt: Record<StreakType, number>; // For daily streak validation

  // Actions
  addXP: (amount: number) => void;
  incrementStreak: (type: StreakType) => void;
  resetStreak: (type: StreakType) => void;
  checkAndResetExpiredStreaks: () => void;
  addBadge: (badgeId: string) => void;
  hasBadge: (badgeId: string) => boolean;
  getBadgeDetails: (badgeId: string) => Badge | undefined;
  getAllBadgeDetails: () => Badge[];
  computePhase: () => JourneyPhase;
  reset: () => void;
}

// ===== Initial State =====

const initialState = {
  xp: 0,
  phase: 'DEGEN' as JourneyPhase,
  streaks: {
    journal: 0,
    oracle: 0,
    analysis: 0,
  },
  badges: [],
  lastActivityAt: Date.now(),
  lastPhaseChangeAt: null,
  lastStreakCheckAt: {
    journal: 0,
    oracle: 0,
    analysis: 0,
  },
};

// ===== Helper Functions =====

/**
 * Compute journey phase based on XP
 */
function computePhaseFromXP(xp: number): JourneyPhase {
  if (xp >= PHASE_THRESHOLDS.SAGE) return 'SAGE';
  if (xp >= PHASE_THRESHOLDS.MASTER) return 'MASTER';
  if (xp >= PHASE_THRESHOLDS.WARRIOR) return 'WARRIOR';
  if (xp >= PHASE_THRESHOLDS.SEEKER) return 'SEEKER';
  return 'DEGEN';
}

/**
 * Check if streak should be reset (more than 48h since last activity)
 */
function shouldResetStreak(lastCheckAt: number): boolean {
  const now = Date.now();
  const hoursSinceLastCheck = (now - lastCheckAt) / (1000 * 60 * 60);
  return hoursSinceLastCheck > 48;
}

// ===== Store =====

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Add XP and update phase if threshold crossed
       */
      addXP: (amount: number) => {
        set((state) => {
          const newXP = state.xp + amount;
          const newPhase = computePhaseFromXP(newXP);
          const phaseChanged = newPhase !== state.phase;

          // Unlock phase badge if changed
          if (phaseChanged) {
            const phaseBadgeId = newPhase.toLowerCase();
            if (BADGE_DEFINITIONS[phaseBadgeId] && !state.badges.includes(phaseBadgeId)) {
              return {
                xp: newXP,
                phase: newPhase,
                lastActivityAt: Date.now(),
                lastPhaseChangeAt: Date.now(),
                badges: [...state.badges, phaseBadgeId],
              };
            }
          }

          return {
            xp: newXP,
            phase: newPhase,
            lastActivityAt: Date.now(),
            lastPhaseChangeAt: phaseChanged ? Date.now() : state.lastPhaseChangeAt,
          };
        });
      },

      /**
       * Increment streak for a specific type
       */
      incrementStreak: (type: StreakType) => {
        set((state) => {
          const now = Date.now();
          const lastCheck = state.lastStreakCheckAt[type];

          // Check if we should reset first (more than 48h)
          if (shouldResetStreak(lastCheck)) {
            return {
              streaks: {
                ...state.streaks,
                [type]: 1, // Reset to 1 (current activity)
              },
              lastStreakCheckAt: {
                ...state.lastStreakCheckAt,
                [type]: now,
              },
              lastActivityAt: now,
            };
          }

          // Increment streak
          const newStreak = state.streaks[type] + 1;

          return {
            streaks: {
              ...state.streaks,
              [type]: newStreak,
            },
            lastStreakCheckAt: {
              ...state.lastStreakCheckAt,
              [type]: now,
            },
            lastActivityAt: now,
          };
        });
      },

      /**
       * Reset streak for a specific type
       */
      resetStreak: (type: StreakType) => {
        set((state) => ({
          streaks: {
            ...state.streaks,
            [type]: 0,
          },
          lastStreakCheckAt: {
            ...state.lastStreakCheckAt,
            [type]: 0,
          },
        }));
      },

      /**
       * Check and reset any expired streaks (call on app mount)
       */
      checkAndResetExpiredStreaks: () => {
        set((state) => {
          const now = Date.now();
          const updatedStreaks = { ...state.streaks };
          const updatedCheckAt = { ...state.lastStreakCheckAt };

          (Object.keys(state.streaks) as StreakType[]).forEach((type) => {
            if (shouldResetStreak(state.lastStreakCheckAt[type])) {
              updatedStreaks[type] = 0;
              updatedCheckAt[type] = now;
            }
          });

          return {
            streaks: updatedStreaks,
            lastStreakCheckAt: updatedCheckAt,
          };
        });
      },

      /**
       * Add a badge
       */
      addBadge: (badgeId: string) => {
        set((state) => {
          if (state.badges.includes(badgeId)) {
            return state; // Already unlocked
          }

          return {
            badges: [...state.badges, badgeId],
            lastActivityAt: Date.now(),
          };
        });
      },

      /**
       * Check if user has a badge
       */
      hasBadge: (badgeId: string) => {
        return get().badges.includes(badgeId);
      },

      /**
       * Get badge details with unlock timestamp
       */
      getBadgeDetails: (badgeId: string) => {
        const { badges } = get();
        const definition = BADGE_DEFINITIONS[badgeId];

        if (!definition || !badges.includes(badgeId)) {
          return undefined;
        }

        // In a real implementation, we'd store unlock timestamps
        // For now, use lastActivityAt as approximation
        return {
          ...definition,
          unlockedAt: get().lastActivityAt,
        };
      },

      /**
       * Get all unlocked badge details
       */
      getAllBadgeDetails: () => {
        const { badges, lastActivityAt } = get();
        return badges
          .map((badgeId) => {
            const definition = BADGE_DEFINITIONS[badgeId];
            if (!definition) return null;
            return {
              ...definition,
              unlockedAt: lastActivityAt,
            };
          })
          .filter((badge): badge is Badge => badge !== null);
      },

      /**
       * Compute current phase based on XP
       */
      computePhase: () => {
        return computePhaseFromXP(get().xp);
      },

      /**
       * Reset gamification state (use with caution)
       */
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'sparkfined-gamification', // localStorage key
      version: 1,
    }
  )
);

// ===== Selectors =====

/**
 * Get XP progress to next phase
 */
export const selectXPProgress = (state: GamificationState): { 
  current: number; 
  needed: number; 
  percentage: number;
  nextPhase: JourneyPhase | null;
} => {
  const phases: JourneyPhase[] = ['DEGEN', 'SEEKER', 'WARRIOR', 'MASTER', 'SAGE'];
  const currentIndex = phases.indexOf(state.phase);
  
  if (currentIndex === phases.length - 1) {
    // Already at max phase
    return {
      current: state.xp,
      needed: PHASE_THRESHOLDS.SAGE,
      percentage: 100,
      nextPhase: null,
    };
  }

  const nextPhase = phases[currentIndex + 1];
  if (!nextPhase) {
    return {
      current: 0,
      needed: 0,
      percentage: 100,
      nextPhase: null,
    };
  }
  
  const currentThreshold = PHASE_THRESHOLDS[state.phase];
  const nextThreshold = PHASE_THRESHOLDS[nextPhase];
  const progressInPhase = state.xp - currentThreshold;
  const xpNeededForNext = nextThreshold - currentThreshold;
  const percentage = Math.min(100, (progressInPhase / xpNeededForNext) * 100);

  return {
    current: progressInPhase,
    needed: xpNeededForNext,
    percentage,
    nextPhase: nextPhase ?? null,
  };
};

/**
 * Get total streak count
 */
export const selectTotalStreakDays = (state: GamificationState): number => {
  return state.streaks.journal + state.streaks.oracle + state.streaks.analysis;
};

/**
 * Get longest streak
 */
export const selectLongestStreak = (state: GamificationState): {
  type: StreakType;
  days: number;
} => {
  const streaks = state.streaks;
  const entries = Object.entries(streaks) as [StreakType, number][];
  const longest = entries.reduce((max, [type, days]) => 
    days > max.days ? { type, days } : max,
    { type: 'journal' as StreakType, days: 0 }
  );
  return longest;
};
