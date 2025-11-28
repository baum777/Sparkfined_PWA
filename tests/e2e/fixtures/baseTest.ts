import { test as base } from '@playwright/test';
import { stubNoisyAPIs } from './api-stubs';

export const test = base.extend({
  page: async ({ page }, use) => {
    await stubNoisyAPIs(page);
    await use(page);
  },
});

export const expect = test.expect;
