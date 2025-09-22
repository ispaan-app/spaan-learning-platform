import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Admin Dashboard API Diagnostic...')
    
    // Test Firebase connection
    const testQuery = query(collection(db, 'users'), limit(1))
    const testSnapshot = await getDocs(testQuery)
    console.log('✅ Firebase connection successful')
    
    // Test specific queries used in admin dashboard
    const queries = [
      {
        name: 'Pending Applicants',
        query: query(collection(db, 'users'), where('role', '==', 'applicant'), where('status', '==', 'pending-review'))
      },
      {
        name: 'Total Learners',
        query: query(collection(db, 'users'), where('role', '==', 'learner'))
      },
      {
        name: 'Active Placements',
        query: query(collection(db, 'placements'), where('status', '==', 'active'))
      },
      {
        name: 'Assigned Placements',
        query: query(collection(db, 'placements'), where('assignedLearnerId', '!=', null))
      }
    ]
    
    const results: { [key: string]: { success: boolean; count: number; error: string | null } } = {}
    
    for (const { name, query: q } of queries) {
      try {
        const snapshot = await getDocs(q)
        results[name] = {
          success: true,
          count: snapshot.size,
          error: null
        }
        console.log(`✅ ${name}: ${snapshot.size} documents`)
      } catch (error) {
        results[name] = {
          success: false,
          count: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
        console.error(`❌ ${name}:`, error)
      }
    }
    
    console.log('✅ Diagnostic complete: success')
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      firebase: {
        connected: true,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ispaan-app'
      },
      queries: results,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      }
    })
    
  } catch (error) {
    console.error('❌ Admin Dashboard API Diagnostic failed:', error)
    
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      firebase: {
        connected: false,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ispaan-app'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      }
    }, { status: 500 })
  }
}