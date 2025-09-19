/**
 * Performance Configuration
 * Centralized performance monitoring and optimization settings
 */

export const performanceConfig = {
  // Bundle analysis
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: false,
  },
  
  // Image optimization
  images: {
    quality: 85,
    formats: ['image/webp', 'image/avif'] as const,
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Caching strategies
  cache: {
    static: {
      maxAge: 31536000, // 1 year
      sMaxAge: 31536000,
    },
    dynamic: {
      maxAge: 3600, // 1 hour
      sMaxAge: 86400, // 1 day
    },
    api: {
      maxAge: 300, // 5 minutes
      sMaxAge: 600, // 10 minutes
    },
  },
  
  // Performance budgets
  budgets: {
    maxBundleSize: 250000, // 250KB
    maxInitialJS: 200000, // 200KB
    maxInitialCSS: 50000, // 50KB
    maxImageSize: 100000, // 100KB
  },
  
  // Monitoring thresholds
  monitoring: {
    slowQueryThreshold: 1000, // 1 second
    slowRenderThreshold: 100, // 100ms
    memoryWarningThreshold: 50 * 1024 * 1024, // 50MB
  },
  
  // Lazy loading
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: '50px',
  },
  
  // Preloading strategies
  preloading: {
    criticalCSS: true,
    criticalJS: true,
    fonts: true,
    images: false, // Only for above-the-fold images
  },
} as const;

export type PerformanceConfig = typeof performanceConfig;














