'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Bot,
  Brain,
  Activity,
  BarChart3,
  RefreshCw,
  Download,
  UserCheck,
  UserX,
  BookOpen,
  Award,
  MessageSquare,
  Shield,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  MoreVertical,
  Trash2,
  Copy,
  Share,
  Play,
  Pause,
  Square,
  Settings,
  Database,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Monitor,
  Smartphone,
  Tablet,
  Lock,
  Unlock,
  Key,
  Globe,
  Bell,
  Info,
  FileText,
  Upload
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, updateDoc, doc, onSnapshot } from 'firebase/firestore'
import { toast as sonnerToast } from 'sonner'

interface Learner {
  id: string
  firstName: string
  lastName: string
  email: string
  status: 'active' | 'inactive' | 'graduated'
  program: string
  createdAt: string
  lastLoginAt?: string
  profile?: {
    location?: string
    avatar?: string
    bio?: string
    experience?: string
    education?: string
  }
  progress?: {
    totalHours: number
    completedHours: number
    completionRate: number
    attendanceRate: number
    lastActivity?: string
  }
  riskFactors?: {
    dropoutRisk: 'low' | 'medium' | 'high'
    attendanceIssues: boolean
    assignmentDelays: boolean
    personalIssues: boolean
    lastSeenDays: number
    activityScore: number
    engagementScore: number
  }
  placement?: {
    companyName?: string
    startDate?: string
    endDate?: string
    supervisor?: string
    status?: string
  }
  recentActivities?: any[]
}

interface Program {
  id: string
  name: string
  description: string
}

interface LearnerStats {
  total: number
  active: number
  inactive: number
  graduated: number
  averageProgress: number
  newThisMonth: number
}

export default function AdminLearnersPage() {
  const [learners, setLearners] = useState<Learner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [programFilter, setProgramFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [placementFilter, setPlacementFilter] = useState('all')
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRiskAnalysisModal, setShowRiskAnalysisModal] = useState(false)
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [stats, setStats] = useState<LearnerStats>({
    total: 0,
    active: 0,
    inactive: 0,
    graduated: 0,
    averageProgress: 0,
    newThisMonth: 0
  })

  useEffect(() => {
    loadLearners()
    loadPrograms()
    
    // Set up real-time updates using Firebase onSnapshot
    const unsubscribeLearners = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'learner')),
      (snapshot) => {
        console.log('Real-time learners update received')
        loadLearners()
      },
      (error) => {
        console.error('Error in real-time learners subscription:', error)
      }
    )
    
    // Set up real-time updates for progress data
    const unsubscribeProgress = onSnapshot(
      collection(db, 'learnerProgress'),
      (snapshot) => {
        console.log('Real-time progress update received')
        loadLearners()
      },
      (error) => {
        console.error('Error in real-time progress subscription:', error)
      }
    )
    
    // Set up real-time updates for activities
    const unsubscribeActivities = onSnapshot(
      collection(db, 'learnerActivities'),
      (snapshot) => {
        console.log('Real-time activities update received')
        loadLearners()
      },
      (error) => {
        console.error('Error in real-time activities subscription:', error)
      }
    )
    
    // Set up real-time updates for programs
    const unsubscribePrograms = onSnapshot(
      collection(db, 'programs'),
      (snapshot) => {
        console.log('Real-time programs update received')
        loadPrograms()
      },
      (error) => {
        console.error('Error in real-time programs subscription:', error)
      }
    )
    
    // Fallback interval for additional data
    const interval = setInterval(() => {
      loadLearners()
      loadPrograms()
    }, 60000) // Refresh every minute as fallback
    
    return () => {
      unsubscribeLearners()
      unsubscribeProgress()
      unsubscribeActivities()
      unsubscribePrograms()
      clearInterval(interval)
    }
  }, [])

  const loadPrograms = async () => {
    try {
      console.log('🔍 Attempting to fetch programs from Firestore...')
      // Try to fetch from programs collection first
      const programsSnapshot = await getDocs(collection(db, 'programs'))
      
      console.log('📊 Programs snapshot:', {
        empty: programsSnapshot.empty,
        size: programsSnapshot.size,
        docs: programsSnapshot.docs.length
      })
      
      if (!programsSnapshot.empty) {
        const programsData = programsSnapshot.docs.map(doc => {
          const data = doc.data()
          console.log('📋 Program document:', { id: doc.id, data })
          return {
            id: doc.id,
            ...data
          }
        }) as Program[]
        
        console.log('✅ Programs data loaded:', programsData)
        
        const programNames = programsData.map(program => program.name || program.id)
        console.log('📝 Program names extracted:', programNames)
        
        setAvailablePrograms(programNames)
        setPrograms(programsData)
      } else {
        console.log('⚠️ Programs collection is empty')
      }
    } catch (error) {
      console.error('❌ Error fetching programs:', error)
      console.log('Programs collection not found, will use learner data for programs')
      // If programs collection doesn't exist, we'll rely on the programs extracted from learners
    }
  }

  const loadLearners = async () => {
    try {
      setLoading(true)
      
      // Fetch learners with real-time data
      const learnersSnapshot = await getDocs(query(
        collection(db, 'users'),
        where('role', '==', 'learner'),
        orderBy('createdAt', 'desc')
      ))

      // Fetch additional data for comprehensive learner profiles
      const [placementsSnapshot, progressSnapshot, activitiesSnapshot] = await Promise.all([
        getDocs(collection(db, 'placements')),
        getDocs(collection(db, 'learnerProgress')),
        getDocs(collection(db, 'learnerActivities'))
      ])

      const learnersData = learnersSnapshot.docs.map(doc => {
        const data = doc.data()
        const learnerId = doc.id
        
        // Find related placement data
        const placement = placementsSnapshot.docs.find(p => p.data().learnerId === learnerId)?.data()
        
        // Find progress data
        const progress = progressSnapshot.docs.find(p => p.data().learnerId === learnerId)?.data()
        
        // Find recent activities
        const recentActivities = activitiesSnapshot.docs
          .filter(a => a.data().learnerId === learnerId)
          .sort((a, b) => new Date(b.data().timestamp).getTime() - new Date(a.data().timestamp).getTime())
          .slice(0, 5)
          .map(a => a.data())
        
        // Calculate risk factors based on real data
        const riskFactors = calculateRiskFactors(data, progress, recentActivities)
        
        // Calculate real progress metrics
        const realProgress = calculateRealProgress(data, progress, recentActivities)
        
        return {
          id: learnerId,
          ...data,
          riskFactors,
          progress: realProgress,
          placement: placement ? {
            companyName: placement.companyName,
            startDate: placement.startDate,
            endDate: placement.endDate,
            supervisor: placement.supervisor,
            status: placement.status || 'active'
          } : {
            companyName: undefined,
            status: 'unplaced'
          },
          recentActivities,
          lastLoginAt: data.lastLoginAt || data.createdAt,
          profile: {
            location: data.profile?.location || 'Not specified',
            bio: data.profile?.bio || 'No bio available',
            experience: data.profile?.experience || 'No experience listed',
            education: data.profile?.education || 'No education listed',
            avatar: data.profile?.avatar
          }
        }
      }) as Learner[]

      setLearners(learnersData)
      calculateStats(learnersData)
      
      // Extract unique programs from learners data only if we don't have programs from dedicated collection
      if (availablePrograms.length === 0) {
        console.log('🔄 Extracting programs from learner data...')
        const allPrograms = learnersData.map(learner => learner.program)
        console.log('📚 All programs from learners:', allPrograms)
        
        const uniquePrograms = Array.from(new Set(allPrograms))
          .filter(program => program && program.trim() !== '')
          .sort()
        
        console.log('🎯 Unique programs extracted:', uniquePrograms)
        setAvailablePrograms(uniquePrograms)
      } else {
        console.log('✅ Using programs from dedicated collection, skipping learner extraction')
      }
    } catch (error) {
      console.error('Error loading learners:', error)
      sonnerToast.error('Failed to load learners')
    } finally {
      setLoading(false)
    }
  }

  const calculateRiskFactors = (data: any, progress: any, activities: any[]) => {
    const now = new Date()
    const lastLogin = data.lastLoginAt ? new Date(data.lastLoginAt) : new Date(data.createdAt)
    const daysSinceLastLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
    
    // Calculate real risk factors based on actual data
    const engagementLow = daysSinceLastLogin > 14
    const attendanceIssues = progress?.attendanceRate < 70 || false
    const assignmentDelays = progress?.assignmentDelays > 3 || false
    const personalIssues = activities?.some(activity => 
      activity.type === 'issue' || activity.type === 'complaint'
    ) || false
    
    // Calculate activity frequency
    const recentActivityCount = activities?.filter(activity => {
      const activityDate = new Date(activity.timestamp)
      const daysDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    }).length || 0
    
    const lowActivity = recentActivityCount < 2

    let dropoutRisk: 'low' | 'medium' | 'high' = 'low'
    
    if (engagementLow || attendanceIssues || personalIssues || lowActivity) {
      dropoutRisk = 'high'
    } else if (assignmentDelays || daysSinceLastLogin > 7 || recentActivityCount < 5) {
      dropoutRisk = 'medium'
    }

    return {
      dropoutRisk,
      attendanceIssues,
      assignmentDelays,
      personalIssues,
      lastSeenDays: daysSinceLastLogin,
      activityScore: recentActivityCount,
      engagementScore: Math.max(0, 10 - daysSinceLastLogin)
    }
  }

  const calculateRealProgress = (data: any, progress: any, activities: any[]) => {
    // Calculate real progress metrics from actual data
    const totalHours = progress?.totalHours || 480
    const completedHours = progress?.completedHours || 0
    const completionRate = totalHours > 0 ? (completedHours / totalHours) * 100 : 0
    const attendanceRate = progress?.attendanceRate || 85
    
    // Calculate last activity from recent activities
    const lastActivity = activities?.length > 0 
      ? activities[0].timestamp 
      : data.lastLoginAt || data.createdAt

    return {
      totalHours,
      completedHours: Math.round(completedHours),
      completionRate: Math.round(completionRate * 10) / 10,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      lastActivity
    }
  }

  const calculateStats = (learnersData: Learner[]) => {
    const now = new Date()
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const newStats = {
      total: learnersData.length,
      active: learnersData.filter(l => l.status === 'active').length,
      inactive: learnersData.filter(l => l.status === 'inactive').length,
      graduated: learnersData.filter(l => l.status === 'graduated').length,
      averageProgress: learnersData.reduce((sum, l) => sum + (l.progress?.completedHours || 0), 0) / learnersData.length || 0,
      newThisMonth: learnersData.filter(l => new Date(l.createdAt) > oneMonthAgo).length
    }

    setStats(newStats)
  }

  const filteredLearners = learners.filter(learner => {
    const matchesSearch = learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         learner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         learner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         learner.program.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || learner.status === statusFilter
    const matchesProgram = programFilter === 'all' || learner.program === programFilter
    const matchesRisk = riskFilter === 'all' || learner.riskFactors?.dropoutRisk === riskFilter
    const matchesPlacement = placementFilter === 'all' || 
                            (placementFilter === 'placed' && learner.placement?.companyName) ||
                            (placementFilter === 'unplaced' && !learner.placement?.companyName)

    return matchesSearch && matchesStatus && matchesProgram && matchesRisk && matchesPlacement
  })

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case 'graduated':
        return <Badge className="bg-blue-100 text-blue-800">Graduated</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getPlacementStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">No Placement</Badge>
    
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">Active Placement</Badge>
      case 'completed':
        return <Badge className="bg-purple-100 text-purple-800">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatProgramName = (program: string) => {
    return program
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Test function to debug Firebase connection
  const testFirebaseConnection = async () => {
    try {
      console.log('🧪 Testing Firebase connection...')
      console.log('📡 Firebase config:', {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ispaan-app',
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set'
      })
      
      // Test basic connection
      const testSnapshot = await getDocs(collection(db, 'programs'))
      console.log('✅ Firebase connection successful!')
      console.log('📊 Programs collection test:', {
        empty: testSnapshot.empty,
        size: testSnapshot.size,
        docs: testSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
      })
      
      return testSnapshot
    } catch (error) {
      console.error('❌ Firebase connection failed:', error)
      return null
    }
  }

  // Make test function available globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).testFirebaseConnection = testFirebaseConnection
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] opacity-5 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                    <Users className="h-6 w-6 text-white" />
                  </div>
          <div>
                    <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#1E3D59' }}>
                      Learner Management
                    </h1>
                    <p className="text-gray-600 text-lg">Manage and monitor all learners</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Real-time Data Indicator */}
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Live Data</span>
          </div>
                
                <Button 
                  variant="outline" 
                  onClick={loadLearners} 
                  disabled={loading}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  <span className="font-semibold">Refresh</span>
            </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Learners</p>
                  <p className="text-3xl font-bold text-blue-600">{learners.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Activity className="h-4 w-4 mr-1" />
                <span>All learners</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Active Learners</p>
                  <p className="text-3xl font-bold text-green-600">
                    {learners.filter(l => l.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-600">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Currently active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">In Placements</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {learners.filter(l => l.placement?.companyName).length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-600">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Award className="h-4 w-4 mr-1" />
                <span>Work placements</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {learners.filter(l => {
                      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      return new Date(l.createdAt) > oneMonthAgo
                    }).length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-orange-600">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Recent enrollments</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] opacity-5 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#1E3D59' }}>Filters & Search</h3>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{availablePrograms.length} programs from database</span>
                {availablePrograms.length > 0 && (
                  <div className="text-xs text-gray-500">
                    ({availablePrograms.slice(0, 2).join(', ')}{availablePrograms.length > 2 ? '...' : ''})
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Search Learners</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by name, email, or program..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Program</label>
                <Select value={programFilter} onValueChange={setProgramFilter} disabled={loading}>
                  <SelectTrigger className="py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder={loading ? "Loading programs..." : "All programs"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {loading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Loading programs...</span>
                        </div>
                      </SelectItem>
                    ) : (
                      availablePrograms.map(program => (
                      <SelectItem key={program} value={program}>
                        {formatProgramName(program)}
                      </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Risk Level</label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All risk levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Placement</label>
                <Select value={placementFilter} onValueChange={setPlacementFilter}>
                  <SelectTrigger className="py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All placements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Placements</SelectItem>
                    <SelectItem value="placed">Placed</SelectItem>
                    <SelectItem value="unplaced">Unplaced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Learners List */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] opacity-5 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#1E3D59' }}>
                  Learners ({filteredLearners.length})
                </h3>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading learners...</h3>
                <p className="text-gray-600">Please wait while we fetch the latest data</p>
              </div>
            ) : filteredLearners.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No learners found</h3>
                <p className="text-gray-600">No learners match your current filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                    {filteredLearners.map((learner) => (
                  <Card key={learner.id} className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg">
                                {getInitials(learner.firstName, learner.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {learner.firstName} {learner.lastName}
                            </h3>
                            <p className="text-gray-600">{learner.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusBadge(learner.status)}
                              {learner.riskFactors && getRiskBadge(learner.riskFactors.dropoutRisk)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                            <span><span className="font-medium">Program:</span> {formatProgramName(learner.program)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span><span className="font-medium">Joined:</span> {formatDate(learner.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Building2 className="w-4 h-4 text-purple-600" />
                            <span><span className="font-medium">Placement:</span> {learner.placement?.companyName || 'Not placed'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span><span className="font-medium">Last seen:</span> {learner.riskFactors?.lastSeenDays || 0} days ago</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {learner.progress && (
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">Progress</h4>
                              <span className="text-sm text-gray-600">{learner.progress.completionRate}% Complete</span>
                            </div>
                            <Progress value={learner.progress.completionRate} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{learner.progress.completedHours} hours completed</span>
                              <span>{learner.progress.totalHours} total hours</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs">
                              <span className="text-green-600">Attendance: {learner.progress.attendanceRate}%</span>
                              <span className="text-blue-600">Last Activity: {formatDate(learner.progress.lastActivity || learner.createdAt)}</span>
                            </div>
                          </div>
                        )}

                        {/* Risk Assessment */}
                        {learner.riskFactors && (
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900">Risk Assessment</h4>
                              {getRiskBadge(learner.riskFactors.dropoutRisk)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div className="flex items-center space-x-1">
                                <Activity className="w-3 h-3 text-blue-600" />
                                <span>Activity: {learner.riskFactors.activityScore}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Target className="w-3 h-3 text-green-600" />
                                <span>Engagement: {learner.riskFactors.engagementScore}/10</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-orange-600" />
                                <span>Last Seen: {learner.riskFactors.lastSeenDays}d ago</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {learner.riskFactors.attendanceIssues ? (
                                  <AlertTriangle className="w-3 h-3 text-red-600" />
                                ) : (
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                )}
                                <span>Attendance: {learner.riskFactors.attendanceIssues ? 'Issues' : 'Good'}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Recent Activities */}
                        {learner.recentActivities && learner.recentActivities.length > 0 && (
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Recent Activities</h4>
                            <div className="space-y-2">
                              {learner.recentActivities.slice(0, 3).map((activity, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-gray-700">{activity.type || 'Activity'}</span>
                                  <span className="text-gray-500 text-xs">
                                    {formatDate(activity.timestamp)}
                            </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {/* Real-time Status Indicator */}
                        <div className="flex items-center space-x-2 mb-2">
                          {(() => {
                            const lastSeenDays = learner.riskFactors?.lastSeenDays ?? 0;
                            return (
                              <>
                                <div className={`w-2 h-2 rounded-full ${
                                  lastSeenDays === 0 ? 'bg-green-500' :
                                  lastSeenDays <= 3 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}></div>
                                <span className="text-xs text-gray-500">
                                  {lastSeenDays === 0 ? 'Online' :
                                   lastSeenDays <= 3 ? 'Recently Active' :
                                   'Inactive'}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                        
                        <Button 
                          onClick={() => {
                            setSelectedLearner(learner)
                            setShowDetailModal(true)
                          }}
                          className="px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          style={{ backgroundColor: '#FF6E40' }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                            </Button>
                        
                        {learner.riskFactors?.dropoutRisk === 'high' && (
                          <Button 
                            variant="outline" 
                            className="px-4 py-2 rounded-xl border-2 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-300"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            High Risk
                            </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          className="px-4 py-2 rounded-xl border-2 border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                            </Button>
                          </div>
                    </div>
                  </Card>
                    ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}