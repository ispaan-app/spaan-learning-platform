import { NextRequest, NextResponse } from 'next/server'

// Content Security Policy (CSP) middleware
export class CSPMiddleware {
  private static instance: CSPMiddleware
  private policies: Record<string, string> = {}

  private constructor() {
    this.initializePolicies()
  }

  static getInstance(): CSPMiddleware {
    if (!CSPMiddleware.instance) {
      CSPMiddleware.instance = new CSPMiddleware()
    }
    return CSPMiddleware.instance
  }

  private initializePolicies() {
    this.policies = {
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com",
      'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
      'font-src': "'self' https://fonts.gstatic.com",
      'img-src': "'self' data: https: blob:",
      'media-src': "'self' blob:",
      'connect-src': "'self' https://www.google-analytics.com https://api.firebase.com wss: ws:",
      'frame-src': "'self' https://www.google.com",
      'object-src': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'",
      'frame-ancestors': "'none'",
      'upgrade-insecure-requests': '',
      'block-all-mixed-content': ''
    }
  }

  // Apply CSP headers
  applyCSP(request: NextRequest, response: NextResponse): NextResponse {
    const cspHeader = this.generateCSPHeader()
    response.headers.set('Content-Security-Policy', cspHeader)
    
    // Add report-only header for development
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('Content-Security-Policy-Report-Only', cspHeader)
    }

    return response
  }

  private generateCSPHeader(): string {
    return Object.entries(this.policies)
      .map(([directive, value]) => `${directive} ${value}`)
      .join('; ')
  }

  // Add custom CSP directive
  addDirective(directive: string, value: string): void {
    this.policies[directive] = value
  }

  // Remove CSP directive
  removeDirective(directive: string): void {
    delete this.policies[directive]
  }

  // Get current CSP policy
  getPolicy(): Record<string, string> {
    return { ...this.policies }
  }

  // Validate CSP policy
  validatePolicy(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check for unsafe directives
    if (this.policies['script-src']?.includes("'unsafe-inline'")) {
      errors.push('script-src contains unsafe-inline directive')
    }
    
    if (this.policies['script-src']?.includes("'unsafe-eval'")) {
      errors.push('script-src contains unsafe-eval directive')
    }

    // Check for missing important directives
    if (!this.policies['object-src']) {
      errors.push('object-src directive is missing')
    }

    if (!this.policies['base-uri']) {
      errors.push('base-uri directive is missing')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// CSP middleware function
export function withCSP(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request)
    const cspMiddleware = CSPMiddleware.getInstance()
    return cspMiddleware.applyCSP(request, response)
  }
}

export default CSPMiddleware
