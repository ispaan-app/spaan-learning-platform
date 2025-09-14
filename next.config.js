/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  // Disable static optimization for problematic pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Force dynamic rendering for specific routes
  trailingSlash: false,
  // Force dynamic rendering for all pages
  output: 'standalone',
  // Disable static generation completely
  generateStaticParams: false,
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
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.firebaseapp.com https://*.googleapis.com;",
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
