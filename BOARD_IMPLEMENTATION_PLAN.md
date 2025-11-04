# Board Implementation Plan — Phase A-D

**Projekt:** Sparkfined PWA Board  
**Datum:** 2025-11-04  
**Status:** Ready for Implementation  
**Geschätzte Dauer:** 24-32h (~3-4 Tage FTE)

---

## Übersicht

Dieser Plan beschreibt die Umsetzung des Board Command Centers in 4 Phasen:
- **Phase A:** Foundation (Design Tokens, Typography, Primitives, Icons)
- **Phase B:** Board Layout (Grid, Zones, KPI Tiles, Quick Actions)
- **Phase C:** Interaction (Feed Items, States, Navigation, Motion)
- **Phase D:** Data & API (Integration, Schema, Endpoints)

---

## Phase A: Foundation (4-6h)

### A1: Design Tokens (1-2h)

**Ziel:** Zentrale Token-Definition für Colors, Spacing, Radius, Shadows

**Neue Datei:** `src/styles/tokens.css`

```css
/* Design Tokens — Sparkfined PWA Board */

:root {
  /* === Colors === */
  /* Background & Surface */
  --color-bg: #0a0a0a;              /* zinc-950 */
  --color-surface: #18181b;         /* zinc-900 */
  --color-border: #27272a;          /* zinc-800 */
  
  /* Text */
  --color-text-primary: #f4f4f5;    /* zinc-100 */
  --color-text-secondary: #a1a1aa;  /* zinc-400 */
  --color-text-tertiary: #71717a;   /* zinc-500 */
  
  /* Brand & Accent */
  --color-brand: #0fb34c;           /* emerald-500 */
  --color-brand-hover: #10b981;     /* emerald-600 */
  
  /* Semantic */
  --color-success: #10b981;         /* emerald-500 */
  --color-danger: #f43f5e;          /* rose-500 */
  --color-info: #06b6d4;            /* cyan-500 */
  --color-warn: #f59e0b;            /* amber-500 */
  
  /* === Spacing (8px Grid) === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  
  /* === Radius (Default: Rund) === */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* === Shadows (Default: Rund/Weich) === */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 8px rgba(0,0,0,0.16), 0 2px 4px rgba(0,0,0,0.08);
  --shadow-lg: 0 10px 20px rgba(0,0,0,0.20), 0 4px 8px rgba(0,0,0,0.12);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.25);
  
  /* === Typography === */
  --font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  
  --leading-xs: 16px;   /* 1.33 */
  --leading-sm: 20px;   /* 1.43 */
  --leading-base: 24px; /* 1.5 */
  --leading-lg: 28px;   /* 1.56 */
  --leading-xl: 28px;   /* 1.4 */
  --leading-2xl: 32px;  /* 1.33 */
  
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  
  /* === Motion === */
  --duration-micro: 75ms;
  --duration-short: 150ms;
  --duration-medium: 250ms;
  --duration-long: 350ms;
  
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* === Layout-Stil Toggle === */
[data-layout="sharp"] {
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.18);
  --shadow-md: 0 2px 4px rgba(0,0,0,0.24);
  --shadow-lg: 0 4px 8px rgba(0,0,0,0.32);
}

/* === OLED-Modus Toggle === */
[data-oled="true"] {
  --color-bg: #000000;
  --color-surface: #0a0a0a;
}

/* === Reduce Motion === */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Anpassung:** `src/styles/App.css`

```css
/* Import tokens FIRST */
@import './tokens.css';

/* Base styles */
body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  line-height: var(--leading-sm);
}

/* Utility classes */
.font-mono {
  font-family: var(--font-mono);
}
```

---

### A2: Typography (1h)

**Ziel:** JetBrains Mono für CA/Journal, System-Font für UI

**Neue Datei:** `public/fonts/jetbrains-mono-latin.woff2`

**Hinweis:** Font von [JetBrains Website](https://www.jetbrains.com/lp/mono/) herunterladen, nur Latin-Subset (~30 KB).

**Anpassung:** `src/styles/fonts.css` (NEU)

```css
/* JetBrains Mono — Latin Subset */
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/jetbrains-mono-latin.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* Preload in index.html */
```

**Anpassung:** `index.html` (Preload)

```html
<head>
  <!-- Existing head content -->
  <link rel="preload" href="/fonts/jetbrains-mono-latin.woff2" as="font" type="font/woff2" crossorigin>
</head>
```

**Use Cases:**
- Contract Addresses (CA): `className="font-mono text-sm"`
- Journal Code Blocks: `className="font-mono text-sm"`
- Numeric Precision: `className="font-mono text-base"`
- Timestamps (absolut): `className="font-mono text-xs"`

---

### A3: Component Primitives (2-3h)

**Ziel:** Button, Input, Textarea, Select mit Variants/States/Layout-Toggle

#### A3.1: Button Component

**Neue Datei:** `src/components/ui/Button.tsx`

```tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95',
    secondary: 'bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700 active:scale-95',
    ghost: 'bg-transparent text-zinc-300 hover:bg-zinc-800/50 active:scale-95',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-9',         // 36px mobile, 32px desktop
    md: 'px-4 py-2.5 text-sm h-11',        // 44px mobile, 40px desktop
    lg: 'px-6 py-3 text-base h-12',        // 48px mobile, 44px desktop
  };
  
  const radiusClass = 'rounded-lg'; // CSS var --radius-lg wird via tokens angewendet
  
  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${radiusClass} ${className}`}
      style={{
        borderRadius: 'var(--radius-lg)',
        transition: `all var(--duration-short) var(--ease-in-out)`,
      }}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Lädt…
        </>
      ) : children}
    </button>
  );
}
```

#### A3.2: Input Component

**Neue Datei:** `src/components/ui/Input.tsx`

```tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  hint?: string;
  mono?: boolean; // For CA/Number inputs
}

export default function Input({
  error,
  hint,
  mono = false,
  className = '',
  ...props
}: InputProps) {
  const baseStyles = 'w-full bg-zinc-900 border text-zinc-100 placeholder-zinc-500 transition-all focus:outline-none focus:ring-1';
  const stateStyles = error 
    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' 
    : 'border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500/50';
  const sizeStyles = 'px-3 py-2.5 text-sm h-11'; // 44px mobile, 40px desktop
  const fontClass = mono ? 'font-mono' : '';
  
  return (
    <div className="w-full">
      <input
        className={`${baseStyles} ${stateStyles} ${sizeStyles} ${fontClass} ${className}`}
        style={{
          borderRadius: 'var(--radius-lg)',
          transition: `all var(--duration-short) var(--ease-in-out)`,
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-rose-400">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-zinc-400">{hint}</p>
      )}
    </div>
  );
}
```

#### A3.3: Textarea Component

**Neue Datei:** `src/components/ui/Textarea.tsx`

```tsx
import React, { useEffect, useRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  hint?: string;
  autoResize?: boolean;
}

export default function Textarea({
  error,
  hint,
  autoResize = true,
  className = '',
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const baseStyles = 'w-full bg-zinc-900 border text-zinc-100 placeholder-zinc-500 transition-all focus:outline-none focus:ring-1 resize-none';
  const stateStyles = error 
    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' 
    : 'border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500/50';
  const sizeStyles = 'px-3 py-2.5 text-sm min-h-[88px]'; // 2 Zeilen
  
  // Auto-resize logic
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const handleResize = () => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`; // max-height 400px mobile
        }
      };
      
      const textarea = textareaRef.current;
      textarea.addEventListener('input', handleResize);
      handleResize(); // Initial
      
      return () => textarea.removeEventListener('input', handleResize);
    }
  }, [autoResize]);
  
  return (
    <div className="w-full">
      <textarea
        ref={textareaRef}
        className={`${baseStyles} ${stateStyles} ${sizeStyles} ${className}`}
        style={{
          borderRadius: 'var(--radius-lg)',
          transition: `all var(--duration-short) var(--ease-in-out)`,
          maxHeight: '400px', // mobile
          overflowY: 'auto',
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-rose-400">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-zinc-400">{hint}</p>
      )}
    </div>
  );
}
```

#### A3.4: Select Component (Custom Dropdown)

**Neue Datei:** `src/components/ui/Select.tsx`

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm h-11 bg-zinc-900 border transition-all ${
          isOpen ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-zinc-700'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        style={{
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <span className={selectedOption ? 'text-zinc-100' : 'text-zinc-500'}>
          {selectedOption?.label || placeholder}
        </span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 max-h-60 overflow-y-auto"
          style={{
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                option.value === value 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              {option.label}
              {option.value === value && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### A4: Icon System (0.5-1h)

**Ziel:** Lucide Icons importieren, Basis-Set definieren

**Anpassung:** `package.json`

```json
{
  "dependencies": {
    "lucide-react": "^0.294.0"
  }
}
```

**Nach Installation:** `npm install lucide-react`

**Neue Datei:** `src/lib/icons.ts`

```typescript
// Zentrale Icon-Exports (Tree-shakeable)
export {
  // Navigation
  BarChart3,
  FileText,
  Clock,
  Bell,
  Settings,
  Lock,
  Home,
  
  // Actions
  Plus,
  Search,
  Download,
  Upload,
  Share2,
  Copy,
  Edit3,
  Trash2,
  
  // States
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  Wifi,
  WifiOff,
  
  // UI
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  X,
  Menu,
  MoreVertical,
  Check,
  
  // Specific
  TrendingUp,
  TrendingDown,
  Zap,
  Star,
} from 'lucide-react';
```

**Größen-Konvention:**
- `xs`: 16px (inline icons)
- `sm`: 20px (buttons, selects)
- `md`: 24px (default, quick actions)
- `lg`: 32px (empty states)
- `xl`: 48px (hero illustrations)

**Usage:**
```tsx
import { Search } from '@/lib/icons';

<Search size={20} className="text-zinc-400" />
```

---

### A5: Layout-Toggle (1h)

**Ziel:** Global Toggle für Rund/Eckig + OLED-Modus

**Neue Datei:** `src/lib/layout-toggle.ts`

```typescript
// Layout-Stil Toggle (Rund/Eckig + OLED)

export type LayoutStyle = 'rounded' | 'sharp';
export type OledMode = 'on' | 'off';

const LAYOUT_KEY = 'layout_style';
const OLED_KEY = 'oled_mode';

export function getLayoutStyle(): LayoutStyle {
  return (localStorage.getItem(LAYOUT_KEY) as LayoutStyle) || 'rounded';
}

export function setLayoutStyle(style: LayoutStyle) {
  localStorage.setItem(LAYOUT_KEY, style);
  document.body.setAttribute('data-layout', style);
}

export function getOledMode(): OledMode {
  return (localStorage.getItem(OLED_KEY) as OledMode) || 'off';
}

export function setOledMode(mode: OledMode) {
  localStorage.setItem(OLED_KEY, mode);
  document.body.setAttribute('data-oled', mode === 'on' ? 'true' : 'false');
}

// Initialize on app load
export function initializeLayoutToggles() {
  setLayoutStyle(getLayoutStyle());
  setOledMode(getOledMode());
}
```

**Anpassung:** `src/main.tsx`

```tsx
import { initializeLayoutToggles } from './lib/layout-toggle';

// Initialize layout toggles BEFORE React render
initializeLayoutToggles();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Settings UI (später in SettingsPage):**
```tsx
import { getLayoutStyle, setLayoutStyle, getOledMode, setOledMode } from '@/lib/layout-toggle';

// Toggle-Buttons für Layout-Stil + OLED-Modus
```

---

## Phase B: Board Layout (8-10h)

### B1: Grid & Breakpoints (2h)

**Ziel:** Responsive Grid (Mobile 1col, Tablet 2col, Desktop 3col)

**Neue Datei:** `src/pages/BoardPage.tsx`

```tsx
import React from 'react';
import Overview from '@/components/board/Overview';
import Focus from '@/components/board/Focus';
import QuickActions from '@/components/board/QuickActions';
import Feed from '@/components/board/Feed';

export default function BoardPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-3 py-4 md:px-6 lg:px-8">
      {/* Container with max-width */}
      <div className="mx-auto max-w-7xl">
        {/* Overview Zone (Full-width, alle Breakpoints) */}
        <Overview />
        
        {/* Main Grid (Mobile: 1col, Tablet: 2col, Desktop: 3col) */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-[5fr_3fr_4fr] lg:gap-8">
          {/* Focus Zone (Left, "Now Stream") */}
          <div className="lg:col-span-1">
            <Focus />
          </div>
          
          {/* Quick Actions (Mobile: Horizontal scroll, Desktop: Sidebar) */}
          <div className="lg:col-span-1">
            <QuickActions />
          </div>
          
          {/* Feed Zone (Right/Bottom) */}
          <div className="lg:col-span-1">
            <Feed />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Anpassung:** `src/routes/RoutesRoot.tsx`

```tsx
// Add BoardPage route
const BoardPage = lazy(() => import("../pages/BoardPage"));

<Routes>
  <Route path="/" element={<BoardPage />} /> {/* Replace AnalyzePage */}
  <Route path="/analyze" element={<AnalyzePage />} />
  {/* ... */}
</Routes>
```

---

### B2: Board Zones (3-4h)

**Ziel:** 4 Zone-Components (Overview, Focus, Quick Actions, Feed)

#### B2.1: Overview Zone

**Neue Datei:** `src/components/board/Overview.tsx`

```tsx
import React, { useState } from 'react';
import KPITile from './KPITile';
import { ChevronDown, ChevronUp } from '@/lib/icons';

export default function Overview() {
  const [showAll, setShowAll] = useState(false);
  
  // Mock KPI data (später via API)
  const kpis = {
    visible: [
      { id: 'pnl', type: 'numeric' as const, label: 'Heute P&L', value: '+€247.50', trend: '+12.5%', direction: 'up' as const },
      { id: 'alerts', type: 'count' as const, label: 'Active Alerts', value: '3', trend: undefined, direction: 'neutral' as const },
      { id: 'winrate', type: 'numeric' as const, label: 'Win Rate (7d)', value: '68%', trend: '+5%', direction: 'up' as const },
      { id: 'sync', type: 'status' as const, label: 'Sync Status', value: 'Online', trend: '2m ago', direction: 'neutral' as const },
    ],
    collapsed: [
      { id: 'charts', type: 'count' as const, label: 'Active Charts', value: '2', trend: undefined, direction: 'neutral' as const },
      { id: 'journal', type: 'count' as const, label: 'Journal (heute)', value: '3', trend: undefined, direction: 'neutral' as const },
      { id: 'mover', type: 'numeric' as const, label: 'Top Mover', value: 'SOL +8.5%', trend: undefined, direction: 'up' as const },
    ],
  };
  
  return (
    <div>
      {/* Visible KPIs (Mobile: 4, Desktop: Alle) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {kpis.visible.map(kpi => (
          <KPITile key={kpi.id} {...kpi} />
        ))}
      </div>
      
      {/* Collapsed KPIs (Mobile only) */}
      {showAll && (
        <div className="mt-3 grid grid-cols-2 gap-3 md:hidden">
          {kpis.collapsed.map(kpi => (
            <KPITile key={kpi.id} {...kpi} />
          ))}
        </div>
      )}
      
      {/* Show More Button (Mobile only) */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-sm text-zinc-400 hover:text-zinc-300 md:hidden"
      >
        {showAll ? (
          <>
            Show less <ChevronUp size={16} />
          </>
        ) : (
          <>
            Show 3 more <ChevronDown size={16} />
          </>
        )}
      </button>
    </div>
  );
}
```

#### B2.2: Focus Zone

**Neue Datei:** `src/components/board/Focus.tsx`

```tsx
import React from 'react';
import { BarChart3, Search, FileText } from '@/lib/icons';

interface ActivityCard {
  id: string;
  type: 'chart' | 'analysis' | 'journal';
  title: string;
  subtitle: string;
  timestamp: string;
}

export default function Focus() {
  // Mock data (später via IndexedDB)
  const activities: ActivityCard[] = [
    { id: '1', type: 'analysis', title: 'SOL Analysis', subtitle: '15m • 12 KPIs', timestamp: '5m ago' },
    { id: '2', type: 'chart', title: 'BTC Chart Session', subtitle: '1h • 3 Shapes', timestamp: '23m ago' },
    { id: '3', type: 'journal', title: 'Trade Entry #42', subtitle: 'ETHUSD Scalp', timestamp: '1h ago' },
  ];
  
  const iconMap = {
    chart: BarChart3,
    analysis: Search,
    journal: FileText,
  };
  
  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-zinc-100">Now Stream</h2>
      <div className="space-y-3">
        {activities.map(activity => {
          const Icon = iconMap[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 border-b border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:bg-zinc-900"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <Icon size={24} className="text-zinc-400" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-zinc-100">{activity.title}</h3>
                <p className="text-xs text-zinc-500">{activity.subtitle}</p>
              </div>
              <span className="text-xs text-zinc-600">{activity.timestamp}</span>
            </div>
          );
        })}
        
        {/* Empty State */}
        {activities.length === 0 && (
          <div className="py-12 text-center">
            <Search size={32} className="mx-auto mb-3 text-zinc-600" />
            <p className="text-sm text-zinc-500">Keine Aktivität in den letzten 24h</p>
            <button className="mt-4 text-sm text-emerald-500 hover:text-emerald-400">
              Erste Analyse starten
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### B2.3: Quick Actions Zone

**Neue Datei:** `src/components/board/QuickActions.tsx`

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuickActionCard from './QuickActionCard';
import { Search, BarChart3, FileText, Upload, Share2 } from '@/lib/icons';

export default function QuickActions() {
  const navigate = useNavigate();
  
  const actions = [
    { id: 'analyze', label: 'New Analysis', icon: Search, target: '/analyze' },
    { id: 'chart', label: 'Open Chart', icon: BarChart3, target: '/chart' },
    { id: 'journal', label: 'Add Journal', icon: FileText, target: '/journal' },
    { id: 'import', label: 'Import Data', icon: Upload, target: '#import' },
    { id: 'share', label: 'Share Session', icon: Share2, target: '#share' },
  ];
  
  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-zinc-100 lg:hidden">Quick Actions</h2>
      
      {/* Mobile: Horizontal scroll-row */}
      <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden snap-x snap-mandatory">
        {actions.map(action => (
          <div key={action.id} className="flex-shrink-0 snap-center">
            <QuickActionCard
              {...action}
              onClick={() => navigate(action.target)}
              mobile
            />
          </div>
        ))}
      </div>
      
      {/* Desktop: Vertical stack */}
      <div className="hidden lg:block space-y-2">
        {actions.map(action => (
          <QuickActionCard
            key={action.id}
            {...action}
            onClick={() => navigate(action.target)}
          />
        ))}
      </div>
    </div>
  );
}
```

#### B2.4: Feed Zone

**Neue Datei:** `src/components/board/Feed.tsx`

```tsx
import React, { useState } from 'react';
import FeedItem from './FeedItem';
import { Bell, Save, Download, AlertTriangle } from '@/lib/icons';

interface FeedEvent {
  id: string;
  type: 'alert' | 'analysis' | 'export' | 'error';
  text: string;
  timestamp: number;
  unread: boolean;
}

export default function Feed() {
  const [filter, setFilter] = useState<'all' | 'alerts' | 'journal'>('all');
  
  // Mock data
  const events: FeedEvent[] = [
    { id: '1', type: 'alert', text: 'BTC > $50k erreicht', timestamp: Date.now() - 120000, unread: true },
    { id: '2', type: 'analysis', text: 'SOL 15m → Journal gespeichert', timestamp: Date.now() - 300000, unread: false },
    { id: '3', type: 'export', text: 'CSV exported (247 rows)', timestamp: Date.now() - 600000, unread: false },
  ];
  
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'journal', label: 'Journal' },
  ];
  
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-100">Activity</h2>
        
        {/* Filter Chips */}
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-2 py-1 text-xs transition-colors ${
                filter === f.id 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Feed Items */}
      <div className="space-y-0">
        {events.map(event => (
          <FeedItem key={event.id} {...event} />
        ))}
      </div>
      
      {/* Load More */}
      <button className="mt-3 w-full py-2 text-sm text-zinc-500 hover:text-zinc-300">
        Load more
      </button>
    </div>
  );
}
```

---

### B3: KPI Tile Design (2h)

**Neue Datei:** `src/components/board/KPITile.tsx`

```tsx
import React from 'react';
import { TrendingUp, TrendingDown, Bell, Wifi, Clock, BarChart3, FileText, Zap } from '@/lib/icons';

interface KPITileProps {
  type: 'numeric' | 'count' | 'status' | 'timestamp';
  label: string;
  value: string;
  trend?: string;
  direction: 'up' | 'down' | 'neutral';
  loading?: boolean;
  error?: boolean;
  onClick?: () => void;
}

export default function KPITile({
  type,
  label,
  value,
  trend,
  direction,
  loading = false,
  error = false,
  onClick,
}: KPITileProps) {
  const iconMap = {
    numeric: direction === 'up' ? TrendingUp : TrendingDown,
    count: Bell,
    status: Wifi,
    timestamp: Clock,
  };
  
  const Icon = iconMap[type];
  
  const colorMap = {
    up: 'text-emerald-500',
    down: 'text-rose-500',
    neutral: 'text-zinc-100',
  };
  
  if (loading) {
    return (
      <div className="border-b border-zinc-800 bg-zinc-900 p-3 md:border md:rounded-lg">
        <div className="h-4 w-16 animate-pulse bg-zinc-800 rounded" />
        <div className="mt-2 h-8 w-24 animate-pulse bg-zinc-800 rounded" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="border-b border-zinc-800 bg-zinc-900 p-3 md:border md:rounded-lg">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-zinc-600">N/A</p>
      </div>
    );
  }
  
  return (
    <div
      className={`border-b border-zinc-800 bg-zinc-900 p-3 transition-all md:border md:rounded-lg ${
        onClick ? 'cursor-pointer hover:bg-zinc-850' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        {Icon && <Icon size={16} className="text-zinc-600" />}
      </div>
      
      <div className="mt-2 flex items-end justify-between">
        <p className={`text-2xl font-semibold ${colorMap[direction]}`}>
          {value}
        </p>
        {trend && (
          <span className="text-xs text-zinc-500">{trend}</span>
        )}
      </div>
    </div>
  );
}
```

---

### B4: Quick Action Cards (1h)

**Neue Datei:** `src/components/board/QuickActionCard.tsx`

```tsx
import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  mobile?: boolean;
}

export default function QuickActionCard({
  label,
  icon: Icon,
  onClick,
  mobile = false,
}: QuickActionCardProps) {
  if (mobile) {
    // Mobile: 96x96px Card (icon-center, label-bottom)
    return (
      <button
        onClick={onClick}
        className="flex h-24 w-24 flex-col items-center justify-center gap-2 bg-zinc-900 transition-all active:scale-95"
        style={{
          borderRadius: 'var(--radius-lg)',
          transition: 'all var(--duration-short) var(--ease-in-out)',
        }}
      >
        <Icon size={24} className="text-zinc-300" />
        <span className="text-xs font-medium text-zinc-300">{label}</span>
      </button>
    );
  }
  
  // Desktop: Full-width Card (icon-left, label-left)
  return (
    <button
      onClick={onClick}
      className="flex h-20 w-full items-center gap-4 border border-zinc-800 bg-zinc-900 px-4 py-4 transition-all hover:bg-zinc-850 hover:scale-[1.02] active:scale-95"
      style={{
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-none)',
        transition: 'all var(--duration-short) var(--ease-in-out)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-none)';
      }}
    >
      <Icon size={24} className="text-zinc-300" />
      <span className="text-sm font-medium text-zinc-300">{label}</span>
    </button>
  );
}
```

---

## Phase C: Interaction & States (6-8h)

### C1: Feed Item Design (1-2h)

**Neue Datei:** `src/components/board/FeedItem.tsx`

```tsx
import React from 'react';
import { Bell, Save, Download, AlertTriangle, Search, FileText } from '@/lib/icons';

interface FeedItemProps {
  id: string;
  type: 'alert' | 'analysis' | 'journal' | 'export' | 'error';
  text: string;
  timestamp: number;
  unread: boolean;
  onClick?: () => void;
}

export default function FeedItem({
  type,
  text,
  timestamp,
  unread,
  onClick,
}: FeedItemProps) {
  const iconMap = {
    alert: { Icon: Bell, color: 'text-emerald-500' },
    analysis: { Icon: Search, color: 'text-cyan-500' },
    journal: { Icon: FileText, color: 'text-cyan-500' },
    export: { Icon: Download, color: 'text-zinc-400' },
    error: { Icon: AlertTriangle, color: 'text-rose-500' },
  };
  
  const { Icon, color } = iconMap[type];
  
  // Relative time
  const getRelativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  
  return (
    <div
      className={`flex items-start gap-3 border-b border-zinc-800/50 px-3 py-2 transition-colors ${
        unread ? 'border-l-2 border-l-emerald-500' : ''
      } ${onClick ? 'cursor-pointer hover:bg-zinc-900/50' : ''}`}
      onClick={onClick}
    >
      <Icon size={20} className={unread ? color : 'text-zinc-600'} />
      <div className="flex-1">
        <p className={`text-sm line-clamp-2 ${unread ? 'text-zinc-200' : 'text-zinc-400'}`}>
          {text}
        </p>
      </div>
      <span className="font-mono text-xs text-zinc-600">
        {getRelativeTime(timestamp)}
      </span>
    </div>
  );
}
```

---

### C2: Empty/Loading/Error States (2h)

**Neue Datei:** `src/components/ui/EmptyState.tsx`

```tsx
import React from 'react';
import type { LucideIcon } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  subtext: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon,
  heading,
  subtext,
  cta,
}: EmptyStateProps) {
  return (
    <div className="py-12 text-center md:py-16">
      <Icon size={32} className="mx-auto mb-3 text-zinc-600" />
      <h3 className="text-base font-semibold text-zinc-300">{heading}</h3>
      <p className="mt-1 text-sm text-zinc-500">{subtext}</p>
      {cta && (
        <Button onClick={cta.onClick} className="mt-4">
          {cta.label}
        </Button>
      )}
    </div>
  );
}
```

**Neue Datei:** `src/components/ui/Skeleton.tsx`

```tsx
import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export default function Skeleton({
  className = '',
  width = 'w-full',
  height = 'h-4',
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-zinc-800 ${width} ${height} ${className}`}
      style={{ borderRadius: 'var(--radius-sm)' }}
    />
  );
}

// Skeleton Variants
export function KPITileSkeleton() {
  return (
    <div className="border-b border-zinc-800 bg-zinc-900 p-3 md:border md:rounded-lg">
      <Skeleton width="w-16" height="h-4" />
      <Skeleton width="w-24" height="h-8" className="mt-2" />
    </div>
  );
}

export function FeedItemSkeleton() {
  return (
    <div className="flex items-start gap-3 border-b border-zinc-800/50 px-3 py-2">
      <Skeleton width="w-5" height="h-5" className="rounded-full" />
      <Skeleton width="w-3/4" height="h-4" />
      <Skeleton width="w-12" height="h-3" />
    </div>
  );
}
```

**Neue Datei:** `src/components/ui/ErrorState.tsx`

```tsx
import React from 'react';
import { AlertTriangle } from '@/lib/icons';
import Button from './Button';

interface ErrorStateProps {
  message: string;
  subtext?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message,
  subtext,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="py-8 text-center md:py-12">
      <AlertTriangle size={32} className="mx-auto mb-3 text-rose-500" />
      <h3 className="text-sm font-medium text-zinc-300">{message}</h3>
      {subtext && (
        <p className="mt-1 text-xs text-zinc-500">{subtext}</p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" className="mt-4">
          Erneut versuchen
        </Button>
      )}
    </div>
  );
}
```

---

### C3: Navigation Model (2-3h)

#### C3.1: BottomNav (Mobile)

**Anpassung:** `src/components/BottomNav.tsx` (bereits vorhanden, Update)

```tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, BarChart3, FileText, MoreHorizontal } from '@/lib/icons';

export default function BottomNav() {
  const navItems = [
    { path: '/', label: 'Board', icon: Home },
    { path: '/analyze', label: 'Analyze', icon: Search },
    { path: '/chart', label: 'Chart', icon: BarChart3 },
    { path: '/journal', label: 'Journal', icon: FileText },
    { path: '/settings', label: 'More', icon: MoreHorizontal }, // Opens sheet with Replay, Access, Notifications, Settings
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950 lg:hidden">
      <div className="flex justify-around">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 transition-colors ${
                isActive
                  ? 'border-t-2 border-emerald-500 text-emerald-500'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`
            }
          >
            <item.icon size={24} />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
```

#### C3.2: Sidebar (Desktop)

**Neue Datei:** `src/components/Sidebar.tsx`

```tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, BarChart3, FileText, Clock, Lock, Bell, Settings } from '@/lib/icons';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Board', icon: Home },
    { path: '/analyze', label: 'Analyze', icon: Search },
    { path: '/chart', label: 'Chart', icon: BarChart3 },
    { path: '/journal', label: 'Journal', icon: FileText },
    { path: '/replay', label: 'Replay', icon: Clock },
    { path: '/access', label: 'Access', icon: Lock },
    { path: '/notifications', label: 'Alerts', icon: Bell },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];
  
  return (
    <aside
      className={`hidden lg:block fixed left-0 top-0 h-screen border-r border-zinc-800 bg-zinc-950 transition-all ${
        expanded ? 'w-48' : 'w-16'
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex flex-col gap-2 p-2">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 transition-colors ${
                isActive
                  ? 'border-l-2 border-emerald-500 bg-zinc-900 text-emerald-500'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300'
              }`
            }
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <item.icon size={24} />
            {expanded && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
```

**Anpassung:** `src/components/layout/Layout.tsx`

```tsx
import Sidebar from '../Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="lg:ml-16"> {/* Offset für Sidebar */}
        {children}
      </div>
      <BottomNav />
    </>
  );
}
```

#### C3.3: Swipe Navigation

**Neue Datei:** `src/lib/swipe-nav.ts`

```typescript
// Global Swipe Navigation (Left/Right)

export function initSwipeNavigation() {
  let touchStartX = 0;
  let touchStartY = 0;
  const EDGE_THRESHOLD = 40; // 40px from edge
  const SWIPE_THRESHOLD = 50; // min swipe distance
  
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  
  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Check if edge-swipe (< 40px from edge)
    const isEdgeSwipe = touchStartX < EDGE_THRESHOLD || touchStartX > window.innerWidth - EDGE_THRESHOLD;
    
    // Check if horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD && isEdgeSwipe) {
      if (deltaX > 0) {
        // Swipe right → Previous page
        console.log('Swipe right: Previous page');
        // TODO: Implement page navigation (history.back() or custom logic)
      } else {
        // Swipe left → Next page
        console.log('Swipe left: Next page');
        // TODO: Implement page navigation
      }
    }
  });
}
```

**Anpassung:** `src/main.tsx`

```tsx
import { initSwipeNavigation } from './lib/swipe-nav';

initializeLayoutToggles();
initSwipeNavigation(); // Add swipe nav

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### C4: Motion & Transitions (1h)

**Neue Datei:** `src/styles/motion.css`

```css
/* Motion & Transitions */

/* Duration ranges (CSS Custom Properties bereits in tokens.css) */
/* --duration-micro: 75ms */
/* --duration-short: 150ms */
/* --duration-medium: 250ms */
/* --duration-long: 350ms */

/* Easing (bereits in tokens.css) */
/* --ease-in: cubic-bezier(0.4, 0, 1, 1) */
/* --ease-out: cubic-bezier(0, 0, 0.2, 1) */
/* --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1) */

/* Animation Classes */
.transition-micro {
  transition-duration: var(--duration-micro);
  transition-timing-function: var(--ease-in-out);
}

.transition-short {
  transition-duration: var(--duration-short);
  transition-timing-function: var(--ease-in-out);
}

.transition-medium {
  transition-duration: var(--duration-medium);
  transition-timing-function: var(--ease-out);
}

.transition-long {
  transition-duration: var(--duration-long);
  transition-timing-function: var(--ease-out);
}

/* Skeleton Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 1.5s var(--ease-in-out) infinite;
}

/* Modal/Toast Enter */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn var(--duration-medium) var(--ease-out);
}

/* Toast Slide-in (Right) */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-right {
  animation: slideInRight var(--duration-medium) var(--ease-out);
}

/* Reduce Motion (bereits in tokens.css) */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse,
  .animate-fade-in,
  .animate-slide-in-right {
    animation: none !important;
  }
}
```

**Anpassung:** `src/styles/App.css`

```css
@import './tokens.css';
@import './fonts.css';
@import './motion.css';

/* Rest bleibt gleich */
```

---

## Phase D: Data & API (6-8h)

### D1: API Integration (bereits abgeschlossen ✅)

**Status:**
- ✅ Moralis API Proxy (`/api/moralis/token/[address].ts`)
- ✅ Dexpaprika API Proxy (`/api/dexpaprika/tokens/[address].ts`)
- ✅ OHLC Endpoint mit Moralis-Hierarchie (`/api/data/ohlc.ts`)
- ✅ API Config (`src/lib/api-config.ts`)

**Nächste Schritte:**
- Combobox-Integration (Token-Search mit Watchlist + Moralis/Dexpaprika)

---

### D2: API Schema (3-4h)

#### D2.1: KPI Endpoint

**Neue Datei:** `api/board/kpis.ts`

```typescript
/**
 * Board KPIs Endpoint
 * GET /api/board/kpis
 * Returns 11 KPIs for Board Overview
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface BoardKPIsResponse {
  success: boolean;
  data: {
    // Core KPIs
    todayPnL: {
      value: number;
      trend: number;
      direction: 'up' | 'down' | 'neutral';
    };
    activeAlerts: {
      count: number;
      triggered: number;
    };
    winRate7d: {
      value: number;
      trades: number;
      direction: 'up' | 'down' | 'neutral';
    };
    syncStatus: {
      online: boolean;
      lastSync: number;
      provider: 'moralis' | 'dexpaprika' | 'offline';
    };
    
    // Extended KPIs
    activeCharts: {
      count: number;
      symbols: string[];
    };
    journalEntries: {
      today: number;
      total: number;
    };
    topMover: {
      symbol: string;
      change: number;
      direction: 'up' | 'down';
      ca: string;
    };
    
    // Optional KPIs
    drawingsCount?: number;
    avgTradeDuration?: number;
    watchlistSize?: number;
    lastAnalysis?: {
      symbol: string;
      timeframe: string;
      timestamp: number;
      ca: string;
    };
  };
  timestamp: number;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    // TODO: Fetch real data from IndexedDB/API
    // Mock data for now
    const data: BoardKPIsResponse['data'] = {
      todayPnL: { value: 247.50, trend: 12.5, direction: 'up' },
      activeAlerts: { count: 3, triggered: 1 },
      winRate7d: { value: 68, trades: 12, direction: 'up' },
      syncStatus: { online: true, lastSync: Date.now() - 120000, provider: 'moralis' },
      activeCharts: { count: 2, symbols: ['BTC', 'SOL'] },
      journalEntries: { today: 3, total: 127 },
      topMover: { symbol: 'SOL', change: 8.5, direction: 'up', ca: '7xKF...abc' },
      drawingsCount: 5,
      avgTradeDuration: 15780, // seconds (4h 23m)
      watchlistSize: 12,
      lastAnalysis: { symbol: 'SOL', timeframe: '15m', timestamp: Date.now() - 300000, ca: '7xKF...abc' },
    };
    
    return res.status(200).json({
      success: true,
      data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Board KPIs] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
```

#### D2.2: Feed Endpoint

**Neue Datei:** `api/board/feed.ts`

```typescript
/**
 * Board Feed Endpoint
 * GET /api/board/feed?limit=20&offset=0
 * Returns Activity Feed events
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface FeedEvent {
  id: string;
  type: 'alert' | 'analysis' | 'journal' | 'export' | 'error';
  icon: string;
  text: string;
  timestamp: number;
  unread: boolean;
  metadata?: {
    ca?: string;
    symbol?: string;
    alertId?: string;
    journalId?: string;
  };
  action?: {
    type: 'navigate' | 'download' | 'external';
    target: string;
  };
}

interface FeedResponse {
  success: boolean;
  data: FeedEvent[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  
  try {
    // TODO: Fetch real data from IndexedDB
    // Mock data for now
    const mockEvents: FeedEvent[] = [
      {
        id: '1',
        type: 'alert',
        icon: 'Bell',
        text: 'BTC > $50k erreicht',
        timestamp: Date.now() - 120000,
        unread: true,
        metadata: { symbol: 'BTC', alertId: 'alert-123' },
        action: { type: 'navigate', target: '/notifications' },
      },
      {
        id: '2',
        type: 'analysis',
        icon: 'Search',
        text: 'SOL 15m → Journal gespeichert',
        timestamp: Date.now() - 300000,
        unread: false,
        metadata: { symbol: 'SOL', ca: '7xKF...abc' },
        action: { type: 'navigate', target: '/journal' },
      },
      {
        id: '3',
        type: 'export',
        icon: 'Download',
        text: 'CSV exported (247 rows)',
        timestamp: Date.now() - 600000,
        unread: false,
        metadata: {},
        action: { type: 'download', target: '/exports/analysis-123.csv' },
      },
    ];
    
    const total = mockEvents.length;
    const data = mockEvents.slice(offset, offset + limit);
    
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[Board Feed] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
```

#### D2.3: IndexedDB Schema

**Neue Datei:** `src/lib/db-schema.ts`

```typescript
/**
 * IndexedDB Schema (Dexie)
 * Stores Board KPIs, Feed Events, and cached API data
 */

import Dexie, { Table } from 'dexie';

// Board KPI (Single row, always ID 'latest')
export interface BoardKPI {
  id: 'latest';
  todayPnL: number;
  activeAlerts: number;
  winRate7d: number;
  lastSync: number;
  lastAnalysis: string;
  updatedAt: number;
}

// Feed Event
export interface FeedEventDB {
  id: string;
  type: 'alert' | 'analysis' | 'journal' | 'export' | 'error';
  icon: string;
  text: string;
  timestamp: number;
  unread: boolean;
  metadata?: any;
  action?: {
    type: 'navigate' | 'download' | 'external';
    target: string;
  };
}

// Watchlist Token
export interface WatchlistToken {
  ca: string; // Primary key
  symbol: string;
  name: string;
  logo?: string;
  addedAt: number;
}

class BoardDatabase extends Dexie {
  boardKPIs!: Table<BoardKPI, string>;
  feedEvents!: Table<FeedEventDB, string>;
  watchlist!: Table<WatchlistToken, string>;
  
  constructor() {
    super('SparkfinedBoardDB');
    
    this.version(1).stores({
      boardKPIs: 'id',
      feedEvents: 'id, timestamp, unread, type',
      watchlist: 'ca, symbol, addedAt',
    });
  }
}

export const db = new BoardDatabase();

// Helper functions
export async function updateBoardKPIs(kpis: Omit<BoardKPI, 'id' | 'updatedAt'>) {
  await db.boardKPIs.put({
    id: 'latest',
    ...kpis,
    updatedAt: Date.now(),
  });
}

export async function getBoardKPIs(): Promise<BoardKPI | undefined> {
  return db.boardKPIs.get('latest');
}

export async function addFeedEvent(event: Omit<FeedEventDB, 'id'>) {
  const id = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await db.feedEvents.add({ id, ...event });
}

export async function getFeedEvents(limit = 20, offset = 0): Promise<FeedEventDB[]> {
  return db.feedEvents
    .orderBy('timestamp')
    .reverse()
    .offset(offset)
    .limit(limit)
    .toArray();
}

export async function markFeedEventRead(id: string) {
  await db.feedEvents.update(id, { unread: false });
}
```

**Anpassung:** `package.json` (Dexie schon vorhanden ✅)

```json
{
  "dependencies": {
    "dexie": "^3.2.0"
  }
}
```

---

### D3: Client-Side Data Fetching (2-3h)

**Neue Datei:** `src/hooks/useBoardKPIs.ts`

```typescript
import { useState, useEffect } from 'react';
import { getBoardKPIs, updateBoardKPIs } from '@/lib/db-schema';

interface BoardKPIs {
  todayPnL: { value: number; trend: number; direction: 'up' | 'down' | 'neutral' };
  activeAlerts: { count: number; triggered: number };
  winRate7d: { value: number; trades: number; direction: 'up' | 'down' | 'neutral' };
  syncStatus: { online: boolean; lastSync: number; provider: 'moralis' | 'dexpaprika' | 'offline' };
  activeCharts: { count: number; symbols: string[] };
  journalEntries: { today: number; total: number };
  topMover: { symbol: string; change: number; direction: 'up' | 'down'; ca: string };
}

export function useBoardKPIs() {
  const [kpis, setKpis] = useState<BoardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchKPIs() {
      try {
        setLoading(true);
        
        // 1. Check IndexedDB cache
        const cached = await getBoardKPIs();
        if (cached && Date.now() - cached.updatedAt < 30000) {
          // Cache valid (< 30s old)
          setKpis(cached as any); // TODO: Proper type mapping
          setLoading(false);
          return;
        }
        
        // 2. Fetch from API
        const response = await fetch('/api/board/kpis');
        const json = await response.json();
        
        if (!json.success) {
          throw new Error(json.error || 'Failed to fetch KPIs');
        }
        
        setKpis(json.data);
        
        // 3. Update IndexedDB cache
        await updateBoardKPIs({
          todayPnL: json.data.todayPnL.value,
          activeAlerts: json.data.activeAlerts.count,
          winRate7d: json.data.winRate7d.value,
          lastSync: json.data.syncStatus.lastSync,
          lastAnalysis: json.data.lastAnalysis?.symbol || '',
        });
        
        setLoading(false);
      } catch (err) {
        console.error('[useBoardKPIs] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
        
        // Fallback to cached data (even if stale)
        const cached = await getBoardKPIs();
        if (cached) {
          setKpis(cached as any);
        }
      }
    }
    
    fetchKPIs();
  }, []);
  
  return { kpis, loading, error };
}
```

**Neue Datei:** `src/hooks/useBoardFeed.ts`

```typescript
import { useState, useEffect } from 'react';
import { getFeedEvents, addFeedEvent, markFeedEventRead } from '@/lib/db-schema';
import type { FeedEventDB } from '@/lib/db-schema';

export function useBoardFeed(limit = 20) {
  const [events, setEvents] = useState<FeedEventDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchFeed() {
      try {
        setLoading(true);
        
        // 1. Load cached events from IndexedDB
        const cached = await getFeedEvents(limit, 0);
        if (cached.length > 0) {
          setEvents(cached);
          setLoading(false);
        }
        
        // 2. Fetch fresh data from API
        const response = await fetch(`/api/board/feed?limit=${limit}&offset=0`);
        const json = await response.json();
        
        if (!json.success) {
          throw new Error(json.error || 'Failed to fetch feed');
        }
        
        setEvents(json.data);
        
        // 3. Update IndexedDB (merge new events)
        for (const event of json.data) {
          // Check if event exists, if not add
          const exists = await getFeedEvents(1, 0).then(e => e.some(ev => ev.id === event.id));
          if (!exists) {
            await addFeedEvent(event);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('[useBoardFeed] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }
    
    fetchFeed();
  }, [limit]);
  
  const markAsRead = async (id: string) => {
    await markFeedEventRead(id);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, unread: false } : e));
  };
  
  return { events, loading, error, markAsRead };
}
```

**Anpassung:** `src/components/board/Overview.tsx`

```tsx
import { useBoardKPIs } from '@/hooks/useBoardKPIs';
import { KPITileSkeleton } from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';

export default function Overview() {
  const { kpis, loading, error } = useBoardKPIs();
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[...Array(4)].map((_, i) => <KPITileSkeleton key={i} />)}
      </div>
    );
  }
  
  if (error || !kpis) {
    return <ErrorState message="Fehler beim Laden der KPIs" subtext={error || undefined} />;
  }
  
  // Rest bleibt gleich, nutze kpis.todayPnL, kpis.activeAlerts, etc.
}
```

**Anpassung:** `src/components/board/Feed.tsx`

```tsx
import { useBoardFeed } from '@/hooks/useBoardFeed';
import { FeedItemSkeleton } from '@/components/ui/Skeleton';

export default function Feed() {
  const { events, loading, error, markAsRead } = useBoardFeed(20);
  
  if (loading) {
    return (
      <div>
        {[...Array(5)].map((_, i) => <FeedItemSkeleton key={i} />)}
      </div>
    );
  }
  
  // Rest bleibt gleich, nutze events.map(...)
}
```

---

## Zusammenfassung

**Phase A: Foundation (4-6h)**
- Design Tokens (Colors, Spacing, Radius, Shadows, Layout-Toggle, OLED-Mode)
- Typography (JetBrains Mono für CA/Journal, System-Font für UI)
- Component Primitives (Button, Input, Textarea, Select)
- Icon System (Lucide Icons, 30 Basis-Set)
- Layout-Toggle (Rund/Eckig + OLED-Modus)

**Phase B: Board Layout (8-10h)**
- Grid & Breakpoints (Mobile 1col, Tablet 2col, Desktop 3col)
- Board Zones (Overview, Focus, Quick Actions, Feed)
- KPI Tile Design (11 KPI-Types, Loading/Error States)
- Quick Action Cards (Mobile horizontal scroll, Desktop sidebar)

**Phase C: Interaction & States (6-8h)**
- Feed Item Design (Unread-State, Relative Time, Clickable)
- Empty/Loading/Error States (Skeletons, Illustrations, Retry)
- Navigation Model (BottomNav mobile, Sidebar desktop, Swipe-Nav)
- Motion & Transitions (Durations, Easing, Reduce-Motion)

**Phase D: Data & API (6-8h)**
- API Integration (✅ Moralis/Dexpaprika Hierarchie)
- API Schema (KPI Endpoint, Feed Endpoint, IndexedDB Schema)
- Client-Side Data Fetching (Custom Hooks, Cache-First Strategy)

**Total: 24-32h (~3-4 Tage FTE)**

---

## Nächste Schritte

1. **Phase A starten:** Design Tokens + Typography + Primitives
2. **Nach Phase B:** Board Layout testen (Mobile + Desktop)
3. **Nach Phase C:** Navigation + Motion testen
4. **Nach Phase D:** Daten anbinden, Offline-Test

**Dann weiter mit:**
- **Thema 15:** Offline Strategy (Service Worker, Cache, Background Sync)
- **Thema 16:** A11y Final Pass (11 erweiterte Checks — siehe unten)
- **Moralis Cortex:** First Update (AI-Features)

---

## Phase E: Offline & A11y (10-15h)

### E1: Offline Strategy (3-4h)

**Ziel:** Service Worker mit Cache-Strategien, Background Sync

**Anpassung:** `vite.config.ts` (vite-plugin-pwa bereits vorhanden)

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/board\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'board-api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 30 },
            },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/(moralis|dexpaprika)\/.*/,
            handler: 'NetworkFirst',
            options: { cacheName: 'external-api-cache', networkTimeoutSeconds: 5 },
          },
        ],
      },
    }),
  ],
});
```

### E2: A11y Final Pass — 11 Checks (7-11h)

**Check 1-6:** Basis (Focus, ARIA, Keyboard, Screen Reader, Contrast, Touch)
**Check 7:** Automated Tests (Playwright + axe-core) — 2-3h
**Check 8:** Text Scaling (200% Zoom, rem statt px) — 1-2h
**Check 9:** Chart A11y (ARIA-Table, Keyboard-Nav) — 8-12h
**Check 10:** Form Validation (Inline + Summary) — 2-3h
**Check 11:** High Contrast Mode (@media prefers-contrast) — 1h

**Automated Test Setup:**

```bash
npm install --save-dev @axe-core/playwright
```

**Neue Datei:** `tests/a11y/board.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Board has no WCAG AA violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
});
```

---

## Finale Zusammenfassung

**Phase A-E Komplett:**
- **A:** Foundation (Design Tokens, Typography, Primitives, Icons) — 4-6h
- **B:** Board Layout (Grid, Zones, KPI Tiles, Quick Actions) — 8-10h
- **C:** Interaction (Feed Items, States, Navigation, Motion) — 6-8h
- **D:** Data & API (Integration, Schema, Hooks) — 6-8h
- **E:** Offline & A11y (Service Worker, 11 A11y-Checks) — 10-15h

**Total: 34-47h (~4-6 Tage FTE)**

**Deliverables:**
- ✅ 16 Themen abgeschlossen (Foundation → A11y)
- ✅ Responsive Board (Mobile/Tablet/Desktop)
- ✅ 11 KPIs + Feed + Quick Actions
- ✅ Offline-fähig (Service Worker, IndexedDB)
- ✅ WCAG 2.1 AA compliant (11 A11y-Checks)
- ✅ API-Integration (Moralis → Dexpaprika → Dexscreener)

**Next Steps:**
1. **Phase A starten:** Design Tokens + Primitives
2. **Phase B-D:** Board Layout + Data
3. **Phase E:** Offline + A11y Tests
4. **First Update:** Moralis Cortex (AI-Features)

---

**Ende des Plans**
