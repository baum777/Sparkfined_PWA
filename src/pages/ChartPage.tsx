import React from "react";
import ChartHeader from "../sections/chart/ChartHeader";
import CandlesCanvas from "../sections/chart/CandlesCanvas";
import { fetchOhlc, type OhlcPoint } from "../sections/chart/marketOhlc";
import IndicatorBar, { type IndicatorState } from "../sections/chart/IndicatorBar";
import { sma, ema, vwap } from "../sections/chart/indicators";

export default function ChartPage() {
  const [address, setAddress] = React.useState<string>("");
  const [tf, setTf] = React.useState<"1m"|"5m"|"15m"|"1h"|"4h"|"1d">("15m");
  const [data, setData] = React.useState<OhlcPoint[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [indState, setIndState] = React.useState<IndicatorState>({ sma20: true, ema20: true, vwap: false });
  const [inds, setInds] = React.useState<{ sma20?: (number|undefined)[]; ema20?: (number|undefined)[]; vwap?: (number|undefined)[] }>({});

  const load = React.useCallback(async () => {
    if (!address.trim()) { setData(null); setError(null); return; }
    setLoading(true); setError(null);
    try {
      const d = await fetchOhlc({ address: address.trim(), tf });
      setData(d);
    } catch (e:any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [address, tf]);

  React.useEffect(() => { /* auto-load when params set */ load(); }, [load]);
  React.useEffect(() => {
    if (!data || data.length === 0) { setInds({}); return; }
    const next: typeof inds = {};
    if (indState.sma20) next.sma20 = sma(data, 20);
    if (indState.ema20) next.ema20 = ema(data, 20);
    if (indState.vwap)  next.vwap  = vwap(data);
    setInds(next);
  }, [data, indState]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <ChartHeader
        value={address}
        onChange={setAddress}
        timeframe={tf}
        onTimeframe={setTf}
        onLoad={load}
        loading={loading}
      />
      <IndicatorBar value={indState} onChange={setIndState} />
      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-2">
        {error && <div className="m-2 rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</div>}
        <CandlesCanvas
          points={data || []}
          loading={loading}
          indicators={inds}
          onHoverIndex={setHoverIdx}
        />
        {!address && (
          <div className="p-4 text-sm text-zinc-500">
            Tipp: Füge eine Solana Contract Address (CA) ein und klicke <em>Load</em>.  
            Hotkeys: <kbd>1</kbd>=1m <kbd>2</kbd>=5m <kbd>3</kbd>=15m <kbd>4</kbd>=1h <kbd>5</kbd>=4h <kbd>6</kbd>=1d, <kbd>Enter</kbd>=Load
          </div>
        )}
        {!!address && (!data || data.length===0) && !loading && !error && (
          <div className="p-4 text-sm text-zinc-500">
            Keine OHLC-Daten für diese Adresse / Timeframe gefunden. Prüfe Address/TF oder versuche einen anderen Zeitraum.
          </div>
        )}
      </div>
    </div>
  );
}
