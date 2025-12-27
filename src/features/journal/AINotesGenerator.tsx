import React, { useEffect, useState } from 'react'
import { Button, Textarea } from '@/components/ui'
import { generateJournalNotes } from '@/lib/ai/journalNotes'
import { Telemetry } from '@/lib/TelemetryService'

interface AINotesGeneratorProps {
  tags: string[]
  thesis: string
  value?: string
  onChange: (nextNotes: string) => void
}

type GenerationMode = 'idle' | 'real' | 'demo'

const DEMO_NOTE = 'Example/Demo result (no API call counted)'

export function AINotesGenerator({ tags, thesis, value, onChange }: AINotesGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState(value ?? '')
  const [mode, setMode] = useState<GenerationMode>('idle')
  const [bannerNote, setBannerNote] = useState<string | undefined>(undefined)

  useEffect(() => {
    setNotes(value ?? '')
  }, [value])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setBannerNote(undefined)

    try {
      if (!thesis.trim()) {
        throw new Error('Enter thesis text before generating AI notes.')
      }

      const { result, mode: resultMode, note } = await generateJournalNotes({ thesis, tags })
      setNotes(result)
      setMode(resultMode)
      setBannerNote(resultMode === 'demo' ? note ?? DEMO_NOTE : undefined)
      onChange(result)
      Telemetry.log('ui.journal.ai_notes_generated', 1, { mode: resultMode })
    } catch (generationError) {
      console.error('AI notes generation failed', generationError)
      setError('AI notes generator is offline; showing deterministic mock. Please retry after updating thesis.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="sf-journal-thesis-ai" data-testid="journal-ai-generator">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-primary">{mode === 'demo' ? 'AI notes (demo)' : 'AI notes'}</p>
          <p className="text-xs text-text-tertiary">
            {bannerNote && mode === 'demo'
              ? bannerNote
              : 'Generates a concise summary of your thesis and tags.'}
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" loading={isGenerating} onClick={handleGenerate}>
          {isGenerating ? 'Generating…' : 'Generate AI notes'}
        </Button>
      </div>

      {mode === 'demo' && bannerNote ? (
        <div className="mt-2 rounded border border-warning-500 bg-warning-900/30 px-3 py-2 text-xs text-warning-100">
          {bannerNote}
        </div>
      ) : null}

      {error ? (
        <div className="sf-journal-thesis-ai__error" role="alert">
          <p className="text-xs text-status-danger">{error}</p>
          <Button type="button" variant="ghost" size="sm" onClick={handleGenerate}>
            Retry
          </Button>
        </div>
      ) : null}

      <Textarea
        value={notes}
        onChange={(event) => {
          setNotes(event.target.value)
          onChange(event.target.value)
        }}
        placeholder="Generated AI notes will appear here."
        rows={4}
        className="sf-journal-thesis-ai__output"
      />
    </div>
  )
}

export default AINotesGenerator
