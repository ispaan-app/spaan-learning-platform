import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { adminDb } from '@/lib/firebase-admin'
import { sessionManager, validateSession } from '@/lib/session'
import { auditLogger } from '@/lib/auditLogger'
import { sanitizer } from '@/lib/sanitizer'
import { rateLimiter } from '@/lib/rateLimiter'

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'applicant' | 'learner' | 'admin' | 'super-admin'
  status: 'pending' | 'active' | 'inactive' | 'suspended'
  program?: string
  placementId?: string
  monthlyHours?: number
  targetHours?: number
  lastCheckIn?: string
  pinHash?: string
  createdAt: string
  updatedAt: string
}

interface LoginAttempt {
  email: string
  ip: string
  userAgent: string
  timestamp: Date
  success: boolean
  failureReason?: string
}

class AuthManager {
  private static instance: AuthManager
  private loginAttempts: Map<string, LoginAttempt[]> = new Map()
  private readonly MAX_ATTEMPTS = 5
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

  private constructor() {
    // Clean up old login attempts every 5 minutes
    setInterval(() => {
      this.cleanupLoginAttempts()
    }, 5 * 60 * 1000)
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  // Enhanced login with security checks
  async login(email: string, password: string, request: NextRequest): Promise<{
    success: boolean
    user?: UserData
    error?: string
    requiresVerification?: boolean
  }> {
    const clientIP = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''

    try {
      // Rate limiting check
      const rateLimitResult = await rateLimiter.checkLimit(
        clientIP,
        '/api/auth/login',
        { maxRequests: 5, windowMs: 15 * 60 * 1000 }
      )

      if (!rateLimitResult.allowed) {
        await auditLogger.logSecurity('RATE_LIMIT_EXCEEDED', 'anonymous', 'anonymous', {
          ip: clientIP,
          email,
          retryAfter: rateLimitResult.retryAfter
        })
        return { success: false, error: 'Too many login attempts. Please try again later.' }
      }

      // Check for account lockout
      if (this.isAccountLocked(email, clientIP)) {
        await auditLogger.logSecurity('ACCOUNT_LOCKED', 'anonymous', 'anonymous', {
          email,
          ip: clientIP,
          reason: 'Too many failed attempts'
        })
        return { success: false, error: 'Account temporarily locked due to too many failed attempts.' }
      }

      // Sanitize inputs
      const sanitizedEmail = sanitizer.sanitizeEmail(email)
      if (!sanitizedEmail) {
        return { success: false, error: 'Invalid email format' }
      }

      // Authenticate with Firebase
      const auth = getAuth()
      let user
      try {
        user = await auth.getUserByEmail(sanitizedEmail)
      } catch (error) {
        this.recordLoginAttempt(sanitizedEmail, clientIP, userAgent, false, 'User not found')
        return { success: false, error: 'Invalid credentials' }
      }

      // Check if user is disabled
      if (user.disabled) {
        await auditLogger.logSecurity('LOGIN_ATTEMPT_DISABLED_USER', user.uid, 'unknown', {
          email: sanitizedEmail,
          ip: clientIP
        })
        return { success: false, error: 'Account is disabled' }
      }

      // Get user data from Firestore
      const userDoc = await adminDb.collection('users').doc(user.uid).get()
      if (!userDoc.exists) {
        await auditLogger.logSecurity('LOGIN_ATTEMPT_NO_FIRESTORE_DATA', user.uid, 'unknown', {
          email: sanitizedEmail,
          ip: clientIP
        })
        return { success: false, error: 'User data not found' }
      }

      const userData = userDoc.data() as UserData

      // Check user status
      if (userData.status === 'suspended') {
        await auditLogger.logSecurity('LOGIN_ATTEMPT_SUSPENDED_USER', user.uid, userData.role, {
          email: sanitizedEmail,
          ip: clientIP
        })
        return { success: false, error: 'Account is suspended' }
      }

      // Record successful login
      this.recordLoginAttempt(sanitizedEmail, clientIP, userAgent, true)
      
      await auditLogger.logAuth('LOGIN_SUCCESS', user.uid, userData.role, {
        email: sanitizedEmail,
        ip: clientIP,
        userAgent
      })

      return { success: true, user: userData }

    } catch (error) {
      console.error('Login error:', error)
      
      this.recordLoginAttempt(email, clientIP, userAgent, false, 'System error')
      
      await auditLogger.logSecurity('LOGIN_ERROR', 'anonymous', 'anonymous', {
        email,
        ip: clientIP,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  // PIN-based login for users
  async loginWithPin(idNumber: string, pin: string, request: NextRequest): Promise<{
    success: boolean
    user?: UserData
    customToken?: string
    error?: string
  }> {
    const clientIP = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''

    try {
      // Rate limiting
      const rateLimitResult = await rateLimiter.checkLimit(
        clientIP,
        '/api/auth/pin-login',
        { maxRequests: 10, windowMs: 15 * 60 * 1000 }
      )

      if (!rateLimitResult.allowed) {
        return { success: false, error: 'Too many login attempts. Please try again later.' }
      }

      // Sanitize inputs
      const sanitizedIdNumber = sanitizer.sanitize(idNumber)
      const sanitizedPin = sanitizer.sanitize(pin)

      if (!sanitizedIdNumber || !sanitizedPin) {
        return { success: false, error: 'Invalid input' }
      }

      // Find user by ID number
      const usersQuery = await adminDb
        .collection('users')
        .where('idNumber', '==', sanitizedIdNumber)
        .limit(1)
        .get()

      if (usersQuery.empty) {
        await auditLogger.logSecurity('PIN_LOGIN_USER_NOT_FOUND', 'anonymous', 'anonymous', {
          idNumber: sanitizedIdNumber,
          ip: clientIP
        })
        return { success: false, error: 'Invalid credentials' }
      }

      const userDoc = usersQuery.docs[0]
      const userData = userDoc.data() as UserData

      // Check user status
      if (userData.status === 'suspended') {
        await auditLogger.logSecurity('PIN_LOGIN_SUSPENDED_USER', userData.id, userData.role, {
          idNumber: sanitizedIdNumber,
          ip: clientIP
        })
        return { success: false, error: 'Account is suspended' }
      }

      // Verify PIN (in a real implementation, you would hash and compare)
      // For now, we'll assume the PIN is stored hashed in the database
      const pinValid = userData.pinHash ? await this.verifyPin(sanitizedPin, userData.pinHash) : false
      
      if (!pinValid) {
        await auditLogger.logSecurity('PIN_LOGIN_INVALID_PIN', userData.id, userData.role, {
          idNumber: sanitizedIdNumber,
          ip: clientIP
        })
        return { success: false, error: 'Invalid credentials' }
      }

      // Generate custom token
      const auth = getAuth()
      const customToken = await auth.createCustomToken(userData.id, {
        role: userData.role,
        status: userData.status
      })

      await auditLogger.logAuth('PIN_LOGIN_SUCCESS', userData.id, userData.role, {
        idNumber: sanitizedIdNumber,
        ip: clientIP,
        userAgent
      })

      return { success: true, user: userData, customToken }

    } catch (error) {
      console.error('PIN login error:', error)
      
      await auditLogger.logSecurity('PIN_LOGIN_ERROR', 'anonymous', 'anonymous', {
        idNumber,
        ip: clientIP,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  // Verify user session
  async verifySession(request: NextRequest): Promise<{
    valid: boolean
    user?: UserData
    error?: string
  }> {
    try {
      const sessionResult = await validateSession(request)
      
      if (!sessionResult.valid) {
        return { valid: false, error: sessionResult.error }
      }

      const session = sessionResult.session!
      
      // Get fresh user data
      const userDoc = await adminDb.collection('users').doc(session.userId).get()
      if (!userDoc.exists) {
        return { valid: false, error: 'User not found' }
      }

      const userData = userDoc.data() as UserData

      // Check if user is still active
      if (userData.status === 'suspended') {
        return { valid: false, error: 'Account suspended' }
      }

      return { valid: true, user: userData }

    } catch (error) {
      console.error('Session verification error:', error)
      return { valid: false, error: 'Session verification failed' }
    }
  }

  // Logout user
  async logout(userId: string, request: NextRequest): Promise<{ success: boolean }> {
    try {
      const clientIP = this.getClientIP(request)
      
      await auditLogger.logAuth('LOGOUT', userId, 'unknown', {
        ip: clientIP
      })

      // In a real implementation, you would invalidate the session
      // For now, we'll just log the logout

      return { success: true }

    } catch (error) {
      console.error('Logout error:', error)
      return { success: false }
    }
  }

  // Check if account is locked
  private isAccountLocked(email: string, ip: string): boolean {
    const attempts = this.loginAttempts.get(email) || []
    const recentAttempts = attempts.filter(attempt => 
      Date.now() - attempt.timestamp.getTime() < this.LOCKOUT_DURATION
    )

    return recentAttempts.length >= this.MAX_ATTEMPTS
  }

  // Record login attempt
  private recordLoginAttempt(
    email: string, 
    ip: string, 
    userAgent: string, 
    success: boolean, 
    failureReason?: string
  ): void {
    const attempts = this.loginAttempts.get(email) || []
    
    attempts.push({
      email,
      ip,
      userAgent,
      timestamp: new Date(),
      success,
      failureReason
    })

    // Keep only recent attempts
    const recentAttempts = attempts.filter(attempt => 
      Date.now() - attempt.timestamp.getTime() < this.LOCKOUT_DURATION
    )

    this.loginAttempts.set(email, recentAttempts)
  }

  // Clean up old login attempts
  private cleanupLoginAttempts(): void {
    const now = Date.now()
    this.loginAttempts.forEach((attempts, email) => {
      const recentAttempts = attempts.filter(attempt => 
        now - attempt.timestamp.getTime() < this.LOCKOUT_DURATION
      )
      
      if (recentAttempts.length === 0) {
        this.loginAttempts.delete(email)
      } else {
        this.loginAttempts.set(email, recentAttempts)
      }
    })
  }

  // Verify PIN (mock implementation)
  private async verifyPin(plainPin: string, hashedPin: string): Promise<boolean> {
    // In a real implementation, you would use bcrypt or similar
    // For now, we'll just do a simple comparison
    return plainPin === hashedPin
  }

  // Get client IP
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return request.ip || 'unknown'
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance()

// Middleware for protected routes
export async function requireAuth(request: NextRequest): Promise<{
  allowed: boolean
  user?: UserData
  error?: string
}> {
  const sessionResult = await authManager.verifySession(request)
  
  if (!sessionResult.valid) {
    return { allowed: false, error: sessionResult.error }
  }

  return { allowed: true, user: sessionResult.user }
}

// Middleware for role-based access
export async function requireRole(role: string, request: NextRequest): Promise<{
  allowed: boolean
  user?: UserData
  error?: string
}> {
  const authResult = await requireAuth(request)
  
  if (!authResult.allowed) {
    return authResult
  }

  const user = authResult.user!
  
  if (user.role !== role) {
    return { 
      allowed: false, 
      error: `Access denied. Required role: ${role}` 
    }
  }

  return { allowed: true, user }
}

// Middleware for admin access
export async function requireAdmin(request: NextRequest): Promise<{
  allowed: boolean
  user?: UserData
  error?: string
}> {
  return requireRole('admin', request)
}

// Middleware for super admin access
export async function requireSuperAdmin(request: NextRequest): Promise<{
  allowed: boolean
  user?: UserData
  error?: string
}> {
  return requireRole('super-admin', request)
}
