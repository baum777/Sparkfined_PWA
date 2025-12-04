import { beforeEach, describe, expect, it } from 'vitest';
import { useGamificationStore } from '@/store/gamificationStore';

function resetGamificationStore() {
  localStorage.removeItem('sparkfined-gamification');
  useGamificationStore.setState({
    xp: 0,
    phase: 'DEGEN',
    streaks: { journal: 0, oracle: 0, analysis: 0 },
    badges: [],
  });
}

describe('gamificationStore', () => {
  beforeEach(() => {
    resetGamificationStore();
  });

  it('increments XP and updates journey phase thresholds', () => {
    const { addXP } = useGamificationStore.getState();
    addXP(400);
    expect(useGamificationStore.getState().xp).toBe(400);
    expect(useGamificationStore.getState().phase).toBe('DEGEN');

    addXP(200);
    expect(useGamificationStore.getState().phase).toBe('SEEKER');
  });

  it('tracks oracle streaks and unlocks badges', () => {
    const store = useGamificationStore.getState();
    for (let i = 0; i < 7; i += 1) {
      store.incrementOracleStreak();
    }
    expect(useGamificationStore.getState().streaks.oracle).toBe(7);
    expect(useGamificationStore.getState().badges).toContain('oracle-week');

    for (let i = 0; i < 14; i += 1) {
      store.incrementOracleStreak();
    }
    expect(useGamificationStore.getState().streaks.oracle).toBe(21);
    expect(useGamificationStore.getState().badges).toContain('oracle-master');
  });

  it('addBadge ignores duplicates', () => {
    const { addBadge } = useGamificationStore.getState();
    addBadge('oracle-week');
    addBadge('oracle-week');
    expect(useGamificationStore.getState().badges).toEqual(['oracle-week']);
  });
});
