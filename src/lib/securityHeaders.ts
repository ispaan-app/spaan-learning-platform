import { NextResponse } from 'next/server'

interface SecurityHeadersConfig {
  csp: {
    defaultSrc: string[]
    scriptSrc: string[]
    styleSrc: string[]
    imgSrc: string[]
    connectSrc: string[]
    fontSrc: string[]
    objectSrc: string[]
    mediaSrc: string[]
    frameSrc: string[]
    workerSrc: string[]
    manifestSrc: string[]
    formAction: string[]
    baseUri: string[]
    upgradeInsecureRequests: boolean
  }
  hsts: {
    maxAge: number
    includeSubDomains: boolean
    preload: boolean
  }
  permissionsPolicy: Record<string, string[]>
  referrerPolicy: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url'
}

const DEFAULT_CONFIG: SecurityHeadersConfig = {
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'", // Required for Next.js
      'https://www.gstatic.com',
      'https://www.google.com',
      'https://apis.google.com'
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com'
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https:',
      'blob:'
    ],
    connectSrc: [
      "'self'",
      'https://*.googleapis.com',
      'https://*.firebase.com',
      'https://*.firebaseapp.com',
      'wss://*.firebase.com'
    ],
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com'
    ],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: [
      "'self'",
      'https://www.google.com'
    ],
    workerSrc: ["'self'"],
    manifestSrc: ["'self'"],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    upgradeInsecureRequests: true
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: [],
    usb: [],
    magnetometer: [],
    gyroscope: [],
    accelerometer: [],
    ambientLightSensor: [],
    autoplay: [],
    battery: [],
    displayCapture: [],
    documentDomain: [],
    encryptedMedia: [],
    executionWhileNotRendered: [],
    executionWhileOutOfViewport: [],
    fullscreen: [],
    layoutAnimations: [],
    legacyImageFormats: [],
    midi: [],
    oversizedImages: [],
    pictureInPicture: [],
    publickeyCredentialsGet: [],
    syncXhr: [],
    unoptimizedImages: [],
    unsizedMedia: [],
    verticalScroll: [],
    webShare: [],
    xrSpatialTracking: []
  },
  referrerPolicy: 'strict-origin-when-cross-origin'
}

export class SecurityHeadersManager {
  private static instance: SecurityHeadersManager
  private config: SecurityHeadersConfig

  private constructor(config: Partial<SecurityHeadersConfig> = {}) {
    this.config = this.mergeConfig(DEFAULT_CONFIG, config)
  }

  static getInstance(config?: Partial<SecurityHeadersConfig>): SecurityHeadersManager {
    if (!SecurityHeadersManager.instance) {
      SecurityHeadersManager.instance = new SecurityHeadersManager(config)
    }
    return SecurityHeadersManager.instance
  }

  private mergeConfig(defaultConfig: SecurityHeadersConfig, userConfig: Partial<SecurityHeadersConfig>): SecurityHeadersConfig {
    return {
      csp: { ...defaultConfig.csp, ...userConfig.csp },
      hsts: { ...defaultConfig.hsts, ...userConfig.hsts },
      permissionsPolicy: { ...defaultConfig.permissionsPolicy, ...userConfig.permissionsPolicy },
      referrerPolicy: userConfig.referrerPolicy || defaultConfig.referrerPolicy
    }
  }

  // Apply security headers to response
  applyHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    const csp = this.buildCSP()
    response.headers.set('Content-Security-Policy', csp)

    // HTTP Strict Transport Security
    if (process.env.NODE_ENV === 'production') {
      const hsts = this.buildHSTS()
      response.headers.set('Strict-Transport-Security', hsts)
    }

    // X-Content-Type-Options
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // X-Frame-Options
    response.headers.set('X-Frame-Options', 'DENY')

    // X-XSS-Protection
    response.headers.set('X-XSS-Protection', '1; mode=block')

    // Referrer Policy
    response.headers.set('Referrer-Policy', this.config.referrerPolicy)

    // Permissions Policy
    const permissionsPolicy = this.buildPermissionsPolicy()
    response.headers.set('Permissions-Policy', permissionsPolicy)

    // Cross-Origin Policies
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

    // Additional security headers
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    response.headers.set('X-Download-Options', 'noopen')
    response.headers.set('X-DNS-Prefetch-Control', 'off')

    return response
  }

  private buildCSP(): string {
    const { csp } = this.config
    const directives: string[] = []

    // Default source
    if (csp.defaultSrc.length > 0) {
      directives.push(`default-src ${csp.defaultSrc.join(' ')}`)
    }

    // Script sources
    if (csp.scriptSrc.length > 0) {
      directives.push(`script-src ${csp.scriptSrc.join(' ')}`)
    }

    // Style sources
    if (csp.styleSrc.length > 0) {
      directives.push(`style-src ${csp.styleSrc.join(' ')}`)
    }

    // Image sources
    if (csp.imgSrc.length > 0) {
      directives.push(`img-src ${csp.imgSrc.join(' ')}`)
    }

    // Connect sources
    if (csp.connectSrc.length > 0) {
      directives.push(`connect-src ${csp.connectSrc.join(' ')}`)
    }

    // Font sources
    if (csp.fontSrc.length > 0) {
      directives.push(`font-src ${csp.fontSrc.join(' ')}`)
    }

    // Object sources
    if (csp.objectSrc.length > 0) {
      directives.push(`object-src ${csp.objectSrc.join(' ')}`)
    }

    // Media sources
    if (csp.mediaSrc.length > 0) {
      directives.push(`media-src ${csp.mediaSrc.join(' ')}`)
    }

    // Frame sources
    if (csp.frameSrc.length > 0) {
      directives.push(`frame-src ${csp.frameSrc.join(' ')}`)
    }

    // Worker sources
    if (csp.workerSrc.length > 0) {
      directives.push(`worker-src ${csp.workerSrc.join(' ')}`)
    }

    // Manifest sources
    if (csp.manifestSrc.length > 0) {
      directives.push(`manifest-src ${csp.manifestSrc.join(' ')}`)
    }

    // Form action
    if (csp.formAction.length > 0) {
      directives.push(`form-action ${csp.formAction.join(' ')}`)
    }

    // Base URI
    if (csp.baseUri.length > 0) {
      directives.push(`base-uri ${csp.baseUri.join(' ')}`)
    }

    // Upgrade insecure requests
    if (csp.upgradeInsecureRequests) {
      directives.push('upgrade-insecure-requests')
    }

    return directives.join('; ')
  }

  private buildHSTS(): string {
    const { hsts } = this.config
    let hstsHeader = `max-age=${hsts.maxAge}`

    if (hsts.includeSubDomains) {
      hstsHeader += '; includeSubDomains'
    }

    if (hsts.preload) {
      hstsHeader += '; preload'
    }

    return hstsHeader
  }

  private buildPermissionsPolicy(): string {
    const { permissionsPolicy } = this.config
    const policies: string[] = []

    Object.entries(permissionsPolicy).forEach(([feature, allowlist]) => {
      if (allowlist.length === 0) {
        policies.push(`${feature}=()`)
      } else {
        policies.push(`${feature}=(${allowlist.join(' ')})`)
      }
    })

    return policies.join(', ')
  }

  // Update configuration
  updateConfig(newConfig: Partial<SecurityHeadersConfig>): void {
    this.config = this.mergeConfig(this.config, newConfig)
  }

  // Get current configuration
  getConfig(): SecurityHeadersConfig {
    return { ...this.config }
  }
}

// Export singleton instance
export const securityHeaders = SecurityHeadersManager.getInstance()

// Convenience function
export function applySecurityHeaders(response: NextResponse): NextResponse {
  return securityHeaders.applyHeaders(response)
}

// CSRF protection
export class CSRFProtection {
  private static instance: CSRFProtection
  private secret: string

  private constructor() {
    this.secret = process.env.CSRF_SECRET || 'your-csrf-secret-key'
  }

  static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection()
    }
    return CSRFProtection.instance
  }

  async generateToken(sessionId: string): Promise<string> {
    const crypto = await import('crypto')
    const hash = crypto.createHmac('sha256', this.secret)
      .update(sessionId)
      .digest('hex')
    return hash
  }

  async validateToken(sessionId: string, token: string): Promise<boolean> {
    const expectedToken = await this.generateToken(sessionId)
    const crypto = await import('crypto')
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expectedToken, 'hex')
    )
  }
}

// Export CSRF instance
export const csrfProtection = CSRFProtection.getInstance()

// Security utilities
export async function generateNonce(): Promise<string> {
  const crypto = await import('crypto')
  return crypto.randomBytes(16).toString('base64')
}

export async function generateSecureRandom(length: number = 32): Promise<string> {
  const crypto = await import('crypto')
  return crypto.randomBytes(length).toString('hex')
}

export async function hashPassword(password: string): Promise<string> {
  const crypto = await import('crypto')
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const crypto = await import('crypto')
  const [salt, hash] = hashedPassword.split(':')
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'))
}

// Security middleware
export function securityMiddleware(response: NextResponse): NextResponse {
  return applySecurityHeaders(response)
}
