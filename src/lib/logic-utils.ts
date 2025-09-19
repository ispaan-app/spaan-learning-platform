// Cross-cutting logic utilities for error handling, permissions, atomicity, validation, notification, and audit
import { auditLogger } from './auditLogger'
import { notificationActions, createCustomNotification } from './notificationActions'
import { ZodSchema } from 'zod'

/**
 * Standard error handler for async server actions
 */
export async function withErrorHandling<T>(fn: () => Promise<T>, context?: string): Promise<T | { success: false; error: string }> {
  try {
    return await fn()
  } catch (error: any) {
    const message = error?.message || 'Unknown error'
    if (context) {
      // Log to audit
      await auditLogger.logSystem('ERROR', { context, message })
    }
    // Optionally notify super admins for critical errors
    // ...
    return { success: false, error: message }
  }
}

/**
 * Enforce role/permission checks on the backend
 */
export function requireRole(userRole: string, allowed: string[]): void {
  if (!allowed.includes(userRole)) {
    throw new Error('Permission denied')
  }
}

/**
 * Validate input using Zod schema
 */
export function validateInput<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error('Validation failed: ' + JSON.stringify(result.error.issues))
  }
  return result.data
}

/**
 * Run multiple Firestore writes atomically (batch)
 */
export async function runBatch(batchFn: (batch: any) => Promise<void>, db: any): Promise<void> {
  const batch = db.batch()
  await batchFn(batch)
  await batch.commit()
}

/**
 * Send notification and log audit event
 */
export async function notifyAndAudit({
  userId,
  type,
  title,
  message,
  auditAction,
  auditDetails,
  priority = 'medium',
  data
}: {
  userId: string
  type: string
  title: string
  message: string
  auditAction: string
  auditDetails?: Record<string, any>
  priority?: string
  data?: Record<string, any>
}) {
  await createCustomNotification(userId, type as any, title, message, priority as any, data)
  await auditLogger.logUserAction(auditAction, userId, 'system', auditDetails)
}
