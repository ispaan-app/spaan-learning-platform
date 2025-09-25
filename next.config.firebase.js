/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for Firebase hosting
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  
  // Output configuration for static export
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Disable server-side features for static export
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
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: 'https://ispaan-app.web.app',
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
