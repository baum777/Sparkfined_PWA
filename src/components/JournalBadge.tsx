/**
 * BLOCK 2: Journal Badge Component
 * 
 * Shows in-app notification for temp journal entries (new buys detected)
 * Appears in navigation/header when temp entries exist
 * 
 * Features:
 * - Badge count (number of temp entries)
 * - Click to navigate to journal page
 * - Auto-refresh every 30s
 * - Listens to wallet:buys-detected events
 * - Pulse animation for new entries
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getTempEntries } from '@/lib/JournalService'

export default function JournalBadge() {
  const [tempCount, setTempCount] = React.useState(0)
  const [isNew, setIsNew] = React.useState(false)
  const navigate = useNavigate()

  // Load temp entries count
  const loadTempCount = React.useCallback(async () => {
    try {
      const entries = await getTempEntries()
      const oldCount = tempCount
      setTempCount(entries.length)

      // Trigger pulse animation if new entries detected
      if (entries.length > oldCount) {
        setIsNew(true)
        setTimeout(() => setIsNew(false), 3000) // Reset after 3s
      }
    } catch (error) {
      console.error('[JournalBadge] Failed to load temp entries:', error)
    }
  }, [tempCount])

  // Initial load
  React.useEffect(() => {
    loadTempCount()
  }, [])

  // Auto-refresh every 30s
  React.useEffect(() => {
    const interval = setInterval(loadTempCount, 30000)
    return () => clearInterval(interval)
  }, [loadTempCount])

  // Listen to wallet monitor events
  React.useEffect(() => {
    const handleBuysDetected = () => {
      loadTempCount()
    }

    window.addEventListener('wallet:buys-detected', handleBuysDetected)
    return () => window.removeEventListener('wallet:buys-detected', handleBuysDetected)
  }, [loadTempCount])

  // Don't render if no temp entries
  if (tempCount === 0) {
    return null
  }

  return (
    <button
      onClick={() => navigate('/journal?filter=temp')}
      className={`
        relative inline-flex items-center gap-2
        rounded-lg border px-3 py-1.5
        transition-all duration-200
        ${
          isNew
            ? 'animate-pulse border-emerald-500 bg-emerald-500/20 text-emerald-100'
            : 'border-cyan-700 bg-cyan-900/20 text-cyan-100 hover:bg-cyan-900/40'
        }
      `}
      aria-label={`${tempCount} new trade${tempCount !== 1 ? 's' : ''} detected`}
    >
      {/* Icon */}
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Badge count */}
      <span className="text-sm font-semibold">{tempCount}</span>

      {/* Label (hide on mobile) */}
      <span className="hidden text-xs sm:inline">
        New Trade{tempCount !== 1 ? 's' : ''}
      </span>

      {/* Dot indicator (mobile only) */}
      {isNew && (
        <span className="absolute -right-1 -top-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
        </span>
      )}
    </button>
  )
}
