'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeAdminActivity } from '@/hooks/useRealtimeAdminActivity'
import { useRealtimeAdminNotifications } from '@/hooks/useRealtimeAdminNotifications'
import { useAdminList } from '@/hooks/useAdminList'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { collection, getDocs, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { FirestoreErrorHandler } from '@/components/ui/dashboard-error-handler'
import { AdminDashboardErrorHandler } from '@/components/ui/admin-dashboard-error-handler'
import { StatsCards } from '@/components/admin/StatsCards'
import { UrgentAlertsPanel, UrgentAlert } from '@/components/admin/UrgentAlertsPanel'
import { RecentApplicants } from '@/components/admin/RecentApplicants'
import { BulkApplicantActions } from '@/components/admin/BulkApplicantActions'
import { ProgramService } from '@/lib/program-service'
import { PlacementStatusChart } from '@/components/admin/PlacementStatusChart'
import { OverviewChart } from '@/components/admin/OverviewChart'
import { LearnerProgramChart } from '@/components/admin/LearnerProgramChart'
import { LearnerActivityFeed } from '@/components/admin/LearnerActivityFeed'
import { DropoutRiskAnalyzer } from '@/components/admin/DropoutRiskAnalyzer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { StatsSkeleton, ChartSkeleton, ListSkeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  PieChart, 
  FileText, 
  Settings, 
  Bell, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  Zap,
  Target,
  Shield,
  Brain,
  Globe,
  Award,
  MessageCircle,
  Calendar,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  MoreHorizontal,
  User,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react'

interface DashboardStats {
  pendingApplicants: number
  totalLearners: number
  activePlacements: number
  assignedLearners: number
}

interface RecentApplicant {
  id: string
  firstName: string
  lastName: string
  email: string
  program: string
  applicationDate: string
  status: string
}

interface ApplicationStatusData {
  pending: number
  approved: number
  rejected: number
}

interface LearnerProgramData {
  program: string
  count: number
}

interface PlacementStatusData {
  status: string
  count: number
}

export default function EnhancedAdminDashboardPage() {
  return (
    <AdminLayout userRole="admin">
      <FirestoreErrorHandler>
        <EnhancedAdminDashboardContent />
      </FirestoreErrorHandler>
    </AdminLayout>
  )
}

export function EnhancedAdminDashboardContent() {
  const recentActivity = useRealtimeAdminActivity(10)
  const adminNotifications = useRealtimeAdminNotifications(10)
  const [searchRecent, setSearchRecent] = useState('')
  const { user, userData } = useAuth()
  const admins = useAdminList()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    pendingApplicants: 0,
    totalLearners: 0,
    activePlacements: 0,
    assignedLearners: 0
  })
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([])
  const [applicationStatusData, setApplicationStatusData] = useState<ApplicationStatusData>({
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [learnerProgramData, setLearnerProgramData] = useState<LearnerProgramData[]>([])
  const [placementStatusData, setPlacementStatusData] = useState<PlacementStatusData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlert[]>([])
  const [programNames, setProgramNames] = useState<{ [key: string]: string }>({})

  // Real-time data fetching
  useEffect(() => {
    let isMounted = true
    const unsubscribeFunctions: (() => void)[] = []

    const setupListeners = () => {
    setError(null)
    setLoading(true)

      try {
    // Real-time stats
    const unsubApplicants = collection(db, 'users')
    const unsubPlacements = collection(db, 'placements')

    // Pending Applicants
    const qPending = query(unsubApplicants, where('role', '==', 'applicant'), where('status', '==', 'pending-review'))
        const unsubPending = onSnapshot(qPending, 
          (snapshot) => {
            if (isMounted) {
      setDashboardStats((prev) => ({ ...prev, pendingApplicants: snapshot.size }))
      setApplicationStatusData((prev) => ({ ...prev, pending: snapshot.size }))
            }
          }, 
          (err) => {
            if (isMounted) {
              console.error('Error in pending applicants listener:', err)
              setError(err)
            }
          }
        )
        unsubscribeFunctions.push(unsubPending)

    // Total Learners
    const qLearners = query(unsubApplicants, where('role', '==', 'learner'))
        const unsubLearners = onSnapshot(qLearners, 
          (snapshot) => {
            if (isMounted) {
      setDashboardStats((prev) => ({ ...prev, totalLearners: snapshot.size }))
      // Learner Program Data
      const programCounts: { [key: string]: number } = {}
      snapshot.docs.forEach((doc: any) => {
        const program = doc.data().program
        if (program) {
          programCounts[program] = (programCounts[program] || 0) + 1
        }
      })
      setLearnerProgramData(Object.entries(programCounts).map(([program, count]) => ({
        program: program.charAt(0).toUpperCase() + program.slice(1).replace('-', ' '),
        count
      })))
            }
          }, 
          (err) => {
            if (isMounted) {
              console.error('Error in learners listener:', err)
              setError(err)
            }
          }
        )
        unsubscribeFunctions.push(unsubLearners)

    // Recent Applicants
    const qRecent = query(unsubApplicants, where('role', '==', 'applicant'), orderBy('createdAt', 'desc'), limit(4))
        const unsubRecent = onSnapshot(qRecent, 
          (snapshot) => {
            if (isMounted) {
      setRecentApplicants(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })))
            }
          }, 
          (err) => {
            if (isMounted) {
              console.error('Error in recent applicants listener:', err)
              setError(err)
            }
          }
        )
        unsubscribeFunctions.push(unsubRecent)

    // Application Status: Approved
    const qApproved = query(unsubApplicants, where('role', '==', 'applicant'), where('status', '==', 'approved'))
        const unsubApproved = onSnapshot(qApproved, 
          (snapshot) => {
            if (isMounted) {
      setApplicationStatusData((prev) => ({ ...prev, approved: snapshot.size }))
            }
          }, 
          (err) => {
            if (isMounted) {
              console.error('Error in approved applicants listener:', err)
              setError(err)
            }
          }
        )
        unsubscribeFunctions.push(unsubApproved)

    // Application Status: Rejected
    const qRejected = query(unsubApplicants, where('role', '==', 'applicant'), where('status', '==', 'rejected'))
        const unsubRejected = onSnapshot(qRejected, 
          (snapshot) => {
            if (isMounted) {
      setApplicationStatusData((prev) => ({ ...prev, rejected: snapshot.size }))
            }
          }, 
          (err) => {
            if (isMounted) {
              console.error('Error in rejected applicants listener:', err)
              setError(err)
            }
          }
        )
        unsubscribeFunctions.push(unsubRejected)

    // Placements: Active
    const qActivePlacements = query(unsubPlacements, where('status', '==', 'active'))
        const unsubActivePlacements = onSnapshot(qActivePlacements, 
          (snapshot) => {
            if (isMounted) {
      setDashboardStats((prev) => ({ ...prev, activePlacements: snapshot.size }))
            }
          }, 
          (err) => {
            if (isMounted) {
              console.error('Error in active placements listener:', err)
              setError(err)
            }
          }
        )
        unsubscribeFunctions.push(unsubActivePlacements)

    // Placements: Assigned
    const qAssignedPlacements = query(unsubPlacements, where('assignedLearnerId', '!=', null))
        const unsubAssignedPlacements = onSnapshot(qAssignedPlacements, 
          (snapshot) => {
            if (isMounted) {
      setDashboardStats((prev) => ({ ...prev, assignedLearners: snapshot.size }))
            }
          }, 
          (err) => {
            if (isMounted) {
              console.error('Error in assigned placements listener:', err)
              setError(err)
            }
          }
        )
        unsubscribeFunctions.push(unsubAssignedPlacements)

    // Placement Status Data
    const qAllPlacements = query(unsubPlacements)
        const unsubAllPlacements = onSnapshot(qAllPlacements, 
          (snapshot) => {
            if (isMounted) {
      const statusCounts: { [key: string]: number } = {}
      snapshot.docs.forEach((doc: any) => {
        const status = doc.data().status || 'unknown'
        statusCounts[status] = (statusCounts[status] || 0) + 1
      })
      setPlacementStatusData(Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count
      })))
            }
          }, 
          (err) => {
            if (isMounted) {
              console.error('Error in placement status listener:', err)
              setError(err)
            }
          }
        )
        unsubscribeFunctions.push(unsubAllPlacements)

        if (isMounted) {
          setLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error setting up listeners:', error)
          setError(error as Error)
    setLoading(false)
        }
      }
    }

    setupListeners()

    return () => {
      isMounted = false
      unsubscribeFunctions.forEach(unsubscribe => {
        try {
          unsubscribe()
        } catch (error) {
          console.error('Error unsubscribing from listener:', error)
        }
      })
    }
  }, [])

  // Separate useEffect for urgent alerts to avoid circular dependency
  useEffect(() => {
    const alerts: UrgentAlert[] = []
    // Example: Too many pending applicants
    if (dashboardStats.pendingApplicants > 5) {
      alerts.push({
        type: 'applicant',
        message: `There are ${dashboardStats.pendingApplicants} applicants waiting for review!`,
        severity: 'warning',
      })
    }
    // Example: Placements at capacity
    if (dashboardStats.activePlacements > 0 && dashboardStats.activePlacements === dashboardStats.assignedLearners) {
      alerts.push({
        type: 'placement',
        message: 'All active placements are at full capacity!',
        severity: 'error',
      })
    }
    setUrgentAlerts(alerts)
  }, [dashboardStats])

  // Load program names for recent applicants
  useEffect(() => {
    if (recentApplicants.length > 0) {
      const uniqueProgramIds = Array.from(new Set(recentApplicants.map(a => a.program).filter(Boolean)))
      if (uniqueProgramIds.length > 0) {
        ProgramService.getProgramNames(uniqueProgramIds)
          .then(setProgramNames)
          .catch(error => {
            console.error('Error fetching program names:', error)
            const fallbackMap: { [key: string]: string } = {}
            uniqueProgramIds.forEach(id => {
              fallbackMap[id] = id
            })
            setProgramNames(fallbackMap)
          })
      }
    }
  }, [recentApplicants])

  const getProgramName = (programId: string) => {
    return programNames[programId] || programId || 'Unknown Program'
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#F5F0E1' }}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 rounded w-1/3" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}></div>
              <div className="h-96 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E1' }}>

      <div className="relative max-w-7xl mx-auto p-6 space-y-8">
        {/* Clean Header */}
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold" style={{ color: '#1E3D59' }}>
                Admin Dashboard
              </h1>
              <p className="text-lg" style={{ color: '#1E3D59', opacity: 0.7 }}>
                Manage your platform with powerful insights and real-time data
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" style={{ backgroundColor: '#F5F0E1' }}>
                  <Bell className="w-6 h-6" style={{ color: '#1E3D59' }} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ backgroundColor: '#FF6E40' }}></span>
                </button>
              </div>
              <div className="relative group">
                <button className="p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" style={{ backgroundColor: '#F5F0E1' }}>
                  <Settings className="w-6 h-6" style={{ color: '#1E3D59' }} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Welcome Card */}
        <div className="group relative mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 transform group-hover:scale-[1.02] overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white rounded-full animate-pulse delay-500"></div>
              <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-white rounded-full animate-pulse delay-700"></div>
            </div>
            
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.displayName?.split(' ')[0] || userData?.firstName || 'Admin'}!
                    </h2>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {new Date().getHours() < 12 ? 
                          <Sun className="h-5 w-5 text-yellow-300" /> : 
                          new Date().getHours() < 17 ? 
                          <Sun className="h-5 w-5 text-orange-300" /> : 
                          <Moon className="h-5 w-5 text-blue-300" />
                        }
                        <span className="text-white/90 text-lg">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-white/80" />
                        <span className="text-white/80 text-lg">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <span className="text-white font-semibold text-sm">ADMIN</span>
                  </div>
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Star className="w-5 h-5 text-yellow-300" />
                  </div>
                </div>
              </div>
              
              <p className="text-white/90 text-xl mb-6 leading-relaxed">
                {[
                  "Ready to manage the platform today?",
                  "Let's keep everything running smoothly.",
                  "Time to handle some administrative tasks.",
                  "Ready to make strategic decisions?",
                  "Let's optimize our platform together."
                ][Math.floor(Math.random() * 5)]}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/80 text-sm">System Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-300" />
                    <span className="text-white/80 text-sm">Ready to go!</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                  <span className="text-white/80 text-sm font-medium">Enhanced Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Stats Cards */}
        <Suspense fallback={<StatsSkeleton />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pending Applicants Card */}
            <div className="group relative">
              <div className="relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#FF6E40' }}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: '#1E3D59' }}>{dashboardStats.pendingApplicants}</div>
                    <div className="text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>Pending</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#1E3D59' }}>Applicants</h3>
                <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.6 }}>Awaiting review and approval</p>
              </div>
            </div>

            {/* Total Learners Card */}
            <div className="group relative">
              <div className="relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#1E3D59' }}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: '#1E3D59' }}>{dashboardStats.totalLearners}</div>
                    <div className="text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>Active</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#1E3D59' }}>Learners</h3>
                <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.6 }}>Currently enrolled students</p>
              </div>
            </div>

            {/* Active Placements Card */}
            <div className="group relative">
              <div className="relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#FFC13B' }}>
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: '#1E3D59' }}>{dashboardStats.activePlacements}</div>
                    <div className="text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>Active</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#1E3D59' }}>Placements</h3>
                <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.6 }}>Work-integrated learning opportunities</p>
              </div>
            </div>

            {/* Assigned Learners Card */}
            <div className="group relative">
              <div className="relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: '#F5F0E1' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#FF6E40' }}>
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: '#1E3D59' }}>{dashboardStats.assignedLearners}</div>
                    <div className="text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>Assigned</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#1E3D59' }}>Assigned</h3>
                <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.6 }}>Learners with active placements</p>
              </div>
            </div>
          </div>
        </Suspense>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Activity and Applicants */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Admin Activity */}
            <div className="group relative">
              <div className="relative rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F5F0E1' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: '#1E3D59' }}>Recent Activity</h3>
                      <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>Platform activity and updates</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FF6E40' }}></div>
                </div>
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 rounded-2xl transition-colors duration-200" style={{ backgroundColor: 'rgba(30, 61, 89, 0.05)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF6E40' }}>
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: '#1E3D59' }}>{activity.details || activity.action}</p>
                        <p className="text-xs" style={{ color: '#1E3D59', opacity: 0.6 }}>{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Applicants */}
            <div className="group relative">
              <div className="relative rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F5F0E1' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: '#1E3D59' }}>Recent Applicants</h3>
                      <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>Latest application submissions</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FF6E40' }}></div>
                </div>
                
                <div className="space-y-4">
                  {recentApplicants.filter(a =>
                    a.firstName?.toLowerCase().includes(searchRecent.toLowerCase()) ||
                    a.lastName?.toLowerCase().includes(searchRecent.toLowerCase()) ||
                    a.email?.toLowerCase().includes(searchRecent.toLowerCase()) ||
                    a.program?.toLowerCase().includes(searchRecent.toLowerCase())
                  ).map(applicant => (
                    <div key={applicant.id} className="flex items-center justify-between p-4 rounded-2xl transition-colors duration-200" style={{ backgroundColor: 'rgba(30, 61, 89, 0.05)' }}>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#1E3D59' }}>
                          {applicant.firstName?.[0] || 'A'}
                        </div>
                        <div>
                          <h4 className="font-semibold" style={{ color: '#1E3D59' }}>{applicant.firstName || 'Unknown'} {applicant.lastName || ''}</h4>
                          <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>{applicant.email || 'No email'}</p>
                          <p className="text-xs" style={{ color: '#1E3D59', opacity: 0.6 }}>{getProgramName(applicant.program) || 'Unknown program'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          applicant.status === 'pending-review' ? 'text-yellow-800' : 
                          applicant.status === 'approved' ? 'text-green-800' : 
                          applicant.status === 'rejected' ? 'text-red-800' : 
                          'text-gray-800'
                        }`} style={{ 
                          backgroundColor: applicant.status === 'pending-review' ? '#FFC13B' : 
                          applicant.status === 'approved' ? '#4ade80' : 
                          applicant.status === 'rejected' ? '#f87171' : 
                          '#e5e7eb'
                        }}>
                          {applicant.status ? applicant.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
                        </span>
                        <button className="p-2 text-white rounded-lg transition-colors duration-200" style={{ backgroundColor: '#FF6E40' }}>
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Charts and Tools */}
          <div className="space-y-8">
            {/* Application Status Chart */}
            <div className="group relative">
              <div className="relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F5F0E1' }}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#1E3D59' }}>Application Status</h3>
                    <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>Overview of applications</p>
                  </div>
                </div>
                <Suspense fallback={<ChartSkeleton />}>
                  <OverviewChart data={applicationStatusData} />
                </Suspense>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="group relative">
              <div className="relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F5F0E1' }}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#1E3D59' }}>Quick Actions</h3>
                    <p className="text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>Common admin tasks</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 rounded-2xl transition-colors duration-200 text-left" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
                    <Users className="w-6 h-6 mb-2" style={{ color: '#1E3D59' }} />
                    <p className="text-sm font-medium" style={{ color: '#1E3D59' }}>Review Apps</p>
                  </button>
                  <button className="p-4 rounded-2xl transition-colors duration-200 text-left" style={{ backgroundColor: 'rgba(255, 192, 59, 0.1)' }}>
                    <Briefcase className="w-6 h-6 mb-2" style={{ color: '#FFC13B' }} />
                    <p className="text-sm font-medium" style={{ color: '#1E3D59' }}>Manage Placements</p>
                  </button>
                  <button className="p-4 rounded-2xl transition-colors duration-200 text-left" style={{ backgroundColor: 'rgba(255, 110, 64, 0.1)' }}>
                    <BarChart3 className="w-6 h-6 mb-2" style={{ color: '#FF6E40' }} />
                    <p className="text-sm font-medium" style={{ color: '#1E3D59' }}>View Analytics</p>
                  </button>
                  <button className="p-4 rounded-2xl transition-colors duration-200 text-left" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
                    <Settings className="w-6 h-6 mb-2" style={{ color: '#1E3D59' }} />
                    <p className="text-sm font-medium" style={{ color: '#1E3D59' }}>Settings</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Core Functions */}
        <div className="group relative">
          <div className="relative rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#F5F0E1' }}>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1E3D59' }}>Core Admin Functions</h2>
                <p style={{ color: '#1E3D59', opacity: 0.7 }}>Essential tools for platform management</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  href: "/admin/applicants",
                  icon: FileText,
                  title: "Review Applications",
                  description: "Review new applications, approve/reject documents, and promote applicants to learners",
                  color: "blue",
                  features: ["Document Review", "Application Approval", "Role Promotion"]
                },
                {
                  href: "/admin/learners",
                  icon: Users,
                  title: "Manage Learners",
                  description: "View learner profiles, track progress, and use AI dropout risk analysis",
                  color: "green",
                  features: ["Profile Management", "Progress Tracking", "AI Risk Analysis"]
                },
                {
                  href: "/admin/placements",
                  icon: Briefcase,
                  title: "Manage Placements",
                  description: "Create WIL opportunities, use AI geocoding, and match candidates",
                  color: "purple",
                  features: ["Create Placements", "AI Geocoding", "Candidate Matching"]
                },
                {
                  href: "/admin/class-sessions",
                  icon: Calendar,
                  title: "Class Sessions",
                  description: "Schedule in-person sessions, generate QR codes, and manage attendance",
                  color: "indigo",
                  features: ["Session Scheduling", "QR Code Generation", "Attendance Tracking"]
                },
                {
                  href: "/admin/announcements",
                  icon: MessageCircle,
                  title: "Announcements",
                  description: "Create announcements with AI assistance and send to all learners",
                  color: "orange",
                  features: ["AI Writing Assistant", "Bulk Notifications", "Push Notifications"]
                },
                {
                  href: "/admin/profile",
                  icon: Settings,
                  title: "Profile Management",
                  description: "Manage personal information, password, and account settings",
                  color: "gray",
                  features: ["Personal Info", "Password Management", "Account Settings"]
                }
              ].map((action, index) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="group/card p-6 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: 'rgba(30, 61, 89, 0.05)' }}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover/card:scale-110 transition-transform duration-300" style={{ backgroundColor: action.color === 'blue' ? '#1E3D59' : action.color === 'green' ? '#FFC13B' : action.color === 'purple' ? '#FF6E40' : '#1E3D59' }}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold mb-2 text-lg group-hover/card:opacity-80 transition-opacity duration-200" style={{ color: '#1E3D59' }}>{action.title}</h3>
                    <p className="text-sm mb-4 leading-relaxed group-hover/card:opacity-80 transition-opacity duration-200" style={{ color: '#1E3D59', opacity: 0.7 }}>{action.description}</p>
                    
                    <div className="space-y-1">
                      {action.features.map((feature, featureIndex) => (
                        <div 
                          key={featureIndex}
                          className="text-xs transition-colors duration-200"
                          style={{ color: '#1E3D59', opacity: 0.6 }}
                        >
                          • {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}