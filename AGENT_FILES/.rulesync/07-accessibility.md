---
mode: SYSTEM
id: "07-accessibility"
priority: 3
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode"]
globs: ["src/**/*.tsx", "src/components/**/*"]
description: "Accessibility standards: ARIA patterns, keyboard navigation, semantic HTML, and jsx-a11y rules for Sparkfined"
---

# 07 – Accessibility (A11y)

## 1. Principles (WCAG 2.1 AA)

Sparkfined strebt **WCAG 2.1 Level AA** Compliance an mit Fokus auf die 4 Core-Prinzipien:

1. **Perceivable:** Informationen und UI-Komponenten müssen für User wahrnehmbar sein
2. **Operable:** UI-Komponenten und Navigation müssen bedienbar sein
3. **Understandable:** Informationen und UI-Bedienung müssen verständlich sein
4. **Robust:** Content muss robust genug sein, um von verschiedenen User-Agents (inkl. Assistive-Tech) interpretiert zu werden

### Trading-App-Spezifische A11y-Herausforderungen

* **Chart-Visualisierungen:** Canvas-Charts sind für Screen-Reader nicht zugänglich → Textuelle Alternativen nötig
* **Real-Time-Updates:** Live-Preise/KPIs müssen ankündigbar sein ohne zu spammen
* **Color-Coded-Data:** Bullish/Bearish via Grün/Rot → zusätzliche Icons/Patterns nötig
* **Dense-Information-Layouts:** Viele Daten auf kleinem Raum → klare Landmarks & Navigation

---

## 2. MUST Rules (Blocking)

### Semantic HTML

**[MUST]** Nutze semantische HTML-Elemente statt generischer `<div>` / `<span>`

```tsx
// ✅ Good: Semantisches HTML
<article className="kpi-tile">
  <header>
    <h3>Market Cap</h3>
  </header>
  <section>
    <p>$1.2M</p>
  </section>
</article>

<nav>
  <ul>
    <li><a href="/board">Board</a></li>
    <li><a href="/analyze">Analyze</a></li>
  </ul>
</nav>

// ❌ Avoid: Div-Soup
<div className="kpi-tile">
  <div>
    <div>Market Cap</div>
  </div>
  <div>
    <div>$1.2M</div>
  </div>
</div>

<div>
  <div onClick={() => navigate('/board')}>Board</div>
  <div onClick={() => navigate('/analyze')}>Analyze</div>
</div>
```

### Labels & ARIA-Labels

**[MUST]** Alle Form-Inputs brauchen Labels

```tsx
// ✅ Good: Explizites Label
<label htmlFor="token-address">Token Address</label>
<input id="token-address" type="text" name="address" />

// ✅ Good: ARIA-Label für Icon-Only-Buttons
<button
  onClick={onDelete}
  aria-label="Delete journal entry"
>
  <TrashIcon className="w-5 h-5" />
</button>

// ❌ Avoid: Input ohne Label
<input type="text" placeholder="Enter address..." />  // Screen-Reader weiß nicht, wofür das ist

// ❌ Avoid: Icon-Button ohne ARIA
<button onClick={onRefresh}>
  <RefreshIcon />  // Was macht dieser Button?
</button>
```

### Keyboard-Navigation

**[MUST]** Alle interaktiven Elemente müssen per Keyboard bedienbar sein

```tsx
// ✅ Good: Button mit nativer Keyboard-Unterstützung
<button onClick={handleSave}>Save</button>

// ✅ Good: Custom-Interactive mit Keyboard-Support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>

// ❌ Avoid: Div ohne Keyboard-Support
<div onClick={handleClick}>
  Click me  // Nicht fokussierbar, kein Enter-Support
</div>
```

### Focus-Management

**[MUST]** Implementiere Focus-Trap in Modals

```tsx
// ✅ Good: Modal mit Focus-Trap
import { useFocusTrap } from '@/hooks/useFocusTrap';

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      const previousFocus = document.activeElement as HTMLElement;

      // Return focus on close
      return () => {
        previousFocus?.focus();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">Modal Title</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

### Contrast-Ratio

**[MUST]** Text muss mindestens 4.5:1 Contrast zu Background haben (WCAG AA)

```tsx
// ✅ Good: Ausreichender Kontrast
<p className="text-gray-900 dark:text-gray-100">  // 21:1 Contrast
  Content
</p>

<button className="bg-purple-600 text-white">  // 8.6:1 Contrast
  Primary Action
</button>

// ❌ Avoid: Zu niedriger Kontrast
<p className="text-gray-400">  // 2.5:1 auf weißem BG (fails WCAG AA)
  Low contrast text
</p>
```

**Tool:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 3. SHOULD Rules (Empfohlen)

### ARIA-Landmarks

**[SHOULD]** Nutze ARIA-Landmarks für Screen-Reader-Navigation

```tsx
// ✅ Good: Klare Landmarks
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    {/* Nav-Items */}
  </nav>
</header>

<main role="main" id="main-content">
  <section aria-labelledby="kpi-section-title">
    <h2 id="kpi-section-title">KPI Dashboard</h2>
    {/* KPIs */}
  </section>
</main>

<aside role="complementary" aria-label="Recent alerts">
  {/* Sidebar-Content */}
</aside>

<footer role="contentinfo">
  {/* Footer-Links */}
</footer>
```

**Standard-Landmarks:**
- `<header>` → `role="banner"`
- `<nav>` → `role="navigation"`
- `<main>` → `role="main"`
- `<aside>` → `role="complementary"`
- `<footer>` → `role="contentinfo"`
- `<form>` → `role="form"` (implizit)
- `<section>` → `role="region"` (mit `aria-labelledby`)

### Skip-Links

**[SHOULD]** Implementiere Skip-to-Main-Content-Link

```tsx
// ✅ Good: Skip-Link (in src/App.tsx bereits vorhanden)
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-white"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Content */}
</main>
```

**Rationale:** Keyboard-User können direkt zum Content springen ohne durch Nav zu tabben.

### Live-Regions für Updates

**[SHOULD]** Nutze `aria-live` für dynamische Inhalte

```tsx
// ✅ Good: Live-Region für KPI-Updates
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {kpiUpdateAnnouncement}
</div>

// Usage
const [kpiUpdateAnnouncement, setKpiUpdateAnnouncement] = useState('');

useEffect(() => {
  if (newKPI) {
    setKpiUpdateAnnouncement(`Market cap updated to ${newKPI.value}`);
    setTimeout(() => setKpiUpdateAnnouncement(''), 3000);
  }
}, [newKPI]);
```

**Live-Region-Typen:**
- `aria-live="polite"` → Announce nach aktueller Task (für KPIs, Feed-Updates)
- `aria-live="assertive"` → Announce sofort (für Errors, Critical-Alerts)
- `aria-live="off"` → Keine Announcements (default)

### Beschreibende Link-Texte

**[SHOULD]** Link-Texte müssen kontextunabhängig verständlich sein

```tsx
// ✅ Good: Beschreibend
<a href="/journal">View trading journal</a>
<a href="/analyze?address=...">Analyze SOL/USDC token</a>

// ❌ Avoid: Kontextlos
<a href="/journal">Click here</a>  // "Click here" ist nicht aussagekräftig
<a href="/analyze">More</a>  // "More" zu generisch
```

---

## 4. MAY Rules (Nice-to-Have)

### ARIA-Beschreibungen

**[MAY]** Nutze `aria-describedby` für zusätzliche Kontext-Informationen

```tsx
// ✅ Good: Zusätzliche Beschreibung
<label htmlFor="risk-percent">Risk per Trade (%)</label>
<input
  id="risk-percent"
  type="number"
  aria-describedby="risk-hint"
/>
<p id="risk-hint" className="text-sm text-gray-500">
  Recommended: 1-2% of account balance
</p>
```

### Reduced-Motion

**[MAY]** Respektiere `prefers-reduced-motion` für Animationen

```tsx
// ✅ Good: Animation nur wenn User OK damit
<div className="
  transition-all duration-300
  motion-reduce:transition-none
">
  Animated content
</div>
```

```css
/* Tailwind-Config: motion-reduce-Variante ist bereits aktiv */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. jsx-a11y Lint-Rules

Sparkfined nutzt **eslint-plugin-jsx-a11y** mit Warnings (nicht Errors, um Dev-Flow nicht zu blocken):

### Aktive Rules (als Warnings)

```js
// eslint.config.js
rules: {
  'jsx-a11y/alt-text': 'warn',                      // Bilder brauchen alt-Text
  'jsx-a11y/anchor-has-content': 'warn',            // Links brauchen Content
  'jsx-a11y/anchor-is-valid': 'warn',               // Valide href-Attribute
  'jsx-a11y/aria-props': 'warn',                    // Valide ARIA-Props
  'jsx-a11y/aria-role': 'warn',                     // Valide ARIA-Roles
  'jsx-a11y/aria-unsupported-elements': 'warn',     // ARIA auf unterstützten Elements
  'jsx-a11y/heading-has-content': 'warn',           // Headings nicht leer
  'jsx-a11y/html-has-lang': 'warn',                 // <html lang="...">
  'jsx-a11y/img-redundant-alt': 'warn',             // alt="image" vermeiden
  'jsx-a11y/no-autofocus': 'off',                   // Autofocus erlaubt in Modals
  'jsx-a11y/role-has-required-aria-props': 'warn',  // Required ARIA-Props bei Roles
}
```

**Rationale für Warnings (nicht Errors):**
- A11y-Fixes sollen nicht Dev-Flow blocken
- Warnings werden in Reviews sichtbar
- CI kann bei zu vielen Warnings warnen (geplant)

**[SHOULD]** Fixe jsx-a11y-Warnings vor PR-Merge (Best-Effort)

---

## 6. Testing A11y

### Automated-A11y-Tests (Playwright + @axe-core)

**[SHOULD]** Integriere axe-core in E2E-Tests

```ts
// tests/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage has no critical a11y violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('journal page keyboard-navigable', async ({ page }) => {
    await page.goto('/journal');

    // Tab durch alle interaktiven Elemente
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('href', '/board');

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText('New Entry');
  });
});
```

### Manual-Testing-Checklist

**[SHOULD]** Manuelles A11y-Testing vor Major-Releases

```
☐ Keyboard-Navigation:
  - Tab durch alle interaktiven Elemente
  - Enter/Space aktiviert Buttons/Links
  - Escape schließt Modals
  - Arrow-Keys navigieren in Listen/Dropdowns

☐ Screen-Reader-Test (NVDA/JAWS/VoiceOver):
  - Landmarks werden angekündigt
  - Form-Labels werden gelesen
  - Live-Regions announcements funktionieren
  - Button-/Link-Zweck ist klar

☐ Zoom-Test (bis 200%):
  - Layout bricht nicht
  - Text ist lesbar
  - Keine überlappenden Elemente

☐ Kontrast-Check:
  - Text ≥4.5:1 (Normal-Text)
  - Text ≥3:1 (Large-Text ≥18pt)
  - UI-Components ≥3:1

☐ Color-Blind-Simulation:
  - Bullish/Bearish nicht nur via Farbe
  - Icons/Patterns als Redundanz
```

**Tools:**
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- Chrome DevTools Lighthouse (A11y-Audit)
- [axe DevTools](https://www.deque.com/axe/devtools/)

---

## 7. Chart-A11y (Canvas-Charts)

**Problem:** Canvas-Charts sind für Screen-Reader nicht zugänglich.

**Lösungen:**

### Data-Table-Alternative

**[SHOULD]** Biete textuelle Alternative für Chart-Daten

```tsx
// src/sections/chart/ChartPage.tsx
<div>
  <canvas ref={canvasRef} aria-label="Price chart" />
  
  {/* Screen-Reader-Only Data-Table */}
  <div className="sr-only">
    <h3>OHLC Data Table</h3>
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Open</th>
          <th>High</th>
          <th>Low</th>
          <th>Close</th>
          <th>Volume</th>
        </tr>
      </thead>
      <tbody>
        {ohlcData.map(candle => (
          <tr key={candle.timestamp}>
            <td>{formatTime(candle.timestamp)}</td>
            <td>{candle.open}</td>
            <td>{candle.high}</td>
            <td>{candle.low}</td>
            <td>{candle.close}</td>
            <td>{candle.volume}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

### Summary-Announcement

**[MAY]** Announce Chart-Key-Metrics via Live-Region

```tsx
const chartSummary = useMemo(() => {
  if (!ohlcData.length) return '';
  
  const latest = ohlcData[ohlcData.length - 1];
  const change = ((latest.close - ohlcData[0].open) / ohlcData[0].open) * 100;
  
  return `Current price: ${latest.close}. ${change > 0 ? 'Up' : 'Down'} ${Math.abs(change).toFixed(2)}% in selected timeframe.`;
}, [ohlcData]);

<div aria-live="polite" className="sr-only">
  {chartSummary}
</div>
```

---

## 8. Examples

### ✅ Good – Complete Accessible-Component

```tsx
// src/components/ui/Modal.tsx
import { useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  // Return focus on close
  useEffect(() => {
    if (isOpen) {
      const previousFocus = document.activeElement as HTMLElement;
      return () => {
        previousFocus?.focus();
      };
    }
  }, [isOpen]);

  // ESC-Key closes modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}  // Click outside closes
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}  // Prevent close on content click
      >
        <header className="flex justify-between items-start mb-4">
          <h2 id="modal-title" className="text-xl font-bold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        <div>{children}</div>
      </div>
    </div>
  );
}
```

### ❌ Avoid – A11y-Violations

```tsx
// ❌ Bad: Div als Button (nicht fokussierbar, kein Keyboard-Support)
<div onClick={handleSave} className="button-style">
  Save
</div>

// ❌ Bad: Image ohne alt-Text
<img src="/logo.png" />

// ❌ Bad: Custom-Input ohne Label
<input type="text" placeholder="Enter address..." />

// ❌ Bad: Niedriger Kontrast
<p className="text-gray-300">  // 2.1:1 auf weißem BG
  Important text
</p>

// ❌ Bad: Modal ohne Focus-Management
function Modal({ isOpen, children }) {
  if (!isOpen) return null;
  return <div>{children}</div>;  // Focus bleibt auf Hintergrund!
}

// ❌ Bad: Links ohne Beschreibung
<a href="/details">Click here</a>  // Kontextlos
```

---

## Related

- `00-project-core.md` – A11y als Core-Principle
- `04-ui-ux-components.md` – Component-Patterns mit A11y-Hints
- `06-testing-strategy.md` – A11y-Testing mit @axe-core
- `eslint.config.js` – jsx-a11y-Lint-Rules
- `src/hooks/useFocusTrap.ts` – Focus-Management-Hook

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 Batch 3 (WCAG 2.1 AA standards, jsx-a11y integration)
