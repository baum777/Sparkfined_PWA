import React from "react";
import { estimateTokens, summarizeBudget } from "../../lib/tokens";
import { useTelemetry } from "../../state/telemetry";

export default function TokenOverlay() {
  const { flags } = useTelemetry();
  const [now, setNow] = React.useState(0);
  const [avg, setAvg] = React.useState(0);

  // primitive rolling avg basierend auf zuletzt beobachteten UI-Texts
  React.useEffect(() => {
    const handler = (e: Event) => {
      const any = e as CustomEvent<{ text: string }>;
      const t = estimateTokens(any.detail?.text || "");
      setNow(n => t); // current message tokens
      setAvg(a => a === 0 ? t : Math.round(a * 0.7 + t * 0.3));
    };
    window.addEventListener("token:observe" as any, handler as any);
    return () => window.removeEventListener("token:observe" as any, handler as any);
  }, []);

  if (!flags.tokenOverlay) return null;
  const { iterationsLeft } = summarizeBudget(now, avg, 196000);
  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-50 rounded-lg border border-emerald-800/60 bg-zinc-900/80 px-3 py-2 text-[11px] text-zinc-200 shadow">
      <div className="flex items-center gap-2">
        <span className="rounded bg-emerald-900/40 px-1.5 py-0.5 text-emerald-200">Token-Budget</span>
        <span>now ≈ <b>{now}</b></span>
        <span>avg ≈ <b>{avg}</b></span>
        <span>max = <b>196k</b></span>
        <span>iter ≈ <b>{iterationsLeft}</b></span>
      </div>
    </div>
  );
}
