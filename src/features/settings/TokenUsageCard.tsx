import React from 'react'
import Button from '@/components/ui/Button'
import SettingsCard from './SettingsCard'
import { readUsage, resetUsageForToday, type UsageSnapshot } from './token-usage'

function formatNumber(value: number) {
  return value.toLocaleString()
}

export default function TokenUsageCard() {
  const [usage, setUsage] = React.useState<UsageSnapshot>(() => readUsage())

  React.useEffect(() => {
    setUsage(readUsage())
  }, [])

  const handleManualReset = () => {
    const snapshot = resetUsageForToday()
    setUsage(snapshot)
  }

  return (
    <SettingsCard
      title="Token usage"
      subtitle="Daily counts reset automatically at 00:00 Europe/Berlin."
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualReset}
          aria-label="Reset usage counters to today"
        >
          Reset now
        </Button>
      }
    >
      <div className="usage-card">
        <div className="usage-stats" role="list" aria-label="Token usage overview">
          <div className="usage-stat" role="listitem">
            <p className="usage-label">Tokens today</p>
            <p className="usage-value">{formatNumber(usage.tokens)}</p>
          </div>
          <div className="usage-stat" role="listitem">
            <p className="usage-label">API calls today</p>
            <p className="usage-value">{formatNumber(usage.apiCalls)}</p>
          </div>
        </div>
        <div className="usage-meta">
          <p className="usage-reset">Resets daily at 00:00 (Europe/Berlin)</p>
          <p className="usage-date">Current date key: {usage.dateKey}</p>
        </div>
      </div>
    </SettingsCard>
  )
}
