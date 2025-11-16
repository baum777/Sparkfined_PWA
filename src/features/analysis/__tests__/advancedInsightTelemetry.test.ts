import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  trackAdvancedInsightOpened,
  trackAdvancedInsightTabSwitched,
  useAdvancedInsightTelemetry,
} from '../advancedInsightTelemetry';
import { Telemetry } from '@/lib/TelemetryService';

const enqueueSpy = vi.fn();

vi.mock('@/state/telemetry', () => ({
  useTelemetry: () => ({
    flags: {},
    setFlags: vi.fn(),
    enqueue: enqueueSpy,
    drain: vi.fn(),
    buffer: [],
  }),
}));

describe('advancedInsightTelemetry', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let dispatchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    enqueueSpy.mockClear();
    logSpy = vi.spyOn(Telemetry, 'log').mockImplementation(() => undefined);
    dispatchSpy = vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    logSpy.mockRestore();
    dispatchSpy.mockRestore();
  });

  it('tracks opened events with correct payload', () => {
    trackAdvancedInsightOpened('SOL', '15m', true, false);

    expect(logSpy).toHaveBeenCalledWith(
      'ui.advanced_insight.opened',
      1,
      expect.objectContaining({
        ticker: 'SOL',
        timeframe: '15m',
        has_data: true,
        is_locked: false,
      })
    );

    const dispatchedEvent = dispatchSpy.mock.calls[0]?.[0] as CustomEvent | undefined;
    expect(dispatchedEvent?.detail).toMatchObject({
      type: 'ui.advanced_insight.opened',
      data: expect.objectContaining({ ticker: 'SOL' }),
    });
  });

  it('tracks tab switches with from/to payload', () => {
    trackAdvancedInsightTabSwitched('market_structure', 'flow_volume');

    expect(logSpy).toHaveBeenCalledWith(
      'ui.advanced_insight.tab_switched',
      1,
      {
        from_tab: 'market_structure',
        to_tab: 'flow_volume',
      }
    );
  });

  it('hook enqueues field override events', () => {
    const telemetry = useAdvancedInsightTelemetry();

    telemetry.trackFieldOverridden('market_structure', 'range', false);

    expect(logSpy).toHaveBeenCalledWith(
      'ui.advanced_insight.field_overridden',
      1,
      expect.objectContaining({
        section: 'market_structure',
        field_name: 'range',
        had_previous_override: false,
      })
    );

    expect(enqueueSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ui.advanced_insight.field_overridden',
        attrs: expect.objectContaining({
          section: 'market_structure',
          field_name: 'range',
          had_previous_override: false,
        }),
      })
    );
  });

  it('hook enqueues saved events with overrides metadata', () => {
    const telemetry = useAdvancedInsightTelemetry();

    telemetry.trackSaved(2, ['market_structure', 'playbook']);

    expect(logSpy).toHaveBeenCalledWith(
      'ui.advanced_insight.saved',
      2,
      expect.objectContaining({
        overrides_count: 2,
        sections_modified: ['market_structure', 'playbook'],
      })
    );

    expect(enqueueSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ui.advanced_insight.saved',
        attrs: expect.objectContaining({
          overrides_count: 2,
          sections_modified: ['market_structure', 'playbook'],
        }),
      })
    );
  });
});
