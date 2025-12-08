import { test as base } from '@playwright/test';
import { stubNoisyAPIs } from './api-stubs';

export const test = base.extend<{ skipOnboarding: boolean }>({
  skipOnboarding: [true, { option: true }],
  page: async ({ page, skipOnboarding }, use) => {
    // Stub noisy APIs
    await stubNoisyAPIs(page);

    // Skip onboarding wizard for most tests, but allow opt-out per spec
    await page.addInitScript((shouldSkip: boolean) => {
      if (shouldSkip) {
        window.localStorage.setItem('sparkfined_onboarding_completed', 'true');
      }
    }, skipOnboarding);

    await use(page);
  },
});

export const expect = test.expect;
