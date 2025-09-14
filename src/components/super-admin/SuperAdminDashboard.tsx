'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { FirestoreErrorHandler } from '@/components/ui/dashboard-error-handler'
import { GlobalStats } from '@/components/super-admin/GlobalStats'
import { LearnerDistributionChart } from '@/components/super-admin/LearnerDistributionChart'
import { LearnerProvinceChart } from '@/components/super-admin/LearnerProvinceChart'
import { RecentActivity } from '@/components/super-admin/RecentActivity'
import { AiReportGenerator } from '@/components/super-admin/AiReportGenerator'
import { SuperAdminWelcome } from '@/components/super-admin/SuperAdminWelcome'
import { 
  Users, 
  Shield, 
  Building2, 
  FileText,
  Bell,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Crown,
  UserPlus,
  GraduationCap,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'
import { toast } from '@/lib/toast'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'applicant' | 'learner' | 'admin' | 'super-admin'
  status: string
  program?: string
  province?: string
  createdAt: string
  updatedAt: string
}

interface Placement {
  id: string
  companyName: string
  status: 'active' | 'inactive' | 'full' | 'suspended'
  assignedLearnerId?: string
  createdAt: string
  updatedAt: string
}

interface AuditLog {
  id: string
  adminName: string
  action: string
  target: string
  timestamp: string
  details?: string
  adminRole: string
}

interface GlobalStatsData {
  totalUsers: number
  totalAdmins: number
  activePlacements: number
  pendingApplications: number
}

interface LearnerDistributionData {
  program: string
  count: number
}

interface LearnerProvinceData {
  province: string
  count: number
}

interface DashboardData {
  globalStats: GlobalStatsData
  learners: User[]
  learnerDistribution: LearnerDistributionData[]
  learnerProvince: LearnerProvinceData[]
  recentActivity: AuditLog[]
}

export function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    globalStats: {
      totalUsers: 0,
      totalAdmins: 0,
      activePlacements: 0,
      pendingApplications: 0
    },
    learners: [],
    learnerDistribution: [],
    learnerProvince: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      // Parallel queries for optimal performance
      const [
        usersSnapshot,
        placementsSnapshot,
        applicantsSnapshot,
        learnersSnapshot,
        activitySnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'placements')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'applicant'))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'learner'))),
        getDocs(query(
          collection(db, 'audit-logs'),
          orderBy('timestamp', 'desc'),
          limit(5)
        ))
      ])

      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[]

      const placements = placementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Placement[]

      const learners = learnersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[]

      const recentActivity = activitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[]

      // Calculate global stats
      const globalStats: GlobalStatsData = {
        totalUsers: users.length,
        totalAdmins: users.filter(user => user.role === 'admin' || user.role === 'super-admin').length,
        activePlacements: placements.filter(placement => placement.status === 'active').length,
        pendingApplications: applicantsSnapshot.size
      }

      // Calculate learner distribution by program
      const programCounts: { [key: string]: number } = {}
      learners.forEach(learner => {
        if (learner.program) {
          programCounts[learner.program] = (programCounts[learner.program] || 0) + 1
        }
      })

      const learnerDistribution: LearnerDistributionData[] = Object.entries(programCounts)
        .map(([program, count]) => ({
          program: program.charAt(0).toUpperCase() + program.slice(1).replace('-', ' '),
          count
        }))
        .sort((a, b) => b.count - a.count)

      // Calculate learner distribution by province
      const provinceCounts: { [key: string]: number } = {}
      learners.forEach(learner => {
        if (learner.province) {
          provinceCounts[learner.province] = (provinceCounts[learner.province] || 0) + 1
        }
      })

      const learnerProvince: LearnerProvinceData[] = Object.entries(provinceCounts)
        .map(([province, count]) => ({
          province: province.charAt(0).toUpperCase() + province.slice(1),
          count
        }))
        .sort((a, b) => b.count - a.count)

      setData({
        globalStats,
        learners,
        learnerDistribution,
        learnerProvince,
        recentActivity
      })
    } catch (error) {
      console.error('Error fetching Super Admin dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadData()
      toast.success('Dashboard data refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <FirestoreErrorHandler>
      <div className="space-y-6 animate-in fade-in duration-700">
        {/* Welcome Card */}
        <div className="animate-in slide-in-from-bottom duration-1000 delay-200 ease-out">
          <SuperAdminWelcome />
        </div>

        {/* Global Statistics */}
        <div className="animate-in slide-in-from-bottom duration-1000 delay-300 ease-out">
          <GlobalStats 
            stats={data.globalStats} 
            onRefresh={handleRefresh}
            loading={refreshing}
          />
        </div>

        {/* Quick Notifications */}
        <Card className="border-blue-200 bg-blue-50 animate-in slide-in-from-bottom duration-1000 delay-400 ease-out">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  System Status: All services operational
                </p>
                <p className="text-xs text-blue-700">
                  Last checked: {new Date().toLocaleTimeString()}
                </p>
              </div>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Healthy
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-1000 delay-500 ease-out">
          {/* Left Column - Charts */}
          <div className="space-y-6">
            {/* Learner Distribution by Program */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Learner Distribution by Program</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LearnerDistributionChart data={data.learnerDistribution} />
              </CardContent>
            </Card>

            {/* Learner Distribution by Province */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>Geographic Distribution of Learners</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LearnerProvinceChart data={data.learnerProvince} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Tools and Recent Activity */}
          <div className="space-y-6">
            {/* AI Report Generator */}
            <AiReportGenerator platformData={{
              totalUsers: data.globalStats.totalUsers || 0,
              totalLearners: data.learners.length || 0,
              totalApplicants: data.globalStats.pendingApplications || 0,
              activePlacements: data.globalStats.activePlacements || 0,
              learnerDistribution: data.learnerDistribution || [],
              learnerProvince: data.learnerProvince || [],
              recentActivity: data.recentActivity || []
            }} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span>Recent Platform Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity activities={data.recentActivity} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Strategic Management Actions */}
        <Card className="animate-in slide-in-from-bottom duration-1000 delay-700 ease-out">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-gray-600" />
              <span>Strategic Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/super-admin/users"
                className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-600">Manage all users across the platform</p>
                </div>
              </a>

              <a
                href="/super-admin/grant-permissions"
                className="p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <Crown className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Grant Permissions</h3>
                  <p className="text-sm text-gray-600">Elevate user privileges and create admins</p>
                </div>
              </a>

              <a
                href="/super-admin/projects-programs"
                className="p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <GraduationCap className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Projects & Programs</h3>
                  <p className="text-sm text-gray-600">Define organizational structure</p>
                </div>
              </a>

              <a
                href="/super-admin/appearance"
                className="p-6 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <Activity className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Appearance</h3>
                  <p className="text-sm text-gray-600">Customize branding and visual theme</p>
                </div>
              </a>

              <a
                href="/super-admin/active-sessions"
                className="p-6 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Active Sessions</h3>
                  <p className="text-sm text-gray-600">Monitor and manage user sessions</p>
                </div>
              </a>

              <a
                href="/super-admin/stipend-reports"
                className="p-6 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Stipend Reports</h3>
                  <p className="text-sm text-gray-600">Resolve payment issues and manage stipends</p>
                </div>
              </a>

              <a
                href="/super-admin/ai-reports"
                className="p-6 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <TrendingUp className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">AI Reports</h3>
                  <p className="text-sm text-gray-600">Generate AI-powered platform summaries</p>
                </div>
              </a>

              <a
                href="/super-admin/system-health"
                className="p-6 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">System Health</h3>
                  <p className="text-sm text-gray-600">Monitor backend services and AI performance</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </FirestoreErrorHandler>
  )
}
