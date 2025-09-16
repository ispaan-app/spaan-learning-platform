import { NextRequest, NextResponse } from 'next/server'
import { AppError } from './types'

// Error codes and messages
export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  VALUE_TOO_LONG: 'VALUE_TOO_LONG',
  VALUE_TOO_SHORT: 'VALUE_TOO_SHORT',
  
  // Database errors
  DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
  DATABASE_QUERY_FAILED: 'DATABASE_QUERY_FAILED',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  RECORD_ALREADY_EXISTS: 'RECORD_ALREADY_EXISTS',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  
  // Business logic errors
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // External service errors
  EXTERNAL_SERVICE_UNAVAILABLE: 'EXTERNAL_SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_TIMEOUT: 'EXTERNAL_SERVICE_TIMEOUT',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // System errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE'
} as const

export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_REQUIRED]: 'Authentication required',
  [ERROR_CODES.AUTH_INVALID]: 'Invalid authentication credentials',
  [ERROR_CODES.AUTH_EXPIRED]: 'Authentication token has expired',
  [ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for this operation',
  [ERROR_CODES.VALIDATION_FAILED]: 'Validation failed',
  [ERROR_CODES.REQUIRED_FIELD_MISSING]: 'Required field is missing',
  [ERROR_CODES.INVALID_FORMAT]: 'Invalid format',
  [ERROR_CODES.VALUE_TOO_LONG]: 'Value is too long',
  [ERROR_CODES.VALUE_TOO_SHORT]: 'Value is too short',
  [ERROR_CODES.DATABASE_CONNECTION_FAILED]: 'Database connection failed',
  [ERROR_CODES.DATABASE_QUERY_FAILED]: 'Database query failed',
  [ERROR_CODES.RECORD_NOT_FOUND]: 'Record not found',
  [ERROR_CODES.RECORD_ALREADY_EXISTS]: 'Record already exists',
  [ERROR_CODES.DUPLICATE_ENTRY]: 'Duplicate entry',
  [ERROR_CODES.FILE_TOO_LARGE]: 'File is too large',
  [ERROR_CODES.INVALID_FILE_TYPE]: 'Invalid file type',
  [ERROR_CODES.UPLOAD_FAILED]: 'File upload failed',
  [ERROR_CODES.FILE_NOT_FOUND]: 'File not found',
  [ERROR_CODES.INSUFFICIENT_CREDITS]: 'Insufficient credits',
  [ERROR_CODES.OPERATION_NOT_ALLOWED]: 'Operation not allowed',
  [ERROR_CODES.RESOURCE_LOCKED]: 'Resource is locked',
  [ERROR_CODES.QUOTA_EXCEEDED]: 'Quota exceeded',
  [ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE]: 'External service unavailable',
  [ERROR_CODES.EXTERNAL_SERVICE_TIMEOUT]: 'External service timeout',
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'External service error',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service unavailable',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [ERROR_CODES.MAINTENANCE_MODE]: 'Service is in maintenance mode'
} as const

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  FILE_UPLOAD = 'file_upload',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  SYSTEM = 'system',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  createError(
    code: keyof typeof ERROR_CODES,
    message?: string,
    details?: Record<string, any>,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN
  ): AppError {
    const error: AppError = {
      code: ERROR_CODES[code],
      message: message || ERROR_MESSAGES[ERROR_CODES[code]],
      details,
      timestamp: Date.now(),
      stack: new Error().stack,
      severity,
      category
    }

    this.logError(error, severity, category)
    return error
  }

  handleError(
    error: unknown,
    context?: {
      userId?: string
      requestId?: string
      operation?: string
      additionalInfo?: Record<string, any>
    }
  ): AppError {
    let appError: AppError

    if (error instanceof Error) {
      appError = {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
        details: {
          name: error.name,
          stack: error.stack,
          ...context?.additionalInfo
        },
        timestamp: Date.now(),
        userId: context?.userId,
        requestId: context?.requestId,
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.UNKNOWN
      }
    } else if (typeof error === 'object' && error !== null && 'code' in error) {
      appError = error as AppError
    } else {
      appError = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unknown error occurred',
        details: {
          originalError: error,
          ...context?.additionalInfo
        },
        timestamp: Date.now(),
        userId: context?.userId,
        requestId: context?.requestId,
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.UNKNOWN
      }
    }

    this.logError(appError, ErrorSeverity.HIGH, ErrorCategory.UNKNOWN)
    return appError
  }

  private logError(
    error: AppError,
    severity: ErrorSeverity,
    category: ErrorCategory
  ): void {
    // Add severity and category to error
    const enhancedError = {
      ...error,
      severity,
      category
    }

    this.errorLog.push(enhancedError)

    // Keep only last 1000 errors
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-1000)
    }

    // Log to console based on severity
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        console.error('CRITICAL ERROR:', enhancedError)
        break
      case ErrorSeverity.HIGH:
        console.error('HIGH SEVERITY ERROR:', enhancedError)
        break
      case ErrorSeverity.MEDIUM:
        console.warn('MEDIUM SEVERITY ERROR:', enhancedError)
        break
      case ErrorSeverity.LOW:
        console.info('LOW SEVERITY ERROR:', enhancedError)
        break
    }

    // In production, you would send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(enhancedError)
    }
  }

  private sendToExternalLogger(error: AppError): void {
    // In a real implementation, you would send to services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - CloudWatch
    // For now, we'll just log to console
    console.log('Sending to external logger:', error)
  }

  getErrors(filters?: {
    severity?: ErrorSeverity
    category?: ErrorCategory
    userId?: string
    timeRange?: number
  }): AppError[] {
    let filteredErrors = [...this.errorLog]

    if (filters?.severity) {
      filteredErrors = filteredErrors.filter(error => error.severity === filters.severity)
    }

    if (filters?.category) {
      filteredErrors = filteredErrors.filter(error => error.category === filters.category)
    }

    if (filters?.userId) {
      filteredErrors = filteredErrors.filter(error => error.userId === filters.userId)
    }

    if (filters?.timeRange) {
      const cutoffTime = Date.now() - filters.timeRange
      filteredErrors = filteredErrors.filter(error => error.timestamp >= cutoffTime)
    }

    return filteredErrors.sort((a, b) => b.timestamp - a.timestamp)
  }

  getErrorStats(): {
    total: number
    bySeverity: Record<ErrorSeverity, number>
    byCategory: Record<ErrorCategory, number>
    recentErrors: AppError[]
  } {
    const bySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = this.errorLog.filter(error => error.severity === severity).length
      return acc
    }, {} as Record<ErrorSeverity, number>)

    const byCategory = Object.values(ErrorCategory).reduce((acc, category) => {
      acc[category] = this.errorLog.filter(error => error.category === category).length
      return acc
    }, {} as Record<ErrorCategory, number>)

    return {
      total: this.errorLog.length,
      bySeverity,
      byCategory,
      recentErrors: this.errorLog.slice(-10)
    }
  }

  clearErrors(): void {
    this.errorLog = []
  }
}

// Error response helper
export function createErrorResponse(
  error: AppError,
  statusCode: number = 500
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp: error.timestamp,
      requestId: error.requestId
    },
    { status: statusCode }
  )
}

// Error boundary for React components
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorHandler = ErrorHandler.getInstance()
    errorHandler.handleError(error, {
      additionalInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
            <p className="text-sm text-gray-500">An unexpected error occurred</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            }}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Reload Page
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="text-sm text-gray-500 cursor-pointer">Error Details</summary>
            <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

// Error handling middleware
export function withErrorHandling<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async function (request: NextRequest, ...args: T): Promise<NextResponse> {
    try {
      return await handler(request, ...args)
    } catch (error) {
      const errorHandler = ErrorHandler.getInstance()
      const appError = errorHandler.handleError(error, {
        requestId: request.headers.get('x-request-id') || undefined,
        operation: request.nextUrl.pathname
      })

      return createErrorResponse(appError)
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Import React for ErrorBoundary
import React from 'react'
