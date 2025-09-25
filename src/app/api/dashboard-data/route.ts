import { NextRequest } from 'next/server'
import { adminDb as db } from '@/lib/firebase-admin'
import ApiResponseBuilder from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching comprehensive dashboard data...')
    
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0]
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0]

    // Execute all queries in parallel for better performance
    const [
      pendingApplicantsSnapshot,
      totalLearnersSnapshot,
      activePlacementsSnapshot,
      assignedPlacementsSnapshot,
      attendanceSnapshot,
      sessionsSnapshot,
      presentTodaySnapshot,
      recentApplicantsSnapshot
    ] = await Promise.all([
      // Pending applicants
      db.collection('users')
        .where('role', '==', 'applicant')
        .where('status', '==', 'pending-review')
        .get(),
      
      // Total learners
      db.collection('users')
        .where('role', '==', 'learner')
        .get(),
      
      // Active placements
      db.collection('placements')
        .where('status', '==', 'active')
        .get(),
      
      // Assigned placements
      db.collection('placements')
        .where('assignedLearnerId', '!=', null)
        .get(),
      
      // Attendance records for this month
      db.collection('attendance')
        .where('date', '>=', startOfMonthStr)
        .where('date', '<=', todayStr)
        .get(),
      
      // Sessions this week
      db.collection('classSessions')
        .where('date', '>=', startOfWeekStr)
        .where('date', '<=', todayStr)
        .get(),
      
      // Present today
      db.collection('attendance')
        .where('date', '==', todayStr)
        .where('status', '==', 'present')
        .get(),
      
      // Recent applicants (last 5)
      db.collection('users')
        .where('role', '==', 'applicant')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()
    ])

    // Calculate attendance rate
    const totalLearners = totalLearnersSnapshot.size
    const totalAttendanceRecords = attendanceSnapshot.size
    const weeksInMonth = Math.ceil((today.getDate() + startOfMonth.getDay()) / 7)
    const expectedSessions = totalLearners * weeksInMonth * 5
    const attendanceRate = expectedSessions > 0 ? Math.round((totalAttendanceRecords / expectedSessions) * 100) : 0

    // Calculate absent today
    const presentToday = presentTodaySnapshot.size
    const absentToday = Math.max(0, totalLearners - presentToday)

    // Process recent applicants
    const recentApplicants = recentApplicantsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        program: data.program || 'Unknown',
        applicationDate: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        status: data.status || 'pending-review'
      }
    })

    const dashboardData = {
      stats: {
        pendingApplicants: pendingApplicantsSnapshot.size,
        totalLearners: totalLearners,
        activePlacements: activePlacementsSnapshot.size,
        assignedLearners: assignedPlacementsSnapshot.size,
        attendanceRate: attendanceRate,
        totalSessions: sessionsSnapshot.size,
        presentToday: presentToday,
        absentToday: absentToday
      },
      recentApplicants: recentApplicants,
      timestamp: new Date().toISOString(),
      performance: {
        queriesExecuted: 8,
        executionTime: Date.now()
      }
    }

    console.log('✅ Dashboard data fetched successfully:', {
      pendingApplicants: dashboardData.stats.pendingApplicants,
      totalLearners: dashboardData.stats.totalLearners,
      activePlacements: dashboardData.stats.activePlacements,
      attendanceRate: dashboardData.stats.attendanceRate
    })

    return ApiResponseBuilder.success(dashboardData, 'Dashboard data fetched successfully')

  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error)
    
    return ApiResponseBuilder.internalError(
      'Failed to fetch dashboard data',
      error as Error
    )
  }
}
