// Audit logging for user and document actions
import { auditLogger } from '@/lib/auditLogger'

export async function logUserCreated(userId: string, userRole: string, details?: Record<string, any>) {
  return auditLogger.logUserAction('User Created', userId, userRole, details)
}

export async function logUserStatusUpdated(userId: string, userRole: string, status: string, details?: Record<string, any>) {
  return auditLogger.logUserAction(`User Status Updated: ${status}`, userId, userRole, details)
}

export async function logDocumentUploaded(userId: string, userRole: string, documentType: string, details?: Record<string, any>) {
  return auditLogger.logData('Document Uploaded', userId, userRole, undefined, documentType, details)
}

export async function logDocumentReviewed(userId: string, userRole: string, documentType: string, status: string, details?: Record<string, any>) {
  return auditLogger.logData(`Document ${status === 'approved' ? 'Approved' : 'Rejected'}`, userId, userRole, undefined, documentType, details)
}
