# Journal-System — Spezifikation & Features

## Übersicht

Das Journal-System ist ein vollständiges Trading-Journal mit erweiterten Features für Trade-Tracking, Performance-Analyse und AI-gestützter Notizenverdichtung.

## Type-Definitionen

### JournalNote

Die zentrale Type-Definition in `/src/lib/journal.ts`:

```typescript
type JournalNote = {
  // Basis-Felder
  id: string;
  createdAt: number;
  updatedAt: number;
  title?: string;
  body: string;
  tags?: string[];
  
  // Chart & Kontext
  address?: string;           // Contract Address (CA)
  tf?: Timeframe;            // Timeframe der Analyse
  ruleId?: string;           // Link zu Trading-Rule
  screenshotDataUrl?: string; // Chart Screenshot (Data URL)
  permalink?: string;        // Link zurück zum Chart
  
  // Trading-spezifische Felder
  status?: TradeStatus;      // Status des Trades
  entryPrice?: number;       // Einstiegspreis
  exitPrice?: number;        // Ausstiegspreis
  positionSize?: number;     // Positionsgröße (USD)
  stopLoss?: number;         // Stop-Loss Preis
  takeProfit?: number;       // Take-Profit Preis
  pnl?: number;              // Profit & Loss (USD)
  pnlPercent?: number;       // PnL in Prozent
  riskRewardRatio?: number;  // Risk/Reward Verhältnis
  setup?: string;            // Trading Setup/Strategie
  
  // AI & Automatisierung
  aiAttachedAt?: number;     // Timestamp AI-Analyse
  
  // Metadata
  enteredAt?: number;        // Timestamp Einstieg
  exitedAt?: number;         // Timestamp Ausstieg
}
```

### TradeStatus

```typescript
type TradeStatus = 
  | "idea"      // 💡 Trade-Idee
  | "entered"   // 📍 Eingestiegen
  | "running"   // 🏃 Laufender Trade
  | "winner"    // 🎉 Gewinner
  | "loser"     // 📉 Verlierer
  | "breakeven" // ➖ Breakeven
  | "cancelled" // ❌ Abgebrochen
```

### Timeframe

```typescript
type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w"
```

## Komponenten

### JournalEditor

Erweiterte Editor-Komponente mit ausklappbaren Sektionen:

**Features:**
- ✅ Titel & Body (Markdown-Support)
- ✅ Screenshot-Upload (Paste oder File-Picker)
- ✅ **Trading-Daten Sektion** (ausklappbar)
  - Status-Auswahl
  - Entry/Exit Preise
  - Stop Loss / Take Profit
  - Position Size
  - Setup/Strategie Name
  - **Automatische PnL-Berechnung**
  - **Automatische R/R-Ratio-Berechnung**
- ✅ **Chart-Kontext & Metadata** (ausklappbar)
  - Contract Address
  - Timeframe
  - Rule ID
- ✅ Tags
- ✅ Permalink-Support

**Automatische Berechnungen:**

```typescript
// PnL wird automatisch berechnet wenn Entry, Exit und Position Size gesetzt sind
pnl = (exitPrice - entryPrice) * positionSize
pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100

// Risk/Reward Ratio wird automatisch berechnet
risk = |entryPrice - stopLoss|
reward = |takeProfit - entryPrice|
riskRewardRatio = reward / risk
```

### JournalStats

Trading-Statistik-Dashboard mit:

**Performance-Metriken:**
- 📊 **Gesamt P&L** (USD)
- 📈 **Win Rate** (%, Winners/Losers/Breakeven)
- 💰 **Profit Factor** (Avg Win / Avg Loss)

**Status-Übersicht:**
- Anzahl Winners, Losers, Breakeven, Laufende Trades

**Setup-Analyse:**
- Top 3 meistgenutzte Setups
- Durchschnittliche R/R Ratio

**Smart Features:**
- Filtert automatisch nur Trading-Einträge (Status != "idea" & != "cancelled")
- Zeigt Hinweis bei laufenden Trades

### JournalList

Erweiterte Liste mit Trading-Informationen:

**Anzeige pro Note:**
- Status-Badge (farbcodiert mit Emoji)
- P&L-Badge (grün/rot je nach Profit/Loss)
- Setup & R/R-Ratio
- Screenshot-Preview
- Tags
- Aktionen (Öffnen, Löschen)

## API-Endpoints

### POST/GET `/api/journal`

**Features:**
- CRUD für Journal-Einträge
- User-spezifische Speicherung (KV-Store)
- Unterstützt alle erweiterten Felder
- Automatische Timestamps

**Speicherung:**
```typescript
Key: `journal:${userId}:${noteId}`
Set: `journal:byUser:${userId}` // Set aller Note-IDs
```

### GET `/api/journal/export`

**Export-Formate:**
- `?fmt=json` — JSON-Export aller Notizen
- `?fmt=md` — Markdown-Export mit strukturierten Feldern

## User Flows

### 1. Trading-Journal-Eintrag erstellen

1. Klick auf "Neu" oder automatischer Draft vom Chart
2. Titel & Body eingeben
3. **Trading-Daten** ausklappen
4. Status wählen (z.B. "Eingestiegen")
5. Entry Price, Stop Loss, Take Profit eingeben
6. Position Size eingeben
7. **R/R Ratio wird automatisch berechnet**
8. Optional: Setup-Name hinzufügen (z.B. "Breakout")
9. Speichern → Note wird lokal & auf Server gespeichert

### 2. Trade abschließen

1. Bestehende Note in Editor laden
2. Status auf "Winner" oder "Loser" ändern
3. Exit Price eingeben
4. **PnL wird automatisch berechnet**
5. Speichern → Statistiken werden aktualisiert

### 3. Performance-Analyse

1. **JournalStats** zeigt automatisch:
   - Gesamt-P&L über alle Trades
   - Win Rate
   - Profit Factor
   - Top Setups
2. Filtere Notes nach Setup/Tag für detaillierte Analyse
3. Exportiere Daten für externe Analyse

### 4. AI-gestützte Notizen

1. Langen Text in Body schreiben
2. "Verdichten" klicken
3. AI generiert prägnante Bullet-Points:
   - Kontext
   - Beobachtung
   - Hypothese
   - Plan
   - Risiko
   - Nächste Aktion
4. "AI-Analyse anhängen & speichern" → wird an Body angehängt

## Datenpersistenz

| Speicherort | Verwendung | Sync |
|------------|-----------|------|
| **LocalStorage** (`sparkfined.journal.v1`) | Lokale Notes via `useJournal` | Keine |
| **Server KV** | Server Notes via `/api/journal` | Manuell |
| **State** | Draft-Editor | Ephemeral |

**Hinweis:** Lokale und Server-Notes sind getrennt. User kann wählen, ob er nur lokal oder auch auf Server speichert.

## Best Practices

### Trading-Journal führen

1. **Vor dem Trade:**
   - Status: "idea"
   - Entry geplant, SL/TP setzen
   - Setup dokumentieren
   - R/R prüfen (sollte > 2:1 sein)

2. **Bei Entry:**
   - Status: "entered" → "running"
   - Entry Price bestätigen
   - Screenshot vom Chart speichern

3. **Bei Exit:**
   - Status: "winner"/"loser"/"breakeven"
   - Exit Price eingeben
   - PnL prüfen
   - Learnings in Body notieren

4. **Review:**
   - Statistiken analysieren
   - Welche Setups funktionieren?
   - Win Rate > 50%?
   - Profit Factor > 2?

### Performance-Metriken

| Metrik | Gut | Okay | Schlecht |
|--------|-----|------|----------|
| **Win Rate** | > 60% | 45-60% | < 45% |
| **Profit Factor** | > 2.0 | 1.5-2.0 | < 1.5 |
| **R/R Ratio** | > 2:1 | 1.5:1-2:1 | < 1.5:1 |

## Integration mit anderen Features

### Chart → Journal

- Chart-Page kann `journal:draft` Event dispatchen
- Event enthält: `address`, `tf`, `screenshotDataUrl`, `permalink`
- Journal-Page fängt Event und füllt Draft vor

### Journal → Rules

- `ruleId` kann gesetzt werden
- Link zu automatisierten Trading-Rules
- Später: Auto-Journal-Einträge bei Rule-Trigger

### Journal → AI

- AI-Assist verdichtet Notizen
- Prompt optimiert auf Trading-Kontext
- Strukturiertes Format (6 Bullet Points)

## Technische Details

### Type-Synchronisation

Zentrale Definition in `/src/lib/journal.ts` wird re-exportiert in `/src/sections/journal/types.ts`:

```typescript
export type { JournalNote, Timeframe, TradeStatus } from "../../lib/journal";
```

→ Single Source of Truth für Types

### API-Handler Validierung

```typescript
// Typsichere Nummer-Validierung
entryPrice: typeof b?.entryPrice === "number" ? b.entryPrice : undefined
```

→ Verhindert invalid Daten im Store

### React Effects für Auto-Calculation

- `useEffect` überwacht Entry/Exit/Size → berechnet PnL
- `useEffect` überwacht Entry/SL/TP → berechnet R/R
- Dependencies array sichert korrektes Timing

## Testing

Tests in `/tests/unit/journal.crud.test.ts` (aktuell Stubs):

**TODO:**
- [ ] Save Performance < 60ms
- [ ] Filter by Status
- [ ] PnL Calculation
- [ ] Export to CSV with Trading-Felder
- [ ] Grid Rendering < 250ms

## Roadmap

**Phase 2:**
- [ ] Chart-Integration (visualize notes on chart)
- [ ] P&L-Tracking Timeline
- [ ] Setup-Performance-Matrix
- [ ] Auto-Tags via AI
- [ ] Import von Broker-Daten (CSV)
- [ ] Multi-Currency Support
- [ ] Mobile Optimierung (PWA)

**Phase 3:**
- [ ] Social Features (Share anonymisierte Setups)
- [ ] Backtesting-Integration
- [ ] Position-Sizing Calculator
- [ ] Risk Management Dashboard
- [ ] Export zu TradingView

---

**Stand:** 2025-11-08  
**Version:** 1.0 (erweiterte Spezifikation)  
**Autor:** AI Agent
