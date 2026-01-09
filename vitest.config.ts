import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

const stdoutColumns = typeof process.stdout?.columns === 'number' ? process.stdout.columns : undefined

if (!stdoutColumns || !Number.isFinite(stdoutColumns) || stdoutColumns <= 0) {
  try {
    process.stdout.columns = 80
  } catch {
    // Ignore if the property is read-only in the current environment
  }
}

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './tests/setup/vitest-terminal-width.ts',
      './tests/setup/idb-keyrange-polyfill.ts',
      './tests/setup/indexeddb-polyfill.ts',
    ],
    // Note: Playwright uses `*.spec.ts` for E2E. We exclude E2E directories explicitly,
    // but allow unit `*.spec.ts` files (e.g. backend domain unit tests).
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**', '**/tests/cases/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@vercel/kv': path.resolve(__dirname, './tests/mocks/vercel-kv.ts'),
      'lightweight-charts': path.resolve(__dirname, './tests/mocks/lightweight-charts.ts'),
    },
  },
})
