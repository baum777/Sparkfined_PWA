{{SYSTEM_PROMPT}}

USER:
TASK: Für {{ticker}} (Timeframe {{timeframe}}) erstelle 4–7 Bulletpoints auf Deutsch:
1) Marktstatus — Preis {{price}}, Support/Resistance (konkrete Werte)
2) Momentum/Trend — z.B. RSI, SMA slope, MACD hist (Zahlen)
3) Risiko/Volatilität — ATR(N)={{atr}}, 24h-Vol
4) Mögliche Trades — 2 Setups (Entry, SL, TP) mit Prozenten
5) Quelle/Trace — referenziere Datenquelle {{meta.source}}

Context: {{indicators}}
Onchain: {{onchain}}
Meta: {{meta}}

Output: JSON {"bullets": [...], "source_trace": {...}}
