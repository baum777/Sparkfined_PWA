/**
 * AccessProvider — Global Access Status Context
 * 
 * Provides access status across the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { AccessStatus, AccessDetails } from '../types/access'
import { ACCESS_CONFIG } from '../config/access'
import { ENV } from '@/config/env'

interface AccessContextValue {
  // Status
  status: AccessStatus
  details: AccessDetails | null
  loading: boolean
  error: string | null
  
  // Wallet
  walletConnected: boolean
  walletAddress: string | null
  
  // Actions
  checkStatus: (wallet: string) => Promise<void>
  refresh: () => Promise<void>
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const AccessContext = createContext<AccessContextValue | undefined>(undefined)

/**
 * Access Provider Component
 */
export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AccessStatus>('none')
  const [details, setDetails] = useState<AccessDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  /**
   * Check access status for a wallet
   */
  const checkStatus = useCallback(async (wallet: string) => {
    setLoading(true)
    setError(null)

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`${ACCESS_CONFIG.API_BASE}/access/status?wallet=${wallet}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        // Don't throw for 404 or other client errors - just set status to 'none'
        if (response.status === 404) {
          setStatus('none')
          setDetails(null)
          setLoading(false)
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      const accessDetails: AccessDetails = {
        status: data.status,
        rank: data.details?.rank ?? 0,
        nftMint: data.details?.nftMint ?? null,
        tokenBalance: data.details?.tokenBalance ?? 0,
        hasNFT: !!data.details?.nftMint,
        meetsHoldRequirement: (data.details?.tokenBalance ?? 0) >= ACCESS_CONFIG.HOLD_REQUIREMENT,
        note: data.details?.note ?? null,
      }

      setStatus(data.status)
      setDetails(accessDetails)
      
      // Persist to localStorage
      try {
        localStorage.setItem('sparkfiend_access_status', JSON.stringify({
          status: data.status,
          details: accessDetails,
          timestamp: Date.now(),
        }))
      } catch (storageErr) {
        // localStorage might be disabled or full - don't fail the whole operation
        console.warn('Failed to save access status to localStorage:', storageErr)
      }

    } catch (err) {
      // Handle AbortError (timeout) gracefully
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('Access status check timed out')
        setError('Request timeout - using cached status if available')
      } else {
        console.error('Error checking access status:', err)
        setError(err instanceof Error ? err.message : 'Failed to check status')
      }
      
      // Don't reset status to 'none' if we have cached data - keep using cache
      // Only set to 'none' if we truly don't have any data
      if (!localStorage.getItem('sparkfiend_access_status')) {
        setStatus('none')
        setDetails(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Refresh current wallet status
   */
  const refresh = useCallback(async () => {
    if (!walletAddress) {
      console.warn('No wallet connected, cannot refresh')
      return
    }
    await checkStatus(walletAddress)
  }, [walletAddress, checkStatus])

  /**
   * Connect wallet (mock for MVP)
   * TODO: Integrate with @solana/wallet-adapter-react
   */
  const connectWallet = useCallback(async () => {
    try {
      // For MVP: Mock wallet connection
      // In production: Use Solana wallet adapter
      const mockWallet = 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH' // Devnet wallet
      setWalletAddress(mockWallet)
      
      // Check status immediately
      await checkStatus(mockWallet)
      
      console.log('[AccessProvider] Wallet connected (mock):', mockWallet)
    } catch (err) {
      console.error('Error connecting wallet:', err)
      setError('Failed to connect wallet')
    }
  }, [checkStatus])

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setWalletAddress(null)
    setStatus('none')
    setDetails(null)
    localStorage.removeItem('sparkfiend_access_status')
    console.log('[AccessProvider] Wallet disconnected')
  }, [])

  /**
   * Load cached status from localStorage on mount
   * This ensures the app can render even if API is unavailable
   */
  useEffect(() => {
    try {
      const cached = localStorage.getItem('sparkfiend_access_status')
      if (cached) {
        try {
          const { status: cachedStatus, details: cachedDetails, timestamp } = JSON.parse(cached)

          // Use cache if less than 5 minutes old, or if older but still valid (grace period)
          const cacheAge = Date.now() - timestamp
          const maxAge = 5 * 60 * 1000 // 5 minutes
          const gracePeriod = 24 * 60 * 60 * 1000 // 24 hours grace period for stale data

          if (cacheAge < maxAge || cacheAge < gracePeriod) {
            setStatus(cachedStatus)
            setDetails(cachedDetails)

            if (ENV.DEV) {
              console.log(
                '[AccessProvider] Loaded cached status:',
                cachedStatus,
                `(age: ${Math.round(cacheAge / 1000)}s)`
              )
            }
          } else {
            // Cache too old, clear it
            localStorage.removeItem('sparkfiend_access_status')
          }
        } catch (err) {
          console.error('Error parsing cached access status:', err)
          // Clear corrupted cache
          try {
            localStorage.removeItem('sparkfiend_access_status')
          } catch {
            // Ignore errors when clearing
          }
        }
      }
    } catch (err) {
      // localStorage might be disabled - that's okay, just continue without cache
      if (ENV.DEV) {
        console.warn('[AccessProvider] localStorage not available:', err)
      }
    }
  }, [])

  /**
   * Auto-refresh status every 5 minutes (when wallet connected)
   */
  useEffect(() => {
    if (!walletAddress) return

    const interval = setInterval(() => {
      refresh()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [walletAddress, refresh])

  const value: AccessContextValue = {
    status,
    details,
    loading,
    error,
    walletConnected: !!walletAddress,
    walletAddress,
    checkStatus,
    refresh,
    connectWallet,
    disconnectWallet,
  }

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
}

/**
 * useAccessStatus Hook
 * 
 * Access the global access status from any component
 */
export function useAccessStatus(): AccessContextValue {
  const context = useContext(AccessContext)
  
  if (!context) {
    throw new Error('useAccessStatus must be used within AccessProvider')
  }
  
  return context
}
