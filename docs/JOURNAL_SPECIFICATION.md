## Sparkfined Trading Journal – Spezifikation

### 1. Überblick
- **Ziel**: Vollwertiges Trading-Journal mit Ideenverwaltung, Trade-Lifecycle, Kennzahlen & Visualisierungen.
- **Scope**: Frontend (React) + Edge-API (`/api/journal`) + lokale Persistenz (`useJournal` Hook).
- **Single Source of Truth**: Typdefinitionen & Utilities in `src/lib/journal.ts`, Re-Exports via `src/sections/journal/types.ts`.
- **Anforderungen**: Backward-kompatibel zu bestehenden Notes, keine neuen Abhängigkeiten, optional erweiterbare Felder.

---

### 2. Typ-System

#### 2.1 `Timeframe`
```ts
type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w";
```
- Erweiterung um `"30m"` & `"1w"`.
- Validierung via `isTimeframe`, Auswahlliste `TIMEFRAMES`.

#### 2.2 `TradeStatus`
```ts
type TradeStatus =
  | "idea"
  | "entered"
  | "running"
  | "winner"
  | "loser"
  | "breakeven"
  | "cancelled";
```
- Emoji- & Farbmetadaten in `TRADE_STATUS_META`.
- Validierung per `isTradeStatus`, Auswahlliste `TRADE_STATUSES`.

#### 2.3 `JournalNote`
```ts
type JournalNote = {
  id: string;
  createdAt: number;
  updatedAt: number;
  title?: string;
  body: string;
  tags: string[];
  screenshotDataUrl?: string;
  permalink?: string;
  address?: string;
  tf?: Timeframe;
  ruleId?: string;
  aiAttachedAt?: number;
  status?: TradeStatus;
  setupName?: string;
  entryPrice?: number;
  exitPrice?: number;
  positionSize?: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  pnlPercent?: number;
  riskRewardRatio?: number;
};
```
- Alle neuen Felder optional, um Legacy-Notes zu akzeptieren.
- Zahl-Felder werden im API-Layer und lokalen Store normalisiert (Strings → Float, leere Werte → `undefined`).

#### 2.4 Kennzahlen-Utility
```ts
computeTradeMetrics({
  entryPrice,
  exitPrice,
  positionSize,
  stopLoss,
  takeProfit,
})
```
- Berechnet `pnl`, `pnlPercent`, `risk`, `reward`, `riskRewardRatio`.
- Sicherheits-Guards (NaN, Division durch 0).
- Dient als einheitliche Berechnungsbasis für Editor, Liste, Stats & API.

---

### 3. Komponenten

#### 3.1 `JournalEditor`
- **Sektion „Trading-Daten“** (Accordion, Default offen).
  - Status-Dropdown mit Emojis, Setup-Feld, Number-Inputs für Pricing & Risk.
  - Live-Berechnung von PnL, PnL%, Risk/Reward; R/R ≥ 2 wird hervorgehoben; PnL farblich (Gewinn/Verlust).
  - Quick-Hinweise für offene Trades (Stop/TP/Position).
- **Sektion „Chart-Kontext & Metadata“** (Accordion, Default geschlossen).
  - Timeframe-Auswahl (`TIMEFRAMES`), Asset/Contract, Permalink, Rule-Referenz.
- **Attachments**: Screenshot Upload & Preview, Permalink.
- **Persistenz**: `onChange` erhält stets ein gemergtes Draft-Objekt (`Partial<JournalNote>`).

#### 3.2 `JournalList`
- Kartenansicht (responsive) mit:
  - Status-Badge (Emoji + Farbton nach `tone`).
  - Setup-Tag, R/R-Badge (Ampelsystem), PnL% Tag.
  - Kennzahlenblock: PnL, Entry→Exit, Size, SL/TP.
  - Screenshot-Preview & Tag-Chip-Liste.
- Filterung: Volltext (`q`) & Tag-Filter (`#tag`).

#### 3.3 `JournalStats`
- Dashboard unterhalb des Editors.
- Kennzahl-Kacheln: Gesamt-PnL, Win Rate (Grün >50 %, Gelb 45–50 %, Rot <45 %), Profit Factor (Grün >2, Gelb >1, Rot <1).
- Status-Übersicht (alle 7 Status) inkl. PnL aggregation.
- Top-3 Setups (ØPnL + ØR/R).
- Ø Risk/Reward, laufende Trades (Anzahl & Ø Risiko), Ideen vs. Trades Conversion.
- Hinweis: Ideen werden separat betrachtet; Win Rate & Profit Factor nutzen nur abgeschlossene Trades.

#### 3.4 `useJournal`
- Lokaler Storage (`sparkfined.journal.v1`).
- Normalisiert Drafts (Strings trimmen, Floats parsen, Setups & Timeframes validieren).
- `create` & `update` berechnen Kennzahlen via `computeTradeMetrics`.

#### 3.5 `JournalPage`
- Koordiniert Editor, Stats, AI-Assist, Server-Sync & Liste.
- Server-Kommunikation `/api/journal`: `saveServer`, `loadServer`, `delServer`.
- Event-Brücke: `journal:draft` (Chart Snapshots), `journal:insert` (AI-Assist).

---

### 4. API-Endpunkte (`/api/journal`)

| Methode | Zweck | Anmerkungen |
| --- | --- | --- |
| `GET` | Alle Notes des Users (KV) | Rechnet fehlende Kennzahlen nach, sortiert nach `updatedAt`. |
| `POST` | Create/Update | Payload wird normalisiert: Strings→Trim, Zahlen→Float, Tags begrenzt (20). |
| `POST` mit `{ delete: true, id }` | Löschen | Entfernt Eintrag + Index. |

- **Rückgabe**: `note` / `notes` entsprechen `JournalNote`.
- **Backward-Compat**: Legacy Notes ohne neue Felder bleiben valide.
- **Kennzahlen**: `computeTradeMetrics` überschreibt nur dann, wenn Ergebnis valide ist (Nutzer kann vorkalkulierte Werte überschreiben).

---

### 5. User Flows

1. **Idee anlegen**
   - Nutzer öffnet Editor, trägt Hypothese ein, optional Tags/Screenshot.
   - Standard-Status: `idea`.
   - Speichern erzeugt lokalen Eintrag + optionale API-Speicherung.

2. **Trade planen**
   - „Trading-Daten“-Sektion ausklappen.
   - Entry/Stop/TP & Position Size eingeben → R/R & PnL Preview erscheinen.
   - Setup/Strategie benennen, Status auf `entered`.

3. **Trade live verfolgen**
   - Status `running`, Position Size & Stop/TP aktualisieren.
   - JournalList-Badge zeigt Status, Stats-Dashboard zählt laufende Trades.

4. **Trade abschließen**
   - Exit Price setzen, Status auf `winner`/`loser`/`breakeven`.
   - PnL/PnL% werden final berechnet, Dashboard aktualisiert Win Rate & Profit Factor.

5. **Cancel / Ungültig**
   - Status `cancelled` falls Idee abgebrochen (fließt nicht in Win Rate ein).

6. **Server Sync**
   - `loadServer` → GET API.
   - `saveServer` → POST; merges existing ID oder nutzt `crypto.randomUUID`.
   - `delServer` → Remove (mit Confirm).

7. **AI Assist**
   - Draft & Events interagieren mit `useAssist`; result kann per Button in Body übernommen werden.

---

### 6. Integrationen

- **Charts**
  - `window.dispatchEvent(new CustomEvent("journal:draft", { detail }))` → Editor befüllt Draft (z. B. Asset, Screenshot, Setup).
  - `journal:insert` Event erweitert Body (z. B. AI generierte Bullet Points).

- **Rules Engine**
  - `ruleId` Feld verknüpft Note mit Regel/Playbook.
  - Anzeige & Bearbeitung in „Chart-Kontext & Metadata“.
  - Serverliste zeigt Rule-Ausschnitt (`rule:xxxx…`), dient als Deep Link.

- **Screenshots/Permalinks**
  - Upload via FileReader (`blobToDataUrl`).
  - Permalink Link-Button öffnet Chart im neuen Tab (`rel="noreferrer"`).

---

### 7. Roadmap / Erweiterungen

| Priorität | Feature | Notizen |
| --- | --- | --- |
| Hoch | API: Filter & Paginierung | Server-GET optional nach Status/Tag filtern. |
| Hoch | Analytics Export | Export-Formats (CSV, PDF) erweitern, Stats in Export integrieren. |
| Mittel | Mobile Optimierung | Stats-Kacheln als Carousel, Editor-Accordion default collapsed. |
| Mittel | Automatisches RR-Alerting | Visual Cue wenn R/R < 1, Stop/TP nicht gesetzt. |
| Mittel | Rule Drill-Down | Direktverlinkung zum Rule Editor, Suggestions aus Rules. |
| Niedrig | Multi-Account Support | Journal segmentieren nach Accounts/Exchanges. |
| Niedrig | Backtesting Sync | API-Hooks zu Backtest Runs, automatisches Anhängen. |

---

### 8. Testing & Qualitätssicherung

- **Type Safety**: `pnpm typecheck` – sicherstellen, dass alle Consumers `JournalNote` aktuell nutzen.
- **Manuelle QA**:
  - Idee → Trade → Abschluss Flow durchlaufen.
  - R/R > 2 validieren (Badge grün).
  - Win Rate & Profit Factor Farbwechsel prüfen (45 % / 50 % Schwelle).
  - API Roundtrip mit/ohne neuen Feldern (Legacy). 
- **Resilience**:
  - Missing numeric fields → Kennzahlen bleiben `undefined`.
  - Tags leer / Strings mit Leerzeichen → werden bereinigt.
  - `positionSize` 0 → PnL berechnet (ergibt 0), R/R guard (Division by 0).

---

**Änderungshistorie**
- *2025-11-09* – Implementierung der Trading-Erweiterungen (Status, Kennzahlen, Stats Dashboard, Dokumentation).
