import { defineConfig } from '@playwright/test';

const PREVIEW_HOST = process.env.PLAYWRIGHT_PREVIEW_HOST ?? '0.0.0.0';
const PREVIEW_PORT = process.env.PLAYWRIGHT_PREVIEW_PORT ?? '4173';
const PREVIEW_URL = `http://${PREVIEW_HOST}:${PREVIEW_PORT}`;
const PREVIEW_COMMAND = `pnpm build && pnpm run e2e:preview || { echo "Preview failed to start on ${PREVIEW_URL}. Ensure port ${PREVIEW_PORT} is free and run 'pnpm run e2e:preview' manually."; exit 1; }`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000, // Increased from 30s for UX components
  retries: 2,
  use: {
    baseURL: PREVIEW_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000, // Default action timeout
    navigationTimeout: 15000, // Navigation timeout
  },
  webServer: {
    // Use production preview so service worker + offline flows work in E2E.
    command: PREVIEW_COMMAND,
    url: PREVIEW_URL,
    reuseExistingServer: process.env.CI ? false : true,
    timeout: 180000,
  },
});
