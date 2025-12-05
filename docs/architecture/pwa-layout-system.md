# PWA Layout System – Strukturierung & UI-Kit

**Status**: ✅ Implemented  
**Last Updated**: 2024-12-05  
**Owner**: Architecture Team

---

## 📋 Übersicht

Dieses Dokument beschreibt das strukturierte Layout-System für die Sparkfined PWA, das für alle Views (Watchlist, Alerts, Screener, Settings, etc.) wiederverwendbar ist.

Das System besteht aus:
1. **App-Shell** (globale Rahmenstruktur)
2. **Page Layout Pattern** (standardisierte Seitenstruktur)
3. **Layer-System** (Overlays mit z-index tokens)
4. **UI-Kit** (wiederverwendbare Komponenten)

---

## 🏗️ 1. App-Shell (Global)

Die App-Shell bleibt über alle Seiten hinweg konsistent:

### Komponenten

- **Sidebar** (`src/components/layout/Sidebar.tsx`)
  - Desktop (>= lg): Fixed left, collapsible
  - Primäre Navigation: Dashboard, Analysis, Chart, Journal, Oracle, Alerts
  - Sekundäre Navigation: Settings
  - CSS-Variable: `--sidebar-width` (5rem collapsed, 16rem expanded)

- **BottomNav** (`src/components/layout/BottomNav.tsx`)
  - Mobile (< lg): Fixed bottom navigation
  - Gleiche Navigation wie Sidebar

- **Main Content Area** (`src/App.tsx`)
  - Automatischer Sidebar-Offset auf Desktop: `lg:pl-[var(--sidebar-width)]`
  - Transition bei Sidebar-Toggle

### Struktur

```tsx
<App>
  <Sidebar /> {/* Desktop only */}
  <main id="main-content" className="lg:pl-[var(--sidebar-width)]">
    <RoutesRoot />
  </main>
  <BottomNav /> {/* Mobile only */}
</App>
```

---

## 📄 2. Page Layout Pattern

Jede Hauptseite verwendet das standardisierte Page Layout Pattern:

### Komponenten (`src/components/layout/PageLayout.tsx`)

#### PageLayout
Container für die gesamte Seite mit max-width und Padding.

```tsx
<PageLayout maxWidth="6xl">
  {/* Page content */}
</PageLayout>
```

**Props**:
- `maxWidth`: `'none' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl'` (default: `'6xl'`)
- `className`: zusätzliche CSS-Klassen

#### PageHeader
Seiten-Header mit Titel, Beschreibung, Meta-Info und Actions.

```tsx
<PageHeader
  title="Alerts"
  subtitle="Stay ahead of key levels, momentum shifts and volatility spikes"
  meta="5 alerts tracked · 2 triggered"
  actions={<Button>New Alert</Button>}
  tabs={<TabsComponent />}
/>
```

**Props**:
- `title`: Seitentitel (required)
- `subtitle`: Beschreibung (optional)
- `meta`: Meta-Information (optional)
- `actions`: React.ReactNode für Buttons/Actions (optional)
- `tabs`: Tab-Navigation (optional)

#### Toolbar
Filter-Bar mit Links/Rechts-Layout für Filter und Controls.

```tsx
<Toolbar
  left={<FilterPills options={statusFilters} />}
  right={<FilterPills options={typeFilters} />}
  search={<SearchInput />}
/>
```

**Props**:
- `left`: Linke Seite (z.B. Status-Filter)
- `right`: Rechte Seite (z.B. Typ-Filter)
- `search`: Suchfeld (optional)

#### PageContent
Haupt-Content-Bereich mit konsistentem Spacing.

```tsx
<PageContent spacing="lg">
  <AlertsList />
</PageContent>
```

**Props**:
- `spacing`: `'none' | 'sm' | 'md' | 'lg'` (default: `'lg'`)
- `className`: zusätzliche CSS-Klassen

#### PageFooter
Optionaler Footer für Pagination oder Meta-Infos.

```tsx
<PageFooter>
  <Pagination currentPage={1} totalPages={5} />
</PageFooter>
```

### Vollständiges Beispiel

```tsx
import { PageLayout, PageHeader, Toolbar, PageContent } from '@/components/layout';
import { FilterPills } from '@/components/layout';

export default function AlertsPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Alerts"
        subtitle="Stay ahead of key levels, momentum shifts and volatility spikes"
        meta="5 alerts tracked · 2 triggered"
        actions={<Button>New Alert</Button>}
      />
      <Toolbar
        left={<FilterPills options={['All', 'Armed', 'Triggered']} />}
        right={<FilterPills options={['All', 'Price Above', 'Price Below']} />}
      />
      <PageContent>
        <AlertsList />
      </PageContent>
    </PageLayout>
  );
}
```

---

## 🔲 3. Layer-System (Overlays)

Das Layer-System definiert klare z-index Tokens für Overlays:

### Z-Index Tokens (`tailwind.config.ts`)

```typescript
zIndex: {
  'base': '0',      // Normaler Seiteninhalt
  'panel': '10',    // Inline Panels (z.B. ausklappbare Filter)
  'drawer': '20',   // Side Drawer (Formulare, Editoren)
  'modal': '30',    // Modale Dialoge (kritische Aktionen)
  'dropdown': '40', // Dropdowns, Context Menus
  'toast': '50',    // Toast Notifications
  'tooltip': '60',  // Tooltips
}
```

### Komponenten

#### Modal (`src/components/ui/Modal.tsx`)
Für kritische Bestätigungen und kurze Dialoge.

```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Delete Alert?"
  subtitle="This action cannot be undone"
  size="md"
>
  <p>Are you sure you want to delete this alert?</p>
  <div className="flex gap-3 mt-4">
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
  </div>
</Modal>
```

**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string (optional)
- `subtitle`: string (optional)
- `size`: `'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)
- `showCloseButton`: boolean (default: `true`)
- `closeOnEscape`: boolean (default: `true`)
- `closeOnOverlayClick`: boolean (default: `true`)

#### Drawer (`src/components/ui/Drawer.tsx`)
Für komplexe Formulare und Editoren (z.B. "New Alert", "Edit Entry").

```tsx
import { Drawer, DrawerSection, DrawerActions } from '@/components/ui';

<Drawer
  isOpen={isOpen}
  onClose={handleClose}
  title="New Alert"
  subtitle="Define a price or indicator condition"
  position="right"
  width="md"
>
  <DrawerSection title="Market Selection">
    <FormField label="Symbol">
      <Input placeholder="BTCUSDT" />
    </FormField>
  </DrawerSection>
  
  <DrawerActions>
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleSave}>Create Alert</Button>
  </DrawerActions>
</Drawer>
```

**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string (optional)
- `subtitle`: string (optional)
- `position`: `'left' | 'right'` (default: `'right'`)
- `width`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `showCloseButton`: boolean (default: `true`)

**Sub-Komponenten**:
- `DrawerSection`: Gruppiert Formularfelder mit Titel/Beschreibung
- `DrawerActions`: Footer mit Cancel/Save Buttons

---

## 🧩 4. UI-Kit

### Core Components

Alle Core-Komponenten sind im Design System standardisiert:

- **Button** (`src/components/ui/Button.tsx`)
  - Varianten: `primary`, `secondary`, `ghost`, `outline`, `destructive`
  - Größen: `sm`, `md`, `lg`
  - Loading-State: `isLoading`

- **Badge** (`src/components/ui/Badge.tsx`)
  - Varianten: `default`, `success`, `warning`, `danger`, `outline`, `brand`
  - Live-Pulse: `live` prop

- **Card** (`src/components/ui/Card.tsx`)
  - Varianten: `default`, `muted`, `interactive`, `glass`, `elevated`, `bordered`, `glow`
  - Sub-Komponenten: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

### Form Components

#### FormLayout (`src/components/layout/FormLayout.tsx`)
Für strukturierte Formulare in Drawers:

```tsx
import { FormSection, FormField, FormActions } from '@/components/layout';

<Drawer>
  <FormSection
    title="Market Selection"
    description="Select the asset and timeframe"
  >
    <FormField label="Symbol" htmlFor="symbol" required>
      <Input id="symbol" placeholder="BTCUSDT" />
    </FormField>
    
    <FormField label="Timeframe" htmlFor="timeframe">
      <Select options={timeframes} />
    </FormField>
  </FormSection>
  
  <FormActions>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Save</Button>
  </FormActions>
</Drawer>
```

**Komponenten**:
- `FormSection`: Gruppiert Felder mit Titel/Beschreibung
- `FormField`: Label + Input Wrapper mit Error-Handling
- `FormActions`: Footer mit Buttons
- `FormDivider`: Visueller Trenner zwischen Sektionen

**FormField Props**:
- `label`: string
- `htmlFor`: string (optional)
- `required`: boolean (default: false)
- `error`: string (optional)
- `hint`: string (optional)
- `layout`: `'vertical' | 'horizontal'` (default: `'vertical'`)

### Filter Components

#### FilterPills (`src/components/layout/FilterPills.tsx`)
Wiederverwendbare Filter Toggle Pills (Segmented Controls):

```tsx
import { FilterPills } from '@/components/layout';

<FilterPills
  options={['all', 'armed', 'triggered', 'paused']}
  active="armed"
  onChange={(value) => setFilter(value)}
  formatLabel={(value) => value.toUpperCase()}
/>
```

**Props**:
- `options`: string[] (Filter-Optionen)
- `active`: string (aktiver Filter)
- `onChange`: (value: string) => void
- `formatLabel`: (value: string) => string (optional)

### Domain Components

#### AlertCard (`src/components/alerts/AlertCard.tsx`)
Standardisierte Alert-Karte mit konsistentem Design:

```tsx
import { AlertCard } from '@/components/alerts/AlertCard';

<AlertCard
  alert={alert}
  isActive={selectedId === alert.id}
  onClick={() => handleSelect(alert.id)}
  onEdit={() => handleEdit(alert.id)}
  onDelete={() => handleDelete(alert.id)}
  onPause={() => handlePause(alert.id)}
  showActions={true}
/>
```

**Struktur**:
- **Header**: Symbol · Timeframe, Status Badge, Kebab-Menu
- **Body**: Condition (primär), Summary (sekundär)
- **Footer**: Type Badge, Origin Badge, Notification Channels, Meta-Info

**Props**:
- `alert`: Alert (required)
- `isActive`: boolean (default: false)
- `onClick`: () => void (optional)
- `onEdit`: () => void (optional)
- `onDelete`: () => void (optional)
- `onPause`: () => void (optional)
- `showActions`: boolean (default: true)

---

## 📦 Exports

### Layout Components
```tsx
import {
  PageLayout,
  PageHeader,
  Toolbar,
  PageContent,
  PageFooter,
  FilterPills,
  FormSection,
  FormField,
  FormActions,
  FormDivider,
} from '@/components/layout';
```

### UI Components
```tsx
import {
  Button,
  Badge,
  Card,
  Modal,
  Drawer,
  DrawerSection,
  DrawerActions,
  Input,
  Select,
  Textarea,
} from '@/components/ui';
```

---

## 🎨 Design System Integration

Alle Komponenten verwenden das Design System aus `tailwind.config.ts`:

### Colors
- **Brand**: `bg-brand`, `text-brand`, `border-brand`
- **Surface**: `bg-surface`, `bg-surface-elevated`, `bg-surface-subtle`
- **Text**: `text-text-primary`, `text-text-secondary`, `text-text-tertiary`
- **Status**: `bg-status-armed-bg`, `text-status-triggered-text`

### Effects
- **Hover**: `hover:bg-interactive-hover`, `hover-lift`, `hover-scale`, `hover-glow`
- **Glass**: `glass-subtle`, `glass-heavy`
- **Elevation**: `elevation-low`, `elevation-medium`, `elevation-high`
- **Borders**: `border-glow-brand`, `border-glow-success`

### Animations
- **Fade**: `animate-fade-in`
- **Slide**: `animate-slide-up`, `animate-slide-in-left`, `animate-slide-in-right`
- **Scale**: `animate-scale-in`

---

## 🚀 Migration Guide

### Bestehende Pages refactoren

**Vorher** (AlertsPageV2.tsx):
```tsx
<DashboardShell title="Alerts" description="..." actions={...}>
  <AlertsLayout>
    <div className="flex flex-col gap-4">
      {/* Inline Filter Buttons */}
      <div className="flex items-center gap-2">
        <button className={...}>All</button>
        <button className={...}>Armed</button>
      </div>
      <AlertsList />
    </div>
  </AlertsLayout>
</DashboardShell>
```

**Nachher** (mit neuem System):
```tsx
<PageLayout>
  <PageHeader
    title="Alerts"
    subtitle="Stay ahead of key levels"
    actions={<Button>New Alert</Button>}
  />
  <Toolbar
    left={<FilterPills options={statusFilters} />}
    right={<FilterPills options={typeFilters} />}
  />
  <PageContent>
    <AlertsList />
  </PageContent>
</PageLayout>
```

### Dialog → Drawer Migration

**Vorher** (AlertCreateDialog.tsx):
```tsx
<div className="fixed inset-0 z-50 flex items-center">
  <form className="w-full max-w-md p-6">
    <input label="Symbol" />
    <button>Cancel</button>
    <button>Save</button>
  </form>
</div>
```

**Nachher** (mit Drawer):
```tsx
<Drawer isOpen={isOpen} onClose={handleClose} title="New Alert">
  <FormSection title="Market Selection">
    <FormField label="Symbol">
      <Input placeholder="BTCUSDT" />
    </FormField>
  </FormSection>
  <DrawerActions>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Save</Button>
  </DrawerActions>
</Drawer>
```

---

## 📊 Struktur-Übersicht

```
src/
├── components/
│   ├── layout/
│   │   ├── PageLayout.tsx       # PageLayout, PageHeader, Toolbar, PageContent
│   │   ├── FormLayout.tsx       # FormSection, FormField, FormActions
│   │   ├── FilterPills.tsx      # Wiederverwendbare Filter
│   │   ├── Sidebar.tsx          # Desktop Navigation
│   │   ├── BottomNav.tsx        # Mobile Navigation
│   │   └── index.ts             # Exports
│   ├── ui/
│   │   ├── Modal.tsx            # Modal Dialog
│   │   ├── Drawer.tsx           # Side Drawer
│   │   ├── Button.tsx           # Button Component
│   │   ├── Badge.tsx            # Badge Component
│   │   ├── Card.tsx             # Card Component
│   │   └── index.ts             # Exports
│   └── alerts/
│       └── AlertCard.tsx        # Standardisierte Alert Card
└── tailwind.config.ts           # Design System Tokens
```

---

## ✅ Benefits

1. **Konsistenz**: Alle Seiten sehen gleich aus und verhalten sich einheitlich
2. **Wiederverwendbarkeit**: Ein Mal definiert, überall verwendet
3. **Wartbarkeit**: Änderungen an einem Ort wirken sich überall aus
4. **Developer Experience**: Klare APIs, TypeScript-Support, Dokumentation
5. **Performance**: Code-Splitting, tree-shaking optimiert
6. **Accessibility**: ARIA-Labels, Focus-Management, Keyboard-Support

---

## 📚 Related Documentation

- [Design System](/docs/design/design-system.md)
- [Component Library](/docs/architecture/component-library.md)
- [Testing Guidelines](/docs/process/testing.md)

---

**Maintained by**: Architecture Team  
**Last Review**: 2024-12-05
