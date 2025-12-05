# Layout System – Quick Start Guide

**TL;DR**: Strukturiertes, wiederverwendbares Layout-System für alle Pages in der Sparkfined PWA.

---

## 🚀 Quick Examples

### 1. Standard Page Layout

```tsx
import { PageLayout, PageHeader, Toolbar, PageContent } from '@/components/layout';
import { FilterPills } from '@/components/layout';
import { Button } from '@/components/ui';

export default function MyPage() {
  return (
    <PageLayout maxWidth="6xl">
      <PageHeader
        title="My Page"
        subtitle="Page description"
        actions={<Button>Primary Action</Button>}
      />
      
      <Toolbar
        left={<FilterPills options={['All', 'Active', 'Archived']} active="All" onChange={setFilter} />}
      />
      
      <PageContent>
        {/* Your content here */}
      </PageContent>
    </PageLayout>
  );
}
```

### 2. Modal Dialog

```tsx
import { Modal } from '@/components/ui';

<Modal isOpen={isOpen} onClose={handleClose} title="Confirm Action">
  <p>Are you sure?</p>
  <div className="flex gap-3 mt-4">
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </div>
</Modal>
```

### 3. Drawer (für Formulare)

```tsx
import { Drawer, DrawerSection, DrawerActions } from '@/components/ui';
import { FormField } from '@/components/layout';

<Drawer isOpen={isOpen} onClose={handleClose} title="Create Item" width="md">
  <FormSection title="Details">
    <FormField label="Name" required>
      <Input placeholder="Enter name" />
    </FormField>
    
    <FormField label="Description">
      <Textarea placeholder="Optional description" />
    </FormField>
  </FormSection>
  
  <DrawerActions>
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleSave}>Create</Button>
  </DrawerActions>
</Drawer>
```

### 4. Alert Card

```tsx
import { AlertCard } from '@/components/alerts/AlertCard';

<AlertCard
  alert={alert}
  isActive={selectedId === alert.id}
  onClick={() => setSelectedId(alert.id)}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

## 📦 Component Imports

### Layout Components
```tsx
import {
  PageLayout,
  PageHeader,
  Toolbar,
  PageContent,
  PageFooter,
} from '@/components/layout';

import { FilterPills } from '@/components/layout';

import {
  FormSection,
  FormField,
  FormActions,
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
} from '@/components/ui';
```

---

## 🎨 Layer System (Z-Index)

Verwende die vordefinierten z-index Tokens:

```tsx
className="z-base"     // 0 - Normal content
className="z-panel"    // 10 - Inline panels
className="z-drawer"   // 20 - Side drawers
className="z-modal"    // 30 - Modal dialogs
className="z-dropdown" // 40 - Dropdowns
className="z-toast"    // 50 - Toasts
className="z-tooltip"  // 60 - Tooltips
```

**Regel**: `Modal` und `Drawer` verwenden automatisch die richtigen z-indices.

---

## 🔄 Migration from Old Code

### Before (DashboardShell + Inline Layout)
```tsx
<DashboardShell title="Alerts" description="..." actions={...}>
  <AlertsLayout>
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button>Filter 1</button>
        <button>Filter 2</button>
      </div>
      <AlertsList />
    </div>
  </AlertsLayout>
</DashboardShell>
```

### After (PageLayout Pattern)
```tsx
<PageLayout>
  <PageHeader
    title="Alerts"
    subtitle="Description"
    actions={<Button>New Alert</Button>}
  />
  <Toolbar left={<FilterPills options={filters} />} />
  <PageContent>
    <AlertsList />
  </PageContent>
</PageLayout>
```

---

## ✅ Validation Checklist

Vor dem Commit:
- [ ] `pnpm typecheck` (keine TS-Fehler)
- [ ] `pnpm lint` (keine ESLint-Fehler)
- [ ] `pnpm test` (alle Unit-Tests grün)
- [ ] `pnpm test:e2e` (E2E-Tests grün)

---

## 📚 Full Documentation

Siehe [PWA Layout System](/docs/architecture/pwa-layout-system.md) für Details.

---

**Maintained by**: Architecture Team  
**Last Updated**: 2024-12-05
