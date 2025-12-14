## Journal Feature Inventory

**Repo:** Sparkfined_PWA
**Scope:** Journal nach Swap (Journal v2 ist `/journal`, v1 ersetzt)
**Stand:** 2025-01-06

### Ziel

* **A)** Alle aktuell enthaltenen Journal-Funktionen (UI + Flows) erfassen
* **B)** Alle entfernten/fehlenden Funktionen (aus v1 oder im Repo vorhanden, aber nicht mehr erreichbar) erfassen
* **C)** Daraus eine priorisierte “Journal Finalization Plan”-Checkliste ableiten

---

## A) Aktuell enthaltene Funktionen (Journal = `/journal`)

> Liste nur Dinge, die tatsächlich funktionieren/erreichbar sind.

| Feature | Beschreibung | Route / Entry Point | Datei/Komponente(n) | Status (OK/Partial/Bug) | Notizen |
| --- | --- | --- | --- | --- | --- |
| Entry Input (Emotions/Context) | Form erfasst Emotion, Intensitäten (3 Slider), Markt-Kontext, Reasoning/Expectation/Self-Reflection; lokal timestamped submit | `/journal` | `JournalPage`, `JournalInputForm` | OK | Dexie-Persistenz via `useJournalV2`; Submit löst Pipeline lokal aus. |
| Journal Pipeline Result | Zeigt Archetype, Score, Trend-Badge, Metriken und Insight-Liste nach Submit | `/journal` | `JournalPage`, `JournalResultView` | OK | Nur letzte Berechnung sichtbar; keine Detailnavigation. |
| Recent History | Listet gespeicherte Einträge (ID/Version, Timestamp, Score) unter Result-Card | `/journal` | `JournalPage` | OK | Nur read-only Vorschau; kein Selektor/Detail/Filter. |
| Error/Loading States | Fehlerbanner bei Lade-/Submit-Fehlern, Skeletons bei History-Ladephase | `/journal` | `JournalPage` | Partial | Fehlertext generisch; keine Retry-Controls. |

> Ergänze Zeilen für alles, was du in der UI siehst (z. B. Mood/Score, Link to Analysis, etc.)

---

## B) Entfernt / fehlt / nicht mehr erreichbar (ehemals v1 oder alte Pfade)

> Dinge, die früher vorhanden waren oder noch im Code existieren, aber aktuell nicht mehr im UI erreichbar sind.

| Feature | Früher vorhanden wo? (Route/Screen) | Noch Code vorhanden? (Ja/Nein/Unklar) | Datei/Komponente(n) (falls vorhanden) | Grund (Removed/Deprecated/Bug/Unknown) | Ersatz/Plan |
| --- | --- | --- | --- | --- | --- |
| Zwei-Panel Workspace (Liste + Detail) | Alt: `/journal` mit Split-Layout | Ja | `JournalLayout`, `JournalList`, `JournalDetailPanel` | Removed (UI swap auf v2) | Neuaufsetzen der List/Detail-UX auf `/journal` oder neuer Tab. |
| Entry Detail Edit/Delete | Detailpanel erlaubte Notes-Edit & Delete inkl. Optimistic Update | Ja | `JournalDetailPanel` | Removed (nicht mehr eingebunden) | Neu anbinden an Dexie v2 Schema + Routing. |
| Quick Create Dialog | Modal "New journal entry" aus Header-CTA | Ja | `JournalNewEntryDialog`, `JournalHeaderActions` | Removed | V2 benötigt eigenes Quick-Add (inline oder modal). |
| AI Insights / Social Snapshot | Generiert Muster & Social Stats aus letzten Entries | Ja | `JournalInsightsPanel`, `JournalInsightCard`, `JournalSocialPreview` | Deprecated/Unknown (UI nicht gemountet) | Re-evaluieren unter v2-Datenmodell. |
| URL-gebundene Auswahl (`?entry=`) | Liste setzte Query-Param für aktiven Eintrag | Ja | `JournalList` (SearchParams), alte JournalPage (nicht mehr vorhanden) | Removed | Entscheidung: neuen Router-Param für Detailansicht einführen? |

**Hinweise / Quellen**

* Alte Journal-Entry-Points gefunden:
  * `/journal/v2` → Redirect auf `/journal` (Route in `RoutesRoot.tsx`).
  * `/journal-v2` → Redirect auf `/journal` (Legacy V2 Route in `RoutesRoot.tsx`).
* Verwaiste Komponenten (nicht importiert): `JournalLayout`, `JournalList`, `JournalDetailPanel`, `JournalNewEntryDialog`, `JournalInsightsPanel` (alle unter `src/components/journal/`).

---

## C) Gaps → Priorisiertes Backlog (P0/P1/P2)

> Jede Zeile ist ein konkreter “Implementierungsauftrag”. Keine vagen Punkte.

| Priority | Gap / Aufgabe | Warum (User Value) | Betroffene Files | Abhängigkeiten | Aufwand (S/M/L) | Akzeptanzkriterien |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | Read/Detail + Notes-Edit & Delete auf v2-Einträgen | Nutzer brauchen Korrekturen/Löschungen + Kontextlesen, derzeit nur Scores sichtbar | `JournalPage` (+ neue Detail-Komponente), `useJournalV2`, `journal-v2/db` | Dexie v2 Schema | M | Detailansicht lesbar, Notes persistieren, Delete entfernt Eintrag & History-Item. |
| P0 | Query-Param Navigation (`?entry=`) & History-Selection | Direktverlinkung/Back-Nav fehlt | `JournalPage`, Router | Dexie v2 | M | Klick auf History selektiert Eintrag, URL aktualisiert, Reload behält Auswahl. |
| P1 | Quick Add Flow (Dialog/Inline) | Schnelle Erfassung ohne volles Formular | Neues Modal/Inline-Card, `useJournalV2` | Dexie v2 | M | CTA sichtbar, Validierung, persistiert in v2 und zeigt im History-Bereich. |
| P1 | AI Insights auf v2-Daten | Mustererkennung/Sharing aus v1 verloren | `JournalInsightsPanel` (Port), `journal-v2` Mapping | AI Service, Dexie v2 | L | Insights generierbar aus letzten N Einträgen, Cache funktioniert. |
| P2 | Filter/Search/Tags | Navigation großer Listen | Neue Filter-Komponenten | Dexie v2, evtl. Tag-Schema | M | Filter/Search funktionieren clientseitig; leere Zustände klar. |

---

## D) Journal Finalization Plan (Module = 1 Commit pro Modul)

> Reihenfolge: erst Stabilität (CRUD), dann UX, dann Extras.

### Modul 1 — Core CRUD Stabilisierung

* [ ] Create Entry zuverlässig
* [ ] Read/List stabil (Empty states, loading)
* [ ] Update/Edit stabil
* [ ] Archive/Delete (wenn vorgesehen)
* [ ] Tests: minimal smoke test für CRUD (wenn Testinfra vorhanden)

**Commit:** `journal: stabilize core CRUD`

### Modul 2 — Tags / Filter / Search

* [ ] Tags hinzufügen/entfernen
* [ ] Filter nach Tags/Datum/Status
* [ ] Search (client-side ok, wenn keine API)
* [ ] Akzeptanz: große Liste bedienbar, keine UI-Lags

**Commit:** `journal: add tags filter search`

### Modul 3 — Templates (optional)

* [ ] Template UI + Apply
* [ ] Persistenz (falls vorgesehen)

**Commit:** `journal: add templates`

### Modul 4 — Attachments / Links (optional)

* [ ] Attach link/file metadata (falls unterstützt)
* [ ] Render attachments section

**Commit:** `journal: add attachments`

### Modul 5 — Polish & A11y

* [ ] Keyboard navigation
* [ ] Focus states, aria labels
* [ ] Empty state copy

**Commit:** `journal: polish and accessibility`

---

## E) Routing-Check (Nach Journal-Swap)

* `/journal` → ✅ Primary Journal (v2)
* `/journal/v2` → ✅ Redirect → `/journal`
* `/journal-v2` → ✅ Redirect → `/journal`
* Alte v1 Route (falls existierte): none mehr aktiv – nur Redirects.

---

## F) Offene Fragen / Unknowns

> Dinge, die Codex nicht sicher feststellen konnte, klar markieren.

* [ ] Wie soll v1-Datenmigration (`migrateJournalV1ToV2`) ausgelöst werden? Aktuell nur manueller Helper.
* [ ] Gibt es geplante Tag-/Template-Schemas für v2? (keine im Code gefunden).

---

### Codex-Ausfüllregeln

* Nicht raten. Wenn unklar: **Unknown** + Fundstelle (File/Route) notieren.
* Nur Features als “OK”, wenn sie tatsächlich erreichbar und nutzbar sind.
* Bei “Partial/Bug” kurz beschreiben, wie es kaputt ist (1–2 Sätze).

---
