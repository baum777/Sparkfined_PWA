import { Button } from '@/components/ui'
import { Collapsible } from '@/components/ui/Collapsible'
import SettingsCard from './SettingsCard'
import TokenUsageCard from './TokenUsageCard'
import PwaUpdateCard from './PwaUpdateCard'
import AppearanceCard from './AppearanceCard'
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
          <AppearanceCard />
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
          <SettingsCard
            title="Data safety & backups"
            subtitle="Back up exports, recovery codes, and cache controls."
            actions={<Button size="sm">Export snapshot</Button>}
          >
            <PlaceholderList
              items={[
                { title: 'Backup destinations', description: 'Local export and cloud sync connectors.', badge: 'Soon' },
                { title: 'Recovery codes', description: 'Generate and verify recovery kits for journal data.' },
                {
                  title: 'Cache controls',
                  description: 'Clear offline cache, revoke device sessions, or force data refresh.',
                },
              ]}
            />
          </SettingsCard>
        </div>

        <div role="listitem">
          <PwaUpdateCard />
        </div>

        <div role="listitem">
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
    </div>
  )
}
