import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GamificationStreaks, JourneyPhase } from '@/types/oracle';

interface GamificationState {
  xp: number;
  phase: JourneyPhase;
  streaks: GamificationStreaks;
  badges: string[];
  addXP: (amount: number) => void;
  incrementOracleStreak: () => void;
  resetOracleStreak: () => void;
  addBadge: (badgeId: string) => void;
}

const PHASE_THRESHOLDS: Record<JourneyPhase, number> = {
  DEGEN: 0,
  SEEKER: 500,
  WARRIOR: 2000,
  MASTER: 5000,
  SAGE: 10000,
};

const ORACLE_WEEK_BADGE = 'oracle-week';
const ORACLE_MASTER_BADGE = 'oracle-master';

const DEFAULT_STREAKS: GamificationStreaks = {
  journal: 0,
  oracle: 0,
  analysis: 0,
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      phase: 'DEGEN',
      streaks: { ...DEFAULT_STREAKS },
      badges: [],

      addXP: (amount) => {
        if (amount <= 0) {
          return;
        }
        set((state) => {
          const nextXP = state.xp + amount;
          return {
            xp: nextXP,
            phase: computePhaseFromXP(nextXP),
          };
        });
      },

      incrementOracleStreak: () => {
        set((state) => {
          const nextOracleStreak = state.streaks.oracle + 1;
          const updatedStreaks: GamificationStreaks = {
            ...state.streaks,
            oracle: nextOracleStreak,
          };

          const updatedBadges = new Set(state.badges);
          if (nextOracleStreak >= 7) {
            updatedBadges.add(ORACLE_WEEK_BADGE);
          }
          if (nextOracleStreak >= 21) {
            updatedBadges.add(ORACLE_MASTER_BADGE);
          }

          return {
            streaks: updatedStreaks,
            badges: Array.from(updatedBadges),
          };
        });
      },

      resetOracleStreak: () => {
        set((state) => ({
          streaks: {
            ...state.streaks,
            oracle: 0,
          },
        }));
      },

      addBadge: (badgeId) => {
        if (!badgeId) {
          return;
        }
        set((state) => {
          if (state.badges.includes(badgeId)) {
            return state;
          }
          return {
            badges: [...state.badges, badgeId],
          };
        });
      },
    }),
    {
      name: 'sparkfined-gamification',
      partialize: (state) => ({
        xp: state.xp,
        phase: state.phase,
        streaks: state.streaks,
        badges: state.badges,
      }),
    }
  )
);

function computePhaseFromXP(xp: number): JourneyPhase {
  if (xp >= PHASE_THRESHOLDS.SAGE) return 'SAGE';
  if (xp >= PHASE_THRESHOLDS.MASTER) return 'MASTER';
  if (xp >= PHASE_THRESHOLDS.WARRIOR) return 'WARRIOR';
  if (xp >= PHASE_THRESHOLDS.SEEKER) return 'SEEKER';
  return 'DEGEN';
}
