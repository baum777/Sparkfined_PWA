/**
 * BLOCK 3: Enhanced export with chart state
 */

import type { ChartState, ChartSnapshot } from '@/types/journal'

export type HudOptions = {
  title?: string;          // z.B. CA oder Token-Name
  timeframe?: string;      // 1m/5m/...
  rangeText?: string;      // "01.11 12:00 – 01.11 15:00 (180 bars)"
  brand?: string;          // "$CRYPTOBER" o.ä.
  theme?: "dark" | "light";
};

// Nimmt einen bestehenden Chart-Canvas (nur Chart-Fläche) und rendert HUD + Watermark in ein neues PNG
export function exportWithHud(srcCanvas: HTMLCanvasElement, opts: HudOptions = {}): string {
  const W = srcCanvas.width;
  const H = srcCanvas.height + 64; // Platz für HUD
  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const ctx = out.getContext("2d", { alpha: false })!; // schneller Blit, kein Alpha

  const dark = (opts.theme ?? "dark") === "dark";
  // Hintergrund/HUD-Balken
  ctx.fillStyle = dark ? "#0b0b0b" : "#ffffff";
  ctx.fillRect(0, 0, W, H);
  // Chart kopieren
  ctx.drawImage(srcCanvas, 0, 48);

  // HUD: Titel links, TF & Range rechts
  ctx.font = "600 14px ui-sans-serif, system-ui";
  ctx.fillStyle = dark ? "#e5e7eb" : "#111827";
  const title = opts.title ?? "Sparkfined Chart";
  ctx.fillText(title, 12, 30);

  ctx.font = "12px ui-sans-serif, system-ui";
  ctx.fillStyle = dark ? "#9ca3af" : "#374151";
  const right = [opts.timeframe ? `TF ${opts.timeframe}` : "", opts.rangeText || ""].filter(Boolean).join(" • ");
  if (right) {
    const w = ctx.measureText(right).width;
    ctx.fillText(right, W - 12 - w, 30);
  }

  // Watermark/Brand unten rechts
  if (opts.brand) {
    ctx.font = "700 12px ui-sans-serif, system-ui";
    ctx.fillStyle = dark ? "rgba(16,185,129,0.8)" : "rgba(16,122,87,0.8)";
    const w = ctx.measureText(opts.brand).width;
    ctx.fillText(opts.brand, W - 12 - w, H - 12);
  }
  return out.toDataURL("image/png");
}

// ============================================================================
// BLOCK 3: Chart State Export (for Journal Integration)
// ============================================================================

/**
 * Export complete chart state for journal entry
 * Includes both screenshot and reconstructable state
 */
export function exportChartSnapshot(
  canvas: HTMLCanvasElement,
  chartConfig: {
    address: string
    timeframe: string
    view: { start: number; end: number }
    indicators: Array<{ type: string; params: Record<string, number>; enabled: boolean }>
    shapes?: Array<any>
  },
  hudOptions?: HudOptions
): ChartSnapshot {
  // Generate screenshot with HUD
  const screenshot = exportWithHud(canvas, hudOptions)

  // Build chart state
  const chartState: ChartState = {
    address: chartConfig.address,
    timeframe: chartConfig.timeframe as any,
    view: chartConfig.view,
    indicators: chartConfig.indicators as any,
    shapes: chartConfig.shapes,
    timestamp: Date.now(),
  }

  return {
    screenshot,
    state: chartState,
  }
}

/**
 * Dispatch journal draft event (Chart → Journal flow)
 */
export function dispatchJournalDraft(
  snapshot: ChartSnapshot,
  metadata: {
    ticker?: string
    address: string
    timeframe: string
  }
) {
  window.dispatchEvent(
    new CustomEvent('journal:draft', {
      detail: {
        chartSnapshot: snapshot,
        ticker: metadata.ticker || 'UNKNOWN',
        address: metadata.address,
        timestamp: Date.now(),
      },
    })
  )
}
