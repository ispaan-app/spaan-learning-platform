import { NextRequest, NextResponse } from 'next/server'
import { adminDb as db } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching attendance statistics...')

    // Get current date for today's calculations
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    // Get start of current month for monthly calculations
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0]
    
    // Get start of current week for weekly calculations
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0]

    const results: { [key: string]: { success: boolean; count: number; error: string | null } } = {}

    // 1. Get total attendance records for this month
    try {
      const attendanceQuery = db.collection('attendance')
        .where('date', '>=', startOfMonthStr)
        .where('date', '<=', todayStr)
      
      const attendanceSnapshot = await attendanceQuery.get()
      const totalRecords = attendanceSnapshot.size
      
      // Calculate attendance rate (assuming each record represents a session attended)
      const learnersQuery = db.collection('users').where('role', '==', 'learner')
      const learnersSnapshot = await learnersQuery.get()
      const totalLearners = learnersSnapshot.size
      
      // Calculate expected sessions (assuming 5 sessions per week per learner)
      const weeksInMonth = Math.ceil((today.getDate() + startOfMonth.getDay()) / 7)
      const expectedSessions = totalLearners * weeksInMonth * 5
      const attendanceRate = expectedSessions > 0 ? Math.round((totalRecords / expectedSessions) * 100) : 0
      
      results['Attendance Rate'] = {
        success: true,
        count: attendanceRate,
        error: null
      }
      
      console.log(`✅ Attendance Rate: ${attendanceRate}%`)
    } catch (error) {
      console.error('❌ Error fetching attendance rate:', error)
      results['Attendance Rate'] = {
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 2. Get total sessions this week
    try {
      const sessionsQuery = db.collection('classSessions')
        .where('date', '>=', startOfWeekStr)
        .where('date', '<=', todayStr)
      
      const sessionsSnapshot = await sessionsQuery.get()
      const totalSessions = sessionsSnapshot.size
      
      results['Total Sessions'] = {
        success: true,
        count: totalSessions,
        error: null
      }
      
      console.log(`✅ Total Sessions: ${totalSessions}`)
    } catch (error) {
      console.error('❌ Error fetching total sessions:', error)
      results['Total Sessions'] = {
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 3. Get present today (attendance records for today)
    try {
      const presentQuery = db.collection('attendance')
        .where('date', '==', todayStr)
        .where('status', '==', 'present')
      
      const presentSnapshot = await presentQuery.get()
      const presentToday = presentSnapshot.size
      
      results['Present Today'] = {
        success: true,
        count: presentToday,
        error: null
      }
      
      console.log(`✅ Present Today: ${presentToday}`)
    } catch (error) {
      console.error('❌ Error fetching present today:', error)
      results['Present Today'] = {
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // 4. Get absent today (calculate from total learners - present today)
    try {
      const learnersQuery = db.collection('users').where('role', '==', 'learner')
      const learnersSnapshot = await learnersQuery.get()
      const totalLearners = learnersSnapshot.size
      
      const presentQuery = db.collection('attendance')
        .where('date', '==', todayStr)
        .where('status', '==', 'present')
      
      const presentSnapshot = await presentQuery.get()
      const presentToday = presentSnapshot.size
      
      const absentToday = Math.max(0, totalLearners - presentToday)
      
      results['Absent Today'] = {
        success: true,
        count: absentToday,
        error: null
      }
      
      console.log(`✅ Absent Today: ${absentToday}`)
    } catch (error) {
      console.error('❌ Error fetching absent today:', error)
      results['Absent Today'] = {
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    console.log('✅ Attendance statistics fetch complete:', results)

    return NextResponse.json({
      success: true,
      queries: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error in attendance stats API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        queries: {}
      },
      { status: 500 }
    )
  }
}
