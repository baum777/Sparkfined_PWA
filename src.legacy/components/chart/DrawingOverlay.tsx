import React, { useCallback, useEffect, useRef } from 'react'
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts'
import type { ChartDrawingPoint, ChartDrawingRecord, ChartTimeframe } from '@/domain/chart'
import type { ChartInteractionMode } from '@/hooks/useChartInteractionMode'
import { getChartColors } from '@/lib/chartColors'
import { getBoxBounds, mapDrawingPoints, type PixelPoint } from '@/lib/chart/drawingGeometry'
import { moveDrawing, resizeDrawingAtHandle } from '@/lib/chart/drawings/editing'
import { computeFibLevelPrices, computeChannelGeometry, DEFAULT_FIB_LEVELS } from '@/lib/chart/drawings/geometry'
import {
  findHandleHit,
  getDrawingHandles,
  isInsideBox,
  mergeWithPreview,
  type DrawingHandle,
} from '@/lib/chart/drawings/handles'
import { findHitShape, type DrawingShape } from '@/lib/chart/drawings/hitTest'

type DrawingOverlayProps = {
  containerRef: React.RefObject<HTMLDivElement | null>
  chartApi: IChartApi | null
  mainSeries: ISeriesApi<'Candlestick'> | null
  drawings?: ChartDrawingRecord[]
  interactive?: boolean
  interactionMode?: ChartInteractionMode
  symbol: string
  timeframe: ChartTimeframe
  selectedId?: string | null
  onSelectDrawing?: (drawing: ChartDrawingRecord | null) => void
  onCreateDrawing?: (drawing: ChartDrawingRecord) => void
  onUpdateDrawing?: (drawing: ChartDrawingRecord) => void
  onCancelDraft?: () => void
  renderTrigger?: number
}

type EditSession = {
  drawingId: string
  kind: 'move' | 'resize'
  handle?: DrawingHandle
  startPoint: ChartDrawingPoint
  origin: ChartDrawingRecord
  preview?: ChartDrawingRecord
}

const toUtcTimestamp = (ms: number): UTCTimestamp => Math.floor(ms / 1000) as UTCTimestamp

type CreationConfig = {
  type: ChartDrawingRecord['type']
  requiredPoints: number
  defaults?: Partial<ChartDrawingRecord>
}

const CREATION_CONFIG: Partial<Record<ChartInteractionMode, CreationConfig>> = {
  'create-line': { type: 'LINE', requiredPoints: 2 },
  'create-box': { type: 'BOX', requiredPoints: 2 },
  'create-fib': { type: 'FIB', requiredPoints: 2, defaults: { levels: DEFAULT_FIB_LEVELS } },
  'create-channel': { type: 'CHANNEL', requiredPoints: 3 },
}

const resolveFibLines = (
  drawing: ChartDrawingRecord,
  mapTimeToX: (ms: number) => number | null,
  mapPriceToY: (price: number) => number | null
) => {
  if (drawing.points.length < 2) return []
  const [p1, p2] = drawing.points
  if (!p1 || !p2) return []

  const xStart = mapTimeToX(Math.min(p1.t, p2.t))
  const xEnd = mapTimeToX(Math.max(p1.t, p2.t))
  if (xStart === null || xEnd === null) return []

  const prices = computeFibLevelPrices(p1, p2, drawing.levels ?? DEFAULT_FIB_LEVELS)
  return prices
    .map(({ level, price }) => {
      const y = mapPriceToY(price)
      if (y === null) return null
      return { level, y, xStart, xEnd }
    })
    .filter((line): line is { level: number; y: number; xStart: number; xEnd: number } => Boolean(line))
}

const resolveChannelGeometry = (points: PixelPoint[]) => computeChannelGeometry(points)

const resolveMode = (mode: ChartInteractionMode | undefined, interactive?: boolean): ChartInteractionMode => {
  if (mode) return mode
  if (interactive) return 'select'
  return 'view'
}

export function DrawingOverlay({
  containerRef,
  chartApi,
  mainSeries,
  drawings,
  interactive,
  interactionMode,
  symbol,
  timeframe,
  selectedId,
  onSelectDrawing,
  onCreateDrawing,
  onUpdateDrawing,
  onCancelDraft,
  renderTrigger,
}: DrawingOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const sizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 })
  const shapesRef = useRef<DrawingShape[]>([])
  const selectedIdRef = useRef<string | null>(selectedId ?? null)
  const draftRef = useRef<ChartDrawingRecord | null>(null)
  const editSessionRef = useRef<EditSession | null>(null)

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

  const mapXToTime = useCallback(
    (x: number): number | null => {
      if (!chartApi) return null
      const time = chartApi.timeScale().coordinateToTime(x)
      if (!time) return null
      if (typeof time === 'number') return time * 1000
      if (typeof time === 'object' && 'timestamp' in time) return (time as { timestamp: number }).timestamp * 1000
      if (typeof time === 'object' && 'year' in time && 'month' in time && 'day' in time) {
        const { year, month, day } = time as { year: number; month: number; day: number }
        return Date.UTC(year, month - 1, day)
      }
      return null
    },
    [chartApi]
  )

  const mapYToPrice = useCallback(
    (y: number): number | null => {
      if (!mainSeries) return null
      const price = mainSeries.coordinateToPrice(y)
      return price ?? null
    },
    [mainSeries]
  )

  const resolveChartPoint = useCallback(
    (point: PixelPoint): ChartDrawingPoint | null => {
      const time = mapXToTime(point.x)
      const price = mapYToPrice(point.y)
      if (time === null || price === null) return null
      return { t: time, p: price }
    },
    [mapXToTime, mapYToPrice]
  )

  const renderDrawings = useCallback(() => {
    if (!containerRef.current || !canvasRef.current || !chartApi || !mainSeries) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const { width, height } = sizeRef.current
    const colors = getChartColors()
    const fallbackStroke = colors.textPrimary
    const dpr = window.devicePixelRatio || 1

    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const preview = editSessionRef.current?.preview
    const draft = draftRef.current
    const combined = mergeWithPreview(drawings ?? [], preview)
    const renderList = draft ? [...combined, draft] : combined

    const shapes: DrawingShape[] = []

    for (const drawing of renderList) {
      if (!drawing.points.length) continue

      const strokeStyle = drawing.style?.color ?? fallbackStroke
      const lineWidth = drawing.style?.lineWidth ?? 1.5
      const dash = drawing.style?.dash ?? []
      const mappedPoints = mapDrawingPoints(drawing.points, mapTimeToX, mapPriceToY)

      if (mappedPoints.length === 0) continue

      const shape: DrawingShape = { drawing, points: mappedPoints }

      const isPreview = preview === drawing || draft === drawing
      const isSelected = drawing.isSelected || drawing.id === selectedIdRef.current || isPreview

      ctx.beginPath()
      ctx.setLineDash(isPreview ? [6, 4] : dash)
      ctx.lineWidth = isSelected ? lineWidth + 1 : lineWidth
      ctx.strokeStyle = isPreview ? colors.accent : isSelected ? colors.accent : strokeStyle

      if (drawing.type === 'HLINE') {
        const point = mappedPoints[0]
        if (point) {
          ctx.moveTo(0, point.y)
          ctx.lineTo(width, point.y)
          ctx.stroke()
        }
        ctx.setLineDash([])
        shapes.push(shape)
        continue
      }

      if (drawing.type === 'LINE') {
        const [a, b] = mappedPoints
        if (a && b) {
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
        ctx.setLineDash([])
        shapes.push(shape)
        continue
      }

      if (drawing.type === 'FIB') {
        const lines = resolveFibLines(drawing, mapTimeToX, mapPriceToY)
        if (lines.length === 0) {
          ctx.setLineDash([])
          continue
        }

        shape.meta = { fibLevels: lines }
        for (const line of lines) {
          ctx.moveTo(line.xStart, line.y)
          ctx.lineTo(line.xEnd, line.y)
          ctx.stroke()
        }

        ctx.setLineDash([])
        shapes.push(shape)
        continue
      }

      if (drawing.type === 'BOX') {
        const bounds = getBoxBounds(mappedPoints)
        if (bounds) {
          ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
        }
        ctx.setLineDash([])
        shapes.push(shape)
        continue
      }

      if (drawing.type === 'CHANNEL') {
        const geometry = resolveChannelGeometry(mappedPoints)
        if (!geometry) {
          if (mappedPoints.length >= 2) {
            const [a, b] = mappedPoints
            if (a && b) {
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
              ctx.setLineDash([])
              shapes.push(shape)
            }
          }
          continue
        }

        shape.meta = { channel: geometry }

        if (drawing.style?.fillOpacity !== 0 && geometry.polygon.length > 0) {
          const [first, ...rest] = geometry.polygon
          if (first) {
            ctx.save()
            ctx.globalAlpha = drawing.style?.fillOpacity ?? 0.12
            ctx.fillStyle = strokeStyle
            ctx.beginPath()
            ctx.moveTo(first.x, first.y)
            rest.forEach((p) => ctx.lineTo(p.x, p.y))
            ctx.closePath()
            ctx.fill()
            ctx.restore()
            ctx.beginPath()
            ctx.setLineDash(isPreview ? [6, 4] : dash)
            ctx.lineWidth = isSelected ? lineWidth + 1 : lineWidth
            ctx.strokeStyle = isPreview ? colors.accent : isSelected ? colors.accent : strokeStyle
          }
        }

        ctx.moveTo(geometry.base[0].x, geometry.base[0].y)
        ctx.lineTo(geometry.base[1].x, geometry.base[1].y)
        ctx.stroke()

        ctx.moveTo(geometry.parallel[0].x, geometry.parallel[0].y)
        ctx.lineTo(geometry.parallel[1].x, geometry.parallel[1].y)
        ctx.stroke()

        ctx.setLineDash([])
        shapes.push(shape)
        continue
      }
    }

    shapesRef.current = shapes

    const selectedShape = shapes.find((shape) => shape.drawing.id && shape.drawing.id === selectedIdRef.current)
    if (selectedShape) {
      const handles = getDrawingHandles(selectedShape)
      ctx.fillStyle = colors.surface
      ctx.strokeStyle = colors.accent
      for (const handle of handles) {
        ctx.beginPath()
        ctx.rect(handle.position.x - 5, handle.position.y - 5, 10, 10)
        ctx.fill()
        ctx.stroke()
      }
    }

    ctx.restore()
  }, [chartApi, containerRef, drawings, mainSeries, mapPriceToY, mapTimeToX])

  const clearDrafts = useCallback(() => {
    const hadDraft = Boolean(draftRef.current || editSessionRef.current)
    draftRef.current = null
    editSessionRef.current = null
    if (hadDraft) {
      onCancelDraft?.()
      scheduleRender(renderDrawings)
    }
  }, [onCancelDraft, renderDrawings, scheduleRender])

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
    if (selectedId && selectedId !== selectedIdRef.current) {
      selectedIdRef.current = selectedId
    }
    scheduleRender(renderDrawings)
  }, [renderDrawings, scheduleRender, selectedId, renderTrigger])

  useEffect(() => {
    scheduleRender(renderDrawings)
  }, [drawings, renderDrawings, scheduleRender])

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

  useEffect(() => {
    clearDrafts()
    selectedIdRef.current = selectedId ?? null
    scheduleRender(renderDrawings)
  }, [clearDrafts, renderDrawings, scheduleRender, selectedId, symbol, timeframe])

  const mode = resolveMode(interactionMode, interactive)
  const creationConfig = CREATION_CONFIG[mode]
  const isCreateMode = Boolean(creationConfig)
  const canEdit = mode === 'select'

  useEffect(() => {
    clearDrafts()
  }, [clearDrafts, mode])

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (mode === 'view' || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      const dpr = window.devicePixelRatio || 1

      if (isCreateMode && creationConfig) {
        const chartPoint = resolveChartPoint(point)
        if (!chartPoint) return

        if (!draftRef.current || draftRef.current.type !== creationConfig.type) {
          draftRef.current = {
            symbol,
            timeframe,
            type: creationConfig.type,
            points: [chartPoint],
            origin: 'manual',
            style: { color: getChartColors().accent, fillOpacity: creationConfig.type === 'CHANNEL' ? 0.12 : undefined },
            levels: creationConfig.defaults?.levels,
          }
          scheduleRender(renderDrawings)
          return
        }

        const nextPoints = [...draftRef.current.points, chartPoint].slice(0, creationConfig.requiredPoints)
        if (nextPoints.length >= creationConfig.requiredPoints) {
          const committed: ChartDrawingRecord = {
            ...draftRef.current,
            points: nextPoints,
          }

          draftRef.current = null
          onCreateDrawing?.(committed)
        } else {
          draftRef.current = { ...draftRef.current, points: nextPoints }
        }

        scheduleRender(renderDrawings)
        return
      }

      const hit = findHitShape(shapesRef.current, point, dpr)
      selectedIdRef.current = hit?.drawing.id ?? null
      onSelectDrawing?.(hit?.drawing ?? null)

      if (!canEdit || !selectedIdRef.current) {
        scheduleRender(renderDrawings)
        return
      }

      const selectedShape = shapesRef.current.find((shape) => shape.drawing.id === selectedIdRef.current)
      const chartPoint = resolveChartPoint(point)
      if (!selectedShape || !chartPoint || !selectedShape.drawing.id) return

      const handles = getDrawingHandles(selectedShape)
      const handleHit = findHandleHit(handles, point, dpr)

      if (handleHit) {
        editSessionRef.current = {
          drawingId: selectedShape.drawing.id,
          kind: 'resize',
          handle: handleHit,
          startPoint: chartPoint,
          origin: selectedShape.drawing,
        }
        canvasRef.current?.setPointerCapture(event.pointerId)
        return
      }

      if (hit && hit.drawing.id === selectedShape.drawing.id) {
        editSessionRef.current = {
          drawingId: selectedShape.drawing.id,
          kind: 'move',
          startPoint: chartPoint,
          origin: selectedShape.drawing,
        }
        canvasRef.current?.setPointerCapture(event.pointerId)
        return
      }

      if (selectedShape.drawing.type === 'BOX' && isInsideBox(selectedShape.points, point, dpr)) {
        editSessionRef.current = {
          drawingId: selectedShape.drawing.id,
          kind: 'move',
          startPoint: chartPoint,
          origin: selectedShape.drawing,
        }
        canvasRef.current?.setPointerCapture(event.pointerId)
        return
      }

      scheduleRender(renderDrawings)
    },
    [canEdit, creationConfig, isCreateMode, mode, onCreateDrawing, onSelectDrawing, renderDrawings, resolveChartPoint, scheduleRender, symbol, timeframe]
  )

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (mode === 'view' || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      if (isCreateMode && creationConfig && draftRef.current && draftRef.current.type === creationConfig.type) {
        const chartPoint = resolveChartPoint(point)
        if (!chartPoint) return
        const basePoints = draftRef.current.points.slice(0, creationConfig.requiredPoints - 1)
        draftRef.current = { ...draftRef.current, points: [...basePoints, chartPoint] }
        scheduleRender(renderDrawings)
        return
      }

      const session = editSessionRef.current
      if (!session) return

      const chartPoint = resolveChartPoint(point)
      if (!chartPoint) return

      if (session.kind === 'move') {
        const delta = {
          t: chartPoint.t - session.startPoint.t,
          p: chartPoint.p - session.startPoint.p,
        }
        editSessionRef.current = {
          ...session,
          preview: moveDrawing(session.origin, delta),
        }
        scheduleRender(renderDrawings)
        return
      }

      if (session.kind === 'resize' && session.handle) {
        editSessionRef.current = {
          ...session,
          preview: resizeDrawingAtHandle(session.origin, session.handle.id, chartPoint, session.handle.pointIndex),
        }
        scheduleRender(renderDrawings)
      }
    },
    [creationConfig, isCreateMode, mode, renderDrawings, resolveChartPoint, scheduleRender]
  )

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (!canvasRef.current) return

      if (canvasRef.current.hasPointerCapture?.(event.pointerId)) {
        canvasRef.current.releasePointerCapture(event.pointerId)
      }

      if (mode === 'view') return

      if (editSessionRef.current?.preview) {
        onUpdateDrawing?.(editSessionRef.current.preview)
      }

      if (editSessionRef.current) {
        editSessionRef.current = null
        scheduleRender(renderDrawings)
      }
    },
    [mode, onUpdateDrawing, renderDrawings, scheduleRender]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearDrafts()
      }
    }

    const shouldListen = mode !== 'view'

    if (shouldListen) {
      canvas.addEventListener('pointerdown', handlePointerDown)
      canvas.addEventListener('pointermove', handlePointerMove)
      canvas.addEventListener('pointerup', handlePointerUp)
      canvas.addEventListener('pointercancel', handlePointerUp)
      window.addEventListener('keydown', handleKeydown)
    }

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('pointercancel', handlePointerUp)
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [clearDrafts, handlePointerDown, handlePointerMove, handlePointerUp, mode])

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
      className={`absolute inset-0 h-full w-full ${mode === 'view' ? 'pointer-events-none' : 'pointer-events-auto'}`}
      aria-hidden={mode === 'view'}
    />
  )
}

export default DrawingOverlay
