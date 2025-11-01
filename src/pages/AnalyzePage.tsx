/**
 * AnalyzePage - Full Analysis Pipeline Integration
 *
 * Pipeline:
 * 1. Image Upload / CA Input
 * 2. Image Preprocessing & Compression
 * 3. OCR Extraction (parallel with API calls)
 * 4. Dexscreener API Call
 * 5. Pump.fun API Call
 * 6. Heuristic Calculation
 * 7. AI Teaser (optional)
 * 8. ResultCard Display
 *
 * Target: Upload → Result ≤ 1s perceived latency
 */

import { useState } from 'react'
import DropZone from '@/components/DropZone'
import ViewStateHandler from '@/components/ViewStateHandler'
import SaveTradeModal from '@/components/SaveTradeModal'
import ResultCard from '@/components/ResultCard'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import { ViewState } from '@/types/viewState'
import { useEventLogger } from '@/hooks/useEventLogger'
import { compressImage } from '@/lib/imageUtils'
import { extractChartText } from '@/lib/ocr/ocrService'
import { getDexscreenerTokenCached } from '@/lib/adapters/dexscreenerAdapter'
import { getPumpfunData } from '@/lib/adapters/pumpfunAdapter'
import { calculateHeuristic } from '@/lib/analysis/heuristicEngine'
import { getTeaserAnalysis } from '@/lib/ai/teaserAdapter'
import type {
  AnalysisResult,
  AITeaserAnalysis,
} from '@/types/analysis'

export default function AnalyzePage() {
  const [viewState, setViewState] = useState<ViewState>('empty')
  const [isSaveTradeOpen, setIsSaveTradeOpen] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [teaserResult, setTeaserResult] = useState<AITeaserAnalysis | null>(null)
  const { log } = useEventLogger()

  /**
   * Main analysis handler
   * Orchestrates the full pipeline
   */
  const handleDropZoneReady = async ({ file, ca }: { file?: File; ca?: string }) => {
    const pipelineStart = performance.now()

    try {
      // Show skeleton immediately (< 200ms target)
      setShowSkeleton(true)
      setViewState('loading')

      if (file) {
        await handleImageAnalysis(file, pipelineStart)
      } else if (ca) {
        await handleCAAnalysis(ca, pipelineStart)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      log('analysis_error', { error: String(error) })
      alert('Analysis failed. Please try again.')
      setViewState('empty')
      setShowSkeleton(false)
    }
  }

  /**
   * Image-based analysis pipeline
   */
  async function handleImageAnalysis(file: File, pipelineStart: number) {
    log('upload_ok', { source: 'image', size: file.size })

    // Step 1: Compress image (target < 1MB)
    const compressed = await compressImage(file, 1, 0.85)
    const imageDataUrl = compressed.dataUrl

    log('image_compressed', {
      originalSize: file.size,
      compressedSize: compressed.size,
      ratio: (compressed.size / file.size).toFixed(2),
    })

    // Step 2 & 3: Run OCR using data URL
    const [ocrResult] = await Promise.all([
      extractChartText(imageDataUrl).catch((err) => {
        console.error('OCR failed:', err)
        return null
      }),
    ])

    log('ocr_complete', {
      confidence: ocrResult?.confidence || 0,
      labels: ocrResult?.labels.length || 0,
      time: ocrResult?.processingTime || 0,
    })

    // Step 4: Heuristic calculation (no market data available for image-only)
    const heuristics = calculateHeuristic({
      price: ocrResult?.indicators.price || 0.000042, // Fallback price
      ocrData: ocrResult || undefined,
    })

    // Step 5: AI Teaser (optional, runs in background)
    const teaserPromise = getTeaserAnalysis({
      imageDataUrl,
      ocrData: ocrResult || undefined,
      heuristic: heuristics,
    })

    // Show results immediately (don't wait for AI teaser)
    const result: AnalysisResult = {
      heuristics,
      analyzedAt: Date.now(),
      processingTime: performance.now() - pipelineStart,
      imageDataUrl,
    }

    setAnalysisResult(result)
    setViewState('result')
    setShowSkeleton(false)

    log('analysis_done', {
      source: 'image',
      time: result.processingTime,
      bias: heuristics.bias,
    })

    // Fetch AI teaser in background
    teaserPromise
      .then((teaser) => {
        setTeaserResult(teaser)
        log('ai_teaser_complete', { provider: teaser.provider, time: teaser.processingTime })
      })
      .catch((err) => {
        console.error('AI teaser failed:', err)
      })
  }

  /**
   * Contract Address analysis pipeline
   */
  async function handleCAAnalysis(ca: string, pipelineStart: number) {
    log('paste_ca_ok', { ca: ca.slice(0, 10) })

    // Step 1: Fetch market data in parallel
    const [dexData, pumpfunData] = await Promise.all([
      getDexscreenerTokenCached(ca).catch((err) => {
        console.error('Dexscreener failed:', err)
        return null
      }),
      getPumpfunData(ca).catch((err) => {
        console.error('Pump.fun failed:', err)
        return null
      }),
    ])

    log('market_data_fetched', {
      dex: !!dexData,
      pumpfun: !!pumpfunData,
    })

    // Step 2: Heuristic calculation with market data
    const heuristics = calculateHeuristic({
      price: dexData?.price || 0.000042,
      high24: dexData?.high24,
      low24: dexData?.low24,
      vol24: dexData?.vol24,
    })

    // Step 3: AI Teaser (optional, runs in background)
    const teaserPromise = getTeaserAnalysis({
      dexData: dexData || undefined,
      pumpfunData: pumpfunData || undefined,
      contractAddress: ca,
      heuristic: heuristics,
    })

    // Build token metadata
    const token = dexData
      ? {
          symbol: dexData.symbol || 'Unknown',
          name: dexData.name || 'Unknown Token',
          address: ca,
          chain: (dexData.chain as any) || 'solana',
          price: dexData.price,
          priceChange24h: dexData.priceChange24h,
          volume24h: dexData.vol24,
          liquidity: dexData.liquidity,
          marketCap: dexData.marketCap,
        }
      : undefined

    // Show results immediately
    const result: AnalysisResult = {
      heuristics,
      token,
      analyzedAt: Date.now(),
      processingTime: performance.now() - pipelineStart,
    }

    setAnalysisResult(result)
    setViewState('result')
    setShowSkeleton(false)

    log('analysis_done', {
      source: 'ca',
      time: result.processingTime,
      bias: heuristics.bias,
      price: token?.price,
    })

    // Fetch AI teaser in background
    teaserPromise
      .then((teaser) => {
        setTeaserResult(teaser)
        log('ai_teaser_complete', { provider: teaser.provider, time: teaser.processingTime })
      })
      .catch((err) => {
        console.error('AI teaser failed:', err)
      })
  }

  /**
   * Handle save trade
   */
  const handleSaveTrade = () => {
    setIsSaveTradeOpen(true)
    log('save_trade_clicked', {
      symbol: analysisResult?.token?.symbol || 'Image',
      price: analysisResult?.token?.price || 0,
    })
  }

  /**
   * Handle new analysis
   */
  const handleNewAnalysis = () => {
    setViewState('empty')
    setAnalysisResult(null)
    setTeaserResult(null)
    log('new_analysis_clicked')
  }

  // Empty state content
  const emptyContent = (
    <div className="px-4 py-12 animate-fade-in">
      <DropZone onReady={handleDropZoneReady} />

      {/* Demo Mode Button */}
      <div className="text-center mt-8">
        <button
          onClick={() => {
            // Demo mode - mock analysis
            const mockResult: AnalysisResult = {
              heuristics: {
                supportLevel: 0.00004,
                resistanceLevel: 0.000048,
                rangeSize: 'Medium',
                volatility24h: 12.5,
                bias: 'Bullish',
                keyLevels: [0.000038, 0.000042, 0.000046, 0.00005],
                roundNumbers: [0.00004, 0.000045, 0.00005],
                entryZone: { min: 0.0000412, max: 0.0000428 },
                stopLoss: 0.000038,
                takeProfit1: 0.000046,
                takeProfit2: 0.000052,
                confidence: 0.75,
                timestamp: Date.now(),
                source: 'heuristic',
              },
              token: {
                symbol: 'DEMO',
                name: 'Demo Token',
                address: 'DemoCA1234567890',
                chain: 'solana',
                price: 0.000042,
                priceChange24h: 8.5,
                volume24h: 125000,
                liquidity: 50000,
              },
              analyzedAt: Date.now(),
              processingTime: 450,
            }

            setAnalysisResult(mockResult)
            setViewState('result')
            log('demo_mode_activated')
          }}
          className="btn-ghost text-sm"
        >
          💡 Try Demo Mode
        </button>
      </div>
    </div>
  )

  // Result content
  const resultContent = analysisResult ? (
    <div className="px-4 py-4 max-w-2xl mx-auto">
      <ResultCard
        analysis={analysisResult}
        teaser={teaserResult || undefined}
        onSave={handleSaveTrade}
        onNewAnalysis={handleNewAnalysis}
      />
    </div>
  ) : null

  // Loading content
  const loadingContent = showSkeleton ? <LoadingSkeleton type="analysis" /> : null

  return (
    <>
      {viewState === 'loading' && loadingContent ? (
        loadingContent
      ) : (
        <ViewStateHandler
          state={viewState}
          emptyContent={emptyContent}
          resultContent={resultContent}
        />
      )}
      <SaveTradeModal
        isOpen={isSaveTradeOpen}
        onClose={() => setIsSaveTradeOpen(false)}
        prefillToken={
          analysisResult?.token?.symbol ||
          (analysisResult?.token?.address
            ? `CA: ${analysisResult.token.address.slice(0, 8)}...`
            : 'Token')
        }
        prefillPrice={analysisResult?.token?.price || 0}
      />
    </>
  )
}
