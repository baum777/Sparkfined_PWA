import { useEffect, useMemo, useState } from 'react'
import { Button, Input } from '@/components/ui'
import { CheckCircle2, Copy, Shield, Wifi } from '@/lib/icons'
import { getWalletMonitoringStatus, type WalletMonitoringStatus } from '@/api/wallet'
import SettingsCard from './SettingsCard'
import { useUserSettingsStore } from '@/store/userSettings'

function StatusPill({ enabled }: { enabled: boolean }) {
  const toneClass = enabled ? 'settings-pill--success' : 'settings-pill--muted'
  return (
    <span className={`settings-pill ${toneClass}`} aria-live="polite">
      <Shield size={16} aria-hidden /> {enabled ? 'Monitoring enabled' : 'Monitoring disabled'}
    </span>
  )
}

export default function WalletMonitoringCard() {
  const { walletMonitoring, setWalletMonitoringAddress, setWalletMonitoringEnabled } =
    useUserSettingsStore()
  const [copyLabel, setCopyLabel] = useState('Copy address')
  const [status, setStatus] = useState<WalletMonitoringStatus | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)

  const trimmedAddress = walletMonitoring.address.trim()

  useEffect(() => {
    let cancelled = false

    if (!walletMonitoring.enabled || !trimmedAddress) {
      setStatus(null)
      setStatusError(null)
      return () => {
        cancelled = true
      }
    }

    getWalletMonitoringStatus(trimmedAddress)
      .then((result) => {
        if (!cancelled) {
          setStatus(result)
          setStatusError(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus(null)
          setStatusError('Unable to fetch monitoring heartbeat (mock).')
        }
      })

    return () => {
      cancelled = true
    }
  }, [trimmedAddress, walletMonitoring.enabled])

  const handleCopy = async () => {
    if (!trimmedAddress) return

    try {
      await navigator?.clipboard?.writeText(trimmedAddress)
      setCopyLabel('Copied!')
      setTimeout(() => setCopyLabel('Copy address'), 1200)
    } catch (error) {
      console.warn('Clipboard copy failed', error)
      setCopyLabel('Copy failed')
      setTimeout(() => setCopyLabel('Copy address'), 1200)
    }
  }

  const monitoringSummary = useMemo(() => {
    if (!status || !walletMonitoring.enabled) return 'Monitoring is ready once you enable it.'
    const heartbeat = status.lastHeartbeat
      ? new Date(status.lastHeartbeat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '—'
    return `Last heartbeat ${heartbeat}; next check in ~${status.nextCheckSeconds}s.`
  }, [status, walletMonitoring.enabled])

  return (
    <SettingsCard
      title="Wallet monitoring"
      subtitle="Track a primary wallet for new activity. Local mock only—no provider keys required."
      actions={<StatusPill enabled={walletMonitoring.enabled} />}
    >
      <div className="settings-monitoring-grid">
        <div className="settings-monitoring-input">
          <Input
            label="Monitored wallet address"
            value={walletMonitoring.address}
            onChange={(event) => setWalletMonitoringAddress(event.target.value)}
            placeholder="Enter Solana address"
            mono
            data-testid="wallet-monitoring-address"
          />
        </div>

        <div className="settings-monitoring-actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            disabled={!trimmedAddress}
            leftIcon={<Copy size={16} aria-hidden />}
            aria-label="Copy monitored wallet address"
          >
            {copyLabel}
          </Button>

          <Button
            variant={walletMonitoring.enabled ? 'ghost' : 'primary'}
            size="sm"
            onClick={() => setWalletMonitoringEnabled(!walletMonitoring.enabled)}
            disabled={!trimmedAddress}
            leftIcon={walletMonitoring.enabled ? <Wifi size={16} aria-hidden /> : <CheckCircle2 size={16} aria-hidden />}
            aria-pressed={walletMonitoring.enabled}
            aria-label={walletMonitoring.enabled ? 'Disable wallet monitoring' : 'Enable wallet monitoring'}
          >
            {walletMonitoring.enabled ? 'Disable monitoring' : 'Enable monitoring'}
          </Button>
        </div>
      </div>

      <div className="settings-monitoring-status" role="status">
        <div className="settings-monitoring-status__icon" aria-hidden>
          <Wifi size={18} />
        </div>
        <div className="settings-monitoring-status__meta">
          <p className="settings-monitoring-status__headline">{walletMonitoring.enabled ? 'Monitoring active' : 'Monitoring off'}</p>
          <p className="settings-monitoring-status__copy">{monitoringSummary}</p>
          {statusError ? <p className="settings-monitoring-status__error">{statusError}</p> : null}
        </div>
      </div>
    </SettingsCard>
  )
}
