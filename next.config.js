/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js configuration
  srcDir: 'src',
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
