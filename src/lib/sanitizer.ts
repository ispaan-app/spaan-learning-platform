import DOMPurify from 'isomorphic-dompurify'

// HTML sanitization configuration
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
  ALLOWED_ATTR: ['href', 'title', 'target'],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
}

// XSS patterns to detect and block
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /onmouseover\s*=/gi,
  /onfocus\s*=/gi,
  /onblur\s*=/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>.*?<\/embed>/gi,
  /<form[^>]*>.*?<\/form>/gi,
  /<input[^>]*>.*?<\/input>/gi,
  /<button[^>]*>.*?<\/button>/gi,
  /<link[^>]*>.*?<\/link>/gi,
  /<meta[^>]*>.*?<\/meta>/gi,
  /<style[^>]*>.*?<\/style>/gi,
  /<link[^>]*>.*?<\/link>/gi
]

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
  /(\b(OR|AND)\s+['"]\s*=\s*['"])/gi,
  /(UNION\s+SELECT)/gi,
  /(DROP\s+TABLE)/gi,
  /(DELETE\s+FROM)/gi,
  /(INSERT\s+INTO)/gi,
  /(UPDATE\s+SET)/gi,
  /(ALTER\s+TABLE)/gi,
  /(CREATE\s+TABLE)/gi,
  /(EXEC\s*\()/gi,
  /(SCRIPT\s*\()/gi,
  /(--|\#|\/\*|\*\/)/gi,
  /(WAITFOR\s+DELAY)/gi,
  /(BENCHMARK\s*\()/gi,
  /(SLEEP\s*\()/gi
]

export class InputSanitizer {
  private static instance: InputSanitizer

  static getInstance(): InputSanitizer {
    if (!InputSanitizer.instance) {
      InputSanitizer.instance = new InputSanitizer()
    }
    return InputSanitizer.instance
  }

  // Sanitize HTML content
  sanitizeHTML(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    // First check for XSS patterns
    if (this.detectXSS(input)) {
      throw new Error('XSS attack detected')
    }

    // Use DOMPurify for sanitization
    return DOMPurify.sanitize(input, SANITIZE_CONFIG)
  }

  // Sanitize plain text
  sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;\\]/g, '') // Remove semicolons and backslashes
  }

  // Sanitize file name
  sanitizeFileName(input: string): string {
    if (!input || typeof input !== 'string') {
      return 'file'
    }

    return input
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 255) // Limit length
  }

  // Sanitize URL
  sanitizeURL(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    try {
      const url = new URL(input)
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol')
      }

      return url.toString()
    } catch {
      return ''
    }
  }

  // Sanitize email
  sanitizeEmail(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    const email = input.trim().toLowerCase()
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format')
    }

    return email
  }

  // Sanitize phone number
  sanitizePhone(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    return input
      .replace(/[^\d+\-\(\)\s]/g, '') // Keep only digits, +, -, (, ), and spaces
      .trim()
  }

  // Detect XSS attacks
  detectXSS(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false
    }

    return XSS_PATTERNS.some(pattern => pattern.test(input))
  }

  // Detect SQL injection
  detectSQLInjection(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false
    }

    return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input))
  }

  // Sanitize object properties recursively
  sanitizeObject(obj: any, maxDepth: number = 10, currentDepth: number = 0): any {
    if (currentDepth >= maxDepth) {
      return '[Max depth reached]'
    }

    if (obj === null || obj === undefined) {
      return obj
    }

    if (typeof obj === 'string') {
      return this.sanitizeText(obj)
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, maxDepth, currentDepth + 1))
    }

    if (typeof obj === 'object') {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeText(key)
        sanitized[sanitizedKey] = this.sanitizeObject(value, maxDepth, currentDepth + 1)
      }
      return sanitized
    }

    return obj
  }

  // Validate and sanitize form data
  sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = this.sanitizeText(key)
      
      if (typeof value === 'string') {
        // Check for XSS and SQL injection
        if (this.detectXSS(value)) {
          throw new Error(`XSS attack detected in field: ${key}`)
        }
        
        if (this.detectSQLInjection(value)) {
          throw new Error(`SQL injection detected in field: ${key}`)
        }

        sanitized[sanitizedKey] = this.sanitizeText(value)
      } else if (Array.isArray(value)) {
        sanitized[sanitizedKey] = value.map(item => 
          typeof item === 'string' ? this.sanitizeText(item) : item
        )
      } else {
        sanitized[sanitizedKey] = value
      }
    }

    return sanitized
  }
}

// Export singleton instance
export const sanitizer = InputSanitizer.getInstance()

// Utility functions
export function sanitizeInput(input: string): string {
  return sanitizer.sanitizeText(input)
}

export function sanitizeHTML(input: string): string {
  return sanitizer.sanitizeHTML(input)
}

export function detectXSS(input: string): boolean {
  return sanitizer.detectXSS(input)
}

export function detectSQLInjection(input: string): boolean {
  return sanitizer.detectSQLInjection(input)
}

// Middleware for input sanitization
export function sanitizeMiddleware(req: any, res: any, next: Function) {
  if (req.body) {
    try {
      const sanitizedBody = sanitizer.sanitizeObject(req.body)
      Object.assign(req.body, sanitizedBody)
    } catch (error) {
      return res.status(400).json({ error: 'Invalid input detected' })
    }
  }
  next()
}
