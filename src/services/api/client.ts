/**
 * API Client with HMAC Signature
 * Secure API requests with signature validation
 */

import { trackEvent, TelemetryEvents } from '../telemetry'

interface RequestOptions extends RequestInit {
  timeout?: number
  skipAuth?: boolean
}

class APIClient {
  private baseURL: string
  private apiSecret: string | null = null

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
    // In production, this would come from secure environment
    this.apiSecret = import.meta.env.VITE_API_SECRET || null
  }

  /**
   * Generate HMAC signature for request
   */
  private async generateSignature(payload: string): Promise<string> {
    if (!this.apiSecret) {
      throw new Error('API secret not configured')
    }

    const encoder = new TextEncoder()
    const keyData = encoder.encode(this.apiSecret)
    const messageData = encoder.encode(payload)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Make API request with timeout and signature
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      timeout = 10000,
      skipAuth = false,
      ...fetchOptions
    } = options

    const url = `${this.baseURL}${endpoint}`
    const startTime = performance.now()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      // Generate signature for POST/PUT requests
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string> || {}),
      }

      if (!skipAuth && fetchOptions.body && this.apiSecret) {
        const payload = typeof fetchOptions.body === 'string' 
          ? fetchOptions.body 
          : JSON.stringify(fetchOptions.body)
        
        const signature = await this.generateSignature(payload)
        headers['X-Signature'] = signature
        
        // Client ID for rate limiting
        const clientId = this.getClientId()
        headers['X-Client-ID'] = clientId
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const duration = performance.now() - startTime
      trackEvent(TelemetryEvents.API_REQUEST, {
        endpoint,
        method: fetchOptions.method || 'GET',
        status: response.status,
        duration,
      })

      if (!response.ok) {
        const error = await response.text()
        trackEvent(TelemetryEvents.API_ERROR, {
          endpoint,
          status: response.status,
          error,
        })
        throw new Error(`API Error: ${response.status} - ${error}`)
      }

      return await response.json()
    } catch (error) {
      const duration = performance.now() - startTime
      
      if (error instanceof Error && error.name === 'AbortError') {
        trackEvent(TelemetryEvents.API_ERROR, {
          endpoint,
          error: 'timeout',
          duration,
        })
        throw new Error(`Request timeout after ${timeout}ms`)
      }

      throw error
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * Get or create client ID for rate limiting
   */
  private getClientId(): string {
    let clientId = localStorage.getItem('api_client_id')
    
    if (!clientId) {
      clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('api_client_id', clientId)
    }

    return clientId
  }
}

// Singleton instance
export const apiClient = new APIClient()

// Convenience exports
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    apiClient.get<T>(endpoint, options),
  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) => 
    apiClient.post<T>(endpoint, data, options),
  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) => 
    apiClient.put<T>(endpoint, data, options),
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    apiClient.delete<T>(endpoint, options),
}
