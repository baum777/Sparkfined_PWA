import type {
  ChartSnapshot,
  EmotionTag,
  GrokContext,
  JournalEntry,
  JournalJourneyMeta,
  SetupTag,
  TradeOutcome,
} from '@/types/journal'
import type { Alert } from '@/store/alertsStore'
import type { Settings } from '@/state/settings'
import type { ThemeMode } from '@/lib/theme/useTheme'
import type { WatchlistRow, WatchlistTrendSnapshot } from '@/store/watchlistStore'

export interface JournalExportEntry {
  id: string
  createdAt: string
  updatedAt?: string
  timestamp?: string
  title?: string
  content?: string
  ticker?: string
  address?: string
  setup?: SetupTag
  emotion?: EmotionTag
  status?: JournalEntry['status']
  customTags?: string[]
  tags?: string[]
  thesis?: string
  grokContext?: GrokContext
  chartSnapshot?: ChartSnapshot
  outcome?: TradeOutcome
  markedActiveAt?: string
  replaySessionId?: string
  walletAddress?: string
  journeyMeta?: JournalJourneyMeta
}

export interface JournalExportBundle {
  version: string
  exportedAt: string
  entries: JournalExportEntry[]
}

export interface ImportOptions {
  mode: 'merge' | 'replace'
}

export interface AlertsExportBundle {
  version: string
  alerts: Alert[]
}

export interface SettingsExportBundle {
  version: string
  settings: Settings & { theme?: ThemeMode }
}

export interface WatchlistExportBundle {
  version: string
  rows: WatchlistRow[]
  trends: Record<string, WatchlistTrendSnapshot>
}

export interface AppDataExportBundle {
  version: string
  exportedAt: string
  journal: JournalExportBundle
  alerts: AlertsExportBundle
  settings: SettingsExportBundle
  watchlist: WatchlistExportBundle
}
