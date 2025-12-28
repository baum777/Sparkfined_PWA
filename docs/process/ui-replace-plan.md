# UI Replace Plan: sparkfined-mastery Integration

**Branch**: `ui-replace/sparkfined-mastery`  
**Ziel**: Ersetze bestehende Frontend-UI 1:1 durch sparkfined-mastery.zip (Vite + React + shadcn), behalte Business-Logic, verdrahte mit echter API + WalletConnect + Onchain.

---

## Step 0: Sicherheitsnetz ✅

- [x] Branch `ui-replace/sparkfined-mastery` erstellt
- [ ] Legacy UI Backup (optional: `legacy-ui/` oder Feature-Flag)
- [ ] Rollback-Plan dokumentiert

---

## Step 1: Code-Import (ohne ZIP-Artefakte)

### 1.1 ZIP entpacken
```bash
# ZIP entpacken in temporäres Verzeichnis
unzip sparkfined-mastery.zip -d tmp-sparkfined-mastery/

# .git/ entfernen (falls vorhanden)
rm -rf tmp-sparkfined-mastery/.git
rm -rf tmp-sparkfined-mastery/**/.git
```

### 1.2 Struktur analysieren
- [ ] `src/` Struktur prüfen (Komponenten, Pages, Hooks)
- [ ] `public/` Assets prüfen
- [ ] Config-Dateien prüfen (`vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, etc.)
- [ ] `package.json` Dependencies vergleichen

### 1.3 package.json Merge-Strategie
- [ ] Dependencies mergen (keine Duplikate)
- [ ] Scripts beibehalten (dev, build, test, etc.)
- [ ] Package Manager: pnpm beibehalten

---

## Step 2: Repo-Integration (Modus A: Replace)

### 2.1 Dateien ersetzen
- [ ] `src/` → komplett ersetzen (Backup vorher)
- [ ] `public/` → mergen (Assets behalten, neue hinzufügen)
- [ ] `index.html` → ersetzen
- [ ] Config-Dateien → mergen/ersetzen

### 2.2 Imports anpassen
- [ ] Alias-Pfade prüfen (`@/` → `src/`)
- [ ] Relative Imports prüfen
- [ ] Type-Imports prüfen

### 2.3 Env-Variablen
- [ ] `.env` prüfen und anpassen
- [ ] API-Endpoints konfigurieren

---

## Step 3: Verdrahtung statt Stubs

### 3.1 API Layer
**Checkliste pro Tab (aus wiring_matrix.json):**

#### Dashboard
- [ ] `/api/board/kpis` → `useDashboardData()` Hook
- [ ] `/api/board/feed` → Feed-Integration
- [ ] Loading/Error/Empty States

#### Journal
- [ ] `/api/journal/entry` → `useJournalEntries()` Hook
- [ ] `/api/ai/insights` → AI-Integration
- [ ] IndexedDB Sync beibehalten

#### Lessons
- [ ] `/api/lessons` → `useLessons()` Hook
- [ ] `/api/lessons/progress` → Progress-Tracking
- [ ] `markLessonComplete` Mutation

#### Chart
- [ ] `/api/data/ohlc` → OHLC-Integration
- [ ] Multi-Provider Fallback beibehalten
- [ ] Replay-Mode unterstützen

#### Alerts
- [ ] `/api/alerts/create` → `useAlerts()` Hook
- [ ] `/api/alerts/update` → Update-Logik
- [ ] `/api/alerts/delete` → Delete-Logik

#### Watchlist
- [ ] `/api/market/token` → Token-Daten
- [ ] `/api/data/ohlc` → Price-Polling

#### Oracle
- [ ] `/api/oracle/report` → Report-Fetching
- [ ] `/api/oracle/history` → History-Chart

#### Settings
- [ ] `/api/settings/export` → Export-Funktion
- [ ] `/api/wallet/connect` → Wallet-Integration

### 3.2 WalletConnect Integration

**Bestehende Wallet-Infrastruktur:**
- `src/store/walletStore.ts` (Zustand Store)
- `src/lib/solana/store/connectedWallets.ts` (IndexedDB)
- `src/components/settings/ConnectedWalletsPanel.tsx`

**Zu integrieren:**
- [ ] Wallet-Provider aus sparkfined-mastery identifizieren
- [ ] Wallet-Store verbinden (`walletStore.connectWallet()`)
- [ ] Chain-Gating implementieren (falls benötigt)
- [ ] Switch-Chain implementieren (falls benötigt)
- [ ] Rejection-Handling verbessern

**Connectors:**
- Solana Wallet Adapter
- Phantom, Solflare, Backpack

### 3.3 Onchain Reads/Writes

**Zentralisieren:**
- [ ] Chain-Config (`src/config/chains.ts`)
- [ ] Address-Registry (`src/config/addresses.ts`)
- [ ] ABI-Registry (`src/config/abis.ts`)

**Hooks erstellen:**
- [ ] `useOnchainRead()` - generischer Read-Hook
- [ ] `useOnchainWrite()` - generischer Write-Hook
- [ ] `useTokenMetadata()` - Token-Metadaten
- [ ] `useTokenBalance()` - Token-Balance

**TX Lifecycle UI:**
- [ ] Pending-State
- [ ] Success-State
- [ ] Error-State
- [ ] Rejection-Handling

**Gating vor jedem Call:**
- [ ] Wallet-Connected-Check
- [ ] Chain-ID-Check
- [ ] Network-Check

---

## Step 4: Tab-Konformität prüfen

### 4.1 Navigation-Struktur

**Primary Tabs (Rail):**
- [x] Dashboard (`/dashboard`)
- [x] Journal (`/journal`)
- [x] Chart (`/chart` + `/replay` alias)
- [x] Watchlist (`/watchlist`)
- [x] Alerts (`/alerts`)

**Secondary Tabs:**
- [x] Watchlist (`/watchlist`) - bereits Primary
- [x] Oracle (`/oracle`)
- [ ] Lessons (`/lessons`) - sollte Primary sein (laut wiring_matrix.json)

**Settings:**
- [x] Settings (`/settings`)

### 4.2 Route-Aliases prüfen
- [x] `/replay` → Chart-Mode (korrekt)
- [x] `/replay/:sessionId` → Chart-Mode (korrekt)
- [ ] `/learn` → `/lessons` Redirect (für Kompatibilität)

### 4.3 Navigation-Konfiguration
- [ ] `src/config/navigation.ts` prüfen
- [ ] Lessons zu Primary Nav verschieben (falls nötig)
- [ ] Active-State-Logik prüfen (`isNavItemActive()`)

---

## Step 5: Tests

### 5.1 Smoke E2E Tests

#### Lessons
- [ ] `/lessons` lädt
- [ ] Progress-Tracking funktioniert
- [ ] Filter funktioniert

#### Watchlist
- [ ] `/watchlist` lädt
- [ ] Open-Chart-Navigation funktioniert
- [ ] Token-Daten werden geladen

#### Oracle
- [ ] `/oracle` lädt
- [ ] Filter funktioniert
- [ ] History-Chart zeigt Daten

### 5.2 Wallet/Onchain E2E Tests

#### Wallet-Flows
- [ ] Wrong Network Handling
- [ ] Disconnected State
- [ ] Rejected Signature
- [ ] Chain Switch

#### Onchain-Flows
- [ ] TX Pending State
- [ ] TX Success State
- [ ] TX Error State
- [ ] Read-Calls funktionieren

### 5.3 Regression Harness
- [ ] Snapshot-Tests (falls vorhanden)
- [ ] Manual Checklist durchgehen
- [ ] Alle Primary Tabs testen

---

## DoD (Definition of Done)

- [ ] UI läuft (Vite Build erfolgreich)
- [ ] Tabs stimmen (Primary/Secondary konform)
- [ ] Keine Stub-Responses (alle API-Calls echt)
- [ ] Wallet/Onchain flows robust (alle Edge-Cases abgedeckt)
- [ ] CI grün (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`)

---

## Rollback-Plan

Falls Probleme auftreten:
1. Branch wechseln: `git checkout main`
2. Legacy UI wiederherstellen (aus Backup)
3. Feature-Flag setzen (falls implementiert)

---

**Status**: Step 0 abgeschlossen, wartet auf ZIP-Datei  
**Nächster Schritt**: Step 1 - ZIP entpacken und Struktur analysieren

