import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import UpdateBanner from './components/UpdateBanner'
import { AccessProvider } from './store/AccessProvider'
import AnalyzePage from './pages/AnalyzePage'
import JournalPage from './pages/JournalPage'
import ReplayPage from './pages/ReplayPage'
import AccessPage from './pages/AccessPage'
import './styles/App.css'

function App() {
  return (
    <Router>
      <AccessProvider>
        <UpdateBanner />
        <Layout>
          <Routes>
            <Route path="/" element={<AnalyzePage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/replay" element={<ReplayPage />} />
            <Route path="/access" element={<AccessPage />} />
          </Routes>
        </Layout>
      </AccessProvider>
    </Router>
  )
}

export default App
