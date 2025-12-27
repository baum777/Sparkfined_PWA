import React from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp } from '@/lib/icons'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface OracleRewardBannerProps {
  streak: number
}

/**
 * Loveable-style reward banner.
 *
 * NOTE: Sparkfined rewards for Oracle are granted automatically when the user
 * marks the daily report as read (see protected `oracleStore`). This banner is
 * informational only and intentionally does not introduce a "claim" action.
 */
export default function OracleRewardBanner({ streak }: OracleRewardBannerProps) {
  const navigate = useNavigate()

  if (streak < 2) return null

  return (
    <Card
      variant="bordered"
      className="border-border-moderate bg-surface-subtle"
      data-testid="oracle-reward-banner"
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-text-secondary">
              <TrendingUp size={16} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">From degen to disciplined</p>
              <p className="text-sm text-text-secondary">
                {streak} reads logged — steady progress compounds.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/journal')}
            data-testid="oracle-view-journal"
          >
            View Journal
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

