import { NextRequest, NextResponse } from 'next/server'
import { UserDataManager } from '@/lib/user-data-manager'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 })
    }

    // Validate user data consistency
    const validation = await UserDataManager.validateUserConsistency(userId)
    
    return NextResponse.json({ 
      success: true, 
      validation 
    })
    
  } catch (error: any) {
    console.error('❌ Error validating user data:', error)
    return NextResponse.json({ 
      error: 'Failed to validate user data: ' + error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 })
    }

    // Get complete user profile
    const profile = await UserDataManager.getCompleteUserProfile(userId)
    
    if (!profile) {
      return NextResponse.json({ 
        error: 'User profile not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      profile 
    })
    
  } catch (error: any) {
    console.error('❌ Error getting user profile:', error)
    return NextResponse.json({ 
      error: 'Failed to get user profile: ' + error.message 
    }, { status: 500 })
  }
}









