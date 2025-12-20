import { useEffect, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import SettingsCard from './SettingsCard'
import { applyUpdate, checkForUpdate, getUpdateCapability, type UpdateStatus } from './pwa-update'
import './settings.css'

type StatusMessage = {
  label: string
  description: string
}

const STATUS_COPY: Record<UpdateStatus, StatusMessage> = {
  idle: { label: 'Idle', description: 'Check for updates to ensure you have the latest release.' },
  checking: { label: 'Checking', description: 'Looking for a new service worker version…' },
  available: { label: 'Update available', description: 'A new version is ready. Apply to reload with the latest assets.' },
  updating: { label: 'Updating', description: 'Applying update. The app will reload when ready.' },
  updated: { label: 'Updated', description: "You're on the latest version." },
  error: { label: 'Error', description: 'Update check failed. Try again.' },
}

export default function PwaUpdateCard() {
  const [status, setStatus] = useState<UpdateStatus>('idle')
  const [message, setMessage] = useState<string>(STATUS_COPY.idle.description)
  const [error, setError] = useState<string | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    let mounted = true

    getUpdateCapability()
      .then((capability) => {
        if (!mounted) return
        setSupported(capability.supported)
        setRegistration(capability.registration)
        if (!capability.supported) {
          setStatus('error')
          setError(capability.reason ?? 'Service worker updates are unavailable on this device.')
          setMessage(capability.reason ?? 'Service worker updates are unavailable on this device.')
          return
        }

        if (capability.waiting) {
          setStatus('available')
          setMessage(STATUS_COPY.available.description)
        }
      })
      .catch((err: unknown) => {
        if (!mounted) return
        setSupported(false)
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to detect update capability')
        setMessage(STATUS_COPY.error.description)
      })

    return () => {
      mounted = false
    }
  }, [])

  const buttonLabel = useMemo(() => {
    if (!supported) return 'Unavailable'
    if (status === 'available') return 'Update app'
    if (status === 'updating') return 'Updating…'
    if (status === 'error' && registration?.waiting) return 'Retry update'
    if (status === 'error') return 'Retry check'
    return 'Check for updates'
  }, [supported, status, registration])

  const isBusy = status === 'checking' || status === 'updating'
  const canApplyUpdate = status === 'available' || (!!registration?.waiting && status === 'error')

  const handleCheck = async () => {
    setError(null)
    setStatus('checking')
    setMessage(STATUS_COPY.checking.description)

    try {
      const result = await checkForUpdate()
      setRegistration(result.registration)

      if (result.waiting) {
        setStatus('available')
        setMessage(STATUS_COPY.available.description)
        return
      }

      setStatus('updated')
      setMessage("You're on the latest version.")
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to check for updates')
      setMessage(STATUS_COPY.error.description)
    }
  }

  const handleApply = async () => {
    setError(null)
    setStatus('updating')
    setMessage(STATUS_COPY.updating.description)

    try {
      const capability = await getUpdateCapability()
      const registrationToUse = capability.registration ?? registration

      if (!registrationToUse || (!registrationToUse.waiting && !capability.waiting)) {
        setStatus('updated')
        setMessage("You're on the latest version.")
        return
      }

      await applyUpdate(registrationToUse)
      setStatus('updated')
      setMessage('Update applied. Reloading…')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to apply update')
      setMessage(STATUS_COPY.error.description)
    }
  }

  const actionHandler = canApplyUpdate ? handleApply : handleCheck

  return (
    <SettingsCard
      title="PWA in-app update"
      subtitle="Keep Sparkfined up to date without reinstalling."
      actions={
        <Button
          variant={canApplyUpdate ? 'primary' : 'secondary'}
          size="sm"
          onClick={actionHandler}
          disabled={isBusy || !supported}
          aria-label={buttonLabel}
        >
          {buttonLabel}
        </Button>
      }
    >
      <div className="pwa-update">
        <div className="pwa-update__status">
          <p className="pwa-update__label">Status</p>
          <div className={`pwa-update__pill pwa-update__pill--${status}`} aria-live="polite">
            {STATUS_COPY[status].label}
          </div>
          <p className="pwa-update__message" aria-live="polite">
            {message}
          </p>
          {error ? <p className="pwa-update__error">{error}</p> : null}
        </div>
        <div className="pwa-update__actions">
          <div className="pwa-update__meta" aria-live="polite">
            {canApplyUpdate
              ? 'Apply the waiting update to reload with the latest assets.'
              : 'Tap “Check for updates” to see if a new version is available.'}
          </div>
          {!supported ? (
            <p className="pwa-update__error" aria-live="polite">
              Service worker updates are unavailable in this environment.
            </p>
          ) : null}
          <div className="pwa-update__buttons">
            <Button
              variant={canApplyUpdate ? 'primary' : 'secondary'}
              size="sm"
              onClick={actionHandler}
              disabled={isBusy || !supported}
              aria-label={buttonLabel}
            >
              {buttonLabel}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCheck}
              disabled={isBusy}
              aria-label="Re-run update check"
            >
              Refresh status
            </Button>
          </div>
          <p className="pwa-update__hint">Updates apply instantly; the app will reload after activation.</p>
        </div>
      </div>
    </SettingsCard>
  )
}
