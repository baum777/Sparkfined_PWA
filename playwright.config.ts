import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000, // Increased from 30s for UX components
  retries: 2,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000, // Default action timeout
    navigationTimeout: 15000, // Navigation timeout
  },
  webServer: {
    command: 'pnpm dev -- --host --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: process.env.CI ? false : true,
    timeout: 120000,
  },
});
