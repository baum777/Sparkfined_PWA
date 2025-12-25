import { useMemo } from 'react'
import { Laptop2, Moon, Sun, SunMoon } from '@/lib/icons'
import { useTheme, type ThemeMode } from '@/lib/theme/useTheme'
import { cn } from '@/lib/ui/cn'
import SettingsCard from './SettingsCard'

interface ThemeOption {
  value: ThemeMode
  label: string
  description: string
  icon: JSX.Element
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'system',
    label: 'System default',
    description: 'Follows your OS preference and updates automatically.',
    icon: <Laptop2 aria-hidden className="appearance-option__icon" />,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Low-glare surfaces tuned for focus and night sessions.',
    icon: <Moon aria-hidden className="appearance-option__icon" />,
  },
  {
    value: 'light',
    label: 'Light',
    description: 'High-contrast surfaces for bright environments.',
    icon: <Sun aria-hidden className="appearance-option__icon" />,
  },
]

const toneFromTheme = (resolvedTheme: 'dark' | 'light') =>
  resolvedTheme === 'dark' ? 'appearance-tone--dark' : 'appearance-tone--light'

function ThemeOptionButton({
  option,
  active,
  resolvedTheme,
  onSelect,
}: {
  option: ThemeOption
  active: boolean
  resolvedTheme: 'dark' | 'light'
  onSelect: (value: ThemeMode) => void
}) {
  const description =
    option.value === 'system'
      ? `${option.description} Currently ${resolvedTheme} based on your device.`
      : option.description

  return (
    <button
      type="button"
      className={cn('appearance-option', active && 'appearance-option--active')}
      onClick={() => onSelect(option.value)}
      aria-pressed={active}
      role="listitem"
    >
      <div className="appearance-option__leading">
        <span className="appearance-option__badge">{option.icon}</span>
        <div className="appearance-option__copy">
          <span className="appearance-option__label">{option.label}</span>
          <span className="appearance-option__description">{description}</span>
        </div>
      </div>
      <span className={cn('appearance-option__status', toneFromTheme(resolvedTheme))}>
        {active ? 'Active' : 'Select'}
      </span>
    </button>
  )
}

export default function AppearanceCard() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const statusLabel = useMemo(() => {
    if (theme === 'system') return `System · currently ${resolvedTheme}`
    return theme === 'dark' ? 'Dark mode' : 'Light mode'
  }, [resolvedTheme, theme])

  return (
    <SettingsCard
      title="Appearance & theme"
      subtitle="Choose how Sparkfined should look across devices."
      actions={
        <div className="appearance-status">
          <SunMoon aria-hidden className="appearance-status__icon" />
          <div className="appearance-status__meta">
            <span className="appearance-status__label">Theme</span>
            <strong className="appearance-status__value">{statusLabel}</strong>
          </div>
        </div>
      }
    >
      <div className="appearance-preview" data-tone={resolvedTheme} aria-live="polite">
        <div className="appearance-preview__glow" />
        <div className="appearance-preview__card">
          <div className="appearance-preview__pill" />
          <div className="appearance-preview__title">Sparkfined</div>
          <div className="appearance-preview__rows">
            <div className="appearance-preview__row appearance-preview__row--strong" />
            <div className="appearance-preview__row" />
            <div className="appearance-preview__row" />
          </div>
        </div>
        <p className="appearance-preview__hint">
          Themes are stored locally and synced to the design tokens on this device.
        </p>
      </div>

      <div className="appearance-options" role="list">
        {THEME_OPTIONS.map((option) => (
          <ThemeOptionButton
            key={option.value}
            option={option}
            active={theme === option.value}
            resolvedTheme={resolvedTheme}
            onSelect={setTheme}
          />
        ))}
      </div>
    </SettingsCard>
  )
}
