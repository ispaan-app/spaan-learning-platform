/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for development and deployment
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  
  // Experimental features
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Webpack configuration for better chunk loading
  webpack: (config, { isServer, dev }) => {
    // Client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      };
    }
    
    // Optimize chunk loading for development
    if (dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Development server configuration
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  
  // Additional configuration for chunk loading
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig