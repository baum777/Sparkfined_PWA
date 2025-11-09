import React from "react";
import { computeTradeMetrics, TRADE_STATUSES, TIMEFRAMES } from "./types";
import type { JournalNote, TradeStatus, Timeframe } from "./types";

/**
 * useJournal Hook - BLOCK 1: Migrated to Unified Schema
 * 
 * Now uses JournalService (IndexedDB) instead of localStorage
 * Maintains same API surface for backward compatibility
 */

import React from "react";
import type { JournalEntry } from "@/types/journal";
import {
  createEntry,
  updateEntry,
  deleteEntry,
  queryEntries,
  getTempEntries,
  getActiveEntries,
} from "@/lib/JournalService";

const TRADE_STATUS_SET = new Set<TradeStatus>(TRADE_STATUSES);
const TIMEFRAME_SET = new Set<Timeframe>(TIMEFRAMES);

const toStringValue = (value: unknown, { allowEmpty = false }: { allowEmpty?: boolean } = {}) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed && !allowEmpty) return undefined;
  return trimmed;
};

const toBodyString = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
};

const toNumberValue = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  const parsed = Number(String(value).replace(/,/g, "."));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((tag) => (typeof tag === "string" ? tag.trim() : undefined))
    .filter((tag): tag is string => Boolean(tag))
    .map((tag) => tag.slice(0, 64))
    .slice(0, 20);
};

const toStatus = (value: unknown): TradeStatus | undefined => {
  if (typeof value !== "string") return undefined;
  return TRADE_STATUS_SET.has(value as TradeStatus) ? (value as TradeStatus) : undefined;
};

const toTimeframe = (value: unknown): Timeframe | undefined => {
  if (typeof value !== "string") return undefined;
  return TIMEFRAME_SET.has(value as Timeframe) ? (value as Timeframe) : undefined;
};

const sanitizeDraft = (draft: Partial<JournalNote>) => {
  const entryPrice = toNumberValue(draft.entryPrice);
  const exitPrice = toNumberValue(draft.exitPrice);
  const positionSize = toNumberValue(draft.positionSize);
  const stopLoss = toNumberValue(draft.stopLoss);
  const takeProfit = toNumberValue(draft.takeProfit);

  const metrics = computeTradeMetrics({ entryPrice, exitPrice, positionSize, stopLoss, takeProfit });

  return {
    title: toStringValue(draft.title, { allowEmpty: true }),
    body: toBodyString(draft.body),
    tags: toTags(draft.tags),
    screenshotDataUrl: toStringValue(draft.screenshotDataUrl, { allowEmpty: true }),
    permalink: toStringValue(draft.permalink),
    address: toStringValue(draft.address),
    tf: toTimeframe(draft.tf),
    ruleId: toStringValue(draft.ruleId),
    aiAttachedAt: typeof draft.aiAttachedAt === "number" ? draft.aiAttachedAt : undefined,
    status: toStatus(draft.status),
    setupName: toStringValue(draft.setupName),
    entryPrice,
    exitPrice,
    positionSize,
    stopLoss,
    takeProfit,
    pnl: metrics.pnl,
    pnlPercent: metrics.pnlPercent,
    riskRewardRatio: metrics.riskRewardRatio,
  };
};

export function useJournal() {
  const [notes, setNotes] = React.useState<JournalNote[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]") as JournalNote[];
      if (!Array.isArray(raw)) return [];
      return raw.map((n) => {
        const sanitized = sanitizeDraft(n);
        return {
          ...n,
          ...sanitized,
          title: sanitized.title ?? n.title ?? "Untitled",
          body: sanitized.body,
          tags: sanitized.tags.length ? sanitized.tags : n.tags || [],
        };
      });
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(notes));
  }, [notes]);

  const create = (partial: Partial<JournalNote>): JournalNote => {
    const now = Date.now();
    const sanitized = sanitizeDraft(partial);
    const note: JournalNote = {
      id: crypto.randomUUID(),
      title: sanitized.title ?? "Untitled",
      body: sanitized.body,
      tags: sanitized.tags,
      createdAt: now,
      updatedAt: now,
      screenshotDataUrl: sanitized.screenshotDataUrl,
      permalink: sanitized.permalink,
      address: sanitized.address,
      tf: sanitized.tf,
      ruleId: sanitized.ruleId,
      aiAttachedAt: sanitized.aiAttachedAt,
      status: sanitized.status,
      setupName: sanitized.setupName,
      entryPrice: sanitized.entryPrice,
      exitPrice: sanitized.exitPrice,
      positionSize: sanitized.positionSize,
      stopLoss: sanitized.stopLoss,
      takeProfit: sanitized.takeProfit,
      pnl: sanitized.pnl,
      pnlPercent: sanitized.pnlPercent,
      riskRewardRatio: sanitized.riskRewardRatio,
    };
    setNotes((prev) => [note, ...prev]);
    return note;
  };

  const update = (id: string, patch: Partial<JournalNote>) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id !== id) return note;
        const sanitized = sanitizeDraft({ ...note, ...patch });
        const hasTagsInPatch = Object.prototype.hasOwnProperty.call(patch, "tags");
        return {
          ...note,
          ...patch,
          ...sanitized,
          title: sanitized.title ?? note.title ?? "Untitled",
          body: sanitized.body,
          tags: hasTagsInPatch ? sanitized.tags : note.tags,
          updatedAt: Date.now(),
        };
      })
    );
  };

  const remove = (id: string) => setNotes((prev) => prev.filter((note) => note.id !== id));
  const [entries, setEntries] = React.useState<JournalEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load all entries on mount
  React.useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const all = await queryEntries({ status: "all" });
      setEntries(all);
    } catch (error) {
      console.error("Failed to load journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const create = async (
    partial: Partial<Omit<JournalEntry, "id" | "createdAt" | "updatedAt">>
  ): Promise<JournalEntry> => {
    // Ensure required fields have defaults
    const entry = await createEntry({
      ticker: partial.ticker || "UNKNOWN",
      address: partial.address || "",
      setup: partial.setup || "custom",
      emotion: partial.emotion || "uncertain",
      status: partial.status || "active",
      timestamp: partial.timestamp || Date.now(),
      ...partial,
    });
    setEntries((s) => [entry, ...s]);
    return entry;
  };

  const update = async (
    id: string,
    patch: Partial<Omit<JournalEntry, "id" | "createdAt">>
  ) => {
    const updated = await updateEntry(id, patch);
    if (updated) {
      setEntries((s) => s.map((e) => (e.id === id ? updated : e)));
    }
  };

  const remove = async (id: string) => {
    await deleteEntry(id);
    setEntries((s) => s.filter((e) => e.id !== id));
  };

  // New helpers for status-based queries
  const loadTempEntries = async () => {
    const temp = await getTempEntries();
    return temp;
  };

  const loadActiveEntries = async () => {
    const active = await getActiveEntries();
    return active;
  };

  return {
    entries,
    notes: entries, // Backward compat (alias)
    loading,
    create,
    update,
    remove,
    refresh: loadEntries,
    loadTempEntries,
    loadActiveEntries,
  };
}
