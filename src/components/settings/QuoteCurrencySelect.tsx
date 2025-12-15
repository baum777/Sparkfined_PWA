import type { QuoteCurrency } from '@/types/currency'
import { useSettings } from '@/state/settings'

const QUOTE_OPTIONS: QuoteCurrency[] = ['USD', 'EUR']

export function QuoteCurrencySelect() {
  const { settings, setSettings } = useSettings()

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({ quoteCurrency: event.target.value as QuoteCurrency })
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-3 last:border-b-0">
      <div>
        <div className="text-sm font-medium text-text-primary">Quote Currency</div>
        <p className="text-xs text-text-secondary">Used for holdings &amp; trade log formatting.</p>
      </div>
      <select
        value={settings.quoteCurrency}
        onChange={handleChange}
        className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary shadow-card-subtle transition focus:outline-none focus:ring-2 focus:ring-brand/40"
      >
        {QUOTE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}
