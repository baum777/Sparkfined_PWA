import React from 'react';
import Select from '@/components/ui/Select';

interface OracleThemeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const THEME_OPTIONS = [
  'All',
  'Gaming',
  'RWA',
  'AI Agents',
  'DePIN',
  'Privacy/ZK',
  'Collectibles/TCG',
  'Stablecoin Yield',
];

export function OracleThemeFilter({ value, onChange }: OracleThemeFilterProps) {
  return (
    <div
      className="rounded-3xl border border-border bg-surface/70 p-4 shadow-[0_10px_30px_rgba(2,6,23,0.35)]"
      data-testid="oracle-theme-filter"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">Filter by theme</p>
          <p className="text-xs text-text-secondary">
            Focus chart and history on a single meta trend.
          </p>
        </div>
        <div className="w-full min-w-[200px] sm:w-64">
          <Select
            value={value}
            onChange={onChange}
            options={THEME_OPTIONS.map((theme) => ({
              value: theme,
              label: theme,
            }))}
            triggerProps={{
              'data-testid': 'oracle-theme-select',
            }}
          />
        </div>
      </div>
    </div>
  );
}
