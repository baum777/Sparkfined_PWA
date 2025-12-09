# Journal V2 Integration — Task Log

## Ziel
Engine, Typen, Dexie-Persistenz und UI der neuen Journal-2.0-Pipeline in die Sparkfined PWA integrieren. Route verfügbar unter `/journal/v2` mit lokalem Speichern und sofortigem Insight-Output.

## Artefakte aus dem ZIP
- engine: `normalization.ts`, `scoring.ts`, `bias.ts`, `archetype.ts`, `insights.ts`, `pipeline.ts`
- types: `input.ts`, `normalized.ts`, `derived.ts`, `archetypes.ts`, `output.ts`
- db: `journal-v2-schema.ts`
- ui: `JournalInputForm.tsx`, `JournalResultView.tsx`
- docs: `migration.md`

## Offene Punkte / TODOs
- [x] Modulstruktur unter `src/features/journal-v2` angelegt
- [x] Hook `useJournalV2` implementiert (Pipeline + Dexie)
- [x] Dexie-Typen verschärft (`raw`/`output` typisiert)
- [x] Page `/journal/v2` registriert und mit Design-System versehen
- [x] Migration vorbereitet (`migrateJournalV1ToV2`)
- [x] Tests für Pipeline/Hook/Page ergänzt
- [x] Doku unter `/docs/journal/journal-v2-migration.md`
- [ ] Optionale Admin-Trigger für Migration (bewusst manuell)
