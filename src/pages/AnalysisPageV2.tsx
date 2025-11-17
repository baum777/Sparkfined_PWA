import React from 'react';
import AnalysisLayout from '@/features/analysis/AnalysisLayout';

const tabs = [
  { id: 'market_structure', label: 'Market Structure' },
  { id: 'advanced_insight', label: 'Advanced Insight' },
  { id: 'journal_context', label: 'Journal Context' },
] as const;

type AnalysisTabId = (typeof tabs)[number]['id'];

const tabDescriptions: Record<AnalysisTabId, { title: string; description: string }> = {
  market_structure: {
    title: 'Market structure panel placeholder',
    description:
      'Slot reserved for range maps, liquidity heatmaps, and order flow overlays. Content to be implemented later.',
  },
  advanced_insight: {
    title: 'Advanced Insight panel placeholder',
    description: 'Future location for the AdvancedInsightCard and related AI copilots.',
  },
  journal_context: {
    title: 'Journal context panel placeholder',
    description: 'Planned summaries of journal tags, lessons learned, and sentiment trackers.',
  },
};

export default function AnalysisPageV2() {
  const [activeTabId, setActiveTabId] = React.useState<AnalysisTabId>(tabs[0]?.id ?? 'market_structure');
  const handleTabChange = React.useCallback(
    (tabId: string) => {
      setActiveTabId(tabId as AnalysisTabId);
    },
    [setActiveTabId]
  );

  const activePanel = tabDescriptions[activeTabId];

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AnalysisLayout
          title="Analysis"
          subtitle="Foundational layout for market structure, AI insights, and journal context."
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
        >
          <div className="space-y-4 text-sm text-zinc-400">
            <h2 className="text-xl font-semibold text-white">{activePanel.title}</h2>
            <p>{activePanel.description}</p>
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs uppercase tracking-wide text-zinc-500">
              Placeholder surface for {activePanel.title.toLowerCase()}
            </div>
          </div>
        </AnalysisLayout>
      </div>
    </div>
  );
}
