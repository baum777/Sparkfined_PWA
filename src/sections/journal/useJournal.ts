import React from "react";
import type { JournalNote } from "./types";

const KEY = "sparkfined.journal.v1";

export function useJournal() {
  const [notes, setNotes] = React.useState<JournalNote[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });
  React.useEffect(() => { localStorage.setItem(KEY, JSON.stringify(notes)); }, [notes]);

  const create = (partial: Partial<JournalNote>): JournalNote => {
    const now = Date.now();
    const n: JournalNote = {
      id: crypto.randomUUID(),
      title: partial.title?.trim() || "Untitled",
      body: partial.body || "",
      tags: (partial.tags || []).map(t => t.trim()).filter(Boolean),
      createdAt: now,
      updatedAt: now,
      screenshotDataUrl: partial.screenshotDataUrl,
      permalink: partial.permalink,
      address: partial.address,
      tf: partial.tf,
      ruleId: partial.ruleId,
      // Trading-Felder
      status: partial.status,
      entryPrice: partial.entryPrice,
      exitPrice: partial.exitPrice,
      positionSize: partial.positionSize,
      stopLoss: partial.stopLoss,
      takeProfit: partial.takeProfit,
      pnl: partial.pnl,
      pnlPercent: partial.pnlPercent,
      riskRewardRatio: partial.riskRewardRatio,
      setup: partial.setup,
      aiAttachedAt: partial.aiAttachedAt,
      enteredAt: partial.enteredAt,
      exitedAt: partial.exitedAt,
    };
    setNotes(s => [n, ...s]);
    return n;
  };

  const update = (id: string, patch: Partial<JournalNote>) => {
    setNotes(s => s.map(n => n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n));
  };
  const remove = (id: string) => setNotes(s => s.filter(n => n.id !== id));

  return { notes, create, update, remove };
}
