# AI Event Inventory

| Event | Datei | Kurz-Summary | Agent |
|-------|-------|--------------|-------|
| Journal Notiz Verdichten | [events/journal-condense-ai.md](journal-condense-ai.md) | Komprimiert Draft-Notizen via AI-Proxy mit Kostenlimits & Token-Tracking. | anthropic |
| Analyze KPI Bullets | [events/analyze-bullets-ai.md](analyze-bullets-ai.md) | Generiert KPI-basierte Trading-Bullets über Template `v1/analyze_bullets`. | anthropic |
| AI Teaser Vision Analyse | [events/teaser-vision-analysis.md](teaser-vision-analysis.md) | Vision-gestützte Chart-Auswertung, fallback auf Heuristik bei Fehlern. | openai |

---

## On-chain Trade Events (Solana)

- **`trade_events` Dexie Store** – Speichert deduplizierte Swap-BUY-Events mit Unique-Index auf `txHash`, inkl. Wallet-Ref (`walletId` + `walletAddress`), Side/Source (`moralis` oder `helius`) sowie optionalen Amount/Price/Symbol-Metadaten.
- **Query-Helper** – `listUnconsumedBuyEvents(limit)` liefert die neuesten unbelegten BUY-Events (timestamp-desc, capped), `countUnconsumedBuyEvents()` treibt den Dashboard-Badge, `markEventConsumed(id)` toggelt nach Journal-Confirm auf `consumed=true`.
- **Dedup-Insert** – `saveTradeEvents(...)` ignoriert `txHash`-Duplikate über den Dexie-Constraint-Error, damit Watcher-Polls keine redundanten Items hinterlassen.
- **Moralis Wallet Swaps Provider** – `fetchWalletSwaps(walletAddress, opts)` ruft `/account/mainnet/{WALLET}/swaps` am Moralis Solana-Gateway ab, mappt BUY/SELL-Sides mit null-sicheren Amount/Price/Symbol/Mint-Feldern und liefert normalisierte `NormalizedTradeEvent`-Objekte (Source=`moralis`).

