import { NextRequest, NextResponse } from 'next/server'

// Security headers configuration
const securityHeaders = {
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://www.google.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com",
    "frame-src 'self' https://*.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', '),
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cross-Origin Policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  
  // Additional security headers
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store'
}

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://ispaan.co.za' 
    : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
}

// Rate limiting configuration
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
}

// Rate limiting function
function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const key = ip
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + rateLimitConfig.windowMs })
    return { allowed: true }
  }
  
  if (record.count >= rateLimitConfig.maxRequests) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((record.resetTime - now) / 1000) 
    }
  }
  
  record.count++
  return { allowed: true }
}

// Clean up expired rate limit records
function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, record] of Array.from(rateLimitMap.entries())) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000)

// Security middleware function
export function withSecurityHeaders(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Get client IP
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      request.ip || 
                      'unknown'
      
      // Check rate limit
      const rateLimitResult = checkRateLimit(clientIP)
      if (!rateLimitResult.allowed) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Too many requests', 
            retryAfter: rateLimitResult.retryAfter 
          }),
          { 
            status: 429,
            headers: {
              ...securityHeaders,
              ...corsHeaders,
              'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
            }
          }
        )
      }
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: {
            ...securityHeaders,
            ...corsHeaders,
            'X-Rate-Limit-Remaining': (rateLimitConfig.maxRequests - (rateLimitMap.get(clientIP)?.count || 0)).toString(),
            'X-Rate-Limit-Reset': rateLimitMap.get(clientIP)?.resetTime.toString() || '0'
          }
        })
      }
      
      // Process the request
      const response = await handler(request)
      
      // Add security headers to response
      const headers = new Headers(response.headers)
      Object.entries(securityHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })
      
      // Add CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })
      
      // Add rate limit headers
      const rateLimitRecord = rateLimitMap.get(clientIP)
      if (rateLimitRecord) {
        headers.set('X-Rate-Limit-Remaining', (rateLimitConfig.maxRequests - rateLimitRecord.count).toString())
        headers.set('X-Rate-Limit-Reset', rateLimitRecord.resetTime.toString())
      }
      
      // Add security monitoring headers
      headers.set('X-Security-Headers', 'enabled')
      headers.set('X-Content-Type', 'application/json')
      
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      })
      
    } catch (error) {
      console.error('Security middleware error:', error)
      
      // Return secure error response
      return new NextResponse(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: {
            ...securityHeaders,
            ...corsHeaders,
            'X-Error': 'security-middleware'
          }
        }
      )
    }
  }
}

// Security validation functions
export function validateRequest(request: NextRequest): { valid: boolean; error?: string } {
  // Check for suspicious patterns
  const userAgent = request.headers.get('user-agent') || ''
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /w3af/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i
  ]
  
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    return { valid: false, error: 'Suspicious user agent detected' }
  }
  
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-originating-ip',
    'x-remote-ip',
    'x-remote-addr'
  ]
  
  const hasSuspiciousHeaders = suspiciousHeaders.some(header => 
    request.headers.get(header) && 
    !request.headers.get(header)?.match(/^[\d\.\:\-\s]+$/)
  )
  
  if (hasSuspiciousHeaders) {
    return { valid: false, error: 'Suspicious headers detected' }
  }
  
  // Check request size
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return { valid: false, error: 'Request too large' }
  }
  
  return { valid: true }
}

// Security monitoring
export function logSecurityEvent(event: string, details: any) {
  console.log(`[SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    event,
    details,
    severity: 'INFO'
  })
}

// Export security configuration
export const securityConfig = {
  headers: securityHeaders,
  cors: corsHeaders,
  rateLimit: rateLimitConfig,
  validateRequest,
  logSecurityEvent
}
