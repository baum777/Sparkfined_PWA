import type { AppConfig } from '@/types'
import { ENV } from '@/config/env'

export const config: AppConfig = {
  apiBaseUrl: ENV.API_BASE_URL || 'http://localhost:3000',
  apiKey: ENV.API_KEY || '',
  enableAnalytics: ENV.ENABLE_ANALYTICS,
  enableDebug: ENV.ENABLE_DEBUG,
}
