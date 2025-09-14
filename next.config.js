/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Vercel with src directory
  srcDir: 'src',
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  // Configure for Vercel (remove standalone output)
  trailingSlash: false,
  // Enable static optimization where possible
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Enable static optimization with timeout
  staticPageGenerationTimeout: 60,
  // Optimize builds
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
