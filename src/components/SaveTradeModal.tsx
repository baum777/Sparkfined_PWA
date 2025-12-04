import { useState, useEffect, useRef, useId } from 'react'
import type { MouseEvent } from 'react'
import { saveTrade } from '@/lib/db'
import type { TradeEntry } from '@/lib/db'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { Button } from '@/design-system'

interface SaveTradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
  prefillToken?: string
  prefillPrice?: number
}

export default function SaveTradeModal({
  isOpen,
  onClose,
  onSaved,
  prefillToken = '',
  prefillPrice = 0,
}: SaveTradeModalProps) {
  const [token, setToken] = useState(prefillToken)
  const [price, setPrice] = useState(prefillPrice.toString())
  const [status, setStatus] = useState<'Taken' | 'Planned'>('Taken')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const headingId = useId()
  const modalRef = useFocusTrap<HTMLDivElement>({
    isActive: isOpen,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  })

  const handleOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      setToken(prefillToken)
      setPrice(prefillPrice.toString())
    }
  }, [isOpen, prefillToken, prefillPrice])

  const handleSave = async () => {
    if (!token.trim() || !price || parseFloat(price) <= 0) {
      alert('Please fill in token and valid price')
      return
    }

    setIsSaving(true)
    try {
      const now = Date.now()
      const trade: Omit<TradeEntry, 'id'> = {
        token: token.trim(),
        price: parseFloat(price),
        timestamp: now,
        localTime: new Date(now).toISOString(),
        status,
        notes: notes.trim(),
        createdAt: now,
      }

      await saveTrade(trade)
      
      // Reset form
      setToken('')
      setPrice('')
      setStatus('Taken')
      setNotes('')
      
      onSaved?.()
      onClose()
    } catch (error) {
      console.error('Failed to save trade:', error)
      alert('Failed to save trade. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      onMouseDown={handleOverlayMouseDown}
      data-testid="modal-overlay"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-surface rounded-lg border border-border shadow-card-elevated max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up focus:outline-none"
        data-testid="modal-content"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 id={headingId} className="text-2xl font-display font-bold text-text-primary">
              Mark Entry
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary transition-colors duration-180 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-surface-hover"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="space-y-5">
            {/* Token */}
            <div>
              <label className="block text-sm font-sans font-medium text-text-secondary mb-2">
                Token <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g., BTC/USD, ETH"
                className="input"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-sans font-medium text-text-secondary mb-2">
                Price <span className="text-accent">*</span>
              </label>
              <input
                type="number"
                step="0.00000001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="input"
              />
            </div>

            {/* Status Toggle */}
            <div>
              <label className="block text-sm font-sans font-medium text-text-secondary mb-3">
                Status
              </label>
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'Taken'}
                    onChange={() => setStatus('Taken')}
                    className="peer sr-only"
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-surface border border-border text-text-secondary peer-checked:border-accent peer-checked:text-accent peer-checked:bg-accent/5 transition-all duration-180 hover:border-accent/50">
                    <span className="text-sm font-medium">Taken</span>
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'Planned'}
                    onChange={() => setStatus('Planned')}
                    className="peer sr-only"
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-surface border border-border text-text-secondary peer-checked:border-cyan peer-checked:text-cyan peer-checked:bg-cyan/5 transition-all duration-180 hover:border-cyan/50">
                    <span className="text-sm font-medium">Planned</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Timestamp display - Monospace precision */}
            <div className="p-4 bg-bg-card rounded-md border border-border-subtle">
              <div className="text-xs font-mono text-text-tertiary space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-secondary">UTC</span>
                  <span>{new Date().toUTCString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Local</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-sans font-medium text-text-secondary mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Trade reasoning, insights, or tape reading notes..."
                rows={4}
                className="input resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} isLoading={isSaving} className="flex-1">
              Save Entry
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
