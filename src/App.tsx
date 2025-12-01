import React from 'react'
import { SettingsProvider } from './state/settings'
import { TelemetryProvider } from './state/telemetry'
import { AIProviderState } from './state/ai'
import RoutesRoot from './routes/RoutesRoot'
import GlobalInstruments from './pages/_layout/GlobalInstruments'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import MissingConfigBanner from './components/MissingConfigBanner'
import OfflineIndicator from './components/pwa/OfflineIndicator'
import './styles/App.css'
import { ThemeProvider } from '@/lib/theme/theme-provider'
import { checkAlerts, notifyAlertTriggered } from '@/lib/alerts/triggerEngine'
import { useAlertsStore } from '@/store/alertsStore'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'
import { useOnboardingStore } from '@/store/onboardingStore'

function App() {
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding)

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
      {!hasCompletedOnboarding && <OnboardingWizard />}
      <TelemetryProvider>
        <ThemeProvider>
          <SettingsProvider>
            <AIProviderState>
              {/* Missing Config Banner */}
              <MissingConfigBanner />

              {/* Offline Mode Indicator */}
              <OfflineIndicator />

              {/* Skip to main content link (A11y) */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
              >
                Skip to main content
              </a>

              {/* Desktop Sidebar (>= lg) */}
              <Sidebar />

              {/* Main content with sidebar offset on desktop */}
              <div id="main-content" className="lg:pl-20">
                <RoutesRoot />
                <GlobalInstruments />
              </div>

              {/* Mobile Bottom Nav (< lg) */}
              <BottomNav />
            </AIProviderState>
          </SettingsProvider>
        </ThemeProvider>
      </TelemetryProvider>
    </>
  )
}

export default App
