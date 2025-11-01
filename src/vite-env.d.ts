/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_KEY: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_MARKET_DATA_API: string
  readonly VITE_CHART_SERVICE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
