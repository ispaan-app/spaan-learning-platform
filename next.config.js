/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Performance optimizations
  experimental: {
    missingSuspenseWithCSRBailout: false,
    // optimizeCss: true, // Temporarily disabled
    // scrollRestoration: true, // Temporarily disabled
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Output configuration
  output: 'standalone',
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Webpack configuration for production builds
  webpack: (config, { isServer, dev }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    } else {
      // Server-side fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Add global fallbacks for both client and server
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Define globals for server-side rendering
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require('webpack')).DefinePlugin({
        'typeof self': isServer ? JSON.stringify('undefined') : 'typeof self',
        'self': isServer ? 'undefined' : 'self',
        'global.self': isServer ? 'undefined' : 'global.self',
        'typeof window': isServer ? JSON.stringify('undefined') : 'window',
        'typeof document': isServer ? JSON.stringify('undefined') : 'document',
      })
    );
    
    // Add node polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'crypto': false,
      'stream': false,
      'util': false,
      'buffer': false,
      'process': false,
    };
    
    // Fix constructor issues
    config.optimization = {
      ...config.optimization,
      sideEffects: false,
    };
    
    // Fix SSR issues - Remove styled-jsx alias as it's causing module not found error
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Handle styled-jsx for SSR - removed problematic externals
    
    // Use ignore-loader for test files in production builds
    config.module.rules.push({
      test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
      use: 'ignore-loader',
    });
    
    // Production optimizations
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
}

module.exports = nextConfig
