import React from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ActionPanel() {
  return (
    <div className="sf-action-inner">
      <section className="sf-panel" aria-label="Trading actions">
        <header className="sf-panel-header">
          <div className="sf-panel-title">Trade</div>
          <div className="sf-panel-dna" />
        </header>

        <div className="sf-panel-body space-y-3">
          <div className="sf-seg" role="tablist" aria-label="Side">
            <button
              className="sf-seg-item sf-seg-active"
              type="button"
              role="tab"
              aria-selected="true"
            >
              Buy
            </button>
            <button
              className="sf-seg-item"
              type="button"
              role="tab"
              aria-selected="false"
            >
              Sell
            </button>
          </div>

          <div className="space-y-2">
            <div className="sf-field-row">
              <div className="sf-field-label">Size</div>
              <div className="sf-field-meta">USDC</div>
            </div>

            <Input placeholder="0.00" inputMode="decimal" className="sf-mono" />

            <div className="sf-chips">
              {['25%', '50%', '75%', '100%'].map((x) => (
                <button key={x} type="button" className="sf-chip">
                  {x}
                </button>
              ))}
            </div>
          </div>

          <div className="sf-subpanel">
            <div className="sf-subpanel-title">Risk</div>
            <div className="sf-subpanel-grid">
              <div>
                <div className="sf-mini-label">Max loss</div>
                <div className="sf-kpi sf-mono">—</div>
              </div>
              <div>
                <div className="sf-mini-label">RR preset</div>
                <div className="sf-kpi sf-mono">1 : 2</div>
              </div>
            </div>
            <div className="sf-divider" />
            <div className="sf-mini-row">
              <span className="sf-mini-label">Slippage guard</span>
              <button
                className="sf-toggle"
                type="button"
                aria-label="Toggle slippage guard"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="w-full">
              Set Alert
            </Button>
            <Button variant="outline" className="w-full">
              + Journal
            </Button>
          </div>

          <Button variant="primary" className="w-full">
            Confirm
          </Button>
        </div>
      </section>
    </div>
  )
}
