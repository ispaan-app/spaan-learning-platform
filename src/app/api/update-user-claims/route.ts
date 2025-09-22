import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { uid, role } = await request.json()
    
    if (!uid || !role) {
      return NextResponse.json({ 
        error: 'UID and role are required' 
      }, { status: 400 })
    }

    // Update custom claims
    await adminAuth.setCustomUserClaims(uid, { role })
    
    console.log(`✅ Updated custom claims for user ${uid} to role: ${role}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully updated custom claims for user ${uid}`,
      role 
    })
    
  } catch (error: any) {
    console.error('❌ Error updating custom claims:', error)
    return NextResponse.json({ 
      error: 'Failed to update custom claims: ' + error.message 
    }, { status: 500 })
  }
}


