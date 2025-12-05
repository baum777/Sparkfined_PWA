import React from 'react';
import AnalysisHeader from './AnalysisHeader';

interface AnalysisTab {
  id: string;
  label: string;
}

interface AnalysisLayoutProps {
  title: string;
  subtitle?: string;
  tabs?: ReadonlyArray<AnalysisTab>;
  activeTabId?: string;
  onTabChange?: (id: string) => void;
  children: React.ReactNode;
}

export default function AnalysisLayout({
  title,
  subtitle,
  tabs,
  activeTabId,
  onTabChange,
  children,
}: AnalysisLayoutProps) {
  const hasTabs = Boolean(tabs?.length);

  return (
    <div className="space-y-6 rounded-3xl border border-white/5 bg-black/30 p-6 shadow-2xl">
      <AnalysisHeader title={title} subtitle={subtitle} />

      {hasTabs ? (
        <nav className="overflow-x-auto" aria-label="Analysis sections">
          <div className="inline-flex min-w-full gap-2 border-b border-white/5 pb-2" role="tablist">
            {tabs?.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange?.(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'border-spark/60 bg-spark/10 text-white'
                      : 'border-transparent text-fog hover:border-ash hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}

      <section className="rounded-2xl border border-white/5 bg-black/40 p-6 shadow-inner">
        {children}
      </section>
    </div>
  );
}
