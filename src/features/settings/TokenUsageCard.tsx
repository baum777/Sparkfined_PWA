import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui'
import { getBudgets, readUsage, TokenBudgets, TokenUsageState } from '@/lib/usage/tokenUsage'
import SettingsCard from './SettingsCard'

function UsageMeter({
  label,
  value,
  total,
  status,
}: {
  label: string
  value: number
  total: number
  status: 'normal' | 'warning' | 'critical'
}) {
  const ratio = total > 0 ? Math.min(1, value / total) : 0
  const barColor =
    status === 'critical'
      ? 'var(--sf-danger)'
      : status === 'warning'
        ? 'var(--sf-warning)'
        : 'var(--sf-primary)'

  return (
    <div className="settings-usage-stat">
      <div className="settings-usage-label">{label}</div>
      <div className="settings-usage-value">
        <span>{value.toLocaleString()}</span>
        <span className="settings-usage-total">/ {total > 0 ? total.toLocaleString() : '—'}</span>
      </div>
      <div className="settings-usage-meter" aria-label={`${label} usage`}>
        <div
          className="settings-usage-meter__bar"
          style={{ width: `${ratio * 100}%`, backgroundColor: barColor }}
          role="presentation"
        />
      </div>
    </div>
  )
}

function WarningBanner({ message, tone }: { message: string; tone: 'warning' | 'critical' }) {
  return (
    <div
      className={`settings-usage-banner ${tone === 'critical' ? 'settings-usage-banner--critical' : 'settings-usage-banner--warning'}`}
      role="status"
    >
      {message}
    </div>
  )
}

export default function TokenUsageCard() {
  const [usage, setUsage] = useState<TokenUsageState>(() => readUsage())
  const [budgets, setBudgetsState] = useState<TokenBudgets>(() => getBudgets())

  const tokenWarnLevels = useMemo(
    () => ({ warn80: budgets.warn80, warn95: budgets.warn95 }),
    [budgets.warn80, budgets.warn95],
  )

  const apiWarnLevels = useMemo(() => {
    if (!budgets.dailyApiCallBudget) return null
    return {
      warn80: Math.floor(budgets.dailyApiCallBudget * 0.8),
      warn95: Math.floor(budgets.dailyApiCallBudget * 0.95),
    }
  }, [budgets.dailyApiCallBudget])

  const refresh = useCallback(() => {
    setUsage(readUsage())
    setBudgetsState(getBudgets())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const tokenStatus: 'normal' | 'warning' | 'critical' = useMemo(() => {
    if (usage.tokensUsedToday >= tokenWarnLevels.warn95) return 'critical'
    if (usage.tokensUsedToday >= tokenWarnLevels.warn80) return 'warning'
    return 'normal'
  }, [tokenWarnLevels.warn80, tokenWarnLevels.warn95, usage.tokensUsedToday])

  const callStatus: 'normal' | 'warning' | 'critical' = useMemo(() => {
    if (!apiWarnLevels) return 'normal'
    if (usage.apiCallsToday >= apiWarnLevels.warn95) return 'critical'
    if (usage.apiCallsToday >= apiWarnLevels.warn80) return 'warning'
    return 'normal'
  }, [apiWarnLevels, usage.apiCallsToday])

  return (
    <SettingsCard title="Token Usage / Limits" subtitle="Resets at 00:00 Europe/Berlin">
      <div className="settings-usage-grid">
        <UsageMeter
          label="Tokens used today"
          value={usage.tokensUsedToday}
          total={budgets.dailyTokenBudget}
          status={tokenStatus}
        />
        <UsageMeter
          label="API calls today"
          value={usage.apiCallsToday}
          total={budgets.dailyApiCallBudget ?? 0}
          status={callStatus}
        />
        <div className="settings-usage-meta">
          <p className="settings-usage-meta__label">Per-request output cap</p>
          <p className="settings-usage-meta__value">{budgets.perRequestOutputTokenCap.toLocaleString()} tokens</p>
        </div>
      </div>

      {tokenStatus !== 'normal' ? (
        <WarningBanner
          tone={tokenStatus === 'critical' ? 'critical' : 'warning'}
          message={`Token usage at ${Math.round((usage.tokensUsedToday / budgets.dailyTokenBudget) * 100)}% of the daily budget.`}
        />
      ) : null}

      {budgets.dailyApiCallBudget && callStatus !== 'normal' && apiWarnLevels ? (
        <WarningBanner
          tone={callStatus === 'critical' ? 'critical' : 'warning'}
          message={`API calls at ${Math.round((usage.apiCallsToday / budgets.dailyApiCallBudget) * 100)}% of the daily budget.`}
        />
      ) : null}

      <div className="settings-usage-footer">
        <div>
          <p className="settings-usage-reset">Daily counters reset at 00:00 Europe/Berlin.</p>
          <p className="settings-usage-reset">Warning thresholds at 80% and 95% (non-blocking).</p>
        </div>
        <Button size="sm" variant="secondary" onClick={refresh} aria-label="Refresh token usage">
          Refresh usage
        </Button>
      </div>
    </SettingsCard>
  )
}
