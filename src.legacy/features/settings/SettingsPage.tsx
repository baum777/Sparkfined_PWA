import { Button } from '@/components/ui'
import SettingsCard from './SettingsCard'
import TokenUsageCard from './TokenUsageCard'
import PwaUpdateCard from './PwaUpdateCard'
import AppearanceCard from './AppearanceCard'
import WalletMonitoringCard from './WalletMonitoringCard'
import DataExportCard from './DataExportCard'
import DataImportCard from './DataImportCard'
import PreferencesCard from './PreferencesCard'
import DangerZoneAccordion from './DangerZoneAccordion'
import './settings.css'

type PillItem = {
  label: string
  tone?: 'default' | 'success' | 'muted'
}

type ListItem = {
  title: string
  description: string
  badge?: string
}

function PillRow({ items }: { items: PillItem[] }) {
  return (
    <div className="settings-pill-row" role="list">
      {items.map((item) => (
        <span
          key={item.label}
          className={`settings-pill settings-pill--${item.tone ?? 'default'}`}
          role="listitem"
        >
          {item.label}
        </span>
      ))}
    </div>
  )
}

function PlaceholderList({ items }: { items: ListItem[] }) {
  return (
    <ul className="settings-list" role="list">
      {items.map((item) => (
        <li key={item.title} className="settings-list__item" role="listitem">
          <div className="settings-list__titles">
            <p className="settings-list__title">{item.title}</p>
            <p className="settings-list__description">{item.description}</p>
          </div>
          {item.badge ? <span className="settings-list__badge">{item.badge}</span> : null}
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
      <header className="settings-hero">
        <div className="settings-hero__titles">
          <p className="settings-kicker">Control Center</p>
          <div className="settings-title-row">
            <h1 className="settings-title">Settings</h1>
            <span className="settings-pill settings-pill--muted">Beta Shell</span>
          </div>
          <p className="settings-subtitle">
            Configure your Sparkfined workspace, monitor budgets, and keep the PWA fresh. Cards stay lightweight
            and tokenized until underlying services are connected.
          </p>
          <PillRow
            items={[
              { label: 'Offline-ready PWA', tone: 'success' },
              { label: 'Design tokens enforced' },
              { label: 'Cards stack on mobile', tone: 'muted' },
            ]}
          />
        </div>
        <div className="settings-actions">
          <Button variant="secondary" size="sm" onClick={handleExportAll} aria-label="Export all settings">
            Export workspace
          </Button>
          <Button variant="ghost" size="sm" onClick={handleResetDefaults} aria-label="Reset settings to defaults">
            Reset defaults
          </Button>
        </div>
      </header>

      <div className="settings-stack" aria-label="Settings cards" role="list">
        <div role="listitem">
          <TokenUsageCard />
        </div>

        <div role="listitem">
          <WalletMonitoringCard />
        </div>

        <div role="listitem">
          <AppearanceCard />
        </div>

        <div role="listitem">
          <PreferencesCard />
        </div>

        <div role="listitem">
          <SettingsCard
            title="Workspace & preferences"
            subtitle="Organize how Sparkfined behaves across devices."
            actions={<Button size="sm" variant="ghost">Configure</Button>}
          >
            <PlaceholderList
              items={[
                { title: 'Workspace layouts', description: 'Dashboard, chart shell, and journal defaults.' },
                { title: 'Alerts & notifications', description: 'Thresholds, quiet hours, and device routing.' },
              ]}
            />
          </SettingsCard>
        </div>

        <div role="listitem">
          <DataExportCard />
        </div>

        <div role="listitem">
          <DataImportCard />
        </div>

        <div role="listitem">
          <PwaUpdateCard />
        </div>

        <div role="listitem">
          <DangerZoneAccordion />
        </div>
      </div>
    </div>
  )
}
