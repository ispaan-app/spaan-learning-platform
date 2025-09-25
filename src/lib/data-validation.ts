import { z } from 'zod'
import { ApiResponseBuilder, createValidationErrors, ValidationError } from './api-response'

// Common validation schemas
export const commonSchemas = {
  id: z.string().min(1, 'ID is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  date: z.string().datetime('Invalid date format'),
  url: z.string().url('Invalid URL format'),
  idNumber: z.string().regex(/^\d{13}$/, 'ID number must be 13 digits'),
  postalCode: z.string().regex(/^\d{4}$/, 'Postal code must be 4 digits')
}

// User validation schemas
export const userValidationSchemas = {
  create: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    role: z.enum(['applicant', 'learner', 'admin', 'super-admin']),
    program: z.string().optional(),
    idNumber: commonSchemas.idNumber
  }),

  update: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    email: commonSchemas.email.optional(),
    phone: commonSchemas.phone.optional(),
    program: z.string().optional(),
    status: z.enum(['pending', 'active', 'inactive', 'suspended']).optional()
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required')
  }),

  pinLogin: z.object({
    idNumber: commonSchemas.idNumber,
    pin: z.string().length(4, 'PIN must be 4 digits')
  })
}

// Program validation schemas
export const programValidationSchemas = {
  create: z.object({
    name: z.string().min(3, 'Program name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    duration: z.number().min(1, 'Duration must be at least 1 month'),
    requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
    startDate: commonSchemas.date,
    endDate: commonSchemas.date,
    maxParticipants: z.number().min(1, 'Max participants must be at least 1'),
    stipendAmount: z.number().min(0, 'Stipend amount cannot be negative')
  }),

  update: z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    duration: z.number().min(1).optional(),
    requirements: z.array(z.string()).min(1).optional(),
    startDate: commonSchemas.date.optional(),
    endDate: commonSchemas.date.optional(),
    maxParticipants: z.number().min(1).optional(),
    stipendAmount: z.number().min(0).optional()
  })
}

// Attendance validation schemas
export const attendanceValidationSchemas = {
  checkIn: z.object({
    userId: commonSchemas.id,
    locationId: commonSchemas.id,
    locationType: z.enum(['work', 'class']),
    selfieData: z.string().optional(),
    qrCodeData: z.string().optional()
  }),

  checkOut: z.object({
    userId: commonSchemas.id,
    attendanceId: commonSchemas.id
  })
}

// Leave request validation schemas
export const leaveRequestValidationSchemas = {
  create: z.object({
    userId: commonSchemas.id,
    type: z.enum(['sick', 'personal', 'emergency', 'other']),
    startDate: commonSchemas.date,
    endDate: commonSchemas.date,
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    emergencyContact: z.string().min(2, 'Emergency contact name is required'),
    emergencyPhone: commonSchemas.phone,
    supportingDocuments: z.string().optional(),
    notes: z.string().optional()
  }),

  update: z.object({
    status: z.enum(['pending', 'approved', 'rejected']),
    adminNotes: z.string().optional()
  })
}

// Issue report validation schemas
export const issueReportValidationSchemas = {
  create: z.object({
    userId: commonSchemas.id,
    category: z.enum(['technical', 'placement', 'stipend', 'attendance', 'general']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    location: z.string().optional(),
    contactMethod: z.enum(['email', 'phone']),
    contactInfo: z.string().min(1, 'Contact information is required')
  })
}

// Data validation service
export class DataValidationService {
  // Generic validation method
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean
    data?: T
    errors?: ValidationError[]
  } {
    try {
      const validatedData = schema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR'
        }))
        return { success: false, errors }
      }
      return { 
        success: false, 
        errors: [{ field: 'unknown', message: 'Validation failed', code: 'VALIDATION_ERROR' }] 
      }
    }
  }

  // Validate user data
  static validateUser(data: unknown, type: 'create' | 'update' | 'login' | 'pinLogin') {
    const schema = userValidationSchemas[type]
    return this.validate(schema as any, data)
  }

  // Validate program data
  static validateProgram(data: unknown, type: 'create' | 'update') {
    const schema = programValidationSchemas[type]
    return this.validate(schema as any, data)
  }

  // Validate attendance data
  static validateAttendance(data: unknown, type: 'checkIn' | 'checkOut') {
    const schema = attendanceValidationSchemas[type]
    return this.validate(schema as any, data)
  }

  // Validate leave request data
  static validateLeaveRequest(data: unknown, type: 'create' | 'update') {
    const schema = leaveRequestValidationSchemas[type]
    return this.validate(schema as any, data)
  }

  // Validate issue report data
  static validateIssueReport(data: unknown) {
    return this.validate(issueReportValidationSchemas.create as any, data)
  }

  // Business rule validations
  static validateBusinessRules(data: any, rules: string[]): ValidationError[] {
    const errors: ValidationError[] = []

    for (const rule of rules) {
      switch (rule) {
        case 'leave_dates':
          if (data.startDate && data.endDate) {
            const start = new Date(data.startDate)
            const end = new Date(data.endDate)
            if (start >= end) {
              errors.push({
                field: 'endDate',
                message: 'End date must be after start date',
                code: 'BUSINESS_RULE_VIOLATION'
              })
            }
            if (end.getTime() - start.getTime() > 30 * 24 * 60 * 60 * 1000) {
              errors.push({
                field: 'endDate',
                message: 'Leave period cannot exceed 30 days',
                code: 'BUSINESS_RULE_VIOLATION'
              })
            }
          }
          break

        case 'program_dates':
          if (data.startDate && data.endDate) {
            const start = new Date(data.startDate)
            const end = new Date(data.endDate)
            if (start >= end) {
              errors.push({
                field: 'endDate',
                message: 'Program end date must be after start date',
                code: 'BUSINESS_RULE_VIOLATION'
              })
            }
          }
          break

        case 'stipend_eligibility':
          if (data.workHours && data.targetHours) {
            const percentage = (data.workHours / data.targetHours) * 100
            if (percentage < 50) {
              errors.push({
                field: 'workHours',
                message: 'Minimum 50% of target hours required for stipend',
                code: 'BUSINESS_RULE_VIOLATION'
              })
            }
          }
          break

        case 'id_number_format':
          if (data.idNumber) {
            const id = data.idNumber.replace(/\D/g, '')
            if (id.length !== 13) {
              errors.push({
                field: 'idNumber',
                message: 'ID number must be exactly 13 digits',
                code: 'BUSINESS_RULE_VIOLATION'
              })
            }
          }
          break
      }
    }

    return errors
  }

  // Sanitize data
  static sanitize(data: any): any {
    if (typeof data === 'string') {
      return data.trim().replace(/[<>]/g, '')
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item))
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitize(value)
      }
      return sanitized
    }
    
    return data
  }

  // Validate and sanitize
  static validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean
    data?: T
    errors?: ValidationError[]
  } {
    const sanitized = this.sanitize(data)
    return this.validate(schema, sanitized)
  }
}

// Middleware for API validation
export function withValidation<T>(schema: z.ZodSchema<T>, businessRules?: string[]) {
  return async (data: unknown) => {
    // Validate schema
    const validation = DataValidationService.validate(schema, data)
    if (!validation.success) {
      return ApiResponseBuilder.unprocessableEntity(
        'Validation failed',
        validation.errors
      )
    }

    // Validate business rules
    if (businessRules && businessRules.length > 0) {
      const ruleErrors = DataValidationService.validateBusinessRules(data, businessRules)
      if (ruleErrors.length > 0) {
        return ApiResponseBuilder.unprocessableEntity(
          'Business rule violation',
          ruleErrors
        )
      }
    }

    return null // No validation errors
  }
}

// Schemas are already exported individually above
