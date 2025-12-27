import React from 'react'
import Button from '../ui/Button'
import { downloadAllAppData } from '@/lib/export/appDataExportService'
import {
  downloadJournalAsJSON,
  downloadJournalAsMarkdown,
  handleJournalImport,
} from '@/lib/export/journalExportService'
import type { ImportOptions } from '@/lib/export/exportTypes'
import { Telemetry } from '@/lib/TelemetryService'

export function JournalDataControls(): JSX.Element {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [importMode, setImportMode] = React.useState<ImportOptions['mode']>('merge')
  const [status, setStatus] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setStatus('Importing journal...')
    setMessage(null)
    setError(null)
    try {
      const result = await handleJournalImport(file, { mode: importMode })
      setMessage(`Import successful: ${result.imported} entries, ${result.skipped} skipped.`)
      Telemetry.log('ui.settings.import_completed', 1, {
        imported: result.imported,
        skipped: result.skipped,
        mode: importMode,
      })
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Import failed'
      setError(reason)
    } finally {
      setStatus(null)
      event.target.value = ''
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface/80 p-4 shadow-card-subtle" data-testid="journal-data-controls">
      <p className="mb-4 text-xs text-text-secondary">
        Export your journal as JSON or Markdown, download a full app backup, or import a saved journal bundle.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            Telemetry.log('ui.settings.export_started', 1, { export: 'journal_json' })
            downloadJournalAsJSON()
          }}
          data-testid="export-journal-json"
        >
          Export Journal (JSON)
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            Telemetry.log('ui.settings.export_started', 1, { export: 'journal_markdown' })
            downloadJournalAsMarkdown()
          }}
          data-testid="export-journal-markdown"
        >
          Export Journal (Markdown)
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            Telemetry.log('ui.settings.export_started', 1, { export: 'app_backup' })
            downloadAllAppData()
          }}
          data-testid="export-app-data"
        >
          Export All App Data
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-text-primary">
        <label className="flex items-center gap-2">
          <span className="text-text-secondary">Import mode</span>
          <select
            value={importMode}
            onChange={(event) => setImportMode(event.target.value as ImportOptions['mode'])}
            className="rounded-lg border border-border bg-surface-elevated px-2 py-1 text-xs"
            data-testid="journal-import-mode"
          >
            <option value="merge">Merge</option>
            <option value="replace">Replace</option>
          </select>
        </label>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          data-testid="journal-import-button"
        >
          Import Journal (JSON)
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={onFileChange}
          data-testid="journal-import-input"
        />
      </div>
      {status ? <div className="mt-2 text-[11px] text-text-secondary">{status}</div> : null}
      {message ? <div className="mt-2 text-[11px] text-success">{message}</div> : null}
      {error ? <div className="mt-2 text-[11px] text-danger">{error}</div> : null}
    </div>
  )
}

export default JournalDataControls
