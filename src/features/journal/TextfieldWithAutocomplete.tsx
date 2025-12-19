import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui'
import { cn } from '@/lib/ui/cn'

const DEFAULT_SUGGESTIONS = [
  'Take partials at 1R and trail stop to breakeven',
  'Hold until HTF resistance retest then de-risk',
  'Add on pullback to VWAP with volume confirmation',
  'Cut if momentum fades after first 15 minutes',
  'Scale out across liquidity pockets before news',
]

type TextfieldWithAutocompleteProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  suggestions?: string[]
  onBlur?: () => void
  onFocus?: () => void
  error?: string | null
  required?: boolean
  dataTestId?: string
}

export function TextfieldWithAutocomplete({
  id,
  value,
  onChange,
  label,
  placeholder,
  suggestions = DEFAULT_SUGGESTIONS,
  onBlur,
  onFocus,
  error,
  required,
  dataTestId,
}: TextfieldWithAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const listId = useId()
  const blurTimeoutRef = useRef<number | null>(null)

  const filteredSuggestions = useMemo(() => {
    const normalized = value.trim().toLowerCase()
    return suggestions.filter((item) => item.toLowerCase().includes(normalized))
  }, [suggestions, value])

  useEffect(() => {
    if (!filteredSuggestions.length) {
      setHighlightedIndex(null)
      return
    }
    setHighlightedIndex(0)
  }, [filteredSuggestions])

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  const handleSelect = (selection: string) => {
    onChange(selection)
    setIsOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredSuggestions.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setHighlightedIndex((previous) => {
        if (previous === null) return 0
        return (previous + 1) % filteredSuggestions.length
      })
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
      setHighlightedIndex((previous) => {
        if (previous === null) return filteredSuggestions.length - 1
        return (previous - 1 + filteredSuggestions.length) % filteredSuggestions.length
      })
    } else if (event.key === 'Enter') {
      if (highlightedIndex !== null && isOpen) {
        event.preventDefault()
        const selection = filteredSuggestions[highlightedIndex]
        if (selection) {
          handleSelect(selection)
        }
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(null)
    }
  }

  const handleBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false)
    }, 80)
    onBlur?.()
  }

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current)
    }
    setIsOpen(true)
    onFocus?.()
  }

  const activeOptionId = highlightedIndex !== null ? `${listId}-option-${highlightedIndex}` : undefined

  return (
    <div className="relative">
      {label ? (
        <label className="text-sm font-medium text-text-primary" htmlFor={id}>
          {label}
          {required ? <span className="ml-1 text-xs text-text-tertiary">*</span> : null}
        </label>
      ) : null}
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        aria-activedescendant={activeOptionId}
        aria-invalid={Boolean(error)}
        data-testid={dataTestId}
        required={required}
      />
      {isOpen && filteredSuggestions.length ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-10 mt-1 w-full rounded-xl border border-border/70 bg-surface shadow-card-subtle"
        >
          {filteredSuggestions.map((suggestion, index) => {
            const isHighlighted = highlightedIndex === index
            return (
              <button
                key={suggestion}
                type="button"
                className={cn(
                  'flex w-full items-center justify-start px-3 py-3 text-left text-sm text-text-primary transition',
                  isHighlighted ? 'bg-surface-elevated text-text-primary' : 'bg-surface hover:bg-surface-elevated/80',
                )}
                role="option"
                id={`${listId}-option-${index}`}
                aria-selected={isHighlighted}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(suggestion)}
              >
                {suggestion}
              </button>
            )
          })}
        </div>
      ) : null}
      {error ? <p className="mt-1 text-xs text-status-danger">{error}</p> : null}
    </div>
  )
}

export default TextfieldWithAutocomplete
