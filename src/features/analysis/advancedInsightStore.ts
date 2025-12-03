/**
 * Advanced Insight Store
 * Single source of truth for Advanced Insight state, overrides, and telemetry
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AdvancedInsightCard,
  AdvancedInsightSections,
  EditableField,
} from '@/types/ai';
import type { SolanaMemeTrendEvent } from '@/types/events';

// ============================================================================
// Store State
// ============================================================================

export interface AdvancedInsightState {
  // Core data
  sections: AdvancedInsightSections | null;
  sourcePayload: any | null; // MarketSnapshotPayload
  
  // UI state
  activeTab: 'market_structure' | 'flow_volume' | 'playbook' | 'macro';
  isEditing: boolean;
  
  // Telemetry
  overridesCount: number;
  lastSavedAt: number | null;
  trendSnapshots: Record<string, SolanaMemeTrendEvent>;
  
  // Actions
  ingest: (data: AdvancedInsightCard) => void;
  setActiveTab: (tab: AdvancedInsightState['activeTab']) => void;
  applyTrendEvent?: (event: SolanaMemeTrendEvent) => void;
  
  // Override management
  overrideField: <T>(
    section: keyof AdvancedInsightSections,
    fieldName: string,
    newValue: T
  ) => void;
  resetField: (section: keyof AdvancedInsightSections, fieldName: string) => void;
  resetAllOverrides: () => void;
  
  // Persistence
  save: () => void;
  clear: () => void;
  
  // Getters
  getOverridesCount: () => number;
}

// ============================================================================
// Helper Functions
// ============================================================================

function countOverrides(sections: AdvancedInsightSections | null): number {
  if (!sections) return 0;
  
  let count = 0;
  
  // Market Structure
  if (sections.market_structure.range.is_overridden) count++;
  if (sections.market_structure.key_levels.is_overridden) count++;
  if (sections.market_structure.zones.is_overridden) count++;
  if (sections.market_structure.bias.is_overridden) count++;
  
  // Flow/Volume
  if (sections.flow_volume.flow.is_overridden) count++;
  
  // Playbook
  if (sections.playbook.entries.is_overridden) count++;
  
  // Macro
  if (sections.macro.tags.is_overridden) count++;
  
  return count;
}

function updateEditableField<T>(
  field: EditableField<T>,
  newValue: T
): EditableField<T> {
  return {
    ...field,
    user_value: newValue,
    is_overridden: true,
  };
}

function resetEditableField<T>(field: EditableField<T>): EditableField<T> {
  return {
    ...field,
    user_value: undefined,
    is_overridden: false,
  };
}

// ============================================================================
// Store Definition
// ============================================================================

export const useAdvancedInsightStore = create<AdvancedInsightState>()(
  persist(
      (set, get) => ({
        // Initial state
        sections: null,
        sourcePayload: null,
        activeTab: 'market_structure',
        isEditing: false,
        overridesCount: 0,
        lastSavedAt: null,
        trendSnapshots: {},

      // Ingest AI data
      ingest: (data) => {
        set({
          sections: data.sections,
          sourcePayload: data.source_payload,
          overridesCount: countOverrides(data.sections),
        });
      },

      // Tab navigation
      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },

      // Override a field
      overrideField: (section, fieldName, newValue) => {
        const { sections } = get();
        if (!sections) return;

        const updatedSections = { ...sections };
        const sectionData = updatedSections[section] as any;
        
        if (sectionData && sectionData[fieldName]) {
          sectionData[fieldName] = updateEditableField(
            sectionData[fieldName],
            newValue
          );
        }

        set({
          sections: updatedSections,
          overridesCount: countOverrides(updatedSections),
        });
      },

      // Reset a field to auto value
      resetField: (section, fieldName) => {
        const { sections } = get();
        if (!sections) return;

        const updatedSections = { ...sections };
        const sectionData = updatedSections[section] as any;
        
        if (sectionData && sectionData[fieldName]) {
          sectionData[fieldName] = resetEditableField(sectionData[fieldName]);
        }

        set({
          sections: updatedSections,
          overridesCount: countOverrides(updatedSections),
        });
      },

      // Reset all overrides
      resetAllOverrides: () => {
        const { sections } = get();
        if (!sections) return;

        const resetSections: AdvancedInsightSections = {
          market_structure: {
            range: resetEditableField(sections.market_structure.range),
            key_levels: resetEditableField(sections.market_structure.key_levels),
            zones: resetEditableField(sections.market_structure.zones),
            bias: resetEditableField(sections.market_structure.bias),
          },
          flow_volume: {
            flow: resetEditableField(sections.flow_volume.flow),
          },
          playbook: {
            entries: resetEditableField(sections.playbook.entries),
          },
          macro: {
            tags: resetEditableField(sections.macro.tags),
          },
        };

        set({
          sections: resetSections,
          overridesCount: 0,
        });
      },

      // Save changes (triggers telemetry)
      save: () => {
        set({
          lastSavedAt: Date.now(),
          isEditing: false,
        });
      },

      // Clear all data
        clear: () => {
          set({
            sections: null,
            sourcePayload: null,
            activeTab: 'market_structure',
            isEditing: false,
            overridesCount: 0,
            lastSavedAt: null,
            trendSnapshots: {},
          });
        },

        // Getters
        getOverridesCount: () => {
          return get().overridesCount;
        },
      applyTrendEvent: (event) => {
        set((state) => ({
          trendSnapshots: {
            ...state.trendSnapshots,
            [event.token.symbol.toUpperCase()]: event,
          },
        }));
      },
    }),
    {
      name: 'sparkfined-advanced-insight-v1',
      partialize: (state) => ({
        // Only persist user overrides, not auto values
        sections: state.sections,
        activeTab: state.activeTab,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);

// ============================================================================
// Selector Hooks
// ============================================================================

export function useAdvancedInsightData() {
  return useAdvancedInsightStore((state) => state.sections);
}


export function useAdvancedInsightTab() {
  return useAdvancedInsightStore((state) => ({
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
  }));
}

export function useAdvancedInsightOverrides() {
  return useAdvancedInsightStore((state) => ({
    overridesCount: state.overridesCount,
    overrideField: state.overrideField,
    resetField: state.resetField,
    resetAllOverrides: state.resetAllOverrides,
  }));
}
