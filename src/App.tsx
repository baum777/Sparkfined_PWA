import React from 'react'
import { SettingsProvider } from './state/settings'
import { TelemetryProvider } from './state/telemetry'
import { AIProviderState } from './state/ai'
import RoutesRoot from './routes/RoutesRoot'
import MissingConfigBanner from './components/MissingConfigBanner'
import OfflineIndicator from './components/pwa/OfflineIndicator'
import UpdateBanner from './components/UpdateBanner'
import './styles/theme.css'
import './styles/ui.css'
import './styles/App.css'
import { ThemeProvider } from '@/features/theme/ThemeContext'
import { checkAlerts, notifyAlertTriggered } from '@/lib/alerts/triggerEngine'
import { useAlertsStore } from '@/store/alertsStore'
import { ToastProvider } from '@/components/ui/Toast'

function App() {
  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let isRunning = false

    const runCheck = async () => {
      if (isRunning) {
        return
      }

      isRunning = true

      try {
        const { alerts } = useAlertsStore.getState()
        const armedAlerts = alerts.filter((alert) => alert.status === 'armed')

        if (!armedAlerts.length) {
          return
        }

        const triggeredAlerts = await checkAlerts(armedAlerts)

        if (triggeredAlerts.length) {
          const { updateAlert } = useAlertsStore.getState()
          triggeredAlerts.forEach(({ alert, price }) => {
            updateAlert(alert.id, { status: 'triggered' })
            notifyAlertTriggered(alert, price)
          })
        }
      } catch (error) {
        console.error('Error while checking alerts', error)
      } finally {
        isRunning = false
      }
    }

    const intervalId = window.setInterval(runCheck, 60_000)
    runCheck()

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <>
      <TelemetryProvider>
        <SettingsProvider>
          <ThemeProvider>
            <AIProviderState>
              <ToastProvider>
              {/* Missing Config Banner */}
              <MissingConfigBanner />

              {/* Update + Offline indicators (fixed overlays) */}
              <UpdateBanner />
              <OfflineIndicator />

              {/* Skip to main content link (A11y) */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
              >
                Skip to main content
              </a>

              <RoutesRoot />
              </ToastProvider>
            </AIProviderState>
          </ThemeProvider>
        </SettingsProvider>
      </TelemetryProvider>
    </>
  )
}

export default App
