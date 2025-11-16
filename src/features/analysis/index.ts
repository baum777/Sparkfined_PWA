/**
 * Advanced Insight Feature
 * Export barrel for cleaner imports
 * 
 * Beta v0.9: Core UI & Flow for Advanced Market Analysis
 */

// Main Component
export { default as AdvancedInsightCard } from './AdvancedInsightCard';

// Store
export {
  useAdvancedInsightStore,
  useAdvancedInsightData,
  useAdvancedInsightAccess,
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
  trackAdvancedInsightUnlockClicked,
  AdvancedInsightEvents,
} from './advancedInsightTelemetry';

export type {
  AdvancedInsightEventName,
  AdvancedInsightOpenedPayload,
  AdvancedInsightTabSwitchedPayload,
  AdvancedInsightFieldOverriddenPayload,
  AdvancedInsightSavedPayload,
  AdvancedInsightResetPayload,
  AdvancedInsightUnlockClickedPayload,
} from './advancedInsightTelemetry';

// Mock Data (for testing)
export {
  generateMockAdvancedInsight,
  generateMockLockedAccess,
  generateMockUnlockedAccess,
} from './mockAdvancedInsightData';
