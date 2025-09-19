'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  CheckCircle, 
  Clock, 
  User, 
  Mail, 
  Phone,
  MapPin,
  X,
  Calendar,
  MessageSquare,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  Bug,
  Wrench,
  Building,
  DollarSign,
  Timer,
  HelpCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { getIssuesAction, updateIssueStatusAction, IssueReport } from './actions'
import { toast } from '@/lib/toast'

export default function IssuesPage() {
  const [issues, setIssues] = useState<IssueReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null)

  const loadIssues = async () => {
    try {
      setIsLoading(true)
      const data = await getIssuesAction()
      setIssues(data)
    } catch (error) {
      console.error('Error loading issues:', error)
      toast.error('Failed to load issues')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadIssues()
  }, [])

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return '🔧'
      case 'placement': return '🏢'
      case 'stipend': return '💰'
      case 'attendance': return '⏰'
      case 'general': return '❓'
      default: return '📋'
    }
  }

  const handleStatusUpdate = async (issueId: string, newStatus: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    try {
      const result = await updateIssueStatusAction(issueId, newStatus)
      if (result.success) {
        setIssues(prev => prev.map(issue => 
          issue.id === issueId 
            ? { ...issue, status: newStatus, updatedAt: new Date() }
            : issue
        ))
        toast.success('Issue status updated successfully')
      } else {
        toast.error(result.error || 'Failed to update issue status')
      }
    } catch (error) {
      console.error('Error updating issue status:', error)
      toast.error('Failed to update issue status')
    }
  }

  const openIssueDetails = (issue: IssueReport) => {
    setSelectedIssue(issue)
  }

  const closeIssueDetails = () => {
    setSelectedIssue(null)
  }

  if (isLoading) {
    return (
      <AdminLayout userRole="admin">
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-[#FF6E40] absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold" style={{ color: '#1E3D59' }}>Loading Issue Reports</h3>
            <p className="text-sm text-gray-600">Please wait while we fetch the latest data...</p>
          </div>
        </div>
      </AdminLayout>
    )
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
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#1E3D59' }}>
                      Issue Reports
                    </h1>
                    <p className="text-gray-600 text-lg">Manage and resolve user-reported issues</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={loadIssues}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: '#FF6E40' }}
              >
                <RefreshCw className="h-5 w-5" />
                <span className="font-semibold">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Open Issues</p>
                  <p className="text-3xl font-bold text-red-600">
                    {issues.filter(i => i.status === 'open').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-red-600">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Requires immediate attention</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold" style={{ color: '#FFC13B' }}>
                    {issues.filter(i => i.status === 'in_progress').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#FFC13B' }}>
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Activity className="h-4 w-4 mr-1" />
                <span>Currently being worked on</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">
                    {issues.filter(i => i.status === 'resolved').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-600">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Zap className="h-4 w-4 mr-1" />
                <span>Successfully resolved</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-3xl font-bold" style={{ color: '#1E3D59' }}>
                    {issues.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#1E3D59' }}>
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Activity className="h-4 w-4 mr-1" />
                <span>All time reports</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-50"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#1E3D59' }}>
                <Filter className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: '#1E3D59' }}>Filter & Search</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Search Issues</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#FF6E40] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Filter by Status</label>
                <Select value={statusFilter} onValueChange={(value: 'all' | 'open' | 'in_progress' | 'resolved' | 'closed') => setStatusFilter(value)}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                    <SelectItem value="all" className="rounded-lg">All Status</SelectItem>
                    <SelectItem value="open" className="rounded-lg">Open</SelectItem>
                    <SelectItem value="in_progress" className="rounded-lg">In Progress</SelectItem>
                    <SelectItem value="resolved" className="rounded-lg">Resolved</SelectItem>
                    <SelectItem value="closed" className="rounded-lg">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Filter by Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                    <SelectItem value="all" className="rounded-lg">All Categories</SelectItem>
                    <SelectItem value="technical" className="rounded-lg">Technical</SelectItem>
                    <SelectItem value="placement" className="rounded-lg">Placement</SelectItem>
                    <SelectItem value="stipend" className="rounded-lg">Stipend</SelectItem>
                    <SelectItem value="attendance" className="rounded-lg">Attendance</SelectItem>
                    <SelectItem value="general" className="rounded-lg">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Filter by Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                    <SelectItem value="all" className="rounded-lg">All Priorities</SelectItem>
                    <SelectItem value="urgent" className="rounded-lg">Urgent</SelectItem>
                    <SelectItem value="high" className="rounded-lg">High</SelectItem>
                    <SelectItem value="medium" className="rounded-lg">Medium</SelectItem>
                    <SelectItem value="low" className="rounded-lg">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#1E3D59' }}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold" style={{ color: '#1E3D59' }}>
                  Issue Reports
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {filteredIssues.length > 0 ? (
              <div className="space-y-6">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:border-[#FF6E40]/30 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF6E40] to-[#FF8C69] shadow-lg">
                            <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold" style={{ color: '#1E3D59' }}>
                              {issue.title}
                            </h3>
                            <p className="text-sm font-medium text-gray-600">by {issue.userName} ({issue.userRole})</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            className={`px-4 py-2 rounded-xl font-semibold text-sm ${getStatusColor(issue.status)}`}
                          >
                            {issue.status.replace('_', ' ')}
                          </Badge>
                          <Badge 
                            className={`px-4 py-2 rounded-xl font-semibold text-sm ${getPriorityColor(issue.priority)}`}
                          >
                            {issue.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{issue.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>Submitted: {issue.submittedAt.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <User className="h-4 w-4" />
                          <span>{issue.userEmail}</span>
                        </div>
                        {issue.location && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>{issue.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Select
                            value={issue.status}
                            onValueChange={(value: 'open' | 'in_progress' | 'resolved' | 'closed') => handleStatusUpdate(issue.id!, value)}
                          >
                            <SelectTrigger className="w-40 h-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                              <SelectItem value="open" className="rounded-lg">Open</SelectItem>
                              <SelectItem value="in_progress" className="rounded-lg">In Progress</SelectItem>
                              <SelectItem value="resolved" className="rounded-lg">Resolved</SelectItem>
                              <SelectItem value="closed" className="rounded-lg">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => openIssueDetails(issue)}
                          className="flex items-center space-x-2 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          style={{ backgroundColor: '#FF6E40' }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="font-semibold">View Details</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-6 rounded-full bg-gray-100/80 backdrop-blur-sm w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Shield className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No issues found</h3>
                <p className="text-gray-500">All issues are resolved or no issues match your filters</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issue Details Modal */}
        {selectedIssue && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative bg-white/95 backdrop-blur-md rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50">
              <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: '#1E3D59' }}>
                      {selectedIssue.title}
                    </h2>
                  </div>
                  <Button 
                    onClick={closeIssueDetails} 
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    variant="outline"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6">

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#1E3D59]/5 to-[#FF6E40]/5 border border-gray-200/50">
                      <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Reporter</span>
                      </h4>
                      <p className="text-xl font-semibold" style={{ color: '#1E3D59' }}>{selectedIssue.userName} ({selectedIssue.userRole})</p>
                      <p className="text-sm text-gray-600">{selectedIssue.userEmail}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#FF6E40]/5 to-[#FFC13B]/5 border border-gray-200/50">
                      <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted</span>
                      </h4>
                      <p className="text-lg font-semibold" style={{ color: '#1E3D59' }}>{selectedIssue.submittedAt.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#FFC13B]/5 to-[#FF6E40]/5 border border-gray-200/50">
                      <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center space-x-2">
                        <Bug className="h-4 w-4" />
                        <span>Category</span>
                      </h4>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-white/80">
                          <span className="text-xl">{getCategoryIcon(selectedIssue.category)}</span>
                        </div>
                        <span className="text-lg font-semibold capitalize">{selectedIssue.category}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#1E3D59]/5 to-[#2D5A87]/5 border border-gray-200/50">
                      <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Priority</span>
                      </h4>
                      <Badge className={`px-4 py-2 rounded-xl font-semibold text-sm ${getPriorityColor(selectedIssue.priority)}`}>
                        {selectedIssue.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50/80 backdrop-blur-sm border border-gray-200/50">
                    <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Description</span>
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedIssue.description}</p>
                  </div>

                  {selectedIssue.location && (
                    <div className="p-4 rounded-xl bg-blue-50/80 backdrop-blur-sm border border-blue-200/50">
                      <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Location</span>
                      </h4>
                      <p className="text-gray-700 font-semibold">{selectedIssue.location}</p>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-green-50/80 backdrop-blur-sm border border-green-200/50">
                    <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center space-x-2">
                      {selectedIssue.contactMethod === 'email' ? (
                        <Mail className="h-4 w-4" />
                      ) : (
                        <Phone className="h-4 w-4" />
                      )}
                      <span>Contact Information</span>
                    </h4>
                    <p className="text-gray-700 font-semibold">{selectedIssue.contactInfo}</p>
                  </div>

                  {selectedIssue.placementInfo && (
                    <div className="p-4 rounded-xl bg-purple-50/80 backdrop-blur-sm border border-purple-200/50">
                      <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>Placement</span>
                      </h4>
                      <p className="text-gray-700 font-semibold">
                        {selectedIssue.placementInfo.companyName} - {selectedIssue.placementInfo.position}
                      </p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[#1E3D59]/5 to-[#FF6E40]/5 border border-gray-200/50">
                        <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center space-x-2">
                          <Activity className="h-4 w-4" />
                          <span>Current Status</span>
                        </h4>
                        <Badge className={`px-4 py-2 rounded-xl font-semibold text-sm ${getStatusColor(selectedIssue.status)}`}>
                          {selectedIssue.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-3">
                        <label className="text-sm font-semibold text-gray-700">Update Status:</label>
                        <Select
                          value={selectedIssue.status}
                          onValueChange={(value: 'open' | 'in_progress' | 'resolved' | 'closed') => handleStatusUpdate(selectedIssue.id!, value)}
                        >
                          <SelectTrigger className="w-48 h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                            <SelectItem value="open" className="rounded-lg">Open</SelectItem>
                            <SelectItem value="in_progress" className="rounded-lg">In Progress</SelectItem>
                            <SelectItem value="resolved" className="rounded-lg">Resolved</SelectItem>
                            <SelectItem value="closed" className="rounded-lg">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

