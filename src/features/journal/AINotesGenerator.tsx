import React, { useEffect, useState } from 'react'
import { Button, Textarea } from '@/components/ui'

interface AINotesGeneratorProps {
  tags: string[]
  thesis: string
  value?: string
  onChange: (nextNotes: string) => void
}

function deterministicNotes(thesis: string, tags: string[]): string {
  const normalizedTags = tags.length ? tags.join(', ') : 'no tags captured'
  const thesisExcerpt = thesis.trim().length ? thesis.trim().slice(0, 160) : 'No thesis text provided.'

  return [
    'AI Notes (mocked)',
    `Tags observed: ${normalizedTags}.`,
    `Thesis summary: ${thesisExcerpt}${thesis.length > 160 ? '…' : ''}`,
    'Next steps: validate risk, confirm invalidate criteria, and journal outcome after execution.',
  ].join('\n')
}

export function AINotesGenerator({ tags, thesis, value, onChange }: AINotesGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState(value ?? '')

  useEffect(() => {
    setNotes(value ?? '')
  }, [value])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      if (!thesis.trim()) {
        throw new Error('Enter thesis text before generating AI notes.')
      }

      const generated = deterministicNotes(thesis, tags)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setNotes(generated)
      onChange(generated)
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
          <p className="text-sm font-medium text-text-primary">AI notes (mock)</p>
          <p className="text-xs text-text-tertiary">Local deterministic output; no external requests are made.</p>
        </div>
        <Button type="button" variant="secondary" size="sm" loading={isGenerating} onClick={handleGenerate}>
          {isGenerating ? 'Generating…' : 'Generate AI notes'}
        </Button>
      </div>

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
