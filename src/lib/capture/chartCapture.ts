export class ChartCaptureError extends Error {
  reason: 'missing-canvas' | 'capture-failed'

  constructor(reason: ChartCaptureError['reason'], message?: string) {
    super(message ?? reason)
    this.reason = reason
  }
}

export async function captureChartSnapshot(
  canvas: HTMLCanvasElement | null | undefined,
  options?: { mimeType?: string; quality?: number },
): Promise<Blob> {
  if (!canvas) {
    throw new ChartCaptureError('missing-canvas')
  }

  const mimeType = options?.mimeType ?? 'image/png'

  return new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new ChartCaptureError('capture-failed'))
            return
          }
          resolve(blob)
        },
        mimeType,
        options?.quality,
      )
    } catch (error) {
      reject(error)
    }
  })
}

export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert blob to DataURL'))
      }
    }

    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read blob as DataURL'))
    }

    reader.readAsDataURL(blob)
  })
}

export const chartCapturePipeline = {
  captureChartSnapshot,
  blobToDataURL,
}

export async function captureChartAsDataURL(
  canvas: HTMLCanvasElement | null | undefined,
  options?: { mimeType?: string; quality?: number },
): Promise<string> {
  const snapshot = await chartCapturePipeline.captureChartSnapshot(canvas, options)
  return chartCapturePipeline.blobToDataURL(snapshot)
}
