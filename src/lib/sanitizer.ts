export class InputSanitizer {
  private static instance: InputSanitizer

  static getInstance(): InputSanitizer {
    if (!InputSanitizer.instance) {
      InputSanitizer.instance = new InputSanitizer()
    }
    return InputSanitizer.instance
  }

  sanitize(input: any): any {
    if (typeof input === 'string') {
      return this.sanitizeString(input)
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitize(item))
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitize(value)
      }
      return sanitized
    }
    
    return input
  }

  private sanitizeString(str: string): string {
    return str
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/['"]/g, '') // Remove quotes
      .replace(/;/g, '') // Remove semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comments
      .replace(/\*\//g, '') // Remove block comments
  }

  // Sanitize HTML content
  sanitizeHTML(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
      .replace(/javascript:/gi, '') // Remove javascript: protocol
  }

  // Sanitize SQL input
  sanitizeSQL(input: string): string {
    return input
      .replace(/['"]/g, '') // Remove quotes
      .replace(/;/g, '') // Remove semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comments
      .replace(/\*\//g, '') // Remove block comments
      .replace(/union/gi, '') // Remove UNION keywords
      .replace(/select/gi, '') // Remove SELECT keywords
      .replace(/insert/gi, '') // Remove INSERT keywords
      .replace(/update/gi, '') // Remove UPDATE keywords
      .replace(/delete/gi, '') // Remove DELETE keywords
      .replace(/drop/gi, '') // Remove DROP keywords
  }

  // Sanitize file name
  sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
      .replace(/\.\./g, '') // Remove path traversal
      .replace(/^\./, '') // Remove leading dot
      .substring(0, 255) // Limit length
  }

  // Sanitize email
  sanitizeEmail(email: string): string {
    return email
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9@._-]/g, '') // Keep only valid email characters
  }

  // Sanitize phone number
  sanitizePhone(phone: string): string {
    return phone
      .replace(/[^0-9+\-\s()]/g, '') // Keep only valid phone characters
      .trim()
  }

  // Sanitize URL
  sanitizeURL(url: string): string {
    try {
      const urlObj = new URL(url)
      // Only allow http and https protocols
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        return urlObj.toString()
      }
      return ''
    } catch {
      return ''
    }
  }
}

export const sanitizer = InputSanitizer.getInstance()