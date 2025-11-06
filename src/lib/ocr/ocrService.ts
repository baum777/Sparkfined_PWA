/**
 * OCR Service using Tesseract.js
 *
 * Extracts text labels from chart images
 * Target: < 1s OCR processing time
 * Regex: /RSI|Bollinger|EMA|SMA|Price|Volume/i
 *
 * DoD: OCR < 1s, returns at least 1 label or "none"
 */

import { createWorker, type Worker } from 'tesseract.js'
import type { OCRResult } from '@/types/analysis'

// Singleton worker instance
let workerInstance: Worker | null = null

/**
 * Initialize Tesseract worker
 * Lazy-loaded on first OCR request
 */
async function getWorker(): Promise<Worker> {
  if (workerInstance) {
    return workerInstance
  }

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
        console.log('[OCR]', m)
      }
    },
  })

  // Optimize for chart text recognition
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.%:$-',
  })

  workerInstance = worker
  return worker
}

/**
 * Extract text from image using OCR
 * @param imageFile - Chart image file
 * @returns OCR result with labels and indicators
 */
export async function extractChartText(imageFile: File | string): Promise<OCRResult> {
  const startTime = performance.now()

  try {
    const worker = await getWorker()

    // Perform OCR
    const {
      data: { text, confidence },
    } = await worker.recognize(imageFile)

    const processingTime = performance.now() - startTime

    // Extract labels and indicators
    const labels = extractLabels(text)
    const indicators = parseIndicators(text)

    return {
      text,
      confidence: confidence / 100, // Normalize to 0-1
      labels,
      indicators,
      processingTime,
    }
  } catch (error) {
    console.error('OCR failed:', error)

    // Return empty result on error
    return {
      text: '',
      confidence: 0,
      labels: [],
      indicators: {},
      processingTime: performance.now() - startTime,
    }
  }
}

/**
 * Extract technical indicator labels from OCR text
 * Pattern: RSI, Bollinger, EMA, SMA, Price, Volume
 */
function extractLabels(text: string): string[] {
  const labelPattern = /RSI|Bollinger|EMA|SMA|Price|Volume|MACD|Stochastic|ADX/gi
  const matches = text.match(labelPattern)

  if (!matches) {
    return []
  }

  // Deduplicate and normalize
  return [...new Set(matches.map((m) => m.toUpperCase()))]
}

/**
 * Parse indicator values from OCR text
 */
function parseIndicators(text: string): OCRResult['indicators'] {
  const indicators: OCRResult['indicators'] = {}

  // RSI pattern: "RSI: 72" or "RSI 72" or "RSI(14): 72"
  const rsiMatch = text.match(/RSI[:\s\(]*(\d+)/i)
  if (rsiMatch && rsiMatch[1]) {
    indicators.rsi = parseInt(rsiMatch[1], 10)
  }

  // Bollinger Band status
  if (/bollinger.*upper/i.test(text)) {
    indicators.bollinger = 'upper'
  } else if (/bollinger.*lower/i.test(text)) {
    indicators.bollinger = 'lower'
  } else if (/bollinger.*middle/i.test(text)) {
    indicators.bollinger = 'middle'
  }

  // EMA values: "EMA(20): 42850" or "EMA 20: 42850"
  const emaMatches = text.matchAll(/EMA[\s\(]*(\d+)[\s\)]*:?\s*([\d,.]+)/gi)
  const emaValues: number[] = []
  for (const match of emaMatches) {
    if (!match[2]) continue;
    const value = parseFloat(match[2].replace(/,/g, ''))
    if (!isNaN(value)) {
      emaValues.push(value)
    }
  }
  if (emaValues.length > 0) {
    indicators.ema = emaValues
  }

  // SMA values: similar to EMA
  const smaMatches = text.matchAll(/SMA[\s\(]*(\d+)[\s\)]*:?\s*([\d,.]+)/gi)
  const smaValues: number[] = []
  for (const match of smaMatches) {
    if (!match[2]) continue;
    const value = parseFloat(match[2].replace(/,/g, ''))
    if (!isNaN(value)) {
      smaValues.push(value)
    }
  }
  if (smaValues.length > 0) {
    indicators.sma = smaValues
  }

  // Price: "Price: $42,850.00" or "$42850"
  const priceMatch = text.match(/[\$]?([\d,]+\.?\d*)/i)
  if (priceMatch && priceMatch[1]) {
    const price = parseFloat(priceMatch[1].replace(/,/g, ''))
    if (!isNaN(price) && price > 0) {
      indicators.price = price
    }
  }

  // Volume: "Volume: 1.2M" or "Vol: 1,234,567"
  const volumeMatch = text.match(/vol(?:ume)?[:\s]*([\d,.]+\s*[KMB]?)/i)
  if (volumeMatch && volumeMatch[1]) {
    indicators.volume = volumeMatch[1].trim()
  }

  return indicators
}

/**
 * Batch OCR for multiple images (future enhancement)
 */
export async function extractChartTextBatch(images: (File | string)[]): Promise<OCRResult[]> {
  const results: OCRResult[] = []

  for (const image of images) {
    const result = await extractChartText(image)
    results.push(result)
  }

  return results
}

/**
 * Preprocess image for better OCR accuracy
 * - Increase contrast
 * - Convert to grayscale
 * - Enhance text regions
 */
export async function preprocessImage(imageFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Convert to grayscale and increase contrast
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] ?? 0;
        const g = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;
        const gray = r * 0.299 + g * 0.587 + b * 0.114
        const contrast = 1.5 // Increase contrast
        const enhanced = ((gray - 128) * contrast + 128)

        data[i] = enhanced // R
        data[i + 1] = enhanced // G
        data[i + 2] = enhanced // B
      }

      ctx.putImageData(imageData, 0, 0)

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      }, 'image/png')
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(imageFile)
  })
}

/**
 * Cleanup worker on app unmount
 */
export async function terminateOCR(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate()
    workerInstance = null
  }
}
