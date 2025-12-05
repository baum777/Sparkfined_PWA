import React from 'react';

export interface AnalysisTab {
  id: string;
  label: string;
}

interface AnalysisSidebarTabsProps {
  tabs: ReadonlyArray<AnalysisTab>;
  activeTab: string;
  onTabChange: (id: string) => void;
  orientation?: 'vertical' | 'horizontal';
}

export default function AnalysisSidebarTabs({
  tabs,
  activeTab,
  onTabChange,
  orientation = 'vertical',
}: AnalysisSidebarTabsProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`flex ${
        isVertical ? 'flex-col gap-2' : 'flex-row gap-2 overflow-x-auto'
      } card-bordered rounded-2xl p-3`}
      role="tablist"
      aria-orientation={isVertical ? 'vertical' : 'horizontal'}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'border-glow-brand bg-brand/10 text-brand hover-glow'
                : 'border-transparent text-text-secondary hover:border-border-moderate hover:bg-interactive-hover hover:text-text-primary hover-scale'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
