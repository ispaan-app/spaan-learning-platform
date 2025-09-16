'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { Settings } from 'lucide-react'
import { useLearnerDashboardPrefs } from '@/hooks/useLearnerDashboardPrefs'
import { LearnerNotificationsPanel } from '@/components/learner/LearnerNotificationsPanel'
import { useNotifications } from '@/hooks/useNotifications'
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
import { useState, useEffect, useRef } from 'react'
import { LearnerService, LearnerStats, RecentActivity, UpcomingClass, PlacementInfo } from '@/lib/services/learner-service'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { MonthlyHoursProgress } from '@/components/shared/monthly-hours-progress'
import { ReportIssueModal } from '@/components/learner/report-issue-modal'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'
import { getLearnerMonthlyHours, reportStipendIssueAction } from '@/app/learner/actions'

export default function LearnerDashboard() {
  const { user, userRole } = useAuth()
  const { notifications, markAsRead, deleteNotification } = useNotifications();
  const { prefs, setWidgetVisible } = useLearnerDashboardPrefs(user?.uid);
  const [showPrefs, setShowPrefs] = useState(false);
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
  // Keep refs to unsub functions for cleanup
  const unsubRefs = useRef<any[]>([])

  // Real-time Firestore listeners for stats, activity, and classes
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    // Cleanup previous listeners
    unsubRefs.current.forEach(unsub => unsub && unsub());
    unsubRefs.current = [];

    // Attendance (work hours, activity)
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('userId', '==', user.uid),
      where('checkOutTime', '!=', null),
      orderBy('checkInTime', 'desc'),
      limit(10)
    );
    const unsubAttendance = onSnapshot(attendanceQuery, async (snapshot) => {
      let totalWorkHours = 0;
      const activities: RecentActivity[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.checkInTime && data.checkOutTime) {
          const checkIn = data.checkInTime.toDate();
          const checkOut = data.checkOutTime.toDate();
          const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
          totalWorkHours += hours;
        }
        const checkInTime = data.checkInTime?.toDate?.() || new Date();
        const isCheckedOut = data.checkOutTime !== null;
        activities.push({
          id: docSnap.id,
          type: isCheckedOut ? 'checkout' : 'checkin',
          title: isCheckedOut ? 'Checked out from work' : 'Checked in to work',
          description: isCheckedOut 
            ? `Completed work session at ${data.placementId ? 'work placement' : 'training session'}`
            : `Started work session at ${data.placementId ? 'work placement' : 'training session'}`,
          timestamp: checkInTime,
          status: 'success'
        });
      });
      setLearnerStats(prev => ({ ...prev, workHours: Math.round(totalWorkHours * 10) / 10 }));
      setRecentActivity(prev => {
        // Merge with other activities (leave, docs) below
        return [
          ...activities.map(a => ({
            ...a,
            type: a.type as RecentActivity['type'],
            status: a.status as RecentActivity['status'],
          } as RecentActivity)),
          ...prev.filter(a => a.type !== 'checkin' && a.type !== 'checkout')
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
      });
    }, (err) => setError('Failed to load attendance data'));
    unsubRefs.current.push(unsubAttendance);

    // Completed Courses
    const coursesQuery = query(
      collection(db, 'learnerCourses'),
      where('userId', '==', user.uid),
      where('status', '==', 'completed')
    );
    const unsubCourses = onSnapshot(coursesQuery, (snapshot) => {
      setLearnerStats(prev => ({ ...prev, completedCourses: snapshot.size }));
    }, (err) => setError('Failed to load courses data'));
    unsubRefs.current.push(unsubCourses);

    // Certificates
    const certsQuery = query(
      collection(db, 'certificates'),
      where('userId', '==', user.uid),
      where('status', '==', 'issued')
    );
    const unsubCerts = onSnapshot(certsQuery, (snapshot) => {
      setLearnerStats(prev => ({ ...prev, certificates: snapshot.size }));
    }, (err) => setError('Failed to load certificates data'));
    unsubRefs.current.push(unsubCerts);

    // Upcoming Classes
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const classesQuery = query(
      collection(db, 'classSessions'),
      where('date', '>=', today),
      where('date', '<=', nextMonth),
      where('participants', 'array-contains', user.uid),
      orderBy('date', 'asc')
    );
    const unsubClasses = onSnapshot(classesQuery, (snapshot) => {
      setUpcomingClasses(snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const classDate = data.date.toDate();
        return {
          id: docSnap.id,
          title: data.title,
          date: classDate.toLocaleDateString(),
          time: classDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: data.location,
          instructor: data.instructor,
          type: data.type || 'training',
          status: data.status || 'scheduled'
        };
      }));
      setLearnerStats(prev => ({ ...prev, upcomingClasses: snapshot.size }));
    }, (err) => setError('Failed to load classes data'));
    unsubRefs.current.push(unsubClasses);

    // Leave Requests
    const leaveQuery = query(
      collection(db, 'leaveRequests'),
      where('userId', '==', user.uid),
      orderBy('submittedAt', 'desc'),
      limit(3)
    );
    const unsubLeave = onSnapshot(leaveQuery, (snapshot) => {
      setLearnerStats(prev => ({ ...prev, leaveRequests: snapshot.size }));
      const leaveActs = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const submittedAt = data.submittedAt.toDate();
        const status: RecentActivity['status'] = data.status === 'approved' ? 'success' : data.status === 'rejected' ? 'error' : 'pending';
        return {
          id: docSnap.id,
          type: 'leave_request',
          title: `Leave request ${data.status}`,
          description: `${data.type} leave for ${data.days} day(s) - ${data.reason}`,
          timestamp: submittedAt,
          status
        } as RecentActivity;
      });
      setRecentActivity(prev => {
        // Merge with other activities
        return [
          ...prev.filter(a => a.type !== 'leave_request'),
          ...leaveActs
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
      });
    }, (err) => setError('Failed to load leave requests'));
    unsubRefs.current.push(unsubLeave);

    // Pending Documents
    const docsQuery = query(
      collection(db, 'documents'),
      where('userId', '==', user.uid),
      where('status', '==', 'pending'),
      orderBy('uploadedAt', 'desc'),
      limit(3)
    );
    const unsubDocs = onSnapshot(docsQuery, (snapshot) => {
      setLearnerStats(prev => ({ ...prev, pendingDocuments: snapshot.size }));
      const docActs = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const uploadedAt = data.uploadedAt.toDate();
        const status: RecentActivity['status'] = data.status === 'approved' ? 'success' : data.status === 'rejected' ? 'error' : 'pending';
        return {
          id: docSnap.id,
          type: 'document_upload',
          title: `Document ${data.status}`,
          description: `Uploaded ${data.name} - ${data.status}`,
          timestamp: uploadedAt,
          status
        } as RecentActivity;
      });
      setRecentActivity(prev => {
        // Merge with other activities
        return [
          ...prev.filter(a => a.type !== 'document_upload'),
          ...docActs
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
      });
    }, (err) => setError('Failed to load documents'));
    unsubRefs.current.push(unsubDocs);

    // Placement Status
    let unsubPlacement: any = null;
    (async () => {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      if (userData?.placementId) {
        const placementRef = doc(db, 'placements', userData.placementId);
        unsubPlacement = onSnapshot(placementRef, (placementDoc) => {
          if (placementDoc.exists()) {
            const placementData = placementDoc.data();
            setLearnerStats(prev => ({ ...prev, placementStatus: placementData.status || 'active' }));
            setPlacementInfo({ ...(placementData as PlacementInfo), id: placementDoc.id } as PlacementInfo);
          } else {
            setLearnerStats(prev => ({ ...prev, placementStatus: 'inactive' }));
            setPlacementInfo(null);
          }
        }, (err) => setError('Failed to load placement info'));
        unsubRefs.current.push(unsubPlacement);
      } else {
        setLearnerStats(prev => ({ ...prev, placementStatus: 'inactive' }));
        setPlacementInfo(null);
      }
    })();

    setIsLoading(false);
    setIsRefreshing(false);
    return () => {
      unsubRefs.current.forEach(unsub => unsub && unsub());
      unsubRefs.current = [];
    };
  }, [user]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
    toast.info('Dashboard refreshed');
  }

  const [quickActionLoading, setQuickActionLoading] = useState<string | null>(null);
  const handleQuickAction = async (action: string) => {
    setQuickActionLoading(action);
    try {
      switch (action) {
        case 'checkin':
          toast.info('Navigating to Check-In...');
          router.push('/learner/check-in');
          break;
        case 'leave':
          toast.info('Navigating to Leave Request...');
          router.push('/learner/leave');
          break;
        case 'documents':
          toast.info('Navigating to Documents...');
          router.push('/learner/documents');
          break;
        case 'profile':
          toast.info('Navigating to Profile...');
          router.push('/learner/profile');
          break;
        default:
          break;
      }
    } catch (err) {
      toast.error('Failed to perform action.');
    } finally {
      setTimeout(() => setQuickActionLoading(null), 800);
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
    );
  }

  return (
    <AdminLayout userRole="learner">
      <div className="space-y-6">
        {/* Dashboard Customization Button */}
        <div className="flex justify-end">
          <button
            className="flex items-center gap-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium border border-gray-200 shadow-sm"
            onClick={() => setShowPrefs(v => !v)}
            aria-label="Customize dashboard widgets"
          >
            <Settings className="h-4 w-4" />
            Customize
          </button>
        </div>
        {showPrefs && (
          <div className="mb-4 p-4 bg-white border rounded shadow-sm animate-in fade-in duration-300">
            <div className="font-semibold mb-2 text-gray-700">Show/Hide Dashboard Widgets</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'welcome', label: 'Welcome Card' },
                { key: 'notifications', label: 'Notifications' },
                { key: 'wilProgress', label: 'WIL Progress' },
                { key: 'activity', label: 'Recent Activity' },
                { key: 'placement', label: 'Placement Info' },
                { key: 'quickActions', label: 'Quick Actions' },
                { key: 'upcomingClasses', label: 'Upcoming Classes' },
                { key: 'aiMentor', label: 'AI Career Mentor' },
              ].map(w => (
                <label key={w.key} className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={prefs[w.key as keyof typeof prefs] !== false}
                    onChange={e => setWidgetVisible(w.key as import('@/hooks/useLearnerDashboardPrefs').LearnerDashboardWidget, e.target.checked)}
                  />
                  {w.label}
                </label>
              ))}
            </div>
          </div>
        )}
        {/* Header with Refresh Button */}
        <header className="flex items-center justify-between" role="banner">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900" tabIndex={0} aria-label="Learner Dashboard">Learner Dashboard</h1>
            <p className="text-gray-600" tabIndex={0}>Track your WIL progress and manage your learning journey</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </Button>
        </header>
        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* Welcome Card */}
        {prefs.welcome !== false && (
          <WelcomeCard 
            userName={user?.displayName || "Learner"} 
            userRole="learner" 
            className="mb-6 animate-in slide-in-from-bottom duration-1000 delay-200 ease-out"
          />
        )}
        {/* Learner Notifications Panel */}
        {prefs.notifications !== false && (
          <LearnerNotificationsPanel 
            notifications={notifications as any}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        )}
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 animate-in slide-in-from-bottom duration-1000 delay-300 ease-out">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Work Hours</p>
                <p className="text-2xl font-bold text-gray-900">{learnerStats.workHours}</p>
                <p className="text-xs text-gray-500">of {learnerStats.targetHours} target</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-2xl font-bold text-gray-900">{learnerStats.completedCourses}</p>
                <p className="text-xs text-gray-500">completed</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{learnerStats.certificates}</p>
                <p className="text-xs text-gray-500">earned</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Placement</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{learnerStats.placementStatus}</p>
                <p className="text-xs text-gray-500">status</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>
        {/* Monthly Hours Progress */}
        <MonthlyHoursProgress 
          loggedHours={monthlyHours}
          targetHours={learnerStats.targetHours}
          className="animate-in slide-in-from-bottom duration-1000 delay-700 ease-out"
        />
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in slide-in-from-bottom duration-1000 delay-500 ease-out">
          {/* Recent Activity */}
          {prefs.activity !== false && (
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                          <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                          <p className="text-xs text-gray-400">{activity.timestamp.toLocaleDateString()}</p>
                        </div>
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
          )}

          {/* Placement Information */}
          {prefs.placement !== false && (
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span>Placement Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {placementInfo ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{placementInfo.companyName}</p>
                      <p className="text-xs text-gray-500">{placementInfo.position}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={placementInfo.status === 'active' ? 'default' : 'secondary'}>
                        {placementInfo.status}
                      </Badge>
                      {placementInfo.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleReportStipendIssue}
                          className="text-xs"
                        >
                          Report Issue
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No placement assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          {prefs.quickActions !== false && (
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleQuickAction('checkin')}
                    disabled={quickActionLoading === 'checkin'}
                    className="text-xs"
                  >
                    {quickActionLoading === 'checkin' ? 'Loading...' : 'Check In'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickAction('leave')}
                    disabled={quickActionLoading === 'leave'}
                    className="text-xs"
                  >
                    {quickActionLoading === 'leave' ? 'Loading...' : 'Leave Request'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickAction('documents')}
                    disabled={quickActionLoading === 'documents'}
                    className="text-xs"
                  >
                    {quickActionLoading === 'documents' ? 'Loading...' : 'Documents'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickAction('profile')}
                    disabled={quickActionLoading === 'profile'}
                    className="text-xs"
                  >
                    {quickActionLoading === 'profile' ? 'Loading...' : 'Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        {/* Upcoming Training Sessions */}
        {prefs.upcomingClasses !== false && (
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
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-2 md:space-y-0">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{classSession.title}</h4>
                          <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4 mt-2 text-xs sm:text-sm text-gray-600">
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
        )}
        {/* AI Support Chatbot */}
        <AiChatbot />
      </div>
    </AdminLayout>
  );
}