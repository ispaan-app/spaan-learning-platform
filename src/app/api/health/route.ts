import { NextRequest } from 'next/server'
import { HealthCheckService } from '@/lib/monitoring/health-checks'

export async function GET(request: NextRequest) {
  const healthCheck = HealthCheckService.getInstance()
  const result = await healthCheck.performHealthCheck()
  
  const statusCode = result.status === 'healthy' ? 200 : 
                    result.status === 'degraded' ? 200 : 503
  
  return Response.json(result, { status: statusCode })
}