import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'

export async function GET() {
  try {
    console.log('🔍 Admin Dashboard API Diagnostic...')
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
      overallStatus: 'unknown'
    }

    // Test 1: Basic Firestore connection
    try {
      const testSnapshot = await getDocs(collection(db, 'users'))
      results.tests.push({
        name: 'Basic Firestore Connection',
        status: 'success',
        message: `Connected to Firestore. Found ${testSnapshot.size} users.`
      })
    } catch (error: any) {
      results.tests.push({
        name: 'Basic Firestore Connection',
        status: 'error',
        message: error.message
      })
    }

    // Test 2: Users collection access
    try {
      const usersSnapshot = await getDocs(query(
        collection(db, 'users'),
        where('role', '==', 'learner'),
        limit(5)
      ))
      results.tests.push({
        name: 'Users Collection (role=learner)',
        status: 'success',
        message: `Found ${usersSnapshot.size} learners`
      })
    } catch (error: any) {
      results.tests.push({
        name: 'Users Collection (role=learner)',
        status: 'error',
        message: error.message
      })
    }

    // Test 3: Applications collection access
    try {
      const appsSnapshot = await getDocs(query(
        collection(db, 'applications'),
        where('status', '==', 'pending-review'),
        limit(5)
      ))
      results.tests.push({
        name: 'Applications Collection (pending-review)',
        status: 'success',
        message: `Found ${appsSnapshot.size} pending applications`
      })
    } catch (error: any) {
      results.tests.push({
        name: 'Applications Collection (pending-review)',
        status: 'error',
        message: error.message
      })
    }

    // Test 4: Placements collection access
    try {
      const placementsSnapshot = await getDocs(query(
        collection(db, 'placements'),
        where('status', '==', 'active'),
        limit(5)
      ))
      results.tests.push({
        name: 'Placements Collection (active)',
        status: 'success',
        message: `Found ${placementsSnapshot.size} active placements`
      })
    } catch (error: any) {
      results.tests.push({
        name: 'Placements Collection (active)',
        status: 'error',
        message: error.message
      })
    }

    // Test 5: Settings collection access
    try {
      const settingsSnapshot = await getDocs(collection(db, 'settings'))
      results.tests.push({
        name: 'Settings Collection',
        status: 'success',
        message: `Found ${settingsSnapshot.size} settings documents`
      })
    } catch (error: any) {
      results.tests.push({
        name: 'Settings Collection',
        status: 'error',
        message: error.message
      })
    }

    // Determine overall status
    const errorCount = results.tests.filter(test => test.status === 'error').length
    if (errorCount === 0) {
      results.overallStatus = 'success'
    } else if (errorCount < results.tests.length) {
      results.overallStatus = 'partial'
    } else {
      results.overallStatus = 'error'
    }

    console.log('✅ Diagnostic complete:', results.overallStatus)

    return NextResponse.json({
      success: true,
      diagnostic: results
    })

  } catch (error) {
    console.error('❌ Diagnostic failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Diagnostic failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}








