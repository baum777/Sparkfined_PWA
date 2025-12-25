import { useState } from 'react'
import { Button } from '@/components/ui'
import { Collapsible } from '@/components/ui/Collapsible'
import { AlertTriangle, RefreshCw, Trash2 } from '@/lib/icons'

const actions = [
  {
    id: 'factory-reset',
    label: 'Factory reset workspace',
    description: 'Clears local settings, cache, and mock data. No remote calls are made.',
    icon: <Trash2 size={18} aria-hidden />,
  },
  {
    id: 'clear-cache',
    label: 'Clear offline cache',
    description: 'Removes cached assets and forces a full reload on next visit.',
    icon: <RefreshCw size={18} aria-hidden />,
  },
]

export default function DangerZoneAccordion() {
  const [confirming, setConfirming] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('Dangerous actions are gated behind confirmation.')

  const handleAction = (id: string) => {
    if (confirming === id) {
      setConfirming(null)
      setMessage(`Action "${id}" acknowledged (stub only; no data mutated).`)
      return
    }

    setConfirming(id)
    setMessage('Click the highlighted action again to confirm.')
  }

  return (
    <Collapsible
      title={
        <div className="settings-danger-title">
          <span>Destructive actions</span>
          <span className="settings-danger-pill">Use with caution</span>
        </div>
      }
      defaultOpen={false}
      variant="card"
      className="settings-danger"
    >
      <div className="settings-danger-copy">{message}</div>
      <div className="settings-danger-actions" role="list">
        {actions.map((action) => {
          const isConfirming = confirming === action.id
          return (
            <div key={action.id} className="settings-danger-row" role="listitem">
              <div className="settings-danger-icon" aria-hidden>
                {action.icon}
              </div>
              <div className="settings-danger-meta">
                <p className="settings-danger-label">{action.label}</p>
                <p className="settings-danger-description">{action.description}</p>
              </div>
              <Button
                variant={isConfirming ? 'destructive' : 'outline'}
                size="sm"
                aria-pressed={isConfirming}
                onClick={() => handleAction(action.id)}
              >
                {isConfirming ? 'Confirm' : 'Prepare'}
              </Button>
            </div>
          )
        })}
      </div>
      <div className="settings-danger-hint">
        <AlertTriangle size={16} aria-hidden /> These controls are mocked; no real data is deleted.
      </div>
    </Collapsible>
  )
}
