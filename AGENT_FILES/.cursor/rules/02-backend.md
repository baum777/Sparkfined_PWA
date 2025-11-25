# Cursor Rules — Backend (API + Testing + A11y + Performance)

> **Source:** `.rulesync/05-api-integration.md` + `.rulesync/06-testing-strategy.md` + `.rulesync/07-accessibility.md` + `.rulesync/08-performance.md`
>
> **Purpose:** API patterns, testing conventions, accessibility guidelines, and performance targets for backend/quality work.

---

## API-Integration

### Serverless-API-Pattern (Vercel Edge Functions)
```ts
// api/data/ohlc.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Method-Check
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Input-Validation
  const { symbol } = req.query;
  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Missing symbol' });
  }

  // 3. Call External-API (with secret from env)
  try {
    const apiKey = process.env.DEXPAPRIKA_API_KEY;
    const response = await fetch(`https://api.dexpaprika.com/ohlc/${symbol}`, {
      headers: { 'X-API-Key': apiKey },
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('[API] OHLC failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### fetchWithRetry (Client-Side)
```ts
// Always use fetchWithRetry for external-API-calls
import { fetchWithRetry } from '@/lib/net/fetch';

const result = await fetchWithRetry('/api/data/ohlc?symbol=SOL', {
  retries: 3,
  baseDelay: 1000,
  timeout: 10000,
});
```

### Result<T, E> for Error-Handling
```ts
// Prefer Result<T,E> over throwing errors
async function getTokenData(address: string): Promise<Result<TokenData>> {
  try {
    const response = await fetchWithRetry(`/api/token/${address}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

---

## Testing-Strategy

### Test-Pyramid
```
        /\
       /  \        E2E (Playwright) — 10-15 Tests
      /----\       - Critical User-Flows
     /      \
    / Integration\  (Planned)
   /--------------\
  /   Unit (Vitest) \  100+ Tests
 /------------------\ - Components, Hooks, Utils
```

### Coverage-Targets
- **Overall:** 80%
- **Critical-Modules:** 90% (`src/lib/`, `api/`, `src/hooks/`)

### Vitest-Pattern (AAA)
```ts
import { describe, test, expect } from 'vitest';

describe('calculateRSI', () => {
  test('should return 70 for strong uptrend', () => {
    // Arrange
    const prices = [100, 105, 110, 115, 120];

    // Act
    const rsi = calculateRSI(prices);

    // Assert
    expect(rsi).toBeCloseTo(70, 1);
  });
});
```

### React-Component-Testing
```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('Button renders with children', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
});
```

### E2E-Pattern (Playwright)
```ts
import { test, expect } from '@playwright/test';

test('User can create journal entry', async ({ page }) => {
  await page.goto('/journal');
  await page.fill('[data-testid="journal-input"]', 'Test entry');
  await page.click('[data-testid="journal-save"]');
  await expect(page.locator('[data-testid="journal-entry"]')).toContainText('Test entry');
});
```

---

## Accessibility (WCAG 2.1 AA)

### MUST-Rules
1. **Semantic-HTML:** Use `<button>`, `<nav>`, `<main>`, not `<div onClick>`
2. **Labels:** All inputs need `<label>` or `aria-label`
3. **Keyboard-Nav:** All interactive-elements keyboard-accessible (Tab, Enter, Space)
4. **Focus-Trap:** Modals trap-focus (Esc to close)
5. **Contrast-Ratio:** 4.5:1 for text, 3:1 for UI-components

### Chart-Accessibility-Pattern
```tsx
// Provide data-table-alternative for Canvas-charts
<div>
  <canvas ref={chartRef} aria-hidden="true" />
  <details className="sr-only">
    <summary>Chart Data</summary>
    <table>
      <thead>
        <tr><th>Date</th><th>Open</th><th>High</th><th>Low</th><th>Close</th></tr>
      </thead>
      <tbody>
        {ohlcData.map(candle => (
          <tr key={candle.time}>
            <td>{candle.time}</td>
            <td>{candle.open}</td>
            <td>{candle.high}</td>
            <td>{candle.low}</td>
            <td>{candle.close}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </details>
</div>
```

### useFocusTrap Hook
```ts
// Use for modals, dropdowns
import { useFocusTrap } from '@/hooks/useFocusTrap';

export function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  // ... handle Esc-key, ARIA-roles
}
```

---

## Performance

### Bundle-Size-Target
- **Current:** 428KB gzipped
- **Target:** <400KB gzipped (Q1 2025)

### Core-Web-Vitals
- **LCP (Largest-Contentful-Paint):** <2.5s
- **FID (First-Input-Delay):** <100ms
- **CLS (Cumulative-Layout-Shift):** <0.1

### Optimization-Patterns

**React.memo for Heavy-Components:**
```tsx
export const InteractiveChart = React.memo(({ data }: ChartProps) => {
  // ... chart rendering
});
```

**useMemo for Expensive-Calculations:**
```ts
const rsi = useMemo(() => calculateRSI(prices), [prices]);
```

**Code-Splitting for Pages:**
```tsx
// src/routes/index.tsx
const MarketPage = lazy(() => import('@/pages/Market'));
const JournalPage = lazy(() => import('@/pages/Journal'));
```

**List-Virtualization (for 1000+ items):**
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

// Render only visible-rows (not all 1000)
```

---

## Related

- Full rules: `.rulesync/05-api-integration.md`, `.rulesync/06-testing-strategy.md`, `.rulesync/07-accessibility.md`, `.rulesync/08-performance.md`
