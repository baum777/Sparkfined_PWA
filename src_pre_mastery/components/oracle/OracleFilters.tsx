import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OracleFilter } from "@/features/oracle/types";

interface OracleFiltersProps {
  filter: OracleFilter;
  onFilterChange: (filter: OracleFilter) => void;
  counts: {
    all: number;
    new: number;
    read: number;
  };
}

const FILTER_LABELS: Record<OracleFilter, string> = {
  all: 'All',
  new: 'New',
  read: 'Read',
};

export function OracleFilters({ filter, onFilterChange, counts }: OracleFiltersProps) {
  const filters: OracleFilter[] = ['all', 'new', 'read'];

  return (
    <div className="flex gap-2" role="tablist" aria-label="Filter insights">
      {filters.map((f) => (
        <Button
          key={f}
          variant={filter === f ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange(f)}
          role="tab"
          aria-selected={filter === f}
          className={cn(
            'focus-visible:ring-offset-background',
            filter === f && 'ring-1 ring-ring'
          )}
          data-testid={`oracle-filter-${f}`}
        >
          {FILTER_LABELS[f]}
          <span className="ml-1.5 text-xs text-muted-foreground">
            ({counts[f]})
          </span>
        </Button>
      ))}
    </div>
  );
}
