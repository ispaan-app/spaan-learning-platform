/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Webpack configuration for production builds
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Use ignore-loader for test files in production builds
      config.module.rules.push({
        test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
        use: 'ignore-loader',
      });
    }
    return config;
  },
}

module.exports = nextConfig
