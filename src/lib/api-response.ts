import { NextResponse } from 'next/server'

// Standardized API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
  timestamp: string
  requestId?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ApiError extends ApiResponse {
  success: false
  error: string
  code: string
  details?: ValidationError[]
  stack?: string
}

// Standardized API response functions
export class ApiResponseBuilder {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Success responses
  static success<T>(data: T, message?: string, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }, { status })
  }

  static created<T>(data: T, message = 'Resource created successfully'): NextResponse<ApiResponse<T>> {
    return this.success(data, message, 201)
  }

  static noContent(message = 'Operation completed successfully'): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: true,
      message,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }, { status: 204 })
  }

  // Paginated responses
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): NextResponse<PaginatedResponse<T>> {
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, { status: 200 })
  }

  // Error responses
  static badRequest(message: string, details?: ValidationError[]): NextResponse<ApiError> {
    return NextResponse.json({
      success: false,
      error: message,
      code: 'BAD_REQUEST',
      details,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }, { status: 400 })
  }

  static unauthorized(message = 'Unauthorized access'): NextResponse<ApiError> {
    return NextResponse.json({
      success: false,
      error: message,
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }, { status: 401 })
  }

  static forbidden(message = 'Access forbidden'): NextResponse<ApiError> {
    return NextResponse.json({
      success: false,
      error: message,
      code: 'FORBIDDEN',
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }, { status: 403 })
  }

  static notFound(message = 'Resource not found'): NextResponse<ApiError> {
    return NextResponse.json({
      success: false,
      error: message,
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }, { status: 404 })
  }

  static methodNotAllowed(message = 'Method not allowed'): NextResponse<ApiError> {
    return NextResponse.json({
      success: false,
      error: message,
      code: 'METHOD_NOT_ALLOWED',
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }, { status: 405 })
  }

  static conflict(message: string): NextResponse<ApiError> {
    return NextResponse.json({
      success: false,
      error: message,
      code: 'CONFLICT',
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }, { status: 409 })
  }

  static unprocessableEntity(message: string, details?: ValidationError[]): NextResponse<ApiError> {
    return NextResponse.json({
      success: false,
      error: message,
      code: 'UNPROCESSABLE_ENTITY',
      details,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }, { status: 422 })
  }

  static tooManyRequests(message = 'Too many requests', retryAfter?: number): NextResponse {
    const response = NextResponse.json({
      success: false,
      error: message,
      code: 'TOO_MANY_REQUESTS',
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }, { status: 429 })

    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString())
    }

    return response
  }

  static internalError(message = 'Internal server error', error?: Error): NextResponse<ApiError> {
    const response: ApiError = {
      success: false,
      error: message,
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }

    // Only include stack trace in development
    if (process.env.NODE_ENV === 'development' && error) {
      response.stack = error.stack
    }

    return NextResponse.json(response, { status: 500 })
  }

  static serviceUnavailable(message = 'Service temporarily unavailable'): NextResponse<ApiError> {
    return NextResponse.json({
      success: false,
      error: message,
      code: 'SERVICE_UNAVAILABLE',
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }, { status: 503 })
  }

  // Validation error helper
  static validationError(field: string, message: string, code = 'VALIDATION_ERROR'): ValidationError {
    return { field, message, code }
  }

  // Custom error response
  static customError(
    message: string,
    code: string,
    status: number,
    details?: ValidationError[]
  ): NextResponse<ApiError> {
    return NextResponse.json({
      success: false,
      error: message,
      code,
      details,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }, { status })
  }
}

// Error codes enum for consistency
export enum ApiErrorCodes {
  // Client Errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server Errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Business Logic Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  RESOURCE_LIMIT_EXCEEDED = 'RESOURCE_LIMIT_EXCEEDED',
  
  // Authentication/Authorization
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Data Errors
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  DATA_CONFLICT = 'DATA_CONFLICT',
  DATA_VALIDATION_FAILED = 'DATA_VALIDATION_FAILED'
}

// Helper function to create validation errors
export function createValidationErrors(errors: Record<string, string>): ValidationError[] {
  return Object.entries(errors).map(([field, message]) => ({
    field,
    message,
    code: ApiErrorCodes.VALIDATION_ERROR
  }))
}

// Export the builder as default
export default ApiResponseBuilder
