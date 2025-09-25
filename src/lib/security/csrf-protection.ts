import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// CSRF Protection middleware
export class CSRFProtection {
  private static instance: CSRFProtection
  private secretKey: string
  private tokenExpiry: number = 3600000 // 1 hour

  private constructor() {
    this.secretKey = process.env.CSRF_SECRET_KEY || crypto.randomBytes(32).toString('hex')
  }

  static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection()
    }
    return CSRFProtection.instance
  }

  // Generate CSRF token
  generateToken(sessionId: string): string {
    const timestamp = Date.now().toString()
    const data = `${sessionId}:${timestamp}`
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex')
    
    return Buffer.from(`${data}:${signature}`).toString('base64')
  }

  // Verify CSRF token
  verifyToken(token: string, sessionId: string): { valid: boolean; error?: string } {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [sessionPart, timestamp, signature] = decoded.split(':')
      
      if (sessionPart !== sessionId) {
        return { valid: false, error: 'Session mismatch' }
      }

      // Check token expiry
      const tokenTime = parseInt(timestamp)
      if (Date.now() - tokenTime > this.tokenExpiry) {
        return { valid: false, error: 'Token expired' }
      }

      // Verify signature
      const data = `${sessionPart}:${timestamp}`
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(data)
        .digest('hex')
      
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' }
      }

      return { valid: true }
    } catch (error) {
      return { valid: false, error: 'Invalid token format' }
    }
  }

  // Get CSRF token from request
  getTokenFromRequest(request: NextRequest): string | null {
    // Try to get token from header first
    const headerToken = request.headers.get('X-CSRF-Token')
    if (headerToken) {
      return headerToken
    }

    // Try to get token from form data
    const formData = request.formData()
    if (formData) {
      return (formData as any).get('csrf_token') || null
    }

    // Try to get token from JSON body
    try {
      const body = request.json()
      return (body as any).csrf_token || null
    } catch {
      return null
    }
  }

  // Validate CSRF token for request
  async validateRequest(request: NextRequest): Promise<{ valid: boolean; error?: string }> {
    // Skip CSRF validation for GET requests
    if (request.method === 'GET') {
      return { valid: true }
    }

    // Skip CSRF validation for safe methods
    if (['HEAD', 'OPTIONS'].includes(request.method)) {
      return { valid: true }
    }

    // Get session ID from request
    const sessionId = this.getSessionId(request)
    if (!sessionId) {
      return { valid: false, error: 'No session found' }
    }

    // Get CSRF token
    const token = this.getTokenFromRequest(request)
    if (!token) {
      return { valid: false, error: 'CSRF token missing' }
    }

    // Verify token
    return this.verifyToken(token, sessionId)
  }

  // Get session ID from request
  getSessionId(request: NextRequest): string | null {
    // Try to get from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      // Extract session ID from JWT token (simplified)
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        return payload.sessionId || payload.sub
      } catch {
        return null
      }
    }

    // Try to get from cookies
    const sessionCookie = request.cookies.get('session_id')
    if (sessionCookie) {
      return sessionCookie.value
    }

    return null
  }

  // Add CSRF token to response
  addTokenToResponse(response: NextResponse, sessionId: string): NextResponse {
    const token = this.generateToken(sessionId)
    
    // Add token to response headers
    response.headers.set('X-CSRF-Token', token)
    
    // Add token to response body if it's HTML
    const contentType = response.headers.get('Content-Type')
    if (contentType?.includes('text/html')) {
      // For now, just add the token to headers
      response.headers.set('X-CSRF-Token', token)
    }

    return response
  }
}

// CSRF middleware function
export function withCSRFProtection(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const csrfProtection = CSRFProtection.getInstance()
    
    // Validate CSRF token
    const validation = await csrfProtection.validateRequest(request)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'CSRF token validation failed', details: validation.error },
        { status: 403 }
      )
    }

    // Continue with request
    const response = await handler(request)
    
    // Add CSRF token to response if needed
    const sessionId = csrfProtection.getSessionId(request)
    if (sessionId) {
      return csrfProtection.addTokenToResponse(response, sessionId)
    }

    return response
  }
}

// CSRF token generator for forms
export function generateCSRFToken(sessionId: string): string {
  const csrfProtection = CSRFProtection.getInstance()
  return csrfProtection.generateToken(sessionId)
}

export default CSRFProtection
