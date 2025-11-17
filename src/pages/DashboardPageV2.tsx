import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import DashboardKpiStrip from '@/components/dashboard/DashboardKpiStrip';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Bell, FileText, Plus, Sparkles } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'journal', label: 'Journal' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'research', label: 'Research' },
];

const tabDescriptions: Record<string, string> = {
  overview: 'High-level status of performance, alerts, and routines.',
  journal: 'Surface recent reflections and ongoing lessons learned.',
  alerts: 'Keep pending triggers, confirmations, and follow-ups close.',
  research: 'Track market narratives, watchlists, and experiment ideas.',
};

const kpiItems = [
  { label: 'Net P&L', value: '+12.4%', trend: 'up' as const },
  { label: 'Win Rate', value: '63%', trend: 'flat' as const },
  { label: 'Active Alerts', value: '5', trend: 'up' as const },
  { label: 'Journal Streak', value: '9 days', trend: 'up' as const },
];

const insightHighlights = [
  {
    title: 'SOL momentum',
    detail: 'Price coiling under H4 supply. Volume increasing with positive funding.',
  },
  {
    title: 'Alert hygiene',
    detail: 'Two alerts stale for 48h. Consider pruning or refreshing thresholds.',
  },
  {
    title: 'Journal cadence',
    detail: 'Last three entries tagged “discipline”. Prep checklist update.',
  },
];

const sessionChecklist = [
  'Review macro + funding map',
  'Update journal template with new tag',
  'Sync Solana watchlist with Grok prompt',
  'Stage limit orders for overnight plan',
];

export default function DashboardPageV2() {
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.id ?? 'overview');

  return (
    <DashboardShell
      title="Sparkfined Command Center"
      description="A modern shell for upcoming widgets: charting, journaling, automation, and AI copilots."
      actions={
        <>
          <Button variant="secondary" leftIcon={<Bell className="h-4 w-4" />}>
            Manage alerts
          </Button>
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            New journal entry
          </Button>
        </>
      }
      tabs={tabs}
      activeTabId={activeTab}
      onTabSelect={setActiveTab}
      kpiStrip={<DashboardKpiStrip items={kpiItems} />}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">
                {tabs.find((tab) => tab.id === activeTab)?.label ?? 'Overview'} canvas
              </CardTitle>
              <p className="text-sm text-zinc-400">
                {tabDescriptions[activeTab] ?? tabDescriptions.overview}
              </p>
            </div>
            <Button variant="ghost" leftIcon={<Sparkles className="h-4 w-4" />}>
              Add widget
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {insightHighlights.map((insight) => (
                <div
                  key={insight.title}
                  className="rounded-2xl border border-white/5 bg-white/5 p-4"
                >
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    {insight.title}
                  </p>
                  <p className="mt-2 text-sm text-zinc-200">{insight.detail}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
              Widget placeholder — charts, journal preview, and AI copilots will mount here.
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Quick routines</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-zinc-300">
                {sessionChecklist.map((item, index) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-zinc-500">{index + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card variant="default">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Journal drafts</CardTitle>
              <Button variant="ghost" size="sm" leftIcon={<FileText className="h-4 w-4" />}>
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Trade review', 'Mindset note', 'Strategy tweak'].map((draft) => (
                <div
                  key={draft}
                  className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-zinc-200"
                >
                  {draft}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
