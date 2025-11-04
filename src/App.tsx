import { SettingsProvider } from './state/settings'
import { TelemetryProvider } from './state/telemetry'
import { AIProviderState } from './state/ai'
import RoutesRoot from './routes/RoutesRoot'
import GlobalInstruments from './pages/_layout/GlobalInstruments'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/BottomNav'
import useSwipeNavigation from './hooks/useSwipeNavigation'
import './styles/App.css'

function App() {
  // Enable swipe navigation globally (can be disabled per-page if needed)
  useSwipeNavigation({ enabled: true });
  
  return (
    <TelemetryProvider>
      <SettingsProvider>
        <AIProviderState>
          {/* Desktop Sidebar (>= lg) */}
          <Sidebar />
          
          {/* Main content with sidebar offset on desktop */}
          <div className="lg:pl-20">
            <RoutesRoot />
            <GlobalInstruments />
          </div>
          
          {/* Mobile Bottom Nav (< lg) */}
          <BottomNav />
        </AIProviderState>
      </SettingsProvider>
    </TelemetryProvider>
  )
}

export default App
