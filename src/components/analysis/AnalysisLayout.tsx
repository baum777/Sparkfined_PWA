import React from 'react';
import AnalysisSidebarTabs, { AnalysisTab } from './AnalysisSidebarTabs';

interface AnalysisLayoutProps {
  title?: string;
  subtitle?: string;
  tabs: ReadonlyArray<AnalysisTab>;
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
  showHeader?: boolean;
}

export default function AnalysisLayout({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  children,
  showHeader = true,
}: AnalysisLayoutProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-border bg-surface/70 p-4 sm:p-6">
      <div className="md:hidden">
        <AnalysisSidebarTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} orientation="horizontal" />
      </div>

      <div className="md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-8">
        <aside className="hidden md:block">
          <AnalysisSidebarTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
        </aside>

        <section className="space-y-6">
          {showHeader ? (
            <header className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-text-tertiary">Sparkfined</p>
              <div>
                <h1 className="text-3xl font-semibold text-text-primary">{title}</h1>
                {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
              </div>
            </header>
          ) : null}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-inner">{children}</div>
        </section>
      </div>
    </div>
  );
}
