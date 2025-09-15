import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, userEmail, userName, userRole } = body

    if (action === 'create-test-session') {
      // Create a test session for demonstration
      const testSession = {
        userId: userId || 'test-user',
        userEmail: userEmail || 'test@example.com',
        userName: userName || 'Test User',
        userRole: userRole || 'learner',
        deviceType: 'desktop',
        browser: 'Chrome 120.0',
        operatingSystem: 'Windows 11',
        ipAddress: '192.168.1.100',
        location: 'Johannesburg, South Africa',
        sessionToken: Math.random().toString(36).substring(2, 15),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        isActive: true,
        sessionStart: serverTimestamp(),
        lastActivity: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'active-sessions'), testSession)
      
      return NextResponse.json({
        success: true,
        sessionId: docRef.id,
        message: 'Test session created successfully'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process session request'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Session API is running',
      endpoints: {
        'POST /api/sessions': 'Create test sessions',
        'GET /api/sessions': 'Get API status'
      }
    })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 })
  }
}
