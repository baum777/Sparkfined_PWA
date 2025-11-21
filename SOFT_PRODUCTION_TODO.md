# Soft Production Launch - Todo Liste

**Ziel:** Tool-Fokus und Lauffähigkeit für Soft Launch  
**Scope:** Ohne Token-Lock und NFT-Integration (kommen nach Soft Launch)  
**Priorität:** Stabilität, Core-Features, User-Experience

---

## 🔴 Kritische Blocker (müssen vor Launch behoben sein)

### TypeScript Strict Mode aktivieren

Der Build läuft aktuell mit deaktivierten Null-Checks, was zu Runtime-Crashes führen kann.

**Aufgaben:**
- `strictNullChecks: false` aus `tsconfig.build.json` entfernen
- Alle 22 TypeScript-Fehler durchgehen und beheben
- Häufigste Probleme: Fehlende Null-Checks, optionale Props ohne Default-Werte
- Build lokal testen mit `pnpm build`
- Sicherstellen dass keine neuen Laufzeit-Fehler entstehen

**Validierung:**
- `pnpm typecheck` läuft ohne Fehler durch
- `pnpm build` kompiliert erfolgreich
- Manual Testing: Board, Analyze, Chart, Journal durchklicken

---

### E2E-Tests in CI-Pipeline integrieren

Playwright-Tests laufen nur lokal, nicht in Vercel-Deployment.

**Aufgaben:**
- `pnpm test:e2e` zum Vercel Build-Command hinzufügen
- Playwright-Browser-Dependencies für Vercel konfigurieren
- Alternativ: GitHub Actions Workflow für E2E erstellen (vor Vercel-Deploy)
- Smoke-Tests für kritische Flows: Board-Load, Chart-Render, Journal-Save

**Validierung:**
- CI schlägt fehl bei breaking Changes
- Alle 15+ E2E-Specs laufen grün durch
- Build-Logs zeigen Playwright-Output

---

### Runtime Environment Validator

App startet auch ohne API-Keys und zeigt kryptische Fehler.

**Aufgaben:**
- Env-Validator in `src/main.tsx` einbauen (vor React-Render)
- Prüfen: `MORALIS_API_KEY`, `DEXPAPRIKA_BASE`, `DATA_PROXY_SECRET`
- Bei fehlenden Keys: `MissingConfigBanner` mit klarer Anleitung zeigen
- Banner soll Links zu Environment-Setup-Docs enthalten
- Developer-Mode: Banner nur in Production zeigen, nicht in Dev-Modus

**Validierung:**
- Build ohne `.env.local` zeigt verständliche Fehler-UI
- Banner verschwindet nach Key-Konfiguration + Reload
- Entwickler können weiterhin mit `DEV_USE_MOCKS=true` arbeiten

---

## 🟠 Wichtige Fixes (sollten vor Launch behoben sein)

### Access Gating deaktivieren für Soft Launch

Token-Lock und NFT-Check sollen erst nach Soft Launch aktiv werden.

**Aufgaben:**
- Access-Provider in `src/store/AccessProvider.tsx` auf Mock-Modus schalten
- Alle Route-Guards in `src/routes/RoutesRoot.tsx` temporär entfernen
- Access-Page zeigt "Coming Soon" Banner statt Wallet-Connect
- Environment-Variable einführen: `VITE_ENABLE_ACCESS_GATING=false` (Default)
- Dokumentation: Anleitung wie Access-Gating später aktiviert wird

**Validierung:**
- App ist ohne Wallet-Verbindung nutzbar
- Alle Features sind zugänglich (Board, Chart, Journal, Analyze)
- Access-Page zeigt klare Information über zukünftiges Feature

---

### Fehler-Monitoring aufsetzen

Crashes werden aktuell nicht erfasst.

**Aufgaben:**
- Sentry-Account anlegen (kostenloser Tier ausreichend)
- Sentry SDK in `src/main.tsx` integrieren
- Error-Boundary in `src/components/ErrorBoundary.tsx` mit Sentry verknüpfen
- Environment-Variable: `VITE_SENTRY_DSN` (nur in Production setzen)
- Alert-Threshold konfigurieren: Error-Rate >0.1% löst Benachrichtigung aus

**Validierung:**
- Test-Error triggern und in Sentry-Dashboard sehen
- Source-Maps werden korrekt hochgeladen
- Error-Rate-Grafik ist sichtbar

---

### Performance-Monitoring einbauen

LCP, FID und CLS werden nicht gemessen.

**Aufgaben:**
- Web Vitals Library hinzufügen: `npm install web-vitals`
- In `src/main.tsx` Metriken sammeln via `getCLS`, `getFID`, `getLCP`
- Metriken an `/api/telemetry` senden (Opt-In via Settings)
- Lighthouse CI in GitHub Actions einrichten
- Performance-Budget definieren: LCP <2s, FID <100ms, CLS <0.1

**Validierung:**
- Lighthouse-Report in CI-Logs sichtbar
- Web Vitals werden im Telemetry-Endpoint empfangen
- Build schlägt fehl bei Budget-Überschreitung

---

### API-Provider-Fallback testen

Multi-Provider-Logik muss unter Last getestet werden.

**Aufgaben:**
- Fallback-Chain dokumentieren: DexPaprika → Moralis → Dexscreener → Cache
- Timeout-Werte konfigurieren: 5s für primär, 10s für sekundär
- Retry-Logik einbauen: 3 Versuche mit Exponential-Backoff
- Error-States in UI zeigen: "Provider XY offline, nutze Fallback"
- Mock-Modus für Testing: `DEV_FORCE_FALLBACK=true`

**Validierung:**
- DexPaprika-Request manuell blocken → App nutzt Moralis
- Moralis auch blockieren → App nutzt Cache + zeigt Warning
- Keine White-Screens bei Provider-Ausfällen

---

## 🟡 Nice-to-Have (können nach Launch behoben werden)

### Bundle Size überwachen

Aktuelle Größe ist OK, aber es gibt keine Limits.

**Aufgaben:**
- Bundle-Size-CI-Check mit `scripts/check-bundle-size.mjs` erweitern
- Limits setzen: Main Bundle <500 KB, Total <3 MB
- Bundle-Analyzer-Report in CI-Artifacts speichern
- Alert bei >10% Größen-Anstieg

**Validierung:**
- CI zeigt Bundle-Size in Logs
- Build schlägt fehl bei Limit-Überschreitung

---

### Console.log-Statements aufräumen

104 console.log() Statements in Production-Code.

**Aufgaben:**
- Logger-Wrapper erstellen: `src/lib/logger.ts`
- Logger prüft `import.meta.env.DEV` vor Output
- Alle `console.log()` durch `logger.debug()` ersetzen
- Production-Build sollte keine Logs zeigen

**Validierung:**
- DevTools-Console in Production leer
- Logs erscheinen weiterhin in Dev-Mode

---

### iOS PWA-Installation testen

Safari hat spezielle Quirks für PWA-Installation.

**Aufgaben:**
- Testing auf iOS 15, 16, 17 (Safari)
- Install-Prompt prüfen: "Zum Home-Bildschirm"
- Push-Notification-Support prüfen (iOS 16.4+)
- Offline-Mode auf iOS testen
- Manifest-Icons für iOS optimieren

**Validierung:**
- App installiert sich auf allen iOS-Versionen
- Icons erscheinen korrekt auf Home-Screen
- Offline-Page wird bei Netzwerk-Ausfall gezeigt

---

### IndexedDB-Backup-Feature

Datenverlust bei Browser-Reset möglich.

**Aufgaben:**
- Export-Funktion in Settings: Journal, Trades, Signals als JSON
- Import-Funktion mit Merge-Strategie (lokale Daten behalten bei Konflikt)
- Auto-Backup alle 7 Tage (optional, Opt-In)
- Backup in localStorage als compressed JSON

**Validierung:**
- Export erstellt valides JSON
- Import rekonstruiert alle Daten korrekt
- Merge-Konflikte werden sauber aufgelöst

---

## 🔵 Feature-Verbesserungen

### Onboarding-Optimierung

Welcome-Modal und Tour sollten Nutzer besser abholen.

**Aufgaben:**
- Welcome-Modal: Personas klarer beschreiben (Beginner, Intermediate, Advanced)
- Tour: Schritt-Anzahl reduzieren (aktuell 8 Schritte → maximal 5)
- Hint-Banner: Timing verbessern (nicht sofort nach Tour, sondern bei Bedarf)
- Skip-Button für erfahrene Nutzer
- Onboarding-Status speichern: Nutzer sollten Tour nicht mehrfach sehen

**Validierung:**
- Neue Nutzer verstehen App nach Tour
- Retention-Rate >50% nach Tag 1

---

### Chart-Performance optimieren

Canvas-Chart sollte auch auf schwachen Geräten flüssig laufen.

**Aufgaben:**
- Throttling für Mousemove-Events (max 60 FPS)
- Lazy-Rendering: Nur sichtbare Candles zeichnen
- Indicator-Berechnung in Web Worker auslagern
- RequestAnimationFrame statt setInterval für Animationen
- Performance-Profiling mit Chrome DevTools

**Validierung:**
- Chart läuft mit 60 FPS auf Mid-Range-Smartphones
- CPU-Last <20% im Idle-Modus

---

### AI-Kosten-Tracking

Nutzer sollten sehen wie viel AI-Budget sie verbrauchen.

**Aufgaben:**
- Token-Counter im AI-Context einbauen
- Cost-Estimation: Tokens × Provider-Preis
- UI-Element in Settings: "AI-Budget: $2.50 / $10.00 verbraucht"
- Warning bei 80% Budget-Verbrauch
- Opt-Out-Option für kostenpflichtige AI-Features

**Validierung:**
- Settings zeigt korrekten Token-Verbrauch
- Warning erscheint bei Budget-Überschreitung

---

### Journal-Server-Sync verbessern

Offline-Änderungen können zu Konflikten führen.

**Aufgaben:**
- Conflict-Marker in UI zeigen: "Server-Version: ..., Lokale Version: ..."
- Merge-Dialog mit Side-by-Side-Vergleich
- Background-Sync-Queue für pendende Saves
- Retry-Logik mit Exponential-Backoff (3 Versuche)
- Last-Write-Wins als Fallback-Strategie

**Validierung:**
- Offline-Änderungen werden nach Reconnect synchronisiert
- Konflikte werden sauber aufgelöst
- Keine Datenverluste bei gleichzeitigen Edits

---

## 🧪 Testing & QA

### Smoke-Test-Suite ausbauen

Automatisierte Tests für kritische User-Flows.

**Aufgaben:**
- E2E-Test: Board → Analyze → Chart → Journal (Happy Path)
- E2E-Test: AI-Bullets generieren und in Journal einfügen
- E2E-Test: Signal erstellen → Trade Plan → Outcome loggen
- E2E-Test: Offline-Modus → Daten aus Cache laden
- E2E-Test: Push-Notification subscribed → Alert triggert

**Validierung:**
- Alle Tests laufen grün in CI
- Test-Coverage >50% für kritische Flows

---

### Manual Testing Checklist

Manuelle Tests vor Deployment.

**Aufgaben:**
- [ ] Board-Page lädt KPIs ohne Fehler
- [ ] Overview-Tiles zeigen echte Daten (nicht "N/A")
- [ ] Quick Actions navigieren zu korrekten Pages
- [ ] Onboarding-Modal erscheint bei Erstbesuch
- [ ] Chart rendert OHLC-Daten für bekanntes Token
- [ ] Indikatoren (SMA, RSI, Bollinger) werden korrekt angezeigt
- [ ] Replay-Modus läuft ohne Ruckeln
- [ ] Journal-Notiz speichern funktioniert (lokal + server)
- [ ] AI-Bullets generieren liefert 4-7 Stichpunkte
- [ ] Journal-Condense komprimiert lange Notizen
- [ ] Signals-Page zeigt erkannte Patterns
- [ ] Signal-Filter (Pattern, Confidence) funktionieren
- [ ] Settings-Änderungen werden persistiert
- [ ] Theme-Wechsel (falls implementiert) funktioniert
- [ ] PWA-Installation funktioniert (Desktop + Mobile)
- [ ] Offline-Page wird bei Netzwerk-Ausfall gezeigt
- [ ] Service Worker updated sich bei neuer Version
- [ ] Push-Notification-Permission-Request erscheint
- [ ] Alert-Rule erstellen und speichern funktioniert

**Validierung:**
- Alle Checkboxen angehakt vor Deployment

---

## 📦 Deployment-Vorbereitung

### Environment-Variablen in Vercel setzen

Production-Secrets müssen konfiguriert werden.

**Aufgaben:**
- Vercel-Dashboard öffnen: Settings → Environment Variables
- Pflichtfelder setzen:
  - `MORALIS_API_KEY` (hidden secret)
  - `DEXPAPRIKA_BASE` (URL)
  - `DATA_PROXY_SECRET` (random string)
- Optionale Keys:
  - `OPENAI_API_KEY` (für AI-Features)
  - `ANTHROPIC_API_KEY` (als Fallback)
  - `VITE_SENTRY_DSN` (für Error-Tracking)
  - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (für Push-Notifications)
- Alle Secrets als "Hidden" markieren
- Preview + Production Environments separat konfigurieren

**Validierung:**
- Build in Vercel läuft durch ohne Missing-Key-Errors
- `/api/health` Endpoint liefert Status 200

---

### Vercel-Build-Settings optimieren

Build-Performance und Caching verbessern.

**Aufgaben:**
- Build-Command prüfen: `pnpm build` (inkl. TypeScript-Check)
- Output-Directory bestätigen: `dist`
- Node-Version festlegen: `20.10.0` (aus package.json)
- Framework-Preset: `Vite` auswählen
- Install-Command: `pnpm install` (nicht npm)
- Caching aktivieren: `pnpm store` cachen

**Validierung:**
- Build-Zeit <3 Minuten
- Build-Cache wird bei wiederholten Deployments genutzt

---

### Domains & SSL konfigurieren

Production-Domain sollte Custom-Domain sein, nicht `*.vercel.app`.

**Aufgaben:**
- Custom-Domain in Vercel-Dashboard hinzufügen
- DNS-Records bei Domain-Provider setzen (A/CNAME)
- SSL-Zertifikat automatisch via Let's Encrypt
- Redirects einrichten: `www` → non-www (oder umgekehrt)
- `vercel.json` prüfen: Rewrites für SPA-Routing

**Validierung:**
- HTTPS funktioniert ohne Warnings
- Alle Subpaths (`/chart`, `/journal`, etc.) laden korrekt
- Service Worker läuft auf Custom-Domain

---

### Monitoring & Alerts einrichten

Production-Monitoring für Uptime und Errors.

**Aufgaben:**
- Vercel-Monitoring aktivieren (kostenlos in Pro-Tier)
- Uptime-Check für `/api/health` einrichten
- Sentry-Alerts konfigurieren:
  - Error-Rate >0.1% → Email an Team
  - Critical Error (5xx) → Slack-Notification
- Performance-Budgets in Lighthouse CI setzen
- Cron-Jobs prüfen: `/api/cron/cleanup-temp-entries` läuft täglich

**Validierung:**
- Test-Error löst Sentry-Alert aus
- Uptime-Check läuft alle 5 Minuten

---

## 📝 Dokumentation aktualisieren

### README für Soft Launch anpassen

Haupt-README sollte aktuellen Stand reflektieren.

**Aufgaben:**
- Status-Badge hinzufügen: "Beta - Open for Testing"
- Feature-Liste aktualisieren: Access-Gating als "Coming Soon" markieren
- Quick-Start-Anleitung vereinfachen (weniger technische Details)
- Screenshots/GIFs hinzufügen (Board, Chart, Journal)
- Link zu Live-Demo einfügen

**Validierung:**
- README ist verständlich für nicht-technische Nutzer
- Alle Links funktionieren

---

### User-Guide erstellen

Nutzer brauchen Hilfe beim Einstieg.

**Aufgaben:**
- Guide-Datei erstellen: `/docs/USER_GUIDE.md`
- Kapitel:
  - Was ist Sparkfined?
  - Erste Schritte (Onboarding)
  - Board-Page erklärt (KPIs, Feed, Quick Actions)
  - Token analysieren (Analyze-Page)
  - Chart nutzen (Indikatoren, Replay)
  - Journal führen (Notizen, AI-Condense)
  - Signals verstehen (Pattern, Confidence)
  - Einstellungen anpassen
- Screenshots zu jedem Kapitel
- FAQ-Sektion am Ende

**Validierung:**
- Nutzer können Guide ohne Vorkenntnisse folgen

---

### API-Dokumentation für Dritte

Falls später API-Zugriff angeboten wird.

**Aufgaben:**
- OpenAPI-Spec erstellen: `/docs/api/openapi.yaml`
- Endpoints dokumentieren:
  - `/api/data/ohlc` - OHLC-Daten abrufen
  - `/api/journal` - Journal-Notizen CRUD
  - `/api/rules` - Alert-Rules verwalten
  - `/api/ai/assist` - AI-Templates aufrufen
- Authentication beschreiben (aktuell: keine, später: API-Keys)
- Rate-Limits dokumentieren
- Beispiel-Requests mit cURL

**Validierung:**
- Swagger-UI rendert OpenAPI-Spec korrekt

---

## 🚀 Launch-Checkliste

### Pre-Launch (1 Woche vor Go-Live)

- [ ] Alle kritischen Blocker behoben (TypeScript, E2E, Env-Validator)
- [ ] Access-Gating deaktiviert und dokumentiert
- [ ] Fehler-Monitoring läuft (Sentry konfiguriert)
- [ ] Performance-Monitoring aktiv (Web Vitals, Lighthouse CI)
- [ ] API-Fallback-Chain getestet
- [ ] Manual Testing Checklist komplett
- [ ] Environment-Variablen in Vercel gesetzt
- [ ] Build-Settings optimiert
- [ ] Custom-Domain konfiguriert (SSL aktiv)
- [ ] Monitoring & Alerts eingerichtet
- [ ] README und User-Guide aktualisiert
- [ ] Staging-Deployment erfolgreich getestet

### Launch-Day

- [ ] Final Build von `main` Branch deployen
- [ ] Smoke-Tests auf Production-URL durchführen
- [ ] Fehler-Rate in Sentry prüfen (sollte <0.1% sein)
- [ ] Performance-Metriken checken (LCP <2s, FID <100ms)
- [ ] Social-Media-Announcement vorbereiten (siehe `/docs/lore/x-timeline-posts.md`)
- [ ] Community in Discord/Telegram informieren
- [ ] Feedback-Mechanismus aktivieren (Modal in App)

### Post-Launch (erste 48h)

- [ ] Fehler-Rate überwachen (Sentry-Dashboard)
- [ ] User-Feedback sammeln (Discord, Feedback-Modal)
- [ ] Performance-Metriken täglich prüfen
- [ ] API-Provider-Kosten tracken (Moralis, OpenAI)
- [ ] Hot-Fix-Branch bereithalten für Critical-Bugs
- [ ] Daily Standup mit Team: Blocker besprechen

---

## 📊 Success-Metriken für Soft Launch

Nach 2 Wochen sollten folgende Metriken erreicht sein:

**Technical Metrics:**
- Error-Rate <0.1%
- LCP (Largest Contentful Paint) <2s
- FID (First Input Delay) <100ms
- PWA-Install-Rate >50% (Mobile-Nutzer)
- Offline-Funktionalität: 100% der Core-Features nutzbar

**User Metrics:**
- 50+ aktive Nutzer
- D1-Retention >40% (kommen nach 1 Tag zurück)
- D7-Retention >25% (kommen nach 1 Woche zurück)
- Durchschnittliche Session-Dauer >5 Minuten
- 20+ Journal-Einträge erstellt
- 10+ AI-Bullets generiert

**Business Metrics:**
- 0 kritische Bugs
- <1 kritischer Bug pro 100 Nutzer
- Positives Feedback >80%
- API-Kosten <$50/Monat
- Uptime >99.5%

---

## 🎯 Priorisierung

**Diese Woche (vor Soft Launch):**
1. TypeScript Strict Mode aktivieren
2. E2E-Tests in CI integrieren
3. Runtime Environment Validator
4. Access Gating deaktivieren
5. Fehler-Monitoring aufsetzen

**Nächste Woche (Launch-Woche):**
6. Performance-Monitoring einbauen
7. API-Provider-Fallback testen
8. Manual Testing Checklist durchgehen
9. Deployment-Vorbereitung (Vercel-Config)
10. Dokumentation aktualisieren

**Nach Launch (Follow-Up):**
11. Bundle Size überwachen
12. Console.log aufräumen
13. iOS PWA testen
14. IndexedDB-Backup-Feature
15. Weitere Feature-Verbesserungen aus Backlog

---

**Erstellt:** 2025-11-12  
**Ziel-Launch:** Soft Launch ohne Token-Lock/NFT  
**Post-Launch:** Token-Lock und NFT-Integration in Phase R1
