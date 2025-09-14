import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { User } from 'firebase/auth'

interface SessionData {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
  refreshToken?: string
}

interface RefreshTokenData {
  userId: string
  tokenId: string
  iat: number
  exp: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-super-secret-refresh-key'
const SESSION_DURATION = 15 * 60 * 1000 // 15 minutes
const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export class SessionManager {
  private static instance: SessionManager

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  // Create session tokens
  createSession(user: User, userData: any): { accessToken: string; refreshToken: string } {
    const sessionData: SessionData = {
      userId: user.uid,
      email: user.email!,
      role: userData.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + SESSION_DURATION) / 1000)
    }

    const refreshTokenData: RefreshTokenData = {
      userId: user.uid,
      tokenId: this.generateTokenId(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + REFRESH_TOKEN_DURATION) / 1000)
    }

    const accessToken = jwt.sign(sessionData, JWT_SECRET, { algorithm: 'HS256' })
    const refreshToken = jwt.sign(refreshTokenData, REFRESH_TOKEN_SECRET, { algorithm: 'HS256' })

    return { accessToken, refreshToken }
  }

  // Verify access token
  verifyAccessToken(token: string): SessionData | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as SessionData
      return decoded
    } catch (error) {
      console.error('Access token verification failed:', error)
      return null
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): RefreshTokenData | null {
    try {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenData
      return decoded
    } catch (error) {
      console.error('Refresh token verification failed:', error)
      return null
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    const refreshData = this.verifyRefreshToken(refreshToken)
    if (!refreshData) {
      return null
    }

    // Check if refresh token is blacklisted
    if (await this.isTokenBlacklisted(refreshData.tokenId)) {
      return null
    }

    // Get fresh user data
    const userData = await this.getUserData(refreshData.userId)
    if (!userData) {
      return null
    }

    // Create new tokens
    const newTokens = this.createSession({ uid: refreshData.userId, email: userData.email } as User, userData)
    
    // Blacklist old refresh token
    await this.blacklistToken(refreshData.tokenId)

    return newTokens
  }

  // Blacklist token
  async blacklistToken(tokenId: string): Promise<void> {
    // In a real implementation, you would store this in Redis or database
    // For now, we'll use a simple in-memory store
    const blacklistedTokens = this.getBlacklistedTokens()
    blacklistedTokens.add(tokenId)
    this.setBlacklistedTokens(blacklistedTokens)
  }

  // Check if token is blacklisted
  async isTokenBlacklisted(tokenId: string): Promise<boolean> {
    const blacklistedTokens = this.getBlacklistedTokens()
    return blacklistedTokens.has(tokenId)
  }

  // Get user data (mock implementation)
  private async getUserData(userId: string): Promise<any> {
    // In a real implementation, you would fetch from database
    return {
      role: 'learner',
      email: 'user@example.com'
    }
  }

  // Generate unique token ID
  private generateTokenId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Get blacklisted tokens (mock implementation)
  private getBlacklistedTokens(): Set<string> {
    try {
      const stored = (globalThis as any).blacklistedTokens || '[]'
      return new Set(JSON.parse(stored))
    } catch {
      return new Set()
    }
  }

  // Set blacklisted tokens (mock implementation)
  private setBlacklistedTokens(tokens: Set<string>): void {
    (globalThis as any).blacklistedTokens = JSON.stringify(Array.from(tokens))
  }

  // Set session cookies
  setSessionCookies(response: NextResponse, accessToken: string, refreshToken: string): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/'
    }

    response.cookies.set('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: SESSION_DURATION / 1000
    })

    response.cookies.set('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_DURATION / 1000
    })
  }

  // Clear session cookies
  clearSessionCookies(response: NextResponse): void {
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')
  }

  // Get session from request
  async getSessionFromRequest(request: NextRequest): Promise<SessionData | null> {
    const accessToken = request.cookies.get('accessToken')?.value
    if (!accessToken) {
      return null
    }

    return this.verifyAccessToken(accessToken)
  }

  // Get session from cookies (server-side)
  async getSessionFromCookies(): Promise<SessionData | null> {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('accessToken')?.value
    if (!accessToken) {
      return null
    }

    return this.verifyAccessToken(accessToken)
  }
}

// Middleware for session validation
export async function validateSession(request: NextRequest): Promise<{ valid: boolean; session?: SessionData; error?: string }> {
  try {
    const sessionManager = SessionManager.getInstance()
    const session = await sessionManager.getSessionFromRequest(request)

    if (!session) {
      return { valid: false, error: 'No valid session found' }
    }

    // Check if session is expired
    if (session.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'Session expired' }
    }

    return { valid: true, session }
  } catch (error) {
    console.error('Session validation error:', error)
    return { valid: false, error: 'Session validation failed' }
  }
}

// Middleware for role-based access control
export async function requireRole(request: NextRequest, allowedRoles: string[]): Promise<{ allowed: boolean; session?: SessionData; error?: string }> {
  const sessionResult = await validateSession(request)
  
  if (!sessionResult.valid) {
    return { allowed: false, error: sessionResult.error }
  }

  const session = sessionResult.session!
  
  if (!allowedRoles.includes(session.role)) {
    return { 
      allowed: false, 
      error: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
    }
  }

  return { allowed: true, session }
}

// Utility functions
export function createSessionResponse(user: User, userData: any): NextResponse {
  const sessionManager = SessionManager.getInstance()
  const { accessToken, refreshToken } = sessionManager.createSession(user, userData)
  
  const response = NextResponse.json({ 
    success: true, 
    user: {
      uid: user.uid,
      email: user.email,
      role: userData.role
    }
  })
  
  sessionManager.setSessionCookies(response, accessToken, refreshToken)
  return response
}

export function createLogoutResponse(): NextResponse {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
  const sessionManager = SessionManager.getInstance()
  sessionManager.clearSessionCookies(response)
  return response
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance()
