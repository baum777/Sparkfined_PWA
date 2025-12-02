/**
 * Advanced Insight Feature
 * Export barrel for cleaner imports
 */

// Main Component
export { default as AdvancedInsightCard } from './AdvancedInsightCard';

// Store
export {
  useAdvancedInsightStore,
  useAdvancedInsightData,
  useAdvancedInsightTab,
  useAdvancedInsightOverrides,
} from './advancedInsightStore';

export type { AdvancedInsightState } from './advancedInsightStore';

// Telemetry
export {
  useAdvancedInsightTelemetry,
  trackAdvancedInsightOpened,
  trackAdvancedInsightTabSwitched,
  trackAdvancedInsightFieldOverridden,
  trackAdvancedInsightSaved,
  trackAdvancedInsightReset,
  trackAdvancedInsightResetAll,
  AdvancedInsightEvents,
} from './advancedInsightTelemetry';

export type {
  AdvancedInsightEventName,
  AdvancedInsightOpenedPayload,
  AdvancedInsightTabSwitchedPayload,
  AdvancedInsightFieldOverriddenPayload,
  AdvancedInsightSavedPayload,
  AdvancedInsightResetPayload,
} from './advancedInsightTelemetry';

// Mock Data (for testing)
export {
  generateMockAdvancedInsight,
} from './mockAdvancedInsightData';
