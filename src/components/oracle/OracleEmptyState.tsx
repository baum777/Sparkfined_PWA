import React from 'react'
import { Sparkles } from '@/lib/icons'
import { Card, CardContent } from '@/components/ui/Card'
import type { OracleFilter } from '@/features/oracle'

interface OracleEmptyStateProps {
  filter: OracleFilter
}

export default function OracleEmptyState({ filter }: OracleEmptyStateProps) {
  const messages: Record<OracleFilter, string> = {
    all: 'No insights yet. Refresh Oracle to fetch the latest daily report.',
    new: 'All caught up! No new reports to review.',
    read: 'No reviewed reports yet. Mark today as read to track your streak.',
  }

  return (
    <Card data-testid="oracle-empty-state">
      <CardContent className="items-center justify-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-text-tertiary">
          <Sparkles size={20} />
        </div>
        <p className="max-w-sm text-sm text-text-secondary">{messages[filter]}</p>
      </CardContent>
    </Card>
  )
}

