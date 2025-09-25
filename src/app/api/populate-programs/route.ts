import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

// No sample programs - use real data from database

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Programs population endpoint called...')
    
    // Check if programs already exist
    const programsSnapshot = await adminDb.collection('programs').limit(1).get()
    
    if (programsSnapshot.empty) {
      console.log('📝 No programs found in database')
      return NextResponse.json({ 
        success: true, 
        message: 'No programs found. Please add programs through the Programs Management interface.',
        count: 0
      })
    } else {
      console.log('✅ Programs already exist in database')
      return NextResponse.json({ 
        success: true, 
        message: 'Programs already exist in database. Use the Programs Management interface to manage them.',
        count: programsSnapshot.size
      })
    }
  } catch (error: any) {
    console.error('❌ Error checking programs:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to check programs' 
    }, { status: 500 })
  }
}






























