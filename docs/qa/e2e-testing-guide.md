# E2E Testing Guide – Playwright

**Last updated**: 2025-12-04  
**Maintainer**: QA & Test Infrastructure  
**Rule Reference**: `.rulesync/rules/playwright-e2e-health.md`

---

## 📋 **Overview**

This guide documents the Playwright end-to-end testing strategy for Sparkfined PWA. E2E tests are a **hard constraint** of this codebase and must remain runnable and green.

### Key Principles
1. **Tests protect user flows** – E2E tests validate critical paths users take
2. **Tests must be stable** – No flaky tests, use deterministic waits
3. **Tests must be maintained** – Keep tests in sync with code changes
4. **Tests must pass before merge** – CI enforces this

---

## 🚀 **Running Tests**

### Local Development
```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run with UI mode (debugging)
pnpm test:e2e:ui

# Run specific test file
pnpm test:e2e tests/e2e/journal/journal.flows.spec.ts

# Run tests matching pattern
pnpm test:e2e -g "create entry"

# Debug mode (headed browser, paused)
pnpm test:e2e --headed --debug
```

### CI Pipeline
```bash
# What CI runs:
pnpm test:e2e

# View last test report:
npx playwright show-report
```

---

## 📁 **Test Structure**

### Directory Layout
```
tests/
├── e2e/
│   ├── journal/
│   │   └── journal.flows.spec.ts    # Journal CRUD flows
│   ├── alerts/
│   │   └── alerts.flows.spec.ts     # Alert creation/management
│   ├── charts/
│   │   └── chart.flows.spec.ts      # Chart navigation
│   ├── fixtures/                     # Test fixtures and helpers
│   └── utils/                        # Test utilities
└── playwright.config.ts              # Playwright configuration
```

### Test Naming Convention
- **`.flows.spec.ts`**: Full user flows (multi-step scenarios)
- **`.spec.ts`**: Single feature or component tests

---

## 🎯 **Test Coverage**

### Critical Flows (Must Remain Green)

#### 1. Journal System
- ✅ Create new entry → appears at top of list
- ✅ Edit entry notes → persists changes
- ✅ Filter by direction → filters correctly
- ✅ URL parameter → preselects entry on load
- ✅ Validation → prevents empty title save
- ✅ Delete entry → removes from list

**Test file**: `tests/e2e/journal/journal.flows.spec.ts`

#### 2. Alerts System
- ✅ Create price alert → appears in list
- ✅ Edit alert trigger → updates correctly
- ✅ Delete alert → removes from list
- ✅ Alert notification → triggers on price change

**Test file**: `tests/e2e/alerts/alerts.flows.spec.ts`

#### 3. Chart System
- ✅ Load chart → renders correctly
- ✅ Change timeframe → updates data
- ✅ Add annotation → persists on chart
- ✅ Replay mode → plays historical data

**Test file**: `tests/e2e/charts/chart.flows.spec.ts`

#### 4. Authentication & Routing
- ✅ Navigate between pages → correct page loads
- ✅ Deep links → resolve correctly
- ✅ Browser back/forward → maintains state

**Test file**: `tests/e2e/routing.spec.ts`

#### 5. Watchlist Resilience
- ✅ Offline mode shows cached rows and resilience banner

**Test file**: `tests/e2e/watchlist/watchlist.offline.spec.ts`

#### 6. Onboarding Flow
- ✅ First-run wizard advances through journal → watchlist → alerts
- ✅ Skip action hides the wizard and persists the completion flag

**Test file**: `tests/e2e/onboarding.flow.spec.ts`

#### 7. Analysis Navigation
- ✅ Switching tabs updates the query param and preserves overview metrics

**Test file**: `tests/e2e/analyze/analysis.flow.spec.ts`

### Recent Hardening (P3)
- Telemetry drain loop now reuses a stable interval/listener set to avoid churn when buffers change.
- Onboarding wizard emits `onboarding.advance/skip` events to mirror the new first-run flow coverage.

---

## 🛠️ **Writing Good E2E Tests**

### Use Stable Selectors

#### ❌ **BAD**: Fragile CSS or text selectors
```typescript
await page.locator('.journal-item:first-child').click();
await page.locator('button:has-text("Save")').click();
await page.locator('div.container > div:nth-child(2)').click();
```

#### ✅ **GOOD**: Stable `data-testid` attributes
```typescript
await page.getByTestId('journal-list-item').first().click();
await page.getByTestId('journal-save-button').click();
await page.getByTestId('journal-detail-panel').click();
```

**Adding data-testid in Components**:
```tsx
// In your component
<button 
  data-testid="journal-save-button"
  onClick={handleSave}
>
  Save Entry
</button>
```

---

### Use Proper Waits

#### ❌ **BAD**: Arbitrary timeouts
```typescript
await page.waitForTimeout(500);  // Slow and fragile
const text = await page.locator('.title').textContent();
```

#### ✅ **GOOD**: Wait for specific conditions
```typescript
await expect(page.getByTestId('journal-title')).toBeVisible();
const text = await page.getByTestId('journal-title').textContent();
```

#### ✅ **GOOD**: Wait for network or load state
```typescript
await page.waitForLoadState('networkidle');
await page.waitForResponse(resp => 
  resp.url().includes('/api/data') && resp.status() === 200
);
```

---

### Handle Dialogs Properly

#### Common Issue: Button Not Visible

When dealing with dialogs (modals), buttons can be below viewport:

```typescript
// ❌ BAD: Click might fail if button is off-screen
await page.getByTestId('save-button').click();

// ✅ GOOD: Ensure button is in view first
const saveButton = page.getByTestId('save-button');
await saveButton.scrollIntoViewIfNeeded();
await expect(saveButton).toBeEnabled();
await saveButton.click();
```

---

### Ensure Test Isolation

Each test should start with clean state:

```typescript
test.beforeEach(async ({ page }) => {
  // Reset IndexedDB state
  await page.evaluate(() => {
    indexedDB.deleteDatabase('sparkfined-db');
  });
  
  // Navigate to starting page
  await page.goto('/journal-v2');
  
  // Wait for app to be ready
  await expect(page.getByTestId('app-ready')).toBeVisible();
});
```

---

### Use Descriptive Test Names

```typescript
// ❌ BAD: Vague
test('journal test', async ({ page }) => { ... });

// ✅ GOOD: Clear and specific
test('should create new journal entry and display it at top of list', async ({ page }) => {
  // ...
});

test('should prevent saving entry with empty title', async ({ page }) => {
  // ...
});
```

---

### Add Context to Assertions

```typescript
// ❌ BAD: Unclear when it fails
await expect(entries).toHaveCount(1);

// ✅ GOOD: Clear error message
await expect(entries, 'New entry should appear in list').toHaveCount(1);
await expect(title, 'Title should match input').toHaveText('My Trade');
```

---

## 🚨 **Common Pitfalls**

### 1. Element Not Visible
**Symptom**: `Element is not visible` error

**Solution**: Use `scrollIntoViewIfNeeded()` before interacting:
```typescript
const button = page.getByTestId('submit-button');
await button.scrollIntoViewIfNeeded();
await button.click();
```

---

### 2. Timing Issues
**Symptom**: Test passes sometimes, fails other times

**Solution**: Use proper waits instead of `waitForTimeout`:
```typescript
// ❌ BAD
await page.waitForTimeout(1000);

// ✅ GOOD
await expect(page.getByTestId('loading-spinner')).not.toBeVisible();
await expect(page.getByTestId('data-loaded')).toBeVisible();
```

---

### 3. State Pollution
**Symptom**: Tests pass individually but fail when run together

**Solution**: Reset state between tests:
```typescript
test.beforeEach(async ({ page }) => {
  // Clear IndexedDB
  await page.evaluate(() => {
    indexedDB.deleteDatabase('sparkfined-db');
  });
  
  // Clear localStorage
  await page.evaluate(() => localStorage.clear());
});
```

---

### 4. Race Conditions
**Symptom**: Dialog closes before button is clicked

**Solution**: Wait for dialog to be stable:
```typescript
// ✅ GOOD: Wait for dialog to be ready
const dialog = page.getByTestId('new-entry-dialog');
await expect(dialog).toBeVisible();

const saveButton = dialog.getByTestId('save-button');
await expect(saveButton).toBeEnabled();
await saveButton.click();

// Wait for dialog to close
await expect(dialog).not.toBeVisible();
```

---

## 🔧 **Debugging Tests**

### Run with UI Mode
```bash
pnpm test:e2e:ui
```
This opens an interactive UI where you can:
- Step through tests
- See screenshots at each step
- Inspect locators
- Time travel through test execution

### Run in Debug Mode
```bash
pnpm test:e2e --headed --debug
```
This runs tests with:
- Visible browser (headed)
- Playwright Inspector (step through manually)
- Paused execution on failure

### View Test Reports
```bash
npx playwright show-report
```
Opens HTML report with:
- Test results
- Screenshots on failure
- Videos of test runs
- Trace files

### Enable Trace on Failure
In `playwright.config.ts`:
```typescript
use: {
  trace: 'on-first-retry', // Capture trace on first retry
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

---

## 🔄 **Maintaining Tests**

### When Code Changes

#### Routes Changed
```typescript
// Update navigation in tests
// OLD: await page.goto('/journal');
// NEW: await page.goto('/journal-v2');
```

#### Selectors Changed
```typescript
// Update all references to renamed data-testid
// OLD: await page.getByTestId('save-btn').click();
// NEW: await page.getByTestId('journal-save-button').click();
```

#### Flow Changed
```typescript
// Update test expectations to match new behavior
// Example: Validation now shows inline error instead of toast
await expect(page.getByTestId('title-error')).toBeVisible();
// OLD: await expect(page.getByTestId('toast-error')).toBeVisible();
```

### When Tests Fail

#### 1. Analyze the Failure
- Read error message carefully
- Check screenshots in `test-results/`
- Watch video if available
- Review trace file

#### 2. Reproduce Locally
```bash
pnpm test:e2e:ui tests/e2e/journal/journal.flows.spec.ts
```

#### 3. Fix Root Cause
- If code bug → fix implementation
- If test bug → update test expectations
- If flaky → add proper waits

#### 4. Verify Fix
```bash
# Run specific test
pnpm test:e2e tests/e2e/journal/journal.flows.spec.ts

# Run full suite
pnpm test:e2e
```

#### 5. Prevent Recurrence
- Add guards to prevent similar issues
- Document pattern in this guide
- Update rule if needed

---

## 📊 **CI Integration**

### GitHub Actions Workflow
`.github/workflows/ci.yml` runs E2E tests on:
- Pull requests
- Pushes to main
- Manual workflow dispatch

### Pipeline Steps
1. Install dependencies (`pnpm install`)
2. Install Playwright browsers (`npx playwright install --with-deps`)
3. Run type check (`pnpm typecheck`)
4. Run linter (`pnpm lint`)
5. Run unit tests (`pnpm test`)
6. Build application (`pnpm build`)
7. **Run E2E tests** (`pnpm test:e2e`)
8. Upload test results as artifacts

### Handling CI Failures

#### If E2E tests fail in CI:
1. ✅ **DO** download test artifacts (screenshots, videos)
2. ✅ **DO** reproduce locally
3. ✅ **DO** fix root cause
4. ❌ **DON'T** skip tests to make CI pass
5. ❌ **DON'T** increase timeouts to mask issues

---

## 🎯 **Definition of Done**

Before merging a PR that affects user flows:

### Required Checks
- [ ] All E2E tests pass locally
- [ ] No new flaky tests introduced
- [ ] Updated tests for any changed flows
- [ ] Added `data-testid` for new interactive elements
- [ ] CI pipeline shows all green

### Validation Commands
```bash
# Full validation sequence
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

---

## 📚 **Resources**

### Official Documentation
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locators](https://playwright.dev/docs/locators)
- [Auto-waiting](https://playwright.dev/docs/actionability)

### Internal Documentation
- **Rule File**: `.rulesync/rules/playwright-e2e-health.md` – Hard constraints
- **Journal Tests**: `.rulesync/rules/journal-system.md` – Domain-specific patterns
- **CI Documentation**: `docs/ci/hardening-summary.md` – CI/CD setup

### Test Configuration
- **Config**: `playwright.config.ts` – Playwright settings
- **Package Scripts**: `package.json` – Test commands

---

## 🔗 **Related Files**

### Test Files
- `tests/e2e/journal/journal.flows.spec.ts`
- `tests/e2e/alerts/alerts.flows.spec.ts`
- `tests/e2e/charts/chart.flows.spec.ts`

### Configuration
- `playwright.config.ts`
- `.github/workflows/ci.yml`

### Rule Files
- `.rulesync/rules/playwright-e2e-health.md`
- `.rulesync/rules/overview.md`

---

## 📝 **Quick Reference Card**

### Essential Commands
```bash
pnpm test:e2e              # Run all tests
pnpm test:e2e:ui           # UI mode (debugging)
pnpm test:e2e -- <file>    # Run specific file
npx playwright show-report # View last report
```

### Best Practices
- ✅ Use `data-testid` for selectors
- ✅ Use proper waits (not `waitForTimeout`)
- ✅ Ensure test isolation (clean state)
- ✅ Add descriptive test names
- ✅ Scroll elements into view before clicking

### Anti-Patterns
- ❌ Brittle CSS selectors
- ❌ Arbitrary timeouts
- ❌ Skipping tests to pass CI
- ❌ Weakening config to hide errors
- ❌ Tests that pollute each other's state

---

**Remember**: E2E tests are the safety net for user-facing features. Maintain them with care!
