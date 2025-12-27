import React from 'react'
import { Lightbulb } from '@/lib/icons'
import { Card, CardContent } from '@/components/ui/Card'
import type { OracleInsight } from '@/features/oracle'

interface OracleTodayTakeawayProps {
  insight: OracleInsight
}

export default function OracleTodayTakeaway({ insight }: OracleTodayTakeawayProps) {
  return (
    <Card
      variant="bordered"
      className="border-brand/30 bg-brand/5"
      data-testid="oracle-insight-today-takeaway"
    >
      <CardContent className="gap-0 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Lightbulb size={16} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-primary">Today's Takeaway</p>
            <p className="text-sm text-text-secondary">{insight.takeaway}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

