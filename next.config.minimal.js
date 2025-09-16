/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration only
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  
  // Minimal experimental features
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Basic webpack configuration
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
