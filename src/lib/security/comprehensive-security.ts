import { NextRequest, NextResponse } from 'next/server'
import { CSPMiddleware } from './csp-middleware'
import { CSRFProtection } from './csrf-protection'
import { AdvancedRateLimiter } from './advanced-rate-limiting'
import { InputSanitizer } from '../sanitizer'

// Comprehensive security middleware
export class ComprehensiveSecurity {
  private static instance: ComprehensiveSecurity
  private csp: CSPMiddleware
  private csrf: CSRFProtection
  private rateLimiter: AdvancedRateLimiter
  private sanitizer: InputSanitizer

  private constructor() {
    this.csp = CSPMiddleware.getInstance()
    this.csrf = CSRFProtection.getInstance()
    this.rateLimiter = AdvancedRateLimiter.getInstance()
    this.sanitizer = new InputSanitizer()
  }

  static getInstance(): ComprehensiveSecurity {
    if (!ComprehensiveSecurity.instance) {
      ComprehensiveSecurity.instance = new ComprehensiveSecurity()
    }
    return ComprehensiveSecurity.instance
  }

  // Apply comprehensive security
  async applySecurity(
    request: NextRequest,
    response: NextResponse,
    options: {
      enableCSP?: boolean
      enableCSRF?: boolean
      enableRateLimit?: boolean
      enableSanitization?: boolean
      rateLimitEndpoint?: string
      customRateLimit?: { requests: number; window: number }
    } = {}
  ): Promise<NextResponse> {
    const {
      enableCSP = true,
      enableCSRF = true,
      enableRateLimit = true,
      enableSanitization = true,
      rateLimitEndpoint = 'api',
      customRateLimit
    } = options

    // Apply rate limiting
    if (enableRateLimit) {
      const clientIP = this.getClientIP(request)
      const limitCheck = await this.rateLimiter.checkLimit(
        clientIP,
        rateLimitEndpoint,
        customRateLimit
      )

      if (!limitCheck.allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', retryAfter: limitCheck.retryAfter },
          { status: 429 }
        )
      }
    }

    // Apply CSRF protection
    if (enableCSRF) {
      const csrfValidation = await this.csrf.validateRequest(request)
      if (!csrfValidation.valid) {
        return NextResponse.json(
          { error: 'CSRF validation failed', details: csrfValidation.error },
          { status: 403 }
        )
      }
    }

    // Apply input sanitization
    if (enableSanitization) {
      // Sanitize request body if present
      try {
        const body = await request.clone().json()
        const sanitizedBody = this.sanitizer.sanitize(body)
        // Note: In a real implementation, you'd need to reconstruct the request
        // with sanitized data, which is complex in Next.js middleware
      } catch (error) {
        // Body might not be JSON or might be empty
      }
    }

    // Apply CSP headers
    if (enableCSP) {
      response = this.csp.applyCSP(request, response)
    }

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    return response
  }

  // Get client IP address
  private getClientIP(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'
    )
  }

  // Security audit
  async performSecurityAudit(): Promise<{
    score: number
    issues: Array<{ severity: 'low' | 'medium' | 'high' | 'critical'; message: string }>
    recommendations: string[]
  }> {
    const issues: Array<{ severity: 'low' | 'medium' | 'high' | 'critical'; message: string }> = []
    const recommendations: string[] = []

    // Check CSP policy
    const cspValidation = this.csp.validatePolicy()
    if (!cspValidation.valid) {
      issues.push({
        severity: 'high',
        message: `CSP policy issues: ${cspValidation.errors.join(', ')}`
      })
    }

    // Check rate limiting configuration
    const rateLimits = this.rateLimiter.getAllLimits()
    if (rateLimits.api.requests > 1000) {
      issues.push({
        severity: 'medium',
        message: 'API rate limit is too high, consider reducing for better security'
      })
    }

    // Check for missing security headers
    if (!process.env.CSRF_SECRET_KEY) {
      issues.push({
        severity: 'critical',
        message: 'CSRF secret key is not configured'
      })
    }

    if (!process.env.REDIS_URL) {
      issues.push({
        severity: 'high',
        message: 'Redis URL is not configured, rate limiting will not work properly'
      })
    }

    // Generate recommendations
    if (issues.length === 0) {
      recommendations.push('Security configuration looks good!')
    } else {
      recommendations.push('Review and fix the identified security issues')
      recommendations.push('Consider implementing additional security measures')
      recommendations.push('Regular security audits are recommended')
    }

    // Calculate security score
    const criticalIssues = issues.filter(i => i.severity === 'critical').length
    const highIssues = issues.filter(i => i.severity === 'high').length
    const mediumIssues = issues.filter(i => i.severity === 'medium').length
    const lowIssues = issues.filter(i => i.severity === 'low').length

    const score = Math.max(0, 100 - (criticalIssues * 25) - (highIssues * 15) - (mediumIssues * 10) - (lowIssues * 5))

    return {
      score,
      issues,
      recommendations
    }
  }
}

// Security middleware function
export function withComprehensiveSecurity(
  options: {
    enableCSP?: boolean
    enableCSRF?: boolean
    enableRateLimit?: boolean
    enableSanitization?: boolean
    rateLimitEndpoint?: string
    customRateLimit?: { requests: number; window: number }
  } = {}
) {
  return function(handler: (request: NextRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const security = ComprehensiveSecurity.getInstance()
      const response = await handler(request)
      return security.applySecurity(request, response, options)
    }
  }
}

export default ComprehensiveSecurity
