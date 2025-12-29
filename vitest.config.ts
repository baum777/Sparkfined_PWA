import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import fs from 'fs'

const stdoutColumns = typeof process.stdout?.columns === 'number' ? process.stdout.columns : undefined

if (!stdoutColumns || !Number.isFinite(stdoutColumns) || stdoutColumns <= 0) {
  try {
    process.stdout.columns = 80
  } catch {
    // Ignore if the property is read-only in the current environment
  }
}

// Custom plugin to resolve @/ to src/ OR src.legacy/ with context awareness
const legacyFallbackPlugin = () => {
  return {
    name: 'legacy-fallback',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (source.startsWith('@/')) {
        const relativePath = source.slice(2)
        const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx']
        
        const srcBase = path.resolve(__dirname, './src', relativePath)
        const legacyBase = path.resolve(__dirname, './src.legacy', relativePath)
        
        const checkPath = (base) => {
            for (const ext of extensions) {
               const p = base + ext
               if (fs.existsSync(p) && fs.statSync(p).isFile()) {
                 return p
               }
            }
            return null
        }

        // If importer is in src.legacy, prefer legacy resolution
        const isLegacyImporter = importer && importer.includes('/src.legacy/')
        
        if (isLegacyImporter) {
            const legacyMatch = checkPath(legacyBase)
            if (legacyMatch) return legacyMatch
            
            const srcMatch = checkPath(srcBase)
            if (srcMatch) return srcMatch
        } else {
            // Default: prefer src
            const srcMatch = checkPath(srcBase)
            if (srcMatch) return srcMatch
            
            const legacyMatch = checkPath(legacyBase)
            if (legacyMatch) return legacyMatch
        }

        // Additional check for .js -> .ts mapping (legacy tests)
        if (relativePath.endsWith('.js')) {
            const tsPath = relativePath.slice(0, -3) + '.ts'
            const srcTs = path.resolve(__dirname, './src', tsPath)
            const legacyTs = path.resolve(__dirname, './src.legacy', tsPath)
            
            if (isLegacyImporter) {
                if (fs.existsSync(legacyTs) && fs.statSync(legacyTs).isFile()) return legacyTs
                if (fs.existsSync(srcTs) && fs.statSync(srcTs).isFile()) return srcTs
            } else {
                if (fs.existsSync(srcTs) && fs.statSync(srcTs).isFile()) return srcTs
                if (fs.existsSync(legacyTs) && fs.statSync(legacyTs).isFile()) return legacyTs
            }
        }
      }
      return null
    }
  }
}

export default defineConfig({
  plugins: [react(), legacyFallbackPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './tests/setup/vitest-terminal-width.ts',
      './tests/setup/idb-keyrange-polyfill.ts',
      './tests/setup/indexeddb-polyfill.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      // '@' is handled by the plugin
      '@vercel/kv': path.resolve(__dirname, './tests/mocks/vercel-kv.ts'),
      'lightweight-charts': path.resolve(__dirname, './tests/mocks/lightweight-charts.ts'),
    },
  },
})
