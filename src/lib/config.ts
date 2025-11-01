import type { AppConfig } from '@/types'

export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  apiKey: import.meta.env.VITE_API_KEY || '',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
}
