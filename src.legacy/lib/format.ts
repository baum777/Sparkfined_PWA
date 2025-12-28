export function fmtUsd(n?: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  const opts: Intl.NumberFormatOptions = abs >= 1000 ? { maximumFractionDigits: 0 } :
    abs >= 1 ? { maximumFractionDigits: 2 } : { maximumFractionDigits: 6 };
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", ...opts }).format(n);
}
export function fmtPct(n?: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(Math.abs(n) >= 1 ? 2 : 2)}%`;
}
export function fmtNum(n?: number, maxFrac = 6) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  const opts: Intl.NumberFormatOptions = abs >= 1000 ? { maximumFractionDigits: 0 } :
    abs >= 1 ? { maximumFractionDigits: 2 } : { maximumFractionDigits: maxFrac };
  return new Intl.NumberFormat(undefined, opts).format(n);
}
export function fmtTime(ts: number) {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }).format(new Date(ts));
  } catch { return String(ts); }
}
