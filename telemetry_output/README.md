# Event Catalog — Deliverables Package

**Erstellt:** 2025-11-09  
**Version:** 1.0  
**Projekt:** SparkFined Event & Telemetry Catalog

---

## 📦 Inhalt

Dieses Paket enthält die vollständige Anreicherung und Standardisierung des SparkFined Event-Katalogs:

```
telemetry_output/
├── enhanced_Event_Catalog.csv          # Vollständiger angereicherter Katalog (41 Events)
├── schemas/                            # JSON Schema Definitionen (27 Schemas)
│   ├── session.start.json
│   ├── watchlist_add.json
│   ├── error.occurred.json
│   └── ... (24 weitere)
├── reports/                            # Dokumentation & Analysen
│   ├── EVENTS_MAPPING.md              # Mapping-Tabelle: Event Status & Ownership
│   ├── summary_findings.md            # Executive Summary & Gap-Analyse
│   └── telemetry_qa_checklist.md      # QA & Validation Checkliste
└── README.md                           # Diese Datei
```

---

## 🎯 Quick Start

### 1. Katalog prüfen
```bash
# CSV öffnen (Excel, Google Sheets, VSCode mit CSV Extension)
open enhanced_Event_Catalog.csv
```

**Wichtigste Spalten:**
- `event_name`: Normalisierter Event-Name (snake_case, dot-namespace)
- `priority`: A (must-track) / B (should-track) / C (optional)
- `privacy_level`: public / pseudonymous / sensitive / pii
- `exists`: yes (implementiert) / inferred (fehlt, zu implementieren)
- `payload_schema`: JSON Schema als String

---

### 2. JSON Schemas nutzen

**Validierung mit AJV (JavaScript):**
```typescript
import Ajv from 'ajv';
import sessionStartSchema from './schemas/session.start.json';

const ajv = new Ajv();
const validate = ajv.compile(sessionStartSchema);

const event = {
  sessionId: 'sess_123',
  userAgent: 'Mozilla/5.0...',
  viewport: '1920x1080',
  ts: '2025-11-09T20:00:00.000Z'
};

if (validate(event)) {
  console.log('✅ Event valid');
} else {
  console.error('❌ Schema errors:', validate.errors);
}
```

**Python Validierung:**
```python
import json
import jsonschema

with open('schemas/session.start.json') as f:
    schema = json.load(f)

event = {
    "sessionId": "sess_123",
    "userAgent": "Mozilla/5.0...",
    "viewport": "1920x1080",
    "ts": "2025-11-09T20:00:00.000Z"
}

jsonschema.validate(event, schema)  # Raises exception if invalid
```

---

### 3. Reports lesen

**Executive Summary:**
```bash
cat reports/summary_findings.md
```
Enthält:
- 🎯 Top 5 Gaps (fehlende Events)
- 🚀 3 Quick Wins (Low Effort, High Impact)
- 📊 Priorisierte Next Steps (Roadmap)
- ⚠️ Migration Risks

**QA Checklist:**
```bash
cat reports/telemetry_qa_checklist.md
```
Enthält:
- ✅ 10 Testbereiche (Schema Validation, Privacy, Performance, etc.)
- 🔍 Schritt-für-Schritt Test-Anleitungen
- 🎯 Erfolgskriterien & Prioritäten

**Mapping Table:**
```bash
cat reports/EVENTS_MAPPING.md
```
Übersicht aller Events mit Status, Owner, Privacy, Effort.

---

## 📊 Statistiken

| Metrik | Wert |
|--------|------|
| **Gesamt Events** | 41 |
| **Original (CSV)** | 33 |
| **Inferiert/Fehlend** | 8 |
| **Priority A (must-track)** | 15 |
| **Priority B (should-track)** | 12 |
| **Priority C (optional)** | 14 |
| **JSON Schemas (A/B)** | 27 |
| **PII/Sensitive Events** | 22 (~54%) |

---

## 🔥 Top Priorities (Nächste Schritte)

### **Phase 1: Foundation** (Sprint 1–2)
Fokus auf **Priority A Events** die fehlen (`exists = inferred`):

1. ✅ **Session-Tracking** (`session.start`, `session.end`)  
   → Code bereits vorhanden (`useEventLogger`), nur Katalog-Eintrag fehlte (jetzt ✅)

2. 🔴 **Screen-View Tracking** (`screen_view`)  
   → Implementierung: Router-Integration (React Router / TanStack Router)  
   → Effort: Medium | Impact: High

3. 🟡 **Error-Logging** (`error.occurred`)  
   → Teilweise vorhanden (`useEventLogger.logError`)  
   → Standardisieren: Error Boundary + Schema-Validation

4. 🔴 **Wallet-Events** (`wallet.connect`, `wallet.disconnect`)  
   → Code-Hook in `src/lib/data/walletFlow.ts` hinzufügen  
   → Effort: Medium | Impact: High (Web3 App!)

5. 🔴 **User-Signup** (`user.signup`)  
   → Auth-Flow: Event bei erfolgreicher Registrierung  
   → Privacy: `userId` hashen (PII)

**Geschätzter Aufwand:** 2 Sprints (2 Engineers)

---

## 🔐 Privacy & Compliance

### Privacy-Level Distribution
- **44% public** → Keine PII, sicher für Analytics
- **29% pii** → Hashing erforderlich (Server-Side Proxy)
- **24% sensitive** → Retention-Policy: max 30 Tage
- **2% pseudonymous** → Wallet-Adressen (acceptable)

### DSGVO-Compliance Empfehlungen
1. **Server-Side Proxy:** PII-Events über `/api/telemetry` routen, dort hashen
2. **Retention Policy:**
   - `public` Events: 2 Jahre
   - `pii/sensitive` Events: 30 Tage (automatisch löschen)
3. **Opt-Out:** User können Telemetrie deaktivieren (Cookie/LocalStorage Flag)
4. **Nie im Payload:** `email`, `phone`, `password`, `privateKey`, `creditCard`

---

## 📝 Konventionen & Standards

### Event Naming
- **Format:** `domain.object_action` (z.B. `watchlist.symbol_add`)
- **Snake Case:** Nur Kleinbuchstaben + Unterstriche/Punkte
- **Dot-Namespacing:** Erste Komponente = Domain

### JSON Schema
- **Draft Version:** JSON Schema Draft 7
- **Required Fields:** Mindestens `sessionId` + `ts`
- **Timestamps:** ISO8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)

### Trigger Types
- `ui.click` → Button/Link clicks
- `ui.view` → Page/Screen views
- `ui.submit` → Form submissions
- `ui.interaction` → General interactions
- `api.call` → API-triggered events
- `system` → System/Background events
- `error` → Error events

---

## 🧪 Testing & Validation

### Pre-Commit Checks
```bash
# Validiere alle example_payloads gegen Schemas
python validate_catalog.py

# Check für PII in Public Events
grep -E 'email|phone|password' enhanced_Event_Catalog.csv | grep 'public'
```

### Live Smoke Tests (Staging)
Siehe `reports/telemetry_qa_checklist.md` → Test 7.2  
**Ziel:** Mindestens 1 Event pro Priority-A-Typ in Staging feuern

### CI/CD Integration
**Empfohlen:**
- Pre-Commit Hook: Schema-Validation (Test 7.1)
- GitHub Actions: Catalog↔Code Sync Check (Test 9.1)
- Monitoring: Sentry-Alerts bei Schema-Violations (Test 8.1)

---

## 🔄 Catalog Maintenance

### Update-Prozess
1. **Code-Änderung:** Neues Event hinzugefügt
2. **Katalog aktualisieren:** CSV-Zeile hinzufügen
3. **Schema generieren:** JSON Schema erstellen (optional automatisieren)
4. **Validation:** Schema gegen Beispiel-Payload testen
5. **Commit:** Beide Dateien gemeinsam committen

### Sync-Check (monatlich)
```bash
# Extrahiere Events aus Code
rg "logEvent\(['\"]([a-z_\.]+)" src/ -o --no-filename | sort | uniq > code_events.txt

# Extrahiere Events aus Katalog
cut -d';' -f2 enhanced_Event_Catalog.csv | tail -n +2 | sort > catalog_events.txt

# Vergleiche
diff code_events.txt catalog_events.txt
```

---

## 📚 Weiterführende Dokumentation

- **Onboarding:** `/docs/ONBOARDING_QUICK_START.md`
- **API Keys:** `/docs/API_KEYS.md`
- **Environment Variables:** `/docs/ENVIRONMENT_VARIABLES.md`
- **Telemetry Service Code:** `/src/lib/TelemetryService.ts`
- **Event Logger Hook:** `/src/hooks/useEventLogger.ts`

---

## 🆘 Support & Fragen

**Verantwortlichkeiten:**

| Bereich | Owner | Kontakt |
|---------|-------|---------|
| Analytics & Catalog | Product/Analytics | analytics@team |
| Privacy & Compliance | Data Protection Officer | dpo@team |
| Schema Validation | Engineering | eng@team |
| Testing & QA | QA Team | qa@team |

**Offene Fragen** (siehe `reports/summary_findings.md` → Abschnitt 7):
- Analytics Backend (Segment/Amplitude/Custom?)
- PII Hashing (Server-Side Proxy vorhanden?)
- Sampling Config (Client vs. Server?)
- Retention Policy (30 Tage für PII?)

---

## ✅ Checkliste für Go-Live

- [ ] Alle Priority-A Events implementiert (7 fehlen aktuell)
- [ ] JSON Schemas in Code integriert (Validation)
- [ ] Server-Side Telemetry Proxy deployed (`/api/telemetry`)
- [ ] PII Hashing aktiviert (kein Klartext über Netzwerk)
- [ ] Retention Policy konfiguriert (30 Tage PII, 2 Jahre Public)
- [ ] Monitoring & Alerts (Sentry/Datadog Integration)
- [ ] QA Smoke Tests (alle A-Events in Staging getestet)
- [ ] Privacy Policy aktualisiert (DSGVO-Hinweis)

---

**Version:** 1.0  
**Letztes Update:** 2025-11-09  
**Nächster Review:** 2025-12-09 (monatlich)

---

**Generiert mit:** Claude 4.5 (Cursor Agent)  
**Prozess-Skript:** `process_catalog.py` (kann gelöscht werden nach Review)
