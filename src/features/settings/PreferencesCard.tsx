import SettingsCard from './SettingsCard'
import { Button } from '@/components/ui'
import { Check, Target, Zap } from '@/lib/icons'
import { useUserSettingsStore } from '@/store/userSettings'

const chartStyles = [
  {
    value: 'pro' as const,
    title: 'Pro chart',
    description: 'Full overlays, indicators, and extended tooltips.',
    icon: <Target size={18} aria-hidden />,
  },
  {
    value: 'minimal' as const,
    title: 'Minimal chart',
    description: 'Cleaner view with muted overlays and fewer tooltips.',
    icon: <Zap size={18} aria-hidden />,
  },
]

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="settings-toggle-row">
      <div className="settings-toggle-row__copy">
        <p className="settings-toggle-row__label">{label}</p>
        <p className="settings-toggle-row__description">{description}</p>
      </div>
      <Button
        variant={value ? 'secondary' : 'outline'}
        size="sm"
        aria-pressed={value}
        aria-label={`${label} toggle`}
        onClick={() => onChange(!value)}
      >
        {value ? 'On' : 'Off'}
      </Button>
    </div>
  )
}

export default function PreferencesCard() {
  const { preferences, setPreference } = useUserSettingsStore()

  return (
    <SettingsCard
      title="Chart & app preferences"
      subtitle="Tune default chart style and confirmation prompts across the app."
    >
      <div className="settings-preferences-grid">
        <div className="settings-preferences-section">
          <p className="settings-preferences-title">Default chart style</p>
          <div className="settings-preferences-options" role="list">
            {chartStyles.map((style) => {
              const isActive = preferences.chartStyle === style.value
              return (
                <button
                  key={style.value}
                  type="button"
                  className={`settings-preference ${isActive ? 'settings-preference--active' : ''}`}
                  onClick={() => setPreference('chartStyle', style.value)}
                  aria-pressed={isActive}
                  role="listitem"
                >
                  <div className="settings-preference__icon">{style.icon}</div>
                  <div className="settings-preference__copy">
                    <p className="settings-preference__title">{style.title}</p>
                    <p className="settings-preference__description">{style.description}</p>
                  </div>
                  {isActive ? <Check size={18} className="settings-preference__check" aria-hidden /> : null}
                </button>
              )
            })}
          </div>
        </div>

        <div className="settings-preferences-section">
          <p className="settings-preferences-title">App behavior</p>
          <div className="settings-preferences-flags">
            <ToggleRow
              label="Confirm actions"
              description="Require a confirmation step before placing alerts or trades."
              value={preferences.confirmBeforeActions}
              onChange={(next) => setPreference('confirmBeforeActions', next)}
            />
            <ToggleRow
              label="Auto-sync watchlist"
              description="Sync watchlist updates across devices when online."
              value={preferences.autoSyncWatchlist}
              onChange={(next) => setPreference('autoSyncWatchlist', next)}
            />
          </div>
        </div>
      </div>
    </SettingsCard>
  )
}
