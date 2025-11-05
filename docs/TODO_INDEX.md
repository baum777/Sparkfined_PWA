# 📋 TODO Index – Offene Themen nach Kategorien

**Stand:** 2025-11-05 (PHASE 0 Complete)  
**Strategie:** Priorisierung nach Launch-Kritikalität (🔴 Blocker, 🟡 Wichtig, 🟢 Optional)

---

## 🏗️ BUILD (Deployment-Readiness)

| # | Thema | Priorität | Phase | Details |
|---|-------|-----------|-------|---------|
| B-1 | **Tailwind-Config fehlt** | 🔴 Blocker | PHASE 1 | Keine `tailwind.config.ts` + `postcss.config.js` → @apply funktioniert nicht |
| B-2 | **Build-Errors (3x)** | 🔴 Blocker | PHASE 1 | LessonsPage/SignalsPage (icon-Prop), vite.config.ts (visualizer-Cast) |
| B-3 | **TypeScript-Errors (81x)** | 🟡 Wichtig | POST_LAUNCH | API-Layer: `possibly undefined`-Fehler (nicht kritisch für MVP) |
| B-4 | **pnpm Build-Scripts** | 🟢 Optional | POST_LAUNCH | Ignored: esbuild, tesseract.js → `pnpm approve-builds` bei Bedarf |
| B-5 | **Bundle-Size Warning** | 🟢 Optional | PHASE 5 | Limit: 900 KB, aktuell ok → Monitoring via `pnpm analyze` |

**Nächste Schritte:** B-1, B-2 in PHASE 1 fixen → Build grün

---

## 🎨 UI/UX (Design & Accessibility)

| # | Thema | Priorität | Phase | Details |
|---|-------|-----------|-------|---------|
| U-1 | **Tailwind-Utilities testen** | 🔴 Blocker | PHASE 1 | Nach Tailwind-Config: Dev-Build starten, prüfen ob Klassen funktionieren |
| U-2 | **Responsive-Test (xs/sm)** | 🟡 Wichtig | PHASE 4 | Mobile-Layout (360px Breite) für alle Tabs testen |
| U-3 | **Empty/Error-States** | 🟡 Wichtig | PHASE 4 | Jeder Tab: Leere Zustände, Fehlerzustände, Ladezustände |
| U-4 | **Dark-Mode Toggle** | 🟢 Optional | PHASE 5 | Light-Mode hinzufügen (aktuell nur Dark) |
| U-5 | **Animations-Performance** | 🟢 Optional | PHASE 5 | glow-pulse, shimmer → Performance auf Low-End-Devices |
| U-6 | **Chart-A11y** | 🟡 Wichtig | POST_LAUNCH | Canvas-Charts: ARIA-Tables, Keyboard-Nav (siehe CHART_A11Y_GUIDELINES.md) |
| U-7 | **WCAG-Contrast-Check** | 🟡 Wichtig | PHASE 5 | Lighthouse AA-Check (aktuell vermutlich ok, aber verifizieren) |

**Nächste Schritte:** U-1 in PHASE 1, U-2/U-3 in PHASE 4, U-7 in PHASE 5

---

## 🌐 PWA (Progressive Web App)

| # | Thema | Priorität | Phase | Details |
|---|-------|-----------|-------|---------|
| P-1 | **SW-Konflikt prüfen** | 🟡 Wichtig | PHASE 2 | `public/push/sw.js` vs. VitePWA-generierter SW → Welcher ist aktiv? |
| P-2 | **Offline-Fallback testen** | 🔴 Blocker | PHASE 2 | Netzwerk aus → Landing/Shell laden? |
| P-3 | **Installability-Check** | 🔴 Blocker | PHASE 2 | Chrome/Edge: "App installieren"-Prompt erscheint? |
| P-4 | **Manifest-Icons prüfen** | 🟡 Wichtig | PHASE 2 | 192/512 PNGs vorhanden? Maskable-Icons korrekt? |
| P-5 | **Push-Notifications** | 🟢 Optional | PHASE 6 | VAPID-Keys, Subscription-Flow, Test-Push |
| P-6 | **Background-Sync** | 🟢 Optional | POST_LAUNCH | Offline-Queue für API-Actions (siehe ROADMAP) |
| P-7 | **Lighthouse-PWA-Score** | 🔴 Blocker | PHASE 2 | Target: 90+ (aktuell unklar, muss gemessen werden) |

**Nächste Schritte:** P-2, P-3, P-7 in PHASE 2

---

## 📊 DATA (APIs & Integrationen)

| # | Thema | Priorität | Phase | Details |
|---|-------|-----------|-------|---------|
| D-1 | **API-Endpoints dokumentieren** | 🟡 Wichtig | PHASE 6 | Welche Endpoints produktiv? Welche Fallback-Daten? |
| D-2 | **Moralis-API-Key fehlt** | 🔴 Blocker | PHASE 8 | `.env.example` erstellen mit `MORALIS_API_KEY` |
| D-3 | **Dexpaprika-Fallback** | 🟡 Wichtig | PHASE 6 | Fake-Daten für MVP, damit UI demonstrierbar |
| D-4 | **Solana-RPC-Endpoint** | 🟡 Wichtig | PHASE 8 | `VITE_SOLANA_RPC_URL` für Access-Page (OG-System) |
| D-5 | **OpenAI-Key optional** | 🟢 Optional | PHASE 7 | AI-Features mit Feature-Flag degradieren wenn kein Key |
| D-6 | **CORS-Headers prüfen** | 🟡 Wichtig | PHASE 8 | Vercel-Config: External-APIs erlaubt? |
| D-7 | **Rate-Limiting** | 🟢 Optional | POST_LAUNCH | API-Proxies: Rate-Limit-Strategie (siehe AI_AGENTS.md) |
| D-8 | **WebSocket-Data** | 🟢 Optional | POST_LAUNCH | Real-Time-Price-Updates (ROADMAP) |

**Nächste Schritte:** D-2 in PHASE 8, D-3/D-1 in PHASE 6

---

## 🤖 AI (AI-Agenten-Einbindung)

| # | Thema | Priorität | Phase | Details |
|---|-------|-----------|-------|---------|
| A-1 | **AI-Feature-Flags** | 🟡 Wichtig | PHASE 7 | Settings: "AI aktivieren" Toggle, degradiert sauber wenn aus |
| A-2 | **Server-Proxy für Keys** | 🔴 Blocker | PHASE 8 | NIEMALS OpenAI-Key im Client → Edge-Function-Proxy |
| A-3 | **AI-Logging** | 🟢 Optional | PHASE 9 | Telemetry: AI-Requests tracken (Cost-Monitoring) |
| A-4 | **Anthropic-Fallback** | 🟢 Optional | PHASE 7 | OpenAI down → Claude als Fallback? |
| A-5 | **Prompt-Templates** | 🟡 Wichtig | PHASE 7 | src/lib/ai/prompts.ts → Konsistente Prompts |
| A-6 | **Moralis-Cortex** | 🟢 Optional | POST_LAUNCH | AI Sentiment/Risk-Scores (ROADMAP) |

**Nächste Schritte:** A-2 in PHASE 8, A-1/A-5 in PHASE 7

---

## 🔐 CI/CD & SECURITY

| # | Thema | Priorität | Phase | Details |
|---|-------|-----------|-------|---------|
| S-1 | **.env.example fehlt** | 🔴 Blocker | PHASE 8 | Dokumentieren: Alle benötigten Keys + Einfügeorte |
| S-2 | **Secrets in Git-History** | 🔴 Blocker | PHASE 8 | Prüfen: `git log --all` für Hardcoded-Keys |
| S-3 | **Vercel-Envvars** | 🔴 Blocker | PHASE 8 | Vercel-Dashboard: Alle Keys als Environment Variables |
| S-4 | **CORS-Config** | 🟡 Wichtig | PHASE 8 | vercel.json: CORS-Headers für `/api/*` |
| S-5 | **CSP-Headers** | 🟢 Optional | PHASE 8 | Content-Security-Policy für XSS-Schutz |
| S-6 | **Preview-Checkliste** | 🟡 Wichtig | PHASE 10 | CI_CD.md: Review-Prozess für PRs |
| S-7 | **Playwright-Smoke** | 🟢 Optional | PHASE 10 | 1-2 kritische E2E-Flows als CI-Gate |
| S-8 | **Lighthouse-CI** | 🟢 Optional | PHASE 10 | Auto-Lighthouse-Check bei Vercel-Previews |

**Nächste Schritte:** S-1, S-2, S-3 in PHASE 8, S-6 in PHASE 10

---

## 🧪 TEST & QA

| # | Thema | Priorität | Phase | Details |
|---|-------|-----------|-------|---------|
| T-1 | **TypeCheck-Errors (API)** | 🟢 Optional | POST_LAUNCH | 81 Fehler in `api/`, nicht kritisch für MVP |
| T-2 | **Unit-Test-Coverage** | 🟢 Optional | POST_LAUNCH | Target: 65%+, aktuell unklar (README sagt 65%+) |
| T-3 | **E2E-Tests laufen?** | 🟡 Wichtig | PHASE 1 | `pnpm test:e2e` → Prüfen ob Playwright funktioniert |
| T-4 | **A11y-Tests** | 🟡 Wichtig | PHASE 2 | `pnpm test:e2e -- board-a11y` → WCAG-Check |
| T-5 | **Mobile-Tests** | 🟡 Wichtig | PHASE 4 | Playwright: Viewport 360x800 (iPhone SE) |
| T-6 | **Lighthouse-Baseline** | 🔴 Blocker | PHASE 2 | Erste Messung: Performance/PWA/A11y/Best-Practices |

**Nächste Schritte:** T-6 in PHASE 2, T-3/T-4 prüfen in PHASE 1/2

---

## 📂 DOCS & INFRA

| # | Thema | Priorität | Phase | Details |
|---|-------|-----------|-------|---------|
| I-1 | **SCAN.md** | ✅ Done | PHASE 0 | Repo-Struktur dokumentiert |
| I-2 | **TODO_INDEX.md** | ✅ Done | PHASE 0 | Dieses Dokument |
| I-3 | **BUILD_NOTES.md** | 🔴 Blocker | PHASE 1 | Root-Cause + Fix-Summary für Build-Errors |
| I-4 | **PWA_CHECKLIST.md** | 🔴 Blocker | PHASE 2 | Installability, Offline, Lighthouse-PWA |
| I-5 | **TABS_MAP.md** | 🔴 Blocker | PHASE 3 | Alle Tabs: Route, Status, Datenquellen |
| I-6 | **TABS_ORDER.md** | 🔴 Blocker | PHASE 3 | Reihenfolge der Bearbeitung (kritischer Pfad) |
| I-7 | **UI_STANDARDS.md** | 🟡 Wichtig | PHASE 5 | Farben, Typo, Spacing, Komponenten-Contracts |
| I-8 | **DATA_SOURCES.md** | 🟡 Wichtig | PHASE 6 | API-Tabelle (Use-Case, Auth, Limits, Fallback) |
| I-9 | **AI_AGENTS.md** | 🟡 Wichtig | PHASE 7 | Rollen, Input/Output, Logging, Rate-Limits |
| I-10 | **CONFIG.md** | 🔴 Blocker | PHASE 8 | Alle Secrets: Herkunft, Scope, Vercel-Einfügeort |
| I-11 | **TELEMETRY_EVENTS.md** | 🟢 Optional | PHASE 9 | Event-Namen, Payloads, Privacy |
| I-12 | **CI_CD.md** | 🟡 Wichtig | PHASE 10 | Build-Command, Preview-Checkliste, Guardrails |
| I-13 | **RELEASE_PLAN.md** | 🟡 Wichtig | PHASE 11 | R0/R1/R2: Teaser → Public Test → Alpha |
| I-14 | **LAUNCH_CHECKLIST.md** | 🔴 Blocker | PHASE 12 | A11y, Performance, Offline, 404/Empty/Error |
| I-15 | **POST_LAUNCH.md** | 🟡 Wichtig | PHASE 12 | Bekannte Restpunkte nach Launch |

**Nächste Schritte:** I-3 in PHASE 1, I-4 in PHASE 2, I-5/I-6 in PHASE 3

---

## 🎯 Quick-Wins (Low-Hanging Fruit)

Diese Themen können **nebenbei** in frühen Phasen gefixt werden:

1. ✅ **Deprecated-Warnings** (9 Subdeps) → Nicht kritisch, aber aufräumen wenn Zeit
2. ✅ **README-Update** → Branch-Name, Build-Status-Badge
3. ✅ **404-Page** → Aktuell nur `<div>404</div>` → Schönere Error-Page (PHASE 4)
4. ✅ **Favicon-Check** → `/public/favicon.ico` vorhanden? Korrekt verlinkt?
5. ✅ **Console-Logs aufräumen** → `main.tsx` hat Debug-Logs (ok für Dev, aber Prod?)

---

## 📈 Success-Kriterien (Launch-Gate)

**Minimum Viable Product (MVP):**
- ✅ Build grün (TypeScript, Vite)
- ✅ PWA installierbar (Chrome/Edge)
- ✅ Offline-Fallback funktioniert (Landing + Shell)
- ✅ Lighthouse PWA-Score ≥ 90
- ✅ 3 kritische Tabs lauffähig: Board, Analyze, Chart (mit Fake-Data ok)
- ✅ Mobile-optimiert (360px Breite, Touch-Navigation)
- ✅ Secrets nicht im Repo, nur in Vercel
- ✅ Vercel-Deploy ohne Errors

**Nice-to-Have (Alpha):**
- ✅ Alle 11 Tabs funktional
- ✅ Echte API-Daten (Moralis/Dexpaprika)
- ✅ AI-Features aktivierbar
- ✅ Push-Notifications
- ✅ E2E-Tests grün

---

## 🚦 Phase-Gating (Blockierende Dependencies)

**PHASE 1 → PHASE 2:**
- ✅ Build muss grün sein (keine TypeScript-Errors im Frontend)
- ✅ Dev-Server muss starten (`pnpm dev`)
- ✅ Styles sichtbar (Tailwind funktioniert)

**PHASE 2 → PHASE 3:**
- ✅ PWA-Checklist abgehakt (Installability, Offline, Lighthouse)

**PHASE 3 → PHASE 4:**
- ✅ TABS_MAP + TABS_ORDER dokumentiert

**PHASE 11 → PHASE 12:**
- ✅ R0-Teaser deploybar (Feature-Flags gesetzt)

**PHASE 12 → LAUNCH:**
- ✅ LAUNCH_CHECKLIST komplett abgehakt

---

**Dokumentiert von:** Claude 4.5 (Sonnet) Cursor-Agent  
**Update-Frequenz:** Nach jeder Phase (TODOs werden abgehakt/aktualisiert)  
**Nächster Schritt:** `OK PHASE 1` → BUILD_NOTES.md + Tailwind-Setup
