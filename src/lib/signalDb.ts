/**
 * Signal Database (Dexie)
 *
 * Stores rule definitions and generated signals for the signal matrix.
 * Focused solely on persistence; no strategy or cron logic lives here.
 */

import Dexie, { type Table } from 'dexie'

export interface Signal {
  id: string
  symbol: string
  ruleId: string
  type: string
  triggeredAt: string
  resolvedAt?: string
  meta?: Record<string, unknown>
}

export interface SignalRule {
  id: string
  name: string
  symbol: string
  timeframe: string
  enabled: boolean
  strategy: string
  params: Record<string, unknown>
  createdAt: string
  updatedAt?: string
}

export class SignalDatabase extends Dexie {
  signals!: Table<Signal, string>
  rules!: Table<SignalRule, string>

  constructor(databaseName = 'sparkfined-signals') {
    super(databaseName)

    this.version(1).stores({
      signals: 'id, symbol, ruleId, type, triggeredAt',
      rules: 'id, symbol, enabled, strategy, timeframe, createdAt',
    })
  }
}

export const signalDb = new SignalDatabase()

const nowIso = () => new Date().toISOString()

const generateId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export async function createSignal(
  input: Omit<Signal, 'id' | 'triggeredAt'> & {
    id?: string
    triggeredAt?: string
  },
  db: SignalDatabase = signalDb
): Promise<Signal> {
  await db.open()
  const signal: Signal = {
    ...input,
    id: input.id ?? generateId('sig'),
    triggeredAt: input.triggeredAt ?? nowIso(),
  }

  await db.signals.put(signal)
  return signal
}

export async function getSignalById(
  id: string,
  db: SignalDatabase = signalDb
): Promise<Signal | undefined> {
  return db.signals.get(id)
}

export async function getAllSignals(db: SignalDatabase = signalDb): Promise<Signal[]> {
  return db.signals.orderBy('triggeredAt').reverse().toArray()
}

export async function getSignalsForSymbol(
  symbol: string,
  opts?: { limit?: number },
  db: SignalDatabase = signalDb
): Promise<Signal[]> {
  const signals = await db.signals.where('symbol').equals(symbol).sortBy('triggeredAt')
  signals.reverse()
  return typeof opts?.limit === 'number' ? signals.slice(0, opts.limit) : signals
}

export async function markSignalTriggered(
  id: string,
  at: string = nowIso(),
  db: SignalDatabase = signalDb
): Promise<void> {
  await db.signals.update(id, { triggeredAt: at })
}

export async function createRule(
  input: Omit<SignalRule, 'id' | 'createdAt'> & {
    id?: string
    createdAt?: string
  },
  db: SignalDatabase = signalDb
): Promise<SignalRule> {
  await db.open()
  const createdAt = input.createdAt ?? nowIso()
  const rule: SignalRule = {
    ...input,
    id: input.id ?? generateId('rule'),
    createdAt,
    updatedAt: input.updatedAt ?? createdAt,
  }

  await db.rules.put(rule)
  return rule
}

export async function getActiveRules(db: SignalDatabase = signalDb): Promise<SignalRule[]> {
  await db.open()
  const rules = await db.rules.toArray()

  return rules
    .filter((rule) => rule.enabled)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function disableRule(id: string, db: SignalDatabase = signalDb): Promise<void> {
  await db.rules.update(id, { enabled: false, updatedAt: nowIso() })
}
