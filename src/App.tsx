import { SettingsProvider } from './state/settings'
import { TelemetryProvider } from './state/telemetry'
import { AIProviderState } from './state/ai'
import RoutesRoot from './routes/RoutesRoot'
import GlobalInstruments from './pages/_layout/GlobalInstruments'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/BottomNav'
import MissingConfigBanner from './components/MissingConfigBanner'
import useSwipeNavigation from './hooks/useSwipeNavigation'
import './styles/App.css'

function App() {
  // Enable swipe navigation globally (can be disabled per-page if needed)
  useSwipeNavigation({ enabled: true });
  
  return (
    <TelemetryProvider>
      <SettingsProvider>
        <AIProviderState>
          {/* Missing Config Banner */}
          <MissingConfigBanner />
          
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
    </TelemetryProvider>
  )
}

export default App
