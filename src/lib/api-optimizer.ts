import { NextRequest, NextResponse } from 'next/server'
import { createCache, cacheKeys, CacheInvalidator } from './cache'
import { withRateLimit, getClientIdentifier } from './rateLimiter'
import { withMonitoring } from './monitoring'
import { withErrorHandling } from './error-handler'
import { ValidationService } from './validation'

// API optimization configuration
interface APIOptimizationConfig {
  enableCaching: boolean
  enableRateLimiting: boolean
  enableMonitoring: boolean
  enableErrorHandling: boolean
  cacheTTL: number
  rateLimitType: 'general' | 'auth' | 'upload' | 'admin'
  validationSchema?: any
  transformResponse?: (data: any) => any
  transformError?: (error: any) => any
}

// Default configuration
const defaultConfig: APIOptimizationConfig = {
  enableCaching: true,
  enableRateLimiting: true,
  enableMonitoring: true,
  enableErrorHandling: true,
  cacheTTL: 300, // 5 minutes
  rateLimitType: 'general',
  transformResponse: (data) => data,
  transformError: (error) => error
}

// API optimization decorator
export function withAPIOptimization<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  config: Partial<APIOptimizationConfig> = {}
) {
  const finalConfig = { ...defaultConfig, ...config }
  
  let optimizedHandler = handler

  // Apply error handling
  if (finalConfig.enableErrorHandling) {
    optimizedHandler = withErrorHandling(optimizedHandler)
  }

  // Apply monitoring
  if (finalConfig.enableMonitoring) {
    optimizedHandler = withMonitoring(optimizedHandler)
  }

  // Apply rate limiting
  if (finalConfig.enableRateLimiting) {
    optimizedHandler = withRateLimit(
      finalConfig.rateLimitType,
      getClientIdentifier
    )(optimizedHandler)
  }

  // Apply caching
  if (finalConfig.enableCaching) {
    optimizedHandler = withCaching(optimizedHandler, finalConfig)
  }

  // Apply validation
  if (finalConfig.validationSchema) {
    optimizedHandler = withValidation(optimizedHandler, finalConfig.validationSchema)
  }

  return optimizedHandler
}

// Caching decorator
function withCaching<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  config: APIOptimizationConfig
) {
  return async function (request: NextRequest, ...args: T): Promise<NextResponse> {
    const cache = createCache()
    const cacheKey = generateCacheKey(request, args)

    // Try to get from cache
    const cachedResponse = await cache.get<{
      status: number
      headers: Record<string, string>
      body: string
    }>(cacheKey)

    if (cachedResponse) {
      return new NextResponse(cachedResponse.body, {
        status: cachedResponse.status,
        headers: cachedResponse.headers
      })
    }

    // Execute handler
    const response = await handler(request, ...args)
    
    // Only cache successful responses
    if (response.status >= 200 && response.status < 300) {
      const responseClone = response.clone()
      const body = await responseClone.text()
      
      await cache.set(cacheKey, {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body
      }, config.cacheTTL)
    }

    return response
  }
}

// Validation decorator
function withValidation<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  schema: any
) {
  return async function (request: NextRequest, ...args: T): Promise<NextResponse> {
    try {
      // Parse request body
      let body = null
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        try {
          body = await request.json()
        } catch {
          // Body might not be JSON
        }
      }

      // Validate request data
      const validation = ValidationService.validateAndSanitize(schema, {
        method: request.method,
        path: request.nextUrl.pathname,
        query: Object.fromEntries(request.nextUrl.searchParams),
        body,
        headers: Object.fromEntries(request.headers.entries())
      })

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validation.errors
          },
          { status: 400 }
        )
      }

      return await handler(request, ...args)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format'
        },
        { status: 400 }
      )
    }
  }
}

// Cache key generator
function generateCacheKey(request: NextRequest, args: any[]): string {
  const method = request.method
  const path = request.nextUrl.pathname
  const query = request.nextUrl.searchParams.toString()
  const argsHash = JSON.stringify(args)
  
  return `api:${method}:${path}:${query}:${Buffer.from(argsHash).toString('base64')}`
}

// API response helper
export function createAPIResponse<T>(
  data: T,
  options: {
    status?: number
    headers?: Record<string, string>
    cache?: boolean
    cacheTTL?: number
  } = {}
): NextResponse {
  const response = NextResponse.json({
    success: true,
    data,
    timestamp: Date.now()
  }, {
    status: options.status || 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': options.cache ? `public, max-age=${options.cacheTTL || 300}` : 'no-cache',
      ...options.headers
    }
  })

  return response
}

// API error response helper
export function createAPIErrorResponse(
  error: string,
  code: string,
  status: number = 500,
  details?: Record<string, any>
): NextResponse {
  return NextResponse.json({
    success: false,
    error,
    code,
    details,
    timestamp: Date.now()
  }, { status })
}

// Pagination helper
export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  options: {
    status?: number
    headers?: Record<string, string>
  } = {}
): NextResponse {
  const totalPages = Math.ceil(total / limit)
  
  return NextResponse.json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    timestamp: Date.now()
  }, {
    status: options.status || 200,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
}

// API middleware for common functionality
export function withAPIMiddleware<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  middleware: Array<(request: NextRequest, ...args: T) => Promise<NextResponse | null>>
) {
  return async function (request: NextRequest, ...args: T): Promise<NextResponse> {
    // Run middleware in sequence
    for (const middlewareFn of middleware) {
      const result = await middlewareFn(request, ...args)
      if (result) {
        return result // Middleware handled the request
      }
    }

    // All middleware passed, execute handler
    return await handler(request, ...args)
  }
}

// Common middleware functions
export const middleware = {
  // CORS middleware
  cors: (allowedOrigins: string[] = ['*']) => {
    return async (request: NextRequest): Promise<NextResponse | null> => {
      const origin = request.headers.get('origin')
      
      if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
        return null // Allow request
      }

      return NextResponse.json(
        { success: false, error: 'CORS policy violation' },
        { status: 403 }
      )
    }
  },

  // Authentication middleware
  auth: (requiredRoles: string[] = []) => {
    return async (request: NextRequest): Promise<NextResponse | null> => {
      const authHeader = request.headers.get('authorization')
      
      if (!authHeader) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }

      // In a real implementation, you would validate the JWT token
      // and check user roles
      
      return null // Allow request
    }
  },

  // Maintenance mode middleware
  maintenance: (isMaintenanceMode: boolean = false) => {
    return async (request: NextRequest): Promise<NextResponse | null> => {
      if (isMaintenanceMode) {
        return NextResponse.json(
          { success: false, error: 'Service is in maintenance mode' },
          { status: 503 }
        )
      }
      
      return null // Allow request
    }
  },

  // Request logging middleware
  logging: () => {
    return async (request: NextRequest): Promise<NextResponse | null> => {
      console.log(`[${request.method}] ${request.nextUrl.pathname} - ${new Date().toISOString()}`)
      return null // Allow request
    }
  }
}

// API versioning helper
export function withAPIVersioning<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  version: string = 'v1'
) {
  return async function (request: NextRequest, ...args: T): Promise<NextResponse> {
    const response = await handler(request, ...args)
    
    // Add version header
    response.headers.set('API-Version', version)
    
    return response
  }
}

// API documentation helper
export function createAPIDocumentation(
  endpoints: Array<{
    method: string
    path: string
    description: string
    parameters?: Array<{
      name: string
      type: string
      required: boolean
      description: string
    }>
    responses?: Array<{
      status: number
      description: string
      schema?: any
    }>
  }>
) {
  return {
    openapi: '3.0.0',
    info: {
      title: 'iSpaan API',
      version: '1.0.0',
      description: 'API documentation for iSpaan platform'
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    paths: endpoints.reduce((acc, endpoint) => {
      const path = endpoint.path.replace(/\[([^\]]+)\]/g, '{$1}')
      acc[path] = {
        [endpoint.method.toLowerCase()]: {
          summary: endpoint.description,
          parameters: endpoint.parameters?.map(param => ({
            name: param.name,
            in: 'path',
            required: param.required,
            schema: { type: param.type },
            description: param.description
          })),
          responses: endpoint.responses?.reduce((resAcc, response) => {
            resAcc[response.status] = {
              description: response.description,
              content: response.schema ? {
                'application/json': {
                  schema: response.schema
                }
              } : undefined
            }
            return resAcc
          }, {} as Record<number, any>)
        }
      }
      return acc
    }, {} as Record<string, any>)
  }
}

// Export utilities
export {
  createCache,
  cacheKeys,
  CacheInvalidator
} from './cache'

export {
  withRateLimit,
  getClientIdentifier
} from './rateLimiter'

export {
  withMonitoring
} from './monitoring'

export {
  withErrorHandling
} from './error-handler'

export {
  ValidationService
} from './validation'
