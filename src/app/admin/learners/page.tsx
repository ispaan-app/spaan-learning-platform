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
  MessageSquare
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore'
import { toast as sonnerToast } from 'sonner'

interface Learner {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  program: string
  status: 'active' | 'inactive' | 'suspended' | 'graduated'
  placementStatus?: 'placed' | 'unplaced' | 'seeking' | 'completed'
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
    assignmentsSubmitted: number
    assignmentsTotal: number
    attendanceRate: number
    lastActivity?: string
  }
  riskFactors?: {
    dropoutRisk: 'low' | 'medium' | 'high'
    attendanceIssues: boolean
    assignmentDelays: boolean
    engagementLow: boolean
    personalIssues: boolean
    lastSeenDays: number
  }
  placement?: {
    companyName?: string
    startDate?: string
    endDate?: string
    supervisor?: string
    status?: string
  }
}

interface LearnerStats {
  total: number
  active: number
  inactive: number
  graduated: number
  placed: number
  unplaced: number
  highRisk: number
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
  const [stats, setStats] = useState<LearnerStats>({
    total: 0,
    active: 0,
    inactive: 0,
    graduated: 0,
    placed: 0,
    unplaced: 0,
    highRisk: 0,
    averageProgress: 0,
    newThisMonth: 0
  })
  // Toast notifications using Sonner

  useEffect(() => {
    loadLearners()
  }, [])

  const loadLearners = async () => {
    try {
      setLoading(true)
      const learnersSnapshot = await getDocs(query(
        collection(db, 'users'),
        where('role', '==', 'learner'),
        orderBy('createdAt', 'desc')
      ))

      const learnersData = learnersSnapshot.docs.map(doc => {
        const data = doc.data()
        
        // Simulate AI risk analysis (in real app, this would be calculated based on actual data)
        const riskFactors = calculateRiskFactors(data)
        
        return {
          id: doc.id,
          ...data,
          riskFactors,
          progress: data.progress || {
            totalHours: 480,
            completedHours: Math.floor(Math.random() * 400),
            assignmentsSubmitted: Math.floor(Math.random() * 15),
            assignmentsTotal: 20,
            attendanceRate: Math.floor(Math.random() * 40) + 60, // 60-100%
            lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          placement: data.placement || {
            companyName: Math.random() > 0.5 ? `Company ${Math.floor(Math.random() * 100)}` : undefined,
            status: Math.random() > 0.5 ? 'active' : 'unplaced'
          }
        }
      }) as Learner[]

      setLearners(learnersData)
      calculateStats(learnersData)
    } catch (error) {
      console.error('Error loading learners:', error)
      sonnerToast.error('Failed to load learners')
    } finally {
      setLoading(false)
    }
  }

  const calculateRiskFactors = (data: any) => {
    const now = new Date()
    const lastLogin = data.lastLoginAt ? new Date(data.lastLoginAt) : new Date(data.createdAt)
    const daysSinceLastLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
    
    const attendanceRate = data.progress?.attendanceRate || Math.floor(Math.random() * 40) + 60
    const assignmentDelays = (data.progress?.assignmentsSubmitted || 0) < (data.progress?.assignmentsTotal || 20) * 0.7
    const engagementLow = daysSinceLastLogin > 14
    const attendanceIssues = attendanceRate < 75
    const personalIssues = Math.random() > 0.8 // Simulate personal issues

    let dropoutRisk: 'low' | 'medium' | 'high' = 'low'
    
    if (engagementLow || attendanceIssues || personalIssues) {
      dropoutRisk = 'high'
    } else if (assignmentDelays || daysSinceLastLogin > 7) {
      dropoutRisk = 'medium'
    }

    return {
      dropoutRisk,
      attendanceIssues,
      assignmentDelays,
      engagementLow,
      personalIssues,
      lastSeenDays: daysSinceLastLogin
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
      placed: learnersData.filter(l => l.placement?.status === 'active').length,
      unplaced: learnersData.filter(l => !l.placement?.status || l.placement.status === 'unplaced').length,
      highRisk: learnersData.filter(l => l.riskFactors?.dropoutRisk === 'high').length,
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
                            (placementFilter === 'placed' && learner.placement?.status === 'active') ||
                            (placementFilter === 'unplaced' && (!learner.placement?.status || learner.placement.status === 'unplaced'))

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
        return <Badge variant="outline">Inactive</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learner Management</h1>
            <p className="text-gray-600 mt-1">Manage and monitor all learners in the system</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button>
              <Users className="w-4 h-4 mr-2" />
              Add Learner
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Learners</p>
                  <p className="text-2xl font-bold text-gray-900">{learners.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Learners</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {learners.filter(l => l.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Placements</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {learners.filter(l => l.placementStatus === 'placed').length}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {learners.filter(l => {
                      const createdDate = new Date(l.createdAt)
                      const oneMonthAgo = new Date()
                      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
                      return createdDate > oneMonthAgo
                    }).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search learners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All programs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {Array.from(new Set(learners.map(l => l.program))).map(program => (
                      <SelectItem key={program} value={program}>
                        {formatProgramName(program)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learners Table */}
        <Card>
          <CardHeader>
            <CardTitle>Learners ({filteredLearners.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading learners...</p>
              </div>
            ) : filteredLearners.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No learners found</h3>
                <p className="text-gray-600">No learners match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Learner</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Program</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Placement</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Joined</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLearners.map((learner) => (
                      <tr key={learner.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {getInitials(learner.firstName, learner.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">
                                {learner.firstName} {learner.lastName}
                              </p>
                              <p className="text-sm text-gray-600">{learner.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {formatProgramName(learner.program)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(learner.status)}
                        </td>
                        <td className="py-4 px-4">
                          {getPlacementStatusBadge(learner.placementStatus)}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {formatDate(learner.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
