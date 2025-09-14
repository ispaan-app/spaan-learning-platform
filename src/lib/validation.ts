import { z } from 'zod'

// Common validation schemas
export const idNumberSchema = z.string()
  .min(13, 'ID number must be 13 digits')
  .max(13, 'ID number must be 13 digits')
  .regex(/^\d{13}$/, 'ID number must contain only digits')

export const pinSchema = z.string()
  .min(6, 'PIN must be 6 digits')
  .max(6, 'PIN must be 6 digits')
  .regex(/^\d{6}$/, 'PIN must contain only digits')

export const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')

export const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must be at most 15 digits')
  .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Please enter a valid phone number')

// User validation schemas
export const userRoleSchema = z.enum(['applicant', 'learner', 'admin', 'super-admin'])

export const userStatusSchema = z.enum(['pending', 'active', 'inactive', 'suspended'])

export const createUserSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  email: emailSchema,
  
  idNumber: idNumberSchema,
  
  phone: phoneSchema,
  
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().min(4, 'Postal code must be at least 4 characters'),
    country: z.string().default('South Africa')
  }),
  
  program: z.string().min(1, 'Program selection is required'),
  
  qualifications: z.array(z.string()).min(1, 'At least one qualification is required'),
  
  experience: z.string()
    .min(10, 'Experience description must be at least 10 characters')
    .max(1000, 'Experience description must be less than 1000 characters'),
  
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  
  role: userRoleSchema.default('applicant'),
  status: userStatusSchema.default('pending')
})

export const updateUserSchema = createUserSchema.partial()

// Document validation schemas
export const documentTypeSchema = z.enum([
  'id_copy',
  'cv',
  'qualifications',
  'references',
  'portfolio',
  'other'
])

export const documentStatusSchema = z.enum(['pending', 'approved', 'rejected'])

export const documentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: documentTypeSchema,
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().min(1, 'File size must be greater than 0'),
  fileType: z.string().min(1, 'File type is required'),
  fileUrl: z.string().url('Invalid file URL'),
  status: documentStatusSchema.default('pending'),
  uploadedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().optional(),
  reviewedBy: z.string().optional(),
  rejectionReason: z.string().optional()
})

// Placement validation schemas
export const placementStatusSchema = z.enum(['active', 'inactive', 'full', 'suspended'])

export const placementSchema = z.object({
  id: z.string(),
  companyName: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is required'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  currentLearners: z.number().min(0, 'Current learners cannot be negative'),
  status: placementStatusSchema.default('active'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// Work hours validation schemas
export const workHoursSchema = z.object({
  id: z.string(),
  learnerId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  hours: z.number().min(0, 'Hours cannot be negative').max(24, 'Hours cannot exceed 24'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  verified: z.boolean().default(false),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// Leave request validation schemas
export const leaveTypeSchema = z.enum(['sick', 'personal', 'emergency', 'other'])

export const leaveStatusSchema = z.enum(['pending', 'approved', 'rejected'])

export const leaveRequestSchema = z.object({
  id: z.string(),
  learnerId: z.string(),
  type: leaveTypeSchema,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  status: leaveStatusSchema.default('pending'),
  requestedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().optional(),
  reviewedBy: z.string().optional(),
  rejectionReason: z.string().optional()
})

// Announcement validation schemas
export const announcementSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message must be less than 2000 characters'),
  targetAudience: z.enum(['all', 'learners', 'applicants', 'admins']),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  published: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  createdBy: z.string()
})

// Audit log validation schemas
export const auditLogSchema = z.object({
  id: z.string(),
  action: z.string().min(1, 'Action is required'),
  userId: z.string(),
  userRole: userRoleSchema,
  targetId: z.string().optional(),
  targetType: z.string().optional(),
  details: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.string().datetime()
})

// API response validation schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional()
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  type: documentTypeSchema,
  maxSize: z.number().default(10 * 1024 * 1024), // 10MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
}).refine((data) => {
  return data.file.size <= data.maxSize
}, {
  message: 'File size exceeds maximum allowed size',
  path: ['file']
}).refine((data) => {
  return data.allowedTypes.includes(data.file.type)
}, {
  message: 'File type is not allowed',
  path: ['file']
})

// Search and filter validation
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.object({
    role: userRoleSchema.optional(),
    status: userStatusSchema.optional(),
    program: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional()
  }).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Utility functions
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return { success: false, error: errorMessage }
    }
    return { success: false, error: 'Validation failed' }
  }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

export function validateFileUpload(file: File, allowedTypes: string[], maxSize: number): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` }
  }
  
  return { valid: true }
}

