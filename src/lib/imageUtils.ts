// Image processing utilities for chart screenshots

export interface ProcessedImage {
  dataUrl: string
  size: number
  width: number
  height: number
}

/**
 * Compress and process image to ensure it's under target size
 * @param file - The image file to process
 * @param maxSizeMB - Maximum size in MB (default 1MB)
 * @param quality - Initial JPEG quality (0-1, default 0.85)
 * @returns Processed image data
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 1,
  quality: number = 0.85
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onerror = () => reject(new Error('Failed to load image'))
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        
        // Scale down if image is too large (max 1920px width)
        const maxWidth = 1920
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        // Draw image with high quality
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)
        
        // Try to compress to target size
        const tryCompress = (currentQuality: number): void => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'))
                return
              }
              
              const sizeMB = blob.size / (1024 * 1024)
              
              // If under target or quality too low, accept it
              if (sizeMB <= maxSizeMB || currentQuality <= 0.3) {
                const reader = new FileReader()
                reader.onload = () => {
                  resolve({
                    dataUrl: reader.result as string,
                    size: blob.size,
                    width,
                    height,
                  })
                }
                reader.onerror = () => reject(new Error('Failed to read blob'))
                reader.readAsDataURL(blob)
              } else {
                // Try with lower quality
                tryCompress(currentQuality - 0.1)
              }
            },
            'image/jpeg',
            currentQuality
          )
        }
        
        tryCompress(quality)
      }
      
      img.src = e.target?.result as string
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Create a cropped version of an image
 * @param dataUrl - The source image data URL
 * @param cropArea - Crop coordinates {x, y, width, height} as percentages (0-1)
 * @returns Cropped image data URL
 */
export async function cropImage(
  dataUrl: string,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onerror = () => reject(new Error('Failed to load image'))
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const { x, y, width, height } = cropArea
      
      // Convert percentages to pixels
      const cropX = Math.floor(img.width * x)
      const cropY = Math.floor(img.height * y)
      const cropWidth = Math.floor(img.width * width)
      const cropHeight = Math.floor(img.height * height)
      
      canvas.width = cropWidth
      canvas.height = cropHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      )
      
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    
    img.src = dataUrl
  })
}

/**
 * Get image dimensions without loading into DOM
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onerror = () => reject(new Error('Failed to load image'))
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      
      img.src = e.target?.result as string
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' }
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Image type not supported. Use JPG, PNG, or WEBP' }
  }
  
  const maxSize = 10 * 1024 * 1024 // 10MB input max
  if (file.size > maxSize) {
    return { valid: false, error: 'Image too large. Maximum 10MB' }
  }
  
  return { valid: true }
}
