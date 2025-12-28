import Dexie, { type Table } from 'dexie'
import type { JournalTemplate, JournalTemplateFields, JournalTemplateId } from './types'

export type CustomTemplateRecord = {
  id: JournalTemplateId
  name: string
  fields: JournalTemplateFields
  createdAt: number
  updatedAt: number
}

class JournalTemplateDB extends Dexie {
  templates!: Table<CustomTemplateRecord, JournalTemplateId>

  constructor() {
    super('sparkfined-journal-templates')
    this.version(1).stores({
      templates: 'id, updatedAt, createdAt',
    })
  }
}

const db = new JournalTemplateDB()

export async function getCustomTemplates(): Promise<JournalTemplate[]> {
  const rows = await db.templates.orderBy('updatedAt').reverse().toArray()
  return rows.map((row) => ({
    ...row,
    kind: 'custom',
  }))
}

export async function upsertCustomTemplate(record: CustomTemplateRecord): Promise<void> {
  await db.templates.put(record)
}

export async function deleteCustomTemplate(id: JournalTemplateId): Promise<void> {
  await db.templates.delete(id)
}

export async function clearAllCustomTemplates(): Promise<void> {
  await db.templates.clear()
}

