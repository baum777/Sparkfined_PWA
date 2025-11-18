import React from 'react';
import AnalysisLayout from '@/components/analysis/AnalysisLayout';
import {
  AdvancedInsightCard,
  generateMockAdvancedInsight,
  generateMockUnlockedAccess,
  useAdvancedInsightStore,
} from '@/features/analysis';
import { useSearchParams } from 'react-router-dom';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'flow', label: 'Flow' },
  { id: 'playbook', label: 'Playbook' },
] as const;

type AnalysisTabId = (typeof tabs)[number]['id'];

const overviewInsight = {
  bias: 'Bullish',
  confidence: 0.78,
  timeFrame: '4H',
  summary:
    'Momentum stays constructive above the 42.50 liquidity shelf. AI expects continuation toward the weekly supply band as long as higher lows remain intact.',
};

export default function AnalysisPageV2() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const initialTab = tabs.some((tab) => tab.id === tabFromUrl) ? (tabFromUrl as AnalysisTabId) : tabs[0].id;
  const [activeTab, setActiveTab] = React.useState<AnalysisTabId>(initialTab);
  const ingestAdvancedInsight = useAdvancedInsightStore((state) => state.ingest);
  const hasInsight = Boolean(useAdvancedInsightStore((state) => state.sections));

  React.useEffect(() => {
    if (!tabFromUrl || tabFromUrl !== activeTab) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('tab', activeTab);
      setSearchParams(nextParams, { replace: true });
    }
  }, [activeTab, tabFromUrl, searchParams, setSearchParams]);

  React.useEffect(() => {
    if (hasInsight) {
      return;
    }

    const mockInsight = generateMockAdvancedInsight('SOL', 42.8);
    ingestAdvancedInsight(mockInsight, generateMockUnlockedAccess());
  }, [hasInsight, ingestAdvancedInsight]);

  const renderTabContent = () => {
    if (activeTab === 'overview') {
      if (!hasInsight) {
        return <OverviewInsightSkeleton />;
      }

      const stats = [
        { label: 'Bias', value: overviewInsight.bias, accent: 'text-emerald-300' },
        { label: 'Confidence', value: `${Math.round(overviewInsight.confidence * 100)}%`, accent: 'text-amber-300' },
        { label: 'Timeframe', value: overviewInsight.timeFrame, accent: 'text-zinc-100' },
      ];

      return (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Current AI Insight</p>
            <h2 className="text-2xl font-semibold text-white">Bias remains {overviewInsight.bias.toLowerCase()} while liquidity builds.</h2>
            <p className="text-sm text-zinc-400 max-w-3xl">{overviewInsight.summary}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300"
                >
                  <p className="text-xs uppercase tracking-wide text-zinc-500">{stat.label}</p>
                  <p className={`mt-1 text-lg font-semibold ${stat.accent}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-4xl">
            <AdvancedInsightCard />
          </div>
        </div>
      );
    }

    if (activeTab === 'flow') {
      return (
        <ComingSoonBlock
          title="Flow view is coming soon."
          description="You’ll see sequence, triggers and confirmations here."
        />
      );
    }

    return (
      <ComingSoonBlock
        title="Playbook view is coming soon."
        description="You’ll see your rules and checklists here."
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AnalysisLayout
          title="Analysis"
          subtitle="AI-backed market views, flows and playbooks."
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => {
            setActiveTab(id as AnalysisTabId);
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('tab', id);
            setSearchParams(nextParams, { replace: true });
          }}
        >
          {renderTabContent()}
        </AnalysisLayout>
      </div>
    </div>
  );
}

interface ComingSoonBlockProps {
  title: string;
  description: string;
}

function ComingSoonBlock({ title, description }: ComingSoonBlockProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  );
}

function OverviewInsightSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-40 rounded-full bg-white/10 animate-pulse" />
          <div className="h-6 w-3/4 rounded-full bg-white/10 animate-pulse" />
          <div className="h-4 w-full rounded-full bg-white/5 animate-pulse" />
          <div className="h-4 w-2/3 rounded-full bg-white/5 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-20 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="h-64 w-full animate-pulse rounded-2xl bg-white/10" />
        <p className="mt-4 text-center text-sm text-zinc-500">No AI insight available yet. Fetching the latest market view…</p>
      </div>
    </div>
  );
}
