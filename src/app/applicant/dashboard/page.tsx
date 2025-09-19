'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore'
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  TrendingUp,
  Award,
  Download,
  Eye,
  RefreshCw,
  Wifi,
  WifiOff,
  Zap,
  Target,
  BarChart3,
  Activity,
  Bell,
  Star,
  Sparkles,
  Globe,
  Shield,
  Heart,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  X,
  Check,
  AlertTriangle,
  Info,
  ExternalLink,
  Settings,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Timer,
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  DollarSign,
  PieChart,
  LineChart,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  RotateCcw,
  Play,
  Pause,
  Square,
  Circle,
  Square as SquareIcon,
  Circle as CircleIcon,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  Diamond,
  Heart as HeartIcon,
  Star as StarIcon,
  Zap as ZapIcon,
  Target as TargetIcon,
  Globe as GlobeIcon,
  Shield as ShieldIcon,
  Building2 as Building2Icon,
  GraduationCap as GraduationCapIcon,
  Briefcase as BriefcaseIcon,
  DollarSign as DollarSignIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart3 as BarChart3Icon,
  Activity as ActivityIcon,
  Bell as BellIcon,
  MessageCircle as MessageCircleIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  MapPin as MapPinIcon,
  Timer as TimerIcon,
  Users as UsersIcon,
  Settings as SettingsIcon,
  ExternalLink as ExternalLinkIcon,
  Info as InfoIcon,
  AlertTriangle as AlertTriangleIcon,
  Check as CheckIcon,
  X as XIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  ArrowRight as ArrowRightIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  RotateCcw as RotateCcwIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Square as SquareIconIcon,
  Circle as CircleIconIcon,
  Triangle as TriangleIcon,
  Hexagon as HexagonIcon,
  Octagon as OctagonIcon,
  Pentagon as PentagonIcon,
  Diamond as DiamondIcon
} from 'lucide-react'

interface Document {
  name: string
  status: 'uploaded' | 'pending' | 'rejected' | 'approved'
  required: boolean
  uploadedAt?: string
  url?: string
  rejectionReason?: string
}

interface Activity {
  id: string
  action: string
  timestamp: string
  type: 'document' | 'status' | 'review' | 'notification'
}

interface TimelineStep {
  step: string
  date: string
  status: 'completed' | 'in-progress' | 'upcoming' | 'pending'
}

export default function ApplicantDashboardPage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userApplication, setUserApplication] = useState<any>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [timeline, setTimeline] = useState<TimelineStep[]>([])
  const [applicantStats, setApplicantStats] = useState({
    applicationProgress: 0,
    documentsUploaded: 0,
    totalDocuments: 0,
    daysSinceApplication: 0,
    nextStep: 'Application Submitted'
  })
  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login/user')
    }
  }, [user, authLoading, router])

  // Fetch user application data
  useEffect(() => {
    if (!user) return

    const fetchApplicationData = async () => {
      try {
        setLoading(true)
        
        // Fetch user application data
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUserApplication(userData)
          
          // Calculate application progress
          const requiredDocs = ['certifiedId', 'proofOfAddress', 'highestQualification', 'proofOfBanking', 'taxNumber']
          const uploadedDocs = Object.keys(userData.documents || {}).filter(
            key => userData.documents[key]?.status === 'uploaded'
          ).length
          let progress = 0;
          if (requiredDocs.length > 0) {
            progress = Math.round((uploadedDocs / requiredDocs.length) * 100)
            if (!isFinite(progress) || isNaN(progress)) progress = 0;
            if (progress < 0) progress = 0;
            if (progress > 100) progress = 100;
          }
          
          // Calculate days since application
          const applicationDate = userData.createdAt?.toDate() || new Date()
          const daysSince = Math.floor((new Date().getTime() - applicationDate.getTime()) / (1000 * 60 * 60 * 24))
          
          setApplicantStats({
            applicationProgress: progress,
            documentsUploaded: uploadedDocs,
            totalDocuments: requiredDocs.length,
            daysSinceApplication: daysSince,
            nextStep: getNextStep(userData.status, progress)
          })
          
          // Set up documents
          const docs: Document[] = [
            { 
              name: 'Certified ID', 
              status: userData.documents?.certifiedId?.status || 'pending', 
              required: true,
              uploadedAt: userData.documents?.certifiedId?.uploadedAt,
              url: userData.documents?.certifiedId?.url,
              rejectionReason: userData.documents?.certifiedId?.rejectionReason
            },
            { 
              name: 'Proof of Address', 
              status: userData.documents?.proofOfAddress?.status || 'pending', 
              required: true,
              uploadedAt: userData.documents?.proofOfAddress?.uploadedAt,
              url: userData.documents?.proofOfAddress?.url,
              rejectionReason: userData.documents?.proofOfAddress?.rejectionReason
            },
            { 
              name: 'Highest Qualification Certificate', 
              status: userData.documents?.highestQualification?.status || 'pending', 
              required: true,
              uploadedAt: userData.documents?.highestQualification?.uploadedAt,
              url: userData.documents?.highestQualification?.url,
              rejectionReason: userData.documents?.highestQualification?.rejectionReason
            },
            { 
              name: 'Proof of Banking', 
              status: userData.documents?.proofOfBanking?.status || 'pending', 
              required: true,
              uploadedAt: userData.documents?.proofOfBanking?.uploadedAt,
              url: userData.documents?.proofOfBanking?.url,
              rejectionReason: userData.documents?.proofOfBanking?.rejectionReason
            },
            { 
              name: 'Tax Number', 
              status: userData.documents?.taxNumber?.status || 'pending', 
              required: true,
              uploadedAt: userData.documents?.taxNumber?.uploadedAt,
              url: userData.documents?.taxNumber?.url,
              rejectionReason: userData.documents?.taxNumber?.rejectionReason
            }
          ]
          setDocuments(docs)
          
          // Set up timeline
          const timelineSteps: TimelineStep[] = [
            { step: 'Application Submitted', date: applicationDate.toLocaleDateString(), status: 'completed' },
            { step: 'Documents Under Review', date: '', status: progress > 0 ? 'in-progress' : 'upcoming' },
            { step: 'Document Verification', date: '', status: 'upcoming' },
            { step: 'Final Decision', date: '', status: 'pending' }
          ]
          setTimeline(timelineSteps)
        }
      } catch (error) {
        console.error('Error fetching application data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplicationData()
  }, [user])

  // Set up real-time activity and notifications updates
  useEffect(() => {
    if (!user) return

    // Activities
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
      const activities: Activity[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[]
      setRecentActivity(activities)
    })

    // Notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    return () => {
      unsubscribeActivities()
      unsubscribeNotifications()
    }
  }, [user])
  // Mark notifications as read
  const markNotificationsRead = async () => {
    if (!user) return
    const unread = notifications.filter(n => !n.read)
    for (const n of unread) {
      await updateDoc(doc(db, 'notifications', n.id), { read: true })
    }
  }

  // Helper function to safely calculate progress percentage
  const calculateProgress = (uploaded: number, total: number) => {
    if (total <= 0) return 0;
    const progress = Math.round((uploaded / total) * 100);
    return isFinite(progress) && !isNaN(progress) ? Math.min(Math.max(progress, 0), 100) : 0;
  }

  const getNextStep = (status: string, progress: number) => {
    if (progress < 100) return 'Complete Document Upload'
    if (status === 'pending_review') return 'Document Review'
    if (status === 'under_review') return 'Document Verification'
    if (status === 'approved') return 'Application Approved'
    if (status === 'rejected') return 'Application Rejected'
    return 'Document Review'
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // Refresh logic will be handled by the useEffect
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleDocumentUpload = (documentType: string) => {
    // Navigate to document upload page
    router.push(`/applicant/upload?type=${documentType}`)
  }

  const handleViewApplication = () => {
    router.push('/applicant/application')
  }

  // Profile functionality removed

  // Helper function to safely convert dates
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'Not uploaded'
    
    try {
      // If it's a Firestore Timestamp, convert it
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate().toLocaleDateString()
      }
      // If it's already a Date object or valid date string
      return new Date(dateValue).toLocaleDateString()
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid Date'
    }
  }

  const handleDocumentStatusUpdate = async (documentType: string, status: string, rejectionReason?: string) => {
    if (!user) return

    try {
      const userRef = doc(db, 'users', user.uid)
      const updateData: any = {
        [`documents.${documentType}.status`]: status,
        [`documents.${documentType}.updatedAt`]: new Date().toISOString(),
        updatedAt: new Date()
      }

      if (rejectionReason) {
        updateData[`documents.${documentType}.rejectionReason`] = rejectionReason
      }

      await updateDoc(userRef, updateData)

      // Add activity log
      const activityRef = doc(collection(db, 'activities'))
      await updateDoc(activityRef, {
        userId: user.uid,
        action: `Document ${documentType} status updated to ${status}`,
        type: 'status',
        timestamp: new Date().toISOString(),
        createdAt: new Date()
      })

      // Refresh the page data
      handleRefresh()
    } catch (error) {
      console.error('Error updating document status:', error)
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'text-green-600'
      case 'rejected': return 'text-red-600'
      case 'approved': return 'text-blue-600'
      case 'under_review': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'approved': return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'under_review': return <Clock className="h-5 w-5 text-yellow-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  if (authLoading || loading) {
    return (
      <AdminLayout userRole="applicant">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading your dashboard...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <AdminLayout userRole="applicant">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center">
        <WelcomeCard 
          userName={user?.displayName || userData?.firstName || "Applicant"} 
          userRole="applicant" 
            className="animate-in slide-in-from-bottom duration-700 delay-300"
          />
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="animate-in slide-in-from-right duration-700 delay-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom duration-700 delay-300">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Application Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{applicantStats.applicationProgress}%</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Documents Uploaded</p>
                  <p className="text-2xl font-bold text-green-600">{applicantStats.documentsUploaded}/{applicantStats.totalDocuments}</p>
                  <p className="text-xs text-gray-500">Required docs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Days Since Application</p>
                  <p className="text-2xl font-bold text-purple-600">{applicantStats.daysSinceApplication}</p>
                  <p className="text-xs text-gray-500">Days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Next Step</p>
                  <p className="text-sm font-bold text-orange-600">Induction</p>
                  <p className="text-xs text-gray-500">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-700 delay-500">
          {/* Left Column - Application Progress and Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Progress */}
            <Card className="animate-in slide-in-from-left duration-700 delay-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Application Progress</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-semibold">{applicantStats.applicationProgress}%</span>
                  </div>
                  <Progress value={applicantStats.applicationProgress} className="h-3" />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Next Step: {applicantStats.nextStep}</h3>
                  <p className="text-sm text-blue-700">Your documents are being reviewed by our team. You'll be notified once the review is complete.</p>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push('/applicant/upload')}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="animate-in slide-in-from-left duration-700 delay-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'document' ? 'bg-green-500' :
                          activity.type === 'status' ? 'bg-blue-500' :
                          activity.type === 'review' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Documents and Quick Actions */}
          <div className="space-y-6">
            {/* Enhanced Document Status */}
            <Card className="bg-white/90 backdrop-blur-md shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-in slide-in-from-right duration-700 delay-600">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Document Status
                      </span>
                      <p className="text-sm text-gray-600">Track your document uploads</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {applicantStats.documentsUploaded}/{applicantStats.totalDocuments}
                    </div>
                    <div className="text-sm text-gray-500">uploaded</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Enhanced Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span>Document Progress</span>
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {calculateProgress(applicantStats.documentsUploaded, applicantStats.totalDocuments)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out relative"
                      style={{ 
                        width: `${calculateProgress(applicantStats.documentsUploaded, applicantStats.totalDocuments)}%` 
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{applicantStats.documentsUploaded} uploaded</span>
                    <span>{Math.max(0, applicantStats.totalDocuments - applicantStats.documentsUploaded)} remaining</span>
                  </div>
                </div>

                {/* Enhanced Documents List */}
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div key={index} className={`group relative p-4 border-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                      doc.status === 'uploaded' ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-green-100' :
                      doc.status === 'rejected' ? 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50 shadow-red-100' :
                      doc.status === 'approved' ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-blue-100' :
                      'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-yellow-100'
                    }`}>
                      {/* Status Indicator */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                        {doc.status === 'uploaded' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {doc.status === 'rejected' && <AlertCircle className="h-4 w-4 text-red-600" />}
                        {doc.status === 'approved' && <Award className="h-4 w-4 text-blue-600" />}
                        {doc.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                      </div>
                      
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              doc.status === 'uploaded' ? 'bg-green-100' :
                              doc.status === 'rejected' ? 'bg-red-100' :
                              doc.status === 'approved' ? 'bg-blue-100' :
                              'bg-yellow-100'
                            }`}>
                              {getDocumentStatusIcon(doc.status)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                              {doc.required && (
                                <Badge variant="outline" className="text-xs px-2 py-1 bg-orange-100 text-orange-800 border-orange-200">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs text-gray-500 flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {doc.uploadedAt ? `Uploaded ${formatDate(doc.uploadedAt)}` : 'Not uploaded'}
                                </span>
                              </p>
                              {doc.rejectionReason && (
                                <div className="p-3 bg-red-100 rounded-lg border border-red-200">
                                  <div className="flex items-start space-x-2">
                                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs font-semibold text-red-800">Rejection Reason:</p>
                                      <p className="text-xs text-red-700">{doc.rejectionReason}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          {/* Status Badge */}
                          <Badge 
                            className={`px-3 py-1 text-xs font-semibold shadow-sm ${
                              doc.status === 'uploaded' ? 'bg-green-100 text-green-800 border-green-200' :
                              doc.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                              doc.status === 'approved' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}
                          >
                            {doc.status === 'uploaded' ? 'Uploaded' : 
                             doc.status === 'rejected' ? 'Rejected' : 
                             doc.status === 'approved' ? 'Approved' : 'Pending'}
                          </Badge>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1">
                            {doc.status === 'uploaded' && doc.url && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(doc.url, '_blank')}
                                  className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 transition-colors"
                                  title="View document"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const link = document.createElement('a')
                                    link.href = doc.url!
                                    link.download = `${doc.name}.pdf`
                                    link.click()
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 transition-colors"
                                  title="Download document"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            {doc.status !== 'uploaded' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const documentTypeMap = {
                                    'Certified ID': 'certifiedid',
                                    'Proof of Address': 'proofofaddress',
                                    'Highest Qualification Certificate': 'highestqualification',
                                    'Proof of Banking': 'proofofbanking',
                                    'Tax Number': 'taxnumber'
                                  }
                                  handleDocumentUpload(documentTypeMap[doc.name as keyof typeof documentTypeMap] || 'certifiedid')
                                }}
                                className={`h-8 text-xs transition-all duration-200 hover:scale-105 ${
                                  doc.status === 'rejected' 
                                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                }`}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                {doc.status === 'rejected' ? 'Re-upload' : 'Upload'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Document Statistics */}
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 shadow-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h4 className="text-lg font-bold text-blue-900">Document Summary</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-blue-900">{applicantStats.totalDocuments}</div>
                      <div className="text-sm text-blue-700">Total Required</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-green-600">{applicantStats.documentsUploaded}</div>
                      <div className="text-sm text-green-700">Uploaded</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Math.max(0, applicantStats.totalDocuments - applicantStats.documentsUploaded)}
                      </div>
                      <div className="text-sm text-yellow-700">Pending</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">
                        {calculateProgress(applicantStats.documentsUploaded, applicantStats.totalDocuments)}%
                      </div>
                      <div className="text-sm text-purple-700">Progress</div>
                    </div>
                  </div>
                  
                  {/* Status Messages */}
                  {applicantStats.documentsUploaded < applicantStats.totalDocuments && (
                    <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border border-amber-200">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-amber-800">Action Required</p>
                          <p className="text-sm text-amber-700">
                            Upload all required documents to complete your application and proceed to the next stage.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {applicantStats.documentsUploaded === applicantStats.totalDocuments && (
                    <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-green-800">Complete</p>
                          <p className="text-sm text-green-700">
                            All required documents have been uploaded. Your application is ready for review.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Quick Actions */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-700">Quick Actions</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      onClick={() => router.push('/applicant/upload')}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => router.push('/applicant/status')}
                        className="text-xs hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View Status
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/applicant/profile')}
                        className="text-xs hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                      >
                        <User className="h-3 w-3 mr-1" />
                        Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="animate-in slide-in-from-right duration-700 delay-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-purple-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleViewApplication}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Application
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/applicant/status')}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Application Status
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/applicant/support')}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Get Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Application Timeline */}
        <Card className="animate-in slide-in-from-bottom duration-700 delay-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Application Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.status === 'completed' ? 'bg-green-100 text-green-600' :
                    item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600' :
                    item.status === 'upcoming' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : item.status === 'in-progress' ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.step}</p>
                    <p className="text-sm text-gray-600">{item.date}</p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {item.status === 'in-progress' ? 'In Progress' : item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Support Chatbot */}
      <AiChatbot />
    </AdminLayout>
  )
}