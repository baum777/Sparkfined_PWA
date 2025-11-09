/**
 * BLOCK 3: Updated JournalEditor for unified schema
 * 
 * New features:
 * - Setup & Emotion tag selectors (predefined + custom)
 * - Thesis textarea (manual reasoning)
 * - Fetch Grok Context button
 * - GrokContextPanel display
 * - Chart screenshot preview
 */

import React from "react";
import type { JournalEntry, SetupTag, EmotionTag } from "@/types/journal";
import GrokContextPanel from "@/components/GrokContextPanel";

// Predefined tags
const SETUP_TAGS: SetupTag[] = ['support', 'resistance', 'breakout', 'breakdown', 'range', 'liquidity', 'momentum', 'reversal', 'custom']
const EMOTION_TAGS: EmotionTag[] = ['fomo', 'fear', 'confident', 'revenge', 'disciplined', 'uncertain', 'excited', 'custom']

export default function JournalEditor({
  draft, onChange, onSave
}: {
  draft: Partial<JournalEntry>;
  onChange: (next: Partial<JournalEntry>) => void;
  onSave: () => void;
}) {
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [grokLoading, setGrokLoading] = React.useState(false);
  const btn = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";

  const onPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith("image/"));
    if (!item) return;
    const blob = item.getAsFile(); if (!blob) return;
    const dataUrl = await blobToDataUrl(blob);
    onChange({ ...draft, chartSnapshot: { screenshot: dataUrl } });
  };

  const onPickFile = async (f?: File) => {
    if (!f) return;
    const dataUrl = await blobToDataUrl(f);
    onChange({ ...draft, chartSnapshot: { screenshot: dataUrl } });
  };

  // Fetch Grok Context
  const fetchGrokContext = async () => {
    if (!draft.ticker || !draft.address) {
      alert('Ticker and Address required for Grok fetch')
      return
    }

    setGrokLoading(true)
    try {
      const response = await fetch('/api/ai/grok-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: draft.ticker,
          address: draft.address,
          timestamp: draft.timestamp || Date.now()
        })
      })

      const result = await response.json()
      
      if (result.success && result.data) {
        onChange({ ...draft, grokContext: result.data })
      } else {
        alert('Failed to fetch Grok context: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Grok fetch error:', error)
      alert('Failed to fetch Grok context')
    } finally {
      setGrokLoading(false)
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Editor */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            {/* Ticker & Address */}
            <div className="grid grid-cols-2 gap-2">
              <input
                value={draft.ticker || ""}
                onChange={e => onChange({ ...draft, ticker: e.target.value })}
                placeholder="Ticker (e.g., BONK)"
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200"
              />
              <input
                value={draft.address || ""}
                onChange={e => onChange({ ...draft, address: e.target.value })}
                placeholder="Token Address"
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200"
              />
            </div>

            {/* Setup & Emotion Tags */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Setup</label>
                <select
                  value={draft.setup || 'custom'}
                  onChange={e => onChange({ ...draft, setup: e.target.value as SetupTag })}
                  className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200"
                >
                  {SETUP_TAGS.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Emotion</label>
                <select
                  value={draft.emotion || 'uncertain'}
                  onChange={e => onChange({ ...draft, emotion: e.target.value as EmotionTag })}
                  className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200"
                >
                  {EMOTION_TAGS.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Thesis (Manual Reasoning) */}
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Thesis / Reasoning</label>
              <textarea
                value={draft.thesis || ""}
                onChange={e => onChange({ ...draft, thesis: e.target.value })}
                placeholder="Why this trade? Your hypothesis..."
                rows={4}
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-zinc-200"
              />
            </div>

            {/* Custom Tags */}
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Custom Tags</label>
              <input
                value={(draft.customTags || []).join(", ")}
                onChange={e => onChange({ ...draft, customTags: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) })}
                placeholder="custom, tags, here"
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button className={btn} onClick={() => fileRef.current?.click()}>📷 Add Screenshot</button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.currentTarget.files?.[0]; onPickFile(f || undefined); e.currentTarget.value = ""; }}
              />
              <button 
                className={`${btn} border-cyan-700 text-cyan-200 hover:bg-cyan-900/20`}
                onClick={fetchGrokContext}
                disabled={grokLoading || !draft.ticker || !draft.address}
              >
                {grokLoading ? '⏳ Fetching...' : '𝕏 Fetch Lore/Hype'}
              </button>
              <button 
                className={`${btn} border-emerald-700 text-emerald-200 hover:bg-emerald-900/20 ml-auto`}
                onClick={onSave}
              >
                💾 Save Entry
              </button>
            </div>
          </div>

          {/* Preview Sidebar */}
          <div>
            <div className="text-xs text-zinc-400 mb-2">Screenshot Preview</div>
            <div className="rounded border border-zinc-800 bg-black/30 p-2">
              {draft.chartSnapshot?.screenshot
                ? <img src={draft.chartSnapshot.screenshot} alt="chart" className="max-h-48 w-full rounded object-contain" />
                : <div className="text-[11px] text-zinc-500 text-center py-8">No screenshot</div>}
            </div>
            {draft.address && (
              <div className="mt-3 text-[10px] text-zinc-500 break-all">
                <div className="font-medium">Address:</div>
                <div>{draft.address.slice(0, 8)}...{draft.address.slice(-6)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grok Context Panel */}
      {draft.grokContext && (
        <GrokContextPanel 
          context={draft.grokContext}
          onRefresh={fetchGrokContext}
        />
      )}
    </div>
  );
}

async function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result;
      if (typeof result === 'string') {
        res(result);
      } else {
        res('');
      }
    };
    r.onerror = rej;
    r.readAsDataURL(b);
  });
}
