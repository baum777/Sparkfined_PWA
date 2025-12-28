import { describe, expect, it, vi } from 'vitest'

import {
  ChartCaptureError,
  blobToDataURL,
  captureChartAsDataURL,
  captureChartSnapshot,
  chartCapturePipeline,
} from '../chartCapture'

describe('captureChartSnapshot', () => {
  it('throws when canvas is missing', async () => {
    await expect(captureChartSnapshot(null)).rejects.toEqual(
      new ChartCaptureError('missing-canvas'),
    )
  })

  it('resolves with a Blob when toBlob succeeds', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/png' })
    const toBlob = vi.fn<
      Parameters<HTMLCanvasElement['toBlob']>,
      ReturnType<HTMLCanvasElement['toBlob']>
    >((callback, _type, _quality) => {
      callback?.(mockBlob)
      return undefined
    })

    const canvas = { toBlob } as unknown as HTMLCanvasElement

    const result = await captureChartSnapshot(canvas)

    expect(result).toBe(mockBlob)
    expect(toBlob).toHaveBeenCalledTimes(1)
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png', undefined)
  })

  it('throws capture-failed when toBlob returns null', async () => {
    const toBlob = vi.fn<Parameters<HTMLCanvasElement['toBlob']>, void>((callback) => {
      callback?.(null)
    })

    const canvas = { toBlob } as unknown as HTMLCanvasElement

    await expect(captureChartSnapshot(canvas)).rejects.toEqual(
      new ChartCaptureError('capture-failed'),
    )
  })
})

describe('blobToDataURL', () => {
  it('returns a valid data URL string', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' })

    const result = await blobToDataURL(blob)

    expect(result).toMatch(/^data:.*;base64,/)
  })
})

describe('captureChartAsDataURL', () => {
  it('captures snapshot and converts to data URL', async () => {
    const canvas = { toBlob: vi.fn() } as unknown as HTMLCanvasElement
    const mockBlob = new Blob(['chart'], { type: 'image/png' })
    const captureSpy = vi
      .spyOn(chartCapturePipeline, 'captureChartSnapshot')
      .mockResolvedValue(mockBlob)
    const dataURLSpy = vi
      .spyOn(chartCapturePipeline, 'blobToDataURL')
      .mockResolvedValue('data:image/png;base64,ABC')

    const result = await captureChartAsDataURL(canvas)

    expect(result).toBe('data:image/png;base64,ABC')
    expect(captureSpy).toHaveBeenCalledWith(canvas, undefined)
    expect(dataURLSpy).toHaveBeenCalledWith(mockBlob)
  })
})
