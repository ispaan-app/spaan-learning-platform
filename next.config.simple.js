/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for development and deployment
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  
  // Minimal experimental features
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Simplified webpack configuration
  webpack: (config, { isServer }) => {
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
    
    return config;
  },
}

module.exports = nextConfig
