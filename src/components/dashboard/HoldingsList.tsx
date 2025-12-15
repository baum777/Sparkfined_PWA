import type { QuoteCurrency } from '@/types/currency'
import { formatMoney } from '@/lib/format/money'

export interface HoldingPosition {
  token: string
  amount: number
  value: number
}

interface HoldingsListProps {
  holdings: HoldingPosition[]
  quoteCurrency: QuoteCurrency
}

export function HoldingsList({ holdings, quoteCurrency }: HoldingsListProps) {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0)

  return (
    <div className="rounded-3xl border border-border bg-surface/80 p-4 shadow-card-subtle">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-tertiary">Holdings</p>
          <p className="text-sm font-semibold text-text-primary">Portfolio snapshot</p>
        </div>
        <div className="text-sm font-semibold text-text-primary">
          {formatMoney(totalValue, quoteCurrency)}
        </div>
      </div>

      {holdings.length === 0 ? (
        <p className="text-xs text-text-secondary">No holdings yet. Add trades to build your book.</p>
      ) : (
        <ul className="space-y-3">
          {holdings.map((holding) => (
            <li key={holding.token} className="flex items-center justify-between rounded-2xl bg-surface-subtle px-3 py-2">
              <div>
                <div className="text-sm font-semibold text-text-primary">{holding.token}</div>
                <div className="text-xs text-text-secondary">{holding.amount.toLocaleString()} units</div>
              </div>
              <div className="text-sm font-semibold text-text-primary">
                {formatMoney(holding.value, quoteCurrency)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
