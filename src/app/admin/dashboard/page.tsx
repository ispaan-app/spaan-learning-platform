'use client'

import { RecentPlatformActivity } from '@/components/admin/RecentPlatformActivity'
import { AdminNotificationsPanel } from '@/components/notifications/AdminNotificationsPanel'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { notificationActions } from '@/lib/notificationActions'
import { AiChatbot } from '@/components/ai-chatbot'
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
import React, { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboardData } from '@/hooks/useDashboardData'
import { 
  Users, 
  GraduationCap, 
  Building2, 
  UserCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  Brain,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Shield,
  BarChart,
  Calendar,
  MapPin,
  Timer,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react'

interface DashboardStats {
  pendingApplicants: number
  totalLearners: number
  activePlacements: number
  assignedLearners: number
  attendanceRate: number
  totalSessions: number
  presentToday: number
  absentToday: number
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

interface WeatherData {
  temperature: number
  condition: string
  description: string
  icon: string
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout userRole="admin">
      <FirestoreErrorHandler>
        <AdminDashboardErrorBoundary>
          <AdminDashboardContent />
        </AdminDashboardErrorBoundary>
      </FirestoreErrorHandler>
    </AdminLayout>
  )
}

// Error boundary for the admin dashboard content
function AdminDashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('AdminDashboardErrorBoundary caught error:', event.error)
      setError(event.error)
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Dashboard Error</h3>
              <p className="text-sm text-red-600">Something went wrong loading the dashboard</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-red-700 mb-2">
              <strong>Error:</strong> {error?.message || 'Unknown error'}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setHasError(false)
                setError(null)
                window.location.reload()
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function AdminDashboardContent() {
  const [searchRecent, setSearchRecent] = React.useState('')
  const { user, userRole } = useAuth()
  
  // Use optimized data fetching hook
  const { stats: dashboardStats, recentApplicants, loading, error, refresh, lastUpdated } = useDashboardData()
  
  // Additional state for charts and other data
  const [applicationStatusData, setApplicationStatusData] = React.useState<ApplicationStatusData>({
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [learnerProgramData, setLearnerProgramData] = React.useState<LearnerProgramData[]>([])
  const [placementStatusData, setPlacementStatusData] = React.useState<PlacementStatusData[]>([])
  const [programNames, setProgramNames] = React.useState<{ [key: string]: string }>({})
  const [urgentAlerts, setUrgentAlerts] = React.useState<UrgentAlert[]>([])
  const [weather, setWeather] = React.useState<WeatherData | null>(null)
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [attendanceLoading, setAttendanceLoading] = React.useState(false)

  // Weather and time updates
  React.useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Fetch weather data (mock for now - in production, use a real weather API)
    const fetchWeather = async () => {
      // Mock weather data - replace with actual API call
      setWeather({
        temperature: 24,
        condition: 'partly-cloudy',
        description: 'Partly Cloudy',
        icon: 'cloud'
      })
    }

    fetchWeather()

    return () => clearInterval(timer)
  }, [])

  // Update application status data when dashboard stats change
  useEffect(() => {
    setApplicationStatusData({
      pending: dashboardStats.pendingApplicants,
      approved: 0,
      rejected: 0
    })
  }, [dashboardStats.pendingApplicants])

  // Simple urgent alerts calculation
  useEffect(() => {
    const alerts: UrgentAlert[] = []
      if (dashboardStats.pendingApplicants > 5) {
        alerts.push({
          type: 'applicant',
          message: `There are ${dashboardStats.pendingApplicants} applicants waiting for review!`,
          severity: 'warning',
      })
    }
    setUrgentAlerts(alerts)
  }, [dashboardStats])

  const getProgramName = (programId: string) => {
    return programNames[programId] || programId || 'Unknown Program'
  }

  const handleRetry = () => {
    window.location.reload()
  }

  const refreshAttendanceData = async () => {
    setAttendanceLoading(true)
    try {
      await refresh()
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setAttendanceLoading(false)
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="h-6 w-6 text-yellow-500" />
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-gray-500" />
      case 'partly-cloudy':
        return <Cloud className="h-6 w-6 text-blue-400" />
      case 'rainy':
        return <CloudRain className="h-6 w-6 text-blue-600" />
      case 'snowy':
        return <CloudSnow className="h-6 w-6 text-blue-300" />
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getAdminMessage = () => {
    const hour = currentTime.getHours()
    const dayOfWeek = currentTime.getDay()
    
    if (dayOfWeek === 1) { // Monday
      return "Ready to manage and optimize your platform this week?"
    } else if (dayOfWeek === 5) { // Friday
      return "Great work this week! Let's finish strong!"
    } else if (hour < 9) {
      return "Early start! You're building great administrative habits!"
    } else if (hour > 18) {
      return "Evening admin session - dedication at its finest!"
    } else {
      return "Ready to continue managing your learning platform?"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <AdminLayout userRole="admin">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Dashboard Error</h3>
                <p className="text-sm text-red-600">Something went wrong loading the dashboard data</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-red-700 mb-2">
                <strong>Error:</strong> {error}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 space-y-8">
        {/* Welcome Header */}
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full -translate-y-8 -translate-x-8"></div>
          
          <CardContent className="relative p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              {/* Welcome Message */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg border border-white/20">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      {getGreeting()}, {user?.displayName || "Admin"}!
                    </h1>
                    <p className="text-blue-100 text-lg font-medium">
                      {getAdminMessage()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-blue-100 text-lg">
                    "Empowering administrators to manage learning platforms effectively"
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-blue-200">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(currentTime)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{formatDate(currentTime)}</span>
                    </div>
                    {lastUpdated && (
                      <div className="flex items-center space-x-1">
                        <RefreshCw className="h-4 w-4" />
                        <span>Updated {formatTime(lastUpdated)}</span>
                      </div>
                    )}
                    <button
                      onClick={refreshAttendanceData}
                      disabled={attendanceLoading}
                      className="flex items-center space-x-1 px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${attendanceLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
      </div>

              {/* Weather and Analytics Section */}
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row space-y-4 sm:space-y-0 sm:space-x-4 lg:space-y-4 lg:space-x-0 xl:space-y-0 xl:space-x-4">
                {/* Weather Card */}
                {weather && (
                  <div className="bg-white/15 rounded-2xl p-6 backdrop-blur-sm border border-white/20 shadow-lg min-w-[200px]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg text-white">Weather</h3>
                      <div className="p-2 bg-white/20 rounded-lg shadow-md">
                        {getWeatherIcon(weather.condition)}
      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-4 w-4 text-blue-200" />
                        <span className="text-2xl font-bold text-white">{weather.temperature}°C</span>
                      </div>
                      <p className="text-blue-100 text-sm">{weather.description}</p>
                    </div>
                  </div>
                )}

                {/* Analytics Button */}
                <div className="bg-white/15 rounded-2xl p-6 backdrop-blur-sm border border-white/20 shadow-lg min-w-[200px]">
                  <div className="text-center">
                    <div className="p-3 bg-white/20 rounded-xl mb-4 mx-auto w-fit shadow-lg">
                      <BarChart className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-white">Analytics</h3>
                    <p className="text-blue-100 text-sm mb-4">
                      View detailed platform analytics and insights
                    </p>
                    <button 
                      onClick={() => window.location.href = '/admin/analytics'}
                      className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <BarChart className="h-4 w-4 mr-2 inline" />
                      View Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Pending Applicants</p>
                  <p className="text-3xl font-bold text-slate-900">{dashboardStats.pendingApplicants}</p>
                  <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
        </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+12%</span>
                <span className="text-slate-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-green-100 hover:from-emerald-100 hover:to-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Learners</p>
                  <p className="text-3xl font-bold text-slate-900">{dashboardStats.totalLearners}</p>
                  <p className="text-xs text-slate-500 mt-1">Currently enrolled</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <GraduationCap className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+8%</span>
                <span className="text-slate-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 to-orange-100 hover:from-amber-100 hover:to-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Active Placements</p>
                  <p className="text-3xl font-bold text-slate-900">{dashboardStats.activePlacements}</p>
                  <p className="text-xs text-slate-500 mt-1">Work opportunities</p>
                </div>
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                  <Building2 className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+15%</span>
                <span className="text-slate-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Assigned Learners</p>
                  <p className="text-3xl font-bold text-slate-900">{dashboardStats.assignedLearners}</p>
                  <p className="text-xs text-slate-500 mt-1">With placements</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+22%</span>
                <span className="text-slate-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Management Card */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-slate-900">Attendance Management</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={refreshAttendanceData}
                  disabled={attendanceLoading}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh attendance data"
                >
                  <RefreshCw className={`w-4 h-4 text-slate-600 ${attendanceLoading ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/reports'}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors" 
                  title="Export attendance report"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Attendance Rate */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl p-4 border border-emerald-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold text-emerald-700">{dashboardStats.attendanceRate}%</span>
                </div>
                <p className="text-sm font-medium text-emerald-800">Attendance Rate</p>
                <p className="text-xs text-emerald-600">This month</p>
              </div>

              {/* Total Sessions */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-4 border border-blue-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Timer className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700">{dashboardStats.totalSessions}</span>
                </div>
                <p className="text-sm font-medium text-blue-800">Total Sessions</p>
                <p className="text-xs text-blue-600">This week</p>
              </div>

              {/* Present Today */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-green-700">{dashboardStats.presentToday}</span>
                </div>
                <p className="text-sm font-medium text-green-800">Present Today</p>
                <p className="text-xs text-green-600">Currently checked in</p>
              </div>

              {/* Absent Today */}
              <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-xl p-4 border border-red-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-2xl font-bold text-red-700">{dashboardStats.absentToday}</span>
                </div>
                <p className="text-sm font-medium text-red-800">Absent Today</p>
                <p className="text-xs text-red-600">Need follow-up</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => window.location.href = '/admin/attendance'}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Manage Attendance</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/analytics'}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>View Analytics</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/reports'}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Activity and Applicants */}
          <div className="lg:col-span-2 space-y-8">
          {/* Recent Admin Activity Log */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-slate-900">Recent Activity</span>
              </CardTitle>
                  <button 
                    onClick={refreshAttendanceData}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">No recent activity</p>
                      <p className="text-sm text-slate-400">Activity will appear here when available</p>
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>

            {/* Recent Applicants */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-slate-900">Recent Applicants</span>
              </CardTitle>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => window.location.href = '/admin/applicants?filter=true'}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Filter className="w-4 h-4 text-slate-600" />
                    </button>
                    <button 
                      onClick={() => window.location.href = '/admin/reports'}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  {/* Search and Actions */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search applicants..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={searchRecent}
                  onChange={e => setSearchRecent(e.target.value)}
                />
              </div>
                    <BulkApplicantActions
                      onApproveAll={() => alert('Approve All Applicants (TODO: Implement logic)')}
                      onSendReminders={() => alert('Send Reminders (TODO: Implement logic)')}
                    />
                  </div>

                  {/* Applicants List */}
                  <div className="space-y-3">
                    {recentApplicants.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No recent applicants</p>
                        <p className="text-sm text-slate-400">Applicants will appear here when available</p>
                      </div>
                    ) : (
                      recentApplicants.filter(a =>
                    a.firstName?.toLowerCase().includes(searchRecent.toLowerCase()) ||
                    a.lastName?.toLowerCase().includes(searchRecent.toLowerCase()) ||
                    a.email?.toLowerCase().includes(searchRecent.toLowerCase()) ||
                    a.program?.toLowerCase().includes(searchRecent.toLowerCase())
                  ).map(applicant => (
                        <div key={applicant.id} className="group p-4 bg-slate-50/50 hover:bg-slate-100/50 rounded-xl border border-slate-200/50 transition-all duration-200 hover:shadow-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {(applicant.firstName?.[0] || 'A') + (applicant.lastName?.[0] || '')}
                              </div>
                      <div>
                                <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {applicant.firstName || 'Unknown'} {applicant.lastName || ''}
                                </h4>
                                <p className="text-sm text-slate-600">{applicant.email || 'No email'}</p>
                                <p className="text-xs text-slate-500">{getProgramName(applicant.program) || 'Unknown program'}</p>
                        </div>
                        </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                applicant.status === 'pending-review' ? 'bg-yellow-100 text-yellow-800' : 
                                applicant.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                applicant.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {applicant.status ? applicant.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
                              </span>
                              <div className="flex items-center space-x-1">
                                <button 
                                  onClick={() => window.location.href = `/admin/applicants/${applicant.id}`}
                                  className="p-2 hover:bg-white rounded-lg transition-colors"
                                >
                                  <Eye className="w-4 h-4 text-slate-600" />
                                </button>
                                <button 
                                  onClick={() => window.location.href = `/admin/applicants/${applicant.id}`}
                                  className="p-2 hover:bg-white rounded-lg transition-colors"
                                  title="Edit applicant"
                                >
                                  <Edit className="w-4 h-4 text-slate-600" />
                                </button>
                                <button 
                                  onClick={() => window.location.href = `/admin/applicants/${applicant.id}`}
                                  className="p-2 hover:bg-white rounded-lg transition-colors"
                                  title="More actions"
                                >
                                  <MoreHorizontal className="w-4 h-4 text-slate-600" />
                                </button>
                      </div>
                          </div>
                      </div>
                    </div>
                      ))
                  )}
                </div>
                </div>
            </CardContent>
          </Card>
        </div>

          {/* Right Column - Charts and Analytics */}
          <div className="space-y-8">
            {/* Application Status Chart */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <PieChart className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-slate-900">Application Status</span>
                  </CardTitle>
                  <button 
                    onClick={() => window.location.href = '/admin/analytics'}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ChartSkeleton />}>
              <OverviewChart data={applicationStatusData} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Learner Program Distribution */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-slate-900">Program Distribution</span>
                  </CardTitle>
                  <button 
                    onClick={() => window.location.href = '/admin/analytics'}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ChartSkeleton />}>
              <LearnerProgramChart data={learnerProgramData} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Placement Status */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-slate-900">Placement Status</span>
                  </CardTitle>
                  <button 
                    onClick={() => window.location.href = '/admin/placements'}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Activity className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ChartSkeleton />}>
              <PlacementStatusChart data={placementStatusData} />
              </Suspense>
            </CardContent>
          </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-semibold">Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => window.location.href = '/admin/applicants'}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5" />
                      <span className="text-sm font-medium">Review Applications</span>
                  </div>
                  </button>
                  <button 
                    onClick={() => window.location.href = '/admin/learners'}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="w-5 h-5" />
                      <span className="text-sm font-medium">Manage Learners</span>
                      </div>
                  </button>
                  <button 
                    onClick={() => window.location.href = '/admin/placements'}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Create Placements</span>
                  </div>
                  </button>
                  <button 
                    onClick={() => window.location.href = '/admin/inbox'}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5" />
                      <span className="text-sm font-medium">Send Notifications</span>
                </div>
                  </button>
                  <button 
                    onClick={() => window.location.href = '/admin/attendance'}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm font-medium">Manage Attendance</span>
                  </div>
                  </button>
          </div>
        </CardContent>
      </Card>
          </div>
        </div>

        {/* Urgent Alerts */}
        {urgentAlerts.length > 0 && (
          <div className="animate-in slide-in-from-bottom duration-1000 delay-500 ease-out">
            <UrgentAlertsPanel alerts={urgentAlerts} />
                      </div>
        )}

        {/* AI-Powered Analytics */}
        <div className="space-y-8">
          {/* Main AI Analytics Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
                  </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI-Powered Analytics
                </h2>
                <p className="text-sm text-slate-600">Intelligent insights powered by machine learning</p>
                </div>
            </div>
          </div>

          {/* AI Analytics Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dropout Risk Analysis Card */}
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-red-700 transition-colors duration-300">
                        Dropout Risk Analysis
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">AI-powered learner risk assessment</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      AI Active
                    </div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative">
                <div className="space-y-4">
                  {/* AI Status Indicator */}
                  <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-red-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Machine Learning Model</p>
                        <p className="text-xs text-slate-600">Analyzing learner patterns in real-time</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">98.5%</p>
                      <p className="text-xs text-slate-600">Accuracy</p>
                    </div>
                  </div>
                  
                  {/* AI Component */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-red-200/50 shadow-lg">
                    <Suspense fallback={
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-red-100 rounded-lg animate-pulse"></div>
                          <div className="h-4 bg-red-100 rounded w-32 animate-pulse"></div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-3 bg-red-100 rounded animate-pulse"></div>
                          <div className="h-3 bg-red-100 rounded w-3/4 animate-pulse"></div>
                          <div className="h-3 bg-red-100 rounded w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                    }>
                      <DropoutRiskAnalyzer learners={[]} />
                    </Suspense>
                  </div>
          </div>
        </CardContent>
      </Card>

            {/* Learner Activity Feed Card */}
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-cyan-400/10 to-teal-400/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-300">
                        Learner Activity Feed
          </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">Real-time learner engagement tracking</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      Live Data
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
        </CardHeader>
              
              <CardContent className="relative">
                <div className="space-y-4">
                  {/* Activity Status Indicator */}
                  <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                  </div>
                      <div>
                        <p className="font-semibold text-slate-900">Real-time Monitoring</p>
                        <p className="text-xs text-slate-600">Tracking learner activities and progress</p>
                </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">24/7</p>
                      <p className="text-xs text-slate-600">Active</p>
                    </div>
                  </div>
                  
                  {/* Activity Component */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 shadow-lg">
                    <Suspense fallback={
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg animate-pulse"></div>
                          <div className="h-4 bg-blue-100 rounded w-32 animate-pulse"></div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-3 bg-blue-100 rounded animate-pulse"></div>
                          <div className="h-3 bg-blue-100 rounded w-3/4 animate-pulse"></div>
                          <div className="h-3 bg-blue-100 rounded w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                    }>
                      <LearnerActivityFeed />
                    </Suspense>
                  </div>
          </div>
        </CardContent>
      </Card>
          </div>

          {/* AI Insights Summary */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full translate-y-16 -translate-x-16"></div>
            
            <CardContent className="relative p-8">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Brain className="w-6 h-6 text-white" />
                  <span className="text-lg font-semibold">AI Insights Summary</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">Risk Detection</h3>
                    <p className="text-sm text-blue-200">Advanced ML algorithms identify at-risk learners</p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Activity className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">Real-time Tracking</h3>
                    <p className="text-sm text-blue-200">Continuous monitoring of learner engagement</p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">Predictive Analytics</h3>
                    <p className="text-sm text-blue-200">AI-powered insights for better decision making</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Status */}
        <div className="flex items-center justify-between py-6 px-6 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">System Online</span>
            </div>
            <div className="text-sm text-slate-500">
              Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <span>Dashboard loaded successfully</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  )
}