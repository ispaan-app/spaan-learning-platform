/**
 * Applicant ID Generator
 * Creates user-friendly Applicant IDs for administrators
 */

export interface ApplicantIdData {
  friendlyId: string
  documentId: string
  generatedAt: string
}

/**
 * Generate a user-friendly Applicant ID
 * Format: APP-YYYY-XXXX (e.g., APP-2024-0001)
 */
export function generateApplicantId(): string {
  const year = new Date().getFullYear()
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `APP-${year}-${random}`
}

/**
 * Generate a more readable Applicant ID with applicant info
 * Format: APP-YYYY-NAME-XXXX (e.g., APP-2024-JOHN-0001)
 */
export function generateApplicantIdWithName(firstName: string, lastName: string): string {
  const year = new Date().getFullYear()
  const namePrefix = `${firstName.toUpperCase().substring(0, 3)}${lastName.toUpperCase().substring(0, 3)}`
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  
  return `APP-${year}-${namePrefix}-${random}`
}

/**
 * Generate a sequential Applicant ID
 * Format: APP-YYYY-XXXX (e.g., APP-2024-0001)
 */
export function generateSequentialApplicantId(sequenceNumber: number): string {
  const year = new Date().getFullYear()
  const sequence = sequenceNumber.toString().padStart(4, '0')
  
  return `APP-${year}-${sequence}`
}

/**
 * Validate if a string is a valid Applicant ID format
 */
export function isValidApplicantId(id: string): boolean {
  const pattern = /^APP-\d{4}-[A-Z0-9-]+$/
  return pattern.test(id)
}

/**
 * Extract year from Applicant ID
 */
export function extractYearFromApplicantId(id: string): number | null {
  const match = id.match(/^APP-(\d{4})-/)
  return match ? parseInt(match[1]) : null
}

/**
 * Create Applicant ID data object
 */
export function createApplicantIdData(documentId: string, firstName?: string, lastName?: string): ApplicantIdData {
  const friendlyId = firstName && lastName 
    ? generateApplicantIdWithName(firstName, lastName)
    : generateApplicantId()
  
  return {
    friendlyId,
    documentId,
    generatedAt: new Date().toISOString()
  }
}

/**
 * Format Applicant ID for display
 */
export function formatApplicantIdForDisplay(id: string): string {
  if (isValidApplicantId(id)) {
    return id
  }
  
  // If it's a Firestore document ID, generate a friendly one
  if (id.length > 20 && !id.includes('-')) {
    return `APP-${new Date().getFullYear()}-${id.substring(0, 4).toUpperCase()}`
  }
  
  return id
}



