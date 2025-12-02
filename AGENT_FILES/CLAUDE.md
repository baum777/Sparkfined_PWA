# Claude Agent Regeln für Sparkfined

Diese Datei enthält spezifische Regeln und Richtlinien für Claude AI Agents, die an diesem Projekt arbeiten.

---

## 📝 Dokumentations-Richtlinien

### Regel: Minimale und gezielte Dokumentation

**Dokumente (.md) nur erstellen, wenn:**
- Es für das Verständnis des Systems **wirklich notwendig** ist
- Es langfristige Architektur-Entscheidungen dokumentiert
- Es komplexe Workflows oder Integrations-Patterns erklärt
- Der User explizit darum bittet

**Dokumente NIEMALS erstellen für:**
- Triviale Code-Änderungen
- Standard-Implementierungen
- Temporäre Notizen oder TODOs
- Inkrementelle Updates ohne architektonischen Impact

### Regel: Dokumenten-Speicherort

**ALLE Dokumente MÜSSEN in `/docs` gespeichert werden:**

```
/docs/
  ├── core/           # Kern-Architektur, Design-System, zentrale Konzepte
  ├── active/         # Aktuelle Features und aktive Entwicklung
  ├── archive/        # Abgeschlossene Features, historische Dokumentation
  ├── process/        # Entwicklungsprozesse, Handover-Guides
  └── ...
```

**Root-Verzeichnis muss FREI von .md Dateien bleiben** (außer README.md)

### Regel: Dokumenten-Integration

**Jedes neue Dokument MUSS:**

1. **In die `/docs` Struktur eingeordnet werden:**
   - Bestimme die richtige Kategorie (core/active/archive/process)
   - Platziere es im passenden Unterverzeichnis
   - Verwende sprechende Dateinamen (kebab-case)

2. **In bestehende Index-Dateien eingetragen werden:**
   - Aktualisiere `/docs/index.md` falls vorhanden
   - Ergänze relevante README.md Dateien in Unterverzeichnissen
   - Füge Links in verwandte Dokumente hinzu

3. **Metadaten enthalten:**
   ```markdown
   # Titel
   
   **Status:** Draft | Active | Archived
   **Datum:** YYYY-MM-DD
   **Kategorie:** Architecture | Feature | Process | Guide
   
   ---
   ```

4. **Referenzen pflegen:**
   - Verlinke auf verwandte Dokumente
   - Verweise auf Code-Dateien wenn relevant
   - Halte Links aktuell bei Umstrukturierungen

### Beispiel-Workflow

```bash
# ❌ FALSCH
Write /workspace/MY_FEATURE_NOTES.md

# ✅ RICHTIG
Write /workspace/docs/active/features/my-feature.md
# + Update /workspace/docs/index.md
# + Add link in related docs
```

---

## 🏗️ Code-Änderungs-Richtlinien

### Vor größeren Refactorings:
1. Prüfe ob bestehende Dokumentation vorhanden ist
2. Aktualisiere relevante Dokumente NACH der Änderung
3. Erstelle nur bei signifikanten Architektur-Änderungen neue Docs

### Nach Feature-Implementierung:
1. Dokumentiere nur wenn das Feature komplex oder nicht selbsterklärend ist
2. Bevorzuge Code-Kommentare über separate Dokumentation
3. Nutze JSDoc/TSDoc für API-Dokumentation

---

## 📋 Commit-Richtlinien

### Commit Messages:
- Verwende konventionelle Commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Beschreibe WARUM, nicht nur WAS geändert wurde
- Referenziere relevante Issues oder Dokumente

### Beispiele:
```
✅ feat(analysis): add real-time market structure heuristics

✅ docs: update advanced insight architecture in /docs/core

✅ refactor: remove token gating from all features
   - Cleans up access control logic
   - Updates 14 files, removes 273 lines
   - See /docs/active/features/advanced-insight-backend-wiring.md

❌ update files
❌ changes
❌ wip
```

---

## 🧹 Code-Qualität

### TypeScript:
- Strenge Type-Safety einhalten
- Keine `any` Types ohne explizite Begründung
- Nutze Generics für wiederverwendbare Komponenten

### React:
- Funktionale Komponenten mit Hooks
- Proper cleanup in useEffect
- Memoization nur bei nachgewiesenen Performance-Problemen

### Testing:
- Unit Tests für Business Logic
- Integration Tests für komplexe Flows
- E2E Tests für kritische User Journeys

---

## 🔄 Wartung & Updates

Diese Datei sollte aktualisiert werden wenn:
- Neue Projekt-weite Standards eingeführt werden
- Häufige Fehler-Muster identifiziert werden
- Entwicklungs-Workflows sich ändern

**Letzte Aktualisierung:** 2025-12-02
**Maintainer:** Claude Agent (Background)
