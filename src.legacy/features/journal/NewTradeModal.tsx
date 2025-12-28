import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'

export interface NewTradeModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Stub modal for future journal entry points.
 * Current UX surfaces journaling directly on JournalPage, so this modal is unused.
 */
export function NewTradeModal({ open, onClose }: NewTradeModalProps) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur"
    >
      <Card className="w-full max-w-md border-border/70 bg-surface shadow-card-subtle">
        <CardHeader>
          <CardTitle className="text-base">New trade (stub)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-text-secondary">
          <p>
            The journal flow mounts inline on the Journal page today. This modal remains as a placeholder for future
            quick-add trade entry triggers.
          </p>
          <Button type="button" variant="primary" onClick={onClose} className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default NewTradeModal
