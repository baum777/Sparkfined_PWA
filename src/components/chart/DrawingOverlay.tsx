import React, { useCallback, useEffect, useRef } from 'react'
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts'
import type { ChartDrawingRecord } from '@/domain/chart'
import { getChartColors } from '@/lib/chartColors'
import { getBoxBounds, mapDrawingPoints } from '@/lib/chart/drawingGeometry'
import { findHitShape, type DrawingShape } from '@/lib/chart/drawings/hitTest'

type DrawingOverlayProps = {
  containerRef: React.RefObject<HTMLDivElement | null>
  chartApi: IChartApi | null
  mainSeries: ISeriesApi<'Candlestick'> | null
  drawings?: ChartDrawingRecord[]
  interactive?: boolean
  onSelectDrawing?: (drawing: ChartDrawingRecord | null) => void
  renderTrigger?: number
}

const toUtcTimestamp = (ms: number): UTCTimestamp => Math.floor(ms / 1000) as UTCTimestamp

export function DrawingOverlay({
  containerRef,
  chartApi,
  mainSeries,
  drawings,
  interactive,
  onSelectDrawing,
  renderTrigger,
}: DrawingOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const sizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 })
  const shapesRef = useRef<DrawingShape[]>([])
  const selectedIdRef = useRef<string | null>(null)

  const scheduleRender = useCallback(
    (render: () => void) => {
      if (rafRef.current !== null) return

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        render()
      })
    },
    []
  )

  const mapTimeToX = useCallback(
    (timestamp: number) => {
      if (!chartApi) return null
      const x = chartApi.timeScale().timeToCoordinate(toUtcTimestamp(timestamp))
      return x ?? null
    },
    [chartApi]
  )

  const mapPriceToY = useCallback(
    (price: number) => {
      if (!mainSeries) return null
      const y = mainSeries.priceToCoordinate(price)
      return y ?? null
    },
    [mainSeries]
  )

  const renderDrawings = useCallback(() => {
    if (!containerRef.current || !canvasRef.current || !chartApi || !mainSeries) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const { width, height } = sizeRef.current
    const colors = getChartColors()
    const fallbackStroke = colors.textPrimary

    ctx.save()
    ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const shapes: DrawingShape[] = []

    for (const drawing of drawings ?? []) {
      if (!drawing.points.length) continue

      const strokeStyle = drawing.style?.color ?? fallbackStroke
      const lineWidth = drawing.style?.lineWidth ?? 1.5
      const dash = drawing.style?.dash ?? []
      const mappedPoints = mapDrawingPoints(drawing.points, mapTimeToX, mapPriceToY)

      if (mappedPoints.length === 0) continue

      shapes.push({ drawing, points: mappedPoints })

      ctx.beginPath()
      ctx.setLineDash(dash)
      const isSelected = drawing.isSelected || drawing.id === selectedIdRef.current
      ctx.lineWidth = isSelected ? lineWidth + 1 : lineWidth
      ctx.strokeStyle = isSelected ? colors.accent : strokeStyle

      if (drawing.type === 'HLINE') {
        const point = mappedPoints[0]
        if (!point) {
          ctx.setLineDash([])
          continue
        }
        ctx.moveTo(0, point.y)
        ctx.lineTo(width, point.y)
        ctx.stroke()
        ctx.setLineDash([])
        continue
      }

      if (drawing.type === 'LINE' || drawing.type === 'FIB') {
        const [a, b] = mappedPoints
        if (!a || !b) {
          ctx.setLineDash([])
          continue
        }
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
        ctx.setLineDash([])
        continue
      }

      if (drawing.type === 'BOX') {
        const bounds = getBoxBounds(mappedPoints)
        if (!bounds) {
          ctx.setLineDash([])
          continue
        }
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
        ctx.setLineDash([])
      }
    }

    shapesRef.current = shapes
    ctx.restore()
  }, [chartApi, containerRef, drawings, mainSeries, mapPriceToY, mapTimeToX])

  useEffect(() => {
    const resizeCanvas = () => {
      if (!containerRef.current || !canvasRef.current) return

      const dpr = window.devicePixelRatio || 1
      const { clientWidth, clientHeight } = containerRef.current
      sizeRef.current = { width: clientWidth, height: clientHeight }

      canvasRef.current.width = Math.max(1, Math.round(clientWidth * dpr))
      canvasRef.current.height = Math.max(1, Math.round(clientHeight * dpr))
      canvasRef.current.style.width = `${clientWidth}px`
      canvasRef.current.style.height = `${clientHeight}px`

      scheduleRender(renderDrawings)
    }

    resizeCanvas()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resizeCanvas) : null
    if (containerRef.current && observer) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer?.disconnect()
    }
  }, [containerRef, renderDrawings, scheduleRender])

  useEffect(() => {
    if (selectedIdRef.current && !(drawings ?? []).some((drawing) => drawing.id === selectedIdRef.current)) {
      selectedIdRef.current = null
    }
    scheduleRender(renderDrawings)
  }, [drawings, renderDrawings, scheduleRender, renderTrigger])

  useEffect(() => {
    if (!chartApi) return

    const handleRangeChange = () => scheduleRender(renderDrawings)
    const timeScale = chartApi.timeScale()

    timeScale.subscribeVisibleLogicalRangeChange(handleRangeChange)
    timeScale.subscribeVisibleTimeRangeChange(handleRangeChange)

    const priceScale = mainSeries?.priceScale()
    const hasPriceScaleSubscriptions = (scale: typeof priceScale): scale is typeof priceScale & {
      subscribePriceScale: (cb: () => void) => void
      unsubscribePriceScale: (cb: () => void) => void
    } => {
      return Boolean(scale && 'subscribePriceScale' in scale && 'unsubscribePriceScale' in scale)
    }

    if (hasPriceScaleSubscriptions(priceScale)) {
      priceScale.subscribePriceScale(handleRangeChange)
    }

    return () => {
      timeScale.unsubscribeVisibleLogicalRangeChange(handleRangeChange)
      timeScale.unsubscribeVisibleTimeRangeChange(handleRangeChange)
      if (hasPriceScaleSubscriptions(priceScale)) {
        priceScale.unsubscribePriceScale(handleRangeChange)
      }
    }
  }, [chartApi, mainSeries, renderDrawings, scheduleRender])

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (!interactive || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      const dpr = window.devicePixelRatio || 1
      const hit = findHitShape(shapesRef.current, point, dpr)

      selectedIdRef.current = hit?.drawing.id ?? null
      onSelectDrawing?.(hit?.drawing ?? null)
      scheduleRender(renderDrawings)
    },
    [interactive, onSelectDrawing, renderDrawings, scheduleRender]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !interactive) return

    canvas.addEventListener('pointerdown', handlePointerDown)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [handlePointerDown, interactive])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!interactive}
    />
  )
}

export default DrawingOverlay
