/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  // Configure for Firebase App Hosting (standalone) and Firebase Hosting (export)
  output: process.env.BUILD_TARGET === 'export' ? 'export' : 'standalone',
  trailingSlash: false,
  // Disable static optimization for dynamic pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Force all pages to be dynamic
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Disable static optimization completely
  staticPageGenerationTimeout: 0,
  // Force dynamic rendering
  swcMinify: true,
  // Server Actions are enabled by default in Next.js 14+
  // Exclude test files and pages from production builds
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // Production build - exclude test files
      config.module.rules.push({
        test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
        loader: 'ignore-loader'
      });
    }
    return config;
  },
}

module.exports = nextConfig
