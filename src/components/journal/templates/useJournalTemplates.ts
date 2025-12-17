import { useCallback, useEffect, useMemo, useState } from 'react'
import { BUILTIN_JOURNAL_TEMPLATES } from './template-defaults'
import { deleteCustomTemplate, getCustomTemplates, upsertCustomTemplate } from './template-storage'
import type { JournalTemplate, JournalTemplateFields, JournalTemplateId } from './types'

function createTemplateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `tmpl_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export type UseJournalTemplatesResult = {
  templates: JournalTemplate[]
  customTemplates: JournalTemplate[]
  isLoading: boolean
  error: string | null
  createCustomTemplate: (input: { name: string; fields: JournalTemplateFields }) => Promise<JournalTemplate>
  updateCustomTemplate: (template: JournalTemplate) => Promise<void>
  duplicateAsCustom: (template: JournalTemplate) => Promise<JournalTemplate>
  deleteCustom: (id: JournalTemplateId) => Promise<void>
  reload: () => Promise<void>
}

export function useJournalTemplates(): UseJournalTemplatesResult {
  const [customTemplates, setCustomTemplates] = useState<JournalTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setError(null)
      const loaded = await getCustomTemplates()
      setCustomTemplates(loaded)
    } catch (err) {
      console.warn('[journal-templates] failed to load templates', err)
      setError('Unable to load templates right now.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        setError(null)
        const loaded = await getCustomTemplates()
        if (!active) return
        setCustomTemplates(loaded)
      } catch (err) {
        if (!active) return
        console.warn('[journal-templates] failed to load templates', err)
        setError('Unable to load templates right now.')
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void run()
    return () => {
      active = false
    }
  }, [])

  const templates = useMemo(() => [...BUILTIN_JOURNAL_TEMPLATES, ...customTemplates], [customTemplates])

  const createCustomTemplate = useCallback(async (input: { name: string; fields: JournalTemplateFields }) => {
    const now = Date.now()
    const created: JournalTemplate = {
      id: createTemplateId(),
      kind: 'custom',
      name: input.name.trim() || 'Untitled template',
      fields: input.fields,
      createdAt: now,
      updatedAt: now,
    }
    await upsertCustomTemplate({
      id: created.id,
      name: created.name,
      fields: created.fields,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    })
    await reload()
    return created
  }, [reload])

  const updateCustomTemplate = useCallback(async (template: JournalTemplate) => {
    if (template.kind !== 'custom') return
    const next = { ...template, name: template.name.trim() || 'Untitled template', updatedAt: Date.now() }
    await upsertCustomTemplate({
      id: next.id,
      name: next.name,
      fields: next.fields,
      createdAt: next.createdAt,
      updatedAt: next.updatedAt,
    })
    await reload()
  }, [reload])

  const duplicateAsCustom = useCallback(async (template: JournalTemplate) => {
    const now = Date.now()
    const duplicated: JournalTemplate = {
      id: createTemplateId(),
      kind: 'custom',
      name: `${template.name} (copy)`,
      fields: { ...template.fields },
      createdAt: now,
      updatedAt: now,
    }
    await upsertCustomTemplate({
      id: duplicated.id,
      name: duplicated.name,
      fields: duplicated.fields,
      createdAt: duplicated.createdAt,
      updatedAt: duplicated.updatedAt,
    })
    await reload()
    return duplicated
  }, [reload])

  const deleteCustom = useCallback(async (id: JournalTemplateId) => {
    await deleteCustomTemplate(id)
    await reload()
  }, [reload])

  return {
    templates,
    customTemplates,
    isLoading,
    error,
    createCustomTemplate,
    updateCustomTemplate,
    duplicateAsCustom,
    deleteCustom,
    reload,
  }
}

