---
title: "Journal System - Loop J1 (Real Status)"
summary: "Aktueller Implementierungsstand des Sparkfined Journals nach Loop J1."
sources:
  - src/pages/JournalPageV2.tsx
  - src/lib/JournalService.ts
  - src/store/eventBus.ts
  - src/types/journal.ts
  - src/types/journalEvents.ts
  - src/lib/journal/journalEventSubscriptions.ts
---

## Scope & Reality Check
- Persistente Dexie-Basis (`JournalService`) mit reichhaltigem `JournalEntry`-Modell aus `src/types/journal.ts`.
- UI-Layer nutzt `JournalPageV2`, `JournalLayout`, `journalStore` für Listen-/Detail-State.
- Loop J1 liefert: saubere URL-Synchronisierung, JournalEvents, Telemetrie-Firehose und aktualisierte Dokumentation.
- Keine Server-API oder Accordion-Editor aus der alten Spezifikation - alles lokal/offline-first.

## Core Journal Entry Shape
- Persistenzobjekt `JournalEntry` (siehe `src/types/journal.ts`) enthält Setup, Emotion, Thesis, Grok-/Chart-Kontexte, Outcome und Lifecycle-Felder (`status`, `markedActiveAt`, `replaySessionId`...).
- UI-Projektion im Zustand (`journalStore`) hält lediglich `entries[]`, `activeId`, Ladeflags. Zusatzfelder (Charts, Replay, Emotionen) werden erst bei Detailanzeige geladen.
- CRUD erfolgt ausschließlich über `JournalService`:
  - `createEntry` generiert UUID + Timestamps und persistiert sofort.
  - `updateEntry`/`updateEntryNotes` patchen Felder und halten `updatedAt` aktuell.
  - `markAsActive` / `closeEntry` kapseln Lifecycle-Übergänge.
  - `deleteEntry` säubert Dexie + EventBus.

## URL Sync Guardrails (JournalPageV2)
- `activeId` ist die Source of Truth. Die URL (`?entry=`) dient nur als Deep-Link / History-Signal.
- Drei Effekte trennen Verantwortlichkeiten:
  1. **Mount-Read** - liest einmalig `searchParams` beim Initial-Render, um eine direkte Deep-Link-Session zu respektieren.
  2. **Fallback** - sobald Einträge vorhanden sind und kein `activeId` gesetzt ist, wird automatisch der erste Eintrag aktiv.
  3. **History Listener** - reagiert auf Änderungen der `searchParams` (Back-/Forward-Button) und setzt `activeId`, falls die ID existiert.
- State -> URL passiert ausschließlich in den Handlern `handleSelectEntry` und `handleCreateEntry`. Kein `setSearchParams` innerhalb der Effekte => keine Loops, Back-Button bleibt funktionsfähig.

## Journal Events (Loop J1)
`src/types/journalEvents.ts` definiert alle Events, die Journal-Lifecycle abbilden:
- `JournalEntryCreated` - nach erfolgreichem Persist der Rohdaten; enthält Snapshot und Quelle (`manual | auto | chart-draft`).
- `JournalEntryUpdated` - nach jedem Update mit Liste der geänderten Felder und vollem Snapshot.
- `JournalEntryDeleted` - minimaler Payload (`entryId`), sobald ein Persist-Delete durch ist.
- `JournalReflexionCompleted` - heuristische Qualitätswertung, wenn Setup, Emotion und Thesis gesetzt sind (Loop J2 ersetzt die Heuristik später durch AI-Analyse).
- `JournalTradeMarkedActive` - zusätzliche Eventspur für Journey/XP, wenn ein Draft in den aktiven Trade-Status übergeht.
- `JournalTradeClosed` - Outcome + Status `closed` verfügbar; Grundlage für KPI-/XP-Berechnungen.

## EventBus & Subscriptions
- `useEventBusStore` hält jetzt `AppEvent = SolanaMemeTrendEvent | JournalEvent`. Trend-Deduplizierung bleibt erhalten, JournalEvents werden unverändert gestacked.
- `initializeEventSubscriptions` (AI-Ingest) ruft zusätzlich `initializeJournalEventSubscriptions`, damit Trend- und Journal-Pipelines parallel laufen.
- Subscriptions nutzen ausschließlich `useEventBusStore.subscribe` - kein globales `window`-Event mehr.

## Telemetry
- `src/lib/journal/journalEventSubscriptions.ts` lauscht auf den neuesten EventBus-Eintrag, filtert auf `domain === 'journal'` und POSTet Fire-and-Forget an `/api/telemetry`.
- Payload enthält versionierte Metadaten (`entryId`, `updatedFields`, Journey-/XP-Felder), aber weiterhin keinen Thesis-Text oder PII.
- Fehler beim POST werden bewusst geschluckt, damit Offline-Mode/Telemetry-Ausfälle den Journal-Flow nicht blockieren.

### Journey & XP Telemetry (Loop J2-B)
- `src/types/telemetry.ts` definiert ein versioniertes Envelope (`schemaVersion: 1`) für Journal-Telemetry inkl. Journey-Feldern (`phase`, `xpTotal`, `streak`, `qualityScore`).
- `mapJournalEventToTelemetryEvent` (`src/lib/journal/journalTelemetry.ts`) verwandelt `JournalEvent` + optionales `journeyMeta` in ein stabiles Telemetry-Event, das von `initializeJournalEventSubscriptions` an `/api/telemetry` gesendet wird (`{ source: "sparkfined", events: [...] }`).
- Journey-Metadaten stammen direkt aus den Event-Payloads (Snapshots oder `journeyMeta`-Beigaben) und bleiben optional, um ältere Konsumenten nicht zu brechen.
- Aggregationen für spätere Dashboards/AI-Features existieren bereits als reine Helfer (`computePhaseDistribution`, `computeAverageQualityScore` in `src/lib/journal/journey-analytics.ts`) und sind per Vitest abgedeckt.

## Ausblick: Loops J2-J4 (Kurz)
- **Loop J2 - Journey/XP:** Bewertet Events (Active/Closed/Reflexion) für Gamification, ersetzt die heuristische `qualityScore`-Funktion.
- **Loop J3 - AI Assist:** Nutzt JournalEvents für Prompting (Reflexion, Pattern Alerts) und cached Antworten pro `entryId`.
- **Loop J4 - Social/Share:** Baut auf Telemetry/Event-Stream auf, um opt-in Publishing/Sharing zu ermöglichen.
- Diese Abschnitte sind bewusst als Ausblick markiert - Implementierung folgt erst nach Abschluss der aktuellen Bundle-/PWA-Aufgaben.
