import React from 'react'
import Button from '@/components/ui/Button'
import {
  DEFAULT_DAILY_API_CALL_BUDGET,
  DEFAULT_DAILY_TOKEN_BUDGET,
  DEFAULT_PER_REQUEST_OUTPUT_TOKEN_CAP,
} from '@/lib/ai/withTokenLockOrMock'
import SettingsCard from './SettingsCard'
import { readUsage, resetUsageForToday, type UsageSnapshot } from './token-usage'

const WARNING_THRESHOLD = 0.8
const DANGER_THRESHOLD = 0.95

function formatNumber(value: number) {
  return value.toLocaleString()
}

function formatBudget(budget: number) {
  if (!Number.isFinite(budget)) return 'Unlimited'
  return formatNumber(budget)
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

  const tokenBudget = DEFAULT_DAILY_TOKEN_BUDGET
  const apiCallBudget = DEFAULT_DAILY_API_CALL_BUDGET

  const tokenRatio = tokenBudget === Number.POSITIVE_INFINITY ? 0 : usage.tokens / tokenBudget
  const apiCallRatio = apiCallBudget === Number.POSITIVE_INFINITY ? 0 : usage.apiCalls / apiCallBudget

  const tokenStatus =
    tokenBudget === Number.POSITIVE_INFINITY
      ? null
      : tokenRatio >= DANGER_THRESHOLD
        ? 'danger'
        : tokenRatio >= WARNING_THRESHOLD
          ? 'warning'
          : null

  const apiStatus =
    apiCallBudget === Number.POSITIVE_INFINITY
      ? null
      : apiCallRatio >= DANGER_THRESHOLD
        ? 'danger'
        : apiCallRatio >= WARNING_THRESHOLD
          ? 'warning'
          : null

  const warnings: { level: 'warning' | 'danger'; message: string }[] = []

  if (tokenStatus) {
    warnings.push({
      level: tokenStatus,
      message: `Tokens at ${Math.round(tokenRatio * 100)}% of the daily budget (${formatNumber(usage.tokens)} / ${formatBudget(tokenBudget)}).`,
    })
  }

  if (apiStatus) {
    warnings.push({
      level: apiStatus,
      message: `API calls at ${Math.round(apiCallRatio * 100)}% of the daily budget (${formatNumber(usage.apiCalls)} / ${formatBudget(apiCallBudget)}).`,
    })
  }

  const warningLevel = warnings.some((w) => w.level === 'danger')
    ? 'danger'
    : warnings[0]?.level

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
        {warnings.length > 0 && warningLevel && (
          <div className={`usage-warning usage-warning--${warningLevel}`} role="status">
            <p className="usage-warning__label">
              {warningLevel === 'danger' ? 'Near limit' : 'Approaching budget'}
            </p>
            <ul className="usage-warning__list">
              {warnings.map((warning) => (
                <li key={warning.message} className="usage-warning__detail">
                  {warning.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="usage-stats" role="list" aria-label="Token usage overview">
          <div className="usage-stat" role="listitem">
            <p className="usage-label">Tokens today</p>
            <p className="usage-value">{formatNumber(usage.tokens)}</p>
            <p className="usage-subtext">Daily budget: {formatBudget(tokenBudget)}</p>
          </div>
          <div className="usage-stat" role="listitem">
            <p className="usage-label">API calls today</p>
            <p className="usage-value">{formatNumber(usage.apiCalls)}</p>
            <p className="usage-subtext">Daily budget: {formatBudget(apiCallBudget)}</p>
          </div>
        </div>
        <div className="usage-meta">
          <p className="usage-reset">Resets daily at 00:00 (Europe/Berlin)</p>
          <p className="usage-date">Current date key: {usage.dateKey}</p>
          <p className="usage-date">Per-request output cap: {formatNumber(DEFAULT_PER_REQUEST_OUTPUT_TOKEN_CAP)} tokens</p>
        </div>
      </div>
    </SettingsCard>
  )
}
