import { NextRequest, NextResponse } from 'next/server'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Verify this is the super admin email
    if (email !== 'sifiso@thegaselagroup.co.za') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }
    
    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Create custom token with super admin role
    const customToken = await user.getIdToken(true)
    
    return NextResponse.json({
      success: true,
      customToken,
      user: {
        uid: user.uid,
        email: user.email,
        role: 'super-admin'
      }
    })
    
  } catch (error: any) {
    console.error('Super admin auth error:', error)
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    )
  }
}












