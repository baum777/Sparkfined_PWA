# Incident Report: React Minified Error #185 – AnalysisPageV2

**Incident ID:** INC-2025-11-27-001  
**Severity:** High (P1)  
**Status:** Under Investigation  
**Affected Component:** AnalysisPageV2  
**Environment:** Vercel Production & Preview Deployments  
**Reported:** 2025-11-27  
**Author:** Claude (Senior Architekt & QA-Lead)

---

## 1. Incident Summary

AnalysisPageV2 (`/analysis_v2` route) is experiencing a **React Minified Error #185** ("Invalid React element type") in production builds deployed to Vercel. The error causes the page to fail during render, resulting in:

- **Partial UI rendering** – Page content loads incompletely
- **Navigation breakdown** – React Router recovery/fallback mechanisms trigger
- **User impact** – Analysis features become completely inaccessible, users see error screens or 404 pages

**Scope:** The issue is **isolated to AnalysisPageV2**. Other routes (Dashboard, Journal, Market, etc.) render successfully, indicating a component-specific problem rather than a systemic build or infrastructure failure.

**Timeline:** The error appears to have been introduced within the last 1-2 weeks, likely around commit `1ade0fe` ("Align design tokens and replace hardcoded UI colors") or the subsequent refactoring commits involving the Analysis layout components.

**Detection:** Manual testing or user reports on Vercel Preview/Production deployments.

---

## 2. Technical Problem Description

### What is React Minified Error #185?

React Error #185 (unminified: "React.createElement: type is invalid") occurs when React attempts to render a component but receives an **invalid value** as the component type. Valid types include:
- React component functions or classes
- String element types (`'div'`, `'span'`, etc.)
- Fragment, Portal, or other special React types

Invalid types that trigger this error:
- `undefined` (most common cause)
- `null`
- Non-component values (objects, primitives)
- Incorrectly imported/exported components

### Application to AnalysisPageV2

In the production build of AnalysisPageV2, **at least one component is being passed as `undefined`** to React's rendering system. This typically occurs due to:

1. **Import/Export Mismatch**
   - Named export imported as default (or vice versa)
   - Incorrect import path
   - Component not properly exported from barrel file

2. **Build-Time Tree-Shaking Issues**
   - Production build optimizations removing "unused" code
   - Circular dependencies causing undefined values
   - Lazy-loaded chunks failing to resolve

3. **Runtime Dependency Issues**
   - Store/Context returning `undefined` or `null` that's directly rendered
   - Conditional rendering logic with insufficient guards

### Architecture Context

AnalysisPageV2 has a **complex component hierarchy**:

```
AnalysisPageV2.tsx
├── DashboardShell (wrapper)
├── AnalysisLayout (@/components/analysis/AnalysisLayout) ⚠️ 
│   └── AnalysisSidebarTabs (imported as default) ⚠️
└── AdvancedInsightCard (@/features/analysis)
    └── [Multiple tab components]
```

**Critical Discovery:** There are **two different AnalysisLayout components** in the codebase:

1. **`src/components/analysis/AnalysisLayout.tsx`** (currently used)
   - Imports: `AnalysisSidebarTabs`
   - Props: `title`, `subtitle`, `tabs`, `activeTab`, `onTabChange`, `showHeader`
   - Uses **design token CSS classes** (e.g., `border-brand`, `interactive-active`, `text-text-primary`)

2. **`src/features/analysis/AnalysisLayout.tsx`** (legacy/alternative)
   - Imports: `AnalysisHeader`
   - Props: `title`, `subtitle`, `tabs`, `activeTabId`, `onTabChange`
   - Uses hardcoded color classes (e.g., `border-white/5`, `bg-black/30`)

**AnalysisPageV2 uses** `@/components/analysis/AnalysisLayout` (version #1).

---

## 3. Root Cause Analysis

### Primary Hypothesis: `AnalysisSidebarTabs` Import Resolution Failure

**Evidence:**

1. **Recent Design Token Migration** (commit `1ade0fe`)
   - `AnalysisSidebarTabs` was updated to use design token classes
   - This component is imported as **default export** in `AnalysisLayout`:
     ```tsx
     import AnalysisSidebarTabs, { AnalysisTab } from './AnalysisSidebarTabs';
     ```
   - If the build process or module resolution fails, `AnalysisSidebarTabs` could resolve to `undefined`

2. **Component Export Pattern**
   - `AnalysisSidebarTabs.tsx` exports as `export default function AnalysisSidebarTabs`
   - This should work correctly, but production builds with minification + tree-shaking can sometimes break default exports if:
     - Circular dependencies exist
     - Barrel files (index.ts) interfere with resolution
     - Vite's production build optimizes differently than dev

3. **Duplicate AnalysisLayout Components**
   - The existence of two similar but incompatible `AnalysisLayout` components suggests recent refactoring
   - If import paths or module resolution changed, the wrong version could be loaded in production
   - Prop interface differences (`activeTab` vs `activeTabId`) could cause runtime errors if the wrong component loads

### Secondary Hypothesis: Design Token CSS Classes

While less likely to cause React Error #185 specifically, the design token migration could contribute indirectly:
- If CSS classes don't exist at runtime, it won't cause React errors (just styling issues)
- However, if a CSS-in-JS solution or runtime style resolution is involved, missing classes could cause undefined references

### Tertiary Hypothesis: `AdvancedInsightCard` or Sub-Components

- `AdvancedInsightCard` is imported from `@/features/analysis` barrel file
- The barrel file exports it as default: `export { default as AdvancedInsightCard } from './AdvancedInsightCard';`
- This re-export pattern can sometimes cause issues in production builds
- However, this component is less likely to be the culprit since it's used in a simpler import pattern

### Commit History Context

- **Commit `1ade0fe`**: "Align design tokens and replace hardcoded UI colors"
  - Updated `AnalysisSidebarTabs` to use design tokens
  - Likely changed component implementations across Analysis components
- **Commit `0187d4f`**: "Refactor: Extract AnalysisLayout and Tabs components"
  - Introduced the component split (AnalysisLayout + AnalysisSidebarTabs)
  - Created the import dependency chain that's now failing

**Conclusion:** The error was most likely introduced during the design token migration (commit `1ade0fe`) or the layout refactoring (commit `0187d4f`), where component exports/imports became misaligned in the production build pipeline.

---

## 4. Impact Analysis

### User-Facing Impact

| Impact Category | Description | Severity |
|----------------|-------------|----------|
| **Functional** | Analysis features completely unavailable | **Critical** |
| **UX** | Users see error screens, blank pages, or 404 pages | **High** |
| **Navigation** | Users cannot access `/analysis_v2` route | **High** |
| **Data Loss** | None (no data operations occur before crash) | Low |
| **Performance** | N/A (page doesn't render) | N/A |

### Affected User Flows

1. **Primary Flow: View Market Analysis**
   - User navigates to `/analysis_v2`
   - Expected: See AI-backed market insights, tabs, and advanced analysis
   - Actual: Page crashes, error boundary or 404 displayed

2. **Secondary Flow: Tab Navigation**
   - Users attempting to switch between Overview/Flow/Playbook tabs
   - Cannot complete action due to page failure

3. **Tertiary Flow: Advanced Insight Interaction**
   - Users trying to view/edit advanced market insights
   - Cannot access feature

### Collateral Damage Assessment

**✅ Not Affected:**
- Other pages (Dashboard, Journal, Market v1, Settings, etc.) render successfully
- Global navigation remains functional
- No impact on data persistence (IndexedDB, Zustand stores)
- No ErrorBoundary cascade affecting other routes

**⚠️ Potentially Affected:**
- If users have bookmarked `/analysis_v2`, they cannot access the app via that bookmark
- If external links point to `/analysis_v2`, SEO/marketing impact
- If the error bubbles up to a root ErrorBoundary, the entire app could fail (not observed currently)

### Quantitative Impact

- **User Reach:** ~100% of users attempting to access Analysis V2
- **Feature Availability:** 0% (complete failure)
- **Estimated Downtime:** Since deployment of commit `1ade0fe` (~1-2 weeks ago)
- **Business Impact:** High – Analysis is a core differentiator for Sparkfined PWA

---

## 5. Detection & Timeframe

### How Was This Detected?

- **Method:** Manual testing on Vercel Preview or Production deployment
- **Reporter:** User or internal QA
- **Evidence:** Production build shows minified error in browser console:
  ```
  Minified React error #185; visit https://reactjs.org/docs/error-decoder.html?invariant=185 for the full message
  ```
- **Stack Trace:** Points to `AnalysisPageV2.js` chunk, functions `se`, `ee`, `oe` (minified)

### Timeline Estimation

| Event | Estimated Date | Evidence |
|-------|---------------|----------|
| **Last Known Good Build** | ~2 weeks ago | Commit history shows layout refactor 10+ commits ago |
| **Likely Introduction** | Commit `1ade0fe` (7-10 days ago) | Design token migration affecting `AnalysisSidebarTabs` |
| **Alternative Introduction** | Commit `0187d4f` | Layout refactoring introduced component split |
| **First Production Deployment** | Same day as commit | Vercel auto-deploys on push |
| **Detection** | 2025-11-27 | Today (incident report date) |
| **Estimated Exposure** | 1-2 weeks | Users affected since first broken deployment |

### Why Wasn't This Caught Earlier?

1. **No E2E Tests for AnalysisPageV2**
   - Existing Playwright tests don't cover `/analysis_v2` route
   - Build succeeds (TypeScript compiles), but runtime error in production

2. **Dev vs. Production Build Differences**
   - Vite dev server uses different module resolution than production
   - Error only manifests in minified production builds
   - Local testing may have used dev builds, which work correctly

3. **No Smoke Tests for All Routes**
   - CI/CD doesn't verify that all routes render successfully post-deploy
   - Lighthouse CI only tests 3 routes (root, dashboard, journal)

---

## 6. Resolution / Fix Plan

### Immediate Hotfix (Priority: P0 – Deploy within 24h)

**Step 1: Verify the Import Chain**

```bash
# Check AnalysisPageV2 imports
grep -r "AnalysisLayout" src/pages/AnalysisPageV2.tsx
grep -r "AnalysisSidebarTabs" src/components/analysis/AnalysisLayout.tsx

# Check exports
grep -r "export.*AnalysisSidebarTabs" src/components/analysis/AnalysisSidebarTabs.tsx
```

**Step 2: Add Console Logging (Diagnostic Build)**

In `src/components/analysis/AnalysisLayout.tsx`:

```tsx
import AnalysisSidebarTabs, { AnalysisTab } from './AnalysisSidebarTabs';

// Add diagnostic check
console.log('[AnalysisLayout] AnalysisSidebarTabs:', AnalysisSidebarTabs);
console.log('[AnalysisLayout] typeof:', typeof AnalysisSidebarTabs);

export default function AnalysisLayout({ ... }) {
  if (!AnalysisSidebarTabs) {
    console.error('[AnalysisLayout] AnalysisSidebarTabs is undefined!');
  }
  // ...
}
```

Deploy to Vercel Preview and check browser console for diagnostics.

**Step 3: Fix Import/Export Mismatch**

If `AnalysisSidebarTabs` is `undefined`:

**Option A: Change to Named Export (Recommended)**

In `src/components/analysis/AnalysisSidebarTabs.tsx`:
```tsx
// Change from:
export default function AnalysisSidebarTabs({ ... }) { ... }

// To:
export function AnalysisSidebarTabs({ ... }) { ... }
```

In `src/components/analysis/AnalysisLayout.tsx`:
```tsx
// Change from:
import AnalysisSidebarTabs, { AnalysisTab } from './AnalysisSidebarTabs';

// To:
import { AnalysisSidebarTabs, AnalysisTab } from './AnalysisSidebarTabs';
```

**Option B: Force Default Export Pattern**

In `src/components/analysis/AnalysisSidebarTabs.tsx`:
```tsx
function AnalysisSidebarTabs({ ... }) { ... }
export default AnalysisSidebarTabs;
```

**Step 4: Add Null Guards**

In `src/components/analysis/AnalysisLayout.tsx`:
```tsx
export default function AnalysisLayout({ ... }) {
  // Guard against undefined components
  if (!AnalysisSidebarTabs) {
    console.error('[AnalysisLayout] AnalysisSidebarTabs not loaded');
    return (
      <div className="p-6 text-red-500">
        Error: Analysis layout components failed to load.
      </div>
    );
  }
  // ... rest of component
}
```

**Step 5: Deploy & Verify**

```bash
pnpm run build
# Inspect dist/assets/AnalysisPageV2-*.js to verify component is included
pnpm run preview
# Navigate to /analysis_v2 and verify render
```

### Structural Cleanup (Priority: P1 – Complete within 3-5 days)

1. **Remove Duplicate AnalysisLayout**
   - Delete `src/features/analysis/AnalysisLayout.tsx` (if unused)
   - Or consolidate into a single source of truth
   - Update imports across the codebase

2. **Standardize Component Export Pattern**
   - Audit all components in `/analysis/` folder
   - Prefer **named exports** for better tree-shaking and explicit imports
   - Update barrel files (`index.ts`) to use consistent re-export pattern:
     ```tsx
     export { AnalysisSidebarTabs } from './AnalysisSidebarTabs';
     export type { AnalysisTab } from './AnalysisSidebarTabs';
     ```

3. **Verify Design Token CSS Classes**
   - Ensure all design tokens used in `AnalysisSidebarTabs` exist in Tailwind config
   - Run build and check for PostCSS warnings about unknown classes
   - If using custom tokens, verify they're properly configured in `tailwind.config.ts`

4. **Add Component-Level Tests**
   - Create unit tests for `AnalysisSidebarTabs` (Vitest)
   - Verify component renders with valid props
   - Test import/export in isolation

---

## 7. Risk & Regression Considerations

### Post-Fix Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Other Pages Using Same Pattern** | Medium | High | Audit all pages using `AnalysisLayout` or similar imports |
| **Barrel File Export Issues** | Medium | Medium | Review all barrel files in `/features/` and `/components/` |
| **Design Token CSS Missing** | Low | Low | Run PostCSS validation in CI |
| **Lazy-Load Chunk Failures** | Low | High | Add chunk load error handling |

### Similar Components at Risk

Components using similar architecture that should be audited:

1. **Other V2 Pages**
   - `DashboardPageV2` (if exists)
   - `JournalPageV2` (if exists)
   - Any component importing from `/components/analysis/` or `/features/analysis/`

2. **Barrel File Re-Exports**
   - `@/features/analysis/index.ts`
   - `@/features/market/index.ts`
   - Any barrel file using `export { default as X }` pattern

3. **Components Using Design Tokens**
   - All components updated in commit `1ade0fe`
   - Check for CSS classes like `border-brand`, `interactive-active`, etc.

### Recommended Regression Tests

#### 1. Unit-Level Tests (Vitest)

```tsx
// tests/components/analysis/AnalysisSidebarTabs.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalysisSidebarTabs } from '@/components/analysis/AnalysisSidebarTabs';

describe('AnalysisSidebarTabs', () => {
  it('should render without crashing', () => {
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'flow', label: 'Flow' },
    ];
    render(
      <AnalysisSidebarTabs 
        tabs={tabs} 
        activeTab="overview" 
        onTabChange={() => {}} 
      />
    );
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('should be importable as named export', async () => {
    const module = await import('@/components/analysis/AnalysisSidebarTabs');
    expect(module.AnalysisSidebarTabs).toBeDefined();
    expect(typeof module.AnalysisSidebarTabs).toBe('function');
  });
});
```

#### 2. Integration Tests (Vitest + React Testing Library)

```tsx
// tests/pages/AnalysisPageV2.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnalysisPageV2 from '@/pages/AnalysisPageV2';

describe('AnalysisPageV2', () => {
  it('should render without throwing React Error #185', () => {
    expect(() => {
      render(
        <BrowserRouter>
          <AnalysisPageV2 />
        </BrowserRouter>
      );
    }).not.toThrow();
  });

  it('should render AnalysisLayout component', () => {
    const { container } = render(
      <BrowserRouter>
        <AnalysisPageV2 />
      </BrowserRouter>
    );
    // Check for presence of layout structure
    expect(container.querySelector('[role="tablist"]')).toBeInTheDocument();
  });
});
```

#### 3. E2E Tests (Playwright)

```typescript
// tests/e2e/analysis-page-v2.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AnalysisPageV2', () => {
  test('should render Analysis V2 page without errors', async ({ page }) => {
    // Navigate to Analysis V2
    await page.goto('/analysis_v2');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify no React errors in console
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Verify page title
    await expect(page.locator('h1')).toContainText('Analysis');
    
    // Verify tabs are rendered
    await expect(page.locator('[role="tablist"]')).toBeVisible();
    await expect(page.locator('button[role="tab"]').first()).toBeVisible();
    
    // Verify no React errors
    expect(errors.filter(e => e.includes('Minified React error'))).toHaveLength(0);
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/analysis_v2?tab=overview');
    await page.waitForLoadState('networkidle');
    
    // Click Flow tab
    await page.click('button[role="tab"]:has-text("Flow")');
    
    // Verify URL updated
    await expect(page).toHaveURL(/tab=flow/);
    
    // Verify tab content changed
    await expect(page.locator('text="Flow view is coming soon"')).toBeVisible();
  });

  test('should load AdvancedInsightCard', async ({ page }) => {
    await page.goto('/analysis_v2?tab=overview');
    await page.waitForLoadState('networkidle');
    
    // Wait for Advanced Insight Card to load
    await expect(page.locator('text="Advanced Insight"')).toBeVisible();
  });
});
```

---

## 8. Preventive Measures

To prevent similar incidents in the future:

### 1. TypeScript & ESLint Improvements (Low Effort / High Impact)

**Action:** Add ESLint rule to detect potential import issues

```js
// .eslintrc.js
module.exports = {
  rules: {
    // Warn on default exports (prefer named exports for better refactoring)
    'import/no-default-export': 'warn',
    // Except for pages and config files
    'import/no-default-export': ['warn', { 
      allow: ['src/pages/**/*', '*.config.ts'] 
    }],
  }
};
```

**Action:** Add TypeScript path mapping validation

```bash
# Add to package.json scripts
"scripts": {
  "typecheck:strict": "tsc --noEmit --strict --noUnusedLocals --noUnusedParameters"
}
```

### 2. Smoke Tests in CI/CD (Low Effort / High Impact)

**Action:** Add route smoke test to CI pipeline

```yaml
# .github/workflows/ci.yml
- name: Smoke Test All Routes
  run: |
    pnpm run build
    pnpm run preview &
    sleep 5
    curl --fail http://localhost:4173/ || exit 1
    curl --fail http://localhost:4173/dashboard_v2 || exit 1
    curl --fail http://localhost:4173/analysis_v2 || exit 1
    curl --fail http://localhost:4173/journal_v2 || exit 1
```

**Or use Playwright for visual verification:**

```typescript
// tests/smoke/routes.spec.ts
import { test, expect } from '@playwright/test';

const routes = ['/', '/dashboard_v2', '/analysis_v2', '/journal_v2', '/market'];

for (const route of routes) {
  test(`should render ${route} without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    
    // Check for React errors
    const reactErrors = errors.filter(e => 
      e.includes('Minified React error') || 
      e.includes('React.createElement')
    );
    expect(reactErrors, `React errors in ${route}: ${reactErrors.join(', ')}`).toHaveLength(0);
    
    // Check page actually rendered
    await expect(page.locator('body')).not.toBeEmpty();
  });
}
```

### 3. Storybook for Component Isolation (Medium Effort / High Impact)

**Action:** Set up Storybook for component library

```bash
pnpm add -D @storybook/react @storybook/react-vite storybook
pnpm exec storybook init --type react
```

Create stories for all Analysis components:

```tsx
// src/components/analysis/AnalysisSidebarTabs.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AnalysisSidebarTabs } from './AnalysisSidebarTabs';

const meta: Meta<typeof AnalysisSidebarTabs> = {
  title: 'Components/Analysis/AnalysisSidebarTabs',
  component: AnalysisSidebarTabs,
};

export default meta;
type Story = StoryObj<typeof AnalysisSidebarTabs>;

export const Default: Story = {
  args: {
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'flow', label: 'Flow' },
      { id: 'playbook', label: 'Playbook' },
    ],
    activeTab: 'overview',
    onTabChange: (id) => console.log('Tab changed:', id),
  },
};
```

**Benefit:** Components can be tested in isolation before integration. Import issues are caught immediately.

### 4. Production Build Validation (Medium Effort / Medium Impact)

**Action:** Add post-build validation script

```js
// scripts/validate-build.mjs
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const distDir = './dist';

console.log('🔍 Validating production build...');

// Check that critical chunks exist
const assets = readdirSync(join(distDir, 'assets'));
const criticalChunks = [
  'index-',
  'AnalysisPageV2-',
  'DashboardShell-',
];

for (const chunk of criticalChunks) {
  const found = assets.some(file => file.startsWith(chunk));
  if (!found) {
    console.error(`❌ Missing critical chunk: ${chunk}*.js`);
    process.exit(1);
  }
}

// Check for undefined component errors in bundle
const jsFiles = assets.filter(f => f.endsWith('.js'));
for (const file of jsFiles) {
  const content = readFileSync(join(distDir, 'assets', file), 'utf-8');
  
  // Look for patterns that indicate undefined components
  if (content.includes('createElement(void 0') || 
      content.includes('createElement(undefined')) {
    console.warn(`⚠️  Potential undefined component in ${file}`);
  }
}

console.log('✅ Build validation passed');
```

Add to CI:

```yaml
# .github/workflows/ci.yml
- name: Validate Build
  run: node scripts/validate-build.mjs
```

### 5. Component Export Standardization (High Effort / High Impact)

**Action:** Establish and enforce component export conventions

**Documentation:** `.rulesync/02-frontend-arch.md`

```markdown
## Component Export Conventions

### Preferred Pattern: Named Exports

```tsx
// ✅ Good: Named export (explicit, tree-shakeable)
export function MyComponent() { ... }
export type MyComponentProps = { ... };

// Import
import { MyComponent } from '@/components/MyComponent';
```

### Allowed Pattern: Default Export (Pages Only)

```tsx
// ✅ Good: Default export for pages
export default function MarketPage() { ... }

// Import
import MarketPage from '@/pages/MarketPage';
```

### Anti-Pattern: Mixed Default/Named in Barrel Files

```tsx
// ❌ Avoid: Re-exporting defaults can break in production builds
export { default as MyComponent } from './MyComponent';

// ✅ Better: Direct named export
export { MyComponent } from './MyComponent';
```
```

### 6. Enhanced Error Boundaries (Low Effort / Medium Impact)

**Action:** Add error boundaries with better diagnostics

```tsx
// src/app/components/ComponentErrorBoundary.tsx
import React from 'react';

interface Props {
  componentName: string;
  children: React.ReactNode;
}

export class ComponentErrorBoundary extends React.Component<Props, { hasError: boolean; error: Error | null }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.componentName}]`, error, errorInfo);
    
    // Check for React Error #185
    if (error.message?.includes('type is invalid') || 
        error.message?.includes('Minified React error #185')) {
      console.error('🔴 React Error #185 detected: Invalid component type');
      console.error('Likely causes:');
      console.error('  1. Component imported as undefined');
      console.error('  2. Named/default export mismatch');
      console.error('  3. Circular dependency');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/10">
          <h3 className="text-lg font-semibold text-red-300 mb-2">
            Component Error: {this.props.componentName}
          </h3>
          <p className="text-sm text-red-200/80 mb-2">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-xs text-red-200 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Wrap AnalysisPageV2:

```tsx
// src/pages/AnalysisPageV2.tsx
export default function AnalysisPageV2Wrapped() {
  return (
    <ComponentErrorBoundary componentName="AnalysisPageV2">
      <AnalysisPageV2 />
    </ComponentErrorBoundary>
  );
}
```

---

## 9. Anhang / References

### Affected Files

**Primary:**
- `src/pages/AnalysisPageV2.tsx` (page component)
- `src/components/analysis/AnalysisLayout.tsx` (layout wrapper)
- `src/components/analysis/AnalysisSidebarTabs.tsx` (likely undefined component)

**Secondary:**
- `src/features/analysis/AdvancedInsightCard.tsx`
- `src/features/analysis/index.ts` (barrel file)
- `src/components/analysis/AnalysisHeaderActions.tsx`

**Duplicate/Conflicting:**
- `src/features/analysis/AnalysisLayout.tsx` (alternative version, may cause confusion)

### Relevant Commits

| Commit | Date | Description | Relevance |
|--------|------|-------------|-----------|
| `1ade0fe` | ~7 days ago | Align design tokens and replace hardcoded UI colors | **Likely culprit** – Updated `AnalysisSidebarTabs` |
| `0187d4f` | ~10 days ago | Refactor: Extract AnalysisLayout and Tabs components | Introduced component split |
| `c94545b` | ~10 days ago | Refine V2 layouts and navigation | Updated layout structure |
| `bdca20c` | ~14 days ago | feat: Add Analysis page layout and components | Initial AnalysisPageV2 creation |

### Vercel Deployment Links

*(To be filled in with actual deployment URLs)*

- **Production:** https://sparkfined-pwa.vercel.app/analysis_v2 (broken)
- **Last Known Good Preview:** https://sparkfined-pwa-git-[commit-sha].vercel.app/analysis_v2

### Sentry/Telemetry References

*(To be filled in if error tracking is configured)*

- **Sentry Issue:** N/A (not configured yet)
- **Telemetry Event:** N/A

### Internal Documentation

- **Architecture Docs:** `.rulesync/02-frontend-arch.md` (5-Layer Model)
- **Component Guidelines:** `.rulesync/04-ui-ux-components.md` (Component Taxonomy)
- **Testing Strategy:** `.rulesync/06-testing-strategy.md` (Test Pyramid)

### External Resources

- **React Error Decoder:** https://reactjs.org/docs/error-decoder.html?invariant=185
- **Vite Production Build:** https://vitejs.dev/guide/build.html
- **Module Resolution in Production:** https://vitejs.dev/guide/dep-pre-bundling.html

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2025-11-27 | Claude (QA-Lead) | Initial incident report created |

---

## Next Actions

**Immediate (Today):**
- [ ] Deploy diagnostic build with console logging
- [ ] Verify `AnalysisSidebarTabs` import in production bundle
- [ ] Implement fix (Option A or B)
- [ ] Deploy hotfix to Vercel Preview
- [ ] Verify fix with manual testing
- [ ] Deploy to Production

**Short-Term (This Week):**
- [ ] Add E2E test for AnalysisPageV2
- [ ] Audit other components using similar patterns
- [ ] Remove duplicate AnalysisLayout (if unused)
- [ ] Standardize component exports

**Long-Term (This Sprint):**
- [ ] Set up Storybook for component isolation
- [ ] Add smoke tests to CI pipeline
- [ ] Document component export conventions
- [ ] Implement enhanced error boundaries

---

**Report Status:** ✅ Complete and ready for review  
**Recommended Review By:** Tech Lead, DevOps, Frontend Team  
**Urgency:** High – Deploy hotfix within 24 hours

