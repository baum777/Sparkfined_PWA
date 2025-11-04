import { SettingsProvider } from './state/settings'
import { TelemetryProvider } from './state/telemetry'
import { AIProviderState } from './state/ai'
import RoutesRoot from './routes/RoutesRoot'
import GlobalInstruments from './pages/_layout/GlobalInstruments'
import WelcomeTour from './components/onboarding/WelcomeTour'
import PWAInstallPrompt from './components/onboarding/PWAInstallPrompt'
import './styles/App.css'

function App() {
  return (
    <TelemetryProvider>
      <SettingsProvider>
        <AIProviderState>
          <RoutesRoot />
          <GlobalInstruments />
          
          {/* Onboarding Components */}
          <WelcomeTour />
          <PWAInstallPrompt />
        </AIProviderState>
      </SettingsProvider>
    </TelemetryProvider>
  )
}

export default App
