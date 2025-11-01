import { useEffect, useState } from 'react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineToast, setShowOfflineToast] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineToast(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineToast(true)
      // Auto-hide toast after 3 seconds
      setTimeout(() => setShowOfflineToast(false), 3000)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Persistent offline badge (always visible when offline)
  if (!isOnline) {
    return (
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md bg-brand/90 backdrop-blur-sm border border-brand text-white text-xs font-mono font-medium shadow-glow-brand flex items-center gap-2 animate-fade-in">
        <span className="w-2 h-2 bg-white rounded-full animate-glow-pulse"></span>
        Offline Mode
      </div>
    )
  }

  // Transient toast when going offline
  if (showOfflineToast) {
    return (
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md bg-surface border border-border text-text-primary text-sm font-sans shadow-card-elevated animate-fade-in">
        📴 You're offline — cached data available
      </div>
    )
  }

  return null
}
