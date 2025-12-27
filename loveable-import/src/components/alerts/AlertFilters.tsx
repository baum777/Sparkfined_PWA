import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FilterType } from '@/features/alerts';

interface AlertFiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onClear: () => void;
  resultsCount: number;
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'triggered', label: 'Triggered' },
  { value: 'paused', label: 'Paused' },
];

export function AlertFilters({ filter, onFilterChange, onClear, resultsCount }: AlertFiltersProps) {
  return (
    <div 
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Alert filters"
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = filter === option.value;
        return (
          <Button
            key={option.value}
            variant={isActive ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange(option.value)}
            aria-pressed={isActive}
            data-testid={`filter-${option.value}`}
            className={`focus-visible:ring-offset-background ${isActive ? 'ring-1 ring-ring' : ''}`}
          >
            {option.label}
          </Button>
        );
      })}

      {filter !== 'all' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground focus-visible:ring-offset-background"
          aria-label="Clear filter"
          data-testid="filter-clear"
        >
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}

      <span 
        className="ml-auto text-xs text-muted-foreground"
        data-testid="alerts-results-count"
      >
        {resultsCount} {resultsCount === 1 ? 'alert' : 'alerts'}
      </span>
    </div>
  );
}
