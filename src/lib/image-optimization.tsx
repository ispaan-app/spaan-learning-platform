'use client'

import { ImageLoaderProps } from 'next/image'

// Image optimization configuration
interface ImageConfig {
  quality: number
  format: 'webp' | 'avif' | 'jpeg' | 'png'
  sizes: string
  placeholder: 'blur' | 'empty'
  priority: boolean
}

interface ResponsiveImage {
  src: string
  srcSet: string
  sizes: string
  alt: string
  width: number
  height: number
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

// Next.js image loader for optimization
export function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  const params = new URLSearchParams()
  params.set('w', width.toString())
  params.set('q', (quality || 75).toString())
  params.set('f', 'webp') // Default to WebP format
  
  return `${src}?${params.toString()}`
}

// Generate responsive image configuration
export function generateResponsiveImage(
  baseSrc: string,
  alt: string,
  width: number,
  height: number,
  config: Partial<ImageConfig> = {}
): ResponsiveImage {
  const {
    quality = 75,
    format = 'webp',
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    placeholder = 'blur',
    priority = false
  } = config

  // Generate srcSet for different screen sizes
  const breakpoints = [320, 640, 768, 1024, 1280, 1920]
  const srcSet = breakpoints
    .filter(bp => bp <= width * 2) // Don't exceed 2x the original width
    .map(bp => {
      const params = new URLSearchParams()
      params.set('w', bp.toString())
      params.set('q', quality.toString())
      params.set('f', format)
      return `${baseSrc}?${params.toString()} ${bp}w`
    })
    .join(', ')

  return {
    src: baseSrc,
    srcSet,
    sizes,
    alt,
    width,
    height,
    quality,
    placeholder,
    blurDataURL: placeholder === 'blur' ? generateBlurDataURL(width, height) : undefined
  }
}

// Generate blur data URL for placeholder
export function generateBlurDataURL(width: number, height: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  
  // Create a simple gradient placeholder
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f3f4f6')
  gradient.addColorStop(1, '#e5e7eb')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL('image/jpeg', 0.1)
}

// Image compression utility
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png'
  } = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'webp'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    const img = new Image()
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        `image/${format}`,
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Lazy loading image component
export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  ...props
}: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  [key: string]: any
}) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [isInView, setIsInView] = React.useState(priority)
  const imgRef = React.useRef<HTMLImageElement>(null)

  React.useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
      
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  )
}

// Image optimization service
export class ImageOptimizationService {
  private static instance: ImageOptimizationService
  private cache: Map<string, string> = new Map()

  static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService()
    }
    return ImageOptimizationService.instance
  }

  // Optimize image URL
  optimizeImageUrl(
    src: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'avif' | 'jpeg' | 'png'
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
    } = {}
  ): string {
    const {
      width,
      height,
      quality = 75,
      format = 'webp',
      fit = 'cover'
    } = options

    const cacheKey = `${src}_${width}_${height}_${quality}_${format}_${fit}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const params = new URLSearchParams()
    
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    params.set('q', quality.toString())
    params.set('f', format)
    params.set('fit', fit)

    const optimizedUrl = `${src}?${params.toString()}`
    this.cache.set(cacheKey, optimizedUrl)
    
    return optimizedUrl
  }

  // Generate responsive image set
  generateResponsiveImageSet(
    baseSrc: string,
    sizes: Array<{ width: number; media?: string }>
  ): { srcSet: string; sizes: string } {
    const srcSet = sizes
      .map(({ width }) => {
        const optimizedUrl = this.optimizeImageUrl(baseSrc, { width })
        return `${optimizedUrl} ${width}w`
      })
      .join(', ')

    const sizesString = sizes
      .map(({ width, media }) => `${media || ''} ${width}px`)
      .join(', ')

    return { srcSet, sizes: sizesString }
  }

  // Preload critical images
  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })
  }

  // Generate image placeholder
  generatePlaceholder(width: number, height: number, color = '#f3f4f6'): string {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af">
          ${width} × ${height}
        </text>
      </svg>
    `
    
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }
}

// Export singleton
export const imageOptimizer = ImageOptimizationService.getInstance()

// Utility functions
export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

export function isWebPSupported(): boolean {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

export function getOptimalFormat(): 'webp' | 'avif' | 'jpeg' {
  if (typeof window === 'undefined') return 'jpeg'
  
  // Check for AVIF support
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  
  if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
    return 'avif'
  }
  
  // Check for WebP support
  if (isWebPSupported()) {
    return 'webp'
  }
  
  return 'jpeg'
}

// Import React for hooks
import React from 'react'
