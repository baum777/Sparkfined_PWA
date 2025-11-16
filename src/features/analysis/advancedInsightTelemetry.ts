/**
 * Advanced Insight Telemetry
 * Structured event tracking for Advanced Insight feature
 * 
 * Beta v0.9: Integrates with existing TelemetryService and useEventLogger
 */

import { Telemetry } from '@/lib/TelemetryService';
import { useTelemetry } from '@/state/telemetry';

// ============================================================================
// Event Types
// ============================================================================

export const AdvancedInsightEvents = {
  OPENED: 'ui.advanced_insight.opened',
  TAB_SWITCHED: 'ui.advanced_insight.tab_switched',
  FIELD_OVERRIDDEN: 'ui.advanced_insight.field_overridden',
  SAVED: 'ui.advanced_insight.saved',
  RESET: 'ui.advanced_insight.reset',
  RESET_ALL: 'ui.advanced_insight.reset_all',
  UNLOCK_CLICKED: 'ui.advanced_insight.unlock_clicked',
} as const;

export type AdvancedInsightEventName = typeof AdvancedInsightEvents[keyof typeof AdvancedInsightEvents];

// ============================================================================
// Event Payloads
// ============================================================================

type TelemetryPayload = Record<string, unknown>;

export interface AdvancedInsightOpenedPayload extends TelemetryPayload {
  ticker?: string;
  timeframe?: string;
  has_data: boolean;
  is_locked: boolean;
}

export interface AdvancedInsightTabSwitchedPayload extends TelemetryPayload {
  from_tab: string;
  to_tab: string;
}

export interface AdvancedInsightFieldOverriddenPayload extends TelemetryPayload {
  section: string;
  field_name: string;
  had_previous_override: boolean;
}

export interface AdvancedInsightSavedPayload extends TelemetryPayload {
  overrides_count: number;
  sections_modified: string[];
}

export interface AdvancedInsightResetPayload extends TelemetryPayload {
  section: string;
  field_name: string;
}

export interface AdvancedInsightUnlockClickedPayload extends TelemetryPayload {
  current_tier: string;
}

// ============================================================================
// Telemetry Functions
// ============================================================================

/**
 * Track Advanced Insight opened event
 */
export function trackAdvancedInsightOpened(
  ticker?: string,
  timeframe?: string,
  hasData: boolean = false,
  isLocked: boolean = false
): void {
  const payload: AdvancedInsightOpenedPayload = {
    ticker,
    timeframe,
    has_data: hasData,
    is_locked: isLocked,
  };

  // Log to TelemetryService (performance metrics)
  Telemetry.log(AdvancedInsightEvents.OPENED, hasData ? 1 : 0, payload);

  // Dispatch custom event for TelemetryProvider (event buffering)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('telemetry:event', {
        detail: {
          type: AdvancedInsightEvents.OPENED,
          data: payload,
        },
      })
    );
  }
}

/**
 * Track tab switch event
 */
export function trackAdvancedInsightTabSwitched(
  fromTab: string,
  toTab: string
): void {
  const payload: AdvancedInsightTabSwitchedPayload = {
    from_tab: fromTab,
    to_tab: toTab,
  };

  Telemetry.log(AdvancedInsightEvents.TAB_SWITCHED, 1, payload);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('telemetry:event', {
        detail: {
          type: AdvancedInsightEvents.TAB_SWITCHED,
          data: payload,
        },
      })
    );
  }
}

/**
 * Track field override event
 */
export function trackAdvancedInsightFieldOverridden(
  section: string,
  fieldName: string,
  hadPreviousOverride: boolean = false
): void {
  const payload: AdvancedInsightFieldOverriddenPayload = {
    section,
    field_name: fieldName,
    had_previous_override: hadPreviousOverride,
  };

  Telemetry.log(AdvancedInsightEvents.FIELD_OVERRIDDEN, 1, payload);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('telemetry:event', {
        detail: {
          type: AdvancedInsightEvents.FIELD_OVERRIDDEN,
          data: payload,
        },
      })
    );
  }
}

/**
 * Track save event
 */
export function trackAdvancedInsightSaved(
  overridesCount: number,
  sectionsModified: string[]
): void {
  const payload: AdvancedInsightSavedPayload = {
    overrides_count: overridesCount,
    sections_modified: sectionsModified,
  };

  Telemetry.log(AdvancedInsightEvents.SAVED, overridesCount, payload);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('telemetry:event', {
        detail: {
          type: AdvancedInsightEvents.SAVED,
          data: payload,
        },
      })
    );
  }
}

/**
 * Track field reset event
 */
export function trackAdvancedInsightReset(
  section: string,
  fieldName: string
): void {
  const payload: AdvancedInsightResetPayload = {
    section,
    field_name: fieldName,
  };

  Telemetry.log(AdvancedInsightEvents.RESET, 1, payload);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('telemetry:event', {
        detail: {
          type: AdvancedInsightEvents.RESET,
          data: payload,
        },
      })
    );
  }
}

/**
 * Track reset all event
 */
export function trackAdvancedInsightResetAll(): void {
  Telemetry.log(AdvancedInsightEvents.RESET_ALL, 1);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('telemetry:event', {
        detail: {
          type: AdvancedInsightEvents.RESET_ALL,
          data: {},
        },
      })
    );
  }
}

/**
 * Track unlock CTA clicked
 */
export function trackAdvancedInsightUnlockClicked(currentTier: string): void {
  const payload: AdvancedInsightUnlockClickedPayload = {
    current_tier: currentTier,
  };

  Telemetry.log(AdvancedInsightEvents.UNLOCK_CLICKED, 1, payload);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('telemetry:event', {
        detail: {
          type: AdvancedInsightEvents.UNLOCK_CLICKED,
          data: payload,
        },
      })
    );
  }
}

// ============================================================================
// React Hook for Telemetry
// ============================================================================

/**
 * Hook for tracking Advanced Insight events with React context
 */
export function useAdvancedInsightTelemetry() {
  const telemetry = useTelemetry();

  return {
    trackOpened: (ticker?: string, timeframe?: string, hasData?: boolean, isLocked?: boolean) => {
      trackAdvancedInsightOpened(ticker, timeframe, hasData, isLocked);
      
      // Also enqueue via TelemetryProvider
      telemetry.enqueue({
        id: crypto.randomUUID(),
        ts: Date.now(),
        type: AdvancedInsightEvents.OPENED,
        attrs: { ticker, timeframe, has_data: hasData, is_locked: isLocked },
      });
    },

    trackTabSwitched: (fromTab: string, toTab: string) => {
      trackAdvancedInsightTabSwitched(fromTab, toTab);
      
      telemetry.enqueue({
        id: crypto.randomUUID(),
        ts: Date.now(),
        type: AdvancedInsightEvents.TAB_SWITCHED,
        attrs: { from_tab: fromTab, to_tab: toTab },
      });
    },

    trackFieldOverridden: (section: string, fieldName: string, hadPreviousOverride?: boolean) => {
      trackAdvancedInsightFieldOverridden(section, fieldName, hadPreviousOverride);
      
      telemetry.enqueue({
        id: crypto.randomUUID(),
        ts: Date.now(),
        type: AdvancedInsightEvents.FIELD_OVERRIDDEN,
        attrs: { section, field_name: fieldName, had_previous_override: hadPreviousOverride },
      });
    },

    trackSaved: (overridesCount: number, sectionsModified: string[]) => {
      trackAdvancedInsightSaved(overridesCount, sectionsModified);
      
      telemetry.enqueue({
        id: crypto.randomUUID(),
        ts: Date.now(),
        type: AdvancedInsightEvents.SAVED,
        attrs: { overrides_count: overridesCount, sections_modified: sectionsModified },
      });
    },

    trackReset: (section: string, fieldName: string) => {
      trackAdvancedInsightReset(section, fieldName);
      
      telemetry.enqueue({
        id: crypto.randomUUID(),
        ts: Date.now(),
        type: AdvancedInsightEvents.RESET,
        attrs: { section, field_name: fieldName },
      });
    },

    trackResetAll: () => {
      trackAdvancedInsightResetAll();
      
      telemetry.enqueue({
        id: crypto.randomUUID(),
        ts: Date.now(),
        type: AdvancedInsightEvents.RESET_ALL,
      });
    },

    trackUnlockClicked: (currentTier: string) => {
      trackAdvancedInsightUnlockClicked(currentTier);
      
      telemetry.enqueue({
        id: crypto.randomUUID(),
        ts: Date.now(),
        type: AdvancedInsightEvents.UNLOCK_CLICKED,
        attrs: { current_tier: currentTier },
      });
    },
  };
}
