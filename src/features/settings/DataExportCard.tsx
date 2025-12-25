import { useMemo, useState } from 'react'
import { Button } from '@/components/ui'
import { Download, FileCheck } from '@/lib/icons'
import SettingsCard from './SettingsCard'

type ExportFormat = 'json' | 'markdown' | 'backup'

type ExportSummary = {
  version: string
  generatedAt: string
  journalEntries: number
  alerts: number
  watchlist: number
}

const buildSummary = (): ExportSummary => ({
  version: '0.1.0',
  generatedAt: new Date().toISOString(),
  journalEntries: 0,
  alerts: 0,
  watchlist: 0,
})

const createMarkdown = (summary: ExportSummary) => {
  return [
    '# Sparkfined Backup',
    `Generated: ${summary.generatedAt}`,
    '',
    '## Counts',
    `- Journal entries: ${summary.journalEntries}`,
    `- Alerts: ${summary.alerts}`,
    `- Watchlist items: ${summary.watchlist}`,
    '',
    '_Mock export placeholder — replace with real data feed when backend is connected._',
  ].join('\n')
}

const downloadFile = (content: string, filename: string, mime: string) => {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function DataExportCard() {
  const [message, setMessage] = useState<string>('No exports yet.')
  const summary = useMemo(() => buildSummary(), [])

  const handleExport = (format: ExportFormat) => {
    const payload = {
      summary,
      payload: { note: 'Mock export — replace with real data stream' },
    }

    if (format === 'json') {
      downloadFile(JSON.stringify(payload, null, 2), 'sparkfined-backup.json', 'application/json')
      setMessage('Exported mock JSON backup to sparkfined-backup.json')
      return
    }

    if (format === 'markdown') {
      downloadFile(createMarkdown(summary), 'sparkfined-backup.md', 'text/markdown')
      setMessage('Exported markdown summary to sparkfined-backup.md')
      return
    }

    downloadFile(JSON.stringify(payload), 'sparkfined-backup.zip', 'application/zip')
    setMessage('Created lightweight backup stub (zip placeholder).')
  }

  return (
    <SettingsCard
      title="Data export"
      subtitle="Download a portable backup stub while backend connectors are offline."
      actions={
        <span className="settings-pill settings-pill--muted" aria-live="polite">
          <FileCheck size={16} aria-hidden /> {summary.version}
        </span>
      }
    >
      <div className="settings-export-grid">
        <div>
          <p className="settings-export-copy">Download a local snapshot in your preferred format.</p>
          <div className="settings-export-actions">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleExport('json')}
              leftIcon={<Download size={16} aria-hidden />}
              aria-label="Export mock data as JSON"
            >
              Export JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('markdown')}
              leftIcon={<Download size={16} aria-hidden />}
              aria-label="Export mock data as Markdown"
            >
              Export Markdown
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport('backup')}
              leftIcon={<Download size={16} aria-hidden />}
              aria-label="Export backup stub"
            >
              Backup stub
            </Button>
          </div>
        </div>
        <div className="settings-export-summary" aria-live="polite" data-testid="export-summary">
          <p className="settings-export-title">Snapshot summary</p>
          <dl>
            <div className="settings-export-row">
              <dt>Generated</dt>
              <dd>{new Date(summary.generatedAt).toLocaleString()}</dd>
            </div>
            <div className="settings-export-row">
              <dt>Journal entries</dt>
              <dd>{summary.journalEntries}</dd>
            </div>
            <div className="settings-export-row">
              <dt>Alerts</dt>
              <dd>{summary.alerts}</dd>
            </div>
            <div className="settings-export-row">
              <dt>Watchlist items</dt>
              <dd>{summary.watchlist}</dd>
            </div>
          </dl>
          <p className="settings-export-footnote">{message}</p>
        </div>
      </div>
    </SettingsCard>
  )
}
