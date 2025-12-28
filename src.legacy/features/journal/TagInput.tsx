import React, { useMemo, useState } from 'react'
import { Input, Button } from '@/components/ui'

interface TagInputProps {
  value: string[]
  onChange: (nextTags: string[]) => void
  label?: string
  placeholder?: string
  suggestions?: string[]
}

const STATIC_SUGGESTIONS = [
  'momentum',
  'range',
  'breakout',
  'fundamental',
  'scalp',
  'swing',
  'news-driven',
  'low-float',
]

export function TagInput({
  value,
  onChange,
  label = 'Tags',
  placeholder = 'Add a tag and press Enter',
  suggestions,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const availableSuggestions = useMemo(() => {
    const source = suggestions?.length ? suggestions : STATIC_SUGGESTIONS
    return source.filter((item) => item.toLowerCase().includes(inputValue.toLowerCase()))
  }, [inputValue, suggestions])

  const addTag = (tag: string) => {
    const normalized = tag.trim()
    if (!normalized) return
    const exists = value.some((existing) => existing.toLowerCase() === normalized.toLowerCase())
    if (exists) {
      setInputValue('')
      return
    }
    onChange([...value, normalized])
    setInputValue('')
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((item) => item !== tag))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag(inputValue)
    } else if (event.key === 'Backspace' && inputValue.length === 0 && value.length) {
      event.preventDefault()
      const next = value.slice(0, -1)
      onChange(next)
    }
  }

  return (
    <div className="sf-journal-thesis-tag-input">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        <span className="text-xs text-text-tertiary">Autocomplete uses a static stub list.</span>
      </div>

      <div className="sf-journal-thesis-tag-input__control" data-testid="journal-tag-input">
        <div className="sf-journal-thesis-tag-input__tags" aria-label="Selected tags">
          {value.map((tag) => (
            <span key={tag} className="sf-journal-thesis-tag">
              <span className="sf-journal-thesis-tag__text">{tag}</span>
              <button
                type="button"
                className="sf-journal-thesis-tag__remove"
                onClick={() => removeTag(tag)}
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <Input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="sf-journal-thesis-tag-input__field"
          aria-label="Add thesis tag"
        />
      </div>

      {availableSuggestions.length ? (
        <div className="sf-journal-thesis-tag-input__suggestions" aria-label="Tag suggestions">
          {availableSuggestions.map((suggestion) => {
            const isSelected = value.some((tag) => tag.toLowerCase() === suggestion.toLowerCase())
            return (
              <Button
                key={suggestion}
                type="button"
                variant="ghost"
                size="sm"
                className="sf-journal-thesis-tag-input__suggestion"
                disabled={isSelected}
                onClick={() => addTag(suggestion)}
              >
                {suggestion}
              </Button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default TagInput
