import { SettingsProvider } from './state/settings'
import RoutesRoot from './routes/RoutesRoot'
import './styles/App.css'

function App() {
  return (
    <SettingsProvider>
      <RoutesRoot />
    </SettingsProvider>
  )
}

export default App
