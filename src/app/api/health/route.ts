import { NextRequest, NextResponse } from 'next/server'
import { getHealthData } from '@/lib/monitoring'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Basic health check
    const healthData = getHealthData()
    
    // Test database connection
    let databaseStatus = 'healthy'
    try {
      await adminDb.collection('health').doc('test').get()
    } catch (error) {
      databaseStatus = 'unhealthy'
      console.error('Database health check failed:', error)
    }
    
    // Test Firebase connection
    let firebaseStatus = 'healthy'
    try {
      // Simple test to verify Firebase is accessible
      await adminDb.collection('users').limit(1).get()
    } catch (error) {
      firebaseStatus = 'unhealthy'
      console.error('Firebase health check failed:', error)
    }
    
    const responseTime = Date.now() - startTime
    
    const healthResponse = {
      ...healthData,
      status: databaseStatus === 'healthy' && firebaseStatus === 'healthy' ? 'healthy' : 'degraded',
      checks: {
        database: databaseStatus,
        firebase: firebaseStatus,
        api: 'healthy'
      },
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    }
    
    const statusCode = healthResponse.status === 'healthy' ? 200 : 503
    
    return NextResponse.json(healthResponse, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}