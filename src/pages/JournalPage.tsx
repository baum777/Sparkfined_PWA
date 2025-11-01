import { useState, useEffect, useCallback } from 'react'
import SaveTradeModal from '@/components/SaveTradeModal'
import ReplayModal from '@/components/ReplayModal'
import { getAllTrades, deleteTrade, exportTradesToCSV, downloadCSV, initDB } from '@/lib/db'
import type { TradeEntry } from '@/lib/db'
import { useEventLogger } from '@/hooks/useEventLogger'

export default function JournalPage() {
  const [trades, setTrades] = useState<TradeEntry[]>([])
  const [filteredTrades, setFilteredTrades] = useState<TradeEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isReplayOpen, setIsReplayOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'All' | 'Taken' | 'Planned'>('All')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const { log } = useEventLogger()

  const loadTrades = useCallback(async () => {
    try {
      const allTrades = await getAllTrades()
      setTrades(allTrades)
      log('journal_loaded', { count: allTrades.length })
    } catch (error) {
      console.error('Failed to load trades:', error)
    }
  }, [log])

  const applyFilters = useCallback(() => {
    let filtered = [...trades]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (trade) =>
          trade.token.toLowerCase().includes(query) || trade.notes.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter((trade) => trade.status === filterStatus)
    }

    // Sort
    filtered.sort((a, b) => {
      return sortBy === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    })

    setFilteredTrades(filtered)
  }, [trades, searchQuery, filterStatus, sortBy])

  useEffect(() => {
    initDB().then(loadTrades)
  }, [loadTrades])

  useEffect(() => {
    applyFilters()
  }, [trades, searchQuery, filterStatus, sortBy])

  const handleDeleteTrade = async (id: number) => {
    if (!confirm('Are you sure you want to delete this trade entry?')) return

    try {
      await deleteTrade(id)
      await loadTrades()
      log('trade_deleted', { tradeId: id })
    } catch (error) {
      console.error('Failed to delete trade:', error)
      alert('Failed to delete trade')
    }
  }

  const handleExportCSV = () => {
    const csv = exportTradesToCSV(filteredTrades)
    const filename = `sparkfined-trades-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(csv, filename)
    log('trades_exported', { count: filteredTrades.length })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const formatPrice = (price: number) => {
    if (price >= 1) return price.toLocaleString(undefined, { maximumFractionDigits: 2 })
    return price.toLocaleString(undefined, { maximumSignificantDigits: 6 })
  }

  const openReplay = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    setIsReplayOpen(true)
    log('replay_opened', { sessionId })
  }

  if (trades.length === 0) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-surface border border-border-accent/20 mb-2">
              <svg className="w-10 h-10 text-cyan" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </div>
            <div className="space-y-3">
              <h2 className="text-display-sm font-display font-bold text-text-primary">
                Trading Journal
              </h2>
              <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
                Document your tape reads. <span className="text-cyan font-medium">Track the insights.</span>
              </p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary mt-4">
              Create First Entry
            </button>
          </div>
        </div>
        <SaveTradeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={loadTrades}
        />
      </>
    )
  }

  return (
    <>
      <div className="p-4 space-y-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-display-sm font-display font-bold text-text-primary">Trade Journal</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="btn-ghost text-sm"
              disabled={filteredTrades.length === 0}
            >
              📊 Export
            </button>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary text-sm">
              + New Entry
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search token or notes..."
            className="input flex-1"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="input"
          >
            <option>All</option>
            <option>Taken</option>
            <option>Planned</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="input"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm font-mono text-text-tertiary">
          Showing {filteredTrades.length} of {trades.length} entries
        </div>

        {/* Grid of trades */}
        {filteredTrades.length === 0 ? (
          <div className="text-center py-12 text-text-tertiary">
            No trades match your filters
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrades.map((trade) => (
              <div key={trade.id} className="card-interactive">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-text-primary">
                      {trade.token}
                    </h3>
                    <div className="text-sm font-mono text-text-mono">
                      ${formatPrice(trade.price)}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-mono font-medium rounded-md border ${
                      trade.status === 'Taken'
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'bg-cyan/10 border-cyan text-cyan'
                    }`}
                  >
                    {trade.status}
                  </span>
                </div>

                {trade.notes && (
                  <p className="text-sm text-text-secondary mb-3 line-clamp-3 leading-relaxed">
                    {trade.notes}
                  </p>
                )}

                <div className="flex justify-between items-center text-xs font-mono text-text-tertiary mt-4 pt-3 border-t border-border-subtle">
                  <span>{formatDate(trade.timestamp)}</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openReplay(`session_${trade.createdAt}`)}
                      className="text-cyan hover:text-text-primary transition-colors duration-180"
                    >
                      🎬 Replay
                    </button>
                    <button
                      onClick={() => handleDeleteTrade(trade.id!)}
                      className="text-bear hover:text-text-primary transition-colors duration-180"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SaveTradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadTrades}
      />

      <ReplayModal
        isOpen={isReplayOpen}
        onClose={() => setIsReplayOpen(false)}
        sessionId={selectedSessionId}
      />
    </>
  )
}
