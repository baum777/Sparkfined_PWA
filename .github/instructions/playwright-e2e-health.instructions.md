---
description: Playwright E2E test suite health and maintenance guardrails
applyTo: >-
  tests/e2e/**/*.spec.ts,tests/e2e/**/*.ts,playwright.config.ts,src/**/*.{ts,tsx},.github/workflows/*.yml
---
# Playwright E2E Test Health – Hard Constraints

## 🎯 **Domain Scope**

Playwright end-to-end tests are a **hard constraint** of this codebase. The E2E test suite validates critical user flows and must remain runnable and green at all times.

**Test Coverage**:
- Journal flows (CRUD operations, filters, URL sync)
- Alert creation and management
- Chart navigation and analysis
- Authentication and routing
- Market data integration

**Key Files**:
- **Config**: `playwright.config.ts`
- **Tests**: `tests/e2e/**/*.spec.ts`
- **Fixtures**: `tests/e2e/fixtures/`
- **CI**: `.github/workflows/*.yml`

---

## 🚨 **Hard Guardrails**

### 1. **Never Break Playwright Intentionally**

- ❌ **NEVER** remove or disable the Playwright configuration
- ❌ **NEVER** delete or comment out tests only to make the pipeline pass
- ❌ **NEVER** disable entire test suites to hide failures
- ✅ **DO** treat Playwright failures as bugs that must be fixed

**Rationale**: E2E tests are the safety net for user-facing functionality. Breaking them hides real issues.

### 2. **Keep Tests and App in Sync**

Whenever you modify code that affects user flows, you **MUST** update corresponding tests:

#### Routes
```typescript
// If you change route paths in src/routes/RoutesRoot.tsx
// Update navigation tests:
await page.goto('/new-route-path');
```

#### Selectors & Data Attributes
```typescript
// If you rename data-testid attributes
// OLD: <button data-testid="save-button">
// NEW: <button data-testid="journal-save-button">

// Update all tests using that selector:
await page.getByTestId('journal-save-button').click();
```

#### User Flows
```typescript
// If you add validation or change behavior
// Update flow tests to match new expectations
await expect(errorMessage).toContainText('Title is required');
```

**Best Practice**: 
- ✅ Use stable `data-testid` attributes
- ❌ Avoid brittle CSS selectors or text-based selectors
- ✅ Update tests **in the same commit** as code changes

### 3. **Run Tests After Meaningful Changes**

After changes to these areas, **MUST** run Playwright suite:
- User-facing flows (journal, alerts, charts)
- Route definitions or navigation
- Components with `data-testid` attributes used in tests
- Authentication or authorization logic
- IndexedDB schema or data persistence

**Commands**:
```bash
pnpm test:e2e              # Run all E2E tests
pnpm test:e2e:ui           # Run with UI mode (debugging)
pnpm test:e2e -- <file>    # Run specific test file
```

**Definition of Done**:
- All previously passing tests still pass
- No new flakiness introduced
- Updated tests accurately reflect intended behavior

### 4. **Avoid Flakiness and Shortcuts**

#### ❌ **DON'T**: Use arbitrary timeouts
```typescript
// BAD: Hard wait (makes tests slow and fragile)
await page.waitForTimeout(500);
```

#### ✅ **DO**: Use locator-based waits
```typescript
// GOOD: Wait for specific element state
await expect(page.getByTestId('dialog')).not.toBeVisible();
await page.waitForLoadState('networkidle');
```

#### ❌ **DON'T**: Mark tests as `skip` or `fixme` to hide issues
```typescript
// BAD: Hiding a real problem
test.skip('create journal entry', async () => { ... });
```

#### ✅ **DO**: Fix the underlying issue or document why it's flaky
```typescript
// GOOD: Fix the test or implementation
test('create journal entry', async ({ page }) => {
  // Ensure button is visible and ready before clicking
  const saveButton = page.getByTestId('save-button');
  await saveButton.scrollIntoViewIfNeeded();
  await expect(saveButton).toBeEnabled();
  await saveButton.click();
});
```

#### Common Flakiness Patterns to Avoid:
1. **Element not visible**: Always use `scrollIntoViewIfNeeded()` before clicking
2. **Race conditions**: Wait for specific state instead of guessing delays
3. **Dialog overflow**: Ensure buttons are in viewport before interacting
4. **State pollution**: Reset IndexedDB state between tests

### 5. **No Endless Loops**

- ❌ **NEVER** run Playwright tests in watch mode or endless loops in CI
- ❌ **NEVER** retry failing tests indefinitely to "force" a pass
- ✅ **DO** run tests once, analyze failures, fix issues, run again (max 2 iterations)

**If tests still fail after one focused round of fixes**:
1. Stop attempting to fix
2. Collect error output and screenshots
3. Report clear summary:
   - Which tests fail
   - Why they fail (root cause analysis)
   - What follow-up work is needed

---

## 🚨 **No Dirty Fixes / No Config Weakening**

### Type Safety & Linting
- ❌ **NEVER** relax TypeScript, ESLint, Vite, or Playwright configs to silence errors
- ❌ **NEVER** add `// eslint-disable` or `// @ts-ignore` without explicit justification
- ❌ **NEVER** introduce new `any` types just to "calm" TypeScript
- ✅ **DO** fix the root cause of type errors

**Example of BAD fix**:
```typescript
// BAD: Weakening types to avoid error
const entry: any = await createEntry(data);
```

**Example of GOOD fix**:
```typescript
// GOOD: Fix the type properly
const entry: JournalEntry = await createEntry(data);
```

### Configuration
- ❌ **DON'T** increase global timeouts to mask slow operations
- ❌ **DON'T** disable retries to "speed up" tests
- ❌ **DON'T** remove expect assertions to make tests pass
- ✅ **DO** optimize the application or test setup instead

---

## 🚨 **No New Runtime Loops**

### Timer Management
- ❌ **DON'T** create new `setInterval`/`setTimeout` without clear cleanup
- ✅ **DO** always clear timers in cleanup functions

```typescript
// GOOD: Proper cleanup
useEffect(() => {
  const timerId = setInterval(() => {
    // polling logic
  }, 1000);
  
  return () => clearInterval(timerId); // ✅ Cleanup
}, []);
```

### Event Subscriptions
- ❌ **DON'T** add `useEffect` or EventBus subscriptions without cleanup
- ✅ **DO** use guards (e.g., `useRef` for mount-only) and unsubscribe

```typescript
// GOOD: Proper subscription cleanup
useEffect(() => {
  const unsubscribe = eventBus.subscribe('event', handler);
  return unsubscribe; // ✅ Cleanup
}, []);
```

### URL/State Sync
- ❌ **DON'T** change URL/state sync logic (Journal, Analysis) unless explicitly required
- ✅ **DO** preserve existing patterns to avoid infinite re-render loops

**Watch out for React Error #185**: Too many re-renders
- Usually caused by state updates inside render logic
- Always update state in event handlers or `useEffect`

---

## 🧪 **Testing Best Practices**

### Stable Selectors
Always prefer `data-testid` over CSS selectors or text:

```typescript
// ❌ BAD: Fragile selectors
await page.locator('.journal-item:first-child').click();
await page.locator('button:has-text("Save")').click();

// ✅ GOOD: Stable data-testid
await page.getByTestId('journal-list-item').first().click();
await page.getByTestId('journal-save-button').click();
```

### Deterministic Waits
Use Playwright's built-in auto-waiting instead of arbitrary delays:

```typescript
// ❌ BAD: Timing-dependent
await page.waitForTimeout(500);
const text = await page.locator('.title').textContent();

// ✅ GOOD: Wait for specific condition
await expect(page.getByTestId('journal-title')).toBeVisible();
const text = await page.getByTestId('journal-title').textContent();
```

### State Isolation
Ensure tests don't pollute each other's state:

```typescript
// ✅ GOOD: Clean state before each test
test.beforeEach(async ({ page }) => {
  // Reset IndexedDB
  await page.evaluate(() => {
    indexedDB.deleteDatabase('journal-db');
  });
  
  await page.goto('/journal-v2');
});
```

### Error Messages
When assertions fail, provide context:

```typescript
// ❌ BAD: Vague assertion
await expect(entries).toHaveCount(1);

// ✅ GOOD: Clear error message
await expect(entries, 'New entry should appear in list').toHaveCount(1);
```

---

## 🔄 **Workflow When Tests Fail**

### 1. **Analyze the Failure**
- Read the error message carefully
- Check screenshots/videos in `test-results/`
- Identify root cause (code bug vs. test issue)

### 2. **Fix the Issue**
- If code bug: Fix the implementation
- If test bug: Update test expectations or selectors
- If flaky: Add proper waits or state isolation

### 3. **Verify the Fix**
- Run the specific failing test locally
- Run the full suite to check for regressions
- Ensure fix doesn't introduce new flakiness

### 4. **Document if Needed**
- If pattern changes, update this rule file
- If new workaround needed, document in test comments
- Update `/docs/` if user flow changes

---

## 🚀 **Commands Reference**

### Running Tests
```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run with UI mode (debugging)
pnpm test:e2e:ui

# Run specific test file
pnpm test:e2e tests/e2e/journal/journal.flows.spec.ts

# Run tests matching pattern
pnpm test:e2e -g "create entry"

# Debug mode (headed browser)
pnpm test:e2e --headed --debug
```

### CI/CD
```bash
# Check if tests will pass before pushing
pnpm test:e2e

# View last test report
npx playwright show-report
```

---

## 📖 **Related Documentation**

- **Global Rules**: `.rulesync/rules/overview.md` – Testing guidelines section
- **Journal Tests**: `.rulesync/rules/journal-system.md` – Journal-specific E2E patterns
- **Playwright Docs**: https://playwright.dev/docs/intro
- **CI Config**: `.github/workflows/` – Pipeline configuration

---

## 🎯 **Summary: Your Responsibilities**

When you modify code, you **MUST**:
1. ✅ Keep Playwright tests passing (treat failures as bugs)
2. ✅ Update tests when you change routes, selectors, or flows
3. ✅ Run relevant test suites after changes
4. ✅ Fix root causes, not symptoms (no config weakening)
5. ✅ Avoid flakiness (use proper waits, stable selectors)
6. ✅ Stop after 1-2 fix iterations if tests still fail (report instead)

**Remember**: E2E tests are the safety net for user-facing features. Treat them with respect.

---

**Last updated**: 2025-12-04
**Domain owner**: QA & Test Infrastructure
**Test count**: 15+ E2E test suites across critical flows
