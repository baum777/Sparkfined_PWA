import { useState, useRef, useEffect, useCallback } from 'react'
import Button from '@/components/ui/Button'

interface DropZoneProps {
  onReady: (payload: { file?: File; ca?: string }) => void
}

export default function DropZone({ onReady }: DropZoneProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [ca, setCa] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const isEvmCA = useCallback((t: string) => /^0x[a-fA-F0-9]{40}$/.test(t.trim()), [])
  const isSolCA = useCallback((t: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(t.trim()), [])
  const validCA = useCallback((t: string) => isEvmCA(t) || isSolCA(t), [isEvmCA, isSolCA])

  const validateAndProcessFile = useCallback((file: File): boolean => {
    setError('')
    
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return false
    }
    
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      setError('Image must be less than 2MB')
      return false
    }
    
    return true
  }, [setError])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer?.files?.[0]
    if (!file) return
    
    if (validateAndProcessFile(file)) {
      onReady({ file })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (validateAndProcessFile(file)) {
      onReady({ file })
    }
  }

  const trySubmitCA = () => {
    setError('')
    
    if (!ca.trim()) {
      setError('Please enter a contract address')
      return
    }
    
    if (!validCA(ca)) {
      setError('Invalid contract address. Expected EVM (0x...) or Solana format')
      return
    }
    
    onReady({ ca: ca.trim() })
  }

  // Global paste handler
  useEffect(() => {
    const globalPasteHandler = (e: ClipboardEvent) => {
      // Only handle if not focused on input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return
      }
      
      const items = e.clipboardData?.items
      if (items) {
        for (const item of Array.from(items)) {
          if (item.type?.startsWith('image/')) {
            const file = item.getAsFile()
            if (file && validateAndProcessFile(file)) {
              onReady({ file })
              return
            }
          }
        }
      }
      
      const txt = e.clipboardData?.getData?.('text')
      if (txt && validCA(txt)) {
        setCa(txt.trim())
        onReady({ ca: txt.trim() })
      }
    }

    window.addEventListener('paste', globalPasteHandler)
    return () => window.removeEventListener('paste', globalPasteHandler)
  }, [onReady, validCA, validateAndProcessFile])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 ${
          isDragging
            ? 'border-accent bg-accent/10 scale-[1.02]'
            : 'border-border-accent/30 hover:border-border-accent/50 bg-surface/50'
        }`}
      >
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface border border-border-accent/20">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h3 className="text-lg font-display font-semibold text-text-primary">
              Drop Chart Screenshot
            </h3>
            <p className="text-sm text-text-secondary">
              Drag & drop, paste from clipboard, or click to upload
            </p>
            <p className="text-xs text-text-tertiary font-mono">
              Max 2MB • PNG, JPG, WEBP
            </p>
          </div>

          {/* Upload Button */}
          <Button onClick={() => fileRef.current?.click()} type="button">
            📸 Select Image
          </Button>
          
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-subtle"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-sm text-text-tertiary bg-bg">or</span>
        </div>
      </div>

      {/* Contract Address Input */}
      <div className="space-y-3">
        <div className="space-y-2">
          <label htmlFor="ca-input" className="block text-sm font-medium text-text-secondary">
            Contract Address (CA)
          </label>
          <input
            id="ca-input"
            type="text"
            value={ca}
            onChange={(e) => {
              setCa(e.target.value)
              setError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && trySubmitCA()}
            onPaste={(e: React.ClipboardEvent) => {
              const txt = e.clipboardData.getData('text')
              if (validCA(txt)) {
                e.preventDefault()
                setCa(txt.trim())
                onReady({ ca: txt.trim() })
              }
            }}
            placeholder="Paste or type: 0x... (EVM) or mint address (Solana)"
            className="input w-full font-mono text-sm"
          />
          <p className="text-xs text-text-tertiary">
            💡 Tip: Paste directly from Dexscreener or your wallet
          </p>
        </div>

        <Button onClick={trySubmitCA} disabled={!ca.trim()} className="w-full">
          🔍 Analyze by CA
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-bear/10 border border-bear/30 animate-slide-up">
          <p className="text-sm text-bear flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center text-xs text-text-tertiary space-y-1 pt-4 border-t border-border-subtle">
        <p>⌘V / Ctrl+V to paste anywhere on this page</p>
        <p className="text-cyan">All analysis happens locally • No data sent to servers</p>
      </div>
    </div>
  )
}
