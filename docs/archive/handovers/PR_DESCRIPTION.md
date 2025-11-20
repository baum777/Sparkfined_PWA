## Summary
- Konsolidierte 19 Alt-Dokumente in vier Zielkategorien (process, concepts, guides, setup) mit neuen strukturieren Dateien.
- Ergänzte vollständige PWA-Audit-Artefakte (Inventar, Feature-Katalog, Flows, Offline, Security, Tests, Zukunft) für ~90% Feature-Abdeckung.
- Archivierte Originaldokumente unter `docs/archive/raw/2025-11-12` und dokumentierte Zuordnung in `docs/index.md`.

## Testing
- `pnpm lint`
- `pnpm test`
- `pnpm build`

## Review
- Docs Owner: Review neue Struktur & Inhalte (`docs/process`, `docs/concepts`, `docs/guides`, `docs/setup`).
- Security: Prüfe `docs/pwa-audit/05_security_privacy.md` Empfehlungen.
- Core Dev: Bestätige Feature/Flow-Beschreibungen.
