import React from 'react';
import AnalysisLayout from '@/components/analysis/AnalysisLayout';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'flow', label: 'Flow' },
  { id: 'playbook', label: 'Playbook' },
] as const;

type AnalysisTabId = (typeof tabs)[number]['id'];

const panelCopy: Record<AnalysisTabId, { heading: string; description: string; placeholder: string }> = {
  overview: {
    heading: 'Overview panel',
    description: 'Future home for the Advanced Insight summary, AI copilots, and market snapshots.',
    placeholder: 'Overview panel (e.g. Advanced Insight summary)',
  },
  flow: {
    heading: 'Flow panel',
    description: 'Reserved for orderflow, volume heatmaps, and liquidity cues.',
    placeholder: 'Flow panel (e.g. orderflow / volume)',
  },
  playbook: {
    heading: 'Playbook panel',
    description: 'Area for saved trading rules, automation scripts, and playbook notes.',
    placeholder: 'Playbook panel (e.g. saved trading rules)',
  },
};

export default function AnalysisPageV2() {
  const [activeTab, setActiveTab] = React.useState<AnalysisTabId>(tabs[0]?.id ?? 'overview');
  const activePanel = panelCopy[activeTab];

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AnalysisLayout
          title="Analysis"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as AnalysisTabId)}
        >
          <div className="space-y-4 text-sm text-zinc-400">
            <h2 className="text-xl font-semibold text-white">{activePanel.heading}</h2>
            <p>{activePanel.description}</p>
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs uppercase tracking-wide text-zinc-500">
              {activePanel.placeholder}
            </div>
          </div>
        </AnalysisLayout>
      </div>
    </div>
  );
}
