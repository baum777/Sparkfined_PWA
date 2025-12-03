import { beforeEach, describe, expect, it } from 'vitest';

import { useAdvancedInsightStore } from '../advancedInsightStore';
import {
  generateMockAdvancedInsight,
} from '../mockAdvancedInsightData';

const storeWithPersist = useAdvancedInsightStore as typeof useAdvancedInsightStore & {
  persist?: {
    clearStorage: () => void;
  };
};

function resetStore() {
  storeWithPersist.persist?.clearStorage?.();
  window.localStorage?.clear();
  useAdvancedInsightStore.getState().clear();
}

describe('advancedInsightStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('ingests mock data correctly', () => {
    const mockData = generateMockAdvancedInsight('SOL', 50);

    useAdvancedInsightStore.getState().ingest(mockData);

    const state = useAdvancedInsightStore.getState();
    expect(state.sections?.market_structure.range.auto_value.low).toBeDefined();
    expect(state.overridesCount).toBe(0);
  });

  it('overrideField stores user value and increments overridesCount', () => {
    const mockData = generateMockAdvancedInsight();
    useAdvancedInsightStore.getState().ingest(mockData);

    const currentRange = mockData.sections.market_structure.range.auto_value;
    const nextRange = { ...currentRange, low: currentRange.low - 1 };

    useAdvancedInsightStore.getState().overrideField('market_structure', 'range', nextRange);

    const state = useAdvancedInsightStore.getState();
    expect(state.sections?.market_structure.range.user_value).toEqual(nextRange);
    expect(state.sections?.market_structure.range.is_overridden).toBe(true);
    expect(state.overridesCount).toBe(1);
  });

  it('resetField clears the override and decrements count', () => {
    const mockData = generateMockAdvancedInsight();
    useAdvancedInsightStore.getState().ingest(mockData);

    const currentRange = mockData.sections.market_structure.range.auto_value;
    const nextRange = { ...currentRange, high: currentRange.high + 5 };
    useAdvancedInsightStore.getState().overrideField('market_structure', 'range', nextRange);
    expect(useAdvancedInsightStore.getState().overridesCount).toBe(1);

    useAdvancedInsightStore.getState().resetField('market_structure', 'range');

    const state = useAdvancedInsightStore.getState();
    expect(state.sections?.market_structure.range.user_value).toBeUndefined();
    expect(state.sections?.market_structure.range.is_overridden).toBe(false);
    expect(state.overridesCount).toBe(0);
  });

  it('resetAllOverrides clears every override and resets count to zero', () => {
    const mockData = generateMockAdvancedInsight();
    useAdvancedInsightStore.getState().ingest(mockData);

    const store = useAdvancedInsightStore.getState();
    store.overrideField('market_structure', 'range', {
      ...mockData.sections.market_structure.range.auto_value,
      low: 1,
    });
    store.overrideField('playbook', 'entries', ['test override']);
    expect(useAdvancedInsightStore.getState().overridesCount).toBe(2);

    useAdvancedInsightStore.getState().resetAllOverrides();

    const state = useAdvancedInsightStore.getState();
    expect(state.overridesCount).toBe(0);
    expect(state.sections?.market_structure.range.is_overridden).toBe(false);
    expect(state.sections?.playbook.entries.is_overridden).toBe(false);
  });
});
