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
import { PageLoader } from '@/components/ui/loading'
import { AiChatbot } from '@/components/ai-chatbot'
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  LayoutDashboard,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Clock,
  Calendar,
  DollarSign,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  BookOpen,
  Briefcase,
  Heart,
  Settings,
  Star,
  Award,
  Zap,
  TrendingUp,
  Activity,
  UserCheck,
  Shield,
  Sparkles
} from 'lucide-react'
import { collection, getDocs, query, where, orderBy, updateDoc, doc, onSnapshot, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ProgramService } from '@/lib/program-service'
import { useProgramNames } from '@/hooks/useProgramNames'
import { toast as sonnerToast } from 'sonner'
import { useRouter } from 'next/navigation'
// import { getInitials } from '@/lib/utils'
import { formatDate } from '@/lib/date-utils'

interface Learner {
  id: string
  firstName: string
  lastName: string
  email: string
  status: 'active' | 'inactive' | 'graduated'
  program: string
  createdAt: string
  lastLoginAt?: string
  joinedAt?: string
  promotionDate?: string
  profile?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: string
    suburb?: string
    city?: string
    province?: string
    postalCode?: string
    dateOfBirth?: string
    gender?: 'male' | 'female'
    idNumber?: string
    nationality?: string
    profileImage?: string
    avatar?: string
    program?: string
    programStartDate?: string
    programEndDate?: string
    studentNumber?: string
    emergencyContact?: {
      name: string
      phone: string
      relationship: string
      email?: string
    }
    skills?: string[]
    interests?: string[]
    languages?: string[]
    workExperience?: {
      company: string
      position: string
      startDate: string
      endDate?: string
      description: string
    }[]
    education?: {
      institution: string
      qualification: string
      startDate: string
      endDate?: string
      status: 'completed' | 'in-progress' | 'cancelled'
    }[]
    preferences?: {
      notifications: {
        email: boolean
        sms: boolean
        push: boolean
      }
      privacy: {
        showProfile: boolean
        showContact: boolean
        showSkills: boolean
      }
    }
    location?: string
    bio?: string
    experience?: string
    educationLegacy?: string
  }
  placement?: {
    companyName?: string
    startDate?: string
    endDate?: string
    supervisor?: {
      name: string
      email: string
      phone: string
    }
    status: 'active' | 'completed' | 'terminated' | 'unplaced'
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
  recentActivities?: any[]
}

interface DashboardStats {
  totalLearners: number
  activeLearners: number
  inactiveLearners: number
  graduatedLearners: number
  placedLearners: number
  unplacedLearners: number
  highRiskLearners: number
  mediumRiskLearners: number
  lowRiskLearners: number
  newThisMonth: number
}

export default function SuperAdminLearnersPage() {
  const [learners, setLearners] = useState<Learner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [programFilter, setProgramFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [placementFilter, setPlacementFilter] = useState('all')
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([])
  const { programNames, programNamesList, loading: programNamesLoading, getProgramName } = useProgramNames()
  const [stats, setStats] = useState<DashboardStats>({
    totalLearners: 0,
    activeLearners: 0,
    inactiveLearners: 0,
    graduatedLearners: 0,
    placedLearners: 0,
    unplacedLearners: 0,
    highRiskLearners: 0,
    mediumRiskLearners: 0,
    lowRiskLearners: 0,
    newThisMonth: 0
  })
  const [error, setError] = useState<Error | null>(null)
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadLearners()
  }, [])


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

      const learnersData = await Promise.all(learnersSnapshot.docs.map(async learnerDoc => {
        const data = learnerDoc.data()
        const learnerId = learnerDoc.id
        
        // Fetch detailed learner profile from learnerProfiles collection
        let detailedProfile: any = null
        try {
          const profileDocRef = doc(db, 'learnerProfiles', learnerId)
          const profileDoc = await getDoc(profileDocRef)
          if (profileDoc.exists()) {
            detailedProfile = profileDoc.data()
          }
        } catch (error) {
          console.error('Error fetching detailed profile for learner', learnerId, ':', error)
        }
        
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
        const realProgress = await calculateRealProgress(data, progress, recentActivities)
        
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
          joinedAt: data.promotedAt || data.joinedAt || data.createdAt,
          promotionDate: data.promotionDate,
          profile: {
            // Detailed profile information from learnerProfiles collection
            firstName: detailedProfile?.firstName || data.firstName || '',
            lastName: detailedProfile?.lastName || data.lastName || '',
            email: detailedProfile?.email || data.email || '',
            phone: detailedProfile?.phone || '',
            address: detailedProfile?.address || '',
            suburb: detailedProfile?.suburb || '',
            city: detailedProfile?.city || '',
            province: detailedProfile?.province || '',
            postalCode: detailedProfile?.postalCode || '',
            dateOfBirth: detailedProfile?.dateOfBirth || '',
            gender: detailedProfile?.gender || '',
            idNumber: detailedProfile?.idNumber || '',
            nationality: detailedProfile?.nationality || '',
            profileImage: detailedProfile?.profileImage || '',
            avatar: detailedProfile?.profileImage || data.profile?.avatar || '',
            program: detailedProfile?.program || data.program || '',
            programStartDate: detailedProfile?.programStartDate || '',
            programEndDate: detailedProfile?.programEndDate || '',
            studentNumber: detailedProfile?.studentNumber || '',
            emergencyContact: detailedProfile?.emergencyContact || {},
            skills: detailedProfile?.skills || [],
            interests: detailedProfile?.interests || [],
            languages: detailedProfile?.languages || [],
            workExperience: detailedProfile?.workExperience || [],
            education: detailedProfile?.education || [],
            preferences: detailedProfile?.preferences || {},
            
            // Legacy fields for backward compatibility
            location: detailedProfile?.city && detailedProfile?.province 
              ? `${detailedProfile.city}, ${detailedProfile.province}` 
              : data.profile?.location || 'Not specified',
            bio: detailedProfile?.interests?.join(', ') || data.profile?.bio || 'No bio available',
            experience: detailedProfile?.workExperience?.map((exp: any) => `${exp.position} at ${exp.company}`).join(', ') || data.profile?.experience || 'No experience listed',
            educationLegacy: detailedProfile?.education?.map((edu: any) => `${edu.qualification} from ${edu.institution}`).join(', ') || data.profile?.education || 'No education listed'
          }
        }
      })) as Learner[]

      setLearners(learnersData)
      calculateStats(learnersData)
      
      // Extract unique programs from learners data
      const allPrograms = learnersData.map(learner => learner.program)
      const uniquePrograms = Array.from(new Set(allPrograms))
        .filter(program => program && program.trim() !== '')
        .sort()
      setAvailablePrograms(uniquePrograms)
    } catch (error) {
      console.error('Error loading learners:', error)
      sonnerToast.error('Failed to load learners.')
      setError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRiskFactors = (data: any, progress: any, activities: any[]) => {
    const lastLogin = data.lastLoginAt?.toDate() || data.createdAt?.toDate()
    const now = new Date()
    const daysSinceLastLogin = lastLogin ? Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)) : 999

    const recentActivityCount = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp)
      return (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24) < 30
    }).length

    const engagementScore = (recentActivityCount / 30) * 100

    const validDaysSinceLogin = isNaN(daysSinceLastLogin) ? 0 : Math.max(0, daysSinceLastLogin)
    
    const engagementLow = validDaysSinceLogin > 14
    const attendanceIssues = (progress?.attendanceRate || 0) < 70
    const assignmentDelays = (progress?.assignmentDelays || 0) > 3
    const personalIssues = activities?.some(activity => 
      activity.type === 'issue' || activity.type === 'complaint'
    ) || false
    
    const lowActivity = recentActivityCount < 2

    let dropoutRisk: 'low' | 'medium' | 'high' = 'low'
    
    if (engagementLow || attendanceIssues || personalIssues || lowActivity) {
      dropoutRisk = 'high'
    } else if (assignmentDelays || validDaysSinceLogin > 7 || recentActivityCount < 5) {
      dropoutRisk = 'medium'
    }

    return {
      dropoutRisk,
      attendanceIssues,
      assignmentDelays,
      personalIssues,
      lastSeenDays: validDaysSinceLogin,
      activityScore: recentActivityCount,
      engagementScore
    }
  }

  const calculateRealProgress = async (data: any, progress: any, activities: any[]) => {
    const totalHours = 160
    
    try {
      // Get real progress data from check-in system
      const checkInActivities = activities?.filter(activity => 
        activity.type === 'check_in' || activity.type === 'checkin' || activity.action === 'check_in'
      ) || []
      
      const completedHours = data.totalCompletedHours || 0
      const completionRate = totalHours > 0 ? (completedHours / totalHours) * 100 : 0
      
      const expectedCheckIns = data.expectedCheckIns || 20
      const actualCheckIns = checkInActivities.length
      const attendanceRate = expectedCheckIns > 0 ? Math.min((actualCheckIns / expectedCheckIns) * 100, 100) : 0
      
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
    } catch (error) {
      console.error('Error calculating progress:', error)
      return {
        totalHours: 160,
        completedHours: 0,
        completionRate: 0,
        attendanceRate: 0,
        lastActivity: data.lastLoginAt || data.createdAt
      }
    }
  }

  const calculateStats = (learnersData: Learner[]) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const newThisMonth = learnersData.filter(learner => {
      const joinedDate = new Date(learner.joinedAt || learner.createdAt)
      return joinedDate >= startOfMonth
    }).length

    const totalLearners = learnersData.length
    const activeLearners = learnersData.filter(l => l.status === 'active').length
    const inactiveLearners = learnersData.filter(l => l.status === 'inactive').length
    const graduatedLearners = learnersData.filter(l => l.status === 'graduated').length
    const placedLearners = learnersData.filter(l => l.placement?.status === 'active').length
    const unplacedLearners = learnersData.filter(l => l.placement?.status === 'unplaced').length
    const highRiskLearners = learnersData.filter(l => l.riskFactors?.dropoutRisk === 'high').length
    const mediumRiskLearners = learnersData.filter(l => l.riskFactors?.dropoutRisk === 'medium').length
    const lowRiskLearners = learnersData.filter(l => l.riskFactors?.dropoutRisk === 'low').length

    setStats({
      totalLearners,
      activeLearners,
      inactiveLearners,
      graduatedLearners,
      placedLearners,
      unplacedLearners,
      highRiskLearners,
      mediumRiskLearners,
      lowRiskLearners,
      newThisMonth
    })
  }

  const filteredLearners = learners.filter(learner => {
    const matchesSearch = searchTerm === '' || 
                          learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          learner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          learner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          learner.profile?.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          learner.profile?.idNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || learner.status === statusFilter
    const matchesProgram = programFilter === 'all' || learner.program === programFilter
    const matchesRisk = riskFilter === 'all' || learner.riskFactors?.dropoutRisk === riskFilter
    const matchesPlacement = placementFilter === 'all' || 
                            (placementFilter === 'placed' && learner.placement?.status === 'active') ||
                            (placementFilter === 'unplaced' && learner.placement?.status === 'unplaced')

    return matchesSearch && matchesStatus && matchesProgram && matchesRisk && matchesPlacement
  })

  const handleRefresh = () => {
    loadLearners()
  }

  const handleViewDetails = (learner: Learner) => {
    setSelectedLearner(learner)
  }

  const handleCloseDetails = () => {
    setSelectedLearner(null)
  }

  const handleEditLearner = (learnerId: string) => {
    router.push(`/admin/learners/${learnerId}/edit`)
  }

  const handleDeleteLearner = async (learnerId: string) => {
    if (confirm('Are you sure you want to delete this learner? This action cannot be undone.')) {
      try {
        await updateDoc(doc(db, 'users', learnerId), { status: 'deleted' })
        sonnerToast.success('Learner marked as deleted.')
        loadLearners()
      } catch (error) {
        console.error('Error deleting learner:', error)
        sonnerToast.error('Failed to delete learner.')
      }
    }
  }

  const formatRiskValue = (days: number) => {
    if (days === 0) return 'Today'
    if (days === 1) return '1 day'
    if (days < 7) return `${days} days`
    if (days < 30) return `${Math.floor(days / 7)} weeks`
    return `${Math.floor(days / 30)} months`
  }

  if (error) {
    return (
      <AdminLayout userRole="super-admin">
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h3 className="text-xl font-semibold text-red-700">Error Loading Learners</h3>
          <p className="text-gray-600">{error.message}</p>
          <Button onClick={loadLearners}>Try Again</Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="super-admin">
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5F0E1 0%, #F5F0E1 50%, #F5F0E1 100%)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-48 translate-x-48" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)' }}></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full translate-y-40 -translate-x-40" style={{ background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full -translate-x-32 -translate-y-32" style={{ background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.15) 0%, rgba(251, 146, 60, 0.15) 100%)' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto space-y-8 p-6">
          {/* Enhanced Header */}
          <div className="text-center space-y-6 mb-8">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg mb-4">
              <UserCheck className="h-5 w-5 mr-2" />
              <span className="font-semibold">Super Admin - Learner Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Comprehensive Learner Oversight
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Platform-wide learner management with advanced analytics, risk assessment, and comprehensive oversight capabilities.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Refresh Data</span>
              </Button>
              <Button
                size="lg"
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <TrendingUp className="h-5 w-5" />
                <span>Advanced Analytics</span>
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Learners</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalLearners}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-green-200 shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Placements</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.placedLearners}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-red-200 shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400 to-pink-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High Risk</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.highRiskLearners}</p>
                  </div>
                  <div className="p-3 rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-orange-200 shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Graduated</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.graduatedLearners}</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-100">
                    <Award className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg">
                  <Filter className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-800 to-purple-800 bg-clip-text text-transparent">
                  Advanced Filters & Search
                </span>
                <Sparkles className="h-5 w-5 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search learners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Program</label>
                  <Select value={programFilter} onValueChange={setProgramFilter} disabled={loading}>
                    <SelectTrigger className="py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder={loading ? "Loading programs..." : "All programs"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      {loading ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                            <span>Loading programs...</span>
                          </div>
                        </SelectItem>
                      ) : (
                        availablePrograms.map(program => (
                          <SelectItem key={program} value={program}>
                            {getProgramName(program)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Risk Level</label>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Filter by risk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learners List */}
          <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-purple-800 bg-clip-text text-transparent">
                      Platform Learners
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredLearners.length} learner{filteredLearners.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <PageLoader message="Loading learners..." />
              ) : filteredLearners.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No learners found</h3>
                  <p className="text-gray-600">Adjust your filters or refresh the data.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {filteredLearners.map(learner => (
                    <div 
                      key={learner.id} 
                      className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                      onClick={() => handleViewDetails(learner)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar className="h-12 w-12 border-2 border-purple-400 shadow-md">
                            <AvatarFallback className="bg-purple-500 text-white text-lg font-semibold">
                              {learner.firstName.charAt(0)}{learner.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{learner.firstName} {learner.lastName}</h3>
                            <p className="text-sm text-gray-600">{learner.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-700">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-purple-500" />
                            <span>Program: <span className="font-medium">{getProgramName(learner.program)}</span></span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            <span>Joined: <span className="font-medium">{formatDate(learner.joinedAt || learner.createdAt)}</span></span>
                          </div>
                          {learner.placement?.companyName && (
                            <div className="flex items-center space-x-2">
                              <Building2 className="h-4 w-4 text-green-500" />
                              <span>Placement: <span className="font-medium">{learner.placement.companyName}</span></span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-orange-500" />
                            <span>Status: <Badge variant={
                              learner.status === 'active' ? 'default' : 
                              learner.status === 'graduated' ? 'secondary' : 'destructive'
                            }>{learner.status}</Badge></span>
                          </div>
                        </div>
                        {learner.progress && (
                          <div className="mt-4">
                            <Progress value={learner.progress.completionRate} className="h-2" />
                            <div className="flex justify-between text-sm text-purple-700 mt-3 font-medium">
                              <span className="bg-purple-100 px-3 py-1 rounded-full">{learner.progress.completedHours} hours completed</span>
                              <span className="bg-indigo-100 px-3 py-1 rounded-full">{learner.progress.totalHours} total hours</span>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-sm">
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Attendance: {learner.progress.attendanceRate}%</span>
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Last Activity: {formatDate(learner.progress?.lastActivity || learner.lastLoginAt || learner.createdAt)}</span>
                            </div>
                          </div>
                        )}
                        {learner.riskFactors && (
                          <div className="mt-4 p-3 bg-red-50/50 border border-red-200/50 rounded-xl text-red-800">
                            <div className="flex items-center space-x-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span className="font-semibold">Risk: {learner.riskFactors.dropoutRisk.charAt(0).toUpperCase() + learner.riskFactors.dropoutRisk.slice(1)}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-orange-600" />
                                <span>Last Seen: {formatRiskValue(learner.riskFactors.lastSeenDays)}d ago</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {learner.riskFactors.attendanceIssues ? (
                                  <AlertTriangle className="w-3 h-3 text-red-600" />
                                ) : (
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                )}
                                <span>Attendance: {learner.riskFactors.attendanceIssues ? 'Issues' : 'Good'}</span>
                              </div>
                              {learner.riskFactors.assignmentDelays && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3 text-red-600" />
                                  <span>Assignments: Delays</span>
                                </div>
                              )}
                              {learner.riskFactors.personalIssues && (
                                <div className="flex items-center space-x-1">
                                  <Heart className="w-3 h-3 text-red-600" />
                                  <span>Personal: Issues</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* AI Floating Chatbot */}
        <div className="fixed bottom-6 right-6 z-50">
          <AiChatbot className="shadow-2xl" />
        </div>
      </div>
    </AdminLayout>
  )
}
