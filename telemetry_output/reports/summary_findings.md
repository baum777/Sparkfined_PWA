# Event Catalog — Executive Summary & Findings

**Datum:** 2025-11-09  
**Analyst:** Claude 4.5 (Cursor Agent)  
**Scope:** Event Catalog Enrichment, Standardization & Gap Analysis

---

## Executive Summary (Deutsch)

Der Event-Katalog für **SparkFined** wurde systematisch analysiert, angereichert und standardisiert. Der ursprüngliche Katalog enthielt **33 vollständige Events**, fokussiert auf UI/UX-Tracking (Watchlist, Replay, Charts, Orders). Bei der Code-Analyse wurden **8 kritische fehlende Events** identifiziert, darunter Core-Events wie `session.start`, `screen_view`, `error.occurred`, und `wallet.connect`.

**Wichtigste Erkenntnisse:**
1. **Vollständigkeit:** Der Katalog deckt UI-Interaktionen gut ab, aber grundlegende System- und Lifecycle-Events fehlen.
2. **Privacy Compliance:** ~30% der Events enthalten potenziell PII (`pii` oder `sensitive`) — Hashing/Pseudonymisierung empfohlen.
3. **Prioritäten:** 15 Events haben **Priority A** (must-track), 12 Events **Priority B** (should-track), 14 Events **Priority C** (optional).
4. **JSON Schemas:** 27 validierbare JSON Schemas (Draft 7) wurden für A/B-Events exportiert.
5. **Quick Wins:** Session-Tracking, Screen-Views und Error-Logging können mit geringem Aufwand implementiert werden (bereits im Code vorhanden, nur Katalog fehlt).

**Handlungsempfehlung:** Fokus auf **Priority A Events** (15 Events) — davon 7 inferiert/fehlend. Implementierung dauert geschätzt 2–3 Sprints (bei vorhandener Telemetrie-Infrastruktur).

---

## 1. Bestandsaufnahme (Inventory)

### 1.1 Event-Verteilung nach Domain

| Domain | Anzahl Events | Anteil |
|--------|---------------|--------|
| `watchlist` | 7 | 17% |
| `replay` | 6 | 15% |
| `chart` | 6 | 15% |
| `order` / `trade` | 4 | 10% |
| `session` / `navigation` | 3 | 7% |
| `alert` | 1 | 2% |
| `ui` / `dashboard` | 8 | 20% |
| `system` / `error` | 2 | 5% |
| `user` / `wallet` / `pwa` | 4 | 10% |

**Findings:**
- **Watchlist & Replay** sind gut abgedeckt (je 6–7 Events)
- **System/Error-Handling** unterrepräsentiert (nur 2 Events)
- **User Lifecycle** fehlt fast komplett (signup, login, logout nicht im Katalog)

---

### 1.2 Event-Verteilung nach Priorität

| Priorität | Anzahl | Beschreibung |
|-----------|--------|--------------|
| **A** (must-track) | 15 | Kritische Business- & System-Events |
| **B** (should-track) | 12 | Wichtige UX- & Product-Metriken |
| **C** (optional) | 14 | Nice-to-have & Diagnostik |

**Findings:**
- **50% Priority A/B** — gute Balance zwischen Must-Have und Nice-to-Have
- **Priority A Events** enthalten 7 inferierte/fehlende Events → priorisiert implementieren

---

### 1.3 Privacy-Level Distribution

| Privacy Level | Anzahl | Anteil | Hinweise |
|---------------|--------|--------|----------|
| `public` | 18 | 44% | Keine PII, sicher für Analytics |
| `pseudonymous` | 1 | 2% | Wallet-Adressen (pseudonym) |
| `sensitive` | 10 | 24% | Financial Data, Session Replays |
| `pii` | 12 | 29% | User IDs, Notes, Contact Info |

**Findings:**
- **~30% PII/Sensitive** — erfordert Hashing/Encryption für Client→Server Transport
- **Empfehlung:** Server-Side Proxy für PII-Events (Client sendet an `/api/telemetry`, Server hasht und weiterleitet)
- **Compliance:** DSGVO-konform durch `privacy_level` Tagging — Retention Policies definieren (z.B. PII: 30 Tage, public: 2 Jahre)

---

## 2. Top 5 Gaps (Fehlende Events)

### Gap 1: **Session Lifecycle Events** (Priority A)
**Fehlend:**
- `session.start` (inferiert, bereits im Code via `useEventLogger`)
- `session.end` (inferiert, bereits im Code via `useEventLogger`)

**Impact:** Ohne Session-Events keine Basis für User-Journey-Analyse, Session-Duration, Bounce-Rates.  
**Effort:** Low (Code bereits vorhanden, nur Katalog-Eintrag fehlt)  
**Action:** Katalog aktualisieren, Schema validieren, Live-Test.

---

### Gap 2: **Screen/Page View Tracking** (Priority A)
**Fehlend:**
- `screen_view` (Core Navigation Event)

**Impact:** Keine Page-View-Metriken, keine Funnel-Analyse möglich.  
**Effort:** Medium (benötigt Router-Integration für SPA — React Router / TanStack Router)  
**Action:** Implementiere `screen_view` Event in Router `onEnter` Hook.

**Beispiel:**
```typescript
// In Router Config
onEnter: (route) => {
  logEvent('screen_view', {
    screen_name: route.name,
    path: route.path,
    referrer: document.referrer,
  });
}
```

---

### Gap 3: **Error Tracking** (Priority A)
**Fehlend:**
- `error.occurred` (inferiert, teilweise im Code via `useEventLogger.logError`)

**Impact:** Fehlermonitoring unvollständig — keine systematische Error-Telemetrie.  
**Effort:** Low (Code vorhanden, nur fehlende Schema-Definition)  
**Action:** 
1. Schema definieren (bereits generiert: `schemas/error.occurred.json`)
2. Sentry-Integration prüfen (Redundanz vermeiden)
3. Client-Side Error Boundary hinzufügen

---

### Gap 4: **User Lifecycle Events** (Priority A)
**Fehlend:**
- `user.signup` (Critical für Conversion-Tracking)
- `user.login` / `user.logout` (nicht im Katalog)

**Impact:** Keine User-Acquisition-Metriken, keine Retention-Analyse.  
**Effort:** Medium (Authentication-Flow muss Events feuern)  
**Action:** 
1. In Auth-Flow `user.signup` Event hinzufügen
2. Bei erfolgreicher Anmeldung `user.login` feuern
3. Privacy: `userId` hashen (siehe `privacy_level = pii`)

---

### Gap 5: **Wallet & Web3 Events** (Priority A)
**Fehlend:**
- `wallet.connect` (inferiert, basierend auf `src/lib/data/walletFlow.ts`)
- `wallet.disconnect`
- `wallet.transaction_sign`

**Impact:** Keine Web3-Engagement-Metriken — essentiell für Crypto-Trading-App.  
**Effort:** Low–Medium (Wallet-Flow existiert, Events hinzufügen)  
**Action:** 
1. In `walletFlow.ts` Events bei `connect()`, `disconnect()`, `signTransaction()` feuern
2. Privacy: Wallet-Adressen sind pseudonymous (nicht hashen, aber als `privacy_level = pseudonymous` markieren)

---

## 3. Quick Wins (Low Effort, High Impact)

### Quick Win 1: **Session-Tracking aktivieren** (Effort: Low, Impact: High)
- **Was:** `session.start` und `session.end` sind bereits im Code (`useEventLogger`)
- **Warum:** Basis für alle anderen Analysen (Session-Duration, DAU/MAU, Retention)
- **Action:** Katalog-Eintrag erstellen + Schema validieren (bereits erledigt ✅)

---

### Quick Win 2: **Error-Logging standardisieren** (Effort: Low, Impact: High)
- **Was:** `error.occurred` ist teilweise implementiert (`useEventLogger.logError`)
- **Warum:** Kritisch für Debugging & Monitoring
- **Action:** 
  - Schema finalisieren (✅ bereits generiert)
  - Error Boundary in React hinzufügen (ErrorBoundary Component)
  - Sentry-Integration prüfen (Redundanz vermeiden)

---

### Quick Win 3: **PWA Install Prompt Tracking** (Effort: Low, Impact: Medium)
- **Was:** PWA-Installation ist ein Key-Metric für Engagement
- **Warum:** SparkFined ist PWA — Install-Rate tracken
- **Action:** 
  ```typescript
  window.addEventListener('beforeinstallprompt', (e) => {
    logEvent('pwa.install_prompt_shown', { platform: 'web' });
  });
  ```

---

## 4. Migration Risks & Constraints

### Risk 1: **PII in Client-Side Events**
**Problem:** ~30% der Events enthalten PII (`userId`, `notes`, `email`-Felder möglich).  
**Risk Level:** High (DSGVO-Compliance)  
**Mitigation:**
1. Server-Side Proxy für PII-Events (Client → `/api/telemetry` → Server hasht → Analytics Backend)
2. Niemals `email`, `phone`, `password` im Payload
3. `userId` als UUID/Hash (nicht `user_123` oder `john.doe`)

### Risk 2: **Event-Volume & Costs**
**Problem:** High-Frequency Events (z.B. `chart_crosshair_move`) können Kosten explodieren lassen.  
**Risk Level:** Medium (Cost)  
**Mitigation:**
1. Aggressive Sampling (0.1–1% für Crosshair)
2. Client-Side Buffering & Aggregation (Events batchen)
3. Rate-Limiting (max 100 Events/sec pro Client)

### Risk 3: **Schema Breaking Changes**
**Problem:** Schema-Änderungen können alte Events brechen (z.B. required field hinzufügen).  
**Risk Level:** Medium (Data Loss)  
**Mitigation:**
1. Versionierung: Neue Schema-Version = `v2.0.0` (SemVer)
2. Backward Compatibility: Alte Events gegen alte Schemas validieren
3. Deprecation Policy: Min. 3 Monate Overlap für alte Schemas

---

## 5. Priorisierte Next Steps

### Phase 1: Foundation (Sprint 1–2) — **Priority A Events**

| Task | Event(s) | Effort | Owner | Status |
|------|---------|--------|-------|--------|
| 1. Session-Tracking aktivieren | `session.start`, `session.end` | Low | analytics | ✅ Code vorhanden |
| 2. Screen-View Tracking | `screen_view` | Medium | frontend | 🔴 Fehlt |
| 3. Error-Logging standardisieren | `error.occurred` | Low | engineering | 🟡 Teilweise |
| 4. Wallet-Events | `wallet.connect`, `wallet.disconnect` | Medium | wallet-team | 🔴 Fehlt |
| 5. User-Signup Tracking | `user.signup` | Low | auth-team | 🔴 Fehlt |

**Geschätzter Aufwand:** 2 Sprints (bei 2 Engineers)

---

### Phase 2: Enhancement (Sprint 3–4) — **Priority B Events**

| Task | Event(s) | Effort | Owner | Status |
|------|---------|--------|-------|--------|
| 6. PWA Install Tracking | `pwa.install_prompt_shown` | Low | product | 🔴 Fehlt |
| 7. Push Notification Tracking | `push.permission_request` | Low | notifications | 🔴 Fehlt |
| 8. Order Preview Events | `order_place_preview` | Low | trading | ✅ Vorhanden |
| 9. Chart Annotation Events | `chart_annotation_create` | Low | chart | ✅ Vorhanden |

**Geschätzter Aufwand:** 1 Sprint

---

### Phase 3: Optimization (Sprint 5+) — **Priority C Events**

| Task | Event(s) | Effort | Owner | Status |
|------|---------|--------|-------|--------|
| 10. Sampling implementieren | High-Freq Events (Crosshair, Seek) | Medium | devops | 🟡 Teilweise |
| 11. Event Deduplication | Idempotency Keys | Medium | backend | 🟡 Teilweise |
| 12. Catalog-Sync Automation | Code↔Catalog Sync | Low | analytics | 🔴 Fehlt |

**Geschätzter Aufwand:** 1 Sprint

---

## 6. Deliverables

✅ **Enhanced CSV:** `/workspace/telemetry_output/enhanced_Event_Catalog.csv`  
✅ **JSON Schemas (27 Dateien):** `/workspace/telemetry_output/schemas/`  
✅ **Mapping Table:** `/workspace/telemetry_output/reports/EVENTS_MAPPING.md`  
✅ **QA Checklist:** `/workspace/telemetry_output/reports/telemetry_qa_checklist.md`  
✅ **Summary Findings:** `/workspace/telemetry_output/reports/summary_findings.md` (dieses Dokument)

---

## 7. Offene Fragen / Follow-Ups

1. **Analytics Backend:** Welches Tool wird verwendet? (Segment, Amplitude, Mixpanel, Custom?)
   - Falls Custom: API-Endpunkt und Schema-Validation benötigt
   - Falls Segment: Event-Names zu Segment Tracking Plan hinzufügen

2. **PII Handling:** Existiert bereits ein Server-Side Telemetry-Proxy?
   - Falls nein: Implementierung empfohlen (siehe `/api/telemetry.ts`)
   - Falls ja: Hashing-Logik dokumentieren

3. **Sampling Config:** Wo wird Sampling konfiguriert? (Client vs. Server)
   - Empfehlung: Server-Side Sampling (weniger Client-Complexity)

4. **Retention Policy:** Wie lange werden Events gespeichert?
   - Empfehlung: `public` = 2 Jahre, `pii/sensitive` = 30 Tage (DSGVO)

5. **Monitoring & Alerting:** Sentry/Datadog Integration vorhanden?
   - Falls ja: Schema-Validation Alerts einrichten

---

## 8. Appendix: Konventionen & Standards

### Event Naming Convention
- **Format:** `domain.object_action` (z.B. `chart.indicator_add`)
- **Snake Case:** Nur Kleinbuchstaben + Unterstriche/Punkte
- **Dot-Namespacing:** Erste Komponente = Domain (z.B. `watchlist.*`, `replay.*`)

### JSON Schema Standard
- **Draft Version:** JSON Schema Draft 7 (oder 2020-12)
- **Required Fields:** Mindestens `sessionId` und `ts` (timestamp)
- **Timestamps:** ISO8601 Format (`YYYY-MM-DDTHH:mm:ss.sssZ`)

### Privacy Levels
- `public`: Keine PII, sicher für alle Analysen
- `pseudonymous`: Wallet-Adressen, Pseudonyme User-IDs
- `sensitive`: Financial Data, Session-Daten
- `pii`: Email, Namen, Contact Info → Hashing erforderlich

---

**Ende des Reports**  
**Nächster Review-Termin:** 2025-12-09 (monatlich)
