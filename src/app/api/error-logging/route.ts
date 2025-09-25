import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import ApiResponseBuilder from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json()
    
    // Validate required fields
    if (!errorData.errorId || !errorData.message) {
      return ApiResponseBuilder.badRequest('Missing required error fields')
    }

    // Sanitize error data
    const sanitizedError = {
      errorId: errorData.errorId,
      message: errorData.message.substring(0, 1000), // Limit message length
      stack: errorData.stack?.substring(0, 5000), // Limit stack trace length
      componentStack: errorData.componentStack?.substring(0, 2000),
      timestamp: errorData.timestamp || new Date().toISOString(),
      userAgent: errorData.userAgent?.substring(0, 500),
      url: errorData.url?.substring(0, 500),
      type: errorData.type || 'unknown',
      severity: determineSeverity(errorData.message, errorData.stack),
      resolved: false,
      createdAt: new Date()
    }

    // Store error in Firestore
    await adminDb.collection('errorLogs').add(sanitizedError)

    // In production, you might want to send alerts for critical errors
    if (process.env.NODE_ENV === 'production' && sanitizedError.severity === 'critical') {
      await sendCriticalErrorAlert(sanitizedError)
    }

    return ApiResponseBuilder.success(
      { errorId: sanitizedError.errorId },
      'Error logged successfully'
    )

  } catch (error) {
    console.error('Error logging failed:', error)
    return ApiResponseBuilder.internalError('Failed to log error', error as Error)
  }
}

function determineSeverity(message: string, stack?: string): 'low' | 'medium' | 'high' | 'critical' {
  const messageLower = message.toLowerCase()
  const stackLower = stack?.toLowerCase() || ''

  // Critical errors
  if (
    messageLower.includes('network') ||
    messageLower.includes('database') ||
    messageLower.includes('authentication') ||
    messageLower.includes('payment') ||
    stackLower.includes('firebase') ||
    stackLower.includes('firestore')
  ) {
    return 'critical'
  }

  // High severity errors
  if (
    messageLower.includes('error') ||
    messageLower.includes('failed') ||
    messageLower.includes('exception') ||
    stackLower.includes('error')
  ) {
    return 'high'
  }

  // Medium severity errors
  if (
    messageLower.includes('warning') ||
    messageLower.includes('timeout') ||
    messageLower.includes('retry')
  ) {
    return 'medium'
  }

  // Default to low severity
  return 'low'
}

async function sendCriticalErrorAlert(error: any) {
  try {
    // Send email alert to administrators
    await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'email',
        to: process.env.ADMIN_EMAIL || 'admin@ispaan.com',
        subject: `Critical Error Alert - ${error.errorId}`,
        message: `
          A critical error has occurred in the iSpaan application.
          
          Error ID: ${error.errorId}
          Message: ${error.message}
          URL: ${error.url}
          Timestamp: ${error.timestamp}
          
          Please investigate immediately.
        `
      })
    })
  } catch (alertError) {
    console.error('Failed to send critical error alert:', alertError)
  }
}
