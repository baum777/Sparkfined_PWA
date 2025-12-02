import { test as base } from '@playwright/test';
import { stubNoisyAPIs } from './api-stubs';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Stub noisy APIs
    await stubNoisyAPIs(page);
    
    // Skip onboarding wizard for all tests
    await page.addInitScript(() => {
      window.localStorage.setItem('sparkfined_onboarding_completed', 'true');
    });
    
    await use(page);
  },
});

export const expect = test.expect;
