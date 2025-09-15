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
  MessageSquare
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
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Issue Reports</h1>
            <p className="text-gray-600">Manage and resolve user-reported issues</p>
          </div>
          <Button
            onClick={loadIssues}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Open Issues</p>
                  <p className="text-2xl font-bold text-red-600">
                    {issues.filter(i => i.status === 'open').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {issues.filter(i => i.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {issues.filter(i => i.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-blue-600">{issues.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select value={statusFilter} onValueChange={(value: 'all' | 'open' | 'in_progress' | 'resolved' | 'closed') => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="placement">Placement</SelectItem>
                    <SelectItem value="stipend">Stipend</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Issues ({filteredIssues.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredIssues.length > 0 ? (
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getCategoryIcon(issue.category)}</span>
                            <div>
                              <h3 className="font-semibold text-lg">{issue.title}</h3>
                              <p className="text-sm text-gray-600">by {issue.userName} ({issue.userRole})</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                          <Badge className={getPriorityColor(issue.priority)}>
                            {issue.priority}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-700 line-clamp-2">{issue.description}</p>

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{issue.submittedAt.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{issue.userEmail}</span>
                          </div>
                          {issue.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{issue.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Select
                          value={issue.status}
                          onValueChange={(value: 'open' | 'in_progress' | 'resolved' | 'closed') => handleStatusUpdate(issue.id!, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => openIssueDetails(issue)}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No issues found</p>
                <p className="text-sm">All issues are resolved or no issues match your filters</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issue Details Modal */}
        {selectedIssue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{selectedIssue.title}</h2>
                  <Button onClick={closeIssueDetails} variant="outline" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Reporter</h4>
                      <p className="text-lg">{selectedIssue.userName} ({selectedIssue.userRole})</p>
                      <p className="text-sm text-gray-500">{selectedIssue.userEmail}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Submitted</h4>
                      <p className="text-lg">{selectedIssue.submittedAt.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Category</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCategoryIcon(selectedIssue.category)}</span>
                        <span className="capitalize">{selectedIssue.category}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Priority</h4>
                      <Badge className={getPriorityColor(selectedIssue.priority)}>
                        {selectedIssue.priority}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedIssue.description}</p>
                  </div>

                  {selectedIssue.location && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Location</h4>
                      <p className="text-gray-700">{selectedIssue.location}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Contact Information</h4>
                    <div className="flex items-center space-x-2">
                      {selectedIssue.contactMethod === 'email' ? (
                        <Mail className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Phone className="h-4 w-4 text-gray-500" />
                      )}
                      <span>{selectedIssue.contactInfo}</span>
                    </div>
                  </div>

                  {selectedIssue.placementInfo && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Placement</h4>
                      <p className="text-gray-700">
                        {selectedIssue.placementInfo.companyName} - {selectedIssue.placementInfo.position}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-600">Status</h4>
                        <Badge className={getStatusColor(selectedIssue.status)}>
                          {selectedIssue.status}
                        </Badge>
                      </div>
                      <Select
                        value={selectedIssue.status}
                        onValueChange={(value: 'open' | 'in_progress' | 'resolved' | 'closed') => handleStatusUpdate(selectedIssue.id!, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
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

