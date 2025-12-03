# CI/CD Dokumentation

Diese Dokumentation enthält alle Informationen über Continuous Integration, Bundle-Optimierung und Build-Prozesse.

## 📋 Inhaltsverzeichnis

### Bundle-Optimierung
- [Bundle Inventur (Nov 2025)](./bundle-inventory-2025-11.md) - Systematische Bestandsaufnahme aller App-Bundles
- [Bundle-Optimization Plan](./BUNDLE-OPTIMIZATION-PLAN.md) - Strategie zur Bundle-Größen-Reduzierung
- [Bundle-Optimization Result](./BUNDLE-OPTIMIZATION-RESULT.md) - Ergebnisse der Bundle-Optimierung
- [Bundle Size Final Summary](./BUNDLE-SIZE-FINAL-SUMMARY.md) - Finale Zusammenfassung der Bundle-Optimierung

### CI-Hardening
- [Hardening Summary](./hardening-summary.md) - Vollständige CI-Hardening & Bundle-Optimierung Dokumentation

## 🎯 Übersicht

### Bundle-Größen (Aktuell)
```
✓ Total: 703KB / 800KB (88%)
✓ All bundles within size limits
✓ All CI checks passing
```

### Optimierungen
- Vendor Chunk Splitting
- Lazy Loading für alle Routen
- PWA Precache: 58 Einträge (3,44 MB total inkl. Assets)
- Manuelle Chunk-Regeln für große Dependencies

## 📚 Weitere Ressourcen

- [Setup & Build Documentation](../setup/build-and-deploy.md)
- [CI Workflows](../../.github/workflows/)
- [Bundle Size Check Script](../../scripts/check-bundle-size.mjs)

---

**Zuletzt aktualisiert:** 2025-12-02
