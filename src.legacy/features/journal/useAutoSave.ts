import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type UseAutoSaveOptions<T> = {
  key: string
  value: T
  intervalMs?: number
  /** Seed lastSavedAt to avoid immediate re-save when restoring a draft. */
  initialSavedAt?: number | null
  /** Serialize value + savedAt into a storage payload. */
  serialize?: (value: T, savedAt: number) => string
  /** Serialize value to compare changes without savedAt noise. */
  diffSerializer?: (value: T) => string
}

type UseAutoSaveResult = {
  lastSavedAt: number | null
  isSaving: boolean
  saveNow: () => Promise<void>
}

const DEFAULT_INTERVAL_MS = 30_000

function canUseStorage(storage: Storage | undefined | null): storage is Storage {
  return typeof window !== 'undefined' && Boolean(storage)
}

export function useAutoSave<T>({
  key,
  value,
  intervalMs = DEFAULT_INTERVAL_MS,
  initialSavedAt = null,
  serialize,
  diffSerializer,
}: UseAutoSaveOptions<T>): UseAutoSaveResult {
  const storage = typeof window !== 'undefined' ? window.localStorage : null
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(initialSavedAt)
  const [isSaving, setIsSaving] = useState(false)
  const valueRef = useRef(value)
  const hasSeededBaselineRef = useRef(false)
  const lastValueSignatureRef = useRef<string | null>(null)
  const pendingSaveRef = useRef(false)

  const serializeForStorage = useCallback(
    (nextValue: T, savedAt: number) =>
      serialize ? serialize(nextValue, savedAt) : JSON.stringify({ value: nextValue, savedAt }),
    [serialize],
  )

  const serializeForDiff = useMemo(() => diffSerializer ?? JSON.stringify, [diffSerializer])

  valueRef.current = value

  useEffect(() => {
    if (hasSeededBaselineRef.current) return
    if (initialSavedAt === null) return

    hasSeededBaselineRef.current = true
    lastValueSignatureRef.current = serializeForDiff(valueRef.current)
  }, [initialSavedAt, serializeForDiff])

  const saveNow = useCallback(async () => {
    if (!canUseStorage(storage)) {
      pendingSaveRef.current = false
      return
    }

    const nextSignature = serializeForDiff(valueRef.current)
    if (nextSignature === lastValueSignatureRef.current) {
      pendingSaveRef.current = false
      return
    }

    setIsSaving(true)
    try {
      const savedAt = Date.now()
      const payload = serializeForStorage(valueRef.current, savedAt)
      storage.setItem(key, payload)
      lastValueSignatureRef.current = nextSignature
      setLastSavedAt(savedAt)
      pendingSaveRef.current = false
    } finally {
      setIsSaving(false)
    }
  }, [key, serializeForDiff, serializeForStorage, storage])

  useEffect(() => {
    const nextSignature = serializeForDiff(valueRef.current)
    if (nextSignature === lastValueSignatureRef.current) return

    pendingSaveRef.current = true
    const timeoutId = window.setTimeout(() => {
      void saveNow()
    }, 800)

    return () => window.clearTimeout(timeoutId)
  }, [saveNow, serializeForDiff, value])

  useEffect(() => {
    if (!canUseStorage(storage)) return

    const intervalId = window.setInterval(() => {
      if (pendingSaveRef.current) {
        void saveNow()
      }
    }, intervalMs)

    return () => window.clearInterval(intervalId)
  }, [intervalMs, saveNow, storage])

  return { lastSavedAt, isSaving, saveNow }
}
