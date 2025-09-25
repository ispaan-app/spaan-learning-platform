/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for development and deployment
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  
  // Static export configuration
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Disable features that don't work with static export
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
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
  
  // Disable features that don't work with static export
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
