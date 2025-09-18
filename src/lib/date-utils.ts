/**
 * Date Utilities
 * Safe date conversion functions for Firestore timestamps and various date formats
 */

/**
 * Safely converts various date formats to a JavaScript Date object
 * Handles Firestore Timestamps, Date objects, strings, and numbers
 */
export function safeToDate(timestamp: any): Date {
  if (!timestamp) return new Date()
  
  // Firestore Timestamp
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate()
  }
  
  // Already a Date object
  if (timestamp instanceof Date) {
    return timestamp
  }
  
  // String date
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp)
    return isNaN(date.getTime()) ? new Date() : date
  }
  
  // Number timestamp (milliseconds or seconds)
  if (typeof timestamp === 'number') {
    // If timestamp is in seconds, convert to milliseconds
    const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp
    return new Date(ms)
  }
  
  // Fallback to current date
  return new Date()
}

/**
 * Formats a date to a readable string
 * Handles invalid dates gracefully
 */
export function formatDate(date: any, options?: Intl.DateTimeFormatOptions): string {
  const safeDate = safeToDate(date)
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  try {
    return safeDate.toLocaleDateString('en-US', { ...defaultOptions, ...options })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

/**
 * Formats a date to a short string (date only)
 */
export function formatDateShort(date: any): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Formats a date to a time string
 */
export function formatTime(date: any): string {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Checks if a date is valid
 */
export function isValidDate(date: any): boolean {
  if (!date) return false
  
  const safeDate = safeToDate(date)
  return !isNaN(safeDate.getTime())
}

/**
 * Gets relative time (e.g., "2 hours ago", "3 days ago")
 */
export function getRelativeTime(date: any): string {
  const safeDate = safeToDate(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - safeDate.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`
  }
  
  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`
}









