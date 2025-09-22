/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for development and deployment
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  
  // Minimal experimental features
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Enhanced webpack configuration for Firebase Admin SDK
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
        http2: false,
        child_process: false,
        'node:events': false,
        'node:process': false,
        'node:util': false,
        'node:stream': false,
        'node:buffer': false,
        'node:crypto': false,
        'node:fs': false,
        'node:path': false,
        'node:os': false,
        'node:url': false,
        'node:querystring': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:readline': false,
        'node:timers': false,
        'node:assert': false,
        'node:constants': false,
        'node:vm': false,
        'node:perf_hooks': false,
        'node:tty': false,
        'node:cluster': false,
        'node:dgram': false,
        'node:dns': false,
        'node:net': false,
        'node:punycode': false,
        'node:repl': false,
        'node:string_decoder': false,
        'node:sys': false,
        'node:timers/promises': false,
        'node:tls': false,
        'node:worker_threads': false,
      };
    }
    
    return config;
  },
}

module.exports = nextConfig
