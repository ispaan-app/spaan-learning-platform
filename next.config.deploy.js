/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  // Disable static optimization for problematic pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Skip static generation for problematic pages
  generateStaticParams: false,
}

module.exports = nextConfig