/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for development and deployment
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  
  // Experimental features
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Development server configuration
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "connect-src 'self' https://securetoken.googleapis.com https://www.google-analytics.com https://api.firebase.com wss: ws:;"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig