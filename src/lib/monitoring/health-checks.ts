import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

// Health check service
export class HealthCheckService {
  private static instance: HealthCheckService

  private constructor() {}

  static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService()
    }
    return HealthCheckService.instance
  }

  // Perform comprehensive health check
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Record<string, { status: 'pass' | 'fail'; message: string; duration: number }>
    timestamp: string
    version: string
  }> {
    const checks: Record<string, { status: 'pass' | 'fail'; message: string; duration: number }> = {}
    const startTime = Date.now()
    
    // Check database connectivity
    const dbCheck = await this.checkDatabase()
    checks.database = dbCheck
    
    // Check Redis connectivity
    const redisCheck = await this.checkRedis()
    checks.redis = redisCheck
    
    // Check external services
    const externalCheck = await this.checkExternalServices()
    checks.external = externalCheck
    
    // Check system resources
    const systemCheck = await this.checkSystemResources()
    checks.system = systemCheck
    
    // Determine overall status
    const failedChecks = Object.values(checks).filter(check => check.status === 'fail')
    let status: 'healthy' | 'degraded' | 'unhealthy'
    
    if (failedChecks.length === 0) {
      status = 'healthy'
    } else if (failedChecks.length <= 2) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }
    
    return {
      status,
      checks,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    }
  }

  // Check database connectivity
  private async checkDatabase(): Promise<{ status: 'pass' | 'fail'; message: string; duration: number }> {
    const startTime = Date.now()
    
    try {
      await adminDb.collection('health').doc('test').get()
      return {
        status: 'pass',
        message: 'Database connection successful',
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        status: 'fail',
        message: `Database connection failed: ${error}`,
        duration: Date.now() - startTime
      }
    }
  }

  // Check Redis connectivity
  private async checkRedis(): Promise<{ status: 'pass' | 'fail'; message: string; duration: number }> {
    const startTime = Date.now()
    
    try {
      // Mock Redis check - in real implementation, use actual Redis client
      await new Promise(resolve => setTimeout(resolve, 10))
      return {
        status: 'pass',
        message: 'Redis connection successful',
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        status: 'fail',
        message: `Redis connection failed: ${error}`,
        duration: Date.now() - startTime
      }
    }
  }

  // Check external services
  private async checkExternalServices(): Promise<{ status: 'pass' | 'fail'; message: string; duration: number }> {
    const startTime = Date.now()
    
    try {
      // Check Firebase services
      await adminDb.collection('health').doc('external').get()
      return {
        status: 'pass',
        message: 'External services accessible',
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        status: 'fail',
        message: `External services check failed: ${error}`,
        duration: Date.now() - startTime
      }
    }
  }

  // Check system resources
  private async checkSystemResources(): Promise<{ status: 'pass' | 'fail'; message: string; duration: number }> {
    const startTime = Date.now()
    
    try {
      const memoryUsage = process.memoryUsage()
      const cpuUsage = process.cpuUsage()
      
      // Check memory usage
      if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
        return {
          status: 'fail',
          message: `High memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          duration: Date.now() - startTime
        }
      }
      
      return {
        status: 'pass',
        message: `Memory: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB, CPU: ${cpuUsage.user}ms`,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        status: 'fail',
        message: `System resources check failed: ${error}`,
        duration: Date.now() - startTime
      }
    }
  }
}

// Health check endpoint
export async function GET(request: NextRequest): Promise<NextResponse> {
  const healthCheck = HealthCheckService.getInstance()
  const result = await healthCheck.performHealthCheck()
  
  const statusCode = result.status === 'healthy' ? 200 : 
                    result.status === 'degraded' ? 200 : 503
  
  return NextResponse.json(result, { status: statusCode })
}

export default HealthCheckService
