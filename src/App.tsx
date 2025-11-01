import { SettingsProvider } from './state/settings'
import { TelemetryProvider } from './state/telemetry'
import RoutesRoot from './routes/RoutesRoot'
import GlobalInstruments from './pages/_layout/GlobalInstruments'
import './styles/App.css'

function App() {
  return (
    <TelemetryProvider>
      <SettingsProvider>
        <RoutesRoot />
        <GlobalInstruments />
      </SettingsProvider>
    </TelemetryProvider>
  )
}

export default App
