---
mode: SYSTEM
id: "04-ui-ux-components"
priority: 2
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode"]
globs: ["src/components/**/*.tsx", "src/pages/**/*.tsx", "src/styles/**/*.css"]
description: "UI/UX design principles, component taxonomy, Tailwind patterns, and UX states for Sparkfined PWA"
---

# 04 – UI / UX & Components

## 1. Design Principles

Sparkfined folgt **Trading-optimierten Design-Prinzipien** mit Fokus auf Geschwindigkeit, Klarheit und Dark-Mode-First:

### Core Principles

1. **Dark-Mode-First:** Trading-Apps brauchen reduzierte Eye-Strain → Default ist Dark
2. **Information-Density:** Trader wollen viele Daten auf einen Blick → kompakte Layouts
3. **Action-Proximity:** Primär-Aktionen (Save, Analyze, Alert) immer sichtbar
4. **Color-Semantics:** Grün = Bullish/Success, Rot = Bearish/Error, Gelb = Warning, Blau = Neutral/Info
5. **No-Friction-Inputs:** Auto-Focus, Keyboard-Shortcuts, Inline-Editing
6. **Responsive-Mobile:** Touch-optimiert, min. 44px Touch-Targets

### Brand-Töne (Tailwind-Palette)

```css
/* Primary: Purple-Gradient (Hero-Sections, CTAs) */
--color-primary: #667eea;
--color-primary-dark: #764ba2;

/* Success/Bullish: Emerald */
--color-success: #10b981;

/* Error/Bearish: Red */
--color-error: #ef4444;

/* Warning: Amber */
--color-warning: #f59e0b;

/* Neutral: Gray-Scale (Dark-Mode-optimiert) */
--color-bg-dark: #1a1a1a;
--color-bg-light: #ffffff;
--color-text-dark: #e5e5e5;
--color-text-light: #1f2937;
```

**Tailwind-Klassen:**

```tsx
// Primary-Gradient
className="bg-gradient-to-r from-purple-600 to-indigo-600"

// Bullish/Bearish
className="text-emerald-500"  // Bullish
className="text-red-500"      // Bearish

// Dark-Mode
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
```

---

## 2. Component Taxonomy

Sparkfined organisiert Components in **4 Hierarchie-Ebenen**:

```
┌─────────────────────────────────────────────────┐
│ Level 1: UI-Primitives (src/components/ui/)    │
│   Button, Input, Modal, Select, Skeleton       │
│   → Wiederverwendbar, kein Business-Logic       │
├─────────────────────────────────────────────────┤
│ Level 2: Composed-Components (src/components/) │
│   KPITile, FeedItem, SignalCard                │
│   → Domain-spezifisch, nutzt UI-Primitives     │
├─────────────────────────────────────────────────┤
│ Level 3: Sections (src/sections/)              │
│   ChartCanvas, JournalEditor, AnalyzeKPIGrid   │
│   → Feature-Module, orchestriert Components    │
├─────────────────────────────────────────────────┤
│ Level 4: Pages (src/pages/)                    │
│   BoardPage, AnalyzePage, JournalPage          │
│   → Route-Entry-Points, orchestriert Sections  │
└─────────────────────────────────────────────────┘
```

### Level 1: UI-Primitives (Design-System)

**[MUST]** UI-Primitives haben keine Business-Logic

```tsx
// ✅ Good: Rein visuelles Component
export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false 
}: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition";
  const variantClasses = {
    primary: "bg-purple-600 text-white hover:bg-purple-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

// ❌ Avoid: Business-Logic in UI-Primitive
export function Button({ onClick, saveToJournal }: ButtonProps) {
  const handleClick = async () => {
    await db.journal.add({ ... });  // Business-Logic!
    onClick?.();
  };
  // ...
}
```

**Standard-UI-Primitives (src/components/ui/):**

- `Button.tsx` – Primary/Secondary/Danger-Variants
- `Input.tsx` – Text/Number/Date-Inputs mit Validation-States
- `Modal.tsx` – Dialog-Overlay mit Focus-Trap
- `Select.tsx` – Dropdown mit Keyboard-Navigation
- `Skeleton.tsx` – Loading-Placeholders
- `Textarea.tsx` – Multi-Line-Input
- `TooltipIcon.tsx` – Info-Icons mit Hover-Tooltip
- `EmptyState.tsx` – "No Data"-Zustände
- `ErrorState.tsx` – Fehler-Anzeigen
- `LoadingSkeleton.tsx` – Content-Placeholders

### Level 2: Composed-Components

**[SHOULD]** Composed-Components nutzen UI-Primitives + Domain-Logic

```tsx
// ✅ Good: Domain-spezifisches Component
export function KPITile({ data, onRefresh }: KPITileProps) {
  const { label, value, change, sentiment } = data;

  const sentimentColor = {
    positive: 'text-emerald-500',
    negative: 'text-red-500',
    neutral: 'text-gray-500',
  }[sentiment];

  return (
    <article className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <header className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </h3>
        <Button variant="secondary" onClick={onRefresh} size="sm">
          <RefreshIcon className="w-4 h-4" />
        </Button>
      </header>
      <p className={`text-2xl font-bold ${sentimentColor}`}>
        {value}
      </p>
      {change !== undefined && (
        <p className="text-sm mt-1 text-gray-500">
          {change > 0 ? '+' : ''}{change.toFixed(2)}%
        </p>
      )}
    </article>
  );
}
```

**Standard-Composed-Components:**

- `board/KPITile.tsx` – Metric-Display mit Sentiment
- `board/FeedItem.tsx` – News/Event-Card
- `board/QuickActionCard.tsx` – Action-Shortcuts
- `signals/SignalCard.tsx` – Trading-Signal-Display
- `signals/LessonCard.tsx` – Learning-Module-Card
- `JournalBadge.tsx` – Entry-Tag-Badge
- `ResultCard.tsx` – Search-Result-Item

---

## 3. Naming & Structure

### Props-Naming-Conventions

**[MUST]** Nutze konsistente Props-Namen:

```tsx
// Event-Handlers: on{Action}
interface ComponentProps {
  onClick?: () => void;
  onSave?: (data: T) => void;
  onDelete?: (id: string) => void;
  onChange?: (value: string) => void;
}

// Boolean-Props: is{State} / has{Feature} / show{Element}
interface ComponentProps {
  isLoading?: boolean;
  hasError?: boolean;
  showActions?: boolean;
  disabled?: boolean;  // Exception: Standard-HTML-Attribute
}

// Data-Props: {noun} (singular/plural je nach Typ)
interface ComponentProps {
  user: User;           // Singular-Entity
  entries: Entry[];     // Plural-Collection
  data: KPIData;        // Generic-Data
}

// Variant-Props: variant / size / color
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'success' | 'error';
}
```

### Component-File-Structure

**[SHOULD]** Folge dieser Struktur:

```tsx
// 1. Imports (React → Third-Party → Local → Types)
import { useState, useCallback } from 'react';
import { XIcon } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useJournal } from '@/hooks/useJournal';

import type { JournalEntry } from '@/types';

// 2. Types/Interfaces
interface JournalEditorProps {
  entry?: JournalEntry;
  onSave: (content: string) => void;
  onCancel: () => void;
}

// 3. Component
export function JournalEditor({ entry, onSave, onCancel }: JournalEditorProps) {
  // 3a. State
  const [content, setContent] = useState(entry?.content || '');
  
  // 3b. Hooks
  const { addEntry } = useJournal();
  
  // 3c. Handlers
  const handleSave = useCallback(() => {
    onSave(content);
  }, [content, onSave]);
  
  // 3d. Early-Returns (Loading, Error, Empty)
  if (!entry && !content) return null;
  
  // 3e. Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}

// 4. Sub-Components (optional, wenn klein)
function EditorToolbar({ onBold, onItalic }: ToolbarProps) {
  return <div>...</div>;
}
```

---

## 4. UX-Konventionen

### Loading-States

**[MUST]** Zeige Loading-States für async-Operationen

```tsx
// ✅ Good: Skeleton für Content-Loading
function BoardPage() {
  const { kpis, isLoading } = useBoardKPIs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {kpis.map(kpi => <KPITile key={kpi.id} data={kpi} />)}
    </div>
  );
}
```

**Standard-Loading-Components:**

```tsx
// src/components/ui/Skeleton.tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`} />
  );
}

// src/components/ui/LoadingSkeleton.tsx
export function LoadingSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24 mb-4" />
      ))}
    </>
  );
}
```

### Error-States

**[MUST]** Zeige User-freundliche Error-Messages

```tsx
// ✅ Good: Error-State-Component
export function ErrorState({ 
  error, 
  onRetry 
}: { 
  error: Error | string; 
  onRetry?: () => void; 
}) {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 mb-4 text-red-500">
        <AlertCircleIcon className="w-full h-full" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          Try Again
        </Button>
      )}
    </div>
  );
}

// Usage
function AnalyzePage() {
  const { data, error, isLoading, refetch } = useTokenData(address);

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  // ...
}
```

### Empty-States

**[SHOULD]** Zeige hilfreiche Empty-States mit CTAs

```tsx
// ✅ Good: Empty-State mit CTA
export function EmptyState({ 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 mb-4 text-gray-400">
        <InboxIcon className="w-full h-full" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Usage
function JournalPage() {
  const { entries } = useJournal();

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No Journal Entries"
        description="Start documenting your trades to build consistency and improve your edge."
        action={{
          label: 'Create First Entry',
          onClick: () => setShowEditor(true),
        }}
      />
    );
  }
  // ...
}
```

### Success-Feedback

**[SHOULD]** Zeige Success-Toast nach Aktionen

```tsx
// Geplant: Toast-System (noch nicht implementiert)
// Aktuell: Inline-Success-Messages oder Redirect

// ✅ Good: Inline-Success-Message
function SaveTradeModal({ trade, onClose }: Props) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    await saveTrade(trade);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
      navigate('/journal');
    }, 1500);
  };

  if (isSaved) {
    return (
      <div className="flex items-center gap-2 text-emerald-500">
        <CheckCircleIcon className="w-5 h-5" />
        <span>Trade saved successfully!</span>
      </div>
    );
  }
  // ...
}
```

---

## 5. Accessibility Hooks

### Focus-Management

**[MUST]** Nutze Focus-Trap in Modals

```tsx
// src/components/ui/Modal.tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full"
      >
        {children}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

### Keyboard-Navigation

**[MUST]** Implementiere Keyboard-Shortcuts für Haupt-Aktionen

```tsx
// src/hooks/useKeyboardShortcut.ts
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  deps: DependencyList = []
) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === key && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, ...deps]);
}

// Usage
function JournalPage() {
  const [showEditor, setShowEditor] = useState(false);

  // Cmd+N / Ctrl+N → New Entry
  useKeyboardShortcut('n', () => setShowEditor(true));

  // Cmd+S / Ctrl+S → Save Entry
  useKeyboardShortcut('s', handleSave, [handleSave]);

  return <div>...</div>;
}
```

### ARIA-Labels

**[MUST]** Nutze ARIA-Labels für Icon-Only-Buttons

```tsx
// ✅ Good: Icon-Button mit ARIA
<button
  onClick={onDelete}
  aria-label="Delete entry"
  className="p-2 hover:bg-gray-100 rounded"
>
  <TrashIcon className="w-5 h-5 text-red-500" />
</button>

// ❌ Avoid: Icon-Button ohne ARIA
<button onClick={onDelete}>
  <TrashIcon className="w-5 h-5" />  {/* Screen-Reader weiß nicht, was das ist */}
</button>
```

**Weitere A11y-Details:** Siehe `07-accessibility.md`

---

## 6. Tailwind-Patterns

### Responsive-Design

**[MUST]** Nutze Mobile-First-Approach

```tsx
// ✅ Good: Mobile-First (Base → sm → md → lg)
<div className="
  grid grid-cols-1        /* Mobile: 1 Spalte */
  sm:grid-cols-2          /* Small: 2 Spalten */
  md:grid-cols-3          /* Medium: 3 Spalten */
  lg:grid-cols-4          /* Large: 4 Spalten */
  gap-4
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// ❌ Avoid: Desktop-First (erfordert mehr Overrides)
<div className="grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
```

### Dark-Mode-Patterns

**[MUST]** Nutze `dark:` Modifier für alle Farben

```tsx
// ✅ Good: Dark-Mode-Support
<div className="
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-gray-100
  border border-gray-200 dark:border-gray-700
">
  Content
</div>

// ❌ Avoid: Nur Light-Mode
<div className="bg-white text-gray-900 border-gray-200">
  Content  {/* Sieht in Dark-Mode schlecht aus */}
</div>
```

### Component-Variants via clsx

**[SHOULD]** Nutze `clsx` für dynamische Klassen (geplant, noch nicht überall)

```tsx
import clsx from 'clsx';

export function Button({ variant, size, disabled, className }: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition',
        {
          'bg-purple-600 text-white hover:bg-purple-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
    >
      {children}
    </button>
  );
}
```

---

## 7. Examples

### ✅ Good – Complete Component mit UX-States

```tsx
// src/components/board/KPITile.tsx
import { useState } from 'react';
import { RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { KPIData } from '@/types';

interface KPITileProps {
  data?: KPIData;
  isLoading?: boolean;
  error?: Error;
  onRefresh?: () => void;
}

export function KPITile({ data, isLoading, error, onRefresh }: KPITileProps) {
  // Loading-State
  if (isLoading) {
    return <Skeleton className="h-32 rounded-lg" />;
  }

  // Error-State
  if (error) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-500">
        <p className="text-sm text-red-500">Error loading KPI</p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="secondary" size="sm" className="mt-2">
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Empty-State
  if (!data) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-500">No data available</p>
      </div>
    );
  }

  // Success-State
  const { label, value, change, sentiment } = data;
  const sentimentColor = {
    positive: 'text-emerald-500',
    negative: 'text-red-500',
    neutral: 'text-gray-500',
  }[sentiment || 'neutral'];

  return (
    <article className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
      <header className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            aria-label={`Refresh ${label}`}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <RefreshCwIcon className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </header>
      
      <p className={`text-2xl font-bold ${sentimentColor}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      
      {change !== undefined && (
        <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
          {change > 0 ? '↑' : change < 0 ? '↓' : '→'} 
          {' '}
          {Math.abs(change).toFixed(2)}%
        </p>
      )}
    </article>
  );
}
```

### ❌ Avoid – Anti-Patterns

```tsx
// ❌ Bad: Keine UX-States
function KPITile({ data }: { data: KPIData }) {
  return (
    <div>
      <p>{data.label}</p>  {/* Was, wenn data null ist? */}
      <p>{data.value}</p>
    </div>
  );
}

// ❌ Bad: Inline-Styles statt Tailwind
<div style={{ 
  padding: '16px', 
  background: '#fff', 
  borderRadius: '8px' 
}}>
  Content
</div>

// ❌ Bad: Keine Dark-Mode-Unterstützung
<div className="bg-white text-black">
  Content  {/* Sieht in Dark-Mode furchtbar aus */}
</div>

// ❌ Bad: Kein Keyboard-Support für Custom-Buttons
<div onClick={handleClick} className="cursor-pointer">
  Click me  {/* Nicht fokussierbar, kein Enter-Support */}
</div>
```

---

## Related

- `00-project-core.md` – Design-Principles & Brand
- `02-frontend-arch.md` – Component-Hierarchie & File-Structure
- `07-accessibility.md` – Detaillierte A11y-Patterns
- `08-performance.md` – Component-Optimization (memo, lazy)
- `src/components/ui/` – Design-System-Primitives
- `src/styles/` – Global-Styles & Tailwind-Config

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 Batch 2 (Component-Taxonomy, UX-States, Tailwind-Patterns)
