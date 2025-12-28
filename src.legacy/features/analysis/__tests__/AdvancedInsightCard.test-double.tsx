import { useMemo, useState } from 'react';
import type { AdvancedInsightCard as InsightPayload } from '@/types/ai';
import { generateMockAdvancedInsight } from '../mockAdvancedInsightData';

type TabId = 'market_structure' | 'flow_volume' | 'playbook';

export interface AdvancedInsightScenarioState {
  locked: boolean;
  insight: InsightPayload;
}

let scenario: AdvancedInsightScenarioState = {
  locked: false,
  insight: generateMockAdvancedInsight('SOL', 48),
};

export function __setAdvancedInsightTestScenario(partial: Partial<AdvancedInsightScenarioState>) {
  scenario = {
    ...scenario,
    ...partial,
    insight: partial.insight ?? scenario.insight,
  };
}

const tabs: { id: TabId; label: string }[] = [
  { id: 'market_structure', label: 'Market Structure' },
  { id: 'flow_volume', label: 'Flow/Volume' },
  { id: 'playbook', label: 'Playbook' },
];

export default function AdvancedInsightCardTestDouble() {
  const current = scenario;
  const [activeTab, setActiveTab] = useState<TabId>('market_structure');
  const initialEntries = useMemo(
    () => [...(current.insight.sections.playbook.entries.auto_value ?? [])],
    [current.insight.sections.playbook.entries.auto_value]
  );
  const [entries, setEntries] = useState(initialEntries);
  const [overridesCount, setOverridesCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const flow = current.insight.sections.flow_volume.flow.auto_value;
  const range = current.insight.sections.market_structure.range.auto_value;

  const handleSaveEntry = () => {
    if (!draft.trim()) return;
    setEntries((prev) => [...prev, draft.trim()]);
    setOverridesCount((count) => count + 1);
    setDraft('');
    setIsEditing(false);
  };

  return (
    <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      {current.locked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            className="max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 p-6 text-center focus:outline-none"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-3 text-3xl">🔒</div>
            <h4 className="mb-2 text-sm font-medium text-zinc-200">Advanced Insight Locked</h4>
            <p className="mb-4 text-xs text-zinc-400">
              This feature requires NFT-based access. Manual approval available.
            </p>
            <a
              href="/access"
              aria-label="Unlock advanced insight access"
              className="inline-block rounded bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Unlock Access
            </a>
          </div>
        </div>
      )}

      <div className="border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-zinc-200">Advanced Insight</h3>
            {overridesCount > 0 && (
              <span className="rounded bg-emerald-900/30 px-2 py-0.5 text-xs text-emerald-300">
                {overridesCount} override{overridesCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Edit playbook entries"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              onClick={() => {
                setActiveTab('playbook');
                setIsEditing(true);
              }}
            >
              Edit playbook entries
            </button>
            {overridesCount > 0 && (
              <button
                type="button"
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                onClick={() => {
                  setEntries(initialEntries);
                  setOverridesCount(0);
                }}
              >
                Reset All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800 px-4">
        <div className="flex gap-1" role="tablist" aria-label="Advanced Insight sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`advanced-insight-tab-${tab.id}`}
              aria-controls="advanced-insight-panel"
              tabIndex={activeTab === tab.id ? 0 : -1}
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px
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

      <div
        className="p-4 space-y-4"
        role="tabpanel"
        id="advanced-insight-panel"
        aria-labelledby={`advanced-insight-tab-${activeTab}`}
      >
        {activeTab === 'market_structure' && (
          <div className="space-y-3 text-xs text-zinc-200">
            <h4 className="text-sm font-medium">Range Structure</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-zinc-500">Low:</span> ${range.low.toFixed(4)}
              </div>
              <div>
                <span className="text-zinc-500">Mid:</span> ${range.mid.toFixed(4)}
              </div>
              <div>
                <span className="text-zinc-500">High:</span> ${range.high.toFixed(4)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flow_volume' && (
          <div className="space-y-2 text-xs text-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Volume (USD):</span>
              <span>${flow.vol_24h_usd?.toLocaleString()}</span>
            </div>
            {typeof flow.vol_24h_delta_pct === 'number' && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">24h Change:</span>
                <span>{flow.vol_24h_delta_pct.toFixed(2)}%</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'playbook' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-zinc-200">Tactical Entries</h4>
            </div>
            {overridesCount > 0 && (
              <span className="rounded bg-amber-900/30 px-1.5 py-0.5 text-[10px] text-amber-300">
                Edited
              </span>
            )}
            {isEditing ? (
              <div className="space-y-2">
                <label htmlFor="playbook-editor" className="block text-xs text-zinc-400">
                  Edit tactical playbook entries
                </label>
                <textarea
                  id="playbook-editor"
                  aria-label="Edit tactical playbook entries"
                  className="h-32 w-full rounded border border-zinc-700 bg-black/40 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-600 focus:outline-none"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEntry}
                    disabled={!draft.trim()}
                    className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white disabled:bg-emerald-900/40"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft('');
                      setIsEditing(false);
                    }}
                    className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry, index) => (
                  <div
                    key={`${entry}-${index}`}
                    className="flex items-start gap-2 rounded border border-zinc-800 bg-zinc-900/60 p-2 text-xs text-zinc-300"
                  >
                    <span className="text-zinc-500">{index + 1}.</span>
                    <span>{entry}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
