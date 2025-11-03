/**
 * API Client with HMAC Signature
 * Secure communication with Vercel Edge Functions
 * Sparkfined PWA Trading Platform
 */

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  timeout?: number
}

interface ApiResponse<T> {
  data?: T
  error?: string
  timestamp: number
}

class ApiClient {
  private baseUrl: string
  private clientId: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
    this.clientId = this.getOrCreateClientId()
  }

  private getOrCreateClientId(): string {
    let clientId = localStorage.getItem('spark_client_id')
    if (!clientId) {
      clientId = this.generateClientId()
      localStorage.setItem('spark_client_id', clientId)
    }
    return clientId
  }

  private generateClientId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  }

  private async generateSignature(payload: string): Promise<string> {
    // In production, this would use HMAC-SHA256
    // For now, we'll use a simple hash as placeholder
    const encoder = new TextEncoder()
    const data = encoder.encode(payload)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  async request<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = 10000
    } = options

    const url = `${this.baseUrl}${endpoint}`
    const payload = body ? JSON.stringify(body) : ''
    const signature = await this.generateSignature(payload)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': this.clientId,
          'x-signature': signature,
          ...headers
        },
        body: body ? payload : undefined,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return {
        data,
        timestamp: Date.now()
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            error: 'Request timeout',
            timestamp: Date.now()
          }
        }
        return {
          error: error.message,
          timestamp: Date.now()
        }
      }
      
      return {
        error: 'Unknown error occurred',
        timestamp: Date.now()
      }
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, body: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  async put<T>(endpoint: string, body: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
