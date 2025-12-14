# 🎨 Sparkfined Design System - Overview

Komplett überarbeitetes Design-System mit Glassmorphism, Microinteractions und modernen Effekten.

---

## 📦 Was ist neu?

### 1. **Glassmorphism-Effekte**
Moderne Frosted-Glass-Effekte mit Backdrop-Blur für elegante, transparente Oberflächen.

### 2. **Modernes Button-System**
Umfangreiche Button-Varianten mit Gradient, Glow und Hover-Animationen.

### 3. **Card-Varianten**
Flexible Card-Komponenten für verschiedene Use-Cases (Standard, Glass, Elevated, Interactive).

### 4. **Microinteractions**
Subtile Hover-Effekte (Lift, Glow, Scale) für bessere User Experience.

### 5. **Responsive Typography**
Fluid Typography mit automatischer Skalierung zwischen Breakpoints und Gradient-Text-Effekten.

### 6. **Utility-Classes**
Border Glows, Background Patterns, Custom Scrollbars und weitere Utility-Klassen.

---

## 📚 Design System Struktur

Das Design System ist in folgende Bereiche unterteilt:

- **[Colors](./colors.md)** - Complete color palette, Tailwind utilities, usage patterns
- **[Glassmorphism](./glassmorphism.md)** - Frosted-Glass-Effekte
- **[Elevation](./elevation.md)** - Schatten-Ebenen für visuelle Hierarchie
- **[Cards](./cards.md)** - Card-System mit Varianten
- **[Buttons](./buttons.md)** - Button-System mit Varianten und States
- **[Microinteractions](./microinteractions.md)** - Hover-Effekte und Animationen
- **[Typography](./typography.md)** - Responsive Typography und Gradient-Text
- **[Effects](./effects.md)** - Border Glows, Background Patterns, Scrollbars
- **[Examples](./examples.md)** - Komplette Komponenten-Beispiele
- **[Integration](./integration.md)** - Tailwind, Design Tokens, Dark Mode, Performance

---

## 🎯 Quick Start

```tsx
// Moderne Dashboard Card
<div className="card-glass hover-lift p-6 rounded-3xl">
  <h3 className="text-fluid-lg font-semibold">Trading Performance</h3>
  <div className="text-gradient-success text-3xl font-bold">+$12,450</div>
  <button className="btn btn-primary">View Details</button>
</div>
```

### 🛠️ Neue Layout-Hülle (sf-shell)

- **Grid-Shell**: `sf-shell` spannt ein 3-spaltiges Grid (Rail → Canvas → Action Panel) mit fixem Topbar über die volle Höhe; die Rail nutzt `clamp()` und das Canvas `minmax(0, 1fr)`, damit Labels nicht das Hauptpaneel überlaufen.
- **Navigation Rail**: `sf-rail` + `sf-rail-item` liefern die kompakten Primärlinks inkl. aktivem State. Labels werden bei langen Texten gekürzt und unter 1280px automatisch in einen Icon-Only-Modus versetzt.
- **Topbar**: `sf-topbar` beherbergt Branding, Such-Shortcut und aktuelle Paar-Info, plus ein neuer Toggle für das rechte Panel (`aria-expanded`, `aria-controls`).
- **Action Panel / Inspector**: `sf-action` ist als Inspector einklappbar (0px-Spalte bei geschlossenem Zustand) und liefert kontextsensitive Blöcke: Dashboard-Filter/Sync, Journal-Tools (Entries, Templates, Insights) sowie globale Shortcuts und eine kleine Recent-Sektion.
- **Tokens**: Nutzt neue Alias-Tokens (`--surface-*`, `--text-*`, `--brand`) für konsistente Farb-/Flächenzuordnung.
- **Implementation**: Live unter `src/components/layout/*` mit `main#main-content` als Skip-Link-Ziel, im Router verdrahtet über `src/routes/RoutesRoot.tsx` (Legacy-Ordner `src/layout/` entfernt).
- **Navigation**: Rail-Links verweisen auf bestehende Routen (Dashboard, Analysis, Chart, Watchlist, Alerts, Journal), damit keine 404s entstehen.

---

## 📖 Weitere Ressourcen

- **Tailwind Config**: `tailwind.config.ts`
- **Design Tokens**: `src/styles/tokens.css`
- **Komponenten-Styles**: `src/styles/index.css`
- **Motion System**: `src/styles/motion.css`

---

**Happy Styling! 🎨✨**
