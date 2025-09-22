'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui/loading'
import { db } from '@/lib/firebase'
import { doc, getDoc, getDocs, collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore'
import { toast } from 'sonner'
import { ProgramService } from '@/lib/program-service'
import { ApplicationTimelineService, ApplicationTimeline } from '@/lib/application-timeline-service'
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
  id: string
  name: string
  type: 'certifiedId' | 'proofOfAddress' | 'highestQualification' | 'proofOfBanking' | 'taxNumber'
  status: 'pending' | 'approved' | 'rejected'
  url?: string
  uploadedAt: string
  size?: string
  fileType?: string
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

interface ApplicantData {
  id: string
  firstName: string
  lastName: string
  email: string
  program: string
  status: 'pending-review' | 'document-review' | 'approved' | 'rejected' | 'waitlisted'
  documentStatus?: {
    certifiedId: 'pending' | 'approved' | 'rejected'
    proofOfAddress: 'pending' | 'approved' | 'rejected'
    highestQualification: 'pending' | 'approved' | 'rejected'
    proofOfBanking: 'pending' | 'approved' | 'rejected'
    taxNumber: 'pending' | 'approved' | 'rejected'
  }
  createdAt: string
  updatedAt: string
}

// Document types mapping (matching admin system)
const documentTypes = {
  certifiedId: {
    name: 'Certified ID Copy',
    description: 'Government-issued ID with certification stamp',
    icon: User,
    color: 'bg-blue-100 text-blue-600'
  },
  proofOfAddress: {
    name: 'Proof of Address',
    description: 'Utility bill or bank statement (not older than 3 months)',
    icon: MapPin,
    color: 'bg-green-100 text-green-600'
  },
  highestQualification: {
    name: 'Educational Qualifications',
    description: 'Certificates and transcripts',
    icon: GraduationCap,
    color: 'bg-purple-100 text-purple-600'
  },
  proofOfBanking: {
    name: 'Proof of Banking',
    description: 'Bank statement or letter from bank',
    icon: Building2,
    color: 'bg-orange-100 text-orange-600'
  },
  taxNumber: {
    name: 'Tax Number',
    description: 'SARS tax number certificate',
    icon: FileText,
    color: 'bg-red-100 text-red-600'
  }
}

export default function ApplicantDashboardPage() {
  const router = useRouter()
  const { user, loading, role, userData } = useAuth()
  const [applicantData, setApplicantData] = useState<ApplicantData | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [programName, setProgramName] = useState<string>('')
  const [timeline, setTimeline] = useState<ApplicationTimeline | null>(null)

  // Helper: format date
  function formatDate(date: string | Date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  }

  // Helper: get document status icon
  function getDocumentStatusIcon(status: string) {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  }

  // Helper: get status badge
  function getStatusBadge(status: string) {
    // Normalize status to handle both underscore and hyphen formats
    const normalizedStatus = status.replace(/_/g, '-')
    
    switch (normalizedStatus) {
      case 'approved':
        return <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 px-4 py-2 rounded-full font-semibold shadow-sm">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 px-4 py-2 rounded-full font-semibold shadow-sm">Rejected</Badge>
      case 'pending-review':
        return <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200 px-4 py-2 rounded-full font-semibold shadow-sm">Pending Review</Badge>
      case 'document-review':
        return <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200 px-4 py-2 rounded-full font-semibold shadow-sm">Document Review</Badge>
      case 'waitlisted':
        return <Badge className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200 px-4 py-2 rounded-full font-semibold shadow-sm">Waitlisted</Badge>
      case 'pending':
        return <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200 px-4 py-2 rounded-full font-semibold shadow-sm">Pending</Badge>
      default:
        console.log('Unknown status:', status, 'normalized to:', normalizedStatus)
        return <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200 px-4 py-2 rounded-full font-semibold shadow-sm">Pending Review</Badge>
    }
  }

  // Fetch applicant data
  const fetchApplicantData = async () => {
    if (!user) return

    try {
      console.log('🔄 Starting to fetch applicant data for user:', user.uid)
      setIsLoadingData(true)
      
      // Fetch applicant data from users collection
      console.log('📋 Fetching user document...')
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      let applicantProgram = ''
      if (userDoc.exists()) {
        const data = userDoc.data()
        applicantProgram = data.program || ''
        console.log('✅ User data found:', { 
          firstName: data.firstName, 
          lastName: data.lastName, 
          program: data.program, 
          status: data.status 
        })
        setApplicantData({
          id: userDoc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          program: data.program || '',
          status: data.status || 'pending-review',
          documentStatus: data.documentStatus || {},
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        })
      } else {
        console.log('❌ User document not found')
      }

      // Fetch documents from documents collection
      console.log('📄 Fetching documents...')
      const documentsQuery = query(
        collection(db, 'documents'),
        where('userId', '==', user.uid),
        orderBy('uploadedAt', 'desc')
      )
      
      const documentsSnapshot = await getDocs(documentsQuery)
      console.log('📄 Documents found:', documentsSnapshot.size)
      const docs = documentsSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        name: doc.data().fileName || '',
        type: doc.data().documentType || '',
        status: doc.data().status || 'pending',
        url: doc.data().downloadUrl || '',
        uploadedAt: doc.data().uploadedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        size: doc.data().fileSize ? `${Math.round(doc.data().fileSize / 1024)} KB` : '',
        fileType: doc.data().fileType || '',
        rejectionReason: doc.data().rejectionReason || ''
      })) as Document[]
      
      setDocuments(docs)

      // Fetch recent activities/notifications
      console.log('🔔 Fetching activities...')
      const activitiesQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
      
      const activitiesSnapshot = await getDocs(activitiesQuery)
      console.log('🔔 Activities found:', activitiesSnapshot.size)
      const activities = activitiesSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        action: doc.data().message || '',
        timestamp: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        type: doc.data().type || 'notification'
      })) as Activity[]
      
      setActivities(activities)

      // Fetch program name if applicant has a program
      if (applicantProgram) {
        console.log('🎓 Fetching program name for:', applicantProgram)
        try {
          const programName = await ProgramService.getProgramName(applicantProgram)
          console.log('✅ Program name fetched:', programName)
          setProgramName(programName)
        } catch (error) {
          console.error('❌ Error fetching program name:', error)
          setProgramName(applicantProgram) // Fallback to ID if name fetch fails
        }
      } else {
        console.log('ℹ️ No program assigned to applicant')
        // If no program, set empty string
        setProgramName('')
      }
      
      // Generate timeline based on application status and document status
      if (applicantData) {
        console.log('📅 Generating application timeline...')
        const applicationDate = new Date(applicantData.createdAt)
        const lastUpdate = new Date(applicantData.updatedAt)
        
        const generatedTimeline = ApplicationTimelineService.generateTimeline(
          applicantData.status,
          applicantData.documentStatus || {},
          applicationDate,
          lastUpdate
        )
        
        console.log('📅 Timeline generated:', generatedTimeline)
        setTimeline(generatedTimeline)
      }

      console.log('✅ Dashboard data loaded successfully')

    } catch (error) {
      console.error('Error fetching applicant data:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId: user?.uid
      })
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoadingData(false)
    }
  }

  // Handle document upload
  function handleDocumentUpload(type: string) {
    router.push(`/applicant/upload?type=${type}`)
  }

  // Handle view application
  function handleViewApplication() {
    router.push('/applicant/application')
  }

  // Handle refresh
  function handleRefresh() {
    fetchApplicantData()
    toast.success('Dashboard refreshed')
  }

  // Calculate application progress
  const calculateProgress = () => {
    if (!applicantData?.documentStatus) return 0
    
    const totalDocs = 5
    const approvedDocs = Object.values(applicantData.documentStatus).filter(status => status === 'approved').length
    return Math.round((approvedDocs / totalDocs) * 100)
  }

  // Get required documents with current status
  const getRequiredDocuments = () => {
    const requiredDocTypes = ['certifiedId', 'proofOfAddress', 'highestQualification', 'proofOfBanking', 'taxNumber']
    
    return requiredDocTypes.map(docType => {
      const docTypeInfo = documentTypes[docType as keyof typeof documentTypes]
      const uploadedDoc = documents.find(doc => doc.type === docType)
      const status = applicantData?.documentStatus?.[docType as keyof typeof applicantData.documentStatus] || 'pending'
      
      return {
        type: docType,
        name: docTypeInfo.name,
        description: docTypeInfo.description,
        icon: docTypeInfo.icon,
        color: docTypeInfo.color,
        status: uploadedDoc ? status : 'pending',
        uploadedAt: uploadedDoc?.uploadedAt,
        url: uploadedDoc?.url,
        rejectionReason: uploadedDoc?.rejectionReason
      }
    })
  }

  // Redirect if not authenticated or not an applicant
  useEffect(() => {
    if (!loading && (!user || role !== 'applicant')) {
      router.push('/login')
    }
  }, [user, loading, role, router])

  // Fetch data when component mounts
  useEffect(() => {
    if (user && role === 'applicant') {
      fetchApplicantData()
    }
  }, [user, role])

  if (loading || isLoadingData) {
    return <PageLoader message="Loading your dashboard..." />
  }

  if (!user || role !== 'applicant') {
    return null
  }

  const progress = calculateProgress()
  const requiredDocuments = getRequiredDocuments()

  return (
    <AdminLayout userRole="applicant">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="space-y-8 p-6">
          {/* Welcome Section - Keep as requested */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {applicantData?.firstName || userData?.firstName || 'Applicant'}!</h1>
            <p className="text-blue-100">Track your application progress and manage your documents</p>
          </div>

          {/* Application Status - Enhanced AppEver Design */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
              <CardTitle className="flex items-center text-xl font-bold">
                <div className="p-2 bg-white/20 rounded-xl mr-3">
                  <FileText className="w-6 h-6" />
                </div>
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl">
                  <span className="font-semibold text-slate-700">Current Status</span>
                  {applicantData?.status && getStatusBadge(applicantData.status)}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-slate-600">
                    <span>Application Progress</span>
                    <span className="text-indigo-600">{progress}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={progress} className="h-3 bg-slate-200 rounded-full" />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-20"></div>
                  </div>
                </div>
                {applicantData?.program && (
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                    <div className="text-sm text-slate-700">
                      <span className="font-semibold text-emerald-700">Program:</span> 
                      <span className="ml-2 text-slate-600">{programName || 'Loading...'}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Required Documents - Enhanced AppEver Design */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6">
              <CardTitle className="flex items-center text-xl font-bold">
                <div className="p-2 bg-white/20 rounded-xl mr-3">
                  <Upload className="w-6 h-6" />
                </div>
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {requiredDocuments.map((doc, index) => {
                  const IconComponent = doc.icon
                  return (
                    <div key={index} className="group relative overflow-hidden bg-gradient-to-r from-white to-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-2xl ${doc.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getDocumentStatusIcon(doc.status)}
                              <span className="font-semibold text-slate-800 text-lg">{doc.name}</span>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                                doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{doc.description}</p>
                            {doc.rejectionReason && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-700">
                                  <strong>Rejection reason:</strong> {doc.rejectionReason}
                                </p>
                              </div>
                            )}
                            {doc.uploadedAt && (
                              <p className="text-xs text-slate-500">
                                Uploaded: {formatDate(doc.uploadedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.status === 'approved' ? (
                            <Button size="sm" variant="outline" disabled className="bg-green-50 border-green-200 text-green-700 hover:bg-green-50">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approved
                            </Button>
                          ) : doc.url ? (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(doc.url, '_blank')}
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleDocumentUpload(doc.type)}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Replace
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => handleDocumentUpload(doc.type)}
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Enhanced AppEver Design */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Application Timeline */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl mr-3">
                    <Calendar className="w-6 h-6" />
                  </div>
                  Application Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {timeline ? (
                    <>
                      {/* Timeline Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-3 font-semibold text-slate-700">
                          <span>Application Progress</span>
                          <span className="text-purple-600">{timeline.progress}%</span>
                        </div>
                        <div className="relative">
                          <Progress value={timeline.progress} className="h-4 bg-slate-200 rounded-full" />
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full opacity-30"></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                          Step {timeline.currentStep} of {timeline.totalSteps}
                        </p>
                      </div>

                      {/* Timeline Events */}
                      <div className="space-y-4">
                        {timeline.events.map((event, index) => (
                          <div key={event.id} className="group relative">
                            <div className="flex items-start space-x-4">
                              <div className={`w-4 h-4 rounded-full mt-2 shadow-lg ${
                                event.status === 'completed' ? 'bg-green-500 ring-4 ring-green-200' :
                                event.status === 'in-progress' ? 'bg-blue-500 ring-4 ring-blue-200' :
                                event.status === 'upcoming' ? 'bg-yellow-500 ring-4 ring-yellow-200' :
                                'bg-gray-300 ring-4 ring-gray-200'
                              }`} />
                              <div className="flex-1 min-w-0 bg-gradient-to-r from-white to-slate-50 rounded-2xl p-4 border border-slate-200 group-hover:shadow-md transition-all duration-300">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="text-2xl">
                                    {ApplicationTimelineService.getTimelineIcon(event.type)}
                                  </span>
                                  <span className="font-semibold text-slate-800">{event.title}</span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${ApplicationTimelineService.getTimelineColor(event.status)}`}>
                                    {event.status.replace('-', ' ')}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                                <p className="text-xs text-slate-500">
                                  {formatDate(event.timestamp)}
                                </p>
                                {event.metadata?.notes && (
                                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-xl">
                                    <p className="text-xs text-blue-700 italic">
                                      Note: {event.metadata.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Next Step */}
                      {timeline.nextStep && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-blue-900">Next Step</span>
                          </div>
                          <p className="text-sm text-blue-800 mt-2 font-medium">{timeline.nextStep.title}</p>
                          <p className="text-xs text-blue-600 mt-1">{timeline.nextStep.description}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-purple-600" />
                      </div>
                      <p className="text-sm text-slate-500">Loading timeline...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
                <CardTitle className="flex items-center text-xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl mr-3">
                    <Bell className="w-6 h-6" />
                  </div>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div key={activity.id || index} className="group relative">
                        <div className="flex items-start space-x-4">
                          <div className={`w-3 h-3 rounded-full mt-2 shadow-lg ${
                            activity.type === 'document' ? 'bg-green-500 ring-4 ring-green-200' :
                            activity.type === 'status' ? 'bg-blue-500 ring-4 ring-blue-200' :
                            activity.type === 'review' ? 'bg-purple-500 ring-4 ring-purple-200' :
                            'bg-gray-500 ring-4 ring-gray-200'
                          }`} />
                          <div className="flex-1 bg-gradient-to-r from-white to-slate-50 rounded-2xl p-4 border border-slate-200 group-hover:shadow-md transition-all duration-300">
                            <p className="text-sm font-semibold text-slate-800 mb-1">{activity.action}</p>
                            <p className="text-xs text-slate-500">{formatDate(activity.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-orange-600" />
                      </div>
                      <p className="text-sm text-slate-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons - Enhanced AppEver Design */}
          <div className="flex flex-col sm:flex-row gap-6">
            <Button 
              onClick={handleViewApplication} 
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <FileText className="w-5 h-5 mr-3" />
              View Full Application
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              className="flex-1 bg-white/80 backdrop-blur-sm border-2 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5 mr-3" />
              Refresh Status
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}