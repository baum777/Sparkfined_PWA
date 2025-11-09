# Telemetry QA Checklist

**Version:** 1.0  
**Stand:** 2025-11-09  
**Zweck:** Quality Assurance für Event-Telemetrie — Validierung, Testing und Compliance

---

## 1. Schema Validation Tests

### Test 1.1: JSON Schema Compliance
**Ziel:** Alle Events müssen gegen ihr definiertes JSON Schema validieren

**Testschritte:**
1. Lade Event-Payload aus Telemetrie-System
2. Lade zugehöriges JSON Schema aus `schemas/<event_name>.json`
3. Validiere Payload gegen Schema mit JSON Schema Validator (Draft 7)
4. Prüfe Fehlerdetails bei Validation Failures

**Erfolgskriterien:**
- ✅ Alle required fields sind vorhanden
- ✅ Alle Feldtypen entsprechen Schema (string, number, boolean, object, array)
- ✅ Nullable fields sind korrekt behandelt (null erlaubt wo definiert)
- ✅ Format constraints erfüllt (ISO8601 für timestamps, etc.)

**Priorität:** A (Critical)  
**Automatisierung:** Ja — CI/CD Integration empfohlen

---

### Test 1.2: Required Fields Present
**Ziel:** Alle als `required` markierten Felder müssen in jedem Event vorhanden sein

**Testschritte:**
1. Filtere alle A/B-Priority Events
2. Für jedes Event: extrahiere `required_fields` aus Katalog
3. Sample 100 Events pro Typ aus Production/Staging Logs
4. Verifiziere Anwesenheit aller required fields

**Erfolgskriterien:**
- ✅ 100% der required fields vorhanden in allen Samples
- ✅ Keine undefined/null Werte für non-nullable required fields
- ✅ `sessionId` und `ts` (timestamp) in jedem Event vorhanden

**Priorität:** A (Critical)  
**Sample Size:** Minimum 100 Events pro Typ

---

## 2. Privacy & PII Checks

### Test 2.1: No Clear PII in Public Events
**Ziel:** Events mit `privacy_level = public` dürfen keine PII enthalten

**Testschritte:**
1. Filtere alle Events mit `privacy_level = public`
2. Sample 50 Events pro Typ
3. Regex-Scan auf PII-Patterns:
   - Email-Adressen: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`
   - Telefonnummern: `\+?[0-9]{8,15}`
   - Wallet Private Keys: `0x[a-fA-F0-9]{64}`
   - Namen (schwer automatisiert — manuelle Stichprobe)
4. Prüfe Payload-Keys: `email`, `phone`, `privateKey`, `password` sollten nicht existieren

**Erfolgskriterien:**
- ✅ Keine Email-Adressen in Public Events
- ✅ Keine Telefonnummern in Public Events
- ✅ Keine Keys mit Namen `email`, `phone`, `password`, `privateKey`, `creditCard`
- ✅ User IDs sind anonymisiert/pseudonymisiert (UUID-Format bevorzugt)

**Priorität:** A (Critical — DSGVO/Privacy Compliance)

---

### Test 2.2: PII Events — Hash or Encrypt
**Ziel:** Events mit `privacy_level = pii` oder `sensitive` müssen sensible Felder hashen/verschlüsseln

**Testschritte:**
1. Filtere Events mit `privacy_level IN (pii, sensitive)`
2. Identifiziere sensible Felder (z.B. `userId`, `email`, `walletAddress`)
3. Sample 20 Events pro Typ
4. Verifiziere Hashing/Pseudonymization:
   - UserIDs: sollten UUID oder gehashte Werte sein (nicht `user_123` oder `john.doe`)
   - Wallet Addresses: nur wenn explizit zugelassen (pseudonymous acceptable)

**Erfolgskriterien:**
- ✅ Keine Klartext-Emails in PII Events
- ✅ User-IDs sind pseudonymisiert
- ✅ Alle PII-Felder sind mit Dokumentation versehen (Spalte `notes` im Katalog)

**Priorität:** A (Critical)

---

## 3. Payload Size & Performance

### Test 3.1: Payload Size < 64KB
**Ziel:** Events dürfen nicht zu groß sein (Netzwerk-Performance, Storage)

**Testschritte:**
1. Sample 100 Events pro Event-Typ (priorisiere A/B Events)
2. Serialisiere Payload zu JSON
3. Messe Byte-Size (UTF-8)
4. Berechne P95 und Max

**Erfolgskriterien:**
- ✅ P95 < 4KB (empfohlen)
- ✅ Max < 64KB (hard limit)
- ✅ Events über 16KB werden geloggt und reviewed

**Priorität:** B (Performance)  
**Action bei Failure:** Payload reduzieren — Felder kürzen, optional fields entfernen, Base64 vermeiden

---

### Test 3.2: String Field Length Limits
**Ziel:** Freiform-String-Felder sollten Längenlimits haben

**Testschritte:**
1. Identifiziere alle string-Type Felder in Schemas
2. Sample 50 Events mit string fields
3. Messe String-Längen für Felder wie `notes`, `text`, `message`

**Erfolgskriterien:**
- ✅ `notes` / `text` fields < 1024 Zeichen (empfohlen < 512)
- ✅ `symbol` / `id` fields < 64 Zeichen
- ✅ Error messages < 2048 Zeichen

**Priorität:** C (Optimization)

---

## 4. Timestamp & Data Integrity

### Test 4.1: Timestamp Within Plausible Range
**Ziel:** Timestamps sollen realistisch sein (Server-Zeit ± 5 Minuten)

**Testschritte:**
1. Sample 100 Events pro Typ
2. Parse `ts` field als ISO8601
3. Vergleiche mit Server-Empfangszeit (`ingestion_time`)
4. Berechne Delta: `|ts - ingestion_time|`

**Erfolgskriterien:**
- ✅ P95 Delta < 5 Minuten (Client-Server Skew acceptable)
- ✅ Max Delta < 1 Stunde (außer Offline-Sync mit Flag)
- ✅ Keine Future-Timestamps (> Server-Zeit + 1 Minute)

**Priorität:** B (Data Quality)  
**Hinweis:** Offline-Events sollten `offline: true` flag haben

---

### Test 4.2: SessionID Consistency
**Ziel:** SessionIDs sollten während einer Session konstant bleiben

**Testschritte:**
1. Tracke alle Events für eine User-Session (z.B. 1 Stunde)
2. Extrahiere `sessionId` aus allen Events
3. Prüfe auf Wechsel (sollte nur bei `session.start` / `session.end` wechseln)

**Erfolgskriterien:**
- ✅ SessionID bleibt konstant zwischen `session.start` und `session.end`
- ✅ Neue SessionID wird nur bei explizitem `session.start` generiert
- ✅ SessionID Format: UUID v4 oder ähnlich stabil

**Priorität:** B (Data Quality)

---

## 5. Event Ordering & Deduplication

### Test 5.1: Duplicate Event Detection
**Ziel:** Idempotente Events sollten nicht doppelt verarbeitet werden

**Testschritte:**
1. Identifiziere Events mit Idempotency-Keys (z.B. `snapId`, `batchId`, `userId+symbol`)
2. Sample 200 Events pro Typ
3. Gruppiere nach Idempotency-Key
4. Prüfe auf Duplikate innerhalb von 10 Sekunden

**Erfolgskriterien:**
- ✅ Keine Duplikate für Events mit explizitem Idempotency-Key
- ✅ Duplikate werden server-side erkannt und dedupliziert
- ✅ `watchlist_add` mit gleichem `userId+symbol` wird nicht mehrfach gespeichert

**Priorität:** B (Data Integrity)

---

### Test 5.2: Event Sequence Logic
**Ziel:** Bestimmte Event-Sequenzen sollten logisch sein

**Testschritte:**
1. Tracke Event-Sequenz für eine Session
2. Prüfe logische Abläufe:
   - `session.start` → andere Events → `session.end`
   - `replay_session_load` → `replay_play_toggle` (play darf nur nach load)
   - `order_place_preview` → `order_place_sim` (preview vor placement)

**Erfolgskriterien:**
- ✅ `session.start` ist immer das erste Event einer Session
- ✅ `session.end` ist immer das letzte Event
- ✅ Replay-Play Events folgen immer auf Load-Event

**Priorität:** C (Nice-to-have)

---

## 6. Sampling & Rate Limits

### Test 6.1: Sampling Rates Applied
**Ziel:** Events mit `sampling != none` sollten korrekt gesampelt werden

**Testschritte:**
1. Identifiziere Events mit Sampling (z.B. `chart_crosshair_move` = 0.1–1%)
2. Erwarte 10,000 Events theoretisch → zähle tatsächliche Events
3. Berechne Sampling Rate: `actual / expected`

**Erfolgskriterien:**
- ✅ `chart_crosshair_move`: Sampling < 5% (heavy_sample)
- ✅ `replay_seek`: Sampling ~1% (sampled 1%)
- ✅ `watchlist_row_select`: Sampling ~10% (light)

**Priorität:** B (Cost Optimization)

---

### Test 6.2: Rate Limiting (Client-Side)
**Ziel:** High-frequency Events sollen client-side gebuffert/throttled werden

**Testschritte:**
1. Trigger High-Frequency Event (z.B. `chart_crosshair_move`)
2. Messe Events/Second vom Client gesendet
3. Prüfe Batching/Throttling

**Erfolgskriterien:**
- ✅ Crosshair-Move Events < 1/sec (gebuffert und aggregiert)
- ✅ Keine Burst-Spikes > 100 Events/sec pro Client
- ✅ Batching verwendet (mehrere Events in einer HTTP Request)

**Priorität:** B (Performance & Cost)

---

## 7. End-to-End Validation

### Test 7.1: Sample Payload Passes Schema
**Ziel:** Die in `example_payload` hinterlegten Samples sind schema-valide

**Testschritte:**
1. Für alle A/B Events: lade `example_payload` aus Katalog
2. Lade zugehöriges JSON Schema
3. Validiere example gegen schema

**Erfolgskriterien:**
- ✅ 100% der example_payloads validieren erfolgreich
- ✅ Keine Schema-Fehler

**Priorität:** A (Baseline)  
**Automatisierung:** Ja — Pre-Commit Hook

---

### Test 7.2: Live Event Smoke Test
**Ziel:** Mindestens 1 Event pro Typ wird in Staging erfolgreich gesendet

**Testschritte:**
1. Für alle A-Priority Events: Trigger Event in Staging-Environment
2. Warte auf Telemetrie-Ingestion (max 30 sec)
3. Query Backend: Event vorhanden?
4. Validiere Payload gegen Schema

**Erfolgskriterien:**
- ✅ Alle A-Events feuern in Staging
- ✅ Backend empfängt Event
- ✅ Schema-Validation erfolgreich

**Priorität:** A (Pre-Release Gate)

---

## 8. Owner & Alerting

### Test 8.1: Alert on Schema Violations
**Ziel:** Schema-Violations lösen Alerts aus

**Testschritte:**
1. Sende absichtlich invalides Event (fehlendes required field)
2. Prüfe Monitoring/Alerting (z.B. Sentry, Datadog)
3. Verifiziere Alert-Empfang

**Erfolgskriterien:**
- ✅ Alert wird innerhalb 5 Minuten ausgelöst
- ✅ Alert enthält Event-Name, Schema-Fehler, Payload-Sample
- ✅ Owner-Team wird benachrichtigt (siehe Spalte `owner` im Katalog)

**Priorität:** B (Operational)

---

## 9. Documentation & Catalog Sync

### Test 9.1: Catalog vs. Code Sync
**Ziel:** Event-Katalog ist synchron mit Code

**Testschritte:**
1. Parse Code-Base nach Event-Aufrufen (z.B. `logEvent('event_name')`)
2. Vergleiche mit Event-Namen im Katalog
3. Identifiziere Diskrepanzen

**Erfolgskriterien:**
- ✅ Alle Code-Events existieren im Katalog
- ✅ Alle Katalog-Events mit `exists=yes` sind im Code findbar
- ✅ Keine veralteten/deprecated Events im Code

**Priorität:** B (Maintenance)  
**Frequenz:** Monatlich oder bei jedem Release

---

## 10. Summary & Action Items

### Checkliste für Pre-Release

- [ ] **Test 1.1** — Schema Validation (A)
- [ ] **Test 1.2** — Required Fields (A)
- [ ] **Test 2.1** — No PII in Public Events (A)
- [ ] **Test 2.2** — PII Hashing (A)
- [ ] **Test 3.1** — Payload Size < 64KB (B)
- [ ] **Test 4.1** — Timestamp Plausibility (B)
- [ ] **Test 7.1** — Sample Payloads Valid (A)
- [ ] **Test 7.2** — Live Smoke Test (A)

### Automation Targets

1. **CI/CD Integration:** Tests 1.1, 1.2, 7.1 → automatisiert in GitHub Actions / GitLab CI
2. **Monitoring Alerts:** Test 8.1 → Sentry/Datadog Integration
3. **Scheduled Jobs:** Test 9.1 (Catalog Sync) → wöchentlich

### Verantwortlichkeiten

| Test-Bereich | Verantwortlicher Owner | SLA |
|--------------|------------------------|-----|
| Schema Validation | Engineering | Pre-Release |
| Privacy/PII Checks | Data Protection Officer | Quarterly |
| Performance Tests | DevOps | Monthly |
| Live Smoke Tests | QA Team | Pre-Release |
| Catalog Sync | Product/Analytics | Monthly |

---

**Ende der Checkliste**  
**Nächste Review:** 2025-12-09 (Monatlich)
