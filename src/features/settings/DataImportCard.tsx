import { useRef, useState } from 'react'
import { Button } from '@/components/ui'
import { Upload } from '@/lib/icons'
import SettingsCard from './SettingsCard'

type ImportStatus = 'idle' | 'success' | 'error'

const isMarkdownBackup = (content: string) => content.startsWith('# Sparkfined Backup')

const validateJsonBackup = (content: string) => {
  const parsed = JSON.parse(content) as unknown
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON payload')
  const record = parsed as Record<string, unknown>
  if (!record.summary || !record.payload) throw new Error('Missing summary or payload keys')
  return true
}

export default function DataImportCard() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [message, setMessage] = useState<string>('No imports yet.')

  const handleFilePick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      if (isMarkdownBackup(text)) {
        setStatus('success')
        setMessage(`Parsed markdown backup from ${file.name} (mock validate).`)
        return
      }

      validateJsonBackup(text)
      setStatus('success')
      setMessage(`Imported backup from ${file.name} (mock-only; no data written).`)
    } catch (error) {
      console.warn('Import failed', error)
      setStatus('error')
      setMessage('Invalid file format. Expect JSON or markdown created by Sparkfined.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <SettingsCard
      title="Data import"
      subtitle="Validate Sparkfined backup files locally. No data is written in this stub mode."
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={handleFilePick}
          leftIcon={<Upload size={16} aria-hidden />}
          aria-label="Choose backup file to import"
        >
          Choose file
        </Button>
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.md,.markdown,text/markdown,application/json"
        onChange={handleFileChange}
        className="sr-only"
        data-testid="import-input"
      />
      <div className="settings-import-body">
        <p className="settings-import-copy">
          Supports Sparkfined JSON or Markdown backups. Files are validated client-side only to preserve safety.
        </p>
        <div
          className={`settings-import-status settings-import-status--${status}`}
          role="status"
          aria-live="polite"
          data-testid="import-status"
        >
          {message}
        </div>
      </div>
    </SettingsCard>
  )
}
