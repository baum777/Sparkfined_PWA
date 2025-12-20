import Button from '@/components/ui/Button'
import { Collapsible } from '@/components/ui/Collapsible'
import SettingsCard from './SettingsCard'
import PwaUpdateCard from './PwaUpdateCard'
import AppearanceCard from './AppearanceCard'
import TokenUsageCard from './TokenUsageCard'
import './settings.css'

function PlaceholderList({ items }: { items: string[] }) {
  return (
    <ul className="settings-placeholder-list">
      {items.map((item) => (
        <li key={item} className="settings-placeholder-pill">
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function SettingsPage() {
  const handleExportAll = () => {
    console.info('[Settings] Export All requested (stub)')
  }

  const handleResetDefaults = () => {
    console.info('[Settings] Reset Defaults requested (stub)')
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="settings-header__titles">
          <p className="settings-kicker">Control Center</p>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">
            Manage preferences, data backups, wallet monitoring and app controls.
          </p>
        </div>
        <div className="settings-actions">
          <Button variant="outline" size="sm" onClick={handleExportAll} aria-label="Export all settings">
            Export All
          </Button>
          <Button variant="ghost" size="sm" onClick={handleResetDefaults} aria-label="Reset settings to defaults">
            Reset Defaults
          </Button>
        </div>
      </header>

      <div className="settings-stack">
        <AppearanceCard />

        <TokenUsageCard />

        <SettingsCard
          title="Profile & preferences"
          subtitle="Configure trading workspace, alerts, and journal preferences."
        >
          <PlaceholderList items={["Workspace", "Alerts", "Journal", "Shortcuts"]} />
        </SettingsCard>

        <SettingsCard
          title="Data backups"
          subtitle="Exports, recovery codes, and cloud sync controls live here."
        >
          <div className="settings-placeholder-row">
            <div className="settings-placeholder-block" />
            <div className="settings-placeholder-block" />
            <div className="settings-placeholder-block" />
          </div>
        </SettingsCard>

        <PwaUpdateCard />

        <SettingsCard
          title="Danger Zone"
          subtitle="Factory reset, cache clears, and destructive controls are grouped here."
        >
          <Collapsible
            title={
              <div className="settings-danger-title">
                <span>Destructive actions</span>
                <span className="settings-danger-pill">Locked</span>
              </div>
            }
            defaultOpen={false}
            variant="card"
            className="settings-danger"
          >
            <p className="settings-danger-copy">
              Accordion behavior ships in WP-096. This placeholder reserves layout space for destructive controls.
            </p>
          </Collapsible>
        </SettingsCard>
      </div>
    </div>
  )
}
