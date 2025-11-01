import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import UpdateBanner from './components/UpdateBanner'
import { AccessProvider } from './store/AccessProvider'
import { SettingsProvider } from './state/settings'
import AnalyzePage from './pages/AnalyzePage'
import ChartPage from './pages/ChartPage'
import JournalPage from './pages/JournalPage'
import ReplayPage from './pages/ReplayPage'
import AccessPage from './pages/AccessPage'
import SettingsPage from './pages/SettingsPage'
import './styles/App.css'

function App() {
  return (
    <Router>
      <SettingsProvider>
        <AccessProvider>
          <UpdateBanner />
          <Layout>
            <Routes>
              <Route path="/" element={<AnalyzePage />} />
              <Route path="/chart" element={<ChartPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/replay" element={<ReplayPage />} />
              <Route path="/access" element={<AccessPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Layout>
        </AccessProvider>
      </SettingsProvider>
    </Router>
  )
}

export default App
