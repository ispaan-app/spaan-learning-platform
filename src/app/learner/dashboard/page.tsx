'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  BookOpen, 
  Award, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  FileText, 
  MessageCircle, 
  CheckCircle, 
  AlertTriangle,
  User,
  RefreshCw,
  Bell,
  ExternalLink,
  Activity,
  Target,
  Zap
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { LearnerService, LearnerStats, RecentActivity, UpcomingClass, PlacementInfo } from '@/lib/services/learner-service'
import { MonthlyHoursProgress } from '@/components/shared/monthly-hours-progress'
import { ReportIssueModal } from '@/components/learner/report-issue-modal'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'
import { getLearnerMonthlyHours, reportStipendIssueAction } from '@/app/learner/actions'

export default function LearnerDashboard() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [learnerStats, setLearnerStats] = useState<LearnerStats>({
    workHours: 0,
    targetHours: 160,
    completedCourses: 0,
    certificates: 0,
    upcomingClasses: 0,
    leaveRequests: 0,
    pendingDocuments: 0,
    placementStatus: 'inactive'
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([])
  const [placementInfo, setPlacementInfo] = useState<PlacementInfo | null>(null)
  const [monthlyHours, setMonthlyHours] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setIsRefreshing(true)
      setError(null)

      const currentDate = new Date()
      const [stats, activity, classes, placement, hours] = await Promise.all([
        LearnerService.getLearnerStats(user.uid),
        LearnerService.getRecentActivity(user.uid),
        LearnerService.getUpcomingClasses(user.uid),
        LearnerService.getPlacementInfo(user.uid),
        getLearnerMonthlyHours(user.uid, currentDate.getFullYear(), currentDate.getMonth() + 1)
      ])

      setLearnerStats(stats)
      setRecentActivity(activity)
      setUpcomingClasses(classes)
      setPlacementInfo(placement)
      setMonthlyHours(hours)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const handleRefresh = () => {
    loadDashboardData()
    toast.info('Dashboard refreshed')
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'checkin':
        router.push('/learner/check-in')
        break
      case 'leave':
        router.push('/learner/leave')
        break
      case 'documents':
        router.push('/learner/documents')
        break
      case 'profile':
        router.push('/learner/profile')
        break
      default:
        break
    }
  }

  const handleReportStipendIssue = async () => {
    if (!user || !placementInfo) return

    const confirmed = window.confirm(
      'Are you sure you want to report a stipend issue? This will notify administrators immediately.'
    )

    if (!confirmed) return

    try {
      const currentDate = new Date()
      const result = await reportStipendIssueAction({
        learnerId: user.uid,
        learnerName: user.displayName || 'Learner',
        placementId: placementInfo.id,
        companyName: placementInfo.companyName,
        month: currentDate.toLocaleString('default', { month: 'long' }),
        year: currentDate.getFullYear()
      })

      if (result.success) {
        toast.success('Stipend issue reported successfully. Administrators have been notified.')
      } else {
        toast.error(result.error || 'Failed to report stipend issue')
    }
  } catch (error) {
      console.error('Error reporting stipend issue:', error)
      toast.error('Failed to report stipend issue')
    }
  }

  const progressPercentage = learnerStats.targetHours > 0 
    ? Math.min((learnerStats.workHours / learnerStats.targetHours) * 100, 100)
    : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'warning': return 'text-orange-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'checkin': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'checkout': return <Clock className="h-4 w-4 text-blue-600" />
      case 'leave_request': return <Calendar className="h-4 w-4 text-orange-600" />
      case 'document_upload': return <FileText className="h-4 w-4 text-purple-600" />
      case 'course_completion': return <Award className="h-4 w-4 text-green-600" />
      case 'placement_update': return <MapPin className="h-4 w-4 text-blue-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <AdminLayout userRole="learner">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="learner">
      <div className="space-y-6">
        {/* Header with Refresh Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Learner Dashboard</h1>
            <p className="text-gray-600">Track your WIL progress and manage your learning journey</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Card */}
        <WelcomeCard 
          userName={user?.displayName || "Learner"} 
          userRole="learner" 
          className="mb-6 animate-in slide-in-from-bottom duration-1000 delay-200 ease-out"
        />

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 animate-in slide-in-from-bottom duration-1000 delay-300 ease-out">
          <Card className="shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">WIL Hours</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{learnerStats.workHours}</p>
                  <p className="text-xs text-gray-500 truncate">of {learnerStats.targetHours} required</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Training Modules</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{learnerStats.completedCourses}</p>
                  <p className="text-xs text-gray-500 truncate">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Programmes</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">{learnerStats.certificates}</p>
                  <p className="text-xs text-gray-500 truncate">Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Training Sessions</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">{learnerStats.upcomingClasses}</p>
                  <p className="text-xs text-gray-500 truncate">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Hours Progress */}
        <MonthlyHoursProgress 
          loggedHours={monthlyHours}
          targetHours={learnerStats.targetHours}
          className="animate-in slide-in-from-bottom duration-1000 delay-700 ease-out"
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-in slide-in-from-bottom duration-1000 delay-500 ease-out">
          {/* Left Column - WIL Progress and Recent Activity */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* WIL Progress */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <span className="truncate">Work-Integrated Learning (WIL) Progress</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 truncate">WIL Hours Completed</span>
                    <span className="font-semibold ml-2">{learnerStats.workHours} / {learnerStats.targetHours}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 sm:h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0 hours</span>
                    <span>{learnerStats.targetHours} hours required</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-blue-50 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0"></div>
                    <span className="font-medium text-blue-900 text-sm sm:text-base">Prorata Stipend</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 w-fit">
                    {Math.round(progressPercentage)}% Complete
                  </Badge>
                </div>

                <Button 
                  onClick={() => handleQuickAction('checkin')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Check-In to Work Placement
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                          <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.timestamp.toLocaleString()}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(activity.status)}`}
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Placement and Quick Actions */}
          <div className="space-y-4 sm:space-y-6">
            {/* Current WIL Placement */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                  <span>Current WIL Placement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {placementInfo ? (
                  <>
                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900 text-sm sm:text-base">{placementInfo.companyName}</h3>
                      <p className="text-xs sm:text-sm text-green-700">{placementInfo.position}</p>
                      <Badge className="bg-green-100 text-green-800 mt-2 text-xs">
                        {placementInfo.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        onClick={handleReportStipendIssue}
                        variant="outline" 
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                      >
                        <AlertTriangle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Report Stipend Issue
                      </Button>
                      
                      <Button 
                        onClick={() => handleQuickAction('documents')}
                        variant="outline" 
                        className="w-full text-xs sm:text-sm"
                      >
                        <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        WIL Documents
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No active placement</p>
                    <p className="text-xs text-gray-400 mt-1">Contact your administrator</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Career Mentor */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                  <span>AI Career Mentor</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Get personalized WIL guidance and career advice</p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm">
                  <MessageCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ReportIssueModal
                  userRole="learner"
                  userId={user?.uid || ''}
                  userName={user?.displayName || 'Learner'}
                  userEmail={user?.email || ''}
                  placementInfo={placementInfo ? {
                    id: placementInfo.id,
                    companyName: placementInfo.companyName,
                    position: placementInfo.position
                  } : undefined}
                  className="w-full justify-start text-xs sm:text-sm"
                />
                <Button 
                  onClick={() => handleQuickAction('leave')}
                  variant="outline" 
                  className="w-full justify-start text-xs sm:text-sm"
                >
                  <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Request Leave
                </Button>
                <Button 
                  onClick={() => handleQuickAction('documents')}
                  variant="outline" 
                  className="w-full justify-start text-xs sm:text-sm"
                >
                  <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Manage Documents
                </Button>
                <Button 
                  onClick={() => handleQuickAction('profile')}
                  variant="outline" 
                  className="w-full justify-start text-xs sm:text-sm"
                >
                  <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Training Sessions */}
        <Card className="animate-in slide-in-from-bottom duration-1000 delay-1100 ease-out">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
              <span>Upcoming Training Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingClasses.length > 0 ? (
                upcomingClasses.map((classSession) => (
                  <div key={classSession.id} className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{classSession.title}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-2 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{classSession.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{classSession.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{classSession.location}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-fit text-xs">
                        {classSession.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">No upcoming sessions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Support Chatbot */}
      <AiChatbot />
    </AdminLayout>
  )
}