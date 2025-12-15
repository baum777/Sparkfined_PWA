import React from 'react'
import { Button, Drawer } from '@/components/ui'
import type { TradeEventInboxItem } from '@/hooks/useTradeEventInbox'
import { cn } from '@/lib/ui/cn'

interface LogEntryOverlayPanelProps {
  isOpen: boolean
  onClose: () => void
  events: Array<TradeEventInboxItem & { formattedTimestamp: string }>
  isLoading: boolean
  onSelect: (event: TradeEventInboxItem) => void
}

function truncateHash(txHash: string): string {
  if (txHash.length <= 12) return txHash
  return `${txHash.slice(0, 6)}…${txHash.slice(-4)}`
}

function formatPair(event: TradeEventInboxItem): string | null {
  if (event.baseSymbol && event.quoteSymbol) return `${event.baseSymbol}/${event.quoteSymbol}`
  if (event.baseSymbol) return event.baseSymbol
  return null
}

export function LogEntryOverlayPanel({ isOpen, onClose, events, isLoading, onSelect }: LogEntryOverlayPanelProps) {
  const hasEvents = events.length > 0

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Log entry inbox" subtitle="Unjournaled BUY trades" width="lg">
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3" data-testid="log-entry-overlay-loading">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-surface/60" />
            ))}
          </div>
        ) : !hasEvents ? (
          <div className="rounded-2xl border border-border/70 bg-surface/80 p-6 text-sm text-text-secondary" data-testid="log-entry-overlay-empty">
            No BUY trades awaiting journaling. Fresh events will appear here automatically.
          </div>
        ) : (
          <div className="space-y-3" data-testid="log-entry-overlay-list">
            {events.map((event) => {
              const pairLabel = formatPair(event)
              return (
                <article
                  key={event.id ?? event.txHash}
                  className="rounded-2xl border border-border/70 bg-surface/80 p-4 shadow-card-subtle"
                  aria-label={`Trade ${event.txHash}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-text-tertiary">{event.walletNickname}</p>
                      <p className="text-sm font-medium text-text-primary">{event.formattedTimestamp}</p>
                      <p className="text-xs text-text-secondary">{truncateHash(event.txHash)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                          event.side === 'BUY'
                            ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40'
                            : 'bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/40',
                        )}
                      >
                        {event.side}
                      </span>
                      {pairLabel ? <span className="rounded-full bg-surface/80 px-3 py-1 text-text-secondary">{pairLabel}</span> : null}
                      {event.amount != null ? (
                        <span className="rounded-full bg-surface/80 px-3 py-1 text-text-secondary">
                          {event.amount} {event.baseSymbol ?? ''}
                        </span>
                      ) : null}
                      {event.price != null ? (
                        <span className="rounded-full bg-surface/80 px-3 py-1 text-text-secondary">@ {event.price}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    <Button
                      variant="primary"
                      onClick={() => onSelect(event)}
                      data-testid={`journal-trade-${event.id ?? event.txHash}`}
                    >
                      Journal this Trade
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </Drawer>
  )
}

export default LogEntryOverlayPanel
