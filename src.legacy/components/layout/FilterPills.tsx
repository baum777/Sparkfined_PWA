/**
 * FilterPills - Reusable Filter Toggle Pills
 *
 * Provides consistent filter UI for all pages (Alerts, Journal, Watchlist, etc.)
 * Uses the same "segmented control" pattern as in AlertsPage
 *
 * Usage:
 * ```tsx
 * <FilterPills
 *   options={['All', 'Armed', 'Triggered', 'Paused']}
 *   active="Armed"
 *   onChange={(value) => setFilter(value)}
 * />
 * ```
 */

import React from 'react';
import { cn } from '@/lib/ui/cn';

export interface FilterPillsProps<T extends string> {
  options: readonly T[] | T[];
  active: T;
  onChange: (value: T) => void;
  formatLabel?: (value: T) => string;
  className?: string;
}

function defaultFormatLabel(value: string): string {
  if (value === 'all') return 'All';

  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export function FilterPills<T extends string>({
  options,
  active,
  onChange,
  formatLabel = defaultFormatLabel,
  className,
}: FilterPillsProps<T>) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} role="group">
      {options.map((option) => {
        const isActive = active === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:text-sm',
              isActive
                ? 'border-glow-brand bg-brand/10 text-brand hover-glow'
                : 'border-border text-text-secondary hover:bg-interactive-hover hover-scale'
            )}
            aria-pressed={isActive}
          >
            {formatLabel(option)}
          </button>
        );
      })}
    </div>
  );
}

export default FilterPills;
