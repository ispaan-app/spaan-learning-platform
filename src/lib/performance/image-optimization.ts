import sharp from 'sharp'

// Image optimization service
export class ImageOptimizationService {
  private static instance: ImageOptimizationService
  private defaultOptions = {
    quality: 80,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'webp' as const
  }

  private constructor() {}

  static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService()
    }
    return ImageOptimizationService.instance
  }

  // Optimize image buffer
  async optimizeImage(
    buffer: Buffer,
    options: {
      quality?: number
      maxWidth?: number
      maxHeight?: number
      format?: 'webp' | 'jpeg' | 'png'
    } = {}
  ): Promise<Buffer> {
    const opts = { ...this.defaultOptions, ...options }
    
    let pipeline = sharp(buffer)
    
    // Resize if needed
    if (opts.maxWidth || opts.maxHeight) {
      pipeline = pipeline.resize(opts.maxWidth, opts.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
    }
    
    // Apply format and quality
    switch (opts.format) {
      case 'webp':
        pipeline = pipeline.webp({ quality: opts.quality })
        break
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: opts.quality })
        break
      case 'png':
        pipeline = pipeline.png({ quality: opts.quality })
        break
    }
    
    return pipeline.toBuffer()
  }

  // Generate responsive images
  async generateResponsiveImages(
    buffer: Buffer,
    sizes: number[] = [320, 640, 1024, 1920]
  ): Promise<Record<number, Buffer>> {
    const results: Record<number, Buffer> = {}
    
    for (const size of sizes) {
      const optimized = await this.optimizeImage(buffer, {
        maxWidth: size,
        format: 'webp'
      })
      results[size] = optimized
    }
    
    return results
  }

  // Get image metadata
  async getMetadata(buffer: Buffer): Promise<{
    width: number
    height: number
    format: string
    size: number
  }> {
    const metadata = await sharp(buffer).metadata()
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: buffer.length
    }
  }
}

export default ImageOptimizationService
