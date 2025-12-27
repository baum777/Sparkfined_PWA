import React from 'react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/ui/cn'
import type { OracleFilter } from '@/features/oracle'

interface OracleFiltersProps {
  filter: OracleFilter
  onFilterChange: (filter: OracleFilter) => void
  counts: {
    all: number
    new: number
    read: number
  }
}

const FILTER_LABELS: Record<OracleFilter, string> = {
  all: 'All',
  new: 'New',
  read: 'Read',
}

export default function OracleFilters({ filter, onFilterChange, counts }: OracleFiltersProps) {
  const filters: OracleFilter[] = ['all', 'new', 'read']

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter insights">
      {filters.map((f) => {
        const isActive = filter === f
        return (
          <Button
            key={f}
            variant={isActive ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange(f)}
            role="tab"
            aria-selected={isActive}
            className={cn(isActive && 'ring-1 ring-border-focus')}
            data-testid={`oracle-filter-${f}`}
          >
            {FILTER_LABELS[f]}
            <span className="ml-1.5 text-xs text-text-tertiary">({counts[f]})</span>
          </Button>
        )
      })}
    </div>
  )
}

