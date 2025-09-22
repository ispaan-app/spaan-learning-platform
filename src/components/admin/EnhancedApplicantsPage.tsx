'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { ProgramService } from '@/lib/program-service'
import { getApplicants, updateApplicantStatus, Applicant } from '@/lib/applicants-service'
import { 
  Users, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Eye,
  Edit,
  CheckCircle,
  X,
  Clock,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Download,
  Upload,
  Send,
  MessageCircle,
  Star,
  Heart,
  Crown,
  Shield,
  Brain,
  Award,
  Target,
  Activity,
  TrendingUp,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Settings,
  Bell,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  XCircle,
  Info,
  HelpCircle,
  Zap,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'


interface ApplicationStats {
  total: number
  pending: number
  underReview: number
  approved: number
  rejected: number
  waitlisted: number
}

export function EnhancedApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    waitlisted: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status' | 'priority'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [programNames, setProgramNames] = useState<{ [key: string]: string }>({})
  
  const formatProgramName = (programId: string) => {
    return programNames[programId] || programId || 'Unknown Program'
  }

  useEffect(() => {
    const loadApplicants = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const data = await getApplicants()
        setApplicants(data)
        
        // Calculate stats
        const newStats: ApplicationStats = {
          total: data.length,
          pending: data.filter(a => a.status === 'pending').length,
          underReview: data.filter(a => a.status === 'under-review').length,
          approved: data.filter(a => a.status === 'approved').length,
          rejected: data.filter(a => a.status === 'rejected').length,
          waitlisted: data.filter(a => a.status === 'waitlisted').length
        }
        setStats(newStats)
      } catch (err) {
        console.error('Error loading applicants:', err)
        setError('Failed to load applicants')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadApplicants()
  }, [])

  // Load program names for applicants
  useEffect(() => {
    if (applicants.length > 0) {
      const uniqueProgramIds = Array.from(new Set(applicants.map(a => a.program).filter(Boolean)))
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
  }, [applicants])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'under-review':
        return 'text-blue-600 bg-blue-100'
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      case 'waitlisted':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock
      case 'under-review':
        return Eye
      case 'approved':
        return CheckCircle
      case 'rejected':
        return X
      case 'waitlisted':
        return AlertTriangle
      default:
        return Clock
    }
  }

  const filteredApplicants = applicants
    .filter(applicant => 
      `${applicant.firstName} ${applicant.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.program.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(applicant => statusFilter === 'all' || applicant.status === statusFilter)
    .filter(applicant => priorityFilter === 'all' || applicant.priority === priorityFilter)
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`
          bValue = `${b.firstName} ${b.lastName}`
          break
        case 'date':
          aValue = a.applicationDate
          bValue = b.applicationDate
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'priority':
          aValue = a.priority
          bValue = b.priority
          break
        default:
          aValue = a.applicationDate
          bValue = b.applicationDate
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleApplicantSelect = (applicantId: string) => {
    setSelectedApplicants(prev => 
      prev.includes(applicantId) 
        ? prev.filter(id => id !== applicantId)
        : [...prev, applicantId]
    )
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on applicants:`, selectedApplicants)
    setSelectedApplicants([])
    setShowBulkActions(false)
  }

  const handleStatusChange = (applicantId: string, newStatus: string) => {
    setApplicants(prev => prev.map(applicant => 
      applicant.id === applicantId 
        ? { ...applicant, status: newStatus as any, reviewDate: new Date() }
        : applicant
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Applicant Management</h1>
              <p className="text-xl text-gray-600">Review and manage student applications</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="relative"
              >
                <Settings className="w-4 h-4 mr-2" />
                Bulk Actions
                {selectedApplicants.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                    {selectedApplicants.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-orange-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-pink-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Waitlisted</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.waitlisted}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search applicants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under-review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="waitlisted">Waitlisted</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="status">Sort by Status</option>
                  <option value="priority">Sort by Priority</option>
                </select>
                
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {showBulkActions && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedApplicants.length} applicant{selectedApplicants.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('approve')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('reject')}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('email')}
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Send Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApplicants([])}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applicants Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApplicants.map((applicant) => {
            const StatusIcon = getStatusIcon(applicant.status)
            return (
              <Card key={applicant.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedApplicants.includes(applicant.id)}
                        onChange={() => handleApplicantSelect(applicant.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {applicant.firstName[0]}{applicant.lastName[0]}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {applicant.firstName} {applicant.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{applicant.email}</p>
                      <p className="text-sm text-gray-500">{formatProgramName(applicant.program)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(applicant.status)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {applicant.status}
                      </Badge>
                      <Badge className={getPriorityColor(applicant.priority)}>
                        {applicant.priority}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{applicant.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{applicant.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{applicant.applicationDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>{applicant.documents} documents</span>
                      </div>
                    </div>
                    
                    {applicant.reviewer && (
                      <div className="text-sm text-gray-500">
                        Reviewed by: {applicant.reviewer}
                      </div>
                    )}
                    
                    {applicant.notes && (
                      <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
                        {applicant.notes}
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(applicant.id, 'approved')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(applicant.id, 'rejected')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
