import type { TradeEntry } from '@/lib/db'
import type { QuoteCurrency } from '@/types/currency'
import { formatMoney } from '@/lib/format/money'

interface TradeLogListProps {
  trades: TradeEntry[]
  quoteCurrency: QuoteCurrency
}

export function TradeLogList({ trades, quoteCurrency }: TradeLogListProps) {
  return (
    <div className="rounded-3xl border border-border bg-surface/80 p-4 shadow-card-subtle">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-tertiary">Trade Log</p>
          <p className="text-sm font-semibold text-text-primary">Recent entries</p>
        </div>
        <span className="text-xs text-text-secondary">{trades.length} saved</span>
      </div>

      {trades.length === 0 ? (
        <p className="text-xs text-text-secondary">No trades saved yet. Use “Mark Entry” to start logging.</p>
      ) : (
        <ul className="space-y-3">
          {trades.map((trade) => (
            <li key={trade.id ?? `${trade.token}-${trade.timestamp}`} className="flex items-center justify-between rounded-2xl bg-surface-subtle px-3 py-2">
              <div>
                <div className="text-sm font-semibold text-text-primary">{trade.token}</div>
                <div className="text-xs text-text-secondary">{new Date(trade.timestamp).toLocaleDateString()}</div>
              </div>
              <div className="text-sm font-semibold text-text-primary">
                {formatMoney(trade.price, quoteCurrency)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
