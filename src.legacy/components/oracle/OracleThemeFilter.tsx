/**
 * Oracle Theme Filter
 * 
 * Dropdown to filter Oracle reports by theme.
 * Uses the existing Select component from the design system.
 */

import React from 'react';
import Select from '@/components/ui/Select';
import { ORACLE_THEMES } from '@/types/oracle';

interface OracleThemeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function OracleThemeFilter({ value, onChange }: OracleThemeFilterProps) {
  // Build options array with "All" + all themes
  const options = [
    { value: 'All', label: 'All Themes' },
    ...ORACLE_THEMES.map((theme) => ({
      value: theme,
      label: theme,
    })),
  ];

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="oracle-theme-filter"
        className="text-sm font-medium text-text-secondary"
      >
        Filter by Theme
      </label>
      <Select
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Select theme..."
        triggerProps={{
          id: 'oracle-theme-filter',
          'data-testid': 'oracle-theme-filter',
        }}
      />
    </div>
  );
}
