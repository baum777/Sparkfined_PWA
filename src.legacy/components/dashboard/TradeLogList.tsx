import type { TradeEntry } from '@/lib/db'
import type { QuoteCurrency } from '@/types/currency'
import { formatMoney } from '@/lib/format/money'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { ListRow } from '@/components/ui/ListRow'
import Button from '@/components/ui/Button'

interface TradeLogListProps {
  trades: TradeEntry[]
  quoteCurrency: QuoteCurrency
  onMarkEntry?: () => void
  isMarkEntryDisabled?: boolean
  className?: string
}

const MAX_DISPLAY_TRADES = 3

export function TradeLogList({ trades, quoteCurrency, onMarkEntry, isMarkEntryDisabled, className }: TradeLogListProps) {
  const displayedTrades = trades.slice(0, MAX_DISPLAY_TRADES)
  const totalCount = trades.length

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp)
  }

  const cardClassName = className ?? 'shadow-card-subtle'

  return (
    <Card variant="glass" className={cardClassName} data-testid="dashboard-tradelog-snapshot">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-text-tertiary">Trade Log</p>
            <CardTitle className="dashboard-section-heading">Recent entries</CardTitle>
          </div>
          {totalCount > 0 && (
            <Badge variant="info" data-testid="tradelog-count">
              {totalCount} saved
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {trades.length === 0 ? (
          <EmptyState
            illustration="journal"
            title="No trades logged"
            description="Start documenting your trades to build a history and track your performance over time."
            action={
              onMarkEntry
                ? {
                    label: 'Mark entry',
                    onClick: onMarkEntry,
                  }
                : undefined
            }
            compact
            data-testid="tradelog-empty-state"
          />
        ) : (
          <div className="space-y-2">
            {displayedTrades.map((trade) => (
              <ListRow
                key={trade.id ?? `${trade.token}-${trade.timestamp}`}
                title={trade.token}
                subtitle={formatDate(trade.timestamp)}
                meta={
                  <span className="font-medium text-text-primary">
                    {formatMoney(trade.price, quoteCurrency)}
                  </span>
                }
                data-testid="tradelog-row"
              />
            ))}
            {totalCount > MAX_DISPLAY_TRADES && (
              <p className="pt-1 text-center text-xs text-text-tertiary">
                +{totalCount - MAX_DISPLAY_TRADES} more trade{totalCount - MAX_DISPLAY_TRADES > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </CardContent>

      {onMarkEntry && (
        <CardFooter className="mt-3 flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={onMarkEntry}
            disabled={isMarkEntryDisabled}
            data-testid="tradelog-mark-entry"
          >
            Mark entry
            {!isMarkEntryDisabled && trades.length === 0 && (
              <span className="ml-1.5 inline-flex h-2 w-2 rounded-full bg-brand animate-pulse" />
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
