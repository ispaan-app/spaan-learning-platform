import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimiter } from '@/lib/rate-limiter'
import { sanitizer } from '@/lib/sanitizer'

// Common validation schemas
export const userValidationSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
  idNumber: z.string().regex(/^[0-9]{13}$/, 'ID number must be 13 digits'),
  role: z.enum(['applicant', 'learner', 'admin', 'super-admin']),
  status: z.enum(['pending', 'active', 'inactive', 'suspended']).optional()
})

export const programValidationSchema = z.object({
  name: z.string().min(1, 'Program name is required').max(100, 'Program name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  duration: z.string().min(1, 'Duration is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['active', 'inactive']),
  requirements: z.array(z.string()).min(1, 'At least one requirement is required'),
  curriculum: z.array(z.string()).min(1, 'At least one curriculum item is required')
})

export const placementValidationSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(100, 'Company name too long'),
  position: z.string().min(1, 'Position is required').max(100, 'Position too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  location: z.string().min(1, 'Location is required').max(100, 'Location too long'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(100, 'Capacity too high'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is required')
})

export const documentValidationSchema = z.object({
  type: z.enum(['id', 'certificate', 'transcript', 'cv', 'other']),
  name: z.string().min(1, 'Document name is required').max(100, 'Document name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  fileSize: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  mimeType: z.string().regex(/^(image|application|text)\//, 'Invalid file type')
})

// Rate limiting configuration
const rateLimitConfig: Record<string, { max: number; window: number }> = {
  '/api/auth/login': { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  '/api/auth/signup': { max: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
  '/api/upload': { max: 10, window: 60 * 60 * 1000 }, // 10 uploads per hour
  '/api/chat': { max: 20, window: 60 * 60 * 1000 }, // 20 messages per hour
  default: { max: 100, window: 60 * 60 * 1000 } // 100 requests per hour
}

// Validation middleware
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  options: {
    rateLimit?: boolean
    sanitize?: boolean
    maxBodySize?: number
  } = {}
) {
  return async (request: NextRequest, handler: (data: T) => Promise<NextResponse>) => {
    try {
      // Check rate limiting
      if (options.rateLimit !== false) {
        const endpoint = request.nextUrl.pathname
        const config = rateLimitConfig[endpoint] || rateLimitConfig.default
        
        const isRateLimited = await rateLimiter.isRateLimited(
          request.ip || 'unknown',
          endpoint,
          config.max,
          config.window
        )
        
        if (isRateLimited) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          )
        }
      }

      // Check body size
      const contentLength = request.headers.get('content-length')
      if (contentLength && options.maxBodySize) {
        const size = parseInt(contentLength)
        if (size > options.maxBodySize) {
          return NextResponse.json(
            { error: 'Request body too large' },
            { status: 413 }
          )
        }
      }

      // Parse and validate request body
      const body = await request.json()
      
      // Sanitize input if requested
      const sanitizedBody = options.sanitize !== false ? sanitizer.sanitize(body) : body
      
      // Validate with schema
      const validatedData = schema.parse(sanitizedBody)
      
      // Call the handler with validated data
      return await handler(validatedData)
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          },
          { status: 400 }
        )
      }
      
      console.error('Validation middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Input sanitization
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// SQL injection prevention
export function preventSQLInjection(input: string): string {
  return input
    .replace(/['"]/g, '') // Remove quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments
    .replace(/\*\//g, '') // Remove block comments
}

// XSS prevention
export function preventXSS(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// File upload validation
export function validateFileUpload(file: {
  name: string
  size: number
  type: string
}): { valid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large' }
  }
  
  if (file.name.length > 100) {
    return { valid: false, error: 'File name too long' }
  }
  
  return { valid: true }
}
