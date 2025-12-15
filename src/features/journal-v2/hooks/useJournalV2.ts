import { useCallback, useEffect, useMemo, useState } from 'react'
import { runJournalPipeline } from '../engine'
import type { JournalOutput, JournalRawInput } from '../types'
import type { PersistedJournalEntry } from '../db'
import { getJournalEntries, saveJournalEntry } from '../db'
import { createShadowTradeLogFromPipeline } from '../services/shadowTradeLog'
import { useSettings } from '@/state/settings'

interface UseJournalV2Result {
  submit: (input: JournalRawInput) => Promise<JournalOutput>
  latestResult: JournalOutput | null
  history: PersistedJournalEntry[]
  isSaving: boolean
  isLoading: boolean
  error: string | null
}

export function useJournalV2(): UseJournalV2Result {
  const [latestResult, setLatestResult] = useState<JournalOutput | null>(null)
  const [history, setHistory] = useState<PersistedJournalEntry[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { settings } = useSettings()

  useEffect(() => {
    let isActive = true

    const loadHistory = async () => {
      try {
        const entries = await getJournalEntries()
        if (!isActive) return
        setHistory(entries)
        setLatestResult(entries[0]?.output ?? null)
      } catch (err) {
        if (!isActive) return
        setError('Unable to load journal history right now.')
        console.warn('[journal-v2] failed to load entries', err)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadHistory()

    return () => {
      isActive = false
    }
  }, [])

  const submit = useCallback(async (input: JournalRawInput) => {
    setIsSaving(true)
    setError(null)
    try {
      const normalizedInput: JournalRawInput = {
        ...input,
        createdAt: input.createdAt ?? Date.now(),
      }

      const output = runJournalPipeline(normalizedInput)
      const persistedEntry: Omit<PersistedJournalEntry, 'id'> = {
        raw: normalizedInput,
        output,
        createdAt: normalizedInput.createdAt,
        version: 2,
      }

      const id = await saveJournalEntry(persistedEntry)

      try {
        await createShadowTradeLogFromPipeline({
          journalEntryId: id,
          action: output.action,
          quoteCurrency: settings.quoteCurrency,
          generatedAt: normalizedInput.createdAt,
          signalPrice: null,
        })
      } catch (shadowErr) {
        console.warn('[journal-v2] failed to create shadow trade log', shadowErr)
      }

      setHistory((previous) => [{ ...persistedEntry, id }, ...previous])
      setLatestResult(output)

      return output
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      setError(message)
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [settings.quoteCurrency])

  const memoizedLatest = useMemo(() => latestResult, [latestResult])

  return {
    submit,
    latestResult: memoizedLatest,
    history,
    isSaving,
    isLoading,
    error,
  }
}
