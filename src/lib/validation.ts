import { z } from 'zod'
import { InputSanitizer } from './sanitizer'

// Enhanced validation schemas with comprehensive security checks
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email must be less than 254 characters')
  .refine((email) => {
    // Additional email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }, 'Invalid email format')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')

export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must be at most 15 digits')
  .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Please enter a valid phone number')

export const idNumberSchema = z
  .string()
  .min(13, 'ID number must be 13 digits')
  .max(13, 'ID number must be 13 digits')
  .regex(/^[0-9]{13}$/, 'ID number must contain only digits')

export const pinSchema = z
  .string()
  .min(6, 'PIN must be 6 digits')
  .max(6, 'PIN must be 6 digits')
  .regex(/^[0-9]{6}$/, 'PIN must contain only digits')

// User validation schemas
export const userRoleSchema = z.enum(['applicant', 'learner', 'admin', 'super-admin'])
export const userStatusSchema = z.enum(['pending', 'active', 'inactive', 'suspended'])

// Application validation schemas
export const applicationSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  email: emailSchema,
  phone: phoneSchema,
  idNumber: idNumberSchema,
  program: z.string().min(1, 'Program selection is required'),
  motivation: z.string()
    .min(50, 'Motivation must be at least 50 characters')
    .max(1000, 'Motivation must be less than 1000 characters'),
  experience: z.string()
    .min(20, 'Experience must be at least 20 characters')
    .max(2000, 'Experience must be less than 2000 characters'),
  availability: z.string().min(1, 'Availability is required'),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    phone: phoneSchema,
    relationship: z.string().min(1, 'Relationship is required')
  })
})

// Document validation schemas
export const documentSchema = z.object({
  name: z.string()
    .min(1, 'Document name is required')
    .max(100, 'Document name must be less than 100 characters'),
  type: z.enum(['cv', 'id', 'certificate', 'transcript', 'other']),
  size: z.number()
    .min(1, 'File size must be greater than 0')
    .max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  mimeType: z.enum([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ])
})

// Leave request validation schemas
export const leaveRequestSchema = z.object({
  type: z.enum(['sick', 'personal', 'emergency', 'other']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be less than 500 characters'),
  emergencyContact: z.string()
    .min(1, 'Emergency contact is required')
    .max(100, 'Emergency contact must be less than 100 characters')
}).refine((data) => {
  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)
  return endDate >= startDate
}, {
  message: 'End date must be after start date',
  path: ['endDate']
})

// Issue report validation schemas
export const issueReportSchema = z.object({
  category: z.enum(['technical', 'billing', 'placement', 'stipend', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  location: z.string().optional(),
  contactMethod: z.enum(['email', 'phone']),
  contactInfo: z.string().min(1, 'Contact information is required')
})

// Enhanced validation with sanitization
export class ValidationService {
  private static sanitizer = new InputSanitizer()

  static validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean
    data?: T
    errors?: string[]
  } {
    try {
      // First sanitize the input
      const sanitizedData = this.sanitizer.sanitizeObject(data)
      
      // Then validate
      const result = schema.safeParse(sanitizedData)
      
      if (result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          errors: result.error.errors.map(err => err.message)
        }
      }
  } catch (error) {
      return {
        success: false,
        errors: ['Validation failed due to invalid input format']
      }
    }
  }

  static validateEmail(email: string): boolean {
    return emailSchema.safeParse(email).success
  }

  static validatePassword(password: string): boolean {
    return passwordSchema.safeParse(password).success
  }

  static validateIdNumber(idNumber: string): boolean {
    return idNumberSchema.safeParse(idNumber).success
  }

  static validatePin(pin: string): boolean {
    return pinSchema.safeParse(pin).success
  }

  static sanitizeString(input: string): string {
    return this.sanitizer.sanitizeString(input)
  }

  static sanitizeObject(obj: any): any {
    return this.sanitizer.sanitizeObject(obj)
  }
}

// Rate limiting validation
export const rateLimitSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  endpoint: z.string().min(1, 'Endpoint is required'),
  limit: z.number().min(1, 'Limit must be greater than 0'),
  windowMs: z.number().min(1000, 'Window must be at least 1 second')
})

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().min(1, 'File size must be greater than 0'),
  type: z.string().min(1, 'File type is required'),
  lastModified: z.number().optional()
})

// Search validation
export const searchSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(100, 'Search query must be less than 100 characters'),
  filters: z.record(z.string()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1, 'Page must be greater than 0').optional(),
  limit: z.number().min(1, 'Limit must be greater than 0').max(100, 'Limit must be less than 100').optional()
})

// API request validation
export const apiRequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  path: z.string().min(1, 'Path is required'),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
  query: z.record(z.string()).optional()
})

// Export commonly used schemas
export {
  applicationSchema as ApplicationSchema,
  documentSchema as DocumentSchema,
  leaveRequestSchema as LeaveRequestSchema,
  issueReportSchema as IssueReportSchema,
  rateLimitSchema as RateLimitSchema,
  fileUploadSchema as FileUploadSchema,
  searchSchema as SearchSchema,
  apiRequestSchema as ApiRequestSchema
}