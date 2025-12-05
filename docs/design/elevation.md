# 📐 Elevation & Depth

Verschiedene Schatten-Ebenen für visuelle Hierarchie und räumliche Tiefe.

---

## Elevation-Klassen

### Niedrige Elevation (subtil)
```tsx
<div className="elevation-low p-4 rounded-xl">
  Subtle shadow
</div>
```

### Mittlere Elevation
```tsx
<div className="elevation-medium p-4 rounded-xl">
  Medium shadow
</div>
```

### Hohe Elevation
```tsx
<div className="elevation-high p-4 rounded-xl">
  Strong shadow
</div>
```

### Floating Elevation (schwebt über der Seite)
```tsx
<div className="elevation-float p-4 rounded-xl">
  Floating element
</div>
```

---

## Verwendungsempfehlungen

### Visuelle Hierarchie
- **elevation-low**: Standard-Elemente wie Cards, Listen-Items
- **elevation-medium**: Erhöhte Elemente wie Dropdowns, Popovers
- **elevation-high**: Wichtige Elemente wie Modals, Notifications
- **elevation-float**: Floating Action Buttons, Tooltips

### Beispiel: Card-Hierarchie
```tsx
{/* Basis-Card */}
<div className="elevation-low p-4 rounded-xl bg-surface">
  Standard Card
</div>

{/* Hervorgehobene Card */}
<div className="elevation-medium p-4 rounded-xl bg-surface">
  Featured Card
</div>

{/* Modal */}
<div className="elevation-float p-6 rounded-2xl bg-surface">
  Modal Content
</div>
```

---

## Best Practices

- **Konsistenz**: Verwende Elevation konsistent für ähnliche Elemente
- **Sparsam**: Zu viele erhöhte Elemente reduzieren die Wirkung
- **Kontext**: Höhere Elevation = höhere Priorität in der UI-Hierarchie
- **Dark Mode**: Schatten sind in Dark Mode subtiler - nutze zusätzliche Borders bei Bedarf

---

**[← Zurück zur Übersicht](./overview.md)**
