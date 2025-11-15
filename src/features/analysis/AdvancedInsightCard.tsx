/**
 * Advanced Insight Card
 * Tab-based UI for market structure, flow/volume, playbook analysis
 * 
 * Beta v0.9: Core UI with token-lock overlay and user overrides
 */

import React, { useEffect, useState } from 'react';
import {
  useAdvancedInsightStore,
  useAdvancedInsightData,
  useAdvancedInsightAccess,
  useAdvancedInsightTab,
  useAdvancedInsightOverrides,
} from './advancedInsightStore';
import { useAdvancedInsightTelemetry } from './advancedInsightTelemetry';
import type {
  RangeStructure,
  KeyLevel,
  PriceZone,
  BiasReading,
  FlowVolumeSnapshot,
  MacroTag,
  EditableField,
} from '@/types/ai';

// ============================================================================
// Types
// ============================================================================

type TabId = 'market_structure' | 'flow_volume' | 'playbook' | 'macro';

interface Tab {
  id: TabId;
  label: string;
  hidden?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export default function AdvancedInsightCard() {
  const sections = useAdvancedInsightData();
  const { access, isLocked } = useAdvancedInsightAccess();
  const { activeTab, setActiveTab } = useAdvancedInsightTab();
  const { overridesCount, resetAllOverrides } = useAdvancedInsightOverrides();
  const telemetry = useAdvancedInsightTelemetry();
  const sourcePayload = useAdvancedInsightStore((state) => state.sourcePayload);

  const [previousTab, setPreviousTab] = useState<TabId>(activeTab);

  // Track opened event on mount
  useEffect(() => {
    if (sections) {
      const ticker = sourcePayload?.meta?.ticker;
      const timeframe = sourcePayload?.meta?.timeframe;
      telemetry.trackOpened(ticker, timeframe, true, isLocked);
    }
  }, [sections, isLocked, sourcePayload]);

  // Track tab switches
  const handleTabChange = (newTab: TabId) => {
    if (newTab !== activeTab) {
      telemetry.trackTabSwitched(activeTab, newTab);
      setPreviousTab(activeTab);
      setActiveTab(newTab);
    }
  };

  // Handle reset all
  const handleResetAll = () => {
    if (confirm('Reset all overrides to system-generated values?')) {
      resetAllOverrides();
      telemetry.trackResetAll();
    }
  };

  if (!sections) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="text-sm text-zinc-400">
          No Advanced Insight data available. Run analysis to generate.
        </div>
      </div>
    );
  }

  const tabs: Tab[] = [
    { id: 'market_structure', label: 'Market Structure' },
    { id: 'flow_volume', label: 'Flow/Volume' },
    { id: 'playbook', label: 'Playbook' },
    { id: 'macro', label: 'Macro', hidden: true }, // Beta: hidden
  ];

  return (
    <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      {/* Token Lock Overlay */}
      {isLocked && (
        <TokenLockOverlay
          access={access}
          onUnlockClick={() => {
            telemetry.trackUnlockClicked(access?.tier || 'unknown');
          }}
        />
      )}

      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-zinc-200">
              Advanced Insight
            </h3>
            {overridesCount > 0 && (
              <span className="rounded bg-emerald-900/30 px-2 py-0.5 text-xs text-emerald-300">
                {overridesCount} override{overridesCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {overridesCount > 0 && (
            <button
              onClick={handleResetAll}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 px-4">
        <div className="flex gap-1">
          {tabs
            .filter((tab) => !tab.hidden)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  px-3 py-2 text-xs font-medium transition-colors
                  border-b-2 -mb-px
                  ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-300'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'market_structure' && (
          <MarketStructureTab data={sections.market_structure} />
        )}
        {activeTab === 'flow_volume' && (
          <FlowVolumeTab data={sections.flow_volume} />
        )}
        {activeTab === 'playbook' && (
          <PlaybookTab data={sections.playbook} />
        )}
        {activeTab === 'macro' && (
          <MacroTab data={sections.macro} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Token Lock Overlay
// ============================================================================

interface TokenLockOverlayProps {
  access: any;
  onUnlockClick: () => void;
}

function TokenLockOverlay({ access, onUnlockClick }: TokenLockOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 p-6 text-center">
        <div className="mb-3 text-3xl">🔒</div>
        <h4 className="mb-2 text-sm font-medium text-zinc-200">
          Advanced Insight Locked
        </h4>
        <p className="mb-4 text-xs text-zinc-400">
          {access?.reason || 'This feature requires NFT-based access.'}
        </p>
        <a
          href="/access"
          onClick={onUnlockClick}
          className="inline-block rounded bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Unlock Access
        </a>
      </div>
    </div>
  );
}

// ============================================================================
// Tab Components
// ============================================================================

interface MarketStructureTabProps {
  data: {
    range: EditableField<RangeStructure>;
    key_levels: EditableField<KeyLevel[]>;
    zones: EditableField<PriceZone[]>;
    bias: EditableField<BiasReading>;
  };
}

function MarketStructureTab({ data }: MarketStructureTabProps) {
  const { overrideField, resetField } = useAdvancedInsightOverrides();
  const telemetry = useAdvancedInsightTelemetry();

  return (
    <div className="space-y-4">
      {/* Range */}
      <FieldGroup
        label="Range Structure"
        field={data.range}
        onEdit={(newValue) => {
          overrideField('market_structure', 'range', newValue);
          telemetry.trackFieldOverridden('market_structure', 'range', data.range.is_overridden);
        }}
        onReset={() => {
          resetField('market_structure', 'range');
          telemetry.trackReset('market_structure', 'range');
        }}
        renderValue={(range) => (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-zinc-500">Low:</span>{' '}
              <span className="text-zinc-200">${range.low.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-zinc-500">Mid:</span>{' '}
              <span className="text-zinc-200">${range.mid.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-zinc-500">High:</span>{' '}
              <span className="text-zinc-200">${range.high.toFixed(4)}</span>
            </div>
          </div>
        )}
      />

      {/* Bias */}
      <FieldGroup
        label="Bias"
        field={data.bias}
        onEdit={(newValue) => {
          overrideField('market_structure', 'bias', newValue);
          telemetry.trackFieldOverridden('market_structure', 'bias', data.bias.is_overridden);
        }}
        onReset={() => {
          resetField('market_structure', 'bias');
          telemetry.trackReset('market_structure', 'bias');
        }}
        renderValue={(bias) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                  bias.bias === 'bullish'
                    ? 'bg-emerald-900/30 text-emerald-300'
                    : bias.bias === 'bearish'
                    ? 'bg-rose-900/30 text-rose-300'
                    : 'bg-zinc-700/30 text-zinc-300'
                }`}
              >
                {bias.bias.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-zinc-400">{bias.reason}</p>
          </div>
        )}
      />

      {/* Key Levels */}
      <FieldGroup
        label="Key Levels"
        field={data.key_levels}
        onEdit={(newValue) => {
          overrideField('market_structure', 'key_levels', newValue);
          telemetry.trackFieldOverridden('market_structure', 'key_levels', data.key_levels.is_overridden);
        }}
        onReset={() => {
          resetField('market_structure', 'key_levels');
          telemetry.trackReset('market_structure', 'key_levels');
        }}
        renderValue={(levels) => (
          <div className="space-y-1">
            {levels.map((level, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  {level.type.join(', ')} {level.label ? `(${level.label})` : ''}
                </span>
                <span className="text-zinc-200">${level.price.toFixed(4)}</span>
              </div>
            ))}
          </div>
        )}
      />

      {/* Zones */}
      <FieldGroup
        label="Price Zones"
        field={data.zones}
        onEdit={(newValue) => {
          overrideField('market_structure', 'zones', newValue);
          telemetry.trackFieldOverridden('market_structure', 'zones', data.zones.is_overridden);
        }}
        onReset={() => {
          resetField('market_structure', 'zones');
          telemetry.trackReset('market_structure', 'zones');
        }}
        renderValue={(zones) => (
          <div className="space-y-1">
            {zones.map((zone, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 capitalize">{zone.label.replace(/_/g, ' ')}</span>
                <span className="text-zinc-200">
                  ${zone.from.toFixed(4)} - ${zone.to.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
}

// ============================================================================

interface FlowVolumeTabProps {
  data: {
    flow: EditableField<FlowVolumeSnapshot>;
  };
}

function FlowVolumeTab({ data }: FlowVolumeTabProps) {
  const { overrideField, resetField } = useAdvancedInsightOverrides();
  const telemetry = useAdvancedInsightTelemetry();

  return (
    <div className="space-y-4">
      <FieldGroup
        label="24h Volume"
        field={data.flow}
        onEdit={(newValue) => {
          overrideField('flow_volume', 'flow', newValue);
          telemetry.trackFieldOverridden('flow_volume', 'flow', data.flow.is_overridden);
        }}
        onReset={() => {
          resetField('flow_volume', 'flow');
          telemetry.trackReset('flow_volume', 'flow');
        }}
        renderValue={(flow) => (
          <div className="space-y-2 text-xs">
            {flow.vol_24h_usd && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Volume (USD):</span>
                <span className="text-zinc-200">
                  ${flow.vol_24h_usd.toLocaleString()}
                </span>
              </div>
            )}
            {flow.vol_24h_delta_pct !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">24h Change:</span>
                <span
                  className={
                    flow.vol_24h_delta_pct > 0 ? 'text-emerald-300' : 'text-rose-300'
                  }
                >
                  {flow.vol_24h_delta_pct > 0 ? '+' : ''}
                  {flow.vol_24h_delta_pct.toFixed(2)}%
                </span>
              </div>
            )}
            {flow.source && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Source:</span>
                <span className="text-zinc-500 text-[10px]">{flow.source}</span>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}

// ============================================================================

interface PlaybookTabProps {
  data: {
    entries: EditableField<string[]>;
  };
}

function PlaybookTab({ data }: PlaybookTabProps) {
  const { overrideField, resetField } = useAdvancedInsightOverrides();
  const telemetry = useAdvancedInsightTelemetry();

  return (
    <div className="space-y-4">
      <FieldGroup
        label="Tactical Entries"
        field={data.entries}
        onEdit={(newValue) => {
          overrideField('playbook', 'entries', newValue);
          telemetry.trackFieldOverridden('playbook', 'entries', data.entries.is_overridden);
        }}
        onReset={() => {
          resetField('playbook', 'entries');
          telemetry.trackReset('playbook', 'entries');
        }}
        renderValue={(entries) => (
          <div className="space-y-2">
            {entries.length === 0 ? (
              <div className="text-xs text-zinc-500">No playbook entries</div>
            ) : (
              entries.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded border border-zinc-800 bg-zinc-900/60 p-2"
                >
                  <span className="text-xs text-zinc-500">{i + 1}.</span>
                  <span className="text-xs text-zinc-300">{entry}</span>
                </div>
              ))
            )}
          </div>
        )}
      />
    </div>
  );
}

// ============================================================================

interface MacroTabProps {
  data: {
    tags: EditableField<MacroTag[]>;
  };
}

function MacroTab({ data }: MacroTabProps) {
  const { overrideField, resetField } = useAdvancedInsightOverrides();
  const telemetry = useAdvancedInsightTelemetry();

  return (
    <div className="space-y-4">
      <FieldGroup
        label="Macro Tags"
        field={data.tags}
        onEdit={(newValue) => {
          overrideField('macro', 'tags', newValue);
          telemetry.trackFieldOverridden('macro', 'tags', data.tags.is_overridden);
        }}
        onReset={() => {
          resetField('macro', 'tags');
          telemetry.trackReset('macro', 'tags');
        }}
        renderValue={(tags) => (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}
      />
    </div>
  );
}

// ============================================================================
// Field Group Component
// ============================================================================

interface FieldGroupProps<T> {
  label: string;
  field: EditableField<T>;
  onEdit: (value: T) => void;
  onReset: () => void;
  renderValue: (value: T) => React.ReactNode;
}

function FieldGroup<T>({
  label,
  field,
  onEdit,
  onReset,
  renderValue,
}: FieldGroupProps<T>) {
  const value = field.is_overridden && field.user_value !== undefined
    ? field.user_value
    : field.auto_value;

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-300">{label}</span>
          {field.is_overridden && (
            <span className="rounded bg-amber-900/30 px-1.5 py-0.5 text-[10px] text-amber-300">
              Edited
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Edit button - simplified for Beta, opens inline edit in future */}
          <button
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Edit (inline edit coming soon)"
          >
            ✏️
          </button>
          {field.is_overridden && (
            <button
              onClick={onReset}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Reset to auto value"
            >
              ↺
            </button>
          )}
        </div>
      </div>
      <div>{renderValue(value)}</div>
    </div>
  );
}
