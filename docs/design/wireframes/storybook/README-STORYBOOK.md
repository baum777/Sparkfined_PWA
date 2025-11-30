# Storybook Component Stories

**Purpose:** Ready-to-use Storybook stories for all screen components  
**Framework:** Storybook 7+ with TypeScript  
**Status:** ⚠️ Storybook not yet initialized in project (setup instructions below)

---

## 📦 Setup Instructions

### 1. Install Storybook
```bash
npx storybook@latest init
```

**Select:**
- Framework: React
- Builder: Vite
- TypeScript: Yes

### 2. Configure Storybook for PWA
**File:** `.storybook/main.ts`
```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
    '../wireframes/storybook/**/*.stories.@(tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y', // Accessibility testing
    '@storybook/addon-viewport', // Responsive testing
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

### 3. Configure Global Styles
**File:** `.storybook/preview.ts`
```typescript
import type { Preview } from '@storybook/react';
import '../src/styles/App.css'; // Import app styles

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0a0a0a' },
        { name: 'light', value: '#ffffff' },
      ],
    },
    viewport: {
      viewports: {
        mobile1: {
          name: 'Mobile (375px)',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet (768px)',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop (1280px)',
          styles: { width: '1280px', height: '720px' },
        },
      },
    },
  },
};

export default preview;
```

### 4. Run Storybook
```bash
npm run storybook
```

Storybook will start at `http://localhost:6006`

---

## 📁 Story Files Included

### Screen Stories (Complete)
1. **AnalyzePage.stories.tsx** ✅
   - Empty State
   - Loading State
   - Data Loaded (Success)
   - AI Generated
   - Error State
   - Mobile View
   - Desktop View

2. **ChartPage.stories.tsx** ✅
   - Empty State
   - Chart Loaded
   - Replay Mode Active
   - Drawing Mode
   - Backtest Results
   - Navigation Aids (MiniMap + Timeline)
   - Mobile View
   - Desktop View

### Component Stories (To Be Created)
3. **JournalPage.stories.tsx** 📝
   - Empty Draft
   - Pre-filled from Chart
   - AI Compression Result
   - Server Notes Loaded
   - Export Dialog

4. **ReplayPage.stories.tsx** 📝
   - Empty State (No Sessions)
   - Sessions List
   - Modal Timeline View
   - No Events in Session

5. **AccessPage.stories.tsx** 📝
   - Status Tab (No Access)
   - Status Tab (OG with NFT)
   - Lock Calculator
   - Hold Verification
   - Leaderboard

6. **NotificationsPage.stories.tsx** 📝
   - Default View
   - Wizard Expanded
   - Server Rules Loaded
   - Trade Idea (Active)
   - Trade Idea (Closed)
   - Local Rules Table
   - Trigger History

7. **SettingsPage.stories.tsx** 📝
   - Display Settings
   - AI Configuration
   - Token Budget High Usage
   - Telemetry Settings
   - PWA Controls
   - Danger Zone

### Shared Component Stories
8. **Button.stories.tsx** 📝
   - Primary / Secondary / Ghost / Icon / Danger
   - Hover / Active / Disabled states
   - Loading state

9. **Card.stories.tsx** 📝
   - Standard / Interactive / Info / Danger
   - Hover effects

10. **Input.stories.tsx** 📝
    - Text / Number / Textarea
    - Focus / Error / Disabled states

11. **Toggle.stories.tsx** 📝
    - ON / OFF states
    - Hover / Active transitions

---

## 🎨 Story Writing Best Practices

### 1. Use Decorators
```typescript
decorators: [
  (Story) => (
    <BrowserRouter> {/* Router context for pages */}
      <Story />
    </BrowserRouter>
  ),
],
```

### 2. Mock External Dependencies
```typescript
parameters: {
  mockData: {
    // Provide mock data for API calls
    address: '7xKF...abc123',
    tf: '15m',
    data: mockOhlcData,
  },
},
```

### 3. Document Stories
```typescript
/**
 * **Loading State** - After user clicks "Analysieren"
 * 
 * - Button shows "Lade…"
 * - Button is disabled
 * - Loading indicator (text-based)
 */
export const Loading = Template.bind({});
```

### 4. Use Controls (Args)
```typescript
argTypes: {
  loading: { control: 'boolean' },
  address: { control: 'text' },
  tf: {
    control: { type: 'select' },
    options: ['1m', '5m', '15m', '1h', '4h', '1d'],
  },
},
```

### 5. Test Responsive Layouts
```typescript
parameters: {
  viewport: {
    defaultViewport: 'mobile1', // or 'tablet', 'desktop'
  },
},
```

---

## 🧪 Testing with Storybook

### Interaction Testing
**Addon:** `@storybook/addon-interactions`

```typescript
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export const ClickButton = Template.bind({});
ClickButton.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.getByRole('button', { name: /analysieren/i });
  await userEvent.click(button);
  await expect(canvas.getByText(/lade…/i)).toBeInTheDocument();
};
```

### Accessibility Testing
**Addon:** `@storybook/addon-a11y`

Automatically checks:
- Color contrast
- ARIA labels
- Keyboard navigation
- Focus management

### Visual Regression Testing
**Tool:** Chromatic (Storybook service)

```bash
npx chromatic --project-token=<token>
```

Detects visual changes across stories.

---

## 📊 Coverage Checklist

### Screen Coverage
- [ ] AnalyzePage (7 variants) ✅
- [ ] ChartPage (8 variants) ✅
- [ ] JournalPage (5 variants) 📝
- [ ] ReplayPage (4 variants) 📝
- [ ] AccessPage (5 variants) 📝
- [ ] NotificationsPage (7 variants) 📝
- [ ] SettingsPage (6 variants) 📝

### Component Coverage
- [ ] Buttons (5 types × 4 states)
- [ ] Cards (4 types × 2 states)
- [ ] Inputs (3 types × 3 states)
- [ ] Toggles (2 states × 2 animations)
- [ ] Tables (2 types × 2 responsive layouts)
- [ ] Modals (2 types × 2 sizes)

### State Coverage
- [ ] Empty / Loading / Success / Error
- [ ] Mobile / Tablet / Desktop
- [ ] Light / Dark themes
- [ ] Hover / Active / Disabled

---

## 🚀 Deployment

### Static Storybook Build
```bash
npm run build-storybook
```

Output: `storybook-static/` directory

### Hosting Options
1. **Vercel:** `vercel --prod ./storybook-static`
2. **Netlify:** Drag & drop `storybook-static` folder
3. **GitHub Pages:** Push to `gh-pages` branch
4. **Chromatic:** `npx chromatic --build-script-name build-storybook`

---

## 🔗 Useful Resources

- **Storybook Docs:** https://storybook.js.org/docs/react/
- **Vite Plugin:** https://github.com/storybookjs/storybook/tree/next/code/frameworks/react-vite
- **Chromatic:** https://www.chromatic.com/
- **Testing Library:** https://testing-library.com/docs/react-testing-library/intro/
- **Accessibility:** https://github.com/storybookjs/storybook/tree/next/code/addons/a11y

---

## 💡 Tips

1. **Hot Reload:** Storybook auto-reloads on file changes
2. **Docs Mode:** Add `?path=/docs/screens-analyzepage--empty` for docs view
3. **Canvas Mode:** Add `?path=/story/screens-analyzepage--empty` for canvas view
4. **Keyboard Shortcuts:** Press `/` in Storybook to see all shortcuts
5. **Snapshot Testing:** Export stories for use in Jest snapshot tests

---

**Next:** Review checklist and roadmap.
