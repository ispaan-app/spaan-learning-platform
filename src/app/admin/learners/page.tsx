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
import { ProgramService } from '@/lib/program-service'
import { getLearnerProgress } from '@/app/actions/checkinActions'
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
import { collection, getDocs, query, where, orderBy, updateDoc, doc, onSnapshot, getDoc } from 'firebase/firestore'
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
  joinedAt?: string
  promotionDate?: string
  profile?: {
    // Basic Information
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
    
    // Program Information
    program?: string
    programStartDate?: string
    programEndDate?: string
    studentNumber?: string
    
    // Emergency Contact
    emergencyContact?: {
      name: string
      phone: string
      relationship: string
      email?: string
    }
    
    // Skills and Experience
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
    
    // Preferences
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
    
    // Legacy fields for backward compatibility
    location?: string
    bio?: string
    experience?: string
    educationLegacy?: string
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
    position?: string
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
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [showRiskAnalysisModal, setShowRiskAnalysisModal] = useState(false)
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [programNames, setProgramNames] = useState<{ [key: string]: string }>({})
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
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
    
    // Manual refresh only - no auto-refresh interval
    
    return () => {
      unsubscribeLearners()
      unsubscribeProgress()
      unsubscribeActivities()
      unsubscribePrograms()
    }
  }, [])

  // Set initial refresh time
  useEffect(() => {
    if (!lastRefreshTime) {
      setLastRefreshTime(new Date())
    }
  }, [lastRefreshTime])

  // Load program names for learners
  useEffect(() => {
    if (learners.length > 0) {
      const uniqueProgramIds = Array.from(new Set(learners.map(l => l.program).filter(Boolean)))
      if (uniqueProgramIds.length > 0) {
        ProgramService.getProgramNamesByIds(uniqueProgramIds)
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
  }, [learners])

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
        
        // Create a mapping of program IDs to names
        const programNamesMap: { [key: string]: string } = {}
        programsData.forEach(program => {
          programNamesMap[program.id] = program.name || program.id
        })
        console.log('🗺️ Program names mapping:', programNamesMap)
        
        setAvailablePrograms(programsData.map(p => p.id))
        setPrograms(programsData)
        
        // Only set program names if they haven't been set by ProgramService
        setProgramNames(prevNames => {
          if (Object.keys(prevNames).length === 0) {
            console.log('🗺️ Setting program names from programs collection')
            return programNamesMap
          } else {
            console.log('🗺️ Program names already loaded from ProgramService, keeping existing')
            return prevNames
          }
        })
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
        
        // Debug: Log available date fields for first few learners
        if (learnersSnapshot.docs.indexOf(learnerDoc) < 3) {
          console.log('📅 Learner date fields for', learnerId, ':', {
            createdAt: data.createdAt,
            lastLoginAt: data.lastLoginAt,
            promotedAt: data.promotedAt,
            joinedAt: data.joinedAt,
            updatedAt: data.updatedAt,
            promotionDate: data.promotionDate,
            hasDetailedProfile: !!detailedProfile,
            rawData: data
          })
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
          joinedAt: data.promotedAt || data.joinedAt || data.createdAt, // Use promotion date or fallback to creation date
          promotionDate: data.promotionDate, // When they were promoted from applicant to learner
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
    
    // Safely parse last login date with fallbacks
    let lastLogin: Date
    try {
      if (data.lastLoginAt) {
        lastLogin = new Date(data.lastLoginAt)
      } else if (data.createdAt) {
        lastLogin = new Date(data.createdAt)
      } else if (data.promotionDate) {
        lastLogin = new Date(data.promotionDate)
      } else {
        lastLogin = now // Fallback to current date
      }
      
      // Check if date is valid
      if (isNaN(lastLogin.getTime())) {
        lastLogin = now
      }
    } catch (error) {
      console.warn('Error parsing last login date:', error)
      lastLogin = now
    }
    
    const daysSinceLastLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
    
    // Ensure daysSinceLastLogin is a valid number
    const validDaysSinceLogin = isNaN(daysSinceLastLogin) ? 0 : Math.max(0, daysSinceLastLogin)
    
    // Calculate real risk factors based on actual data
    const engagementLow = validDaysSinceLogin > 14
    const attendanceIssues = (progress?.attendanceRate || 0) < 70
    const assignmentDelays = (progress?.assignmentDelays || 0) > 3
    const personalIssues = activities?.some(activity => 
      activity.type === 'issue' || activity.type === 'complaint'
    ) || false
    
    // Calculate activity frequency with proper error handling
    let recentActivityCount = 0
    if (activities && Array.isArray(activities)) {
      recentActivityCount = activities.filter(activity => {
        try {
          if (!activity.timestamp) return false
          const activityDate = new Date(activity.timestamp)
          if (isNaN(activityDate.getTime())) return false
          const daysDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
          return daysDiff <= 7
        } catch (error) {
          console.warn('Error parsing activity date:', error)
          return false
        }
      }).length
    }
    
    const lowActivity = recentActivityCount < 2

    let dropoutRisk: 'low' | 'medium' | 'high' = 'low'
    
    if (engagementLow || attendanceIssues || personalIssues || lowActivity) {
      dropoutRisk = 'high'
    } else if (assignmentDelays || validDaysSinceLogin > 7 || recentActivityCount < 5) {
      dropoutRisk = 'medium'
    }

    // Calculate engagement score with bounds
    const engagementScore = Math.max(0, Math.min(10, 10 - Math.floor(validDaysSinceLogin / 7)))

    console.log('🔍 Risk calculation for learner:', {
      learnerId: data.id,
      validDaysSinceLogin,
      recentActivityCount,
      engagementScore,
      attendanceRate: progress?.attendanceRate || 0,
      dropoutRisk
    })

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
    // Set the required total hours for learners
    const totalHours = 160 // Required hours for learners
    
    try {
      // Get real progress data from check-in system
      const progressResult = await getLearnerProgress(data.id)
      
      if (progressResult.success && progressResult.progress) {
        console.log('📊 Real progress data for learner:', data.id, progressResult.progress)
        const progress = progressResult.progress
        return {
          totalHours: progress.totalHours,
          completedHours: Math.round(progress.completedHours),
          completionRate: progress.completionRate,
          attendanceRate: progress.attendanceRate,
          lastActivity: activities?.length > 0 ? activities[0].timestamp : data.lastLoginAt || data.createdAt
        }
      }
    } catch (error) {
      console.error('Error fetching real progress:', error)
    }
    
    // Fallback to calculating from activities if check-in system fails
    const checkInActivities = activities?.filter(activity => 
      activity.type === 'check_in' || activity.type === 'checkin' || activity.action === 'check_in'
    ) || []
    
    // Use actual completed hours from learner data, fallback to 0 if not available
    const completedHours = data.totalCompletedHours || 0
    
    // Calculate completion rate based on actual hours
    const completionRate = totalHours > 0 ? (completedHours / totalHours) * 100 : 0
    
    // Calculate attendance rate from actual check-ins vs expected
    // Get expected check-ins from learner's program requirements or use default
    const expectedCheckIns = data.expectedCheckIns || 20 // Can be customized per program
    const actualCheckIns = checkInActivities.length
    const attendanceRate = expectedCheckIns > 0 ? Math.min((actualCheckIns / expectedCheckIns) * 100, 100) : 0
    
    // Calculate last activity from recent activities
    const lastActivity = activities?.length > 0 
      ? activities[0].timestamp 
      : data.lastLoginAt || data.createdAt

    console.log('📊 Fallback progress calculation for learner:', {
      learnerId: data.id || 'unknown',
      totalHours,
      completedHours,
      completionRate: Math.round(completionRate * 10) / 10,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      checkInCount: checkInActivities.length,
      activities: activities?.length || 0
    })

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

  const formatProgramName = (programId: string) => {
    const programName = programNames[programId] || programId || 'Unknown Program'
    
    // Debug logging for the first few calls
    if (Object.keys(programNames).length > 0) {
      console.log('🏷️ Formatting program name:', {
        programId,
        programName,
        availablePrograms: Object.keys(programNames),
        programNamesMap: programNames
      })
    }
    
    return programName
  }

  const filteredLearners = learners.filter(learner => {
    // Enhanced search functionality
    const searchLower = searchTerm.toLowerCase()
    const fullName = `${learner.firstName} ${learner.lastName}`.toLowerCase()
    const programName = formatProgramName(learner.program).toLowerCase()
    
    const matchesSearch = searchTerm === '' || 
                         learner.firstName.toLowerCase().includes(searchLower) ||
                         learner.lastName.toLowerCase().includes(searchLower) ||
                         fullName.includes(searchLower) ||
                         learner.email.toLowerCase().includes(searchLower) ||
                         learner.program.toLowerCase().includes(searchLower) ||
                         programName.includes(searchLower)
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || learner.status === statusFilter
    
    // Program filter - compare program IDs
    const matchesProgram = programFilter === 'all' || learner.program === programFilter
    
    // Risk filter - handle different risk levels
    const matchesRisk = riskFilter === 'all' || learner.riskFactors?.dropoutRisk === riskFilter
    
    // Placement filter
    const matchesPlacement = placementFilter === 'all' || 
                            (placementFilter === 'placed' && learner.placement?.companyName) ||
                            (placementFilter === 'unplaced' && !learner.placement?.companyName)

    return matchesSearch && matchesStatus && matchesProgram && matchesRisk && matchesPlacement
  }).sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'name':
        comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        break
      case 'email':
        comparison = a.email.localeCompare(b.email)
        break
      case 'program':
        comparison = formatProgramName(a.program).localeCompare(formatProgramName(b.program))
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'risk':
        comparison = (a.riskFactors?.dropoutRisk || 'low').localeCompare(b.riskFactors?.dropoutRisk || 'low')
        break
      case 'progress':
        comparison = (a.progress?.completionRate || 0) - (b.progress?.completionRate || 0)
        break
      case 'joined':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      default:
        comparison = 0
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
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

  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'Not available'
    
    let date: Date
    
    try {
      // Handle Firestore Timestamp objects
      if (dateInput && typeof dateInput === 'object' && dateInput.toDate) {
        date = dateInput.toDate()
      }
      // Handle Firestore Timestamp with seconds/nanoseconds
      else if (dateInput && typeof dateInput === 'object' && (dateInput.seconds || dateInput._seconds)) {
        const seconds = dateInput.seconds || dateInput._seconds
        const nanoseconds = dateInput.nanoseconds || dateInput._nanoseconds || 0
        date = new Date(seconds * 1000 + nanoseconds / 1000000)
      }
      // Handle string dates
      else if (typeof dateInput === 'string') {
        if (dateInput.includes('T')) {
          date = new Date(dateInput)
        } else if (dateInput.includes('-')) {
          date = new Date(dateInput + 'T00:00:00Z')
        } else {
          date = new Date(dateInput)
        }
      }
      // Handle number timestamps
      else if (typeof dateInput === 'number') {
        date = new Date(dateInput)
      }
      // Fallback
      else {
        date = new Date(dateInput)
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date input:', dateInput, 'Type:', typeof dateInput)
        return 'Invalid date'
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      console.warn('Error parsing date:', dateInput, 'Error:', error)
      return 'Invalid date'
    }
  }


  const formatRiskValue = (value: any, fallback: any = 0) => {
    if (value === null || value === undefined || isNaN(value)) {
      return fallback
    }
    return value
  }


  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Comprehensive refresh function
  const handleRefresh = async () => {
    try {
      setLoading(true)
      console.log('🔄 Manual refresh initiated by admin...')
      
      // Refresh all data
      await Promise.all([
        loadLearners(),
        loadPrograms(),
        // Note: Real-time subscriptions will automatically update progress and activities
      ])
      
      // Update last refresh time
      setLastRefreshTime(new Date())
      
      console.log('✅ Manual refresh completed successfully')
    } catch (error) {
      console.error('❌ Error during manual refresh:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E3D59] via-[#2D5A87] to-[#4A90A4] opacity-10 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 shadow-xl">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] bg-clip-text text-transparent">
                    Learner Management
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">Monitor progress, track placements, and analyze performance</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">Live Data</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-700">{learners.length} Total Learners</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-3">
                {lastRefreshTime && (
                  <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                    Last refreshed: {lastRefreshTime.toLocaleTimeString()}
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={handleRefresh} 
                  disabled={loading}
                  className="px-8 py-4 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  title="Click to manually refresh learner data, programs, and statistics"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="font-semibold text-lg">
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-blue-50/30">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Learners</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{learners.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600 bg-blue-50/50 px-3 py-2 rounded-full">
                <Activity className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">All learners</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-green-50/30">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Learners</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {learners.filter(l => l.status === 'active').length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600 bg-green-50/50 px-3 py-2 rounded-full">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">Currently active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-purple-50/30">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">In Placements</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {learners.filter(l => l.placement?.companyName).length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600 bg-purple-50/50 px-3 py-2 rounded-full">
                <Award className="h-4 w-4 mr-2 text-purple-600" />
                <span className="font-medium">Work placements</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-orange-50/30">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">New This Month</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {learners.filter(l => {
                      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      return new Date(l.createdAt) > oneMonthAgo
                    }).length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-xl">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600 bg-orange-50/50 px-3 py-2 rounded-full">
                <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                <span className="font-medium">Recent enrollments</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E3D59] via-[#2D5A87] to-[#4A90A4] opacity-8 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                  <Filter className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] bg-clip-text text-transparent">
                    Filters & Search
                  </h3>
                  <p className="text-gray-600 text-sm">Find and organize learners efficiently</p>
                </div>
                {(searchTerm || statusFilter !== 'all' || programFilter !== 'all' || riskFilter !== 'all' || placementFilter !== 'all') && (
                  <Badge variant="secondary" className="ml-3 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Active
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{availablePrograms.length} programs from database</span>
                  {availablePrograms.length > 0 && (
                    <div className="text-xs text-gray-500">
                      ({availablePrograms.slice(0, 2).map(id => formatProgramName(id)).join(', ')}{availablePrograms.length > 2 ? '...' : ''})
                    </div>
                  )}
                </div>
                {(searchTerm || statusFilter !== 'all' || programFilter !== 'all' || riskFilter !== 'all' || placementFilter !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setProgramFilter('all')
                      setRiskFilter('all')
                      setPlacementFilter('all')
                      setSortBy('name')
                      setSortOrder('asc')
                    }}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Search Learners</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by name, email, or program..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:shadow-md">
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

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Program</label>
                <Select value={programFilter} onValueChange={setProgramFilter} disabled={loading}>
                  <SelectTrigger className="py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:shadow-md">
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

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Risk Level</label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:shadow-md">
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

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Placement</label>
                <Select value={placementFilter} onValueChange={setPlacementFilter}>
                  <SelectTrigger className="py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:shadow-md">
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
            
            {/* Active Filters Summary */}
            {(searchTerm || statusFilter !== 'all' || programFilter !== 'all' || riskFilter !== 'all' || placementFilter !== 'all') && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Active Filters:</span>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <Badge variant="outline" className="text-xs px-3 py-1 bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
                          Search: "{searchTerm}"
                        </Badge>
                      )}
                      {statusFilter !== 'all' && (
                        <Badge variant="outline" className="text-xs px-3 py-1 bg-white border-green-200 text-green-700 hover:bg-green-50">
                          Status: {statusFilter}
                        </Badge>
                      )}
                      {programFilter !== 'all' && (
                        <Badge variant="outline" className="text-xs px-3 py-1 bg-white border-purple-200 text-purple-700 hover:bg-purple-50">
                          Program: {formatProgramName(programFilter)}
                        </Badge>
                      )}
                      {riskFilter !== 'all' && (
                        <Badge variant="outline" className="text-xs px-3 py-1 bg-white border-orange-200 text-orange-700 hover:bg-orange-50">
                          Risk: {riskFilter}
                        </Badge>
                      )}
                      {placementFilter !== 'all' && (
                        <Badge variant="outline" className="text-xs px-3 py-1 bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                          Placement: {placementFilter}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {filteredLearners.length} of {learners.length} learners
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Learners List */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E3D59] via-[#2D5A87] to-[#4A90A4] opacity-8 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] bg-clip-text text-transparent">
                    Learners ({filteredLearners.length})
                  </h3>
                  <p className="text-gray-600 text-sm">Manage and view learner details</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Sort by:</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-36 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="program">Program</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="risk">Risk</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                      <SelectItem value="joined">Joined</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>
            </div>
            
            {loading ? (
              <PageLoader message="Loading learners..." />
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
                  <Card key={learner.id} className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/50 rounded-3xl p-8 hover:shadow-2xl hover:border-blue-300/50 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="relative">
                            <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 text-white font-bold text-xl">
                                {getInitials(learner.firstName, learner.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                              {learner.firstName} {learner.lastName}
                            </h3>
                            <p className="text-gray-600 text-lg">{learner.email}</p>
                            <div className="flex items-center space-x-3 mt-2">
                              {getStatusBadge(learner.status)}
                              {learner.riskFactors && getRiskBadge(learner.riskFactors.dropoutRisk)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="flex items-center space-x-3 text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-200/50">
                            <div className="p-2 rounded-lg bg-blue-100">
                              <GraduationCap className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-blue-900">Program</span>
                              <p className="text-blue-700">{formatProgramName(learner.program)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200/50">
                            <div className="p-2 rounded-lg bg-green-100">
                              <Calendar className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-green-900">Promoted</span>
                              <p className="text-green-700">{formatDate(learner.promotionDate || learner.joinedAt || learner.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 rounded-xl border border-purple-200/50">
                            <div className="p-2 rounded-lg bg-purple-100">
                              <Building2 className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-purple-900">Placement</span>
                              <p className="text-purple-700">{learner.placement?.companyName || 'Not placed'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-700 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 rounded-xl border border-orange-200/50">
                            <div className="p-2 rounded-lg bg-orange-100">
                              <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-orange-900">Last seen</span>
                              <p className="text-orange-700">{learner.riskFactors?.lastSeenDays || 0} days ago</p>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {learner.progress && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-200/50">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-bold text-blue-900">Progress Tracking</h4>
                              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {learner.progress.completionRate}% Complete
                              </span>
                            </div>
                            <div className="relative">
                              <Progress value={learner.progress.completionRate} className="h-4 bg-blue-100 rounded-full" />
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20"></div>
                            </div>
                            <div className="flex justify-between text-sm text-blue-700 mt-3 font-medium">
                              <span className="bg-blue-100 px-3 py-1 rounded-full">{learner.progress.completedHours} hours completed</span>
                              <span className="bg-indigo-100 px-3 py-1 rounded-full">{learner.progress.totalHours} total hours</span>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-sm">
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Attendance: {learner.progress.attendanceRate}%</span>
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Last Activity: {formatDate(learner.progress?.lastActivity || learner.lastLoginAt || learner.createdAt)}</span>
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
                                <span>Activity: {formatRiskValue(learner.riskFactors.activityScore)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Target className="w-3 h-3 text-green-600" />
                                <span>Engagement: {formatRiskValue(learner.riskFactors.engagementScore)}/10</span>
                              </div>
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
                          onClick={() => {
                            setSelectedLearner(learner)
                            setShowEditModal(true)
                          }}
                          className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                        
                        {learner.riskFactors?.dropoutRisk === 'high' && (
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedLearner(learner)
                              setShowRiskModal(true)
                            }}
                            className="px-4 py-2 rounded-xl border-2 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-300"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            High Risk
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedLearner(learner)
                            setShowMessageModal(true)
                          }}
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

        {/* View Details Modal */}
        {showDetailModal && selectedLearner && (
          <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] bg-clip-text text-transparent">
                  Learner Details - {selectedLearner.firstName} {selectedLearner.lastName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-blue-700">Full Name</label>
                      <p className="text-blue-900">{selectedLearner.firstName} {selectedLearner.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Email</label>
                      <p className="text-blue-900">{selectedLearner.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Program</label>
                      <p className="text-blue-900">{formatProgramName(selectedLearner.program)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedLearner.status)}</div>
                    </div>
                  </div>
                </div>

                {/* Progress Information */}
                {selectedLearner.progress && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/50">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Progress Information</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-green-700">Completion Progress</span>
                          <span className="text-sm font-bold text-green-900">{selectedLearner.progress.completionRate}%</span>
                        </div>
                        <Progress value={selectedLearner.progress.completionRate} className="h-3" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-green-700">Completed Hours</label>
                          <p className="text-green-900">{selectedLearner.progress.completedHours} hours</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-green-700">Total Hours</label>
                          <p className="text-green-900">{selectedLearner.progress.totalHours} hours</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-green-700">Attendance Rate</label>
                          <p className="text-green-900">{selectedLearner.progress.attendanceRate}%</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-green-700">Last Activity</label>
                          <p className="text-green-900">{formatDate(selectedLearner.progress.lastActivity || selectedLearner.lastLoginAt || selectedLearner.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Assessment */}
                {selectedLearner.riskFactors && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200/50">
                    <h3 className="text-lg font-semibold text-orange-900 mb-4">Risk Assessment</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-orange-700">Risk Level</label>
                        <div className="mt-1">{getRiskBadge(selectedLearner.riskFactors.dropoutRisk)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-orange-700">Activity Score</label>
                        <p className="text-orange-900">{formatRiskValue(selectedLearner.riskFactors.activityScore)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-orange-700">Engagement Score</label>
                        <p className="text-orange-900">{formatRiskValue(selectedLearner.riskFactors.engagementScore)}/10</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-orange-700">Last Seen</label>
                        <p className="text-orange-900">{formatRiskValue(selectedLearner.riskFactors.lastSeenDays)} days ago</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Placement Information */}
                {selectedLearner.placement && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4">Placement Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-purple-700">Company</label>
                        <p className="text-purple-900">{selectedLearner.placement.companyName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-purple-700">Position</label>
                        <p className="text-purple-900">{selectedLearner.placement.position || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Profile Modal */}
        {showEditModal && selectedLearner && (
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] bg-clip-text text-transparent">
                  Edit Profile - {selectedLearner.firstName} {selectedLearner.lastName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">First Name</label>
                      <Input 
                        defaultValue={selectedLearner.firstName}
                        className="rounded-xl border-2 border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">Last Name</label>
                      <Input 
                        defaultValue={selectedLearner.lastName}
                        className="rounded-xl border-2 border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">Email</label>
                      <Input 
                        defaultValue={selectedLearner.email}
                        type="email"
                        className="rounded-xl border-2 border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">Program</label>
                      <Select defaultValue={selectedLearner.program}>
                        <SelectTrigger className="rounded-xl border-2 border-blue-200 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePrograms.map(program => (
                            <SelectItem key={program} value={program}>
                              {formatProgramName(program)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">Status</label>
                      <Select defaultValue={selectedLearner.status}>
                        <SelectTrigger className="rounded-xl border-2 border-blue-200 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="graduated">Graduated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowEditModal(false)}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Message Modal */}
        {showMessageModal && selectedLearner && (
          <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] bg-clip-text text-transparent">
                  Send Message to {selectedLearner.firstName} {selectedLearner.lastName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">Subject</label>
                      <Input 
                        placeholder="Enter message subject"
                        className="rounded-xl border-2 border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">Message</label>
                      <textarea 
                        placeholder="Type your message here..."
                        rows={6}
                        className="w-full rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">Priority</label>
                      <Select defaultValue="normal">
                        <SelectTrigger className="rounded-xl border-2 border-blue-200 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="normal">Normal Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowMessageModal(false)}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      Send Message
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* High Risk Modal */}
        {showRiskModal && selectedLearner && (
          <Dialog open={showRiskModal} onOpenChange={setShowRiskModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  High Risk Alert - {selectedLearner.firstName} {selectedLearner.lastName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-xl bg-red-100">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-900">Risk Assessment</h3>
                      <p className="text-red-700">This learner has been identified as high risk</p>
                    </div>
                  </div>
                  
                  {selectedLearner.riskFactors && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/50 rounded-xl p-4">
                          <label className="text-sm font-medium text-red-700">Risk Level</label>
                          <div className="mt-1">{getRiskBadge(selectedLearner.riskFactors.dropoutRisk)}</div>
                        </div>
                        <div className="bg-white/50 rounded-xl p-4">
                          <label className="text-sm font-medium text-red-700">Last Seen</label>
                          <p className="text-red-900 font-semibold">{formatRiskValue(selectedLearner.riskFactors.lastSeenDays)} days ago</p>
                        </div>
                        <div className="bg-white/50 rounded-xl p-4">
                          <label className="text-sm font-medium text-red-700">Activity Score</label>
                          <p className="text-red-900 font-semibold">{formatRiskValue(selectedLearner.riskFactors.activityScore)}</p>
                        </div>
                        <div className="bg-white/50 rounded-xl p-4">
                          <label className="text-sm font-medium text-red-700">Engagement Score</label>
                          <p className="text-red-900 font-semibold">{formatRiskValue(selectedLearner.riskFactors.engagementScore)}/10</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                    <h4 className="text-lg font-semibold text-red-900">Recommended Actions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <span className="text-gray-700">Send a check-in message to the learner</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
                        <Users className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Schedule a meeting with the learner</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
                        <Shield className="h-5 w-5 text-purple-600" />
                        <span className="text-gray-700">Review support resources and interventions</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowRiskModal(false)}
                      className="rounded-xl"
                    >
                      Close
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowRiskModal(false)
                        setShowMessageModal(true)
                      }}
                      className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      Send Message
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  )
}