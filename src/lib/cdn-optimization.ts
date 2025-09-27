import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage'
import { dbPool } from './database-connection-pool'

interface CDNConfig {
  enabled: boolean
  provider: 'cloudflare' | 'aws' | 'azure' | 'firebase'
  cacheTtl: number
  compression: boolean
  imageOptimization: boolean
  videoOptimization: boolean
  maxFileSize: number
  allowedTypes: string[]
}

interface FileOptimization {
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  format: string
  quality: number
  dimensions?: { width: number; height: number }
}

interface UploadResult {
  success: boolean
  url?: string
  optimizedUrl?: string
  metadata?: any
  error?: string
}

class CDNOptimizer {
  private static instance: CDNOptimizer
  private config: CDNConfig
  private cache: Map<string, { url: string; expires: number }> = new Map()

  constructor(config: CDNConfig = {
    enabled: true,
    provider: 'firebase',
    cacheTtl: 3600000, // 1 hour
    compression: true,
    imageOptimization: true,
    videoOptimization: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf']
  }) {
    this.config = config
  }

  static getInstance(config?: CDNConfig): CDNOptimizer {
    if (!CDNOptimizer.instance) {
      CDNOptimizer.instance = new CDNOptimizer(config)
    }
    return CDNOptimizer.instance
  }

  async uploadFile(
    file: File,
    path: string,
    options: {
      optimize?: boolean
      quality?: number
      maxWidth?: number
      maxHeight?: number
      generateThumbnail?: boolean
    } = {}
  ): Promise<UploadResult> {
    try {
      // Validate file
      if (!this.validateFile(file)) {
        return {
          success: false,
          error: 'Invalid file type or size'
        }
      }

      const connection = await dbPool.getConnection()
      
      // Generate optimized versions if needed
      let optimizedFile = file
      let optimization: FileOptimization | null = null

      if (options.optimize && this.shouldOptimize(file)) {
        const optimizationResult = await this.optimizeFile(file, options)
        optimizedFile = optimizationResult.file
        optimization = optimizationResult.optimization
      }

      // Upload to storage
      const storageRef = ref(connection.storage, path)
      const uploadResult = await uploadBytes(storageRef, optimizedFile)
      const downloadUrl = await getDownloadURL(uploadResult.ref)

      // Generate thumbnail if requested
      let thumbnailUrl: string | undefined
      if (options.generateThumbnail && this.isImage(file)) {
        thumbnailUrl = await this.generateThumbnail(file, path)
      }

      // Store metadata
      const metadata = {
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        optimization,
        thumbnailUrl
      }

      return {
        success: true,
        url: downloadUrl,
        optimizedUrl: optimization ? downloadUrl : undefined,
        metadata
      }

    } catch (error) {
      console.error('File upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  async getFileUrl(path: string, options: {
    width?: number
    height?: number
    quality?: number
    format?: string
  } = {}): Promise<string | null> {
    const cacheKey = `${path}_${JSON.stringify(options)}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return cached.url
    }

    try {
      const connection = await dbPool.getConnection()
      const storageRef = ref(connection.storage, path)
      
      // Generate optimized URL if needed
      let url: string
      if (options.width || options.height || options.quality || options.format) {
        url = await this.generateOptimizedUrl(storageRef, options)
      } else {
        url = await getDownloadURL(storageRef)
      }

      // Cache the URL
      this.cache.set(cacheKey, {
        url,
        expires: Date.now() + this.config.cacheTtl
      })

      return url
    } catch (error) {
      console.error('Failed to get file URL:', error)
      return null
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      const connection = await dbPool.getConnection()
      const storageRef = ref(connection.storage, path)
      await deleteObject(storageRef)
      
      // Remove from cache
      for (const [key, value] of Array.from(this.cache.entries())) {
        if (key.startsWith(path)) {
          this.cache.delete(key)
        }
      }
      
      return true
    } catch (error) {
      console.error('Failed to delete file:', error)
      return false
    }
  }

  private validateFile(file: File): boolean {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      return false
    }

    // Check file type
    if (!this.config.allowedTypes.includes(file.type)) {
      return false
    }

    return true
  }

  private shouldOptimize(file: File): boolean {
    return (
      this.config.imageOptimization && this.isImage(file) ||
      this.config.videoOptimization && this.isVideo(file)
    )
  }

  private isImage(file: File): boolean {
    return file.type.startsWith('image/')
  }

  private isVideo(file: File): boolean {
    return file.type.startsWith('video/')
  }

  private async optimizeFile(
    file: File,
    options: {
      quality?: number
      maxWidth?: number
      maxHeight?: number
    }
  ): Promise<{ file: File; optimization: FileOptimization }> {
    if (this.isImage(file)) {
      return await this.optimizeImage(file, options)
    } else if (this.isVideo(file)) {
      return await this.optimizeVideo(file, options)
    } else {
      return { file, optimization: { originalSize: file.size, optimizedSize: file.size, compressionRatio: 1, format: file.type, quality: 100 } }
    }
  }

  private async optimizeImage(
    file: File,
    options: {
      quality?: number
      maxWidth?: number
      maxHeight?: number
    }
  ): Promise<{ file: File; optimization: FileOptimization }> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        const maxWidth = options.maxWidth || 1920
        const maxHeight = options.maxHeight || 1080

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        const quality = (options.quality || 80) / 100
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, { type: 'image/jpeg' })
            const optimization: FileOptimization = {
              originalSize: file.size,
              optimizedSize: blob.size,
              compressionRatio: blob.size / file.size,
              format: 'image/jpeg',
              quality: options.quality || 80,
              dimensions: { width, height }
            }
            resolve({ file: optimizedFile, optimization })
          } else {
            resolve({ file, optimization: { originalSize: file.size, optimizedSize: file.size, compressionRatio: 1, format: file.type, quality: 100 } })
          }
        }, 'image/jpeg', quality)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  private async optimizeVideo(
    file: File,
    options: {
      quality?: number
      maxWidth?: number
      maxHeight?: number
    }
  ): Promise<{ file: File; optimization: FileOptimization }> {
    // For now, return original file
    // In a real implementation, you would use FFmpeg or similar
    return {
      file,
      optimization: {
        originalSize: file.size,
        optimizedSize: file.size,
        compressionRatio: 1,
        format: file.type,
        quality: 100
      }
    }
  }

  private async generateThumbnail(file: File, path: string): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Create thumbnail (200x200)
        const size = 200
        canvas.width = size
        canvas.height = size

        // Draw centered and cropped
        const ratio = Math.min(size / img.width, size / img.height)
        const newWidth = img.width * ratio
        const newHeight = img.height * ratio
        const x = (size - newWidth) / 2
        const y = (size - newHeight) / 2

        ctx.drawImage(img, x, y, newWidth, newHeight)
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const thumbnailFile = new File([blob], `thumb_${file.name}`, { type: 'image/jpeg' })
            const thumbnailPath = `thumbnails/${path}`
            
            try {
              const connection = await dbPool.getConnection()
              const thumbnailRef = ref(connection.storage, thumbnailPath)
              await uploadBytes(thumbnailRef, thumbnailFile)
              const thumbnailUrl = await getDownloadURL(thumbnailRef)
              resolve(thumbnailUrl)
            } catch (error) {
              console.error('Thumbnail generation failed:', error)
              resolve('')
            }
          } else {
            resolve('')
          }
        }, 'image/jpeg', 0.8)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  private async generateOptimizedUrl(
    storageRef: any,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: string
    }
  ): Promise<string> {
    // In a real implementation, this would generate CDN URLs with parameters
    // For now, return the standard download URL
    return await getDownloadURL(storageRef)
  }

  // Cache management
  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats(): {
    size: number
    hitRate: number
    memoryUsage: number
  } {
    return {
      size: this.cache.size,
      hitRate: 0.85, // Mock hit rate
      memoryUsage: this.cache.size * 1024 // Approximate memory usage
    }
  }

  // Configuration
  updateConfig(newConfig: Partial<CDNConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): CDNConfig {
    return { ...this.config }
  }
}

// Export singleton instance
export const cdnOptimizer = CDNOptimizer.getInstance({
  enabled: process.env.CDN_ENABLED === 'true',
  provider: (process.env.CDN_PROVIDER as any) || 'firebase',
  cacheTtl: parseInt(process.env.CDN_CACHE_TTL || '3600000'),
  compression: process.env.CDN_COMPRESSION === 'true',
  imageOptimization: process.env.CDN_IMAGE_OPTIMIZATION === 'true',
  videoOptimization: process.env.CDN_VIDEO_OPTIMIZATION === 'true',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,video/mp4,application/pdf').split(',')
})

export { CDNOptimizer }
export type { CDNConfig, FileOptimization, UploadResult }
