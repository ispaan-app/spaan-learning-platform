import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// API optimization utilities
interface PaginationParams {
  page: number
  limit: number
  offset: number
}

interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

interface FilterParams {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith'
  value: any
}

interface QueryParams {
  pagination?: PaginationParams
  sort?: SortParams[]
  filters?: FilterParams[]
  search?: string
  fields?: string[]
}

// Pagination schema
const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).optional()
})

// Sort schema
const sortSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(['asc', 'desc']).default('desc')
})

// Filter schema
const filterSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'startsWith', 'endsWith']),
  value: z.any()
})

// Query parameters schema
const queryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.string().optional(),
  filter: z.string().optional(),
  search: z.string().optional(),
  fields: z.string().optional()
})

// Parse query parameters from request
export function parseQueryParams(request: NextRequest): QueryParams {
  const { searchParams } = new URL(request.url)
  
  const rawParams = {
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    sort: searchParams.get('sort'),
    filter: searchParams.get('filter'),
    search: searchParams.get('search'),
    fields: searchParams.get('fields')
  }

  const validated = queryParamsSchema.parse(rawParams)
  
  const result: QueryParams = {
    pagination: {
      page: validated.page,
      limit: validated.limit,
      offset: (validated.page - 1) * validated.limit
    }
  }

  // Parse sort parameters
  if (validated.sort) {
    result.sort = validated.sort.split(',').map(sortStr => {
      const [field, direction] = sortStr.split(':')
      return {
        field: field.trim(),
        direction: (direction?.trim() as 'asc' | 'desc') || 'desc'
      }
    })
  }

  // Parse filter parameters
  if (validated.filter) {
    try {
      result.filters = JSON.parse(validated.filter)
    } catch {
      // Handle simple filter format: field:operator:value
      result.filters = validated.filter.split(',').map(filterStr => {
        const [field, operator, value] = filterStr.split(':')
        return {
          field: field.trim(),
          operator: operator.trim() as any,
          value: value?.trim()
        }
      })
    }
  }

  // Parse search
  if (validated.search) {
    result.search = validated.search.trim()
  }

  // Parse fields
  if (validated.fields) {
    result.fields = validated.fields.split(',').map(field => field.trim())
  }

  return result
}

// Create paginated response
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationParams,
  total: number,
  metadata: Record<string, any> = {}
): {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  metadata: Record<string, any>
} {
  const totalPages = Math.ceil(total / pagination.limit)
  
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    },
    metadata
  }
}

// Response compression
export function compressResponse(data: any): NextResponse {
  const response = NextResponse.json(data)
  
  // Add compression headers
  response.headers.set('Content-Encoding', 'gzip')
  response.headers.set('Vary', 'Accept-Encoding')
  
  return response
}

// API response wrapper
export function createApiResponse<T>(
  data: T,
  status: number = 200,
  message?: string,
  metadata?: Record<string, any>
): NextResponse {
  const response = {
    success: status >= 200 && status < 300,
    data,
    message,
    metadata,
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(response, { status })
}

// Error response wrapper
export function createErrorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: any
): NextResponse {
  const response = {
    success: false,
    error: {
      message,
      code,
      details,
      timestamp: new Date().toISOString()
    }
  }

  return NextResponse.json(response, { status })
}

// API rate limiting
export class ApiRateLimiter {
  private static instance: ApiRateLimiter
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private readonly DEFAULT_LIMIT = 100
  private readonly DEFAULT_WINDOW = 15 * 60 * 1000 // 15 minutes

  static getInstance(): ApiRateLimiter {
    if (!ApiRateLimiter.instance) {
      ApiRateLimiter.instance = new ApiRateLimiter()
    }
    return ApiRateLimiter.instance
  }

  async checkLimit(
    identifier: string,
    limit: number = this.DEFAULT_LIMIT,
    window: number = this.DEFAULT_WINDOW
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now()
    const key = identifier
    const record = this.requests.get(key)

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.requests.set(key, {
        count: 1,
        resetTime: now + window
      })
      
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + window
      }
    }

    if (record.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      }
    }

    // Increment count
    record.count++
    this.requests.set(key, record)

    return {
      allowed: true,
      remaining: limit - record.count,
      resetTime: record.resetTime
    }
  }

  // Clean up expired records
  cleanup(): void {
    const now = Date.now()
    this.requests.forEach((record, key) => {
      if (now > record.resetTime) {
        this.requests.delete(key)
      }
    })
  }
}

// Query optimization
export class QueryOptimizer {
  private static instance: QueryOptimizer
  private queryCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer()
    }
    return QueryOptimizer.instance
  }

  // Optimize database query based on parameters
  optimizeQuery(
    collection: string,
    params: QueryParams
  ): {
    query: any
    cacheKey: string
    shouldCache: boolean
  } {
    const cacheKey = this.generateCacheKey(collection, params)
    
    // Check cache first
    const cached = this.queryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return {
        query: null, // Use cached data
        cacheKey,
        shouldCache: false
      }
    }

    // Build optimized query
    let query: any = { collection, filters: [], sort: [], limit: 20, offset: 0 }

    // Apply filters
    if (params.filters) {
      query.filters = params.filters.map(filter => ({
        field: filter.field,
        operator: this.mapOperator(filter.operator),
        value: filter.value
      }))
    }

    // Apply sorting
    if (params.sort) {
      query.sort = params.sort.map(sort => ({
        field: sort.field,
        direction: sort.direction
      }))
    }

    // Apply pagination
    if (params.pagination) {
      query.limit = params.pagination.limit
      query.offset = params.pagination.offset
    }

    return {
      query,
      cacheKey,
      shouldCache: true
    }
  }

  // Cache query result
  cacheResult(cacheKey: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.queryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // Get cached result
  getCachedResult(cacheKey: string): any | null {
    const cached = this.queryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    return null
  }

  private mapOperator(operator: string): string {
    const operatorMap: Record<string, string> = {
      'eq': '==',
      'ne': '!=',
      'gt': '>',
      'gte': '>=',
      'lt': '<',
      'lte': '<=',
      'in': 'in',
      'nin': 'not-in',
      'contains': 'array-contains',
      'startsWith': '>=',
      'endsWith': '<='
    }
    
    return operatorMap[operator] || '=='
  }

  private generateCacheKey(collection: string, params: QueryParams): string {
    return `${collection}_${JSON.stringify(params)}`
  }

  // Clear cache
  clearCache(pattern?: string): void {
    if (pattern) {
      this.queryCache.forEach((value, key) => {
        if (key.includes(pattern)) {
          this.queryCache.delete(key)
        }
      })
    } else {
      this.queryCache.clear()
    }
  }
}

// API middleware
export function withApiOptimization(
  handler: (request: NextRequest, params: QueryParams) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Parse query parameters
      const params = parseQueryParams(request)
      
      // Check rate limit
      const rateLimiter = ApiRateLimiter.getInstance()
      const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
      const rateLimit = await rateLimiter.checkLimit(clientIP)
      
      if (!rateLimit.allowed) {
        return createErrorResponse(
          'Rate limit exceeded',
          429,
          'RATE_LIMIT_EXCEEDED',
          { retryAfter: rateLimit.resetTime }
        )
      }

      // Add rate limit headers
      const response = await handler(request, params)
      response.headers.set('X-RateLimit-Limit', '100')
      response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString())
      
      return response
    } catch (error) {
      console.error('API optimization error:', error)
      return createErrorResponse(
        'Internal server error',
        500,
        'INTERNAL_ERROR',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )
    }
  }
}

// Export singletons
export const apiRateLimiter = ApiRateLimiter.getInstance()
export const queryOptimizer = QueryOptimizer.getInstance()

// Utility functions
export function getClientIP(request: NextRequest): string {
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

export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

export function addCacheHeaders(
  response: NextResponse,
  maxAge: number = 300,
  staleWhileRevalidate: number = 60
): NextResponse {
  response.headers.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`)
  response.headers.set('ETag', `"${Date.now()}"`)
  
  return response
}
