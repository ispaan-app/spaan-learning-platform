import { NextRequest, NextResponse } from 'next/server'
import { adminDb as db } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching comprehensive super admin data...')
    
    // Execute all queries in parallel for better performance
    const [
      usersSnapshot,
      applicationsSnapshot,
      placementsSnapshot,
      auditLogsSnapshot,
      programsSnapshot
    ] = await Promise.all([
      // All users
      db.collection('users').get(),
      
      // All applications
      db.collection('applications').get(),
      
      // All placements
      db.collection('placements').get(),
      
      // Recent audit logs (last 10)
      db.collection('audit-logs')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get(),
      
      // All programs for name mapping
      db.collection('programs').get()
    ])

    // Process users data
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        role: data.role || 'unknown',
        program: data.program || '',
        province: data.province || '',
        ...data
      }
    })

    // Process applications data
    const applications = applicationsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        status: data.status || 'unknown',
        ...data
      }
    })

    // Process placements data
    const placements = placementsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        status: data.status || 'unknown',
        ...data
      }
    })

    // Process audit logs for recent activity
    const recentActivity = auditLogsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        action: data.action || '',
        adminName: data.adminName || '',
        timestamp: data.timestamp || '',
        ...data
      }
    })

    // Create program names mapping
    const programNamesMap: { [key: string]: string } = {}
    programsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      programNamesMap[doc.id] = data.name || doc.id
    })

    // Calculate global stats
    const totalUsers = users.length
    const totalAdmins = users.filter(u => u.role === 'admin' || u.role === 'super-admin').length
    const totalLearners = users.filter(u => u.role === 'learner').length
    const totalApplicants = users.filter(u => u.role === 'applicant').length
    const pendingApplications = applications.filter(a => a.status === 'pending').length
    const activePlacements = placements.filter(p => p.status === 'active').length

    // Calculate learner distribution by program
    const learnerDistribution = users
      .filter(u => u.role === 'learner' && u.program)
      .reduce((acc: Record<string, number>, learner) => {
        const program = learner.program
        acc[program] = (acc[program] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const learnerDistributionArray = Object.entries(learnerDistribution).map(([programId, count]) => ({
      program: programNamesMap[programId] || programId,
      count
    }))

    // Calculate learner distribution by province
    const learnerProvince = users
      .filter(u => u.role === 'learner' && u.province)
      .reduce((acc: Record<string, number>, learner) => {
        const province = learner.province
        acc[province] = (acc[province] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const learnerProvinceArray = Object.entries(learnerProvince).map(([province, count]) => ({
      province,
      count
    }))

    // Mock system metrics (in production, these would come from actual system monitoring)
    const systemMetrics = {
      cpuUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
      memoryUsage: Math.floor(Math.random() * 20) + 60, // 60-80%
      diskUsage: Math.floor(Math.random() * 15) + 20, // 20-35%
      networkLatency: Math.floor(Math.random() * 10) + 5 // 5-15ms
    }

    const superAdminData = {
      globalStats: {
        totalUsers,
        pendingApplications,
        activePlacements,
        totalAdmins,
        totalLearners,
        totalApplicants,
        systemHealth: 98,
        uptime: '99.9%'
      },
      learnerDistribution: learnerDistributionArray,
      learnerProvince: learnerProvinceArray,
      recentActivity,
      systemMetrics,
      timestamp: new Date().toISOString(),
      performance: {
        queriesExecuted: 5,
        executionTime: Date.now()
      }
    }

    console.log('✅ Super admin data fetched successfully:', {
      totalUsers: superAdminData.globalStats.totalUsers,
      totalLearners: superAdminData.globalStats.totalLearners,
      totalAdmins: superAdminData.globalStats.totalAdmins,
      pendingApplications: superAdminData.globalStats.pendingApplications
    })

    return NextResponse.json({
      success: true,
      data: superAdminData
    })

  } catch (error) {
    console.error('❌ Error fetching super admin data:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        globalStats: {
          totalUsers: 0,
          pendingApplications: 0,
          activePlacements: 0,
          totalAdmins: 0,
          totalLearners: 0,
          totalApplicants: 0,
          systemHealth: 98,
          uptime: '99.9%'
        },
        learnerDistribution: [],
        learnerProvince: [],
        recentActivity: [],
        systemMetrics: {
          cpuUsage: 45,
          memoryUsage: 67,
          diskUsage: 23,
          networkLatency: 12
        },
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
